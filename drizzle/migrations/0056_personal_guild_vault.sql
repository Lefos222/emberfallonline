-- The guild vault is a personal stash inside the guild, not a shared shelf: every player sees only
-- the items they put in and can take back only those. Slots are per player as well, so one member's
-- stash can never fill another member's pages, and the same three pages of 256 slots are room for
-- everyone at once.

ALTER TABLE public.guild_vault ADD COLUMN IF NOT EXISTS owner uuid;
-- Existing deposits belong to the account that stored them.
UPDATE public.guild_vault v SET owner = h.user_id
  FROM public.heroes h
 WHERE h.id = v.deposited_by AND v.owner IS NULL;

CREATE INDEX IF NOT EXISTS guild_vault_owner_idx ON public.guild_vault (guild_id, owner);

-- The old key was one slot for the whole guild; the stash needs one slot per player.
ALTER TABLE public.guild_vault DROP CONSTRAINT IF EXISTS guild_vault_guild_id_page_slot_key;
CREATE UNIQUE INDEX IF NOT EXISTS guild_vault_owner_slot
  ON public.guild_vault (guild_id, owner, page, slot);

DROP POLICY IF EXISTS "Members read their guild vault" ON public.guild_vault;
CREATE POLICY "Players read their own stash" ON public.guild_vault FOR SELECT TO authenticated
  USING (owner = auth.uid() AND guild_id IN (SELECT public.my_guild_ids()));

-- ---------- Deposit one piece of gear ----------
CREATE OR REPLACE FUNCTION public.guild_vault_deposit(_hero uuid, _item_id text, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; bagged jsonb; p int; sl int; me uuid;
BEGIN
  h := public._my_hero(_hero);
  me := auth.uid();
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  IF m.guild_id IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
  SELECT e INTO bagged FROM jsonb_array_elements(coalesce(h.save->'inventory','[]'::jsonb)) e WHERE e->>'id' = _item_id;
  IF bagged IS NULL THEN RAISE EXCEPTION 'That item is not in your bag'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('guild_vault:' || m.guild_id::text || ':' || me::text));
  SELECT pg.pn, sg.sn INTO p, sl FROM generate_series(1,3) pg(pn), generate_series(0,255) sg(sn)
    WHERE NOT EXISTS (SELECT 1 FROM public.guild_vault v
                       WHERE v.guild_id = m.guild_id AND v.owner = me AND v.page = pg.pn AND v.slot = sg.sn)
    ORDER BY pg.pn, sg.sn LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'The guild vault is full'; END IF;
  s := jsonb_set(h.save, '{inventory}', coalesce((SELECT jsonb_agg(e) FROM jsonb_array_elements(h.save->'inventory') e WHERE e->>'id' <> _item_id), '[]'::jsonb), true);
  INSERT INTO public.guild_vault (guild_id, page, slot, item, deposited_by, depositor_name, owner)
    VALUES (m.guild_id, p, sl, bagged, _hero, h.name, me);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-deposit:' || _item_id, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

-- ---------- Deposit a stack of materials, gems or chests ----------
CREATE OR REPLACE FUNCTION public.guild_vault_deposit_stack(_hero uuid, _kind text, _key text, _qty int, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; field text; have int; p int; sl int; me uuid;
BEGIN
  h := public._my_hero(_hero);
  me := auth.uid();
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  IF m.guild_id IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
  field := CASE _kind WHEN 'mat' THEN 'mats' WHEN 'gem' THEN 'gems' WHEN 'chest' THEN 'chests' ELSE NULL END;
  IF field IS NULL OR _key IS NULL OR _key !~ '^[A-Za-z0-9:_-]{1,40}$' THEN RAISE EXCEPTION 'Unknown item'; END IF;
  have := floor(coalesce((h.save->field->>_key)::numeric, 0))::int;
  IF _qty IS NULL OR _qty < 1 OR _qty > have THEN RAISE EXCEPTION 'You do not have that many'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('guild_vault:' || m.guild_id::text || ':' || me::text));
  SELECT pg.pn, sg.sn INTO p, sl FROM generate_series(1,3) pg(pn), generate_series(0,255) sg(sn)
    WHERE NOT EXISTS (SELECT 1 FROM public.guild_vault v
                       WHERE v.guild_id = m.guild_id AND v.owner = me AND v.page = pg.pn AND v.slot = sg.sn)
    ORDER BY pg.pn, sg.sn LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'The guild vault is full'; END IF;
  s := jsonb_set(h.save, ARRAY[field], coalesce(h.save->field, '{}'::jsonb) || jsonb_build_object(_key, have - _qty), true);
  INSERT INTO public.guild_vault (guild_id, page, slot, item, deposited_by, depositor_name, owner)
    VALUES (m.guild_id, p, sl, jsonb_build_object('id', gen_random_uuid()::text, 'stack', _kind, 'key', _key, 'qty', _qty), _hero, h.name, me);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-stack:' || _kind || ':' || _key, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

-- ---------- Take an item back into the bag ----------
CREATE OR REPLACE FUNCTION public.guild_vault_withdraw(_hero uuid, _entry uuid, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; v public.guild_vault; s jsonb; field text; k text; have numeric;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  SELECT * INTO v FROM public.guild_vault WHERE id = _entry FOR UPDATE;
  -- Only the player who stored it may take it back.
  IF v.id IS NULL OR m.guild_id IS NULL OR v.guild_id <> m.guild_id OR v.owner IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'That item is not in your guild vault';
  END IF;
  IF v.item ? 'stack' THEN
    field := CASE v.item->>'stack' WHEN 'mat' THEN 'mats' WHEN 'gem' THEN 'gems' WHEN 'chest' THEN 'chests' END;
    k := v.item->>'key';
    have := coalesce((h.save->field->>k)::numeric, 0);
    -- A new stack type needs a free slot; topping up an existing stack only needs one when it spills over.
    IF (have <= 0 OR (field = 'mats' AND ceil((have + (v.item->>'qty')::numeric) / 9999) > ceil(have / 9999))) AND public._bag_room(h.save) < 1 THEN
      RAISE EXCEPTION 'Your bag is full';
    END IF;
    s := jsonb_set(h.save, ARRAY[field], coalesce(h.save->field, '{}'::jsonb) || jsonb_build_object(k, have + (v.item->>'qty')::numeric), true);
  ELSE
    IF public._bag_room(h.save) < 1 THEN RAISE EXCEPTION 'Your bag is full'; END IF;
    s := jsonb_set(h.save, '{inventory}', jsonb_build_array(v.item) || coalesce(h.save->'inventory','[]'::jsonb), true);
  END IF;
  DELETE FROM public.guild_vault WHERE id = v.id;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-withdraw:' || v.id, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.guild_vault_deposit(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_deposit(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.guild_vault_deposit_stack(uuid,text,text,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_deposit_stack(uuid,text,text,int,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.guild_vault_withdraw(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_withdraw(uuid,uuid,uuid) TO authenticated;

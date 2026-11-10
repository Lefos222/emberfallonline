CREATE OR REPLACE FUNCTION public._bag_room(_save jsonb) RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 40 + 8 * coalesce((_save->>'bagRows')::int, 0)
    - coalesce((SELECT sum(ceil(value::numeric / 9999))::int FROM jsonb_each_text(coalesce(_save->'mats','{}'::jsonb)) WHERE value ~ '^[0-9.]+$' AND value::numeric > 0), 0)
    - coalesce((SELECT count(*)::int FROM jsonb_each_text(coalesce(_save->'gems','{}'::jsonb)) WHERE value ~ '^[0-9.]+$' AND value::numeric > 0), 0)
    - coalesce((SELECT count(*)::int FROM jsonb_each_text(coalesce(_save->'chests','{}'::jsonb)) WHERE value ~ '^[0-9.]+$' AND value::numeric > 0), 0)
    - jsonb_array_length(coalesce(_save->'inventory','[]'::jsonb))
$$;

CREATE OR REPLACE FUNCTION public.guild_vault_deposit_stack(_hero uuid, _kind text, _key text, _qty int, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; field text; have int; p int; sl int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  IF m.guild_id IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
  field := CASE _kind WHEN 'mat' THEN 'mats' WHEN 'gem' THEN 'gems' WHEN 'chest' THEN 'chests' ELSE NULL END;
  IF field IS NULL OR _key IS NULL OR _key !~ '^[A-Za-z0-9:_-]{1,40}$' THEN RAISE EXCEPTION 'Unknown item'; END IF;
  have := floor(coalesce((h.save->field->>_key)::numeric, 0))::int;
  IF _qty IS NULL OR _qty < 1 OR _qty > have THEN RAISE EXCEPTION 'You do not have that many'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('guild_vault:' || m.guild_id::text));
  SELECT pg.pn, sg.sn INTO p, sl FROM generate_series(1,3) pg(pn), generate_series(0,255) sg(sn)
    WHERE NOT EXISTS (SELECT 1 FROM public.guild_vault v WHERE v.guild_id = m.guild_id AND v.page = pg.pn AND v.slot = sg.sn)
    ORDER BY pg.pn, sg.sn LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'The guild vault is full'; END IF;
  s := jsonb_set(h.save, ARRAY[field], coalesce(h.save->field, '{}'::jsonb) || jsonb_build_object(_key, have - _qty), true);
  INSERT INTO public.guild_vault (guild_id, page, slot, item, deposited_by, depositor_name)
    VALUES (m.guild_id, p, sl, jsonb_build_object('id', gen_random_uuid()::text, 'stack', _kind, 'key', _key, 'qty', _qty), _hero, h.name);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-stack:' || _kind || ':' || _key, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.guild_vault_withdraw(_hero uuid, _entry uuid, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; v public.guild_vault; s jsonb; field text; k text; have numeric;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  SELECT * INTO v FROM public.guild_vault WHERE id = _entry FOR UPDATE;
  IF v.id IS NULL OR m.guild_id IS NULL OR v.guild_id <> m.guild_id THEN RAISE EXCEPTION 'That item is not in your guild vault'; END IF;
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

REVOKE ALL ON FUNCTION public._bag_room(jsonb) FROM public, anon;
REVOKE ALL ON FUNCTION public.guild_vault_deposit_stack(uuid,text,text,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_deposit_stack(uuid,text,text,int,uuid) TO authenticated;
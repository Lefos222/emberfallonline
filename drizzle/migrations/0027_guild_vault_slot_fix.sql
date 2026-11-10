CREATE OR REPLACE FUNCTION public.guild_vault_deposit(_hero uuid, _item_id text, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; bagged jsonb; p int; sl int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  IF m.guild_id IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
  SELECT e INTO bagged FROM jsonb_array_elements(coalesce(h.save->'inventory','[]'::jsonb)) e WHERE e->>'id' = _item_id;
  IF bagged IS NULL THEN RAISE EXCEPTION 'That item is not in your bag'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('guild_vault:' || m.guild_id::text));
  SELECT pg.pn, sg.sn INTO p, sl FROM generate_series(1,3) pg(pn), generate_series(0,255) sg(sn)
    WHERE NOT EXISTS (SELECT 1 FROM public.guild_vault v WHERE v.guild_id = m.guild_id AND v.page = pg.pn AND v.slot = sg.sn)
    ORDER BY pg.pn, sg.sn LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'The guild vault is full'; END IF;
  s := jsonb_set(h.save, '{inventory}', coalesce((SELECT jsonb_agg(e) FROM jsonb_array_elements(h.save->'inventory') e WHERE e->>'id' <> _item_id), '[]'::jsonb), true);
  INSERT INTO public.guild_vault (guild_id, page, slot, item, deposited_by, depositor_name) VALUES (m.guild_id, p, sl, bagged, _hero, h.name);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-deposit:' || _item_id, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;
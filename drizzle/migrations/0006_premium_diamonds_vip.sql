CREATE OR REPLACE FUNCTION public.premium_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN
  h := public._my_hero(_hero);
  RETURN h.save->'srv'->'premium';
END $$;

CREATE OR REPLACE FUNCTION public.buy_gold_pack(_hero uuid, _pack text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; amount int; bal int; s jsonb; p jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds, gold INTO price, amount FROM (VALUES
    ('pouch',100,10000),('chest',450,50000),('royal',1500,200000),('imperial',4000,600000)
  ) AS packs(id,diamonds,gold) WHERE packs.id = _pack;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown gold pack'; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  s := jsonb_set(s, '{gold}', to_jsonb(public._num(s->'gold') + amount), true);
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'gold:' || _pack)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'goldpack:' || _pack, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.buy_diamond_item(_hero uuid, _item text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; p jsonb; owned jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds INTO price FROM (VALUES
    ('wings_celestial',1200),('outfit_royal',900),('aura_ember',600),('frame_diamond',800),('title_immortal',500),
    ('scroll_bundle',400),('resource_bundle',300)
  ) AS items(id,diamonds) WHERE items.id = _item;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown shop item'; END IF;
  IF _item NOT IN ('scroll_bundle','resource_bundle') THEN
    owned := coalesce(h.save->'srv'->'cosmetics','[]'::jsonb);
    IF owned ? _item THEN RAISE EXCEPTION 'Already owned'; END IF;
  END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  IF _item = 'scroll_bundle' THEN
    s := jsonb_set(s, '{srv,scrolls}', jsonb_build_object('dmg', public._num(s->'srv'->'scrolls'->'dmg')::int + 5, 'def', public._num(s->'srv'->'scrolls'->'def')::int + 5, 'xp', public._num(s->'srv'->'scrolls'->'xp')::int + 5), true);
  ELSIF _item = 'resource_bundle' THEN
    s := jsonb_set(s, '{srv,gathering,resources}',
      (SELECT coalesce(jsonb_object_agg(key, to_jsonb(public._num(s->'srv'->'gathering'->'resources'->key)::int + 5)), '{}'::jsonb)
       FROM (VALUES ('mining:0:0'),('herbalism:0:0'),('logging:0:0'),('fishing:0:0'),('archaeology:0:0'),('treasure:0:0')) AS r(key)), true);
  ELSE
    s := jsonb_set(s, '{srv,cosmetics}', coalesce(s->'srv'->'cosmetics','[]'::jsonb) || to_jsonb(_item), true);
  END IF;
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'item:' || _item)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'diamond:' || _item, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.activate_vip(_hero uuid, _level int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; p jsonb; base timestamptz;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds INTO price FROM (VALUES (1,300),(2,800),(3,2000),(4,4500),(5,9000)) AS v(lvl,diamonds) WHERE v.lvl = _level;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown VIP level'; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  base := greatest(now(), coalesce(nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz, now()));
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  s := jsonb_set(s, '{srv,premium,vip}', jsonb_build_object('level', _level, 'until', base + interval '30 days'), true);
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'vip:' || _level)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'vip:' || _level, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.claim_vip_daily(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; lvl int; gold int; res int; s jsonb; p jsonb; until timestamptz;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  until := nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz;
  IF until IS NULL OR until <= now() THEN RAISE EXCEPTION 'No active VIP membership'; END IF;
  lvl := public._num(h.save->'srv'->'premium'->'vip'->'level')::int;
  SELECT daily_gold, daily_res INTO gold, res FROM (VALUES (1,1000,1),(2,2500,2),(3,6000,3),(4,12000,4),(5,25000,5)) AS v(l,daily_gold,daily_res) WHERE v.l = lvl;
  IF gold IS NULL THEN RAISE EXCEPTION 'Unknown VIP level'; END IF;
  IF h.save->'srv'->'premium'->>'claimed' = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD') THEN RAISE EXCEPTION 'Already claimed today'; END IF;
  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') + gold), true);
  s := jsonb_set(s, '{srv,premium,claimed}', to_jsonb(to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD')), true);
  s := jsonb_set(s, '{srv,gathering,resources}',
    (SELECT coalesce(jsonb_object_agg(key, to_jsonb(public._num(s->'srv'->'gathering'->'resources'->key)::int + res)), '{}'::jsonb)
     FROM (VALUES ('mining:0:0'),('herbalism:0:0'),('logging:0:0'),('fishing:0:0'),('archaeology:0:0'),('treasure:0:0')) AS r(key)), true);
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'vip-daily', 'amount', gold, 'detail', 'vip-daily:' || lvl)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'vip-daily:' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'), 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.premium_state(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.premium_state(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.buy_gold_pack(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.buy_gold_pack(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.buy_diamond_item(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.buy_diamond_item(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.activate_vip(uuid,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.activate_vip(uuid,int,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_vip_daily(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_vip_daily(uuid,uuid) TO authenticated;
-- Premium / VIP rework.
--
-- The shop's authoritative prices now live in `src/game/economy.ts` and `src/game/vip-perks.ts`,
-- and the payment server (`src/game/payments.functions.ts`) validates every Diamond spend and
-- credits confirmed Stripe sessions through the server-only `_write_save` below. This migration:
--
--   1. lets the server role write a save after a verified payment or spend,
--   2. mirrors the new catalogue prices into the legacy premium RPCs so an older client cannot
--      buy at the previous prices, and
--   3. keeps every VIP membership at exactly 30 days.
--
-- It is idempotent and safe to run more than once.

-- 1. Server-side save writes (service role only; clients were already revoked in 0001/0003).
GRANT EXECUTE ON FUNCTION public._write_save(uuid, jsonb) TO service_role;

-- 2. Gold packs: same gold, the shop-wide 10% price rise.
CREATE OR REPLACE FUNCTION public.buy_gold_pack(_hero uuid, _pack text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; amount int; bal int; s jsonb; p jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds, gold INTO price, amount FROM (VALUES
    ('pouch',55,10000),('coffer',242,50000),('royal',825,200000),('imperial',2200,600000)
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

-- 3. Diamond cosmetics and bundles: the shop-wide 10% rise.
CREATE OR REPLACE FUNCTION public.buy_diamond_item(_hero uuid, _item text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; p jsonb; owned jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds INTO price FROM (VALUES
    ('wings_celestial',1320),('outfit_royal',990),('aura_ember',660),('frame_diamond',880),('title_immortal',550),
    ('scroll_bundle',440),('resource_bundle',330)
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

-- 4. VIP: one month (30 days), the new VIP prices, and the higher tiers kept when they overlap.
CREATE OR REPLACE FUNCTION public.activate_vip(_hero uuid, _level int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; p jsonb; base timestamptz; lvl int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT diamonds INTO price FROM (VALUES (1,129),(2,319),(3,649),(4,5625),(5,11250)) AS v(lvl,diamonds) WHERE v.lvl = _level;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown VIP level'; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  base := greatest(now(), coalesce(nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz, now()));
  lvl := CASE WHEN base > now() THEN greatest(coalesce(nullif(h.save->'srv'->'premium'->'vip'->>'level','')::int, 0), _level) ELSE _level END;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  s := jsonb_set(s, '{srv,premium,vip}', jsonb_build_object('level', lvl, 'until', base + interval '30 days'), true);
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'vip:' || _level)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'vip:' || _level, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.activate_vip(uuid,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.activate_vip(uuid,int,uuid) TO authenticated;

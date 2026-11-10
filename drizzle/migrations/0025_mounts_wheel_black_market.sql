CREATE OR REPLACE FUNCTION public.premium_service(_hero uuid, _kind text, _req uuid, _value text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; nm text; g text; n int; m text;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  price := CASE _kind WHEN 'gender_card' THEN 500 WHEN 'name_card' THEN 700 WHEN 'shop_refresh' THEN 50 WHEN 'arena_duel' THEN 50 WHEN 'black_market_refresh' THEN 50 END;
  IF _kind LIKE 'mount_%' THEN
    m := substr(_kind, 7);
    SELECT d INTO price FROM (VALUES ('stallion',300),('drake',600),('stag',900),('nightmare',1300),('griffin',2000)) AS x(id,d) WHERE x.id = m;
    IF coalesce(h.save->'srv'->'mounts','[]'::jsonb) ? m THEN RAISE EXCEPTION 'Already owned'; END IF;
  END IF;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown service'; END IF;
  IF _kind = 'black_market_refresh' AND NOT (coalesce(nullif(h.save->'srv'->'premium'->'vip'->>'level','')::int,0) > 0 AND coalesce(nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz, now()) > now()) THEN
    RAISE EXCEPTION 'The Black Market is for VIP members only';
  END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  IF _kind = 'name_card' THEN
    nm := btrim(coalesce(_value, ''));
    IF nm !~ '^[A-Za-z0-9 _-]{3,16}$' THEN RAISE EXCEPTION 'Names are 3-16 letters, numbers, spaces, _ or -'; END IF;
    IF EXISTS (SELECT 1 FROM public.heroes WHERE lower(name) = lower(nm) AND id <> _hero) THEN RAISE EXCEPTION 'That name is taken'; END IF;
    s := jsonb_set(s, '{name}', to_jsonb(nm), true);
    UPDATE public.heroes SET name = nm WHERE id = _hero;
  ELSIF _kind = 'gender_card' THEN
    g := CASE WHEN h.gender = 'female' THEN 'male' ELSE 'female' END;
    UPDATE public.heroes SET gender = g WHERE id = _hero;
  ELSIF m IS NOT NULL THEN
    s := jsonb_set(s, '{srv,mounts}', coalesce(s->'srv'->'mounts','[]'::jsonb) || to_jsonb(m), true);
  ELSE
    n := public._num(s->'srv'->'premium'->'services'->_kind)::int + 1;
    s := jsonb_set(s, '{srv,premium,services}', coalesce(s->'srv'->'premium'->'services', '{}'::jsonb) || jsonb_build_object(_kind, n), true);
  END IF;
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(s->'srv'->'premium'->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'service:' || _kind)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'service:' || _kind, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.wheel_spin(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; bal int; s jsonb; r numeric; seg int; lvl int; mats jsonb; add jsonb := '{}'::jsonb; gold int := 0; xp int := 0; k text;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < 100 THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  lvl := greatest(1, h.level);
  r := random();
  -- Segments clockwise from the top: 0 gold, 1 frost crystal, 2 XP, 3 fragments, 4 gold, 5 ore+essence, 6 void crystal, 7 jackpot gold.
  IF r < 0.24 THEN seg := 0; gold := 3000 + lvl * 400;
  ELSIF r < 0.46 THEN seg := 4; gold := 3000 + lvl * 400;
  ELSIF r < 0.66 THEN seg := 2; xp := 200 + lvl * 120;
  ELSIF r < 0.82 THEN seg := 5; add := jsonb_build_object('ore', 40, 'essence', 10);
  ELSIF r < 0.91 THEN seg := 1; add := jsonb_build_object('frostCrystal', 4);
  ELSIF r < 0.96 THEN seg := 6; add := jsonb_build_object('voidCrystal', 2);
  ELSIF r < 0.99 THEN seg := 3; add := jsonb_build_object('fragment', 30);
  ELSE seg := 7; gold := 25000 + lvl * 2500; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - 100), true);
  s := jsonb_set(s, '{gold}', to_jsonb(public._num(s->'gold')::bigint + gold), true);
  s := jsonb_set(s, '{xp}', to_jsonb(public._num(s->'xp')::bigint + xp), true);
  mats := coalesce(s->'mats', '{}'::jsonb);
  FOR k IN SELECT jsonb_object_keys(add) LOOP
    mats := mats || jsonb_build_object(k, public._num(mats->k)::int + (add->>k)::int);
  END LOOP;
  s := jsonb_set(s, '{mats}', mats, true);
  s := jsonb_set(s, '{srv,wheel}', jsonb_build_object('seg', seg, 'gold', gold, 'xp', xp, 'mats', add, 'req', _req, 'at', now()), true);
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(s->'srv'->'premium'->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', 100, 'detail', 'wheel')), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'wheel', 100);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.wheel_spin(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.wheel_spin(uuid,uuid) TO authenticated;
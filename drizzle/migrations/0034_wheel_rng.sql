-- Wheel of Fortune v2: 16 segments, ~5% chance of a good prize, every common amount rolled 50-150%.
-- Segment order and weights must match src/game/wheel.ts.
CREATE OR REPLACE FUNCTION public.wheel_spin(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; bal int; s jsonb; r numeric; seg int; lvl int; mats jsonb; add jsonb := '{}'::jsonb;
  gold int := 0; xp int := 0; dia int := 0; k text; roll numeric;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < 100 THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  lvl := greatest(1, h.level);
  roll := 0.5 + random();          -- 0.5x .. 1.5x on every common prize
  r := random() * 100;
  -- Good prizes (5% total)
  IF r < 0.1 THEN seg := 15; dia := 1000; gold := 50000 + lvl * 5000; add := jsonb_build_object('sunCrystal', 3);
  ELSIF r < 0.6 THEN seg := 13; gold := 25000 + lvl * 2500 + floor(random() * lvl * 2500)::int;
  ELSIF r < 1.4 THEN seg := 8; dia := 100 + floor(random() * 3)::int * 100;
  ELSIF r < 2.2 THEN seg := 11; add := jsonb_build_object('fateStone', 3 + floor(random() * 4)::int);
  ELSIF r < 3.4 THEN seg := 5; add := jsonb_build_object('sunCrystal', 1 + floor(random() * 2)::int);
  ELSIF r < 5.0 THEN seg := 2; add := jsonb_build_object('voidCrystal', 2 + floor(random() * 3)::int);
  -- Common prizes (95%)
  ELSIF r < 21 THEN seg := 0; gold := floor((800 + lvl * 120) * roll)::int;
  ELSIF r < 35 THEN seg := 1; xp := floor((80 + lvl * 40) * roll)::int;
  ELSIF r < 47 THEN seg := 3; add := jsonb_build_object('ore', greatest(1, floor(15 * roll)::int));
  ELSIF r < 57 THEN seg := 4; add := jsonb_build_object('essence', greatest(1, floor(4 * roll)::int));
  ELSIF r < 67 THEN seg := 6; gold := floor((1500 + lvl * 200) * roll)::int;
  ELSIF r < 72 THEN seg := 7; gold := 10 + floor(random() * 90)::int;
  ELSIF r < 81 THEN seg := 9; xp := floor((150 + lvl * 70) * roll)::int;
  ELSIF r < 89 THEN seg := 10; add := jsonb_build_object('ore', greatest(1, floor(10 * roll)::int), 'essence', greatest(1, floor(3 * roll)::int));
  ELSIF r < 95 THEN seg := 12; add := jsonb_build_object('frostCrystal', 1 + floor(random() * 2)::int);
  ELSE seg := 14; add := jsonb_build_object('fragment', greatest(1, floor(6 * roll)::int)); END IF;

  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - 100 + dia), true);
  s := jsonb_set(s, '{gold}', to_jsonb(public._num(s->'gold')::bigint + gold), true);
  s := jsonb_set(s, '{xp}', to_jsonb(public._num(s->'xp')::bigint + xp), true);
  mats := coalesce(s->'mats', '{}'::jsonb);
  FOR k IN SELECT jsonb_object_keys(add) LOOP
    mats := mats || jsonb_build_object(k, public._num(mats->k)::int + (add->>k)::int);
  END LOOP;
  s := jsonb_set(s, '{mats}', mats, true);
  s := jsonb_set(s, '{srv,wheel}', jsonb_build_object('seg', seg, 'gold', gold, 'xp', xp, 'diamonds', dia, 'mats', add, 'req', _req, 'at', now()), true);
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(s->'srv'->'premium'->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', 100, 'detail', 'wheel')), true);
  IF dia > 0 THEN
    s := jsonb_set(s, '{srv,premium,history}', (s->'srv'->'premium'->'history') || jsonb_build_object('at', now(), 'kind', 'grant', 'amount', dia, 'detail', 'wheel prize'), true);
  END IF;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'wheel', 100);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.wheel_spin(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.wheel_spin(uuid,uuid) TO authenticated;

-- Wheel of Fortune v3: back to the classic wheel picture and the classic prize amounts, now on
-- 16 slices. Normal prizes land 95% of spins, the six starred good prizes 5% together.
-- Replaces the 0034 version. Segment numbers and weights must match src/game/wheel.ts
-- (src/test/wheel-luck.test.ts reads this file to check they do).
CREATE OR REPLACE FUNCTION public.wheel_spin(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; bal int; s jsonb; r numeric; seg int; lvl int; mats jsonb; add jsonb := '{}'::jsonb;
  gold int := 0; xp int := 0; dia int := 0; k text;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < 100 THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  lvl := greatest(1, h.level);
  r := random() * 100;
  -- Good prizes (5% together)
  IF r < 0.2 THEN seg := 10; dia := 1000; gold := 50000 + lvl * 5000;                      -- Mega Jackpot 0.2
  ELSIF r < 0.8 THEN seg := 4; gold := 25000 + lvl * 2500;                                 -- Jackpot 0.6
  ELSIF r < 1.6 THEN seg := 7; add := jsonb_build_object('fateStone', 3);                  -- Fate Stones 0.8
  ELSIF r < 2.4 THEN seg := 13; add := jsonb_build_object('sunCrystal', 1);                -- Sun Crystal 0.8
  ELSIF r < 3.6 THEN seg := 15; add := jsonb_build_object('fragment', 30);                 -- Fragment Cache 1.2
  ELSIF r < 5.0 THEN seg := 1; add := jsonb_build_object('voidCrystal', 3);                -- Void Crystals 1.4
  -- Normal prizes (95% together), classic amounts
  ELSIF r < 19 THEN seg := 0; gold := 3000 + lvl * 400;                                    -- Gold 14
  ELSIF r < 32 THEN seg := 8; gold := 3000 + lvl * 400;                                    -- Gold 13
  ELSIF r < 44 THEN seg := 2; xp := 200 + lvl * 120;                                       -- XP 12
  ELSIF r < 55 THEN seg := 11; xp := 200 + lvl * 120;                                      -- XP 11
  ELSIF r < 65 THEN seg := 3; add := jsonb_build_object('ore', 40, 'essence', 10);         -- Ore & Essence 10
  ELSIF r < 74 THEN seg := 9; add := jsonb_build_object('hide', 30, 'bloom', 20);          -- Hide & Bloom 9
  ELSIF r < 81 THEN seg := 12; add := jsonb_build_object('enchantStone', 2);               -- Enchantment Stones 7
  ELSIF r < 88 THEN seg := 14; add := jsonb_build_object('fragment', 10);                  -- Armor Fragments 7
  ELSIF r < 94 THEN seg := 5; add := jsonb_build_object('frostCrystal', 4);                -- Frost Crystals 6
  ELSE seg := 6; add := jsonb_build_object('starshard', 3); END IF;                        -- Starshards 6

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

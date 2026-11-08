-- A tiny nudge to the Astral ladder: exactly the same Lucky Shot flow and payloads, with 1.5
-- points of White moved up into the higher colours. Thresholds mirror ASTRAL_ODDS in
-- src/game/crafting.ts (38.5 / 30 / 17 / 9.5 / 4.4 / 0.6) — keep the two identical.
CREATE OR REPLACE FUNCTION public.lucky_shot(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; prev jsonb; shots int; r float8; rarity int; bases text[]; a jsonb; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  SELECT astral INTO prev FROM public.lucky_shots WHERE request_id = _req AND hero_id = _hero;
  IF prev IS NOT NULL THEN RETURN jsonb_build_object('astral', prev, 'save', h.save, 'repeat', true); END IF;
  IF EXISTS (SELECT 1 FROM public.lucky_shots WHERE request_id = _req) THEN RAISE EXCEPTION 'Invalid request'; END IF;
  shots := public._num(h.save->'srv'->'luckyShots')::int;
  IF shots < 1 THEN RAISE EXCEPTION 'No Lucky Shots left'; END IF;
  r := random() * 100;
  rarity := CASE WHEN r < 0.6 THEN 5 WHEN r < 5 THEN 4 WHEN r < 14.5 THEN 3 WHEN r < 31.5 THEN 2 WHEN r < 62.5 THEN 1 ELSE 0 END;
  bases := ARRAY['ember','arcana','aegis','ward','oak','owl','fang','hawk','wisp','turtle','spear','rune','lotus'];
  a := jsonb_build_object('id', replace(gen_random_uuid()::text, '-', ''), 'base', bases[1 + floor(random() * array_length(bases, 1))::int], 'rarity', rarity, 'lvl', 0);
  s := jsonb_set(h.save, '{srv,luckyShots}', to_jsonb(shots - 1), true);
  s := jsonb_set(s, '{astrals}', coalesce(s->'astrals', '[]'::jsonb) || jsonb_build_array(a), true);
  s := jsonb_set(s, '{srv,shotsUsed}', to_jsonb(public._num(s->'srv'->'shotsUsed') + 1), true);
  INSERT INTO public.lucky_shots (request_id, hero_id, astral) VALUES (_req, _hero, a);
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('astral', a, 'save', s, 'repeat', false);
END $$;

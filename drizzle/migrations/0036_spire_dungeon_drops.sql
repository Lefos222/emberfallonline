-- Each Spire dungeon has its own crafting drop: a cleared floor has a 35% chance to pay it.
CREATE OR REPLACE FUNCTION public.spire_clear_in(_hero uuid, _floor integer, _dungeon text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE res jsonb; s jsonb; mat text; cap integer; qty integer; drop jsonb := '{}'::jsonb;
BEGIN
 SELECT d.mat, d.cap INTO mat, cap FROM (VALUES
  ('cinder','fragment',20), ('ember','crystal',40), ('frost','frostCrystal',60),
  ('catacomb','sigil',80), ('obsidian','voidCrystal',120), ('observatory','starshard',160),
  ('spire','sunCrystal',240)) AS d(id, mat, cap) WHERE d.id = _dungeon;
 IF mat IS NULL THEN RAISE EXCEPTION 'Unknown dungeon'; END IF;
 IF _floor > cap THEN RAISE EXCEPTION 'That dungeon has no such floor'; END IF;
 res := public.spire_clear(_hero, _floor);
 s := res->'save';
 IF random() < 0.35 THEN
  qty := 1 + _floor / 20 + CASE WHEN _floor = cap OR _floor % 10 = 0 THEN 2 ELSE 0 END;
  drop := jsonb_build_object(mat, qty);
  s := public._apply_reward(s, jsonb_build_object('mats', drop));
  PERFORM public._write_save(_hero, s);
 END IF;
 RETURN res || jsonb_build_object('save', s, 'drop', drop);
END $$;
REVOKE ALL ON FUNCTION public.spire_clear_in(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spire_clear_in(uuid, integer, text) TO authenticated, service_role;
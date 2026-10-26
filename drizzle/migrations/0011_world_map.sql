-- World map: every player owns one castle that stands on a shared, persistent map.
--
-- The castle is the only part of the world another player changes, so it is the only
-- part kept in the database. Plots and the daily limit are owned here: the client draws
-- the same 24 plots (src/game/world-map.ts CASTLE_PLOTS) and only ever asks for a move.
CREATE TABLE IF NOT EXISTS public.world_castles (
  hero_id uuid PRIMARY KEY REFERENCES public.heroes(id) ON DELETE CASCADE,
  plot text NOT NULL,
  owner_name text NOT NULL,
  hero_class text NOT NULL,
  gender text NOT NULL,
  level int NOT NULL,
  power int NOT NULL,
  move_day date,
  moves_used int NOT NULL DEFAULT 0,
  placed_at timestamptz NOT NULL DEFAULT now(),
  moved_at timestamptz
);
GRANT SELECT ON public.world_castles TO authenticated;
GRANT ALL ON public.world_castles TO service_role;
ALTER TABLE public.world_castles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "castles visible to players" ON public.world_castles;
CREATE POLICY "castles visible to players" ON public.world_castles FOR SELECT TO authenticated USING (true);

-- The plot list. Keep identical to CASTLE_PLOTS in src/game/world-map.ts.
CREATE OR REPLACE FUNCTION public._world_plots() RETURNS TABLE (id text, zone text) LANGUAGE sql IMMUTABLE AS $$
  SELECT * FROM (VALUES
    ('emberreach-1', 'emberreach'), ('emberreach-2', 'emberreach'), ('emberreach-3', 'emberreach'), ('emberreach-4', 'emberreach'),
    ('thornwood-1', 'thornwood'), ('thornwood-2', 'thornwood'), ('thornwood-3', 'thornwood'), ('thornwood-4', 'thornwood'),
    ('ashenwaste-1', 'ashenwaste'), ('ashenwaste-2', 'ashenwaste'), ('ashenwaste-3', 'ashenwaste'), ('ashenwaste-4', 'ashenwaste'),
    ('mirefen-1', 'mirefen'), ('mirefen-2', 'mirefen'), ('mirefen-3', 'mirefen'), ('mirefen-4', 'mirefen'),
    ('bloodmoon-1', 'bloodmoon'), ('bloodmoon-2', 'bloodmoon'), ('bloodmoon-3', 'bloodmoon'), ('bloodmoon-4', 'bloodmoon'),
    ('frostspine-1', 'frostspine'), ('frostspine-2', 'frostspine'), ('frostspine-3', 'frostspine'), ('frostspine-4', 'frostspine')
  ) AS t(id, zone);
$$;
REVOKE ALL ON FUNCTION public._world_plots() FROM public, anon;
GRANT EXECUTE ON FUNCTION public._world_plots() TO authenticated;

-- Move (or, the first time, place) the caller's castle. The player level and power are
-- copied onto the row so another player can read who holds a plot without reading saves.
CREATE OR REPLACE FUNCTION public.world_castle_move(_hero uuid, _plot text, _req uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; c public.world_castles; today date; used int; placed boolean;
BEGIN
  h := public._my_hero(_hero);
  today := (now() AT TIME ZONE 'utc')::date;
  SELECT * INTO c FROM public.world_castles WHERE hero_id = _hero;

  -- A retried request (dropped response) reports the state it already produced.
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN
    RETURN jsonb_build_object('plot', c.plot, 'moves_used', c.moves_used,
      'remaining', CASE WHEN c.move_day = today THEN GREATEST(0, 3 - c.moves_used) ELSE 3 END,
      'day', today);
  END IF;

  IF _plot IS NULL OR NOT EXISTS (SELECT 1 FROM public._world_plots() p WHERE p.id = _plot) THEN
    RAISE EXCEPTION 'That is not a castle plot on the world map';
  END IF;

  placed := c.hero_id IS NULL;
  used := CASE WHEN placed OR c.move_day IS DISTINCT FROM today THEN 0 ELSE c.moves_used END;
  IF NOT placed AND used >= 3 THEN
    RAISE EXCEPTION 'Your castle can move 3 times a day — the next move unlocks at 00:00 UTC';
  END IF;

  INSERT INTO public.world_castles (hero_id, plot, owner_name, hero_class, gender, level, power, move_day, moves_used, moved_at)
  VALUES (_hero, _plot, h.name, h.hero_class::text, h.gender::text, h.level, h.power, today,
    CASE WHEN placed THEN 0 ELSE used + 1 END, CASE WHEN placed THEN NULL ELSE now() END)
  ON CONFLICT (hero_id) DO UPDATE SET
    plot = EXCLUDED.plot, owner_name = EXCLUDED.owner_name, hero_class = EXCLUDED.hero_class,
    gender = EXCLUDED.gender, level = EXCLUDED.level, power = EXCLUDED.power,
    move_day = EXCLUDED.move_day, moves_used = EXCLUDED.moves_used, moved_at = EXCLUDED.moved_at;

  IF NOT EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN
    INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'castle-move:' || _plot, 0);
  END IF;

  used := CASE WHEN placed THEN 0 ELSE used + 1 END;
  RETURN jsonb_build_object('plot', _plot, 'moves_used', used, 'remaining', 3 - used, 'day', today);
END $$;
REVOKE ALL ON FUNCTION public.world_castle_move(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.world_castle_move(uuid,text,uuid) TO authenticated;

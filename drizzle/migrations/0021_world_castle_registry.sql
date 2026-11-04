-- The world map's castle registry: the realm is bounded and every hero may plant
-- one banner on it, so the map has to hold thousands of castles. One row per hero.
-- Applies to the live project's database: run this file there (the app's own
-- migrations are the record of what the database should contain).

CREATE TABLE IF NOT EXISTS public.world_castles (
  hero_id uuid PRIMARY KEY REFERENCES public.heroes(id) ON DELETE CASCADE,
  x double precision NOT NULL,
  y double precision NOT NULL,
  name text NOT NULL DEFAULT 'Your castle',
  placed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_castles_xy_idx ON public.world_castles (x, y);

-- Reads and writes go through the RPCs below, like the rest of the social tables.
ALTER TABLE public.world_castles ENABLE ROW LEVEL SECURITY;

-- The realm is 4096 x 2286 world units (src/game/worldmap.ts); nothing exists past its edge.
CREATE OR REPLACE FUNCTION public.world_castle_place(_hero uuid, _x double precision, _y double precision, _name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; total integer; kept public.world_castles;
BEGIN
  me := public._my_hero(_hero);
  IF _x IS NULL OR _y IS NULL OR _x < 0 OR _x > 4096 OR _y < 0 OR _y > 2286 THEN
    RAISE EXCEPTION 'That ground lies beyond the realm';
  END IF;
  INSERT INTO public.world_castles AS c (hero_id, x, y, name, placed_at)
    VALUES (me.id, _x, _y, coalesce(nullif(btrim(left(coalesce(_name, ''), 40)), ''), 'Your castle'), now())
    ON CONFLICT (hero_id) DO UPDATE SET x = excluded.x, y = excluded.y, name = excluded.name, placed_at = now()
    RETURNING * INTO kept;
  SELECT count(*) INTO total FROM public.world_castles;
  RETURN jsonb_build_object(
    'count', total,
    'castle', jsonb_build_object('hero', kept.hero_id, 'x', kept.x, 'y', kept.y, 'name', kept.name, 'level', me.level)
  );
END $$;

-- Every banner in the realm. Position, name and level only: nothing private.
CREATE OR REPLACE FUNCTION public.world_castle_map()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE out jsonb;
BEGIN
  SELECT jsonb_build_object(
    'count', count(*),
    'castles', coalesce(jsonb_agg(jsonb_build_object(
      'hero', c.hero_id, 'x', c.x, 'y', c.y, 'name', c.name, 'level', h.level
    ) ORDER BY c.placed_at DESC), '[]'::jsonb)
  ) INTO out
  FROM public.world_castles c JOIN public.heroes h ON h.id = c.hero_id;
  RETURN out;
END $$;

REVOKE ALL ON FUNCTION public.world_castle_place(uuid, double precision, double precision, text), public.world_castle_map() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.world_castle_place(uuid, double precision, double precision, text), public.world_castle_map() TO authenticated, service_role;

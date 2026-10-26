-- The World Tree opens the world map. Every character owns one castle on it,
-- every lord sees the real castles of the other players, and a castle may be
-- moved three times per day. The count follows the game's Greek clock
-- (Europe/Athens), the same boundary as the daily quests in migration 0010.
-- WORLD_MOVES_PER_DAY / WORLD_UNITS / WORLD_GAP / WORLD_MARGIN live in
-- src/game/worldcastles.ts - keep both identical.

CREATE TABLE IF NOT EXISTS public.world_castles (
  hero_id uuid PRIMARY KEY REFERENCES public.heroes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  hero_class text NOT NULL CHECK (hero_class IN ('warrior','mage','archer')),
  gender text NOT NULL DEFAULT 'male' CHECK (gender IN ('male','female')),
  level integer NOT NULL DEFAULT 1,
  power integer NOT NULL DEFAULT 0,
  x integer NOT NULL CHECK (x BETWEEN 0 AND 1000),
  y integer NOT NULL CHECK (y BETWEEN 0 AND 1000),
  move_day date,
  moves_used integer NOT NULL DEFAULT 0,
  moved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_castles_pos_idx ON public.world_castles (x, y);
REVOKE ALL ON public.world_castles FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.world_castles TO service_role;
ALTER TABLE public.world_castles ENABLE ROW LEVEL SECURITY;

-- One row per accepted relocation: it is also the replay guard for a request id,
-- so a retry after a lost connection can never cost a second move.
CREATE TABLE IF NOT EXISTS public.world_castle_moves (
  request_id uuid PRIMARY KEY,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  day date NOT NULL,
  from_x integer NOT NULL,
  from_y integer NOT NULL,
  to_x integer NOT NULL,
  to_y integer NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.world_castle_moves FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.world_castle_moves TO service_role;
ALTER TABLE public.world_castle_moves ENABLE ROW LEVEL SECURITY;

-- The day the world counts in.
CREATE OR REPLACE FUNCTION public._world_day() RETURNS date LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT (now() AT TIME ZONE 'Europe/Athens')::date
$$;

CREATE OR REPLACE FUNCTION public._world_reset_at() RETURNS timestamptz LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ((public._world_day() + 1)::timestamp AT TIME ZONE 'Europe/Athens')
$$;

CREATE OR REPLACE FUNCTION public._world_used_today(_day date, _moves integer) RETURNS integer
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT CASE WHEN _day = public._world_day() THEN coalesce(_moves, 0) ELSE 0 END
$$;

-- The character's power as the world should show it.
CREATE OR REPLACE FUNCTION public._world_power(_h public.heroes) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT greatest(coalesce(nullif(public._num(_h.stats -> 'power'), 0), _h.power, 1), 1)::integer
$$;

-- A spot is inside the world and far enough from every other castle.
CREATE OR REPLACE FUNCTION public._world_spot_free(_hero uuid, _x integer, _y integer) RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT _x BETWEEN 60 AND 940 AND _y BETWEEN 60 AND 940
     AND NOT EXISTS (
       SELECT 1 FROM public.world_castles c
        WHERE c.hero_id <> _hero
          AND abs(c.x - _x) < 40 AND abs(c.y - _y) < 40
          AND (c.x - _x) * (c.x - _x) + (c.y - _y) * (c.y - _y) < 1600)
$$;

-- The caller's castle, raised on the first visit at a free spot its id decides.
CREATE OR REPLACE FUNCTION public._world_castle(_hero uuid) RETURNS public.world_castles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; c public.world_castles; n integer := 0; seed integer; px integer; py integer;
BEGIN
  h := public._my_hero(_hero);
  SELECT * INTO c FROM public.world_castles WHERE hero_id = _hero;
  IF c.hero_id IS NULL THEN
    seed := abs(hashtext(_hero::text));
    LOOP
      px := 60 + ((seed + n * 137) % 881);
      py := 60 + (((seed / 7) + n * 271) % 881);
      EXIT WHEN public._world_spot_free(_hero, px, py) OR n >= 400;
      n := n + 1;
    END LOOP;
    INSERT INTO public.world_castles (hero_id, user_id, name, hero_class, gender, level, power, x, y, move_day)
    VALUES (_hero, h.user_id, h.name, h.hero_class, h.gender, h.level, public._world_power(h), px, py, public._world_day())
    ON CONFLICT (hero_id) DO NOTHING;
  END IF;
  -- The map always shows the character's current name, class and power.
  UPDATE public.world_castles
     SET name = h.name, hero_class = h.hero_class, gender = h.gender, level = h.level,
         power = public._world_power(h), updated_at = now()
   WHERE hero_id = _hero
  RETURNING * INTO c;
  IF c.hero_id IS NULL THEN RAISE EXCEPTION 'Your castle could not be placed in the world'; END IF;
  RETURN c;
END $$;

CREATE OR REPLACE FUNCTION public._world_payload(_mine public.world_castles, _others jsonb) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object(
    'day', public._world_day(),
    'resetAt', public._world_reset_at(),
    'movesPerDay', 3,
    'movesUsed', public._world_used_today(_mine.move_day, _mine.moves_used),
    'movesLeft', 3 - public._world_used_today(_mine.move_day, _mine.moves_used),
    'mine', jsonb_build_object('hero_id', _mine.hero_id, 'name', _mine.name, 'cls', _mine.hero_class,
      'gender', _mine.gender, 'level', _mine.level, 'power', _mine.power, 'x', _mine.x, 'y', _mine.y),
    'castles', coalesce(_others, '[]'::jsonb))
$$;

-- The world as one lord sees it: their own castle plus everyone else's, nearest first.
CREATE OR REPLACE FUNCTION public.world_map(_hero uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.world_castles; mx integer; my integer; others jsonb;
BEGIN
  c := public._world_castle(_hero);
  mx := c.x; my := c.y;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'hero_id', o.hero_id, 'name', o.name, 'cls', o.hero_class, 'gender', o.gender,
           'level', o.level, 'power', o.power, 'x', o.x, 'y', o.y) ORDER BY o.power DESC), '[]'::jsonb)
    INTO others
    FROM (SELECT * FROM public.world_castles w
           WHERE w.hero_id <> _hero
           ORDER BY (w.x - mx) * (w.x - mx) + (w.y - my) * (w.y - my) ASC, w.power DESC
           LIMIT 300) o;
  RETURN public._world_payload(c, others);
END $$;

-- Move the caller's castle. Ownership, the free ground and the three-a-day limit
-- are all decided here: the client only asks.
CREATE OR REPLACE FUNCTION public.relocate_castle(_hero uuid, _x integer, _y integer, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.world_castles; used integer; done boolean;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  PERFORM public._my_hero(_hero);
  c := public._world_castle(_hero);
  SELECT EXISTS (SELECT 1 FROM public.world_castle_moves m WHERE m.request_id = _req AND m.hero_id = _hero) INTO done;
  IF done THEN RETURN public.world_map(_hero); END IF;
  used := public._world_used_today(c.move_day, c.moves_used);
  IF used >= 3 THEN RAISE EXCEPTION 'Your castle has already travelled three times today'; END IF;
  IF _x < 60 OR _x > 940 OR _y < 60 OR _y > 940 THEN RAISE EXCEPTION 'Choose a spot inside the world map'; END IF;
  IF NOT public._world_spot_free(_hero, _x, _y) THEN RAISE EXCEPTION 'Another castle already stands there'; END IF;
  INSERT INTO public.world_castle_moves (request_id, hero_id, day, from_x, from_y, to_x, to_y)
  VALUES (_req, _hero, public._world_day(), c.x, c.y, _x, _y);
  UPDATE public.world_castles
     SET x = _x, y = _y, moved_at = now(), updated_at = now(), move_day = public._world_day(),
         moves_used = CASE WHEN move_day = public._world_day() THEN moves_used + 1 ELSE 1 END
   WHERE hero_id = _hero;
  RETURN public.world_map(_hero);
END $$;

REVOKE ALL ON FUNCTION public.world_map(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.relocate_castle(uuid, integer, integer, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._world_castle(uuid), public._world_payload(public.world_castles, jsonb),
  public._world_spot_free(uuid, integer, integer), public._world_power(public.heroes),
  public._world_day(), public._world_reset_at(), public._world_used_today(date, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.world_map(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.relocate_castle(uuid, integer, integer, uuid) TO authenticated;
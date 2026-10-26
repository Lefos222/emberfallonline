-- World PvE. The monsters that stand in the world are fought with the same
-- class abilities as everywhere else, but the encounter itself and everything it
-- pays out are decided here: the area the monster belongs to, the level the
-- server puts on it, the gold, XP, fame and loot, and the daily budget of
-- encounters. Rewards are written under the protected save key through the
-- existing _write_save, so a forged client can never invent them.
--
-- The client only asks (area + monster + kind) and adopts the save the server
-- returns. It never grants world rewards itself.
--
-- Every number here is mirrored in src/game/worldscene.ts and
-- src/game/worldcastles.ts — keep them identical (same rule as ASTRAL_ODDS).

CREATE TABLE IF NOT EXISTS public.world_encounters (
  request_id uuid PRIMARY KEY,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  day date NOT NULL,
  area text NOT NULL,
  monster text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('normal','elite','rare','boss')),
  level integer NOT NULL CHECK (level BETWEEN 1 AND 200),
  xp integer NOT NULL DEFAULT 0,
  gold integer NOT NULL DEFAULT 0,
  fame integer NOT NULL DEFAULT 0,
  loot jsonb NOT NULL DEFAULT '{}'::jsonb,
  settled boolean NOT NULL DEFAULT false,
  won boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);
CREATE INDEX IF NOT EXISTS world_encounters_hero_day_idx ON public.world_encounters (hero_id, day);
REVOKE ALL ON public.world_encounters FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.world_encounters TO service_role;
ALTER TABLE public.world_encounters ENABLE ROW LEVEL SECURITY;

-- One row per harvested node: also the replay guard for its request id, so a
-- retry after a lost connection never pays twice.
CREATE TABLE IF NOT EXISTS public.world_harvests (
  request_id uuid PRIMARY KEY,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  day date NOT NULL,
  area text NOT NULL,
  node text NOT NULL,
  mats jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_harvests_hero_day_idx ON public.world_harvests (hero_id, day);
REVOKE ALL ON public.world_harvests FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.world_harvests TO service_role;
ALTER TABLE public.world_harvests ENABLE ROW LEVEL SECURITY;

-- How many encounters and harvests a lord may work through in one world day.
CREATE OR REPLACE FUNCTION public._world_encounter_budget() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 40 $$;
CREATE OR REPLACE FUNCTION public._world_harvest_budget() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 25 $$;

-- An area of the world the player can walk: the level it opens at and the
-- highest monster that lives there. The five areas follow the World Tree map.
CREATE OR REPLACE FUNCTION public._world_area_open(_area text) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _area WHEN 'wilds' THEN 1 WHEN 'barrows' THEN 10 WHEN 'peaks' THEN 20
                   WHEN 'wastes' THEN 30 WHEN 'throne' THEN 40 ELSE 0 END $$;
CREATE OR REPLACE FUNCTION public._world_area_top(_area text) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN public._world_area_open(_area) = 0 THEN 0 ELSE public._world_area_open(_area) + 9 END $$;

-- Which monsters roam where. Elites are everywhere; rare beasts and area bosses
-- only appear deeper into the world, so a low-level lord cannot farm a titan.
CREATE OR REPLACE FUNCTION public._world_area_allows(_area text, _kind text, _level integer) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN public._world_area_open(_area) = 0 THEN false
    WHEN _kind IN ('normal','elite') THEN true
    WHEN _kind = 'rare' THEN _area <> 'wilds' AND _level >= public._world_area_open(_area)
    WHEN _kind = 'boss' THEN _area <> 'wilds' AND _area <> 'barrows' AND _level >= public._world_area_open(_area) + 9
    ELSE false END $$;

CREATE OR REPLACE FUNCTION public._world_fame_of(_s jsonb) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT coalesce(public._num(_s -> 'srv' -> 'fame'), 0)::integer $$;
CREATE OR REPLACE FUNCTION public._world_fame(_hero uuid) RETURNS integer LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT public._world_fame_of(save) FROM public.heroes WHERE id = _hero $$;

CREATE OR REPLACE FUNCTION public._world_encounters_today(_hero uuid) RETURNS integer
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT count(*)::int FROM public.world_encounters e WHERE e.hero_id = _hero AND e.day = public._world_day() $$;
CREATE OR REPLACE FUNCTION public._world_harvests_today(_hero uuid) RETURNS integer
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT count(*)::int FROM public.world_harvests h WHERE h.hero_id = _hero AND h.day = public._world_day() $$;

-- The material a harvested node yields, by node kind. Keys match the Forge's own
-- materials (ore, essence, fragment, sigil, starshard, bossCore).
CREATE OR REPLACE FUNCTION public._world_node_mats(_node text) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _node
    WHEN 'ore' THEN jsonb_build_object('ore', 2)
    WHEN 'essence' THEN jsonb_build_object('essence', 2)
    WHEN 'fragment' THEN jsonb_build_object('fragment', 1)
    WHEN 'sigil' THEN jsonb_build_object('sigil', 1)
    WHEN 'starshard' THEN jsonb_build_object('starshard', 1)
    ELSE '{}'::jsonb END $$;

-- Which nodes grow where: the wilds give ore and essence, the far reaches give
-- the rare keys. Validated here so a client cannot claim a starshard in a meadow.
CREATE OR REPLACE FUNCTION public._world_area_node(_area text, _node text) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT public._world_area_open(_area) > 0 AND (
    (_node = 'ore' AND _area IN ('wilds','barrows','peaks','wastes','throne'))
    OR (_node = 'essence' AND _area IN ('wilds','barrows','peaks','wastes','throne'))
    OR (_node = 'fragment' AND _area IN ('barrows','peaks','wastes','throne'))
    OR (_node = 'sigil' AND _area IN ('peaks','wastes','throne'))
    OR (_node = 'starshard' AND _area IN ('wastes','throne'))) $$;

-- Gems, by the key format the socket system uses ("<type>:<tier>").
CREATE OR REPLACE FUNCTION public._world_gem(_area text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _area WHEN 'wilds' THEN 'ruby' WHEN 'barrows' THEN 'emerald' WHEN 'peaks' THEN 'sapphire'
                    WHEN 'wastes' THEN 'topaz' ELSE 'garnet' END || ':1' $$;

-- What one monster of a kind pays at a level. Gold and XP follow the campaign's
-- own curve (stageRewards in src/game/data.ts) times the kind's weight.
CREATE OR REPLACE FUNCTION public._world_reward(_kind text, _level integer, _area text) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE g numeric; xp integer; gold integer; fame integer; loot jsonb := '{}'::jsonb; r double precision;
BEGIN
  g := power(1.09, _level - 1);
  xp := round((25 + 8 * _level) * g * CASE _kind WHEN 'normal' THEN 0.8 WHEN 'elite' THEN 1.6 WHEN 'rare' THEN 3.0 ELSE 6.0 END)::integer;
  gold := round((12 + 4 * _level) * g * CASE _kind WHEN 'normal' THEN 1 WHEN 'elite' THEN 2 WHEN 'rare' THEN 4 ELSE 8 END)::integer;
  fame := CASE _kind WHEN 'normal' THEN 1 WHEN 'elite' THEN 3 WHEN 'rare' THEN 8 ELSE 25 END;
  r := random();
  IF _kind = 'boss' THEN
    loot := jsonb_build_object('mats', jsonb_build_object('starshard', 2), 'gems', jsonb_build_object(public._world_gem(_area), 1));
  ELSIF _kind = 'rare' THEN
    loot := jsonb_build_object('gems', jsonb_build_object(public._world_gem(_area), 1));
  ELSIF _kind = 'elite' THEN
    loot := jsonb_build_object('mats', jsonb_build_object('sigil', CASE WHEN r < 0.3 THEN 2 ELSE 1 END));
  ELSIF r < 0.45 THEN
    loot := jsonb_build_object('mats', jsonb_build_object(CASE WHEN r < 0.22 THEN 'ore' ELSE 'essence' END, CASE WHEN r < 0.15 THEN 2 ELSE 1 END));
  END IF;
  RETURN jsonb_build_object('xp', greatest(1, xp), 'gold', greatest(1, gold), 'fame', fame, 'loot', loot);
END $$;

-- XP and level-ups, mirroring grant()/xpToNext() in src/game/data.ts and
-- src/game/logic.ts: 60 * level^1.6 to the next level, level 80 then Ascension.
CREATE OR REPLACE FUNCTION public._world_add_xp(_s jsonb, _xp integer) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE lvl integer; par integer; xp numeric; need numeric;
BEGIN
  IF _xp <= 0 THEN RETURN _s; END IF;
  lvl := public._num(_s -> 'level')::integer;
  par := public._num(_s -> 'paragon')::integer;
  xp := public._num(_s -> 'xp') + _xp;
  LOOP
    need := CASE WHEN lvl < 80 THEN round(60 * power(lvl, 1.6))
                 ELSE round(60 * power(80, 1.6) * power(1.05, par)) END;
    EXIT WHEN xp < need;
    xp := xp - need;
    IF lvl < 80 THEN lvl := lvl + 1; ELSE par := par + 1; END IF;
  END LOOP;
  RETURN jsonb_set(jsonb_set(jsonb_set(_s, '{level}', to_jsonb(lvl), true), '{paragon}', to_jsonb(par), true), '{xp}', to_jsonb(round(xp)), true);
END $$;

-- Open one encounter. The server picks the level (the area's band, following the
-- character's own progress), decides what the kill is worth and spends one of
-- the day's encounters. A repeated request id reports the same encounter.
CREATE OR REPLACE FUNCTION public.world_encounter(_hero uuid, _area text, _monster text, _kind text, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; prev public.world_encounters; open_level integer; top_level integer; used integer; lvl integer; rw jsonb;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  h := public._my_hero(_hero);
  IF coalesce(_monster, '') = '' OR char_length(_monster) > 40 OR _monster !~ '^[A-Za-z0-9 ''-]+$' THEN
    RAISE EXCEPTION 'No such monster roams this world';
  END IF;
  open_level := public._world_area_open(_area);
  IF open_level = 0 THEN RAISE EXCEPTION 'That land is not part of the world map'; END IF;
  IF h.level < open_level THEN RAISE EXCEPTION 'Those lands are too dangerous for you yet'; END IF;
  IF NOT public._world_area_allows(_area, _kind, h.level) THEN RAISE EXCEPTION 'No % of that kind roams there', _kind; END IF;

  SELECT * INTO prev FROM public.world_encounters WHERE request_id = _req AND hero_id = _hero;
  IF prev.request_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'fame', public._world_fame(_hero),
      'encounter', jsonb_build_object(
        'req', prev.request_id, 'area', prev.area, 'monster', prev.monster, 'kind', prev.kind, 'level', prev.level,
        'xp', prev.xp, 'gold', prev.gold, 'fame', prev.fame,
        'encountersPerDay', public._world_encounter_budget(),
        'encountersLeft', greatest(0, public._world_encounter_budget() - public._world_encounters_today(_hero)),
        'replay', true));
  END IF;

  used := public._world_encounters_today(_hero);
  IF used >= public._world_encounter_budget() THEN
    RAISE EXCEPTION 'You have fought every monster you can today — the world rests until the new day';
  END IF;
  top_level := public._world_area_top(_area);
  lvl := greatest(open_level, least(h.level + 2, top_level));
  rw := public._world_reward(_kind, lvl, _area);
  INSERT INTO public.world_encounters (request_id, hero_id, day, area, monster, kind, level, xp, gold, fame, loot)
  VALUES (_req, _hero, public._world_day(), _area, _monster, _kind, lvl,
          (rw ->> 'xp')::integer, (rw ->> 'gold')::integer, (rw ->> 'fame')::integer, rw -> 'loot');

  RETURN jsonb_build_object(
    'fame', public._world_fame(_hero),
    'encounter', jsonb_build_object(
      'req', _req, 'area', _area, 'monster', _monster, 'kind', _kind, 'level', lvl,
      'xp', (rw ->> 'xp')::integer, 'gold', (rw ->> 'gold')::integer, 'fame', (rw ->> 'fame')::integer,
      'encountersPerDay', public._world_encounter_budget(),
      'encountersLeft', greatest(0, public._world_encounter_budget() - used - 1),
      'replay', false));
END $$;

-- Settle the encounter the player just fought. A win pays the stored reward and
-- the fame it carries; a loss pays nothing. Both are recorded, and the request
-- id makes a retry after a lost connection report the same outcome instead of
-- paying twice. The client adopts the returned save and never resaves it.
CREATE OR REPLACE FUNCTION public.world_settle(_hero uuid, _req uuid, _won boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; e public.world_encounters; s jsonb; before_fame integer; gained jsonb;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  h := public._my_hero(_hero);
  SELECT * INTO e FROM public.world_encounters WHERE request_id = _req AND hero_id = _hero;
  IF e.request_id IS NULL THEN RAISE EXCEPTION 'That encounter did not happen in this world'; END IF;

  IF e.settled THEN
    RETURN jsonb_build_object('save', h.save, 'encounter', jsonb_build_object(
      'won', e.won, 'xp', CASE WHEN e.won THEN e.xp ELSE 0 END, 'gold', CASE WHEN e.won THEN e.gold ELSE 0 END,
      'fame', CASE WHEN e.won THEN e.fame ELSE 0 END, 'loot', CASE WHEN e.won THEN e.loot ELSE '{}'::jsonb END,
      'level', e.level, 'fame_total', public._world_fame(_hero),
      'encountersPerDay', public._world_encounter_budget(),
      'encountersLeft', greatest(0, public._world_encounter_budget() - public._world_encounters_today(_hero)),
      'replay', true));
  END IF;

  s := h.save;
  before_fame := public._world_fame_of(s);
  gained := jsonb_build_object('won', _won, 'xp', 0, 'gold', 0, 'fame', 0, 'loot', '{}'::jsonb,
                               'level', e.level, 'monster', e.monster, 'kind', e.kind);
  IF _won THEN
    s := public._apply_reward(s, jsonb_build_object(
      'gold', e.gold,
      'mats', coalesce(e.loot -> 'mats', '{}'::jsonb),
      'gems', coalesce(e.loot -> 'gems', '{}'::jsonb)));
    s := public._world_add_xp(s, e.xp);
    s := jsonb_set(s, '{srv,fame}', to_jsonb(before_fame + e.fame), true);
    gained := jsonb_build_object('won', true, 'xp', e.xp, 'gold', e.gold, 'fame', e.fame, 'loot', e.loot,
                                 'level', e.level, 'monster', e.monster, 'kind', e.kind);
  END IF;
  PERFORM public._write_save(_hero, s);
  UPDATE public.world_encounters SET settled = true, won = _won, settled_at = now() WHERE request_id = _req;

  RETURN jsonb_build_object('save', s, 'encounter', gained || jsonb_build_object(
    'fame_total', public._world_fame(_hero),
    'encountersPerDay', public._world_encounter_budget(),
    'encountersLeft', greatest(0, public._world_encounter_budget() - public._world_encounters_today(_hero)),
    'replay', false));
END $$;

-- Harvest one node. The node kind must be one that really grows in that land; the
-- day's harvests are budgeted and the materials land in the protected save.
CREATE OR REPLACE FUNCTION public.world_harvest(_hero uuid, _area text, _node text, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; prev public.world_harvests; mats jsonb; used integer; s jsonb;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  h := public._my_hero(_hero);
  IF NOT public._world_area_node(_area, _node) THEN RAISE EXCEPTION 'Nothing of that kind grows there'; END IF;
  IF h.level < public._world_area_open(_area) THEN RAISE EXCEPTION 'Those lands are too dangerous for you yet'; END IF;

  SELECT * INTO prev FROM public.world_harvests WHERE request_id = _req AND hero_id = _hero;
  IF prev.request_id IS NOT NULL THEN
    RETURN jsonb_build_object('save', h.save, 'harvest', jsonb_build_object(
      'node', prev.node, 'area', prev.area, 'mats', prev.mats,
      'harvestsPerDay', public._world_harvest_budget(),
      'harvestsLeft', greatest(0, public._world_harvest_budget() - public._world_harvests_today(_hero)),
      'replay', true));
  END IF;

  used := public._world_harvests_today(_hero);
  IF used >= public._world_harvest_budget() THEN
    RAISE EXCEPTION 'You have gathered all you can today — the world renews at the new day';
  END IF;
  mats := public._world_node_mats(_node);
  s := public._apply_reward(h.save, jsonb_build_object('mats', mats));
  PERFORM public._write_save(_hero, s);
  INSERT INTO public.world_harvests (request_id, hero_id, day, area, node, mats)
  VALUES (_req, _hero, public._world_day(), _area, _node, mats);

  RETURN jsonb_build_object('save', s, 'harvest', jsonb_build_object(
    'node', _node, 'area', _area, 'mats', mats,
    'harvestsPerDay', public._world_harvest_budget(),
    'harvestsLeft', greatest(0, public._world_harvest_budget() - used - 1),
    'replay', false));
END $$;

-- The world payload now also carries fame and today's encounter/harvest budget,
-- so the HUD can show the limits the server enforces.
CREATE OR REPLACE FUNCTION public._world_payload(_mine public.world_castles, _others jsonb) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object(
    'day', public._world_day(),
    'resetAt', public._world_reset_at(),
    'movesPerDay', 3,
    'movesUsed', public._world_used_today(_mine.move_day, _mine.moves_used),
    'movesLeft', 3 - public._world_used_today(_mine.move_day, _mine.moves_used),
    'assaultsPerDay', 5,
    'assaultsUsed', public._world_assaults_today(_mine.hero_id),
    'assaultsLeft', greatest(0, 5 - public._world_assaults_today(_mine.hero_id)),
    'fame', public._world_fame(_mine.hero_id),
    'encountersPerDay', public._world_encounter_budget(),
    'encountersLeft', greatest(0, public._world_encounter_budget() - public._world_encounters_today(_mine.hero_id)),
    'harvestsPerDay', public._world_harvest_budget(),
    'harvestsLeft', greatest(0, public._world_harvest_budget() - public._world_harvests_today(_mine.hero_id)),
    'mine', jsonb_build_object('hero_id', _mine.hero_id, 'name', _mine.name, 'cls', _mine.hero_class,
      'gender', _mine.gender, 'level', _mine.level, 'power', _mine.power, 'x', _mine.x, 'y', _mine.y),
    'castles', coalesce(_others, '[]'::jsonb))
$$;

REVOKE ALL ON FUNCTION public.world_encounter(uuid, text, text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.world_settle(uuid, uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.world_harvest(uuid, text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._world_fame(uuid), public._world_fame_of(jsonb), public._world_encounters_today(uuid),
  public._world_harvests_today(uuid), public._world_reward(text, integer, text), public._world_add_xp(jsonb, integer),
  public._world_gem(text), public._world_node_mats(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.world_encounter(uuid, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.world_settle(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.world_harvest(uuid, text, text, uuid) TO authenticated;

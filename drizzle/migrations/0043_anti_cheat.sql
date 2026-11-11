-- Anti-cheat: the hero row is written by the browser, so every save is checked against what the
-- game itself can produce. A save that carries an impossible value is rolled back to the last
-- verified number, the attempt is logged, the account is warned, and a second attempt removes the
-- character (a full snapshot is kept in `hero_quarantine` so a false ban can be restored).
--
-- Nothing here trusts the client: the checks run inside the database on every write that does not
-- come from a trusted SECURITY DEFINER path (`app.srv`), the arena ladder (`app.arena`) or this
-- file's own maintenance work (`app.anti`).

-- ---------------------------------------------------------------------------------------------
-- Bookkeeping tables
-- ---------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.hero_guard (
  hero_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  strikes int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'clean' CHECK (status IN ('clean', 'warned', 'banned', 'restored')),
  last_kind text,
  last_event_at timestamptz,
  -- Gold is rate-limited from the last value the server itself accepted, so a burst of forged
  -- saves cannot drip gold in faster than the game can earn it.
  gold_anchor numeric,
  gold_anchor_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anti_cheat_events (
  id bigserial PRIMARY KEY,
  hero_id uuid,
  user_id uuid NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS anti_cheat_events_user_idx ON public.anti_cheat_events (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.anti_cheat_notices (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  kind text NOT NULL CHECK (kind IN ('warning', 'removed')),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  seen_at timestamptz
);
CREATE INDEX IF NOT EXISTS anti_cheat_notices_user_idx ON public.anti_cheat_notices (user_id, seen_at);

-- One row per removed character: the whole row as it stood (save included), so support can put a
-- falsely banned hero back exactly as it was.
CREATE TABLE IF NOT EXISTS public.hero_quarantine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid NOT NULL,
  user_id uuid NOT NULL,
  hero_name text NOT NULL,
  reason text NOT NULL,
  strikes int NOT NULL DEFAULT 0,
  snapshot jsonb NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  restored_at timestamptz
);
CREATE INDEX IF NOT EXISTS hero_quarantine_user_idx ON public.hero_quarantine (user_id, created_at DESC);

-- These tables are server-only. Players learn about their strikes through `my_anti_cheat_notices`.
REVOKE ALL ON public.hero_guard FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.anti_cheat_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.anti_cheat_notices FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.hero_quarantine FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.anti_cheat_events_id_seq FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.anti_cheat_notices_id_seq FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.hero_guard TO service_role;
GRANT ALL ON public.anti_cheat_events TO service_role;
GRANT ALL ON public.anti_cheat_notices TO service_role;
GRANT ALL ON public.hero_quarantine TO service_role;
GRANT ALL ON SEQUENCE public.anti_cheat_events_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.anti_cheat_notices_id_seq TO service_role;
ALTER TABLE public.hero_guard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anti_cheat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anti_cheat_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_quarantine ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------------------------
-- Plausibility curves (mirrored in src/game/anticheat.ts and checked by src/test/anticheat.test.ts)
-- ---------------------------------------------------------------------------------------------

-- The highest Battle Rating the stat engine can produce for a hero of this level and Ascension.
-- Three times the strongest benchmark build, with a floor that leaves the opening levels room:
-- about 11,000 at level 3 and 1.5 million at the cap, so an 800,000 rating on a level-3 hero is
-- impossible, while every real build sits far below the line.
CREATE OR REPLACE FUNCTION public._hero_power_ceiling(_level int, _paragon int DEFAULT 0)
RETURNS bigint LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT round(
    (10000 + 147 * power(greatest(1, least(140, coalesce(_level, 1)))::numeric, 1.87))
    * (1 + 0.03 * greatest(0, coalesce(_paragon, 0)))
  )::bigint
$$;

-- XP one level costs, mirrored from xpToNext() in src/game/data.ts.
CREATE OR REPLACE FUNCTION public._hero_xp_to_next(_level int)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT (
    CASE WHEN lv < 20 THEN 10 ELSE 10 + round(6 * power((lv - 19)::numeric, 0.75)) END
    * round(22 * power(lv::numeric, 1.5)
        * power(1.012::numeric, greatest(0, lv - 30))
        * power(0.992::numeric, greatest(0, lv - 30)))
  )
  FROM (SELECT greatest(1, least(140, coalesce(_level, 1))) AS lv) t
$$;

-- ---------------------------------------------------------------------------------------------
-- Recording an attempt
-- ---------------------------------------------------------------------------------------------

-- Log one blocked save, count the strike and tell the player. Two strikes remove the character;
-- a quiet month clears the slate so an old false positive is not a life sentence.
CREATE OR REPLACE FUNCTION public._hero_flag(_hero uuid, _user uuid, _name text, _kind text, _detail jsonb DEFAULT '{}'::jsonb)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.hero_guard; n int;
BEGIN
  INSERT INTO public.hero_guard (hero_id, user_id, hero_name)
  VALUES (_hero, _user, coalesce(_name, ''))
  ON CONFLICT (hero_id) DO NOTHING;

  SELECT * INTO g FROM public.hero_guard WHERE hero_id = _hero FOR UPDATE;
  n := CASE
    WHEN g.last_event_at IS NULL OR g.last_event_at < now() - interval '30 days' THEN 1
    ELSE g.strikes + 1
  END;

  UPDATE public.hero_guard
    SET strikes = n,
        status = CASE WHEN n >= 2 THEN 'banned' ELSE 'warned' END,
        last_kind = _kind,
        last_event_at = now(),
        user_id = _user,
        hero_name = coalesce(nullif(_name, ''), hero_name)
    WHERE hero_id = _hero;

  INSERT INTO public.anti_cheat_events (hero_id, user_id, hero_name, kind, detail)
  VALUES (_hero, _user, coalesce(_name, ''), _kind, coalesce(_detail, '{}'::jsonb));

  INSERT INTO public.anti_cheat_notices (user_id, hero_name, kind, detail)
  VALUES (_user, coalesce(_name, ''), CASE WHEN n >= 2 THEN 'removed' ELSE 'warning' END,
          coalesce(_detail, '{}'::jsonb) || jsonb_build_object('reason', _kind, 'strike', n));
  RETURN n;
END $$;

-- Copy the character (save and all) into the quarantine table before it is removed.
CREATE OR REPLACE FUNCTION public._hero_quarantine(_hero uuid, _reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; g public.hero_guard; qid uuid;
BEGIN
  SELECT * INTO h FROM public.heroes WHERE id = _hero;
  IF h.id IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO g FROM public.hero_guard WHERE hero_id = _hero;
  INSERT INTO public.hero_quarantine (hero_id, user_id, hero_name, reason, strikes, snapshot, events)
  VALUES (h.id, h.user_id, h.name, _reason, coalesce(g.strikes, 0), to_jsonb(h),
          coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.id DESC) FROM public.anti_cheat_events e WHERE e.hero_id = h.id), '[]'::jsonb))
  RETURNING id INTO qid;
  RETURN qid;
END $$;

-- ---------------------------------------------------------------------------------------------
-- The guard
-- ---------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.heroes_anti_cheat()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  attempts jsonb := '{}'::jsonb;
  srv_old jsonb;
  srv_new jsonb;
  lvl_from int; lvl_to int; lv int; bill numeric; clamped_level int;
  xp_before numeric; xp_after numeric; xp_allow numeric;
  ceiling bigint; paragon int;
  gold_before numeric; gold_after numeric; gold_allow numeric; elapsed numeric;
  anchor numeric; anchor_at timestamptz;
  gold_violated boolean := false;
  level_violated boolean := false;
BEGIN
  -- Trusted writers: reward/payment RPCs, the arena ladder and this file's own maintenance.
  IF current_setting('app.srv', true) = '1'
     OR current_setting('app.arena', true) = '1'
     OR current_setting('app.anti', true) = '1' THEN
    RETURN new;
  END IF;

  IF tg_op = 'INSERT' THEN
    IF jsonb_typeof(new.save) IS DISTINCT FROM 'object' THEN new.save := '{}'::jsonb; END IF;
    paragon := coalesce(public._num(new.save->'paragon'), 0)::int;
    ceiling := public._hero_power_ceiling(new.level, paragon);
    IF coalesce(new.power, 0) > ceiling OR public._num(new.stats->'power') > ceiling THEN
      PERFORM public._hero_flag(new.id, new.user_id, new.name, 'battle_rating',
        jsonb_build_object('power', new.power, 'level', new.level, 'ceiling', ceiling, 'stage', 'insert'));
      new.power := least(greatest(coalesce(new.power, 0), 0), ceiling)::int;
      new.stats := jsonb_build_object('power', new.power);
    END IF;
    new.level := greatest(1, least(140, coalesce(new.level, 1)));
    new.save := jsonb_set(new.save, '{level}', to_jsonb(new.level), true);
    RETURN new;
  END IF;

  IF jsonb_typeof(new.save) IS DISTINCT FROM 'object' THEN new.save := coalesce(old.save, '{}'::jsonb); END IF;

  -- 1. Diamonds, VIP, scrolls, buffs and cosmetics live in `srv` and are minted only by the server.
  srv_old := coalesce(old.save->'srv', '{}'::jsonb);
  srv_new := coalesce(new.save->'srv', '{}'::jsonb);
  IF srv_new IS DISTINCT FROM srv_old THEN
    attempts := attempts || jsonb_build_object('server_owned', srv_new);
    new.save := jsonb_set(new.save, '{srv}', srv_old, true);
  END IF;

  -- 2. The arena ladder is server-scored; a client may never edit its own rating.
  IF new.arena_rating IS DISTINCT FROM old.arena_rating THEN
    attempts := attempts || jsonb_build_object('arena_rating', new.arena_rating);
    new.arena_rating := old.arena_rating;
  END IF;

  -- 3. A level costs the fights the curve says it costs. A save may only level up as far as the
  --    xp it carries can pay for (with generous room for a blitz settle that lands many levels).
  lvl_from := greatest(1, least(140, coalesce(old.level, 1)));
  lvl_to := greatest(1, least(140, coalesce(new.level, lvl_from)));
  IF lvl_to < lvl_from THEN
    attempts := attempts || jsonb_build_object('level', new.level);
    lvl_to := lvl_from;
    level_violated := true;
  ELSIF lvl_to > lvl_from THEN
    bill := 0;
    FOR lv IN lvl_from .. lvl_to - 1 LOOP bill := bill + public._hero_xp_to_next(lv); END LOOP;
    xp_before := public._num(old.save->'xp');
    xp_after := public._num(new.save->'xp');
    xp_allow := 10 * public._hero_xp_to_next(lvl_from) + 100000;
    IF bill - greatest(0, xp_after - xp_before) > xp_allow THEN
      clamped_level := lvl_from;
      bill := 0;
      FOR lv IN lvl_from .. lvl_to - 1 LOOP
        bill := bill + public._hero_xp_to_next(lv);
        EXIT WHEN bill - greatest(0, xp_after - xp_before) > xp_allow;
        clamped_level := lv + 1;
      END LOOP;
      attempts := attempts || jsonb_build_object('level', new.level);
      lvl_to := clamped_level;
      level_violated := true;
    END IF;
  END IF;
  new.level := lvl_to;
  new.save := jsonb_set(new.save, '{level}', to_jsonb(lvl_to), true);

  -- 4. Battle Rating must stay inside what this level and Ascension can produce.
  paragon := coalesce(public._num(new.save->'paragon'), 0)::int;
  ceiling := public._hero_power_ceiling(new.level, paragon);
  IF public._num(new.stats->'power') > ceiling THEN
    attempts := attempts || jsonb_build_object('battle_rating', public._num(new.stats->'power'));
    new.stats := old.stats;
  END IF;
  IF coalesce(new.power, 0) > ceiling THEN
    attempts := attempts || jsonb_build_object('power', new.power);
    new.power := least(greatest(coalesce(old.power, 0), 0), ceiling)::int;
  END IF;
  IF coalesce(new.power, 0) < 0 THEN new.power := 0; END IF;

  -- 5. Gold may only grow as fast as the game pays it out: the allowance runs from the last value
  --    the server accepted, so hammering saves cannot drip a fortune in.
  gold_before := public._num(old.save->'gold');
  gold_after := public._num(new.save->'gold');
  IF gold_after < 0 THEN
    new.save := jsonb_set(new.save, '{gold}', '0'::jsonb, true);
    gold_after := 0;
  END IF;
  SELECT gold_anchor, gold_anchor_at INTO anchor, anchor_at FROM public.hero_guard WHERE hero_id = old.id;
  elapsed := greatest(0, extract(epoch FROM (now() - coalesce(anchor_at, old.updated_at, now()))));
  gold_allow := 250000 + 15000 * least(elapsed, 21600);
  IF gold_after - gold_before > gold_allow THEN
    attempts := attempts || jsonb_build_object('gold', gold_after);
    new.save := jsonb_set(new.save, '{gold}', to_jsonb(gold_before + gold_allow), true);
    gold_after := gold_before + gold_allow;
    gold_violated := true;
  END IF;

  -- An accepted gold change moves the anchor; a blocked one does not, so a retry gains nothing.
  IF NOT gold_violated AND gold_after IS DISTINCT FROM gold_before THEN
    INSERT INTO public.hero_guard (hero_id, user_id, hero_name, gold_anchor, gold_anchor_at)
    VALUES (new.id, new.user_id, new.name, gold_after, now())
    ON CONFLICT (hero_id) DO UPDATE
      SET gold_anchor = excluded.gold_anchor, gold_anchor_at = excluded.gold_anchor_at;
  END IF;

  IF attempts <> '{}'::jsonb THEN
    PERFORM public._hero_flag(new.id, new.user_id, new.name, 'forged_save',
      attempts || jsonb_build_object('gold_violated', gold_violated, 'level_violated', level_violated));
  END IF;

  RETURN new;
END $$;

CREATE TRIGGER heroes_anti_cheat
  BEFORE INSERT OR UPDATE ON public.heroes
  FOR EACH ROW EXECUTE FUNCTION public.heroes_anti_cheat();

-- A second strike removes the character, after its whole row has been copied to quarantine.
CREATE OR REPLACE FUNCTION public.heroes_anti_cheat_remove()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.hero_guard;
BEGIN
  IF current_setting('app.srv', true) = '1'
     OR current_setting('app.arena', true) = '1'
     OR current_setting('app.anti', true) = '1' THEN
    RETURN new;
  END IF;
  SELECT * INTO g FROM public.hero_guard WHERE hero_id = new.id;
  IF coalesce(g.status, 'clean') <> 'banned' THEN RETURN new; END IF;
  PERFORM public._hero_quarantine(new.id, 'repeated forged saves');
  DELETE FROM public.heroes WHERE id = new.id;
  RETURN new;
END $$;

CREATE TRIGGER heroes_anti_cheat_remove
  AFTER UPDATE ON public.heroes
  FOR EACH ROW EXECUTE FUNCTION public.heroes_anti_cheat_remove();

-- Postgres grants EXECUTE to every role by default, and PostgREST would happily expose these
-- helpers: a player could otherwise flag or quarantine somebody else's hero. They are internal.
REVOKE ALL ON FUNCTION public._hero_flag(uuid, uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._hero_quarantine(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._hero_power_ceiling(int, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._hero_xp_to_next(int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.heroes_anti_cheat() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.heroes_anti_cheat_remove() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._hero_flag(uuid, uuid, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public._hero_quarantine(uuid, text) TO service_role;

-- ---------------------------------------------------------------------------------------------
-- Player-facing notices
-- ---------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.my_anti_cheat_notices()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', n.id, 'kind', n.kind, 'hero', n.hero_name,
      'detail', n.detail, 'at', n.created_at) ORDER BY n.id DESC)
    FROM public.anti_cheat_notices n
    WHERE n.user_id = uid AND n.seen_at IS NULL
  ), '[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.ack_anti_cheat_notices(_ids bigint[])
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); n int;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  UPDATE public.anti_cheat_notices SET seen_at = now()
    WHERE user_id = uid AND seen_at IS NULL AND id = ANY(coalesce(_ids, ARRAY[]::bigint[]));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.my_anti_cheat_notices() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ack_anti_cheat_notices(bigint[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_anti_cheat_notices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ack_anti_cheat_notices(bigint[]) TO authenticated;

-- Support tool: put a quarantined character back exactly as it was (false bans).
CREATE OR REPLACE FUNCTION public.restore_quarantined_character(_quarantine uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.hero_quarantine; snap jsonb;
BEGIN
  SELECT * INTO q FROM public.hero_quarantine WHERE id = _quarantine FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Unknown quarantine record'; END IF;
  IF q.restored_at IS NOT NULL THEN RAISE EXCEPTION 'That character has already been restored'; END IF;
  snap := q.snapshot;
  PERFORM set_config('app.anti', '1', true);
  INSERT INTO public.heroes
    (id, user_id, name, hero_class, gender, level, power, stats, save, arena_rating,
     bio, title, frame, is_public, last_played, created_at, updated_at)
  VALUES (
    (snap->>'id')::uuid, (snap->>'user_id')::uuid, snap->>'name', snap->>'hero_class', snap->>'gender',
    coalesce((snap->>'level')::int, 1), coalesce((snap->>'power')::int, 0),
    coalesce(snap->'stats', '{}'::jsonb), coalesce(snap->'save', '{}'::jsonb),
    coalesce((snap->>'arena_rating')::int, 1000), coalesce(snap->>'bio', ''),
    coalesce(snap->>'title', ''), coalesce(snap->>'frame', 'iron'),
    coalesce((snap->>'is_public')::boolean, true),
    coalesce((snap->>'last_played')::timestamptz, now()),
    coalesce((snap->>'created_at')::timestamptz, now()), now()
  );
  UPDATE public.hero_guard SET strikes = 0, status = 'restored', last_kind = 'restored'
    WHERE hero_id = q.hero_id;
  UPDATE public.hero_quarantine SET restored_at = now() WHERE id = q.id;
  PERFORM set_config('app.anti', '0', true);
  RETURN q.hero_id;
END $$;

REVOKE ALL ON FUNCTION public.restore_quarantined_character(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_quarantined_character(uuid) TO service_role;

-- ---------------------------------------------------------------------------------------------
-- One-time cleanup: heroes already carrying an impossible Battle Rating are removed now (the
-- snapshot stays in `hero_quarantine`, so any false positive can be restored).
-- ---------------------------------------------------------------------------------------------

DO $$
DECLARE r record; ceil bigint; paragon int;
BEGIN
  PERFORM set_config('app.anti', '1', true);
  FOR r IN SELECT * FROM public.heroes LOOP
    paragon := coalesce(public._num(r.save->'paragon'), 0)::int;
    ceil := public._hero_power_ceiling(r.level, paragon);
    IF coalesce(r.power, 0) > ceil OR public._num(r.stats->'power') > ceil THEN
      INSERT INTO public.hero_guard (hero_id, user_id, hero_name, strikes, status, last_kind, last_event_at)
      VALUES (r.id, r.user_id, r.name, 2, 'banned', 'legacy_battle_rating', now())
      ON CONFLICT (hero_id) DO UPDATE
        SET strikes = 2, status = 'banned', last_kind = 'legacy_battle_rating', last_event_at = now();
      INSERT INTO public.anti_cheat_events (hero_id, user_id, hero_name, kind, detail)
      VALUES (r.id, r.user_id, r.name, 'legacy_battle_rating',
        jsonb_build_object('power', r.power, 'level', r.level, 'ceiling', ceil, 'paragon', paragon));
      INSERT INTO public.anti_cheat_notices (user_id, hero_name, kind, detail)
      VALUES (r.user_id, r.name, 'removed',
        jsonb_build_object('reason', 'battle_rating', 'strike', 2, 'legacy', true,
                           'power', r.power, 'level', r.level));
      PERFORM public._hero_quarantine(r.id, 'impossible battle rating for its level');
      DELETE FROM public.heroes WHERE id = r.id;
    END IF;
  END LOOP;
  PERFORM set_config('app.anti', '0', true);
END $$;

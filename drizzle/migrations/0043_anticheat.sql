-- Anticheat: the browser writes the hero save directly (level, Battle Rating, gold), so the database
-- now checks every client write for impossible values. A cheating write is refused, the character is
-- removed, the player gets a warning, and the last clean save is kept in a quarantine so a false ban
-- can be undone with public.anticheat_restore(<quarantine id>).
-- Server RPCs (`_write_save`, arena results) and the service role are trusted and never checked.
-- The limits are mirrored in src/game/anticheat-limits.ts; keep both identical.

CREATE TABLE IF NOT EXISTS public.anticheat_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hero_id uuid,
  hero_name text NOT NULL DEFAULT '',
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);
CREATE INDEX IF NOT EXISTS anticheat_warnings_user_idx ON public.anticheat_warnings (user_id, created_at DESC);
ALTER TABLE public.anticheat_warnings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anticheat_warnings FROM anon, authenticated;
GRANT SELECT ON public.anticheat_warnings TO authenticated;
GRANT ALL ON public.anticheat_warnings TO service_role;
DROP POLICY IF EXISTS "players read own warnings" ON public.anticheat_warnings;
CREATE POLICY "players read own warnings" ON public.anticheat_warnings FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Quarantine: never readable by players. `backup` is the last clean row (restorable), `evidence` the refused write.
CREATE TABLE IF NOT EXISTS public.anticheat_quarantine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_id uuid REFERENCES public.anticheat_warnings(id) ON DELETE SET NULL,
  hero_id uuid,
  user_id uuid NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  reason text NOT NULL,
  source text NOT NULL CHECK (source IN ('live', 'create', 'sweep')),
  backup jsonb,
  evidence jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  restored_at timestamptz,
  restored_hero_id uuid
);
CREATE INDEX IF NOT EXISTS anticheat_quarantine_user_idx ON public.anticheat_quarantine (user_id, created_at DESC);
ALTER TABLE public.anticheat_quarantine ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anticheat_quarantine FROM anon, authenticated;
GRANT ALL ON public.anticheat_quarantine TO service_role;

-- Per-hero high-water marks, so playing in two tabs never looks like a jump.
CREATE TABLE IF NOT EXISTS public.anticheat_state (
  hero_id uuid PRIMARY KEY REFERENCES public.heroes(id) ON DELETE CASCADE,
  peak_gold numeric NOT NULL DEFAULT 0,
  peak_level int NOT NULL DEFAULT 0,
  peak_paragon int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_gain numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.anticheat_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anticheat_state FROM anon, authenticated;
GRANT ALL ON public.anticheat_state TO service_role;

-- ---------- Limits (mirrored in src/game/anticheat-limits.ts) ----------
CREATE OR REPLACE FUNCTION public._ac_power_cap(_level numeric, _paragon numeric) RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 650000
    * (1 + power(least(140, greatest(1, floor(coalesce(_level, 1)))) / 140.0, 1.7) * 2.4 + greatest(0, coalesce(_paragon, 0)) * 0.03)
    * (1 + greatest(0, coalesce(_paragon, 0)) * 0.03) $$;

CREATE OR REPLACE FUNCTION public._ac_gold_cap(_level numeric, _paragon numeric) RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 100000 + 40000 * greatest(0, coalesce(_level, 0)) + 20000 * greatest(0, coalesce(_paragon, 0)) $$;

-- Values no honest hero can ever hold. NULL = clean.
CREATE OR REPLACE FUNCTION public._ac_static_reason(_level numeric, _paragon numeric, _power numeric, _save jsonb)
RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE g numeric;
BEGIN
  IF _level IS NULL OR _level < 0 OR _level > 140 THEN RETURN 'Impossible level (' || coalesce(_level::text, 'none') || ')'; END IF;
  IF coalesce(_paragon, 0) < 0 THEN RETURN 'Impossible Ascension level'; END IF;
  IF coalesce(_power, 0) > public._ac_power_cap(_level, _paragon) THEN
    RETURN 'Impossible Battle Rating ' || round(_power)::text || ' at level ' || _level::text;
  END IF;
  IF _save ? 'gold' THEN
    IF jsonb_typeof(_save->'gold') <> 'number' THEN RETURN 'Tampered gold value'; END IF;
    g := (_save->>'gold')::numeric;
    IF g < 0 OR g > 2000000000 THEN RETURN 'Impossible gold balance (' || round(g)::text || ')'; END IF;
  END IF;
  IF _save ? 'level' AND jsonb_typeof(_save->'level') = 'number' AND (_save->>'level')::numeric <> _level THEN
    RETURN 'Level does not match the save';
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public._ac_caller_role() RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role',
    nullif(current_setting('request.jwt.claim.role', true), '')) $$;

-- ---------- The guard on every player write ----------
CREATE OR REPLACE FUNCTION public.anticheat_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  reason text;
  st public.anticheat_state;
  new_par numeric := public._num(NEW.save->'paragon');
  old_par numeric;
  new_gold numeric := public._num(NEW.save->'gold');
  base_gold numeric; base_level numeric; base_par numeric;
  gain numeric := 0; cap numeric; win_start timestamptz; win_gain numeric;
  wid uuid;
BEGIN
  -- Only direct writes from a signed-in player's browser are checked; trusted server paths pass.
  IF public._ac_caller_role() IS DISTINCT FROM 'authenticated'
     OR current_setting('app.srv', true) = '1'
     OR current_setting('app.arena', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- A new character always starts fresh (level 0/1, no gold, starter kit).
    reason := public._ac_static_reason(NEW.level, new_par, NEW.power, NEW.save);
    IF reason IS NULL AND (NEW.level > 1 OR new_par > 0 OR new_gold > 5000 OR NEW.power > 5000) THEN
      reason := 'Created a character that was not fresh';
    END IF;
    IF reason IS NULL THEN RETURN NEW; END IF;
    INSERT INTO public.anticheat_warnings (user_id, hero_id, hero_name, reason)
      VALUES (NEW.user_id, NULL, NEW.name, reason) RETURNING id INTO wid;
    INSERT INTO public.anticheat_quarantine (warning_id, hero_id, user_id, hero_name, reason, source, backup, evidence)
      VALUES (wid, NULL, NEW.user_id, NEW.name, reason, 'create', NULL, to_jsonb(NEW));
    RETURN NULL;
  END IF;

  -- Profile edits, last_played pings and other writes that leave progress alone pass straight through.
  IF NEW.level IS NOT DISTINCT FROM OLD.level AND NEW.power IS NOT DISTINCT FROM OLD.power
     AND NEW.save->'gold' IS NOT DISTINCT FROM OLD.save->'gold'
     AND NEW.save->'paragon' IS NOT DISTINCT FROM OLD.save->'paragon'
     AND NEW.save->'level' IS NOT DISTINCT FROM OLD.save->'level'
     AND NEW.stats->'power' IS NOT DISTINCT FROM OLD.stats->'power' THEN
    RETURN NEW;
  END IF;

  old_par := public._num(OLD.save->'paragon');
  reason := public._ac_static_reason(NEW.level, new_par, NEW.power, NEW.save);
  IF reason IS NULL AND public._num(NEW.stats->'power') > public._ac_power_cap(NEW.level, new_par) THEN
    reason := 'Impossible Battle Rating in hero stats';
  END IF;

  SELECT * INTO st FROM public.anticheat_state WHERE hero_id = OLD.id FOR UPDATE;
  base_gold := greatest(public._num(OLD.save->'gold'), coalesce(st.peak_gold, 0));
  base_level := greatest(OLD.level, coalesce(st.peak_level, 0));
  base_par := greatest(old_par, coalesce(st.peak_paragon, 0));

  IF reason IS NULL THEN
    IF NEW.level - base_level > 30 THEN
      reason := 'Level jumped from ' || base_level::text || ' to ' || NEW.level::text || ' at once';
    ELSIF new_par - base_par > 30 THEN
      reason := 'Ascension jumped by ' || (new_par - base_par)::text || ' at once';
    ELSIF new_par > base_par AND NEW.level < 140 THEN
      reason := 'Gained Ascension before the level cap';
    END IF;
  END IF;

  IF reason IS NULL THEN
    gain := greatest(0, new_gold - base_gold);
    cap := public._ac_gold_cap(NEW.level, new_par);
    win_start := coalesce(st.window_start, now());
    win_gain := coalesce(st.window_gain, 0);
    IF win_start < now() - interval '1 hour' THEN win_start := now(); win_gain := 0; END IF;
    win_gain := win_gain + gain;
    IF gain > cap THEN
      reason := 'Gained ' || round(gain)::text || ' gold in a single save';
    ELSIF win_gain > cap * 4 THEN
      reason := 'Gained ' || round(win_gain)::text || ' gold within one hour';
    END IF;
  END IF;

  IF reason IS NULL THEN
    INSERT INTO public.anticheat_state AS s (hero_id, peak_gold, peak_level, peak_paragon, window_start, window_gain)
      VALUES (OLD.id, greatest(base_gold, new_gold), greatest(base_level, NEW.level), greatest(base_par, new_par), win_start, win_gain)
      ON CONFLICT (hero_id) DO UPDATE SET peak_gold = EXCLUDED.peak_gold, peak_level = EXCLUDED.peak_level,
        peak_paragon = EXCLUDED.peak_paragon, window_start = EXCLUDED.window_start, window_gain = EXCLUDED.window_gain;
    RETURN NEW;
  END IF;

  -- Cheat detected: keep the last clean save, warn the player and remove the character.
  INSERT INTO public.anticheat_warnings (user_id, hero_id, hero_name, reason)
    VALUES (OLD.user_id, OLD.id, OLD.name, reason) RETURNING id INTO wid;
  INSERT INTO public.anticheat_quarantine (warning_id, hero_id, user_id, hero_name, reason, source, backup, evidence)
    VALUES (wid, OLD.id, OLD.user_id, OLD.name, reason, 'live', to_jsonb(OLD), to_jsonb(NEW));
  DELETE FROM public.heroes WHERE id = OLD.id;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.anticheat_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS heroes_zz_anticheat ON public.heroes;
CREATE TRIGGER heroes_zz_anticheat BEFORE INSERT OR UPDATE ON public.heroes
  FOR EACH ROW EXECUTE FUNCTION public.anticheat_guard();

-- ---------- Player side: acknowledge a warning ----------
CREATE OR REPLACE FUNCTION public.anticheat_acknowledge(_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.anticheat_warnings SET acknowledged_at = now()
  WHERE id = _id AND user_id = auth.uid() AND acknowledged_at IS NULL $$;
REVOKE ALL ON FUNCTION public.anticheat_acknowledge(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anticheat_acknowledge(uuid) TO authenticated;

-- ---------- Admin side: undo a false ban (service role / database owner only) ----------
CREATE OR REPLACE FUNCTION public.anticheat_restore(_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.anticheat_quarantine; h public.heroes; nm text; n int := 0;
BEGIN
  SELECT * INTO q FROM public.anticheat_quarantine WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Quarantine entry not found'; END IF;
  IF q.restored_at IS NOT NULL THEN RAISE EXCEPTION 'Already restored'; END IF;
  IF q.backup IS NULL THEN RAISE EXCEPTION 'This entry has no save to restore (a forged new character)'; END IF;
  h := jsonb_populate_record(NULL::public.heroes, q.backup);
  IF EXISTS (SELECT 1 FROM public.heroes WHERE id = h.id) THEN h.id := gen_random_uuid(); END IF;
  nm := h.name;
  WHILE EXISTS (SELECT 1 FROM public.heroes WHERE lower(name) = lower(nm)) LOOP
    n := n + 1; nm := left(h.name, 14) || '_' || n::text;
  END LOOP;
  h.name := nm;
  INSERT INTO public.heroes SELECT h.*;
  -- The insert trigger resets server-owned data; put the original save and arena rating back.
  PERFORM set_config('app.srv', '1', true);
  PERFORM set_config('app.arena', '1', true);
  UPDATE public.heroes SET save = q.backup->'save', arena_rating = h.arena_rating WHERE id = h.id;
  PERFORM set_config('app.srv', '0', true);
  PERFORM set_config('app.arena', '0', true);
  UPDATE public.anticheat_quarantine SET restored_at = now(), restored_hero_id = h.id WHERE id = q.id;
  UPDATE public.anticheat_warnings SET acknowledged_at = coalesce(acknowledged_at, now()) WHERE id = q.warning_id;
  RETURN h.id;
END $$;
REVOKE ALL ON FUNCTION public.anticheat_restore(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.anticheat_restore(uuid) TO service_role;

-- ---------- One-time sweep: remove characters that already hold impossible values ----------
DO $$
DECLARE r public.heroes; reason text; wid uuid;
BEGIN
  FOR r IN SELECT * FROM public.heroes LOOP
    reason := public._ac_static_reason(r.level, public._num(r.save->'paragon'), r.power, r.save);
    IF reason = 'Level does not match the save' THEN reason := NULL; END IF; -- old saves may predate the sync
    IF reason IS NOT NULL THEN
      INSERT INTO public.anticheat_warnings (user_id, hero_id, hero_name, reason)
        VALUES (r.user_id, r.id, r.name, reason) RETURNING id INTO wid;
      INSERT INTO public.anticheat_quarantine (warning_id, hero_id, user_id, hero_name, reason, source, backup, evidence)
        VALUES (wid, r.id, r.user_id, r.name, reason, 'sweep', to_jsonb(r), NULL);
      DELETE FROM public.heroes WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

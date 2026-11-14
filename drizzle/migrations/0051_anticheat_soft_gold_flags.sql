-- Restores now run as a trusted server write, so the insert check no longer swallows the restored hero.
CREATE OR REPLACE FUNCTION public.anticheat_restore(_id uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  PERFORM set_config('app.srv', '1', true);
  PERFORM set_config('app.arena', '1', true);
  INSERT INTO public.heroes SELECT h.*;
  UPDATE public.heroes SET save = q.backup->'save', arena_rating = h.arena_rating, level = h.level, power = h.power WHERE id = h.id;
  PERFORM set_config('app.srv', '0', true);
  PERFORM set_config('app.arena', '0', true);
  IF NOT EXISTS (SELECT 1 FROM public.heroes WHERE id = h.id) THEN RAISE EXCEPTION 'Restore was blocked'; END IF;
  -- Fresh anticheat baseline so the restored hero is not re-flagged by its old window.
  DELETE FROM public.anticheat_state WHERE hero_id = h.id;
  UPDATE public.anticheat_quarantine SET restored_at = now(), restored_hero_id = h.id WHERE id = q.id;
  UPDATE public.anticheat_warnings SET acknowledged_at = coalesce(acknowledged_at, now()) WHERE id = q.warning_id;
  RETURN h.id;
END $function$;

-- Gold income caps were too tight for honest late-game play (mine, blitz, events, auction sales).
CREATE OR REPLACE FUNCTION public._ac_gold_cap(_level numeric, _paragon numeric)
 RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$ SELECT 500000 + 150000 * greatest(0, coalesce(_level, 0)) + 60000 * greatest(0, coalesce(_paragon, 0)) $$;

-- Gold-rate anomalies are now review flags, not bans: the write goes through, the admin sees a flag.
-- Only impossible values (static caps, huge level/Ascension jumps, impossible Battle Rating) still remove a character.
CREATE OR REPLACE FUNCTION public.anticheat_guard()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  reason text; flag text;
  st public.anticheat_state;
  new_par numeric := public._num(NEW.save->'paragon');
  old_par numeric;
  new_gold numeric := public._num(NEW.save->'gold');
  base_gold numeric; base_level numeric; base_par numeric;
  gain numeric := 0; cap numeric; win_start timestamptz; win_gain numeric;
  wid uuid;
BEGIN
  IF public._ac_caller_role() IS DISTINCT FROM 'authenticated'
     OR current_setting('app.srv', true) = '1'
     OR current_setting('app.arena', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
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
      flag := 'Review: gained ' || round(gain)::text || ' gold in a single save';
    ELSIF win_gain > cap * 4 THEN
      flag := 'Review: gained ' || round(win_gain)::text || ' gold within one hour';
      win_start := now(); win_gain := 0;  -- one flag per window, not one per save
    END IF;
    IF flag IS NOT NULL THEN
      -- Logged for the admin page only; already resolved so nothing is removed or shown as a ban.
      INSERT INTO public.anticheat_quarantine (warning_id, hero_id, user_id, hero_name, reason, source, backup, evidence, restored_at, restored_hero_id)
        VALUES (NULL, OLD.id, OLD.user_id, OLD.name, flag, 'flag', to_jsonb(OLD), to_jsonb(NEW), now(), OLD.id);
    END IF;
    INSERT INTO public.anticheat_state AS s (hero_id, peak_gold, peak_level, peak_paragon, window_start, window_gain)
      VALUES (OLD.id, greatest(base_gold, new_gold), greatest(base_level, NEW.level), greatest(base_par, new_par), win_start, win_gain)
      ON CONFLICT (hero_id) DO UPDATE SET peak_gold = EXCLUDED.peak_gold, peak_level = EXCLUDED.peak_level,
        peak_paragon = EXCLUDED.peak_paragon, window_start = EXCLUDED.window_start, window_gain = EXCLUDED.window_gain;
    RETURN NEW;
  END IF;

  INSERT INTO public.anticheat_warnings (user_id, hero_id, hero_name, reason)
    VALUES (OLD.user_id, OLD.id, OLD.name, reason) RETURNING id INTO wid;
  INSERT INTO public.anticheat_quarantine (warning_id, hero_id, user_id, hero_name, reason, source, backup, evidence)
    VALUES (wid, OLD.id, OLD.user_id, OLD.name, reason, 'live', to_jsonb(OLD), to_jsonb(NEW));
  DELETE FROM public.heroes WHERE id = OLD.id;
  RETURN NULL;
END $function$;

-- Put the falsely banned Hellen back: the earlier restore was swallowed by the insert check.
UPDATE public.anticheat_quarantine SET restored_at = now() WHERE id = '340633e4-95dc-4ce4-b41d-768311aaa15c';
UPDATE public.anticheat_quarantine SET restored_at = NULL, restored_hero_id = NULL WHERE id = 'e5e6510d-3e4d-49ac-9e87-ab5332b15b7e';
SELECT public.anticheat_restore('e5e6510d-3e4d-49ac-9e87-ab5332b15b7e');
UPDATE public.anticheat_warnings SET acknowledged_at = coalesce(acknowledged_at, now())
  WHERE id IN (SELECT warning_id FROM public.anticheat_quarantine WHERE id = '340633e4-95dc-4ce4-b41d-768311aaa15c');
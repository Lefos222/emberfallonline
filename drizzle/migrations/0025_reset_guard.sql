-- World-reset guard.
--
-- A reset rewrites every hero save with a fresh `resetAt` stamp. A browser that was
-- already open still holds the pre-reset draft and auto-saves it every few seconds, which
-- would silently undo the reset. This trigger now treats a save whose `resetAt` does not
-- match the stored one as stale: it keeps the stored save (and its level/power/stats
-- columns) until the client reloads the reset save. Server-owned RPC writes set app.srv
-- and bypass the guard, exactly like the existing `srv` protection.

CREATE OR REPLACE FUNCTION public.protect_hero_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  stale boolean;
BEGIN
  IF current_setting('app.arena', true) IS DISTINCT FROM '1' THEN
    NEW.arena_rating := OLD.arena_rating;
  END IF;
  IF current_setting('app.srv', true) IS DISTINCT FROM '1' THEN
    IF jsonb_typeof(NEW.save) <> 'object' THEN NEW.save := OLD.save; END IF;
    stale := (OLD.save ? 'resetAt')
      AND (NEW.save->>'resetAt' IS DISTINCT FROM OLD.save->>'resetAt');
    IF stale THEN
      NEW.save := OLD.save;
      NEW.level := OLD.level;
      NEW.power := OLD.power;
      NEW.stats := OLD.stats;
    END IF;
    NEW.save := jsonb_set(NEW.save, '{srv}', coalesce(OLD.save->'srv', '{}'::jsonb), true);
  END IF;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END $$;

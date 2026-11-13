-- Admin: list newly created characters (time, account email, sign-up IP) and ban/unban accounts by hand.
-- IPs are private and only readable through the admin-checked RPCs below; heroes stay publicly readable.

-- ---------- Where each character was created from ----------
CREATE TABLE IF NOT EXISTS public.hero_origins (
  hero_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_origins_user_idx ON public.hero_origins (user_id);
REVOKE ALL ON public.hero_origins FROM anon, authenticated;
GRANT ALL ON public.hero_origins TO service_role;
ALTER TABLE public.hero_origins ENABLE ROW LEVEL SECURITY;

-- The caller's IP as seen by the API gateway (the browser inserts heroes directly, so these headers are the player's).
CREATE OR REPLACE FUNCTION public._request_ip() RETURNS text
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE h jsonb;
BEGIN
  h := nullif(current_setting('request.headers', true), '')::jsonb;
  IF h IS NULL THEN RETURN NULL; END IF;
  RETURN nullif(coalesce(h->>'cf-connecting-ip', h->>'x-real-ip', trim(split_part(h->>'x-forwarded-for', ',', 1))), '');
EXCEPTION WHEN others THEN RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public._request_ip() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.hero_origin_record() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h jsonb;
BEGIN
  BEGIN h := nullif(current_setting('request.headers', true), '')::jsonb; EXCEPTION WHEN others THEN h := NULL; END;
  INSERT INTO public.hero_origins (hero_id, user_id, hero_name, ip, user_agent)
  VALUES (NEW.id, NEW.user_id, NEW.name, public._request_ip(), left(h->>'user-agent', 300))
  ON CONFLICT (hero_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN others THEN RETURN NEW; -- never block character creation over logging
END $$;
REVOKE ALL ON FUNCTION public.hero_origin_record() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS hero_origin_record ON public.heroes;
CREATE TRIGGER hero_origin_record AFTER INSERT ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.hero_origin_record();

-- ---------- Manual account bans ----------
CREATE TABLE IF NOT EXISTS public.account_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '' CHECK (char_length(reason) <= 300),
  banned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  lifted_at timestamptz,
  lifted_by uuid
);
CREATE UNIQUE INDEX IF NOT EXISTS account_bans_one_active ON public.account_bans (user_id) WHERE lifted_at IS NULL;
REVOKE ALL ON public.account_bans FROM anon, authenticated;
GRANT ALL ON public.account_bans TO service_role;
ALTER TABLE public.account_bans ENABLE ROW LEVEL SECURITY;

-- Is the signed-in caller banned? Only ever answers for the caller.
CREATE OR REPLACE FUNCTION public._am_banned() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.account_bans WHERE user_id = auth.uid() AND lifted_at IS NULL) $$;
REVOKE ALL ON FUNCTION public._am_banned() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public._am_banned() TO authenticated;

CREATE OR REPLACE FUNCTION public.my_ban() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('reason', reason, 'at', created_at)
  FROM public.account_bans WHERE user_id = auth.uid() AND lifted_at IS NULL LIMIT 1 $$;
REVOKE ALL ON FUNCTION public.my_ban() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_ban() TO authenticated;

-- A banned player cannot read, create or change characters, or post in chat.
DROP POLICY IF EXISTS "banned accounts locked out" ON public.heroes;
CREATE POLICY "banned accounts locked out" ON public.heroes AS RESTRICTIVE FOR ALL TO authenticated
  USING (NOT (SELECT public._am_banned())) WITH CHECK (NOT (SELECT public._am_banned()));
DROP POLICY IF EXISTS "banned accounts cannot chat" ON public.chat_messages;
CREATE POLICY "banned accounts cannot chat" ON public.chat_messages AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT (SELECT public._am_banned()));

-- Server RPCs bypass row security, so also refuse any character write a banned caller causes.
CREATE OR REPLACE FUNCTION public.ban_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public._ac_caller_role() = 'authenticated' AND public._am_banned() THEN
    RAISE EXCEPTION 'This account is banned' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.ban_guard() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS ban_guard ON public.heroes;
CREATE TRIGGER ban_guard BEFORE INSERT OR UPDATE ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.ban_guard();

-- ---------- Admin RPCs ----------
-- Last IP the account signed in from (fallback for characters made before origins were recorded).
CREATE OR REPLACE FUNCTION public._admin_last_ip(_user_id uuid) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  EXECUTE 'SELECT host(ip) FROM auth.sessions WHERE user_id = $1 AND ip IS NOT NULL ORDER BY coalesce(refreshed_at, updated_at, created_at) DESC LIMIT 1'
    INTO r USING _user_id;
  RETURN r;
EXCEPTION WHEN others THEN RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public._admin_last_ip(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_players(_limit int DEFAULT 200) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN jsonb_build_object(
    'characters', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', h.id, 'name', h.name, 'cls', h.hero_class, 'gender', h.gender, 'level', h.level,
        'created', h.created_at, 'last_played', h.last_played, 'user_id', h.user_id, 'email', u.email,
        'ip', o.ip, 'last_ip', public._admin_last_ip(h.user_id),
        'banned', b.id IS NOT NULL, 'ban_reason', b.reason, 'is_admin', public.has_role(h.user_id, 'admin'))
      ORDER BY h.created_at DESC)
      FROM (SELECT * FROM public.heroes ORDER BY created_at DESC LIMIT greatest(1, least(coalesce(_limit, 200), 1000))) h
      LEFT JOIN auth.users u ON u.id = h.user_id
      LEFT JOIN public.hero_origins o ON o.hero_id = h.id
      LEFT JOIN public.account_bans b ON b.user_id = h.user_id AND b.lifted_at IS NULL), '[]'::jsonb),
    'bans', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', b.id, 'user_id', b.user_id, 'email', u.email, 'reason', b.reason, 'at', b.created_at, 'lifted', b.lifted_at,
        'heroes', (SELECT coalesce(string_agg(name, ', '), '') FROM public.heroes WHERE user_id = b.user_id))
      ORDER BY b.created_at DESC)
      FROM (SELECT * FROM public.account_bans ORDER BY created_at DESC LIMIT 200) b
      LEFT JOIN auth.users u ON u.id = b.user_id), '[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.admin_players(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_players(int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_ban_user(_user_id uuid, _reason text DEFAULT '') RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF _user_id = auth.uid() OR public.has_role(_user_id, 'admin') THEN RAISE EXCEPTION 'Admins cannot be banned'; END IF;
  INSERT INTO public.account_bans (user_id, reason, banned_by)
  VALUES (_user_id, left(coalesce(trim(_reason), ''), 300), auth.uid())
  ON CONFLICT (user_id) WHERE lifted_at IS NULL DO UPDATE SET reason = EXCLUDED.reason;
END $$;
REVOKE ALL ON FUNCTION public.admin_ban_user(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_unban_user(_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.account_bans SET lifted_at = now(), lifted_by = auth.uid() WHERE user_id = _user_id AND lifted_at IS NULL;
END $$;
REVOKE ALL ON FUNCTION public.admin_unban_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_unban_user(uuid) TO authenticated;

-- Undo an anticheat removal from the admin page (wraps the service-role-only anticheat_restore).
CREATE OR REPLACE FUNCTION public.admin_restore_quarantine(_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN public.anticheat_restore(_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_restore_quarantine(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_restore_quarantine(uuid) TO authenticated;

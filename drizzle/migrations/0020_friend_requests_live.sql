CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_hero uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  to_hero uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_hero, to_hero),
  CHECK (from_hero <> to_hero)
);
CREATE INDEX IF NOT EXISTS friend_requests_to_idx ON public.friend_requests (to_hero, created_at DESC);
GRANT SELECT ON public.friend_requests TO authenticated;
GRANT ALL ON public.friend_requests TO service_role;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own friend requests" ON public.friend_requests;
CREATE POLICY "read own friend requests" ON public.friend_requests FOR SELECT TO authenticated
  USING (from_hero IN (SELECT public.my_hero_ids()) OR to_hero IN (SELECT public.my_hero_ids()));
ALTER TABLE public.friend_requests REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

CREATE OR REPLACE FUNCTION public.respond_friend_request(_hero uuid, _request uuid, _accept boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.friend_requests;
BEGIN
  PERFORM public._my_hero(_hero);
  SELECT * INTO r FROM public.friend_requests WHERE id = _request AND to_hero = _hero;
  IF r.id IS NULL THEN RAISE EXCEPTION 'That request is no longer open'; END IF;
  IF coalesce(_accept, false) THEN
    INSERT INTO public.friendships (owner_hero, friend_hero)
      SELECT _hero, r.from_hero
      WHERE NOT EXISTS (SELECT 1 FROM public.friendships WHERE owner_hero = _hero AND friend_hero = r.from_hero);
    INSERT INTO public.friendships (owner_hero, friend_hero)
      SELECT r.from_hero, _hero
      WHERE NOT EXISTS (SELECT 1 FROM public.friendships WHERE owner_hero = r.from_hero AND friend_hero = _hero);
  END IF;
  DELETE FROM public.friend_requests WHERE id = _request;
  DELETE FROM public.friend_requests WHERE from_hero = _hero AND to_hero = r.from_hero;
END $$;

CREATE OR REPLACE FUNCTION public.request_friend(_hero uuid, _name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; target public.heroes; rid uuid; incoming uuid; waiting int;
BEGIN
  me := public._my_hero(_hero);
  SELECT * INTO target FROM public.heroes
    WHERE lower(btrim(name)) = lower(btrim(coalesce(_name, ''))) AND is_public
    ORDER BY level DESC LIMIT 1;
  IF target.id IS NULL THEN RAISE EXCEPTION 'No hero has that name'; END IF;
  IF target.id = _hero THEN RAISE EXCEPTION 'You cannot add yourself'; END IF;
  IF EXISTS (SELECT 1 FROM public.friendships WHERE owner_hero = _hero AND friend_hero = target.id) THEN
    RAISE EXCEPTION 'You are already friends';
  END IF;
  SELECT id INTO incoming FROM public.friend_requests WHERE from_hero = target.id AND to_hero = _hero;
  IF incoming IS NOT NULL THEN
    PERFORM public.respond_friend_request(_hero, incoming, true);
    RETURN NULL;
  END IF;
  SELECT count(*) INTO waiting FROM public.friend_requests WHERE from_hero = _hero;
  IF waiting >= 30 THEN RAISE EXCEPTION 'You have too many open friend requests - withdraw some first'; END IF;
  INSERT INTO public.friend_requests (from_hero, to_hero) VALUES (_hero, target.id)
    ON CONFLICT (from_hero, to_hero) DO UPDATE SET created_at = now()
    RETURNING id INTO rid;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.list_friend_requests(_hero uuid) RETURNS TABLE (
  id uuid, hero_id uuid, name text, hero_class text, gender text, level integer, power integer, created_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  RETURN QUERY SELECT r.id, h.id, h.name, h.hero_class, h.gender, h.level, h.power, r.created_at
    FROM public.friend_requests r JOIN public.heroes h ON h.id = r.from_hero
    WHERE r.to_hero = _hero ORDER BY r.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.list_sent_requests(_hero uuid) RETURNS TABLE (
  id uuid, hero_id uuid, name text, hero_class text, gender text, level integer, power integer, created_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  RETURN QUERY SELECT r.id, h.id, h.name, h.hero_class, h.gender, h.level, h.power, r.created_at
    FROM public.friend_requests r JOIN public.heroes h ON h.id = r.to_hero
    WHERE r.from_hero = _hero ORDER BY r.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_friend_request(_hero uuid, _request uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  DELETE FROM public.friend_requests WHERE id = _request AND from_hero = _hero;
END $$;

CREATE OR REPLACE FUNCTION public.search_heroes(_hero uuid, _q text) RETURNS TABLE (
  id uuid, name text, hero_class text, gender text, level integer, power integer,
  last_played timestamptz, relation text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q text := lower(btrim(coalesce(_q, '')));
BEGIN
  PERFORM public._my_hero(_hero);
  IF char_length(q) < 2 THEN RETURN; END IF;
  RETURN QUERY SELECT h.id, h.name, h.hero_class, h.gender, h.level, h.power, h.last_played,
      CASE
        WHEN EXISTS (SELECT 1 FROM public.friendships f WHERE f.owner_hero = _hero AND f.friend_hero = h.id) THEN 'friend'
        WHEN EXISTS (SELECT 1 FROM public.friend_requests r WHERE r.from_hero = _hero AND r.to_hero = h.id) THEN 'sent'
        WHEN EXISTS (SELECT 1 FROM public.friend_requests r WHERE r.from_hero = h.id AND r.to_hero = _hero) THEN 'incoming'
        ELSE 'none'
      END
    FROM public.heroes h
    WHERE h.is_public AND h.id <> _hero AND lower(h.name) LIKE '%' || q || '%'
    ORDER BY (lower(h.name) = q) DESC, h.last_played DESC, h.name LIMIT 20;
END $$;

-- Removing a friend ends the friendship for both heroes.
CREATE OR REPLACE FUNCTION public.remove_friend(_hero uuid, _friend uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  DELETE FROM public.friendships WHERE (owner_hero = _hero AND friend_hero = _friend)
    OR (owner_hero = _friend AND friend_hero = _hero);
END $$;

REVOKE ALL ON FUNCTION public.request_friend(uuid, text) FROM public, anon;
REVOKE ALL ON FUNCTION public.list_friend_requests(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) FROM public, anon;
REVOKE ALL ON FUNCTION public.list_sent_requests(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.cancel_friend_request(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.search_heroes(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_friend(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_friend_requests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_sent_requests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_friend_request(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_heroes(uuid, text) TO authenticated;
-- Direct friend adds bypassed consent; requests replace them.
REVOKE EXECUTE ON FUNCTION public.add_friend(uuid, text) FROM authenticated;
NOTIFY pgrst, 'reload schema';
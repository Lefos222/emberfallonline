-- Friend requests, so a friendship needs the other hero's consent.
-- Applies to the live project's database: run this file there (the app's own
-- migrations are the record of what the database should contain).

CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_hero uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  to_hero uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_hero, to_hero),
  CHECK (from_hero <> to_hero)
);
CREATE INDEX IF NOT EXISTS friend_requests_to_idx ON public.friend_requests (to_hero, created_at DESC);

-- Reads and writes go through the RPCs below, like the rest of the social tables.
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.request_friend(_hero uuid, _name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; target public.heroes; rid uuid; incoming uuid;
BEGIN
  me := public._my_hero(_hero);
  SELECT * INTO target FROM public.heroes
    WHERE lower(btrim(name)) = lower(btrim(coalesce(_name, ''))) AND is_public
    ORDER BY level DESC LIMIT 1;
  IF target.id IS NULL THEN RAISE EXCEPTION 'No sharing hero has that name'; END IF;
  IF target.id = _hero THEN RAISE EXCEPTION 'You cannot add yourself'; END IF;
  IF EXISTS (SELECT 1 FROM public.friendships WHERE owner_hero = _hero AND friend_hero = target.id) THEN
    RAISE EXCEPTION 'You are already friends';
  END IF;
  SELECT id INTO incoming FROM public.friend_requests WHERE from_hero = target.id AND to_hero = _hero;
  IF incoming IS NOT NULL THEN
    -- They asked first: an answer here is the acceptance.
    PERFORM public.respond_friend_request(_hero, incoming, true);
    RETURN NULL;
  END IF;
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
  RETURN QUERY
    SELECT r.id, h.id, h.name, h.hero_class, h.gender, h.level, h.power, r.created_at
      FROM public.friend_requests r JOIN public.heroes h ON h.id = r.from_hero
      WHERE r.to_hero = _hero
      ORDER BY r.created_at DESC;
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
END $$;

REVOKE ALL ON FUNCTION public.request_friend(uuid, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_friend_requests(uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_friend(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_friend_requests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) TO authenticated;

NOTIFY pgrst, 'reload schema';

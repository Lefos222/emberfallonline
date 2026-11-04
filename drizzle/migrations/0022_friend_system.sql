-- Friend system renovation: hero search, outgoing requests you can withdraw and a
-- spam cap on pending requests.
-- Applies to the live project's database: run this file there (the app's own
-- migrations are the record of what the database should contain).
--
-- Depends on the tables and functions from 0017_friend_requests.sql
-- (public.friend_requests, public.friendships, public._my_hero).

-- Every hero whose public name contains the query, already marked with how it relates
-- to the asking character, so the panel needs one round trip instead of three.
CREATE OR REPLACE FUNCTION public.search_heroes(_hero uuid, _q text) RETURNS TABLE (
  id uuid, name text, hero_class text, gender text, level integer, power integer,
  last_played timestamptz, relation text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q text := lower(btrim(coalesce(_q, '')));
BEGIN
  PERFORM public._my_hero(_hero);
  IF char_length(q) < 2 THEN RETURN; END IF;
  RETURN QUERY
    SELECT h.id, h.name, h.hero_class, h.gender, h.level, h.power, h.last_played,
      CASE
        WHEN EXISTS (SELECT 1 FROM public.friendships f WHERE f.owner_hero = _hero AND f.friend_hero = h.id) THEN 'friend'
        WHEN EXISTS (SELECT 1 FROM public.friend_requests r WHERE r.from_hero = _hero AND r.to_hero = h.id) THEN 'sent'
        WHEN EXISTS (SELECT 1 FROM public.friend_requests r WHERE r.from_hero = h.id AND r.to_hero = _hero) THEN 'incoming'
        ELSE 'none'
      END
      FROM public.heroes h
      WHERE h.is_public AND h.id <> _hero AND lower(h.name) LIKE '%' || q || '%'
      ORDER BY (lower(h.name) = q) DESC, h.last_played DESC, h.name
      LIMIT 20;
END $$;

-- Requests this hero is still waiting on, so they can be withdrawn or simply seen.
CREATE OR REPLACE FUNCTION public.list_sent_requests(_hero uuid) RETURNS TABLE (
  id uuid, hero_id uuid, name text, hero_class text, gender text, level integer, power integer, created_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  RETURN QUERY
    SELECT r.id, h.id, h.name, h.hero_class, h.gender, h.level, h.power, r.created_at
      FROM public.friend_requests r JOIN public.heroes h ON h.id = r.to_hero
      WHERE r.from_hero = _hero
      ORDER BY r.created_at DESC;
END $$;

-- Only the sender can withdraw a request; the receiver answers it instead.
CREATE OR REPLACE FUNCTION public.cancel_friend_request(_hero uuid, _request uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._my_hero(_hero);
  DELETE FROM public.friend_requests WHERE id = _request AND from_hero = _hero;
END $$;

-- Same contract as 0017, plus a cap so one hero cannot flood the request table.
CREATE OR REPLACE FUNCTION public.request_friend(_hero uuid, _name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; target public.heroes; rid uuid; incoming uuid; waiting int;
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
  SELECT count(*) INTO waiting FROM public.friend_requests WHERE from_hero = _hero;
  IF waiting >= 30 THEN
    RAISE EXCEPTION 'You have too many open friend requests - withdraw some first';
  END IF;
  INSERT INTO public.friend_requests (from_hero, to_hero) VALUES (_hero, target.id)
    ON CONFLICT (from_hero, to_hero) DO UPDATE SET created_at = now()
    RETURNING id INTO rid;
  RETURN rid;
END $$;

-- Accepting closes the conversation in both directions, so no stale counter-request survives.
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

REVOKE ALL ON FUNCTION public.search_heroes(uuid, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_sent_requests(uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_friend_request(uuid, uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_friend(uuid, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_heroes(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_sent_requests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_friend_request(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_friend(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid, uuid, boolean) TO authenticated;

NOTIFY pgrst, 'reload schema';

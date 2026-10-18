CREATE TABLE public.heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  hero_class text NOT NULL CHECK (hero_class IN ('warrior','mage','archer')),
  gender text NOT NULL DEFAULT 'male' CHECK (gender IN ('male','female')),
  level int NOT NULL DEFAULT 1,
  power int NOT NULL DEFAULT 0,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  save jsonb NOT NULL DEFAULT '{}'::jsonb,
  arena_rating int NOT NULL DEFAULT 1000,
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 200),
  title text NOT NULL DEFAULT '',
  frame text NOT NULL DEFAULT 'iron',
  is_public boolean NOT NULL DEFAULT true,
  last_played timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hero_name_len CHECK (char_length(name) BETWEEN 3 AND 18 AND name ~ '^[A-Za-z0-9 _-]+$')
);
CREATE UNIQUE INDEX heroes_name_unique ON public.heroes (lower(name));
CREATE INDEX heroes_user_idx ON public.heroes (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.heroes TO authenticated;
GRANT ALL ON public.heroes TO service_role;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heroes readable by players" ON public.heroes FOR SELECT TO authenticated USING (is_public OR auth.uid() = user_id);
CREATE POLICY "insert own hero" ON public.heroes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND (SELECT count(*) FROM public.heroes h WHERE h.user_id = auth.uid()) < 4);
CREATE POLICY "update own hero" ON public.heroes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own hero" ON public.heroes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_hero_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('app.arena', true) IS DISTINCT FROM '1' THEN
    NEW.arena_rating := OLD.arena_rating;
  END IF;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END $$;
CREATE TRIGGER heroes_protect BEFORE UPDATE ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.protect_hero_fields();

CREATE TABLE public.arena_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id uuid NOT NULL,
  defender_id uuid NOT NULL,
  attacker_name text NOT NULL,
  defender_name text NOT NULL,
  attacker_won boolean NOT NULL,
  rating_change int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.arena_matches TO authenticated;
GRANT ALL ON public.arena_matches TO service_role;
ALTER TABLE public.arena_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see own matches" ON public.arena_matches FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.heroes h WHERE h.user_id = auth.uid() AND h.id IN (attacker_id, defender_id)));

CREATE OR REPLACE FUNCTION public.record_arena_result(_attacker uuid, _defender uuid, _won boolean)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.heroes; d public.heroes; delta int;
BEGIN
  SELECT * INTO a FROM public.heroes WHERE id = _attacker AND user_id = auth.uid();
  SELECT * INTO d FROM public.heroes WHERE id = _defender;
  IF a.id IS NULL OR d.id IS NULL OR a.user_id = d.user_id THEN RAISE EXCEPTION 'invalid match'; END IF;
  PERFORM set_config('app.arena', '1', true);
  delta := greatest(5, least(40, 20 + (d.arena_rating - a.arena_rating) / 25));
  IF _won THEN
    UPDATE public.heroes SET arena_rating = arena_rating + delta WHERE id = a.id;
    UPDATE public.heroes SET arena_rating = greatest(0, arena_rating - delta) WHERE id = d.id;
  ELSE
    UPDATE public.heroes SET arena_rating = greatest(0, arena_rating - 15) WHERE id = a.id;
    UPDATE public.heroes SET arena_rating = arena_rating + 10 WHERE id = d.id;
  END IF;
  INSERT INTO public.arena_matches(attacker_id, defender_id, attacker_name, defender_name, attacker_won, rating_change)
  VALUES (a.id, d.id, a.name, d.name, _won, CASE WHEN _won THEN delta ELSE -15 END);
  RETURN CASE WHEN _won THEN delta ELSE -15 END;
END $$;
REVOKE ALL ON FUNCTION public.record_arena_result(uuid, uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_arena_result(uuid, uuid, boolean) TO authenticated;
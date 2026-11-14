-- Fix "infinite recursion detected in policy for relation \"heroes\"" when a player creates a
-- second character.
--
-- A row-security policy on a table may not read that same table: PostgreSQL re-applies the table's
-- own policies to the subquery inside the policy, meets the same policy again and stops with the
-- recursion error. The hero limit (four per account) was written as a `SELECT count(*) FROM
-- heroes` inside the INSERT policy exactly that way.
--
-- The count now comes from a SECURITY DEFINER function, which reads heroes outside row security and
-- therefore never re-enters the policy. Every heroes policy is rebuilt from this known, recursion-free
-- set in one place, so an older policy on the live database cannot keep the error alive.

CREATE OR REPLACE FUNCTION public.my_hero_count() RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.heroes WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_hero_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_hero_count() TO authenticated;

-- Rebuild the policies on heroes: drop whatever is there, then create the canonical set.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'heroes' LOOP
    EXECUTE format('DROP POLICY %I ON public.heroes', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "heroes readable by players" ON public.heroes FOR SELECT TO authenticated
  USING (is_public OR auth.uid() = user_id);
CREATE POLICY "insert own hero" ON public.heroes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.my_hero_count() < 4);
CREATE POLICY "update own hero" ON public.heroes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own hero" ON public.heroes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- A banned account stays locked out (the ban check is a definer function, so it cannot recurse).
DO $$
BEGIN
  IF to_regprocedure('public._am_banned()') IS NOT NULL THEN
    EXECUTE $policy$
      CREATE POLICY "banned accounts locked out" ON public.heroes AS RESTRICTIVE FOR ALL TO authenticated
        USING (NOT (SELECT public._am_banned())) WITH CHECK (NOT (SELECT public._am_banned()))
    $policy$;
  END IF;
END $$;

ALTER TABLE public._ef_probe ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._ef_probe FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.my_guild_ids() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT gm.guild_id FROM public.guild_members gm JOIN public.heroes h ON h.id = gm.hero_id WHERE h.user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_guild_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_guild_ids() TO authenticated;

DROP POLICY IF EXISTS "rosters are public to players" ON public.guild_members;
CREATE POLICY "members see own guild and public heroes" ON public.guild_members FOR SELECT TO authenticated
USING (
  guild_id IN (SELECT public.my_guild_ids())
  OR EXISTS (SELECT 1 FROM public.heroes h WHERE h.id = guild_members.hero_id AND (h.is_public OR h.user_id = auth.uid()))
);
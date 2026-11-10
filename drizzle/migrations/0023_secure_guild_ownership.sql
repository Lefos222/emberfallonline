CREATE OR REPLACE FUNCTION public._guild_role(_hero uuid) RETURNS public.guild_members
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.guild_members;
BEGIN
  PERFORM public._my_hero(_hero);
  SELECT * INTO r FROM public.guild_members WHERE hero_id = _hero;
  IF r.hero_id IS NULL THEN RAISE EXCEPTION 'You are not in a guild'; END IF;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public._settle_guild_war(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._settle_guild_war(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.guild_war_start(uuid,uuid,integer), public.guild_war_respond(uuid,uuid,boolean), public.guild_war_cancel(uuid,uuid), public.guild_war_state(uuid), public.guild_war_attack(uuid,uuid,uuid,boolean), public.guild_war_claim(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guild_war_start(uuid,uuid,integer), public.guild_war_respond(uuid,uuid,boolean), public.guild_war_cancel(uuid,uuid), public.guild_war_state(uuid), public.guild_war_attack(uuid,uuid,uuid,boolean), public.guild_war_claim(uuid,uuid) TO authenticated, service_role;
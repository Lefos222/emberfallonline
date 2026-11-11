CREATE FUNCTION public.buy_friendship_rose(_hero uuid,_req uuid) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT public.friendship_rose(_hero,NULL,_req); $$;
REVOKE ALL ON FUNCTION public.buy_friendship_rose(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.buy_friendship_rose(uuid,uuid) TO authenticated;
COMMENT ON FUNCTION public.enrich_activity_rewards() IS 'DEPRECATED: never attached; replaced by reward_claim_enrichment and merge_reward_enrichment for atomic writes.';
REVOKE EXECUTE ON FUNCTION public.guild_bank_donate(uuid,integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.guild_buff_activate(uuid,text) FROM authenticated;
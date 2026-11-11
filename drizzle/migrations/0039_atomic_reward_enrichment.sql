DROP TRIGGER activity_reward_enrichment ON public.activity_claims;
DROP TRIGGER login_reward_enrichment ON public.login_days;
DROP TRIGGER world_reward_enrichment ON public.world_raid_claims;
DROP TRIGGER guild_dice_reward_enrichment ON public.guild_dice;
CREATE OR REPLACE FUNCTION public.reward_claim_enrichment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM set_config('app.reward_extra',jsonb_build_object('hero',NEW.hero_id,'weekly',CASE WHEN TG_TABLE_NAME='activity_claims' THEN coalesce(to_jsonb(NEW)->>'period','') LIKE 'w:%' ELSE false END,'rose',random()<0.2)::text,true);
 RETURN NEW;
END $$;
CREATE FUNCTION public.merge_reward_enrichment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE x jsonb; v integer; bonus integer; mats jsonb;
BEGIN
 x:=nullif(current_setting('app.reward_extra',true),'')::jsonb;
 IF current_setting('app.srv',true)='1' AND x->>'hero'=NEW.id::text THEN
  PERFORM set_config('app.reward_extra','',true);
  v:=CASE WHEN nullif(NEW.save->'srv'->'premium'->'vip'->>'until','')::timestamptz>now() THEN public._num(NEW.save->'srv'->'premium'->'vip'->'level')::int ELSE 0 END;
  bonus:=round((CASE WHEN (x->>'weekly')::boolean THEN 400 ELSE 100 END)*(1+NEW.level*0.1)*(1+v*0.1));
  mats:=CASE WHEN (x->>'weekly')::boolean THEN jsonb_build_object('hide',8,'bloom',6,'crystal',4) ELSE jsonb_build_object('hide',3,'bloom',2) END;
  NEW.save:=public._apply_reward(NEW.save,jsonb_build_object('gold',bonus,'mats',mats));
  IF (x->>'rose')::boolean THEN NEW.save:=jsonb_set(NEW.save,'{srv,friendship}',coalesce(NEW.save->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('roses',public._num(NEW.save->'srv'->'friendship'->'roses')+1),true); END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.merge_reward_enrichment() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER zz_reward_enrichment BEFORE UPDATE OF save ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.merge_reward_enrichment();
CREATE TRIGGER activity_reward_enrichment AFTER INSERT ON public.activity_claims FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER login_reward_enrichment AFTER INSERT ON public.login_days FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER world_reward_enrichment AFTER INSERT ON public.world_raid_claims FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER guild_dice_reward_enrichment AFTER INSERT ON public.guild_dice FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE FUNCTION public.refresh_reward_save(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes;
BEGIN h:=public._my_hero(_hero); RETURN h.save; END $$;
REVOKE ALL ON FUNCTION public.refresh_reward_save(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.refresh_reward_save(uuid) TO authenticated;
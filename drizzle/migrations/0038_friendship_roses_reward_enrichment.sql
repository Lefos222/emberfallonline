CREATE TABLE public.friendship_rose_transactions (request_id uuid PRIMARY KEY, hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, friend_id uuid REFERENCES public.heroes(id) ON DELETE SET NULL, kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.friendship_rose_transactions TO authenticated;
GRANT ALL ON public.friendship_rose_transactions TO service_role;
ALTER TABLE public.friendship_rose_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rose_owner_read ON public.friendship_rose_transactions FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));
CREATE FUNCTION public.friendship_rose(_hero uuid,_friend uuid,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; f public.heroes; s jsonb; fs jsonb; n numeric; cost numeric; prior public.friendship_rose_transactions;
BEGIN
 IF _req IS NULL THEN RAISE EXCEPTION 'Request required'; END IF;
 PERFORM 1 FROM public.heroes WHERE id IN (_hero,_friend) ORDER BY id FOR UPDATE;
 h:=public._my_hero(_hero);
 SELECT * INTO prior FROM public.friendship_rose_transactions WHERE request_id=_req;
 IF FOUND THEN IF prior.hero_id<>_hero OR prior.friend_id IS DISTINCT FROM _friend THEN RAISE EXCEPTION 'Request already used'; END IF; RETURN jsonb_build_object('save',h.save,'repeat',true); END IF;
 s:=h.save; n:=public._num(s->'srv'->'friendship'->'roses');
 IF _friend IS NULL THEN
  cost:=round(1000*(1+greatest(0,h.level-1)*0.02));
  IF public._num(s->'gold')<cost THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  s:=jsonb_set(s,'{gold}',to_jsonb(public._num(s->'gold')-cost),true); n:=n+1;
 ELSE
  IF _hero=_friend OR NOT EXISTS(SELECT 1 FROM public.friendships WHERE owner_hero=_hero AND friend_hero=_friend) OR NOT EXISTS(SELECT 1 FROM public.friendships WHERE owner_hero=_friend AND friend_hero=_hero) THEN RAISE EXCEPTION 'Choose an accepted friend'; END IF;
  IF n<1 THEN RAISE EXCEPTION 'No roses owned'; END IF;
  SELECT * INTO f FROM public.heroes WHERE id=_friend;
  IF f.user_id=h.user_id THEN RAISE EXCEPTION 'Choose another player'; END IF;
  n:=n-1;
  s:=jsonb_set(s,'{srv,friendship}',coalesce(s->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('points',public._num(s->'srv'->'friendship'->'points')+1),true);
  fs:=jsonb_set(f.save,'{srv,friendship}',coalesce(f.save->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('points',public._num(f.save->'srv'->'friendship'->'points')+1),true);
  PERFORM public._write_save(_friend,fs);
 END IF;
 s:=jsonb_set(s,'{srv,friendship}',coalesce(s->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('roses',n),true);
 INSERT INTO public.friendship_rose_transactions(request_id,hero_id,friend_id,kind) VALUES(_req,_hero,_friend,CASE WHEN _friend IS NULL THEN 'buy' ELSE 'send' END);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'repeat',false);
END $$;
REVOKE ALL ON FUNCTION public.friendship_rose(uuid,uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.friendship_rose(uuid,uuid,uuid) TO authenticated;
CREATE FUNCTION public.enrich_activity_rewards() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; s jsonb; mats jsonb; vip integer; bonus integer; rose boolean;
BEGIN
 SELECT * INTO h FROM public.heroes WHERE id=NEW.hero_id FOR UPDATE;
 vip:=CASE WHEN nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz>now() THEN public._num(h.save->'srv'->'premium'->'vip'->'level')::int ELSE 0 END;
 mats:=CASE WHEN TG_TABLE_NAME='activity_claims' AND NEW.period LIKE 'w:%' THEN jsonb_build_object('hide',8,'bloom',6,'crystal',4) ELSE jsonb_build_object('hide',3,'bloom',2) END;
 bonus:=round((CASE WHEN TG_TABLE_NAME='activity_claims' AND NEW.period LIKE 'w:%' THEN 400 ELSE 100 END)*(1+h.level*0.1)*(1+vip*0.1));
 rose:=random()<0.2;
 s:=public._apply_reward(h.save,jsonb_build_object('gold',bonus,'mats',mats));
 IF rose THEN s:=jsonb_set(s,'{srv,friendship}',coalesce(s->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('roses',public._num(s->'srv'->'friendship'->'roses')+1),true); END IF;
 NEW.save:=s;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enrich_activity_rewards() FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.guild_bank IS 'DEPRECATED: playable bank removed; balances retained for preservation.';
CREATE FUNCTION public.reward_claim_enrichment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; s jsonb; mats jsonb; bonus integer; v integer; is_week boolean;
BEGIN
 SELECT * INTO h FROM public.heroes WHERE id=NEW.hero_id FOR UPDATE;
 is_week:=CASE WHEN TG_TABLE_NAME='activity_claims' THEN to_jsonb(NEW)->>'period' LIKE 'w:%' ELSE false END;
 v:=CASE WHEN nullif(h.save->'srv'->'premium'->'vip'->>'until','')::timestamptz>now() THEN public._num(h.save->'srv'->'premium'->'vip'->'level')::int ELSE 0 END;
 mats:=CASE WHEN is_week THEN jsonb_build_object('hide',8,'bloom',6,'crystal',4) ELSE jsonb_build_object('hide',3,'bloom',2) END;
 bonus:=round((CASE WHEN is_week THEN 400 ELSE 100 END)*(1+h.level*0.1)*(1+v*0.1));
 s:=public._apply_reward(h.save,jsonb_build_object('gold',bonus,'mats',mats));
 IF random()<0.2 THEN s:=jsonb_set(s,'{srv,friendship}',coalesce(s->'srv'->'friendship','{}'::jsonb)||jsonb_build_object('roses',public._num(s->'srv'->'friendship'->'roses')+1),true); END IF;
 PERFORM public._write_save(NEW.hero_id,s);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.reward_claim_enrichment() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER activity_reward_enrichment AFTER INSERT ON public.activity_claims FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER login_reward_enrichment AFTER INSERT ON public.login_days FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER world_reward_enrichment AFTER INSERT ON public.world_raid_claims FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
CREATE TRIGGER guild_dice_reward_enrichment AFTER INSERT ON public.guild_dice FOR EACH ROW EXECUTE FUNCTION public.reward_claim_enrichment();
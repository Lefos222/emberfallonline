CREATE INDEX IF NOT EXISTS auction_open_page ON public.auction_listings(created_at DESC,id DESC) WHERE status='open';
CREATE INDEX IF NOT EXISTS auction_seller_history ON public.auction_listings(seller_hero,created_at DESC);
CREATE INDEX IF NOT EXISTS auction_buyer_history ON public.auction_listings(buyer_hero,created_at DESC);
CREATE INDEX IF NOT EXISTS auction_resource_filter ON public.auction_listings(resource text_pattern_ops);
CREATE OR REPLACE FUNCTION public.auction_list(_hero uuid,_resource text,_qty int,_price int,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; s jsonb; resources jsonb; old public.purchases;
BEGIN
 h:=public._my_hero(_hero);
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM 'auction-list:'||_resource THEN RAISE EXCEPTION 'Request belongs to another operation'; END IF;
  RETURN jsonb_build_object('save',h.save);
 END IF;
 IF _resource IS NULL OR _resource !~ '^(mining|herbalism|logging|fishing|archaeology|treasure):[0-4]:[0-3]$' THEN RAISE EXCEPTION 'Unknown resource'; END IF;
 IF _qty IS NULL OR _qty NOT BETWEEN 1 AND 999 OR _price IS NULL OR _price NOT BETWEEN 1 AND 100000000 THEN RAISE EXCEPTION 'Invalid quantity or price'; END IF;
 resources:=coalesce(h.save->'srv'->'gathering'->'resources','{}'::jsonb);
 IF public._num(resources->_resource)<_qty THEN RAISE EXCEPTION 'Not enough supplies'; END IF;
 s:=jsonb_set(h.save,'{srv,gathering,resources}',resources||jsonb_build_object(_resource,public._num(resources->_resource)-_qty),true);
 INSERT INTO public.auction_listings(seller_hero,seller_name,resource,quantity,price) VALUES(_hero,h.name,_resource,_qty,_price);
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,'auction-list:'||_resource,_price);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
CREATE OR REPLACE FUNCTION public.auction_buy(_hero uuid,_listing uuid,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; seller public.heroes; l public.auction_listings; s jsonb; ss jsonb; resources jsonb; old public.purchases; seller_id uuid;
BEGIN
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT seller_hero INTO seller_id FROM public.auction_listings WHERE id=_listing;
 PERFORM 1 FROM public.heroes WHERE id IN(_hero,seller_id) ORDER BY id FOR UPDATE;
 h:=public._my_hero(_hero);
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM 'auction-buy:'||_listing THEN RAISE EXCEPTION 'Request belongs to another operation'; END IF;
  RETURN jsonb_build_object('save',h.save);
 END IF;
 SELECT * INTO l FROM public.auction_listings WHERE id=_listing FOR UPDATE;
 IF NOT FOUND OR l.status<>'open' THEN RAISE EXCEPTION 'Listing is no longer available'; END IF;
 IF l.seller_hero=_hero THEN RAISE EXCEPTION 'You cannot buy your own listing'; END IF;
 IF public._num(h.save->'gold')<l.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
 s:=jsonb_set(h.save,'{gold}',to_jsonb(public._num(h.save->'gold')-l.price),true);
 IF jsonb_typeof(s->'srv'->'gathering') IS DISTINCT FROM 'object' THEN s:=jsonb_set(s,'{srv,gathering}','{}'::jsonb,true); END IF;
 resources:=coalesce(s->'srv'->'gathering'->'resources','{}'::jsonb);
 s:=jsonb_set(s,'{srv,gathering,resources}',resources||jsonb_build_object(l.resource,public._num(resources->l.resource)+l.quantity),true);
 SELECT * INTO seller FROM public.heroes WHERE id=l.seller_hero;
 ss:=seller.save;
 IF jsonb_typeof(ss->'srv') IS DISTINCT FROM 'object' THEN ss:=jsonb_set(ss,'{srv}','{}'::jsonb,true); END IF;
 ss:=jsonb_set(ss,'{srv,auctionProceeds}',to_jsonb(public._num(ss->'srv'->'auctionProceeds')+l.price),true);
 PERFORM public._write_save(l.seller_hero,ss);
 UPDATE public.auction_listings SET status='sold',buyer_hero=_hero,closed_at=now() WHERE id=_listing;
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,'auction-buy:'||_listing,l.price);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
CREATE OR REPLACE FUNCTION public.auction_cancel(_hero uuid,_listing uuid,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; l public.auction_listings; resources jsonb; s jsonb; old public.purchases;
BEGIN
 h:=public._my_hero(_hero);
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM 'auction-cancel:'||_listing THEN RAISE EXCEPTION 'Request belongs to another operation'; END IF;
  RETURN jsonb_build_object('save',h.save);
 END IF;
 SELECT * INTO l FROM public.auction_listings WHERE id=_listing FOR UPDATE;
 IF NOT FOUND OR l.seller_hero<>_hero OR l.status<>'open' THEN RAISE EXCEPTION 'Listing cannot be cancelled'; END IF;
 resources:=coalesce(h.save->'srv'->'gathering'->'resources','{}'::jsonb);
 s:=jsonb_set(h.save,'{srv,gathering,resources}',resources||jsonb_build_object(l.resource,public._num(resources->l.resource)+l.quantity),true);
 UPDATE public.auction_listings SET status='cancelled',closed_at=now() WHERE id=_listing;
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,'auction-cancel:'||_listing,0);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
CREATE FUNCTION public.claim_auction_proceeds(_hero uuid,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; s jsonb; n bigint; old public.purchases;
BEGIN
 h:=public._my_hero(_hero);
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM 'auction-proceeds' THEN RAISE EXCEPTION 'Invalid request'; END IF;
  RETURN jsonb_build_object('save',h.save);
 END IF;
 n:=public._num(h.save->'srv'->'auctionProceeds');
 IF n<=0 THEN RAISE EXCEPTION 'No proceeds to collect'; END IF;
 s:=jsonb_set(h.save,'{srv,auctionProceeds}','0'::jsonb,true);
 s:=jsonb_set(s,'{gold}',to_jsonb(public._num(s->'gold')+n),true);
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,'auction-proceeds',0);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
REVOKE ALL ON FUNCTION public.claim_auction_proceeds(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_auction_proceeds(uuid,uuid) TO authenticated,service_role;
COMMENT ON TABLE public.daily_profession_claims IS 'DEPRECATED: playable daily quests replaced by daily_boss_runs; retain previous claims.';
REVOKE EXECUTE ON FUNCTION public.claim_daily_profession(uuid,text),public.daily_profession_quests(uuid) FROM authenticated;
CREATE TABLE public.daily_boss_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 day date NOT NULL, boss integer NOT NULL CHECK(boss BETWEEN 0 AND 4),
 snapshot jsonb NOT NULL, state jsonb, version integer NOT NULL DEFAULT 0,
 status text NOT NULL DEFAULT 'active' CHECK(status IN('active','won','lost')),
 active jsonb NOT NULL DEFAULT '[]', last_request uuid, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(hero_id,day,boss)
);
GRANT SELECT ON public.daily_boss_runs TO authenticated;
GRANT ALL ON public.daily_boss_runs TO service_role;
ALTER TABLE public.daily_boss_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_boss_owner_read ON public.daily_boss_runs FOR SELECT TO authenticated USING(hero_id IN(SELECT public.my_hero_ids()));
CREATE FUNCTION public.daily_boss_board(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; rows jsonb;
BEGIN
 h:=public._my_hero(_hero);
 SELECT jsonb_agg(jsonb_build_object('id',b,'target',1,'progress',CASE WHEN r.status='won' THEN 1 ELSE 0 END,'claimed',coalesce(r.status='won',false),'scroll',CASE WHEN b IN(0,3) THEN 'def' WHEN b IN(1,4) THEN 'xp' ELSE 'dmg' END) ORDER BY b) INTO rows FROM generate_series(0,4) b LEFT JOIN public.daily_boss_runs r ON r.hero_id=_hero AND r.day=public._today() AND r.boss=b;
 RETURN jsonb_build_object('now',now(),'resetAt',(public._today()+1)::timestamp AT TIME ZONE 'UTC','quests',rows);
END $$;
CREATE FUNCTION public.daily_boss_open(_hero uuid,_boss integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.daily_boss_runs; s jsonb; buffs jsonb; active jsonb:='[]'; k text;
BEGIN
 h:=public._my_hero(_hero);
 IF _boss IS NULL OR _boss NOT BETWEEN 0 AND 4 THEN RAISE EXCEPTION 'Unknown boss'; END IF;
 SELECT * INTO r FROM public.daily_boss_runs WHERE hero_id=_hero AND day=public._today() AND boss=_boss FOR UPDATE;
 IF FOUND AND r.status='won' THEN RAISE EXCEPTION 'Already completed today'; END IF;
 IF FOUND AND r.status='active' THEN RETURN to_jsonb(r)||jsonb_build_object('save',h.save); END IF;
 s:=h.save; buffs:=coalesce(s->'srv'->'buffs','{}'::jsonb);
 FOR k IN SELECT unnest(ARRAY['dmg','def','xp']) LOOP
  IF public._num(buffs->k)>0 THEN active:=active||to_jsonb(k); buffs:=buffs||jsonb_build_object(k,public._num(buffs->k)-1); END IF;
 END LOOP;
 s:=jsonb_set(s,'{srv,buffs}',buffs,true);
 PERFORM public._write_save(_hero,s);
 INSERT INTO public.daily_boss_runs(hero_id,day,boss,snapshot,active) VALUES(_hero,public._today(),_boss,s,active)
 ON CONFLICT(hero_id,day,boss) DO UPDATE SET snapshot=s,state=NULL,status='active',version=daily_boss_runs.version+1,active=EXCLUDED.active,last_request=NULL,updated_at=now() RETURNING * INTO r;
 RETURN to_jsonb(r)||jsonb_build_object('save',s);
END $$;
CREATE FUNCTION public.daily_boss_commit(_run uuid,_owner uuid,_version integer,_request uuid,_state jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.daily_boss_runs; h public.heroes; s jsonb; kind text; outcome text;
BEGIN
 SELECT hero_id INTO r.hero_id FROM public.daily_boss_runs WHERE id=_run;
 SELECT * INTO h FROM public.heroes WHERE id=r.hero_id AND user_id=_owner FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Character not found'; END IF;
 SELECT * INTO r FROM public.daily_boss_runs WHERE id=_run FOR UPDATE;
 IF r.last_request=_request THEN RETURN to_jsonb(r)||jsonb_build_object('save',h.save); END IF;
 IF r.day<>public._today() THEN RAISE EXCEPTION 'Daily quest expired; reopen the board'; END IF;
 IF r.status<>'active' OR r.version<>_version THEN RAISE EXCEPTION 'Battle changed; reopen to resume'; END IF;
 outcome:=CASE WHEN _state->>'over'='won' THEN 'won' WHEN _state->>'over'='lost' THEN 'lost' ELSE 'active' END;
 s:=h.save;
 IF outcome='won' THEN
  kind:=CASE WHEN r.boss IN(0,3) THEN 'def' WHEN r.boss IN(1,4) THEN 'xp' ELSE 'dmg' END;
  s:=public._apply_reward(s,jsonb_build_object('scrolls',jsonb_build_object(kind,1)));
  PERFORM public._write_save(h.id,s);
 END IF;
 UPDATE public.daily_boss_runs SET state=_state,version=version+1,status=outcome,last_request=_request,updated_at=now() WHERE id=_run RETURNING * INTO r;
 RETURN to_jsonb(r)||jsonb_build_object('save',s);
END $$;
REVOKE ALL ON FUNCTION public.daily_boss_board(uuid),public.daily_boss_open(uuid,integer),public.daily_boss_commit(uuid,uuid,integer,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.daily_boss_board(uuid),public.daily_boss_open(uuid,integer) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.daily_boss_commit(uuid,uuid,integer,uuid,jsonb) TO service_role;
CREATE TABLE public.payment_orders (environment text NOT NULL, session_id text NOT NULL, user_id uuid NOT NULL, hero_id uuid NOT NULL, kind text NOT NULL, item_id text NOT NULL, amount_cents integer NOT NULL, currency text NOT NULL DEFAULT 'usd', diamonds integer NOT NULL DEFAULT 0, vip_level integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'pending', paid_at timestamptz, delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(environment,session_id));
GRANT SELECT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_orders_owner ON public.payment_orders FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.payment_deliver(_env text,_session text,_paid_at timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.payment_orders; h public.heroes; s jsonb; p jsonb; base timestamptz; lvl int;
BEGIN
 SELECT * INTO o FROM public.payment_orders WHERE environment=_env AND session_id=_session FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment order not found'; END IF;
 SELECT * INTO h FROM public.heroes WHERE id=o.hero_id AND user_id=o.user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchased character not found'; END IF;
 IF o.delivered_at IS NOT NULL THEN RETURN jsonb_build_object('save',h.save,'already',true,'test',_env='sandbox'); END IF;
 s:=h.save;
 IF _env='live' THEN
  p:=coalesce(s->'srv'->'premium','{}'::jsonb);
  IF o.kind='diamonds' THEN p:=p||jsonb_build_object('balance',public._num(p->'balance')+o.diamonds);
  ELSIF o.kind='vip' THEN
   base:=greatest(_paid_at,coalesce(nullif(p->'vip'->>'until','')::timestamptz,_paid_at));
   lvl:=CASE WHEN coalesce(nullif(p->'vip'->>'until','')::timestamptz,_paid_at)>_paid_at THEN greatest(o.vip_level,public._num(p->'vip'->'level')::int) ELSE o.vip_level END;
   p:=p||jsonb_build_object('vip',jsonb_build_object('level',lvl,'until',base+interval '30 days'));
  ELSE RAISE EXCEPTION 'Invalid payment product'; END IF;
  p:=p||jsonb_build_object('history',coalesce(p->'history','[]'::jsonb)||jsonb_build_object('at',_paid_at,'kind','purchase','amount',CASE WHEN o.kind='diamonds' THEN o.diamonds ELSE o.vip_level END,'detail','stripe:'||_session));
  s:=jsonb_set(s,'{srv}',coalesce(s->'srv','{}'::jsonb)||jsonb_build_object('premium',p),true);
  PERFORM public._write_save(o.hero_id,s);
 ELSIF _env<>'sandbox' THEN RAISE EXCEPTION 'Invalid payment environment'; END IF;
 UPDATE public.payment_orders SET status='delivered',paid_at=_paid_at,delivered_at=now() WHERE environment=_env AND session_id=_session;
 RETURN jsonb_build_object('save',s,'already',false,'test',_env='sandbox','diamonds',o.diamonds,'vipLevel',o.vip_level);
END $$;
REVOKE ALL ON FUNCTION public.payment_deliver(text,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.payment_deliver(text,text,timestamptz) TO service_role;
CREATE OR REPLACE FUNCTION public.premium_commit_spend(_hero uuid,_owner uuid,_req uuid,_before jsonb,_after jsonb,_price int,_item text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; old public.purchases;
BEGIN
 SELECT * INTO h FROM public.heroes WHERE id=_hero AND user_id=_owner FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Character not found'; END IF;
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM _item THEN RAISE EXCEPTION 'Request belongs to another purchase'; END IF;
  RETURN jsonb_build_object('save',h.save,'already',true);
 END IF;
 IF h.save IS DISTINCT FROM _before THEN RAISE EXCEPTION 'Save changed; retry this purchase'; END IF;
 IF _price<1 OR public._num(_before->'srv'->'premium'->'balance')-public._num(_after->'srv'->'premium'->'balance')<>_price THEN RAISE EXCEPTION 'Invalid purchase debit'; END IF;
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,_item,_price);
 PERFORM public._write_save(_hero,_after);
 RETURN jsonb_build_object('save',_after,'already',false);
END $$;
REVOKE ALL ON FUNCTION public.premium_commit_spend(uuid,uuid,uuid,jsonb,jsonb,int,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.premium_commit_spend(uuid,uuid,uuid,jsonb,jsonb,int,text) TO service_role;
DO $change$
DECLARE d text;
BEGIN
 SELECT pg_get_functiondef('public.premium_service(uuid,text,uuid,text)'::regprocedure) INTO d;
 d:=replace(replace(replace(replace(replace(replace(d,'THEN 500','THEN 550'),'THEN 700','THEN 770'),'THEN 50','THEN 55'),'''stallion'',300','''stallion'',330'),'''drake'',600','''drake'',660'),'''stag'',900','''stag'',990');
 d:=replace(replace(d,'''nightmare'',1300','''nightmare'',1430'),'''griffin'',2000','''griffin'',2200'); EXECUTE d;
 SELECT pg_get_functiondef('public.awakening_boost(uuid,text,uuid)'::regprocedure) INTO d;
 d:=replace(replace(replace(replace(d,'THEN 150','THEN 165'),'THEN 200','THEN 220'),'THEN 50','THEN 55'),'THEN 80','THEN 88'); EXECUTE d;
 SELECT pg_get_functiondef('public.wheel_spin(uuid,uuid)'::regprocedure) INTO d;
 d:=replace(replace(replace(replace(d,'bal < 100','bal < 110'),'bal - 100','bal - 110'),'''amount'', 100','''amount'', 110'),'''wheel'', 100','''wheel'', 110'); EXECUTE d;
END $change$;
-- Legacy direct shop calls are retired; the shared catalogue and atomic server spend replace them.
REVOKE EXECUTE ON FUNCTION public.activate_vip(uuid,int,uuid),public.buy_gold_pack(uuid,text,uuid),public.buy_diamond_item(uuid,text,uuid) FROM authenticated,anon,PUBLIC;
COMMENT ON FUNCTION public.activate_vip(uuid,int,uuid) IS 'DEPRECATED: replaced by authenticated shared-catalogue premium spend';
COMMENT ON FUNCTION public.buy_gold_pack(uuid,text,uuid) IS 'DEPRECATED: replaced by authenticated shared-catalogue premium spend';
COMMENT ON FUNCTION public.buy_diamond_item(uuid,text,uuid) IS 'DEPRECATED: replaced by authenticated shared-catalogue premium spend';
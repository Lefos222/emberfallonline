CREATE OR REPLACE FUNCTION public.awakening_frontier(_hero uuid, _action text, _key text, _req uuid, _won boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; s jsonb; a jsonb; r jsonb; old public.purchases; d text := to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD'); w text := to_char(date_trunc('week',now() AT TIME ZONE 'UTC'),'YYYY-MM-DD'); win text := floor(extract(epoch from now())/21600)::text; n int; cost int; currency text; mat text; qty int; xp numeric; lv int; marks int; seals int; op text := 'awakening:'||_action||':'||_key;
BEGIN
 h := public._my_hero(_hero);
 IF public._am_banned() THEN RAISE EXCEPTION 'Account is banned'; END IF;
 IF h.level < 90 OR public._num(h.save->'awakening'->'stage') < 1 THEN RAISE EXCEPTION 'Awaken first'; END IF;
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT * INTO old FROM public.purchases WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.item IS DISTINCT FROM op THEN RAISE EXCEPTION 'Request belongs to another operation'; END IF;
  RETURN jsonb_build_object('save',h.save,'state',h.save->'srv'->'awakeningExpansion');
 END IF;
 s := h.save; a := coalesce(s->'srv'->'awakeningExpansion','{}'::jsonb);
 IF a->>'day' IS DISTINCT FROM d THEN a := a || jsonb_build_object('day',d,'dailyWins',0,'huntUsed',0,'dailyClaimed',false); END IF;
 IF a->>'week' IS DISTINCT FROM w THEN a := a || jsonb_build_object('week',w,'weeklyWins',0,'weeklyClaimed',false); END IF;
 IF a->>'window' IS DISTINCT FROM win THEN a := a || jsonb_build_object('window',win,'eventUsed',0); END IF;
 IF _action='begin' THEN
  IF _key NOT IN ('citadel','grove','observatory','hunt','event') THEN RAISE EXCEPTION 'Unknown activity'; END IF;
  r := a->'run';
  IF r IS NOT NULL AND r <> 'null'::jsonb THEN
   IF r->>'kind' IS DISTINCT FROM _key THEN RAISE EXCEPTION 'Finish the active expedition first'; END IF;
  ELSE
   n := public._num(a->'fronts'->_key)::int+1;
   IF _key='hunt' THEN
    IF public._num(a->'huntUsed') >= 3 THEN RAISE EXCEPTION 'No hunts left today'; END IF;
    a := a || jsonb_build_object('huntUsed',public._num(a->'huntUsed')+1); n := 1+public._num(a->'huntBest')::int;
   ELSIF _key='event' THEN
    IF extract(epoch from now())::bigint % 21600 >= 3600 THEN RAISE EXCEPTION 'The Eclipse event is closed'; END IF;
    IF public._num(a->'eventUsed') >= 2 THEN RAISE EXCEPTION 'No event entries left'; END IF;
    a := a || jsonb_build_object('eventUsed',public._num(a->'eventUsed')+1); n := 1+public._num(a->'eventBest')::int;
   END IF;
   r := jsonb_build_object('id',gen_random_uuid(),'kind',_key,'node',n,'started',now()); a := a || jsonb_build_object('run',r);
  END IF;
 ELSIF _action='settle' THEN
  r := a->'run';
  IF r IS NULL OR r->>'id' IS DISTINCT FROM _key THEN RAISE EXCEPTION 'Expedition not found'; END IF;
  IF now() < (r->>'started')::timestamptz + interval '5 seconds' THEN RAISE EXCEPTION 'The battle is still being fought'; END IF;
  n := (r->>'node')::int; a := a || jsonb_build_object('run',null);
  IF _won THEN
   marks := 4+least(16,n/5); seals := CASE WHEN r->>'kind'='event' THEN 3 WHEN r->>'kind'='hunt' THEN 1 WHEN n%5=0 THEN 1 ELSE 0 END;
   a := a || jsonb_build_object('marks',public._num(a->'marks')+marks,'seals',public._num(a->'seals')+seals,'dailyWins',public._num(a->'dailyWins')+1,'weeklyWins',public._num(a->'weeklyWins')+1);
   IF r->>'kind' IN ('citadel','grove','observatory') THEN a := a || jsonb_build_object('fronts',coalesce(a->'fronts','{}'::jsonb)||jsonb_build_object(r->>'kind',n));
   ELSIF r->>'kind'='hunt' THEN a := a || jsonb_build_object('huntBest',n);
   ELSE a := a || jsonb_build_object('eventBest',n); END IF;
   xp := public._num(s->'awakening'->'axp')+100+least(2000,n*8); lv := public._num(s->'awakening'->'alv')::int;
   WHILE xp >= round(400*power(lv+1,1.45)) LOOP xp := xp-round(400*power(lv+1,1.45)); lv := lv+1; END LOOP;
   s := jsonb_set(s,'{awakening}',coalesce(s->'awakening','{}'::jsonb)||jsonb_build_object('axp',xp,'alv',lv,'shards',public._num(s->'awakening'->'shards')+6+least(40,n/3)),true);
  END IF;
 ELSIF _action='buy' THEN
  SELECT v.c,v.p,v.m,v.q INTO currency,cost,mat,qty FROM (VALUES ('ember','marks',20,'aetherEmber',5),('voidsteel','marks',60,'voidsteel',2),('fate','marks',45,'fateStone',1),('pearl','seals',12,'celestialPearl',1),('heart','seals',40,'eclipsedHeart',1),('sun','seals',8,'sunCrystal',1)) v(k,c,p,m,q) WHERE v.k=_key;
  IF cost IS NULL THEN RAISE EXCEPTION 'Unknown shop item'; END IF;
  IF public._num(a->currency)<cost THEN RAISE EXCEPTION 'Not enough currency'; END IF;
  IF public._bag_room(s)<1 THEN RAISE EXCEPTION 'Your bag is full'; END IF;
  a := a || jsonb_build_object(currency,public._num(a->currency)-cost);
  s := public._apply_reward(s,jsonb_build_object('mats',jsonb_build_object(mat,qty)));
 ELSIF _action='claim' THEN
  IF _key='daily' THEN
   IF public._num(a->'dailyWins')<5 OR coalesce((a->>'dailyClaimed')::boolean,false) THEN RAISE EXCEPTION 'Contract is not ready'; END IF;
   a := a || jsonb_build_object('dailyClaimed',true,'marks',public._num(a->'marks')+20,'seals',public._num(a->'seals')+1);
  ELSIF _key='weekly' THEN
   IF public._num(a->'weeklyWins')<30 OR coalesce((a->>'weeklyClaimed')::boolean,false) THEN RAISE EXCEPTION 'Contract is not ready'; END IF;
   a := a || jsonb_build_object('weeklyClaimed',true,'marks',public._num(a->'marks')+100,'seals',public._num(a->'seals')+8);
  ELSE RAISE EXCEPTION 'Unknown contract'; END IF;
 ELSE RAISE EXCEPTION 'Unknown action'; END IF;
 s := jsonb_set(s,'{srv,awakeningExpansion}',a,true);
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,op,coalesce(cost,0));
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'state',a);
END $$;
REVOKE ALL ON FUNCTION public.awakening_frontier(uuid,text,text,uuid,boolean) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.awakening_frontier(uuid,text,text,uuid,boolean) TO authenticated;

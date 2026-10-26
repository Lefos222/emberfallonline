CREATE TABLE public.world_raid_claims(hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,day date NOT NULL,node text NOT NULL CHECK(node ~ '^(gold|ore|boss)-[1-7]$'),claimed_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(hero_id,day,node));
GRANT SELECT ON public.world_raid_claims TO authenticated;
GRANT ALL ON public.world_raid_claims TO service_role;
ALTER TABLE public.world_raid_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY world_raid_read ON public.world_raid_claims FOR SELECT TO authenticated USING(hero_id IN(SELECT public.my_hero_ids()));
CREATE FUNCTION public.world_map_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; d date:=public._today();
BEGIN
 h:=public._my_hero(_hero);
 RETURN jsonb_build_object('now',now(),'resetAt',(d+1)::timestamp AT TIME ZONE 'UTC',
  'used',jsonb_build_object(
   'gold',(SELECT count(*) FROM public.world_raid_claims c WHERE c.hero_id=_hero AND c.day=d AND c.node LIKE 'gold-%'),
   'ore',(SELECT count(*) FROM public.world_raid_claims c WHERE c.hero_id=_hero AND c.day=d AND c.node LIKE 'ore-%'),
   'boss',(SELECT count(*) FROM public.world_raid_claims c WHERE c.hero_id=_hero AND c.day=d AND c.node LIKE 'boss-%')),
  'nodes',coalesce((SELECT jsonb_agg(c.node) FROM public.world_raid_claims c WHERE c.hero_id=_hero AND c.day=d),'[]'::jsonb));
END $$;
CREATE FUNCTION public.world_raid_complete(_hero uuid,_node text,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; d date:=public._today(); s jsonb; kind text; lim int; lvl int; rw jsonb;
BEGIN
 h:=public._my_hero(_hero);
 IF _node IS NULL OR _node !~ '^(gold|ore|boss)-[1-7]$' THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 kind:=split_part(_node,'-',1);
 lim:=CASE kind WHEN 'gold' THEN 7 WHEN 'ore' THEN 5 ELSE 3 END;
 IF kind='gold' AND _node NOT IN('gold-1','gold-2','gold-3','gold-4','gold-5','gold-6','gold-7') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 IF kind='ore' AND _node NOT IN('ore-1','ore-2','ore-3','ore-4','ore-5') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 IF kind='boss' AND _node NOT IN('boss-1','boss-2','boss-3') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 IF EXISTS(SELECT 1 FROM public.purchases WHERE request_id=_req) THEN RETURN jsonb_build_object('save',h.save,'repeat',true); END IF;
 IF EXISTS(SELECT 1 FROM public.world_raid_claims WHERE hero_id=_hero AND day=d AND node=_node) THEN RAISE EXCEPTION 'This node is already cleared today'; END IF;
 IF (SELECT count(*) FROM public.world_raid_claims c WHERE c.hero_id=_hero AND c.day=d AND c.node LIKE kind||'-%') >= lim THEN RAISE EXCEPTION 'Daily limit reached for this raid type'; END IF;
 lvl:=greatest(1,round(public._num(h.save->'level'))::int);
 rw:=CASE kind
  WHEN 'gold' THEN jsonb_build_object('gold',500+lvl*150)
  WHEN 'ore' THEN jsonb_build_object('gold',200+lvl*50,'mats',jsonb_build_object('ore',2,'essence',1))
  ELSE jsonb_build_object('gold',1500+lvl*300,'mats',jsonb_build_object('bossCore',1,'starshard',1))
 END;
 INSERT INTO public.world_raid_claims(hero_id,day,node) VALUES(_hero,d,_node);
 INSERT INTO public.purchases(request_id,hero_id,item,price) VALUES(_req,_hero,'world-raid:'||_node,0);
 s:=public._apply_reward(h.save,rw);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'reward',rw,'repeat',false);
END $$;
REVOKE ALL ON FUNCTION public.world_map_state(uuid),public.world_raid_complete(uuid,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.world_map_state(uuid),public.world_raid_complete(uuid,text,uuid) TO authenticated,service_role;
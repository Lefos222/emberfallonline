-- Raise world-map daily raid limits: gold 7→10, ore 5→8, boss 3→4.
-- Adds new map nodes and relaxes the CHECK constraint accordingly.

-- 1. Relax the node CHECK constraint to allow gold-1..10, ore-1..8, boss-1..4
ALTER TABLE public.world_raid_claims DROP CONSTRAINT IF EXISTS world_raid_claims_node_check;
ALTER TABLE public.world_raid_claims ADD CONSTRAINT world_raid_claims_node_check CHECK (node ~ '^(gold-(10|[1-9])|ore-[1-8]|boss-[1-4])$');

-- 2. Replace the completion function with updated limits and node lists
CREATE OR REPLACE FUNCTION public.world_raid_complete(_hero uuid,_node text,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; d date:=public._today(); s jsonb; kind text; lim int; lvl int; rw jsonb;
BEGIN
 h:=public._my_hero(_hero);
 IF _node IS NULL OR _node !~ '^(gold|ore|boss)-[1-9]$' AND _node !~ '^gold-10$' THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 kind:=split_part(_node,'-',1);
 lim:=CASE kind WHEN 'gold' THEN 10 WHEN 'ore' THEN 8 ELSE 4 END;
 IF kind='gold' AND _node NOT IN('gold-1','gold-2','gold-3','gold-4','gold-5','gold-6','gold-7','gold-8','gold-9','gold-10') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 IF kind='ore' AND _node NOT IN('ore-1','ore-2','ore-3','ore-4','ore-5','ore-6','ore-7','ore-8') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
 IF kind='boss' AND _node NOT IN('boss-1','boss-2','boss-3','boss-4') THEN RAISE EXCEPTION 'Unknown map node'; END IF;
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

REVOKE ALL ON FUNCTION public.world_raid_complete(uuid,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.world_raid_complete(uuid,text,uuid) TO authenticated,service_role;

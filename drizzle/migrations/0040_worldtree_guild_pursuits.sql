CREATE TABLE public.realm_pursuit_claims (hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, scope text NOT NULL, milestone integer NOT NULL, period text NOT NULL, PRIMARY KEY(hero_id,scope,milestone,period));
GRANT SELECT ON public.realm_pursuit_claims TO authenticated;
GRANT ALL ON public.realm_pursuit_claims TO service_role;
ALTER TABLE public.realm_pursuit_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY pursuit_owner ON public.realm_pursuit_claims FOR SELECT TO authenticated USING(hero_id IN(SELECT public.my_hero_ids()));
CREATE FUNCTION public.realm_pursuits(_hero uuid,_scope text,_milestone integer DEFAULT 0) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; count_ bigint; p text; target_ bigint; s jsonb; m public.guild_members; gold_ bigint;
BEGIN
 h:=public._my_hero(_hero);
 IF _scope='world' THEN SELECT count(*) INTO count_ FROM public.world_raid_claims WHERE hero_id=_hero; p:='lifetime';
 ELSIF _scope='guild' THEN m:=public._guild_role(_hero); SELECT count(*) INTO count_ FROM public.guild_dice d JOIN public.guild_members g ON g.hero_id=d.hero_id WHERE g.guild_id=m.guild_id AND d.day>=public._monday(); p:=public._monday()::text;
 ELSE RAISE EXCEPTION 'Unknown pursuit'; END IF;
 IF _milestone>0 THEN
  target_:=CASE WHEN _scope='world' THEN _milestone*10 ELSE _milestone*5 END;
  IF _milestone>1000000 OR count_<target_ THEN RAISE EXCEPTION 'Pursuit incomplete'; END IF;
  INSERT INTO public.realm_pursuit_claims(hero_id,scope,milestone,period) VALUES(_hero,_scope,_milestone,p) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RAISE EXCEPTION 'Already claimed'; END IF;
  gold_:=round((300+_milestone*100)*(1+h.level*0.1));
  s:=public._apply_reward(h.save,jsonb_build_object('gold',gold_,'mats',jsonb_build_object('ore',5,'hide',3,'bloom',2,'crystal',1)));
  PERFORM public._write_save(_hero,s); h.save:=s;
 END IF;
 RETURN jsonb_build_object('save',h.save,'count',count_,'period',p,'claimed',coalesce((SELECT jsonb_agg(milestone) FROM public.realm_pursuit_claims WHERE hero_id=_hero AND scope=_scope AND period=p),'[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.realm_pursuits(uuid,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.realm_pursuits(uuid,text,integer) TO authenticated;
CREATE OR REPLACE FUNCTION public._bag_room(_save jsonb) RETURNS integer LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT greatest(0,40+8*least(10,greatest(0,public._num(_save->'bagRows')::int))
 -coalesce((SELECT sum(ceil(greatest(0,public._num(value))/9999))::int FROM jsonb_each(coalesce(_save->'mats','{}'::jsonb))),0)
 -coalesce((SELECT count(*)::int FROM jsonb_each(coalesce(_save->'gems','{}'::jsonb)) WHERE public._num(value)>0),0)
 -coalesce((SELECT count(*)::int FROM jsonb_each(coalesce(_save->'chests','{}'::jsonb)) WHERE public._num(value)>0),0)
 -ceil(greatest(0,public._num(_save->'srv'->'friendship'->'roses'))/9999)::int
 -jsonb_array_length(coalesce(_save->'inventory','[]'::jsonb)));
$$;
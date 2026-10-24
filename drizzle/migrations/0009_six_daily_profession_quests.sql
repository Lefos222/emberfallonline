CREATE TABLE public.daily_profession_claims(hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,day date NOT NULL,profession text NOT NULL CHECK(profession IN('mining','herbalism','logging','fishing','archaeology','treasure')),claimed_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(hero_id,day,profession));
GRANT SELECT ON public.daily_profession_claims TO authenticated;
GRANT ALL ON public.daily_profession_claims TO service_role;
ALTER TABLE public.daily_profession_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_profession_read ON public.daily_profession_claims FOR SELECT TO authenticated USING(hero_id IN(SELECT public.my_hero_ids()));
CREATE FUNCTION public.daily_profession_quests(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; quests jsonb; d date:=public._today();
BEGIN
 h:=public._my_hero(_hero);
 SELECT jsonb_agg(jsonb_build_object('id',p,'target',1,'progress',(SELECT count(*) FROM jsonb_array_elements(coalesce(h.save->'srv'->'gathering'->'history','[]'::jsonb)) e WHERE e->>'profession'=p AND (e->>'at')::timestamptz >= (d::timestamp AT TIME ZONE 'UTC') AND (e->>'at')::timestamptz < ((d+1)::timestamp AT TIME ZONE 'UTC')),'claimed',EXISTS(SELECT 1 FROM public.daily_profession_claims c WHERE c.hero_id=_hero AND c.day=d AND c.profession=p),'scroll',CASE WHEN p IN('mining','logging') THEN 'def' WHEN p IN('herbalism','fishing') THEN 'xp' ELSE 'dmg' END) ORDER BY ordinal) INTO quests FROM unnest(ARRAY['mining','herbalism','logging','fishing','archaeology','treasure']) WITH ORDINALITY x(p,ordinal);
 RETURN jsonb_build_object('now',now(),'resetAt',(d+1)::timestamp AT TIME ZONE 'UTC','quests',quests);
END $$;
CREATE FUNCTION public.claim_daily_profession(_hero uuid,_profession text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; d date:=public._today(); s jsonb; kind text;
BEGIN
 h:=public._my_hero(_hero);
 IF _profession IS NULL OR _profession NOT IN('mining','herbalism','logging','fishing','archaeology','treasure') THEN RAISE EXCEPTION 'Unknown daily quest'; END IF;
 IF EXISTS(SELECT 1 FROM public.daily_profession_claims WHERE hero_id=_hero AND day=d AND profession=_profession) THEN RETURN jsonb_build_object('save',h.save,'repeat',true); END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(h.save->'srv'->'gathering'->'history','[]'::jsonb)) e WHERE e->>'profession'=_profession AND (e->>'at')::timestamptz >= (d::timestamp AT TIME ZONE 'UTC') AND (e->>'at')::timestamptz < ((d+1)::timestamp AT TIME ZONE 'UTC')) THEN RAISE EXCEPTION 'Complete a gathering journey for this profession today'; END IF;
 kind:=CASE WHEN _profession IN('mining','logging') THEN 'def' WHEN _profession IN('herbalism','fishing') THEN 'xp' ELSE 'dmg' END;
 INSERT INTO public.daily_profession_claims(hero_id,day,profession) VALUES(_hero,d,_profession);
 s:=public._apply_reward(h.save,jsonb_build_object('scrolls',jsonb_build_object(kind,1)));
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'reward',jsonb_build_object('scrolls',jsonb_build_object(kind,1)),'repeat',false);
END $$;
REVOKE ALL ON FUNCTION public.daily_profession_quests(uuid),public.claim_daily_profession(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.daily_profession_quests(uuid),public.claim_daily_profession(uuid,text) TO authenticated,service_role;
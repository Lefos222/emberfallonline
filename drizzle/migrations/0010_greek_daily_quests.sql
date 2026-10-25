-- Daily commissions now follow the game's Greek clock and pay more.
-- DAILY_REWARD lives in src/game/daily-quests.ts - keep both identical.
CREATE OR REPLACE FUNCTION public.daily_profession_quests(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; quests jsonb; d date:=(now() AT TIME ZONE 'Europe/Athens')::date;
BEGIN
 h:=public._my_hero(_hero);
 SELECT jsonb_agg(jsonb_build_object('id',p,'target',1,'progress',(SELECT count(*) FROM jsonb_array_elements(coalesce(h.save->'srv'->'gathering'->'history','[]'::jsonb)) e WHERE e->>'profession'=p AND (e->>'at')::timestamptz >= (d::timestamp AT TIME ZONE 'Europe/Athens') AND (e->>'at')::timestamptz < ((d+1)::timestamp AT TIME ZONE 'Europe/Athens')),'claimed',EXISTS(SELECT 1 FROM public.daily_profession_claims c WHERE c.hero_id=_hero AND c.day=d AND c.profession=p),'scroll',CASE WHEN p IN('mining','logging') THEN 'def' WHEN p IN('herbalism','fishing') THEN 'xp' ELSE 'dmg' END) ORDER BY ordinal) INTO quests FROM unnest(ARRAY['mining','herbalism','logging','fishing','archaeology','treasure']) WITH ORDINALITY x(p,ordinal);
 RETURN jsonb_build_object('now',now(),'resetAt',(d+1)::timestamp AT TIME ZONE 'Europe/Athens','quests',quests);
END $$;
CREATE OR REPLACE FUNCTION public.claim_daily_profession(_hero uuid,_profession text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; d date:=(now() AT TIME ZONE 'Europe/Athens')::date; s jsonb; kind text; rw jsonb;
BEGIN
 h:=public._my_hero(_hero);
 IF _profession IS NULL OR _profession NOT IN('mining','herbalism','logging','fishing','archaeology','treasure') THEN RAISE EXCEPTION 'Unknown daily quest'; END IF;
 IF EXISTS(SELECT 1 FROM public.daily_profession_claims WHERE hero_id=_hero AND day=d AND profession=_profession) THEN RETURN jsonb_build_object('save',h.save,'repeat',true); END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(h.save->'srv'->'gathering'->'history','[]'::jsonb)) e WHERE e->>'profession'=_profession AND (e->>'at')::timestamptz >= (d::timestamp AT TIME ZONE 'Europe/Athens') AND (e->>'at')::timestamptz < ((d+1)::timestamp AT TIME ZONE 'Europe/Athens')) THEN RAISE EXCEPTION 'Complete a gathering journey for this profession today'; END IF;
 kind:=CASE WHEN _profession IN('mining','logging') THEN 'def' WHEN _profession IN('herbalism','fishing') THEN 'xp' ELSE 'dmg' END;
 rw:=jsonb_build_object('scrolls',jsonb_build_object(kind,2),'gold',750,'mats',jsonb_build_object('essence',2));
 INSERT INTO public.daily_profession_claims(hero_id,day,profession) VALUES(_hero,d,_profession);
 s:=public._apply_reward(h.save,rw);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'reward',rw,'repeat',false);
END $$;
REVOKE ALL ON FUNCTION public.daily_profession_quests(uuid),public.claim_daily_profession(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.daily_profession_quests(uuid),public.claim_daily_profession(uuid,text) TO authenticated,service_role;

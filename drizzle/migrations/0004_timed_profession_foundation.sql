CREATE OR REPLACE FUNCTION public.profession_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN h := public._my_hero(_hero); RETURN jsonb_build_object('save',h.save,'now',now()); END $$;
CREATE OR REPLACE FUNCTION public.begin_gathering(_hero uuid,_profession text,_area integer,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; g jsonb; active jsonb; xp integer; level integer; required integer;
BEGIN
 h := public._my_hero(_hero);
 IF _profession NOT IN ('mining','herbalism','logging','fishing','archaeology','treasure') OR _area NOT BETWEEN 0 AND 4 THEN RAISE EXCEPTION 'Unknown profession or gathering area'; END IF;
 g := coalesce(h.save->'srv'->'gathering','{}'::jsonb); active := g->'active';
 IF active IS NOT NULL AND active <> 'null'::jsonb THEN
   IF active->>'request' = _req::text AND active->>'profession' = _profession AND (active->>'area')::integer = _area THEN RETURN jsonb_build_object('save',h.save,'now',now()); END IF;
   RAISE EXCEPTION 'Finish the current gathering journey first';
 END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(g->'history','[]'::jsonb)) e WHERE e->>'request' = _req::text) THEN RAISE EXCEPTION 'This journey has already been completed'; END IF;
 IF g->>'nextAt' IS NOT NULL AND now() < (g->>'nextAt')::timestamptz THEN RAISE EXCEPTION 'Rest before starting another gathering journey'; END IF;
 xp := public._num(g->'professions'->_profession->'xp')::integer; level := 1 + floor(xp / 100.0)::integer; required := 1 + _area * 5;
 IF level < required THEN RAISE EXCEPTION 'Profession level % required',required; END IF;
 active := jsonb_build_object('request',_req,'profession',_profession,'area',_area,'startedAt',now(),'readyAt',now()+make_interval(secs=>30+_area*15));
 g := g || jsonb_build_object('active',active);
 h.save := jsonb_set(h.save,'{srv,gathering}',g,true); PERFORM public._write_save(_hero,h.save);
 RETURN jsonb_build_object('save',h.save,'now',now());
END $$;
CREATE OR REPLACE FUNCTION public.finish_gathering(_hero uuid,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; g jsonb; active jsonb; discovery jsonb; previous jsonb; profession text; area integer; rarity integer; qty integer; resource text; xp integer; tool integer; roll float8;
BEGIN
 h := public._my_hero(_hero); g := coalesce(h.save->'srv'->'gathering','{}'::jsonb);
 SELECT e INTO previous FROM jsonb_array_elements(coalesce(g->'history','[]'::jsonb)) e WHERE e->>'request'=_req::text;
 IF previous IS NOT NULL THEN RETURN jsonb_build_object('save',h.save,'discovery',previous,'repeat',true,'now',now()); END IF;
 active := g->'active';
 IF active IS NULL OR active='null'::jsonb OR active->>'request' IS DISTINCT FROM _req::text THEN RAISE EXCEPTION 'Gathering journey not found'; END IF;
 IF now() < (active->>'readyAt')::timestamptz THEN RAISE EXCEPTION 'Gathering is not finished yet'; END IF;
 profession := active->>'profession'; area := (active->>'area')::integer;
 roll := random(); rarity := CASE WHEN roll < 0.01 THEN 3 WHEN roll < 0.10 THEN 2 WHEN roll < 0.35 THEN 1 ELSE 0 END;
 qty := 1+area+rarity; resource := profession||':'||area||':'||rarity;
 xp := public._num(g->'professions'->profession->'xp')::integer + 20+area*5+rarity*5;
 tool := least(3,1+floor(xp/1000.0)::integer);
 discovery := jsonb_build_object('request',_req,'profession',profession,'area',area,'rarity',rarity,'quantity',qty,'resource',resource,'xp',20+area*5+rarity*5,'at',now());
 g := g || jsonb_build_object('active',NULL,'nextAt',now()+interval '60 seconds');
 g := jsonb_set(g,'{professions}',coalesce(g->'professions','{}'::jsonb)||jsonb_build_object(profession,jsonb_build_object('xp',xp,'tool',tool,'journeys',public._num(g->'professions'->profession->'journeys')+1)),true);
 g := jsonb_set(g,'{resources}',coalesce(g->'resources','{}'::jsonb)||jsonb_build_object(resource,public._num(g->'resources'->resource)+qty),true);
 g := jsonb_set(g,'{history}',jsonb_build_array(discovery)||coalesce(g->'history','[]'::jsonb),true);
 h.save := jsonb_set(h.save,'{srv,gathering}',g,true); PERFORM public._write_save(_hero,h.save);
 RETURN jsonb_build_object('save',h.save,'discovery',discovery,'repeat',false,'now',now());
END $$;
REVOKE ALL ON FUNCTION public.profession_state(uuid), public.begin_gathering(uuid,text,integer,uuid), public.finish_gathering(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.profession_state(uuid), public.begin_gathering(uuid,text,integer,uuid), public.finish_gathering(uuid,uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.begin_gathering(_hero uuid,_profession text,_area integer,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; g jsonb; active jsonb; xp integer; level integer; required integer;
BEGIN
 h := public._my_hero(_hero);
 IF _req IS NULL OR _profession IS NULL OR _area IS NULL OR _profession NOT IN ('mining','herbalism','logging','fishing','archaeology','treasure') OR _area NOT BETWEEN 0 AND 4 THEN RAISE EXCEPTION 'Unknown profession or gathering area'; END IF;
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
REVOKE ALL ON FUNCTION public.begin_gathering(uuid,text,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.begin_gathering(uuid,text,integer,uuid) TO authenticated,service_role;
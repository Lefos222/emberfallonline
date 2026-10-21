CREATE TABLE public.guild_supply_contributions (
 request_id uuid PRIMARY KEY, guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, hero_name text NOT NULL,
 day date NOT NULL, event text NOT NULL CHECK (event IN ('siege','caravan','ritual')),
 resource text NOT NULL, quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100)
);
GRANT SELECT ON public.guild_supply_contributions TO authenticated;
GRANT ALL ON public.guild_supply_contributions TO service_role;
ALTER TABLE public.guild_supply_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY guild_supply_read ON public.guild_supply_contributions FOR SELECT TO authenticated USING (guild_id IN (SELECT public.my_guild_ids()));
CREATE TABLE public.guild_supply_claims (
 guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 day date NOT NULL, event text NOT NULL, PRIMARY KEY(guild_id,hero_id,day,event)
);
GRANT SELECT ON public.guild_supply_claims TO authenticated;
GRANT ALL ON public.guild_supply_claims TO service_role;
ALTER TABLE public.guild_supply_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY guild_supply_claim_read ON public.guild_supply_claims FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));
CREATE FUNCTION public.guild_supply_rules() RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT '[{"id":"siege","name":"Repair the Siege Defenses","story":"The outer walls are damaged. Supply ore and timber before the next assault.","professions":["mining","logging"],"target":20,"scroll":"def"},{"id":"caravan","name":"Provision the Guild Caravan","story":"The caravan is stranded. Deliver food and medicinal herbs to reopen the route.","professions":["fishing","herbalism"],"target":20,"scroll":"xp"},{"id":"ritual","name":"Restore the Ancestral Beacon","story":"The beacon has gone dark. Recover relics and treasures to restore its light.","professions":["archaeology","treasure"],"target":20,"scroll":"dmg"}]'::jsonb
$$;
CREATE FUNCTION public.guild_supply_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g uuid; events jsonb; d date:=public._today();
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.heroes WHERE id=_hero AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Character not found'; END IF;
 SELECT guild_id INTO g FROM public.guild_members WHERE hero_id=_hero;
 IF g IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
 SELECT jsonb_agg(e || jsonb_build_object('progress',coalesce((SELECT sum(quantity) FROM public.guild_supply_contributions c WHERE c.guild_id=g AND c.day=d AND c.event=e->>'id'),0), 'personal',coalesce((SELECT sum(quantity) FROM public.guild_supply_contributions c WHERE c.guild_id=g AND c.day=d AND c.event=e->>'id' AND c.hero_id=_hero),0), 'claimed',EXISTS(SELECT 1 FROM public.guild_supply_claims c WHERE c.guild_id=g AND c.hero_id=_hero AND c.day=d AND c.event=e->>'id'))) INTO events FROM jsonb_array_elements(public.guild_supply_rules()) e;
 RETURN jsonb_build_object('now',now(),'resetAt',(d+1)::timestamp AT TIME ZONE 'UTC','events',events,'contributions',coalesce((SELECT jsonb_agg(x) FROM (SELECT hero_name,event,sum(quantity)::int AS quantity FROM public.guild_supply_contributions WHERE guild_id=g AND day=d GROUP BY hero_name,event ORDER BY sum(quantity) DESC) x),'[]'::jsonb));
END $$;
CREATE FUNCTION public.guild_supply_contribute(_hero uuid,_event text,_resource text,_quantity integer,_req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; g uuid; rule jsonb; parts text[]; resources jsonb; old public.guild_supply_contributions; total integer; s jsonb;
BEGIN
 h:=public._my_hero(_hero);
 IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
 SELECT guild_id INTO g FROM public.guild_members WHERE hero_id=_hero FOR UPDATE;
 IF g IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
 SELECT * INTO old FROM public.guild_supply_contributions WHERE request_id=_req;
 IF FOUND THEN
  IF old.hero_id IS DISTINCT FROM _hero OR old.event IS DISTINCT FROM _event OR old.resource IS DISTINCT FROM _resource OR old.quantity IS DISTINCT FROM _quantity THEN RAISE EXCEPTION 'Invalid request'; END IF;
  RETURN jsonb_build_object('save',h.save);
 END IF;
 SELECT e INTO rule FROM jsonb_array_elements(public.guild_supply_rules()) e WHERE e->>'id'=_event;
 parts:=string_to_array(_resource,':');
 IF rule IS NULL OR _resource IS NULL OR array_length(parts,1) IS DISTINCT FROM 3 OR NOT (rule->'professions' ? parts[1]) OR parts[2] !~ '^[0-4]$' OR parts[3] !~ '^[0-3]$' THEN RAISE EXCEPTION 'That supply does not match this event'; END IF;
 IF _quantity IS NULL OR _quantity NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
 PERFORM 1 FROM public.guilds WHERE id=g FOR UPDATE;
 SELECT coalesce(sum(quantity),0) INTO total FROM public.guild_supply_contributions WHERE guild_id=g AND day=public._today() AND event=_event;
 IF total+_quantity>(rule->>'target')::int THEN RAISE EXCEPTION 'Supply only the remaining amount'; END IF;
 resources:=coalesce(h.save->'srv'->'gathering'->'resources','{}'::jsonb);
 IF public._num(resources->_resource)<_quantity THEN RAISE EXCEPTION 'Not enough gathered supplies'; END IF;
 s:=jsonb_set(h.save,'{srv,gathering,resources}',resources||jsonb_build_object(_resource,public._num(resources->_resource)-_quantity),true);
 INSERT INTO public.guild_supply_contributions VALUES(_req,g,_hero,h.name,public._today(),_event,_resource,_quantity);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
CREATE FUNCTION public.guild_supply_claim(_hero uuid,_event text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; g uuid; rule jsonb; total integer; s jsonb;
BEGIN
 h:=public._my_hero(_hero);
 SELECT guild_id INTO g FROM public.guild_members WHERE hero_id=_hero FOR UPDATE;
 IF g IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
 SELECT e INTO rule FROM jsonb_array_elements(public.guild_supply_rules()) e WHERE e->>'id'=_event;
 IF rule IS NULL THEN RAISE EXCEPTION 'Unknown guild event'; END IF;
 IF EXISTS(SELECT 1 FROM public.guild_supply_claims WHERE guild_id=g AND hero_id=_hero AND day=public._today() AND event=_event) THEN RETURN jsonb_build_object('save',h.save); END IF;
 SELECT coalesce(sum(quantity),0) INTO total FROM public.guild_supply_contributions WHERE guild_id=g AND day=public._today() AND event=_event;
 IF total<(rule->>'target')::int THEN RAISE EXCEPTION 'The guild objective is not complete'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.guild_supply_contributions WHERE guild_id=g AND hero_id=_hero AND day=public._today() AND event=_event) THEN RAISE EXCEPTION 'Contribute to this event before claiming'; END IF;
 INSERT INTO public.guild_supply_claims VALUES(g,_hero,public._today(),_event);
 s:=public._apply_reward(h.save,jsonb_build_object('scrolls',jsonb_build_object(rule->>'scroll',1)));
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s);
END $$;
REVOKE ALL ON FUNCTION public.guild_supply_rules(),public.guild_supply_state(uuid),public.guild_supply_contribute(uuid,text,text,integer,uuid),public.guild_supply_claim(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.guild_supply_state(uuid),public.guild_supply_contribute(uuid,text,text,integer,uuid),public.guild_supply_claim(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.guild_supply_rules(),public.guild_supply_state(uuid),public.guild_supply_contribute(uuid,text,text,integer,uuid),public.guild_supply_claim(uuid,text) TO service_role;
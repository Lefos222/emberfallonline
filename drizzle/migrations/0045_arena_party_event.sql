CREATE TABLE public.arena_event_matches (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), window_start timestamptz NOT NULL, team_a uuid NOT NULL, team_b uuid NOT NULL, seed integer NOT NULL, winner uuid NOT NULL, starts_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.arena_event_teams (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, window_start timestamptz NOT NULL, leader uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, members uuid[] NOT NULL, power numeric NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'forming', match_id uuid REFERENCES public.arena_event_matches(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.arena_event_claims (match_id uuid NOT NULL REFERENCES public.arena_event_matches(id) ON DELETE CASCADE, hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, gold numeric NOT NULL, won boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(match_id, hero_id));
GRANT ALL ON public.arena_event_matches, public.arena_event_teams, public.arena_event_claims TO service_role;
ALTER TABLE public.arena_event_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_event_claims ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public._arena_window() RETURNS timestamptz LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT CASE WHEN now() < w + interval '1 hour' THEN w END FROM (SELECT (date_trunc('hour', now() at time zone 'UTC') - make_interval(hours => extract(hour from now() at time zone 'UTC')::int % 6)) at time zone 'UTC' AS w) x
$$;

CREATE FUNCTION public._arena_team_json(_team uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('id',t.id,'code',t.code,'leader',t.leader,'status',t.status,'power',t.power,
  'members',coalesce((SELECT jsonb_agg(jsonb_build_object('id',h.id,'name',h.name,'cls',h.hero_class,'gender',h.gender,'level',h.level,'power',h.power) ORDER BY array_position(t.members,h.id)) FROM public.heroes h WHERE h.id = ANY(t.members)),'[]'::jsonb))
 FROM public.arena_event_teams t WHERE t.id=_team
$$;

CREATE FUNCTION public.arena_event_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; w timestamptz; t public.arena_event_teams; m public.arena_event_matches; c public.arena_event_claims; nxt timestamptz;
BEGIN
 h:=public._my_hero(_hero); w:=public._arena_window();
 nxt:=(date_trunc('hour', now() at time zone 'UTC') - make_interval(hours => extract(hour from now() at time zone 'UTC')::int % 6)) at time zone 'UTC' + interval '6 hours';
 SELECT * INTO t FROM public.arena_event_teams WHERE _hero = ANY(members) ORDER BY created_at DESC LIMIT 1;
 IF FOUND AND t.match_id IS NOT NULL THEN SELECT * INTO m FROM public.arena_event_matches WHERE id=t.match_id; END IF;
 IF m.id IS NOT NULL THEN SELECT * INTO c FROM public.arena_event_claims WHERE match_id=m.id AND hero_id=_hero; END IF;
 IF t.id IS NOT NULL AND m.id IS NULL AND (w IS NULL OR t.window_start<>w) THEN t:=NULL; END IF;
 IF m.id IS NOT NULL AND c.match_id IS NOT NULL AND (w IS NULL OR m.window_start<>w) THEN t:=NULL; m:=NULL; c:=NULL; END IF;
 RETURN jsonb_build_object('open',w IS NOT NULL,'window',w,'closes',w+interval '1 hour','next',nxt,'now',now(),
  'team',CASE WHEN t.id IS NULL THEN NULL ELSE public._arena_team_json(t.id) END,
  'match',CASE WHEN m.id IS NULL THEN NULL ELSE jsonb_build_object('id',m.id,'seed',m.seed,'starts_at',m.starts_at,'winner',m.winner,
     'a',public._arena_team_json(m.team_a),'b',public._arena_team_json(m.team_b),'claimed',c.match_id IS NOT NULL,'gold',c.gold) END);
END $$;

CREATE FUNCTION public.arena_event_form(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; w timestamptz;
BEGIN
 h:=public._my_hero(_hero); w:=public._arena_window();
 IF w IS NULL THEN RAISE EXCEPTION 'The arena event is closed'; END IF;
 IF EXISTS(SELECT 1 FROM public.arena_event_teams WHERE window_start=w AND _hero=ANY(members)) THEN RAISE EXCEPTION 'Already in an arena party this event'; END IF;
 INSERT INTO public.arena_event_teams(code,window_start,leader,members) VALUES(upper(substr(md5(gen_random_uuid()::text),1,6)),w,_hero,ARRAY[_hero]);
 RETURN public.arena_event_state(_hero);
END $$;

CREATE FUNCTION public.arena_event_join(_hero uuid,_code text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; w timestamptz; t public.arena_event_teams;
BEGIN
 h:=public._my_hero(_hero); w:=public._arena_window();
 IF w IS NULL THEN RAISE EXCEPTION 'The arena event is closed'; END IF;
 IF EXISTS(SELECT 1 FROM public.arena_event_teams WHERE window_start=w AND _hero=ANY(members)) THEN RAISE EXCEPTION 'Already in an arena party this event'; END IF;
 SELECT * INTO t FROM public.arena_event_teams WHERE code=upper(trim(_code)) AND window_start=w FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'No party with that code'; END IF;
 IF t.status<>'forming' THEN RAISE EXCEPTION 'That party is already queued'; END IF;
 IF cardinality(t.members)>=4 THEN RAISE EXCEPTION 'That party is full'; END IF;
 IF EXISTS(SELECT 1 FROM public.heroes x WHERE x.id=ANY(t.members) AND x.user_id=h.user_id) THEN RAISE EXCEPTION 'One hero per account in a party'; END IF;
 UPDATE public.arena_event_teams SET members=members||_hero WHERE id=t.id;
 RETURN public.arena_event_state(_hero);
END $$;

CREATE FUNCTION public.arena_event_leave(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; t public.arena_event_teams;
BEGIN
 h:=public._my_hero(_hero);
 SELECT * INTO t FROM public.arena_event_teams WHERE _hero=ANY(members) AND status IN ('forming','queued') FOR UPDATE;
 IF FOUND THEN
  IF t.leader=_hero THEN DELETE FROM public.arena_event_teams WHERE id=t.id;
  ELSE UPDATE public.arena_event_teams SET members=array_remove(members,_hero) WHERE id=t.id; END IF;
 END IF;
 RETURN public.arena_event_state(_hero);
END $$;

CREATE FUNCTION public.arena_event_queue(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; w timestamptz; t public.arena_event_teams; o public.arena_event_teams; pw numeric; mid uuid; win uuid;
BEGIN
 h:=public._my_hero(_hero); w:=public._arena_window();
 IF w IS NULL THEN RAISE EXCEPTION 'The arena event is closed'; END IF;
 SELECT * INTO t FROM public.arena_event_teams WHERE leader=_hero AND window_start=w AND status='forming' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Only the party leader can enter the queue'; END IF;
 SELECT coalesce(sum(greatest(1,power)),1) INTO pw FROM public.heroes WHERE id=ANY(t.members);
 UPDATE public.arena_event_teams SET status='queued',power=pw WHERE id=t.id;
 SELECT * INTO o FROM public.arena_event_teams x WHERE x.window_start=w AND x.status='queued' AND x.id<>t.id AND cardinality(x.members)=cardinality(t.members)
   AND NOT EXISTS(SELECT 1 FROM public.heroes a JOIN public.heroes b ON a.user_id=b.user_id WHERE a.id=ANY(x.members) AND b.id=ANY(t.members))
   ORDER BY abs(x.power-pw), x.created_at LIMIT 1 FOR UPDATE SKIP LOCKED;
 IF FOUND THEN
  win:=CASE WHEN random() < pw/(pw+o.power) THEN t.id ELSE o.id END;
  INSERT INTO public.arena_event_matches(window_start,team_a,team_b,seed,winner,starts_at) VALUES(w,o.id,t.id,floor(random()*2147483000)::int,win,now()+interval '8 seconds') RETURNING id INTO mid;
  UPDATE public.arena_event_teams SET status='matched',match_id=mid WHERE id IN (t.id,o.id);
 END IF;
 RETURN public.arena_event_state(_hero);
END $$;

CREATE FUNCTION public.arena_event_claim(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; t public.arena_event_teams; m public.arena_event_matches; g numeric; won boolean; s jsonb;
BEGIN
 PERFORM 1 FROM public.heroes WHERE id=_hero FOR UPDATE;
 h:=public._my_hero(_hero);
 SELECT * INTO t FROM public.arena_event_teams WHERE _hero=ANY(members) AND match_id IS NOT NULL ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'No arena battle to claim'; END IF;
 SELECT * INTO m FROM public.arena_event_matches WHERE id=t.match_id;
 IF now() < m.starts_at + interval '20 seconds' THEN RAISE EXCEPTION 'The battle is still being fought'; END IF;
 IF EXISTS(SELECT 1 FROM public.arena_event_claims WHERE match_id=m.id AND hero_id=_hero) THEN RAISE EXCEPTION 'Reward already claimed'; END IF;
 won:=m.winner=t.id;
 g:=round((1500+greatest(1,h.level)*60)*CASE WHEN won THEN 1 ELSE 0.4 END);
 s:=public._apply_reward(h.save,jsonb_build_object('gold',g));
 INSERT INTO public.arena_event_claims(match_id,hero_id,gold,won) VALUES(m.id,_hero,g,won);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'gold',g,'won',won);
END $$;

REVOKE ALL ON FUNCTION public._arena_window(), public._arena_team_json(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.arena_event_state(uuid), public.arena_event_form(uuid), public.arena_event_join(uuid,text), public.arena_event_leave(uuid), public.arena_event_queue(uuid), public.arena_event_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.arena_event_state(uuid), public.arena_event_form(uuid), public.arena_event_join(uuid,text), public.arena_event_leave(uuid), public.arena_event_queue(uuid), public.arena_event_claim(uuid) TO authenticated;
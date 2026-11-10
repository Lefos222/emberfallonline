CREATE TABLE public.guild_raid_hits (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid UNIQUE NOT NULL,
 guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 hero_name text NOT NULL,
 window_start timestamptz NOT NULL,
 damage integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.guild_raid_hits TO service_role;
ALTER TABLE public.guild_raid_hits ENABLE ROW LEVEL SECURITY;
CREATE INDEX guild_raid_hits_window ON public.guild_raid_hits(guild_id, window_start);

CREATE TABLE public.guild_raid_claims (
 guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 window_start timestamptz NOT NULL,
 claimed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (hero_id, window_start)
);
GRANT ALL ON public.guild_raid_claims TO service_role;
ALTER TABLE public.guild_raid_claims ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guild_quest_progress (
 guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
 week date NOT NULL,
 kind text NOT NULL,
 amount bigint NOT NULL DEFAULT 0,
 PRIMARY KEY (guild_id, week, kind)
);
GRANT ALL ON public.guild_quest_progress TO service_role;
ALTER TABLE public.guild_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guild_quest_daily (
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 day date NOT NULL,
 kind text NOT NULL,
 amount integer NOT NULL DEFAULT 0,
 PRIMARY KEY (hero_id, day, kind)
);
GRANT ALL ON public.guild_quest_daily TO service_role;
ALTER TABLE public.guild_quest_daily ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guild_quest_claims (
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 week date NOT NULL,
 kind text NOT NULL,
 claimed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (hero_id, week, kind)
);
GRANT ALL ON public.guild_quest_claims TO service_role;
ALTER TABLE public.guild_quest_claims ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guild_tournament_claims (
 hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 week date NOT NULL,
 rank integer NOT NULL,
 claimed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (hero_id, week)
);
GRANT ALL ON public.guild_tournament_claims TO service_role;
ALTER TABLE public.guild_tournament_claims ENABLE ROW LEVEL SECURITY;

-- Raid windows: a guild boss opens every 4 hours (UTC 00,04,...) for 60 minutes.
CREATE OR REPLACE FUNCTION public._raid_window(_at timestamptz DEFAULT now()) RETURNS timestamptz LANGUAGE sql STABLE AS $$
 SELECT (date_trunc('hour', _at AT TIME ZONE 'utc') - make_interval(hours => (extract(hour FROM _at AT TIME ZONE 'utc')::int % 4))) AT TIME ZONE 'utc'
$$;
CREATE OR REPLACE FUNCTION public._week(_at timestamptz DEFAULT now()) RETURNS date LANGUAGE sql STABLE AS $$
 SELECT date_trunc('week', _at AT TIME ZONE 'utc')::date
$$;
CREATE OR REPLACE FUNCTION public._raid_boss_hp(_guild uuid) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT (20000 * greatest(3, (SELECT count(*) FROM public.guild_members WHERE guild_id=_guild)))::int
$$;
CREATE OR REPLACE FUNCTION public._quest_target(_kind text) RETURNS bigint LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE _kind WHEN 'battles' THEN 300 WHEN 'raid' THEN 40 WHEN 'gold' THEN 500000 WHEN 'kills' THEN 3 ELSE NULL END::bigint
$$;
CREATE OR REPLACE FUNCTION public._quest_bump(_guild uuid, _kind text, _n bigint) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 INSERT INTO public.guild_quest_progress(guild_id,week,kind,amount) VALUES(_guild,public._week(),_kind,_n)
 ON CONFLICT (guild_id,week,kind) DO UPDATE SET amount=public.guild_quest_progress.amount+excluded.amount
$$;

-- Tournament points for one guild and week: Guild War wins 10, draws 5, raid boss kills 3, completed quests 2.
CREATE OR REPLACE FUNCTION public._tournament_points(_guild uuid, _week date) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT (
  coalesce((SELECT sum(CASE WHEN (w.guild_a=_guild AND w.score_a>w.score_b) OR (w.guild_b=_guild AND w.score_b>w.score_a) THEN 10 WHEN w.score_a=w.score_b THEN 5 ELSE 0 END)
   FROM public.guild_wars w WHERE (w.guild_a=_guild OR w.guild_b=_guild) AND w.status='settled' AND public._week(coalesce(w.settled_at,w.ends_at))=_week),0)
  + 3*(SELECT count(*) FROM (SELECT h.window_start FROM public.guild_raid_hits h WHERE h.guild_id=_guild AND public._week(h.window_start)=_week
       GROUP BY h.window_start HAVING sum(h.damage) >= public._raid_boss_hp(_guild)) k)
  + 2*(SELECT count(*) FROM public.guild_quest_progress q WHERE q.guild_id=_guild AND q.week=_week AND q.amount >= public._quest_target(q.kind))
 )::int
$$;

CREATE OR REPLACE FUNCTION public.guild_events_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; win timestamptz := public._raid_window(); wk date := public._week(); hp int; dealt bigint; mine int; prev timestamptz := public._raid_window() - interval '4 hours';
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 hp := public._raid_boss_hp(m.guild_id);
 SELECT coalesce(sum(damage),0) INTO dealt FROM public.guild_raid_hits WHERE guild_id=m.guild_id AND window_start=win;
 SELECT count(*) INTO mine FROM public.guild_raid_hits WHERE hero_id=_hero AND window_start=win;
 RETURN jsonb_build_object(
  'raid', jsonb_build_object('window', win, 'opens_until', win + interval '60 minutes', 'next', win + interval '4 hours',
    'open', now() < win + interval '60 minutes', 'hp', hp, 'dealt', dealt, 'my_hits', mine,
    'claimable', (SELECT coalesce(jsonb_agg(w),'[]'::jsonb) FROM (
       SELECT x.window_start AS w FROM public.guild_raid_hits x WHERE x.hero_id=_hero AND x.window_start >= now() - interval '7 days'
         AND NOT EXISTS (SELECT 1 FROM public.guild_raid_claims c WHERE c.hero_id=_hero AND c.window_start=x.window_start)
         AND (SELECT sum(y.damage) FROM public.guild_raid_hits y WHERE y.guild_id=m.guild_id AND y.window_start=x.window_start) >= hp
       GROUP BY x.window_start) z),
    'board', (SELECT coalesce(jsonb_agg(b ORDER BY b.dmg DESC),'[]'::jsonb) FROM (SELECT hero_name AS name, sum(damage) AS dmg FROM public.guild_raid_hits WHERE guild_id=m.guild_id AND window_start=win GROUP BY hero_name) b)),
  'quests', (SELECT jsonb_agg(jsonb_build_object('kind',k,'target',public._quest_target(k),
      'amount',coalesce((SELECT amount FROM public.guild_quest_progress WHERE guild_id=m.guild_id AND week=wk AND kind=k),0),
      'claimed',EXISTS(SELECT 1 FROM public.guild_quest_claims WHERE hero_id=_hero AND week=wk AND kind=k)))
     FROM unnest(ARRAY['battles','raid','gold','kills']) k),
  'week', wk, 'week_ends', (wk + 7)::timestamp AT TIME ZONE 'utc',
  'tournament', (SELECT coalesce(jsonb_agg(t ORDER BY t.points DESC, t.name),'[]'::jsonb) FROM (
     SELECT g.id, g.name, g.emblem, public._tournament_points(g.id, wk) AS points FROM public.guilds g) t WHERE t.points > 0 OR t.id = m.guild_id),
  'last_week', (SELECT jsonb_build_object('rank', r.rank, 'points', r.points, 'claimed', EXISTS(SELECT 1 FROM public.guild_tournament_claims c WHERE c.hero_id=_hero AND c.week=wk-7)) FROM (
     SELECT g.id, public._tournament_points(g.id, wk-7) AS points, rank() OVER (ORDER BY public._tournament_points(g.id, wk-7) DESC) AS rank FROM public.guilds g) r
     WHERE r.id = m.guild_id AND r.points > 0),
  'guild', m.guild_id);
END $$;

CREATE OR REPLACE FUNCTION public.guild_raid_hit(_hero uuid, _won boolean, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; win timestamptz := public._raid_window(); n int; dmg int; before bigint; hp int;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF EXISTS(SELECT 1 FROM public.guild_raid_hits WHERE request_id=_req) THEN
  RETURN jsonb_build_object('damage',(SELECT damage FROM public.guild_raid_hits WHERE request_id=_req),'repeat',true); END IF;
 IF now() >= win + interval '60 minutes' THEN RAISE EXCEPTION 'The guild boss is not awake — it returns at the next raid window'; END IF;
 SELECT count(*) INTO n FROM public.guild_raid_hits WHERE hero_id=_hero AND window_start=win;
 IF n >= 3 THEN RAISE EXCEPTION 'You have used all 3 raid attacks for this window'; END IF;
 SELECT coalesce(sum(damage),0) INTO before FROM public.guild_raid_hits WHERE guild_id=m.guild_id AND window_start=win;
 hp := public._raid_boss_hp(m.guild_id);
 dmg := round((900 + h.level * 140) * CASE WHEN _won THEN 1 ELSE 0.3 END)::int;
 INSERT INTO public.guild_raid_hits(request_id,guild_id,hero_id,hero_name,window_start,damage) VALUES(_req,m.guild_id,_hero,h.name,win,dmg);
 PERFORM public._quest_bump(m.guild_id,'raid',1);
 IF before < hp AND before + dmg >= hp THEN PERFORM public._quest_bump(m.guild_id,'kills',1); END IF;
 RETURN jsonb_build_object('damage',dmg,'repeat',false,'slain',before + dmg >= hp);
END $$;

CREATE OR REPLACE FUNCTION public.guild_raid_claim(_hero uuid, _window timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; rw jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF NOT EXISTS(SELECT 1 FROM public.guild_raid_hits WHERE hero_id=_hero AND window_start=_window) THEN RAISE EXCEPTION 'You did not fight that raid'; END IF;
 IF (SELECT sum(damage) FROM public.guild_raid_hits WHERE guild_id=m.guild_id AND window_start=_window) < public._raid_boss_hp(m.guild_id) THEN RAISE EXCEPTION 'That boss was not slain'; END IF;
 INSERT INTO public.guild_raid_claims(guild_id,hero_id,window_start) VALUES(m.guild_id,_hero,_window) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RAISE EXCEPTION 'Already claimed'; END IF;
 rw := jsonb_build_object('gold', 1500 + h.level*60, 'mats', jsonb_build_object('bossCore',1,'starshard',2,'essence',4));
 s := public._apply_reward(h.save, rw); PERFORM public._write_save(_hero, s);
 RETURN jsonb_build_object('save',s,'reward',rw);
END $$;

-- Battles are reported by the client after a won fight, capped at 40 per hero per day.
CREATE OR REPLACE FUNCTION public.guild_quest_battle(_hero uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.guild_members; d date := (now() AT TIME ZONE 'utc')::date; n int;
BEGIN
 PERFORM public._my_hero(_hero);
 SELECT * INTO m FROM public.guild_members WHERE hero_id=_hero; IF m.hero_id IS NULL THEN RETURN; END IF;
 INSERT INTO public.guild_quest_daily(hero_id,day,kind,amount) VALUES(_hero,d,'battles',1)
  ON CONFLICT (hero_id,day,kind) DO UPDATE SET amount=public.guild_quest_daily.amount+1 RETURNING amount INTO n;
 IF n <= 40 THEN PERFORM public._quest_bump(m.guild_id,'battles',1); END IF;
END $$;

CREATE OR REPLACE FUNCTION public.guild_quest_donate(_hero uuid, _gold integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF _gold IS NULL OR _gold < 1000 OR _gold > 1000000 THEN RAISE EXCEPTION 'Donate between 1,000 and 1,000,000 gold'; END IF;
 IF public._num(h.save->'gold') < _gold THEN RAISE EXCEPTION 'Not enough gold'; END IF;
 s := jsonb_set(h.save,'{gold}',to_jsonb(round(public._num(h.save->'gold') - _gold)),true);
 PERFORM public._write_save(_hero, s);
 PERFORM public._quest_bump(m.guild_id,'gold',_gold);
 RETURN jsonb_build_object('save',s);
END $$;

CREATE OR REPLACE FUNCTION public.guild_quest_claim(_hero uuid, _kind text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; wk date := public._week(); s jsonb; rw jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF public._quest_target(_kind) IS NULL THEN RAISE EXCEPTION 'Unknown guild quest'; END IF;
 IF coalesce((SELECT amount FROM public.guild_quest_progress WHERE guild_id=m.guild_id AND week=wk AND kind=_kind),0) < public._quest_target(_kind) THEN RAISE EXCEPTION 'The guild has not finished that quest yet'; END IF;
 INSERT INTO public.guild_quest_claims(hero_id,week,kind) VALUES(_hero,wk,_kind) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RAISE EXCEPTION 'Already claimed this week'; END IF;
 rw := CASE _kind
  WHEN 'battles' THEN jsonb_build_object('gold',3000+h.level*50,'mats',jsonb_build_object('ore',20,'hide',10))
  WHEN 'raid' THEN jsonb_build_object('gold',2500+h.level*40,'mats',jsonb_build_object('bossCore',1,'sigil',2))
  WHEN 'gold' THEN jsonb_build_object('mats',jsonb_build_object('starshard',4,'frostCrystal',2,'enchantStone',2))
  ELSE jsonb_build_object('gold',4000+h.level*60,'mats',jsonb_build_object('voidCrystal',1,'fragment',6)) END;
 s := public._apply_reward(h.save, rw); PERFORM public._write_save(_hero, s);
 RETURN jsonb_build_object('save',s,'reward',rw);
END $$;

CREATE OR REPLACE FUNCTION public.guild_tournament_claim(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; wk date := public._week() - 7; r int; pts int; s jsonb; rw jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF m.joined_at > (wk + 7)::timestamp AT TIME ZONE 'utc' THEN RAISE EXCEPTION 'You joined after last week''s tournament'; END IF;
 SELECT x.rank, x.points INTO r, pts FROM (SELECT g.id, public._tournament_points(g.id, wk) AS points, rank() OVER (ORDER BY public._tournament_points(g.id, wk) DESC) AS rank FROM public.guilds g) x WHERE x.id=m.guild_id;
 IF pts IS NULL OR pts <= 0 THEN RAISE EXCEPTION 'Your guild scored no tournament points last week'; END IF;
 INSERT INTO public.guild_tournament_claims(hero_id,week,rank) VALUES(_hero,wk,r) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RAISE EXCEPTION 'Already claimed'; END IF;
 rw := CASE WHEN r=1 THEN jsonb_build_object('gold',25000,'mats',jsonb_build_object('sunCrystal',1,'voidCrystal',2,'starshard',8))
  WHEN r=2 THEN jsonb_build_object('gold',15000,'mats',jsonb_build_object('voidCrystal',2,'starshard',5))
  WHEN r=3 THEN jsonb_build_object('gold',10000,'mats',jsonb_build_object('voidCrystal',1,'starshard',3))
  WHEN r<=10 THEN jsonb_build_object('gold',5000,'mats',jsonb_build_object('frostCrystal',2,'starshard',2))
  ELSE jsonb_build_object('gold',2000,'mats',jsonb_build_object('starshard',1)) END;
 s := public._apply_reward(h.save, rw); PERFORM public._write_save(_hero, s);
 RETURN jsonb_build_object('save',s,'reward',rw,'rank',r);
END $$;

REVOKE ALL ON FUNCTION public.guild_events_state(uuid), public.guild_raid_hit(uuid,boolean,uuid), public.guild_raid_claim(uuid,timestamptz),
 public.guild_quest_battle(uuid), public.guild_quest_donate(uuid,integer), public.guild_quest_claim(uuid,text), public.guild_tournament_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guild_events_state(uuid), public.guild_raid_hit(uuid,boolean,uuid), public.guild_raid_claim(uuid,timestamptz),
 public.guild_quest_battle(uuid), public.guild_quest_donate(uuid,integer), public.guild_quest_claim(uuid,text), public.guild_tournament_claim(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public._raid_boss_hp(uuid), public._quest_bump(uuid,text,bigint), public._tournament_points(uuid,date) FROM PUBLIC, anon, authenticated;
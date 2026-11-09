-- Guild Wars: two guilds fight a 24-hour war.
--
-- Every member may attack any enemy hero twice. A won fight is a point, the guild with the most
-- points when the war ends takes the spoils, and the losing guild still earns a smaller reward.
-- Declaring a war is a leader/officer action; the reward is claimed once per member through a
-- SECURITY DEFINER RPC that writes the hero's save, so the payout stays server-owned.

CREATE TABLE public.guild_wars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_a uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  guild_b uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  started_by uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  score_a int NOT NULL DEFAULT 0,
  score_b int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled')),
  settled_at timestamptz,
  CONSTRAINT guild_wars_distinct CHECK (guild_a <> guild_b)
);
CREATE INDEX guild_wars_a_idx ON public.guild_wars (guild_a, status);
CREATE INDEX guild_wars_b_idx ON public.guild_wars (guild_b, status);

GRANT SELECT ON public.guild_wars TO authenticated;
GRANT ALL ON public.guild_wars TO service_role;
ALTER TABLE public.guild_wars ENABLE ROW LEVEL SECURITY;
CREATE POLICY guild_wars_read ON public.guild_wars FOR SELECT TO authenticated
  USING (guild_a IN (SELECT public.my_guild_ids()) OR guild_b IN (SELECT public.my_guild_ids()));

CREATE TABLE public.guild_war_attacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid NOT NULL REFERENCES public.guild_wars(id) ON DELETE CASCADE,
  guild_id uuid NOT NULL,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  hero_name text NOT NULL,
  target_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  target_name text NOT NULL,
  won boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guild_war_attacks_hero_idx ON public.guild_war_attacks (war_id, hero_id, target_id);
CREATE INDEX guild_war_attacks_war_idx ON public.guild_war_attacks (war_id, created_at DESC);

GRANT SELECT ON public.guild_war_attacks TO authenticated;
GRANT ALL ON public.guild_war_attacks TO service_role;
ALTER TABLE public.guild_war_attacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY guild_war_attacks_read ON public.guild_war_attacks FOR SELECT TO authenticated
USING (war_id IN (
  SELECT id FROM public.guild_wars WHERE guild_a IN (SELECT public.my_guild_ids()) OR guild_b IN (SELECT public.my_guild_ids())
));

CREATE TABLE public.guild_war_claims (
  war_id uuid NOT NULL REFERENCES public.guild_wars(id) ON DELETE CASCADE,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  gold int NOT NULL,
  mats jsonb NOT NULL DEFAULT '{}'::jsonb,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (war_id, hero_id)
);

GRANT SELECT ON public.guild_war_claims TO authenticated;
GRANT ALL ON public.guild_war_claims TO service_role;
ALTER TABLE public.guild_war_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY guild_war_claims_read ON public.guild_war_claims FOR SELECT TO authenticated
  USING (hero_id IN (SELECT public.my_hero_ids()));

-- Close every war whose 24 hours are up.
CREATE OR REPLACE FUNCTION public._settle_guild_war(_war uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.guild_wars SET status = 'settled', settled_at = now()
   WHERE id = _war AND status = 'open' AND ends_at <= now();
END $$;

-- Declare war on another guild. Only the leader or an officer may declare, and a guild can be in
-- one war at a time.
CREATE OR REPLACE FUNCTION public.guild_war_start(_hero uuid, _guild uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w uuid;
BEGIN
  me := public._guild_role(_hero);
  IF me.role NOT IN ('leader', 'officer') THEN
    RAISE EXCEPTION 'Only the leader and officers can declare war';
  END IF;
  IF _guild = me.guild_id THEN RAISE EXCEPTION 'Pick another guild'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guilds WHERE id = _guild) THEN RAISE EXCEPTION 'Guild not found'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.guild_wars
     WHERE status = 'open' AND (guild_a IN (me.guild_id, _guild) OR guild_b IN (me.guild_id, _guild))
  ) THEN
    RAISE EXCEPTION 'One of these guilds is already at war';
  END IF;
  INSERT INTO public.guild_wars (guild_a, guild_b, started_by, ends_at)
    VALUES (me.guild_id, _guild, _hero, now() + interval '24 hours')
    RETURNING id INTO w;
  RETURN w;
END $$;

-- My guild's open war (settling it first when its time is up) plus the last ten wars it fought.
CREATE OR REPLACE FUNCTION public.guild_war_state(_hero uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; side text; opp uuid; out jsonb;
BEGIN
  me := public._guild_role(_hero);
  SELECT * INTO w FROM public.guild_wars
   WHERE status = 'open' AND (guild_a = me.guild_id OR guild_b = me.guild_id)
   ORDER BY started_at DESC LIMIT 1;
  IF w.id IS NOT NULL THEN
    PERFORM public._settle_guild_war(w.id);
    SELECT * INTO w FROM public.guild_wars WHERE id = w.id;
    IF w.status <> 'open' THEN w.id := NULL; END IF;
  END IF;

  IF w.id IS NOT NULL THEN
    side := CASE WHEN w.guild_a = me.guild_id THEN 'a' ELSE 'b' END;
    opp := CASE WHEN side = 'a' THEN w.guild_b ELSE w.guild_a END;
    out := jsonb_build_object(
      'id', w.id,
      'side', side,
      'my_score', CASE WHEN side = 'a' THEN w.score_a ELSE w.score_b END,
      'their_score', CASE WHEN side = 'a' THEN w.score_b ELSE w.score_a END,
      'starts_at', w.started_at,
      'ends_at', w.ends_at,
      'opponent', (SELECT jsonb_build_object('id', g.id, 'name', g.name, 'level', g.level)
                     FROM public.guilds g WHERE g.id = opp),
      'enemies', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
          'id', h.id, 'name', h.name, 'level', h.level, 'power', h.power,
          'hero_class', h.hero_class, 'gender', h.gender,
          'attacks', (SELECT count(*) FROM public.guild_war_attacks a
                       WHERE a.war_id = w.id AND a.hero_id = _hero AND a.target_id = h.id))
          ORDER BY h.power DESC)
          FROM public.guild_members m JOIN public.heroes h ON h.id = m.hero_id
         WHERE m.guild_id = opp
      ), '[]'::jsonb)
    );
  ELSE
    out := NULL;
  END IF;

  RETURN jsonb_build_object(
    'guild', me.guild_id,
    'war', out,
    'history', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id,
        'ends_at', g.ends_at,
        'result', CASE WHEN g.mine > g.theirs THEN 'win' WHEN g.mine < g.theirs THEN 'loss' ELSE 'draw' END,
        'my_score', g.mine,
        'their_score', g.theirs,
        'opponent', (SELECT name FROM public.guilds WHERE id = CASE WHEN g.guild_a = me.guild_id THEN g.guild_b ELSE g.guild_a END),
        'claimed', EXISTS (SELECT 1 FROM public.guild_war_claims c WHERE c.war_id = g.id AND c.hero_id = _hero)
      ) ORDER BY g.ends_at DESC)
      FROM (
        SELECT g2.*,
               CASE WHEN g2.guild_a = me.guild_id THEN g2.score_a ELSE g2.score_b END AS mine,
               CASE WHEN g2.guild_a = me.guild_id THEN g2.score_b ELSE g2.score_a END AS theirs
          FROM public.guild_wars g2
         WHERE g2.status = 'settled' AND (g2.guild_a = me.guild_id OR g2.guild_b = me.guild_id)
         ORDER BY g2.ends_at DESC LIMIT 10
      ) g
    ), '[]'::jsonb)
  );
END $$;

-- Report one attack. The client fights the battle; this records it, spends one of the hero's two
-- attempts against that enemy and adds the point to the winning guild's score.
CREATE OR REPLACE FUNCTION public.guild_war_attack(_hero uuid, _war uuid, _target uuid, _won boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; h public.heroes; t public.heroes;
        side text; enemy_guild uuid; used int;
BEGIN
  me := public._guild_role(_hero);
  SELECT * INTO w FROM public.guild_wars WHERE id = _war FOR UPDATE;
  IF w.id IS NULL THEN RAISE EXCEPTION 'War not found'; END IF;
  IF w.status <> 'open' OR now() >= w.ends_at THEN RAISE EXCEPTION 'This war has ended'; END IF;
  side := CASE WHEN w.guild_a = me.guild_id THEN 'a' WHEN w.guild_b = me.guild_id THEN 'b' ELSE NULL END;
  IF side IS NULL THEN RAISE EXCEPTION 'Your guild is not in this war'; END IF;
  enemy_guild := CASE WHEN side = 'a' THEN w.guild_b ELSE w.guild_a END;
  SELECT * INTO t FROM public.heroes WHERE id = _target;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Enemy hero not found'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = _target AND guild_id = enemy_guild) THEN
    RAISE EXCEPTION 'That hero is not in the enemy guild';
  END IF;
  SELECT count(*) INTO used FROM public.guild_war_attacks
   WHERE war_id = _war AND hero_id = _hero AND target_id = _target;
  IF used >= 2 THEN RAISE EXCEPTION 'You have already attacked this hero twice'; END IF;

  h := public._my_hero(_hero);
  INSERT INTO public.guild_war_attacks (war_id, guild_id, hero_id, hero_name, target_id, target_name, won)
    VALUES (_war, me.guild_id, _hero, h.name, _target, t.name, _won);
  IF _won THEN
    IF side = 'a' THEN
      UPDATE public.guild_wars SET score_a = score_a + 1 WHERE id = _war;
    ELSE
      UPDATE public.guild_wars SET score_b = score_b + 1 WHERE id = _war;
    END IF;
  END IF;

  SELECT * INTO w FROM public.guild_wars WHERE id = _war;
  RETURN jsonb_build_object(
    'my_score', CASE WHEN side = 'a' THEN w.score_a ELSE w.score_b END,
    'their_score', CASE WHEN side = 'a' THEN w.score_b ELSE w.score_a END,
    'attacks_left', 1 - used
  );
END $$;

-- Collect the spoils of a settled war. The winner is paid more; the loser is still paid.
CREATE OR REPLACE FUNCTION public.guild_war_claim(_hero uuid, _war uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; h public.heroes; s jsonb;
        mine int; theirs int; lvl int; gold int; mats jsonb;
BEGIN
  me := public._guild_role(_hero);
  SELECT * INTO w FROM public.guild_wars WHERE id = _war;
  IF w.id IS NULL THEN RAISE EXCEPTION 'War not found'; END IF;
  PERFORM public._settle_guild_war(_war);
  SELECT * INTO w FROM public.guild_wars WHERE id = _war;
  IF w.status <> 'settled' THEN RAISE EXCEPTION 'This war is still running'; END IF;
  IF NOT (w.guild_a = me.guild_id OR w.guild_b = me.guild_id) THEN
    RAISE EXCEPTION 'Your guild did not fight this war';
  END IF;
  IF EXISTS (SELECT 1 FROM public.guild_war_claims WHERE war_id = _war AND hero_id = _hero) THEN
    RAISE EXCEPTION 'Reward already claimed';
  END IF;

  mine := CASE WHEN w.guild_a = me.guild_id THEN w.score_a ELSE w.score_b END;
  theirs := CASE WHEN w.guild_a = me.guild_id THEN w.score_b ELSE w.score_a END;
  h := public._my_hero(_hero);
  lvl := greatest(1, public._num(h.save->'level')::int);
  IF mine > theirs THEN
    gold := 3000 + lvl * 40;
    mats := '{"starshard": 2, "bossCore": 1}'::jsonb;
  ELSIF mine = theirs THEN
    gold := 2200 + lvl * 28;
    mats := '{"starshard": 1}'::jsonb;
  ELSE
    gold := 1200 + lvl * 15;
    mats := '{}'::jsonb;
  END IF;

  INSERT INTO public.guild_war_claims (war_id, hero_id, gold, mats) VALUES (_war, _hero, gold, mats);
  s := public._apply_reward(h.save, jsonb_build_object('gold', gold, 'mats', mats));
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('save', s, 'gold', gold, 'mats', mats,
                            'won', mine > theirs, 'draw', mine = theirs);
END $$;

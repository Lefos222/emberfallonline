-- Guild Wars v2 — challenges the other guild must accept, size brackets and two attacks per hero.
--
-- A war is declared as a CHALLENGE: the declaring guild's leader or officer picks an opponent and a
-- bracket (5v5, 10v10 … 100v100). The challenged guild's leader or officer accepts or declines; only
-- then does the war open. When it opens, each side's roster is frozen as its `size` strongest
-- members, every hero on a roster gets TWO attacks for the whole war, and a won attack scores one
-- point. Most points when the 24 hours are up wins; both sides are paid, the winner more.
--
-- Builds on 0021_guild_wars.sql (guild_wars, guild_war_attacks, guild_war_claims, _settle_guild_war).

-- ---------------------------------------------------------------- war shape

ALTER TABLE public.guild_wars ADD COLUMN IF NOT EXISTS size int;
UPDATE public.guild_wars SET size = 5 WHERE size IS NULL;
ALTER TABLE public.guild_wars ALTER COLUMN size SET DEFAULT 5;
ALTER TABLE public.guild_wars ALTER COLUMN size SET NOT NULL;
ALTER TABLE public.guild_wars ADD COLUMN IF NOT EXISTS decided_at timestamptz;

-- A pending challenge, an open war, a challenge the defender turned down, and a settled war.
ALTER TABLE public.guild_wars DROP CONSTRAINT IF EXISTS guild_wars_status_check;
ALTER TABLE public.guild_wars ADD CONSTRAINT guild_wars_status_check
  CHECK (status IN ('pending', 'open', 'declined', 'settled'));

-- Only the published brackets: 5v5 through 100v100 in fives.
ALTER TABLE public.guild_wars DROP CONSTRAINT IF EXISTS guild_wars_size_check;
ALTER TABLE public.guild_wars ADD CONSTRAINT guild_wars_size_check
  CHECK (size BETWEEN 5 AND 100 AND size % 5 = 0);

CREATE INDEX IF NOT EXISTS guild_wars_status_idx ON public.guild_wars (status, ends_at);

-- The frozen roster of each side: the `size` strongest members at the moment the war opened.
CREATE TABLE IF NOT EXISTS public.guild_war_rosters (
  war_id uuid NOT NULL REFERENCES public.guild_wars(id) ON DELETE CASCADE,
  guild_id uuid NOT NULL,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  power bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (war_id, hero_id)
);
CREATE INDEX IF NOT EXISTS guild_war_rosters_guild_idx ON public.guild_war_rosters (war_id, guild_id);

GRANT SELECT ON public.guild_war_rosters TO authenticated;
GRANT ALL ON public.guild_war_rosters TO service_role;
ALTER TABLE public.guild_war_rosters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guild_war_rosters_read ON public.guild_war_rosters;
CREATE POLICY guild_war_rosters_read ON public.guild_war_rosters FOR SELECT TO authenticated
USING (war_id IN (
  SELECT id FROM public.guild_wars
   WHERE guild_a IN (SELECT public.my_guild_ids()) OR guild_b IN (SELECT public.my_guild_ids())
));

-- ---------------------------------------------------------------- challenges

-- Declare war (create a challenge) against another guild in a bracket. Its leader or officer
-- answers with guild_war_respond.
DROP FUNCTION IF EXISTS public.guild_war_start(uuid, uuid);
CREATE OR REPLACE FUNCTION public.guild_war_start(_hero uuid, _guild uuid, _size int DEFAULT 5)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w uuid;
BEGIN
  me := public._guild_role(_hero);
  IF me.role NOT IN ('leader', 'officer') THEN
    RAISE EXCEPTION 'Only the leader and officers can declare war';
  END IF;
  IF _guild = me.guild_id THEN RAISE EXCEPTION 'Pick another guild'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guilds WHERE id = _guild) THEN RAISE EXCEPTION 'Guild not found'; END IF;
  IF _size IS NULL OR _size < 5 OR _size > 100 OR _size % 5 <> 0 THEN
    RAISE EXCEPTION 'Choose a bracket from 5v5 to 100v100 in steps of five';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.guild_wars
     WHERE status = 'open' AND (guild_a IN (me.guild_id, _guild) OR guild_b IN (me.guild_id, _guild))
  ) THEN
    RAISE EXCEPTION 'One of these guilds is already at war';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.guild_wars
     WHERE status = 'pending' AND guild_a = me.guild_id AND guild_b = _guild
  ) THEN
    RAISE EXCEPTION 'A challenge to this guild is already waiting for an answer';
  END IF;

  INSERT INTO public.guild_wars (guild_a, guild_b, started_by, size, status, ends_at)
    VALUES (me.guild_id, _guild, _hero, _size, 'pending', now() + interval '2 days')
    RETURNING id INTO w;
  RETURN w;
END $$;

-- Answer a challenge as the challenged guild's leader or officer. Accepting freezes both rosters
-- and opens the 24-hour war; declining closes the challenge.
CREATE OR REPLACE FUNCTION public.guild_war_respond(_hero uuid, _war uuid, _accept boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; g uuid;
BEGIN
  me := public._guild_role(_hero);
  SELECT * INTO w FROM public.guild_wars WHERE id = _war FOR UPDATE;
  IF w.id IS NULL THEN RAISE EXCEPTION 'Challenge not found'; END IF;
  IF w.status <> 'pending' THEN RAISE EXCEPTION 'This challenge has already been answered'; END IF;
  IF w.ends_at <= now() THEN
    UPDATE public.guild_wars SET status = 'declined', decided_at = now() WHERE id = _war;
    RAISE EXCEPTION 'This challenge has expired';
  END IF;
  IF me.role NOT IN ('leader', 'officer') THEN
    RAISE EXCEPTION 'Only the leader and officers can answer a challenge';
  END IF;
  IF w.guild_b <> me.guild_id THEN
    RAISE EXCEPTION 'Only the challenged guild can answer this challenge';
  END IF;

  IF NOT _accept THEN
    UPDATE public.guild_wars SET status = 'declined', decided_at = now() WHERE id = _war;
    RETURN jsonb_build_object('status', 'declined');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.guild_wars
     WHERE status = 'open' AND (guild_a IN (w.guild_a, w.guild_b) OR guild_b IN (w.guild_a, w.guild_b))
  ) THEN
    RAISE EXCEPTION 'One of these guilds is already at war';
  END IF;

  -- Freeze each side's roster: the bracket's worth of strongest members.
  DELETE FROM public.guild_war_rosters WHERE war_id = _war;
  FOREACH g IN ARRAY ARRAY[w.guild_a, w.guild_b] LOOP
    INSERT INTO public.guild_war_rosters (war_id, guild_id, hero_id, power)
    SELECT _war, g, h.id, coalesce(h.power, 0)
      FROM public.guild_members m JOIN public.heroes h ON h.id = m.hero_id
     WHERE m.guild_id = g
     ORDER BY coalesce(h.power, 0) DESC, h.level DESC
     LIMIT w.size;
  END LOOP;

  UPDATE public.guild_wars
     SET status = 'open', started_at = now(), ends_at = now() + interval '24 hours',
         decided_at = now(), score_a = 0, score_b = 0
   WHERE id = _war
   RETURNING * INTO w;
  RETURN jsonb_build_object('status', 'open', 'ends_at', w.ends_at, 'size', w.size);
END $$;

-- Withdraw a challenge that has not been answered yet (the declaring guild's leader or officer).
CREATE OR REPLACE FUNCTION public.guild_war_cancel(_hero uuid, _war uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars;
BEGIN
  me := public._guild_role(_hero);
  SELECT * INTO w FROM public.guild_wars WHERE id = _war;
  IF w.id IS NULL THEN RAISE EXCEPTION 'Challenge not found'; END IF;
  IF me.role NOT IN ('leader', 'officer') OR w.guild_a <> me.guild_id THEN
    RAISE EXCEPTION 'Only the guild that declared this challenge can withdraw it';
  END IF;
  IF w.status <> 'pending' THEN RAISE EXCEPTION 'This challenge has already been answered'; END IF;
  UPDATE public.guild_wars SET status = 'declined', decided_at = now() WHERE id = _war;
END $$;

-- ---------------------------------------------------------------- state

-- My guild's open war, the challenges waiting on either side, and the last ten finished wars.
CREATE OR REPLACE FUNCTION public.guild_war_state(_hero uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; side text; opp uuid; out jsonb; used int;
BEGIN
  me := public._guild_role(_hero);

  -- An unanswered challenge expires after two days.
  UPDATE public.guild_wars SET status = 'declined', decided_at = now()
   WHERE status = 'pending' AND ends_at <= now();

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
    SELECT count(*) INTO used FROM public.guild_war_attacks
     WHERE war_id = w.id AND hero_id = _hero;
    out := jsonb_build_object(
      'id', w.id,
      'side', side,
      'size', w.size,
      'my_score', CASE WHEN side = 'a' THEN w.score_a ELSE w.score_b END,
      'their_score', CASE WHEN side = 'a' THEN w.score_b ELSE w.score_a END,
      'starts_at', w.started_at,
      'ends_at', w.ends_at,
      'attacks_left', greatest(0, 2 - used),
      'opponent', (SELECT jsonb_build_object('id', g.id, 'name', g.name, 'level', g.level)
                     FROM public.guilds g WHERE g.id = opp),
      'enemies', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
          'id', h.id, 'name', h.name, 'level', h.level, 'power', h.power,
          'hero_class', h.hero_class, 'gender', h.gender,
          'attacks', (SELECT count(*) FROM public.guild_war_attacks a
                       WHERE a.war_id = w.id AND a.hero_id = _hero AND a.target_id = h.id))
          ORDER BY coalesce(r.power, h.power) DESC)
          FROM public.guild_war_rosters r JOIN public.heroes h ON h.id = r.hero_id
         WHERE r.war_id = w.id AND r.guild_id = opp
      ), '[]'::jsonb)
    );
  ELSE
    out := NULL;
  END IF;

  RETURN jsonb_build_object(
    'guild', me.guild_id,
    'war', out,
    'challenges', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id,
        'size', c.size,
        'outgoing', c.guild_a = me.guild_id,
        'created_at', c.started_at,
        'expires_at', c.ends_at,
        'guild', (SELECT jsonb_build_object('id', g.id, 'name', g.name, 'level', g.level)
                    FROM public.guilds g
                    WHERE g.id = CASE WHEN c.guild_a = me.guild_id THEN c.guild_b ELSE c.guild_a END)
      ) ORDER BY c.started_at DESC)
      FROM public.guild_wars c
     WHERE c.status = 'pending' AND (c.guild_a = me.guild_id OR c.guild_b = me.guild_id)
    ), '[]'::jsonb),
    'history', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', g.id,
        'size', g.size,
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

-- ---------------------------------------------------------------- attacks

-- Report one attack. The client fights the battle; this records it, spends one of the hero's TWO
-- attacks for the whole war and adds the point to the winning guild's score.
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

  -- Both heroes must be on the rosters the war opened with.
  IF EXISTS (SELECT 1 FROM public.guild_war_rosters WHERE war_id = _war) THEN
    IF NOT EXISTS (SELECT 1 FROM public.guild_war_rosters WHERE war_id = _war AND hero_id = _hero) THEN
      RAISE EXCEPTION 'You are not on this war''s roster';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.guild_war_rosters WHERE war_id = _war AND hero_id = _target AND guild_id = enemy_guild) THEN
      RAISE EXCEPTION 'That hero is not on the enemy roster';
    END IF;
  END IF;

  SELECT count(*) INTO used FROM public.guild_war_attacks WHERE war_id = _war AND hero_id = _hero;
  IF used >= 2 THEN RAISE EXCEPTION 'You have used both of your attacks in this war'; END IF;

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
    'attacks_left', greatest(0, 2 - used - 1)
  );
END $$;

-- ---------------------------------------------------------------- spoils

-- Collect the spoils of a settled war. The winner is paid more, the loser is still paid, and a
-- bigger bracket pays more on both sides.
CREATE OR REPLACE FUNCTION public.guild_war_claim(_hero uuid, _war uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; w public.guild_wars; h public.heroes; s jsonb;
        mine int; theirs int; lvl int; gold int; mats jsonb; mult numeric;
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
  -- 5v5 pays what the old war paid; every extra five heroes on each side adds 10%.
  mult := 1 + (w.size - 5) * 0.1;

  IF mine > theirs THEN
    gold := round((3000 + lvl * 40) * mult);
    mats := jsonb_build_object(
      'starshard', greatest(1, w.size / 25),
      'bossCore', greatest(1, w.size / 50));
  ELSIF mine = theirs THEN
    gold := round((2200 + lvl * 28) * mult);
    mats := jsonb_build_object('starshard', greatest(1, w.size / 50));
  ELSE
    gold := round((1200 + lvl * 15) * mult);
    mats := CASE WHEN w.size >= 25 THEN '{"starshard": 1}'::jsonb ELSE '{}'::jsonb END;
  END IF;

  INSERT INTO public.guild_war_claims (war_id, hero_id, gold, mats) VALUES (_war, _hero, gold, mats);
  s := public._apply_reward(h.save, jsonb_build_object('gold', gold, 'mats', mats));
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('save', s, 'gold', gold, 'mats', mats,
                            'won', mine > theirs, 'draw', mine = theirs);
END $$;
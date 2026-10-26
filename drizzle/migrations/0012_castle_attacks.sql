-- Castle assaults. The World Tree road now lets a lord ride against another
-- lord's castle for gold, and everything about it is decided here: who may
-- attack, how often, one assault per castle per day, and how much gold changes
-- hands. The gold really moves between the two players' coffers, so a raid is a
-- transfer and never a reward conjured out of nothing.
-- CASTLE_ASSAULTS_PER_DAY lives in src/game/worldcastles.ts - keep both identical.

CREATE TABLE IF NOT EXISTS public.castle_attacks (
  request_id uuid PRIMARY KEY,
  day date NOT NULL,
  attacker_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  attacker_name text NOT NULL,
  defender_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  defender_name text NOT NULL,
  attacker_won boolean NOT NULL,
  gold_moved integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS castle_attacks_attacker_day_idx ON public.castle_attacks (attacker_id, day);
CREATE INDEX IF NOT EXISTS castle_attacks_defender_idx ON public.castle_attacks (defender_id, created_at DESC);
-- The war log is read through castle_war_log(); the table itself stays closed.
REVOKE ALL ON public.castle_attacks FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.castle_attacks TO service_role;
ALTER TABLE public.castle_attacks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._world_assaults_today(_hero uuid) RETURNS integer
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT count(*)::int FROM public.castle_attacks a WHERE a.attacker_id = _hero AND a.day = public._world_day()
$$;

CREATE OR REPLACE FUNCTION public._world_assaulted_today(_hero uuid, _target uuid) RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.castle_attacks a
                  WHERE a.attacker_id = _hero AND a.defender_id = _target AND a.day = public._world_day())
$$;

-- Move gold in one hero's save. Only the world's functions use this: the
-- attacker's loot and the defender's loss are both written by the server.
CREATE OR REPLACE FUNCTION public._world_gold(_hero_id uuid, _delta numeric) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s jsonb;
BEGIN
  SELECT save INTO s FROM public.heroes WHERE id = _hero_id FOR UPDATE;
  IF s IS NULL THEN RAISE EXCEPTION 'That lord is no longer in the world'; END IF;
  PERFORM set_config('app.srv', '1', true);
  UPDATE public.heroes
     SET save = jsonb_set(s, '{gold}', to_jsonb(greatest(0, round(public._num(s -> 'gold') + _delta))), true),
         updated_at = now()
   WHERE id = _hero_id;
END $$;

-- The world payload now also carries today's assaults, so the map can show the limit.
CREATE OR REPLACE FUNCTION public._world_payload(_mine public.world_castles, _others jsonb) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object(
    'day', public._world_day(),
    'resetAt', public._world_reset_at(),
    'movesPerDay', 3,
    'movesUsed', public._world_used_today(_mine.move_day, _mine.moves_used),
    'movesLeft', 3 - public._world_used_today(_mine.move_day, _mine.moves_used),
    'assaultsPerDay', 5,
    'assaultsUsed', public._world_assaults_today(_mine.hero_id),
    'assaultsLeft', greatest(0, 5 - public._world_assaults_today(_mine.hero_id)),
    'mine', jsonb_build_object('hero_id', _mine.hero_id, 'name', _mine.name, 'cls', _mine.hero_class,
      'gender', _mine.gender, 'level', _mine.level, 'power', _mine.power, 'x', _mine.x, 'y', _mine.y),
    'castles', coalesce(_others, '[]'::jsonb))
$$;

-- What a lord needs to know before riding out against another castle: the
-- defender as he really is on the server, plus the reason an assault is refused.
CREATE OR REPLACE FUNCTION public.castle_attack_target(_hero uuid, _target uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; t public.heroes; left_ integer;
BEGIN
  me := public._my_hero(_hero);
  IF _target = _hero THEN RAISE EXCEPTION 'You cannot assault your own castle'; END IF;
  SELECT * INTO t FROM public.heroes WHERE id = _target;
  IF t.id IS NULL THEN RAISE EXCEPTION 'That lord is no longer in the world'; END IF;
  IF t.user_id = me.user_id THEN RAISE EXCEPTION 'That castle belongs to your own account'; END IF;
  left_ := 5 - public._world_assaults_today(_hero);
  RETURN jsonb_build_object(
    'hero_id', t.id, 'name', t.name, 'cls', t.hero_class, 'gender', t.gender,
    'level', t.level, 'power', t.power,
    'coffers', round(public._num(t.save -> 'gold')),
    'stats', jsonb_build_object(
      'hp', public._num(t.stats -> 'hp'), 'atk', public._num(t.stats -> 'atk'),
      'def', public._num(t.stats -> 'def'), 'crit', public._num(t.stats -> 'crit'),
      'dodge', public._num(t.stats -> 'dodge'), 'critDmg', public._num(t.stats -> 'critDmg'),
      'pen', public._num(t.stats -> 'pen'), 'acc', public._num(t.stats -> 'acc'),
      'paragon', public._num(t.stats -> 'paragon')),
    'assaultsPerDay', 5,
    'assaultsLeft', greatest(0, left_),
    'blocked', CASE WHEN left_ <= 0 THEN 'no-assaults'
                    WHEN public._world_assaulted_today(_hero, _target) THEN 'already-assaulted'
                    ELSE NULL END);
END $$;

-- The assaults fought over the caller's own castle, from either side.
CREATE OR REPLACE FUNCTION public.castle_war_log(_hero uuid, _limit integer DEFAULT 12) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE out jsonb;
BEGIN
  PERFORM public._my_hero(_hero);
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'id', x.id, 'attacker_id', x.attacker_id, 'defender_id', x.defender_id,
           'attacker', x.attacker_name, 'defender', x.defender_name,
           'defender_won', NOT x.attacker_won, 'gold', x.gold_moved, 'at', x.created_at)
           ORDER BY x.created_at DESC), '[]'::jsonb)
    INTO out
    FROM (SELECT * FROM public.castle_attacks a
           WHERE a.attacker_id = _hero OR a.defender_id = _hero
           ORDER BY a.created_at DESC
           LIMIT least(greatest(coalesce(_limit, 12), 1), 40)) x;
  RETURN out;
END $$;

-- Resolve one assault. The battle itself is fought by the player; the outcome is
-- recorded here and the gold moves accordingly, once per request id.
-- A victory takes a tenth of the defender's coffers (up to 5000) when they hold
-- at least 200 gold; a repelled assault pays the defender up to 300 gold in
-- repairs from the attacker's own coffers. Neither side is ever left below zero.
CREATE OR REPLACE FUNCTION public.attack_castle(_hero uuid, _target uuid, _won boolean, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; t public.heroes; prev public.castle_attacks;
        left_ integer; loot integer := 0; theirs numeric; mine numeric; after numeric;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  me := public._my_hero(_hero);
  IF _target = _hero THEN RAISE EXCEPTION 'You cannot assault your own castle'; END IF;
  SELECT * INTO t FROM public.heroes WHERE id = _target;
  IF t.id IS NULL THEN RAISE EXCEPTION 'That lord is no longer in the world'; END IF;
  IF t.user_id = me.user_id THEN RAISE EXCEPTION 'That castle belongs to your own account'; END IF;

  -- A retry of an already recorded assault reports it again and spends nothing.
  SELECT * INTO prev FROM public.castle_attacks WHERE request_id = _req AND attacker_id = _hero;
  IF prev.request_id IS NOT NULL THEN
    RETURN jsonb_build_object('save', me.save, 'attack', jsonb_build_object(
      'won', prev.attacker_won, 'gold', prev.gold_moved, 'defender', prev.defender_name,
      'assaultsPerDay', 5, 'assaultsLeft', greatest(0, 5 - public._world_assaults_today(_hero)), 'replay', true));
  END IF;

  left_ := 5 - public._world_assaults_today(_hero);
  IF left_ <= 0 THEN RAISE EXCEPTION 'Your warband has already ridden out five times today'; END IF;
  IF public._world_assaulted_today(_hero, _target) THEN RAISE EXCEPTION 'You have already assaulted that castle today'; END IF;

  theirs := public._num(t.save -> 'gold');
  mine := public._num(me.save -> 'gold');
  IF _won AND theirs >= 200 THEN
    loot := least(5000, floor(theirs * 0.1))::integer;
  ELSIF NOT _won AND mine >= 100 THEN
    loot := -least(300, floor(mine * 0.05))::integer;
  END IF;

  IF loot <> 0 THEN
    PERFORM public._world_gold(_hero, loot);
    PERFORM public._world_gold(_target, -loot);
    SELECT public._num(save -> 'gold') INTO after FROM public.heroes WHERE id = _hero;
    IF after = mine THEN RAISE EXCEPTION 'The gold could not be moved, so the assault was not recorded. Please retry'; END IF;
  END IF;

  INSERT INTO public.castle_attacks (request_id, day, attacker_id, attacker_name, defender_id, defender_name, attacker_won, gold_moved)
  VALUES (_req, public._world_day(), _hero, me.name, _target, t.name, _won, loot);

  SELECT * INTO me FROM public.heroes WHERE id = _hero;
  RETURN jsonb_build_object('save', me.save, 'attack', jsonb_build_object(
    'won', _won, 'gold', loot, 'defender', t.name, 'coffers', round(theirs),
    'assaultsPerDay', 5, 'assaultsLeft', greatest(0, left_ - 1), 'replay', false));
END $$;

REVOKE ALL ON FUNCTION public.castle_attack_target(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attack_castle(uuid, uuid, boolean, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.castle_war_log(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._world_gold(uuid, numeric), public._world_assaults_today(uuid),
  public._world_assaulted_today(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.castle_attack_target(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attack_castle(uuid, uuid, boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.castle_war_log(uuid, integer) TO authenticated;
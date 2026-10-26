-- Protection rules for castle assaults. Five assaults a day and one per castle a
-- day were not enough on their own: a strong lord could still ride down a weak
-- neighbour every day. A castle now stands behind a real defence —
--   * a lord below level 5 is left alone while they find their feet,
--   * a lord ten levels below the attacker is out of reach,
--   * a castle that was assaulted in the last half hour is shielded,
--   * an attacker below level 3 has not earned a warband yet —
-- and a warband must first break the castle guard before it reaches the lord.
-- Every rule is decided here; the client only reads the reason it is refused.
-- The same numbers live in src/game/worldcastles.ts — keep them identical.

CREATE OR REPLACE FUNCTION public._castle_level_gap() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 10 $$;
CREATE OR REPLACE FUNCTION public._castle_shield_minutes() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 30 $$;
CREATE OR REPLACE FUNCTION public._castle_new_lord_level() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 5 $$;
CREATE OR REPLACE FUNCTION public._castle_attacker_min_level() RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 3 $$;
-- How strong the castle guard stands in front of the lord, as a fraction.
CREATE OR REPLACE FUNCTION public._castle_guard_share() RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT 0.7 $$;

-- When the castle was last assaulted, so the shield can be shown and enforced.
CREATE OR REPLACE FUNCTION public._castle_last_attacked(_target uuid) RETURNS timestamptz
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT max(a.created_at) FROM public.castle_attacks a WHERE a.defender_id = _target $$;

CREATE OR REPLACE FUNCTION public._castle_shield_until(_target uuid) RETURNS timestamptz
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT public._castle_last_attacked(_target) + (public._castle_shield_minutes() || ' minutes')::interval $$;

-- Fame a victory over that castle is worth: the deeper the defender's
-- progression, the more renown. Never zero for a real victory.
CREATE OR REPLACE FUNCTION public._castle_fame_reward(_level integer) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT greatest(1, least(20, floor(coalesce(_level, 1) / 5.0)::integer)) $$;

-- Why an assault is refused, or null when it may ride out.
CREATE OR REPLACE FUNCTION public._castle_blocked(_me public.heroes, _t public.heroes, _left integer) RETURNS text
LANGUAGE plpgsql STABLE SET search_path = public AS $$
BEGIN
  IF _t.user_id = _me.user_id THEN RETURN 'own-account'; END IF;
  IF _left <= 0 THEN RETURN 'no-assaults'; END IF;
  IF public._world_assaulted_today(_me.id, _t.id) THEN RETURN 'already-assaulted'; END IF;
  IF _me.level < public._castle_attacker_min_level() THEN RETURN 'attacker-too-weak'; END IF;
  IF _t.level < public._castle_new_lord_level() THEN RETURN 'protected-lord'; END IF;
  IF _me.level - _t.level >= public._castle_level_gap() THEN RETURN 'level-gap'; END IF;
  IF public._castle_last_attacked(_t.id) > now() - (public._castle_shield_minutes() || ' minutes')::interval THEN RETURN 'shield'; END IF;
  RETURN NULL;
END $$;

-- What a lord needs to know before riding out: the defender as the server sees
-- them, their castle guard, the fame a victory is worth, and the reason an
-- assault is refused.
CREATE OR REPLACE FUNCTION public.castle_attack_target(_hero uuid, _target uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; t public.heroes; left_ integer; blocked text; guard numeric;
BEGIN
  me := public._my_hero(_hero);
  IF _target = _hero THEN RAISE EXCEPTION 'You cannot assault your own castle'; END IF;
  SELECT * INTO t FROM public.heroes WHERE id = _target;
  IF t.id IS NULL THEN RAISE EXCEPTION 'That lord is no longer in the world'; END IF;
  left_ := 5 - public._world_assaults_today(_hero);
  blocked := public._castle_blocked(me, t, left_);
  guard := public._castle_guard_share();
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
    -- The guard stands between the warband and the lord.
    'guard', jsonb_build_object(
      'name', t.name || '''s Castle Guard',
      'hp', greatest(1, round(public._num(t.stats -> 'hp') * guard)),
      'atk', round(public._num(t.stats -> 'atk') * guard),
      'def', round(public._num(t.stats -> 'def') * guard),
      'crit', public._num(t.stats -> 'crit'),
      'dodge', public._num(t.stats -> 'dodge'),
      'critDmg', public._num(t.stats -> 'critDmg'),
      'pen', public._num(t.stats -> 'pen'),
      'acc', public._num(t.stats -> 'acc'),
      'level', t.level),
    'fameReward', public._castle_fame_reward(t.level),
    'levelGap', greatest(0, me.level - t.level),
    'maxLevelGap', public._castle_level_gap(),
    'minAttackerLevel', public._castle_attacker_min_level(),
    'newLordLevel', public._castle_new_lord_level(),
    'shieldMinutes', public._castle_shield_minutes(),
    'shieldUntil', CASE WHEN public._castle_last_attacked(t.id) IS NULL THEN NULL
                        ELSE to_jsonb(public._castle_shield_until(t.id)) END,
    'assaultsPerDay', 5,
    'assaultsLeft', greatest(0, left_),
    'blocked', blocked);
END $$;

-- Resolve one assault. The battle itself is fought by the player; the outcome is
-- recorded here, the gold moves accordingly once per request id, and a victory
-- adds the fame the server decided. Every protection rule is re-checked, so a
-- client that ignores the refusal reason still cannot ride out.
-- A victory takes a tenth of the defender's coffers (up to 5000) when they hold
-- at least 200 gold; a repelled assault pays the defender up to 300 gold in
-- repairs from the attacker's own coffers. Neither side is ever left below zero.
CREATE OR REPLACE FUNCTION public.attack_castle(_hero uuid, _target uuid, _won boolean, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.heroes; t public.heroes; prev public.castle_attacks;
        left_ integer; loot integer := 0; theirs numeric; mine numeric; after numeric;
        blocked text; fame integer; s jsonb;
BEGIN
  IF _req IS NULL THEN RAISE EXCEPTION 'Missing request'; END IF;
  me := public._my_hero(_hero);
  IF _target = _hero THEN RAISE EXCEPTION 'You cannot assault your own castle'; END IF;
  SELECT * INTO t FROM public.heroes WHERE id = _target;
  IF t.id IS NULL THEN RAISE EXCEPTION 'That lord is no longer in the world'; END IF;

  -- A retry of an already recorded assault reports it again and spends nothing.
  SELECT * INTO prev FROM public.castle_attacks WHERE request_id = _req AND attacker_id = _hero;
  IF prev.request_id IS NOT NULL THEN
    RETURN jsonb_build_object('save', me.save, 'attack', jsonb_build_object(
      'won', prev.attacker_won, 'gold', prev.gold_moved, 'defender', prev.defender_name,
      'fame', 0, 'fameTotal', public._world_fame_of(me.save),
      'assaultsPerDay', 5, 'assaultsLeft', greatest(0, 5 - public._world_assaults_today(_hero)), 'replay', true));
  END IF;

  left_ := 5 - public._world_assaults_today(_hero);
  blocked := public._castle_blocked(me, t, left_);
  IF blocked IS NOT NULL THEN
    RAISE EXCEPTION '%', CASE blocked
      WHEN 'own-account' THEN 'That castle belongs to your own account'
      WHEN 'no-assaults' THEN 'Your warband has already ridden out five times today'
      WHEN 'already-assaulted' THEN 'You have already assaulted that castle today'
      WHEN 'attacker-too-weak' THEN 'Your warband is not ready — castle assaults open at level ' || public._castle_attacker_min_level()
      WHEN 'protected-lord' THEN 'That lord is still sheltered while they find their feet'
      WHEN 'level-gap' THEN 'That castle is far below your strength — find a worthier opponent'
      ELSE 'That castle is shielded — their walls are being repaired'
    END;
  END IF;

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

  fame := CASE WHEN _won THEN public._castle_fame_reward(t.level) ELSE 0 END;
  IF fame > 0 THEN
    SELECT save INTO s FROM public.heroes WHERE id = _hero;
    PERFORM public._write_save(_hero, jsonb_set(s, '{srv,fame}',
      to_jsonb(public._world_fame_of(s) + fame), true));
  END IF;

  INSERT INTO public.castle_attacks (request_id, day, attacker_id, attacker_name, defender_id, defender_name, attacker_won, gold_moved)
  VALUES (_req, public._world_day(), _hero, me.name, _target, t.name, _won, loot);

  SELECT * INTO me FROM public.heroes WHERE id = _hero;
  RETURN jsonb_build_object('save', me.save, 'attack', jsonb_build_object(
    'won', _won, 'gold', loot, 'defender', t.name, 'coffers', round(theirs),
    'fame', fame, 'fameTotal', public._world_fame_of(me.save),
    'assaultsPerDay', 5, 'assaultsLeft', greatest(0, left_ - 1), 'replay', false));
END $$;

REVOKE ALL ON FUNCTION public.castle_attack_target(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attack_castle(uuid, uuid, boolean, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._castle_blocked(public.heroes, public.heroes, integer),
  public._castle_last_attacked(uuid), public._castle_shield_until(uuid),
  public._castle_fame_reward(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.castle_attack_target(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attack_castle(uuid, uuid, boolean, uuid) TO authenticated;

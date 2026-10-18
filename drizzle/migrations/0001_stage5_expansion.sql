CREATE OR REPLACE FUNCTION public.protect_hero_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('app.arena', true) IS DISTINCT FROM '1' THEN
    NEW.arena_rating := OLD.arena_rating;
  END IF;
  IF current_setting('app.srv', true) IS DISTINCT FROM '1' THEN
    IF jsonb_typeof(NEW.save) <> 'object' THEN NEW.save := OLD.save; END IF;
    NEW.save := jsonb_set(NEW.save, '{srv}', coalesce(OLD.save->'srv', '{}'::jsonb), true);
  END IF;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.init_hero_srv() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF jsonb_typeof(NEW.save) <> 'object' THEN NEW.save := '{}'::jsonb; END IF;
  NEW.save := jsonb_set(NEW.save, '{srv}', '{"luckyShots":7,"scrolls":{},"buffs":{},"cosmetics":[]}'::jsonb, true);
  RETURN NEW;
END $$;
CREATE TRIGGER heroes_init_srv BEFORE INSERT ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.init_hero_srv();

CREATE OR REPLACE FUNCTION public._my_hero(_hero uuid) RETURNS public.heroes LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN
  SELECT * INTO h FROM public.heroes WHERE id = _hero AND user_id = auth.uid() FOR UPDATE;
  IF h.id IS NULL THEN RAISE EXCEPTION 'Character not found'; END IF;
  IF jsonb_typeof(h.save->'srv') IS DISTINCT FROM 'object' THEN
    h.save := jsonb_set(h.save, '{srv}', '{"luckyShots":0,"scrolls":{},"buffs":{},"cosmetics":[]}'::jsonb, true);
  END IF;
  RETURN h;
END $$;

CREATE OR REPLACE FUNCTION public._write_save(_hero uuid, _save jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.srv', '1', true);
  UPDATE public.heroes SET save = _save, updated_at = now() WHERE id = _hero;
  PERFORM set_config('app.srv', '0', true);
END $$;

CREATE OR REPLACE FUNCTION public._num(j jsonb) RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN jsonb_typeof(j) = 'number' THEN j::text::numeric ELSE 0 END $$;

CREATE OR REPLACE FUNCTION public._apply_reward(s jsonb, rw jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE k text; v jsonb; c text;
BEGIN
  IF jsonb_typeof(s->'srv') IS DISTINCT FROM 'object' THEN s := jsonb_set(s, '{srv}', '{}'::jsonb, true); END IF;
  IF rw ? 'gold' THEN s := jsonb_set(s, '{gold}', to_jsonb(round(public._num(s->'gold') + public._num(rw->'gold'))), true); END IF;
  FOR k, v IN SELECT * FROM jsonb_each(coalesce(rw->'mats', '{}'::jsonb)) LOOP
    s := jsonb_set(s, '{mats}', coalesce(s->'mats', '{}'::jsonb) || jsonb_build_object(k, public._num(s->'mats'->k) + public._num(v)), true);
  END LOOP;
  FOR k, v IN SELECT * FROM jsonb_each(coalesce(rw->'gems', '{}'::jsonb)) LOOP
    s := jsonb_set(s, '{gems}', coalesce(s->'gems', '{}'::jsonb) || jsonb_build_object(k, public._num(s->'gems'->k) + public._num(v)), true);
  END LOOP;
  IF rw ? 'shots' THEN s := jsonb_set(s, '{srv,luckyShots}', to_jsonb(public._num(s->'srv'->'luckyShots') + public._num(rw->'shots')), true); END IF;
  FOR k, v IN SELECT * FROM jsonb_each(coalesce(rw->'scrolls', '{}'::jsonb)) LOOP
    s := jsonb_set(s, '{srv,scrolls}', coalesce(s->'srv'->'scrolls', '{}'::jsonb) || jsonb_build_object(k, public._num(s->'srv'->'scrolls'->k) + public._num(v)), true);
  END LOOP;
  FOR c IN SELECT jsonb_array_elements_text(coalesce(rw->'cosmetics', '[]'::jsonb)) LOOP
    IF NOT coalesce(s->'srv'->'cosmetics', '[]'::jsonb) ? c THEN
      s := jsonb_set(s, '{srv,cosmetics}', coalesce(s->'srv'->'cosmetics', '[]'::jsonb) || to_jsonb(c), true);
    END IF;
  END LOOP;
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.my_hero_ids() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.heroes WHERE user_id = auth.uid() $$;

CREATE TABLE public.mail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id uuid,
  sender text NOT NULL DEFAULT 'EMBER FALL',
  kind text NOT NULL DEFAULT 'system' CHECK (kind IN ('system','event','compensation','gift','reward')),
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
CREATE INDEX mail_hero_idx ON public.mail (hero_id, created_at DESC);
GRANT SELECT ON public.mail TO authenticated;
GRANT ALL ON public.mail TO service_role;
ALTER TABLE public.mail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or broadcast mail" ON public.mail FOR SELECT TO authenticated
  USING (hero_id IS NULL OR hero_id IN (SELECT public.my_hero_ids()));

CREATE TABLE public.mail_state (
  mail_id uuid NOT NULL REFERENCES public.mail(id) ON DELETE CASCADE,
  hero_id uuid NOT NULL,
  read_at timestamptz,
  claimed_at timestamptz,
  PRIMARY KEY (mail_id, hero_id)
);
GRANT SELECT ON public.mail_state TO authenticated;
GRANT ALL ON public.mail_state TO service_role;
ALTER TABLE public.mail_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own mail state" ON public.mail_state FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE OR REPLACE FUNCTION public.read_mail(_hero uuid, _mail uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN
  h := public._my_hero(_hero);
  IF NOT EXISTS (SELECT 1 FROM public.mail WHERE id = _mail AND (hero_id IS NULL OR hero_id = _hero)) THEN RAISE EXCEPTION 'Mail not found'; END IF;
  INSERT INTO public.mail_state (mail_id, hero_id, read_at) VALUES (_mail, _hero, now())
  ON CONFLICT (mail_id, hero_id) DO UPDATE SET read_at = coalesce(public.mail_state.read_at, now());
END $$;

CREATE OR REPLACE FUNCTION public.claim_mail(_hero uuid, _mail uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.mail; ok int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  SELECT * INTO m FROM public.mail WHERE id = _mail AND (hero_id IS NULL OR hero_id = _hero) AND (expires_at IS NULL OR expires_at > now());
  IF m.id IS NULL THEN RAISE EXCEPTION 'Mail not found or expired'; END IF;
  IF m.attachments = '{}'::jsonb THEN RAISE EXCEPTION 'This mail has no attachments'; END IF;
  INSERT INTO public.mail_state (mail_id, hero_id, read_at, claimed_at) VALUES (_mail, _hero, now(), now())
  ON CONFLICT (mail_id, hero_id) DO UPDATE SET claimed_at = now(), read_at = coalesce(public.mail_state.read_at, now())
    WHERE public.mail_state.claimed_at IS NULL
  RETURNING 1 INTO ok;
  IF ok IS NULL THEN RAISE EXCEPTION 'Already claimed'; END IF;
  s := public._apply_reward(h.save, m.attachments);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

INSERT INTO public.mail (sender, kind, subject, body, attachments) VALUES
('EMBER FALL', 'event', 'Welcome to the Stage 5 expansion',
 'The castle gates open wider: guilds, world chat, the Seven Lucky Shots, scrolls and cosmetics have arrived. Take these supplies for the road.',
 '{"gold":2000,"mats":{"ore":20,"essence":3},"shots":3,"scrolls":{"xp":1},"cosmetics":["skin_starlight"]}'::jsonb),
('EMBER FALL', 'compensation', 'Maintenance compensation',
 'Thank you for your patience during the expansion maintenance.',
 '{"gold":1000,"scrolls":{"dmg":1,"def":1}}'::jsonb);

CREATE TABLE public.lucky_shots (
  request_id uuid PRIMARY KEY,
  hero_id uuid NOT NULL,
  astral jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lucky_shots_hero_idx ON public.lucky_shots (hero_id, created_at DESC);
GRANT SELECT ON public.lucky_shots TO authenticated;
GRANT ALL ON public.lucky_shots TO service_role;
ALTER TABLE public.lucky_shots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own shots" ON public.lucky_shots FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE OR REPLACE FUNCTION public.lucky_shot(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; prev jsonb; shots int; r float8; rarity int; bases text[]; a jsonb; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  SELECT astral INTO prev FROM public.lucky_shots WHERE request_id = _req AND hero_id = _hero;
  IF prev IS NOT NULL THEN RETURN jsonb_build_object('astral', prev, 'save', h.save, 'repeat', true); END IF;
  IF EXISTS (SELECT 1 FROM public.lucky_shots WHERE request_id = _req) THEN RAISE EXCEPTION 'Invalid request'; END IF;
  shots := public._num(h.save->'srv'->'luckyShots')::int;
  IF shots < 1 THEN RAISE EXCEPTION 'No Lucky Shots left'; END IF;
  r := random() * 100;
  rarity := CASE WHEN r < 0.5 THEN 5 WHEN r < 4 THEN 4 WHEN r < 13 THEN 3 WHEN r < 30 THEN 2 WHEN r < 60 THEN 1 ELSE 0 END;
  bases := ARRAY['ember','arcana','aegis','ward','oak','owl','fang','hawk','wisp','turtle','spear','rune','lotus'];
  a := jsonb_build_object('id', replace(gen_random_uuid()::text, '-', ''), 'base', bases[1 + floor(random() * array_length(bases, 1))::int], 'rarity', rarity, 'lvl', 0);
  s := jsonb_set(h.save, '{srv,luckyShots}', to_jsonb(shots - 1), true);
  s := jsonb_set(s, '{astrals}', coalesce(s->'astrals', '[]'::jsonb) || jsonb_build_array(a), true);
  s := jsonb_set(s, '{srv,shotsUsed}', to_jsonb(public._num(s->'srv'->'shotsUsed') + 1), true);
  INSERT INTO public.lucky_shots (request_id, hero_id, astral) VALUES (_req, _hero, a);
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('astral', a, 'save', s, 'repeat', false);
END $$;

CREATE TABLE public.purchases (
  request_id uuid PRIMARY KEY,
  hero_id uuid NOT NULL,
  item text NOT NULL,
  price int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own purchases" ON public.purchases FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE OR REPLACE FUNCTION public._scroll_price(_kind text) RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _kind WHEN 'xp' THEN 1500 WHEN 'dmg' THEN 2000 WHEN 'def' THEN 2000 ELSE NULL END $$;

CREATE OR REPLACE FUNCTION public.buy_scroll(_hero uuid, _kind text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  price := public._scroll_price(_kind);
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown scroll'; END IF;
  IF public._num(h.save->'gold') < price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') - price), true);
  s := public._apply_reward(s, jsonb_build_object('scrolls', jsonb_build_object(_kind, 1)));
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'scroll:' || _kind, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.activate_scroll(_hero uuid, _kind text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; n int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF public._scroll_price(_kind) IS NULL THEN RAISE EXCEPTION 'Unknown scroll'; END IF;
  n := public._num(h.save->'srv'->'scrolls'->_kind)::int;
  IF n < 1 THEN RAISE EXCEPTION 'You do not own that scroll'; END IF;
  s := jsonb_set(h.save, '{srv,scrolls}', coalesce(h.save->'srv'->'scrolls', '{}'::jsonb) || jsonb_build_object(_kind, n - 1), true);
  s := jsonb_set(s, '{srv,buffs}', coalesce(s->'srv'->'buffs', '{}'::jsonb) || jsonb_build_object(_kind, 10), true);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.begin_battle(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; k text; v jsonb; active jsonb := '[]'::jsonb; b jsonb := '{}'::jsonb; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  FOR k, v IN SELECT * FROM jsonb_each(coalesce(h.save->'srv'->'buffs', '{}'::jsonb)) LOOP
    IF public._num(v) > 0 THEN
      active := active || to_jsonb(k);
      b := b || jsonb_build_object(k, public._num(v) - 1);
    END IF;
  END LOOP;
  IF jsonb_array_length(active) = 0 THEN RETURN jsonb_build_object('active', active, 'save', h.save); END IF;
  s := jsonb_set(h.save, '{srv,buffs}', b, true);
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('active', active, 'save', s);
END $$;

CREATE TABLE public.activity_progress (
  hero_id uuid NOT NULL,
  period text NOT NULL,
  kind text NOT NULL,
  count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hero_id, period, kind)
);
GRANT SELECT ON public.activity_progress TO authenticated;
GRANT ALL ON public.activity_progress TO service_role;
ALTER TABLE public.activity_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own progress" ON public.activity_progress FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE TABLE public.activity_claims (
  hero_id uuid NOT NULL,
  period text NOT NULL,
  objective text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hero_id, period, objective)
);
GRANT SELECT ON public.activity_claims TO authenticated;
GRANT ALL ON public.activity_claims TO service_role;
ALTER TABLE public.activity_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own claims" ON public.activity_claims FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE TABLE public.login_days (
  hero_id uuid NOT NULL,
  day date NOT NULL,
  PRIMARY KEY (hero_id, day)
);
GRANT SELECT ON public.login_days TO authenticated;
GRANT ALL ON public.login_days TO service_role;
ALTER TABLE public.login_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own logins" ON public.login_days FOR SELECT TO authenticated USING (hero_id IN (SELECT public.my_hero_ids()));

CREATE OR REPLACE FUNCTION public._kinds() RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT ARRAY['kill','dungeon','boss','craft','gem','astral','arena'] $$;
CREATE OR REPLACE FUNCTION public._today() RETURNS date LANGUAGE sql STABLE SET search_path = public AS $$ SELECT (now() AT TIME ZONE 'utc')::date $$;
CREATE OR REPLACE FUNCTION public._monday() RETURNS date LANGUAGE sql STABLE SET search_path = public AS $$ SELECT date_trunc('week', (now() AT TIME ZONE 'utc'))::date $$;
CREATE OR REPLACE FUNCTION public._daily_kinds() RETURNS text[] LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ARRAY[(public._kinds())[1 + ((public._today() - date '2026-01-01') % 7)],
               (public._kinds())[1 + ((public._today() - date '2026-01-01' + 3) % 7)],
               (public._kinds())[1 + ((public._today() - date '2026-01-01' + 6) % 7)]] $$;
CREATE OR REPLACE FUNCTION public._weekly_kinds() RETURNS text[] LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ARRAY[(public._kinds())[1 + (((public._monday() - date '2025-12-29') / 7 * 2) % 7)],
               (public._kinds())[1 + (((public._monday() - date '2025-12-29') / 7 * 2 + 2) % 7)],
               (public._kinds())[1 + (((public._monday() - date '2025-12-29') / 7 * 2 + 4) % 7)]] $$;
CREATE OR REPLACE FUNCTION public._daily_target(_k text) RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _k WHEN 'kill' THEN 15 WHEN 'dungeon' THEN 1 WHEN 'boss' THEN 2 WHEN 'craft' THEN 1 WHEN 'gem' THEN 2 WHEN 'astral' THEN 2 WHEN 'arena' THEN 2 END $$;
CREATE OR REPLACE FUNCTION public._weekly_target(_k text, _stage int) RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT (CASE _k WHEN 'kill' THEN ARRAY[50,150,300] WHEN 'dungeon' THEN ARRAY[3,8,15] WHEN 'boss' THEN ARRAY[5,15,30]
    WHEN 'craft' THEN ARRAY[2,5,10] ELSE ARRAY[5,12,25] END)[_stage] $$;

CREATE OR REPLACE FUNCTION public._progress(_hero uuid, _period text, _kind text) RETURNS int LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT coalesce((SELECT count FROM public.activity_progress WHERE hero_id = _hero AND period = _period AND kind = _kind), 0) $$;

CREATE OR REPLACE FUNCTION public.get_activities(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE dp text := 'd:' || public._today(); wp text := 'w:' || public._monday(); daily jsonb := '[]'::jsonb; weekly jsonb := '[]'::jsonb; k text; st int;
  streak int := 0; d date; total int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.heroes WHERE id = _hero AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Character not found'; END IF;
  FOREACH k IN ARRAY public._daily_kinds() LOOP
    daily := daily || jsonb_build_object('id', k, 'kind', k, 'target', public._daily_target(k), 'progress', public._progress(_hero, dp, k),
      'claimed', EXISTS (SELECT 1 FROM public.activity_claims WHERE hero_id = _hero AND period = dp AND objective = k));
  END LOOP;
  FOREACH k IN ARRAY public._weekly_kinds() LOOP
    FOR st IN 1..3 LOOP
      weekly := weekly || jsonb_build_object('id', k || '#' || st, 'kind', k, 'stage', st, 'target', public._weekly_target(k, st), 'progress', public._progress(_hero, wp, k),
        'claimed', EXISTS (SELECT 1 FROM public.activity_claims WHERE hero_id = _hero AND period = wp AND objective = k || '#' || st));
    END LOOP;
  END LOOP;
  d := public._today();
  IF NOT EXISTS (SELECT 1 FROM public.login_days WHERE hero_id = _hero AND day = d) THEN d := d - 1; END IF;
  WHILE EXISTS (SELECT 1 FROM public.login_days WHERE hero_id = _hero AND day = d) LOOP streak := streak + 1; d := d - 1; END LOOP;
  SELECT count(*) INTO total FROM public.login_days WHERE hero_id = _hero;
  RETURN jsonb_build_object(
    'now', now(),
    'dailyReset', (public._today() + 1)::timestamp AT TIME ZONE 'utc',
    'weeklyReset', (public._monday() + 7)::timestamp AT TIME ZONE 'utc',
    'daily', daily,
    'dailyBonusClaimed', EXISTS (SELECT 1 FROM public.activity_claims WHERE hero_id = _hero AND period = dp AND objective = 'all'),
    'weekly', weekly,
    'login', jsonb_build_object('claimedToday', EXISTS (SELECT 1 FROM public.login_days WHERE hero_id = _hero AND day = public._today()), 'streak', streak, 'total', total));
END $$;

CREATE OR REPLACE FUNCTION public.track_activity(_hero uuid, _kind text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.heroes WHERE id = _hero AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Character not found'; END IF;
  IF NOT (_kind = ANY (public._kinds())) THEN RAISE EXCEPTION 'Unknown activity'; END IF;
  FOREACH p IN ARRAY ARRAY['d:' || public._today(), 'w:' || public._monday()] LOOP
    INSERT INTO public.activity_progress (hero_id, period, kind, count, updated_at) VALUES (_hero, p, _kind, 1, now())
    ON CONFLICT (hero_id, period, kind) DO UPDATE SET count = public.activity_progress.count + 1, updated_at = now()
      WHERE public.activity_progress.updated_at < now() - interval '1500 milliseconds';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.claim_activity(_hero uuid, _objective text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; dp text := 'd:' || public._today(); wp text := 'w:' || public._monday(); k text; st int; per text; target int;
  m numeric; rw jsonb; ok int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  m := 1 + least(h.level, 80) / 10.0;
  IF _objective = 'all' THEN
    per := dp;
    IF (SELECT count(*) FROM public.activity_claims c WHERE c.hero_id = _hero AND c.period = dp AND c.objective = ANY (public._daily_kinds())) < 3 THEN
      RAISE EXCEPTION 'Complete all three daily objectives first'; END IF;
    rw := jsonb_build_object('gold', round(500 * m), 'shots', 1, 'mats', jsonb_build_object('essence', 3));
  ELSIF position('#' in _objective) > 0 THEN
    k := split_part(_objective, '#', 1); st := nullif(split_part(_objective, '#', 2), '')::int; per := wp;
    IF NOT (k = ANY (public._weekly_kinds())) OR st NOT BETWEEN 1 AND 3 THEN RAISE EXCEPTION 'Not an active weekly objective'; END IF;
    IF st > 1 AND NOT EXISTS (SELECT 1 FROM public.activity_claims c WHERE c.hero_id = _hero AND c.period = wp AND c.objective = k || '#' || (st - 1)) THEN
      RAISE EXCEPTION 'Claim the previous step first'; END IF;
    target := public._weekly_target(k, st);
    IF public._progress(_hero, wp, k) < target THEN RAISE EXCEPTION 'Objective not complete'; END IF;
    rw := CASE st
      WHEN 1 THEN jsonb_build_object('gold', round(1000 * m), 'mats', jsonb_build_object('starshard', 5, 'fragment', 2))
      WHEN 2 THEN jsonb_build_object('gold', round(2000 * m), 'mats', jsonb_build_object('essence', 6, 'fragment', 4))
      ELSE jsonb_build_object('gold', round(3000 * m), 'shots', 1, 'mats', jsonb_build_object('bossCore', 1, 'fragment', 6)) END;
  ELSE
    k := _objective; per := dp;
    IF NOT (k = ANY (public._daily_kinds())) THEN RAISE EXCEPTION 'Not an active daily objective'; END IF;
    IF public._progress(_hero, dp, k) < public._daily_target(k) THEN RAISE EXCEPTION 'Objective not complete'; END IF;
    rw := jsonb_build_object('gold', round(300 * m), 'mats', jsonb_build_object('ore', 10, 'starshard', 2));
  END IF;
  INSERT INTO public.activity_claims (hero_id, period, objective) VALUES (_hero, per, _objective) ON CONFLICT DO NOTHING RETURNING 1 INTO ok;
  IF ok IS NULL THEN RAISE EXCEPTION 'Already claimed'; END IF;
  IF _objective LIKE '%#3' AND (SELECT count(*) FROM public.activity_claims c WHERE c.hero_id = _hero AND c.objective LIKE '%#3') >= 3 THEN
    rw := rw || jsonb_build_object('cosmetics', jsonb_build_array('outfit_crimson'));
  END IF;
  s := public._apply_reward(h.save, rw);
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('save', s, 'reward', rw);
END $$;

CREATE OR REPLACE FUNCTION public.claim_login(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; ok int; streak int := 0; d date; total int; rw jsonb; m numeric; s jsonb; cos jsonb := '[]'::jsonb;
BEGIN
  h := public._my_hero(_hero);
  INSERT INTO public.login_days (hero_id, day) VALUES (_hero, public._today()) ON CONFLICT DO NOTHING RETURNING 1 INTO ok;
  IF ok IS NULL THEN RAISE EXCEPTION 'Already claimed today'; END IF;
  d := public._today();
  WHILE EXISTS (SELECT 1 FROM public.login_days WHERE hero_id = _hero AND day = d) LOOP streak := streak + 1; d := d - 1; END LOOP;
  SELECT count(*) INTO total FROM public.login_days WHERE hero_id = _hero;
  m := 1 + least(h.level, 80) / 10.0;
  rw := jsonb_build_object('gold', round(150 * m * least(streak, 7)), 'mats', jsonb_build_object('ore', 5));
  IF streak % 7 = 0 THEN rw := rw || jsonb_build_object('shots', 1); END IF;
  IF total >= 7 THEN cos := cos || '"frame_ember"'::jsonb; END IF;
  IF total >= 30 THEN cos := cos || '"wings_ember"'::jsonb; END IF;
  IF total >= 100 THEN cos := cos || '"outfit_royal"'::jsonb; END IF;
  rw := rw || jsonb_build_object('cosmetics', cos);
  s := public._apply_reward(h.save, rw);
  PERFORM public._write_save(_hero, s);
  RETURN jsonb_build_object('save', s, 'reward', rw, 'streak', streak, 'total', total);
END $$;

CREATE OR REPLACE FUNCTION public.unlock_cosmetic(_hero uuid, _id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; ok boolean; s jsonb; species int;
BEGIN
  h := public._my_hero(_hero);
  SELECT count(DISTINCT a->>'base') INTO species FROM jsonb_array_elements(coalesce(h.save->'astrals', '[]'::jsonb)) a;
  ok := CASE _id
    WHEN 'wings_seraph' THEN public._num(h.save->'level') >= 50
    WHEN 'wings_void' THEN EXISTS (SELECT 1 FROM jsonb_each(coalesce(h.save->'challenges', '{}'::jsonb)) c WHERE public._num(c.value) >= 5)
    WHEN 'outfit_shadow' THEN EXISTS (SELECT 1 FROM jsonb_each(coalesce(h.save->'challenges', '{}'::jsonb)) c WHERE public._num(c.value) >= 1)
    WHEN 'skin_inferno' THEN public._num(h.save->'crafts') >= 10
    WHEN 'skin_frost' THEN public._num(h.save->'record'->'arenaWins') >= 10
    WHEN 'frame_astral' THEN species >= 6
    WHEN 'outfit_frost' THEN EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(h.save->'astrals', '[]'::jsonb)) a WHERE public._num(a->'rarity') >= 4)
    WHEN 'title_luckystar' THEN EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(h.save->'astrals', '[]'::jsonb)) a WHERE public._num(a->'rarity') >= 5)
    ELSE NULL END;
  IF ok IS NULL THEN RAISE EXCEPTION 'This cosmetic is earned elsewhere'; END IF;
  IF NOT ok THEN RAISE EXCEPTION 'Requirement not met yet'; END IF;
  s := public._apply_reward(h.save, jsonb_build_object('cosmetics', jsonb_build_array(_id)));
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE TABLE public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 20 AND name ~ '^[A-Za-z0-9 _''-]+$'),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 200),
  emblem text NOT NULL DEFAULT 'shield',
  announcement text NOT NULL DEFAULT '' CHECK (char_length(announcement) <= 300),
  leader_id uuid NOT NULL,
  level int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX guilds_name_unique ON public.guilds (lower(name));
GRANT SELECT ON public.guilds TO authenticated;
GRANT ALL ON public.guilds TO service_role;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guilds are public to players" ON public.guilds FOR SELECT TO authenticated USING (true);

CREATE TABLE public.guild_members (
  hero_id uuid PRIMARY KEY,
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader','officer','member')),
  joined_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guild_members_guild_idx ON public.guild_members (guild_id);
GRANT SELECT ON public.guild_members TO authenticated;
GRANT ALL ON public.guild_members TO service_role;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rosters are public to players" ON public.guild_members FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.my_guild_ids() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT gm.guild_id FROM public.guild_members gm JOIN public.heroes h ON h.id = gm.hero_id WHERE h.user_id = auth.uid() $$;

CREATE TABLE public.guild_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  hero_id uuid NOT NULL,
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, hero_id)
);
GRANT SELECT ON public.guild_invites TO authenticated;
GRANT ALL ON public.guild_invites TO service_role;
ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitee or guild can see invites" ON public.guild_invites FOR SELECT TO authenticated
  USING (hero_id IN (SELECT public.my_hero_ids()) OR guild_id IN (SELECT public.my_guild_ids()));

CREATE OR REPLACE FUNCTION public._guild_role(_hero uuid) RETURNS public.guild_members LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.guild_members;
BEGIN
  SELECT * INTO r FROM public.guild_members WHERE hero_id = _hero;
  IF r.hero_id IS NULL THEN RAISE EXCEPTION 'You are not in a guild'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.create_guild(_hero uuid, _name text, _description text, _emblem text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; gid uuid; s jsonb; fee int := 10000;
BEGIN
  h := public._my_hero(_hero);
  _name := btrim(_name);
  IF char_length(_name) NOT BETWEEN 3 AND 20 OR _name !~ '^[A-Za-z0-9 _''-]+$' THEN RAISE EXCEPTION 'Guild name must be 3-20 letters, numbers, spaces, '' - or _'; END IF;
  IF EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = _hero) THEN RAISE EXCEPTION 'Leave your current guild first'; END IF;
  IF EXISTS (SELECT 1 FROM public.guilds WHERE lower(name) = lower(_name)) THEN RAISE EXCEPTION 'That guild name is taken'; END IF;
  IF public._num(h.save->'gold') < fee THEN RAISE EXCEPTION 'Creating a guild costs 10,000 gold'; END IF;
  INSERT INTO public.guilds (name, description, emblem, leader_id) VALUES (_name, left(coalesce(_description, ''), 200), left(coalesce(_emblem, 'shield'), 20), _hero) RETURNING id INTO gid;
  INSERT INTO public.guild_members (hero_id, guild_id, role) VALUES (_hero, gid, 'leader');
  DELETE FROM public.guild_invites WHERE hero_id = _hero;
  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') - fee), true);
  s := public._apply_reward(s, '{"cosmetics":["title_founder"]}'::jsonb);
  PERFORM public._write_save(_hero, s);
  RETURN gid;
END $$;

CREATE OR REPLACE FUNCTION public.guild_invite(_hero uuid, _target_name text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members; t uuid;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role = 'member' THEN RAISE EXCEPTION 'Only the leader and officers can invite'; END IF;
  SELECT id INTO t FROM public.heroes WHERE lower(name) = lower(btrim(_target_name));
  IF t IS NULL THEN RAISE EXCEPTION 'No hero with that name'; END IF;
  IF EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = t) THEN RAISE EXCEPTION 'That hero is already in a guild'; END IF;
  INSERT INTO public.guild_invites (guild_id, hero_id, invited_by) VALUES (me.guild_id, t, _hero) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.respond_invite(_hero uuid, _invite uuid, _accept boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; inv public.guild_invites;
BEGIN
  h := public._my_hero(_hero);
  SELECT * INTO inv FROM public.guild_invites WHERE id = _invite AND hero_id = _hero;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF _accept THEN
    IF EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = _hero) THEN RAISE EXCEPTION 'Leave your current guild first'; END IF;
    IF (SELECT count(*) FROM public.guild_members WHERE guild_id = inv.guild_id) >= 30 THEN RAISE EXCEPTION 'That guild is full (30 members)'; END IF;
    INSERT INTO public.guild_members (hero_id, guild_id, role) VALUES (_hero, inv.guild_id, 'member');
    DELETE FROM public.guild_invites WHERE hero_id = _hero;
  ELSE
    DELETE FROM public.guild_invites WHERE id = _invite;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.leave_guild(_hero uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role = 'leader' THEN
    IF (SELECT count(*) FROM public.guild_members WHERE guild_id = me.guild_id) > 1 THEN RAISE EXCEPTION 'Transfer leadership before leaving'; END IF;
    DELETE FROM public.guilds WHERE id = me.guild_id;
  ELSE
    DELETE FROM public.guild_members WHERE hero_id = _hero;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.guild_kick(_hero uuid, _target uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members; t public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  SELECT * INTO t FROM public.guild_members WHERE hero_id = _target AND guild_id = me.guild_id;
  IF t.hero_id IS NULL THEN RAISE EXCEPTION 'Not a member of your guild'; END IF;
  IF t.hero_id = _hero THEN RAISE EXCEPTION 'Use Leave instead'; END IF;
  IF me.role = 'member' OR t.role = 'leader' OR (me.role = 'officer' AND t.role <> 'member') THEN RAISE EXCEPTION 'You do not have permission to remove this member'; END IF;
  DELETE FROM public.guild_members WHERE hero_id = _target;
END $$;

CREATE OR REPLACE FUNCTION public.guild_set_role(_hero uuid, _target uuid, _role text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role <> 'leader' THEN RAISE EXCEPTION 'Only the Guild Leader can change roles'; END IF;
  IF _role NOT IN ('officer','member') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  IF _target = _hero THEN RAISE EXCEPTION 'Use Transfer leadership instead'; END IF;
  UPDATE public.guild_members SET role = _role WHERE hero_id = _target AND guild_id = me.guild_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not a member of your guild'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.guild_transfer(_hero uuid, _target uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role <> 'leader' THEN RAISE EXCEPTION 'Only the Guild Leader can transfer leadership'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = _target AND guild_id = me.guild_id) OR _target = _hero THEN RAISE EXCEPTION 'Not a member of your guild'; END IF;
  UPDATE public.guild_members SET role = 'officer' WHERE hero_id = _hero;
  UPDATE public.guild_members SET role = 'leader' WHERE hero_id = _target;
  UPDATE public.guilds SET leader_id = _target WHERE id = me.guild_id;
END $$;

CREATE OR REPLACE FUNCTION public.guild_disband(_hero uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role <> 'leader' THEN RAISE EXCEPTION 'Only the Guild Leader can disband the guild'; END IF;
  DELETE FROM public.guilds WHERE id = me.guild_id;
END $$;

CREATE OR REPLACE FUNCTION public.guild_update(_hero uuid, _description text, _emblem text, _announcement text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; me public.guild_members;
BEGIN
  h := public._my_hero(_hero); me := public._guild_role(_hero);
  IF me.role = 'member' THEN RAISE EXCEPTION 'Only the leader and officers can edit the guild'; END IF;
  UPDATE public.guilds SET description = left(coalesce(_description, description), 200), emblem = left(coalesce(_emblem, emblem), 20),
    announcement = left(coalesce(_announcement, announcement), 300) WHERE id = me.guild_id;
END $$;

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('world','guild','private')),
  guild_id uuid,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL,
  sender_class text NOT NULL DEFAULT 'warrior',
  recipient_id uuid,
  recipient_name text,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_channel_idx ON public.chat_messages (channel, created_at DESC);
CREATE INDEX chat_sender_idx ON public.chat_messages (sender_id, created_at DESC);
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "world chat visible to players" ON public.chat_messages FOR SELECT TO authenticated USING (channel = 'world');
CREATE POLICY "guild chat visible to members" ON public.chat_messages FOR SELECT TO authenticated
  USING (channel = 'guild' AND guild_id IN (SELECT public.my_guild_ids()));
CREATE POLICY "private chat visible to participants" ON public.chat_messages FOR SELECT TO authenticated
  USING (channel = 'private' AND (sender_id IN (SELECT public.my_hero_ids()) OR recipient_id IN (SELECT public.my_hero_ids())));
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

CREATE TABLE public.chat_reports (
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '' CHECK (char_length(reason) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, reporter_id)
);
GRANT SELECT ON public.chat_reports TO authenticated;
GRANT ALL ON public.chat_reports TO service_role;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "see own reports" ON public.chat_reports FOR SELECT TO authenticated USING (reporter_id IN (SELECT public.my_hero_ids()));

CREATE OR REPLACE FUNCTION public.send_chat(_hero uuid, _channel text, _body text, _to uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; g uuid; rname text; mid uuid;
BEGIN
  SELECT * INTO h FROM public.heroes WHERE id = _hero AND user_id = auth.uid();
  IF h.id IS NULL THEN RAISE EXCEPTION 'Character not found'; END IF;
  _body := btrim(regexp_replace(coalesce(_body, ''), '[[:cntrl:]]', '', 'g'));
  IF char_length(_body) < 1 THEN RAISE EXCEPTION 'Message is empty'; END IF;
  IF char_length(_body) > 200 THEN RAISE EXCEPTION 'Messages are limited to 200 characters'; END IF;
  IF EXISTS (SELECT 1 FROM public.chat_messages WHERE sender_id = _hero AND created_at > now() - interval '1 second') THEN RAISE EXCEPTION 'You are sending messages too quickly'; END IF;
  IF (SELECT count(*) FROM public.chat_messages WHERE sender_id = _hero AND created_at > now() - interval '15 seconds') >= 5 THEN RAISE EXCEPTION 'Slow down - at most 5 messages every 15 seconds'; END IF;
  IF (SELECT count(*) FROM public.chat_reports r JOIN public.chat_messages m ON m.id = r.message_id WHERE m.sender_id = _hero AND r.created_at > now() - interval '1 day') >= 5 THEN
    RAISE EXCEPTION 'Your chat is temporarily muted after multiple reports'; END IF;
  IF _channel = 'world' THEN
    INSERT INTO public.chat_messages (channel, sender_id, sender_name, sender_class, body) VALUES ('world', _hero, h.name, h.hero_class, _body) RETURNING id INTO mid;
  ELSIF _channel = 'guild' THEN
    SELECT guild_id INTO g FROM public.guild_members WHERE hero_id = _hero;
    IF g IS NULL THEN RAISE EXCEPTION 'Join a guild to use guild chat'; END IF;
    INSERT INTO public.chat_messages (channel, guild_id, sender_id, sender_name, sender_class, body) VALUES ('guild', g, _hero, h.name, h.hero_class, _body) RETURNING id INTO mid;
  ELSIF _channel = 'private' THEN
    SELECT name INTO rname FROM public.heroes WHERE id = _to;
    IF rname IS NULL THEN RAISE EXCEPTION 'That hero does not exist'; END IF;
    IF _to = _hero THEN RAISE EXCEPTION 'You cannot message yourself'; END IF;
    INSERT INTO public.chat_messages (channel, sender_id, sender_name, sender_class, recipient_id, recipient_name, body) VALUES ('private', _hero, h.name, h.hero_class, _to, rname, _body) RETURNING id INTO mid;
  ELSE
    RAISE EXCEPTION 'Unknown channel';
  END IF;
  RETURN mid;
END $$;

CREATE OR REPLACE FUNCTION public.report_message(_hero uuid, _message uuid, _reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.heroes WHERE id = _hero AND user_id = auth.uid()) THEN RAISE EXCEPTION 'Character not found'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.chat_messages WHERE id = _message) THEN RAISE EXCEPTION 'Message not found'; END IF;
  INSERT INTO public.chat_reports (message_id, reporter_id, reason) VALUES (_message, _hero, left(coalesce(_reason, ''), 200)) ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['_my_hero(uuid)','_write_save(uuid,jsonb)','_apply_reward(jsonb,jsonb)','_guild_role(uuid)','_progress(uuid,text,text)'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon, authenticated', f);
  END LOOP;
  FOREACH f IN ARRAY ARRAY['read_mail(uuid,uuid)','claim_mail(uuid,uuid)','lucky_shot(uuid,uuid)','buy_scroll(uuid,text,uuid)','activate_scroll(uuid,text)',
    'begin_battle(uuid)','get_activities(uuid)','track_activity(uuid,text)','claim_activity(uuid,text)','claim_login(uuid)','unlock_cosmetic(uuid,text)',
    'create_guild(uuid,text,text,text)','guild_invite(uuid,text)','respond_invite(uuid,uuid,boolean)','leave_guild(uuid)','guild_kick(uuid,uuid)',
    'guild_set_role(uuid,uuid,text)','guild_transfer(uuid,uuid)','guild_disband(uuid)','guild_update(uuid,text,text,text)','send_chat(uuid,text,text,uuid)',
    'report_message(uuid,uuid,text)','my_hero_ids()','my_guild_ids()'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
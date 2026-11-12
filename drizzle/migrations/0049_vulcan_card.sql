-- Vulcan Card: one card buys one more Party Spire run on the current UTC day.
--
-- The Spire allowance is server-owned (0032_spire_party.sql, corrected by
-- 0033_spire_party_fixes.sql), so the extra run must be minted here instead of on a client save.
-- `spire_runs.bonus_runs` counts the extra runs bought for `bonus_day`; `spire_state` and
-- `spire_begin` add that bonus to the free three runs, and `spire_use_vulcan` is the only writer:
-- it takes the card out of the hero's save and adds the run in one transaction, so one card can
-- never become two runs. The card itself is a gold-priced shop good (see src/game/vulcan.ts), so
-- its count lives in the player save exactly like a mount or a Conquest Key.

ALTER TABLE public.spire_runs ADD COLUMN IF NOT EXISTS bonus_runs integer NOT NULL DEFAULT 0;
ALTER TABLE public.spire_runs ADD COLUMN IF NOT EXISTS bonus_day date;

-- Extra runs bought for today (0 on any other day).
CREATE OR REPLACE FUNCTION public._spire_bonus(_hero uuid) RETURNS integer LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT coalesce((SELECT bonus_runs FROM public.spire_runs
                    WHERE hero_id = _hero AND bonus_day = public._today()), 0) $$;

CREATE OR REPLACE FUNCTION public.spire_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs; live boolean; bonus integer;
BEGIN
 h := public._my_hero(_hero);
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero;
 live := coalesce(r.started_at IS NOT NULL AND r.started_at > now() - interval '4 hours', false);
 bonus := public._spire_bonus(_hero);
 RETURN jsonb_build_object(
  'floor', CASE WHEN live THEN r.floor ELSE 0 END,
  'best', coalesce(r.best, 0),
  'runs_left', greatest(0, 3 + bonus - CASE WHEN r.runs_day = public._today() THEN r.runs ELSE 0 END),
  'chests', public._num(h.save->'srv'->'spireChests'),
  'active', live);
END $$;

-- Starts a run at floor 0, or resumes the one already open. Three runs per UTC day, plus one per
-- Vulcan Card burned that day.
CREATE OR REPLACE FUNCTION public.spire_begin(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs; bonus integer;
BEGIN
 h := public._my_hero(_hero);
 INSERT INTO public.spire_runs(hero_id) VALUES(_hero) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero FOR UPDATE;
 -- A run that is still open is resumed: charging a second run for it would rob the player.
 IF r.started_at IS NOT NULL AND r.started_at > now() - interval '4 hours' THEN
   RETURN jsonb_build_object('ok', true, 'resumed', true, 'floor', r.floor);
 END IF;
 bonus := public._spire_bonus(_hero);
 IF r.runs_day = public._today() AND r.runs >= 3 + bonus THEN RAISE EXCEPTION 'No Spire runs left today'; END IF;
 UPDATE public.spire_runs SET floor=0, started_at=now(), last_clear=now(),
  runs = CASE WHEN runs_day = public._today() THEN runs+1 ELSE 1 END, runs_day=public._today() WHERE hero_id=_hero;
 RETURN jsonb_build_object('ok', true, 'resumed', false, 'floor', 0);
END $$;

-- Burns one Vulcan Card from the hero's pack for one more run today.
CREATE OR REPLACE FUNCTION public.spire_use_vulcan(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs; cards integer; bonus integer; s jsonb;
BEGIN
 h := public._my_hero(_hero);
 cards := public._num(h.save->'vulcan');
 IF cards < 1 THEN RAISE EXCEPTION 'No Vulcan Card in your pack'; END IF;
 INSERT INTO public.spire_runs(hero_id) VALUES(_hero) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero FOR UPDATE;
 bonus := public._spire_bonus(_hero);
 s := jsonb_set(h.save, '{vulcan}', to_jsonb(cards - 1), true);
 PERFORM public._write_save(_hero, s);
 UPDATE public.spire_runs SET bonus_runs = bonus + 1, bonus_day = public._today() WHERE hero_id=_hero;
 RETURN jsonb_build_object(
  'save', s,
  'runs_left', greatest(0, 3 + bonus + 1 - CASE WHEN r.runs_day = public._today() THEN r.runs ELSE 0 END));
END $$;

REVOKE ALL ON FUNCTION public.spire_state(uuid), public.spire_begin(uuid), public.spire_use_vulcan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spire_state(uuid), public.spire_begin(uuid), public.spire_use_vulcan(uuid) TO authenticated, service_role;

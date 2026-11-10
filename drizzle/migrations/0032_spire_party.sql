CREATE TABLE public.spire_runs (hero_id uuid PRIMARY KEY REFERENCES public.heroes(id) ON DELETE CASCADE, floor integer NOT NULL DEFAULT 0, best integer NOT NULL DEFAULT 0, started_at timestamptz, last_clear timestamptz, runs_day date, runs integer NOT NULL DEFAULT 0, chests_opened integer NOT NULL DEFAULT 0);
GRANT ALL ON public.spire_runs TO service_role;
ALTER TABLE public.spire_runs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.spire_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs;
BEGIN
 h := public._my_hero(_hero);
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero;
 RETURN jsonb_build_object('floor',coalesce(r.floor,0),'best',coalesce(r.best,0),
  'runs_left', 3 - CASE WHEN r.runs_day = public._today() THEN r.runs ELSE 0 END,
  'chests', public._num(h.save->'srv'->'spireChests'));
END $$;

-- Starts a run at floor 0. Three runs per UTC day.
CREATE OR REPLACE FUNCTION public.spire_begin(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs;
BEGIN
 h := public._my_hero(_hero);
 INSERT INTO public.spire_runs(hero_id) VALUES(_hero) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero FOR UPDATE;
 IF r.runs_day = public._today() AND r.runs >= 3 THEN RAISE EXCEPTION 'No Spire runs left today'; END IF;
 UPDATE public.spire_runs SET floor=0, started_at=now(), last_clear=now(),
  runs = CASE WHEN runs_day = public._today() THEN runs+1 ELSE 1 END, runs_day=public._today() WHERE hero_id=_hero;
 RETURN jsonb_build_object('ok',true);
END $$;

-- Records the next cleared floor and mints one Spire Chest. Floors must be cleared in order, at most 240.
CREATE OR REPLACE FUNCTION public.spire_clear(_hero uuid, _floor integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; r public.spire_runs; s jsonb;
BEGIN
 h := public._my_hero(_hero);
 SELECT * INTO r FROM public.spire_runs WHERE hero_id=_hero FOR UPDATE;
 IF r.started_at IS NULL OR r.started_at < now() - interval '4 hours' THEN RAISE EXCEPTION 'No Spire run in progress'; END IF;
 IF _floor IS DISTINCT FROM r.floor + 1 OR _floor > 240 THEN RAISE EXCEPTION 'Floors must be cleared in order'; END IF;
 IF r.last_clear > now() - interval '4 seconds' THEN RAISE EXCEPTION 'Too fast'; END IF;
 UPDATE public.spire_runs SET floor=_floor, best=greatest(best,_floor), last_clear=now() WHERE hero_id=_hero;
 s := jsonb_set(h.save,'{srv,spireChests}', to_jsonb(public._num(h.save->'srv'->'spireChests') + 1), true);
 PERFORM public._write_save(_hero, s);
 RETURN jsonb_build_object('save',s,'floor',_floor);
END $$;

CREATE OR REPLACE FUNCTION public.spire_end(_hero uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes;
BEGIN h := public._my_hero(_hero); UPDATE public.spire_runs SET started_at=NULL WHERE hero_id=_hero; END $$;

-- Opens one Spire Chest with a random reward that grows with the hero's best floor.
CREATE OR REPLACE FUNCTION public.spire_open_chest(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; n numeric; best integer; roll float := random(); rw jsonb; s jsonb;
BEGIN
 h := public._my_hero(_hero);
 n := public._num(h.save->'srv'->'spireChests');
 IF n < 1 THEN RAISE EXCEPTION 'No Spire Chests to open'; END IF;
 best := coalesce((SELECT spire_runs.best FROM public.spire_runs WHERE hero_id=_hero),1);
 rw := CASE
  WHEN roll < 0.45 THEN jsonb_build_object('gold', 400 + best*60 + floor(random()*400)::int)
  WHEN roll < 0.70 THEN jsonb_build_object('mats', jsonb_build_object('ore', 8 + best/4, 'essence', 3 + best/10))
  WHEN roll < 0.85 THEN jsonb_build_object('mats', jsonb_build_object('starshard', 1 + best/40, 'sigil', 1 + best/60))
  WHEN roll < 0.95 THEN jsonb_build_object('mats', jsonb_build_object('frostCrystal', 1 + best/80, 'enchantStone', 1))
  WHEN roll < 0.99 THEN jsonb_build_object('mats', jsonb_build_object('voidCrystal', 1, 'bossCore', 1))
  ELSE jsonb_build_object('mats', jsonb_build_object('sunCrystal', 1), 'gold', 5000 + best*100) END;
 s := jsonb_set(h.save,'{srv,spireChests}', to_jsonb(n - 1), true);
 s := public._apply_reward(s, rw);
 PERFORM public._write_save(_hero, s);
 UPDATE public.spire_runs SET chests_opened = chests_opened + 1 WHERE hero_id=_hero;
 RETURN jsonb_build_object('save',s,'reward',rw);
END $$;

REVOKE ALL ON FUNCTION public.spire_state(uuid), public.spire_begin(uuid), public.spire_clear(uuid,integer), public.spire_end(uuid), public.spire_open_chest(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spire_state(uuid), public.spire_begin(uuid), public.spire_clear(uuid,integer), public.spire_end(uuid), public.spire_open_chest(uuid) TO authenticated, service_role;
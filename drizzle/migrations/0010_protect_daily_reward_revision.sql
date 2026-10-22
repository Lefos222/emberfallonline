CREATE OR REPLACE FUNCTION public.protect_daily_reward_revision() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_setting('app.srv',true) IS DISTINCT FROM '1' AND NEW.save IS DISTINCT FROM OLD.save AND public._num(NEW.save->'srv'->'dailyRewardRevision') <> public._num(OLD.save->'srv'->'dailyRewardRevision') THEN
  RAISE EXCEPTION 'A newer daily reward is saved. Reopen your character before saving.';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER check_daily_reward_revision BEFORE UPDATE ON public.heroes FOR EACH ROW EXECUTE FUNCTION public.protect_daily_reward_revision();
CREATE OR REPLACE FUNCTION public.claim_login(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; ok int; streak int := 0; d date; total int; rw jsonb; m numeric; s jsonb; cos jsonb := '[]'::jsonb;
BEGIN
 h := public._my_hero(_hero);
 INSERT INTO public.login_days (hero_id,day) VALUES (_hero,public._today()) ON CONFLICT DO NOTHING RETURNING 1 INTO ok;
 IF ok IS NULL THEN RAISE EXCEPTION 'Already claimed today'; END IF;
 d := public._today();
 WHILE EXISTS (SELECT 1 FROM public.login_days WHERE hero_id = _hero AND day = d) LOOP streak := streak+1; d := d-1; END LOOP;
 SELECT count(*) INTO total FROM public.login_days WHERE hero_id = _hero;
 m := 1 + least(h.level,80)/10.0;
 rw := public.daily_login_items(h.hero_class::text,streak) || jsonb_build_object('gold',round(150*m*least(streak,7)));
 IF streak%7 = 0 THEN rw := rw || jsonb_build_object('shots',1); END IF;
 IF total >= 7 THEN cos := cos || '"frame_ember"'::jsonb; END IF;
 IF total >= 30 THEN cos := cos || '"wings_ember"'::jsonb; END IF;
 IF total >= 100 THEN cos := cos || '"outfit_royal"'::jsonb; END IF;
 rw := rw || jsonb_build_object('cosmetics',cos);
 s := public._apply_reward(h.save,rw);
 s := jsonb_set(s,'{srv,dailyRewardRevision}',to_jsonb(public._num(h.save->'srv'->'dailyRewardRevision')+1),true);
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'reward',rw,'streak',streak,'total',total);
END $$;
REVOKE ALL ON FUNCTION public.protect_daily_reward_revision() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.protect_daily_reward_revision() TO service_role;
CREATE OR REPLACE FUNCTION public.daily_login_items(_class text, _streak integer) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT jsonb_build_object('mats', jsonb_build_object('ore',5,'fragment',2,'starshard',1), 'gems', jsonb_build_object(CASE WHEN _class = 'mage' THEN 'amethyst:1' WHEN _class = 'archer' THEN 'topaz:1' ELSE 'ruby:1' END,1), 'scrolls',jsonb_build_object(CASE ((_streak-1)%3) WHEN 0 THEN 'dmg' WHEN 1 THEN 'def' ELSE 'xp' END,1));
$$;
REVOKE ALL ON FUNCTION public.daily_login_items(text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.daily_login_items(text,integer) TO service_role;
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
 PERFORM public._write_save(_hero,s);
 RETURN jsonb_build_object('save',s,'reward',rw,'streak',streak,'total',total);
END $$;
REVOKE ALL ON FUNCTION public.claim_login(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_login(uuid) TO authenticated,service_role;
COMMENT ON FUNCTION public.claim_login(uuid) IS 'Owner-checked once-per-UTC-day login claim. Real crafting materials, class gem and rotating battle scroll use existing saved collections; preserves gold, seven-day shots and cosmetic milestones.';
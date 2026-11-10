CREATE TABLE public.castle_raids (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid UNIQUE NOT NULL,
 attacker_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 defender_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
 attacker_name text NOT NULL,
 defender_name text NOT NULL,
 won boolean NOT NULL,
 gold integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.castle_raids TO authenticated;
GRANT ALL ON public.castle_raids TO service_role;
ALTER TABLE public.castle_raids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own castle raids readable" ON public.castle_raids FOR SELECT TO authenticated
 USING (attacker_id IN (SELECT public.my_hero_ids()) OR defender_id IN (SELECT public.my_hero_ids()));
CREATE INDEX castle_raids_attacker_idx ON public.castle_raids(attacker_id, created_at DESC);
CREATE INDEX castle_raids_defender_idx ON public.castle_raids(defender_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.player_castle_raid(_hero uuid,_target uuid,_won boolean,_req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; tg public.heroes; s jsonb; prev public.castle_raids; fort int; gold int:=0; used int;
BEGIN
 h:=public._my_hero(_hero);
 SELECT * INTO prev FROM public.castle_raids WHERE request_id=_req;
 IF FOUND THEN RETURN jsonb_build_object('save',h.save,'gold',prev.gold,'won',prev.won,'repeat',true); END IF;
 IF _target=_hero THEN RAISE EXCEPTION 'You cannot raid your own castle'; END IF;
 SELECT * INTO tg FROM public.heroes WHERE id=_target AND is_public;
 IF NOT FOUND OR tg.save->'worldCastle' IS NULL THEN RAISE EXCEPTION 'That castle no longer stands'; END IF;
 IF tg.user_id=h.user_id THEN RAISE EXCEPTION 'You cannot raid your own castles'; END IF;
 IF h.save->'worldCastle' IS NULL THEN RAISE EXCEPTION 'Plant your own banner before raiding'; END IF;
 SELECT count(*) INTO used FROM public.castle_raids WHERE attacker_id=_hero AND created_at>=date_trunc('day',now() AT TIME ZONE 'utc') AT TIME ZONE 'utc';
 IF used>=3 THEN RAISE EXCEPTION 'All castle raids are spent today'; END IF;
 IF EXISTS(SELECT 1 FROM public.castle_raids WHERE attacker_id=_hero AND defender_id=_target AND created_at>now()-interval '8 hours') THEN
  RAISE EXCEPTION 'That castle is still rebuilding its walls'; END IF;
 fort:=least(10,greatest(0,coalesce(round(public._num(tg.save->'worldCastle'->'fort'))::int,0)));
 IF _won THEN gold:=round((300+tg.level*25)*(1+fort*0.1))::int; END IF;
 INSERT INTO public.castle_raids(request_id,attacker_id,defender_id,attacker_name,defender_name,won,gold)
  VALUES(_req,_hero,_target,h.name,tg.name,_won,gold);
 s:=h.save;
 IF gold>0 THEN s:=public._apply_reward(s,jsonb_build_object('gold',gold)); PERFORM public._write_save(_hero,s); END IF;
 RETURN jsonb_build_object('save',s,'gold',gold,'won',_won,'repeat',false);
END $$;
REVOKE ALL ON FUNCTION public.player_castle_raid(uuid,uuid,boolean,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.player_castle_raid(uuid,uuid,boolean,uuid) TO authenticated,service_role;
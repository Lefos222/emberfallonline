CREATE TABLE public.guild_bank (guild_id uuid PRIMARY KEY REFERENCES public.guilds(id) ON DELETE CASCADE, funds bigint NOT NULL DEFAULT 0);
CREATE TABLE public.guild_contrib (guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE, hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, points integer NOT NULL DEFAULT 0, total integer NOT NULL DEFAULT 0, PRIMARY KEY (guild_id, hero_id));
CREATE TABLE public.guild_buffs (guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE, kind text NOT NULL, expires_at timestamptz NOT NULL, PRIMARY KEY (guild_id, kind));
CREATE TABLE public.guild_dice (hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, day date NOT NULL, face integer NOT NULL, PRIMARY KEY (hero_id, day));
CREATE TABLE public.guild_shop_buys (request_id uuid PRIMARY KEY, hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE, item text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.guild_bank, public.guild_contrib, public.guild_buffs, public.guild_dice, public.guild_shop_buys TO service_role;
ALTER TABLE public.guild_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_contrib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_buffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_dice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_shop_buys ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._guild_rank(_total integer) RETURNS text LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE WHEN _total >= 15000 THEN 'Legend' WHEN _total >= 6000 THEN 'Champion' WHEN _total >= 2000 THEN 'Veteran' WHEN _total >= 500 THEN 'Sworn' ELSE 'Recruit' END $$;
CREATE OR REPLACE FUNCTION public._guild_rank_no(_total integer) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE WHEN _total >= 15000 THEN 4 WHEN _total >= 6000 THEN 3 WHEN _total >= 2000 THEN 2 WHEN _total >= 500 THEN 1 ELSE 0 END $$;

CREATE OR REPLACE FUNCTION public._contrib_add(_guild uuid, _hero uuid, _pts integer) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 INSERT INTO public.guild_contrib(guild_id,hero_id,points,total) VALUES(_guild,_hero,_pts,_pts)
 ON CONFLICT (guild_id,hero_id) DO UPDATE SET points=guild_contrib.points+_pts, total=guild_contrib.total+_pts $$;

-- Buff catalogue: kind -> fund cost (24 hours).
CREATE OR REPLACE FUNCTION public._buff_cost(_kind text) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE _kind WHEN 'atk' THEN 200000 WHEN 'hp' THEN 200000 WHEN 'xp' THEN 300000 WHEN 'gold' THEN 300000 ELSE NULL END $$;

-- Shop catalogue: item -> points, minimum rank, reward.
CREATE OR REPLACE FUNCTION public._guild_shop(_item text) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE _item
  WHEN 'ore' THEN '{"cost":60,"rank":0,"rw":{"mats":{"ore":40}}}'::jsonb
  WHEN 'essence' THEN '{"cost":80,"rank":0,"rw":{"mats":{"essence":15}}}'::jsonb
  WHEN 'sigil' THEN '{"cost":150,"rank":1,"rw":{"mats":{"sigil":4}}}'::jsonb
  WHEN 'starshard' THEN '{"cost":200,"rank":1,"rw":{"mats":{"starshard":5}}}'::jsonb
  WHEN 'bossCore' THEN '{"cost":350,"rank":2,"rw":{"mats":{"bossCore":2}}}'::jsonb
  WHEN 'frostCrystal' THEN '{"cost":400,"rank":2,"rw":{"mats":{"frostCrystal":3}}}'::jsonb
  WHEN 'voidCrystal' THEN '{"cost":700,"rank":3,"rw":{"mats":{"voidCrystal":2}}}'::jsonb
  WHEN 'sunCrystal' THEN '{"cost":1200,"rank":4,"rw":{"mats":{"sunCrystal":1}}}'::jsonb
  ELSE NULL END $$;

CREATE OR REPLACE FUNCTION public.guild_extras_state(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; c public.guild_contrib;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 SELECT * INTO c FROM public.guild_contrib WHERE guild_id=m.guild_id AND hero_id=_hero;
 RETURN jsonb_build_object(
  'funds', coalesce((SELECT funds FROM public.guild_bank WHERE guild_id=m.guild_id),0),
  'role', m.role,
  'points', coalesce(c.points,0), 'total', coalesce(c.total,0), 'rank', public._guild_rank(coalesce(c.total,0)),
  'buffs', coalesce((SELECT jsonb_agg(jsonb_build_object('kind',kind,'expires_at',expires_at)) FROM public.guild_buffs WHERE guild_id=m.guild_id AND expires_at > now()),'[]'::jsonb),
  'dice', (SELECT face FROM public.guild_dice WHERE hero_id=_hero AND day=public._today()),
  'roster', coalesce((SELECT jsonb_agg(jsonb_build_object('name',hh.name,'total',coalesce(gc.total,0),'rank',public._guild_rank(coalesce(gc.total,0))) ORDER BY coalesce(gc.total,0) DESC)
     FROM public.guild_members gm JOIN public.heroes hh ON hh.id=gm.hero_id LEFT JOIN public.guild_contrib gc ON gc.guild_id=gm.guild_id AND gc.hero_id=gm.hero_id WHERE gm.guild_id=m.guild_id),'[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.guild_bank_donate(_hero uuid, _gold integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF _gold IS NULL OR _gold < 1000 OR _gold > 1000000 THEN RAISE EXCEPTION 'Donate between 1,000 and 1,000,000 gold'; END IF;
 IF public._num(h.save->'gold') < _gold THEN RAISE EXCEPTION 'Not enough gold'; END IF;
 s := jsonb_set(h.save,'{gold}',to_jsonb(round(public._num(h.save->'gold') - _gold)),true);
 PERFORM public._write_save(_hero, s);
 INSERT INTO public.guild_bank(guild_id,funds) VALUES(m.guild_id,_gold) ON CONFLICT (guild_id) DO UPDATE SET funds=guild_bank.funds+_gold;
 PERFORM public._contrib_add(m.guild_id,_hero,_gold/100);
 RETURN jsonb_build_object('save',s,'points',_gold/100);
END $$;

CREATE OR REPLACE FUNCTION public.guild_buff_activate(_hero uuid, _kind text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; cost integer := public._buff_cost(_kind);
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF cost IS NULL THEN RAISE EXCEPTION 'Unknown guild buff'; END IF;
 IF m.role NOT IN ('leader','officer') THEN RAISE EXCEPTION 'Only the leader or an officer can light a guild buff'; END IF;
 IF EXISTS (SELECT 1 FROM public.guild_buffs WHERE guild_id=m.guild_id AND kind=_kind AND expires_at > now()) THEN RAISE EXCEPTION 'That buff is already active'; END IF;
 UPDATE public.guild_bank SET funds=funds-cost WHERE guild_id=m.guild_id AND funds >= cost;
 IF NOT FOUND THEN RAISE EXCEPTION 'The guild bank does not hold enough gold'; END IF;
 INSERT INTO public.guild_buffs(guild_id,kind,expires_at) VALUES(m.guild_id,_kind,now()+interval '24 hours')
  ON CONFLICT (guild_id,kind) DO UPDATE SET expires_at=excluded.expires_at;
 RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.guild_dice_roll(_hero uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; f integer := 1 + floor(random()*6)::int; s jsonb; rw jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 INSERT INTO public.guild_dice(hero_id,day,face) VALUES(_hero,public._today(),f) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RAISE EXCEPTION 'You already rolled the guild dice today'; END IF;
 rw := jsonb_build_object('gold', f*(300+h.level*10), 'mats', CASE WHEN f=6 THEN jsonb_build_object('starshard',3,'essence',5) WHEN f>=4 THEN jsonb_build_object('essence',3) ELSE jsonb_build_object('ore',10) END);
 s := public._apply_reward(h.save, rw); PERFORM public._write_save(_hero, s);
 PERFORM public._contrib_add(m.guild_id,_hero,f*10);
 RETURN jsonb_build_object('save',s,'reward',rw,'face',f,'points',f*10);
END $$;

CREATE OR REPLACE FUNCTION public.guild_shop_buy(_hero uuid, _item text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h public.heroes; m public.guild_members; it jsonb := public._guild_shop(_item); c public.guild_contrib; s jsonb;
BEGIN
 h := public._my_hero(_hero); m := public._guild_role(_hero);
 IF it IS NULL THEN RAISE EXCEPTION 'Unknown guild shop item'; END IF;
 IF EXISTS (SELECT 1 FROM public.guild_shop_buys WHERE request_id=_req) THEN RETURN jsonb_build_object('save',h.save,'reward',it->'rw','repeat',true); END IF;
 SELECT * INTO c FROM public.guild_contrib WHERE guild_id=m.guild_id AND hero_id=_hero FOR UPDATE;
 IF public._guild_rank_no(coalesce(c.total,0)) < (it->>'rank')::int THEN RAISE EXCEPTION 'Your guild rank is too low for that item'; END IF;
 IF coalesce(c.points,0) < (it->>'cost')::int THEN RAISE EXCEPTION 'Not enough contribution points'; END IF;
 UPDATE public.guild_contrib SET points=points-(it->>'cost')::int WHERE guild_id=m.guild_id AND hero_id=_hero;
 INSERT INTO public.guild_shop_buys(request_id,hero_id,item) VALUES(_req,_hero,_item);
 s := public._apply_reward(h.save, it->'rw'); PERFORM public._write_save(_hero, s);
 RETURN jsonb_build_object('save',s,'reward',it->'rw');
END $$;

REVOKE ALL ON FUNCTION public.guild_extras_state(uuid), public.guild_bank_donate(uuid,integer), public.guild_buff_activate(uuid,text), public.guild_dice_roll(uuid), public.guild_shop_buy(uuid,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guild_extras_state(uuid), public.guild_bank_donate(uuid,integer), public.guild_buff_activate(uuid,text), public.guild_dice_roll(uuid), public.guild_shop_buy(uuid,text,uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public._contrib_add(uuid,uuid,integer) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.spire_clear_in(_hero uuid,_floor integer,_dungeon text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE res jsonb; s jsonb; mat text; cap integer; qty integer; drop_ jsonb:='{}'::jsonb; gear jsonb; h public.heroes; slot_ text;
BEGIN
 h:=public._my_hero(_hero);
 SELECT d.mat,d.cap INTO mat,cap FROM (VALUES ('cinder','fragment',20),('ember','crystal',40),('frost','frostCrystal',60),('catacomb','sigil',80),('obsidian','voidCrystal',120),('observatory','starshard',160),('spire','sunCrystal',240)) d(id,mat,cap) WHERE d.id=_dungeon;
 IF mat IS NULL THEN RAISE EXCEPTION 'Unknown dungeon'; END IF;
 IF _floor>cap THEN RAISE EXCEPTION 'That dungeon has no such floor'; END IF;
 res:=public.spire_clear(_hero,_floor);s:=res->'save';
 IF random()<0.7 THEN
  qty:=1+_floor/20+CASE WHEN _floor=cap OR _floor%10=0 THEN 2 ELSE 0 END;
  drop_:=jsonb_build_object(mat,qty);s:=public._apply_reward(s,jsonb_build_object('mats',drop_));
 ELSE
  slot_:=(ARRAY['weapon','ring','talisman','armour','helmet','boots','belt'])[1+floor(random()*7)::int];
  gear:=jsonb_build_object('id',gen_random_uuid()::text,'slot',slot_,'cls',h.hero_class,'rarity',CASE WHEN random()<0.3 THEN 1 ELSE 0 END,'ilvl',greatest(1,h.level+_floor/20),'icon',floor(random()*4)::int,'enh',0,'name',CASE slot_ WHEN 'weapon' THEN CASE h.hero_class WHEN 'mage' THEN 'Iron Wand' WHEN 'archer' THEN 'Iron Bow' ELSE 'Iron Sword' END WHEN 'armour' THEN 'Iron Plate' WHEN 'helmet' THEN 'Iron Helm' WHEN 'boots' THEN 'Iron Boots' WHEN 'belt' THEN 'Iron Belt' WHEN 'ring' THEN 'Iron Band' ELSE 'Iron Charm' END);
  IF public._bag_room(s)>0 THEN s:=jsonb_set(s,'{inventory}',jsonb_build_array(gear)||coalesce(s->'inventory','[]'::jsonb),true);
  ELSE s:=jsonb_set(s,'{overflow}',coalesce(s->'overflow','[]'::jsonb)||jsonb_build_array(gear),true); END IF;
 END IF;
 PERFORM public._write_save(_hero,s);
 RETURN res||jsonb_build_object('save',s,'drop',drop_,'gear',gear);
END $$;
REVOKE ALL ON FUNCTION public.spire_clear_in(uuid,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.spire_clear_in(uuid,integer,text) TO authenticated,service_role;
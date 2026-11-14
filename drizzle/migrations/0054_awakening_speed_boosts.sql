CREATE OR REPLACE FUNCTION public.awakening_boost(_hero uuid, _kind text, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; a jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  price := CASE _kind WHEN 'xp_surge' THEN 150 WHEN 'shard_cache' THEN 200 WHEN 'trial_reset' THEN 50 WHEN 'stamina_refill' THEN 80 END;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown boost'; END IF;
  IF _kind IN ('shard_cache','trial_reset') AND h.level < 90 THEN RAISE EXCEPTION 'Awakening opens at level 90'; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  a := coalesce(s->'awakening', '{}'::jsonb);
  IF _kind = 'xp_surge' THEN
    s := jsonb_set(s, '{srv,premium,surgeUntil}', to_jsonb(greatest(now(), coalesce(nullif(s->'srv'->'premium'->>'surgeUntil','')::timestamptz, now())) + interval '2 hours'), true);
  ELSIF _kind = 'shard_cache' THEN
    a := a || jsonb_build_object('shards', public._num(a->'shards')::int + 150);
    s := jsonb_set(s, '{awakening}', a, true);
  ELSIF _kind = 'trial_reset' THEN
    a := a || jsonb_build_object('trials', 0);
    s := jsonb_set(s, '{awakening}', a, true);
  ELSE
    s := jsonb_set(s, '{stamina}', coalesce(s->'stamina','{}'::jsonb) || jsonb_build_object('spent', 0), true);
  END IF;
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(s->'srv'->'premium'->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'boost:' || _kind)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'boost:' || _kind, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.awakening_boost(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.awakening_boost(uuid,text,uuid) TO authenticated;
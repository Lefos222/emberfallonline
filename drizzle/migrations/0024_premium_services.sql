CREATE OR REPLACE FUNCTION public.premium_service(_hero uuid, _kind text, _req uuid, _value text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int; bal int; s jsonb; nm text; g text; n int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  price := CASE _kind WHEN 'gender_card' THEN 500 WHEN 'name_card' THEN 700 WHEN 'shop_refresh' THEN 50 WHEN 'arena_duel' THEN 50 END;
  IF price IS NULL THEN RAISE EXCEPTION 'Unknown service'; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  IF _kind = 'name_card' THEN
    nm := btrim(coalesce(_value, ''));
    IF nm !~ '^[A-Za-z0-9 _-]{3,16}$' THEN RAISE EXCEPTION 'Names are 3-16 letters, numbers, spaces, _ or -'; END IF;
    IF EXISTS (SELECT 1 FROM public.heroes WHERE lower(name) = lower(nm) AND id <> _hero) THEN RAISE EXCEPTION 'That name is taken'; END IF;
    s := jsonb_set(s, '{name}', to_jsonb(nm), true);
    UPDATE public.heroes SET name = nm WHERE id = _hero;
  ELSIF _kind = 'gender_card' THEN
    g := CASE WHEN h.gender = 'female' THEN 'male' ELSE 'female' END;
    UPDATE public.heroes SET gender = g WHERE id = _hero;
  ELSE
    n := public._num(s->'srv'->'premium'->'services'->_kind)::int + 1;
    s := jsonb_set(s, '{srv,premium,services}', coalesce(s->'srv'->'premium'->'services', '{}'::jsonb) || jsonb_build_object(_kind, n), true);
  END IF;
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(s->'srv'->'premium'->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'service:' || _kind)), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'service:' || _kind, price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.premium_service(uuid,text,uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.premium_service(uuid,text,uuid,text) TO authenticated;
-- Finishing a running blitz early: the client spends 25 Diamonds and takes the blitz's rewards
-- on the spot. The balance lives in srv.premium, which only SECURITY DEFINER RPCs may write,
-- so this is the only place the charge can happen (see src/game/blitz-run.ts).
CREATE OR REPLACE FUNCTION public.skip_blitz(_hero uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; price int := 25; bal int; s jsonb; p jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  bal := public._num(h.save->'srv'->'premium'->'balance')::int;
  IF bal < price THEN RAISE EXCEPTION 'Not enough Diamonds'; END IF;
  s := jsonb_set(h.save, '{srv,premium,balance}', to_jsonb(bal - price), true);
  p := s->'srv'->'premium';
  s := jsonb_set(s, '{srv,premium,history}', (coalesce(p->'history','[]'::jsonb) || jsonb_build_object('at', now(), 'kind', 'spend', 'amount', price, 'detail', 'blitz-skip')), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'blitz-skip', price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.skip_blitz(uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.skip_blitz(uuid,uuid) TO authenticated;

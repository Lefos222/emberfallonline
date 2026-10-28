CREATE OR REPLACE FUNCTION public.auction_buy(_hero uuid, _listing uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; l public.auction_listings; s jsonb; seller public.heroes; ss jsonb; cap int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer available'; END IF;
  IF l.seller_hero = _hero THEN RAISE EXCEPTION 'You cannot buy your own listing'; END IF;
  IF public._num(h.save->'gold') < l.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') - l.price), true);
  IF l.kind = 'item' THEN
    cap := 40 + 8 * public._num(h.save->'bagRows')::int;
    IF jsonb_array_length(coalesce(h.save->'inventory','[]'::jsonb)) >= cap THEN RAISE EXCEPTION 'Your bag is full'; END IF;
    s := jsonb_set(s, '{inventory}', jsonb_build_array(coalesce(l.payload,'{}'::jsonb)) || coalesce(h.save->'inventory','[]'::jsonb), true);
  ELSIF l.kind = 'gem' THEN
    s := jsonb_set(s, '{gems}', coalesce(s->'gems','{}'::jsonb) || jsonb_build_object(l.resource, public._num(s->'gems'->l.resource)::int + l.quantity), true);
  ELSE
    s := jsonb_set(s, '{srv,gathering,resources}', coalesce(s->'srv'->'gathering'->'resources','{}'::jsonb) || jsonb_build_object(l.resource, public._num(s->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
  END IF;
  UPDATE public.auction_listings SET status = 'sold', buyer_hero = _hero, closed_at = now() WHERE id = _listing;
  SELECT * INTO seller FROM public.heroes WHERE id = l.seller_hero;
  IF FOUND THEN
    ss := jsonb_set(seller.save, '{gold}', to_jsonb(public._num(seller.save->'gold') + l.price), true);
    PERFORM public._write_save(l.seller_hero, ss);
  END IF;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-buy:' || _listing, l.price);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.auction_cancel(_hero uuid, _listing uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; l public.auction_listings; s jsonb; cap int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.seller_hero <> _hero THEN RAISE EXCEPTION 'Not your listing'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer open'; END IF;
  IF l.kind = 'item' THEN
    cap := 40 + 8 * public._num(h.save->'bagRows')::int;
    IF jsonb_array_length(coalesce(h.save->'inventory','[]'::jsonb)) >= cap THEN RAISE EXCEPTION 'Your bag is full'; END IF;
    s := jsonb_set(h.save, '{inventory}', jsonb_build_array(coalesce(l.payload,'{}'::jsonb)) || coalesce(h.save->'inventory','[]'::jsonb), true);
  ELSIF l.kind = 'gem' THEN
    s := jsonb_set(h.save, '{gems}', coalesce(h.save->'gems','{}'::jsonb) || jsonb_build_object(l.resource, public._num(h.save->'gems'->l.resource)::int + l.quantity), true);
  ELSE
    s := jsonb_set(h.save, '{srv,gathering,resources}', coalesce(h.save->'srv'->'gathering'->'resources','{}'::jsonb) || jsonb_build_object(l.resource, public._num(h.save->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
  END IF;
  UPDATE public.auction_listings SET status = 'cancelled', closed_at = now() WHERE id = _listing;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-cancel:' || _listing, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.withdraw_application(_hero uuid, _application uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN
  h := public._my_hero(_hero);
  IF NOT EXISTS (SELECT 1 FROM public.guild_applications WHERE id = _application AND hero_id = _hero AND status = 'pending') THEN RAISE EXCEPTION 'Application not found'; END IF;
  DELETE FROM public.guild_applications WHERE id = _application;
END $$;
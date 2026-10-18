CREATE TABLE public.auction_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_hero uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  seller_name text NOT NULL,
  resource text NOT NULL,
  quantity int NOT NULL,
  price int NOT NULL,
  status text NOT NULL DEFAULT 'open',
  buyer_hero uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
GRANT SELECT ON public.auction_listings TO authenticated;
GRANT ALL ON public.auction_listings TO service_role;
ALTER TABLE public.auction_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings visible to players" ON public.auction_listings FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.auction_list(_hero uuid, _resource text, _qty int, _price int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; have int; s jsonb; parts text[];
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  parts := string_to_array(_resource, ':');
  IF array_length(parts, 1) IS DISTINCT FROM 3 OR parts[1] NOT IN ('mining','herbalism','logging','fishing','archaeology','treasure')
     OR parts[2] !~ '^[0-4]$' OR parts[3] !~ '^[0-3]$' THEN RAISE EXCEPTION 'Unknown resource'; END IF;
  IF _qty IS NULL OR _qty < 1 OR _qty > 999 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  IF _price IS NULL OR _price < 1 OR _price > 100000000 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  have := public._num(h.save->'srv'->'gathering'->'resources'->_resource)::int;
  IF have < _qty THEN RAISE EXCEPTION 'You do not have that many'; END IF;
  s := jsonb_set(h.save, '{srv,gathering,resources}', jsonb_build_object(_resource, have - _qty), true);
  INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price) VALUES (_hero, h.name, _resource, _qty, _price);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list:' || _resource, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.auction_buy(_hero uuid, _listing uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; l public.auction_listings; s jsonb; seller public.heroes; ss jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer available'; END IF;
  IF l.seller_hero = _hero THEN RAISE EXCEPTION 'You cannot buy your own listing'; END IF;
  IF public._num(h.save->'gold') < l.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') - l.price), true);
  s := jsonb_set(s, '{srv,gathering,resources}', jsonb_build_object(l.resource, public._num(s->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
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
DECLARE h public.heroes; l public.auction_listings; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.seller_hero <> _hero THEN RAISE EXCEPTION 'Not your listing'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer open'; END IF;
  UPDATE public.auction_listings SET status = 'cancelled', closed_at = now() WHERE id = _listing;
  s := jsonb_set(h.save, '{srv,gathering,resources}', jsonb_build_object(l.resource, public._num(h.save->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-cancel:' || _listing, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.auction_list(uuid,text,int,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_list(uuid,text,int,int,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_buy(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_buy(uuid,uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_cancel(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_cancel(uuid,uuid,uuid) TO authenticated;
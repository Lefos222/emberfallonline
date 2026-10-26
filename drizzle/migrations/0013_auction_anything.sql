-- The auction house takes anything: gathering supplies, gems and finished equipment.
-- Listings carry a `kind` ('resource' | 'gem' | 'item'); equipment is stored whole in
-- `payload`, so a sold piece keeps its stats, enhancement level and socketed gems.
ALTER TABLE public.auction_listings ADD COLUMN kind text NOT NULL DEFAULT 'resource';
ALTER TABLE public.auction_listings ADD COLUMN payload jsonb;
ALTER TABLE public.auction_listings ADD CONSTRAINT auction_listings_kind_check CHECK (kind IN ('resource','gem','item'));

-- The listed piece is taken from the hero's own bag, so a client can never list stats it does not own.
CREATE OR REPLACE FUNCTION public.auction_list_item(_hero uuid, _item jsonb, _price int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; s jsonb; bagged jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  IF _item IS NULL OR jsonb_typeof(_item) <> 'object' OR _item->>'id' IS NULL THEN RAISE EXCEPTION 'Unknown item'; END IF;
  IF _price IS NULL OR _price < 1 OR _price > 100000000 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  SELECT e INTO bagged FROM jsonb_array_elements(coalesce(h.save->'inventory','[]'::jsonb)) e WHERE e->>'id' = _item->>'id';
  IF bagged IS NULL OR bagged->>'name' IS NULL OR bagged->>'slot' IS NULL THEN RAISE EXCEPTION 'That item is not in your bag'; END IF;
  s := jsonb_set(h.save, '{inventory}', coalesce((SELECT jsonb_agg(e) FROM jsonb_array_elements(h.save->'inventory') e WHERE e->>'id' <> _item->>'id'), '[]'::jsonb), true);
  INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price, kind, payload)
    VALUES (_hero, h.name, 'item:' || (_item->>'id'), 1, _price, 'item', bagged);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list-item:' || (_item->>'id'), 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.auction_list_gem(_hero uuid, _gem text, _qty int, _price int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; have int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  IF _gem IS NULL OR _gem !~ '^(ruby|amethyst|sapphire|aquamarine|emerald|topaz|garnet|peridot|opal|onyx|obsidian|moonstone|pearl):[1-5]$' THEN RAISE EXCEPTION 'Unknown gem'; END IF;
  IF _qty IS NULL OR _qty < 1 OR _qty > 999 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  IF _price IS NULL OR _price < 1 OR _price > 100000000 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  have := public._num(h.save->'gems'->_gem)::int;
  IF have < _qty THEN RAISE EXCEPTION 'You do not have that many'; END IF;
  s := jsonb_set(h.save, '{gems}', coalesce(h.save->'gems','{}'::jsonb) || jsonb_build_object(_gem, have - _qty), true);
  INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price, kind)
    VALUES (_hero, h.name, _gem, _qty, _price, 'gem');
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list-gem:' || _gem, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

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
    s := jsonb_set(s, '{srv,gathering,resources}', jsonb_build_object(l.resource, public._num(s->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
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
    s := jsonb_set(h.save, '{srv,gathering,resources}', jsonb_build_object(l.resource, public._num(h.save->'srv'->'gathering'->'resources'->l.resource)::int + l.quantity), true);
  END IF;
  UPDATE public.auction_listings SET status = 'cancelled', closed_at = now() WHERE id = _listing;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-cancel:' || _listing, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.auction_list_item(uuid,jsonb,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_list_item(uuid,jsonb,int,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_list_gem(uuid,text,int,int,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_list_gem(uuid,text,int,int,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_buy(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_buy(uuid,uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_cancel(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_cancel(uuid,uuid,uuid) TO authenticated;

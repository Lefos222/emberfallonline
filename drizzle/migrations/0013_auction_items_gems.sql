-- Expand the auction house to accept equipment items and gems, not just gathered resources.
-- Adds an item_data jsonb column and reworks the list/buy/cancel functions to handle all three kinds.

ALTER TABLE public.auction_listings ADD COLUMN IF NOT EXISTS item_data jsonb;

CREATE OR REPLACE FUNCTION public.auction_list(_hero uuid, _resource text, _qty int, _price int, _req uuid, _item_data jsonb DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  h public.heroes; s jsonb; parts text[];
  have int;
  inv jsonb; item_idx int; item_json jsonb;
  gem_key text;
  gem_count int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  IF _price IS NULL OR _price < 1 OR _price > 100000000 THEN RAISE EXCEPTION 'Invalid price'; END IF;

  -----------------------------------------------------------
  -- ITEM listing: _item_data holds the full item object, _resource = 'item:<rarity>:<slot>'
  -----------------------------------------------------------
  IF _item_data IS NOT NULL THEN
    IF _qty IS NULL OR _qty <> 1 THEN RAISE EXCEPTION 'Items are sold one at a time'; END IF;
    -- Find the item in the seller's inventory by its id
    inv := h.save -> 'inventory';
    item_idx := -1;
    FOR i IN 0..jsonb_array_length(inv) - 1 LOOP
      IF inv -> i ->> 'id' = _item_data ->> 'id' THEN item_idx := i; EXIT; END IF;
    END LOOP;
    IF item_idx < 0 THEN RAISE EXCEPTION 'Item not found in your inventory'; END IF;
    -- Remove the item from inventory
    s := jsonb_set(h.save, '{inventory}', (h.save -> 'inventory') - item_idx);
    INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price, item_data)
      VALUES (_hero, h.name, _resource, 1, _price, _item_data);
    INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list:' || _resource, 0);
    PERFORM public._write_save(_hero, s);
    RETURN s;
  END IF;

  -----------------------------------------------------------
  -- GEM listing: _resource = 'gem:<type>:<tier>'
  -----------------------------------------------------------
  IF _resource LIKE 'gem:%' THEN
    IF _qty IS NULL OR _qty < 1 OR _qty > 999 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    gem_key := _resource;
    gem_count := public._num(h.save -> 'gems' -> gem_key)::int;
    IF gem_count < _qty THEN RAISE EXCEPTION 'You do not have that many'; END IF;
    s := jsonb_set(h.save, '{gems}', jsonb_build_object(gem_key, gem_count - _qty), true);
    INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price)
      VALUES (_hero, h.name, _resource, _qty, _price);
    INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list:' || _resource, 0);
    PERFORM public._write_save(_hero, s);
    RETURN s;
  END IF;

  -----------------------------------------------------------
  -- RESOURCE listing (existing behaviour): _resource = 'profession:area:rarity'
  -----------------------------------------------------------
  parts := string_to_array(_resource, ':');
  IF array_length(parts, 1) IS DISTINCT FROM 3 OR parts[1] NOT IN ('mining','herbalism','logging','fishing','archaeology','treasure')
     OR parts[2] !~ '^[0-4]$' OR parts[3] !~ '^[0-3]$' THEN RAISE EXCEPTION 'Unknown resource'; END IF;
  IF _qty IS NULL OR _qty < 1 OR _qty > 999 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  have := public._num(h.save->'srv'->'gathering'->'resources'->_resource)::int;
  IF have < _qty THEN RAISE EXCEPTION 'You do not have that many'; END IF;
  s := jsonb_set(h.save, '{srv,gathering,resources}', jsonb_build_object(_resource, have - _qty), true);
  INSERT INTO public.auction_listings (seller_hero, seller_name, resource, quantity, price) VALUES (_hero, h.name, _resource, _qty, _price);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-list:' || _resource, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.auction_buy(_hero uuid, _listing uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  h public.heroes; l public.auction_listings; s jsonb; seller public.heroes; ss jsonb;
  inv jsonb; gem_count int; res_count int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer available'; END IF;
  IF l.seller_hero = _hero THEN RAISE EXCEPTION 'You cannot buy your own listing'; END IF;
  IF public._num(h.save->'gold') < l.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;

  s := jsonb_set(h.save, '{gold}', to_jsonb(public._num(h.save->'gold') - l.price), true);

  IF l.item_data IS NOT NULL THEN
    -- Add the item to buyer's inventory
    -- Rebuild inventory with the new item appended
    SELECT jsonb_agg(elem) INTO inv FROM (SELECT jsonb_array_elements(s -> 'inventory') AS elem) t;
    IF inv IS NULL THEN inv := '[]'::jsonb; END IF;
    inv := inv || jsonb_build_array(l.item_data);
    s := jsonb_set(s, '{inventory}', inv, true);
  ELSIF l.resource LIKE 'gem:%' THEN
    gem_count := public._num(s -> 'gems' -> l.resource)::int;
    s := jsonb_set(s, '{gems}', jsonb_build_object(l.resource, gem_count + l.quantity), true);
  ELSE
    res_count := public._num(s -> 'srv' -> 'gathering' -> 'resources' -> l.resource)::int;
    s := jsonb_set(s, '{srv,gathering,resources}', jsonb_build_object(l.resource, res_count + l.quantity), true);
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

CREATE OR REPLACE FUNCTION public.auction_cancel(_hero uuid, _listing uuid, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  h public.heroes; l public.auction_listings; s jsonb;
  inv jsonb; gem_count int; res_count int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO l FROM public.auction_listings WHERE id = _listing FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.seller_hero <> _hero THEN RAISE EXCEPTION 'Not your listing'; END IF;
  IF l.status <> 'open' THEN RAISE EXCEPTION 'Listing is no longer open'; END IF;
  UPDATE public.auction_listings SET status = 'cancelled', closed_at = now() WHERE id = _listing;

  IF l.item_data IS NOT NULL THEN
    SELECT jsonb_agg(elem) INTO inv FROM (SELECT jsonb_array_elements(h.save -> 'inventory') AS elem) t;
    IF inv IS NULL THEN inv := '[]'::jsonb; END IF;
    inv := inv || jsonb_build_array(l.item_data);
    s := jsonb_set(h.save, '{inventory}', inv, true);
  ELSIF l.resource LIKE 'gem:%' THEN
    gem_count := public._num(h.save -> 'gems' -> l.resource)::int;
    s := jsonb_set(h.save, '{gems}', jsonb_build_object(l.resource, gem_count + l.quantity), true);
  ELSE
    res_count := public._num(h.save -> 'srv' -> 'gathering' -> 'resources' -> l.resource)::int;
    s := jsonb_set(h.save, '{srv,gathering,resources}', jsonb_build_object(l.resource, res_count + l.quantity), true);
  END IF;

  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'auction-cancel:' || _listing, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.auction_list(uuid,text,int,int,uuid,jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_list(uuid,text,int,int,uuid,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_buy(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_buy(uuid,uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.auction_cancel(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auction_cancel(uuid,uuid,uuid) TO authenticated;

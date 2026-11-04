-- The gem chart (src/game/crafting.ts) replaces the old thirteen families with eight chart
-- gems of twelve levels each, so the auction house's gem validator has to follow it or new
-- gems could not be listed.
CREATE OR REPLACE FUNCTION public.auction_list_gem(_hero uuid, _gem text, _qty int, _price int, _req uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; have int; s jsonb;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  IF _gem IS NULL OR _gem !~ '^(ruby|emerald|sapphire|topaz|amethyst|tourmaline|aquamarine|lapis):([1-9]|1[0-2])$' THEN RAISE EXCEPTION 'Unknown gem'; END IF;
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

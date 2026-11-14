DROP POLICY IF EXISTS "listings visible to players" ON public.auction_listings;
CREATE POLICY "open or own listings visible" ON public.auction_listings FOR SELECT TO authenticated
USING (status = 'open' OR EXISTS (SELECT 1 FROM public.heroes h WHERE h.user_id = auth.uid() AND (h.id = auction_listings.seller_hero OR h.id = auction_listings.buyer_hero)));
DROP POLICY IF EXISTS "guilds are public to players" ON public.guilds;
CREATE POLICY "guilds visible to hero owners" ON public.guilds FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.heroes h WHERE h.user_id = auth.uid()));
ALTER TABLE public.world_raid_claims DROP CONSTRAINT IF EXISTS world_raid_claims_pkey;
ALTER TABLE public.world_raid_claims ADD COLUMN IF NOT EXISTS id bigserial;
ALTER TABLE public.world_raid_claims ADD PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS world_raid_claims_hero_day_idx ON public.world_raid_claims(hero_id,day);
ALTER TABLE public.auction_listings ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'resource';
ALTER TABLE public.auction_listings ADD COLUMN IF NOT EXISTS payload jsonb;
ALTER TABLE public.auction_listings DROP CONSTRAINT IF EXISTS auction_listings_kind_check;
ALTER TABLE public.auction_listings ADD CONSTRAINT auction_listings_kind_check CHECK (kind IN ('resource','gem','item'));
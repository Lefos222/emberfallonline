-- The Battle Rating curve pays 10% more on every source (RATING_GAIN in src/game/data.ts), so the
-- anticheat cap rises with it. An honest, fully geared hero keeps exactly the same headroom under
-- the limit as before. Mirrored in src/game/anticheat-limits.ts (AC_RATING_GAIN) — keep both equal.
CREATE OR REPLACE FUNCTION public._ac_power_cap(_level numeric, _paragon numeric) RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 650000 * 1.1
    * (1 + power(least(140, greatest(1, floor(coalesce(_level, 1)))) / 140.0, 1.7) * 2.4 + greatest(0, coalesce(_paragon, 0)) * 0.03)
    * (1 + greatest(0, coalesce(_paragon, 0)) * 0.03) $$;

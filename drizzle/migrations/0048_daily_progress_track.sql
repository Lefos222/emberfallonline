-- The daily and weekly boards always carry the every-fight track ('kill', one per won battle),
-- so ordinary play always moves a visible objective. The other two slots of each board keep
-- rotating through the remaining kinds ('dungeon', 'boss', 'craft', 'gem', 'astral', 'arena').
-- The client panel reads whatever kinds get_activities returns, so it needs no change.
CREATE OR REPLACE FUNCTION public._rotating_kinds() RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT ARRAY['dungeon','boss','craft','gem','astral','arena'] $$;

CREATE OR REPLACE FUNCTION public._daily_kinds() RETURNS text[] LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ARRAY['kill',
               (public._rotating_kinds())[1 + ((public._today() - date '2026-01-01') % 6)],
               (public._rotating_kinds())[1 + ((public._today() - date '2026-01-01' + 3) % 6)]] $$;

CREATE OR REPLACE FUNCTION public._weekly_kinds() RETURNS text[] LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT ARRAY['kill',
               (public._rotating_kinds())[1 + (((public._monday() - date '2025-12-29') / 7 * 2) % 6)],
               (public._rotating_kinds())[1 + (((public._monday() - date '2025-12-29') / 7 * 2 + 3) % 6)]] $$;

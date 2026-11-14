CREATE TABLE public.anticheat_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  gold_base numeric NOT NULL DEFAULT 500000,
  gold_per_level numeric NOT NULL DEFAULT 150000,
  gold_per_paragon numeric NOT NULL DEFAULT 60000,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT ALL ON public.anticheat_settings TO service_role;
ALTER TABLE public.anticheat_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.anticheat_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public._ac_gold_cap(_level numeric, _paragon numeric)
 RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(s.gold_base, 500000)
       + coalesce(s.gold_per_level, 150000) * greatest(0, coalesce(_level, 0))
       + coalesce(s.gold_per_paragon, 60000) * greatest(0, coalesce(_paragon, 0))
  FROM (SELECT 1) one LEFT JOIN public.anticheat_settings s ON s.id
$$;

CREATE OR REPLACE FUNCTION public.admin_get_settings()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN (SELECT jsonb_build_object('gold_base', gold_base, 'gold_per_level', gold_per_level,
    'gold_per_paragon', gold_per_paragon, 'updated_at', updated_at) FROM public.anticheat_settings WHERE id);
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_gold_thresholds(_base numeric, _per_level numeric, _per_paragon numeric)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _base IS NULL OR _base < 10000 OR _per_level IS NULL OR _per_level < 0 OR _per_paragon IS NULL OR _per_paragon < 0 THEN
    RAISE EXCEPTION 'Thresholds must be positive (base at least 10,000)';
  END IF;
  INSERT INTO public.anticheat_settings (id, gold_base, gold_per_level, gold_per_paragon, updated_at, updated_by)
  VALUES (true, _base, _per_level, _per_paragon, now(), auth.uid())
  ON CONFLICT (id) DO UPDATE SET gold_base = EXCLUDED.gold_base, gold_per_level = EXCLUDED.gold_per_level,
    gold_per_paragon = EXCLUDED.gold_per_paragon, updated_at = now(), updated_by = auth.uid();
  RETURN public.admin_get_settings();
END $$;

CREATE OR REPLACE FUNCTION public.admin_stats()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN jsonb_build_object(
    'accounts', (SELECT count(*) FROM auth.users),
    'new_accounts_7d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'characters', (SELECT count(*) FROM public.heroes),
    'active_24h', (SELECT count(*) FROM public.heroes WHERE last_played > now() - interval '24 hours'),
    'active_7d', (SELECT count(*) FROM public.heroes WHERE last_played > now() - interval '7 days'),
    'banned_accounts', (SELECT count(*) FROM public.account_bans WHERE lifted_at IS NULL),
    'gold_flags_7d', (SELECT count(*) FROM public.anticheat_quarantine WHERE reason LIKE 'Review:%' AND created_at > now() - interval '7 days'),
    'avg_level', (SELECT round(avg(level), 1) FROM public.heroes),
    'total_gold', (SELECT coalesce(sum(public._num(save->'gold')), 0) FROM public.heroes),
    'classes', (SELECT coalesce(jsonb_object_agg(hero_class, n), '{}') FROM (SELECT hero_class, count(*) n FROM public.heroes GROUP BY 1) c),
    'top', (SELECT coalesce(jsonb_agg(t), '[]') FROM (SELECT name, hero_class AS cls, level, power, public._num(save->'gold') AS gold
            FROM public.heroes ORDER BY power DESC LIMIT 10) t),
    'flags', (SELECT coalesce(jsonb_agg(f), '[]') FROM (SELECT hero_name AS hero, reason, created_at AS at
            FROM public.anticheat_quarantine WHERE reason LIKE 'Review:%' ORDER BY created_at DESC LIMIT 30) f)
  );
END $$;
REVOKE ALL ON FUNCTION public.admin_stats() FROM anon;
REVOKE ALL ON FUNCTION public.admin_get_settings() FROM anon;
REVOKE ALL ON FUNCTION public.admin_set_gold_thresholds(numeric, numeric, numeric) FROM anon;
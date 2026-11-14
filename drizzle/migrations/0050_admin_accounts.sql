CREATE OR REPLACE FUNCTION public.admin_accounts(_limit int DEFAULT 500) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
      'user_id', u.id, 'email', u.email, 'created', u.created_at, 'last_sign_in', u.last_sign_in_at,
      'signup_ip', (SELECT o.ip FROM public.hero_origins o WHERE o.user_id = u.id AND o.ip IS NOT NULL ORDER BY o.created_at LIMIT 1),
      'last_ip', public._admin_last_ip(u.id),
      'heroes', (SELECT coalesce(string_agg(h.name, ', '), '') FROM public.heroes h WHERE h.user_id = u.id),
      'banned', b.id IS NOT NULL, 'ban_reason', b.reason, 'is_admin', public.has_role(u.id, 'admin'))
    ORDER BY u.created_at DESC)
    FROM (SELECT * FROM auth.users ORDER BY created_at DESC LIMIT greatest(1, least(coalesce(_limit, 500), 2000))) u
    LEFT JOIN public.account_bans b ON b.user_id = u.id AND b.lifted_at IS NULL), '[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.admin_accounts(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_accounts(int) TO authenticated;
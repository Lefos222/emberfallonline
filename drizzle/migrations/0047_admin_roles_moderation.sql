CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE (user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

INSERT INTO public.user_roles(user_id, role) SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'lefteristsakiris2006@gmail.com' ON CONFLICT DO NOTHING;

CREATE FUNCTION public.admin_moderation() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN jsonb_build_object(
    'bans', coalesce((SELECT jsonb_agg(jsonb_build_object('id',q.id,'hero',q.hero_name,'reason',q.reason,'source',q.source,'at',q.created_at,'restored',q.restored_at,'email',u.email) ORDER BY q.created_at DESC)
      FROM public.anticheat_quarantine q LEFT JOIN auth.users u ON u.id = q.user_id), '[]'::jsonb),
    'mutes', coalesce((SELECT jsonb_agg(x ORDER BY x->>'last' DESC) FROM (
      SELECT jsonb_build_object('hero',m.sender_name,'hero_id',m.sender_id,'reports',count(*),'last',max(r.created_at),'until',max(r.created_at)+interval '1 day') x
      FROM public.chat_reports r JOIN public.chat_messages m ON m.id = r.message_id
      WHERE r.created_at > now() - interval '1 day' GROUP BY m.sender_name, m.sender_id HAVING count(*) >= 5) s), '[]'::jsonb),
    'reports', coalesce((SELECT jsonb_agg(jsonb_build_object('hero',m.sender_name,'body',m.body,'reason',r.reason,'at',r.created_at) ORDER BY r.created_at DESC)
      FROM (SELECT * FROM public.chat_reports ORDER BY created_at DESC LIMIT 50) r JOIN public.chat_messages m ON m.id = r.message_id), '[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.admin_moderation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderation() TO authenticated;
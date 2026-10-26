-- Guild applications: players can apply to join an open guild;
-- leaders and officers moderate (accept / reject) pending applications.
CREATE TABLE public.guild_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  hero_id uuid NOT NULL REFERENCES public.heroes(id) ON DELETE CASCADE,
  hero_name text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- One pending application per (guild, hero) pair
CREATE UNIQUE INDEX guild_applications_pending_unique
  ON public.guild_applications (guild_id, hero_id) WHERE status = 'pending';
CREATE INDEX guild_applications_guild_idx ON public.guild_applications (guild_id, status);

GRANT SELECT ON public.guild_applications TO authenticated;
GRANT ALL ON public.guild_applications TO service_role;
ALTER TABLE public.guild_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY guild_applications_read ON public.guild_applications FOR SELECT TO authenticated
  USING (hero_id IN (SELECT public.my_hero_ids()) OR guild_id IN (SELECT public.my_guild_ids()));

-- A player applies to join a guild.
CREATE OR REPLACE FUNCTION public.apply_guild(_hero uuid, _guild uuid, _message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = _hero) THEN
    RAISE EXCEPTION 'You are already in a guild';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guilds WHERE id = _guild) THEN
    RAISE EXCEPTION 'Guild not found';
  END IF;
  IF EXISTS (SELECT 1 FROM public.guild_invites WHERE hero_id = _hero AND guild_id = _guild) THEN
    RAISE EXCEPTION 'You already have a pending invite to this guild';
  END IF;
  IF EXISTS (SELECT 1 FROM public.guild_applications WHERE hero_id = _hero AND guild_id = _guild AND status = 'pending') THEN
    RAISE EXCEPTION 'You have already applied to this guild';
  END IF;
  INSERT INTO public.guild_applications (guild_id, hero_id, hero_name, message)
    VALUES (_guild, _hero, h.name, left(coalesce(_message, ''), 200));
END $$;

-- A leader or officer accepts or rejects a pending application.
CREATE OR REPLACE FUNCTION public.moderate_application(_hero uuid, _application uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me public.guild_members; app public.guild_applications;
BEGIN
  me := public._guild_role(_hero);
  IF me.role = 'member' THEN RAISE EXCEPTION 'Only the leader and officers can moderate applications'; END IF;
  SELECT * INTO app FROM public.guild_applications WHERE id = _application AND guild_id = me.guild_id FOR UPDATE;
  IF app.hero_id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF app.status <> 'pending' THEN RAISE EXCEPTION 'That application has already been reviewed'; END IF;

  IF _accept THEN
    IF EXISTS (SELECT 1 FROM public.guild_members WHERE hero_id = app.hero_id) THEN
      RAISE EXCEPTION 'That hero is already in a guild';
    END IF;
    IF (SELECT count(*) FROM public.guild_members WHERE guild_id = me.guild_id) >= 30 THEN
      RAISE EXCEPTION 'That guild is full (30 members)';
    END IF;
    INSERT INTO public.guild_members (hero_id, guild_id, role) VALUES (app.hero_id, me.guild_id, 'member');
    DELETE FROM public.guild_invites WHERE hero_id = app.hero_id;
    DELETE FROM public.guild_applications WHERE hero_id = app.hero_id AND status = 'pending' AND id <> _application;
    UPDATE public.guild_applications SET status = 'accepted', reviewed_by = _hero, reviewed_at = now() WHERE id = _application;
  ELSE
    UPDATE public.guild_applications SET status = 'rejected', reviewed_by = _hero, reviewed_at = now() WHERE id = _application;
  END IF;
END $$;

-- A player withdraws their own pending application.
CREATE OR REPLACE FUNCTION public.withdraw_application(_hero uuid, _application uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.guild_applications WHERE id = _application AND hero_id = _hero AND status = 'pending') THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  DELETE FROM public.guild_applications WHERE id = _application;
END $$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'apply_guild(uuid,uuid,text)',
    'moderate_application(uuid,uuid,boolean)',
    'withdraw_application(uuid,uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;

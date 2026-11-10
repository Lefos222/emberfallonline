CREATE TABLE public.guild_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  page int NOT NULL CHECK (page BETWEEN 1 AND 3),
  slot int NOT NULL CHECK (slot BETWEEN 0 AND 255),
  item jsonb NOT NULL,
  deposited_by uuid NOT NULL,
  depositor_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, page, slot)
);
GRANT SELECT ON public.guild_vault TO authenticated;
GRANT ALL ON public.guild_vault TO service_role;
ALTER TABLE public.guild_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their guild vault" ON public.guild_vault FOR SELECT TO authenticated
  USING (guild_id IN (SELECT public.my_guild_ids()));

CREATE OR REPLACE FUNCTION public.guild_vault_deposit(_hero uuid, _item_id text, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; s jsonb; bagged jsonb; p int; sl int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  IF m.guild_id IS NULL THEN RAISE EXCEPTION 'Join a guild first'; END IF;
  SELECT e INTO bagged FROM jsonb_array_elements(coalesce(h.save->'inventory','[]'::jsonb)) e WHERE e->>'id' = _item_id;
  IF bagged IS NULL THEN RAISE EXCEPTION 'That item is not in your bag'; END IF;
  SELECT g.page, g.slot INTO p, sl FROM generate_series(1,3) g(page) CROSS JOIN generate_series(0,255) g2(slot)
    CROSS JOIN LATERAL (SELECT g.page, g2.slot) g
    WHERE NOT EXISTS (SELECT 1 FROM public.guild_vault v WHERE v.guild_id = m.guild_id AND v.page = g.page AND v.slot = g.slot)
    ORDER BY g.page, g.slot LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'The guild vault is full'; END IF;
  s := jsonb_set(h.save, '{inventory}', coalesce((SELECT jsonb_agg(e) FROM jsonb_array_elements(h.save->'inventory') e WHERE e->>'id' <> _item_id), '[]'::jsonb), true);
  INSERT INTO public.guild_vault (guild_id, page, slot, item, deposited_by, depositor_name) VALUES (m.guild_id, p, sl, bagged, _hero, h.name);
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-deposit:' || _item_id, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.guild_vault_withdraw(_hero uuid, _entry uuid, _req uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h public.heroes; m public.guild_members; v public.guild_vault; s jsonb; cap int; used int;
BEGIN
  h := public._my_hero(_hero);
  IF EXISTS (SELECT 1 FROM public.purchases WHERE request_id = _req) THEN RETURN h.save; END IF;
  SELECT * INTO m FROM public.guild_members WHERE hero_id = _hero;
  SELECT * INTO v FROM public.guild_vault WHERE id = _entry FOR UPDATE;
  IF v.id IS NULL OR m.guild_id IS NULL OR v.guild_id <> m.guild_id THEN RAISE EXCEPTION 'That item is not in your guild vault'; END IF;
  cap := 40 + 8 * coalesce((h.save->>'bagRows')::int, 0)
    - coalesce((SELECT sum(ceil(value::numeric / 9999))::int FROM jsonb_each_text(coalesce(h.save->'mats','{}'::jsonb)) WHERE value ~ '^[0-9.]+$' AND value::numeric > 0), 0);
  used := jsonb_array_length(coalesce(h.save->'inventory','[]'::jsonb));
  IF used >= cap THEN RAISE EXCEPTION 'Your bag is full'; END IF;
  s := jsonb_set(h.save, '{inventory}', jsonb_build_array(v.item) || coalesce(h.save->'inventory','[]'::jsonb), true);
  DELETE FROM public.guild_vault WHERE id = v.id;
  INSERT INTO public.purchases (request_id, hero_id, item, price) VALUES (_req, _hero, 'guild-vault-withdraw:' || v.id, 0);
  PERFORM public._write_save(_hero, s);
  RETURN s;
END $$;

REVOKE ALL ON FUNCTION public.guild_vault_deposit(uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_deposit(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.guild_vault_withdraw(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guild_vault_withdraw(uuid,uuid,uuid) TO authenticated;
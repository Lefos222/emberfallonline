-- One-off world reset: every character restarts from level 0 with nothing.
--
-- Run it once in the Lovable Cloud / Supabase dashboard: SQL Editor -> paste -> Run.
-- (The app's publishable key cannot rewrite other players' rows, so this must run as
-- the project owner. Nothing in the client can perform this.)
--
-- What it clears: every character's level, XP, Ascension, gold, gear, inventory,
-- materials, gems, Astrals, talents, passives, drills, buildings, quests, dungeons,
-- bestiary, arena rating, guild membership, mail and every other saved track. Each
-- hero is rewritten into a clean level-0 save with only their name and class kept and
-- the common starter kit. Accounts keep their login, and every player signs back into
-- the same character slot to start again.
--
-- It also removes every hero-scoped social/economy row — friendships and friend
-- requests, guilds and their rosters, invitations, applications and chat, arena
-- history, mail, activity and login progress, Auction House listings, world-map raid
-- claims and planted banners. The schema, RPCs and content tables are untouched.

-- A browser that is already open keeps auto-saving its old draft. The guard treats a save
-- whose `resetAt` stamp does not match the stored save as stale and keeps the reset save
-- until that client reloads. Server-owned RPC writes (app.srv = 1) still pass through.
CREATE OR REPLACE FUNCTION public.protect_hero_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  stale boolean;
BEGIN
  IF current_setting('app.arena', true) IS DISTINCT FROM '1' THEN
    NEW.arena_rating := OLD.arena_rating;
  END IF;
  IF current_setting('app.srv', true) IS DISTINCT FROM '1' THEN
    IF jsonb_typeof(NEW.save) <> 'object' THEN NEW.save := OLD.save; END IF;
    stale := (OLD.save ? 'resetAt')
      AND (NEW.save->>'resetAt' IS DISTINCT FROM OLD.save->>'resetAt');
    IF stale THEN
      NEW.save := OLD.save;
      NEW.level := OLD.level;
      NEW.power := OLD.power;
      NEW.stats := OLD.stats;
    END IF;
    NEW.save := jsonb_set(NEW.save, '{srv}', coalesce(OLD.save->'srv', '{}'::jsonb), true);
  END IF;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END $$;

do $$
declare
  t text;
begin
  -- Hero-scoped tables that have no cascading foreign key back to public.heroes.
  -- Friendships and friend requests must go before the heroes they point at.
  foreach t in array array[
    'friendships', 'friend_requests', 'guild_supply_contributions', 'guild_supply_claims',
    'guild_applications', 'guild_invites', 'guild_members', 'chat_messages', 'chat_reports',
    'arena_matches', 'mail_state', 'mail', 'lucky_shots', 'activity_progress',
    'activity_claims', 'login_days', 'world_castles', 'world_raid_claims',
    'daily_profession_claims', 'auction_listings', 'purchases'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('delete from public.%I', t);
    end if;
  end loop;
end $$;

-- Characters last: every hero save is rebuilt from scratch.
do $$
declare
  h record;
  clean jsonb;
begin
  -- Allow writing the server-owned `srv` block and the arena rating for this one reset only.
  perform set_config('app.srv', '1', true);
  perform set_config('app.arena', '1', true);

  for h in select id, name, hero_class from public.heroes loop
    clean := jsonb_build_object(
      'name', h.name,
      'cls', h.hero_class,
      'level', 0,
      'xp', 0,
      'paragon', 0,
      'gold', 0,
      'voidCrystals', 0,
      'attrs', '{"str":0,"int":0,"agi":0,"vit":0}'::jsonb,
      'equipment', (
        select jsonb_object_agg(slot, jsonb_build_object(
          'id', replace(gen_random_uuid()::text, '-', ''),
          'slot', slot,
          'cls', h.hero_class,
          'rarity', 0,
          'ilvl', 1,
          'icon', 0,
          'enh', 0,
          'name', item_name
        ))
        from (values
          ('weapon',   case h.hero_class when 'warrior' then 'Recruit''s Blade' when 'mage' then 'Recruit''s Wand' else 'Recruit''s Bow' end),
          ('armour',   'Recruit''s Garb'),
          ('helmet',   'Recruit''s Hood'),
          ('boots',    'Recruit''s Boots'),
          ('belt',     'Recruit''s Belt'),
          ('talisman', 'Recruit''s Charm')
        ) as starter(slot, item_name)
      ),
      'inventory', '[]'::jsonb,
      'stage', 1,
      'spire', 1,
      'merchant', '[]'::jsonb,
      'wins', 0,
      'resetAt', now(),
      'srv', '{"luckyShots":0,"scrolls":{},"buffs":{},"cosmetics":[]}'::jsonb
    );

    update public.heroes
       set level = 0,
           power = 0,
           stats = '{}'::jsonb,
           save = clean,
           arena_rating = 1000,
           bio = '',
           title = '',
           frame = 'iron',
           is_public = true,
           last_played = now(),
           updated_at = now()
     where id = h.id;
  end loop;

  perform set_config('app.srv', '0', true);
  perform set_config('app.arena', '0', true);
end $$;

-- Guilds outlive their members, so remove them once the rosters are gone.
delete from public.guilds;

-- Verify the fresh world: every character should be level 0 with 0 gold.
select count(*) as characters,
       count(*) filter (where level <> 0) as not_level_zero,
       count(*) filter (where save->>'gold' <> '0') as has_gold
  from public.heroes;

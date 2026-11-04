-- One-off world reset: wipes every character in EmberFall so all players start fresh.
--
-- Run it once in the Lovable Cloud / Supabase dashboard: SQL Editor -> paste -> Run.
-- (The app's publishable key cannot delete other players' rows, so this must be run as
-- the project owner. Nothing in the client can perform this.)
--
-- What it clears: every hero and everything that hangs off a hero — guilds and their rosters,
-- invitations, applications and chat, arena history, mail, activity and login progress,
-- Auction House listings, world-map raid claims and planted banners.
-- It leaves the schema, RPCs and content tables untouched.

do $$
declare t text;
begin
  -- Hero-scoped tables that have no cascading foreign key back to public.heroes.
  foreach t in array array[
    'guild_supply_contributions', 'guild_supply_claims', 'guild_applications', 'guild_invites',
    'guild_members', 'chat_messages', 'chat_reports', 'arena_matches', 'mail_state', 'mail',
    'lucky_shots', 'activity_progress', 'activity_claims', 'login_days', 'friend_requests',
    'world_castles', 'world_raid_claims', 'daily_profession_claims'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('delete from public.%I', t);
    end if;
  end loop;
end $$;

-- Characters last: auction listings cascade from here.
delete from public.heroes;

-- Guilds outlive their members, so remove them once the rosters are gone.
delete from public.guilds;

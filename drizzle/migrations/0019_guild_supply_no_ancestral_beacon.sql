-- The Ancestral Beacon guild supply event is gone with the rest of the ancestral content, so the
-- guild supply board is redefined with a plain watchtower beacon: same event id, same professions
-- and the same reward, only the name and story change.
CREATE OR REPLACE FUNCTION public.guild_supply_rules() RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT '[{"id":"siege","name":"Repair the Siege Defenses","story":"The outer walls are damaged. Supply ore and timber before the next assault.","professions":["mining","logging"],"target":20,"scroll":"def"},{"id":"caravan","name":"Provision the Guild Caravan","story":"The caravan is stranded. Deliver food and medicinal herbs to reopen the route.","professions":["fishing","herbalism"],"target":20,"scroll":"xp"},{"id":"ritual","name":"Light the Watchtower Beacon","story":"The watchtower beacon has gone dark. Recover artefacts and treasures to relight it.","professions":["archaeology","treasure"],"target":20,"scroll":"dmg"}]'::jsonb
$$;

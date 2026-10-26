import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";
import { worldMapStateSchema, type WorldMapState } from "./worldmap";

export async function loadWorldMap(): Promise<WorldMapState> {
  return withServerHero(async (id) => {
    const { data, error } = await supabase.rpc("world_map_state", { _hero: id });
    if (error) throw new Error(error.message);
    return worldMapStateSchema.parse(data);
  });
}

/** Called only after a won battle; the server enforces the daily limits and grants the reward. */
export async function completeWorldRaid(node: string): Promise<{ reward: Record<string, unknown>; repeat: boolean }> {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const op = `world-raid:${node}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  const result = await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc("world_raid_complete", { _hero: heroId, _node: node, _req: req });
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
    return object(data);
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
  return { reward: object(result.reward), repeat: result.repeat === true };
}

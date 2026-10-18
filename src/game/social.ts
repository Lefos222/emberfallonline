import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/** Public profile contract only: never includes account ownership or saved game data. */
export interface FriendProfile {
  id: string;
  name: string;
  hero_class: string;
  gender: string;
  level: number;
  power: number;
  arena_rating: number;
  title: string;
  frame: string;
  bio: string;
  last_played: string;
}
export interface InspectedProfile extends FriendProfile { stats: Json }

type SocialRPCs = {
  add_friend: { args: { _hero: string; _name: string }; result: string };
  remove_friend: { args: { _hero: string; _friend: string }; result: null };
  list_friends: { args: { _hero: string }; result: FriendProfile[] };
  inspect_hero: { args: { _hero: string; _target: string }; result: InspectedProfile[] };
};
// Local migration contract until generated Supabase types include these RPCs.
// Keep the existing authenticated client/session; do not create a second client.
const client = supabase as unknown as {
  rpc<K extends keyof SocialRPCs>(name: K, args: SocialRPCs[K]["args"]): PromiseLike<{
    data: SocialRPCs[K]["result"] | null;
    error: { message: string } | null;
  }>;
};
async function call<K extends keyof SocialRPCs>(name: K, args: SocialRPCs[K]["args"]) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
export async function addFriend(heroId: string, name: string) {
  return call("add_friend", { _hero: heroId, _name: name.trim() });
}
export async function removeFriend(heroId: string, friendId: string) {
  await call("remove_friend", { _hero: heroId, _friend: friendId });
}
export async function listFriends(heroId: string): Promise<FriendProfile[]> {
  return (await call("list_friends", { _hero: heroId })) ?? [];
}
export async function inspectHero(heroId: string, targetId: string): Promise<InspectedProfile> {
  const rows = await call("inspect_hero", { _hero: heroId, _target: targetId });
  if (!rows?.[0]) throw new Error("That hero cannot be inspected");
  return rows[0];
}
export function socialError(error: unknown): string {
  return error instanceof Error ? error.message : "The game server could not be reached. Please retry.";
}

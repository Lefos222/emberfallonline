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
export interface InspectedProfile extends FriendProfile {
  stats: Json;
}

/** An incoming friendship request: the sender answers before any friendship exists. */
export interface FriendRequest {
  id: string;
  hero_id: string;
  name: string;
  hero_class: string;
  gender: string;
  level: number;
  power: number;
  created_at: string;
}

type SocialRPCs = {
  add_friend: { args: { _hero: string; _name: string }; result: string };
  remove_friend: { args: { _hero: string; _friend: string }; result: null };
  list_friends: { args: { _hero: string }; result: FriendProfile[] };
  inspect_hero: { args: { _hero: string; _target: string }; result: InspectedProfile[] };
  request_friend: { args: { _hero: string; _name: string }; result: string | null };
  list_friend_requests: { args: { _hero: string }; result: FriendRequest[] };
  respond_friend_request: {
    args: { _hero: string; _request: string; _accept: boolean };
    result: null;
  };
};
// Local migration contract until generated Supabase types include these RPCs.
// Keep the existing authenticated client/session; do not create a second client.
const client = supabase as unknown as {
  rpc<K extends keyof SocialRPCs>(
    name: K,
    args: SocialRPCs[K]["args"],
  ): PromiseLike<{
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
export async function requestFriend(heroId: string, name: string) {
  return call("request_friend", { _hero: heroId, _name: name.trim() });
}
export async function listFriendRequests(heroId: string): Promise<FriendRequest[]> {
  return (await call("list_friend_requests", { _hero: heroId })) ?? [];
}
export async function respondFriendRequest(heroId: string, requestId: string, accept: boolean) {
  await call("respond_friend_request", { _hero: heroId, _request: requestId, _accept: accept });
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

/** Private messages share the chat table; its policy already lets both participants read them. */
export async function listDirectMessages(
  heroId: string,
  friendId: string,
): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,sender_id,sender_name,body,created_at")
    .eq("channel", "private")
    .or(
      `and(sender_id.eq.${heroId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${heroId})`,
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []).reverse();
}

export async function sendDirectMessage(heroId: string, friendId: string, body: string) {
  const { error } = await supabase.rpc("send_chat", {
    _hero: heroId,
    _channel: "private",
    _body: body,
    _to: friendId,
  });
  if (error) throw new Error(error.message);
}

export function socialError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The game server could not be reached. Please retry.";
}

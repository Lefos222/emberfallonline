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

/** A request this hero sent and can still withdraw. */
export type SentFriendRequest = FriendRequest;

/** How a searched hero already relates to the active character. */
export type HeroRelation = "none" | "friend" | "sent" | "incoming";

export interface HeroSearchResult {
  id: string;
  name: string;
  hero_class: string;
  gender: string;
  level: number;
  power: number;
  last_played: string;
  relation: HeroRelation;
}

/** "sent" while the other hero still has to answer; "friends" when they had already asked us. */
export type RequestOutcome = "sent" | "friends";

// ============ Server-side friend system (drizzle/migrations/0017 + 0022) ============
// Requests and friendships live in the database so the other hero sees them on their
// own device. Every read and write goes through a SECURITY DEFINER RPC, like the rest
// of the social tables.

type FriendRPCs = {
  request_friend: { args: { _hero: string; _name: string }; result: string | null };
  list_friend_requests: { args: { _hero: string }; result: FriendRequest[] };
  respond_friend_request: {
    args: { _hero: string; _request: string; _accept: boolean };
    result: null;
  };
  list_sent_requests: { args: { _hero: string }; result: SentFriendRequest[] };
  cancel_friend_request: { args: { _hero: string; _request: string }; result: null };
  list_friends: { args: { _hero: string }; result: FriendProfile[] };
  remove_friend: { args: { _hero: string; _friend: string }; result: null };
  search_heroes: { args: { _hero: string; _q: string }; result: HeroSearchResult[] };
};

type RPCError = { code?: string; message: string };

// The generated Supabase types predate the friend-request functions; keep the existing
// authenticated client and describe only the RPC contract this module uses.
const client = supabase as unknown as {
  rpc<K extends keyof FriendRPCs>(
    name: K,
    args: FriendRPCs[K]["args"],
  ): PromiseLike<{ data: FriendRPCs[K]["result"] | null; error: RPCError | null }>;
};

/** Shown when the live database has not had the friend-request SQL applied yet. */
export const FRIEND_REQUESTS_SQL_MISSING =
  "Friend requests are not live on the game database yet - apply drizzle/migrations/0017_friend_requests.sql and 0022_friend_system.sql.";

function missingFunction(error: RPCError) {
  return error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
}

function socialFailure(error: RPCError) {
  return new Error(missingFunction(error) ? FRIEND_REQUESTS_SQL_MISSING : error.message);
}

async function call<K extends keyof FriendRPCs>(name: K, args: FriendRPCs[K]["args"]) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw socialFailure(error);
  return data;
}

/**
 * Sends a friend request to the hero with the given name. The request is stored on the
 * server, so it shows up in the other hero's Requests tab. If they had already asked us,
 * the friendship is created instantly (both asked for each other).
 */
export async function requestFriend(heroId: string, name: string): Promise<RequestOutcome> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Enter a hero name.");
  const requestId = await call("request_friend", { _hero: heroId, _name: trimmed });
  // No request id back means their own request was waiting, so it was accepted instead.
  return requestId ? "sent" : "friends";
}

export async function listFriendRequests(heroId: string): Promise<FriendRequest[]> {
  return (await call("list_friend_requests", { _hero: heroId })) ?? [];
}

export async function respondFriendRequest(
  heroId: string,
  requestId: string,
  accept: boolean,
) {
  await call("respond_friend_request", { _hero: heroId, _request: requestId, _accept: accept });
}

export async function listSentRequests(heroId: string): Promise<SentFriendRequest[]> {
  return (await call("list_sent_requests", { _hero: heroId })) ?? [];
}

export async function cancelFriendRequest(heroId: string, requestId: string) {
  await call("cancel_friend_request", { _hero: heroId, _request: requestId });
}

export async function listFriends(heroId: string): Promise<FriendProfile[]> {
  return (await call("list_friends", { _hero: heroId })) ?? [];
}

export async function removeFriend(heroId: string, friendId: string) {
  await call("remove_friend", { _hero: heroId, _friend: friendId });
}

/** Heroes whose public name contains the query, already marked with how they relate to us. */
export async function searchHeroes(heroId: string, query: string): Promise<HeroSearchResult[]> {
  const q = query.trim().replace(/[^A-Za-z0-9 _-]/g, "");
  if (q.length < 2) return [];
  return (await call("search_heroes", { _hero: heroId, _q: q })) ?? [];
}

export async function inspectHero(heroId: string, targetId: string): Promise<InspectedProfile> {
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name,hero_class,gender,level,power,arena_rating,title,frame,bio,last_played,stats")
    .eq("id", targetId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("That hero cannot be inspected");
  return data as InspectedProfile;
}

// ============ Direct messages (unchanged - use Supabase chat table) ============

export interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

/** Every private message sent to this hero, newest first, for the friends-list unread badges. */
export interface IncomingDirectMessage extends DirectMessage {
  recipient_id: string | null;
}

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

export async function listIncomingDirectMessages(heroId: string): Promise<IncomingDirectMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,sender_id,sender_name,body,created_at,recipient_id")
    .eq("channel", "private")
    .eq("recipient_id", heroId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
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

/** Calls onChange whenever a friend request or friendship touching this hero changes. */
export function subscribeFriendChanges(heroId: string, onChange: () => void) {
  const channel = supabase.channel(`friends-${heroId}-${Math.random().toString(36).slice(2)}`);
  for (const filter of [`to_hero=eq.${heroId}`, `from_hero=eq.${heroId}`]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table: "friend_requests", filter }, onChange);
  }
  channel.on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `owner_hero=eq.${heroId}` }, onChange);
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function socialError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The game server could not be reached. Please retry.";
}

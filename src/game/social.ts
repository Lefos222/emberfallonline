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

// ============ Local storage friend system (no Supabase RPCs) ============
// Friends and requests are stored in the browser so the feature works without
// any database functions. Hero search and profile lookup use the public heroes
// table (a regular PostgREST query, not an RPC).

const FRIENDS_KEY = (heroId: string) => `ef-local-friends:${heroId}`;
const ALL_REQUESTS_KEY = "ef-local-all-requests";

interface StoredRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromClass: string;
  fromGender: string;
  fromLevel: number;
  fromPower: number;
  toId: string;
  toName: string;
  status: "pending" | "accepted" | "denied";
  createdAt: string;
}

function readFriends(heroId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(FRIENDS_KEY(heroId)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeFriends(heroId: string, ids: string[]) {
  try {
    localStorage.setItem(FRIENDS_KEY(heroId), JSON.stringify(ids));
  } catch {
    // A blocked storage bucket only costs the friend list, never the game.
  }
}

function readAllRequests(): StoredRequest[] {
  try {
    return JSON.parse(localStorage.getItem(ALL_REQUESTS_KEY) ?? "[]") as StoredRequest[];
  } catch {
    return [];
  }
}

function writeAllRequests(requests: StoredRequest[]) {
  try {
    localStorage.setItem(ALL_REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    // same — storage failures must never crash the game.
  }
}

/** Fetch full hero profiles from the heroes table by ID (not an RPC). */
async function fetchHeroes(ids: string[]): Promise<Record<string, FriendProfile>> {
  if (ids.length === 0) return {};
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name,hero_class,gender,level,power,arena_rating,title,frame,bio,last_played")
    .in("id", ids);
  if (error || !data) return {};
  return Object.fromEntries(data.map((h) => [h.id, h as FriendProfile]));
}

/** Always true now — the local system supports the full request lifecycle. */
export function friendRequestsSupported() {
  return true;
}

export async function addFriend(heroId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Enter a hero name.");
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name")
    .ilike("name", trimmed)
    .neq("id", heroId)
    .limit(1);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No hero named "${trimmed}" found.`);
  const target = data[0];
  const myFriends = readFriends(heroId);
  if (!myFriends.includes(target.id)) myFriends.push(target.id);
  writeFriends(heroId, myFriends);
  const theirFriends = readFriends(target.id);
  if (!theirFriends.includes(heroId)) theirFriends.push(heroId);
  writeFriends(target.id, theirFriends);
  return `You are now friends with ${target.name}.`;
}

export async function removeFriend(heroId: string, friendId: string) {
  const myFriends = readFriends(heroId);
  writeFriends(heroId, myFriends.filter((id) => id !== friendId));
  const theirFriends = readFriends(friendId);
  writeFriends(friendId, theirFriends.filter((id) => id !== heroId));
}

export async function listFriends(heroId: string): Promise<FriendProfile[]> {
  const ids = readFriends(heroId);
  const profiles = await fetchHeroes(ids);
  return ids.map((id) => profiles[id]).filter(Boolean);
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

/**
 * Sends a friend request to the hero with the given name. Searches the public
 * heroes table, stores the request in localStorage. If the target already sent
 * a request to us, the friendship is created instantly (both asked for each other).
 */
export async function requestFriend(heroId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Enter a hero name.");
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name,hero_class,gender,level,power")
    .ilike("name", trimmed)
    .neq("id", heroId)
    .limit(1);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No hero named "${trimmed}" found.`);
  const target = data[0];

  const friends = readFriends(heroId);
  if (friends.includes(target.id)) throw new Error(`You are already friends with ${target.name}.`);

  const requests = readAllRequests();
  const existing = requests.find((r) => r.fromId === heroId && r.toId === target.id && r.status === "pending");
  if (existing) throw new Error(`You already sent a request to ${target.name}.`);

  // If the target already sent us a request, accept instantly — both heroes asked for each other.
  const incomingExisting = requests.find((r) => r.fromId === target.id && r.toId === heroId && r.status === "pending");
  if (incomingExisting) {
    incomingExisting.status = "accepted";
    writeAllRequests(requests);
    const myFriends = readFriends(heroId);
    if (!myFriends.includes(target.id)) myFriends.push(target.id);
    writeFriends(heroId, myFriends);
    const theirFriends = readFriends(target.id);
    if (!theirFriends.includes(heroId)) theirFriends.push(heroId);
    writeFriends(target.id, theirFriends);
    return "auto-accepted";
  }

  const { data: myData } = await supabase
    .from("heroes")
    .select("name,hero_class,gender,level,power")
    .eq("id", heroId)
    .maybeSingle();

  requests.push({
    id: crypto.randomUUID(),
    fromId: heroId,
    fromName: myData?.name ?? "Unknown",
    fromClass: myData?.hero_class ?? "warrior",
    fromGender: myData?.gender ?? "male",
    fromLevel: myData?.level ?? 1,
    fromPower: myData?.power ?? 0,
    toId: target.id,
    toName: target.name,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  writeAllRequests(requests);
  return null;
}

export async function listFriendRequests(heroId: string): Promise<FriendRequest[]> {
  const requests = readAllRequests().filter((r) => r.toId === heroId && r.status === "pending");
  if (requests.length === 0) return [];
  const senderIds = [...new Set(requests.map((r) => r.fromId))];
  const profiles = await fetchHeroes(senderIds);
  return requests.map((r) => {
    const p = profiles[r.fromId];
    return {
      id: r.id,
      hero_id: r.fromId,
      name: p?.name ?? r.fromName,
      hero_class: p?.hero_class ?? r.fromClass,
      gender: p?.gender ?? r.fromGender,
      level: p?.level ?? r.fromLevel,
      power: p?.power ?? r.fromPower,
      created_at: r.createdAt,
    };
  });
}

export async function respondFriendRequest(heroId: string, requestId: string, accept: boolean) {
  const requests = readAllRequests();
  const req = requests.find((r) => r.id === requestId && r.toId === heroId && r.status === "pending");
  if (!req) throw new Error("Request not found.");
  req.status = accept ? "accepted" : "denied";
  writeAllRequests(requests);
  if (accept) {
    const myFriends = readFriends(heroId);
    if (!myFriends.includes(req.fromId)) myFriends.push(req.fromId);
    writeFriends(heroId, myFriends);
    const theirFriends = readFriends(req.fromId);
    if (!theirFriends.includes(heroId)) theirFriends.push(heroId);
    writeFriends(req.fromId, theirFriends);
  }
}

/** Withdrawing is best-effort: a withdrawn request is marked denied so it disappears. */
export async function listSentRequests(heroId: string): Promise<SentFriendRequest[]> {
  const requests = readAllRequests().filter((r) => r.fromId === heroId && r.status === "pending");
  if (requests.length === 0) return [];
  const targetIds = [...new Set(requests.map((r) => r.toId))];
  const profiles = await fetchHeroes(targetIds);
  return requests.map((r) => {
    const p = profiles[r.toId];
    return {
      id: r.id,
      hero_id: r.toId,
      name: p?.name ?? r.toName,
      hero_class: p?.hero_class ?? "unknown",
      gender: p?.gender ?? "male",
      level: p?.level ?? 0,
      power: p?.power ?? 0,
      created_at: r.createdAt,
    };
  });
}

export async function cancelFriendRequest(heroId: string, requestId: string) {
  const requests = readAllRequests();
  const req = requests.find((r) => r.id === requestId && r.fromId === heroId && r.status === "pending");
  if (!req) throw new Error("Request not found.");
  req.status = "denied";
  writeAllRequests(requests);
}

/**
 * Heroes whose public name contains the query. Uses the heroes table directly
 * (not an RPC), with the relationship marked from localStorage.
 */
export async function searchHeroes(heroId: string, query: string): Promise<HeroSearchResult[]> {
  const q = query.trim().replace(/[^A-Za-z0-9 _-]/g, "");
  if (q.length < 2) return [];
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name,hero_class,gender,level,power,last_played")
    .ilike("name", `%${q}%`)
    .eq("is_public", true)
    .neq("id", heroId)
    .order("level", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);

  const friendIds = readFriends(heroId);
  const allRequests = readAllRequests();
  const sentRequests = allRequests.filter((r) => r.fromId === heroId && r.status === "pending");
  const incomingRequests = allRequests.filter((r) => r.toId === heroId && r.status === "pending");

  return (data ?? []).map((row) => {
    let relation: HeroRelation = "none";
    if (friendIds.includes(row.id)) relation = "friend";
    else if (sentRequests.some((r) => r.toId === row.id)) relation = "sent";
    else if (incomingRequests.some((r) => r.fromId === row.id)) relation = "incoming";
    return { ...row, relation };
  });
}

// ============ Direct messages (unchanged — use Supabase chat table) ============

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

export function socialError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The game server could not be reached. Please retry.";
}

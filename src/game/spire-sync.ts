import { supabase } from "@/integrations/supabase/client";
import type { SpireBattle, SpireMember } from "./spire-party";

/**
 * The living room of a Spire party: one Supabase Realtime broadcast channel per party code.
 *
 * The leader runs the fight and broadcasts every tick; the others send only their skill casts
 * back. Nothing here is trusted by the game server — floors, chests and rewards are minted by
 * the `spire_*` RPCs — so a dropped channel can never hand a player anything.
 */

export type PartyMsg =
  | { kind: "hello"; member: SpireMember }
  | { kind: "roster"; members: SpireMember[] }
  | { kind: "begin"; members: SpireMember[]; floor: number; dungeon: string }
  | { kind: "tick"; battle: SpireBattle; cleared: number | null }
  | { kind: "cast"; hero: string; skill: string }
  | { kind: "bye"; hero: string; leader: boolean }
  /** The climb already started, so a late hero has to wait for the next one. */
  | { kind: "busy"; hero: string };

export interface PartyLink {
  /** False when Realtime is unavailable: the climb still runs, as a party of one. */
  live: boolean;
  send: (m: PartyMsg) => void;
  close: () => void;
}

interface Channel {
  on: (type: string, filter: unknown, cb: (payload: { payload?: unknown }) => void) => unknown;
  subscribe: (cb?: (status: string) => void) => unknown;
  send: (message: Record<string, unknown>) => unknown;
}
type Realtime = {
  channel?: (name: string, opts?: unknown) => Channel;
  removeChannel?: (channel: Channel) => unknown;
};

const SILENT: PartyLink = { live: false, send: () => {}, close: () => {} };

/**
 * Joins the party's channel. `onReady` runs once the socket is actually subscribed: anything sent
 * before that is dropped, which is why the greeting waits for it instead of firing on open.
 */
export function openParty(code: string, onMessage: (m: PartyMsg) => void, onReady?: () => void): PartyLink {
  if (!code) return SILENT;
  try {
    const client = supabase as unknown as Realtime;
    if (typeof client.channel !== "function") return SILENT;
    const channel = client.channel(`spire-party-${code}`, { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "msg" }, (payload) => {
      const body = payload?.payload as PartyMsg | undefined;
      if (body && typeof body === "object" && typeof body.kind === "string") onMessage(body);
    });
    const link: PartyLink = {
      live: true,
      send: (m) => {
        try {
          channel.send({ type: "broadcast", event: "msg", payload: m });
        } catch {
          /* A lost message must never break the fight. */
        }
      },
      close: () => {
        try {
          client.removeChannel?.(channel);
        } catch {
          /* Already gone. */
        }
      },
    };
    try {
      channel.subscribe((status) => { if (status === "SUBSCRIBED") onReady?.(); });
    } catch {
      // An older client cannot report its status; the greeting goes out anyway.
      channel.subscribe();
      onReady?.();
    }
    return link;
  } catch {
    return SILENT;
  }
}

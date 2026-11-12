import { supabase } from "@/integrations/supabase/client";
import type { HeroClass } from "./data";

/**
 * Party invitations: a room's leader calls a friend to their Spire party or Arena Clash team,
 * and the friend's game shows a card they can reject or join.
 *
 * The call itself is one Supabase Realtime broadcast on the invited hero's own channel, so no
 * database row is needed and nothing here is trusted by the game server: joining still goes
 * through the room's normal code (Spire floors) or the `arena_event_join` RPC (Arena Clash).
 */

/** Which room the invite opens: a Spire party or an Arena Clash team. */
export type PartyKind = "spire" | "arena";

export interface InviteFrom {
  id: string;
  name: string;
  cls: HeroClass;
  gender: "male" | "female";
  level: number;
}

export interface PartyInvite {
  /** One card per call, so a repeated broadcast never stacks up. */
  id: string;
  kind: PartyKind;
  /** The five-letter Spire party code, or the Arena Clash team code. */
  code: string;
  /** The Spire dungeon the room is climbing (spire invites only). */
  dungeon?: string;
  from: InviteFrom;
  /** When the card stops showing, in epoch milliseconds. */
  expires: number;
}

/** A call stays on screen for one minute: long enough to answer, short enough not to nag. */
export const INVITE_MS = 60_000;

interface Channel {
  on: (type: string, filter: unknown, cb: (payload: { payload?: unknown }) => void) => unknown;
  subscribe: (cb?: (status: string) => void) => unknown;
  send: (message: Record<string, unknown>) => unknown;
}
type Realtime = {
  channel?: (name: string, opts?: unknown) => Channel;
  removeChannel?: (channel: Channel) => unknown;
};

/** Each hero listens on a channel only their own invitations arrive on. */
const inbox = (heroId: string) => `emberfall-invites-${heroId}`;

const client = () => {
  const c = supabase as unknown as Realtime;
  return typeof c.channel === "function" ? c : null;
};

/**
 * Listens for invitations sent to this hero and calls `onInvite` for each one. Returns the
 * unsubscribe; without Realtime it simply never fires, so a room still works by code.
 */
export function openInviteInbox(
  heroId: string,
  onInvite: (invite: PartyInvite) => void,
): () => void {
  const c = client();
  if (!c || !heroId) return () => {};
  try {
    const channel = c.channel!(inbox(heroId), { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "invite" }, (payload) => {
      const body = payload?.payload as PartyInvite | undefined;
      if (body && typeof body === "object" && body.kind && body.code) onInvite(body);
    });
    channel.subscribe();
    return () => {
      try {
        c.removeChannel?.(channel);
      } catch {
        /* Already gone. */
      }
    };
  } catch {
    return () => {};
  }
}

interface Outbox {
  channel: Channel;
  ready: boolean;
  queued: Record<string, unknown>[];
  timer: ReturnType<typeof setTimeout> | null;
}

/** Invitations to the same hero share one outbound channel, kept open for a minute after use. */
const outboxes = new Map<string, Outbox>();

function outbox(id: string): Outbox | null {
  const c = client();
  if (!c) return null;
  const open = outboxes.get(id);
  if (open) return open;
  try {
    const channel = c.channel!(inbox(id), { config: { broadcast: { self: false } } });
    const box: Outbox = { channel, ready: false, queued: [], timer: null };
    outboxes.set(id, box);
    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      box.ready = true;
      const pending = box.queued;
      box.queued = [];
      for (const message of pending) {
        try {
          channel.send(message);
        } catch {
          /* A friend who closed the game simply misses the call. */
        }
      }
    });
    return box;
  } catch {
    return null;
  }
}

/** Closes an outbound channel a minute after its last call, so invitations never pile up. */
function keepAlive(id: string, box: Outbox) {
  if (box.timer) clearTimeout(box.timer);
  box.timer = setTimeout(() => {
    const held = outboxes.get(id);
    if (!held) return;
    outboxes.delete(id);
    try {
      client()?.removeChannel?.(held.channel);
    } catch {
      /* Already gone. */
    }
  }, INVITE_MS);
}

/**
 * Calls a hero to the room. The message waits for the channel to subscribe, because anything
 * sent before that is dropped; a hero who is not in the game just never sees the card.
 */
export function sendPartyInvite(target: string, invite: PartyInvite): boolean {
  if (!target) return false;
  const box = outbox(target);
  if (!box) return false;
  const message = { type: "broadcast", event: "invite", payload: invite };
  if (box.ready) {
    try {
      box.channel.send(message);
    } catch {
      return false;
    }
  } else {
    box.queued.push(message);
  }
  keepAlive(target, box);
  return true;
}

/** The card's own handle: one per call, so the same friend calling twice shows two cards. */
export const inviteId = (heroId: string, rand = Math.random) =>
  `${heroId}-${Date.now()}-${Math.floor(rand() * 1e6).toString(36)}`;

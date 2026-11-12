import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live party invites for the Party Spire and Arena Clash.
 *
 * Every signed-in hero listens on one Realtime broadcast channel named after their hero id. An
 * invite is a broadcast on the friend's channel; the friend's screen shows a popup and answers on
 * the inviter's channel. Nothing here is trusted by the game server: accepting only hands the party
 * code to the panel, which joins through the same path as typing the code by hand (the
 * `arena_event_join` RPC, or the Spire party channel), so a forged invite can never grant anything.
 */

export type InviteKind = "spire" | "arena";

export interface PartyInvite {
  /** Unique per send, so the same friend can invite again after a decline. */
  id: string;
  kind: InviteKind;
  code: string;
  from: { id: string; name: string; level: number };
  /** Milliseconds since epoch on the sender's clock. */
  at: number;
}

export interface InviteReply {
  id: string;
  kind: InviteKind;
  from: string;
  accepted: boolean;
}

type Msg = { type: "invite"; invite: PartyInvite } | { type: "reply"; reply: InviteReply };

/** How long a popup waits for an answer before it quietly goes away. */
export const INVITE_TTL_MS = 60_000;

export const inviteChannel = (heroId: string) => `party-invites-${heroId}`;

interface Channel {
  on: (type: string, filter: unknown, cb: (payload: { payload?: unknown }) => void) => Channel;
  subscribe: (cb?: (status: string) => void) => unknown;
  send: (message: Record<string, unknown>) => unknown;
}
type Realtime = {
  channel?: (name: string, opts?: unknown) => Channel;
  removeChannel?: (channel: Channel) => unknown;
};

const client = () => supabase as unknown as Realtime;

const isInvite = (v: unknown): v is PartyInvite => {
  const i = v as PartyInvite | undefined;
  return (
    !!i &&
    typeof i.id === "string" &&
    (i.kind === "spire" || i.kind === "arena") &&
    typeof i.code === "string" &&
    !!i.from &&
    typeof i.from.id === "string" &&
    typeof i.from.name === "string"
  );
};
const isReply = (v: unknown): v is InviteReply => {
  const r = v as InviteReply | undefined;
  return (
    !!r && typeof r.id === "string" && typeof r.from === "string" && typeof r.accepted === "boolean"
  );
};

/** Sends one message to a hero's personal channel, then closes it again. */
function deliver(to: string, msg: Msg): Promise<void> {
  const rt = client();
  if (typeof rt.channel !== "function")
    return Promise.reject(new Error("Invites are unavailable right now."));
  return new Promise((resolve, reject) => {
    let done = false;
    const channel = rt.channel!(inviteChannel(to), {
      config: { broadcast: { self: false, ack: true } },
    });
    const finish = (err?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        rt.removeChannel?.(channel);
      } catch {
        /* already gone */
      }
      if (err) reject(err);
      else resolve();
    };
    const timer = setTimeout(() => finish(new Error("Invite failed")), 8000);
    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          finish(new Error("Invite failed"));
        return;
      }
      Promise.resolve(channel.send({ type: "broadcast", event: "invite", payload: msg }))
        .then(() => finish())
        .catch(() => finish(new Error("Invite failed")));
    });
  });
}

const newId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function sendPartyInvite(
  to: string,
  kind: InviteKind,
  code: string,
  from: PartyInvite["from"],
): Promise<PartyInvite> {
  const invite: PartyInvite = { id: newId(), kind, code, from, at: Date.now() };
  await deliver(to, { type: "invite", invite });
  return invite;
}

/** Tells the inviter what happened; a lost answer only leaves their button saying "Invited". */
export function sendInviteReply(invite: PartyInvite, me: string, accepted: boolean) {
  void deliver(invite.from.id, {
    type: "reply",
    reply: { id: invite.id, kind: invite.kind, from: me, accepted },
  }).catch(() => {});
}

/** Listens on this hero's own channel for invites and answers. Returns a function that stops. */
export function listenForInvites(
  heroId: string,
  onInvite: (i: PartyInvite) => void,
  onReply: (r: InviteReply) => void,
): () => void {
  const rt = client();
  if (!heroId || typeof rt.channel !== "function") return () => {};
  try {
    const channel = rt.channel(inviteChannel(heroId), { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "invite" }, (payload) => {
      const msg = payload?.payload as Msg | undefined;
      if (msg?.type === "invite" && isInvite(msg.invite) && msg.invite.from.id !== heroId)
        onInvite(msg.invite);
      else if (msg?.type === "reply" && isReply(msg.reply)) onReply(msg.reply);
    });
    channel.subscribe();
    return () => {
      try {
        rt.removeChannel?.(channel);
      } catch {
        /* already gone */
      }
    };
  } catch {
    return () => {};
  }
}

// ---- Shared state between the popup, the invite buttons and the two panels ----

interface InviteState {
  /** Invites waiting on screen, oldest first. */
  pending: PartyInvite[];
  /** The code of the invite just accepted, waiting for its panel to join it. */
  accepted: Partial<Record<InviteKind, string>>;
  /** Answers to invites this hero sent, keyed by friend id and kind. */
  replies: Record<string, "accepted" | "declined">;
}

let state: InviteState = { pending: [], accepted: {}, replies: {} };
const listeners = new Set<() => void>();
const set = (next: InviteState) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const replyKey = (friendId: string, kind: InviteKind) => `${kind}:${friendId}`;

export function useInvites(): InviteState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

/** Adds an invite to the popup queue; a newer invite from the same friend replaces the older one. */
export function receiveInvite(invite: PartyInvite) {
  const rest = state.pending.filter(
    (i) => !(i.from.id === invite.from.id && i.kind === invite.kind),
  );
  // The timer starts when it arrives here, so a friend's clock being off never hides it.
  set({ ...state, pending: [...rest, { ...invite, at: Date.now() }] });
}

export function receiveReply(reply: InviteReply) {
  set({
    ...state,
    replies: {
      ...state.replies,
      [replyKey(reply.from, reply.kind)]: reply.accepted ? "accepted" : "declined",
    },
  });
}

/** Forget an earlier answer when the friend is invited again. */
export function clearReply(friendId: string, kind: InviteKind) {
  const { [replyKey(friendId, kind)]: _gone, ...replies } = state.replies;
  set({ ...state, replies });
}

/** Accept: the invite leaves the queue and its code waits for the panel that joins it. */
export function acceptInvite(id: string): PartyInvite | null {
  const invite = state.pending.find((i) => i.id === id) ?? null;
  if (!invite) return null;
  set({
    ...state,
    pending: state.pending.filter((i) => i.id !== id),
    accepted: { ...state.accepted, [invite.kind]: invite.code },
  });
  return invite;
}

/** Decline: the invite simply goes away; nobody joins anything. */
export function declineInvite(id: string): PartyInvite | null {
  const invite = state.pending.find((i) => i.id === id) ?? null;
  if (!invite) return null;
  set({ ...state, pending: state.pending.filter((i) => i.id !== id) });
  return invite;
}

/** Drops invites older than the time limit. */
export function expireInvites(now = Date.now()) {
  const pending = state.pending.filter((i) => now - i.at < INVITE_TTL_MS);
  if (pending.length !== state.pending.length) set({ ...state, pending });
}

/** The panel takes the accepted code exactly once. */
export function takeAccepted(kind: InviteKind): string | null {
  const code = state.accepted[kind];
  if (!code) return null;
  const { [kind]: _taken, ...accepted } = state.accepted;
  set({ ...state, accepted });
  return code;
}

/** Test helper: back to an empty inbox. */
export function resetInvites() {
  set({ pending: [], accepted: {}, replies: {} });
}

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/** A tiny in-memory Realtime: a broadcast reaches every listener subscribed to that channel name. */
const rt = vi.hoisted(() => {
  const handlers = new Map<string, Set<(p: { payload?: unknown }) => void>>();
  const sent: { channel: string; payload: unknown }[] = [];
  const channel = (name: string) => {
    const mine: ((p: { payload?: unknown }) => void)[] = [];
    const ch = {
      on: (_t: string, _f: unknown, cb: (p: { payload?: unknown }) => void) => {
        mine.push(cb);
        return ch;
      },
      subscribe: (cb?: (s: string) => void) => {
        const set = handlers.get(name) ?? new Set();
        mine.forEach((h) => set.add(h));
        handlers.set(name, set);
        cb?.("SUBSCRIBED");
        return ch;
      },
      send: async (m: { payload: unknown }) => {
        sent.push({ channel: name, payload: m.payload });
        handlers.get(name)?.forEach((h) => h({ payload: m.payload }));
        return "ok";
      },
      _off: () => mine.forEach((h) => handlers.get(name)?.delete(h)),
    };
    return ch;
  };
  return { handlers, sent, channel };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: (name: string) => rt.channel(name),
    removeChannel: (ch: { _off: () => void }) => ch._off(),
  },
}));

const friends = vi.hoisted(() => ({ list: [{ id: "friend-1", name: "Aria" }] }));
vi.mock("@/game/social", () => ({
  listFriends: async () => friends.list,
  sendDirectMessage: async () => {},
}));

import { InvitePopup } from "@/game/PartyInvite";
import { resetInvites, sendPartyInvite, takeAccepted } from "@/game/party-invites";

const ME = "me-1";
const invite = (kind: "spire" | "arena", from = { id: "friend-1", name: "Aria", level: 30 }) =>
  act(async () => {
    await sendPartyInvite(ME, kind, "ABCDE", from);
  });

afterEach(() => {
  resetInvites();
  rt.handlers.clear();
  rt.sent.length = 0;
});

describe("party invite popup", () => {
  it("pops up for a friend's Arena Clash invite and Accept joins that party", async () => {
    const onAccept = vi.fn();
    render(<InvitePopup heroId={ME} onAccept={onAccept} />);
    await invite("arena");
    expect(await screen.findByRole("alertdialog", { name: "Party invite" })).toBeTruthy();
    expect(screen.getByText(/Aria invites you to their Arena Clash party/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(onAccept).toHaveBeenCalledWith("arena");
    expect(takeAccepted("arena")).toBe("ABCDE");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    const reply = rt.sent.find((s) => s.channel === "party-invites-friend-1")?.payload as {
      reply: { accepted: boolean };
    };
    expect(reply.reply.accepted).toBe(true);
  });

  it("Decline closes the popup and joins nothing", async () => {
    const onAccept = vi.fn();
    render(<InvitePopup heroId={ME} onAccept={onAccept} />);
    await invite("spire");
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: "Decline" }));

    expect(onAccept).not.toHaveBeenCalled();
    expect(takeAccepted("spire")).toBeNull();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    const reply = rt.sent.find((s) => s.channel === "party-invites-friend-1")?.payload as {
      reply: { accepted: boolean };
    };
    expect(reply.reply.accepted).toBe(false);
  });

  it("ignores invites from heroes who are not friends", async () => {
    render(<InvitePopup heroId={ME} onAccept={() => {}} />);
    await invite("spire", { id: "stranger", name: "Mallory", level: 5 });
    await waitFor(() => expect(rt.sent.length).toBe(1));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("cannot be accepted during a battle", async () => {
    render(<InvitePopup heroId={ME} blocked onAccept={() => {}} />);
    await invite("spire");
    const accept = await screen.findByRole("button", { name: "Accept" });
    expect((accept as HTMLButtonElement).disabled).toBe(true);
  });
});

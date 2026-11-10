import { describe, expect, it, vi } from "vitest";
import type { PartyMsg } from "@/game/spire-sync";

/**
 * The party channel: a greeting only leaves once the socket is subscribed, incoming messages are
 * handed on verbatim, and a channel that cannot open leaves the climb running as a party of one.
 */
const bus = vi.hoisted(() => {
  const sent: { type: string; event: string; payload: PartyMsg }[] = [];
  const channel = {
    on: (_type: string, _filter: unknown, cb: (p: { payload?: unknown }) => void) => {
      listeners.push(cb);
      return channel;
    },
    subscribe: (cb?: (status: string) => void) => {
      statusCb = cb;
      return channel;
    },
    send: (message: { type: string; event: string; payload: PartyMsg }) => {
      sent.push(message);
      return "ok";
    },
  };
  const listeners: ((p: { payload?: unknown }) => void)[] = [];
  let statusCb: ((status: string) => void) | undefined;
  return { sent, channel, listeners, status: (s: string) => statusCb?.(s), statusCb: () => statusCb };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: (_name: string, _opts?: unknown) => bus.channel,
    removeChannel: () => {},
  },
}));

import { openParty } from "@/game/spire-sync";

const greet: PartyMsg = { kind: "bye", hero: "h1", leader: false };

describe("the party channel", () => {
  it("greets only once the socket is subscribed", () => {
    const ready = vi.fn();
    openParty("ABCDE", () => {}, ready);
    expect(ready).not.toHaveBeenCalled();
    bus.status("SUBSCRIBED");
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it("sends and receives party messages unchanged", () => {
    const got: PartyMsg[] = [];
    const link = openParty("ABCDE", (m) => got.push(m));
    link.send(greet);
    expect(bus.sent.at(-1)).toEqual({ type: "broadcast", event: "msg", payload: greet });
    bus.listeners.at(-1)?.({ payload: greet });
    expect(got).toEqual([greet]);
    // Anything that is not a party message is ignored rather than crashing the fight.
    bus.listeners.at(-1)?.({ payload: { nope: true } });
    bus.listeners.at(-1)?.({});
    expect(got).toEqual([greet]);
  });
});

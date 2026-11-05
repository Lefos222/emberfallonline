import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ rows: [] as { body: string }[], rpc: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: state.rpc,
    from: () => {
      const query: Record<string, unknown> = {};
      for (const step of ["select", "eq", "order"]) query[step] = () => query;
      query["limit"] = () => Promise.resolve({ data: state.rows, error: null });
      return query;
    },
  },
}));

async function events() {
  vi.resetModules();
  return import("@/game/world-events");
}

beforeEach(() => {
  state.rows = [];
  state.rpc.mockReset();
  state.rpc.mockResolvedValue({ data: "message-id", error: null });
});

describe("world chat event lines", () => {
  it("posts a level-up milestone to the shared world channel", async () => {
    const mod = await events();
    await mod.announceWorldEvent("hero-1", "reached level 12!");

    expect(state.rpc).toHaveBeenCalledWith("send_chat", {
      _hero: "hero-1",
      _channel: "world",
      _body: "⟡ reached level 12!",
      _to: "00000000-0000-0000-0000-000000000000",
    });
  });

  it("does not announce the same line twice while it is still in recent chat", async () => {
    state.rows = [{ body: "⟡ The Emberfall World Boss has begun!" }];
    const mod = await events();
    await mod.announceWorldEvent("hero-1", "The Emberfall World Boss has begun!");

    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("never interrupts a reward when the chat server refuses the line", async () => {
    state.rpc.mockRejectedValue(new Error("You are sending messages too quickly"));
    const mod = await events();
    await expect(mod.announceWorldEvent("hero-1", "looted a Rare blade!")).resolves.toBeUndefined();
  });

  it("recognises and strips its own event lines", async () => {
    const mod = await events();
    expect(mod.isEventLine(mod.eventLine("found a relic"))).toBe(true);
    expect(mod.stripEventSigil(mod.eventLine("found a relic"))).toBe("found a relic");
    expect(mod.isEventLine("hello world")).toBe(false);
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { InspectedProfile } from "@/game/social";

/**
 * The General room and name-click inspection against a stubbed world feed: General hides the
 * announcement lines, System keeps them, and clicking any sender opens the inspect panel.
 */
const rows = vi.hoisted(() => [
  {
    id: "m1", channel: "world", body: "Good hunting, all!", created_at: "2026-11-08T10:00:00Z",
    guild_id: null, recipient_id: null, recipient_name: null,
    sender_id: "h2", sender_name: "Sera", sender_class: "mage",
  },
  {
    id: "m2", channel: "world", body: "⟡ Sera reached level 40!", created_at: "2026-11-08T10:01:00Z",
    guild_id: null, recipient_id: null, recipient_name: null,
    sender_id: "h2", sender_name: "Sera", sender_class: "mage",
  },
]);

const social = vi.hoisted(() => ({ inspectHero: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => {
  const query = (data: unknown) => {
    const q: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit"]) q[method] = () => q;
    q["maybeSingle"] = async () => ({ data: null, error: null });
    q["then"] = (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(ok, fail);
    return q;
  };
  const channel = { on: () => channel, subscribe: () => channel };
  return {
    supabase: {
      from: (table: string) => query(table === "chat_messages" ? rows : []),
      channel: () => channel,
      removeChannel: async () => undefined,
      rpc: async () => ({ data: null, error: null }),
    },
  };
});

vi.mock("@/game/social", () => ({
  inspectHero: social.inspectHero,
  socialError: (e: unknown) => (e instanceof Error ? e.message : "failed"),
}));

import { WorldChat } from "@/game/WorldChat";

// jsdom has no element scrolling; the chat only uses it to keep the newest line in view.
Object.defineProperty(Element.prototype, "scrollTo", { writable: true, value: () => {} });

const profile: InspectedProfile = {
  id: "h2",
  name: "Sera",
  hero_class: "mage",
  gender: "female",
  level: 40,
  power: 5120,
  arena_rating: 1840,
  title: "Campaign Champion",
  frame: "iron",
  bio: "Keeper of the tower.",
  last_played: "2026-11-08T10:00:00Z",
  stats: { hp: 12345, atk: 678, titles: ["recruit", "champion"], gearScore: 4210 },
  gear_score: 4210,
  guild: "Ashwardens",
};

describe("General room", () => {
  beforeEach(() => {
    social.inspectHero.mockResolvedValue(profile);
  });

  it("hides world announcements while System keeps them", async () => {
    render(<WorldChat heroId="h1" />);

    expect(await screen.findByText("Good hunting, all!")).toBeTruthy();
    expect(screen.queryByText(/Sera reached level 40/)).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "System" }));
    expect(screen.getByText(/Sera reached level 40/)).toBeTruthy();
    expect(screen.queryByText("Good hunting, all!")).toBeNull();
  });

  it("opens the inspect panel from a clicked name", async () => {
    render(<WorldChat heroId="h1" />);

    fireEvent.click(await screen.findByRole("button", { name: "Sera" }));

    expect(await screen.findByText("Hero profile")).toBeTruthy();
    expect(social.inspectHero).toHaveBeenCalledWith("h1", "h2");
    expect(screen.getByText("4,210")).toBeTruthy();
    expect(screen.getByText("Ashwardens")).toBeTruthy();
    // Worn in the header and listed again in the earned-title cabinet.
    expect(screen.getAllByText("Campaign Champion").length).toBeGreaterThan(0);
    expect(screen.getByText("12,345")).toBeTruthy();
  });
});

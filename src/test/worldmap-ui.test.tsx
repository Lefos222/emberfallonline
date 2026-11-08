import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";
import { bountyBoard } from "@/game/worldtree";
import { WORLD_SITES } from "@/game/worldmap";

/** The World Tree panel against a stubbed realm: no live raid ledger or banner registry needed
 *  to prove the expanded map, its bounty board and the daily tally render. */
const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));

vi.mock("@/integrations/supabase/client", () => {
  const query = (resolved: { data: unknown; error: null }) => {
    const q: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "neq"]) q[method] = () => q;
    q["maybeSingle"] = async () => resolved;
    q["then"] = (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) =>
      Promise.resolve(resolved).then(ok, fail);
    return q;
  };
  return {
    supabase: {
      from: () => query({ data: [], error: null }),
      rpc: async () => ({
        data: {
          now: new Date().toISOString(),
          resetAt: new Date().toISOString(),
          used: { gold: 0, ore: 0, boss: 0 },
          nodes: [],
        },
        error: null,
      }),
    },
  };
});

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, heroId: "h1" }),
  update: (fn: (h: Hero) => void) => {
    fn(store.hero);
  },
  getState: () => ({ hero: store.hero, heroId: "h1" }),
  flushSave: async () => true,
  adoptServerSave: () => {},
}));

import { WorldMap } from "@/game/WorldMap";

beforeEach(() => {
  store.hero = { ...newHero("Tester", "warrior"), level: 12 };
});

describe("the world tree panel", () => {
  it("shows the expanded realm and its raid allowances", () => {
    render(<WorldMap onClose={() => {}} start={() => {}} />);
    expect(screen.getByText("The World Tree")).toBeInTheDocument();
    expect(screen.getByText(/places of interest/)).toBeInTheDocument();
    expect(WORLD_SITES.length).toBeGreaterThan(300);
    expect(screen.getByText(/Gold mine:/)).toBeInTheDocument();
  });

  it("posts the day's three bounties with their progress", () => {
    render(<WorldMap onClose={() => {}} start={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Bounties/ }));

    expect(screen.getByText("Today in the realm")).toBeInTheDocument();
    for (const bounty of bountyBoard(12)) {
      expect(screen.getByText(bounty.title)).toBeInTheDocument();
      expect(screen.getByText(bounty.blurb)).toBeInTheDocument();
    }
    expect(screen.getAllByText("0/" + bountyBoard(12)[0]!.need).length).toBeGreaterThan(0);
  });
});

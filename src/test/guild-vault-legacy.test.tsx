import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

// A guild vault can still hold stacks deposited before a material was removed from the game
// (the grade-1 Enchantment Stone became a separate `enchantStones` field). The vault reads those
// rows straight from Supabase, so the panel must render them instead of crashing the merchant tab.
vi.mock("@/integrations/supabase/client", () => {
  const rows = [{ id: "v1", page: 1, slot: 0, item: { id: "s1", stack: "mat", key: "enchantStone", qty: 5 }, depositor_name: "Warden", deposited_by: "h1" }];
  const result = Promise.resolve({ data: rows, error: null });
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    then: (resolve: (v: unknown) => unknown) => result.then(resolve),
  };
  return { supabase: { from: () => builder, rpc: () => result } };
});

vi.mock("@/game/store", async (importOriginal) => {
  const m = await importOriginal<typeof import("@/game/store")>();
  return { ...m, useGame: () => ({ ...m.useGame(), heroId: "h1", chars: [] }) };
});

const { GuildStorage } = await import("@/game/GuildStorage");

describe("the guild vault", () => {
  it("shows a stack of a material that no longer exists instead of crashing", async () => {
    setHero(newHero("Tester", "warrior"));
    render(<GuildStorage guildId="g1" />);
    expect(await screen.findByTitle("enchantStone ×5")).toBeInTheDocument();
  });
});

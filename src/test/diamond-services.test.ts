import { describe, expect, it } from "vitest";
import { SERVICE_PRICES } from "@/game/economy-services";
import { arenaFightsLeft, grantExtraDuel } from "@/game/arena-limits";
import type { Hero } from "@/game/data";

describe("Diamond services", () => {
  it("prices the gender card at 500 and the name card at 700", () => {
    expect(SERVICE_PRICES.gender_card).toBe(500);
    expect(SERVICE_PRICES.name_card).toBe(700);
  });
  it("charges 50 for a shop restock and 50 for an extra arena duel", () => {
    expect(SERVICE_PRICES.shop_refresh).toBe(50);
    expect(SERVICE_PRICES.arena_duel).toBe(50);
  });
  it("an extra duel returns one fight after all five are spent", () => {
    const now = Date.now();
    const h = { arena: { windowStart: now - 1000, used: 5 } } as Hero;
    expect(arenaFightsLeft(h, now)).toBe(0);
    grantExtraDuel(h, now);
    expect(arenaFightsLeft(h, now)).toBe(1);
  });
});

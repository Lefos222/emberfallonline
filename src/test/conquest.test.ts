import { describe, expect, it } from "vitest";
import { BLITZ_PER_DAY, blitz, blitzBlocker, blitzDay, blitzesLeft, blitzesUsed, blitzRewards, buyTokenOffer, conquestTokens, floorTokens, floorsCleared, TOKEN_OFFERS } from "@/game/conquest";
import { matCount } from "@/game/crafting";
import { canEnterConquest, newHero, type Hero } from "@/game/data";

/** spire holds the frontier floor, so spire = 11 means floors 1..10 are cleared. */
const hero = (spire: number): Hero => ({ ...newHero("Blitzer", "warrior"), spire });

describe("endless conquest", () => {
  it("opens at level 10", () => {
    expect(canEnterConquest(9)).toBe(false);
    expect(canEnterConquest(10)).toBe(true);
  });

  it("counts cleared floors from the frontier floor", () => {
    expect(floorsCleared(hero(11))).toBe(10);
    expect(floorsCleared(hero(1))).toBe(0);
  });

  it("pays more tokens the deeper the floor", () => {
    expect(floorTokens(20)).toBeGreaterThan(floorTokens(5));
    expect(floorTokens(1)).toBeGreaterThan(0);
  });

  it("blitzes only up to the deepest floor already cleared", () => {
    const h = hero(11);
    expect(blitzBlocker(h, 10)).toBeNull();
    expect(blitzBlocker(h, 11)).toMatch(/floor 10/);
    expect(blitz(h, 11)).not.toBeNull();
    expect(floorsCleared(h)).toBe(10);
  });

  it("refuses to blitz before a floor is cleared", () => {
    const h = hero(1);
    expect(blitzBlocker(h, 1)).toMatch(/first floor/i);
    expect(blitz(h, 1)).toMatch(/first floor/i);
  });

  it("pays the floors' gold and tokens when blitzing", () => {
    const h = hero(4); // floors 1..3 cleared
    const rw = blitzRewards(3);
    expect(blitz(h, 3)).toBeNull();
    expect(h.gold).toBe(100 + rw.gold);
    expect(conquestTokens(h)).toBe(rw.tokens);
  });

  it("allows three blitzes a day and no more", () => {
    const h = hero(11); // floors 1..10 cleared
    const now = Date.now();
    for (let i = 0; i < BLITZ_PER_DAY; i++) expect(blitz(h, 10, now)).toBeNull();
    expect(blitzesUsed(h, now)).toBe(BLITZ_PER_DAY);
    expect(blitzesLeft(h, now)).toBe(0);
    expect(blitzBlocker(h, 10, now)).toMatch(/3 per day/);
    expect(blitz(h, 10, now)).toMatch(/3 per day/);
  });

  it("hands the allowance back on the next Greek day", () => {
    const h = hero(11);
    const now = Date.now();
    for (let i = 0; i < BLITZ_PER_DAY; i++) blitz(h, 1, now);
    const tomorrow = now + 86400000;
    expect(blitzesLeft(h, tomorrow)).toBe(BLITZ_PER_DAY);
    expect(blitz(h, 10, tomorrow)).toBeNull();
    expect(blitzesLeft(h, tomorrow)).toBe(BLITZ_PER_DAY - 1);
  });

  it("keeps floors unlimited — only the blitz is rationed", () => {
    const h = hero(2500);
    expect(floorsCleared(h)).toBe(2499);
    const now = Date.now();
    expect(blitzBlocker(h, 2000, now)).toBeNull(); // far beyond any fixed cap: only today's blitzes matter
    h.conquest = { blitzDay: blitzDay(now), blitzUsed: BLITZ_PER_DAY };
    expect(blitzBlocker(h, 2000, now)).toMatch(/Floors themselves are unlimited/);
  });

  it("spends tokens on equipment materials", () => {
    const h = hero(101);
    h.conquest = { tokens: 200 };
    const sigil = TOKEN_OFFERS.find((o) => o.id === "sigil")!;
    expect(buyTokenOffer(h, "sigil")).toBeNull();
    expect(matCount(h, "sigil")).toBe(sigil.qty);
    expect(conquestTokens(h)).toBe(200 - sigil.cost);
    expect(buyTokenOffer(h, "bossCore")).toMatch(/Not enough/);
    expect(matCount(h, "bossCore")).toBe(0);
  });
});

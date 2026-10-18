import { describe, expect, it } from "vitest";
import { newHero, invCap, makeItem } from "@/game/data";
import { addLoot } from "@/game/logic";
import { requestKey, returnedSave, returnedAstral, returnedActivities } from "@/game/services-contract";

describe("online reward boundaries", () => {
  it("adopts the returned save including protected collections rather than inventing rewards", () => {
    const h = { ...newHero("Hero", "mage"), srv: { luckyShots: 6, scrolls: { xp: 1 } } };
    expect(returnedSave({ save: h })).toBe(h);
    expect(returnedSave(h)).toBe(h);
    expect(() => returnedSave({ gold: 200 })).toThrow();
  });
  it("reuses a pending Lucky Shot request after uncertain network outcomes and refresh", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    expect(requestKey(storage, "hero-a", "lucky", () => "request-1")).toBe("request-1");
    expect(requestKey(storage, "hero-a", "lucky", () => "request-2")).toBe("request-1");
    expect(requestKey(storage, "hero-b", "lucky", () => "request-3")).toBe("request-3");
  });
  it("rejects invented Astral species and rarities outside the six existing tiers", () => {
    expect(returnedAstral({ astral: { id: "a", base: "ember", rarity: 5, lvl: 0 } }).rarity).toBe(5);
    expect(() => returnedAstral({ astral: { id: "a", base: "invented", rarity: 5, lvl: 0 } })).toThrow();
    expect(() => returnedAstral({ astral: { id: "a", base: "ember", rarity: 6, lvl: 0 } })).toThrow();
  });
  it("rejects incomplete activity responses rather than showing fake objectives", () => {
    expect(() => returnedActivities({ daily: [], weekly: [] })).toThrow();
  });
  it("never destroys old loot when overflow grows beyond sixty items", () => {
    const h = newHero("Hero", "warrior");
    h.inventory = Array.from({ length: invCap(h) }, () => makeItem("warrior", 1, 0));
    const first = makeItem("warrior", 1, 2, "weapon");
    addLoot(h, first);
    for (let i = 0; i < 70; i++) addLoot(h, makeItem("warrior", 1, 0));
    expect(h.overflow).toHaveLength(71);
    expect(h.overflow?.some((i) => i.id === first.id)).toBe(true);
  });
});
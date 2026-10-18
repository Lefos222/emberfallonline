import { describe, expect, it } from "vitest";
import { equipItem, heroStats, invCap, makeItem, newHero, posOf, unequipItem, wornCompare } from "@/game/data";
import { setFx } from "@/game/progress";

describe("two ring slots", () => {
  it("wears two rings at once and both raise the character", () => {
    const h = newHero("Tester", "warrior");
    const r1 = makeItem("warrior", 20, 3, "ring");
    const r2 = makeItem("warrior", 20, 3, "ring");
    h.inventory = [r1, r2];
    const bare = heroStats(h);
    expect(equipItem(h, r1)).toBe("ring");
    const one = heroStats(h);
    expect(equipItem(h, r2)).toBe("ring2");
    const two = heroStats(h);
    expect(one.atk).toBeGreaterThan(bare.atk);
    expect(two.atk).toBeGreaterThan(one.atk);
    expect(two.crit).toBeGreaterThan(one.crit);
    expect(h.equipment.ring!.id).toBe(r1.id);
    expect(h.equipment.ring2!.id).toBe(r2.id);
  });

  it("a third ring swaps out the weaker one and the loser returns to the bag exactly once", () => {
    const h = newHero("Tester", "archer");
    const weak = makeItem("archer", 10, 2, "ring");
    const mid = makeItem("archer", 20, 3, "ring");
    const strong = makeItem("archer", 40, 4, "ring");
    h.inventory = [weak, mid, strong];
    equipItem(h, weak);
    equipItem(h, mid);
    equipItem(h, strong);
    const worn = [h.equipment.ring!.id, h.equipment.ring2!.id];
    expect(worn).toContain(strong.id);
    expect(worn).not.toContain(weak.id);
    expect(h.inventory.filter((i) => i.id === weak.id)).toHaveLength(1);
    expect(h.inventory.filter((i) => i.id === strong.id)).toHaveLength(0);
  });

  it("a save written before the second ring slot still loads with its ring where it was", () => {
    const h = newHero("Veteran", "mage");
    const ring = makeItem("mage", 12, 2, "ring");
    h.equipment = { weapon: h.equipment.weapon!, armour: h.equipment.armour!, ring };
    expect(h.equipment.ring2).toBeUndefined();
    // The old ring keeps its position; a new ring drops into the free second slot.
    const next = makeItem("mage", 12, 2, "ring");
    h.inventory = [next];
    expect(wornCompare(h, next)).toBeUndefined();
    expect(equipItem(h, next)).toBe("ring2");
    expect(h.equipment.ring!.id).toBe(ring.id);
    expect(unequipItem(h, ring, invCap(h))).toBe(true);
    expect(h.equipment.ring).toBeUndefined();
    expect(h.inventory.some((i) => i.id === ring.id)).toBe(true);
  });

  it("a full bag refuses to unequip instead of destroying the ring", () => {
    const h = newHero("Tester", "warrior");
    const ring = makeItem("warrior", 10, 2, "ring");
    h.inventory = Array.from({ length: invCap(h) }, () => makeItem("warrior", 1, 0, "boots"));
    equipItem(h, ring);
    expect(unequipItem(h, h.equipment.ring!, invCap(h))).toBe(false);
    expect(h.equipment.ring).toBeDefined();
    expect(h.inventory).toHaveLength(invCap(h));
  });

  it("a second ring from the same family feeds the set bonus", () => {
    const h = newHero("Tester", "warrior");
    h.equipment.weapon!.name = "Moonlit Blade";
    h.equipment.armour!.name = "Moonlit Plate";
    const r1 = makeItem("warrior", 20, 3, "ring"); r1.name = "Moonlit Signet";
    const r2 = makeItem("warrior", 20, 3, "ring"); r2.name = "Moonlit Signet";
    h.inventory = [r1, r2];
    // Two Moonlit pieces: the 2-piece bonus only.
    expect(setFx(h.equipment)).toMatchObject({ atkPct: 4, defPct: 0 });
    equipItem(h, r1);
    // Three Moonlit pieces: still short of the 4-piece bonus.
    expect(setFx(h.equipment)).toMatchObject({ atkPct: 4, defPct: 0 });
    equipItem(h, r2);
    // The ring in the second position is the 4th piece and unlocks the defence bonus.
    expect(posOf(h.equipment, r2.id)).toBe("ring2");
    expect(setFx(h.equipment)).toMatchObject({ atkPct: 4, defPct: 6, hpPct: 6 });
  });
});

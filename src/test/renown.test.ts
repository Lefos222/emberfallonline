import { describe, expect, it } from "vitest";
import { heroStats, newHero } from "@/game/data";
import {
  RENOWN_TRACKS,
  addRenown,
  buyRenownRank,
  renown,
  renownBlocker,
  renownCost,
  renownFx,
  renownGain,
  renownRank,
  renownTotal,
} from "@/game/renown";

describe("renown upgrades", () => {
  it("upgrades the hero's own combat stats, not an attribute or a barracks drill", () => {
    expect(RENOWN_TRACKS.map((t) => t.name)).toEqual([
      "Might",
      "Vigour",
      "Guard",
      "Precision",
      "Footwork",
      "Ferocity",
    ]);
    expect(RENOWN_TRACKS.map((t) => t.stat)).toEqual([
      "atkPct",
      "hpPct",
      "defPct",
      "crit",
      "dodge",
      "critDmg",
    ]);
  });

  it("pays more renown for the harder wins", () => {
    expect(renownGain()).toBe(2);
    expect(renownGain({ boss: true })).toBe(5);
    expect(renownGain({ dungeon: true })).toBe(3);
    expect(renownGain({ arena: true })).toBe(3);
    expect(renownGain({ boss: true, dungeon: true })).toBe(6);
  });

  it("asks for more renown the deeper a track goes", () => {
    expect(renownCost(0)).toBe(1);
    expect(renownCost(1)).toBe(1);
    expect(renownCost(2)).toBe(2);
    expect(renownCost(4)).toBe(3);
    expect(renownCost(10)).toBe(6);
  });

  it("buys a rank with banked renown and blocks what cannot be paid for", () => {
    const h = newHero("Renowned", "warrior");
    expect(renownBlocker(h, "might")).toMatch(/Need 1 Renown/);
    addRenown(h, 5);
    expect(renown(h)).toBe(5);
    expect(buyRenownRank(h, "might")).toBeNull();
    expect(renownRank(h, "might")).toBe(1);
    expect(renown(h)).toBe(4);
    expect(buyRenownRank(h, "might")).toBeNull();
    expect(renown(h)).toBe(3);
    // Third rank costs 2, leaving a single coin — not enough for the fourth.
    expect(buyRenownRank(h, "might")).toBeNull();
    expect(renown(h)).toBe(1);
    expect(renownBlocker(h, "might")).toMatch(/Need 2 Renown/);
    expect(buyRenownRank(h, "might")).toMatch(/Need 2 Renown/);
    expect(renownRank(h, "might")).toBe(3);
  });

  it("stops at the track's last rank", () => {
    const h = newHero("Renowned", "warrior");
    h.renown = 10_000;
    const track = RENOWN_TRACKS[0];
    for (let i = 0; i < track.max; i++) expect(buyRenownRank(h, track.id)).toBeNull();
    expect(renownRank(h, track.id)).toBe(track.max);
    expect(renownBlocker(h, track.id)).toBe("Fully trained");
    expect(buyRenownRank(h, track.id)).toBe("Fully trained");
    expect(renownTotal(h)).toBe(track.max);
  });

  it("feeds the shared stat pipeline", () => {
    const h = newHero("Renowned", "warrior");
    h.renown = 10_000;
    const before = heroStats(h);
    for (const t of RENOWN_TRACKS)
      for (let i = 0; i < 5; i++) expect(buyRenownRank(h, t.id)).toBeNull();
    const after = heroStats(h);
    expect(after.patk).toBeGreaterThan(before.patk);
    expect(after.hp).toBeGreaterThan(before.hp);
    expect(after.def).toBeGreaterThan(before.def);
    expect(after.crit).toBeGreaterThan(before.crit);
    expect(after.critDmg).toBeGreaterThan(before.critDmg);
    expect(after.dodge).toBeGreaterThan(before.dodge);
    expect(after.power).toBeGreaterThan(before.power);
  });

  it("banks every rank in the shared bonus shape", () => {
    const fx = renownFx({ renownRanks: { might: 4, vigour: 2, precision: 5 } });
    expect(fx.atkPct).toBe(4);
    expect(fx.hpPct).toBe(3);
    expect(fx.crit).toBe(2);
    expect(fx.defPct).toBe(0);
  });
});

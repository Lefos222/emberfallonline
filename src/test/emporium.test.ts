import { describe, expect, it } from "vitest";
import { MOUNTS, buyGoldMount, mountBlitzPct, mountDaysLeft, mountRenewPrice, renewMount } from "@/game/mounts";
import { carveRune, runeFx } from "@/game/runes";
import { blitzDurationMs } from "@/game/blitz-run";
import { newHero } from "@/game/data";

const hero = () => newHero("Tester", "warrior");

describe("mounts", () => {
  it("has 8 mounts, 3 for gold and 5 for Diamonds", () => {
    expect(MOUNTS).toHaveLength(8);
    expect(MOUNTS.filter((m) => m.gold)).toHaveLength(3);
    expect(MOUNTS.filter((m) => m.diamonds)).toHaveLength(5);
  });
  it("a bought gold mount cuts blitz time by its percentage", () => {
    const h = hero(); h.gold = 1e9;
    expect(buyGoldMount(h, "boar")).toBeNull();
    expect(mountBlitzPct(h)).toBe(10);
    expect(blitzDurationMs(100, 0, 10)).toBe(45 * 60_000);
  });
  it("a Diamond mount cannot be bought with gold", () => {
    const h = hero(); h.gold = 1e9;
    expect(buyGoldMount(h, "griffin")).not.toBeNull();
    expect(mountBlitzPct(h)).toBe(0);
  });
  it("a mount lasts seven days, then must be renewed for gold", () => {
    const h = hero(); h.gold = 1e9;
    expect(buyGoldMount(h, "boar")).toBeNull();
    expect(mountDaysLeft(h, "boar")).toBe(7);
    expect(mountBlitzPct(h)).toBe(10);
    // Let the lease lapse.
    h.mounts = { ...h.mounts, until: { boar: Date.now() - 1 } };
    expect(mountDaysLeft(h, "boar")).toBe(0);
    expect(mountBlitzPct(h)).toBe(0);
    const boar = MOUNTS.find((m) => m.id === "boar")!;
    const fee = mountRenewPrice(boar, h.level);
    const before = h.gold;
    expect(renewMount(h, "boar")).toBeNull();
    expect(h.gold).toBe(before - fee);
    expect(mountBlitzPct(h)).toBe(10);
    expect(mountDaysLeft(h, "boar")).toBe(7);
  });
});

describe("runes", () => {
  it("carving spends crystals and adds stats", () => {
    const h = hero(); h.gold = 1e9; h.mats = { ...h.mats, frostCrystal: 2 };
    expect(carveRune(h, "flame")).toBeNull();
    expect(h.mats.frostCrystal).toBe(0);
    expect(runeFx(h).atkPct).toBeCloseTo(1.2);
    expect(carveRune(h, "flame")).toBe("Not enough crystals");
  });
});

import { describe, expect, it } from "vitest";
import { MINIGAME_PLAYS, playMinigame, playsLeft } from "@/game/minigames";
import { arenaEventGold, arenaTimeline, type ArenaUnit } from "@/game/arena-event";
import type { Hero } from "@/game/data";

const hero = () => ({ level: 10, gold: 0, mats: {}, minigames: undefined } as unknown as Hero);

describe("minigame hall", () => {
  it("allows five plays of each game a day", () => {
    const h = hero();
    for (let i = 0; i < MINIGAME_PLAYS.dice; i++) expect(playMinigame(h, "dice", 0.5)).not.toBeNull();
    expect(playsLeft(h, "dice")).toBe(0);
    expect(playMinigame(h, "dice", 1)).toBeNull();
    expect(playsLeft(h, "runes")).toBe(5);
  });
});

describe("arena clash", () => {
  it("pays the loser 40% of the winner's gold", () => {
    expect(arenaEventGold(10, true)).toBe(2100);
    expect(arenaEventGold(10, false)).toBe(840);
  });
  it("keeps a fallen hero dead for the rest of the clash", () => {
    const units: ArenaUnit[] = [0, 1].flatMap((i) => [
      { id: `a${i}`, name: `A${i}`, cls: "warrior", gender: "male", level: 1, power: 1, side: "a" as const },
      { id: `b${i}`, name: `B${i}`, cls: "mage", gender: "female", level: 1, power: 1, side: "b" as const },
    ]);
    const frames = arenaTimeline(units, 7, "a");
    for (const u of units) {
      // Once a unit is at zero it never comes back: no frame after its fall lifts it off zero.
      const dead = frames.findIndex((f) => f.hp[u.id] === 0);
      if (dead < 0) continue;
      for (const f of frames.slice(dead)) expect(f.hp[u.id]).toBe(0);
    }
    // Someone does fall in a clash, so the rule above is actually exercised.
    expect(frames.some((f) => units.some((u) => f.hp[u.id] === 0))).toBe(true);
  });

  it("replays the server's winner identically for every client", () => {
    const units: ArenaUnit[] = [0, 1, 2, 3].flatMap((i) => [
      { id: `a${i}`, name: `A${i}`, cls: "warrior", gender: "male", level: 1, power: 1, side: "a" as const },
      { id: `b${i}`, name: `B${i}`, cls: "mage", gender: "female", level: 1, power: 1, side: "b" as const },
    ]);
    for (const seed of [1, 42, 999999]) for (const w of ["a", "b"] as const) {
      const f = arenaTimeline(units, seed, w);
      expect(f).toEqual(arenaTimeline(units, seed, w));
      const end = f[f.length - 1]!.hp;
      expect(units.filter((u) => u.side === w).some((u) => end[u.id]! > 0)).toBe(true);
      expect(units.filter((u) => u.side !== w).every((u) => end[u.id] === 0)).toBe(true);
    }
  });
});

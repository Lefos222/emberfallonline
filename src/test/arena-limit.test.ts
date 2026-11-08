import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  ARENA_PER_WINDOW,
  ARENA_WINDOW_MS,
  arenaBlocker,
  arenaFightsLeft,
  arenaFightsUsed,
  arenaResetAt,
  spendArenaFight,
  waitLabel,
} from "@/game/arena-limits";

const START = Date.UTC(2026, 10, 8, 9, 0, 0);

describe("the arena allowance", () => {
  it("pays five duels every twelve hours", () => {
    expect(ARENA_PER_WINDOW).toBe(5);
    expect(ARENA_WINDOW_MS).toBe(12 * 60 * 60 * 1000);
    const h = newHero("Pit", "warrior");
    expect(arenaFightsLeft(h, START)).toBe(5);
    expect(arenaBlocker(h, START)).toBeNull();
  });

  it("spends a duel on entry and blocks the sixth", () => {
    const h = newHero("Pit", "warrior");
    for (let i = 0; i < ARENA_PER_WINDOW; i++) {
      expect(arenaBlocker(h, START + i)).toBeNull();
      spendArenaFight(h, START + i);
    }
    expect(arenaFightsUsed(h, START + 5)).toBe(5);
    expect(arenaFightsLeft(h, START + 5)).toBe(0);
    expect(arenaBlocker(h, START + 5)).toMatch(/No arena fights left/);
  });

  it("refills when the twelve-hour window lapses", () => {
    const h = newHero("Pit", "warrior");
    for (let i = 0; i < ARENA_PER_WINDOW; i++) spendArenaFight(h, START);
    expect(arenaFightsLeft(h, START + ARENA_WINDOW_MS - 1)).toBe(0);
    expect(arenaFightsLeft(h, START + ARENA_WINDOW_MS)).toBe(ARENA_PER_WINDOW);
    expect(arenaBlocker(h, START + ARENA_WINDOW_MS)).toBeNull();
    // The next duel opens a fresh window instead of banking the old one.
    spendArenaFight(h, START + ARENA_WINDOW_MS);
    expect(arenaFightsLeft(h, START + ARENA_WINDOW_MS)).toBe(ARENA_PER_WINDOW - 1);
    expect(arenaResetAt(h, START + ARENA_WINDOW_MS)).toBe(START + 2 * ARENA_WINDOW_MS);
  });

  it("reports the wait as a short label", () => {
    expect(waitLabel(9 * 60 * 1000)).toBe("9m");
    expect(waitLabel(4 * 60 * 60 * 1000 + 12 * 60 * 1000)).toBe("4h 12m");
    expect(waitLabel(ARENA_WINDOW_MS)).toBe("12h");
  });
});

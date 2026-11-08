import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  DUNGEON_RUNS_PER_DAY,
  POTION_DROP_CHANCE,
  POTION_STAMINA,
  STAMINA_PER_DAY,
  STAMINA_PER_RUN,
  addPotions,
  potionCount,
  rollStaminaPotion,
  spendStamina,
  staminaBlocker,
  staminaDay,
  staminaLeft,
  staminaUsed,
  drinkStaminaPotion,
} from "@/game/stamina";

describe("dungeon stamina", () => {
  it("pays 20 dungeon runs a day at 10 stamina each", () => {
    expect(STAMINA_PER_DAY).toBe(200);
    expect(STAMINA_PER_RUN).toBe(10);
    expect(DUNGEON_RUNS_PER_DAY).toBe(20);
  });

  it("starts full and drains a run at a time", () => {
    const h = newHero("Walker", "warrior");
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY);
    expect(staminaBlocker(h)).toBeNull();
    spendStamina(h);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY - STAMINA_PER_RUN);
    expect(staminaUsed(h)).toBe(STAMINA_PER_RUN);
  });

  it("blocks the 21st run of the day", () => {
    const h = newHero("Walker", "warrior");
    for (let i = 0; i < DUNGEON_RUNS_PER_DAY; i++) spendStamina(h);
    expect(staminaLeft(h)).toBe(0);
    expect(staminaBlocker(h)).toMatch(/Out of stamina/);
  });

  it("refills at the next Greek day", () => {
    const h = newHero("Walker", "warrior");
    const now = Date.now();
    for (let i = 0; i < DUNGEON_RUNS_PER_DAY; i++) spendStamina(h, now);
    expect(staminaLeft(h, now)).toBe(0);
    const tomorrow = now + 86400000;
    expect(staminaDay(tomorrow)).not.toBe(staminaDay(now));
    expect(staminaLeft(h, tomorrow)).toBe(STAMINA_PER_DAY);
  });

  it("stores and drinks potions without refilling past a full bar", () => {
    const empty = newHero("Walker", "warrior");
    expect(drinkStaminaPotion(empty)).toBe("No Stamina Potions");

    const h = newHero("Walker", "warrior");
    addPotions(h, 2);
    expect(potionCount(h)).toBe(2);
    // A full bar never wastes a potion.
    expect(drinkStaminaPotion(h)).toBe("Stamina is already full");
    expect(potionCount(h)).toBe(2);

    spendStamina(h);
    spendStamina(h);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY - 2 * STAMINA_PER_RUN);
    expect(drinkStaminaPotion(h)).toBeNull();
    expect(potionCount(h)).toBe(1);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY);

    spendStamina(h);
    expect(drinkStaminaPotion(h)).toBeNull();
    expect(potionCount(h)).toBe(0);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY);
    expect(drinkStaminaPotion(h)).toBe("No Stamina Potions");
  });

  it("drops a potion only on a rare roll", () => {
    expect(rollStaminaPotion(() => POTION_DROP_CHANCE / 2)).toBe(1);
    expect(rollStaminaPotion(() => POTION_DROP_CHANCE + 0.01)).toBe(0);
    expect(POTION_STAMINA).toBe(50);
  });
});

import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  CAMPAIGN_STAMINA,
  DUNGEON_RUNS_PER_DAY,
  DUNGEON_STAMINA,
  POTION_DROP_CHANCE,
  POTION_PER_DAY,
  POTION_STAMINA,
  STAMINA_PER_DAY,
  addPotions,
  potionCount,
  potionUsesLeft,
  rollStaminaPotion,
  spendStamina,
  staminaBlocker,
  staminaDay,
  staminaLeft,
  staminaUsed,
  drinkStaminaPotion,
} from "@/game/stamina";

describe("daily stamina", () => {
  it("pays 500 a day: twenty-five campaign battles at 20 or fifty dungeon runs at 10", () => {
    expect(STAMINA_PER_DAY).toBe(500);
    expect(CAMPAIGN_STAMINA).toBe(20);
    expect(DUNGEON_STAMINA).toBe(10);
    expect(DUNGEON_RUNS_PER_DAY).toBe(50);
  });

  it("starts full and drains a campaign battle at a time", () => {
    const h = newHero("Walker", "warrior");
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY);
    expect(staminaBlocker(h, CAMPAIGN_STAMINA)).toBeNull();
    spendStamina(h, CAMPAIGN_STAMINA);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY - CAMPAIGN_STAMINA);
    expect(staminaUsed(h)).toBe(CAMPAIGN_STAMINA);
  });

  it("blocks the eleventh campaign battle and the twenty-first dungeon run", () => {
    const campaign = newHero("Walker", "warrior");
    for (let i = 0; i < STAMINA_PER_DAY / CAMPAIGN_STAMINA; i++) spendStamina(campaign, CAMPAIGN_STAMINA);
    expect(staminaLeft(campaign)).toBe(0);
    expect(staminaBlocker(campaign, CAMPAIGN_STAMINA)).toMatch(/Out of stamina/);
    expect(staminaBlocker(campaign, DUNGEON_STAMINA)).toMatch(/Out of stamina/);

    const dungeon = newHero("Walker", "warrior");
    for (let i = 0; i < DUNGEON_RUNS_PER_DAY; i++) spendStamina(dungeon, DUNGEON_STAMINA);
    expect(staminaLeft(dungeon)).toBe(0);
    expect(staminaBlocker(dungeon, DUNGEON_STAMINA)).toMatch(/Out of stamina/);
  });

  it("refills at the next Greek day", () => {
    const h = newHero("Walker", "warrior");
    const now = Date.now();
    for (let i = 0; i < DUNGEON_RUNS_PER_DAY; i++) spendStamina(h, DUNGEON_STAMINA, now);
    expect(staminaLeft(h, now)).toBe(0);
    const tomorrow = now + 86400000;
    expect(staminaDay(tomorrow)).not.toBe(staminaDay(now));
    expect(staminaLeft(h, tomorrow)).toBe(STAMINA_PER_DAY);
  });

  it("drinks potions for +50 without refilling past a full bar", () => {
    const empty = newHero("Walker", "warrior");
    expect(drinkStaminaPotion(empty)).toBe("No Stamina Potions");

    const h = newHero("Walker", "warrior");
    addPotions(h, 2);
    expect(potionCount(h)).toBe(2);
    // A full bar never wastes a potion.
    expect(drinkStaminaPotion(h)).toBe("Stamina is already full");
    expect(potionCount(h)).toBe(2);

    spendStamina(h, 120);
    expect(drinkStaminaPotion(h)).toBeNull();
    expect(potionCount(h)).toBe(1);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY - 120 + POTION_STAMINA);
  });

  it("caps stamina potions at five a day", () => {
    const h = newHero("Walker", "warrior");
    addPotions(h, 10);
    for (let i = 0; i < POTION_PER_DAY; i++) {
      spendStamina(h, 50);
      expect(drinkStaminaPotion(h)).toBeNull();
    }
    spendStamina(h, 50);
    expect(potionUsesLeft(h)).toBe(0);
    expect(drinkStaminaPotion(h)).toMatch(/already drunk 5 Stamina Potions/);
    expect(potionCount(h)).toBe(10 - POTION_PER_DAY);
  });

  it("drops a potion only on a rare roll", () => {
    expect(rollStaminaPotion(() => POTION_DROP_CHANCE / 2)).toBe(1);
    expect(rollStaminaPotion(() => POTION_DROP_CHANCE + 0.01)).toBe(0);
    expect(POTION_STAMINA).toBe(50);
  });
});

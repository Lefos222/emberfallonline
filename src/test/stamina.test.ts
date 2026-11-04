import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  CAMPAIGN_FIGHTS_PER_DAY,
  STAMINA_PER_DAY,
  STAMINA_PER_FIGHT,
  spendStamina,
  staminaBlocker,
  staminaDay,
  staminaLeft,
  staminaUsed,
} from "@/game/stamina";

describe("campaign stamina", () => {
  it("pays 30 campaign fights a day", () => {
    expect(STAMINA_PER_DAY / STAMINA_PER_FIGHT).toBe(30);
    expect(CAMPAIGN_FIGHTS_PER_DAY).toBe(30);
  });

  it("starts full and drains a fight at a time", () => {
    const h = newHero("Walker", "warrior");
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY);
    expect(staminaBlocker(h)).toBeNull();
    spendStamina(h);
    expect(staminaLeft(h)).toBe(STAMINA_PER_DAY - STAMINA_PER_FIGHT);
    expect(staminaUsed(h)).toBe(STAMINA_PER_FIGHT);
  });

  it("blocks the 31st fight of the day", () => {
    const h = newHero("Walker", "warrior");
    for (let i = 0; i < CAMPAIGN_FIGHTS_PER_DAY; i++) spendStamina(h);
    expect(staminaLeft(h)).toBe(0);
    expect(staminaBlocker(h)).toMatch(/Out of stamina/);
  });

  it("refills at the next Greek day", () => {
    const h = newHero("Walker", "warrior");
    const now = Date.now();
    for (let i = 0; i < CAMPAIGN_FIGHTS_PER_DAY; i++) spendStamina(h, now);
    expect(staminaLeft(h, now)).toBe(0);
    const tomorrow = now + 86400000;
    expect(staminaDay(tomorrow)).not.toBe(staminaDay(now));
    expect(staminaLeft(h, tomorrow)).toBe(STAMINA_PER_DAY);
  });
});

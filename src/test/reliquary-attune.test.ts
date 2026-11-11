import { describe, expect, it } from "vitest";
import { GUILD_RELICS, attuneCost, attuneRelic, relicFx } from "@/game/guild-tower";
import type { Hero } from "@/game/data";

const hero = (coins: number) => ({ guildSkills: { g_atk: 3, g_def: 3 }, guildCoins: coins } as unknown as Hero);

describe("reliquary attunement", () => {
  it("costs 600 coins per shelf per level", () => {
    expect(attuneCost(GUILD_RELICS[0]!, 0)).toBe(600);
    expect(attuneCost(GUILD_RELICS[1]!, 2)).toBe(3600);
  });
  it("each attunement adds half the base bonus, capped at five", () => {
    const h = hero(1_000_000);
    const base = relicFx(h).atkPct;
    expect(attuneRelic(h, "ember_banner")).toBeNull();
    expect(relicFx(h).atkPct).toBeCloseTo(base + 1);
    for (let i = 0; i < 4; i++) attuneRelic(h, "ember_banner");
    expect(attuneRelic(h, "ember_banner")).toBe("Fully attuned");
  });
  it("refuses without enough coins", () => {
    expect(attuneRelic(hero(10), "ember_banner")).toMatch(/Need/);
  });
});

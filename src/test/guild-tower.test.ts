import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { guildRanks } from "@/game/progress";
import {
  GUILD_RELICS, attuneCost, attuneRelic, guildLedger, relicFx, relicLevel, relicUnlocked, sellToVault, contributeGold,
} from "@/game/guild-tower";

describe("guild ranks", () => {
  it("are earned by donating gold, one rank per 5,000", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 50_000;
    expect(guildRanks(hero)).toBe(0);
    expect(contributeGold(hero, 12_000)).toBeNull();
    expect(guildRanks(hero)).toBe(2);
    expect(guildLedger(hero).donated).toBe(12_000);
    expect(hero.guildCoins).toBe(12_000);
  });
});

describe("guild reliquary", () => {
  it("wakes each relic once the hero's guild rank reaches it", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e9;
    expect(GUILD_RELICS.every((r) => !relicUnlocked(hero, r))).toBe(true);
    const [first] = GUILD_RELICS;
    contributeGold(hero, first.ranks * 5_000);
    expect(relicUnlocked(hero, first)).toBe(true);
    const [stat, amount] = Object.entries(first.bonus)[0];
    expect(relicFx(hero)[stat as keyof ReturnType<typeof relicFx>]).toBeGreaterThanOrEqual(amount);
  });

  it("attunes a woken relic with guild coins", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e9;
    const [first] = GUILD_RELICS;
    contributeGold(hero, first.ranks * 5_000);
    hero.guildCoins = attuneCost(first, 0);
    expect(attuneRelic(hero, first.id)).toBeNull();
    expect(relicLevel(hero, first.id)).toBe(1);
    expect(hero.guildCoins).toBe(0);
  });
});

describe("guild treasury and vault", () => {
  it("pays guild coins for surplus materials without touching the rest of the bag", () => {
    const hero = newHero("Tester", "warrior");
    hero.mats = { ore: 30, essence: 4 };
    hero.guildCoins = 0;
    expect(sellToVault(hero, "ore", 100)).toBeNull();
    expect(hero.mats?.ore).toBe(0);
    expect(hero.mats?.essence).toBe(4);
    expect(hero.guildCoins).toBe(30 * 5);
  });
});

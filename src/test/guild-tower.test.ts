import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  GUILD_RELICS, GUILD_SKILLS, guildFx, guildLedger, guildSkillPrice, guildSkillRank, guildTotalRanks,
  learnGuildSkill, relicUnlocked, sellToVault, contributeGold,
} from "@/game/guild-tower";

const skill = GUILD_SKILLS[0];

describe("guild skill tower", () => {
  it("keeps levelling past the old fifteen-rank ceiling", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e12;
    hero.guildCoins = 1e12;
    for (let i = 0; i < 20; i++) {
      const res = learnGuildSkill(hero, skill.id);
      expect(res.error).toBeNull();
    }
    expect(guildSkillRank(hero, skill.id)).toBe(20);
    // Twenty ranks of atk plus whatever relic they woke along the way.
    expect(guildFx(hero)[skill.stat]).toBeGreaterThanOrEqual(skill.per * 20);
  });

  it("charges gold as well as guild coins, and both climb with the rank", () => {
    const first = guildSkillPrice(skill, 0);
    const tenth = guildSkillPrice(skill, 10);
    expect(first.gold).toBeGreaterThan(0);
    expect(tenth.coins).toBeGreaterThan(first.coins);
    expect(tenth.gold).toBeGreaterThan(first.gold);

    const hero = newHero("Tester", "warrior");
    hero.guildCoins = first.coins;
    hero.gold = first.gold - 1;
    expect(learnGuildSkill(hero, skill.id).error).toMatch(/gold/i);
    expect(guildSkillRank(hero, skill.id)).toBe(0);
    expect(hero.guildCoins).toBe(first.coins);
  });

  it("buys several ranks in one call and writes the spend into the ledger", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e9;
    hero.guildCoins = 1e9;
    const res = learnGuildSkill(hero, skill.id, 5);
    expect(res.bought).toBe(5);
    expect(guildTotalRanks(hero)).toBe(5);
    expect(guildLedger(hero).spent).toBeGreaterThan(0);
  });
});

describe("guild reliquary", () => {
  it("wakes each relic once the tower reaches its rank and adds its bonus to the guild stats", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e12;
    hero.guildCoins = 1e12;
    expect(GUILD_RELICS.every((r) => !relicUnlocked(hero, r))).toBe(true);
    const [first] = GUILD_RELICS;
    for (let i = 0; i < first.ranks; i++) learnGuildSkill(hero, GUILD_SKILLS[i % GUILD_SKILLS.length].id);
    expect(relicUnlocked(hero, first)).toBe(true);
    const [stat, amount] = Object.entries(first.bonus)[0];
    expect(guildFx(hero)[stat as keyof ReturnType<typeof guildFx>]).toBeGreaterThanOrEqual(amount);
  });
});

describe("guild treasury and vault", () => {
  it("records donated gold in the ledger", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 50_000;
    expect(contributeGold(hero, 10_000)).toBeNull();
    expect(hero.guildCoins).toBe(10_000);
    expect(guildLedger(hero).donated).toBe(10_000);
  });

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

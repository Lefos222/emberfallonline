import { describe, expect, it } from "vitest";

import { heroStats, newHero } from "@/game/data";
import {
  ASCENSIONS,
  CLOUD_MISSIONS,
  ascCost,
  ascRank,
  blessingGold,
  buyAscension,
  buyShards,
  claimBlessing,
  claimMission,
  cloudDay,
  cloudFx,
  missionRows,
  noteSteps,
  noteTalk,
  noteVisit,
  rollCloud,
  shardPrice,
  shards,
} from "@/game/cloudcity";

const hero = () => {
  const h = newHero("Skywalker", "warrior");
  h.level = 40;
  rollCloud(h);
  h.cloud!.shards = 60;
  return h;
};

describe("Cloud City daily state", () => {
  it("opens on today with starter shards and keeps them across visits", () => {
    const h = newHero("Traveller", "mage");
    const first = rollCloud(h);
    expect(first.day).toBe(cloudDay());
    expect(first.shards).toBeGreaterThan(0);
    first.shards = 12;
    expect(rollCloud(h)).toBe(first);
    expect(shards(h)).toBe(12);
  });

  it("rolls the day over: daily counters reset, shards and ranks survive", () => {
    const h = hero();
    h.cloud!.ranks = { might: 3 };
    noteTalk(h, "mira");
    noteVisit(h, "nexus");
    noteSteps(h, 12);
    h.cloud!.claimed = [CLOUD_MISSIONS[0].id];
    h.cloud!.day = "2000-01-01";

    const next = rollCloud(h);
    expect(next.day).toBe(cloudDay());
    expect(next.talks).toEqual([]);
    expect(next.visits).toEqual([]);
    expect(next.steps).toBe(0);
    expect(next.claimed).toEqual([]);
    expect(next.ranks).toEqual({ might: 3 });
    expect(next.shards).toBe(61); // 60 banked + Mira's daily gift
  });
});

describe("Aether Ascension", () => {
  it("spends shards, raises the rank and reaches combat stats", () => {
    const h = hero();
    const dry = structuredClone(h);
    const before = shards(h);

    expect(buyAscension(h, "might")).toBeNull();
    expect(ascRank(h, "might")).toBe(1);
    expect(shards(h)).toBe(before - ascCost(ASCENSIONS[0], 0));
    expect(heroStats(h).atk).toBeGreaterThan(heroStats(dry).atk);
    expect(cloudFx(h).atkPct).toBe(ASCENSIONS[0].per);
  });

  it("refuses a rank that cannot be paid for", () => {
    const h = hero();
    h.cloud!.shards = 0;
    expect(buyAscension(h, "vigor")).toMatch(/shards/i);
    expect(ascRank(h, "vigor")).toBe(0);
  });

  it("caps every track at its maximum rank", () => {
    const h = hero();
    h.cloud!.shards = 100000;
    for (let i = 0; i < ASCENSIONS[0].max + 3; i++) buyAscension(h, "might");
    expect(ascRank(h, "might")).toBe(ASCENSIONS[0].max);
    expect(buyAscension(h, "might")).toBe("Fully ascended");
  });
});

describe("citizens and commissions", () => {
  it("pays each citizen's gift once a day and counts unique conversations", () => {
    const h = hero();
    const start = shards(h);
    expect(noteTalk(h, "mira")).toBe(1);
    noteTalk(h, "mira");
    expect(noteTalk(h, "mira")).toBe(0);
    expect(h.cloud!.talks).toEqual(["mira"]);
    expect(shards(h)).toBe(start + 1);

    noteTalk(h, "bram");
    noteTalk(h, "seraphine");
    noteTalk(h, "orrin");
    expect(h.cloud!.talks).toHaveLength(4);
  });

  it("completes and pays a commission exactly once", () => {
    const h = hero();
    ["mira", "bram", "seraphine", "orrin"].forEach((id) => noteTalk(h, id));
    const row = missionRows(h).find((r) => r.mission.id === "citizens")!;
    expect(row.done).toBe(true);

    const before = shards(h);
    const paid = claimMission(h, "citizens");
    expect(paid?.shards).toBe(row.mission.shards);
    expect(shards(h)).toBe(before + row.mission.shards);
    expect(claimMission(h, "citizens")).toBeNull();
  });

  it("counts buildings entered and tiles walked", () => {
    const h = hero();
    noteVisit(h, "nexus");
    noteVisit(h, "nexus");
    noteVisit(h, "vault");
    noteSteps(h, 30);
    expect(h.cloud!.visits).toEqual(["nexus", "vault"]);
    expect(missionRows(h).find((r) => r.mission.id === "buildings")!.progress).toBe(2);
    expect(missionRows(h).find((r) => r.mission.id === "patrol")!.progress).toBe(30);
  });
});

describe("Sky Vault", () => {
  it("gives one blessing a day", () => {
    const h = hero();
    const shardStart = shards(h);
    const goldStart = h.gold;
    const first = claimBlessing(h);
    expect(first?.gold).toBe(blessingGold(h));
    expect(shards(h)).toBe(shardStart + (first?.shards ?? 0));
    expect(h.gold).toBe(goldStart + (first?.gold ?? 0));
    expect(claimBlessing(h)).toBeNull();
  });

  it("trades gold for shards at the vault price", () => {
    const h = hero();
    h.gold = shardPrice(h) * 3;
    const before = shards(h);
    expect(buyShards(h, 2)).toBeNull();
    expect(shards(h)).toBe(before + 2);
    expect(h.gold).toBe(shardPrice(h));
    expect(buyShards(h, 5)).toMatch(/gold/i);
  });
});

import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { bountyBoard, openTreeChest, recordBounty, claimBounty, treeChestReady } from "@/game/worldtree";
import { fateStoneCost } from "@/game/fate";

describe("Tree Chest", () => {
  it("opens only after all three bounties are paid, once a day", () => {
    const h = newHero("T", "mage");
    expect(treeChestReady(h, 10)).toBe(false);
    for (const b of bountyBoard(10)) { for (let i = 0; i < b.need; i++) recordBounty(h, b.kind); claimBounty(h, b); }
    expect(treeChestReady(h, 10)).toBe(true);
    expect(openTreeChest(h, 10)).not.toBeNull();
    expect(h.mats?.fateStone).toBe(1);
    expect(openTreeChest(h, 10)).toBeNull();
  });
});

describe("Fate refinement", () => {
  it("has no 60 cap and costs more the higher it goes", () => {
    const it80 = { refine: 80 } as never;
    expect(fateStoneCost(it80)).toBeGreaterThan(fateStoneCost({ refine: 3 } as never));
  });
});

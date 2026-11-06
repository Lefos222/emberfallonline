import { afterEach, describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { premiumState } from "@/game/economy";
import {
  buyChest,
  buyDiamondPack,
  buyGem,
  buyGoldPack,
  buyMaterial,
  buyVip,
  claimVipDaily,
} from "@/game/premium-shop";
import { getState, setHero } from "@/game/store";

afterEach(() => setHero(null));

describe("premium shop is closed", () => {
  it("refuses every purchase and never grants diamonds", () => {
    setHero(newHero("Shopper", "warrior"));
    const before = JSON.stringify(getState().hero);

    const errors = [
      buyDiamondPack("pouch"),
      buyGoldPack("pouch"),
      buyGem("ruby", 1),
      buyMaterial("ore", 5),
      buyChest("gold"),
      buyVip(1),
      claimVipDaily(),
    ];

    for (const error of errors) expect(error).toMatch(/coming soon/i);
    expect(premiumState(getState().hero).balance).toBe(0);
    expect(JSON.stringify(getState().hero)).toBe(before);
  });
});

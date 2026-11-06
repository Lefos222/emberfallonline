import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("premium shop test wallet", () => {
  it("grants a pack, then spends diamonds on gold, stones, materials, chests and VIP", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_PREMIUM_TEST_MODE", "1");
    const shop = await import("@/game/premium-shop");
    const store = await import("@/game/store");
    const { newHero } = await import("@/game/data");
    const { premiumState } = await import("@/game/economy");

    store.setHero(newHero("Shopper", "warrior"));

    expect(shop.buyDiamondPack("pouch")).toBeNull();
    expect(premiumState(store.getState().hero).balance).toBe(1200);

    expect(shop.buyGoldPack("pouch")).toBeNull();
    expect(store.getState().hero?.gold).toBe(10100);
    expect(premiumState(store.getState().hero).balance).toBe(1150);

    expect(shop.buyGem("ruby", 1)).toBeNull();
    expect(store.getState().hero?.gems?.["ruby:1"]).toBe(1);
    expect(premiumState(store.getState().hero).balance).toBe(1145);

    expect(shop.buyMaterial("ore", 5)).toBeNull();
    expect(store.getState().hero?.mats?.ore).toBe(5);
    expect(premiumState(store.getState().hero).balance).toBe(1125);

    expect(shop.buyChest("gold")).toBeNull();
    expect(store.getState().hero?.chests?.gold).toBe(1);
    expect(premiumState(store.getState().hero).balance).toBe(1065);

    expect(shop.buyVip(1)).toBeNull();
    expect(premiumState(store.getState().hero).vip.level).toBe(1);
    expect(premiumState(store.getState().hero).balance).toBe(966);

    expect(shop.claimVipDaily()).toBeNull();
    expect(store.getState().hero?.gold).toBe(11600);
    expect(premiumState(store.getState().hero).claimedToday).toBe(true);
    expect(shop.claimVipDaily()).toMatch(/already claimed/i);

    store.setHero(null);
  });
});

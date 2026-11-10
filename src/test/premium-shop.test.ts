import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { premiumState } from "@/game/economy";
import {
  applyCardPurchase,
  applyDiamondSpend,
  cardPurchaseApplied,
  spendQuote,
  walletBalance,
} from "@/game/premium-ledger";
import { VIP_DAYS, vipBlitzFactor } from "@/game/vip-perks";
import { blitzDurationMs } from "@/game/blitz-run";

const withDiamonds = (balance: number) => {
  const hero = newHero("Shopper", "warrior");
  hero.srv = { premium: { balance, history: [] } };
  return hero;
};

describe("premium ledger", () => {
  it("credits a confirmed Diamond pack once per Stripe session", () => {
    const hero = withDiamonds(0);
    const credited = applyCardPurchase(hero, {
      ref: "cs_test_1",
      kind: "diamonds",
      diamonds: 1200,
    });
    expect(walletBalance(credited)).toBe(1200);
    expect(cardPurchaseApplied(credited, "cs_test_1")).toBe(true);

    const again = applyCardPurchase(credited, {
      ref: "cs_test_1",
      kind: "diamonds",
      diamonds: 1200,
    });
    expect(walletBalance(again)).toBe(1200);
  });

  it("activates a one-month VIP membership and extends it by a month", () => {
    const hero = withDiamonds(0);
    const first = applyCardPurchase(hero, {
      ref: "cs_vip_1",
      kind: "vip",
      vipLevel: 2,
      days: VIP_DAYS,
    });
    const state = premiumState(first);
    expect(state.vip.level).toBe(2);
    const until = Date.parse(state.vip.until!);
    expect(until).toBeGreaterThan(Date.now() + (VIP_DAYS - 1) * 86_400_000);

    const second = applyCardPurchase(first, {
      ref: "cs_vip_2",
      kind: "vip",
      vipLevel: 2,
      days: VIP_DAYS,
    });
    const extended = Date.parse(premiumState(second).vip.until!);
    expect(extended - until).toBeGreaterThan(29 * 86_400_000);
  });

  it("applies the VIP shop discount to a quote", () => {
    expect(spendQuote({ kind: "chest", itemId: "gold" }, 0).price).toBe(66);
    expect(spendQuote({ kind: "chest", itemId: "gold" }, 3).price).toBe(57);
    expect(spendQuote({ kind: "material", itemId: "fragment", qty: 5 }, 0).price).toBe(44);
    expect(spendQuote({ kind: "vip", itemId: "1" }, 0).price).toBe(129);
  });

  it("debits diamonds and grants the exact missing Armor Fragments", () => {
    const hero = withDiamonds(100);
    const next = applyDiamondSpend(
      hero,
      { kind: "material", itemId: "fragment", qty: 5 },
      "4f6b6a2e-1a2b-4c3d-8e9f-0123456789ab",
    );
    expect(walletBalance(next)).toBe(56);
    expect(next.mats?.fragment).toBe(5);
    const history = next.srv?.premium?.history ?? [];
    expect(history.at(-1)?.kind).toBe("spend");
    expect(history.at(-1)?.amount).toBe(44);
  });

  it("refuses a spend the wallet cannot cover and leaves the save untouched", () => {
    const hero = withDiamonds(10);
    expect(() =>
      applyDiamondSpend(
        hero,
        { kind: "material", itemId: "fragment", qty: 5 },
        "00000000-0000-4000-8000-000000000000",
      ),
    ).toThrow(/Not enough Diamonds/);
    expect(walletBalance(hero)).toBe(10);
    expect(hero.mats?.fragment ?? 0).toBe(0);
  });

  it("buys a month of VIP with diamonds", () => {
    const hero = withDiamonds(1000);
    const next = applyDiamondSpend(
      hero,
      { kind: "vip", itemId: "1" },
      "00000000-0000-4000-8000-000000000001",
    );
    expect(premiumState(next).vip.level).toBe(1);
    expect(walletBalance(next)).toBe(871);
  });

  it("shortens a blitz for members", () => {
    expect(blitzDurationMs(1, 0)).toBe(20 * 60_000);
    expect(blitzDurationMs(1, 3)).toBe(14 * 60_000);
    expect(vipBlitzFactor(3)).toBeCloseTo(0.7);
  });
});

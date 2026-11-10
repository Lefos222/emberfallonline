/** VIP is a one-month membership, never a permanent unlock.
 *
 *  This module is deliberately dependency-free: the wallet parser (`economy.ts`), the reward
 *  paths (`logic.ts`, `blitz-run.ts`) and the payment server all read the same perk numbers from
 *  here, so a bonus can never drift between what the shop advertises and what the game pays. */

/** Every membership lasts exactly one month. Buying again adds another month. */
export const VIP_DAYS = 30;

export interface VipPerk {
  level: number;
  name: string;
  /** One-month price in Diamonds. */
  diamonds: number;
  /** One-month price in cents when paid by card through Stripe. */
  moneyCents: number;
  /** Gold paid by the VIP reward board every claimed day. */
  dailyGold: number;
  /** Extra battle XP while the membership is active, in percent. */
  xpBonusPct: number;
  /** Extra gold from every battle, blitz, event and daily payout, in percent. */
  goldBonusPct: number;
  /** How much shorter a blitz run is, in percent. */
  blitzSpeedPct: number;
  /** Discount on every Diamond price in the premium shop, in percent. */
  shopDiscountPct: number;
}

/** The three monthly tiers. Prices carry the shop-wide 10% rise plus the extra VIP premium. */
export const VIP_PERKS: VipPerk[] = [
  {
    level: 1,
    name: "Supporter",
    diamonds: 129,
    moneyCents: 699,
    dailyGold: 1500,
    xpBonusPct: 10,
    goldBonusPct: 5,
    blitzSpeedPct: 10,
    shopDiscountPct: 5,
  },
  {
    level: 2,
    name: "Adventurer",
    diamonds: 319,
    moneyCents: 1499,
    dailyGold: 4000,
    xpBonusPct: 20,
    goldBonusPct: 10,
    blitzSpeedPct: 20,
    shopDiscountPct: 10,
  },
  {
    level: 3,
    name: "Champion",
    diamonds: 649,
    moneyCents: 2499,
    dailyGold: 8000,
    xpBonusPct: 35,
    goldBonusPct: 15,
    blitzSpeedPct: 30,
    shopDiscountPct: 15,
  },
];

export const vipPerkFor = (level: number) => VIP_PERKS.find((plan) => plan.level === level);

/** Old saves can carry the retired five-level VIP. Its top tiers keep the Champion's perks, so an
 *  existing membership never gets weaker than what the player paid for. */
export function vipPerkEffective(level: number): VipPerk | undefined {
  if (!Number.isFinite(level) || level < 1) return undefined;
  const tier = level >= 3 ? 3 : level === 2 ? 2 : 1;
  return { ...VIP_PERKS[tier - 1], level };
}

/** The active VIP level stored on a save's server-owned premium wallet, or 0 when expired/absent. */
export function vipLevelFromPremium(premium: unknown): number {
  if (!premium || typeof premium !== "object") return 0;
  const vip = (premium as { vip?: unknown }).vip;
  if (!vip || typeof vip !== "object") return 0;
  const { level, until } = vip as { level?: unknown; until?: unknown };
  if (typeof until !== "string") return 0;
  const at = Date.parse(until);
  if (!Number.isFinite(at) || at <= Date.now()) return 0;
  return Number.isInteger(level) && Number(level) > 0 ? Number(level) : 0;
}

/** Convenience for a whole hero (the premium wallet lives at `srv.premium`). */
export const vipLevelOf = (hero: { srv?: { premium?: unknown } } | null | undefined) =>
  vipLevelFromPremium(hero?.srv?.premium);

export const vipXpPct = (level: number) => vipPerkEffective(level)?.xpBonusPct ?? 0;
export const vipGoldBonusPct = (level: number) => vipPerkEffective(level)?.goldBonusPct ?? 0;
export const vipBlitzSpeedPct = (level: number) => vipPerkEffective(level)?.blitzSpeedPct ?? 0;
export const vipDiscountPct = (level: number) => vipPerkEffective(level)?.shopDiscountPct ?? 0;

/** 1.05 / 1.10 / 1.15 while VIP is active; 1 otherwise. Applied by `grant()` to every payout. */
export function vipGoldMultiplier(level: number): number {
  return 1 + vipGoldBonusPct(level) / 100;
}

/** Multiplier for a blitz run's length: 0.9 / 0.8 / 0.7 while VIP is active; 1 otherwise. */
export function vipBlitzFactor(level: number): number {
  return 1 - vipBlitzSpeedPct(level) / 100;
}

/** The Diamonds a VIP actually pays: the base price less their shop discount, rounded up. */
export function vipPrice(base: number, level: number): number {
  const off = vipDiscountPct(level);
  if (!off) return Math.max(1, Math.round(base));
  return Math.max(1, Math.ceil((base * (100 - off)) / 100));
}

/** A readable perk list for the shop's VIP cards. */
export function vipPerkLines(level: number): string[] {
  const plan = vipPerkFor(level);
  if (!plan) return [];
  return [
    `+${plan.xpBonusPct}% XP from every battle`,
    `+${plan.goldBonusPct}% gold from battles, blitzes and events`,
    `${plan.dailyGold.toLocaleString()} gold every day from the VIP reward board`,
    `Blitzes run ${plan.blitzSpeedPct}% faster`,
    `${plan.shopDiscountPct}% off every Diamond price in this shop`,
    "2 VIP-only daily activities and 2 VIP-only world events",
  ];
}

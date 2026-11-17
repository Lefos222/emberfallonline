import { object } from "./services-contract";
import type { GemType, Mat } from "./crafting";
import {
  VIP_DAYS,
  VIP_PERKS,
  vipPerkEffective,
  vipPerkFor,
  vipPerkLines,
  vipPrice,
  vipXpPct,
  vipLevelFromPremium,
} from "./vip-perks";

/** Premium shop catalogue and wallet parsing.
 *
 *  Prices live here once. The payment server (`payments.functions.ts`) imports the same catalogue
 *  to build Stripe line items and to validate every Diamond spend, so the shop and the charge can
 *  never disagree. The server-owned wallet at `srv.premium` is only ever written by server code:
 *  a confirmed Stripe payment, or the premium RPC (`skip_blitz`).
 *
 *  This release rebalances the whole premium economy: all existing prices rise a further 10%, including VIP — a one-month membership with faster blitzes, bigger
 *  gold, shop discounts, two VIP-only activities and two VIP-only world events. */

/** The shop-wide price rise applied to every Diamond good and real-money pack. */
export const PRICE_HIKE = 1.1;
/** VIP carries the shop rise plus its own premium: 25% over the old membership prices. */
export const VIP_PRICE_HIKE = 1.25;

export interface DiamondPack {
  id: string;
  name: string;
  /** Price shown to the player, in cents. */
  priceCents: number;
  diamonds: number;
  bonus: number;
  tag?: string;
}

/** Five money tiers with a further 10% increase; currency quantities are unchanged. */
export const DIAMOND_PACKS: DiamondPack[] = [
  { id: "pouch", name: "Diamond Pouch", priceCents: 1209, diamonds: 1200, bonus: 0 },
  {
    id: "satchel",
    name: "Diamond Satchel",
    priceCents: 2419,
    diamonds: 2500,
    bonus: 200,
    tag: "Popular",
  },
  { id: "chest", name: "Diamond Chest", priceCents: 3629, diamonds: 4000, bonus: 400 },
  { id: "vault", name: "Diamond Vault", priceCents: 6049, diamonds: 7000, bonus: 800 },
  {
    id: "treasury",
    name: "Diamond Treasury",
    priceCents: 12099,
    diamonds: 15000,
    bonus: 2000,
    tag: "Best value",
  },
];

export const diamondPackTotal = (pack: DiamondPack) => pack.diamonds + pack.bonus;

export interface GoldPack {
  id: string;
  name: string;
  diamonds: number;
  gold: number;
}

/** Gold bought with diamonds (+10% on this release's prices). */
export const GOLD_PACKS: GoldPack[] = [
  { id: "pouch", name: "Gold Pouch", diamonds: 61, gold: 10000 },
  { id: "coffer", name: "Gold Coffer", diamonds: 267, gold: 50000 },
  { id: "royal", name: "Royal Treasury", diamonds: 908, gold: 200000 },
  { id: "imperial", name: "Imperial Treasury", diamonds: 2420, gold: 600000 },
];

export interface VipPlan {
  level: number;
  name: string;
  days: number;
  diamonds: number;
  /** One-month card price in cents (Stripe checkout). */
  priceCents: number;
  dailyGold: number;
  /** Extra battle XP while the membership is active, in percent. */
  xpBonusPct: number;
  /** Extra gold from every payout while the membership is active, in percent. */
  goldBonusPct: number;
  /** Shorter blitz runs while the membership is active, in percent. */
  blitzSpeedPct: number;
  /** Discount on every Diamond price in the shop, in percent. */
  shopDiscountPct: number;
  perks: string[];
}

/** Three one-month memberships. Buying again adds another month; it never renews by itself. */
export const VIP_PLANS: VipPlan[] = VIP_PERKS.map((plan) => ({
  level: plan.level,
  name: plan.name,
  days: VIP_DAYS,
  diamonds: plan.diamonds,
  priceCents: plan.moneyCents,
  dailyGold: plan.dailyGold,
  xpBonusPct: plan.xpBonusPct,
  goldBonusPct: plan.goldBonusPct,
  blitzSpeedPct: plan.blitzSpeedPct,
  shopDiscountPct: plan.shopDiscountPct,
  perks: vipPerkLines(plan.level),
}));

/** Old saves can carry the five-level VIP that predates this shop; its top tiers keep Champion perks. */
export const vipPlanFor = (level: number) => VIP_PLANS.find((plan) => plan.level === level);

/** The effective XP bonus, including the retired five-level memberships. */
export const vipXpBonusPct = (level: number) => vipXpPct(level);

/** One material offer: a single unit at the "small thing" price, or a bundle of five. */
export interface MaterialPrices {
  one: number;
  five: number;
}

/** The materials the diamond shop sells. Fate Stones are earned in battle and bought for gold at the
 *  Auction House, so they are deliberately not a diamond good. Prices include this release's rise. */
export type DiamondMat = Exclude<Mat, "fateStone" | "frostCrystal" | "voidCrystal" | "sunCrystal" | "dragonScale" | "abyssalShard" | "titanHeart" | "wyrmBone" | "moonsilver" | "shadowSilk" | "phoenixAsh" | "aetherEmber" | "voidsteel" | "celestialPearl" | "eclipsedHeart">;

export const MATERIAL_PRICES: Record<DiamondMat, MaterialPrices> = {
  ore: { one: 7, five: 25 },
  hide: { one: 7, five: 25 },
  bloom: { one: 7, five: 25 },
  essence: { one: 13, five: 49 },
  fragment: { one: 13, five: 49 },
  crystal: { one: 13, five: 49 },
  starshard: { one: 31, five: 121 },
  sigil: { one: 31, five: 121 },
  bossCore: { one: 61, five: 242 },
};

/** Display order for the materials tab. */
export const MATERIAL_ORDER: DiamondMat[] = [
  "ore",
  "hide",
  "bloom",
  "essence",
  "fragment",
  "crystal",
  "starshard",
  "sigil",
  "bossCore",
];

/** Stones: tier 1 is the 6-diamond "small thing"; tiers 2 and 3 stay affordable. */
export const GEM_TIER_PRICES = [7, 19, 49] as const;
export const GEM_SHOP_TIERS = GEM_TIER_PRICES.length;

export interface ChestOffer {
  kind: "gold" | "gem";
  name: string;
  diamonds: number;
  description: string;
}

export const CHEST_OFFERS: ChestOffer[] = [
  {
    kind: "gold",
    name: "Gold Chest",
    diamonds: 73,
    description: "Open it in the Armory for gold, Ember Ore and Armor Fragments.",
  },
  {
    kind: "gem",
    name: "Gem Chest",
    diamonds: 182,
    description: "Open it in the Armory for two cut gems, Soul Essence and an Arcane Crystal.",
  },
];

/** Cosmetics and bundles bought with Diamonds (server-owned catalogue in the payment RPCs). */
export interface DiamondItem {
  id: string;
  name: string;
  diamonds: number;
  kind: "cosmetic" | "scrolls" | "resources";
  description: string;
}
export const DIAMOND_SHOP: DiamondItem[] = [
  {
    id: "wings_celestial",
    name: "Celestial Wings",
    diamonds: 1452,
    kind: "cosmetic",
    description: "Exclusive radiant wing appearance",
  },
  {
    id: "outfit_royal",
    name: "Royal Outfit",
    diamonds: 1089,
    kind: "cosmetic",
    description: "Exclusive regal character outfit",
  },
  {
    id: "aura_ember",
    name: "Ember Aura",
    diamonds: 726,
    kind: "cosmetic",
    description: "A smouldering aura surrounds your character",
  },
  {
    id: "frame_diamond",
    name: "Diamond Frame",
    diamonds: 968,
    kind: "cosmetic",
    description: "Prestigious portrait frame",
  },
  {
    id: "title_immortal",
    name: "Immortal Title",
    diamonds: 605,
    kind: "cosmetic",
    description: 'The "Immortal" title',
  },
  {
    id: "scroll_bundle",
    name: "War Scroll Bundle",
    diamonds: 484,
    kind: "scrolls",
    description: "5 Damage, 5 Defence and 5 Experience Scrolls",
  },
];

/** What a quantity of one material costs in Diamonds, before a VIP discount. */
export function materialBaseCost(mat: DiamondMat, qty: number): number {
  const prices = MATERIAL_PRICES[mat];
  const n = Math.max(1, Math.floor(qty || 1));
  return Math.floor(n / 5) * prices.five + (n % 5) * prices.one;
}

/** What a quantity of one material costs a hero, after their VIP shop discount. */
export const materialCost = (mat: DiamondMat, qty: number, vipLevel = 0) =>
  vipPrice(materialBaseCost(mat, qty), vipLevel);

/** The Diamond price of any shop good, after the hero's VIP discount. */
export function goodPrice(base: number, vipLevel = 0): number {
  return vipPrice(base, vipLevel);
}

export interface PremiumHistoryEntry {
  at: string;
  kind: string;
  amount: number;
  detail: string;
}

/** Wallet shape shared by the preview test wallet and the old server-owned premium state. */
export interface PremiumWallet {
  balance?: number;
  vip?: { level?: number; until?: string | null };
  claimed?: string;
  history?: PremiumHistoryEntry[];
}

export interface PremiumState {
  balance: number;
  vip: { level: number; until: string | null };
  claimedToday: boolean;
  history: PremiumHistoryEntry[];
}

const walletOf = (hero: unknown): PremiumWallet => {
  const root = object(hero);
  return object(object(root["srv"])["premium"]) as PremiumWallet;
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function premiumState(hero: unknown): PremiumState {
  const p = walletOf(hero);
  const vip = object(p.vip);
  const until = typeof vip["until"] === "string" ? vip["until"] : null;
  const active = until !== null && Date.parse(until) > Date.now();
  const history = Array.isArray(p.history) ? (p.history as PremiumHistoryEntry[]) : [];
  return {
    balance:
      Number.isFinite(p.balance) && Number(p.balance) > 0 ? Math.floor(Number(p.balance)) : 0,
    vip: { level: active && Number.isInteger(vip["level"]) ? Number(vip["level"]) : 0, until },
    claimedToday: typeof p.claimed === "string" && p.claimed === todayKey(),
    history,
  };
}

/** The active VIP level straight from a save's server-owned wallet (0 when expired). */
export function premiumVipLevel(hero: unknown): number {
  return vipLevelFromPremium(walletOf(hero));
}

/** 1.05, 1.10 or 1.15 while VIP is active; 1 otherwise. Applied to battle XP only. */
export function vipXpMultiplier(hero: unknown): number {
  const level = premiumVipLevel(hero);
  return (1 + vipXpBonusPct(level) / 100) * surgeMultiplier(hero);
}

/** A Diamond XP Surge (server-owned `srv.premium.surgeUntil`) adds half again to battle XP for two hours. */
export const SURGE_MULT = 1.5;
export function surgeUntil(hero: unknown): number {
  const v = (hero as { srv?: { premium?: { surgeUntil?: string } } } | null)?.srv?.premium?.surgeUntil;
  const t = v ? Date.parse(v) : NaN;
  return Number.isFinite(t) ? t : 0;
}
export const surgeMultiplier = (hero: unknown, now = Date.now()) => (surgeUntil(hero) > now ? SURGE_MULT : 1);

/** Diamond speed-ups sold by the `awakening_boost` RPC; its SQL price table mirrors this one. */
export const BOOST_PRICES = { xp_surge: 165, shard_cache: 220, trial_reset: 55, stamina_refill: 88 } as const;
export type BoostKind = keyof typeof BOOST_PRICES;

export function vipDailyGold(hero: unknown): number {
  const level = premiumVipLevel(hero);
  return vipPerkEffective(level)?.dailyGold ?? 0;
}

export { VIP_DAYS, vipPerkFor };

export type { GemType, Mat };

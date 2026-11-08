import { object } from "./services-contract";
import type { GemType, Mat } from "./crafting";

/** Premium shop catalogue and wallet parsing.
 *
 *  The payment provider and the server-side purchase RPCs are not connected yet, so the whole
 *  shop is closed: every item shows "Coming soon" and no purchase path can credit Diamonds.
 *  The wallet only mirrors the server-owned `srv.premium` state — there is deliberately no
 *  client-side or dev/test wallet, so nothing in the app can mint Diamonds.
 *
 *  When checkout and the SQL purchase functions are wired, move the catalogue prices below into
 *  the matching RPCs as well — the server must stay authoritative for real money. */

export interface DiamondPack {
  id: string;
  name: string;
  /** Price shown to the player, in cents. */
  priceCents: number;
  diamonds: number;
  bonus: number;
  tag?: string;
}

/** Five money tiers: $10, $20, $30, $50 and $99.99. Packs are deliberately generous. */
export const DIAMOND_PACKS: DiamondPack[] = [
  { id: "pouch", name: "Diamond Pouch", priceCents: 999, diamonds: 1200, bonus: 0 },
  {
    id: "satchel",
    name: "Diamond Satchel",
    priceCents: 1999,
    diamonds: 2500,
    bonus: 200,
    tag: "Popular",
  },
  { id: "chest", name: "Diamond Chest", priceCents: 2999, diamonds: 4000, bonus: 400 },
  { id: "vault", name: "Diamond Vault", priceCents: 4999, diamonds: 7000, bonus: 800 },
  {
    id: "treasury",
    name: "Diamond Treasury",
    priceCents: 9999,
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

/** Gold bought with diamonds. Kept cheap relative to the diamond packs above. */
export const GOLD_PACKS: GoldPack[] = [
  { id: "pouch", name: "Gold Pouch", diamonds: 50, gold: 10000 },
  { id: "coffer", name: "Gold Coffer", diamonds: 220, gold: 50000 },
  { id: "royal", name: "Royal Treasury", diamonds: 750, gold: 200000 },
  { id: "imperial", name: "Imperial Treasury", diamonds: 2000, gold: 600000 },
];

export interface VipPlan {
  level: number;
  name: string;
  days: number;
  diamonds: number;
  dailyGold: number;
  /** Extra battle XP while the membership is active, in percent. */
  xpBonusPct: number;
  perks: string[];
}

/** VIP is its own membership: three tiers, sold separately from the gold and diamond packs. */
export const VIP_PLANS: VipPlan[] = [
  {
    level: 1,
    name: "Supporter",
    days: 7,
    diamonds: 99,
    dailyGold: 1500,
    xpBonusPct: 10,
    perks: ["+10% XP from every battle", "1,500 gold every day", "Supporter badge"],
  },
  {
    level: 2,
    name: "Adventurer",
    days: 15,
    diamonds: 249,
    dailyGold: 4000,
    xpBonusPct: 20,
    perks: ["+20% XP from every battle", "4,000 gold every day", "Adventurer nameplate"],
  },
  {
    level: 3,
    name: "Champion",
    days: 30,
    diamonds: 499,
    dailyGold: 8000,
    xpBonusPct: 35,
    perks: ["+35% XP from every battle", "8,000 gold every day", "Champion nameplate"],
  },
];

/** Old saves can carry the five-level VIP that predates this shop. Map its top tiers onto the
 *  current bonuses so an existing membership still works. */
export const vipPlanFor = (level: number) => VIP_PLANS.find((plan) => plan.level === level);

export const vipXpBonusPct = (level: number) => {
  const plan = vipPlanFor(level);
  if (plan) return plan.xpBonusPct;
  if (level >= 5) return 50;
  if (level >= 4) return 35;
  if (level >= 3) return 25;
  if (level >= 2) return 15;
  if (level >= 1) return 10;
  return 0;
};

/** One material offer: a single unit at the "small thing" price, or a bundle of five. */
export interface MaterialPrices {
  one: number;
  five: number;
}

/** The materials the diamond shop sells. Fate Stones are earned in battle and bought for gold at the
 *  Auction House, so they are deliberately not a diamond good. */
export type DiamondMat = Exclude<Mat, "fateStone">;

export const MATERIAL_PRICES: Record<DiamondMat, MaterialPrices> = {
  ore: { one: 5, five: 20 },
  hide: { one: 5, five: 20 },
  bloom: { one: 5, five: 20 },
  essence: { one: 10, five: 40 },
  fragment: { one: 10, five: 40 },
  crystal: { one: 10, five: 40 },
  starshard: { one: 25, five: 100 },
  sigil: { one: 25, five: 100 },
  enchantStone: { one: 30, five: 120 },
  bossCore: { one: 50, five: 200 },
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
  "enchantStone",
  "bossCore",
];

/** Stones: tier 1 is the 5-diamond "small thing"; tiers 2 and 3 stay affordable. */
export const GEM_TIER_PRICES = [5, 15, 40] as const;
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
    diamonds: 60,
    description: "Open it in the Armory for gold, Ember Ore and Armor Fragments.",
  },
  {
    kind: "gem",
    name: "Gem Chest",
    diamonds: 150,
    description: "Open it in the Armory for two cut gems, Soul Essence and an Arcane Crystal.",
  },
];

/** Kept for older saves and for the future server-side cosmetics catalogue; the test-mode shop
 *  focuses on goods, not appearances. */
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
    diamonds: 1200,
    kind: "cosmetic",
    description: "Exclusive radiant wing appearance",
  },
  {
    id: "outfit_royal",
    name: "Royal Outfit",
    diamonds: 900,
    kind: "cosmetic",
    description: "Exclusive regal character outfit",
  },
  {
    id: "aura_ember",
    name: "Ember Aura",
    diamonds: 600,
    kind: "cosmetic",
    description: "A smouldering aura surrounds your character",
  },
  {
    id: "frame_diamond",
    name: "Diamond Frame",
    diamonds: 800,
    kind: "cosmetic",
    description: "Prestigious portrait frame",
  },
  {
    id: "title_immortal",
    name: "Immortal Title",
    diamonds: 500,
    kind: "cosmetic",
    description: 'The "Immortal" title',
  },
  {
    id: "scroll_bundle",
    name: "War Scroll Bundle",
    diamonds: 400,
    kind: "scrolls",
    description: "5 Damage, 5 Defence and 5 Experience Scrolls",
  },
];

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

/** 1.10, 1.20 or 1.35 while VIP is active; 1 otherwise. Applied to battle XP only. */
export function vipXpMultiplier(hero: unknown): number {
  const { vip } = premiumState(hero);
  return 1 + vipXpBonusPct(vip.level) / 100;
}

export function vipDailyGold(hero: unknown): number {
  const { vip } = premiumState(hero);
  const plan = vipPlanFor(vip.level);
  if (plan) return plan.dailyGold;
  if (vip.level >= 5) return 25000;
  if (vip.level >= 4) return 12000;
  return 0;
}

export type { GemType, Mat };

import { addGem, addMats, GEM_MAX_TIER, type GemType, type Mat } from "./crafting";
import { addStones } from "./enchant";
import { addChests, type ChestKind } from "./chests";
import { BLITZ_GOLD_SHARE, BLITZ_RUNNING, blitzRunning, startBlitzRun } from "./blitz-run";
import { stageRewards, type Hero } from "./data";
import { greekDayStart } from "./events";

/**
 * Endless Conquest. Floors never stop scaling: each one is built from the shared
 * stageFoe/stageRewards factories, so the gate keeps going past any fixed cap.
 * `hero.spire` holds the frontier floor that is next fightable.
 */

/** Deepest floor the hero has already cleared. */
export const floorsCleared = (h: Pick<Hero, "spire">) => Math.max(0, h.spire - 1);

/** Conquest Tokens, earned on the floors and spent on the gate's material offers. */
export const conquestTokens = (h: Pick<Hero, "conquest">) => h.conquest?.tokens ?? 0;

/** Every floor's token payout carries this bump, so the Conquest Gate's own coin drops more often. */
export const CONQUEST_TOKEN_BONUS = 0.2;

/** Tokens one floor pays. Deeper floors pay more, so the gate keeps rewarding the climb. */
export const floorTokens = (floor: number) =>
  Math.max(1, Math.round((4 + Math.floor(floor / 5) + Math.floor(floor / 20)) * (1 + CONQUEST_TOKEN_BONUS)));

export function addConquestTokens(h: Hero, n: number) {
  h.conquest = { ...(h.conquest ?? {}), tokens: Math.max(0, conquestTokens(h) + n) };
}

/**
 * Rarity floor of a Conquest floor's drop, as a threshold on a 0-100 roll. The gate used to
 * guarantee Rare (blue) gear on every floor, which made it a blue-item faucet; most floors now
 * hand out Uncommon (green), a good slice gives plain Common (grey), and only the top slice keeps
 * the old Rare-or-better floor. Deeper rolls still climb through rollRarity as usual.
 * Returns 0 = Common, 1 = Uncommon, 2 = Rare.
 */
export function conquestDropFloor(roll = Math.random() * 100): number {
  return roll < 22 ? 0 : roll < 82 ? 1 : 2;
}

/** Share of a floor's Campaign XP the Conquest Gate pays (the old 30%, raised by 7%). */
export const CONQUEST_XP_RATE = 0.321;

/** Blitzes a hero may run each Greek day. The floors themselves are never rationed. */
export const BLITZ_PER_DAY = 3;

/** A hero's blitz allowance and Conquest Keys, saved with the conquest tokens. */
export interface BlitzState {
  conquest?: { tokens?: number; blitzDay?: string; blitzUsed?: number; keyDay?: string; keys?: number };
}

/* ---------------------------------------------------------------- Conquest Key */

/**
 * The Conquest Key doubles every reward the Conquest Gate pays for the rest of the Greek day:
 * the tokens and gold of a cleared floor and of a conquest blitz. Keys are bought for gold in the
 * Auction House shop and kept in the hero's pack, so the player decides *inside the gate* whether
 * to spend one now or keep it for a deeper climb — buying one never spends it. An activated key
 * expires at Greek midnight with the blitz allowance.
 */
export const CONQUEST_KEY_MULTIPLIER = 2;
/** Base gold price of a Conquest Key before the shop's own discount and the hero's level scaling. */
export const CONQUEST_KEY_GOLD = 45000;

/** Conquest Keys waiting in the hero's pack, unspent. */
export const conquestKeys = (h: Pick<Hero, "conquest">) =>
  Math.max(0, Math.floor(h.conquest?.keys ?? 0));

/** True while today's Conquest Key has been lit for the day. */
export const conquestKeyActive = (h: Pick<Hero, "conquest">, now = Date.now()) =>
  h.conquest?.keyDay === blitzDay(now);

/** The multiplier the gate's rewards pay right now: 2 with today's key, otherwise 1. */
export const conquestRewardMultiplier = (h: Pick<Hero, "conquest">, now = Date.now()) =>
  conquestKeyActive(h, now) ? CONQUEST_KEY_MULTIPLIER : 1;

/** Put one bought Conquest Key into the pack. */
export function addConquestKey(h: Hero) {
  h.conquest = { ...(h.conquest ?? {}), keys: conquestKeys(h) + 1 };
}

/** Spend one key from the pack: every gate reward pays ×2 until Greek midnight. Choosing not to
 *  call this is how a player keeps their keys for later. Returns an error message, or null. */
export function activateConquestKey(h: Hero, now = Date.now()): string | null {
  if (conquestKeyActive(h, now)) return "Today's Conquest Key is already lit — it lasts until Greek midnight.";
  if (conquestKeys(h) < 1) return "No Conquest Key in your pack — buy one in the Auction House shop.";
  h.conquest = { ...(h.conquest ?? {}), keyDay: blitzDay(now), keys: conquestKeys(h) - 1 };
  return null;
}

/** Greek day the blitz allowance is on, so the count resets at Greek midnight like the dailies. */
export const blitzDay = (now = Date.now()) => new Date(greekDayStart(now)).toISOString().slice(0, 10);

/** Blitzes already spent today. */
export function blitzesUsed(h: BlitzState, now = Date.now()) {
  const c = h.conquest;
  return c?.blitzDay === blitzDay(now) ? Math.max(0, Math.floor(c.blitzUsed ?? 0)) : 0;
}

/** Blitzes still available today. */
export const blitzesLeft = (h: BlitzState, now = Date.now()) => Math.max(0, BLITZ_PER_DAY - blitzesUsed(h, now));

/** Spend one of today's blitzes. */
export function spendBlitz(h: Hero, now = Date.now()) {
  h.conquest = { ...(h.conquest ?? {}), blitzDay: blitzDay(now), blitzUsed: blitzesUsed(h, now) + 1 };
}

/** Tokens a gem costs at the Conquest Gate: 25 for a level 1 gem of any family, then the tier
 *  climbs so buying socket power stays a real late-game sink. The gate takes no gold at all —
 *  Conquest Tokens are the only coin it deals in (see buyConquestGem). */
export const gemTokenPrice = (level: number) =>
  Math.round(25 * Math.pow(Math.max(1, Math.min(GEM_MAX_TIER, level)), 1.7));

/** Buy a gem of any family and level with Conquest Tokens. Returns an error message, or null on success. */
export function buyConquestGem(h: Hero, type: GemType, level: number): string | null {
  if (level < 1 || level > GEM_MAX_TIER) return "No such gem level";
  const cost = gemTokenPrice(level);
  if (conquestTokens(h) < cost) return `Not enough Conquest Tokens — ${cost} needed`;
  addConquestTokens(h, -cost);
  addGem(h, type, level);
  return null;
}

/** Equipment materials and chest items the Conquest Gate sells for tokens. */
export interface TokenOffer { id: string; mat?: Mat; qty: number; cost: number; chest?: ChestKind; name?: string; stone?: number }
export const TOKEN_OFFERS: TokenOffer[] = [
  { id: "goldchest", mat: "ore", qty: 0, cost: 90, chest: "gold", name: "Gold Chest" },
  { id: "gemchest", mat: "ore", qty: 0, cost: 260, chest: "gem", name: "Gem Chest" },
  { id: "ore", mat: "ore", qty: 10, cost: 60 },
  { id: "hide", mat: "hide", qty: 10, cost: 60 },
  { id: "bloom", mat: "bloom", qty: 5, cost: 75 },
  { id: "essence", mat: "essence", qty: 2, cost: 120 },
  { id: "fragment", mat: "fragment", qty: 2, cost: 150 },
  { id: "crystal", mat: "crystal", qty: 1, cost: 180 },
  { id: "enchantstone", stone: 2, qty: 2, cost: 240 },
  { id: "sigil", mat: "sigil", qty: 1, cost: 360 },
  { id: "starshard", mat: "starshard", qty: 1, cost: 450 },
  { id: "bossCore", mat: "bossCore", qty: 1, cost: 900 },
];

/** Buy one offer with tokens. Returns an error message, or null on success. */
export function buyTokenOffer(h: Hero, id: string): string | null {
  const o = TOKEN_OFFERS.find((x) => x.id === id);
  if (!o) return "Unknown offer";
  if (conquestTokens(h) < o.cost) return `Not enough Conquest Tokens — ${o.cost} needed`;
  addConquestTokens(h, -o.cost);
  if (o.chest) { addChests(h, o.chest); return null; }
  if (o.stone) addStones(h, o.stone, o.qty);
  else if (o.mat) addMats(h, { [o.mat]: o.qty });
  return null;
}

export interface BlitzResult { floors: number; gold: number; tokens: number }

/**
 * What blitzing floors 1..target pays in total, at `mult` times the base reward (the Conquest Key
 * pays 2×). The Conquest Gate pays no XP at all — every level is earned in the Campaign Gate.
 */
export function blitzRewards(target: number, mult = 1): BlitzResult {
  let gold = 0, tokens = 0;
  for (let f = 1; f <= target; f++) {
    const r = stageRewards(f, 2);
    gold += r.gold * mult; tokens += floorTokens(f) * mult;
  }
  return { floors: target, gold: Math.round(gold * BLITZ_GOLD_SHARE), tokens };
}

/** What clearing one floor pays right now, key included: its gold and tokens. */
export function conquestFloorRewards(floor: number, mult = 1) {
  return { gold: Math.round(stageRewards(floor, 2).gold * mult), tokens: floorTokens(floor) * mult };
}

/**
 * A blitz may only reach a floor the hero has already beaten, and only while today's
 * allowance lasts. Fighting the floors themselves is never limited.
 */
export function blitzBlocker(h: Pick<Hero, "spire" | "blitzRun"> & BlitzState, target: number, now = Date.now()): string | null {
  const cap = floorsCleared(h);
  if (cap < 1) return "Clear your first floor before blitzing — there is nothing to skip yet.";
  if (!Number.isFinite(target) || target < 1) return "Choose how many floors to blitz.";
  if (target > cap) return `You can blitz up to floor ${cap} — the deepest floor you have cleared.`;
  if (blitzRunning(h, now)) return BLITZ_RUNNING;
  if (blitzesLeft(h, now) < 1) return `No blitzes left today — ${BLITZ_PER_DAY} per day, back at Greek midnight. Floors themselves are unlimited.`;
  return null;
}

/** Send the hero out to auto-clear floors 1..target, spending one of today's blitzes. The run pays
 *  when it lands ten minutes later (see blitz-run.ts). Returns an error message, or null once it starts. */
export function blitz(h: Hero, target: number, now = Date.now()): string | null {
  const blocked = blitzBlocker(h, target, now);
  if (blocked) return blocked;
  // Today's Conquest Key doubles what the run banks (see conquestKeyActive).
  const rw = blitzRewards(target, conquestRewardMultiplier(h, now));
  spendBlitz(h, now);
  // The gate pays no XP: a conquest run lands with an empty XP purse (see blitz-run.ts).
  return startBlitzRun(h, { gate: "conquest", target, xp: 0, gold: rw.gold, tokens: rw.tokens }, now);
}

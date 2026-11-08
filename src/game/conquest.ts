import { addGem, addMats, GEM_MAX_TIER, type GemType, type Mat } from "./crafting";
import { addChests, type ChestKind } from "./chests";
import { BLITZ_RUNNING, blitzRunning, startBlitzRun } from "./blitz-run";
import { stageRewards, type Hero } from "./data";
import { greekDayStart } from "./events";
import { scaledGold } from "./gold";

/**
 * Endless Conquest. Floors never stop scaling: each one is built from the shared
 * stageFoe/stageRewards factories, so the gate keeps going past any fixed cap.
 * `hero.spire` holds the frontier floor that is next fightable.
 */

/** Deepest floor the hero has already cleared. */
export const floorsCleared = (h: Pick<Hero, "spire">) => Math.max(0, h.spire - 1);

/** Conquest Tokens, earned on the floors and spent on the gate's material offers. */
export const conquestTokens = (h: Pick<Hero, "conquest">) => h.conquest?.tokens ?? 0;

/** Tokens one floor pays. Deeper floors pay more, so the gate keeps rewarding the climb. */
export const floorTokens = (floor: number) => 4 + Math.floor(floor / 5) + Math.floor(floor / 20);

export function addConquestTokens(h: Hero, n: number) {
  h.conquest = { ...(h.conquest ?? {}), tokens: Math.max(0, conquestTokens(h) + n) };
}

/** Blitzes a hero may run each Greek day. The floors themselves are never rationed. */
export const BLITZ_PER_DAY = 3;

/** A hero's blitz allowance, saved with the conquest tokens. */
export interface BlitzState { conquest?: { tokens?: number; blitzDay?: string; blitzUsed?: number } }

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

/** Gold a gem costs in the Conquest store: 1,800 for a level 1 gem of any family, then the tier
 *  climbs steeply (level²) so buying socket power at the gate stays a real late-game sink.
 *  Scaled by hero level like every other gold price (see gold.ts). */
export const gemGoldPrice = (level: number, heroLevel = 1) => scaledGold(1800 * level * level, heroLevel);

/** Buy a gem of any family and level with gold at the Conquest Gate. Returns an error message, or null on success. */
export function buyConquestGem(h: Hero, type: GemType, level: number): string | null {
  if (level < 1 || level > GEM_MAX_TIER) return "No such gem level";
  const cost = gemGoldPrice(level, h.level);
  if (h.gold < cost) return `Not enough gold — ${cost} needed`;
  h.gold -= cost;
  addGem(h, type, level);
  return null;
}

/** Equipment materials and chest items the Conquest Gate sells for tokens. */
export interface TokenOffer { id: string; mat: Mat; qty: number; cost: number; chest?: ChestKind; name?: string }
export const TOKEN_OFFERS: TokenOffer[] = [
  { id: "goldchest", mat: "ore", qty: 0, cost: 90, chest: "gold", name: "Gold Chest" },
  { id: "gemchest", mat: "ore", qty: 0, cost: 260, chest: "gem", name: "Gem Chest" },
  { id: "ore", mat: "ore", qty: 10, cost: 60 },
  { id: "hide", mat: "hide", qty: 10, cost: 60 },
  { id: "bloom", mat: "bloom", qty: 5, cost: 75 },
  { id: "essence", mat: "essence", qty: 2, cost: 120 },
  { id: "fragment", mat: "fragment", qty: 2, cost: 150 },
  { id: "crystal", mat: "crystal", qty: 1, cost: 180 },
  { id: "enchantstone", mat: "enchantStone", qty: 2, cost: 240 },
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
  addMats(h, { [o.mat]: o.qty });
  return null;
}

export interface BlitzResult { floors: number; gold: number; tokens: number }

/** What a blitz to `target` pays in total: those floors' gold and tokens. The Conquest Gate pays
 *  no XP at all — every level is earned in the Campaign Gate. */
export function blitzRewards(target: number): BlitzResult {
  let gold = 0, tokens = 0;
  for (let f = 1; f <= target; f++) {
    const r = stageRewards(f, 2);
    gold += r.gold; tokens += floorTokens(f);
  }
  return { floors: target, gold, tokens };
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
  const rw = blitzRewards(target);
  spendBlitz(h, now);
  // The gate pays no XP: a conquest run lands with an empty XP purse (see blitz-run.ts).
  return startBlitzRun(h, { gate: "conquest", target, xp: 0, gold: rw.gold, tokens: rw.tokens }, now);
}

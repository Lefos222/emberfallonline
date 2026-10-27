import { addMats, type Mat } from "./crafting";
import { stageRewards, type Hero } from "./data";
import { grant } from "./logic";
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

/**
 * Equipment materials and items the Conquest Gate sells for tokens. All four levels of
 * Enhancement Stone are on offer, priced by level so the deepest floors fund the deepest stones.
 */
export interface TokenOffer { id: string; mat: Mat; qty: number; cost: number; gold?: number; name?: string }
export const TOKEN_OFFERS: TokenOffer[] = [
  { id: "goldchest", mat: "ore", qty: 0, cost: 30, gold: 5000, name: "Gold Chest" },
  { id: "ore", mat: "ore", qty: 10, cost: 20 },
  { id: "hide", mat: "hide", qty: 10, cost: 20 },
  { id: "bloom", mat: "bloom", qty: 5, cost: 25 },
  { id: "essence", mat: "essence", qty: 2, cost: 40 },
  { id: "fragment", mat: "fragment", qty: 2, cost: 50 },
  { id: "crystal", mat: "crystal", qty: 1, cost: 60 },
  { id: "enhstone1", mat: "enhStone1", qty: 3, cost: 80 },
  { id: "enhstone2", mat: "enhStone2", qty: 2, cost: 220 },
  { id: "enhstone3", mat: "enhStone3", qty: 1, cost: 520 },
  { id: "enhstone4", mat: "enhStone4", qty: 1, cost: 1100 },
  { id: "sigil", mat: "sigil", qty: 1, cost: 120 },
  { id: "starshard", mat: "starshard", qty: 1, cost: 150 },
  { id: "bossCore", mat: "bossCore", qty: 1, cost: 300 },
];

/** Buy one offer with tokens. Returns an error message, or null on success. */
export function buyTokenOffer(h: Hero, id: string): string | null {
  const o = TOKEN_OFFERS.find((x) => x.id === id);
  if (!o) return "Unknown offer";
  if (conquestTokens(h) < o.cost) return `Not enough Conquest Tokens — ${o.cost} needed`;
  addConquestTokens(h, -o.cost);
  if (o.gold) { h.gold += o.gold; return null; }
  addMats(h, { [o.mat]: o.qty });
  return null;
}

export interface BlitzResult { floors: number; xp: number; gold: number; tokens: number }

/** What a blitz to `target` pays in total: the same rewards those floors pay when fought. */
export function blitzRewards(target: number): BlitzResult {
  let xp = 0, gold = 0, tokens = 0;
  for (let f = 1; f <= target; f++) {
    const r = stageRewards(f, 2);
    xp += r.xp; gold += r.gold; tokens += floorTokens(f);
  }
  return { floors: target, xp, gold, tokens };
}

/**
 * A blitz may only reach a floor the hero has already beaten, and only while today's
 * allowance lasts. Fighting the floors themselves is never limited.
 */
export function blitzBlocker(h: Pick<Hero, "spire"> & BlitzState, target: number, now = Date.now()): string | null {
  const cap = floorsCleared(h);
  if (cap < 1) return "Clear your first floor before blitzing — there is nothing to skip yet.";
  if (!Number.isFinite(target) || target < 1) return "Choose how many floors to blitz.";
  if (target > cap) return `You can blitz up to floor ${cap} — the deepest floor you have cleared.`;
  if (blitzesLeft(h, now) < 1) return `No blitzes left today — ${BLITZ_PER_DAY} per day, back at Greek midnight. Floors themselves are unlimited.`;
  return null;
}

/** Instantly auto-clear floors 1..target using one of today's blitzes. Returns an error message, or null on success. */
export function blitz(h: Hero, target: number, now = Date.now()): string | null {
  const blocked = blitzBlocker(h, target, now);
  if (blocked) return blocked;
  const rw = blitzRewards(target);
  spendBlitz(h, now);
  grant(h, rw.xp, rw.gold);
  addConquestTokens(h, rw.tokens);
  return null;
}

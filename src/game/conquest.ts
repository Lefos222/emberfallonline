import { addMats, type Mat } from "./crafting";
import { stageRewards, type Hero } from "./data";
import { grant } from "./logic";

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
  h.conquest = { tokens: Math.max(0, conquestTokens(h) + n) };
}

/** Equipment materials the Conquest Gate sells for tokens. */
export interface TokenOffer { id: string; mat: Mat; qty: number; cost: number }
export const TOKEN_OFFERS: TokenOffer[] = [
  { id: "ore", mat: "ore", qty: 10, cost: 20 },
  { id: "hide", mat: "hide", qty: 10, cost: 20 },
  { id: "bloom", mat: "bloom", qty: 5, cost: 25 },
  { id: "essence", mat: "essence", qty: 2, cost: 40 },
  { id: "fragment", mat: "fragment", qty: 2, cost: 50 },
  { id: "crystal", mat: "crystal", qty: 1, cost: 60 },
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

/** A blitz may only reach a floor the hero has already beaten. */
export function blitzBlocker(h: Pick<Hero, "spire">, target: number): string | null {
  const cap = floorsCleared(h);
  if (cap < 1) return "Clear your first floor before blitzing — there is nothing to skip yet.";
  if (!Number.isFinite(target) || target < 1) return "Choose how many floors to blitz.";
  if (target > cap) return `You can blitz up to floor ${cap} — the deepest floor you have cleared.`;
  return null;
}

/** Instantly auto-clear floors 1..target. Returns an error message, or null on success. */
export function blitz(h: Hero, target: number): string | null {
  const blocked = blitzBlocker(h, target);
  if (blocked) return blocked;
  const rw = blitzRewards(target);
  grant(h, rw.xp, rw.gold);
  addConquestTokens(h, rw.tokens);
  return null;
}

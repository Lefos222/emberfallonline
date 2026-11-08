import strengthArt from "@/assets/potion-strength.png";
import staminaArt from "@/assets/potion-stamina.png";
import wardingArt from "@/assets/potion-warding.svg";
import fortuneArt from "@/assets/potion-fortune.svg";
import sorceryArt from "@/assets/potion-sorcery.svg";
import type { BonusFx } from "./crafting";
import { scaledGold } from "./gold";
import {
  POTION_PER_DAY,
  POTION_STAMINA,
  addPotions,
  drinkStaminaPotion,
  potionCount,
  potionUsesLeft,
} from "./stamina";

/**
 * Consumable potions. They live in the bag as stack counts (not gear), are drunk from the HUD's
 * potion pouch, and are sold at the Auction House's shop for gold.
 *
 * The Stamina Potion (`hero.staminaPotions`) keeps its own saved field for old saves; every other
 * potion lives in `hero.potions`. Elixirs are timed battle buffs stored in `hero.potionBuffs` and
 * join the shared stat pipeline through `potionFx` (see data.computeStats).
 */
export type PotionId = "stamina" | "strength" | "warding" | "fortune" | "sorcery";

/** The saved fields every potion helper reads and writes. */
export interface PotionState {
  staminaPotions?: number;
  potions?: Record<string, number>;
  stamina?: { day?: string; used?: number; potions?: number };
  potionBuffs?: Record<string, number>;
}

export interface PotionDef {
  id: PotionId;
  name: string;
  art: string;
  desc: string;
  /** Gold price in the Auction House shop (base, scaled by the hero's level). */
  shop: number;
  /** Battle buff this elixir grants for `minutes`. */
  buff?: Partial<BonusFx>;
  minutes?: number;
}

export const POTIONS: Record<PotionId, PotionDef> = {
  stamina: {
    id: "stamina",
    name: "Stamina Potion",
    art: staminaArt,
    desc: `Restores ${POTION_STAMINA} stamina. At most ${POTION_PER_DAY} a day.`,
    shop: 21000,
  },
  strength: {
    id: "strength",
    name: "Elixir of Strength",
    art: strengthArt,
    desc: "Red battle elixir: +20% physical attack for 30 minutes.",
    shop: 40000,
    buff: { atkPct: 20 },
    minutes: 30,
  },
  warding: {
    id: "warding",
    name: "Elixir of Warding",
    art: wardingArt,
    desc: "Steel-blue elixir: +25% physical and magic defence for 30 minutes.",
    shop: 36000,
    buff: { defPct: 25, mdefPct: 25 },
    minutes: 30,
  },
  fortune: {
    id: "fortune",
    name: "Draught of Fortune",
    art: fortuneArt,
    desc: "Amber draught: +8% crit chance and +15% crit damage for 30 minutes.",
    shop: 52000,
    buff: { crit: 8, critDmg: 15 },
    minutes: 30,
  },
  sorcery: {
    id: "sorcery",
    name: "Elixir of Sorcery",
    art: sorceryArt,
    desc: "Violet elixir: +20% magic attack for 30 minutes.",
    shop: 36000,
    buff: { matkPct: 20 },
    minutes: 30,
  },
};

export const POTION_IDS = Object.keys(POTIONS) as PotionId[];

/** Potions a hero carries. Stamina Potions keep their own legacy field. */
export const potionHeld = (h: PotionState, id: PotionId) =>
  id === "stamina" ? potionCount(h) : Math.max(0, Math.floor(h.potions?.[id] ?? 0));

/** Add potions to the bag. */
export function addPotion(h: PotionState, id: PotionId, n = 1) {
  if (n <= 0) return;
  if (id === "stamina") { addPotions(h, n); return; }
  h.potions = { ...(h.potions ?? {}), [id]: potionHeld(h, id) + Math.floor(n) };
}

/** Buffs still running: potion id → when it expires. */
export function activePotionBuffs(h: Pick<PotionState, "potionBuffs">, now = Date.now()) {
  const out: Record<string, number> = {};
  for (const [id, until] of Object.entries(h.potionBuffs ?? {})) if (until > now) out[id] = until;
  return out;
}

/** Every battle bonus the hero's running elixirs grant. */
export function potionFx(h: Pick<PotionState, "potionBuffs">, now = Date.now()): BonusFx {
  const out: BonusFx = {
    atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0,
    acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0, loot: 0, goldScale: 0,
  };
  for (const id of Object.keys(activePotionBuffs(h, now)) as PotionId[]) {
    const buff = POTIONS[id]?.buff;
    if (!buff) continue;
    for (const [k, v] of Object.entries(buff) as [keyof BonusFx, number][]) out[k] += v;
  }
  return out;
}

/** Minutes left on an elixir, rounded up. */
export const potionBuffLeft = (h: Pick<PotionState, "potionBuffs">, id: PotionId, now = Date.now()) => {
  const until = h.potionBuffs?.[id];
  return until && until > now ? Math.ceil((until - now) / 60000) : 0;
};

/** Why a potion can't be used right now, or null when it can. */
export function potionBlocker(h: PotionState, id: PotionId, now = Date.now()): string | null {
  if (potionHeld(h, id) <= 0) return `No ${POTIONS[id].name}`;
  if (id === "stamina" && potionUsesLeft(h, now) <= 0) {
    return `You have already drunk ${POTION_PER_DAY} Stamina Potions today.`;
  }
  return null;
}

/**
 * Use one potion. Stamina Potions top the bar up; elixirs start (or refresh) their battle buff.
 * Returns an error string, or null on success.
 */
export function takePotion(h: PotionState, id: PotionId, now = Date.now()): string | null {
  const blocked = potionBlocker(h, id, now);
  if (blocked) return blocked;
  if (id === "stamina") return drinkStaminaPotion(h, now);
  const def = POTIONS[id];
  h.potions = { ...(h.potions ?? {}), [id]: potionHeld(h, id) - 1 };
  h.potionBuffs = { ...(h.potionBuffs ?? {}), [id]: now + (def.minutes ?? 30) * 60_000 };
  return null;
}

/** Shop price of a potion for a hero of this level. */
export const potionPrice = (id: PotionId, level = 1) => scaledGold(POTIONS[id].shop, level);

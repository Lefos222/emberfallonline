import type { GearRecord, HeroClass, Item } from "./data";

/**
 * Looted-armour appearance.
 *
 * Every chest piece rolls a look from its own id, so a drop keeps the armour it
 * was looted with for as long as the piece exists — independent of the hero's
 * level and of the Synthesis sets (those keep their own painted art in
 * `synthesis.ts`).
 */
export const LOOK_COUNT = 8;

/** The armour look of one piece: its id hashed into one of LOOK_COUNT variants. */
export function lookOf(item: Pick<Item, "id">): number {
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) hash = (Math.imul(hash, 31) + item.id.charCodeAt(i)) >>> 0;
  return hash % LOOK_COUNT;
}

/** The look of the worn chest piece, or null when the hero wears none. */
export function gearLook(h: { equipment?: GearRecord }): number | null {
  const chest = h.equipment?.armour;
  return chest ? lookOf(chest) : null;
}

const ART = import.meta.glob("../assets/armour/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

/** Painted armour sheet for one class, gender and look. */
export function armourArt(cls: HeroClass, gender: "male" | "female", look: number): string | undefined {
  const index = ((Math.trunc(look) % LOOK_COUNT) + LOOK_COUNT) % LOOK_COUNT;
  const base = `../assets/armour/${cls}-${gender}-${index}.webp`;
  return ART[base] ?? Object.entries(ART).find(([k]) => k.endsWith(`/${cls}-${gender}-${index}.webp`))?.[1];
}

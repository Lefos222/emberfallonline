import type { GearRecord, HeroClass, Hero, Item } from "./data";
import { appearanceTier } from "./synthesis";

/**
 * Looted armour appearance.
 *
 * A chest piece's look is derived from its own id, so every drop rolls one of
 * `LOOK_COUNT` painted variants of its class sheet and keeps it for as long as
 * the piece exists — the appearance always follows the equipment, never the level.
 */

/** How many painted variants a class sheet carries (see src/assets/armour). */
export const LOOK_COUNT = 8;

const VARIANT_ART = import.meta.glob("../assets/armour/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

/** The stable look of one piece, or null when it has no id. */
export function lookOf(item: Pick<Item, "id"> | null | undefined): number | null {
  if (!item?.id) return null;
  let hash = 0;
  for (let i = 0; i < item.id.length; i += 1) hash = (Math.imul(hash, 31) + item.id.charCodeAt(i)) >>> 0;
  return hash % LOOK_COUNT;
}

/** The look the hero shows: the worn chest piece's own variant. */
export function gearLook(h: { equipment?: GearRecord }): number | null {
  return lookOf(h.equipment?.armour);
}

/**
 * What the hero's body shows. A worn synthesis set keeps its own painted set art; only
 * looted or forged chest pieces roll a look, so the two never fight over the hero.
 */
export function heroAppearance(h: Pick<Hero, "equipment" | "synth">): { synth: number | null; look: number | null } {
  const synth = appearanceTier(h);
  return synth ? { synth, look: null } : { synth: null, look: gearLook(h) };
}

/**
 * The painted sheet of one class, gender and look. Sheets are optional: a variant
 * whose art has not shipped resolves to undefined and the model keeps the class art.
 */
export function armourArt(cls: HeroClass, gender: "male" | "female", look: number): string | undefined {
  if (!Number.isFinite(look) || look < 0 || look >= LOOK_COUNT) return undefined;
  const base = `../assets/armour/${cls}-${gender}-${Math.floor(look)}.webp`;
  return VARIANT_ART[base] ?? Object.entries(VARIANT_ART).find(([k]) => k.endsWith(`/${cls}-${gender}-${Math.floor(look)}.webp`))?.[1];
}

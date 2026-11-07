import type { GearRecord, HeroClass, Hero, Item } from "./data";
import { appearanceTier } from "./synthesis";

/**
 * Looted armour appearance.
 *
 * A chest piece's look is derived from its own id, so every drop rolls one of the
 * painted variants of its class sheet and keeps it for as long as the piece exists —
 * the appearance always follows the equipment, never the level. The pool is read from
 * the artwork itself (see src/assets/armour), so shipping another painted outfit simply
 * widens what future drops can roll.
 *
 * The armour folder holds both art updates: the current outfits and the original
 * pre-merge outfits kept under `armour/legacy/`. Both are in the pool, so old and new
 * drops can wear either era; synthesis sets stay on their own separate sheet.
 */

const VARIANT_ART = import.meta.glob("../assets/armour/**/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

type Gender = "male" | "female";

interface Variant { url: string; index: number; legacy: boolean }

/** Every painted variant each class and gender can roll, current art first then legacy art. */
const VARIANTS: Record<string, string[]> = (() => {
  const groups: Record<string, Variant[]> = {};
  for (const [key, url] of Object.entries(VARIANT_ART)) {
    const m = /(warrior|mage|archer)-(male|female)-(\d+)\.webp$/.exec(key);
    if (!m) continue;
    const id = `${m[1]}-${m[2]}`;
    (groups[id] ??= []).push({ url, index: Number(m[3]), legacy: /\/legacy\//.test(key) });
  }
  const out: Record<string, string[]> = {};
  for (const [id, list] of Object.entries(groups)) {
    out[id] = list
      .sort((a, b) => Number(a.legacy) - Number(b.legacy) || a.index - b.index)
      .map((v) => v.url);
  }
  return out;
})();

/** How many painted variants each class and gender carries, including restored legacy outfits. */
export function lookCount(cls: HeroClass, gender: Gender): number {
  return VARIANTS[`${cls}-${gender}`]?.length ?? 0;
}

/** The stable look of one piece, or null when it has no id. */
export function lookOf(
  item: Pick<Item, "id" | "cls"> | null | undefined,
  gender: Gender,
): number | null {
  if (!item?.id) return null;
  const count = lookCount(item.cls, gender);
  if (count < 1) return null;
  let hash = 0;
  for (let i = 0; i < item.id.length; i += 1)
    hash = (Math.imul(hash, 31) + item.id.charCodeAt(i)) >>> 0;
  return hash % count;
}

/** The look the hero shows: the worn chest piece's own variant. */
export function gearLook(h: { equipment?: GearRecord }, gender: Gender): number | null {
  return lookOf(h.equipment?.armour, gender);
}

/**
 * What the hero's body shows. A worn synthesis set keeps its own painted set art; only
 * looted or forged chest pieces roll a look, so the two never fight over the hero.
 */
export function heroAppearance(
  h: Pick<Hero, "equipment" | "synth">,
  gender: Gender,
): { synth: number | null; look: number | null } {
  const synth = appearanceTier(h);
  return synth ? { synth, look: null } : { synth: null, look: gearLook(h, gender) };
}

/**
 * The painted sheet of one class, gender and look. Sheets are optional: a variant
 * whose art has not shipped resolves to undefined and the model keeps the class art.
 */
export function armourArt(cls: HeroClass, gender: Gender, look: number): string | undefined {
  if (!Number.isFinite(look) || look < 0) return undefined;
  return VARIANTS[`${cls}-${gender}`]?.[Math.floor(look)];
}

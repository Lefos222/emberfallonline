import type { HeroClass, Item } from '../data';
import { tierOf, type Tier } from './palette';

/**
 * Four looks per class and slot. A piece's look follows its power band, so the
 * chestplate and the weapon a hero wears always describe the same material set:
 * iron → ember → moon → ancestral.
 */
export const GEAR_LOOKS: Record<HeroClass, { chest: string[]; weapon: string[] }> = {
  warrior: {
    chest: ['Ironclad Plate', 'Emberforged Plate', 'Moonsteel Plate', 'Ancestral Plate'],
    weapon: ['Iron Blade', 'Ember Blade', 'Moonsteel Blade', 'Ancestral Greatblade'],
  },
  mage: {
    chest: ['Apprentice Robes', 'Emberweave Robes', 'Moonveil Robes', 'Archon Robes'],
    weapon: ['Oak Wand', 'Cinder Staff', 'Moonstone Rod', 'Archon Scepter'],
  },
  archer: {
    chest: ['Thornhide Jerkin', 'Embersting Jerkin', 'Moonstrider Jerkin', 'Ancestral Jerkin'],
    weapon: ['Hunting Bow', 'Ember Bow', 'Moonbow', 'Ancestral Longbow'],
  },
};

/** Which of the four looks a piece of gear shows. Unworn (or no gear) falls back to iron. */
export function gearLook(it?: Pick<Item, 'rarity' | 'anc'> | null): Tier {
  if (!it) return 0;
  if (it.anc || it.rarity >= 6) return 3;
  if (it.rarity >= 4) return 2;
  if (it.rarity >= 2) return 1;
  return 0;
}

export const lookName = (cls: HeroClass, slot: 'chest' | 'weapon', look: number) =>
  GEAR_LOOKS[cls][slot][tierOf(look)];

/** Looks a hero is currently wearing, for every place a character is drawn. */
export function wornLooks(equipment?: { armour?: Item | null; weapon?: Item | null } | null) {
  return { chest: gearLook(equipment?.armour), weapon: gearLook(equipment?.weapon) };
}

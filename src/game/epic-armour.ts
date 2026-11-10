import type { Mat } from "./crafting";

/**
 * Epic Armours: four forged armour sets beside Synthesis whose pieces carry a large stat
 * multiplier (`Item.epic`, read by `itemStats`). Each set needs its own collectable materials,
 * each of which drops from one place only (see MATS in crafting.ts).
 * Kept free of runtime imports so data.ts can read the multipliers without a cycle.
 */
export type EpicSlot = "helmet" | "armour" | "boots" | "belt";
export const EPIC_SLOTS: readonly EpicSlot[] = ["helmet", "armour", "boots", "belt"];

export interface EpicSet {
  id: string;
  name: string;
  minLevel: number;
  /** Stat multiplier every piece of the set carries on top of its rarity. */
  mult: number;
  gold: number;
  mats: Partial<Record<Mat, number>>;
  desc: string;
}

export const EPIC_SETS: readonly EpicSet[] = [
  { id: "wyrmguard", name: "Wyrmguard", minLevel: 30, mult: 1.5, gold: 30000, mats: { ore: 300, fragment: 40, wyrmBone: 20 }, desc: "Bone-plated armour from dungeon wyrms: +50% stats." },
  { id: "moonwarden", name: "Moonwarden", minLevel: 60, mult: 1.7, gold: 90000, mats: { ore: 600, wyrmBone: 25, moonsilver: 25, frostCrystal: 10 }, desc: "Moonsilver mail grown on the farm: +70% stats." },
  { id: "shadowmantle", name: "Shadowmantle", minLevel: 90, mult: 1.9, gold: 200000, mats: { essence: 300, moonsilver: 20, shadowSilk: 30, voidCrystal: 10 }, desc: "Relic-warden silk woven into plate: +90% stats." },
  { id: "phoenixborn", name: "Phoenixborn", minLevel: 120, mult: 2.2, gold: 400000, mats: { bossCore: 40, shadowSilk: 25, phoenixAsh: 30, sunCrystal: 12 }, desc: "Armour that burns with undying ash: +120% stats." },
];

export const epicSet = (id?: string | null) => EPIC_SETS.find((s) => s.id === id) ?? null;
export const epicMult = (id?: string | null) => epicSet(id)?.mult ?? 1;

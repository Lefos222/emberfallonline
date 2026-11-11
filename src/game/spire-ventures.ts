import { stageFoe, type Foe } from "./data";
import { BESTIARY, enemySprite, type SpriteRect } from "./world";
import type { Mat } from "./crafting";

/**
 * Spire ventures: the solo activities of the Spire beside its party dungeons. Warden Hunts are
 * three named guardians that rotate each UTC day (each beaten once a day); a Rift Path is a daily
 * five-room route of ambushes, treasure, shrines and a keeper, cleared room by room. Both are
 * derived from the UTC day, so the same day shows the same wardens and rooms on every device.
 */
export const spireDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export interface VentureState { day: string; wardens: string[]; room: number; failed: boolean; shrine?: "might" | "fortune" }

export function ventureOf(v: VentureState | undefined, now = Date.now()): VentureState {
  const day = spireDay(now);
  return v && v.day === day ? v : { day, wardens: [], room: 0, failed: false };
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const rng = (seed: string) => {
  let x = hash(seed) || 1;
  return () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) ^ Math.imul(x ^ (x >>> 13), 3266489909)), (x >>> 0) / 4294967296);
};

export interface Warden { id: string; name: string; twist: string; hp: number; atk: number; def: number; mats: Partial<Record<Mat, number>> }
export const WARDENS: Warden[] = [
  { id: "bulwark", name: "The Iron Bulwark", twist: "Huge health, slow blows", hp: 2.2, atk: 0.8, def: 1.6, mats: { ore: 12, frostCrystal: 2 } },
  { id: "reaver", name: "The Crimson Reaver", twist: "Hits hard, breaks easily", hp: 0.9, atk: 1.7, def: 0.8, mats: { essence: 4, dragonScale: 1 } },
  { id: "warden", name: "The Hollow Warden", twist: "Balanced and relentless", hp: 1.5, atk: 1.25, def: 1.2, mats: { starshard: 6, bossCore: 1 } },
  { id: "weaver", name: "The Shadow Weaver", twist: "Evasive and sharp", hp: 1.1, atk: 1.4, def: 1, mats: { shadowSilk: 2, crystal: 6 } },
  { id: "colossus", name: "The Ember Colossus", twist: "A wall of fire", hp: 2.6, atk: 1.1, def: 1.3, mats: { phoenixAsh: 1, hide: 10 } },
  { id: "seer", name: "The Moon Seer", twist: "Glass cannon of starlight", hp: 0.8, atk: 1.9, def: 0.7, mats: { moonsilver: 2, bloom: 10 } },
];

/** The three wardens on watch today. */
export function todaysWardens(now = Date.now()): Warden[] {
  const r = rng(`wardens:${spireDay(now)}`);
  const pool = [...WARDENS];
  const out: Warden[] = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

export function wardenFoe(w: Warden, level: number): Foe & { sprite: SpriteRect } {
  const f = stageFoe(Math.max(12, level + 6), 1.5);
  const r = rng(`sprite:${w.id}`);
  const row = Math.floor(r() * BESTIARY.length), col = 6 + Math.floor(r() * 6);
  return { ...f, name: w.name, boss: true, hp: Math.round(f.hp * w.hp), atk: Math.round(f.atk * w.atk), def: Math.round(f.def * w.def), sprite: enemySprite(row, col) };
}
export const wardenGold = (level: number) => 400 + level * 40;
export const wardenXp = (level: number) => level * 90;

export type RoomKind = "ambush" | "treasure" | "shrine" | "keeper";
export const RIFT_ROOMS = 5;

/** Today's rift: four varied rooms and a keeper at the end. */
export function riftRooms(now = Date.now()): RoomKind[] {
  const r = rng(`rift:${spireDay(now)}`);
  const mid: RoomKind[] = ["ambush", "ambush", "treasure", "shrine"];
  for (let i = mid.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mid[i], mid[j]] = [mid[j], mid[i]]; }
  return [...mid, "keeper"];
}

export function riftFoe(kind: "ambush" | "keeper", room: number, level: number): Foe & { sprite: SpriteRect } {
  const keeper = kind === "keeper";
  const f = stageFoe(Math.max(11, level + 3 + room), keeper ? 1.7 : 1.2 + room * 0.08);
  const r = rng(`riftfoe:${spireDay()}:${room}`);
  const row = Math.floor(r() * BESTIARY.length), col = Math.floor(r() * 12);
  return { ...f, boss: keeper, name: keeper ? `Rift Keeper ${BESTIARY[row][col]}` : `Rift ${BESTIARY[row][col]}`, sprite: enemySprite(row, col) };
}
/** Gold for clearing a rift room; the Shrine of Fortune adds a quarter to every later room. */
export const riftGold = (level: number, room: number, kind: RoomKind, fortune: boolean) =>
  Math.round((kind === "keeper" ? 900 : kind === "treasure" ? 500 : 250) * (1 + level / 25) * (1 + room * 0.1) * (fortune ? 1.25 : 1));
export const riftTreasure: Partial<Record<Mat, number>> = { hide: 6, bloom: 5, crystal: 4, ore: 8 };
export const riftKeeperMats: Partial<Record<Mat, number>> = { bossCore: 1, starshard: 5, voidCrystal: 1 };

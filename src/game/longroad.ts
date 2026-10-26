import { ENEMIES, invCap, MAX_LEVEL, xpToNext, type Foe, type Hero, type Item, type Skill } from './data';
import { CAMPAIGN_STAGES, type SpriteRect } from './world';
import { BOSS_ROSTER, ENEMY_ROSTER } from './bestiary';
import type { Mat } from './crafting';

export const ROAD_START = 91;
/** Ten stages per region; after these twelve, new circuits raise all level bands by 120. */
export const ROAD_REGIONS = [
  { name: 'Ashen March', row: 0, level: 91, color: '#d88950' },
  { name: 'Widowroot Expanse', row: 0, level: 101, color: '#77ad68' },
  { name: 'Gravesong Coast', row: 1, level: 111, color: '#9aa8ce' },
  { name: 'Pale Sovereignty', row: 1, level: 121, color: '#b89cdd' },
  { name: 'Obsidian Stair', row: 2, level: 131, color: '#d6a06c' },
  { name: 'Rimefire Reach', row: 2, level: 141, color: '#80cddd' },
  { name: 'Veil of Knives', row: 3, level: 151, color: '#cf85ac' },
  { name: 'Chaos Meridian', row: 3, level: 161, color: '#a58ae0' },
  { name: 'Titan Ossuary', row: 4, level: 171, color: '#c5b495' },
  { name: 'Wyrmglass Sea', row: 4, level: 181, color: '#68bfc5' },
  { name: 'Infernal Horizon', row: 3, level: 191, color: '#e38467' },
  { name: 'Last Ember Beyond', row: 4, level: 201, color: '#e3bc59' },
] as const;
const integer = (n: number, min: number) => {
  if (!Number.isSafeInteger(n) || n < min) throw new RangeError(`Expected integer >= ${min}`);
  return n;
};
export function roadRegion(stage: number) {
  const offset = integer(stage, ROAD_START) - ROAD_START;
  const circuit = Math.floor(offset / 120);
  const region = ROAD_REGIONS[Math.floor(offset / 10) % 12] ?? ROAD_REGIONS[0];
  return { ...region, circuit: circuit + 1, minLevel: region.level + circuit * 120, maxLevel: region.level + circuit * 120 + 9 };
}
export type RoadFoe = Foe & { sprite: SpriteRect; elite: boolean; ability: string; skills: Skill[]; rosterId: string };
/** Polynomial scaling avoids the campaign's exponential wall; each circuit remains harder indefinitely. */
export function roadFoe(stage: number): RoadFoe {
  const r = roadRegion(stage);
  const offset = stage - ROAD_START;
  const boss = stage % 10 === 0;
  const elite = stage % 10 === 5;
  const scale = (1 + offset / 40) ** 2 * (boss ? 2 : elite ? 1.3 : 1);
  const roster = boss ? BOSS_ROSTER : ENEMY_ROSTER;
  const cursor = boss ? Math.floor((stage - 100) / 10) : offset;
  const entry = roster[cursor % roster.length];
  if (!entry) throw new Error('The encounter roster is empty');
  const ability = ['Cinder Strike', 'Soul Siphon', 'Shattering Blow', 'Chaos Precision', 'Wyrm Fury'][r.row] ?? 'Cinder Strike';
  return { name: `${elite ? 'Elite ' : ''}${entry.name}`, img: ENEMIES.demon.img, rosterId: entry.id,
    level: stage, hp: Math.round(90000000 * scale), atk: Math.round(800000 * scale), def: Math.round(300000 * scale),
    crit: Math.min(40, 15 + offset / 20), dodge: Math.min(20, 5 + offset / 40), boss, elite,
    sprite: entry.sprite, ability,
    skills: [{ id: 'road-hit', name: 'Attack', mult: 1, cd: 0, icon: 'sword' },
      { id: `road-${r.row}`, name: ability, mult: 1.5 + r.row * 0.1, cd: 3, icon: 'flame', ...(r.row === 1 ? { heal: 0.1 } : {}) }],
  };
}
export const SPIRE_CIRCUIT_WAVES = 100;
export function spireCircuit(wave: number) {
  integer(wave, 1);
  return { circuit: Math.floor((wave - 1) / SPIRE_CIRCUIT_WAVES) + 1, floor: (wave - 1) % SPIRE_CIRCUIT_WAVES + 1 };
}
/** Rotate encounters using the saved wave. Each circuit advances the base level band;
 * the existing within-circuit multipliers remain bounded without a permanent plateau. */
export function spireWave(foeLevel: number, wave: number): RoadFoe {
  const { circuit, floor } = spireCircuit(wave);
  const f = roadFoe(integer(foeLevel, ROAD_START) + (circuit - 1) * 120 + floor - 1);
  return { ...f, name: `Spire ${wave} · ${f.name}`, hp: Math.round(f.hp * Math.min(8, 1 + (wave - 1) * 0.08)),
    atk: Math.round(f.atk * Math.min(4, 1 + (wave - 1) * 0.04)), def: Math.round(f.def * Math.min(3, 1 + (wave - 1) * 0.02)) };
}
export interface RoadReward { gold: number; xp: number; materials: Partial<Record<Mat, number>>; items: number; itemLevel: number; rarity: number; firstClear: boolean }
export function roadRewards(stage: number, firstClear: boolean): RoadReward {
  integer(stage, ROAD_START);
  const n = stage - 90;
  return { gold: firstClear ? 5000 + n * 250 : 0, xp: firstClear ? 10000 + n * 500 : 0,
    materials: firstClear ? { ore: 10 + n, fragment: stage % 10 === 0 ? 5 : 1, ...(stage % 10 === 0 ? { bossCore: 1 } : {}) } : {},
    items: firstClear && stage % 10 === 0 ? 1 : 0, itemLevel: stage, rarity: 2, firstClear };
}
export function spireRewards(wave: number, firstClear = true): RoadReward {
  integer(wave, 1);
  return { gold: firstClear ? 2000 + wave * 200 : 0, xp: firstClear ? 4000 + wave * 400 : 0,
    materials: firstClear ? { essence: 1 + Math.floor(wave / 10), ...(wave % 10 === 0 ? { starshard: 3 } : {}) } : {},
    items: 0, itemLevel: 90 + wave, rarity: 0, firstClear };
}
/** UTC midnight daily; Monday 00:00 UTC weekly. Accept timestamps/Date, or a week index. */
const mod = (n: number, length: number) => ((n % length) + length) % length;
export const dayIndex = (date: Date | number) => Math.floor(Number(date) / 86400000);
export const roadWeekIndex = (date: Date | number) => Math.floor((dayIndex(date) + 3) / 7);
export const dailyRoad = (date: Date | number) => ROAD_REGIONS[mod(dayIndex(date), ROAD_REGIONS.length)] ?? ROAD_REGIONS[0];
export const weeklyRoad = (week: number) => ROAD_REGIONS[mod(integer(week, 0), ROAD_REGIONS.length)] ?? ROAD_REGIONS[0];
export const roadState = (h: Hero) => h.road ?? { stage: ROAD_START, wave: 1, best: 0, cleared: 90 };
export const canEnterRoad = (h: Hero) => h.stage > CAMPAIGN_STAGES;
export const canEnterSpire = (h: Hero) => canEnterRoad(h) && roadState(h).cleared >= ROAD_START;
export type RoadClear = { mode: 'road' | 'spire'; value: number; xpMultiplier?: number };
/** Atomic, immutable payout + high-water marks: out-of-order and replay callbacks pay nothing. */
export function recordRoadClear(hero: Hero, clear: RoadClear): Hero {
  const s = roadState(hero);
  const road = clear.mode === 'road';
  if (!(road ? canEnterRoad(hero) : canEnterSpire(hero)) || clear.value !== (road ? s.stage : s.wave) || clear.value <= (road ? s.cleared : s.best)) return hero;
  const rw = road ? roadRewards(clear.value, true) : spireRewards(clear.value);
  const mats = { ...hero.mats };
  const overflow = [...(hero.overflow ?? [])];
  const h: Hero = { ...hero, inventory: [...hero.inventory], overflow, mats, road: { ...s } };
  h.gold += rw.gold;
  h.xp += Math.round(rw.xp * (clear.xpMultiplier === 1.2 ? 1.2 : 1));
  while (h.xp >= xpToNext(h)) { h.xp -= xpToNext(h); if (h.level < MAX_LEVEL) h.level++; else h.paragon++; h.insight = (h.insight ?? 0) + 1; }
  for (const [mat, count] of Object.entries(rw.materials) as [Mat, number][]) mats[mat] = (mats[mat] ?? 0) + count;
  if (road) h.road = { ...s, stage: clear.value + 1, cleared: clear.value };
  else h.road = { ...s, wave: clear.value + 1, best: clear.value };
  // Deterministic weapon trophy; Rare+ armour remains exclusively craftable.
  if (rw.items) {
    const item: Item = { id: `longroad-${clear.value}-${hero.cls}`, cls: hero.cls, slot: 'weapon', name: `Roadwarden's Trophy ${clear.value}`, ilvl: rw.itemLevel, rarity: rw.rarity, icon: 0, enh: 0 };
    if (h.inventory.length >= invCap(h)) overflow.unshift(item); else h.inventory.unshift(item);
  }
  return h;
}

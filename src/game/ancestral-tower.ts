import { stageFoe, type Foe, type Hero } from "./data";
import { TIER_BOSSES, type TierBossId, type SpriteRect } from "./world";
import { addMats, type Mat } from "./crafting";
import { grant } from "./logic";

/** Minimum battle rating to enter the Ancestral Tower. */
export const ANC_BR_MIN = 100_000;

/** Bosses rotate through the four tier bosses, scaling with each floor. */
const BOSS_ROTATION: TierBossId[] = ["aegis", "gorefiend", "tenebris", "vulkan"];

export interface AncFloorDef {
  floor: number;
  boss: TierBossId;
  mult: number;
  minBR: number;
  drops: Partial<Record<Mat, number>>;
  gold: number;
  xp: number;
}

/** Build a floor definition: bosses scale, BR requirement rises, drops get richer. */
export function ancFloorDef(floor: number): AncFloorDef {
  const boss = BOSS_ROTATION[(floor - 1) % BOSS_ROTATION.length];
  const mult = 2.0 + floor * 0.15;
  const minBR = ANC_BR_MIN + (floor - 1) * 25_000;
  const drops: Partial<Record<Mat, number>> = { ancientBone: 2 + Math.floor(floor / 2) };
  if (floor >= 2) drops.voidShard = 1 + Math.floor((floor - 1) / 2);
  if (floor >= 3) drops.emberHeart = 1 + Math.floor((floor - 2) / 3);
  if (floor >= 4) drops.bossCore = Math.floor(floor / 2);
  if (floor >= 5) drops.starshard = Math.floor(floor / 3);
  return {
    floor, boss, mult, minBR, drops,
    gold: Math.round(50_000 * Math.pow(1.25, floor - 1)),
    xp: Math.round(40_000 * Math.pow(1.25, floor - 1)),
  };
}

/** The next floor the hero may challenge. */
export const ancTowerFloor = (h: Hero) => h.ancTower?.floor ?? 1;
/** Deepest floor cleared. */
export const ancTowerBest = (h: Hero) => h.ancTower?.bestFloor ?? 0;

/** Can the hero fight this floor? Needs the questline done and 100k+ BR. */
export function ancTowerBlocker(h: Hero, floor: number, br: number): string | null {
  if (!h.anc?.done) return "Complete the Ancestral Sanctuary questline first";
  if (floor !== ancTowerFloor(h)) return floor < ancTowerFloor(h) ? "Already cleared" : `Clear floor ${floor - 1} first`;
  if (br < ANC_BR_MIN) return `Requires ${ANC_BR_MIN.toLocaleString()} Battle Rating (you have ${Math.round(br).toLocaleString()})`;
  return null;
}

/** The foe for an ancestral tower floor. */
export function ancTowerFoe(floor: number, heroLevel: number): Foe & { sprite: SpriteRect } {
  const def = ancFloorDef(floor);
  const base = stageFoe(Math.max(80, heroLevel), def.mult);
  const boss = TIER_BOSSES[def.boss];
  return { ...base, name: `${boss.name} · Floor ${floor}`, level: Math.max(80, heroLevel), boss: true, sprite: boss.sprite };
}

/** Advance the hero's tower progress, grant gold/XP and drop materials. Returns reward summary for display. */
export function completeAncFloor(h: Hero, floor: number) {
  const def = ancFloorDef(floor);
  grant(h, def.xp, def.gold);
  addMats(h, def.drops);
  h.ancTower = { floor: floor + 1, bestFloor: Math.max(ancTowerBest(h), floor) };
  return def;
}

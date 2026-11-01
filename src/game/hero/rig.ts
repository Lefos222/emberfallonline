import type { HeroClass } from "../data";

/** A joint in the 300×400 hero frame. */
export interface Pt {
  x: number;
  y: number;
}

/**
 * One battle-ready stance per class. The old art stood square-on with one arm
 * raised; each hero now leans into a 3/4 fighting pose: the knight holds the
 * blade up and across the body, the mage plants the staff and lifts a casting
 * hand, the archer presents the bow and reaches for an arrow.
 */
export interface Pose {
  /** Where the weapon group is placed and rotated (grip at the group origin). */
  weaponAt: string;
  weaponHand: Pt;
  weaponElbow: Pt;
  weaponShoulder: Pt;
  freeHand: Pt;
  freeElbow: Pt;
  freeShoulder: Pt;
  /** Front leg reads on the screen-right, back leg on the left. */
  hipF: Pt;
  kneeF: Pt;
  ankleF: Pt;
  hipB: Pt;
  kneeB: Pt;
  ankleB: Pt;
  /** Whole-figure tilt in degrees. */
  lean: number;
  head: Pt;
}

const KNIGHT: Pose = {
  weaponAt: "translate(192 198) rotate(26)",
  weaponShoulder: { x: 186, y: 152 },
  weaponElbow: { x: 208, y: 168 },
  weaponHand: { x: 192, y: 198 },
  freeShoulder: { x: 120, y: 150 },
  freeElbow: { x: 104, y: 180 },
  freeHand: { x: 120, y: 210 },
  hipF: { x: 164, y: 220 },
  kneeF: { x: 186, y: 284 },
  ankleF: { x: 200, y: 348 },
  hipB: { x: 138, y: 220 },
  kneeB: { x: 114, y: 284 },
  ankleB: { x: 106, y: 350 },
  lean: -1.4,
  head: { x: 152, y: 84 },
};

const MAGE: Pose = {
  weaponAt: "translate(98 200) rotate(-5)",
  weaponShoulder: { x: 118, y: 150 },
  weaponElbow: { x: 100, y: 174 },
  weaponHand: { x: 98, y: 200 },
  freeShoulder: { x: 186, y: 150 },
  freeElbow: { x: 206, y: 166 },
  freeHand: { x: 198, y: 136 },
  hipF: { x: 162, y: 220 },
  kneeF: { x: 178, y: 288 },
  ankleF: { x: 184, y: 352 },
  hipB: { x: 140, y: 220 },
  kneeB: { x: 124, y: 288 },
  ankleB: { x: 118, y: 352 },
  lean: 1.2,
  head: { x: 152, y: 84 },
};

const ARCHER: Pose = {
  weaponAt: "translate(86 182) rotate(-8)",
  weaponShoulder: { x: 120, y: 152 },
  weaponElbow: { x: 100, y: 164 },
  weaponHand: { x: 86, y: 182 },
  freeShoulder: { x: 186, y: 152 },
  freeElbow: { x: 204, y: 172 },
  freeHand: { x: 168, y: 196 },
  hipF: { x: 164, y: 218 },
  kneeF: { x: 184, y: 282 },
  ankleF: { x: 198, y: 348 },
  hipB: { x: 138, y: 218 },
  kneeB: { x: 122, y: 286 },
  ankleB: { x: 112, y: 350 },
  lean: -0.8,
  head: { x: 152, y: 84 },
};

export const POSE: Record<HeroClass, Pose> = { warrior: KNIGHT, mage: MAGE, archer: ARCHER };

/** Points along a limb, bowed slightly so arms and legs never read as sticks. */
export function bow(a: Pt, b: Pt, bend: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: mx - (dy / len) * bend, y: my + (dx / len) * bend };
}

export const path = (a: Pt, c: Pt, b: Pt) => `M${a.x} ${a.y}Q${c.x} ${c.y} ${b.x} ${b.y}`;

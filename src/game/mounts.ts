import { scaledGold } from "./gold";
import { matCount, type BonusFx, type Mat, zeroFx } from "./crafting";

/**
 * Mounts: permanent stat bonuses from the Stable. Each mount can be upgraded
 * with gold and materials, raising its bonuses. Only one mount is "active"
 * but all owned mounts contribute their base bonus — the active one gets a
 * larger share. Feeds into computeStats like drills and guild skills.
 */

export interface Mount {
  id: string;
  name: string;
  desc: string;
  /** Level required to unlock this mount. */
  req: number;
  /** Base stat bonuses at level 1. */
  fx: Partial<BonusFx>;
  /** Upgrade cost: gold base + materials per level. */
  goldBase: number;
  mats: Partial<Record<Mat, number>>;
  max: number;
}

export const MOUNTS: Mount[] = [
  { id: "warhorse", name: "Iron Warhorse", desc: "A stalwart steed, the first companion of every knight.", req: 5, fx: { hpPct: 3, defPct: 2 }, goldBase: 2000, mats: { ore: 20, hide: 10 }, max: 20 },
  { id: "wolf", name: "Dire Wolf", desc: "A fierce hunter bred for the charge.", req: 15, fx: { atkPct: 3, acc: 1 }, goldBase: 5000, mats: { ore: 40, hide: 25 }, max: 20 },
  { id: "panther", name: "Shadow Panther", desc: "Silent and deadly, striking from the dark.", req: 25, fx: { atkPct: 2, crit: 1, dodge: 1 }, goldBase: 12000, mats: { ore: 60, essence: 10, hide: 30 }, max: 20 },
  { id: "griffin", name: "Storm Griffin", desc: "Wings of thunder carry you above the fray.", req: 35, fx: { atkPct: 3, hpPct: 3, acc: 1 }, goldBase: 30000, mats: { ore: 100, essence: 25, starshard: 10 }, max: 20 },
  { id: "drake", name: "Ember Drake", desc: "A young dragon, still growing into its fire.", req: 45, fx: { atkPct: 4, crit: 1.5, pen: 1 }, goldBase: 80000, mats: { ore: 200, essence: 50, bossCore: 10 }, max: 20 },
  { id: "unicorn", name: "Dawn Unicorn", desc: "Pure light made flesh, mending as it rides.", req: 55, fx: { hpPct: 6, defPct: 4, heal: 3 }, goldBase: 200000, mats: { ore: 300, essence: 80, starshard: 30, crystal: 20 }, max: 20 },
  { id: "wyvern", name: "Void Wyvern", desc: "An ancient predator from the rift between worlds.", req: 65, fx: { atkPct: 5, critDmg: 6, pen: 1.5, acc: 1.5 }, goldBase: 500000, mats: { ore: 500, essence: 150, bossCore: 30, starshard: 60 }, max: 20 },
  { id: "phoenix", name: "Eternal Phoenix", desc: "Reborn from its own ashes, blazing with renewal.", req: 75, fx: { atkPct: 6, hpPct: 6, crit: 2, critDmg: 8, heal: 5 }, goldBase: 1200000, mats: { ore: 800, essence: 250, bossCore: 50, starshard: 100, crystal: 50 }, max: 20 },
];

export const MOUNT_UNLOCK_LEVEL = 5;

/** Mount level for a hero (0 = not owned). */
export const mountLevel = (h: { mounts?: Record<string, number> }, id: string) => h.mounts?.[id] ?? 0;

/** The active mount id. */
export const activeMount = (h: { mount?: string }) => h.mount ?? null;

/** Whether a mount is unlocked. */
export const ownsMount = (h: { mounts?: Record<string, number> }, id: string) => mountLevel(h, id) > 0;

/** Upgrade cost for the next level of a mount. */
export function mountUpgradeCost(m: Mount, level: number, heroLevel = 1) {
  return {
    gold: scaledGold(m.goldBase * Math.pow(level + 1, 1.5), heroLevel),
    mats: Object.fromEntries(Object.entries(m.mats).map(([k, v]) => [k, Math.ceil((v ?? 0) * (level + 1))])) as Partial<Record<Mat, number>>,
  };
}

/** Initial unlock cost for a mount (first level). */
export function mountUnlockCost(m: Mount, heroLevel = 1) {
  return mountUpgradeCost(m, 0, heroLevel);
}

/** Why a mount can't be unlocked or upgraded, or null when allowed. */
export function mountBlocker(h: { level: number; gold: number; mounts?: Record<string, number>; mats?: Partial<Record<Mat, number>> }, id: string): string | null {
  const m = MOUNTS.find((x) => x.id === id);
  if (!m) return "Unknown mount";
  const lvl = mountLevel(h, id);
  if (lvl >= m.max) return "Max level";
  if (lvl === 0 && h.level < m.req) return `Requires level ${m.req}`;
  const cost = mountUpgradeCost(m, lvl, h.level);
  if (h.gold < cost.gold) return "Not enough gold";
  for (const [k, v] of Object.entries(cost.mats) as [Mat, number][]) {
    if (matCount(h, k) < v) return `Need ${v} ${k}`;
  }
  return null;
}

/** Unlock or upgrade a mount. Returns error or null on success. */
export function upgradeMount(h: { level: number; gold: number; mount?: string; mounts?: Record<string, number>; mats?: Partial<Record<Mat, number>> }, id: string): string | null {
  const blocked = mountBlocker(h, id);
  if (blocked) return blocked;
  const m = MOUNTS.find((x) => x.id === id)!;
  const lvl = mountLevel(h, id);
  const cost = mountUpgradeCost(m, lvl, h.level);
  h.gold -= cost.gold;
  h.mats = { ...(h.mats ?? {}) };
  for (const [k, v] of Object.entries(cost.mats) as [Mat, number][]) {
    h.mats[k] = (h.mats[k] ?? 0) - v;
  }
  h.mounts = { ...(h.mounts ?? {}), [id]: lvl + 1 };
  if (!h.mount) h.mount = id; // auto-activate first mount
  return null;
}

/** Set the active mount. */
export function setActiveMount(h: { mount?: string }, id: string | null) {
  h.mount = id ?? undefined;
}

/** Combat bonus from all owned mounts — the active mount contributes double. */
export function mountFx(h: { mount?: string; mounts?: Record<string, number> }): BonusFx {
  const out = zeroFx();
  if (!h.mounts) return out;
  const active = h.mount;
  for (const m of MOUNTS) {
    const lvl = mountLevel(h, m.id);
    if (lvl <= 0) continue;
    const mult = m.id === active ? 2 : 1;
    for (const [k, v] of Object.entries(m.fx) as [keyof BonusFx, number][]) {
      out[k] += (v ?? 0) * lvl * mult;
    }
  }
  return out;
}

/** Total BR contribution from mounts (for display). */
export const mountPower = (h: { mount?: string; mounts?: Record<string, number> }) => {
  const fx = mountFx(h);
  return Math.round((fx.atkPct + fx.matkPct) * 10 + (fx.defPct + fx.mdefPct) * 8 + fx.hpPct * 6 + fx.crit * 20 + fx.critDmg * 5);
};

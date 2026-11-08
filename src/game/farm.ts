import type { Hero } from "./data";

/**
 * The Farm: the castle's farming destination, opened from the tree beside the Campaign Gate.
 *
 * Progression is deliberately small and self-contained: the Farm has its own level (1-16),
 * fed only by Farm XP from harvested XP Seeds, and every level permanently unlocks one more
 * plot of the eighteen the fields hold. Gold Seeds are the gold side of the same choice.
 *
 * All seeds, prices, durations and rewards live in the tables below, so the whole economy of
 * the Farm can be tuned from here. Growing is timestamp-based (`plantedAt` / `readyAt` stored on
 * the hero save), so a crop keeps growing while the player is offline and survives a refresh.
 */

export type SeedKind = "gold" | "xp";

export const FARM_MAX_LEVEL = 16;
export const FARM_TOTAL_SLOTS = 18;
/** The first three plots are tilled from the start; every Farm Level adds one more. */
export const FARM_STARTING_SLOTS = 3;

/** Farm Level for a hero, clamped to the real ladder. */
export const farmLevel = (h: Pick<Hero, "farm">) =>
  Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(h.farm?.level ?? 1)));

/** Plots unlocked at a Farm Level: 3 at level 1, one more per level, all 18 at level 16. */
export const slotsForLevel = (level: number) =>
  Math.min(FARM_TOTAL_SLOTS, FARM_STARTING_SLOTS + Math.max(0, Math.floor(level) - 1));

/** The Farm Level that opens a plot (plot 0-2 need none). */
export const unlockLevelForSlot = (index: number) =>
  index < FARM_STARTING_SLOTS ? 1 : Math.min(FARM_MAX_LEVEL, index - FARM_STARTING_SLOTS + 2);

/**
 * Farm XP needed to leave each level, indexed by the current level (1-15). The opening levels are
 * a handful of seeds; the last ones are a long-term project worth a month of casual play.
 */
export const FARM_XP_STEPS: readonly number[] = [
  120, 220, 360, 560, 820, 1150, 1550, 2050, 2700, 3500, 4500, 5800, 7400, 9400, 12000,
];

/** Farm XP the next level costs; 0 at the top of the ladder. */
export const farmXpToNext = (level: number) =>
  level >= FARM_MAX_LEVEL ? 0 : FARM_XP_STEPS[Math.max(0, Math.min(FARM_XP_STEPS.length - 1, level - 1))]!;

/** The hero's Farm XP inside the current level. */
export const farmXp = (h: Pick<Hero, "farm">) => Math.max(0, Math.floor(h.farm?.xp ?? 0));

/** Share of the way to the next Farm Level, 0-1 (1 at the top). */
export const farmProgress = (h: Pick<Hero, "farm">) => {
  if (farmLevel(h) >= FARM_MAX_LEVEL) return 1;
  return Math.min(1, farmXp(h) / Math.max(1, farmXpToNext(farmLevel(h))));
};

// ---------- Seeds ----------

/** Gold Seed price at each Farm Level: 200 at level 1, +320 a level, 5,000 at level 16. */
export const GOLD_SEED_PRICES: readonly number[] = Array.from({ length: FARM_MAX_LEVEL }, (_, i) => 200 + i * 320);

/** XP Seed price at each tier. They cost a little gold and pay only Farm XP. */
export const XP_SEED_PRICES: readonly number[] = [
  150, 240, 350, 480, 640, 830, 1050, 1300, 1600, 1950, 2350, 2800, 3300, 3850, 4500, 5200,
];

/** How long each seed takes to grow, in minutes. Deeper seeds take longer to ripen. */
export const goldSeedMinutes = (tier: number) => 20 + 5 * (Math.max(1, tier) - 1);
export const xpSeedMinutes = (tier: number) => 20 + 4 * (Math.max(1, tier) - 1);

/** Gold Seed prices are the table above; XP Seeds have their own ladder. */
export const seedPrice = (kind: SeedKind, tier: number) => {
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  return kind === "gold" ? GOLD_SEED_PRICES[t - 1]! : XP_SEED_PRICES[t - 1]!;
};

/**
 * A Gold Seed pays 30% more than it cost, so farming is worth the walk to the fields without
 * minting gold faster than the castle's sinks can absorb it.
 */
export const goldSeedReward = (tier: number) => Math.round(seedPrice("gold", tier) * 1.3);

/**
 * An XP Seed pays 42% of the Farm XP its own level needs, so one seed is never a whole level and
 * reaching the next one always takes a few harvests — more the deeper the ladder goes. The top
 * tier (which can only be planted at level 16) pays on the deepest step of the ladder.
 */
export const xpSeedReward = (tier: number) => {
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  const step = FARM_XP_STEPS[t - 1] ?? FARM_XP_STEPS[FARM_XP_STEPS.length - 1]!;
  return Math.round(step * 0.42);
};

/** The harvest a seed pays, in its own currency. */
export const seedReward = (kind: SeedKind, tier: number) =>
  kind === "gold" ? goldSeedReward(tier) : xpSeedReward(tier);

/** Growing time of a seed in milliseconds. */
export const seedDurationMs = (kind: SeedKind, tier: number) =>
  (kind === "gold" ? goldSeedMinutes(tier) : xpSeedMinutes(tier)) * 60_000;

export const seedName = (kind: SeedKind, tier: number) =>
  `${kind === "gold" ? "Gold" : "XP"} Seed · Lv ${Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)))}`;

/** Pouch key for a seed: "gold:3" / "xp:5". */
export const seedKey = (kind: SeedKind, tier: number) => `${kind}:${Math.max(1, Math.floor(tier))}`;

// ---------- Saved farm state ----------

export interface FarmCrop {
  kind: SeedKind;
  tier: number;
  /** Epoch milliseconds when the seed went into the soil. */
  plantedAt: number;
  /** Epoch milliseconds when the crop is ready; growth continues while offline. */
  readyAt: number;
}

export interface FarmState {
  level?: number;
  xp?: number;
  /** Eighteen plots; `null` is an empty (or still locked) plot. */
  slots?: (FarmCrop | null)[];
  /** Seeds bought from the shop and not yet planted, keyed "gold:tier" / "xp:tier". */
  seeds?: Record<string, number>;
}

/** A brand-new farm: level 1, no XP, eighteen plots of which three are tilled. */
export function newFarm(): Required<FarmState> {
  return { level: 1, xp: 0, slots: Array.from({ length: FARM_TOTAL_SLOTS }, () => null), seeds: {} };
}

/** The hero's farm, creating or repairing it in place when the save predates the fields. */
export function ensureFarm(h: Hero): Required<FarmState> {
  const current = h.farm ?? {};
  const slots = Array.from({ length: FARM_TOTAL_SLOTS }, (_, i) => current.slots?.[i] ?? null);
  const farm: Required<FarmState> = {
    level: Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(current.level ?? 1))),
    xp: Math.max(0, Math.floor(current.xp ?? 0)),
    slots,
    seeds: { ...(current.seeds ?? {}) },
  };
  h.farm = farm;
  return farm;
}

/** Normalize a farm from an older save without touching anything else on the hero. */
export function normalizeFarm(h: Hero) {
  ensureFarm(h);
}

/** An empty plot the current Farm Level has tilled. */
export const isSlotUnlocked = (h: Pick<Hero, "farm">, index: number) => index < slotsForLevel(farmLevel(h));

/** The crop in a plot, or null when it is empty (or locked). */
export const cropAt = (h: Pick<Hero, "farm">, index: number): FarmCrop | null => h.farm?.slots?.[index] ?? null;

/** Seeds of one kind the hero is carrying. */
export const seedCount = (h: Pick<Hero, "farm">, kind: SeedKind, tier: number) =>
  Math.max(0, Math.floor(h.farm?.seeds?.[seedKey(kind, tier)] ?? 0));

/** Every seed in the pouch, lowest tier first, for the pack list. */
export function heldSeeds(h: Pick<Hero, "farm">): { kind: SeedKind; tier: number; count: number }[] {
  const out: { kind: SeedKind; tier: number; count: number }[] = [];
  for (const kind of ["gold", "xp"] as const) {
    for (let tier = 1; tier <= FARM_MAX_LEVEL; tier += 1) {
      const count = seedCount(h, kind, tier);
      if (count > 0) out.push({ kind, tier, count });
    }
  }
  return out;
}

/** Buy seeds into the pouch. Returns an error string, or null on success. */
export function buySeed(h: Hero, kind: SeedKind, tier: number, qty = 1): string | null {
  const farm = ensureFarm(h);
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  if (t > farm.level) return `Farm level ${t} needed`;
  const count = Math.max(1, Math.floor(qty));
  const total = seedPrice(kind, t) * count;
  if (h.gold < total) return `Not enough gold — ${total.toLocaleString()} needed`;
  h.gold -= total;
  const key = seedKey(kind, t);
  farm.seeds[key] = (farm.seeds[key] ?? 0) + count;
  return null;
}

/** Plant a seed in a plot. Uses a pouch seed when one is held, otherwise buys it on the spot. */
export function plantSeed(h: Hero, index: number, kind: SeedKind, tier: number, now = Date.now()): string | null {
  const farm = ensureFarm(h);
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  if (index < 0 || index >= FARM_TOTAL_SLOTS) return "Unknown plot";
  if (index >= slotsForLevel(farm.level)) return `Farm level ${unlockLevelForSlot(index)} needed for that plot`;
  if (farm.slots[index]) return "That plot is already planted";
  if (t > farm.level) return `Farm level ${t} needed for that seed`;
  const key = seedKey(kind, t);
  if ((farm.seeds[key] ?? 0) > 0) {
    farm.seeds[key] = (farm.seeds[key] ?? 0) - 1;
  } else {
    const price = seedPrice(kind, t);
    if (h.gold < price) return `Not enough gold — ${price.toLocaleString()} needed`;
    h.gold -= price;
  }
  farm.slots[index] = { kind, tier: t, plantedAt: now, readyAt: now + seedDurationMs(kind, t) };
  return null;
}

export interface HarvestResult {
  gold: number;
  xp: number;
  /** Farm Levels gained by this harvest (normally 0 or 1). */
  levels: number;
}

/** Add Farm XP, carrying the excess over, and report how many levels it bought. */
export function addFarmXp(h: Hero, xp: number): number {
  const farm = ensureFarm(h);
  if (farm.level >= FARM_MAX_LEVEL) return 0;
  farm.xp += Math.max(0, Math.floor(xp));
  let gained = 0;
  while (farm.level < FARM_MAX_LEVEL && farm.xp >= farmXpToNext(farm.level)) {
    farm.xp -= farmXpToNext(farm.level);
    farm.level += 1;
    gained += 1;
  }
  if (farm.level >= FARM_MAX_LEVEL) farm.xp = 0;
  return gained;
}

/** Harvest one ripe plot. Returns null when the plot is empty or still growing (so no double harvest). */
export function harvestSlot(h: Hero, index: number, now = Date.now()): HarvestResult | null {
  const farm = ensureFarm(h);
  const crop = farm.slots[index];
  if (!crop) return null;
  if (now < crop.readyAt) return null;
  farm.slots[index] = null;
  const gold = crop.kind === "gold" ? goldSeedReward(crop.tier) : 0;
  const xp = crop.kind === "xp" ? xpSeedReward(crop.tier) : 0;
  if (gold > 0) h.gold += gold;
  const levels = xp > 0 ? addFarmXp(h, xp) : 0;
  return { gold, xp, levels };
}

/** Harvest every ripe plot at once, skipping anything still growing. */
export function harvestAll(h: Hero, now = Date.now()): HarvestResult & { crops: number } {
  const total = { gold: 0, xp: 0, levels: 0, crops: 0 };
  for (let i = 0; i < FARM_TOTAL_SLOTS; i += 1) {
    const got = harvestSlot(h, i, now);
    if (!got) continue;
    total.gold += got.gold;
    total.xp += got.xp;
    total.levels += got.levels;
    total.crops += 1;
  }
  return total;
}

/** Plots whose crop has finished growing. */
export function readyCount(h: Pick<Hero, "farm">, now = Date.now()) {
  let n = 0;
  for (let i = 0; i < FARM_TOTAL_SLOTS; i += 1) {
    const crop = cropAt(h, i);
    if (crop && now >= crop.readyAt) n += 1;
  }
  return n;
}

/** Growing progress of one plot, 0-1. */
export function cropProgress(crop: FarmCrop, now = Date.now()) {
  const span = Math.max(1, crop.readyAt - crop.plantedAt);
  return Math.max(0, Math.min(1, (now - crop.plantedAt) / span));
}

/** "1h 05m" / "12:34" / "Ready" for a plot's remaining time. */
export function timeLeft(crop: FarmCrop, now = Date.now()) {
  const left = crop.readyAt - now;
  if (left <= 0) return "Ready";
  const mins = Math.ceil(left / 60_000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  const secs = Math.ceil(left / 1000);
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

/** A seed's growing time as words, for the shop and the picker. */
export function durationLabel(kind: SeedKind, tier: number) {
  const mins = kind === "gold" ? goldSeedMinutes(tier) : xpSeedMinutes(tier);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim();
  return `${mins} min`;
}

import type { Hero } from "./data";
import { locValues } from "./i18n";

/**
 * The Farm: the castle's farming destination, opened from the red tree beside the Campaign Gate.
 *
 * Progression is deliberately small and self-contained: the Farm has its own level (1-16),
 * fed only by Farm XP, and every level permanently unlocks one more plot of the sixteen the
 * fields hold — one plot at level 1, all sixteen at level 16. Gold Seeds are the gold side of
 * the same choice, and the Bloodoak in the middle of the fields pays both every half hour.
 *
 * All seeds, prices, durations and rewards live in the tables below, so the whole economy of
 * the Farm can be tuned from here. Growing is timestamp-based (`plantedAt` / `readyAt` stored on
 * the hero save), so a crop keeps growing while the player is offline and survives a refresh.
 */

export type SeedKind = "gold" | "xp" | "ember" | "moon" | "frost" | "sun" | "blood" | "star";

/** Every seed kind, in shop / pouch order. */
export const SEED_KINDS: readonly SeedKind[] = ["gold", "xp", "ember", "moon", "frost", "sun", "blood", "star"];

/** Farm Level each seed kind first appears at. */
export const SEED_UNLOCK: Record<SeedKind, number> = { gold: 1, xp: 1, ember: 1, moon: 1, frost: 6, sun: 10, blood: 14, star: 20 };

/** Display names for each seed kind. */
export const SEED_LABELS: Record<SeedKind, string> = locValues({
  gold: "Gold",
  xp: "XP",
  ember: "Emberbloom",
  moon: "Moonroot",
  frost: "Frostberry",
  sun: "Sunwheat",
  blood: "Bloodvine",
  star: "Starbloom",
});

export const FARM_MAX_LEVEL = 30;
export const FARM_TOTAL_SLOTS = 20;
/** Farm Mastery switches on at this Farm Level. */
export const FARM_MASTERY_LEVEL = 16;
/**
 * Farm Mastery: once all sixteen plots are tilled (Farm Level 16) every gold and Farm XP payout
 * the fields and the Bloodoak make is worth this much more, so a finished farm keeps paying.
 */
export const FARM_MASTERY_BONUS = 0.2;
/** One plot is tilled from the start; every Farm Level adds one more, so level = plots. */
export const FARM_STARTING_SLOTS = 1;

const validKind = (kind: SeedKind) => SEED_KINDS.includes(kind);
const validTier = (tier: number) => Number.isInteger(tier) && tier >= 1 && tier <= FARM_MAX_LEVEL;
const validSlot = (index: number) =>
  Number.isInteger(index) && index >= 0 && index < FARM_TOTAL_SLOTS;
const safeWhole = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? Math.floor(value) : fallback;

/** Farm Level for a hero, clamped to the real ladder. */
export const farmLevel = (h: Pick<Hero, "farm">) =>
  Math.max(1, Math.min(FARM_MAX_LEVEL, safeWhole(h.farm?.level, 1)));

/** Plots unlocked at a Farm Level: 1 at level 1, one more per level, all 16 at level 16. */
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
  14500, 17500, 21000, 25000, 29500, 34500, 40000, 46000, 52500, 59500, 67000, 75000, 83500, 92500,
];

/** Farm XP the next level costs; 0 at the top of the ladder. */
export const farmXpToNext = (level: number) =>
  level >= FARM_MAX_LEVEL
    ? 0
    : (FARM_XP_STEPS[Math.max(0, Math.min(FARM_XP_STEPS.length - 1, safeWhole(level, 1) - 1))] ??
      120);

/** The hero's Farm XP inside the current level. */
export const farmXp = (h: Pick<Hero, "farm">) => Math.max(0, safeWhole(h.farm?.xp, 0));

/** True once all sixteen plots are tilled — the fields are mastered (see FARM_MASTERY_BONUS). */
export const farmMastered = (h: Pick<Hero, "farm">) => farmLevel(h) >= FARM_MASTERY_LEVEL;

/** The multiplier every gold and Farm XP payout carries (1 until Farm Level 16, then +20%). */
export const farmMastery = (h: Pick<Hero, "farm">) =>
  farmMastered(h) ? 1 + FARM_MASTERY_BONUS : 1;

/** A payout with Farm Mastery applied — the numbers the field actually pays. */
export const withFarmMastery = (amount: number, h: Pick<Hero, "farm">) =>
  amount > 0 ? Math.round(amount * farmMastery(h)) : 0;

/** Share of the way to the next Farm Level, 0-1 (1 at the top). */
export const farmProgress = (h: Pick<Hero, "farm">) => {
  if (farmLevel(h) >= FARM_MAX_LEVEL) return 1;
  return Math.min(1, farmXp(h) / Math.max(1, farmXpToNext(farmLevel(h))));
};

// ---------- Seeds ----------

/** Gold Seed price at each Farm Level: 200 at level 1, +320 a level, 5,000 at level 16. */
export const GOLD_SEED_PRICES: readonly number[] = Array.from(
  { length: FARM_MAX_LEVEL },
  (_, i) => 200 + i * 320,
);

/** XP Seed price at each tier. They cost a little gold and pay only Farm XP. */
export const XP_SEED_PRICES: readonly number[] = [
  150, 240, 350, 480, 640, 830, 1050, 1300, 1600, 1950, 2350, 2800, 3300, 3850, 4500, 5200,
  6000, 6900, 7900, 9000, 10200, 11500, 12900, 14400, 16000, 17700, 19500, 21400, 23400, 25500,
];

/** How long each seed takes to grow, in minutes. Deeper seeds take longer to ripen. */
export const goldSeedMinutes = (tier: number) => 20 + 5 * (Math.max(1, tier) - 1);
export const xpSeedMinutes = (tier: number) => 20 + 4 * (Math.max(1, tier) - 1);
/** Emberbloom grows half again as long as a Gold Seed. */
export const emberSeedMinutes = (tier: number) => Math.round(goldSeedMinutes(tier) * 1.5);
/** Moonroot is the slow seed: three times an XP Seed's growing time. */
export const moonSeedMinutes = (tier: number) => xpSeedMinutes(tier) * 3;

export const seedMinutes = (kind: SeedKind, tier: number) =>
  kind === "gold"
    ? goldSeedMinutes(tier)
    : kind === "xp"
      ? xpSeedMinutes(tier)
      : kind === "ember" || kind === "frost"
        ? emberSeedMinutes(tier)
        : kind === "sun"
          ? goldSeedMinutes(tier) * 2
          : kind === "blood"
            ? xpSeedMinutes(tier) * 2
            : kind === "star"
              ? moonSeedMinutes(tier) + 30
              : moonSeedMinutes(tier);

/** Gold Seed prices are the table above; XP Seeds have their own ladder. */
export const seedPrice = (kind: SeedKind, tier: number) => {
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  const gold = GOLD_SEED_PRICES[t - 1] ?? 0;
  const xp = XP_SEED_PRICES[t - 1] ?? 0;
  if (kind === "gold") return gold;
  if (kind === "xp") return xp;
  // Emberbloom costs as much as both basic seeds together; Moonroot twice an XP Seed.
  if (kind === "ember") return gold + xp;
  if (kind === "frost") return gold + xp;
  if (kind === "sun") return gold * 2;
  if (kind === "blood") return Math.round((gold + xp) * 1.5);
  if (kind === "star") return (gold + xp) * 2;
  return xp * 2;
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
  const step = FARM_XP_STEPS[t - 1] ?? 12000;
  return Math.round(step * 0.42);
};

/** Gold a ripe seed pays: Gold Seeds in full, Emberbloom 75% of a Gold Seed's harvest. */
export const seedGold = (kind: SeedKind, tier: number) =>
  kind === "gold"
    ? goldSeedReward(tier)
    : kind === "ember"
      ? Math.round(goldSeedReward(tier) * 0.75)
      : kind === "sun"
        ? Math.round(goldSeedReward(tier) * 2.5)
        : kind === "blood"
          ? Math.round(goldSeedReward(tier) * 0.9)
          : kind === "frost" || kind === "star"
            ? Math.round(goldSeedReward(tier) * 0.5)
            : 0;

/**
 * Farm XP a ripe seed pays: XP Seeds in full, Emberbloom 60% of an XP Seed, Moonroot 2.2x —
 * still under one whole level (2.2 x 42% = 92%).
 */
export const seedXp = (kind: SeedKind, tier: number) =>
  kind === "xp"
    ? xpSeedReward(tier)
    : kind === "ember"
      ? Math.round(xpSeedReward(tier) * 0.6)
      : kind === "moon"
        ? Math.round(xpSeedReward(tier) * 2.2)
        : kind === "blood"
          ? Math.round(xpSeedReward(tier) * 1.4)
          : kind === "frost" || kind === "star"
            ? Math.round(xpSeedReward(tier) * 0.8)
            : 0;

/** The main harvest a seed pays (gold for Gold Seeds, Farm XP otherwise). */
export const seedReward = (kind: SeedKind, tier: number) =>
  kind === "gold" ? seedGold(kind, tier) : seedXp(kind, tier);

/** Growing time of a seed in milliseconds. */
export const seedDurationMs = (kind: SeedKind, tier: number) => seedMinutes(kind, tier) * 60_000;

export const seedName = (kind: SeedKind, tier: number) =>
  `${SEED_LABELS[kind] ?? "XP"} Seed · Lv ${Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)))}`;

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
  /** Sixteen plots; `null` is an empty (or still locked) plot. */
  slots?: (FarmCrop | null)[];
  /** Seeds bought from the shop and not yet planted, keyed "gold:tier" / "xp:tier". */
  seeds?: Record<string, number>;
  /** Epoch milliseconds of the last Bloodoak charge; 0 (or absent) means never charged. */
  treeChargedAt?: number;
  /** Produce banked from harvests, spent at the Hearth on feasts. */
  produce?: Partial<Record<SeedKind, number>>;
  /** Active feast: id and expiry epoch ms. */
  feast?: { id: string; until: number } | null;
}

/** A brand-new farm: level 1, no XP, sixteen plots of which one is tilled. */
export function newFarm(): Required<FarmState> {
  return {
    level: 1,
    xp: 0,
    slots: Array.from({ length: FARM_TOTAL_SLOTS }, () => null),
    seeds: {},
    treeChargedAt: 0,
    produce: {},
    feast: null,
  };
}

/** The hero's farm, creating or repairing it in place when the save predates the fields. */
export function ensureFarm(h: Hero): Required<FarmState> {
  const current = h.farm ?? {};
  const slots = Array.from({ length: FARM_TOTAL_SLOTS }, (_, i) => current.slots?.[i] ?? null);
  const farm: Required<FarmState> = {
    level: farmLevel(h),
    xp: farmXp(h),
    slots,
    seeds: { ...(current.seeds ?? {}) },
    treeChargedAt: Math.max(0, safeWhole(current.treeChargedAt, 0)),
    produce: { ...(current.produce ?? {}) },
    feast: current.feast ?? null,
  };
  h.farm = farm;
  return farm;
}

/** Normalize a farm from an older save without touching anything else on the hero. */
export function normalizeFarm(h: Hero) {
  ensureFarm(h);
}

/** An empty plot the current Farm Level has tilled. */
export const isSlotUnlocked = (h: Pick<Hero, "farm">, index: number) =>
  validSlot(index) && index < slotsForLevel(farmLevel(h));

/** The crop in a plot, or null when it is empty (or locked). */
export const cropAt = (h: Pick<Hero, "farm">, index: number): FarmCrop | null =>
  h.farm?.slots?.[index] ?? null;

/** Seeds of one kind the hero is carrying. */
export const seedCount = (h: Pick<Hero, "farm">, kind: SeedKind, tier: number) =>
  Math.max(0, safeWhole(h.farm?.seeds?.[seedKey(kind, tier)], 0));

/** Every seed in the pouch, lowest tier first, for the pack list. */
export function heldSeeds(
  h: Pick<Hero, "farm">,
): { kind: SeedKind; tier: number; count: number }[] {
  const out: { kind: SeedKind; tier: number; count: number }[] = [];
  for (const kind of SEED_KINDS) {
    for (let tier = 1; tier <= FARM_MAX_LEVEL; tier += 1) {
      const count = seedCount(h, kind, tier);
      if (count > 0) out.push({ kind, tier, count });
    }
  }
  return out;
}

/** Buy seeds into the pouch. Returns an error string, or null on success. */
export function buySeed(h: Hero, kind: SeedKind, tier: number, qty = 1): string | null {
  if (!validKind(kind) || !validTier(tier)) return "Unknown seed";
  if (!Number.isSafeInteger(qty) || qty < 1) return "Choose a whole number of seeds";
  const farm = ensureFarm(h);
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  if (t > farm.level) return `Farm level ${t} needed`;
  if (SEED_UNLOCK[kind] > farm.level) return `Farm level ${SEED_UNLOCK[kind]} needed`;
  const count = Math.max(1, Math.floor(qty));
  const total = seedPrice(kind, t) * count;
  if (!Number.isSafeInteger(total) || !Number.isFinite(h.gold) || h.gold < total)
    return `Not enough gold — ${total.toLocaleString()} needed`;
  h.gold -= total;
  const key = seedKey(kind, t);
  farm.seeds[key] = (farm.seeds[key] ?? 0) + count;
  return null;
}

/** Plant a seed in a plot. Uses a pouch seed when one is held, otherwise buys it on the spot. */
export function plantSeed(
  h: Hero,
  index: number,
  kind: SeedKind,
  tier: number,
  now = Date.now(),
): string | null {
  if (!validSlot(index)) return "Unknown plot";
  if (!validKind(kind) || !validTier(tier)) return "Unknown seed";
  if (!Number.isFinite(now) || now < 0) return "Invalid planting time";
  const farm = ensureFarm(h);
  const t = Math.max(1, Math.min(FARM_MAX_LEVEL, Math.floor(tier)));
  if (index < 0 || index >= FARM_TOTAL_SLOTS) return "Unknown plot";
  if (index >= slotsForLevel(farm.level))
    return `Farm level ${unlockLevelForSlot(index)} needed for that plot`;
  if (farm.slots[index]) return "That plot is already planted";
  if (t > farm.level) return `Farm level ${t} needed for that seed`;
  if (SEED_UNLOCK[kind] > farm.level) return `Farm level ${SEED_UNLOCK[kind]} needed for that seed`;
  const key = seedKey(kind, t);
  if ((farm.seeds[key] ?? 0) > 0) {
    farm.seeds[key] = (farm.seeds[key] ?? 0) - 1;
  } else {
    const price = seedPrice(kind, t);
    if (!Number.isFinite(h.gold) || h.gold < price)
      return `Not enough gold — ${price.toLocaleString()} needed`;
    h.gold -= price;
  }
  const grow = Math.round(seedDurationMs(kind, t) * farmGrowthMult(farm.level));
  farm.slots[index] = { kind, tier: t, plantedAt: now, readyAt: now + grow };
  return null;
}

export interface HarvestResult {
  gold: number;
  xp: number;
  /** Farm Levels gained by this harvest (normally 0 or 1). */
  levels: number;
  /** Rare materials found in the soil. */
  mats?: Record<string, number>;
}

/** Add Farm XP, carrying the excess over, and report how many levels it bought. */
export function addFarmXp(h: Hero, xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 0;
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
export function harvestSlot(h: Hero, index: number, now = Date.now(), rand: () => number = Math.random): HarvestResult | null {
  if (!validSlot(index) || !Number.isFinite(now) || now < 0) return null;
  const farm = ensureFarm(h);
  const crop = farm.slots[index];
  if (!crop) return null;
  if (
    !validKind(crop.kind) ||
    !validTier(crop.tier) ||
    !Number.isFinite(crop.readyAt) ||
    !Number.isFinite(crop.plantedAt) ||
    crop.readyAt <= crop.plantedAt ||
    now < crop.readyAt
  )
    return null;
  farm.slots[index] = null;
  // A mastered farm (+20% at Farm Level 16) pays every harvest more; perks add a gold bonus.
  const gold = Math.round(withFarmMastery(seedGold(crop.kind, crop.tier), h) * (1 + farmGoldPerk(farm.level)));
  const xp = withFarmMastery(seedXp(crop.kind, crop.tier), h);
  if (gold > 0) h.gold += gold;
  farm.produce[crop.kind] = (farm.produce[crop.kind] ?? 0) + farmProduceYield(farm.level);
  const mats = rollRareHarvest(crop.kind, crop.tier, farm.level, rand);
  if (mats) {
    const bag = (h.mats ??= {}) as Record<string, number>;
    for (const [k, v] of Object.entries(mats)) bag[k] = (bag[k] ?? 0) + v;
  }
  const levels = xp > 0 ? addFarmXp(h, xp) : 0;
  return mats ? { gold, xp, levels, mats } : { gold, xp, levels };
}

/** Harvest every ripe plot at once, skipping anything still growing. */
export function harvestAll(h: Hero, now = Date.now()): HarvestResult & { crops: number; mats: Record<string, number> } {
  const total = { gold: 0, xp: 0, levels: 0, crops: 0, mats: {} as Record<string, number> };
  for (let i = 0; i < FARM_TOTAL_SLOTS; i += 1) {
    const got = harvestSlot(h, i, now);
    if (!got) continue;
    total.gold += got.gold;
    total.xp += got.xp;
    total.levels += got.levels;
    for (const [k, v] of Object.entries(got.mats ?? {})) total.mats[k] = (total.mats[k] ?? 0) + v;
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

/** "1h 05m" / "12:34" / "Ready" for a countdown in milliseconds. */
export function waitLabel(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "Ready";
  const mins = Math.ceil(ms / 60_000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  const secs = Math.ceil(ms / 1000);
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

/** "1h 05m" / "12:34" / "Ready" for a plot's remaining time. */
export const timeLeft = (crop: FarmCrop, now = Date.now()) => waitLabel(crop.readyAt - now);

/** A seed's growing time as words, for the shop and the picker. */
export function durationLabel(kind: SeedKind, tier: number) {
  const mins = seedMinutes(kind, tier);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim();
  return `${mins} min`;
}

// ---------- The Bloodoak ----------

/** The great red tree in the middle of the fields can be charged once every half hour. */
export const BLOODOAK_COOLDOWN_MS = 30 * 60_000;

/**
 * What one charge pays at a Farm Level: gold that grows with the level, and a slice of the
 * Farm XP that level needs — never a whole level, so the fields still matter most.
 */
export function bloodoakRewards(level: number) {
  const lv = Math.max(1, Math.min(FARM_MAX_LEVEL, safeWhole(level, 1)));
  const step = FARM_XP_STEPS[Math.min(FARM_XP_STEPS.length - 1, lv - 1)] ?? 120;
  return { gold: 300 + 120 * (lv - 1), xp: Math.max(10, Math.round(step * 0.12)) };
}

/** When the Bloodoak is next chargeable; 0 while it is ready now. */
export function bloodoakReadyAt(h: Pick<Hero, "farm">) {
  const at = safeWhole(h.farm?.treeChargedAt, 0);
  return at > 0 ? at + BLOODOAK_COOLDOWN_MS : 0;
}

/** Milliseconds until the next charge (0 when it is ready). */
export const bloodoakWaitMs = (h: Pick<Hero, "farm">, now = Date.now()) =>
  Math.max(0, bloodoakReadyAt(h) - now);

/** Charge the Bloodoak for gold and Farm XP; null while it is still recharging. */
export function chargeBloodoak(h: Hero, now = Date.now()): HarvestResult | null {
  if (!Number.isFinite(now) || now < 0) return null;
  if (now < bloodoakReadyAt(h)) return null;
  const farm = ensureFarm(h);
  const base = bloodoakRewards(farm.level);
  const gold = withFarmMastery(base.gold, h);
  const xp = withFarmMastery(base.xp, h);
  farm.treeChargedAt = now;
  h.gold += gold;
  const levels = addFarmXp(h, xp);
  return { gold, xp, levels };
}

// ---------- Level perks ----------

export type FarmPerkKind = "growth" | "gold" | "rare" | "produce" | "feast";
export interface FarmPerk { level: number; kind: FarmPerkKind; value: number; label: string }

/** Every permanent bonus the Farm earns as it levels, in order. */
export const FARM_PERKS: readonly FarmPerk[] = [
  { level: 3, kind: "growth", value: 0.05, label: "Crops grow 5% faster" },
  { level: 5, kind: "feast", value: 1, label: "The Hearth opens: cook battle feasts" },
  { level: 6, kind: "rare", value: 0.08, label: "8% chance of rare materials per harvest" },
  { level: 8, kind: "growth", value: 0.05, label: "Crops grow another 5% faster" },
  { level: 10, kind: "gold", value: 0.1, label: "+10% harvest gold" },
  { level: 12, kind: "produce", value: 1, label: "Every harvest banks 2 produce" },
  { level: 15, kind: "rare", value: 0.07, label: "+7% rare material chance" },
  { level: 18, kind: "growth", value: 0.1, label: "Crops grow another 10% faster" },
  { level: 20, kind: "feast", value: 2, label: "Grand feasts: +50% feast strength" },
  { level: 22, kind: "gold", value: 0.15, label: "+15% harvest gold" },
  { level: 25, kind: "rare", value: 0.1, label: "+10% rare material chance" },
  { level: 28, kind: "produce", value: 1, label: "Every harvest banks 3 produce" },
  { level: 30, kind: "feast", value: 3, label: "Royal feasts last twice as long" },
];

const perkSum = (level: number, kind: FarmPerkKind) =>
  FARM_PERKS.filter((p) => p.kind === kind && p.level <= level).reduce((a, p) => a + p.value, 0);

/** Growing-time multiplier at a Farm Level (0.8 at the top). */
export const farmGrowthMult = (level: number) => Math.max(0.5, 1 - perkSum(level, "growth"));
export const farmGoldPerk = (level: number) => perkSum(level, "gold");
export const farmRareChance = (level: number) => perkSum(level, "rare");
export const farmProduceYield = (level: number) => 1 + perkSum(level, "produce");
export const feastTier = (level: number) => perkSum(level, "feast");

/** What each special seed can turn up in the soil. */
const RARE_FINDS: Record<SeedKind, readonly string[]> = {
  gold: ["ore"], xp: ["essence"], ember: ["bloom"], moon: ["crystal", "moonsilver"],
  frost: ["frostCrystal"], sun: ["sunCrystal"], blood: ["essence", "voidCrystal"], star: ["starshard", "moonsilver"],
};

/** Roll a rare harvest. Special seeds roll twice the base chance. */
export function rollRareHarvest(kind: SeedKind, tier: number, level: number, rand: () => number = Math.random) {
  const base = farmRareChance(level);
  if (base <= 0) return null;
  const special = SEED_UNLOCK[kind] > 1;
  if (rand() >= Math.min(0.9, base * (special ? 2 : 1))) return null;
  const pool = RARE_FINDS[kind] ?? ["ore"];
  const mat = pool[Math.floor(rand() * pool.length)] ?? pool[0]!;
  const qty = 1 + Math.floor(Math.max(1, tier) / 8);
  return { [mat]: qty };
}

// ---------- The Hearth: feasts ----------

export interface FeastDef {
  id: string;
  name: string;
  desc: string;
  cost: Partial<Record<SeedKind, number>>;
  buff: { atkPct?: number; matkPct?: number; defPct?: number; mdefPct?: number; hpPct?: number; crit?: number; critDmg?: number; dodge?: number };
  minutes: number;
  level: number;
}

export const FEASTS: readonly FeastDef[] = [
  { id: "stew", name: "Hunter's Stew", desc: "+10% attack and magic attack", cost: { gold: 3, xp: 2 }, buff: { atkPct: 10, matkPct: 10 }, minutes: 45, level: 5 },
  { id: "bread", name: "Moonroot Bread", desc: "+12% health and defence", cost: { moon: 3, xp: 2 }, buff: { hpPct: 12, defPct: 12, mdefPct: 12 }, minutes: 45, level: 5 },
  { id: "tart", name: "Frostberry Tart", desc: "+6% crit and +6% dodge", cost: { frost: 3, ember: 2 }, buff: { crit: 6, dodge: 6 }, minutes: 45, level: 6 },
  { id: "roast", name: "Sunwheat Roast", desc: "+15% attack, +20% crit damage", cost: { sun: 3, gold: 3 }, buff: { atkPct: 15, matkPct: 15, critDmg: 20 }, minutes: 60, level: 10 },
  { id: "wine", name: "Bloodvine Wine", desc: "+18% health, +10% attack", cost: { blood: 3, moon: 2 }, buff: { hpPct: 18, atkPct: 10, matkPct: 10 }, minutes: 60, level: 14 },
  { id: "banquet", name: "Starbloom Banquet", desc: "+15% to every combat stat", cost: { star: 3, sun: 2, blood: 2 }, buff: { atkPct: 15, matkPct: 15, defPct: 15, mdefPct: 15, hpPct: 15, crit: 5 }, minutes: 60, level: 20 },
];

export const produceCount = (h: Pick<Hero, "farm">, kind: SeedKind) =>
  Math.max(0, safeWhole(h.farm?.produce?.[kind], 0));

/** Strength multiplier and duration multiplier from the Hearth perks. */
export const feastPower = (level: number) => (feastTier(level) >= 3 ? 1.5 : 1);
export const feastLength = (level: number) => (feastTier(level) >= 6 ? 2 : 1);

export function cookFeast(h: Hero, id: string, now = Date.now()): string | null {
  const def = FEASTS.find((f) => f.id === id);
  if (!def) return "Unknown feast";
  const farm = ensureFarm(h);
  if (feastTier(farm.level) < 1 || farm.level < def.level) return `Farm level ${Math.max(5, def.level)} needed`;
  for (const [k, n] of Object.entries(def.cost) as [SeedKind, number][])
    if ((farm.produce[k] ?? 0) < n) return `Not enough ${SEED_LABELS[k]} produce`;
  for (const [k, n] of Object.entries(def.cost) as [SeedKind, number][]) farm.produce[k] = (farm.produce[k] ?? 0) - n;
  farm.feast = { id, until: now + def.minutes * 60_000 * feastLength(farm.level) };
  return null;
}

export function activeFeast(h: Pick<Hero, "farm">, now = Date.now()) {
  const f = h.farm?.feast;
  if (!f || !Number.isFinite(f.until) || f.until <= now) return null;
  const def = FEASTS.find((d) => d.id === f.id);
  return def ? { def, until: f.until } : null;
}

/** The feast's battle bonus, joined into computeStats beside potion elixirs. */
export function feastFx(h: Pick<Hero, "farm">, now = Date.now()): Record<string, number> {
  const a = activeFeast(h, now);
  if (!a) return {};
  const m = feastPower(farmLevel(h));
  return Object.fromEntries(Object.entries(a.def.buff).map(([k, v]) => [k, Math.round((v ?? 0) * m)]));
}

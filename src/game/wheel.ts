import type { Mat } from "./crafting";

/**
 * The Wheel of Fortune prize table — the single source for the wheel picture
 * (`src/assets/wheel-of-fortune-16.webp`), the spin animation and the odds list.
 *
 * The server (`wheel_spin`, migration 0035) rolls with the same weights and the same segment
 * numbers, so keep the two in step: segment `i` sits at `i * 22.5°` clockwise from the pointer.
 *
 * Luck split: the ten normal slices together land 95% of spins and pay the classic wheel amounts;
 * the six starred "good" slices together land only 5% of spins.
 */
export interface WheelSegment {
  label: string;
  /** Chance out of 100. */
  weight: number;
  good: boolean;
  /** What the prize pays, for the odds list. */
  prize: string;
  mats?: Partial<Record<Mat, number>>;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  /* 0 */ { label: "Gold", weight: 14, good: false, prize: "Gold (3,000 + 400 per level)" },
  /* 1 */ {
    label: "Void Crystals",
    weight: 1.4,
    good: true,
    prize: "3 Void Crystals",
    mats: { voidCrystal: 3 },
  },
  /* 2 */ { label: "XP", weight: 12, good: false, prize: "XP (200 + 120 per level)" },
  /* 3 */ {
    label: "Ore & Essence",
    weight: 10,
    good: false,
    prize: "40 Ember Ore and 10 Soul Essence",
    mats: { ore: 40, essence: 10 },
  },
  /* 4 */ {
    label: "Jackpot",
    weight: 0.6,
    good: true,
    prize: "Jackpot gold (25,000 + 2,500 per level)",
  },
  /* 5 */ {
    label: "Frost Crystals",
    weight: 6,
    good: false,
    prize: "4 Frost Crystals",
    mats: { frostCrystal: 4 },
  },
  /* 6 */ {
    label: "Starshards",
    weight: 6,
    good: false,
    prize: "3 Starshards",
    mats: { starshard: 3 },
  },
  /* 7 */ {
    label: "Fate Stones",
    weight: 0.8,
    good: true,
    prize: "3 Fate Stones",
    mats: { fateStone: 3 },
  },
  /* 8 */ { label: "Gold", weight: 13, good: false, prize: "Gold (3,000 + 400 per level)" },
  /* 9 */ {
    label: "Hide & Bloom",
    weight: 9,
    good: false,
    prize: "30 Beast Hide and 20 Emberbloom",
    mats: { hide: 30, bloom: 20 },
  },
  /* 10 */ {
    label: "Mega Jackpot",
    weight: 0.2,
    good: true,
    prize: "1,000 Diamonds and a mountain of gold",
  },
  /* 11 */ { label: "XP", weight: 11, good: false, prize: "XP (200 + 120 per level)" },
  /* 12 */ {
    label: "Enchantment Stones",
    weight: 7,
    good: false,
    prize: "2 Enchantment Stones",
    mats: { enchantStone: 2 },
  },
  /* 13 */ {
    label: "Sun Crystal",
    weight: 0.8,
    good: true,
    prize: "1 Sun Crystal",
    mats: { sunCrystal: 1 },
  },
  /* 14 */ {
    label: "Armor Fragments",
    weight: 7,
    good: false,
    prize: "10 Armor Fragments",
    mats: { fragment: 10 },
  },
  /* 15 */ {
    label: "Fragment Cache",
    weight: 1.2,
    good: true,
    prize: "30 Armor Fragments",
    mats: { fragment: 30 },
  },
];

export const WHEEL_SEG_DEG = 360 / WHEEL_SEGMENTS.length;
export const WHEEL_PRICE = 100;

/** Total chance (out of 100) of landing on any good segment. */
export const wheelGoodChance = () =>
  +WHEEL_SEGMENTS.filter((s) => s.good)
    .reduce((a, s) => a + s.weight, 0)
    .toFixed(2);

/** The neighbouring segment that is a good prize, if any (used for "so close!" near misses). */
export function goodNeighbour(seg: number, rand: () => number = Math.random): -1 | 1 | 0 {
  const n = WHEEL_SEGMENTS.length;
  const next = WHEEL_SEGMENTS[(seg + 1) % n];
  const prev = WHEEL_SEGMENTS[(seg - 1 + n) % n];
  if (next?.good && prev?.good) return rand() < 0.5 ? 1 : -1;
  if (next?.good) return 1;
  if (prev?.good) return -1;
  return 0;
}

/**
 * Where inside the winning slice the pointer stops, in degrees from the slice centre.
 * Normal prizes next to a starred slice often stop right on the edge beside it — a near miss.
 * Positive offsets sit clockwise of the centre (toward the next segment).
 */
export function landingOffset(seg: number, rand: () => number = Math.random): number {
  const half = WHEEL_SEG_DEG / 2;
  const side = WHEEL_SEGMENTS[seg]?.good ? 0 : goodNeighbour(seg, rand);
  if (side !== 0 && rand() < 0.4) return side * half * (0.78 + rand() * 0.16);
  return (rand() - 0.5) * half * 1.3;
}

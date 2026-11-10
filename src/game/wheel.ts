import type { Mat } from "./crafting";

/**
 * The Wheel of Fortune prize table — the single source for the wheel drawing and the odds list.
 * The server (`wheel_spin`, migration 0034) rolls with the same weights and segment order, so
 * keep the two in step: segment `i` sits at `i * 22.5°` clockwise from the pointer.
 *
 * Only about 5% of spins land on a "good" segment; everything else is a small, randomly sized
 * common prize (each common amount is rolled between 50% and 150% of its base).
 */
export interface WheelSegment {
  label: string;
  /** Chance out of 100. */
  weight: number;
  good: boolean;
  /** What the prize can be, for the odds list. */
  prize: string;
  mats?: Partial<Record<Mat, number>>;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: "Gold", weight: 16, good: false, prize: "A small pile of gold" },
  { label: "XP", weight: 14, good: false, prize: "A little experience" },
  { label: "Void Crystal", weight: 1.6, good: true, prize: "2–4 Void Crystals" },
  { label: "Ore", weight: 12, good: false, prize: "A handful of ore" },
  { label: "Essence", weight: 10, good: false, prize: "A pinch of essence" },
  { label: "Sun Crystal", weight: 1.2, good: true, prize: "1–2 Sun Crystals" },
  { label: "Gold", weight: 10, good: false, prize: "A pile of gold" },
  { label: "Dust", weight: 5, good: false, prize: "Almost nothing — a few coins" },
  { label: "Diamonds", weight: 0.8, good: true, prize: "100–300 Diamonds back" },
  { label: "XP", weight: 9, good: false, prize: "Some experience" },
  { label: "Ore & Essence", weight: 8, good: false, prize: "Ore and essence" },
  { label: "Fate Stones", weight: 0.8, good: true, prize: "3–6 Fate Stones" },
  { label: "Frost Crystal", weight: 6, good: false, prize: "1–2 Frost Crystals" },
  { label: "Jackpot", weight: 0.5, good: true, prize: "A huge pile of gold" },
  { label: "Fragments", weight: 5, good: false, prize: "A few Armor Fragments" },
  { label: "Mega Jackpot", weight: 0.1, good: true, prize: "1,000 Diamonds, 3 Sun Crystals and gold" },
];

export const WHEEL_SEG_DEG = 360 / WHEEL_SEGMENTS.length;
export const WHEEL_PRICE = 100;

/** Total chance (out of 100) of landing on any good segment. */
export const wheelGoodChance = () =>
  +WHEEL_SEGMENTS.filter((s) => s.good).reduce((a, s) => a + s.weight, 0).toFixed(2);

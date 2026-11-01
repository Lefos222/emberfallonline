import type { HeroClass } from "../data";

/** Gear look tier: iron, ember, moon, ancestral — one per power band. */
export type Tier = 0 | 1 | 2 | 3;
export type Gender = "male" | "female";

export interface Metal {
  /** Plate face. */
  base: string;
  /** Shadowed plate / recess. */
  dark: string;
  /** Lit plate. */
  light: string;
  /** Secondary metal: rivets, clasps, engraving. */
  trim: string;
  /** Emissive accent: runes, gems, blade glow. */
  glow: string;
  /** Brightest edge highlight. */
  edge: string;
}

/**
 * Shared material story, so a chestplate and its weapon read as one set:
 * iron → ember → moon → ancestral.
 */
export const METAL: Record<Tier, Metal> = {
  0: {
    base: "#8b98a8",
    dark: "#4d5763",
    light: "#c6d1de",
    trim: "#6e7a89",
    glow: "#a9c6f5",
    edge: "#eaf2fb",
  },
  1: {
    base: "#4b322c",
    dark: "#221211",
    light: "#7c4f40",
    trim: "#c56a2d",
    glow: "#ff8a3d",
    edge: "#ffd7a8",
  },
  2: {
    base: "#b9cde2",
    dark: "#6b839c",
    light: "#f4faff",
    trim: "#63c4e6",
    glow: "#8deaff",
    edge: "#ffffff",
  },
  3: {
    base: "#c9a445",
    dark: "#6f5119",
    light: "#f6e29c",
    trim: "#2f7a52",
    glow: "#86f0a8",
    edge: "#fff6cc",
  },
};

/** Class colour identity — the same accents the class headers use. */
export const CLASS_ACCENT: Record<HeroClass, string> = {
  warrior: "#ff8c2b",
  mage: "#46bdf8",
  archer: "#7ada4c",
};

export const INK = "#1a1119";
export const SKIN = {
  base: "#f0bd90",
  light: "#ffd9b6",
  shade: "#d09166",
  deep: "#a96c47",
  line: "#8a5638",
  blush: "#e57d6c",
  lip: "#c4615a",
  lipDark: "#8f3f3c",
};

interface Cloth {
  cloth: string;
  dark: string;
  light: string;
}

/** Class cloth per look tier: the cape, tabard and sleeves follow the worn chest piece. */
export const CLOTH: Record<HeroClass, Record<Tier, Cloth>> = {
  warrior: [
    { cloth: "#8f2f2a", dark: "#55180f", light: "#bd4a3d" },
    { cloth: "#4d2420", dark: "#28120f", light: "#81402f" },
    { cloth: "#2f3f66", dark: "#1a2540", light: "#48618d" },
    { cloth: "#2d6349", dark: "#173a29", light: "#4d9468" },
  ],
  mage: [
    { cloth: "#4a3f78", dark: "#2a2450", light: "#6a5ca3" },
    { cloth: "#402230", dark: "#24101a", light: "#6c3a4d" },
    { cloth: "#33436f", dark: "#1c2647", light: "#53679b" },
    { cloth: "#2c5a52", dark: "#16332e", light: "#487f73" },
  ],
  archer: [
    { cloth: "#3f6b45", dark: "#233c28", light: "#5d9364" },
    { cloth: "#5c3a26", dark: "#322014", light: "#855437" },
    { cloth: "#2b3f5c", dark: "#16233a", light: "#456082" },
    { cloth: "#37674c", dark: "#1c3a2b", light: "#57906a" },
  ],
};

export interface Hair {
  hair: string;
  dark: string;
  light: string;
  eye: string;
}

/**
 * Hair and eyes are per class *and* gender, matching the character sheet:
 * a blonde and a silver knight, a brown-haired and a blonde mage, two blondes for the archer.
 */
export const HAIR: Record<HeroClass, Record<Gender, Hair>> = {
  warrior: {
    female: { hair: "#e2bb63", dark: "#a8843a", light: "#fbe6a8", eye: "#d98a2c" },
    male: { hair: "#cbd5df", dark: "#8b98a6", light: "#f5faff", eye: "#7fc4e8" },
  },
  mage: {
    female: { hair: "#6b4630", dark: "#3f2718", light: "#a1724f", eye: "#a37cf0" },
    male: { hair: "#d8bd7d", dark: "#9c8142", light: "#f6e7b8", eye: "#e0b34a" },
  },
  archer: {
    female: { hair: "#e8c778", dark: "#ad8b43", light: "#fcecb6", eye: "#5dbb6b" },
    male: { hair: "#d3ae66", dark: "#96743a", light: "#f1dba4", eye: "#4fa35c" },
  },
};

export const tierOf = (n: number): Tier => (n <= 0 ? 0 : n >= 3 ? 3 : (n as Tier));

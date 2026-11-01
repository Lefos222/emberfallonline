import type { HeroClass } from '../data';

/** Gear look tier: iron, ember, moon, ancestral — one per power band. */
export type Tier = 0 | 1 | 2 | 3;

export interface Metal { base: string; dark: string; light: string; trim: string; glow: string }

/** Shared material story, so a chestplate and its matching weapon read as one set. */
export const METAL: Record<Tier, Metal> = {
  0: { base: '#8d9aa9', dark: '#59636f', light: '#c8d1dc', trim: '#6d7787', glow: '#a8c6ff' },
  1: { base: '#47302e', dark: '#241617', light: '#6f4a43', trim: '#c2652c', glow: '#ff9448' },
  2: { base: '#c4d6e7', dark: '#7d90a6', light: '#f2f8ff', trim: '#6fd4ea', glow: '#86e9ff' },
  3: { base: '#c9a445', dark: '#7b5b1e', light: '#f3dd95', trim: '#2f7a52', glow: '#8ef0a8' },
};

export const SKIN = { base: '#e5b083', shade: '#c58b60', light: '#f5d1ab', line: '#7a5139' };
export const INK = '#1b1218';

interface Cloth { cloth: string; dark: string; light: string }

/** Class cloth per look tier: the cape, tabard and sleeves follow the worn chest piece. */
export const CLOTH: Record<HeroClass, Record<Tier, Cloth>> = {
  warrior: [
    { cloth: '#8f2f2a', dark: '#55180f', light: '#bd4a3d' },
    { cloth: '#4d2420', dark: '#28120f', light: '#81402f' },
    { cloth: '#2f3f66', dark: '#1a2540', light: '#48618d' },
    { cloth: '#2d6349', dark: '#173a29', light: '#4d9468' },
  ],
  mage: [
    { cloth: '#4a3f78', dark: '#2a2450', light: '#6a5ca3' },
    { cloth: '#402230', dark: '#24101a', light: '#6c3a4d' },
    { cloth: '#33436f', dark: '#1c2647', light: '#53679b' },
    { cloth: '#2c5a52', dark: '#16332e', light: '#487f73' },
  ],
  archer: [
    { cloth: '#3f6b45', dark: '#233c28', light: '#5d9364' },
    { cloth: '#5c3a26', dark: '#322014', light: '#855437' },
    { cloth: '#2b3f5c', dark: '#16233a', light: '#456082' },
    { cloth: '#37674c', dark: '#1c3a2b', light: '#57906a' },
  ],
};

export interface Hair { hair: string; dark: string; light: string; eye: string }

export const HAIR: Record<HeroClass, Hair> = {
  warrior: { hair: '#3b2a22', dark: '#241812', light: '#5d4235', eye: '#c9791f' },
  mage: { hair: '#d9d3c8', dark: '#a79f92', light: '#f3efe6', eye: '#8f6fe0' },
  archer: { hair: '#8b4a2b', dark: '#5c2d19', light: '#b06c42', eye: '#4fa35c' },
};

export const tierOf = (n: number): Tier => (n <= 0 ? 0 : n >= 3 ? 3 : (n as Tier));

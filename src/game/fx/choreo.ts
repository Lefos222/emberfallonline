import type { FxSprite } from "./particles";

/**
 * How each class fights, in Wartune terms: a knight braces and swings steel, a mage draws a
 * sigil and lets it detonate, an archer draws and looses with a following wind. The element of
 * the blow (fire, ice, arcane, heal) repaints the same choreography, so every one of the game's
 * skills gets its own colour and its own burst without a table entry per skill.
 */
export interface FxStyle {
  key: string;
  core: string;
  glow: string;
  trail: string;
  smoke: string;
  charge: FxSprite;
  travel: FxSprite;
  burst: FxSprite;
  /** Extra screen shake, in px, that a landed blow of this element adds. */
  shake: number;
}

const WARRIOR: FxStyle = { key: "warrior", core: "var(--gold)", glow: "var(--blood)", trail: "var(--r1)", smoke: "#3a2b1f", charge: "ring", travel: "spark", burst: "slash", shake: 9 };
const MAGE: FxStyle = { key: "mage", core: "var(--r3)", glow: "var(--r5)", trail: "var(--r3)", smoke: "#241a3d", charge: "sigil", travel: "dot", burst: "impact", shake: 5 };
const ARCHER: FxStyle = { key: "archer", core: "var(--r1)", glow: "var(--gold)", trail: "var(--r1)", smoke: "#25301f", charge: "star", travel: "spark", burst: "spark", shake: 4 };
const BEAST: FxStyle = { key: "beast", core: "var(--blood)", glow: "var(--gold)", trail: "var(--blood)", smoke: "#2a1a1a", charge: "ring", travel: "smoke", burst: "slash", shake: 8 };

const ELEMENT: Record<string, { core: string; glow: string; burst: FxSprite; shake: number }> = {
  fire: { core: "var(--gold)", glow: "var(--blood)", burst: "impact", shake: 7 },
  meteor: { core: "var(--blood)", glow: "var(--gold)", burst: "impact", shake: 11 },
  ice: { core: "var(--r2)", glow: "var(--r5)", burst: "shard", shake: 6 },
  arcane: { core: "var(--r3)", glow: "var(--r5)", burst: "sigil", shake: 5 },
  void: { core: "var(--r5)", glow: "var(--void)", burst: "ring", shake: 6 },
  heal: { core: "var(--hp)", glow: "var(--r1)", burst: "star", shake: 0 },
  shield: { core: "var(--r2)", glow: "var(--gold)", burst: "ring", shake: 3 },
  block: { core: "var(--r2)", glow: "var(--foreground)", burst: "ring", shake: 3 },
  mark: { core: "var(--gold)", glow: "var(--r4)", burst: "star", shake: 4 },
  tether: { core: "var(--r5)", glow: "var(--r3)", burst: "dot", shake: 3 },
  arrow: { core: "var(--r1)", glow: "var(--gold)", burst: "spark", shake: 4 },
  slash: { core: "var(--foreground)", glow: "var(--gold)", burst: "slash", shake: 8 },
};

/** The style a fighter's blow is drawn in: its class first, repainted by the blow's element. */
export function styleFor(cls?: string | null, effect?: string | null): FxStyle {
  const base = cls === "mage" ? MAGE : cls === "archer" ? ARCHER : cls === "warrior" ? WARRIOR : BEAST;
  const paint = effect ? ELEMENT[effect] : undefined;
  if (!paint) return base;
  return { ...base, core: paint.core, glow: paint.glow, burst: paint.burst, shake: base.shake + paint.shake };
}

export interface Ambience {
  motes: string[];
  /** Motes spawned per second, before the fight's own volume. */
  rate: number;
  /** Downward drift in px/s; negative rises, which is what embers do. */
  drift: number;
}

export const AMBIENCE: Record<string, Ambience> = {
  field: { motes: ["var(--gold)", "var(--r1)"], rate: 9, drift: -16 },
  crypt: { motes: ["var(--r2)", "var(--r5)"], rate: 7, drift: -11 },
  lair: { motes: ["var(--blood)", "var(--gold)"], rate: 13, drift: -22 },
  rift: { motes: ["var(--r3)", "var(--r5)"], rate: 11, drift: -18 },
  spire: { motes: ["var(--r4)", "var(--gold)"], rate: 9, drift: -14 },
  abyss: { motes: ["var(--void)", "var(--r5)"], rate: 11, drift: -9 },
  colosseum: { motes: ["var(--gold)", "var(--r4)"], rate: 9, drift: -20 },
  depths: { motes: ["var(--r2)", "var(--r3)"], rate: 8, drift: -13 },
};

/** The ambience an arena title belongs to; mirrors arenaFor in Battle.tsx. */
export function sceneFor(title?: string | null, boss?: boolean): string {
  const t = (title ?? "").toLowerCase();
  if (/abyss|echo/.test(t)) return "abyss";
  if (/spire|warden|rift path/.test(t)) return "spire";
  if (/duel|arena|clash|pvp/.test(t)) return "colosseum";
  if (/expedition|relic|depth|dungeon|elite/.test(t)) return "depths";
  if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return "lair";
  if (/bone|crypt/.test(t)) return "crypt";
  if (/fiend|rift|conquest/.test(t)) return "rift";
  return "field";
}

export function ambienceFor(scene: string): Ambience {
  return AMBIENCE[scene] ?? AMBIENCE.field;
}

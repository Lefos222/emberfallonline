import warriorImg from "@/assets/hero-warrior.png";
import mageImg from "@/assets/hero-mage.png";
import archerImg from "@/assets/hero-archer.png";
import skeletonImg from "@/assets/enemy-skeleton.png";
import goblinImg from "@/assets/enemy-goblin.png";
import demonImg from "@/assets/enemy-demon.png";
import dragonImg from "@/assets/enemy-dragon.png";
import { talentFx, talentSkills } from "./talents";
import { astralFx, gemFx, type Astral, type BonusFx, type Mat } from "./crafting";
import { setFx, type BattleEntry, type CombatRecord } from "./progress";
import { scaledGold } from "./gold";
import { drillFx } from "./drills";

export type HeroClass = "warrior" | "mage" | "archer";
export type Slot = "helmet" | "armour" | "boots" | "belt" | "weapon" | "ring" | "talisman";
export type Attr = "str" | "int" | "agi" | "vit";

export const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];
/** Where a piece is worn. Rings have two positions, every other slot has one. */
export type WearSlot = Slot | "ring2";
export const WEAR_SLOTS: WearSlot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "ring2", "talisman"];
export const WEAR_LABEL: Record<WearSlot, string> = {
  helmet: "Head", armour: "Chest", boots: "Feet", belt: "Waist", weapon: "Weapon",
  ring: "Ring 1", ring2: "Ring 2", talisman: "Amulet",
};
/** The wear positions a piece of this item slot may occupy. */
export const wearOf = (s: Slot): WearSlot[] => (s === "ring" ? ["ring", "ring2"] : [s]);
/** What a character is wearing, keyed by wear position. */
export type GearRecord = Partial<Record<WearSlot, Item>>;

export const MAX_LEVEL = 80;
export const CONQUEST_LEVEL = 10;
export const canEnterConquest = (level: number) => level >= CONQUEST_LEVEL;
export const INVENTORY_CAP = 40;
export const BAG_ROW = 8;
export const MAX_BAG_ROWS = 10;
/** Bag size for a hero including purchased rows. */
export const invCap = (h: { bagRows?: number }) => INVENTORY_CAP + BAG_ROW * (h.bagRows ?? 0);
/** Gold cost of the next bag row: 5,000 doubling each row, scaled by the hero's level. */
export const bagRowCost = (h: { bagRows?: number; level?: number }) => scaledGold(5000 * 2 ** (h.bagRows ?? 0), h.level ?? 1);

export const CLASSES: Record<
  HeroClass,
  { name: string; img: string; hp: number; atk: number; def: number; crit: number; dodge: number; color: string; weaponName: string }
> = {
  warrior: { name: "Knight", img: warriorImg, hp: 1.35, atk: 1, def: 1.35, crit: 0, dodge: 2, color: "var(--blood)", weaponName: "Blade" },
  mage: { name: "Mage", img: mageImg, hp: 0.85, atk: 1.4, def: 0.85, crit: 5, dodge: 4, color: "var(--r3)", weaponName: "Wand" },
  archer: { name: "Archer", img: archerImg, hp: 1, atk: 1.15, def: 1, crit: 12, dodge: 10, color: "var(--r1)", weaponName: "Bow" },
};

export const RARITIES = [
  { name: "Common", mult: 1 },
  { name: "Uncommon", mult: 1.25 },
  { name: "Rare", mult: 1.6 },
  { name: "Epic", mult: 2.1 },
  { name: "Legendary", mult: 2.8 },
  { name: "Mythic", mult: 3.8 },
  { name: "Ancestral", mult: 5.2 },
];

export interface Item {
  id: string;
  slot: Slot;
  cls: HeroClass;
  rarity: number;
  ilvl: number;
  icon: number;
  enh: number;
  name: string;
  anc?: boolean;
  /** True when produced by the Forge (the only source of Rare+ armor). */
  crafted?: boolean;
  /** Socketed gem keys (see crafting.ts), null = empty socket. */
  gems?: (string | null)[];
}

export interface ItemStats { atk: number; def: number; hp: number; crit: number }

// ---------- Gear atlas (the uploaded gear sheet, 1920x1072) ----------
const C6: Record<HeroClass, number[]> = {
  warrior: [62, 156, 250, 343, 437, 530],
  mage: [692, 785, 878, 971, 1064, 1157],
  archer: [1320, 1413, 1506, 1599, 1692, 1785],
};
const C8: Record<HeroClass, number[]> = {
  warrior: [66, 134, 202, 270, 338, 406, 474, 542],
  mage: [697, 765, 833, 901, 969, 1037, 1105, 1173],
  archer: [1327, 1395, 1463, 1531, 1599, 1667, 1735, 1803],
};
const ROW6: Partial<Record<Slot, [number, number]>> = {
  helmet: [142, 80], armour: [266, 82], boots: [395, 80], belt: [517, 76], weapon: [633, 115],
};
export const ATLAS_W = 1920;
export const ATLAS_H = 1072;

export function iconRect(item: Pick<Item, "slot" | "cls" | "icon">): { x: number; y: number; w: number; h: number } {
  if (item.slot === "ring") {
    const i = item.icon % 16;
    return { x: C8[item.cls][i % 8], y: i >= 8 ? 856 : 792, w: 58, h: 56 };
  }
  if (item.slot === "talisman") {
    return { x: C8[item.cls][item.icon % 8], y: 958, w: 58, h: 58 };
  }
  const [y, h] = ROW6[item.slot]!;
  return { x: C6[item.cls][item.icon % 6], y, w: 84, h };
}
export function iconCount(slot: Slot) { return slot === "ring" ? 16 : slot === "talisman" ? 8 : 6; }

// ---------- Names ----------
const PREFIX = ["Worn", "Iron", "Bloodforged", "Moonlit", "Dread", "Abyssal", "Crimson", "Soulbound", "Eclipse", "Ancient"];
const SLOT_NAMES: Record<HeroClass, Record<Slot, string>> = {
  warrior: { helmet: "Helm", armour: "Plate", boots: "Greaves", belt: "Girdle", weapon: "Blade", ring: "Signet", talisman: "Sigil" },
  mage: { helmet: "Hood", armour: "Robe", boots: "Slippers", belt: "Sash", weapon: "Wand", ring: "Band", talisman: "Crystal" },
  archer: { helmet: "Cowl", armour: "Jerkin", boots: "Treads", belt: "Quiver Belt", weapon: "Bow", ring: "Loop", talisman: "Fang" },
};
const SUFFIX = ["", "", "of Ash", "of the Moon", "of Ruin", "of Kings", "of the Void", "of Eternity"];

const rnd = (n: number) => Math.floor(Math.random() * n);
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function rollRarity(stage: number, luck: number, minRarity = 0): number {
  const r = Math.random() * 100 - Math.min(25, stage * 0.15 + luck * 0.05);
  let rarity = r < 1 ? 5 : r < 4 ? 4 : r < 12 ? 3 : r < 30 ? 2 : r < 60 ? 1 : 0;
  return Math.max(rarity, minRarity);
}

export function makeItem(cls: HeroClass, ilvl: number, rarity: number, slot?: Slot): Item {
  const s = slot ?? SLOTS[rnd(SLOTS.length)];
  const count = iconCount(s);
  const tier = Math.min(count - 1, Math.floor((rarity / 5) * (count - 1)) + rnd(2));
  const prefix = PREFIX[Math.min(PREFIX.length - 1, rarity * 2 + rnd(2))];
  const suffix = rarity >= 2 ? SUFFIX[rnd(SUFFIX.length)] : "";
  return {
    id: uid(), slot: s, cls, rarity, ilvl: Math.max(1, Math.floor(ilvl)), icon: tier, enh: 0,
    name: `${prefix} ${SLOT_NAMES[cls][s]} ${suffix}`.trim(),
  };
}

const ANC_NAMES: Record<HeroClass, string> = { warrior: "Vanguard", mage: "Arcanist", archer: "Hunt" };
export function makeAncestral(cls: HeroClass, ilvl: number, slot: Slot): Item {
  return { id: uid(), slot, cls, rarity: 6, ilvl: Math.max(1, Math.floor(ilvl)), icon: Math.floor(Math.random() * iconCount(slot)), enh: 0, anc: true,
    name: `Ancestral ${ANC_NAMES[cls]} ${SLOT_NAMES[cls][slot]}` };
}

export function itemStats(it: Item): ItemStats {
  const base = (8 + it.ilvl * 4) * RARITIES[it.rarity].mult * (1 + it.enh * 0.12);
  const z = { atk: 0, def: 0, hp: 0, crit: 0 };
  switch (it.slot) {
    case "weapon": z.atk = base * 1.6; break;
    case "armour": z.def = base * 0.9; z.hp = base * 3; break;
    case "helmet": z.def = base * 0.6; z.hp = base * 2; break;
    case "boots": z.def = base * 0.5; z.atk = base * 0.4; break;
    case "belt": z.hp = base * 3.5; break;
    case "ring": z.atk = base * 0.7; z.crit = 1 + it.rarity * 1.2; break;
    case "talisman": z.atk = base * 0.5; z.hp = base * 1.5; z.crit = it.rarity * 0.6; break;
  }
  return { atk: Math.round(z.atk), def: Math.round(z.def), hp: Math.round(z.hp), crit: +z.crit.toFixed(1) };
}

export function itemScore(it: Item) {
  const s = itemStats(it);
  return s.atk * 2 + s.def * 1.5 + s.hp * 0.2 + s.crit * 10;
}

export function sellValue(it: Item) { return Math.round(it.ilvl * 3 * RARITIES[it.rarity].mult * (1 + it.enh * 0.3)); }
/** What the Night Market charges for a piece, rising with the buyer's level. */
export function buyPrice(it: Item, level = 1) { return scaledGold(sellValue(it) * 4, level); }
/** Enhancing at the Forge: the item's own level and the hero's level both raise the price. */
export function enhanceCost(it: Item, level = 1) { return scaledGold(it.ilvl * 10 * Math.pow(it.enh + 1, 1.5), level); }
export function enhanceChance(it: Item) { return Math.max(0.2, 1 - it.enh * 0.08); }

// ---------- Wearing gear ----------
/** Which wear position a worn item occupies. */
export function posOf(eq: GearRecord, id: string): WearSlot | undefined {
  return WEAR_SLOTS.find((p) => eq[p]?.id === id);
}

/** The piece a new item would displace: nothing while a position is free, else the weakest worn one. */
export function wornCompare(h: { equipment: GearRecord }, it: Item): Item | undefined {
  const pos = wearOf(it.slot);
  if (pos.some((p) => !h.equipment[p])) return undefined;
  return h.equipment[weakestWorn(h.equipment, pos)!];
}

/**
 * Put a piece on: it fills the first free position for its slot, and when every position
 * is taken it replaces the weakest one — a second ring never silently overwrites the first.
 * Returns the position used, or null when the piece could not be worn.
 */
export function equipItem(h: { equipment: GearRecord; inventory: Item[] }, it: Item, at?: WearSlot): WearSlot | null {
  const pos = wearOf(it.slot);
  const target = (at && pos.includes(at) ? at : undefined) ?? pos.find((p) => !h.equipment[p]) ?? weakestWorn(h.equipment, pos);
  if (!target) return null;
  h.inventory = h.inventory.filter((i) => i.id !== it.id);
  const old = h.equipment[target];
  if (old) h.inventory.unshift(old);
  h.equipment[target] = it;
  return target;
}

/** Take a worn piece off into the bag. False when the bag is full or the piece isn't worn. */
export function unequipItem(h: { equipment: GearRecord; inventory: Item[] }, it: Item, cap: number): boolean {
  const pos = posOf(h.equipment, it.id);
  if (!pos || h.inventory.length >= cap) return false;
  delete h.equipment[pos];
  h.inventory.unshift(it);
  return true;
}

function weakestWorn(eq: GearRecord, pos: WearSlot[]): WearSlot | undefined {
  const filled = pos.filter((p) => eq[p]);
  return filled.length ? filled.reduce((a, b) => (itemScore(eq[a]!) <= itemScore(eq[b]!) ? a : b)) : undefined;
}


// ---------- Hero ----------
export interface Hero {
  name: string;
  cls: HeroClass;
  level: number;
  xp: number;
  paragon: number;
  gold: number;
  attrs: Record<Attr, number>;
  equipment: GearRecord;
  inventory: Item[];
  /** Items earned while the bag was full; claim them from the Armory. */
  overflow?: Item[];
  bagRows?: number;
  /** Upgrade levels of castle buildings, by building id (see barracks.ts). */
  buildings?: Record<string, number>;
  /** Daily commission board: day snapshot plus claimed quest ids (see quest-board.ts). */
  daily?: { day: string; base: Record<string, number>; claimed: string[] };
  stage: number;
  spire: number;
  merchant: Item[];
  wins: number;
  quests?: string[];
  anc?: { step: number; relics: number; done: boolean };
  dungeons?: Record<string, number>;
  /** Skill tree ranks by talent id. */
  talents?: Record<string, number>;
  /** Optional chosen combat abilities; absent keeps the legacy full kit. */
  skillLoadout?: string[];
  /** Chosen class specialization id. */
  spec?: string;
  record?: CombatRecord;
  history?: BattleEntry[];
  /** Achievement ids whose one-time reward was claimed. */
  achClaimed?: string[];
  mats?: Partial<Record<Mat, number>>;
  gems?: Record<string, number>;
  astrals?: Astral[];
  astralSlots?: (string | null)[];
  crafts?: number;
  /** Endgame: highest difficulty cleared per challenge boss. */
  challenges?: Record<string, number>;
  /** Passive tree ranks by passive id (see passives.ts). */
  passives?: Record<string, number>;
  /** Insight banked for the passive tree; earned from real campaign, elite, boss and activity results. */
  insight?: number;
  /** Endless "Long Road" progression beyond the campaign (see longroad.ts). */
  road?: { stage: number; wave: number; best: number; cleared: number };
  /** Endless Conquest: tokens earned from cleared floors and spent in the Conquest Gate (see conquest.ts). */
  conquest?: { tokens?: number; blitzDay?: string; blitzUsed?: number };
  /** Barracks drill ranks by drill id (see drills.ts). */
  drills?: Record<string, number>;
  /** Bestiary entries the character has defeated, by bestiary id. */
  kills?: Record<string, number>;
  weekly?: { week: number; kills: number; claimed: boolean };
}

export function newHero(name: string, cls: HeroClass): Hero {
  const weapon = makeItem(cls, 1, 0, "weapon");
  const armour = makeItem(cls, 1, 0, "armour");
  return {
    name, cls, level: 1, xp: 0, paragon: 0, gold: 100,
    attrs: { str: 0, int: 0, agi: 0, vit: 0 },
    equipment: { weapon, armour }, inventory: [], stage: 1, spire: 1, merchant: [], wins: 0,
  };
}

export function xpToNext(h: Pick<Hero, "level" | "paragon">) {
  if (h.level < MAX_LEVEL) return Math.round(60 * Math.pow(h.level, 1.6));
  return Math.round(60 * Math.pow(MAX_LEVEL, 1.6) * Math.pow(1.05, h.paragon));
}

export interface Stats {
  hp: number; atk: number; def: number; crit: number; dodge: number; power: number;
  patk: number; matk: number; pdef: number; mdef: number; critDmg: number; pen: number; acc: number; block: number; heal: number;
}
export interface PowerSource { label: string; power: number }

/** Upgrade old saves (Might/Vitality/Bulwark/Fortune) to Str/Int/Agi/Vit. */
export function normalizeHero(h: Hero): Hero {
  const a = h.attrs as unknown as { str?: number; int?: number; agi?: number; vit?: number; armor?: number; luck?: number };
  if (a.int === undefined || a.agi === undefined) {
    h.attrs = { str: a.str ?? 0, int: 0, agi: a.luck ?? 0, vit: (a.vit ?? 0) + (a.armor ?? 0) };
  }
  return h;
}

const MAGIC: Record<HeroClass, boolean> = { warrior: false, mage: true, archer: false };

function computeStats(h: Hero, opts: { gear: boolean; attrs: boolean; asc: boolean; talents?: boolean }): Stats {
  const tf = opts.talents ? talentFx(h) : { hpPct: 0, atkPct: 0, defPct: 0, crit: 0, dodge: 0, critDmg: 0, pen: 0 };
  const xg = opts.gear ? gemFx(h.equipment) : null; const xa = opts.talents ? astralFx(h) : null;
  // Barracks drills are the hero's permanent training track beside the attribute points (see drills.ts).
  const dr = opts.talents ? drillFx(h) : null;
  const ex = (k: 'matkPct' | 'mdefPct' | 'acc' | 'block' | 'mpen' | 'heal') => (xg?.[k] ?? 0) + (xa?.[k] ?? 0) + (dr?.[k] ?? 0);
  const sf0 = opts.gear ? setFx(h.equipment) : { atkPct: 0, defPct: 0, hpPct: 0, crit: 0 };
  const gf = opts.gear ? gemFx(h.equipment) : null;
  const af = opts.talents ? astralFx(h) : null;
  const sf = {
    atkPct: sf0.atkPct + (gf?.atkPct ?? 0) + (af?.atkPct ?? 0) + (dr?.atkPct ?? 0),
    defPct: sf0.defPct + (gf?.defPct ?? 0) + (af?.defPct ?? 0) + (dr?.defPct ?? 0),
    hpPct: sf0.hpPct + (gf?.hpPct ?? 0) + (af?.hpPct ?? 0) + (dr?.hpPct ?? 0),
    crit: sf0.crit + (gf?.crit ?? 0) + (af?.crit ?? 0) + (dr?.crit ?? 0),
  };
  tf.dodge += (gf?.dodge ?? 0) + (af?.dodge ?? 0) + (dr?.dodge ?? 0); tf.critDmg += (gf?.critDmg ?? 0) + (af?.critDmg ?? 0);
  const pa = 1 + (tf.atkPct + sf.atkPct) / 100, ph = 1 + (tf.hpPct + sf.hpPct) / 100, pd = 1 + (tf.defPct + sf.defPct) / 100;
  const c = CLASSES[h.cls];
  const items = opts.gear ? (Object.values(h.equipment).filter(Boolean) as Item[]) : [];
  const g = items.reduce((a, it) => { const s = itemStats(it); a.atk += s.atk; a.def += s.def; a.hp += s.hp; a.crit += s.crit; return a; }, { atk: 0, def: 0, hp: 0, crit: 0 });
  const at = opts.attrs ? h.attrs : { str: 0, int: 0, agi: 0, vit: 0 };
  const p = opts.asc ? 1 + h.paragon * 0.02 : 1;
  const L = h.level;
  // Per level every stat keeps growing so the campaign never outruns the hero; Vitality is the
  // strongest health lever, and Strength adds a little health on the side.
  const hp = Math.round(ph * ((100 + L * 40 + at.vit * 22 + at.str * 4) * c.hp + g.hp) * p);
  const patk = Math.round(pa * ((10 + L * 5 + at.str * 3 + at.agi * 1.5) * c.atk + (MAGIC[h.cls] ? g.atk * 0.3 : g.atk)) * p);
  const matk = Math.round((pa + ex('matkPct') / 100) * ((10 + L * 5 + at.int * 3.2) * c.atk + (MAGIC[h.cls] ? g.atk : g.atk * 0.3)) * p);
  const pdef = Math.round(pd * ((5 + L * 2.5 + at.vit * 1.5 + at.str * 1) * c.def + g.def) * p);
  const mdef = Math.round((pd + ex('mdefPct') / 100) * ((5 + L * 2.5 + at.vit * 1 + at.int * 1.5) * c.def + g.def * 0.8) * p);
  const crit = Math.min(60, +(5 + c.crit + at.agi * 0.2 + g.crit + tf.crit + sf.crit).toFixed(1));
  const critDmg = Math.min(300, Math.round(150 + at.agi * 0.3 + at.str * 0.15 + tf.critDmg));
  const pen = Math.min(40, +(at.str * 0.08 + at.int * 0.08 + h.paragon * 0.1 + tf.pen + (MAGIC[h.cls] ? ex('mpen') : (gf?.pen ?? 0) + (af?.pen ?? 0))).toFixed(1));
  const acc = Math.min(30, +(at.agi * 0.08 + L * 0.05 + ex('acc')).toFixed(1));
  const block = Math.min(25, +ex('block').toFixed(1));
  const heal = Math.min(50, +ex('heal').toFixed(1));
  const dodge = Math.min(30, +(c.dodge + at.agi * 0.06 + tf.dodge).toFixed(1));
  const atk = MAGIC[h.cls] ? matk : patk;
  const def = Math.round((pdef + mdef) / 2);
  const power = Math.round(atk * 2 + def * 1.5 + hp * 0.2 + crit * 10 + (critDmg - 150) * 4 + pen * 25 + acc * 15 + dodge * 15 + block * 15 + heal * 5);
  return { hp, atk, def, crit, dodge, power, patk, matk, pdef, mdef, critDmg, pen, acc, block, heal };
}

export function heroStats(h: Hero): Stats { return computeStats(h, { gear: true, attrs: true, asc: true, talents: true }); }

/** Battle Rating broken down by real sources (each = marginal gain when added). */
export function powerBreakdown(h: Hero): PowerSource[] {
  const base = computeStats(h, { gear: false, attrs: false, asc: false }).power;
  const withAttrs = computeStats(h, { gear: false, attrs: true, asc: false }).power;
  const withGear = computeStats(h, { gear: true, attrs: true, asc: false }).power;
  const withAsc = computeStats(h, { gear: true, attrs: true, asc: true }).power;
  const total = heroStats(h).power;
  return [
    { label: `Level ${h.level} & class`, power: base },
    { label: "Attributes", power: withAttrs - base },
    { label: "Equipment", power: withGear - withAttrs },
    { label: `Ascension ${h.paragon}`, power: withAsc - withGear },
    { label: "Skill tree, drills & Astrals", power: total - withAsc },
  ];
}
export const powerOf = (s: { hp: number; atk: number; def: number; crit: number }) => Math.round(s.atk * 2 + s.def * 1.5 + s.hp * 0.2 + s.crit * 10);

export function attrCost(points: number) { return Math.round(10 * Math.pow(1.09, points)); }

// ---------- Enemies ----------
export const ENEMIES = {
  goblin: { name: "Goblin Brute", img: goblinImg },
  skeleton: { name: "Bone Reaver", img: skeletonImg },
  demon: { name: "Crimson Fiend", img: demonImg },
  dragon: { name: "Blood-Moon Wyrm", img: dragonImg },
} as const;
export type EnemyType = keyof typeof ENEMIES;

export interface Foe { name: string; img: string; hp: number; atk: number; def: number; crit: number; dodge: number; level: number; boss?: boolean; flip?: boolean }

const ZONES: EnemyType[] = ["goblin", "skeleton", "demon"];
const ZONE_NAMES = ["Goblin Warrens", "Bone Crypts", "Fiend Rift"];

export function zoneOf(stage: number) {
  const z = Math.floor((stage - 1) / 10) % 3;
  return { type: ZONES[z], name: ZONE_NAMES[z], cycle: Math.floor((stage - 1) / 30) + 1 };
}

/** Past the campaign the Road and Conquest keep stretching with a gentle rift bonus. */
export const RIFT_STAGE = 50;
export const riftFactor = (stage: number) => 1 + Math.max(0, stage - RIFT_STAGE) * 0.02;

/**
 * Enemy stats follow the hero's own growth instead of an exponential wall: health and damage
 * climb with the stage at a steady pace, so a hero whose gear keeps up clears the campaign
 * comfortably while bosses stay meaningfully harder.
 */
export function stageFoe(stage: number, mult = 1, type?: EnemyType, name?: string): Foe {
  const boss = stage % 10 === 0;
  const t: EnemyType = type ?? (boss ? "dragon" : zoneOf(stage).type);
  const rift = riftFactor(stage);
  const b = boss ? 1 : 0;
  return {
    name: name ?? (boss ? `${ENEMIES.dragon.name}` : ENEMIES[t].name),
    img: ENEMIES[t].img,
    level: stage,
    boss,
    hp: Math.round((150 + stage * 150) * (1 + b * 0.8) * mult * rift),
    atk: Math.round((12 + stage * 8 + stage * stage * 0.2) * (1 + b * 0.25) * mult * rift),
    def: Math.round((5 + stage * 1.4) * mult * Math.sqrt(rift)),
    crit: Math.min(40, 5 + stage * 0.15),
    dodge: Math.min(20, 2 + stage * 0.05),
  };
}

/** Rewards rise on the same polynomial curve as the experience a level needs (see xpToNext). */
export function stageRewards(stage: number, mult = 1) {
  return {
    xp: Math.round(40 * Math.pow(stage, 1.6) * mult),
    gold: Math.round((12 + 10 * Math.pow(stage, 1.85)) * mult),
  };
}

// ---------- Skills ----------
export interface Skill { id: string; name: string; mult: number; hits?: number; cd: number; heal?: number; stun?: boolean; crit?: boolean; icon: string }
export const SKILLS: Record<HeroClass, Skill[]> = {
  warrior: [
    { id: "strike", name: "Strike", mult: 1, cd: 0, icon: "sword" },
    { id: "cleave", name: "Cleave", mult: 1.9, cd: 3, icon: "axe" },
    { id: "rage", name: "Bloodrage", mult: 2.8, cd: 5, heal: 0.15, icon: "flame" },
  ],
  mage: [
    { id: "bolt", name: "Arcane Bolt", mult: 1, cd: 0, icon: "sparkles" },
    { id: "nova", name: "Frost Nova", mult: 1.5, cd: 4, stun: true, icon: "snowflake" },
    { id: "meteor", name: "Meteor", mult: 3.3, cd: 5, icon: "flame" },
  ],
  archer: [
    { id: "shot", name: "Shot", mult: 1, cd: 0, icon: "target" },
    { id: "volley", name: "Volley", mult: 0.75, hits: 3, cd: 3, icon: "wind" },
    { id: "snipe", name: "Death Snipe", mult: 2.6, cd: 5, crit: true, icon: "crosshair" },
  ],
};

/** Battle abilities for a hero, including skill-tree upgrades. */
export const heroSkills = (h: Hero): Skill[] => talentSkills(SKILLS[h.cls], h);

/** Armor can never reduce a hit below this share of its raw damage, so stacked defense stays
 *  useful without ever making a fight unloseable (or an enemy unkillable). */
export const MITIGATION_FLOOR = 0.3;

export function calcDamage(atk: number, def: number, mult: number, critChance: number, dodge: number, forceCrit = false, critDmg = 200, pen = 0, acc = 0) {
  if (!forceCrit && Math.random() * 100 < Math.max(0, dodge - acc)) return { dmg: 0, crit: false, miss: true };
  const crit = forceCrit || Math.random() * 100 < critChance;
  const raw = atk * mult * (0.9 + Math.random() * 0.2) * (crit ? critDmg / 100 : 1);
  const effDef = def * (1 - Math.min(40, pen) / 100);
  const dmg = Math.max(1, Math.round(raw * Math.max(MITIGATION_FLOOR, 100 / (100 + effDef * 0.9))));
  return { dmg, crit, miss: false };
}

export const BUILDINGS = [
  { id: "hall", name: "Throne Hall", x: 29, y: 24, r: 7, desc: "Skill tree, stats & progression", soon: false },
  { id: "armory", name: "Armory", x: 40, y: 22, r: 4.5, desc: "Inventory & equipment", soon: false },
  { id: "temple", name: "Barracks", x: 54.5, y: 54, r: 5, desc: "Attribute training", soon: false },
  { id: "forge", name: "Blacksmith", x: 63.5, y: 44, r: 4.5, desc: "Enhance & salvage gear", soon: false },
  { id: "oracle", name: "Quest Board", x: 45.5, y: 47, r: 4, desc: "AI-generated quests", soon: false , shortcut: true },
  { id: "portal", name: "Campaign Gate", x: 72, y: 54, r: 5.5, desc: "Campaign stages", soon: false },
  { id: "spire", name: "Conquest Gate", x: 17, y: 46, r: 5, desc: "Endless Conquest · Lv 10+", soon: false },
  { id: "arena", name: "Arena", x: 50, y: 31, r: 6.5, desc: "Fight real players", soon: false },
  { id: "market", name: "Royal Treasury", x: 44, y: 82, r: 5, desc: "Gold & merchant", soon: false },
  { id: "dungeon", name: "Dungeon Gate", x: 24, y: 80, r: 4, desc: "Boss challenges & elites · Lv 20+", soon: false },
  { id: "tower", name: "Magic Tower", x: 66, y: 74, r: 4, desc: "Summon & upgrade Astrals", soon: false },
  { id: "sanctuary", name: "Ancestral Sanctuary", x: 87, y: 42, r: 5, desc: "Ancestral trials & heirloom crafting", soon: false , shortcut: true },
  { id: "gems", name: "Gem Workshop", x: 54.5, y: 71, r: 4, desc: "Cut, socket & fuse gems", soon: false },
  { id: "guild", name: "Guild Hall", x: 35, y: 55, r: 4, desc: "Guilds & guild chat", soon: false },
  { id: "friends", name: "Friends", x: 0, y: 0, r: 0, desc: "Friends & messages", soon: false, shortcut: true },
  { id: "daily", name: "Daily Rewards", x: 46, y: 66, r: 3.5, desc: "Login rewards & activities", soon: false , shortcut: true },
  { id: "worldmap", name: "World Tree", x: 50, y: 49, r: 5, desc: "Explore the world map · raids & bosses", soon: false },
] as const;
/** Buildings physically placed in the castle (shortcut-only screens excluded). */
export const CASTLE_BUILDINGS = BUILDINGS.filter((b) => !("shortcut" in b && b.shortcut));
export type BuildingId = (typeof BUILDINGS)[number]["id"];

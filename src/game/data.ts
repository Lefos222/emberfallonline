import warriorImg from "@/assets/heroes/knight-male-idle.png";
import mageImg from "@/assets/heroes/mage-male-idle.png";
import archerImg from "@/assets/heroes/archer-male-idle.png";
import skeletonImg from "@/assets/enemy-skeleton.png";
import goblinImg from "@/assets/enemy-goblin.png";
import demonImg from "@/assets/enemy-demon.png";
import dragonImg from "@/assets/enemy-dragon.png";
import { talentFx, talentSkills } from "./talents";
import { astralFx, gemFx, migrateGems, normalizeAstrals, zeroFx, zeroGemFx, type Astral, type BonusFx, type Mat } from "./crafting";
import { setFx, type BattleEntry, type CombatRecord } from "./progress";
import { scaledGold } from "./gold";
import { drillAttrs, drillFx } from "./drills";
import { guildFx } from "./guild-tower";
import { normalizeSynth, synthFx } from "./synthesis";

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

export const MAX_LEVEL = 140;
/** Gear can be enhanced this far. The climb is the game's long-term gold sink. */
export const ENHANCE_MAX = 30;
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

/**
 * The best rarity a hero of this level can obtain from the world. Luck alone never replaces the
 * work: nothing above Rare drops before level 40, then Epic, Legendary and finally Mythic open up.
 * Forge recipes are unaffected — those are deliberate, expensive crafts.
 */
export function rarityCap(level: number): number {
  if (level < 40) return 2;
  if (level < 55) return 3;
  if (level < 70) return 4;
  return 5;
}

/**
 * Rarity rolls are deliberately stingy: most drops are common or uncommon at every level, and
 * rare-or-better loot lands about half as often as the old curve paid it out.
 */
export function rollRarity(stage: number, luck: number, minRarity = 0, level = stage): number {
  const r = Math.random() * 100 - Math.min(10, stage * 0.05 + luck * 0.025);
  const rolled = r < 0.1 ? 5 : r < 0.6 ? 4 : r < 2.5 ? 3 : r < 8 ? 2 : r < 30 ? 1 : 0;
  return Math.min(rarityCap(level), Math.max(rolled, minRarity));
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

export function itemStats(it: Item): ItemStats {
  const base = (8 + it.ilvl * 4) * RARITIES[it.rarity].mult * (1 + it.enh * 0.1);
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
/** What the Night Market charges for a piece: a steep markup over salvaging it, rising with the buyer's level. */
export function buyPrice(it: Item, level = 1) { return scaledGold(sellValue(it) * 16, level); }
/**
 * Enhancing at the Forge: the item's own level and the hero's level both raise the price, and each
 * further step costs more than the last. Reaching +30 is a long, deliberate gold sink.
 */
export function enhanceCost(it: Item, level = 1) { return scaledGold(it.ilvl * 2.4 * Math.pow(it.enh + 1, 1.4), level); }
/** Success chance falls gently with the enhancement level, never below the master smith's floor. */
export function enhanceChance(it: Item) { return Math.max(0.35, 1 - it.enh * 0.022); }
/** True when the piece is already at the forge's highest enhancement. */
export const enhanceMaxed = (it: Item) => it.enh >= ENHANCE_MAX;
/** Enchantment Stones needed to enhance: 1 per 3 enhancement levels. */
export const enchantStoneCost = (it: Item) => 1 + Math.floor(it.enh / 3);
/** Using enchantment stones boosts success chance by 15%. */
export const enhanceStoneChance = (it: Item) => Math.min(1, enhanceChance(it) + 0.15);

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
  /** Chosen profile portrait, an index into the shared sheet (see AvatarIcon). */
  avatar?: number;
  gold: number;
  /** Void Crystals: the rare currency of level-ups and boss victories, spent on advanced barracks training. */
  voidCrystals?: number;
  attrs: Record<Attr, number>;
  equipment: GearRecord;
  inventory: Item[];
  /** Items earned while the bag was full; claim them from the Armory. */
  overflow?: Item[];
  bagRows?: number;
  /** Upgrade levels of castle buildings, by building id (see barracks.ts). */
  buildings?: Record<string, number>;
  /** The banner this hero planted on the world map; every lord can read it (see worldcastles.ts). */
  worldCastle?: { x: number; y: number; at: string };
  /** Daily commission board: day snapshot plus claimed quest ids (see quest-board.ts). */
  daily?: { day: string; base: Record<string, number>; claimed: string[] };
  stage: number;
  spire: number;
  merchant: Item[];
  wins: number;
  quests?: string[];
  dungeons?: Record<string, number>;
  /** Skill tree ranks by talent id. */
  talents?: Record<string, number>;
  /** Extra skill points earned from quests and achievements (see talents.ts totalPoints). */
  bonusPts?: number;
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
  /** Campaign Gate stamina for the Greek day (see stamina.ts). */
  stamina?: { day?: string; used?: number };
  /** Current level's quest board: counter snapshot taken when the level began, plus claimed ids (see level-quests.ts). */
  levelQuests?: { level: number; base: Record<string, number>; claimed: string[] };
  /** Barracks drill ranks by drill id (see drills.ts). */
  drills?: Record<string, number>;
  /** Barracks attribute drill ranks by attribute — permanent bonuses to Str/Int/Agi/Vit (see drills.ts). */
  attrDrills?: Record<string, number>;
  /** Advanced (Void Crystal) attribute ranks: endless, five points each (see drills.ts). */
  advancedDrills?: Record<string, number>;
  /** Bestiary entries the character has defeated, by bestiary id. */
  kills?: Record<string, number>;
  weekly?: { week: number; kills: number; claimed: boolean };
  /** Guild coins earned by contributing gold; spent in the guild shop and skill tower. */
  guildCoins?: number;
  /** Guild skill tower ranks by skill id (see guild-tower.ts). */
  guildSkills?: Record<string, number>;
  /** Guild ledger: gold given to the guild and coins spent in the hall (see guild-tower.ts). */
  guildLedger?: { donated?: number; spent?: number };
  /** Synthesis armour: forged pieces ("<tier>:<slot>") and the set worn in each slot (see synthesis.ts). */
  synth?: { crafted?: string[]; worn?: Record<string, number> };
  /** Boss-event participations toward the five-kill reward, by event id (see event-rewards.ts). */
  eventBoss?: Record<string, number>;
  /** 30-day reward board: days claimed this cycle, the Greek day of the last claim, cycles finished (see daily-rewards.ts). */
  dailyRewards?: { day?: number; last?: string; cycles?: number };
  /** Chest items waiting in the vault, by chest id (see chests.ts). */
  chests?: Partial<Record<"gold" | "gem", number>>;
  /** Periodic free reward chest: when it was last collected and how many have been collected (see chests.ts). */
  rewardChest?: { last?: number; claims?: number };

}

const STARTER_NAMES: Partial<Record<Slot, string>> = {
  helmet: "Recruit's Hood", armour: "Recruit's Garb", boots: "Recruit's Boots",
  belt: "Recruit's Belt", talisman: "Recruit's Charm",
};

/** Basic starting gear: common, level 1, and named outside the gear families so a new hero never
 *  begins with a set bonus they did not earn. */
function starterItem(cls: HeroClass, slot: Slot): Item {
  return { id: uid(), slot, cls, rarity: 0, ilvl: 1, icon: 0, enh: 0,
    name: slot === "weapon" ? `Recruit's ${CLASSES[cls].weaponName}` : STARTER_NAMES[slot] ?? "Recruit's Gear" };
}

export function newHero(name: string, cls: HeroClass): Hero {
  // A new hero walks out of the gate fully kitted in common gear: the first zones teach the game
  // instead of demanding a grind. Better pieces still have to be earned (see rarityCap).
  const gear: GearRecord = {
    weapon: starterItem(cls, "weapon"),
    armour: starterItem(cls, "armour"),
    helmet: starterItem(cls, "helmet"),
    boots: starterItem(cls, "boots"),
    belt: starterItem(cls, "belt"),
    talisman: starterItem(cls, "talisman"),
  };
  return {
    name, cls, level: 1, xp: 0, paragon: 0, gold: 100, voidCrystals: 0,
    attrs: { str: 0, int: 0, agi: 0, vit: 0 },
    equipment: gear, inventory: [], stage: 1, spire: 1, merchant: [], wins: 0,
  };
}

export function xpToNext(h: Pick<Hero, "level" | "paragon">) {
  if (h.level < MAX_LEVEL) return Math.round(XP_BASE * Math.pow(h.level, 1.9) * lateLevelFactor(h.level));
  return Math.round(XP_BASE * Math.pow(MAX_LEVEL, 1.9) * lateLevelFactor(MAX_LEVEL) * Math.pow(1.10, h.paragon));
}

/** Base XP for one level — deliberately high so even the earliest levels take many battles. */
export const XP_BASE = 525;
/** Levels past this point get steadily slower so reaching the cap takes months, not weeks. */
export const LATE_LEVEL = 20;
/** Extra XP multiplier per level: 1x up to Lv 20, then +18% compounding each level.
 *  This creates a heavy grind wall after level 20 — each level takes far longer than the last, so
 *  reaching the cap takes months of deliberate grinding. Requirements scale: ~16M at Lv 40,
 *  ~127M at Lv 50, ~942M at Lv 60, ~6.6B at Lv 70, ~45B at Lv 80. */
export function lateLevelFactor(level: number) {
  return Math.pow(1.18, Math.max(0, level - LATE_LEVEL));
}

/** Stages past this point are the hard half of the campaign: foes grow faster than the road below it. */
export const HARD_STAGE = 30;
/** Levels past this point are the deep grind: rewards taper so each level takes many sessions. */
export const GRIND_LEVEL = 20;

/** A hero fighting a stage far above their own level is under-levelled: the campaign pays up to
 *  double XP until they catch up, so a bad stretch never walls a player out of progression. */
export function catchUpXpFactor(level: number, stage: number) {
  return 1 + Math.min(1, Math.max(0, stage - level) * 0.1);
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
  // The seventh (top) rarity tier and its save fields are gone: drop any leftover pieces and
  // fields so older saves keep loading after the tier's removal.
  const maxRarity = RARITIES.length - 1;
  h.inventory = h.inventory.filter((i) => i.rarity <= maxRarity);
  for (const pos of WEAR_SLOTS) {
    const worn = h.equipment[pos];
    if (worn && worn.rarity > maxRarity) delete h.equipment[pos];
  }
  // Enhancement is capped at +30 now: older saves that climbed past it are clamped down.
  for (const it of [...h.inventory, ...WEAR_SLOTS.map((p) => h.equipment[p])]) {
    if (it && it.enh > ENHANCE_MAX) it.enh = ENHANCE_MAX;
  }
  const legacy = h as unknown as { anc?: unknown; ancTower?: unknown };
  delete legacy.anc;
  delete legacy.ancTower;
  // Gems from older saves are remapped onto the eight chart families (see crafting.ts).
  migrateGems(h);
  // Astrals are clamped onto the six-colour, ten-level ladder (see crafting.ts).
  normalizeAstrals(h);
  // Synthesis gear survives every save round-trip; unknown or un-forged pieces are dropped.
  normalizeSynth(h);
  return h;
}

const MAGIC: Record<HeroClass, boolean> = { warrior: false, mage: true, archer: false };

function computeStats(h: Hero, opts: { gear: boolean; attrs: boolean; asc: boolean; talents?: boolean }): Stats {
  const tf = opts.talents ? talentFx(h) : { hpPct: 0, atkPct: 0, defPct: 0, crit: 0, dodge: 0, critDmg: 0, pen: 0 };
  // Gems add the chart's flat stats; Astrals, drills and guild skills stay percentage based.
  const gm = opts.gear ? gemFx(h.equipment) : zeroGemFx();
  const xa = opts.talents ? astralFx(h) : null;
  // Barracks drills are the hero's permanent training track beside the attribute points (see drills.ts).
  const dr = opts.talents ? drillFx(h) : null;
  const gf2 = opts.talents ? guildFx(h) : null;
  // Synthesis armour joins the same percentage pipeline as the other long-term tracks.
  const sy = opts.talents ? synthFx(h) : zeroFx();
  const ex = (k: 'matkPct' | 'mdefPct' | 'acc' | 'block' | 'mpen' | 'heal') => (xa?.[k] ?? 0) + (dr?.[k] ?? 0) + (gf2?.[k] ?? 0) + sy[k];
  const sf0 = opts.gear ? setFx(h.equipment) : { atkPct: 0, defPct: 0, hpPct: 0, crit: 0 };
  const af = opts.talents ? astralFx(h) : null;
  const sf = {
    atkPct: sf0.atkPct + (af?.atkPct ?? 0) + (dr?.atkPct ?? 0) + (gf2?.atkPct ?? 0) + sy.atkPct,
    defPct: sf0.defPct + (af?.defPct ?? 0) + (dr?.defPct ?? 0) + (gf2?.defPct ?? 0) + sy.defPct,
    hpPct: sf0.hpPct + (af?.hpPct ?? 0) + (dr?.hpPct ?? 0) + (gf2?.hpPct ?? 0) + sy.hpPct,
    crit: sf0.crit + (af?.crit ?? 0) + (dr?.crit ?? 0) + (gf2?.crit ?? 0) + sy.crit,
  };
  tf.dodge += (af?.dodge ?? 0) + (dr?.dodge ?? 0) + (gf2?.dodge ?? 0) + sy.dodge;
  tf.critDmg += (af?.critDmg ?? 0) + (gf2?.critDmg ?? 0) + sy.critDmg;
  tf.pen += sy.pen;
  const pa = 1 + (tf.atkPct + sf.atkPct) / 100, ph = 1 + (tf.hpPct + sf.hpPct) / 100, pd = 1 + (tf.defPct + sf.defPct) / 100;
  const c = CLASSES[h.cls];
  const items = opts.gear ? (Object.values(h.equipment).filter(Boolean) as Item[]) : [];
  const g = items.reduce((a, it) => { const s = itemStats(it); a.atk += s.atk; a.def += s.def; a.hp += s.hp; a.crit += s.crit; return a; }, { atk: 0, def: 0, hp: 0, crit: 0 });
  // Barracks attribute drills bank extra points of the four attributes (see drills.ts).
  const da = opts.talents ? drillAttrs(h) : null;
  const at = opts.attrs
    ? { str: h.attrs.str + (da?.str ?? 0), int: h.attrs.int + (da?.int ?? 0), agi: h.attrs.agi + (da?.agi ?? 0), vit: h.attrs.vit + (da?.vit ?? 0) }
    : { str: 0, int: 0, agi: 0, vit: 0 };
  const p = opts.asc ? 1 + h.paragon * 0.02 : 1;
  const L = h.level;
  // Per level every stat keeps growing so the campaign never outruns the hero; Vitality is the
  // strongest health lever, and Strength adds a little health on the side.
  const hp = Math.round(ph * ((100 + L * 40 + at.vit * 22 + at.str * 4) * c.hp + g.hp) * p) + gm.hp;
  const patk = Math.round(pa * ((10 + L * 5 + at.str * 3 + at.agi * 1.5) * c.atk + (MAGIC[h.cls] ? g.atk * 0.3 : g.atk)) * p) + gm.patk;
  const matk = Math.round((pa + ex('matkPct') / 100) * ((10 + L * 5 + at.int * 3.2) * c.atk + (MAGIC[h.cls] ? g.atk : g.atk * 0.3)) * p) + gm.matk;
  const pdef = Math.round(pd * ((5 + L * 2.5 + at.vit * 1.5 + at.str * 1) * c.def + g.def) * p) + gm.pdef;
  const mdef = Math.round((pd + ex('mdefPct') / 100) * ((5 + L * 2.5 + at.vit * 1 + at.int * 1.5) * c.def + g.def * 0.8) * p) + gm.mdef;
  const crit = Math.min(60, +(5 + c.crit + at.agi * 0.2 + g.crit + tf.crit + sf.crit + gm.crit).toFixed(1));
  const critDmg = Math.min(300, Math.round(150 + at.agi * 0.3 + at.str * 0.15 + tf.critDmg));
  const pen = Math.min(40, +(at.str * 0.08 + at.int * 0.08 + h.paragon * 0.1 + tf.pen + (MAGIC[h.cls] ? ex('mpen') : (af?.pen ?? 0) + (gf2?.pen ?? 0))).toFixed(1));
  const acc = Math.min(30, +(at.agi * 0.08 + L * 0.05 + ex('acc')).toFixed(1));
  const block = Math.min(25, +(ex('block') + gm.block).toFixed(1));
  const heal = Math.min(50, +(ex('heal') + gm.charisma).toFixed(1));
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
    { label: "Skill tree, drills, Astrals & Synthesis", power: total - withAsc },
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
  const tough = boss ? 1 + (foeToughness(stage) - 1) * 0.4 : foeToughness(stage);
  // The first levels are deliberately gentle (see earlyEase); from stage 18 this is exactly 1.
  const ease = earlyEase(stage);
  return {
    name: name ?? (boss ? `${ENEMIES.dragon.name}` : ENEMIES[t].name),
    img: ENEMIES[t].img,
    level: stage,
    boss,
    hp: Math.round((150 + stage * 150) * (1 + b * 0.8) * mult * rift * tough * ease),
    atk: Math.round((12 + stage * 8 + stage * stage * 0.2) * (1 + b * 0.25) * mult * rift * tough * ease),
    def: Math.round((5 + stage * 1.4) * mult * Math.sqrt(rift)),
    crit: Math.min(40, 5 + stage * 0.15),
    dodge: Math.min(20, 2 + stage * 0.05),
  };
}

/** Monsters get tougher as you progress: +0.6% health/damage per stage after stage 5 (bosses get 40% of that, they already spike).
 *  From stage 31 the curve steepens by +0.8% compounding each stage (~+49% by stage 80), so the late
 *  campaign is a real wall the hero answers with levels, enhancements, gems and talents. */
export function foeToughness(stage: number) {
  const steady = 1 + Math.max(0, stage - 5) * 0.006;
  return steady * Math.pow(1.008, Math.max(0, stage - HARD_STAGE));
}

/** The opening levels are the tutorial: until this level foes are softer so a new hero keeps moving. */
export const EARLY_GAME_LEVEL = 17;
/** Health/damage multiplier for a stage's foes: 72% at stage 1 climbing to a full 100% from stage 18. */
export function earlyEase(stage: number) {
  const climbed = Math.min(1, Math.max(0, (stage - 1) / EARLY_GAME_LEVEL));
  return 0.72 + 0.28 * climbed;
}

/** Rewards rise with the stage but always stay well below what the next level costs (see xpToNext).
 *  Gold is deliberately scarce: a stage pays a few hundred coins, while one enhancement or barracks
 *  level costs many fights, so coin keeps its value from the first hour to the endgame. */
/** Rewards rise with the stage but taper hard after the mid-game so the XP curve outpaces them.
 *  Gold is deliberately scarce: a stage pays a few hundred coins, while one enhancement or barracks
 *  level costs many fights, so coin keeps its value from the first hour to the endgame. */
export function stageRewards(stage: number, mult = 1) {
  const late = Math.pow(1.012, Math.max(0, stage - HARD_STAGE));
  // After stage 30 rewards grow more slowly than the XP curve, so each level takes many sessions.
  const grindTaper = Math.pow(0.992, Math.max(0, stage - HARD_STAGE));
  return {
    xp: Math.round(22 * Math.pow(stage, 1.5) * late * grindTaper * mult),
    gold: Math.round((6 + 1.5 * Math.pow(stage, 1.55)) * late * mult),
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
  { id: "armory", name: "Armory", x: 41, y: 22, r: 4.5, desc: "Inventory & equipment", soon: false },
  { id: "temple", name: "Barracks", x: 58, y: 57, r: 4.5, desc: "Attribute training", soon: false },
  { id: "forge", name: "Blacksmith", x: 63.5, y: 44, r: 4.5, desc: "Enhance & salvage gear", soon: false },
  { id: "oracle", name: "Quest Board", x: 42, y: 52, r: 3.5, desc: "AI-generated quests", soon: false , shortcut: true },
  { id: "portal", name: "Campaign Gate", x: 72, y: 54, r: 5.5, desc: "Campaign stages", soon: false },
  { id: "spire", name: "Conquest Gate", x: 17, y: 46, r: 5, desc: "Endless Conquest · Lv 10+", soon: false },
  { id: "arena", name: "Arena", x: 50, y: 31, r: 6.5, desc: "Fight real players", soon: false },
  { id: "market", name: "Royal Treasury", x: 44, y: 82, r: 5, desc: "Gold & merchant", soon: false },
  { id: "dungeon", name: "Dungeon Gate", x: 24, y: 80, r: 4, desc: "Boss challenges & elites · Lv 20+", soon: false },
  { id: "tower", name: "Magic Tower", x: 66, y: 74, r: 4, desc: "Summon & upgrade Astrals", soon: false },
  { id: "gems", name: "Gem Workshop", x: 54.5, y: 71, r: 4, desc: "Cut, socket & fuse gems", soon: false },
  { id: "guild", name: "Guild Hall", x: 35, y: 55, r: 4, desc: "Guilds & guild chat", soon: false },
  { id: "friends", name: "Friends", x: 0, y: 0, r: 0, desc: "Friends & messages", soon: false, shortcut: true },
  { id: "daily", name: "Daily Rewards", x: 46, y: 66, r: 3.5, desc: "Login rewards & activities", soon: false , shortcut: true },
  { id: "worldmap", name: "World Tree", x: 50, y: 49, r: 4.5, desc: "Explore the world map · raids & bosses", soon: false },
] as const;
/** Buildings physically placed in the castle (shortcut-only screens excluded). */
export const CASTLE_BUILDINGS = BUILDINGS.filter((b) => !("shortcut" in b && b.shortcut));
export type BuildingId = (typeof BUILDINGS)[number]["id"];

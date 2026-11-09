import warriorImg from "@/assets/heroes/knight-male-idle.png";
import mageImg from "@/assets/heroes/mage-male-idle.png";
import archerImg from "@/assets/heroes/archer-male-idle.png";
import skeletonImg from "@/assets/enemy-skeleton.png";
import goblinImg from "@/assets/enemy-goblin.png";
import demonImg from "@/assets/enemy-demon.png";
import dragonImg from "@/assets/enemy-dragon.png";
import { talentFx, talentSkills } from "./talents";
import { MAX_SOCKETS, astralFx, gemFx, migrateGems, normalizeAstrals, zeroFx, zeroGemFx, type Astral, type BonusFx, type Mat } from "./crafting";
import { setFx, type BattleEntry, type CombatRecord } from "./progress";
import { goldGain, scaledGold } from "./gold";
import { drillAttrs, drillFx, statTrainFx } from "./drills";
import { guildFx } from "./guild-tower";
import { normalizeSynth, synthFx } from "./synthesis";
import { enlightenmentFx, soulFx } from "./enlightenment";
import { renownFx } from "./renown";
import { potionFx } from "./potions";
import { titleFx } from "./titles";
import { normalizeFarm, type FarmState } from "./farm";

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
/** Gear can be enchanted this far. The climb is the game's long-term gold sink. */
export const ENHANCE_MAX = 70;
/** Gold enhancement stops here: beyond +13 the forge only answers to Enchantment Stones. */
export const ENHANCE_GOLD_LIMIT = 13;
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
  /** Painted band of the gear atlas the icon comes from (see ATLAS_BANDS); absent = 0. */
  art?: number;
  enh: number;
  name: string;
  /** True when produced by the Forge (the only source of Rare+ armor). */
  crafted?: boolean;
  /** Socketed gem keys (see crafting.ts), null = empty socket. */
  gems?: (string | null)[];
  /** Extra gem sockets cut into the piece at the Forge, on top of the rarity's own (see crafting.ts). */
  holes?: number;
}

export interface ItemStats { atk: number; def: number; hp: number; crit: number }

// ---------- Gear atlas (one 1920x2144 painting of stacked 1920x1072 bands) ----------
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
/** Height of one painted band of the atlas: every gear update is a full class sheet this tall. */
export const ATLAS_BAND_H = 1072;
/** Bands stacked in `src/assets/gear-atlas.jpg`: 0 = original class gear, 1 = relic collection art. */
export const ATLAS_BANDS = 2;
export const ATLAS_H = ATLAS_BAND_H * ATLAS_BANDS;
/** Both painted gear updates, kept side by side so old and new equipment always coexist. */
export const GEAR_ERAS = [
  { band: 0, name: "Classic", note: "Original class gear sheet" },
  { band: 1, name: "Relic", note: "Relic collection sheet" },
] as const;

/** Where one icon sits inside its band; `band` picks the painted sheet the icon is drawn from. */
export function iconRect(item: Pick<Item, "slot" | "cls" | "icon">, band = 0): { x: number; y: number; w: number; h: number } {
  const top = Math.max(0, Math.min(ATLAS_BANDS - 1, Math.floor(band))) * ATLAS_BAND_H;
  if (item.slot === "ring") {
    const i = item.icon % 16;
    return { x: C8[item.cls][i % 8], y: top + (i >= 8 ? 856 : 792), w: 58, h: 56 };
  }
  if (item.slot === "talisman") {
    return { x: C8[item.cls][item.icon % 8], y: top + 958, w: 58, h: 58 };
  }
  const [y, h] = ROW6[item.slot]!;
  return { x: C6[item.cls][item.icon % 6], y: top + y, w: 84, h };
}
export function iconCount(slot: Slot) { return slot === "ring" ? 16 : slot === "talisman" ? 8 : 6; }

/**
 * The icon a piece of this rarity rolls within its band. Every painted icon of a slot is reachable:
 * the pool is swept once across the rarity ladder, so the full atlas — both bands — is worn in game.
 */
export function iconTier(slot: Slot, rarity: number, rand = Math.random) {
  const count = iconCount(slot);
  const step = count / RARITIES.length;
  return Math.min(count - 1, Math.floor(rarity * step + rand() * (step + 1)));
}

/** A random painted band: ordinary drops and crafts wear art from every gear update. */
export const rollArt = (rand = Math.random) => Math.min(ATLAS_BANDS - 1, Math.floor(rand() * ATLAS_BANDS));

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
  const rolled = r < 0.12 ? 5 : r < 0.7 ? 4 : r < 2.8 ? 3 : r < 8.6 ? 2 : r < 31 ? 1 : 0;
  return Math.min(rarityCap(level), Math.max(rolled, minRarity));
}

export function makeItem(cls: HeroClass, ilvl: number, rarity: number, slot?: Slot): Item {
  const s = slot ?? SLOTS[rnd(SLOTS.length)];
  const prefix = PREFIX[Math.min(PREFIX.length - 1, rarity * 2 + rnd(2))];
  const suffix = rarity >= 2 ? SUFFIX[rnd(SUFFIX.length)] : "";
  return {
    id: uid(), slot: s, cls, rarity, ilvl: Math.max(1, Math.floor(ilvl)),
    icon: iconTier(s, rarity), art: rollArt(), enh: 0,
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
 * further step costs more than the last. Gold carries a piece to +13; the climb to +70 is a long,
 * deliberate sink of Enchantment Stones on top of the gold.
 */
export function enhanceCost(it: Item, level = 1) { return scaledGold(it.ilvl * 2.4 * Math.pow(it.enh + 1, 1.4), level); }
/**
 * Success chance falls with the enhancement level. The opening steps are near-certain, but past
 * the gold limit the roll keeps dropping (nothing below the master smith's 12% floor), so the
 * deep enchantments need Enchantment Stones to stay worth attempting.
 */
export function enhanceChance(it: Item) { return Math.max(0.12, 1 - it.enh * 0.021); }
/** True when gold alone may still buy the next step (+13 is the last one). */
export const goldEnhanceAllowed = (it: Item) => it.enh < ENHANCE_GOLD_LIMIT;
/** True when the piece is already at the forge's highest enchantment. */
export const enhanceMaxed = (it: Item) => it.enh >= ENHANCE_MAX;
/** Enchantment Stones needed to enhance: 1 per 3 enhancement levels. */
export const enchantStoneCost = (it: Item) => 1 + Math.floor(it.enh / 3);
/**
 * The stone grade the next step demands. Grade 1 carries a piece from +13 to +19, then every six
 * steps call for one grade higher, up to a Lv 9 stone for the deepest enchantments.
 */
export const enchantStoneGrade = (it: Item) =>
  Math.max(1, Math.min(9, 1 + Math.floor(Math.max(0, it.enh - (ENHANCE_GOLD_LIMIT - 1)) / 6)));
/**
 * Enchanting with a stone: the stone grade (1-9, see enchant.ts) adds 10% per grade to the roll.
 * The chance never reaches certainty, so even a Lv 9 stone keeps a sliver of bad luck.
 */
export const enhanceStoneChance = (it: Item, stoneLevel = 1) =>
  Math.min(0.99, enhanceChance(it) + Math.max(1, Math.min(9, Math.round(stoneLevel))) * 0.1);

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
  /** Battle Essence: earned from battles after level 20, spent on Enlightenment (see enlightenment.ts). */
  battleEssence?: number;
  /** Enlightenment level: each level grants +1% to attack, defense and health (see enlightenment.ts). */
  enlightenment?: number;
  /** Soul Shards: chance-based drops from battles, spent on permanent stat infusions (see enlightenment.ts). */
  soulShards?: number;
  /** Soul infusion ranks by stat id (see enlightenment.ts). */
  soulInfusions?: Record<string, number>;
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
  /** World Tree: today's bounty ledger and the sealed vaults already broken (see worldtree.ts). */
  worldTree?: {
    bounties?: { day?: string; gold?: number; ore?: number; boss?: number; castle?: number; claimed?: string[] };
    caches?: string[];
  };
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
  /** Enchantment Stones of grades 2-9 by grade; grade 1 lives in `mats.enchantStone` (see enchant.ts). */
  enchantStones?: Record<string, number>;
  astrals?: Astral[];
  astralSlots?: (string | null)[];
  crafts?: number;
  /** Endgame: highest difficulty cleared per challenge boss. */
  challenges?: Record<string, number>;
  /** Passive tree ranks by passive id (see passives.ts). */
  passives?: Record<string, number>;
  /** Insight banked for the passive tree; earned from real campaign, elite, boss and activity results. */
  insight?: number;
  /** Endless Conquest: tokens earned from cleared floors and spent in the Conquest Gate (see conquest.ts). */
  conquest?: { tokens?: number; blitzDay?: string; blitzUsed?: number };
  /** A blitz that is still out on its ten-minute run, with the rewards it will pay when it lands (see blitz-run.ts). */
  blitzRun?: {
    gate: "campaign" | "conquest";
    startedAt: number;
    endsAt: number;
    target: number;
    xp: number;
    gold: number;
    tokens?: number;
  };
  /** Daily stamina for the Greek day and the potions in the pouch (see stamina.ts). */
  stamina?: { day?: string; used?: number; potions?: number };
  /** Blood Arena duels: the 12-hour window that began with the first duel and how many it has spent (see arena-limits.ts). */
  arena?: { windowStart?: number; used?: number };
  /** Stamina Potions in the pouch (its own field since the first stamina system). */
  staminaPotions?: number;
  /** Other consumable potions by id (see potions.ts). */
  potions?: Record<string, number>;
  /** Running elixir buffs: potion id → when the buff ends (see potions.ts). */
  potionBuffs?: Record<string, number>;
  /** Hourly Auction House catalogue stock (see catalogue.ts). */
  catalogue?: { hour: string; items: Item[] };
  /** Current level's quest board: counter snapshot taken when the level began, plus claimed ids (see level-quests.ts). */
  levelQuests?: { level: number; base: Record<string, number>; claimed: string[] };
  /** Barracks drill ranks by drill id (see drills.ts). */
  drills?: Record<string, number>;
  /** Barracks attribute drill ranks by attribute — permanent bonuses to Str/Int/Agi/Vit (see drills.ts). */
  attrDrills?: Record<string, number>;
  /** Advanced (Void Crystal) attribute ranks: endless, five points each (see drills.ts). */
  advancedDrills?: Record<string, number>;
  /** Individual stat training ranks by stat id — permanent percentage bonuses (see drills.ts). */
  statTrains?: Record<string, number>;
  /** Renown earned from won battles, spent on the hero's own permanent upgrades (see renown.ts). */
  renown?: number;
  /** Renown upgrade ranks by track id (see renown.ts). */
  renownRanks?: Record<string, number>;
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
  /** 30-day reward boards: the free board's progress, and the VIP board's own ledger (see daily-rewards.ts). */
  dailyRewards?: {
    day?: number;
    last?: string;
    cycles?: number;
    vip?: { day?: number; last?: string; cycles?: number };
  };
  /** Chest items waiting in the vault, by chest id (see chests.ts). */
  chests?: Partial<Record<"gold" | "gem", number>>;
  /** Periodic free reward chest: when it was last collected and how many have been collected (see chests.ts). */
  rewardChest?: { last?: number; claims?: number };
  /** Relic collection: pieces recovered from the class trials, by piece id (see relics.ts). */
  relics?: { found?: Record<string, number>; clears?: Record<string, number> };
  /** World-reset stamp (see world-reset.ts). A save without the current stamp restarts at level 0. */
  resetAt?: string;
  /** Title ids the hero has claimed (see titles.ts). */
  titleClaimed?: string[];
  /** The currently equipped title id (see titles.ts). */
  equippedTitle?: string;
  /** One-time patch gold grant: 1000 gold per player after the titles/astral patch. */
  patchGoldClaimed?: boolean;
  /** Daily bonus chest: every 30 min till level 30, mostly gold (see daily-chest.ts). */
  dailyChest?: { last?: number; claims?: number };
  /** Astral summon counter for RNG gating (see crafting.ts). */
  astralSummons?: number;
  /** The Farm: its own level, Farm XP, sixteen plots, the Bloodoak and the seed pouch (see farm.ts). */
  farm?: FarmState;

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

/** Levels past this point leave the opening acts: the bill starts climbing a curve. */
export const LATE_LEVEL = 20;
/** Fights a level costs below LATE_LEVEL — the opening still teaches the game without showering levels. */
export const EASY_FIGHTS = 10;
/** Fights the climb adds at LATE_LEVEL itself (+6), then grows with GRIND_RAMP below. */
export const GRIND_FIGHTS = 6;
/** How the extra bill grows level on level: a gentle power curve, never a wall.
 *  A level costs 16 fights at 20, 46 at 30, 69 at 40, 107 at 60, 141 at 80 and 229 at the cap. */
export const GRIND_RAMP = 0.75;
/** Levels past this point are the deep game, where secondary payouts taper (see levelShareScale). */
export const DEEP_LEVEL = 30;

/** Fights one level costs, counted in cleared fights at the hero's own level.
 *  Levels 1–19 cost ten fights each; from level 20 the bill climbs smoothly (16, 20, 25 … 46 at 30,
 *  141 at 80) with no cliff, so a level is a session's work and the road to 80 is about five
 *  thousand wins — weeks of play, never one impossible bill. */
export function fightsToLevel(level: number) {
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  if (lv < LATE_LEVEL) return EASY_FIGHTS;
  return EASY_FIGHTS + Math.round(GRIND_FIGHTS * Math.pow(lv - LATE_LEVEL + 1, GRIND_RAMP));
}

/** XP one fight at this level pays before scrolls and catch-up bonuses (see stageRewards). */
export function xpPerFight(level: number) {
  return stageRewards(Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)))).xp;
}

/** XP the current level still owes, and how many fights at the hero's own level that is. */
export function fightsToNextLevel(h: Pick<Hero, "level" | "paragon" | "xp">) {
  const left = Math.max(0, xpToNext(h) - h.xp);
  return Math.max(1, Math.ceil(left / Math.max(1, xpPerFight(h.level))));
}

export function xpToNext(h: Pick<Hero, "level" | "paragon">) {
  const lv = Math.min(MAX_LEVEL, h.level);
  // One level is worth exactly `fightsToLevel` fights at the hero's own stage, so the campaign
  // pays the same XP per fight at every level and only the fight count moves.
  const base = fightsToLevel(lv) * xpPerFight(lv);
  return h.level < MAX_LEVEL ? base : Math.round(base * Math.pow(1.10, h.paragon));
}

/** Share of its nominal value a level-relative payout (a quest, a commission) is worth at a level.
 *  Below the deep wall it is 1, so a quest is a real slice of the next level. Past the wall the
 *  share shrinks (level 30 ≈ 80%, 40 ≈ 27%, 60 ≈ 11%, floored at 10%): a fixed percentage of an
 *  ever-growing level bill can never carry progression on its own, so fighting stays the engine. */
export function levelShareScale(level: number) {
  if (level < DEEP_LEVEL) return 1;
  return Math.max(0.1, 1 / (1 + 0.25 * (level - DEEP_LEVEL + 1)));
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
    // Cut gem sockets stay inside the forge's limit whatever a save claims.
    if (it && it.holes) it.holes = Math.max(0, Math.min(MAX_SOCKETS, Math.floor(it.holes)));
  }
  const legacy = h as unknown as { anc?: unknown; ancTower?: unknown; road?: unknown };
  delete legacy.anc;
  delete legacy.ancTower;
  // The Long Road is gone: its save cursor is dropped so the Campaign Gate is the only endless path.
  delete legacy.road;
  // Gems from older saves are remapped onto the eight chart families (see crafting.ts).
  migrateGems(h);
  // Astrals are clamped onto the six-colour, ten-level ladder (see crafting.ts).
  normalizeAstrals(h);
  // Synthesis gear survives every save round-trip; unknown or un-forged pieces are dropped.
  normalizeSynth(h);
  // Every character has a farm: older saves get level 1, one tilled plot and no crops.
  normalizeFarm(h);
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
  // Enlightenment and Soul infusions are the post-20 permanent tracks (see enlightenment.ts).
  const en = opts.talents ? enlightenmentFx(h) : zeroFx();
  const so = opts.talents ? soulFx(h) : zeroFx();
  // Renown upgrades are earned by winning fights and belong to the hero alone (see renown.ts).
  const rw = opts.talents ? renownFx(h) : zeroFx();
  // Potion elixirs are timed battle buffs and join the same pipeline (see potions.ts).
  const pb = opts.talents ? potionFx(h) : zeroFx();
  // Equipped title buffs are permanent and join the same pipeline (see titles.ts).
  const tf2 = opts.talents ? titleFx(h) : zeroFx();
  // Individual stat trainings: permanent percentage bonuses from barracks training (see drills.ts).
  const st = opts.talents ? statTrainFx(h) : zeroFx();
  const ex = (k: 'matkPct' | 'mdefPct' | 'acc' | 'block' | 'mpen' | 'heal') => (xa?.[k] ?? 0) + (dr?.[k] ?? 0) + (gf2?.[k] ?? 0) + sy[k] + so[k] + en[k] + pb[k] + tf2[k] + st[k];
  const sf0 = opts.gear ? setFx(h.equipment) : { atkPct: 0, defPct: 0, hpPct: 0, crit: 0 };
  const af = opts.talents ? astralFx(h) : null;
  const sf = {
    atkPct: sf0.atkPct + (af?.atkPct ?? 0) + (dr?.atkPct ?? 0) + (gf2?.atkPct ?? 0) + sy.atkPct + en.atkPct + so.atkPct + rw.atkPct + pb.atkPct + tf2.atkPct + st.atkPct,
    defPct: sf0.defPct + (af?.defPct ?? 0) + (dr?.defPct ?? 0) + (gf2?.defPct ?? 0) + sy.defPct + en.defPct + so.defPct + rw.defPct + pb.defPct + tf2.defPct + st.defPct,
    hpPct: sf0.hpPct + (af?.hpPct ?? 0) + (dr?.hpPct ?? 0) + (gf2?.hpPct ?? 0) + sy.hpPct + en.hpPct + so.hpPct + rw.hpPct + pb.hpPct + tf2.hpPct + st.hpPct,
    crit: sf0.crit + (af?.crit ?? 0) + (dr?.crit ?? 0) + (gf2?.crit ?? 0) + sy.crit + en.crit + so.crit + rw.crit + pb.crit + tf2.crit + st.crit,
  };
  tf.dodge += (af?.dodge ?? 0) + (dr?.dodge ?? 0) + (gf2?.dodge ?? 0) + sy.dodge + so.dodge + rw.dodge + pb.dodge + tf2.dodge + st.dodge;
  tf.critDmg += (af?.critDmg ?? 0) + (gf2?.critDmg ?? 0) + sy.critDmg + rw.critDmg + pb.critDmg + tf2.critDmg + st.critDmg;
  tf.pen += sy.pen + so.pen + pb.pen + tf2.pen + st.pen;
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
  const raw = atk * 2 + def * 1.5 + hp * 0.2 + crit * 10 + (critDmg - 150) * 4 + pen * 25 + acc * 15 + dodge * 15 + block * 15 + heal * 5;
  const power = battleRating(raw, L, h.paragon);
  return { hp, atk, def, crit, dodge, power, patk, matk, pdef, mdef, critDmg, pen, acc, block, heal };
}

/**
 * Battle Rating is the hero's combat score (the same stats every upgrade feeds) amplified by a
 * level curve. That keeps the number climbing into the hundreds of thousands instead of stalling
 * around a hundred thousand at the cap, so every upgrade is worth a visible chunk of rating.
 * Level 1 is unchanged; a level 140 hero sits near 500,000, and Ascension keeps pushing past it.
 */
export const RATING_CAP = 500_000;
export const ratingScale = (level: number, paragon = 0) => {
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return 1 + Math.pow(lv / MAX_LEVEL, 1.7) * 2.4 + Math.max(0, paragon) * 0.03;
};
/** Apply the rating curve to a raw combat score. */
export const battleRating = (raw: number, level: number, paragon = 0) =>
  Math.round(raw * ratingScale(level, paragon));

/** A foe's Battle Rating on the same curve, so "Easy / Fair / Deadly" compares like with like. */
export const foeRating = (foe: Pick<Foe, "hp" | "atk" | "def" | "level">) =>
  battleRating(foe.atk * 2 + foe.def * 1.5 + foe.hp * 0.2, foe.level);

/** How many levels above a chosen stage the world may scale its foes. */
export const WORLD_DRIFT = 20;

/**
 * Enemies level up with the hero: a hero far above a stage meets tougher versions of that stage's
 * foes, up to WORLD_DRIFT levels higher. A level-100 hero returning to stage 1 fights level-21
 * Goblins instead of a tutorial, while the next stage they have not cleared still waits at its
 * own level, so progress is never walled by over-levelling.
 */
export function scaledFoe<T extends Foe>(foe: T, heroLevel: number): T {
  const lv = Math.max(1, Math.floor(heroLevel));
  if (lv <= foe.level) return foe;
  const target = Math.min(lv, foe.level + WORLD_DRIFT);
  const mult = Math.pow(1.03, target - foe.level);
  return {
    ...foe,
    level: target,
    hp: Math.round(foe.hp * mult),
    atk: Math.round(foe.atk * mult),
    def: Math.round(foe.def * Math.sqrt(mult)),
    boss: foe.boss,
  };
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
    { label: "Skills, drills, Astrals, Synthesis, Enlightenment & Renown", power: total - withAsc },
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

/** Extra compounding health/damage every stage past HARD_STAGE. */
export const LATE_GAME_TOUGHNESS = 1.015;
/** Monsters get tougher as you progress: +0.6% health/damage per stage after stage 5 (bosses get 40% of that, they already spike).
 *  From stage 31 the curve steepens hard: +1.5% compounding each stage (~+2.1× by stage 80 and
 *  ~+5.1× by stage 140), so the late campaign is a real wall the hero answers with levels,
 *  enhancements, gems and talents rather than free progression. */
export function foeToughness(stage: number) {
  const steady = 1 + Math.max(0, stage - 5) * 0.006;
  return steady * Math.pow(LATE_GAME_TOUGHNESS, Math.max(0, stage - HARD_STAGE));
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
    gold: goldGain(Math.round((6 + 1.5 * Math.pow(stage, 1.55)) * late * mult), stage),
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
  // The Farm lives on the red tree immediately right of the Campaign Gate — the tree is painted
  // into the castle art (its canopy sits near 80-84% / 50-53%), so this hotspot makes that tree
  // the Farm's door. It keeps clear of the gate's own hotspot so each tap opens its own screen.
  { id: "farm", name: "Farm", x: 82, y: 51.5, r: 4.6, desc: "Seeds, crops & the Bloodoak", soon: false },
  { id: "spire", name: "Conquest Gate", x: 17, y: 46, r: 5, desc: "Endless Conquest · Lv 10+", soon: false },
  { id: "arena", name: "Arena", x: 50, y: 31, r: 6.5, desc: "Fight real players", soon: false },
  { id: "market", name: "Auction House", x: 44, y: 82, r: 5, desc: "Catalogue, shop & player auctions", soon: false },
  { id: "dungeon", name: "Dungeon Gate", x: 24, y: 80, r: 4, desc: "Boss challenges & elites · Lv 20+", soon: false },
  { id: "tower", name: "Magic Tower", x: 66, y: 74, r: 4, desc: "Astral vault · infinite upgrades", soon: false },
  { id: "gems", name: "Gem Workshop", x: 54.5, y: 71, r: 4, desc: "Cut, socket & fuse gems", soon: false },
  { id: "guild", name: "Guild Hall", x: 35, y: 55, r: 4, desc: "Guilds & guild chat", soon: false },
  { id: "friends", name: "Friends", x: 0, y: 0, r: 0, desc: "Friends & messages", soon: false, shortcut: true },
  { id: "daily", name: "Daily Rewards", x: 46, y: 66, r: 3.5, desc: "Login rewards & activities", soon: false , shortcut: true },
  { id: "worldmap", name: "World Tree", x: 50, y: 49, r: 4.5, desc: "Explore the world map · raids & bosses", soon: false },
] as const;
/** Buildings physically placed in the castle (shortcut-only screens excluded). */
export const CASTLE_BUILDINGS = BUILDINGS.filter((b) => !("shortcut" in b && b.shortcut));
export type BuildingId = (typeof BUILDINGS)[number]["id"];

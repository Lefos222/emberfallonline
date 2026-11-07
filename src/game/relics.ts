import {
  equipItem,
  itemScore,
  stageFoe,
  stageRewards,
  uid,
  wearOf,
  type Foe,
  type GearRecord,
  type HeroClass,
  type Item,
  type Slot,
  type WearSlot,
} from "./data";
import { TIER_BOSSES, enemySprite, type SpriteRect } from "./world";

/**
 * Relic Trials — the class wardrobe of Ember Fall.
 *
 * Every class has one painted relic collection cut from the equipment sheet (fire for the
 * knight, arcana for the mage, wildwood for the archer), twelve named pieces per class. The
 * trials are the only source: a win always recovers one piece of the collection, and while
 * pieces are still missing the trial favours those, so a set can always be finished. Later
 * wins reforge a recovered piece at the hero's current level, so the collection keeps pace.
 */

export type RelicRank = 1 | 2 | 3;

export interface RelicPiece {
  id: string;
  name: string;
  slot: Slot;
  icon: number;
  rarity: number;
  rank: RelicRank;
  blurb: string;
}

export interface RelicSet {
  /** First word of every piece name; progress.ts reads sets by this prefix. */
  set: string;
  name: string;
  theme: string;
  blurb: string;
  /** Trial name shown on the rank cards. */
  trial: string;
  /** Crop of the gear atlas that shows this class's panel in the relic band. */
  crop: string;
  boss: { name: string; sprite: SpriteRect };
  pieces: RelicPiece[];
}

const ROMAN = ["I", "II", "III"];
const EPIC = 3;
const LEGENDARY = 4;
const MYTHIC = 5;

const WARRIOR_RELICS: RelicPiece[] = [
  { id: "ember_helm", name: "Emberforged Skullhelm", slot: "helmet", icon: 0, rarity: EPIC, rank: 1, blurb: "A spiked iron skull that drinks the heat of the forge." },
  { id: "ember_plate", name: "Emberforged Magma Plate", slot: "armour", icon: 0, rarity: EPIC, rank: 1, blurb: "Ember seams still glow between the plates." },
  { id: "ember_greaves", name: "Emberforged Cinder Greaves", slot: "boots", icon: 0, rarity: EPIC, rank: 1, blurb: "Every step leaves a print of ash." },
  { id: "ember_girdle", name: "Emberforged Ash Girdle", slot: "belt", icon: 0, rarity: EPIC, rank: 1, blurb: "Bound with the chains of the pyre." },
  { id: "ember_cleaver", name: "Emberforged Obsidian Cleaver", slot: "weapon", icon: 0, rarity: LEGENDARY, rank: 2, blurb: "Jagged volcanic glass on a molten spine." },
  { id: "ember_fang", name: "Emberforged Emberfang Blade", slot: "weapon", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "The edge never cools, only brightens." },
  { id: "ember_crown", name: "Emberforged Flamecrown", slot: "helmet", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "Horns of black iron wreathed in fire." },
  { id: "ember_mail", name: "Emberforged Emberheart Mail", slot: "armour", icon: 3, rarity: LEGENDARY, rank: 2, blurb: "A furnace sealed behind the breastbone." },
  { id: "ember_signet", name: "Emberforged Cinder Signet", slot: "ring", icon: 0, rarity: LEGENDARY, rank: 2, blurb: "Set with a coal that never goes dark." },
  { id: "ember_edge", name: "Emberforged Bloodmoon Edge", slot: "weapon", icon: 4, rarity: MYTHIC, rank: 3, blurb: "Quenched in the blood moon, and still thirsty." },
  { id: "ember_band", name: "Emberforged Molten Band", slot: "ring", icon: 6, rarity: MYTHIC, rank: 3, blurb: "A ring of cooled lava, warm to the touch." },
  { id: "ember_sigil", name: "Emberforged Tyrant's Sigil", slot: "talisman", icon: 0, rarity: MYTHIC, rank: 3, blurb: "The skull of a tyrant who burned with his city." },
];

const MAGE_RELICS: RelicPiece[] = [
  { id: "star_hood", name: "Starweave Astral Hood", slot: "helmet", icon: 0, rarity: EPIC, rank: 1, blurb: "Woven from night sky and a little starlight." },
  { id: "star_robe", name: "Starweave Rune Robe", slot: "armour", icon: 0, rarity: EPIC, rank: 1, blurb: "Runes drift across the cloth as it moves." },
  { id: "star_slippers", name: "Starweave Mana Slippers", slot: "boots", icon: 0, rarity: EPIC, rank: 1, blurb: "They never quite touch the ground." },
  { id: "star_sash", name: "Starweave Constellation Sash", slot: "belt", icon: 0, rarity: EPIC, rank: 1, blurb: "A map of a sky nobody has seen." },
  { id: "star_wand", name: "Starweave Comet Wand", slot: "weapon", icon: 1, rarity: LEGENDARY, rank: 2, blurb: "It trails a tail of violet light." },
  { id: "star_staff", name: "Starweave Eclipse Staff", slot: "weapon", icon: 3, rarity: LEGENDARY, rank: 2, blurb: "A black sun held in a cage of moon-silver." },
  { id: "star_crown", name: "Starweave Oracle Crown", slot: "helmet", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "Worn by those who heard the stars answer." },
  { id: "star_robe2", name: "Starweave Starlit Robe", slot: "armour", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "A thousand small lights stitched in violet thread." },
  { id: "star_band", name: "Starweave Starlight Band", slot: "ring", icon: 1, rarity: LEGENDARY, rank: 2, blurb: "One captured star, turning forever." },
  { id: "star_scepter", name: "Starweave Void Scepter", slot: "weapon", icon: 5, rarity: MYTHIC, rank: 3, blurb: "The empty space between two stars, in a handle." },
  { id: "star_loop", name: "Starweave Nebula Loop", slot: "ring", icon: 7, rarity: MYTHIC, rank: 3, blurb: "A newborn nebula, still collapsing." },
  { id: "star_charm", name: "Starweave Crescent Charm", slot: "talisman", icon: 3, rarity: MYTHIC, rank: 3, blurb: "A crescent moon that remembers being whole." },
];

const ARCHER_RELICS: RelicPiece[] = [
  { id: "verd_cowl", name: "Verdant Owl Cowl", slot: "helmet", icon: 0, rarity: EPIC, rank: 1, blurb: "Still smells of rain and pine resin." },
  { id: "verd_jerkin", name: "Verdant Leafweave Jerkin", slot: "armour", icon: 0, rarity: EPIC, rank: 1, blurb: "Layered leaves that never brown." },
  { id: "verd_treads", name: "Verdant Moss Treads", slot: "boots", icon: 0, rarity: EPIC, rank: 1, blurb: "Silent on stone, silent on snow." },
  { id: "verd_belt", name: "Verdant Quiver Belt", slot: "belt", icon: 0, rarity: EPIC, rank: 1, blurb: "Braided bark with a hunter's buckle." },
  { id: "verd_bow", name: "Verdant Briar Longbow", slot: "weapon", icon: 1, rarity: LEGENDARY, rank: 2, blurb: "Thornwood that grows new limbs in spring." },
  { id: "verd_thorn", name: "Verdant Thornstring", slot: "weapon", icon: 3, rarity: LEGENDARY, rank: 2, blurb: "Every arrow it looses blooms where it lands." },
  { id: "verd_mask", name: "Verdant Wolf Mask", slot: "helmet", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "The forest remembers the hunt." },
  { id: "verd_mail", name: "Verdant Barkhide Mail", slot: "armour", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "Bark, hide and vine, grown into a single hide." },
  { id: "verd_loop", name: "Verdant Vine Loop", slot: "ring", icon: 2, rarity: LEGENDARY, rank: 2, blurb: "A living ring that tightens in battle." },
  { id: "verd_root", name: "Verdant Worldroot Bow", slot: "weapon", icon: 5, rarity: MYTHIC, rank: 3, blurb: "Cut from the root of the World Tree itself." },
  { id: "verd_ring", name: "Verdant Bloom Ring", slot: "ring", icon: 8, rarity: MYTHIC, rank: 3, blurb: "A flower that opens only for its wearer." },
  { id: "verd_fang", name: "Verdant Ancient Fang", slot: "talisman", icon: 5, rarity: MYTHIC, rank: 3, blurb: "A tooth from something older than the forest." },
];

export const RELIC_SETS: Record<HeroClass, RelicSet> = {
  warrior: {
    set: "Emberforged",
    name: "The Emberforged",
    theme: "Fire",
    blurb: "Spiked iron, magma seams and the skulls of tyrants — the armour of the burning legion.",
    trial: "Ember Trial",
    crop: "0% 66%",
    boss: { name: "Vulkan, the Ember Titan", sprite: TIER_BOSSES.vulkan.sprite },
    pieces: WARRIOR_RELICS,
  },
  mage: {
    set: "Starweave",
    name: "The Starweave",
    theme: "Arcana",
    blurb: "Royal purple, starlight and drifting runes — robes cut from the sky between the stars.",
    trial: "Astral Trial",
    crop: "50% 66%",
    boss: { name: "Tenebris, the Void Empress", sprite: TIER_BOSSES.tenebris.sprite },
    pieces: MAGE_RELICS,
  },
  archer: {
    set: "Verdant",
    name: "The Verdant",
    theme: "Wildwood",
    blurb: "Vines, feathers and elder wood — the hunting garb of the old forest.",
    trial: "Wildwood Trial",
    crop: "100% 66%",
    boss: { name: "Oakenheart, the Ancient Treant", sprite: enemySprite(0, 11) },
    pieces: ARCHER_RELICS,
  },
};

/** Set prefixes of the relic collections, e.g. `Emberforged` (see `SET_NAMES` in progress.ts). */
export const RELIC_PREFIXES = Object.values(RELIC_SETS).map((s) => s.set);

/** True for a piece of a class relic collection — the only items drawn from the relic art sheet. */
export const isRelicItem = (name?: string) => !!name && RELIC_PREFIXES.includes(name.split(" ")[0]!);

/** Trial ranks: their level gates and how the warden is scaled on top of a stage at that level. */
export const RELIC_RANKS: { rank: RelicRank; label: string; level: number; hp: number; atk: number }[] = [
  { rank: 1, label: ROMAN[0]!, level: 10, hp: 1.8, atk: 1 },
  { rank: 2, label: ROMAN[1]!, level: 35, hp: 2, atk: 1.1 },
  { rank: 3, label: ROMAN[2]!, level: 60, hp: 1.3, atk: 1.08 },
];

export interface RelicHero {
  cls: HeroClass;
  level: number;
  paragon?: number;
  relics?: { found?: Record<string, number>; clears?: Record<string, number> };
  inventory: Item[];
  equipment: GearRecord;
}

/** Character level including Ascension, exactly like the other level gates. */
export const relicLevel = (h: Pick<RelicHero, "level" | "paragon">) => h.level + (h.paragon ?? 0);
export const relicSet = (cls: HeroClass) => RELIC_SETS[cls];

export function relicRank(h: Pick<RelicHero, "level" | "paragon">, rank: RelicRank) {
  return RELIC_RANKS[rank - 1]!;
}
export function relicUnlocked(h: Pick<RelicHero, "level" | "paragon">, rank: RelicRank) {
  return relicLevel(h) >= relicRank(h, rank).level;
}

const relicFoundCount = (h: Pick<RelicHero, "relics">, id: string) => h.relics?.found?.[id] ?? 0;
export const relicFound = (h: Pick<RelicHero, "relics">, id: string) => relicFoundCount(h, id) > 0;

/** Pieces of the class collection recovered at least once. */
export function recoveredRelics(h: Pick<RelicHero, "cls" | "relics">) {
  return relicSet(h.cls).pieces.filter((p) => relicFound(h, p.id)).length;
}

/** Pieces of the class collection currently worn. */
export function wornRelics(h: Pick<RelicHero, "cls" | "equipment">) {
  const set = relicSet(h.cls).set;
  return Object.values(h.equipment).filter((it) => it && it.name.startsWith(set)).length;
}

/** A fresh piece of the collection at this item level — the trial drop and the codex preview. */
export function relicItem(piece: RelicPiece, cls: HeroClass, ilvl: number): Item {
  return {
    id: uid(), slot: piece.slot, cls, rarity: piece.rarity,
    ilvl: Math.max(1, Math.floor(ilvl)), icon: piece.icon, art: 1, enh: 0, name: piece.name,
  };
}

/**
 * The piece a trial win recovers: the pool is everything this rank can reach, and while the
 * collection is unfinished it strongly favours pieces the hero does not own yet.
 */
export function rollRelic(h: Pick<RelicHero, "cls" | "level" | "paragon" | "relics">, rank: RelicRank, rand = Math.random) {
  const set = relicSet(h.cls);
  const pool = set.pieces.filter((p) => p.rank <= rank);
  const fresh = pool.filter((p) => !relicFound(h, p.id));
  const source = fresh.length && rand() < 0.75 ? fresh : pool;
  const piece = source[Math.min(source.length - 1, Math.floor(rand() * source.length))]!;
  return { piece, item: relicItem(piece, h.cls, relicLevel(h)) };
}

/** Record a recovered piece; true when it was the collection's first of that piece. */
export function noteRelic(h: RelicHero, pieceId: string) {
  const found = { ...(h.relics?.found ?? {}) };
  const first = !found[pieceId];
  found[pieceId] = (found[pieceId] ?? 0) + 1;
  h.relics = { ...(h.relics ?? {}), found };
  return first;
}

/** Count a trial clear, so the panel can show how often each rank has been beaten. */
export function noteRelicClear(h: RelicHero, rank: RelicRank) {
  const clears = { ...(h.relics?.clears ?? {}) };
  const key = `rank${rank}`;
  clears[key] = (clears[key] ?? 0) + 1;
  h.relics = { ...(h.relics ?? {}), clears };
}

export const relicClears = (h: Pick<RelicHero, "relics">, rank: RelicRank) => h.relics?.clears?.[`rank${rank}`] ?? 0;

/** The trial boss: the class collection's warden, scaled to the hero's own level. */
export function relicFoe(h: Pick<RelicHero, "cls" | "level" | "paragon">, rank: RelicRank): Foe & { sprite: SpriteRect } {
  const set = relicSet(h.cls);
  const tier = relicRank(h, rank);
  const lvl = Math.max(1, relicLevel(h));
  const base = stageFoe(Math.max(2, lvl + rank));
  return {
    ...base,
    name: `${set.boss.name} · Rank ${tier.label}`,
    boss: true,
    level: Math.max(1, lvl + rank - 1),
    sprite: set.boss.sprite,
    hp: Math.round(base.hp * tier.hp),
    atk: Math.round(base.atk * tier.atk),
    def: Math.round(base.def * 1.05),
  };
}

/** Trial rewards: a little over a normal fight at the hero's level, rising with the rank. */
export function relicRewards(h: Pick<RelicHero, "level" | "paragon">, rank: RelicRank) {
  const lvl = Math.max(1, relicLevel(h));
  const base = stageRewards(lvl, 1 + (rank - 1) * 0.5);
  return {
    xp: Math.round(base.xp * (1 + rank * 0.5)),
    gold: Math.round(base.gold * (1 + rank)),
  };
}

/**
 * Wear the strongest relics the hero carries, one per wear position, swapping a worn piece
 * only when the relic is actually better. Returns how many pieces were equipped.
 */
export function equipBestRelics(h: RelicHero) {
  const set = relicSet(h.cls).set;
  const candidates = h.inventory.filter((it) => it.name.startsWith(set)).sort((a, b) => itemScore(b) - itemScore(a));
  let equipped = 0;
  for (const it of candidates) {
    if (!h.inventory.some((x) => x.id === it.id)) continue;
    const positions = wearOf(it.slot) as WearSlot[];
    const worn = positions.map((p) => h.equipment[p]).filter((x): x is Item => !!x);
    const weakest = worn.reduce<Item | undefined>((a, b) => (!a || itemScore(b) < itemScore(a) ? b : a), undefined);
    if (worn.length === positions.length && weakest && itemScore(it) <= itemScore(weakest)) continue;
    if (equipItem(h, it)) equipped += 1;
  }
  return equipped;
}

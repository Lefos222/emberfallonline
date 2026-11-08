import type { HeroClass, Item, Slot } from "./data";
import { scaledGold } from "./gold";

// ---------- Materials ----------
export type Mat = "ore" | "essence" | "starshard" | "bossCore" | "fragment" | "sigil" | "hide" | "bloom" | "crystal" | "enchantStone" | "fateStone";
export const MATS: Record<Mat, { name: string; desc: string; src: string; rarity: number }> = {
  ore: { name: "Ember Ore", desc: "Common ore used in crafting and gem cutting.", src: "Every won battle (more in higher regions)", rarity: 0 },
  essence: { name: "Soul Essence", desc: "Distilled souls used in crafting and gem fusion.", src: "Tougher fights, elites, bosses", rarity: 2 },
  starshard: { name: "Starshard", desc: "Summons and upgrades Astrals.", src: "Battles (15%), bosses, weekly activities", rarity: 3 },
  bossCore: { name: "Boss Core", desc: "Heart of a fallen tyrant. Needed for Legendary and Mythic armor.", src: "Campaign bosses and Dungeon Gate challenges", rarity: 4 },
  fragment: { name: "Armor Fragment", desc: "Shards of fine armor. Rare+ armor can only be forged from these.", src: "Monsters (12%), elites, bosses, weekly activities", rarity: 2 },
  sigil: { name: "Elite Sigil", desc: "Trophy of an elite foe. Needed for Epic+ armor.", src: "Elite Hunt and Dungeon Gate bosses", rarity: 3 },
  hide: { name: "Beast Hide", desc: "Hide stripped from slain monsters. Refines into Armor Fragments.", src: "Every won battle (more in higher regions)", rarity: 1 },
  bloom: { name: "Emberbloom", desc: "Fire-touched herb. Refines into Soul Essence.", src: "Won battles and elites", rarity: 1 },
  crystal: { name: "Arcane Crystal", desc: "Crystallised mana. Refines into Starshards.", src: "Elites and Dungeon Gate bosses", rarity: 2 },
  enchantStone: { name: "Enchantment Stone", desc: "A resonant stone used to enchant gear at the Forge instead of gold. Grade 1 of 9 — two of a grade forge the next (see enchant.ts).", src: "Won battles, Auction House shop, guild and Conquest shops", rarity: 3 },
  fateStone: { name: "Fate Stone", desc: "A rare rune-cut stone that refines gear at the Forge instead of gold. One adds a flat +25% to the roll and is spent win or lose (see fate.ts).", src: "Rare battle drops, Auction House shop", rarity: 4 },
};
type Mats = Partial<Record<Mat, number>>;

export interface CraftState {
  cls: HeroClass; level: number; paragon: number; gold: number;
  mats?: Mats; gems?: Record<string, number>; astrals?: Astral[]; astralSlots?: (string | null)[];
  equipment: Partial<Record<Slot, Item>>; inventory: Item[];
  crafts?: number;
}

export const matCount = (h: Pick<CraftState, "mats">, m: Mat) => h.mats?.[m] ?? 0;
export function addMats(h: CraftState, add: Mats) {
  h.mats = { ...(h.mats ?? {}) };
  for (const [k, v] of Object.entries(add) as [Mat, number][]) h.mats[k] = (h.mats[k] ?? 0) + v;
}
export function hasMats(h: CraftState, need: Mats) { return (Object.entries(need) as [Mat, number][]).every(([k, v]) => matCount(h, k) >= v); }
function spendMats(h: CraftState, need: Mats) { for (const [k, v] of Object.entries(need) as [Mat, number][]) h.mats![k] = matCount(h, k) - v; }

/** Materials a piece of gear breaks down into at the Forge. Rarer and higher level gear yields more. */
export function scrapYield(it: Item): Mats {
  const tier = 1 + Math.floor(it.ilvl / 20);
  const enh = Math.floor((it.enh ?? 0) / 2);
  const out: Mats = { ore: (1 + it.rarity) * tier + enh };
  if (it.rarity >= 2) out.fragment = tier + it.rarity - 1;
  if (it.rarity >= 3) out.essence = 1 + Math.floor(it.rarity / 2) + enh;
  if (it.rarity >= 4) out.sigil = 1 + Math.floor(it.rarity / 3);
  if (it.rarity >= 4) out.bossCore = it.rarity >= 5 ? 2 : 1;
  if (it.rarity >= 5) out.starshard = tier + 1;
  return out;
}

/** Salvage a bagged item into materials. Socketed gems return to the pouch; worn gear is never touched. */
export function scrapItem(h: CraftState, itemId: string): string | null {
  const idx = h.inventory.findIndex((i) => i.id === itemId);
  if (idx < 0) return "Equipped gear can't be salvaged - move it to your bag first";
  const it = h.inventory[idx];
  const gems = (it.gems ?? []).filter((g): g is string => !!g);
  if (gems.length) {
    const pouch = { ...(h.gems ?? {}) };
    for (const g of gems) pouch[g] = (pouch[g] ?? 0) + 1;
    h.gems = pouch;
  }
  addMats(h, scrapYield(it));
  h.inventory.splice(idx, 1);
  return null;
}


/** Materials earned from a won battle. Elites/bosses give better ingredients; higher levels give more. */
export function battleMats(level: number, boss: boolean, rand = Math.random, elite = false): Mats {
  const out: Mats = { ore: 1 + Math.floor(level / 10) + Math.floor(rand() * 3) };
  if (boss || elite || rand() < 0.35) out.essence = 1 + (boss ? 2 : elite ? 1 : 0);
  if (boss || rand() < 0.15) out.starshard = boss ? 3 : 1;
  if (boss || elite || rand() < 0.12) out.fragment = boss ? 3 : elite ? 2 : 1;
  if (elite) out.sigil = 1;
  if (boss) out.bossCore = 1;
  out.hide = 1 + Math.floor(level / 15) + (boss ? 3 : elite ? 2 : 0);
  if (rand() < 0.3) out.bloom = 1 + (elite ? 1 : 0);
  if (boss || elite) out.crystal = boss ? 2 : 1;
  return out;
}
export const matsLine = (m: Mats) => (Object.entries(m) as [Mat, number][]).filter(([, v]) => v > 0).map(([k, v]) => `+${v} ${MATS[k].name}`);

/** Spare materials refine into the forge materials that recipes need. */
export const REFINE = [
  { id: "hide", from: "hide" as Mat, need: 3, to: "fragment" as Mat, gain: 1 },
  { id: "bloom", from: "bloom" as Mat, need: 3, to: "essence" as Mat, gain: 1 },
  { id: "crystal", from: "crystal" as Mat, need: 3, to: "starshard" as Mat, gain: 1 },
];
export function refine(h: CraftState, id: string): string | null {
  const r = REFINE.find((x) => x.id === id);
  if (!r) return "Unknown refinement";
  if (matCount(h, r.from) < r.need) return "Not enough " + MATS[r.from].name;
  spendMats(h, { [r.from]: r.need } as Mats);
  addMats(h, { [r.to]: r.gain } as Mats);
  return null;
}

// ---------- Combat bonus stats shared by gems, Astrals and buffs ----------
export interface BonusFx {
  atkPct: number; matkPct: number; defPct: number; mdefPct: number; hpPct: number;
  crit: number; critDmg: number; acc: number; dodge: number; block: number; pen: number; mpen: number; heal: number;
  loot: number; goldScale: number;
}
export type StatKey = keyof BonusFx;
export const STAT_LABEL: Record<StatKey, string> = {
  atkPct: "% Physical Attack", matkPct: "% Magic Attack", defPct: "% Physical Defense", mdefPct: "% Magic Defense", hpPct: "% Max HP",
  crit: "% Crit Chance", critDmg: "% Crit Damage", acc: "% Accuracy", dodge: "% Dodge", block: "% Block", pen: "% Armor Pen", mpen: "% Magic Pen", heal: "% Healing Power",
  loot: "% Loot Chance", goldScale: "% Gold Scaling",
};
export const zeroFx = (): BonusFx => ({ atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0, loot: 0, goldScale: 0 });
export const addFx = (a: BonusFx, b: Partial<BonusFx>) => { for (const k of Object.keys(b) as StatKey[]) a[k] += b[k] ?? 0; return a; };

// ---------- Gems ----------
/** The eight gem families of the gem chart: one per combat stat, twelve upgrade levels each. */
export type GemType = "ruby" | "emerald" | "sapphire" | "topaz" | "amethyst" | "tourmaline" | "aquamarine" | "lapis";
/** The stat a gem family feeds. Flat stats are added as-is; ratings convert to percents. */
export type GemStat = "patk" | "pdef" | "matk" | "mdef" | "crit" | "hp" | "charisma" | "block";
export const GEMS: Record<GemType, { name: string; stat: GemStat; color: string; classes: string; note: string }> = {
  ruby: { name: "Ruby", stat: "patk", color: "#d4283c", classes: "Knight · Archer", note: "Physical attack" },
  emerald: { name: "Emerald", stat: "pdef", color: "#23a85a", classes: "Knight", note: "Physical defence" },
  sapphire: { name: "Sapphire", stat: "matk", color: "#2f6fe0", classes: "Mage", note: "Magic attack" },
  topaz: { name: "Topaz", stat: "mdef", color: "#f2b632", classes: "Mage", note: "Magic defence" },
  amethyst: { name: "Amethyst", stat: "crit", color: "#9b4dd8", classes: "Archer · Mage", note: "Critical chance" },
  tourmaline: { name: "Tourmaline", stat: "hp", color: "#e0528f", classes: "Knight · Mage", note: "Maximum health" },
  aquamarine: { name: "Aquamarine", stat: "charisma", color: "#3fc7d6", classes: "Any", note: "Charisma — healing power" },
  lapis: { name: "Lapis", stat: "block", color: "#2a3f9e", classes: "Knight", note: "Block chance" },
};
export const GEM_TYPES = Object.keys(GEMS) as GemType[];
export const GEM_MAX_TIER = 12;
export const GEM_TIER_NAMES = ["Chipped", "Flawed", "Clear", "Polished", "Flawless", "Radiant", "Royal", "Sovereign", "Celestial", "Ascendant", "Eternal", "Primordial"];
/** The gem chart: each family's value at levels 1-12. Attack, defence and health are flat
 *  stats; crit, charisma and block are ratings of 20 points per percent (the game's stat caps
 *  still apply, so every upgrade keeps moving the stat until it saturates). */
export const GEM_VALUES: Record<GemStat, number[]> = {
  patk: [32, 64, 84, 112, 176, 220, 280, 350, 450, 560, 670, 780],
  pdef: [32, 64, 84, 112, 176, 220, 280, 350, 450, 560, 670, 780],
  matk: [32, 64, 84, 112, 176, 220, 280, 350, 450, 560, 670, 780],
  mdef: [32, 64, 84, 112, 176, 220, 280, 350, 450, 560, 670, 780],
  crit: [16, 32, 42, 56, 88, 120, 180, 260, 360, 480, 580, 660],
  hp: [160, 320, 420, 560, 880, 1100, 1400, 1750, 2250, 2800, 3350, 3900],
  charisma: [8, 16, 21, 28, 44, 60, 90, 130, 180, 240, 290, 330],
  block: [16, 32, 42, 56, 88, 120, 180, 260, 360, 480, 580, 660],
};
/** Rating points that make one percent. */
export const GEM_RATING_PER_POINT = 20;
const GEM_RATED: GemStat[] = ["crit", "charisma", "block"];
export const isRatedGemStat = (s: GemStat) => GEM_RATED.includes(s);
export const GEM_STAT_LABEL: Record<GemStat, string> = {
  patk: "Physical Attack", pdef: "Physical Defence", matk: "Magic Attack", mdef: "Magic Defence",
  crit: "Crit Chance", hp: "Max HP", charisma: "Charisma (Healing)", block: "Block Chance",
};
/** Gem keys look like "ruby:3". */
export const gemKey = (t: GemType, tier: number) => `${t}:${tier}`;
export function parseGem(k: string): { type: GemType; tier: number } | null {
  const [t, n] = k.split(":"); const tier = Number(n);
  return t in GEMS && tier >= 1 && tier <= GEM_MAX_TIER ? { type: t as GemType, tier } : null;
}
export const gemName = (k: string) => { const g = parseGem(k); return g ? `${GEM_TIER_NAMES[g.tier - 1]} ${GEMS[g.type].name}` : "?"; };
/** The chart value of a gem, before ratings are converted to percents. */
export const gemRaw = (k: string) => { const g = parseGem(k); return g ? GEM_VALUES[GEMS[g.type].stat][g.tier - 1] : 0; };
/** The stat a gem actually grants: chart value, with ratings divided into percent points. */
export const gemValue = (k: string) => {
  const g = parseGem(k);
  if (!g) return 0;
  const stat = GEMS[g.type].stat;
  const raw = GEM_VALUES[stat][g.tier - 1];
  return isRatedGemStat(stat) ? +(raw / GEM_RATING_PER_POINT).toFixed(1) : raw;
};
export const gemStatText = (k: string) => { const g = parseGem(k); return g ? `+${gemValue(k)} ${GEM_STAT_LABEL[GEMS[g.type].stat]}` : ""; };
/** Legacy gem families (before the chart renovation) remapped onto the eight chart gems. */
const LEGACY_GEM: Record<string, GemType> = {
  amethyst: "sapphire", sapphire: "emerald", aquamarine: "topaz", emerald: "tourmaline",
  topaz: "amethyst", garnet: "amethyst", peridot: "amethyst", opal: "lapis", onyx: "lapis",
  obsidian: "ruby", moonstone: "sapphire", pearl: "aquamarine",
};
/** Remap gems from older saves onto the chart's families, keeping their level. */
export function migrateGems(h: Pick<CraftState, "gems">) {
  if (!h.gems) return h;
  const out: Record<string, number> = {};
  for (const [k, n] of Object.entries(h.gems)) {
    if (!n) continue;
    const g = parseGem(k);
    let key: string | null = null;
    if (g) key = gemKey(g.type, g.tier);
    else {
      const [t, lv] = k.split(":");
      const to = LEGACY_GEM[t];
      const tier = Math.min(GEM_MAX_TIER, Math.max(1, Math.floor(Number(lv) || 1)));
      if (to) key = gemKey(to, tier);
    }
    if (key) out[key] = (out[key] ?? 0) + n;
  }
  h.gems = out;
  return h;
}
/** No piece of gear can ever hold more than four gems, however many sockets are cut into it. */
export const MAX_SOCKETS = 4;
/** The sockets a piece is born with, by rarity. */
export const baseSockets = (it: Pick<Item, "rarity">) => (it.rarity >= 5 ? 3 : it.rarity >= 3 ? 2 : it.rarity >= 1 ? 1 : 0);
/** Sockets a piece holds right now: its rarity's own plus every hole cut at the Forge. */
export const socketCount = (it: Pick<Item, "rarity"> & { holes?: number }) =>
  Math.min(MAX_SOCKETS, baseSockets(it) + Math.max(0, Math.floor(it.holes ?? 0)));
export const sockets = (it: Item & { gems?: (string | null)[] }) => Array.from({ length: socketCount(it) }, (_, i) => it.gems?.[i] ?? null);
/** Gold the smith charges to cut one more gem socket: each hole costs more than the last. */
export const holeCost = (it: Pick<Item, "rarity"> & { holes?: number }, heroLevel = 1) =>
  scaledGold(1500 + 2500 * socketCount(it) + 600 * it.rarity, heroLevel);
/** Cut an extra gem socket into a piece the hero owns. */
export function cutHole(h: CraftState, itemId: string): string | null {
  const it = findOwned(h, itemId);
  if (!it) return "Item not found";
  if (socketCount(it) >= MAX_SOCKETS) return `This piece already holds ${MAX_SOCKETS} gems`;
  const cost = holeCost(it, h.level);
  if (h.gold < cost) return `Needs ${cost.toLocaleString()} gold`;
  h.gold -= cost;
  it.holes = (it.holes ?? 0) + 1;
  return null;
}

export const FUSE_COUNT = 3;
/** Fusing costs gold (scaled to the hero's level) and one Soul Essence per tier. */
export const fuseCost = (tier: number, level = 1) => ({ gold: scaledGold(200 * tier * tier, level), essence: tier });

function findOwned(h: CraftState, itemId: string): (Item & { gems?: (string | null)[] }) | undefined {
  return (Object.values(h.equipment).find((i) => i?.id === itemId) ?? h.inventory.find((i) => i.id === itemId)) as (Item & { gems?: (string | null)[] }) | undefined;
}

export function insertGem(h: CraftState, itemId: string, socket: number, key: string): string | null {
  const it = findOwned(h, itemId);
  if (!it) return "Item not found";
  if (!parseGem(key)) return "Invalid gem";
  if (socket < 0 || socket >= socketCount(it)) return "No such socket";
  if ((h.gems?.[key] ?? 0) < 1) return "You don't own that gem";
  const cur = sockets(it);
  if (cur[socket]) return "Socket is occupied — remove the gem first";
  cur[socket] = key; it.gems = cur;
  h.gems = { ...h.gems, [key]: h.gems![key] - 1 };
  return null;
}
export function removeGem(h: CraftState, itemId: string, socket: number): string | null {
  const it = findOwned(h, itemId);
  if (!it) return "Item not found";
  const cur = sockets(it); const key = cur[socket];
  if (!key) return "Socket is empty";
  cur[socket] = null; it.gems = cur;
  h.gems = { ...(h.gems ?? {}), [key]: (h.gems?.[key] ?? 0) + 1 };
  return null;
}
/** Replace the gem in a socket (old gem returns to the pouch). */
export function replaceGem(h: CraftState, itemId: string, socket: number, key: string): string | null {
  const it = findOwned(h, itemId);
  if (!it) return "Item not found";
  if ((h.gems?.[key] ?? 0) < 1) return "You don't own that gem";
  if (sockets(it)[socket]) { const e = removeGem(h, itemId, socket); if (e) return e; }
  return insertGem(h, itemId, socket, key);
}
/** Fuse 3 gems of one type & tier into one of the next tier. */
export function fuseGem(h: CraftState, key: string): string | null {
  const g = parseGem(key);
  if (!g) return "Invalid gem";
  if (g.tier >= GEM_MAX_TIER) return "Already max tier";
  if ((h.gems?.[key] ?? 0) < FUSE_COUNT) return `Needs ${FUSE_COUNT} of this gem`;
  const c = fuseCost(g.tier, h.level);
  if (h.gold < c.gold) return "Not enough gold";
  if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
  h.gold -= c.gold; spendMats(h, { essence: c.essence });
  const next = gemKey(g.type, g.tier + 1);
  h.gems = { ...h.gems, [key]: h.gems![key] - FUSE_COUNT, [next]: (h.gems?.[next] ?? 0) + 1 };
  return null;
}
/** Hero level needed before a gem of this level can be forged. */
export const gemCraftLevel = (level: number) => Math.max(1, (level - 1) * 6);
export interface GemCraftCost { ore: number; essence: number; crystal: number; starshard: number; bossCore: number; gold: number }
/** Materials and gold one gem level costs; the gold part rises with the hero's level. */
export const gemCraftCost = (level: number, heroLevel = 1): GemCraftCost => ({
  ore: 10 * level,
  essence: level >= 2 ? 2 * (level - 1) : 0,
  crystal: level >= 4 ? 2 * (level - 3) : 0,
  starshard: level >= 7 ? 3 * (level - 6) : 0,
  bossCore: level >= 10 ? level - 9 : 0,
  gold: scaledGold(200 * level * level, heroLevel),
});
/** What blocks forging a gem of this level right now, or null when it can be forged. */
export function gemBlocker(h: CraftState, level: number): string | null {
  if (level < 1 || level > GEM_MAX_TIER) return "No such gem level";
  const need = gemCraftLevel(level);
  if (h.level < need) return `Requires hero level ${need}`;
  const c = gemCraftCost(level, h.level);
  const costs: [Mat, number][] = [["ore", c.ore], ["essence", c.essence], ["crystal", c.crystal], ["starshard", c.starshard], ["bossCore", c.bossCore]];
  const short = costs.find(([m, n]) => n > 0 && matCount(h, m) < n);
  if (short) return `Not enough ${MATS[short[0]].name}`;
  if (h.gold < c.gold) return "Not enough gold";
  return null;
}
export function addGem(h: CraftState, type: GemType, level: number) {
  const k = gemKey(type, level);
  h.gems = { ...(h.gems ?? {}), [k]: (h.gems?.[k] ?? 0) + 1 };
}
/** Forge a gem of a chosen family and level out of materials and gold. */
export function craftGem(h: CraftState, type: GemType, level: number): string | null {
  const b = gemBlocker(h, level);
  if (b) return b;
  const c = gemCraftCost(level, h.level);
  h.gold -= c.gold;
  spendMats(h, { ore: c.ore, essence: c.essence, crystal: c.crystal, starshard: c.starshard, bossCore: c.bossCore });
  addGem(h, type, level);
  return null;
}

/** Flat bonuses gems add to the hero's stats (see GEM_VALUES). */
export interface GemFx { patk: number; pdef: number; matk: number; mdef: number; hp: number; crit: number; charisma: number; block: number }
export const zeroGemFx = (): GemFx => ({ patk: 0, pdef: 0, matk: 0, mdef: 0, hp: 0, crit: 0, charisma: 0, block: 0 });
export function gemFx(eq: Partial<Record<Slot, Item>>): GemFx {
  const out = zeroGemFx();
  for (const it of Object.values(eq)) {
    if (!it) continue;
    for (const k of sockets(it)) { const g = k && parseGem(k); if (g) out[GEMS[g.type].stat] += gemValue(k!); }
  }
  return out;
}

/** Recommended gem builds per class (players are free to use any gems). */
export const GEM_BUILDS: Record<HeroClass, { name: string; gems: GemType[] }[]> = {
  warrior: [{ name: "Bulwark", gems: ["emerald", "tourmaline", "lapis"] }, { name: "Executioner", gems: ["ruby", "amethyst", "topaz"] }],
  archer: [{ name: "Deadeye", gems: ["amethyst", "ruby", "topaz"] }, { name: "Windrunner", gems: ["ruby", "lapis", "amethyst"] }],
  mage: [{ name: "Archmage", gems: ["sapphire", "amethyst", "aquamarine"] }, { name: "Spellward", gems: ["topaz", "tourmaline", "aquamarine"] }],
};

// ---------- Astrals ----------
export type AstralKind = "offense" | "defense" | "utility";
/** The three families of the vault: Shadow, Chaos and Void. */
export type AstralFamily = "shadow" | "chaos" | "void";
export interface Astral { id: string; base: string; rarity: number; lvl: number }

export interface AstralSpecies {
  name: string;
  kind: AstralKind;
  family: AstralFamily;
  /** This species' own stat mix: one entry per bonus, each worth `per` at Lv 1 of White rarity. */
  stats: [StatKey, number][];
  power: string;
  /** Orb tint for species whose art is drawn rather than painted. */
  color: string;
}

/**
 * The Astral vault. Every species carries its own unique mix of two or three stats, so no two
 * Astrals are interchangeable — the old single-stat species keep their primary exactly as saved
 * saves expect, and gain a small second bonus so they stay worth raising.
 * Keep keys in sync with the bases array in the lucky_shot database function: never rename a key.
 */
export const ASTRAL_BASES: Record<string, AstralSpecies> = {
  ember: { name: "Ember Wyrm", kind: "offense", family: "chaos", stats: [["atkPct", 1.5], ["critDmg", 1.5]], power: "Firebrand: stokes your weapons with living flame", color: "#e2571f" },
  arcana: { name: "Arcane Moth", kind: "offense", family: "void", stats: [["matkPct", 1.5], ["mpen", 0.15]], power: "Spellweave: threads raw arcana through your spells", color: "#6f6ee6" },
  aegis: { name: "Aegis Turtle", kind: "defense", family: "shadow", stats: [["defPct", 1.5], ["block", 0.15]], power: "Bulwark: raises a shield of solid stone around you", color: "#5d8f6d" },
  ward: { name: "Ward Serpent", kind: "defense", family: "shadow", stats: [["mdefPct", 1.5], ["dodge", 0.12]], power: "Warding Coil: coils mystic wards against hostile magic", color: "#2f9e8f" },
  oak: { name: "Elder Oak", kind: "defense", family: "shadow", stats: [["hpPct", 2], ["mdefPct", 0.5]], power: "Deep Roots: roots you in life and thickens your hide", color: "#7a6432" },
  owl: { name: "Star Owl", kind: "utility", family: "void", stats: [["crit", 0.5], ["acc", 0.2]], power: "Keen Gaze: marks the weak points on every foe", color: "#b9c5e0" },
  fang: { name: "Night Fang", kind: "offense", family: "chaos", stats: [["critDmg", 4], ["atkPct", 0.4]], power: "Night Strike: makes every killing blow land deeper", color: "#8b2d63" },
  hawk: { name: "Sky Hawk", kind: "utility", family: "void", stats: [["acc", 0.4], ["crit", 0.15]], power: "Hunter's Eye: guides your strikes true", color: "#3f80c9" },
  wisp: { name: "Wind Wisp", kind: "utility", family: "shadow", stats: [["dodge", 0.4], ["hpPct", 0.4]], power: "Slipstream: wraps you in a gust that turns blows aside", color: "#6fc3d8" },
  turtle: { name: "Stone Tortoise", kind: "defense", family: "shadow", stats: [["block", 0.4], ["defPct", 0.5]], power: "Shellguard: braces you to shrug off the heaviest hits", color: "#8a8377" },
  spear: { name: "Spear Mantis", kind: "offense", family: "chaos", stats: [["pen", 0.4], ["atkPct", 0.6]], power: "Piercing Strike: punches clean through enemy armour", color: "#a6c23a" },
  rune: { name: "Rune Fox", kind: "offense", family: "void", stats: [["mpen", 0.4], ["matkPct", 0.6]], power: "Runebind: carves through magical defences", color: "#c96b2e" },
  lotus: { name: "Moon Lotus", kind: "utility", family: "void", stats: [["heal", 1.5], ["hpPct", 0.6]], power: "Moonbloom: petals that mend wounds and deepen heals", color: "#d3a6d8" },
  // ---- The vault's deeper stones (added in 1.00) ----
  dread: { name: "Dread Core", kind: "offense", family: "chaos", stats: [["atkPct", 2], ["crit", 0.3]], power: "Dread Pulse: every heartbeat of the core sharpens your strikes", color: "#b3122b" },
  grasp: { name: "Void Grasp", kind: "utility", family: "void", stats: [["mpen", 0.55], ["heal", 0.8]], power: "Hungering Reach: tears wards apart and feeds the mending", color: "#4b1e8c" },
  abyssal: { name: "Abyssal Heart", kind: "defense", family: "shadow", stats: [["hpPct", 2.4], ["mdefPct", 0.9]], power: "Cold Tide: pressure of the deep hardens flesh and mind", color: "#123b6b" },
  shadoweye: { name: "Shadow Eye", kind: "utility", family: "shadow", stats: [["crit", 0.6], ["acc", 0.3]], power: "Unblinking: it sees the opening before you do", color: "#3c1f5e" },
  nexus: { name: "Chaos Nexus", kind: "offense", family: "chaos", stats: [["pen", 0.55], ["atkPct", 1]], power: "Discord: armour and guards mean nothing inside the storm", color: "#7d1f6d" },
  cursed: { name: "Cursed Orb", kind: "offense", family: "void", stats: [["matkPct", 2], ["mpen", 0.25]], power: "Hexlight: each curse burned into the glass fuels your spells", color: "#a01a4a" },
  ruinous: { name: "Ruinous Spark", kind: "offense", family: "chaos", stats: [["critDmg", 5], ["crit", 0.2]], power: "Ruin: the last ember of a dead world, hungry for finishing blows", color: "#d4531a" },
  toxic: { name: "Toxic Cradle", kind: "utility", family: "chaos", stats: [["acc", 0.45], ["heal", 1.2]], power: "Venom Bloom: poison it knows, poison it can mend", color: "#2f9e3a" },
  nightmare: { name: "Nightmare Sigil", kind: "defense", family: "void", stats: [["mdefPct", 1.4], ["dodge", 0.25]], power: "Sleepwalker: blows pass through the dream of you", color: "#2a2a6e" },
  lantern: { name: "Soul Lantern", kind: "utility", family: "shadow", stats: [["heal", 2], ["hpPct", 0.8]], power: "Kindled Souls: every fallen foe leaves a little light behind", color: "#c9a227" },
  starfall: { name: "Starfall Shard", kind: "offense", family: "void", stats: [["matkPct", 1.4], ["crit", 0.35]], power: "Falling Star: a splinter of sky that detonates in your wake", color: "#3f6ad8" },
};

export const ASTRAL_FAMILIES: { id: AstralFamily; name: string; blurb: string }[] = [
  { id: "shadow", name: "Shadow", blurb: "Endurance, evasion and the deep cold" },
  { id: "chaos", name: "Chaos", blurb: "Raw force, crits and armour-breaking" },
  { id: "void", name: "Void", blurb: "Magic, accuracy and stolen life" },
];

/** The six rarity colours every Astral is born into: Grey, Green, Blue, Purple, Gold, Red. */
export const ASTRAL_RARITY = ["Grey", "Green", "Blue", "Purple", "Gold", "Red"];
export const ASTRAL_RARITY_NOTE = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
export const ASTRAL_TIER = ASTRAL_RARITY_NOTE;
export const ASTRAL_COLORS = ["#9ca3af", "#3fbf5a", "#3b82f6", "#a855f7", "#facc15", "#e11d48"];
/** How much of its species bonus each rarity carries: a Red Astral is worth far more than a White one. */
export const ASTRAL_RARITY_POWER = [1, 1.35, 1.8, 2.4, 3.2, 4.5];
/** Lucky Shot / summon odds in % per rarity (index = rarity). Must match the lucky_shot database function. */
export const ASTRAL_ODDS = [38.5, 30, 17, 9.5, 4.4, 0.6];
/** Gold cost to summon an Astral of a chosen rarity (base, before level scaling). */
export const ASTRAL_SUMMON_COSTS = [500, 1500, 3000, 5000, 8000, 13000];
/** Minimum total summons before a rarity can be obtained (RNG gate). Red and Gold need 200. */
export const ASTRAL_SUMMON_GATES = [0, 0, 0, 0, 200, 200];
/** Base gold cost for a random summon (rolls any unlocked rarity). */
export const ASTRAL_RANDOM_COST = 500;
export const ASTRAL_SLOTS = 8;
/** Slots 1-3 are open from the start; every further slot wakes every 10 levels. */
export const ASTRAL_SLOT_LEVELS = [1, 1, 1, 10, 20, 30, 40, 50];
/** Share of the species' base bonus one upgrade level adds. Levels never stop. */
export const ASTRAL_LVL_STEP = 0.15;
/** Legacy: still used by the Lucky Shot reward RPC path. */
export const SUMMON_COST = 10; // starshards

/**
 * Gold one Astral level costs. It rises steeply with the level already reached and with rarity,
 * then scales with the hero's level like every other gold price, so deep Astrals are the
 * endgame's grand sink rather than a cheap stat button.
 */
export const astralUpgradeCost = (a: Astral, heroLevel = 1) =>
  scaledGold(Math.round(Math.pow(Math.max(1, a.lvl), 1.7) * (600 + 500 * (a.rarity ?? 0))), heroLevel);

/** Every bonus one Astral grants right now: one entry per species stat. */
export const astralStats = (a: Astral): { stat: StatKey; value: number }[] => {
  const species = ASTRAL_BASES[a.base];
  if (!species) return [];
  const mult = (ASTRAL_RARITY_POWER[a.rarity] ?? 1) * (1 + Math.max(0, a.lvl - 1) * ASTRAL_LVL_STEP);
  return species.stats.map(([stat, per]) => ({ stat, value: +(per * mult).toFixed(1) }));
};

/** Total of everything an Astral grants, used for sorting and quick comparisons. */
export const astralValue = (a: Astral) => +astralStats(a).reduce((sum, s) => sum + s.value, 0).toFixed(1);
export const astralLabel = (a: Astral) => `${ASTRAL_RARITY[a.rarity]} ${ASTRAL_BASES[a.base]?.name ?? "Astral"} Lv${a.lvl}`;
/** Human-readable bonus list, e.g. "+3% Physical Attack, +1.2% Crit Chance". */
export const astralStatText = (a: Astral) =>
  astralStats(a).map((s) => `+${s.value}${STAT_LABEL[s.stat]}`).join(" · ");

export function rollAstralRarity(r: number) {
  let acc = 0;
  for (let i = ASTRAL_ODDS.length - 1; i >= 0; i--) { acc += ASTRAL_ODDS[i]; if (r < acc) return i; }
  return 0;
}

/** Summon an Astral of a chosen rarity for gold. RNG gates prevent summoning above Purple
 *  until 200 total summons have been performed. Costs scale with the hero's level. */
export function summonAstralByRarity(h: CraftState, rarity: number, rand = Math.random): Astral | string {
  const cost = scaledGold(ASTRAL_SUMMON_COSTS[rarity] ?? 500, h.level);
  if (h.gold < cost) return `Needs ${cost.toLocaleString()} gold`;
  // RNG gate: Red and Gold rarities require 200 total summons first.
  const total = (h as { astralSummons?: number }).astralSummons ?? 0;
  if (rarity >= 4 && total < ASTRAL_SUMMON_GATES[rarity]) {
    return `Need ${ASTRAL_SUMMON_GATES[rarity]} total summons before ${ASTRAL_RARITY[rarity]} Astrals can be summoned (${total}/${ASTRAL_SUMMON_GATES[rarity]})`;
  }
  h.gold -= cost;
  (h as { astralSummons?: number }).astralSummons = total + 1;
  const bases = Object.keys(ASTRAL_BASES);
  const a: Astral = { id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), base: bases[Math.floor(rand() * bases.length)], rarity, lvl: 1 };
  h.astrals = [...(h.astrals ?? []), a];
  return a;
}

/** Random summon: rolls any rarity that is unlocked by the summon gate, for 500 gold (level-scaled). */
export function summonAstralRandom(h: CraftState, rand = Math.random): Astral | string {
  const cost = scaledGold(ASTRAL_RANDOM_COST, h.level);
  if (h.gold < cost) return `Needs ${cost.toLocaleString()} gold`;
  const total = (h as { astralSummons?: number }).astralSummons ?? 0;
  (h as { astralSummons?: number }).astralSummons = total + 1;
  // Roll rarity with RNG gates applied: high rarities only appear after enough summons.
  let rarity = rollAstralRarity(rand() * 100);
  if (rarity >= 4 && total < ASTRAL_SUMMON_GATES[rarity]) rarity = Math.min(3, rarity);
  h.gold -= cost;
  const bases = Object.keys(ASTRAL_BASES);
  const a: Astral = { id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), base: bases[Math.floor(rand() * bases.length)], rarity, lvl: 1 };
  h.astrals = [...(h.astrals ?? []), a];
  return a;
}

/** Raise one Astral a level for gold. There is no final level — the price is the only limit. */
export function upgradeAstral(h: CraftState, id: string): string | null {
  const a = h.astrals?.find((x) => x.id === id);
  if (!a) return "Astral not found";
  const cost = astralUpgradeCost(a, h.level);
  if (h.gold < cost) return `Needs ${cost.toLocaleString()} gold`;
  h.gold -= cost;
  a.lvl += 1;
  return null;
}

/** Feed a duplicate (same species, not equipped) into an Astral: +1 level, +1 more for every two rarity steps. */
export function absorbAstral(h: CraftState, targetId: string, foodId: string): string | null {
  const t = h.astrals?.find((x) => x.id === targetId); const f = h.astrals?.find((x) => x.id === foodId);
  if (!t || !f || t.id === f.id) return "Astral not found";
  if (t.base !== f.base) return "Only duplicates of the same species can be absorbed";
  if ((h.astralSlots ?? []).includes(f.id)) return "Unequip the duplicate first";
  t.lvl = Math.max(1, t.lvl) + 1 + Math.floor(f.rarity / 2);
  h.astrals = h.astrals!.filter((x) => x.id !== f.id);
  return null;
}

/** Keep every Astral on a valid colour and level, including ones the server or an old save returns.
 *  Levels are endless now, so only the floor is enforced. */
export function normalizeAstrals(h: { astrals?: Astral[] }) {
  for (const a of h.astrals ?? []) {
    const rarity = Math.round(Number(a.rarity));
    a.rarity = Number.isFinite(rarity) ? Math.min(ASTRAL_RARITY.length - 1, Math.max(0, rarity)) : 0;
    const lvl = Math.round(Number(a.lvl));
    a.lvl = Number.isFinite(lvl) ? Math.max(1, lvl) : 1;
    // Species retired from the table would leave a blank slot; keep them as Astrals of the first species.
    if (!ASTRAL_BASES[a.base]) a.base = Object.keys(ASTRAL_BASES)[0];
  }
}

export function equipAstral(h: CraftState, id: string | null, slot: number): string | null {
  if (slot < 0 || slot >= ASTRAL_SLOTS) return "No such slot";
  if (h.level < ASTRAL_SLOT_LEVELS[slot]) return `Slot ${slot + 1} wakes at level ${ASTRAL_SLOT_LEVELS[slot]}`;
  if (id && !h.astrals?.some((a) => a.id === id)) return "Astral not found";
  const s = Array.from({ length: ASTRAL_SLOTS }, (_, i) => h.astralSlots?.[i] ?? null).map((x) => (x === id ? null : x));
  s[slot] = id; h.astralSlots = s;
  return null;
}
export function astralFx(h: Pick<CraftState, "astrals" | "astralSlots">): BonusFx {
  const out = zeroFx();
  for (const id of h.astralSlots ?? []) {
    const a = id ? h.astrals?.find((x) => x.id === id) : undefined;
    if (!a) continue;
    for (const s of astralStats(a)) out[s.stat] += s.value;
  }
  return out;
}
/** Collection milestone: distinct astral species owned. */
export const ASTRAL_MILESTONES = [{ n: 6, gold: 2500 }, { n: 12, gold: 15000 }, { n: 24, gold: 60000 }];

// ---------- Recipes ----------
export interface Recipe {
  id: string; name: string; rarity: number; mats: Mats; gold: number; minLevel: number; desc: string;
}

/** What a recipe's gold cost comes to for a hero of this level. */
export const recipeGold = (r: Recipe, level = 1) => scaledGold(r.gold, level);

/**
 * Forge prices. Forged gear — armour above all — is a deliberate long-term sink: every recipe
 * asks for roughly 60% more materials and 75% more gold than the original tuning, so a crafted
 * set is a commitment rather than a shortcut past the drop tables.
 */
export const RECIPES: Recipe[] = [
  { id: "rare", name: "Forged Rare piece", rarity: 2, mats: { ore: 32, essence: 4 }, gold: 900, minLevel: 1, desc: "A guaranteed Rare item for the chosen slot." },
  { id: "epic", name: "Forged Epic piece", rarity: 3, mats: { ore: 145, essence: 26 }, gold: 4400, minLevel: 15, desc: "A guaranteed Epic item with 2 sockets." },
  { id: "legend", name: "Boss-forged Legendary", rarity: 4, mats: { ore: 350, essence: 64, bossCore: 10 }, gold: 21000, minLevel: 40, desc: "Legendary gear forged from boss cores." },
  { id: "mythic", name: "Mythic Masterwork", rarity: 5, mats: { ore: 830, essence: 176, bossCore: 32 }, gold: 105000, minLevel: 70, desc: "Mythic gear with 3 sockets." },
  { id: "sentinel", name: "Iron Sentinel", rarity: 3, mats: { ore: 190, essence: 20, fragment: 29, sigil: 8 }, gold: 5600, minLevel: 20, desc: "An Epic sentinel piece forged from elite trophies. Two gem sockets." },
  { id: "starweave", name: "Starweave Relic", rarity: 4, mats: { ore: 305, essence: 80, starshard: 64, bossCore: 10 }, gold: 26000, minLevel: 40, desc: "A Legendary Starweave piece for your chosen slot. Two gem sockets." },
  { id: "voidforged", name: "Voidforged Sovereign", rarity: 5, mats: { ore: 990, essence: 240, starshard: 128, bossCore: 38, sigil: 48 }, gold: 140000, minLevel: 80, desc: "A Mythic sovereign piece for Ascension builds. Three gem sockets." },
];

/** Armor slots: Rare and better armor exists only through crafting. */
export const ARMOR_SLOTS: Slot[] = ["helmet", "armour", "boots", "belt"];
export const isArmor = (s: Slot) => ARMOR_SLOTS.includes(s);
/** Extra ingredients armor recipes need on top of the base recipe. */
export const ARMOR_EXTRA: Record<string, Mats> = { rare: { fragment: 8 }, epic: { fragment: 35, sigil: 6 }, legend: { fragment: 72, sigil: 16 }, mythic: { fragment: 176, sigil: 38 }, sentinel: { fragment: 35, sigil: 6 }, starweave: { fragment: 72, sigil: 16 }, voidforged: { fragment: 176, sigil: 38 } };
export const recipeMats = (r: Recipe, slot: Slot): Mats => {
  if (!isArmor(slot)) return r.mats;
  const out: Mats = { ...r.mats };
  for (const [k, v] of Object.entries(ARMOR_EXTRA[r.id] ?? {}) as [Mat, number][]) out[k] = (out[k] ?? 0) + v;
  return out;
};
export function craftBlocker(h: CraftState, r: Recipe, invCap: number, slot: Slot = "weapon"): string | null {
  if (h.level + h.paragon < r.minLevel) return `Requires level ${r.minLevel}`;
  if (h.gold < recipeGold(r, h.level)) return "Not enough gold";
  if (!hasMats(h, recipeMats(r, slot))) return "Missing materials";
  if (h.inventory.length >= invCap) return "Bag is full";
  return null;
}
/** Spends costs and returns the new item; caller provides item factory. */
export function craft(h: CraftState, r: Recipe, invCap: number, make: () => Item, slot: Slot = "weapon"): Item | string {
  const b = craftBlocker(h, r, invCap, slot);
  if (b) return b;
  h.gold -= recipeGold(r, h.level); spendMats(h, recipeMats(r, slot));
  const it = { ...make(), crafted: true } as Item;
  h.inventory.unshift(it);
  h.crafts = (h.crafts ?? 0) + 1;
  return it;
}

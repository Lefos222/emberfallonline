import type { HeroClass, Item, Slot } from "./data";

// ---------- Materials ----------
export type Mat = "ore" | "essence" | "starshard" | "bossCore" | "fragment" | "sigil";
export const MATS: Record<Mat, { name: string; desc: string; src: string; rarity: number }> = {
  ore: { name: "Ember Ore", desc: "Common ore used in crafting and gem cutting.", src: "Every won battle (more in higher regions)", rarity: 0 },
  essence: { name: "Soul Essence", desc: "Distilled souls used in crafting and gem fusion.", src: "Tougher fights, elites, bosses", rarity: 2 },
  starshard: { name: "Starshard", desc: "Summons and upgrades Astrals.", src: "Battles (15%), bosses, weekly activities", rarity: 3 },
  bossCore: { name: "Boss Core", desc: "Heart of a fallen tyrant. Needed for Legendary and Mythic armor.", src: "Campaign bosses and Dungeon Gate challenges", rarity: 4 },
  fragment: { name: "Armor Fragment", desc: "Shards of fine armor. Rare+ armor can only be forged from these.", src: "Monsters (12%), elites, bosses, weekly activities", rarity: 2 },
  sigil: { name: "Elite Sigil", desc: "Trophy of an elite foe. Needed for Epic+ armor.", src: "Elite Hunt and Dungeon Gate bosses", rarity: 3 },
};
type Mats = Partial<Record<Mat, number>>;

export interface CraftState {
  cls: HeroClass; level: number; paragon: number; gold: number;
  mats?: Mats; gems?: Record<string, number>; astrals?: Astral[]; astralSlots?: (string | null)[];
  equipment: Partial<Record<Slot, Item>>; inventory: Item[];
  crafts?: number;
  anc?: { step: number; relics: number; done: boolean };
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
  return out;
}
export const matsLine = (m: Mats) => (Object.entries(m) as [Mat, number][]).filter(([, v]) => v > 0).map(([k, v]) => `+${v} ${MATS[k].name}`);

// ---------- Combat bonus stats shared by gems, Astrals and buffs ----------
export interface BonusFx {
  atkPct: number; matkPct: number; defPct: number; mdefPct: number; hpPct: number;
  crit: number; critDmg: number; acc: number; dodge: number; block: number; pen: number; mpen: number; heal: number;
}
export type StatKey = keyof BonusFx;
export const STAT_LABEL: Record<StatKey, string> = {
  atkPct: "% Physical Attack", matkPct: "% Magic Attack", defPct: "% Physical Defense", mdefPct: "% Magic Defense", hpPct: "% Max HP",
  crit: "% Crit Chance", critDmg: "% Crit Damage", acc: "% Accuracy", dodge: "% Dodge", block: "% Block", pen: "% Armor Pen", mpen: "% Magic Pen", heal: "% Healing Power",
};
export const zeroFx = (): BonusFx => ({ atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0 });
export const addFx = (a: BonusFx, b: Partial<BonusFx>) => { for (const k of Object.keys(b) as StatKey[]) a[k] += b[k] ?? 0; return a; };

// ---------- Gems ----------
export type GemType = "ruby" | "amethyst" | "sapphire" | "aquamarine" | "emerald" | "topaz" | "garnet" | "peridot" | "opal" | "onyx" | "obsidian" | "moonstone" | "pearl";
export const GEMS: Record<GemType, { name: string; stat: StatKey; per: number; color: string; classes: string }> = {
  ruby: { name: "Ruby", stat: "atkPct", per: 2, color: "#d4283c", classes: "Knight · Archer" },
  amethyst: { name: "Amethyst", stat: "matkPct", per: 2, color: "#9b4dd8", classes: "Mage" },
  sapphire: { name: "Sapphire", stat: "defPct", per: 2, color: "#2f6fe0", classes: "Knight" },
  aquamarine: { name: "Aquamarine", stat: "mdefPct", per: 2, color: "#3fc7d6", classes: "Mage" },
  emerald: { name: "Emerald", stat: "hpPct", per: 2.5, color: "#23a85a", classes: "Knight · Mage" },
  topaz: { name: "Topaz", stat: "crit", per: 0.6, color: "#f2b632", classes: "Archer" },
  garnet: { name: "Garnet", stat: "critDmg", per: 3, color: "#8e1838", classes: "Archer · Knight" },
  peridot: { name: "Peridot", stat: "acc", per: 0.5, color: "#a4d63a", classes: "Archer" },
  opal: { name: "Opal", stat: "dodge", per: 0.4, color: "#e8d9f2", classes: "Archer" },
  onyx: { name: "Onyx", stat: "block", per: 0.5, color: "#5a5a66", classes: "Knight" },
  obsidian: { name: "Obsidian", stat: "pen", per: 0.5, color: "#2b1d3a", classes: "Knight · Archer" },
  moonstone: { name: "Moonstone", stat: "mpen", per: 0.5, color: "#bcd3f5", classes: "Mage" },
  pearl: { name: "Pearl", stat: "heal", per: 2, color: "#f5efe0", classes: "Any" },
};
export const GEM_TYPES = Object.keys(GEMS) as GemType[];
export const GEM_MAX_TIER = 5;
export const GEM_TIER_NAMES = ["Chipped", "Flawed", "Clear", "Flawless", "Royal"];
/** Gem keys look like "ruby:3". */
export const gemKey = (t: GemType, tier: number) => `${t}:${tier}`;
export function parseGem(k: string): { type: GemType; tier: number } | null {
  const [t, n] = k.split(":"); const tier = Number(n);
  return t in GEMS && tier >= 1 && tier <= GEM_MAX_TIER ? { type: t as GemType, tier } : null;
}
export const gemName = (k: string) => { const g = parseGem(k); return g ? `${GEM_TIER_NAMES[g.tier - 1]} ${GEMS[g.type].name}` : "?"; };
/** Bonus a gem gives: per × tier². */
export const gemValue = (k: string) => { const g = parseGem(k); return g ? +(GEMS[g.type].per * g.tier * g.tier).toFixed(1) : 0; };
export const gemStatText = (k: string) => { const g = parseGem(k); return g ? `+${gemValue(k)}${STAT_LABEL[GEMS[g.type].stat]}` : ""; };
export const socketCount = (it: Pick<Item, "rarity">) => (it.rarity >= 5 ? 3 : it.rarity >= 3 ? 2 : it.rarity >= 1 ? 1 : 0);
export const sockets = (it: Item & { gems?: (string | null)[] }) => Array.from({ length: socketCount(it) }, (_, i) => it.gems?.[i] ?? null);

export const FUSE_COUNT = 3;
export const fuseCost = (tier: number) => ({ gold: 200 * tier * tier, essence: tier });

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
  const c = fuseCost(g.tier);
  if (h.gold < c.gold) return "Not enough gold";
  if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
  h.gold -= c.gold; spendMats(h, { essence: c.essence });
  const next = gemKey(g.type, g.tier + 1);
  h.gems = { ...h.gems, [key]: h.gems![key] - FUSE_COUNT, [next]: (h.gems?.[next] ?? 0) + 1 };
  return null;
}
export const GEM_CUT_COST = { ore: 8, gold: 150 };
/** Targeted cut: choose the gem type for triple cost. */
export const GEM_TARGET_COST = { ore: 24, gold: 450, essence: 1 };
/** Cut a tier-1 gem from ore: random type, or a chosen type at GEM_TARGET_COST. */
export function cutGem(h: CraftState, rand = Math.random, type?: GemType): string | null {
  const c = type ? GEM_TARGET_COST : { ...GEM_CUT_COST, essence: 0 };
  if (matCount(h, "ore") < c.ore) return "Not enough Ember Ore";
  if (h.gold < c.gold) return "Not enough gold";
  if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
  h.gold -= c.gold; spendMats(h, { ore: c.ore, essence: c.essence });
  const k = gemKey(type ?? GEM_TYPES[Math.floor(rand() * GEM_TYPES.length)], 1);
  h.gems = { ...(h.gems ?? {}), [k]: (h.gems?.[k] ?? 0) + 1 };
  return k;
}

export function gemFx(eq: Partial<Record<Slot, Item>>): BonusFx {
  const out = zeroFx();
  for (const it of Object.values(eq)) {
    if (!it) continue;
    for (const k of sockets(it)) { const g = k && parseGem(k); if (g) out[GEMS[g.type].stat] += gemValue(k!); }
  }
  return out;
}

/** Recommended gem builds per class (players are free to use any gems). */
export const GEM_BUILDS: Record<HeroClass, { name: string; gems: GemType[] }[]> = {
  warrior: [{ name: "Bulwark", gems: ["sapphire", "emerald", "onyx"] }, { name: "Executioner", gems: ["ruby", "garnet", "obsidian"] }],
  archer: [{ name: "Deadeye", gems: ["topaz", "garnet", "peridot"] }, { name: "Windrunner", gems: ["ruby", "opal", "topaz"] }],
  mage: [{ name: "Archmage", gems: ["amethyst", "moonstone", "topaz"] }, { name: "Spellward", gems: ["aquamarine", "emerald", "pearl"] }],
};

// ---------- Astrals ----------
export type AstralKind = "offense" | "defense" | "utility";
export interface Astral { id: string; base: string; rarity: number; lvl: number }
/** Keep keys in sync with the bases array in the lucky_shot database function. */
export const ASTRAL_BASES: Record<string, { name: string; kind: AstralKind; stat: StatKey; per: number }> = {
  ember: { name: "Ember Wyrm", kind: "offense", stat: "atkPct", per: 1.5 },
  arcana: { name: "Arcane Moth", kind: "offense", stat: "matkPct", per: 1.5 },
  aegis: { name: "Aegis Turtle", kind: "defense", stat: "defPct", per: 1.5 },
  ward: { name: "Ward Serpent", kind: "defense", stat: "mdefPct", per: 1.5 },
  oak: { name: "Elder Oak", kind: "defense", stat: "hpPct", per: 2 },
  owl: { name: "Star Owl", kind: "utility", stat: "crit", per: 0.5 },
  fang: { name: "Night Fang", kind: "offense", stat: "critDmg", per: 4 },
  hawk: { name: "Sky Hawk", kind: "utility", stat: "acc", per: 0.4 },
  wisp: { name: "Wind Wisp", kind: "utility", stat: "dodge", per: 0.4 },
  turtle: { name: "Stone Tortoise", kind: "defense", stat: "block", per: 0.4 },
  spear: { name: "Spear Mantis", kind: "offense", stat: "pen", per: 0.4 },
  rune: { name: "Rune Fox", kind: "offense", stat: "mpen", per: 0.4 },
  lotus: { name: "Moon Lotus", kind: "utility", stat: "heal", per: 1.5 },
};
/** Six rarities: Grey, Green, Blue, Purple, Orange, Gold. */
export const ASTRAL_RARITY = ["Grey", "Green", "Blue", "Purple", "Orange", "Gold"];
export const ASTRAL_TIER = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
export const ASTRAL_COLORS = ["#9a9a9a", "#3fbf5a", "#3b82f6", "#a855f7", "#f97316", "#facc15"];
/** Lucky Shot / summon odds in % per rarity (index = rarity). Must match the lucky_shot database function. */
export const ASTRAL_ODDS = [40, 30, 17, 9, 3.5, 0.5];
export const ASTRAL_SLOTS = 3;
export const ASTRAL_MAX_LVL = 20;
export const SUMMON_COST = 10; // starshards
export const astralUpgradeCost = (a: Astral) => 2 + a.lvl * (a.rarity + 1);
export const astralValue = (a: Astral) => +(ASTRAL_BASES[a.base].per * (1 + a.rarity) * (1 + a.lvl * 0.15)).toFixed(1);
export const astralLabel = (a: Astral) => `${ASTRAL_RARITY[a.rarity]} ${ASTRAL_BASES[a.base]?.name ?? "Astral"} Lv${a.lvl}`;
export const astralStatText = (a: Astral) => `+${astralValue(a)}${STAT_LABEL[ASTRAL_BASES[a.base].stat]}`;

export function rollAstralRarity(r: number) {
  let acc = 0;
  for (let i = ASTRAL_ODDS.length - 1; i >= 0; i--) { acc += ASTRAL_ODDS[i]; if (r < acc) return i; }
  return 0;
}

export function summonAstral(h: CraftState, rand = Math.random): Astral | string {
  if (matCount(h, "starshard") < SUMMON_COST) return `Needs ${SUMMON_COST} Starshards`;
  spendMats(h, { starshard: SUMMON_COST });
  const rarity = rollAstralRarity(rand() * 100);
  const bases = Object.keys(ASTRAL_BASES);
  const a: Astral = { id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), base: bases[Math.floor(rand() * bases.length)], rarity, lvl: 0 };
  h.astrals = [...(h.astrals ?? []), a];
  return a;
}
export function upgradeAstral(h: CraftState, id: string): string | null {
  const a = h.astrals?.find((x) => x.id === id);
  if (!a) return "Astral not found";
  if (a.lvl >= ASTRAL_MAX_LVL) return "Max level";
  const c = astralUpgradeCost(a);
  if (matCount(h, "starshard") < c) return `Needs ${c} Starshards`;
  spendMats(h, { starshard: c }); a.lvl++;
  return null;
}
/** Feed a duplicate (same species, not equipped) into an Astral: +2 levels per duplicate, +1 more per duplicate rarity. */
export function absorbAstral(h: CraftState, targetId: string, foodId: string): string | null {
  const t = h.astrals?.find((x) => x.id === targetId); const f = h.astrals?.find((x) => x.id === foodId);
  if (!t || !f || t.id === f.id) return "Astral not found";
  if (t.base !== f.base) return "Only duplicates of the same species can be absorbed";
  if ((h.astralSlots ?? []).includes(f.id)) return "Unequip the duplicate first";
  if (t.lvl >= ASTRAL_MAX_LVL) return "Max level";
  t.lvl = Math.min(ASTRAL_MAX_LVL, t.lvl + 2 + f.rarity);
  h.astrals = h.astrals!.filter((x) => x.id !== f.id);
  return null;
}
export function equipAstral(h: CraftState, id: string | null, slot: number): string | null {
  if (slot < 0 || slot >= ASTRAL_SLOTS) return "No such slot";
  if (id && !h.astrals?.some((a) => a.id === id)) return "Astral not found";
  const s = Array.from({ length: ASTRAL_SLOTS }, (_, i) => h.astralSlots?.[i] ?? null).map((x) => (x === id ? null : x));
  s[slot] = id; h.astralSlots = s;
  return null;
}
export function astralFx(h: Pick<CraftState, "astrals" | "astralSlots">): BonusFx {
  const out = zeroFx();
  for (const id of h.astralSlots ?? []) {
    const a = id ? h.astrals?.find((x) => x.id === id) : undefined;
    if (a && ASTRAL_BASES[a.base]) out[ASTRAL_BASES[a.base].stat] += astralValue(a);
  }
  return out;
}
/** Collection milestone: distinct astral species owned. */
export const ASTRAL_MILESTONES = [{ n: 3, gold: 1000 }, { n: 6, gold: 5000 }, { n: 13, gold: 25000 }];

// ---------- Recipes ----------
export interface Recipe { id: string; name: string; rarity: number; mats: Mats; gold: number; minLevel: number; desc: string }
export const RECIPES: Recipe[] = [
  { id: "rare", name: "Forged Rare piece", rarity: 2, mats: { ore: 20, essence: 2 }, gold: 500, minLevel: 1, desc: "A guaranteed Rare item for the chosen slot." },
  { id: "epic", name: "Forged Epic piece", rarity: 3, mats: { ore: 50, essence: 8 }, gold: 2500, minLevel: 15, desc: "A guaranteed Epic item with 2 sockets." },
  { id: "legend", name: "Boss-forged Legendary", rarity: 4, mats: { ore: 120, essence: 20, bossCore: 3 }, gold: 12000, minLevel: 35, desc: "Legendary gear forged from boss cores." },
  { id: "mythic", name: "Mythic Masterwork", rarity: 5, mats: { ore: 300, essence: 60, bossCore: 10 }, gold: 60000, minLevel: 60, desc: "Mythic gear with 3 sockets." },
  { id: "sentinel", name: "Iron Sentinel", rarity: 3, mats: { ore: 65, essence: 6, fragment: 8, sigil: 2 }, gold: 3200, minLevel: 20, desc: "An Epic sentinel piece forged from elite trophies. Two gem sockets." },
  { id: "starweave", name: "Starweave Relic", rarity: 4, mats: { ore: 100, essence: 25, starshard: 20, bossCore: 3 }, gold: 15000, minLevel: 40, desc: "A Legendary Starweave piece for your chosen slot. Two gem sockets." },
  { id: "voidforged", name: "Voidforged Sovereign", rarity: 5, mats: { ore: 350, essence: 80, starshard: 40, bossCore: 12, sigil: 15 }, gold: 80000, minLevel: 80, desc: "A Mythic sovereign piece for Ascension builds. Three gem sockets." },
  { id: "ancestral", name: "Ancestral Heirloom", rarity: 6, mats: { ore: 500, essence: 100, bossCore: 20, fragment: 80, sigil: 20 }, gold: 120000, minLevel: 60, desc: "Ancestral gear. Complete the Sanctuary trials to unlock this recipe." },
];
/** Armor slots: Rare and better armor exists only through crafting. */
export const ARMOR_SLOTS: Slot[] = ["helmet", "armour", "boots", "belt"];
export const isArmor = (s: Slot) => ARMOR_SLOTS.includes(s);
/** Extra ingredients armor recipes need on top of the base recipe. */
export const ARMOR_EXTRA: Record<string, Mats> = { rare: { fragment: 5 }, epic: { fragment: 12, sigil: 2 }, legend: { fragment: 25, sigil: 5 }, mythic: { fragment: 60, sigil: 12 }, sentinel: { fragment: 12, sigil: 2 }, starweave: { fragment: 25, sigil: 5 }, voidforged: { fragment: 60, sigil: 12 } };
export const recipeMats = (r: Recipe, slot: Slot): Mats => {
  if (!isArmor(slot)) return r.mats;
  const out: Mats = { ...r.mats };
  for (const [k, v] of Object.entries(ARMOR_EXTRA[r.id] ?? {}) as [Mat, number][]) out[k] = (out[k] ?? 0) + v;
  return out;
};
export function craftBlocker(h: CraftState, r: Recipe, invCap: number, slot: Slot = "weapon"): string | null {
  if (r.id === "ancestral" && !h.anc?.done) return "Complete the Ancestral Sanctuary trials";
  if (h.level + h.paragon < r.minLevel) return `Requires level ${r.minLevel}`;
  if (h.gold < r.gold) return "Not enough gold";
  if (!hasMats(h, recipeMats(r, slot))) return "Missing materials";
  if (h.inventory.length >= invCap) return "Bag is full";
  return null;
}
/** Spends costs and returns the new item; caller provides item factory. */
export function craft(h: CraftState, r: Recipe, invCap: number, make: () => Item, slot: Slot = "weapon"): Item | string {
  const b = craftBlocker(h, r, invCap, slot);
  if (b) return b;
  h.gold -= r.gold; spendMats(h, recipeMats(r, slot));
  const it = { ...make(), crafted: true } as Item;
  h.inventory.unshift(it);
  h.crafts = (h.crafts ?? 0) + 1;
  return it;
}

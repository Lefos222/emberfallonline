import type { HeroClass, Item, Slot } from "./data";

/** Every level costs this many battles, counted by recordBattle below. */
export const BATTLES_PER_LEVEL = 40;
/** The class level cap; Ascension levels take over past it (see MAX_LEVEL in data.ts). */
const LEVEL_CAP = 140;

/**
 * Gold a hero must donate to the guild for one guild rank. Ranks are the guild's own measure of
 * standing (and the reliquary's unlock key), earned by contributing — never bought as skills.
 */
export const GUILD_RANK_GOLD = 5000;
export interface GuildRankState { guildLedger?: { donated?: number; spent?: number } }
export const guildRanks = (h: GuildRankState) =>
  Math.max(0, Math.floor((h.guildLedger?.donated ?? 0) / GUILD_RANK_GOLD));

/** Lifetime combat record saved with the hero. */
export interface CombatRecord { battles: number; wins: number; losses: number; bosses: number; arenaWins: number; enhances: number; bestEnh: number }
export interface BattleEntry { t: number; title: string; won: boolean; boss?: boolean; rewards: string[]; /** The fight's own log, when the player chose to save it. */ log?: string[] }

export interface ProgressState {
  cls: HeroClass; level: number; paragon: number; stage: number; spire: number;
  record?: CombatRecord; history?: BattleEntry[]; achClaimed?: string[];
  equipment: Partial<Record<Slot, Item>>;
  /** Counters other achievement families read from the saved hero. */
  crafts?: number;
  astrals?: { base: string; rarity?: number; lvl?: number }[];
  conquest?: { tokens?: number };
  kills?: Record<string, number>;
  quests?: string[];
  /** Battles fought since the last level-up, and the level they were counted for. */
  levelBattles?: number;
  battleLevel?: number;
  voidCrystals?: number;
  /** Gold given to the guild and coins spent in its hall (see guild-tower.ts). */
  guildLedger?: { donated?: number; spent?: number };
  drills?: Record<string, number>;
  challenges?: Record<string, number>;
  gems?: Record<string, number>;
  synth?: { crafted?: string[]; worn?: Record<string, number> };
  gold?: number;
  buildings?: Record<string, number>;
  dungeons?: Record<string, number>;
  attrDrills?: Record<string, number>;
  advancedDrills?: Record<string, number>;
  rewardChest?: { claims?: number };
  dailyRewards?: { cycles?: number };
  eventBoss?: Record<string, number>;
  /** Relic collection: pieces recovered from the class trials, by piece id (see relics.ts). */
  relics?: { found?: Record<string, number>; clears?: Record<string, number> };
  /** Post-90 Awakening track: Awakening level, Abyss floor, Echo depth, stages, stars and Raiment
   *  (see awakening.ts). Achievement families read it straight from the save. */
  awakening?: import("./awakening").AwakeningState;
  /** Enlightenment level and soul infusion ranks (see enlightenment.ts). */
  enlightenment?: number;
  soulInfusions?: Record<string, number>;
  /** The Farm's own level (see farm.ts). */
  farm?: { level?: number };
  /** Fishing Pier totals (see minigames.ts). */
  fishing?: { caught?: number };
  /** Minigame Hall plays per UTC day, keyed by game id (see minigames.ts). */
  minigames?: { plays?: Record<string, number> };
  /** Gold-mounted steeds owned; Diamond mounts are server-owned and never counted here. */
  mounts?: { owned?: string[] };
  /** Carved rune ranks by rune id (see runes.ts). */
  runes?: Record<string, number>;
  /** Titles the hero has claimed (see titles.ts). */
  titleClaimed?: string[];
  /** World Tree vaults already broken (see worldtree.ts). */
  worldTree?: { caches?: string[] };
  /** Best floor reached in each Spire dungeon, by dungeon id (see spire-party.ts). */
  spireFloors?: Record<string, number>;
  /** Renown training ranks by track id (see renown.ts). */
  renownRanks?: Record<string, number>;
}

export const emptyRecord = (): CombatRecord => ({ battles: 0, wins: 0, losses: 0, bosses: 0, arenaWins: 0, enhances: 0, bestEnh: 0 });
export const HISTORY_CAP = 30;

/** Append a finished battle to the hero's record and history (newest first). */
export function recordBattle(h: ProgressState, e: { title: string; won: boolean; boss?: boolean; arena?: boolean; rewards: string[]; log?: string[] }) {
  const r = { ...emptyRecord(), ...(h.record ?? {}) };
  r.battles++;
  if (e.won) { r.wins++; if (e.boss) r.bosses++; if (e.arena) r.arenaWins++; } else r.losses++;
  h.record = r;
  h.history = [{ t: Date.now(), title: e.title, won: e.won, boss: e.boss, rewards: e.rewards.slice(0, 4), log: e.log?.slice(0, 30) }, ...(h.history ?? [])].slice(0, HISTORY_CAP);
  // Battle progress: every recorded battle is one step toward the next level. A level-up from any
  // other source (a quest, a scroll) resets the count, so "battles to level" never lies.
  if (h.battleLevel !== h.level) { h.levelBattles = 0; h.battleLevel = h.level; }
  h.levelBattles = (h.levelBattles ?? 0) + 1;
  if (h.levelBattles >= BATTLES_PER_LEVEL) {
    h.levelBattles = 0;
    if (h.level < LEVEL_CAP) h.level++; else h.paragon++;
    h.battleLevel = h.level;
    h.voidCrystals = (h.voidCrystals ?? 0) + 2;
  }
}

export function recordEnhance(h: ProgressState, newEnh: number) {
  const r = { ...emptyRecord(), ...(h.record ?? {}) };
  r.enhances++; r.bestEnh = Math.max(r.bestEnh, newEnh);
  h.record = r;
}

// ---------- Achievements ----------
export type AchCategory = "Endless" | "Combat" | "Bosses" | "Progression" | "Awakening" | "Crafting" | "Arena" | "Collection" | "Conquest" | "Enchanting" | "Bestiary" | "Exploration" | "Guild" | "Training" | "Astrals" | "Gems" | "Synthesis" | "Relics" | "Treasure" | "Life" | "Wealth";
/** Every category in the order the Throne Hall lists them. */
export const ACH_CATEGORIES: AchCategory[] = ["Endless", "Combat", "Bosses", "Progression", "Awakening", "Crafting", "Arena", "Collection", "Astrals", "Gems", "Synthesis", "Relics", "Conquest", "Enchanting", "Bestiary", "Exploration", "Guild", "Training", "Treasure", "Life", "Wealth"];
export interface Achievement { id: string; cat: AchCategory; name: string; desc: string; goal: number; gold: number; title?: string; value: (h: ProgressState) => number }

const rec = (h: ProgressState) => ({ ...emptyRecord(), ...(h.record ?? {}) });
/** Total of a saved rank/counter map (kills, drill ranks, tree ranks, …). */
const sum = (map: Record<string, number> | undefined) => Object.values(map ?? {}).reduce((a, n) => a + n, 0);
const tiers = (base: Omit<Achievement, "id" | "goal" | "gold" | "name" | "title">, id: string, names: string[], goals: number[], golds: number[], titles: (string | undefined)[]) =>
  goals.map((goal, i): Achievement => ({ ...base, id: `${id}_${i + 1}`, name: names[i], goal, gold: golds[i], title: titles[i] }));

// Counters the later families read. Astrals, gems and synthesis saves are shaped by crafting.ts and synthesis.ts.
const astrals = (h: ProgressState) => h.astrals ?? [];
const bestAstralLvl = (h: ProgressState) => astrals(h).reduce((m, a) => Math.max(m, a.lvl ?? 1), 0);
const bestAstralRarity = (h: ProgressState) => astrals(h).reduce((m, a) => Math.max(m, (a.rarity ?? 0) + 1), 0);
const astralsOfRarity = (h: ProgressState, rarity: number) => astrals(h).filter((a) => a.rarity === rarity).length;
/** Gems are stored as "<family>:<tier>" keys (see crafting.ts). */
const gemKeys = (h: ProgressState) => Object.keys(h.gems ?? {}).filter((k) => (h.gems?.[k] ?? 0) > 0);
const gemTotal = (h: ProgressState) => Object.values(h.gems ?? {}).reduce((a, n) => a + n, 0);
const gemFamilies = (h: ProgressState) => new Set(gemKeys(h).map((k) => k.split(":")[0])).size;
const bestGemTier = (h: ProgressState) => gemKeys(h).reduce((best, k) => Math.max(best, Number(k.split(":")[1]) || 0), 0);
/** Synthesis pieces are stored as "<tier>:<slot>" keys (see synthesis.ts). */
const synthPieces = (h: ProgressState) => (h.synth?.crafted ?? []).length;
const synthSets = (h: ProgressState) => {
  const perTier: Record<string, number> = {};
  for (const key of h.synth?.crafted ?? []) { const tier = key.split(":")[0]; perTier[tier] = (perTier[tier] ?? 0) + 1; }
  return Object.values(perTier).filter((n) => n >= 8).length;
};
const synthWorn = (h: ProgressState) => Object.keys(h.synth?.worn ?? {}).length;
/** Relic pieces recovered at least once, and total trial wins (see relics.ts). */
const relicPieces = (h: ProgressState) => Object.values(h.relics?.found ?? {}).filter((n) => n > 0).length;
const relicClears = (h: ProgressState) => sum(h.relics?.clears);
/** The sanctum's own counters, read straight from the saved Awakening state (see awakening.ts).
 *  Declared locally so this module keeps no type dependency on the sanctum. */
type AwakeningSave = {
  alv?: number; abyss?: number; best?: number; stage?: number;
  stars?: Record<string, number>; lattice?: Record<string, number>; raiment?: number;
};
const awakening = (h: ProgressState): AwakeningSave => h.awakening ?? {};
const awakLvl = (h: ProgressState) => Math.max(0, Math.floor(awakening(h).alv ?? 0));
const abyssFloor = (h: ProgressState) => Math.max(0, Math.floor(awakening(h).abyss ?? 0));
const echoDepth = (h: ProgressState) => Math.max(0, Math.floor(awakening(h).best ?? 0));
const awakStage = (h: ProgressState) => Math.max(0, Math.floor(awakening(h).stage ?? 0));
const awakStars = (h: ProgressState) => sum(awakening(h).stars);
const awakLattice = (h: ProgressState) => sum(awakening(h).lattice);
const raimentTier = (h: ProgressState) => Math.max(0, Math.floor(awakening(h).raiment ?? 0));
/** Pastimes and side tracks: the Minigame Hall, the Farm, mounts, titles, the World Tree, the Spire. */
const minigamePlays = (h: ProgressState) => sum(h.minigames?.plays);
const mountsOwned = (h: ProgressState) => (h.mounts?.owned ?? []).length;
const treesCleared = (h: ProgressState) => (h.worldTree?.caches ?? []).length;
const spireDungeons = (h: ProgressState) => Object.values(h.spireFloors ?? {}).filter((n) => n > 0).length;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * Broken ladders never run out: each family is one rule with a rising list of goals, so the
 * achievement tab keeps giving new rungs long after the hand-written list is exhausted.
 */
const endless = (
  cat: AchCategory,
  desc: string,
  value: (h: ProgressState) => number,
  id: string,
  label: string,
  goals: number[],
  goldPerGoal: number,
  title?: string,
): Achievement[] =>
  goals.map((goal, i) => ({
    cat, desc, value, id: `${id}_${goal}`, goal,
    name: `${label} ${ROMAN[i] ?? i + 1}`,
    gold: Math.round(goal * goldPerGoal),
    title: i === goals.length - 1 ? title : undefined,
  }));

export const ACHIEVEMENTS: Achievement[] = [
  ...tiers({ cat: "Combat", desc: "Win battles", value: (h) => rec(h).wins }, "wins", ["Blooded", "Veteran", "Warmaster"], [10, 100, 1000], [200, 2000, 20000], [undefined, "Veteran", "Warmaster"]),
  ...tiers({ cat: "Bosses", desc: "Defeat bosses", value: (h) => rec(h).bosses }, "boss", ["Giant Slayer", "Bane of Tyrants", "Godkiller"], [1, 10, 50], [500, 5000, 30000], [undefined, "Tyrantbane", "Godkiller"]),
  ...tiers({ cat: "Progression", desc: "Reach character level", value: (h) => h.level }, "lvl", ["Rising Hero", "Seasoned", "Legend"], [10, 40, 80], [300, 3000, 15000], [undefined, undefined, "Legend"]),
  ...tiers({ cat: "Progression", desc: "Clear campaign stages", value: (h) => h.stage - 1 }, "stage", ["Wanderer", "Conqueror of Realms"], [10, 50], [400, 8000], [undefined, "Realmbreaker"]),
  ...tiers({ cat: "Progression", desc: "Climb Endless Conquest floors", value: (h) => h.spire - 1 }, "spire", ["Climber", "Spire Lord"], [10, 100], [1000, 25000], [undefined, "Spire Lord"]),
  ...tiers({ cat: "Progression", desc: "Gain Ascension levels", value: (h) => h.paragon }, "asc", ["Ascendant"], [10], [20000], ["Ascended"]),
  ...tiers({ cat: "Crafting", desc: "Successfully enhance gear", value: (h) => rec(h).enhances }, "enh", ["Apprentice Smith", "Master Smith"], [10, 100], [300, 5000], [undefined, "Master Smith"]),
  ...tiers({ cat: "Crafting", desc: "Enhance one item to +N", value: (h) => rec(h).bestEnh }, "enhmax", ["Tempered", "Flawless"], [5, 10], [1000, 10000], [undefined, "Flawless"]),
  ...tiers({ cat: "Arena", desc: "Win arena fights", value: (h) => rec(h).arenaWins }, "arena", ["Gladiator", "Arena Champion"], [5, 50], [800, 12000], ["Gladiator", "Champion of Blood"]),
  ...tiers({ cat: "Collection", desc: "Wear a full 6-piece gear set", value: (h) => Math.max(0, ...activeSets(h.equipment).map((s) => s.count)) }, "set", ["Matched", "Fully Armored"], [2, 6], [500, 8000], [undefined, "Paragon of Steel"]),
  // Conquest achievements
  ...tiers({ cat: "Conquest", desc: "Climb Endless Conquest floors", value: (h) => h.spire - 1 }, "spire2", ["Daring Climber", "Tower Climber", "Unstoppable"], [25, 50, 200], [3000, 15000, 50000], [undefined, undefined, "Unstoppable"]),
  ...tiers({ cat: "Conquest", desc: "Collect Conquest Tokens total", value: (h) => h.conquest?.tokens ?? 0 }, "ctokens", ["Token Hoarder", "Token Baron"], [200, 2000], [1000, 10000], [undefined, "Token Baron"]),
  // Enchanting achievements
  ...tiers({ cat: "Enchanting", desc: "Enhance one item to +N", value: (h) => rec(h).bestEnh }, "enh2", ["Refined", "Exquisite", "Transcendent"], [8, 12, 15], [3000, 15000, 40000], [undefined, undefined, "Transcendent"]),
  // More crafting achievements
  ...tiers({ cat: "Crafting", desc: "Craft items at the Forge", value: (h) => h.crafts ?? 0 }, "crafts", ["Forgehand", "Master Forgehand", "Legendary Forgehand"], [5, 25, 100], [500, 3000, 15000], [undefined, undefined, "Legendary Forgehand"]),
  // More arena achievements
  ...tiers({ cat: "Arena", desc: "Win arena fights", value: (h) => rec(h).arenaWins }, "arena2", ["Duelist", "Centurion", "Arena Legend"], [20, 100, 250], [2000, 10000, 30000], [undefined, undefined, "Arena Legend"]),
  // More boss achievements
  ...tiers({ cat: "Bosses", desc: "Defeat bosses", value: (h) => rec(h).bosses }, "boss2", ["Boss Hunter", "Scourge of Bosses", "World Ender"], [25, 100, 250], [2000, 10000, 50000], [undefined, "Scourge", "World Ender"]),
  // Progression: Paragon levels
  ...tiers({ cat: "Progression", desc: "Gain Ascension levels", value: (h) => h.paragon }, "asc2", ["Exalted", "Celestial"], [25, 50], [40000, 100000], ["Exalted", "Celestial"]),
  // Collection: Astrals
  ...tiers({ cat: "Collection", desc: "Own distinct Astral species", value: (h) => new Set((h.astrals ?? []).map((a) => a.base)).size }, "astral2", ["Star Tamer", "Astral Lord"], [5, 10], [2000, 10000], [undefined, "Astral Lord"]),
  // Bestiary: total monster defeats across every species
  ...tiers({ cat: "Bestiary", desc: "Defeat monsters", value: (h) => sum(h.kills) }, "kills", ["Beast Hunter", "Naturalist", "Bestiary Master"], [25, 250, 1000], [600, 4000, 20000], [undefined, undefined, "Beastbane"]),
  // Exploration: region quests claimed
  ...tiers({ cat: "Exploration", desc: "Claim region quests", value: (h) => (h.quests ?? []).length }, "quests", ["Contract Taker", "Realm Completionist"], [4, 10], [800, 8000], [undefined, "Realm Completionist"]),
  // Bosses: named challenge bosses cleared at any difficulty
  ...tiers({ cat: "Bosses", desc: "Clear challenge bosses", value: (h) => Object.values(h.challenges ?? {}).filter((d) => d > 0).length }, "chal", ["Challenger", "Titan Slayer"], [1, 4], [2000, 25000], [undefined, "Titan Slayer"]),
  // Guild: ranks earned by donating gold to the guild (see guildRanks)
  ...tiers({ cat: "Guild", desc: "Donate gold to the guild", value: (h) => guildRanks(h) }, "guild", ["Guild Initiate", "Tower Veteran", "Guild Paragon"], [5, 20, 50], [1500, 12000, 40000], [undefined, "Tower Veteran", "Guild Paragon"]),
  // Training: barracks drill ranks
  ...tiers({ cat: "Training", desc: "Learn barracks drill ranks", value: (h) => sum(h.drills) }, "drills", ["Drill Recruit", "Drill Sergeant", "Warlord"], [3, 15, 40], [500, 9000, 30000], [undefined, undefined, "Warlord"]),
  // Progression: Arena duels won (the old skill-tree rungs, re-pointed at real play)
  ...tiers({ cat: "Progression", desc: "Win Arena duels", value: (h) => rec(h).arenaWins }, "talentranks", ["Duelist", "Grandmaster"], [15, 50], [1500, 15000], [undefined, "Grandmaster"]),
  // Progression: dungeon floors cleared (the old passive-tree rungs, re-pointed at real play)
  ...tiers({ cat: "Progression", desc: "Clear dungeon floors", value: (h) => sum(h.dungeons) }, "passiveranks", ["Delver", "Enlightened"], [10, 40], [2000, 20000], [undefined, "Enlightened"]),

  // ---- Combat, extended ----
  ...tiers({ cat: "Combat", desc: "Fight any battle", value: (h) => rec(h).battles }, "battles", ["First Blood", "Skirmisher", "Battle-Hardened", "War Machine", "Eternal Soldier"], [1, 50, 250, 1000, 5000], [50, 400, 2500, 12000, 60000], [undefined, undefined, "Battle-Hardened", undefined, "Eternal Soldier"]),
  ...tiers({ cat: "Bosses", desc: "Defeat bosses", value: (h) => rec(h).bosses }, "boss3", ["Doom of Kings", "Apocalypse"], [500, 1000], [75000, 150000], ["Doom of Kings", "Apocalypse"]),
  ...tiers({ cat: "Bosses", desc: "Clear challenge boss difficulties", value: (h) => sum(h.challenges) }, "trialdiffs", ["Trial Challenger", "Trial Master", "Trial Sovereign"], [5, 15, 40], [4000, 30000, 120000], [undefined, "Trial Master", "Trial Sovereign"]),

  // ---- Progression, extended ----
  ...tiers({ cat: "Progression", desc: "Reach character level", value: (h) => h.level }, "lvl2", ["Adept", "Champion", "Grand Champion", "Mythic Hero"], [30, 50, 65, 80], [1500, 6000, 25000, 80000], [undefined, "Champion", "Grand Champion", "Mythic Hero"]),
  ...tiers({ cat: "Progression", desc: "Clear campaign stages", value: (h) => h.stage - 1 }, "stage2", ["Trailblazer", "Vanguard", "Campaign Champion", "Road's End"], [15, 30, 80, 120], [800, 4000, 20000, 60000], [undefined, undefined, "Campaign Champion", "Road's End"]),
  ...tiers({ cat: "Progression", desc: "Climb Endless Conquest floors", value: (h) => h.spire - 1 }, "spire3", ["High Climber", "Skybreaker", "Conquest Sovereign"], [150, 300, 500], [40000, 90000, 200000], [undefined, undefined, "Conquest Sovereign"]),
  ...tiers({ cat: "Progression", desc: "Gain Ascension levels", value: (h) => h.paragon }, "asc3", ["Ascendant Lord", "Transcendent Ascendant", "Beyond Mortal"], [75, 100, 150], [150000, 300000, 600000], ["Ascendant Lord", "Transcendent Ascendant", "Beyond Mortal"]),

  // ---- Crafting, extended ----
  ...tiers({ cat: "Crafting", desc: "Craft items at the Forge", value: (h) => h.crafts ?? 0 }, "crafts2", ["Forge Master", "Forge Lord", "Forge Deity"], [250, 500, 1000], [25000, 60000, 150000], [undefined, "Forge Lord", "Forge Deity"]),
  ...tiers({ cat: "Crafting", desc: "Successfully enhance gear", value: (h) => rec(h).enhances }, "enh3", ["Tempering Expert", "Enchanting Master", "Enchanting Legend"], [250, 500, 1000], [20000, 50000, 120000], [undefined, "Enchanting Master", "Enchanting Legend"]),

  // ---- Synthesis armour ----
  ...tiers({ cat: "Synthesis", desc: "Forge synthesis pieces", value: (h) => synthPieces(h) }, "synthpcs", ["First Suit", "Half Wardrobe", "Full Wardrobe"], [8, 40, 72], [5000, 30000, 120000], [undefined, undefined, "Wardrobe Keeper"]),
  ...tiers({ cat: "Synthesis", desc: "Complete whole synthesis sets", value: (h) => synthSets(h) }, "synthsets", ["One Complete Set", "Three Complete Sets", "Six Complete Sets", "Every Set Forged"], [1, 3, 6, 9], [10000, 40000, 120000, 300000], [undefined, undefined, undefined, "Synthesis Sovereign"]),
  ...tiers({ cat: "Synthesis", desc: "Wear synthesis pieces at once", value: (h) => synthWorn(h) }, "synthworn", ["Matching Steel", "Synthesis Knight"], [4, 8], [6000, 30000], [undefined, "Synthesis Knight"]),

  // ---- Relic Trials ----
  ...tiers({ cat: "Relics", desc: "Recover distinct relic pieces", value: (h) => relicPieces(h) }, "relics", ["Relic Seeker", "Relic Hunter", "Relic Master"], [3, 12, 36], [2000, 15000, 80000], [undefined, "Relic Hunter", "Keeper of Relics"]),
  ...tiers({ cat: "Relics", desc: "Win relic trials", value: (h) => relicClears(h) }, "relicclears", ["Trial Aspirant", "Trial Adept", "Trial Sovereign"], [5, 30, 120], [1500, 12000, 60000], [undefined, undefined, "Trial Sovereign"]),

  // ---- Arena, extended ----
  ...tiers({ cat: "Arena", desc: "Win arena fights", value: (h) => rec(h).arenaWins }, "arena3", ["Arena Immortal", "Blood Sovereign"], [500, 1000], [80000, 200000], ["Arena Immortal", "Blood Sovereign"]),

  // ---- Astrals ----
  ...tiers({ cat: "Astrals", desc: "Own Astrals", value: (h) => astrals(h).length }, "astraln", ["Star Finder", "Astral Keeper", "Astral Archivist", "Astral Sovereign", "Astral Cosmos"], [1, 5, 15, 30, 60], [300, 2000, 8000, 30000, 100000], [undefined, undefined, undefined, "Astral Sovereign", "Astral Cosmos"]),
  ...tiers({ cat: "Astrals", desc: "Reach an Astral's level", value: (h) => bestAstralLvl(h) }, "astralmax", ["Nurtured Star", "Perfect Astral"], [5, 10], [5000, 40000], [undefined, "Perfect Astral"]),
  ...tiers({ cat: "Astrals", desc: "Own an Astral of this rarity or better", value: (h) => bestAstralRarity(h) }, "astralrarity", ["Green Shimmer", "Blue Shimmer", "Purple Shimmer", "Golden Shimmer", "Crimson Shimmer"], [2, 3, 4, 5, 6], [200, 600, 1500, 4000, 12000], [undefined, undefined, undefined, "Golden Shimmer", "Crimson Shimmer"]),
  ...tiers({ cat: "Astrals", desc: "Own Red Astrals", value: (h) => astralsOfRarity(h, 5) }, "astralred", ["One Red Star", "Crimson Constellation"], [1, 3], [25000, 100000], [undefined, "Crimson Constellation"]),

  // ---- Gems ----
  ...tiers({ cat: "Gems", desc: "Own gems in total", value: (h) => gemTotal(h) }, "gemcount", ["Gem Pouch", "Gem Vault", "Gem Hoard", "Gem Treasury"], [10, 50, 200, 500], [500, 3000, 15000, 60000], [undefined, undefined, undefined, "Gem Treasurer"]),
  ...tiers({ cat: "Gems", desc: "Own distinct gem families", value: (h) => gemFamilies(h) }, "gemfam", ["Gem Cutter", "Gem Scholar", "Gem Savant", "Gem Master"], [2, 4, 6, 8], [800, 3000, 9000, 25000], [undefined, undefined, undefined, "Gem Master"]),
  ...tiers({ cat: "Gems", desc: "Own a gem of this level or better", value: (h) => bestGemTier(h) }, "gemtier", ["Cutting Edge", "Radiant Touch", "Celestial Gem", "Primordial Gem"], [3, 6, 9, 12], [1000, 5000, 25000, 100000], [undefined, undefined, undefined, "Primordial"]),

  // ---- Conquest, extended ----
  ...tiers({ cat: "Conquest", desc: "Collect Conquest Tokens total", value: (h) => h.conquest?.tokens ?? 0 }, "ctokens3", ["Token Emperor", "Token Immortal"], [5000, 20000], [30000, 120000], ["Token Emperor", "Token Immortal"]),

  // ---- Bestiary, extended ----
  ...tiers({ cat: "Bestiary", desc: "Defeat monsters", value: (h) => sum(h.kills) }, "kills2", ["Exterminator", "Apex Hunter", "Extinction Bringer"], [2500, 5000, 10000], [50000, 120000, 300000], [undefined, undefined, "Extinction Bringer"]),
  ...tiers({ cat: "Bestiary", desc: "Defeat distinct monster species", value: (h) => Object.keys(h.kills ?? {}).length }, "species", ["Field Guide", "Zoologist", "Menagerie", "Living Bestiary"], [5, 25, 60, 100], [1200, 8000, 40000, 150000], [undefined, undefined, undefined, "Living Bestiary"]),

  // ---- Exploration, extended ----
  ...tiers({ cat: "Exploration", desc: "Claim region quests", value: (h) => (h.quests ?? []).length }, "quests3", ["Odd Job", "District Hero", "Realm Champion"], [2, 6, 8], [400, 4000, 30000], [undefined, undefined, "Realm Champion"]),
  ...tiers({ cat: "Exploration", desc: "Clear dungeons", value: (h) => sum(h.dungeons) }, "dungeons", ["Dungeon Diver", "Dungeon Delver", "Dungeon Conqueror", "Dungeon Sovereign"], [1, 5, 20, 50], [800, 5000, 30000, 120000], [undefined, undefined, undefined, "Dungeon Sovereign"]),
  ...tiers({ cat: "Exploration", desc: "Plant your banner on the world map", value: (h) => (h as { worldCastle?: unknown }).worldCastle ? 1 : 0 }, "banner", ["Banner Lord"], [1], [5000], ["Banner Lord"]),

  // ---- Guild and training, extended ----
  ...tiers({ cat: "Guild", desc: "Donate gold to the guild", value: (h) => guildRanks(h) }, "guild2", ["Guild Champion"], [100], [80000], ["Guild Champion"]),
  ...tiers({ cat: "Training", desc: "Learn barracks drill ranks", value: (h) => sum(h.drills) }, "drills2", ["Drill Marshal", "Drill Legend"], [60, 100], [50000, 120000], ["Drill Marshal", "Drill Legend"]),
  ...tiers({ cat: "Training", desc: "Raise attribute drill ranks", value: (h) => sum(h.attrDrills) + sum(h.advancedDrills) }, "attrdrills", ["Iron Body", "Steel Body", "Adamant Body"], [10, 30, 60], [3000, 20000, 80000], [undefined, undefined, "Adamant Body"]),

  // ---- Treasure ----
  ...tiers({ cat: "Treasure", desc: "Collect periodic reward chests", value: (h) => h.rewardChest?.claims ?? 0 }, "chestclaims", ["Chest Opener", "Chest Collector", "Chest Hunter", "Chest Sovereign"], [10, 50, 100, 250], [600, 3000, 12000, 40000], [undefined, undefined, undefined, "Chest Sovereign"]),
  ...tiers({ cat: "Treasure", desc: "Finish 30-day reward cycles", value: (h) => h.dailyRewards?.cycles ?? 0 }, "rewardcycles", ["First Cycle", "Third Cycle", "Sixth Cycle", "Year of Rewards"], [1, 3, 6, 12], [2000, 8000, 25000, 100000], [undefined, undefined, undefined, "Year of Rewards"]),
  ...tiers({ cat: "Treasure", desc: "Fight event bosses", value: (h) => sum(h.eventBoss) }, "eventboss", ["Event Fighter", "Event Veteran", "Event Champion"], [1, 10, 50], [1000, 8000, 40000], [undefined, undefined, "Event Champion"]),

  // ---- Wealth ----
  ...tiers({ cat: "Wealth", desc: "Hold gold at once", value: (h) => h.gold ?? 0 }, "gold", ["Pocket Change", "Wealthy", "Rich", "Fortune's Own"], [10000, 100000, 1000000, 5000000], [500, 3000, 15000, 60000], [undefined, undefined, undefined, "Fortune's Own"]),

  // ---- Endless ladders: the climb keeps paying out ----
  ...endless("Endless", "Win battles", (h) => rec(h).wins, "ewins", "Reaver", [2000, 5000, 10000, 25000, 50000, 100000], 20, "Deathless Reaver"),
  ...endless("Endless", "Fight any battle", (h) => rec(h).battles, "ebattles", "Campaigner", [10000, 25000, 50000, 100000, 250000], 5, "Unbroken Campaigner"),
  ...endless("Endless", "Defeat bosses", (h) => rec(h).bosses, "ebosses", "Tyrant", [100, 250, 500, 1000, 2500], 100, "Tyrant Unbound"),
  ...endless("Endless", "Win arena fights", (h) => rec(h).arenaWins, "earena", "Pit Champion", [250, 500, 1000, 2500], 60, "Undisputed Champion"),
  ...endless("Endless", "Clear campaign stages", (h) => h.stage - 1, "estage", "Trailblazer", [150, 200, 300, 500, 750, 1000], 500, "End of the Map"),
  ...endless("Endless", "Climb Endless Conquest floors", (h) => h.spire - 1, "espire", "Climber", [300, 500, 750, 1000, 1500], 300, "Skybreaker"),
  ...endless("Endless", "Reach character level", (h) => h.level, "elevel", "Emberforged", [100, 110, 120, 130, 140], 2000, "Ember Incarnate"),
  ...endless("Endless", "Gain Ascension levels", (h) => h.paragon, "easc", "Ascended", [100, 150, 200, 300, 500], 5000, "Beyond Ascension"),
  ...endless("Endless", "Defeat monsters", (h) => sum(h.kills), "ekills", "Hunter", [1000, 2500, 5000, 10000, 25000], 5, "Apex Hunter"),
  ...endless("Endless", "Learn barracks drill ranks", (h) => sum(h.drills), "edrills", "Drilled", [100, 200, 300, 500], 500, "Living Weapon"),

  // ---- Awakening: the post-90 sanctum and everything inside it (see awakening.ts) ----
  ...tiers({ cat: "Awakening", desc: "Reach Awakening level", value: awakLvl }, "awaklvl", ["First Dawn", "Kindled Soul", "Star Sovereign", "Eternal Dawn"], [1, 10, 25, 50], [4000, 25000, 90000, 250000], [undefined, undefined, "Star Sovereign", "Eternal Dawn"]),
  ...tiers({ cat: "Awakening", desc: "Clear Endless Abyss floors", value: abyssFloor }, "abyss", ["Abyss Walker", "Abyss Diver", "Abyss Breaker", "Abyss Sovereign"], [1, 10, 30, 75], [2500, 12000, 45000, 150000], [undefined, undefined, "Abyss Breaker", "Abyss Sovereign"]),
  ...tiers({ cat: "Awakening", desc: "Reach Echo Trial depth", value: echoDepth }, "echo", ["Echo Listener", "Echo Hunter", "Echo Sovereign"], [5, 20, 50], [3000, 20000, 80000], [undefined, "Echo Hunter", "Echo Sovereign"]),
  ...tiers({ cat: "Awakening", desc: "Advance Awakening stages", value: awakStage }, "awakstage", ["Awakened", "Dawnborne", "Eternal Flame"], [1, 3, 5], [5000, 40000, 150000], ["Awakened", "Dawnborne", "Eternal Flame"]),
  ...tiers({ cat: "Awakening", desc: "Spend Constellation points", value: awakStars }, "constell", ["Constellation Seeker", "Constellation Keeper", "Constellation Architect"], [10, 100, 400], [3000, 30000, 120000], [undefined, "Constellation Keeper", "Constellation Architect"]),
  ...tiers({ cat: "Awakening", desc: "Attune Soul Lattice ranks", value: awakLattice }, "lattice", ["Lattice Novice", "Lattice Adept", "Lattice Master"], [10, 80, 240], [2500, 25000, 100000], [undefined, "Lattice Adept", "Lattice Master"]),
  ...tiers({ cat: "Awakening", desc: "Forge Awakened Raiment tiers", value: raimentTier }, "raiment", ["Ashen Raiment", "Starbound Raiment", "Eternal Raiment"], [1, 4, 6], [6000, 50000, 200000], [undefined, undefined, "Raiment Eternal"]),

  // ---- Life: the pastimes beside the war (Minigame Hall, Farm, mounts, titles) ----
  ...tiers({ cat: "Life", desc: "Catch fish at the Fishing Pier", value: (h) => Math.max(0, Math.floor(h.fishing?.caught ?? 0)) }, "fish", ["First Cast", "Angler", "Master Angler"], [10, 100, 500], [800, 6000, 30000], [undefined, "Angler", "Master Angler"]),
  ...tiers({ cat: "Life", desc: "Play games in the Minigame Hall", value: minigamePlays }, "minigames", ["Pastime", "Hall Regular", "Hall Champion"], [10, 50, 200], [600, 5000, 25000], [undefined, undefined, "Hall Champion"]),
  ...tiers({ cat: "Life", desc: "Raise the Farm's own level", value: (h) => Math.max(0, Math.floor(h.farm?.level ?? 0)) }, "farmlvl", ["Tiller", "Steward", "Farm Sovereign"], [5, 10, 16], [2000, 12000, 60000], [undefined, undefined, "Farm Sovereign"]),
  ...tiers({ cat: "Life", desc: "Own mounts", value: mountsOwned }, "mounts", ["Rider", "Stable Master", "Mount Collector"], [1, 4, 7], [1500, 15000, 60000], [undefined, "Stable Master", "Mount Collector"]),
  ...tiers({ cat: "Life", desc: "Claim titles", value: (h) => (h.titleClaimed ?? []).length }, "titles", ["Titled", "Decorated", "Living Legend"], [3, 10, 25], [2000, 15000, 80000], [undefined, "Decorated", "Living Legend"]),

  // ---- Side tracks of the late game, each on its own ladder ----
  ...tiers({ cat: "Training", desc: "Raise your Enlightenment level", value: (h) => Math.max(0, Math.floor(h.enlightenment ?? 0)) }, "enlighten", ["Clear Mind", "Illuminated", "Transcendent"], [5, 15, 30], [3000, 20000, 90000], [undefined, "Illuminated", "Transcendent"]),
  ...tiers({ cat: "Training", desc: "Learn Soul infusion ranks", value: (h) => sum(h.soulInfusions) }, "soulinf", ["Soul Touched", "Soul Forged", "Soul Ascendant"], [5, 25, 60], [2500, 18000, 80000], [undefined, "Soul Forged", "Soul Ascendant"]),
  ...tiers({ cat: "Training", desc: "Learn Renown training ranks", value: (h) => sum(h.renownRanks) }, "renownranks", ["Renown Seeker", "Renown Master"], [10, 60], [3000, 40000], [undefined, "Renown Master"]),
  ...tiers({ cat: "Collection", desc: "Carve rune ranks", value: (h) => sum(h.runes) }, "runeranks", ["Rune Carver", "Rune Master"], [5, 40], [2500, 30000], [undefined, "Rune Master"]),
  ...tiers({ cat: "Exploration", desc: "Break seals in the World Tree vaults", value: treesCleared }, "treecaches", ["Vault Breaker", "World Tree Ally", "World Tree Champion"], [1, 10, 25], [1500, 10000, 50000], [undefined, "World Tree Ally", "World Tree Champion"]),
  ...tiers({ cat: "Exploration", desc: "Climb the Spire Gate's dungeons", value: spireDungeons }, "spiredungeons", ["Spire Delver", "Spire Wayfarer"], [1, 5], [2000, 15000], [undefined, "Spire Wayfarer"]),
];

export const achProgress = (h: ProgressState, a: Achievement) => Math.min(a.goal, Math.max(0, a.value(h)));
/** Gold is scarce now (see stageRewards in data.ts), so achievement purses pay their old headline at a fifth. */
export const ACH_GOLD_SCALE = 0.2;
export const achGold = (a: Achievement) => Math.max(1, Math.round(a.gold * ACH_GOLD_SCALE));
export const isClaimable = (h: ProgressState, a: Achievement) => achProgress(h, a) >= a.goal && !(h.achClaimed ?? []).includes(a.id);
/**
 * The order every achievement list shows (Throne Hall, profile): everything the hero can claim
 * right now comes first, so a finished achievement never sits below a screen of unfinished ones;
 * then the families nearest their goal, then the far-off ones, with claimed rungs last.
 */
export function sortAchievements(h: ProgressState, list: Achievement[] = ACHIEVEMENTS): Achievement[] {
  const claimed = new Set(h.achClaimed ?? []);
  const rank = (a: Achievement) => (isClaimable(h, a) ? 0 : claimed.has(a.id) ? 2 : 1);
  const ratio = (a: Achievement) => achProgress(h, a) / Math.max(1, a.goal);
  return [...list].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank) return byRank;
    // Within the open achievements the nearest to completion leads; claimed ones keep a stable,
    // goal-ordered tail so the list does not reshuffle as the hero progresses.
    const byOrder = rank(a) === 1 ? ratio(b) - ratio(a) : a.goal - b.goal;
    return byOrder || a.name.localeCompare(b.name);
  });
}
/** Titles unlocked by claimed achievements. */
export const earnedTitles = (h: Pick<ProgressState, "achClaimed">) =>
  ACHIEVEMENTS.filter((a) => a.title && (h.achClaimed ?? []).includes(a.id)).map((a) => a.title!);

// ---------- Equipment sets ----------
/** Gear sets are the item families named by their prefix (e.g. "Bloodforged"). The last three are
 *  the relic collections of the class trials (see relics.ts), which never roll on random drops. */
export const SET_NAMES = ["Worn", "Iron", "Bloodforged", "Moonlit", "Dread", "Abyssal", "Crimson", "Soulbound", "Eclipse", "Ancient", "Emberforged", "Starweave", "Verdant"];
export interface SetFx { atkPct: number; defPct: number; hpPct: number; crit: number }
export const SET_BONUSES: { pieces: number; fx: Partial<SetFx>; label: string }[] = [
  { pieces: 2, fx: { atkPct: 4 }, label: "+4% attack" },
  { pieces: 4, fx: { defPct: 6, hpPct: 6 }, label: "+6% defense & health" },
  { pieces: 6, fx: { atkPct: 8, crit: 3 }, label: "+8% attack & +3% crit" },
];

/** Signature bonus a relic collection adds on top of the shared bonuses once six pieces are worn. */
export const SET_SIGNATURE: Record<string, { fx: Partial<SetFx>; label: string }> = {
  Emberforged: { fx: { atkPct: 5, crit: 2 }, label: "Ember Fury · +5% attack, +2% crit" },
  Starweave: { fx: { atkPct: 4, hpPct: 4 }, label: "Star Mantle · +4% attack & health" },
  Verdant: { fx: { defPct: 5, crit: 3 }, label: "Wildstep · +5% defense, +3% crit" },
};
export const signatureOf = (set: string) => SET_SIGNATURE[set] ?? null;

export function setOf(item: Pick<Item, "name">): string | null {
  const first = item.name.split(" ")[0];
  return SET_NAMES.includes(first) ? first : null;
}

export function activeSets(eq: Partial<Record<Slot, Item>>): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const it of Object.values(eq)) { if (!it) continue; const s = setOf(it); if (s) counts[s] = (counts[s] ?? 0) + 1; }
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function setFx(eq: Partial<Record<Slot, Item>>): SetFx {
  const out: SetFx = { atkPct: 0, defPct: 0, hpPct: 0, crit: 0 };
  for (const s of activeSets(eq)) {
    for (const b of SET_BONUSES) if (s.count >= b.pieces) {
      for (const k of Object.keys(b.fx) as (keyof SetFx)[]) out[k] += b.fx[k] ?? 0;
    }
    const sig = s.count >= 6 ? SET_SIGNATURE[s.name] : undefined;
    if (sig) for (const k of Object.keys(sig.fx) as (keyof SetFx)[]) out[k] += sig.fx[k] ?? 0;
  }
  return out;
}

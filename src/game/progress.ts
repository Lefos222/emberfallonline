import type { HeroClass, Item, Slot } from "./data";

/** Lifetime combat record saved with the hero. */
export interface CombatRecord { battles: number; wins: number; losses: number; bosses: number; arenaWins: number; enhances: number; bestEnh: number }
export interface BattleEntry { t: number; title: string; won: boolean; boss?: boolean; rewards: string[] }

export interface ProgressState {
  cls: HeroClass; level: number; paragon: number; stage: number; spire: number;
  record?: CombatRecord; history?: BattleEntry[]; achClaimed?: string[];
  equipment: Partial<Record<Slot, Item>>;
}

export const emptyRecord = (): CombatRecord => ({ battles: 0, wins: 0, losses: 0, bosses: 0, arenaWins: 0, enhances: 0, bestEnh: 0 });
export const HISTORY_CAP = 30;

/** Append a finished battle to the hero's record and history (newest first). */
export function recordBattle(h: ProgressState, e: { title: string; won: boolean; boss?: boolean; arena?: boolean; rewards: string[] }) {
  const r = { ...emptyRecord(), ...(h.record ?? {}) };
  r.battles++;
  if (e.won) { r.wins++; if (e.boss) r.bosses++; if (e.arena) r.arenaWins++; } else r.losses++;
  h.record = r;
  h.history = [{ t: Date.now(), title: e.title, won: e.won, boss: e.boss, rewards: e.rewards.slice(0, 4) }, ...(h.history ?? [])].slice(0, HISTORY_CAP);
}

export function recordEnhance(h: ProgressState, newEnh: number) {
  const r = { ...emptyRecord(), ...(h.record ?? {}) };
  r.enhances++; r.bestEnh = Math.max(r.bestEnh, newEnh);
  h.record = r;
}

// ---------- Achievements ----------
export type AchCategory = "Combat" | "Bosses" | "Progression" | "Crafting" | "Arena" | "Collection" | "Conquest" | "Ancestral" | "Enchanting";
export interface Achievement { id: string; cat: AchCategory; name: string; desc: string; goal: number; gold: number; title?: string; value: (h: ProgressState) => number }

const rec = (h: ProgressState) => ({ ...emptyRecord(), ...(h.record ?? {}) });
const tiers = (base: Omit<Achievement, "id" | "goal" | "gold" | "name" | "title">, id: string, names: string[], goals: number[], golds: number[], titles: (string | undefined)[]) =>
  goals.map((goal, i): Achievement => ({ ...base, id: `${id}_${i + 1}`, name: names[i], goal, gold: golds[i], title: titles[i] }));

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
  // Ancestral achievements
  ...tiers({ cat: "Ancestral", desc: "Reach level 80 and unlock Ancestral", value: (h) => (h.anc?.done ? 1 : 0) }, "ancunlock", ["Heritage Awakened"], [1], [25000], ["Heritage Bearer"]),
  ...tiers({ cat: "Ancestral", desc: "Clear Ancestral Tower floors", value: (h) => h.ancTower?.bestFloor ?? 0 }, "ancfloor", ["Ancestral Initiate", "Ancestral Adept", "Ancestral Master"], [1, 5, 20], [2000, 10000, 50000], [undefined, undefined, "Ancestral Master"]),
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
];

export const achProgress = (h: ProgressState, a: Achievement) => Math.min(a.goal, Math.max(0, a.value(h)));
export const isClaimable = (h: ProgressState, a: Achievement) => achProgress(h, a) >= a.goal && !(h.achClaimed ?? []).includes(a.id);
/** Titles unlocked by claimed achievements. */
export const earnedTitles = (h: Pick<ProgressState, "achClaimed">) =>
  ACHIEVEMENTS.filter((a) => a.title && (h.achClaimed ?? []).includes(a.id)).map((a) => a.title!);

// ---------- Equipment sets ----------
/** Gear sets are the item families named by their prefix (e.g. "Bloodforged"). */
export const SET_NAMES = ["Worn", "Iron", "Bloodforged", "Moonlit", "Dread", "Abyssal", "Crimson", "Soulbound", "Eclipse", "Ancient", "Ancestral"];
export interface SetFx { atkPct: number; defPct: number; hpPct: number; crit: number }
export const SET_BONUSES: { pieces: number; fx: Partial<SetFx>; label: string }[] = [
  { pieces: 2, fx: { atkPct: 4 }, label: "+4% attack" },
  { pieces: 4, fx: { defPct: 6, hpPct: 6 }, label: "+6% defense & health" },
  { pieces: 6, fx: { atkPct: 8, crit: 3 }, label: "+8% attack & +3% crit" },
];

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
  for (const s of activeSets(eq)) for (const b of SET_BONUSES) if (s.count >= b.pieces) {
    for (const k of Object.keys(b.fx) as (keyof SetFx)[]) out[k] += b.fx[k] ?? 0;
  }
  return out;
}

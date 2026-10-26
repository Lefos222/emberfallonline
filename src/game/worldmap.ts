import { supabase } from "@/integrations/supabase/client";
import { CLASSES, heroStats, stageFoe, stageRewards, type Hero, type HeroClass } from "./data";
import { enemySprite, bossSprite, BESTIARY, type SpriteRect } from "./world";
import type { Mat } from "./crafting";
import type { Fighter } from "./Battle";

/** The persistent world is a 100×100 percent grid. Castle positions are mirrored into
 *  the publicly-readable `stats` JSONB column (wx/wy) by the save flow, so every player
 *  sees every other castle's current position without a schema migration. */
export const WORLD_MAX_MOVES = 3;
export const WORLD_W = 100;
export const WORLD_H = 100;

// ---------- relocation ----------
export function todayKey() { return new Date().toISOString().slice(0, 10); }

export function relocationsLeft(h: Hero): number {
  const today = todayKey();
  const used = (h.worldMoves ?? []).filter((d) => d === today).length;
  return Math.max(0, WORLD_MAX_MOVES - used);
}

export function relocate(h: Hero, x: number, y: number) {
  const today = todayKey();
  const past = (h.worldMoves ?? []).filter((d) => d !== today);
  h.worldMoves = [...past, today];
  h.world = { x: Math.min(WORLD_W - 3, Math.max(3, Math.round(x))), y: Math.min(WORLD_H - 3, Math.max(5, Math.round(y))) };
}

export function defaultPos(seed: string): { x: number; y: number } {
  let s = 0;
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return { x: 8 + (s % 84), y: 12 + ((s >> 3) % 76) };
}

// ---------- nodes ----------
export interface WorldMonster {
  id: string; name: string; x: number; y: number; stage: number; boss: boolean; elite: boolean; row: number; col: number;
}
export interface WorldResource { id: string; name: string; x: number; y: number; mat: Mat; amount: number; }
export interface WorldCastle {
  id: string; name: string; cls: HeroClass; gender: "male" | "female"; level: number; power: number;
  arena_rating: number; x: number; y: number;
  stats: { hp: number; atk: number; def: number; crit: number; dodge?: number; critDmg?: number; pen?: number; acc?: number; paragon?: number };
}

const MONSTER_DEFS: { row: number; col: number; stage: number; boss?: boolean; elite?: boolean; x: number; y: number }[] = [
  { row: 0, col: 0, stage: 5, x: 16, y: 78 }, { row: 0, col: 2, stage: 8, x: 26, y: 70 }, { row: 0, col: 5, stage: 12, elite: true, x: 12, y: 60 },
  { row: 1, col: 0, stage: 14, x: 34, y: 82 }, { row: 1, col: 3, stage: 18, x: 22, y: 50 }, { row: 1, col: 7, stage: 22, elite: true, x: 40, y: 64 },
  { row: 2, col: 0, stage: 24, x: 52, y: 30 }, { row: 2, col: 3, stage: 28, x: 60, y: 22 }, { row: 2, col: 6, stage: 32, elite: true, x: 46, y: 40 },
  { row: 2, col: 9, stage: 36, x: 70, y: 16 }, { row: 3, col: 1, stage: 38, x: 80, y: 30 }, { row: 3, col: 4, stage: 44, x: 64, y: 48 },
  { row: 3, col: 7, stage: 48, elite: true, x: 88, y: 40 }, { row: 3, col: 10, stage: 52, x: 76, y: 64 },
  { row: 4, col: 0, stage: 30, boss: true, x: 30, y: 36 }, { row: 4, col: 3, stage: 50, boss: true, x: 58, y: 74 },
  { row: 4, col: 5, stage: 70, boss: true, x: 86, y: 72 }, { row: 4, col: 8, stage: 90, boss: true, x: 92, y: 20 },
];

export const WORLD_MONSTERS: WorldMonster[] = MONSTER_DEFS.map((d, i) => ({
  id: `wm-${i}`,
  name: d.boss ? BESTIARY[d.row][d.col] ?? "World Boss" : (d.elite ? "Elite " : "") + (BESTIARY[d.row][d.col] ?? "Monster"),
  x: d.x, y: d.y, stage: d.stage, boss: !!d.boss, elite: !!d.elite, row: d.row, col: d.col,
}));

const MAT_NAME: Record<Mat, string> = {
  ore: "Ember Ore Vein", essence: "Soul Essence Rift", starshard: "Starshard Crystal",
  bossCore: "Boss Core", fragment: "Armor Fragment Cache", sigil: "Elite Sigil Shrine",
  hide: "Beast Hide Patch", bloom: "Emberbloom Grove", crystal: "Arcane Crystal Cluster",
};
const RESOURCE_DEFS: { mat: Mat; amount: number; x: number; y: number }[] = [
  { mat: "ore", amount: 6, x: 20, y: 88 }, { mat: "hide", amount: 5, x: 44, y: 86 }, { mat: "bloom", amount: 4, x: 68, y: 84 },
  { mat: "essence", amount: 3, x: 38, y: 18 }, { mat: "crystal", amount: 2, x: 82, y: 54 }, { mat: "fragment", amount: 2, x: 54, y: 58 },
  { mat: "starshard", amount: 1, x: 90, y: 12 }, { mat: "ore", amount: 8, x: 14, y: 44 },
];
export const WORLD_RESOURCES: WorldResource[] = RESOURCE_DEFS.map((d, i) => ({
  id: `wr-${i}`, name: MAT_NAME[d.mat], x: d.x, y: d.y, mat: d.mat, amount: d.amount,
}));

// ---------- fighters ----------
export function worldMonsterFighter(m: WorldMonster): Fighter {
  const foe = stageFoe(m.stage, m.boss ? 2 : m.elite ? 1.4 : 1);
  const sprite: SpriteRect = m.boss ? bossSprite(4, m.col % 7) : enemySprite(m.row, m.col);
  return { ...foe, name: m.name, boss: m.boss, sprite };
}
export function worldRewards(m: WorldMonster) { return stageRewards(m.stage, m.boss ? 2 : m.elite ? 1.4 : 1); }

const VALID: HeroClass[] = ["warrior", "mage", "archer"];

// ---------- PvP safeguards ----------
/** One raid per castle per day, and much weaker castles are protected from bullying. */
export function raidGuard(h: Hero, c: WorldCastle): { ok: boolean; reason?: string } {
  const today = todayKey();
  const key = `${c.id}:${today}`;
  if ((h.worldAttacks ?? []).includes(key)) return { ok: false, reason: "You already raided this castle today." };
  const s = heroStats(h);
  const myPower = Math.round(s.atk * 2 + s.def * 1.5 + s.hp * 0.2);
  const theirPower = Math.round((c.stats.atk ?? 0) * 2 + (c.stats.def ?? 0) * 1.5 + (c.stats.hp ?? 0) * 0.2);
  if (theirPower > 0 && myPower > theirPower * 2.5) return { ok: false, reason: "This castle is too weak — honor forbids the assault." };
  return { ok: true };
}
export function recordRaid(h: Hero, castleId: string) {
  const today = todayKey();
  const key = `${castleId}:${today}`;
  const past = (h.worldAttacks ?? []).filter((e) => !e.endsWith(today));
  h.worldAttacks = [...past, key];
}
function validClass(c: string): HeroClass { return (VALID as string[]).includes(c) ? (c as HeroClass) : "warrior"; }

export function castleGuardFighter(c: WorldCastle): Fighter {
  const s = c.stats;
  return {
    name: `${c.name}'s Guard`, img: CLASSES[c.cls].img, gender: c.gender,
    hp: s.hp, atk: s.atk, def: s.def, crit: s.crit, dodge: s.dodge ?? 5, critDmg: s.critDmg ?? 200,
    pen: s.pen ?? 0, acc: s.acc ?? 0, level: c.level + (s.paragon ?? 0), cls: c.cls, mirror: true,
  };
}

interface CastleRow {
  id: string; name: string; hero_class: string; gender: string; level: number; power: number;
  arena_rating: number | null;
  stats: { wx?: number; wy?: number; hp: number; atk: number; def: number; crit: number; dodge?: number; critDmg?: number; pen?: number; acc?: number; paragon?: number } | null;
}

export async function fetchCastles(excludeUserId: string): Promise<WorldCastle[]> {
  const cols = "id,name,hero_class,gender,level,power,arena_rating,stats";
  const { data } = await supabase.from("heroes").select(cols).neq("user_id", excludeUserId).limit(80);
  return ((data as unknown as CastleRow[] | null) ?? [])
    .filter((r) => r.stats?.wx != null)
    .map((r) => {
      const s = r.stats!;
      return {
        id: r.id, name: r.name, cls: validClass(r.hero_class),
        gender: r.gender === "female" ? "female" : "male", level: r.level, power: r.power,
        arena_rating: r.arena_rating ?? 1000, x: s.wx!, y: s.wy!, stats: s,
      } as WorldCastle;
    });
}

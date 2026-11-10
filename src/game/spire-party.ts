import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, withServerHero } from "./store";
import { object, returnedSave } from "./services-contract";
import { heroStats, stageFoe, type EnemyType, type Hero } from "./data";
import { heroAppearance } from "./appearance";

/** The Party Spire: 1-4 heroes fight one live battle that never leaves the arena. */
export const SPIRE_FLOORS = 240;
export const SPIRE_PARTY_MAX = 4;
export const SPIRE_RUNS_PER_DAY = 3;
export const TICK_MS = 500;
/** The breather between floors: the next floor's enemies arrive right after the last ones fall. */
export const FLOOR_PAUSE_MS = 1500;

export interface SpireMember {
  id: string; name: string; cls: "warrior" | "mage" | "archer"; gender: "male" | "female";
  synth?: number | null; look?: number | null; level: number;
  hp: number; atk: number; def: number; crit: number; dodge: number;
}
export interface LiveHero { id: string; hp: number; max: number; cd: Record<string, number>; swing: number }
export interface LiveFoe { uid: string; name: string; img: string; hp: number; max: number; atk: number; def: number; boss: boolean; swing: number }
export interface Fx { src: string; tgt: string; kind: "hit" | "crit" | "heal" | "miss"; value: number; skill?: string }
export interface SpireBattle {
  floor: number; heroes: LiveHero[]; foes: LiveFoe[]; fx: Fx[]; log: string[];
  pause: number; over: boolean; t: number;
  /** Why the fight stopped: the whole party fell, or the summit was reached. */
  outcome?: "fallen" | "summit";
}

export type SkillId = "strike" | "sweep" | "mend";
/** Three skills per hero, the same buttons for every class but with class-flavoured names. */
export const SPIRE_SKILLS: Record<SkillId, { cd: number; names: Record<SpireMember["cls"], string> }> = {
  strike: { cd: 6000, names: { warrior: "Cleaving Blow", mage: "Firebolt", archer: "Piercing Shot" } },
  sweep: { cd: 10000, names: { warrior: "Whirlwind", mage: "Frost Nova", archer: "Arrow Rain" } },
  mend: { cd: 15000, names: { warrior: "Battle Cry", mage: "Healing Light", archer: "Second Wind" } },
};
export const SPIRE_SKILL_IDS = Object.keys(SPIRE_SKILLS) as SkillId[];

/** The hero's own party entry: live stats plus the appearance the others see. */
export function memberOf(hero: Hero, gender: "male" | "female", id: string): SpireMember {
  const s = heroStats(hero);
  const look = heroAppearance(hero, gender);
  return {
    id,
    name: hero.name,
    cls: hero.cls,
    gender,
    synth: look.synth,
    look: look.look,
    level: hero.level + (hero.paragon ?? 0),
    hp: Math.round(s.hp),
    atk: Math.round(s.atk),
    def: Math.round(s.def),
    crit: s.crit,
    dodge: s.dodge,
  };
}

const TYPES: EnemyType[] = ["goblin", "skeleton", "demon"];

/** Foe count and strength for a floor: every floor is harder, every tenth is a boss, more heroes mean tougher foes. */
export function spawnFloor(floor: number, partyLevel: number, size: number, rand = Math.random): LiveFoe[] {
  const boss = floor % 10 === 0;
  const count = boss ? 1 : 2 + (floor % 3 === 0 ? 1 : 0);
  const stage = Math.max(5, partyLevel) + Math.floor(floor / 2);
  const mult = (1 + floor * 0.035) * (0.55 + 0.45 * size);
  return Array.from({ length: count }, (_, i) => {
    const f = stageFoe(stage, boss ? mult * 2.6 : (mult / count) * 1.6, boss ? "dragon" : TYPES[(floor + i) % 3]);
    const hp = Math.round(f.hp);
    return { uid: `${floor}-${i}-${Math.floor(rand() * 1e6)}`, name: f.name, img: f.img, hp, max: hp, atk: Math.round(f.atk * (boss ? 1.1 : 0.8)), def: f.def, boss, swing: 900 + i * 300 };
  });
}

const partyLevel = (members: SpireMember[]) =>
  Math.round(members.reduce((a, m) => a + m.level, 0) / Math.max(1, members.length));

export function newBattle(members: SpireMember[], floor = 1): SpireBattle {
  const start = Math.min(SPIRE_FLOORS, Math.max(1, Math.floor(floor)));
  return {
    floor: start, t: 0, pause: 0, over: false, fx: [], log: [],
    heroes: members.map((m) => ({ id: m.id, hp: m.hp, max: m.hp, cd: {}, swing: 600 })),
    foes: spawnFloor(start, partyLevel(members), members.length),
  };
}

const hit = (atk: number, mult: number, def: number, rand: () => number) => Math.max(1, Math.round(atk * mult * (0.9 + rand() * 0.2) - def * 0.45));

/** A skill can be cast when the hero is standing and its own cooldown has run out. */
export function skillReady(hero: LiveHero | undefined, skill: SkillId): boolean {
  return !!hero && hero.hp > 0 && (hero.cd[skill] ?? 0) <= 0;
}

export interface TickResult { battle: SpireBattle; cleared: number | null }

/** Advances the shared battle by one tick. Only the party leader runs this; everyone else draws the broadcast result. */
export function tick(prev: SpireBattle, members: SpireMember[], casts: { hero: string; skill: SkillId }[], rand = Math.random): TickResult {
  const b: SpireBattle = structuredClone(prev);
  b.t += TICK_MS; b.fx = [];
  let cleared: number | null = null;
  if (b.over) return { battle: b, cleared };
  const stat = (id: string) => members.find((m) => m.id === id);
  const log = (s: string) => { b.log = [...b.log, s].slice(-6); };

  if (b.pause > 0) {
    b.pause -= TICK_MS;
    if (b.pause <= 0) {
      b.foes = spawnFloor(b.floor, partyLevel(members), members.length, rand);
      log(`Floor ${b.floor}: ${b.foes.map((f) => f.name).join(", ")}`);
    }
    return { battle: b, cleared };
  }

  const liveFoes = () => b.foes.filter((f) => f.hp > 0);
  const liveHeroes = () => b.heroes.filter((h) => h.hp > 0);
  const strikeFoe = (src: string, f: LiveFoe, atk: number, mult: number, crit: number, skill?: string) => {
    const c = rand() * 100 < crit;
    const d = Math.round(hit(atk, mult, f.def, rand) * (c ? 1.6 : 1));
    f.hp = Math.max(0, f.hp - d);
    b.fx.push({ src, tgt: f.uid, kind: c ? "crit" : "hit", value: d, skill });
  };

  // Player skills, validated against cooldowns here so a client cannot cast faster than allowed.
  for (const c of casts) {
    const h = b.heroes.find((x) => x.id === c.hero); const m = stat(c.hero);
    if (!h || !m || !SPIRE_SKILLS[c.skill] || !skillReady(h, c.skill)) continue;
    const foes = liveFoes();
    if (c.skill === "strike" && foes.length) strikeFoe(h.id, foes.reduce((a, f) => (f.hp < a.hp ? f : a)), m.atk, 2.4, m.crit + 10, c.skill);
    else if (c.skill === "sweep" && foes.length) for (const f of foes) strikeFoe(h.id, f, m.atk, 1.1, m.crit, c.skill);
    else if (c.skill === "mend") {
      const targets = m.cls === "mage" ? liveHeroes() : [h];
      for (const t of targets) { const v = Math.round(t.max * (m.cls === "mage" ? 0.18 : 0.28)); t.hp = Math.min(t.max, t.hp + v); b.fx.push({ src: h.id, tgt: t.id, kind: "heal", value: v, skill: c.skill }); }
    } else continue;
    h.cd[c.skill] = SPIRE_SKILLS[c.skill].cd;
  }

  // Auto attacks.
  for (const h of liveHeroes()) {
    for (const k of Object.keys(h.cd)) h.cd[k] = Math.max(0, h.cd[k] - TICK_MS);
    h.swing -= TICK_MS;
    const m = stat(h.id); const foes = liveFoes();
    if (h.swing <= 0 && m && foes.length) { strikeFoe(h.id, foes[0], m.atk, 1, m.crit); h.swing = 1200; }
  }
  for (const f of liveFoes()) {
    f.swing -= TICK_MS;
    const heroes = liveHeroes();
    if (f.swing > 0 || !heroes.length) continue;
    f.swing = f.boss ? 1300 : 1600;
    const target = heroes[Math.floor(rand() * heroes.length)]; const m = stat(target.id);
    if (m && rand() * 100 < Math.min(40, m.dodge)) { b.fx.push({ src: f.uid, tgt: target.id, kind: "miss", value: 0 }); continue; }
    const d = hit(f.atk, 1, m?.def ?? 0, rand);
    target.hp = Math.max(0, target.hp - d);
    b.fx.push({ src: f.uid, tgt: target.id, kind: "hit", value: d });
    if (target.hp <= 0) log(`${m?.name ?? "A hero"} has fallen!`);
  }

  if (!liveHeroes().length) { b.over = true; b.outcome = "fallen"; log(`The party fell on floor ${b.floor}.`); return { battle: b, cleared }; }
  if (!liveFoes().length) {
    cleared = b.floor;
    log(`Floor ${b.floor} cleared! +1 Spire Chest each`);
    if (b.floor >= SPIRE_FLOORS) { b.over = true; b.outcome = "summit"; log("The Spire's summit is conquered!"); return { battle: b, cleared }; }
    b.floor += 1; b.pause = FLOOR_PAUSE_MS;
    // The breather between floors: the fallen rise at a quarter health, the living recover 12%.
    for (const h of b.heroes) h.hp = h.hp <= 0 ? Math.round(h.max * 0.25) : Math.min(h.max, h.hp + Math.round(h.max * 0.12));
  }
  return { battle: b, cleared };
}

// ---------- Server: runs, floor clears and chests ----------
async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await (supabase.rpc as unknown as (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export interface SpireState { floor: number; best: number; runs_left: number; chests: number; active: boolean }

const whole = (v: unknown, fallback = 0) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : fallback);

/**
 * Server calls that must not overtake each other: the floor clears in the order they were won,
 * then the end of the run behind them. The chain never stays rejected.
 */
let chain: Promise<unknown> = Promise.resolve();
function queue<T>(job: () => Promise<T>): Promise<T> {
  const next = chain.then(job);
  chain = next.catch(() => undefined);
  return next;
}

/** The server's Spire ledger. A missing field means an older server, never a free run. */
export function parseSpireState(value: unknown): SpireState {
  const o = object(value);
  const floor = whole(o["floor"]);
  return {
    floor,
    best: whole(o["best"]),
    runs_left: Math.min(SPIRE_RUNS_PER_DAY, whole(o["runs_left"])),
    chests: whole(o["chests"]),
    active: o["active"] === true || floor > 0,
  };
}

export const loadSpire = () => withServerHero(async (id) => parseSpireState(await rpc("spire_state", { _hero: id })));

interface BeginResult { ok: boolean; resumed: boolean; floor: number }
export const beginSpire = () => withServerHero(async (id) => {
  const o = object(await rpc("spire_begin", { _hero: id }));
  return { ok: o["ok"] === true, resumed: o["resumed"] === true, floor: whole(o["floor"]) } as BeginResult;
});

/** Ending the run waits for the clears still queued, so a chest is never lost to it. */
export const endSpire = () => queue(async () => { await withServerHero(async (id) => { await rpc("spire_end", { _hero: id }); }); });

async function withSave(name: string, args: Record<string, unknown>) {
  return withServerHero(async (heroId) => {
    const data = await rpc(name, { _hero: heroId, ...args });
    adoptServerSave(heroId, returnedSave(data));
    return object(data);
  });
}

export interface SpireReward { gold: number; mats: Record<string, number> }
/** The chest the server just opened: what it paid, read from its own answer. */
export function parseReward(value: unknown): SpireReward {
  const rw = object(object(value)["reward"]);
  const mats: Record<string, number> = {};
  for (const [k, v] of Object.entries(object(rw["mats"]))) {
    const n = whole(v);
    if (n > 0) mats[k] = n;
  }
  return { gold: whole(rw["gold"]), mats };
}
export const openSpireChest = async () => parseReward(await withSave("spire_open_chest", {}));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Floor clears are reported one at a time, in order, so a busy moment never skips a chest.
 * A rejected clear is retried (the server throttles two clears that arrive too close together)
 * and the queue never rejects: a failed report must not stop the rest of the run.
 */
export function reportClear(floor: number): Promise<boolean> {
  return queue(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        await withSave("spire_clear", { _floor: floor });
        return true;
      } catch {
        // "Too fast" and a dropped connection are both worth one more try; the floor is still
        // reported in order, so the next clear waits behind this one.
        if (attempt < 3) await sleep(FLOOR_PAUSE_MS + 500);
      }
    }
    return false;
  });
}

export const partyCode = (rand = Math.random) => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rand() * 32)]).join("");
/** Codes are shouted across a room: accept any case, drop spaces, and never trust a longer string. */
export const cleanPartyCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);

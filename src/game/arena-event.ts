/** Shared replay for an arena party event match: every client builds the same fight from the
 *  server's seed and winner, and shows the frame for the server clock, so all eight heroes watch
 *  one battle in sync. The fight never decides anything — the winner and gold are server-owned. */
export interface ArenaUnit { id: string; name: string; cls: string; gender: string; level: number; power: number; side: "a" | "b" }
export interface ArenaFrame { hp: Record<string, number>; log: string | null }
export const ARENA_STEP_MS = 700;
/** Fights last 40-60 s: evenly matched parties (by summed power) fight longest. */
export function arenaSteps(units: ArenaUnit[]): number {
  const sum = (side: "a" | "b") => units.filter((u) => u.side === side).reduce((n, u) => n + Math.max(1, u.power), 0);
  const a = sum("a"), b = sum("b");
  const close = Math.min(a, b) / Math.max(1, a, b);
  return Math.round(40_000 / ARENA_STEP_MS + close * (20_000 / ARENA_STEP_MS));
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function arenaTimeline(units: ArenaUnit[], seed: number, winner: "a" | "b"): ArenaFrame[] {
  const r = rng(seed);
  const steps = arenaSteps(units);
  const n = (side: "a" | "b") => units.filter((u) => u.side === side).length;
  const loser = winner === "a" ? "b" : "a";
  // Spread the damage so the losing side lasts until the bell instead of falling in seconds.
  const winHit = (220 * n(loser)) / steps, loseHit = (140 * n(winner)) / steps;
  const hp: Record<string, number> = Object.fromEntries(units.map((u) => [u.id, 100]));
  const frames: ArenaFrame[] = [{ hp: { ...hp }, log: null }];
  const alive = (side: "a" | "b") => units.filter((u) => u.side === side && hp[u.id]! > 0);
  for (let i = 0; i < steps; i++) {
    const side: "a" | "b" = i % 2 === 0 ? "a" : "b";
    const foe = side === "a" ? "b" : "a";
    const atk = alive(side), def = alive(foe);
    if (!atk.length || !def.length) break;
    const a = atk[Math.floor(r() * atk.length)]!, d = def[Math.floor(r() * def.length)]!;
    let dmg = Math.max(1, Math.round((side === winner ? winHit : loseHit) * (0.6 + r() * 0.8)));
    if (i === steps - 1 && side === winner) dmg = 999;
    // The losing side can wound, never finish, the last standing winner.
    if (foe === winner && def.length === 1) dmg = Math.min(dmg, hp[d.id]! - 1);
    hp[d.id] = Math.max(0, hp[d.id]! - Math.max(0, dmg));
    frames.push({ hp: { ...hp }, log: `${a.name} → ${d.name} −${dmg >= 999 ? "∞" : dmg}` });
  }
  // Whatever is left of the losing side falls at the bell.
  const end = { ...hp };
  for (const u of units) if (u.side !== winner) end[u.id] = 0;
  frames.push({ hp: end, log: null });
  return frames;
}

/** UTC hours at which the event opens; it stays open for one hour. */
export const ARENA_EVENT_HOURS = [0, 6, 12, 18];
export const arenaEventGold = (level: number, won: boolean) => Math.round((1500 + Math.max(1, level) * 60) * (won ? 1 : 0.4));

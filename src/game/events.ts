// ============= Recurring world events: deterministic schedules + time-zone-aware display =============
// Schedules are pure functions of a fixed UTC anchor, so every player's client agrees on when an
// event opens regardless of their local clock. Nothing here reads window or localStorage.

export const H = 3_600_000;
export const D = 24 * H;

export type EventKind = "boss" | "dungeon" | "caravan" | "season";

export interface WorldEvent {
  id: string;
  name: string;
  kind: EventKind;
  /** Recurrence interval in ms. */
  everyMs: number;
  /** UTC epoch ms of a known occurrence start; every later occurrence is anchor + k*everyMs. */
  anchor: number;
  /** How long the event stays open once it starts. */
  durationMs: number;
  blurb: string;
  reward: string;
  /** Encounter tier fed to the real foe/reward factories. */
  stage: number;
}

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: "world-boss",
    name: "Emberfall World Boss",
    kind: "boss",
    everyMs: 2 * H,
    anchor: Date.UTC(2026, 0, 1, 0, 0, 0),
    durationMs: 45 * 60_000,
    blurb: "A different tyrant invades every two hours. Defeat it during the invasion window.",
    reward: "Rare+ weapons or jewelry, Boss Cores, crafting materials, gold and experience",
    stage: 40,
  },
  {
    id: "timed-dungeon",
    name: "Timed Dungeon",
    kind: "dungeon",
    everyMs: 6 * H,
    anchor: Date.UTC(2026, 0, 1, 2, 0, 0),
    durationMs: 30 * 60_000,
    blurb: "A short, sharp dungeon run with upgraded drops while the gate holds.",
    reward: "Dungeon loot, gold and experience",
    stage: 28,
  },
  {
    id: "caravan",
    name: "Treasure Caravan",
    kind: "caravan",
    everyMs: 2 * H,
    anchor: Date.UTC(2026, 0, 1, 1, 0, 0),
    durationMs: 15 * 60_000,
    blurb: "A guarded caravan crosses the road; escort it to claim the cargo.",
    reward: "Gold, crafting materials and a loot roll",
    stage: 14,
  },
  {
    id: "harvest-season",
    name: "Harvest Season",
    kind: "season",
    everyMs: 7 * D,
    anchor: Date.UTC(2026, 0, 5, 0, 0, 0),
    durationMs: 2 * D,
    blurb: "A weekly two-day hunt for the season's champion.",
    reward: "Seasonal encounter loot, gold and experience",
    stage: 60,
  },
];

export type EventStatus =
  | { state: "live"; startedAt: number; endsAt: number; msLeft: number }
  | { state: "upcoming"; startsAt: number; msLeft: number };

/** Which occurrence is happening now, or when the next one opens. */
export function statusOf(now: number, ev: WorldEvent): EventStatus {
  const k = Math.max(0, Math.floor((now - ev.anchor) / ev.everyMs));
  const startedAt = ev.anchor + k * ev.everyMs;
  const endsAt = startedAt + ev.durationMs;
  if (now >= startedAt && now < endsAt) {
    return { state: "live", startedAt, endsAt, msLeft: endsAt - now };
  }
  const nextK = now < ev.anchor ? 0 : k + 1;
  const startsAt = ev.anchor + nextK * ev.everyMs;
  return { state: "upcoming", startsAt, msLeft: startsAt - now };
}

/** "2h 04m 13s" / "3d 04h 05m" — never negative. */
export function countdown(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(t / 86_400);
  const h = Math.floor((t % 86_400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${p(h)}h ${p(m)}m`;
  if (h > 0) return `${h}h ${p(m)}m ${p(s)}s`;
  return `${m}m ${p(s)}s`;
}

/** The viewer's own zone, e.g. "Europe/Paris (UTC+02:00)". */
export function zoneLabel(now = Date.now()): string {
  let zone = "UTC";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    zone = "UTC";
  }
  const off = -new Date(now).getTimezoneOffset();
  const sign = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  return `${zone} (UTC${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")})`;
}

/** Format an instant for a named zone; pass undefined for the viewer's own zone. */
export function timeIn(ts: number, tz?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(tz && tz !== "local" ? { timeZone: tz } : {}),
  }).format(new Date(ts));
}

export const TZ_CHOICES = ["local", "UTC", "Europe/London", "Europe/Paris", "America/New_York", "Asia/Tokyo", "Australia/Sydney"];

/** How far ahead of an opening a reminder fires. */
export const REMIND_LEAD_MS = 5 * 60_000;

/** Stable key for the occurrence a reminder belongs to, so it fires once per occurrence. */
export function occurrenceKey(ev: WorldEvent, now: number): string {
  const s = statusOf(now, ev);
  return s.state === "live" ? `${ev.id}:ends:${s.endsAt}` : `${ev.id}:starts:${s.startsAt}`;
}

/** True while the next opening is inside the lead window and the event is not already running. */
export function reminderDue(now: number, ev: WorldEvent, lead = REMIND_LEAD_MS): boolean {
  const s = statusOf(now, ev);
  return s.state === "upcoming" && s.msLeft <= lead;
}

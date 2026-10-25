// ============= Recurring world events: deterministic schedules + time-zone-aware display =============
// Schedules are pure functions of the Greek clock (Europe/Athens), so every player agrees on when
// an event opens no matter what their own device clock or time zone says. Nothing here reads window
// or localStorage.

export const H = 3_600_000;
export const D = 24 * H;

/** Ember Fall runs on the Greek clock: every window opens on a Europe/Athens wall-clock hour. */
export const GAME_TZ = "Europe/Athens";

/** Milliseconds Europe/Athens is ahead of UTC at an instant (summer time included). */
export function greekOffsetMs(ts: number, tz = GAME_TZ): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ts));
  const at = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUTC = Date.UTC(at("year"), at("month") - 1, at("day"), at("hour") % 24, at("minute"), at("second"));
  return asUTC - Math.floor(ts / 1000) * 1000;
}

/** Epoch ms of the most recent Greek midnight at or before an instant. */
export function greekDayStart(ts: number): number {
  const off = greekOffsetMs(ts);
  return ts - ((((ts + off) % D) + D) % D);
}

export type EventKind = "boss" | "dungeon" | "caravan" | "season";

export interface WorldEvent {
  id: string;
  name: string;
  kind: EventKind;
  /** Recurrence interval in ms. */
  everyMs: number;
  /** UTC epoch ms of a known occurrence start. Weekly and longer events keep this fixed grid. */
  /** Greek wall-clock hour the window opens. Sub-day events are pinned to Greek midnight, so their
   *  openings land on the same round Greek hours all year instead of drifting with summer time. */
  greekHour?: number;
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
    greekHour: 0,
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
    greekHour: 2,
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
    greekHour: 1,
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

/** Start of the occurrence that contains, or precedes, an instant. Events shorter than a day are
 *  pinned to Greek midnight so they open on round Greek hours all year; longer ones keep a fixed grid. */
export function occurrenceStart(ev: WorldEvent, now: number): number {
  if (ev.everyMs >= D) {
    if (now < ev.anchor) return ev.anchor;
    return ev.anchor + Math.floor((now - ev.anchor) / ev.everyMs) * ev.everyMs;
  }
  const base = greekDayStart(now) + (ev.greekHour ?? 0) * H;
  return base + Math.floor((now - base) / ev.everyMs) * ev.everyMs;
}

/** Which occurrence is happening now, or when the next one opens. */
export function statusOf(now: number, ev: WorldEvent): EventStatus {
  const startedAt = occurrenceStart(ev, now);
  const endsAt = startedAt + ev.durationMs;
  if (now >= startedAt && now < endsAt) {
    return { state: "live", startedAt, endsAt, msLeft: endsAt - now };
  }
  const startsAt = startedAt + ev.everyMs;
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

/** Format an instant on the game's own Greek clock. */
export function greekTime(ts: number): string {
  return timeIn(ts, GAME_TZ);
}

/** Format an instant for a named zone; pass undefined for the viewer's own zone. */
export function timeIn(ts: number, tz?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(tz && tz !== "local" ? { timeZone: tz } : {}),
  }).format(new Date(ts));
}

export const TZ_CHOICES = [GAME_TZ, "local", "UTC", "Europe/London", "Europe/Paris", "America/New_York", "Asia/Tokyo", "Australia/Sydney"];

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

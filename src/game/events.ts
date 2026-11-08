import { MAX_LEVEL, WORLD_DRIFT } from "./data";

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

export type EventKind = "siege" | "hunt" | "duel" | "rift" | "bloodmoon";

/** What one win in an event pays beyond its gold and XP (see EventCalendar's payout). */
export interface EventBonus {
  /** Multiplier on the encounter's gold and XP. */
  mult: number;
  mats?: Partial<Record<import("./crafting").Mat, number>>;
  gem?: { type: import("./crafting").GemType; tier: number };
  chest?: boolean;
  /** Siege-style events pay every EVENT_BOSS_KILLS_REQUIRED-th win, not on every win. */
  gated?: boolean;
}

export interface WorldEvent {
  id: string;
  name: string;
  kind: EventKind;
  /** Recurrence interval in ms. */
  everyMs: number;
  /** Greek wall-clock hour the window opens. Sub-day events are pinned to Greek midnight, so their
   *  openings land on the same round Greek hours all year instead of drifting with summer time. */
  greekHour?: number;
  anchor: number;
  /** How long the event stays open once it starts. */
  durationMs: number;
  blurb: string;
  reward: string;
  bonus: EventBonus;
  /** Encounter tier fed to the real foe/reward factories. */
  stage: number;
}

/**
 * The reworked world events. Each one is a different kind of fight with its own reward table:
 * rifts pay sigils, hunts pay hides and essence, duels pay fragments, astral rifts pay starshards
 * and crystals, and the three-day Blood Moon pays the biggest purse of all. None of them are the
 * old boss/dungeon/caravan loop.
 */
export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: "rift-siege",
    name: "Rift Siege",
    kind: "siege",
    everyMs: 4 * H,
    anchor: Date.UTC(2026, 0, 1, 0, 0, 0),
    greekHour: 0,
    durationMs: 35 * 60_000,
    blurb: "A rift tears open and a siege champion steps through. Repel three pushes during the breach.",
    reward: "1.6× gold and XP, Ember Ore, Armor Fragments, an Elite Sigil and a Flawed Sapphire",
    bonus: { mult: 1.6, mats: { ore: 20, fragment: 12, sigil: 1 }, gem: { type: "sapphire", tier: 2 }, gated: true },
    stage: 30,
  },
  {
    id: "bounty-hunt",
    name: "Bounty Hunt",
    kind: "hunt",
    everyMs: 3 * H,
    anchor: Date.UTC(2026, 0, 1, 1, 0, 0),
    greekHour: 1,
    durationMs: 25 * 60_000,
    blurb: "A marked beast is loose in the wilds. Every win pays a full hunter's bounty.",
    reward: "1.25× gold and XP, Beast Hide, Soul Essence, Emberbloom, a Flawed Emerald and a Gold Chest",
    bonus: { mult: 1.25, mats: { hide: 24, essence: 14, bloom: 10 }, gem: { type: "emerald", tier: 2 }, chest: true },
    stage: 24,
  },
  {
    id: "champion-duel",
    name: "Champion's Duel",
    kind: "duel",
    everyMs: 5 * H,
    anchor: Date.UTC(2026, 0, 1, 2, 0, 0),
    greekHour: 2,
    durationMs: 20 * 60_000,
    blurb: "A rival champion answers your banner. Win the duel for the crowd's purse.",
    reward: "1.5× gold and XP, Armor Fragments, Soul Essence and a Flawed Ruby",
    bonus: { mult: 1.5, mats: { fragment: 18, essence: 10 }, gem: { type: "ruby", tier: 2 } },
    stage: 35,
  },
  {
    id: "astral-rift",
    name: "Astral Rift",
    kind: "rift",
    everyMs: 8 * H,
    anchor: Date.UTC(2026, 0, 1, 3, 0, 0),
    greekHour: 3,
    durationMs: 40 * 60_000,
    blurb: "The sky splits over a sleeping constellation. Hold the line while it pours starlight.",
    reward: "1.4× gold and XP, Starshards, Arcane Crystals, Soul Essence and a Flawed Amethyst",
    bonus: { mult: 1.4, mats: { starshard: 6, crystal: 10, essence: 18 }, gem: { type: "amethyst", tier: 2 } },
    stage: 45,
  },
  {
    id: "blood-moon",
    name: "Blood Moon Rising",
    kind: "bloodmoon",
    everyMs: 72 * H,
    anchor: Date.UTC(2026, 0, 2, 0, 0, 0),
    durationMs: 6 * H,
    blurb: "Once every three days the moon turns red. Hunt its herald for the season's greatest purse.",
    reward: "2.2× gold and XP, Boss Cores, Elite Sigils, Starshards, a Clear Topaz and a Gold Chest",
    bonus: { mult: 2.2, mats: { bossCore: 2, sigil: 3, starshard: 10 }, gem: { type: "topaz", tier: 3 }, chest: true, gated: true },
    stage: 55,
  },
];

/** Gated events (sieges and the Blood Moon) pay on the third win, never on a single hit (see event-rewards.ts). */
export const EVENT_BOSS_KILLS_REQUIRED = 3;

/** The stage an event's encounter and rewards use for a hero of this level. */
export function eventStage(ev: WorldEvent, heroLevel: number): number {
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.round(heroLevel)));
  return Math.max(ev.stage, Math.min(lv, ev.stage + WORLD_DRIFT));
}

/** One readable line describing what a win in this event pays on top of gold and XP. */
export function eventBonusLines(ev: WorldEvent): string[] {
  const { bonus } = ev;
  const lines: string[] = [];
  for (const [m, n] of Object.entries(bonus.mats ?? {}) as [import("./crafting").Mat, number][])
    lines.push(`${n} ${MAT_NAME[m]}`);
  if (bonus.gem) lines.push(`1 ${GEM_TIER_NAME[bonus.gem.tier - 1] ?? ""} ${GEM_NAME[bonus.gem.type]} gem`.replace("  ", " "));
  if (bonus.chest) lines.push("Gold Chest (Vault)");
  return lines;
}

/** Minimal names for event lines, so events.ts stays free of the crafting UI's runtime imports. */
const MAT_NAME: Record<import("./crafting").Mat, string> = {
  ore: "Ember Ore", essence: "Soul Essence", starshard: "Starshard", bossCore: "Boss Core",
  fragment: "Armor Fragment", sigil: "Elite Sigil", hide: "Beast Hide", bloom: "Emberbloom",
  crystal: "Arcane Crystal", enchantStone: "Enchantment Stone", fateStone: "Fate Stone",
};
const GEM_NAME: Record<import("./crafting").GemType, string> = {
  ruby: "Ruby", emerald: "Emerald", sapphire: "Sapphire", topaz: "Topaz",
  amethyst: "Amethyst", tourmaline: "Tourmaline", aquamarine: "Aquamarine", lapis: "Lapis",
};
const GEM_TIER_NAME = ["Chipped", "Flawed", "Clear", "Polished", "Flawless", "Radiant", "Royal", "Sovereign", "Celestial", "Ascendant", "Eternal", "Primordial"];

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

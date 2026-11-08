import { describe, expect, it } from "vitest";
import {
  countdown,
  eventBonusLines,
  occurrenceKey,
  reminderDue,
  REMIND_LEAD_MS,
  statusOf,
  timeIn,
  WORLD_EVENTS,
} from "@/game/events";

const H = 3_600_000;
const D = 24 * H;
const siege = WORLD_EVENTS.find((e) => e.id === "rift-siege");
if (!siege) throw new Error("Rift Siege schedule missing");
// Greek-hour windows: the anchor is 02:00 Greek time, and the first siege opens at 04:00 Greek.
const firstLive = siege.anchor + 2 * H;

describe("world event schedules", () => {
  it("rifts reopen every four hours", () => {
    expect(siege.everyMs).toBe(4 * H);
    const next = statusOf(firstLive + 4 * H + 60_000, siege);
    expect(next.state).toBe("live");
    if (next.state === "live") expect(next.startedAt).toBe(firstLive + 4 * H);
  });
  it("every event is well-formed and uniquely identified", () => {
    expect(new Set(WORLD_EVENTS.map((e) => e.id)).size).toBe(WORLD_EVENTS.length);
    for (const e of WORLD_EVENTS) {
      expect(e.everyMs).toBeGreaterThan(e.durationMs);
      expect(e.durationMs).toBeGreaterThan(0);
      expect(e.stage).toBeGreaterThan(0);
      expect(e.bonus.mult).toBeGreaterThan(0);
      expect(Number.isFinite(e.anchor)).toBe(true);
    }
  });
  it("runs a different kind of fight for every event", () => {
    const kinds = WORLD_EVENTS.map((e) => e.kind);
    expect(new Set(kinds).size).toBe(WORLD_EVENTS.length);
    // The old boss/dungeon/caravan/season loop is gone entirely.
    for (const old of ["boss", "dungeon", "caravan", "season"]) expect(kinds).not.toContain(old);
  });

  it("reports a running event as live with the time left until it closes", () => {
    const now = firstLive + 30 * 60_000; // 30 min into a 35 min window
    const s = statusOf(now, siege);
    expect(s.state).toBe("live");
    if (s.state === "live") {
      expect(s.startedAt).toBe(firstLive);
      expect(s.endsAt).toBe(firstLive + 35 * 60_000);
      expect(s.msLeft).toBe(5 * 60_000);
    }
  });

  it("counts down to the next occurrence once the current one has closed", () => {
    const now = firstLive + 50 * 60_000; // window closed 15 min ago
    const s = statusOf(now, siege);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") {
      expect(s.startsAt).toBe(firstLive + 4 * H);
      expect(s.msLeft).toBe(4 * H - 50 * 60_000);
    }
  });

  it("holds the same schedule before the first occurrence", () => {
    const s = statusOf(firstLive - 10 * 60_000, siege);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") expect(s.startsAt).toBe(firstLive);
  });

  it("keeps the Blood Moon on a three-day cycle", () => {
    const moon = WORLD_EVENTS.find((e) => e.kind === "bloodmoon")!;
    expect(moon.everyMs).toBe(3 * D);
    const s = statusOf(moon.anchor + 1 * D, moon);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") expect(s.startsAt).toBe(moon.anchor + 3 * D);
  });

  it("describes every bonus a winning event pays", () => {
    for (const e of WORLD_EVENTS) expect(eventBonusLines(e).length).toBeGreaterThan(0);
  });
});

describe("countdown formatting", () => {
  it("renders hours, minutes and seconds", () => {
    expect(countdown(3_723_000)).toBe("1h 02m 03s");
  });
  it("renders whole days for long waits", () => {
    expect(countdown(2 * D + H)).toBe("2d 01h 00m");
  });
  it("renders sub-minute waits without hours", () => {
    expect(countdown(45_000)).toBe("0m 45s");
  });
  it("never goes negative", () => {
    expect(countdown(-9_000)).toBe("0m 00s");
  });
});

describe("time-zone-aware display", () => {
  const ts = Date.UTC(2026, 0, 1, 0, 0, 0);
  it("shows the same instant as 09:00 in Tokyo", () => {
    expect(timeIn(ts, "Asia/Tokyo")).toContain("09:00");
  });
  it("shows midnight when pinned to UTC", () => {
    expect(timeIn(ts, "UTC")).toContain("00:00");
  });
  it("shifts the same instant for New York", () => {
    expect(timeIn(ts, "America/New_York")).toContain("19:00");
  });
});

describe("reminders", () => {
  it("fires only inside the lead window before an opening", () => {
    const soon = firstLive - 2 * 60_000;
    const later = firstLive - 2 * H;
    expect(reminderDue(soon, siege)).toBe(true);
    expect(reminderDue(later, siege)).toBe(false);
  });
  it("does not fire while the event is already running", () => {
    expect(reminderDue(firstLive + 60_000, siege)).toBe(false);
  });
  it("keys one reminder per occurrence, so it cannot fire twice", () => {
    const before = occurrenceKey(siege, firstLive - 60_000);
    const inside = occurrenceKey(siege, firstLive + 60_000);
    const nextCycle = occurrenceKey(siege, firstLive + 4 * H - 60_000);
    expect(before).toBe(`${siege.id}:starts:${firstLive}`);
    expect(inside).toBe(`${siege.id}:ends:${firstLive + siege.durationMs}`);
    expect(nextCycle).toBe(`${siege.id}:starts:${firstLive + 4 * H}`);
    expect(new Set([before, inside, nextCycle]).size).toBe(3);
  });
  it("uses the shared five minute lead", () => {
    expect(REMIND_LEAD_MS).toBe(300_000);
  });
});

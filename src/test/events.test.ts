import { describe, expect, it } from "vitest";
import {
  countdown,
  occurrenceKey,
  reminderDue,
  REMIND_LEAD_MS,
  statusOf,
  timeIn,
  WORLD_EVENTS,
  type WorldEvent,
} from "@/game/events";

const H = 3_600_000;
const D = 24 * H;
const boss = WORLD_EVENTS.find((e) => e.id === "world-boss")!;

describe("world event schedules", () => {
  it("every event is well-formed and uniquely identified", () => {
    expect(new Set(WORLD_EVENTS.map((e) => e.id)).size).toBe(WORLD_EVENTS.length);
    for (const e of WORLD_EVENTS) {
      expect(e.everyMs).toBeGreaterThan(e.durationMs);
      expect(e.durationMs).toBeGreaterThan(0);
      expect(e.stage).toBeGreaterThan(0);
      expect(Number.isFinite(e.anchor)).toBe(true);
    }
  });

  it("reports a running event as live with the time left until it closes", () => {
    const now = boss.anchor + 30 * 60_000; // 30 min into a 45 min window
    const s = statusOf(now, boss);
    expect(s.state).toBe("live");
    if (s.state === "live") {
      expect(s.startedAt).toBe(boss.anchor);
      expect(s.endsAt).toBe(boss.anchor + 45 * 60_000);
      expect(s.msLeft).toBe(15 * 60_000);
    }
  });

  it("counts down to the next occurrence once the current one has closed", () => {
    const now = boss.anchor + 50 * 60_000; // window closed 5 min ago
    const s = statusOf(now, boss);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") {
      expect(s.startsAt).toBe(boss.anchor + 4 * H);
      expect(s.msLeft).toBe(4 * H - 50 * 60_000);
    }
  });

  it("holds the same schedule before the first occurrence", () => {
    const s = statusOf(boss.anchor - 10 * 60_000, boss);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") expect(s.startsAt).toBe(boss.anchor);
  });

  it("keeps a weekly season on a seven-day cycle", () => {
    const season = WORLD_EVENTS.find((e) => e.kind === "season")!;
    expect(season.everyMs).toBe(7 * D);
    const s = statusOf(season.anchor + 3 * D, season);
    expect(s.state).toBe("upcoming");
    if (s.state === "upcoming") expect(s.startsAt).toBe(season.anchor + 7 * D);
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
    const soon = boss.anchor - 2 * 60_000;
    const later = boss.anchor - 2 * H;
    expect(reminderDue(soon, boss)).toBe(true);
    expect(reminderDue(later, boss)).toBe(false);
  });
  it("does not fire while the event is already running", () => {
    expect(reminderDue(boss.anchor + 60_000, boss)).toBe(false);
  });
  it("keys one reminder per occurrence, so it cannot fire twice", () => {
    const before = occurrenceKey(boss, boss.anchor - 60_000);
    const inside = occurrenceKey(boss, boss.anchor + 60_000);
    const nextCycle = occurrenceKey(boss, boss.anchor + 4 * H - 60_000);
    expect(before).toBe(`${boss.id}:starts:${boss.anchor}`);
    expect(inside).toBe(`${boss.id}:ends:${boss.anchor + boss.durationMs}`);
    expect(nextCycle).toBe(`${boss.id}:starts:${boss.anchor + 4 * H}`);
    expect(new Set([before, inside, nextCycle]).size).toBe(3);
  });
  it("uses the shared five minute lead", () => {
    expect(REMIND_LEAD_MS).toBe(300_000);
  });
});

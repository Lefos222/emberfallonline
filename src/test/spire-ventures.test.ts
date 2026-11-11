import { describe, expect, it } from "vitest";
import { riftRooms, todaysWardens, ventureOf } from "@/game/spire-ventures";

describe("spire ventures", () => {
  it("rotates three different wardens per day", () => {
    const w = todaysWardens(Date.UTC(2026, 10, 11));
    expect(new Set(w.map((x) => x.id)).size).toBe(3);
  });
  it("rift has five rooms ending with the keeper", () => {
    const r = riftRooms(Date.UTC(2026, 10, 11));
    expect(r).toHaveLength(5);
    expect(r[4]).toBe("keeper");
  });
  it("resets progress on a new UTC day", () => {
    const v = ventureOf({ day: "2026-11-10", wardens: ["reaver"], room: 3, failed: true }, Date.UTC(2026, 10, 11));
    expect(v).toEqual({ day: "2026-11-11", wardens: [], room: 0, failed: false });
  });
});

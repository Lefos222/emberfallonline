import { expect, it } from "vitest";
import { winterCastleActive } from "@/game/castle-season";

it("shows the snowy castle during the 2026 winter event", () => {
  expect(winterCastleActive(Date.UTC(2026, 10, 17, 15, 3))).toBe(true);
  expect(winterCastleActive(Date.UTC(2026, 11, 31, 23, 59, 59, 999))).toBe(true);
});

it("restores the original castle on January 1, 2027 UTC, without repeating yearly", () => {
  expect(winterCastleActive(Date.UTC(2027, 0, 1))).toBe(false);
  expect(winterCastleActive(Date.UTC(2027, 11, 1))).toBe(false);
  expect(winterCastleActive(Date.UTC(2026, 10, 16, 23, 59))).toBe(false);
});
import { describe, expect, it } from "vitest";
import { bagSize, invCap, matSlots, MAT_STACK } from "@/game/data";

describe("materials take bag slots", () => {
  it("each material type uses one slot per stack", () => {
    expect(matSlots({ mats: { ore: 1, hide: MAT_STACK + 1 } })).toBe(3);
  });
  it("gear room shrinks by the material slots", () => {
    const h = { bagRows: 0, mats: { ore: 5, hide: 5 } };
    expect(bagSize(h)).toBe(40);
    expect(invCap(h)).toBe(38);
  });
});

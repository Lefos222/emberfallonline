import { describe, expect, it } from "vitest";
import { FISHING_CASTS_PER_DAY, castsLeft, reel } from "@/game/fishing";
import type { Hero } from "@/game/data";

const hero = () => ({ gold: 0, level: 1, mats: {} } as unknown as Hero);

describe("fishing pier", () => {
  it("allows ten casts a day, misses included", () => {
    const h = hero();
    expect(FISHING_CASTS_PER_DAY).toBe(10);
    for (let i = 0; i < 10; i++) reel(h, 0);
    expect(castsLeft(h)).toBe(0);
    expect(reel(h, 1)).toBe("none");
    expect(h.gold).toBe(0);
  });
  it("a dead-centre reel lands a better fish than a grazing one", () => {
    const h = hero();
    const good = reel(h, 1, () => 0);
    const poor = reel(h, 0.05, () => 0);
    expect(good && good !== "none" && good.id).toBe("koi");
    expect(poor && poor !== "none" && poor.id).toBe("minnow");
  });
});

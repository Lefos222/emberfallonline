import { expect, it } from "vitest";
import type { Hero } from "@/game/data";
import { openSnowChest, redeemSnowballs, snowChestWait } from "@/game/snow-chest";

const hero = () => ({ gold: 100 }) as Hero;

it("gives 3 snowballs and then stays sealed for 4 hours", () => {
  const h = hero();
  expect(openSnowChest(h, 0)).toBe(3);
  expect(openSnowChest(h, 3_600_000)).toBeNull();
  expect(snowChestWait(h, 3_600_000)).toBe(3 * 3_600_000);
  expect(openSnowChest(h, 4 * 3_600_000)).toBe(3);
  expect(h.snow?.balls).toBe(6);
});

it("redeems each snowball for 250 gold", () => {
  const h = hero();
  openSnowChest(h, 0);
  expect(redeemSnowballs(h)).toBe(750);
  expect(h.gold).toBe(850);
  expect(redeemSnowballs(h)).toBe(0);
});

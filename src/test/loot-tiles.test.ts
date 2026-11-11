import { describe, it, expect } from "vitest";
import { lootTiles } from "@/game/loot-tiles";

describe("after-fight loot tiles", () => {
  it("turns reward lines into picture tiles with amounts", () => {
    const { tiles, notes } = lootTiles(["+120 gold", "+3 Ember Ore", "+5 Renown", "+1 Lv 2 Enchantment Stone"]);
    expect(tiles.map((t) => [t.kind, t.amount])).toEqual([["gold", "120"], ["mat", "3"], ["renown", "5"], ["stone", "1"]]);
    expect(notes).toEqual([]);
  });
  it("keeps non-reward text as short notes", () => {
    const { tiles, notes } = lootTiles(["Victory in the arena!", "+50 gold"]);
    expect(tiles).toHaveLength(1);
    expect(notes).toEqual(["Victory in the arena!"]);
  });
  it("shows a found chest as a chest tile", () => {
    expect(lootTiles(["Gold Chest found — open it in the Armory vault"]).tiles[0].kind).toBe("goldChest");
  });
});

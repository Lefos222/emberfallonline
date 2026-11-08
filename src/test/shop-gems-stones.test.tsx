import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuctionHousePanel,
  SHOP_DISCOUNT,
  buyEnchantStone,
  shopPrice,
  stoneShopPrice,
} from "@/game/Marketplace";
import { Forge } from "@/game/panels";
import { GemWorkshop } from "@/game/Workshop";
import { makeItem, newHero } from "@/game/data";
import { MAX_SOCKETS, cutHole, holeCost, insertGem, socketCount, sockets } from "@/game/crafting";
import {
  addStones,
  combineGold,
  combineStones,
  rollStoneDrop,
  stoneCount,
  stonePrice,
} from "@/game/enchant";
import { getState, setHero } from "@/game/store";
import { fmt } from "@/game/ui";

const hero = () => {
  const h = newHero("Smith", "warrior");
  h.level = 20;
  h.gold = 5_000_000;
  return h;
};

describe("auction house shop discount", () => {
  it("sells every good 73% under the old stall prices", () => {
    expect(SHOP_DISCOUNT).toBe(0.73);
    expect(shopPrice("stamina", 1)).toBe(Math.round(21_000 * (1 - SHOP_DISCOUNT)));
    expect(shopPrice("strength", 1)).toBe(Math.round(40_000 * (1 - SHOP_DISCOUNT)));
    expect(stoneShopPrice(1, 1)).toBe(Math.round(stonePrice(1, 1) * (1 - SHOP_DISCOUNT)));
  });

  it("carries all nine stone grades and the battle scrolls inside the shop", () => {
    setHero(hero());
    render(<AuctionHousePanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));

    expect(screen.getByText("Enchantment Stones · nine grades")).toBeInTheDocument();
    for (let grade = 1; grade <= 9; grade += 1) {
      expect(screen.getByRole("button", { name: `Buy a Lv ${grade} stone` })).toBeInTheDocument();
    }
    // The scrolls live in the shop as well, with their own buy buttons.
    expect(screen.getByText("Battle Scrolls")).toBeInTheDocument();
    expect(screen.getByText("Damage Scroll")).toBeInTheDocument();
    expect(screen.getByText("Experience Scroll")).toBeInTheDocument();
  });

  it("buys a stone of any grade into the pouch", () => {
    const h = hero();
    const gold = h.gold;
    expect(buyEnchantStone(h, 1)).toBeNull();
    expect(stoneCount(h, 1)).toBe(1);
    expect(h.mats?.enchantStone).toBe(1);
    expect(h.gold).toBe(gold - stoneShopPrice(1, h.level));

    expect(buyEnchantStone(h, 4)).toBeNull();
    expect(stoneCount(h, 4)).toBe(1);
    expect(h.enchantStones?.["4"]).toBe(1);
  });
});

describe("enchantment stone grades", () => {
  it("forges two stones of a grade plus gold into the next grade", () => {
    const h = hero();
    addStones(h, 3, 2);
    const gold = h.gold;
    expect(combineStones(h, 3)).toBeNull();
    expect(stoneCount(h, 3)).toBe(0);
    expect(stoneCount(h, 4)).toBe(1);
    expect(h.gold).toBe(gold - combineGold(3, h.level));
  });

  it("refuses to forge without two stones or the gold", () => {
    const h = hero();
    addStones(h, 2, 1);
    expect(combineStones(h, 2)).toMatch(/two Lv 2/);
    addStones(h, 2, 1);
    h.gold = 0;
    expect(combineStones(h, 2)).toMatch(/gold/);
    expect(stoneCount(h, 2)).toBe(2);
  });

  it("drops stones from won battles, always for a boss", () => {
    // Math.random pinned low: the drop roll and the grade swing both pass.
    const always = () => 0;
    expect(rollStoneDrop(20, false, false, always)).not.toBeNull();
    const boss = rollStoneDrop(20, true, false, always);
    expect(boss).not.toBeNull();
    // A roll outside the chance leaves nothing behind.
    expect(rollStoneDrop(20, false, false, () => 0.99)).toBeNull();
    // Bosss drops sit above the level's usual grade.
    expect(boss!.level).toBeGreaterThan(rollStoneDrop(20, false, false, always)!.level - 1);
  });
});

describe("gem socket cutting", () => {
  it("charges gold and lets a piece reach four sockets", () => {
    const h = hero();
    const piece = makeItem("warrior", 20, 1, "weapon");
    h.inventory = [piece];
    expect(socketCount(piece)).toBe(1);

    const cost = holeCost(piece, h.level);
    expect(cutHole(h, piece.id)).toBeNull();
    expect(socketCount(piece)).toBe(2);
    expect(h.gold).toBe(5_000_000 - cost);

    expect(cutHole(h, piece.id)).toBeNull();
    expect(cutHole(h, piece.id)).toBeNull();
    expect(socketCount(piece)).toBe(MAX_SOCKETS);
    expect(cutHole(h, piece.id)).toMatch(/already holds 4/);
  });

  it("holds a gem in a freshly cut hole", () => {
    const h = hero();
    const piece = makeItem("warrior", 20, 1, "weapon");
    h.inventory = [piece];
    cutHole(h, piece.id);
    h.gems = { "ruby:1": 1 };
    expect(insertGem(h, piece.id, 1, "ruby:1")).toBeNull();
    expect(sockets(piece)[1]).toBe("ruby:1");
    expect(stoneCount(h, 1)).toBe(0);
  });
});

describe("gem workshop socket cutting", () => {
  afterEach(() => setHero(null));

  it("cuts the hole from the Gem Workshop", () => {
    const h = hero();
    const piece = makeItem("warrior", 20, 1, "weapon");
    h.inventory = [piece];
    setHero(h);
    const cost = holeCost(piece, h.level);
    render(<GemWorkshop onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: new RegExp(piece.name) }));
    fireEvent.click(screen.getByRole("button", { name: /Cut a gem socket/ }));

    expect(socketCount(getState().hero!.inventory[0])).toBe(2);
    expect(getState().hero!.gold).toBe(5_000_000 - cost);
  });
});

describe("forge panel", () => {
  afterEach(() => setHero(null));

  it("shows the sockets but sends socket cutting to the Gem Workshop, and keeps the stone grades", () => {
    const h = hero();
    const piece = makeItem("warrior", 20, 2, "weapon");
    h.inventory = [piece];
    addStones(h, 2, 3);
    setHero(h);
    render(<Forge onClose={() => {}} />);

    fireEvent.click(screen.getAllByRole("button", { name: new RegExp(piece.name) })[0]!);
    expect(screen.getByText("Gem sockets")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cut a gem socket/ })).not.toBeInTheDocument();
    expect(screen.getByText(/cut and filled at the Gem Workshop/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enchantment Stone" }));
    expect(screen.getByText("Stone grade")).toBeInTheDocument();
    expect(screen.getByText("+20% success")).toBeInTheDocument();
    // The best stone held is preselected, showing how many are in the pouch.
    expect(screen.getByTitle("Lv 2 Enchantment Stone")).toBeInTheDocument();
    expect(screen.getByTitle("Lv 2 Enchantment Stone").textContent).toContain(
      fmt(stoneCount(h, 2)),
    );
  });
});

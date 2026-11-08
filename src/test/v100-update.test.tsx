import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuctionHousePanel, SHOP_DISCOUNT, buyShopGood, shopPrice } from "@/game/Marketplace";
import { buyCatalogueItem, catalogueHour, cataloguePrice, catalogueStock } from "@/game/catalogue";
import { MagicTower } from "@/game/Workshop";
import { HeroHall } from "@/game/panels";
import { makeItem, newHero } from "@/game/data";
import { potionHeld, potionPrice, takePotion } from "@/game/potions";
import { getState, setHero, update } from "@/game/store";
import { fmt } from "@/game/ui";

const hero = () => {
  const h = newHero("Buyer", "warrior");
  h.level = 20;
  h.gold = 2_000_000;
  return h;
};

describe("auction house catalogue", () => {
  it("rolls six modest pieces at a steep price and restocks on the hour", () => {
    const h = hero();
    const now = Date.UTC(2026, 10, 8, 12, 0, 0);
    const stock = catalogueStock(h, now);
    expect(stock).toHaveLength(6);
    // Deliberately weak: nothing above Uncommon and never at the hero's own level.
    for (const it of stock) {
      expect(it.rarity).toBeLessThanOrEqual(1);
      expect(it.ilvl).toBeLessThan(h.level);
    }
    // Expensive: a plain iLvl 11 common still costs thousands of gold.
    expect(cataloguePrice(stock[0], h.level)).toBeGreaterThan(10_000);
    // Same hour returns the same saved stock; the next hour rolls fresh.
    expect(catalogueStock(h, now + 60_000)).toBe(stock);
    expect(catalogueStock(h, now + 60 * 60 * 1000)).not.toBe(stock);
    expect(catalogueHour(now)).not.toBe(catalogueHour(now + 60 * 60 * 1000));
  });

  it("buys a piece into the bag and takes its gold", () => {
    const h = hero();
    const now = Date.UTC(2026, 10, 8, 12, 0, 0);
    const it = catalogueStock(h, now)[0];
    const price = cataloguePrice(it, h.level);
    expect(buyCatalogueItem(h, it.id, now)).toBeNull();
    expect(h.gold).toBe(2_000_000 - price);
    expect(h.inventory[0].id).toBe(it.id);
    expect(h.catalogue?.items).toHaveLength(5);
  });
});

describe("auction house shop", () => {
  it("sells stamina potions 73% under their old price, and elixirs of strength", () => {
    expect(potionPrice("stamina", 1)).toBe(21_000);
    // The house undercuts the old stalls by 73% (see SHOP_DISCOUNT).
    expect(shopPrice("stamina", 1)).toBe(Math.round(21_000 * (1 - SHOP_DISCOUNT)));
    const h = hero();
    const gold = h.gold;
    expect(buyShopGood(h, "stamina")).toBeNull();
    expect(potionHeld(h, "stamina")).toBe(1);
    expect(h.gold).toBe(gold - shopPrice("stamina", h.level));
    expect(buyShopGood(h, "strength")).toBeNull();
    expect(potionHeld(h, "strength")).toBe(1);
  });

  it("shows the three tabs and the shop prices", () => {
    setHero(hero());
    render(<AuctionHousePanel onClose={() => {}} />);
    for (const tab of ["Catalogue", "Shop", "Auction"]) expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    expect(screen.getByText("Stamina Potion")).toBeInTheDocument();
    expect(screen.getByText("Elixir of Strength")).toBeInTheDocument();
    expect(screen.getAllByText(fmt(shopPrice("stamina", 20))).length).toBeGreaterThan(0);
  });

  it("stocks the new battle elixirs and drinks them from the pouch", () => {
    const h = hero();
    setHero(h);
    render(<AuctionHousePanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));

    for (const name of ["Elixir of Warding", "Draught of Fortune", "Elixir of Sorcery"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    update((draft) => {
      expect(buyShopGood(draft, "fortune")).toBeNull();
      expect(takePotion(draft, "fortune")).toBeNull();
    });
    expect(potionHeld(getState().hero!, "fortune")).toBe(0);
    expect(getState().hero!.potionBuffs?.["fortune"]).toBeGreaterThan(Date.now());
  });
});

describe("magic tower vault", () => {
  afterEach(() => setHero(null));

  it("upgrades an astral for gold to an endless level", () => {
    const h = hero();
    h.gold = 100_000_000;
    const a = { id: "a1", base: "dread", rarity: 3, lvl: 1 };
    h.astrals = [a];
    setHero(h);
    render(<MagicTower onClose={() => {}} />);

    expect(screen.getByText("ASTRAL VAULT")).toBeInTheDocument();
    expect(screen.getAllByText(/Dread Core/).length).toBeGreaterThan(0);
    expect(screen.getByText("Lv 1")).toBeInTheDocument();

    const upgrade = screen.getAllByRole("button", { name: /Upgrade/i })[0]!;
    fireEvent.click(upgrade);
    expect(getState().hero?.astrals?.[0].lvl).toBe(2);
    expect(screen.getByText("Lv 2")).toBeInTheDocument();
  });

  it("lists the whole species vault with unique bonus text", () => {
    const h = hero();
    h.astrals = [{ id: "a1", base: "ember", rarity: 0, lvl: 1 }];
    setHero(h);
    render(<MagicTower onClose={() => {}} />);
    expect(screen.getByText(/Species codex/)).toBeInTheDocument();
    expect(screen.getAllByText(/Ember Wyrm/i).length).toBeGreaterThan(0);
  });
});

describe("quality of life", () => {
  afterEach(() => setHero(null));

  it("opens a bag item in a popup with equip and sell", () => {
    const h = hero();
    const blade = makeItem("warrior", 20, 2, "weapon");
    h.inventory = [blade];
    setHero(h);
    render(<HeroHall onClose={() => {}} />);

    fireEvent.click(screen.getAllByRole("button", { name: new RegExp(blade.name) })[0]!);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Equip" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Equip" }));
    expect(getState().hero?.equipment.weapon?.id).toBe(blade.id);
  });

});

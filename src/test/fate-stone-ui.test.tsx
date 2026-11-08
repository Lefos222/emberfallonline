import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuctionHousePanel, fateStoneShopPrice } from "@/game/Marketplace";
import { Forge } from "@/game/panels";
import { makeItem, newHero } from "@/game/data";
import { addFateStones, fateStoneCount } from "@/game/fate";
import { getState, setHero } from "@/game/store";

const hero = () => {
  const h = newHero("Fatehand", "warrior");
  h.level = 20;
  h.gold = 5_000_000;
  return h;
};

afterEach(() => {
  vi.restoreAllMocks();
  setHero(null);
});

describe("fate stones in the auction house shop", () => {
  it("sells a Fate Stone from the shop tab", () => {
    const h = hero();
    setHero(h);
    const price = fateStoneShopPrice(h.level);
    render(<AuctionHousePanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));

    expect(screen.getByText("Fate Stones · refinement")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Buy a Fate Stone" }));

    expect(fateStoneCount(getState().hero!)).toBe(1);
    expect(getState().hero!.gold).toBe(5_000_000 - price);
  });
});

describe("fate stone refinement at the forge", () => {
  it("refines gear with fate stones instead of gold", () => {
    const h = hero();
    const piece = makeItem("warrior", 20, 2, "weapon");
    piece.name = "Fate Test Blade";
    h.inventory = [piece];
    addFateStones(h, 3);
    setHero(h);
    render(<Forge onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /Fate Test Blade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Fate Stone" }));

    expect(screen.getByText("+25% fate")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refine \+1/ })).toBeInTheDocument();

    // Pinned only for the roll itself: the crafted ids above must stay unique.
    vi.spyOn(Math, "random").mockReturnValue(0);
    fireEvent.click(screen.getByRole("button", { name: /Refine \+1/ }));

    expect(getState().hero!.inventory[0].enh).toBe(1);
    expect(fateStoneCount(getState().hero!)).toBe(2);
    expect(getState().hero!.gold).toBe(5_000_000);
    expect(screen.getByText(/Refined! \+1/)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuctionHousePanel } from "@/game/Marketplace";
import { ConquestTokens } from "@/game/ConquestGate";
import { GemWorkshop } from "@/game/Workshop";
import { conquestKeyActive, conquestKeys } from "@/game/conquest";
import { makeItem, newHero } from "@/game/data";
import { gemRemoveCost, insertGem } from "@/game/crafting";
import { getState, setHero } from "@/game/store";
import { fmt } from "@/game/ui";
import { vulcanCardPrice, vulcanCards } from "@/game/vulcan";

/**
 * The Vulcan Card and the Conquest Key choice, rendered the way a player meets them: the card in
 * the Auction House shop, the key's decision inside the Conquest Gate, and the smith's fee on the
 * Gem Workshop's socket row.
 */

afterEach(() => setHero(null));

const richHero = () => {
  const h = newHero("Shopper", "warrior");
  h.level = 1;
  h.gold = 5_000_000;
  return h;
};

describe("the Vulcan Card in the shop", () => {
  it("sells at 80,000 gold at level 1 and lands in the pack", () => {
    const h = richHero();
    setHero(h);
    render(<AuctionHousePanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));

    expect(screen.getByText("Vulcan Card")).toBeInTheDocument();
    const buy = screen.getByRole("button", { name: "Buy a Vulcan Card" });
    expect(buy.textContent).toContain("80.0K");
    fireEvent.click(buy);

    const after = getState().hero!;
    expect(vulcanCards(after)).toBe(1);
    expect(after.gold).toBe(5_000_000 - vulcanCardPrice(1));
  });
});

describe("the Conquest Key choice inside the gate", () => {
  it("keeps a bought key in the pack until the gate lights it", () => {
    const h = richHero();
    h.spire = 12;
    h.conquest = { tokens: 0, keys: 1 };
    setHero(h);
    render(<ConquestTokens hero={h} />);

    expect(screen.getByText("Conquest Key · your choice")).toBeInTheDocument();
    // Two keys in the pack: ownership is shown, and nothing is lit until the player asks.
    expect(conquestKeyActive(getState().hero!)).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /Use a key · ×2 today/i }));

    const after = getState().hero!;
    expect(conquestKeyActive(after)).toBe(true);
    expect(conquestKeys(after)).toBe(0);
  });
});

describe("the smith's fee for prising a gem out", () => {
  it("shows the gold price on the socket row and charges it in the workshop", () => {
    const h = richHero();
    const piece = makeItem("warrior", 10, 3, "armour");
    piece.holes = 2;
    h.equipment.armour = piece;
    h.gems = { "ruby:3": 1 };
    expect(insertGem(h, piece.id, 0, "ruby:3")).toBeNull();
    setHero(h);
    render(<GemWorkshop onClose={() => {}} />);

    // The gear list is a row of buttons: pick the piece out of it like a player would.
    fireEvent.click(screen.getByRole("button", { name: new RegExp(piece.name, "i") }));

    const fee = gemRemoveCost("ruby:3", h.level);
    const remove = screen.getByRole("button", { name: /^Remove/i });
    expect(remove.textContent).toContain(fmt(fee));
    fireEvent.click(remove);

    const after = getState().hero!;
    expect(after.gold).toBe(5_000_000 - fee);
    expect(after.gems?.["ruby:3"]).toBe(1);
    expect(after.equipment.armour?.gems?.[0]).toBeFalsy();
  });
});

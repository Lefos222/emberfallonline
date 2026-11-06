import { afterEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PremiumShop } from "@/game/PremiumShop";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

afterEach(() => act(() => setHero(null)));

const lockedButtons = () => {
  const buttons = screen.getAllByRole("button", { name: "Coming soon" });
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) expect(button).toBeDisabled();
};

describe("premium shop catalogue", () => {
  it("shows the five diamond packs and every goods tab", () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    expect(screen.getByText("Diamond Pouch")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    lockedButtons();

    fireEvent.click(screen.getByRole("tab", { name: "Gold" }));
    expect(screen.getByText("Gold Pouch")).toBeInTheDocument();
    lockedButtons();

    fireEvent.click(screen.getByRole("tab", { name: "Stones" }));
    expect(screen.getByText("Ruby")).toBeInTheDocument();
    expect(screen.getAllByText("5◆").length).toBeGreaterThan(0);
    lockedButtons();

    fireEvent.click(screen.getByRole("tab", { name: "Materials" }));
    expect(screen.getByText("Ember Ore")).toBeInTheDocument();
    lockedButtons();

    fireEvent.click(screen.getByRole("tab", { name: "Chests" }));
    expect(screen.getByText("Gold Chest")).toBeInTheDocument();
    lockedButtons();

    fireEvent.click(screen.getByRole("tab", { name: "VIP" }));
    expect(screen.getByText(/VIP 1 — Supporter/)).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    lockedButtons();
  });
});

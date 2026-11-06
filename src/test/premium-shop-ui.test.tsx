import { afterEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PremiumShop } from "@/game/PremiumShop";
import { newHero, type Hero } from "@/game/data";
import { setHero } from "@/game/store";

afterEach(() => act(() => setHero(null)));

const expectComingSoonOnly = () => {
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
    expectComingSoonOnly();

    fireEvent.click(screen.getByRole("tab", { name: "Gold" }));
    expect(screen.getByText("Gold Pouch")).toBeInTheDocument();
    expectComingSoonOnly();

    fireEvent.click(screen.getByRole("tab", { name: "Stones" }));
    expect(screen.getByText("Ruby")).toBeInTheDocument();
    expect(screen.getAllByText(/Chipped 5◆/).length).toBeGreaterThan(0);
    expectComingSoonOnly();

    fireEvent.click(screen.getByRole("tab", { name: "Materials" }));
    expect(screen.getByText("Ember Ore")).toBeInTheDocument();
    expectComingSoonOnly();

    fireEvent.click(screen.getByRole("tab", { name: "Chests" }));
    expect(screen.getByText("Gold Chest")).toBeInTheDocument();
    expectComingSoonOnly();

    fireEvent.click(screen.getByRole("tab", { name: "VIP" }));
    expect(screen.getByText(/VIP 1 — Supporter/)).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expectComingSoonOnly();
  });

  it("has no test-purchase path and shows no diamond balance from a test wallet", () => {
    const hero = newHero("Shopper", "warrior") as Hero & { premiumTest?: { balance: number } };
    hero.premiumTest = { balance: 1200 };
    setHero(hero);
    render(<PremiumShop onClose={() => {}} />);

    expect(screen.queryByText(/Test purchase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Test mode/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Coming soon — Diamonds/)).toBeInTheDocument();
    expect(screen.getByText(/0 Diamonds/)).toBeInTheDocument();
    expectComingSoonOnly();
  });
});

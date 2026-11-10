import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PremiumShop } from "@/game/PremiumShop";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

vi.mock("@/game/premium-shop", () => ({
  buyDiamondPack: vi.fn(async () => null),
  buyVipWithCard: vi.fn(async () => null),
  buyVip: vi.fn(async () => null),
  buyGoldPack: vi.fn(async () => null),
  buyMaterial: vi.fn(async () => null),
  buyGem: vi.fn(async () => null),
  buyChest: vi.fn(async () => null),
  buyDiamondItem: vi.fn(async () => null),
}));

afterEach(() => act(() => setHero(null)));

describe("premium shop catalogue", () => {
  it("shows the five repriced Diamond packs and every goods tab", () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    expect(screen.getByText("Diamond Pouch")).toBeInTheDocument();
    expect(screen.getByText("$10.99")).toBeInTheDocument();
    expect(screen.getByText("$109.99")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Buy with card" }).length).toBe(5);
    expect(screen.queryByRole("button", { name: "Coming soon" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Gold" }));
    expect(screen.getByText("Gold Pouch")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Stones" }));
    expect(screen.getByText("Ruby")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Materials" }));
    expect(screen.getByText("Ember Ore")).toBeInTheDocument();
    expect(screen.getAllByText(/5×/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Chests" }));
    expect(screen.getByText("Gold Chest")).toBeInTheDocument();
  });

  it("sells one-month VIP tiers with card and Diamond prices", () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    fireEvent.click(screen.getByRole("tab", { name: "VIP" }));
    expect(screen.getByText(/VIP 1 — Supporter/)).toBeInTheDocument();
    expect(screen.getAllByText("30 days")).toHaveLength(3);
    expect(screen.getByText(/VIP lasts one month/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pay with card · \$6\.99/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Buy with Diamonds" })).toHaveLength(3);
    // The two VIP-only activities ship with the membership.
    expect(screen.getByText(/VIP-only activities/)).toBeInTheDocument();
    expect(screen.getByText("Champion's Hunt")).toBeInTheDocument();
    expect(screen.getByText("Master Forge")).toBeInTheDocument();
  });
});

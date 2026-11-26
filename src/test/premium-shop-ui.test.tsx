import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PremiumShop } from "@/game/PremiumShop";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

// The shop asks the server whether card checkout is open; these tests cover the open shop.
vi.mock("@/game/payments.functions", () => ({
  paymentStatus: vi.fn(async () => ({ configured: true, cardPayments: true })),
}));

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
  it("shows the five repriced Diamond packs and every goods tab", async () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    expect(screen.getByText("Diamond Pouch")).toBeInTheDocument();
    expect(screen.getByText("$12.09")).toBeInTheDocument();
    expect(screen.getByText("$120.99")).toBeInTheDocument();
    expect((await screen.findAllByRole("button", { name: "Buy with card" })).length).toBe(5);
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

  it("sells one-month VIP tiers with card and Diamond prices", async () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    fireEvent.click(screen.getByRole("tab", { name: "VIP" }));
    expect(screen.getByText(/VIP 1 — Supporter/)).toBeInTheDocument();
    expect(screen.getAllByText("30 days")).toHaveLength(3);
    expect(screen.getByText(/VIP lasts one month/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Pay with card · \$7\.69/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Buy with Diamonds" })).toHaveLength(3);
    // The two VIP-only activities ship with the membership.
    expect(screen.getByText(/VIP-only activities/)).toBeInTheDocument();
    expect(screen.getByText("Champion's Hunt")).toBeInTheDocument();
    expect(screen.getByText("Master Forge")).toBeInTheDocument();
  });
});

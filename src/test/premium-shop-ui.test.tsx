import { afterEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PremiumShop } from "@/game/PremiumShop";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

afterEach(() => act(() => setHero(null)));

describe("premium shop catalogue", () => {
  it("shows the five diamond packs and every goods tab", () => {
    setHero(newHero("Shopper", "warrior"));
    render(<PremiumShop onClose={() => {}} />);

    expect(screen.getByText("Diamond Pouch")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Gold" }));
    expect(screen.getByText("Gold Pouch")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Stones" }));
    expect(screen.getByText("Ruby")).toBeInTheDocument();
    expect(screen.getAllByText("5◆").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Materials" }));
    expect(screen.getByText("Ember Ore")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Chests" }));
    expect(screen.getByText("Gold Chest")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "VIP" }));
    expect(screen.getByText(/VIP 1 — Supporter/)).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
  });
});

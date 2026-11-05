import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Vault } from "@/game/Vault";
import { DailyRewardsBoard } from "@/game/DailyRewardsBoard";
import { newHero } from "@/game/data";
import { addChests, chestCount, goldChestValue } from "@/game/chests";
import { getState, setHero } from "@/game/store";

afterEach(() => setHero(null));

describe("vault inventory slots", () => {
  it("shows chests and gem stacks as items and redeems a gold chest", () => {
    const hero = newHero("Vaultkeeper", "warrior");
    addChests(hero, "gold", 1);
    hero.gems = { "ruby:1": 2 };
    setHero(hero);
    render(<Vault />);

    expect(screen.getByRole("button", { name: /Gold Chest, 1 in vault/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gem Chest, 0 in vault/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chipped Ruby, 2 in vault/ })).toBeInTheDocument();

    const goldBefore = getState().hero?.gold ?? 0;
    fireEvent.click(screen.getByRole("button", { name: /Gold Chest, 1 in vault/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Open \(1\)/ }));

    expect(getState().hero?.gold).toBe(goldBefore + goldChestValue(hero.level));
    expect(chestCount(getState().hero!, "gold")).toBe(0);
    expect(screen.getByText(/Opened Gold Chest:/)).toBeInTheDocument();
  });
});

describe("reward chest on the activity board", () => {
  it("collects a free chest into the vault", () => {
    setHero(newHero("Collector", "archer"));
    render(<DailyRewardsBoard />);

    fireEvent.click(screen.getByRole("button", { name: /Collect Gold Chest/i }));

    expect(chestCount(getState().hero!, "gold")).toBe(1);
    expect(screen.getByRole("status")).toHaveTextContent(/Gold Chest added to your vault/);
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Vault, vaultTiles, type VaultPick } from "@/game/Vault";
import { useGame } from "@/game/store";
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
    function Bag() {
      const { hero: h } = useGame();
      const [pick, setPick] = useState<VaultPick | null>(null);
      return <>{h && vaultTiles(h, pick, setPick)}<Vault pick={pick} setPick={setPick} /></>;
    }
    render(<Bag />);

    expect(screen.getByRole("button", { name: /Gold Chest, 1/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gem Chest/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Chipped Ruby, 2/ })).toBeInTheDocument();

    const goldBefore = getState().hero?.gold ?? 0;
    fireEvent.click(screen.getByRole("button", { name: /Gold Chest, 1/ }));
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

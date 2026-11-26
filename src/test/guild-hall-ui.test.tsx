import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";
import { GuildHallScene } from "@/game/GuildHallScene";
import { GuildReliquary } from "@/game/GuildTower";

describe("the guild courtyard", () => {
  it("folds the painted courtyard away until the map is asked for", () => {
    render(<GuildHallScene name="Ember Wardens" level={3} members={12} power={48210} role="leader"
      relics={{ woken: 2, total: 7 }} location="headquarters" onSelect={vi.fn()} />);
    expect(screen.queryByRole("tab", { name: "Guild Merchant" })).toBeNull();
    expect(screen.getByRole("button", { name: "Map" })).toBeInTheDocument();
  });

  it("offers every painted building of the hall", () => {
    const onSelect = vi.fn();
    render(<GuildHallScene name="Ember Wardens" level={3} members={12} power={48210} role="leader"
      relics={{ woken: 2, total: 7 }} location="headquarters" onSelect={onSelect} court />);
    for (const building of ["Guild Headquarters", "Guild Merchant", "Reliquary Tower", "Guild Wars"]) {
      expect(screen.getAllByRole("tab", { name: building }).length).toBeGreaterThan(0);
    }
    fireEvent.click(screen.getAllByRole("tab", { name: "Guild Wars" })[0]);
    expect(onSelect).toHaveBeenCalledWith("wars");
  });
});

describe("the guild reliquary", () => {
  afterEach(() => setHero(null));

  it("shows the next heirloom and the rank it needs", () => {
    const hero = newHero("Tester", "warrior");
    hero.guildLedger = { donated: 15_000, spent: 0 };
    setHero(hero);
    render(<GuildReliquary />);
    expect(screen.getByText(/0\/7 relics woken/)).toBeInTheDocument();
    expect(screen.getByText("Ember Banner")).toBeInTheDocument();
    expect(screen.getByText(/3 guild ranks/)).toBeInTheDocument();
  });
});

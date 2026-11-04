import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GemCraftWindow } from "@/game/GemWindows";
import { ConquestTokens } from "@/game/ConquestGate";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";

describe("gem forge", () => {
  afterEach(() => setHero(null));

  it("shows the eight chart families and their twelve levels", () => {
    const hero = newHero("Gem Tester", "warrior");
    setHero(hero);
    render(<GemCraftWindow hero={hero} onClose={() => {}} />);

    for (const name of ["Ruby", "Emerald", "Sapphire", "Topaz", "Amethyst", "Tourmaline", "Aquamarine", "Lapis"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("+780")).toBeInTheDocument(); // ruby at level 12
    fireEvent.click(screen.getByText("Tourmaline"));
    expect(screen.getByText("+3900")).toBeInTheDocument(); // tourmaline (health) at level 12
  });

  it("forges the selected family and level from materials", () => {
    const hero = newHero("Gem Tester", "warrior");
    hero.gold = 200;
    hero.mats = { ore: 10 };
    setHero(hero);
    render(<GemCraftWindow hero={hero} onClose={() => {}} />);

    fireEvent.click(screen.getByText("Lv 3"));
    expect(screen.getByText(/\+84 Physical Attack/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Lv 1"));
    fireEvent.click(screen.getByRole("button", { name: /Forge Ruby/ }));

    expect(getState().hero?.gems?.["ruby:1"]).toBe(1);
    expect(getState().hero?.mats?.ore).toBe(0);
  });

  it("buys gems from the Conquest store for gold", () => {
    const hero = newHero("Gem Tester", "archer");
    hero.spire = 6;
    hero.gold = 5000;
    setHero(hero);
    render(<ConquestTokens hero={hero} />);

    fireEvent.click(screen.getByRole("button", { name: /Buy · 1,800 gold/ }));

    expect(getState().hero?.gems?.["ruby:1"]).toBe(1);
    expect(getState().hero?.gold).toBe(3200);
  });
});

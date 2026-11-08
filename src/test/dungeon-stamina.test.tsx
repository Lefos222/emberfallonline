import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StaminaBar } from "@/game/HeroHud";
import { Challenges } from "@/game/Challenges";
import { Expeditions } from "@/game/Expeditions";
import { RelicTrials } from "@/game/RelicTrials";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";
import { DUNGEON_STAMINA, STAMINA_PER_DAY, addPotions, spendStamina, staminaLeft } from "@/game/stamina";
import { takePotion } from "@/game/potions";

describe("stamina and the potion pouch in the game", () => {
  afterEach(() => setHero(null));

  it("shows the 200 bar and opens the pouch from the HUD", () => {
    const hero = newHero("Drinker", "warrior");
    setHero(hero);
    const { container } = render(<StaminaBar hero={hero} />);
    expect(container.textContent).toContain(`${STAMINA_PER_DAY}/${STAMINA_PER_DAY}`);

    fireEvent.click(screen.getByRole("button", { name: /Potion pouch/i }));
    expect(screen.getByText("Potion pouch")).toBeInTheDocument();
    expect(screen.getAllByText(/Stamina Potion/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Elixir of Strength/)).toBeInTheDocument();
  });

  it("a potion tops the bar up and is counted against the daily pouch", () => {
    const hero = newHero("Drinker", "warrior");
    for (let i = 0; i < 6; i++) spendStamina(hero, DUNGEON_STAMINA);
    addPotions(hero, 1);
    expect(staminaLeft(hero)).toBe(STAMINA_PER_DAY - 6 * DUNGEON_STAMINA);
    expect(takePotion(hero, "stamina")).toBeNull();
    expect(staminaLeft(hero)).toBe(STAMINA_PER_DAY - 6 * DUNGEON_STAMINA + 50);
    expect(hero.staminaPotions).toBe(0);
  });

  it("the strength elixir starts a timed battle buff", () => {
    const hero = newHero("Drinker", "warrior");
    hero.potions = { strength: 1 };
    expect(takePotion(hero, "strength")).toBeNull();
    expect(hero.potions?.["strength"]).toBe(0);
    expect(hero.potionBuffs?.["strength"]).toBeGreaterThan(Date.now());
    // Drinking one you do not own is refused.
    expect(takePotion(hero, "strength")).toMatch(/No Elixir of Strength/);
  });

  it("marks every Dungeon Gate run as a 10-stamina run, win or lose", () => {
    const hero = newHero("Delver", "warrior");
    hero.level = 60;
    setHero(hero);
    const start = vi.fn();

    render(<Expeditions onClose={() => {}} start={start} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Enter expedition/i })[0]!);
    render(<Challenges onClose={() => {}} start={start} />);
    fireEvent.click(screen.getByRole("button", { name: /Hunt/ }));
    render(<RelicTrials onClose={() => {}} start={start} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Begin Rank/i })[0]!);

    expect(start).toHaveBeenCalledTimes(3);
    for (const [entry] of start.mock.calls) expect(entry.dungeon).toBe(true);
  });
});

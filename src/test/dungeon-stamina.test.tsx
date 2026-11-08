import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StaminaBar } from "@/game/HeroHud";
import { Challenges } from "@/game/Challenges";
import { Expeditions } from "@/game/Expeditions";
import { RelicTrials } from "@/game/RelicTrials";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import {
  POTION_STAMINA,
  STAMINA_PER_DAY,
  addPotions,
  spendStamina,
  staminaLeft,
} from "@/game/stamina";

describe("dungeon stamina in the game", () => {
  afterEach(() => setHero(null));

  it("shows the 200 dungeon bar and the potion pouch in the HUD", () => {
    const hero = newHero("Drinker", "warrior");
    setHero(hero);
    const { container, rerender } = render(<StaminaBar hero={hero} />);
    expect(container.textContent).toContain(`${STAMINA_PER_DAY}/${STAMINA_PER_DAY}`);
    expect(screen.getByRole("button", { name: /Stamina Potion/ })).toBeDisabled();

    // Six runs leave 140; a potion tops the bar back up.
    for (let i = 0; i < 6; i++) spendStamina(hero);
    addPotions(hero, 1);
    setHero(hero);
    rerender(<StaminaBar hero={hero} />);
    expect(container.textContent).toContain(`140/${STAMINA_PER_DAY}`);

    fireEvent.click(screen.getByRole("button", { name: /Stamina Potion/ }));
    expect(getState().hero?.staminaPotions).toBe(0);
    expect(staminaLeft(getState().hero!)).toBe(140 + POTION_STAMINA);
  });

  it("marks every Dungeon Gate run as a stamina run, win or lose", () => {
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

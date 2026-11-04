import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QuestsButton, QuestsPanel } from "@/game/Quests";
import { ProfilePanel } from "@/game/CharacterSelect";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import { resetLevelQuests } from "@/game/level-quests";
import { recordBattle } from "@/game/progress";

describe("quests screen", () => {
  afterEach(() => setHero(null));

  it("lists the current level's three quests with their rewards", () => {
    const hero = newHero("Quester", "warrior");
    hero.level = 4;
    resetLevelQuests(hero);
    setHero(hero);
    render(<QuestsPanel onClose={() => {}} />);

    expect(screen.getByText("Level 4 Quests")).toBeInTheDocument();
    for (const name of ["Tyrant Hunter", "Master of the Forge", "Arena Glory"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("claims a finished quest and pays it", () => {
    const hero = newHero("Quester", "warrior");
    hero.level = 2; // level 2 owns the win-battles quest
    resetLevelQuests(hero);
    for (let i = 0; i < 4; i++) recordBattle(hero, { title: "skirmish", won: true, rewards: [] });
    setHero(hero);
    render(<QuestsPanel onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /Claim reward/ }));
    expect(getState().hero!.gold).toBeGreaterThan(100);
    expect(screen.getAllByText("Claimed").length).toBe(1);
  });

  it("badges the right-edge button with the claimable count", () => {
    render(<QuestsButton count={2} onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Quests" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("profile portraits", () => {
  afterEach(() => setHero(null));

  it("opens every portrait full screen and wears the one picked", () => {
    const hero = newHero("Gallerist", "mage");
    setHero(hero);
    render(<ProfilePanel onClose={() => {}} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Full screen/ })[0]);
    const gallery = screen.getByRole("dialog", { name: "Profile portraits" });
    expect(within(gallery).getAllByRole("button", { name: /^Portrait \d+$/ }).length).toBe(20);

    fireEvent.click(within(gallery).getByRole("button", { name: "Portrait 7" }));
    expect(getState().hero?.avatar).toBe(6);
  });
});

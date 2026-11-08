import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QuestsButton, QuestsPanel } from "@/game/Quests";
import { ProfilePanel } from "@/game/ProfilePanel";
import { AvatarIcon } from "@/game/AvatarIcon";
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

  it("shows every portrait inline and wears the one picked", () => {
    const hero = newHero("Gallerist", "mage");
    setHero(hero);
    render(<ProfilePanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Appearance" }));

    expect(screen.getAllByRole("button", { name: /^Portrait \d+$/ }).length).toBe(20);

    fireEvent.click(screen.getByRole("button", { name: "Portrait 7" }));
    expect(getState().hero?.avatar).toBe(6);
  });

  it("crops a portrait to its own square inside the gallery sheet", () => {
    const { container } = render(<AvatarIcon index={0} size={100} />);
    const style = (container.firstChild as HTMLElement).style;
    // The sheet's tiles are 43x43 at (11,5) with 58x55 pitch, not equal fifths.
    expect(style.backgroundSize).toBe("686.0465% 516.2791%");
    expect(style.backgroundPosition).toBe("4.3651% 2.7933%");
  });
});

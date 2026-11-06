import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BUILDING_DETAILS, BuildingCard } from "@/game/building-cards";
import { LevelProgress } from "@/game/LevelCurve";
import { GRIND_FIGHTS, fightsToLevel, fightsToNextLevel, newHero, xpToNext } from "@/game/data";
import { CASTLE_BUILDINGS } from "@/game/data";

describe("castle building cards", () => {
  it("has a card for every building on the castle map", () => {
    for (const b of CASTLE_BUILDINGS) {
      const d = BUILDING_DETAILS[b.id];
      expect(d, b.id).toBeTruthy();
      expect(d.inside.length).toBeGreaterThan(1);
      expect(d.tagline.length).toBeGreaterThan(0);
      expect(d.progress(newHero("Tester", "warrior")).length).toBeGreaterThan(0);
    }
  });

  it("opens with the building's purpose, contents and the hero's own progress", () => {
    const hero = newHero("Tester", "warrior");
    hero.level = 30;
    render(<BuildingCard id="portal" hero={hero} onEnter={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Campaign Gate")).toBeInTheDocument();
    expect(screen.getByText("The campaign road")).toBeInTheDocument();
    expect(screen.getByText("Stamina is spent only on a lost fight")).toBeInTheDocument();
    expect(screen.getByText(/fights to level 31/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter" })).toBeInTheDocument();
  });

  it("names the level a locked door needs", () => {
    const hero = newHero("Tester", "mage");
    hero.level = 3;
    render(<BuildingCard id="spire" hero={hero} onEnter={() => {}} onClose={() => {}} />);
    expect(screen.getByText(/This door opens at character level 10/)).toBeInTheDocument();
    expect(screen.getByText(/Locked · reach level 10/)).toBeInTheDocument();
  });
});

describe("the level bill on screen", () => {
  it("spells out fights left and the next levels' cost", () => {
    const hero = newHero("Tester", "archer");
    hero.level = 30;
    hero.xp = 0;
    render(<LevelProgress hero={hero} rows={3} />);
    const left = fightsToNextLevel(hero);
    expect(left).toBe(fightsToLevel(30));
    expect(screen.getByText(left)).toBeInTheDocument();
    expect(screen.getByText(/more fights to level 31/)).toBeInTheDocument();
    expect(screen.getByText(/this level costs 12 fights/)).toBeInTheDocument();
    expect(screen.getByText("Level 32")).toBeInTheDocument();
    expect(screen.getByText(`${fightsToLevel(31)} fights`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`asks for ${GRIND_FIGHTS} fights more`))).toBeInTheDocument();
  });

  it("keeps the early levels at two fights each", () => {
    for (let lv = 1; lv < 30; lv++) expect(fightsToLevel(lv)).toBe(2);
    expect(xpToNext({ level: 30, paragon: 0 })).toBeGreaterThan(xpToNext({ level: 29, paragon: 0 }) * 6);
  });
});

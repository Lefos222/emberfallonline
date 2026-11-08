import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BarracksTraining } from "@/game/Barracks";
import { heroStats, newHero } from "@/game/data";
import { Temple } from "@/game/panels";
import { attrTrainCost, drillAttrs } from "@/game/drills";
import { getState, setHero } from "@/game/store";

describe("the reworked barracks", () => {
  afterEach(() => setHero(null));

  it("shows exactly the four attribute cards", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    setHero(hero);
    render(<BarracksTraining hero={hero} />);

    for (const name of ["STRENGTH", "INTELLIGENCE", "AGILITY", "VITALITY"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // Exactly four upgrade buttons — no drills, no crystal wing, no batch training.
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getAllByText(/^Next: \+1 /)).toHaveLength(4);
  });

  it("raises an attribute a level for gold, without a cap", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 10_000_000;
    setHero(hero);
    const firstCost = attrTrainCost(hero, "str");
    const before = heroStats(hero).patk;

    render(<BarracksTraining hero={hero} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);

    const after = getState().hero!;
    expect(drillAttrs(after).str).toBe(1);
    expect(after.gold).toBe(10_000_000 - firstCost);
    // The next level costs more than the first.
    expect(attrTrainCost(after, "str")).toBeGreaterThan(firstCost);
    expect(heroStats(after).patk).toBeGreaterThan(before);
  });

  it("keeps the building to the four attributes in the castle panel", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    setHero(hero);
    render(<Temple onClose={() => {}} />);

    expect(screen.getAllByText("Barracks").length).toBeGreaterThan(0);
    expect(screen.queryByText("Attribute drills")).not.toBeInTheDocument();
    expect(screen.queryByText("Barracks drills")).not.toBeInTheDocument();
    expect(screen.queryByText("Advanced training")).not.toBeInTheDocument();
    expect(screen.queryByText(/Soul Forge/)).not.toBeInTheDocument();
  });
});

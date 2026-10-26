import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DrillTracks } from "@/game/Barracks";
import { newHero } from "@/game/data";
import { DRILLS } from "@/game/drills";
import { setHero } from "@/game/store";

describe("barracks drill yard", () => {
  afterEach(() => setHero(null));

  it("renders the health drills and the hero can train them", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 50_000;
    hero.buildings = { barracks: 12 };
    setHero(hero);
    render(<DrillTracks hero={hero} />);

    expect(screen.getByText("Vital Reserves")).toBeInTheDocument();
    expect(screen.getByText("Body Tempering")).toBeInTheDocument();
    expect(screen.getByText("Battlefield Recovery")).toBeInTheDocument();
    // Every drill is listed with its rank and a price, health tracks included.
    for (const d of DRILLS) expect(screen.getByText(d.name)).toBeInTheDocument();
    expect(screen.getAllByText(/Rank 0\//)).toHaveLength(DRILLS.length);
    expect(screen.getAllByText(/^Train rank 1$/).length).toBeGreaterThanOrEqual(2);
  });
});

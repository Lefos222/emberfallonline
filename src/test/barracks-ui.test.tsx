import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AttributeDrills, DrillTracks } from "@/game/Barracks";
import { newHero } from "@/game/data";
import { Temple } from "@/game/panels";
import { ATTRIBUTE_DRILLS, DRILLS } from "@/game/drills";
import { setHero } from "@/game/store";

describe("barracks attribute drills", () => {
  afterEach(() => setHero(null));

  it("lists the four attribute upgrade tracks", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    hero.buildings = { barracks: 20 };
    setHero(hero);
    render(<AttributeDrills hero={hero} />);

    for (const d of ATTRIBUTE_DRILLS) expect(screen.getByText(d.name)).toBeInTheDocument();
    expect(screen.getAllByText(/Rank 0\//)).toHaveLength(ATTRIBUTE_DRILLS.length);
    expect(screen.getAllByText(/^Train rank 1$/)).toHaveLength(ATTRIBUTE_DRILLS.length);
  });
});

describe("the barracks panel", () => {
  afterEach(() => setHero(null));

  it("keeps the training in tabs so the panel fits on one screen", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    hero.buildings = { barracks: 20 };
    setHero(hero);
    render(<Temple onClose={() => {}} />);

    expect(screen.getByText("Barracks")).toBeInTheDocument();
    // Attributes open first: the four training cards, their batch buttons and the attribute drills.
    expect(screen.getByText("Attribute training")).toBeInTheDocument();
    expect(screen.getByText("Attribute drills")).toBeInTheDocument();
    for (const d of ATTRIBUTE_DRILLS) expect(screen.getAllByText(d.name).length).toBeGreaterThanOrEqual(1);
    // The drill yard no longer sits below everything else.
    expect(screen.queryByText("Barracks drills")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Drills" }));
    expect(screen.getByText("Barracks drills")).toBeInTheDocument();
    expect(screen.queryByText("Attribute drills")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Advanced" }));
    expect(screen.getByText("Advanced training")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Enlightenment" }));
    expect(screen.queryByText("Barracks drills")).toBeNull();
  });
});

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

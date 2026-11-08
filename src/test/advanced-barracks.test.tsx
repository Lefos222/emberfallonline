import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AdvancedTraining } from "@/game/Barracks";
import { ENHANCE_MAX, enhanceCost, makeItem, newHero } from "@/game/data";
import { ADVANCED_DRILLS, advancedCost } from "@/game/drills";
import { Forge, Temple } from "@/game/panels";
import { fmt } from "@/game/ui";
import { getState, setHero } from "@/game/store";

describe("advanced barracks training", () => {
  afterEach(() => setHero(null));

  it("lists the four advanced attributes with their crystal price", () => {
    const hero = newHero("Voidbound", "warrior");
    hero.buildings = { barracks: 30 };
    hero.voidCrystals = 40;
    setHero(hero);
    render(<AdvancedTraining hero={hero} />);

    expect(screen.getByText("Advanced training")).toBeInTheDocument();
    for (const d of ADVANCED_DRILLS) expect(screen.getByText(`Advanced ${d.name}`)).toBeInTheDocument();
    expect(screen.getAllByText("Train rank 1")).toHaveLength(ADVANCED_DRILLS.length);
    expect(screen.getAllByText(/Rank 0$/)).toHaveLength(ADVANCED_DRILLS.length);
  });

  it("locks the wing until the barracks is deep enough", () => {
    const hero = newHero("Recruit", "warrior");
    hero.buildings = { barracks: 5 };
    hero.voidCrystals = 40;
    setHero(hero);
    render(<AdvancedTraining hero={hero} />);

    expect(screen.getByText("Barracks level 15")).toBeInTheDocument();
    expect(screen.queryAllByText("Train rank 1")).toHaveLength(0);
  });

  it("spends void crystals when a rank is trained", () => {
    const hero = newHero("Voiddrill", "warrior");
    hero.buildings = { barracks: 30 };
    hero.voidCrystals = 50;
    setHero(hero);
    render(<AdvancedTraining hero={hero} />);
    const cost = advancedCost(ADVANCED_DRILLS[0], 0, 30);

    fireEvent.click(screen.getAllByText("Train rank 1")[0]!);

    expect(getState().hero?.voidCrystals).toBe(50 - cost);
    expect(getState().hero?.advancedDrills?.["str"]).toBe(1);
  });

  it("shows the forge's +30 ceiling on a maxed piece", () => {
    const hero = newHero("Smith", "warrior");
    hero.gold = 10_000_000;
    const blade = makeItem("warrior", 40, 2, "weapon");
    blade.enh = ENHANCE_MAX;
    hero.equipment = { weapon: blade };
    setHero(hero);
    const { container } = render(<Forge onClose={() => {}} />);

    fireEvent.click(container.querySelector("button.slot")!);

    expect(screen.getByText(`Fully enhanced · +${ENHANCE_MAX}`)).toBeInTheDocument();
    expect(screen.getByText(`+${ENHANCE_MAX}`, { selector: "b" })).toBeInTheDocument();
  });

  it("prices the next step of an unmaxed piece", () => {
    const hero = newHero("Smith", "warrior");
    hero.gold = 10_000_000;
    const blade = makeItem("warrior", 40, 2, "weapon");
    blade.enh = 12;
    hero.equipment = { weapon: blade };
    setHero(hero);
    const { container } = render(<Forge onClose={() => {}} />);

    fireEvent.click(container.querySelector("button.slot")!);

    expect(screen.getByText("Enhance +13")).toBeInTheDocument();
    expect(screen.getByText(fmt(enhanceCost(blade, hero.level)))).toBeInTheDocument();
  });

  it("sits inside the barracks panel beside the gold tracks", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    hero.buildings = { barracks: 30 };
    hero.voidCrystals = 30;
    setHero(hero);
    render(<Temple onClose={() => {}} />);

    fireEvent.click(screen.getByRole("tab", { name: "Mastery" }));
    expect(screen.getByText("Advanced training")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Drills" }));
    expect(screen.getByText("Barracks drills")).toBeInTheDocument();
  });
});

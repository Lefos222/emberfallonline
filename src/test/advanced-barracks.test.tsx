import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ENHANCE_MAX, enhanceCost, makeItem, newHero } from "@/game/data";
import { Forge, Temple } from "@/game/panels";
import { fmt } from "@/game/ui";
import { setHero } from "@/game/store";

describe("forge at the barracks update", () => {
  afterEach(() => setHero(null));

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

  it("leaves the barracks with only its four attribute cards", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 900_000;
    hero.voidCrystals = 30;
    setHero(hero);
    render(<Temple onClose={() => {}} />);

    expect(screen.getByText("VITALITY")).toBeInTheDocument();
    expect(screen.queryByText("Advanced training")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { RENOWN_TRACKS } from "@/game/renown";
import { RenownTraining } from "@/game/RenownPanel";
import { setHero } from "@/game/store";
import { ThroneHall } from "@/game/ThroneHall";

describe("the hero training panel", () => {
  afterEach(() => setHero(null));

  it("lists every renown upgrade with its rank and price", () => {
    const hero = newHero("Tester", "warrior");
    hero.renown = 10;
    setHero(hero);
    render(<RenownTraining hero={hero} />);

    expect(screen.getByText("Hero training")).toBeInTheDocument();
    for (const t of RENOWN_TRACKS) expect(screen.getByText(t.name)).toBeInTheDocument();
    expect(screen.getAllByText(/^Train rank 1$/)).toHaveLength(RENOWN_TRACKS.length);
    expect(screen.getAllByText(/Rank 0\//)).toHaveLength(RENOWN_TRACKS.length);
  });

  it("is reachable from the Throne Hall progression tab", () => {
    const hero = newHero("Tester", "warrior");
    hero.renown = 4;
    setHero(hero);
    render(<ThroneHall onClose={() => {}} />);

    fireEvent.click(screen.getByRole("tab", { name: "Progression" }));
    expect(screen.getByText("Hero training")).toBeInTheDocument();
  });
});

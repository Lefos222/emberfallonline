import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampaignBlitz } from "@/game/CampaignBlitz";
import { campaignStagesCleared } from "@/game/campaign-blitz";
import { BLITZ_PER_DAY, blitzesLeft } from "@/game/conquest";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";

describe("campaign gate blitz", () => {
  afterEach(() => setHero(null));

  it("shows the shared daily allowance and the deepest cleared stage", () => {
    const hero = { ...newHero("Gate Tester", "warrior"), stage: 11 };
    setHero(hero);
    render(<CampaignBlitz hero={hero} />);

    expect(screen.getByText("Blitzes today 3/3")).toBeInTheDocument();
    expect(screen.getByText(/Your record is stage 10/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deepest (10)" })).toBeEnabled();
  });

  it("starts a ten-minute run and spends one daily blitz", () => {
    const hero = { ...newHero("Gate Tester", "warrior"), stage: 11 };
    const gold = hero.gold;
    setHero(hero);
    render(<CampaignBlitz hero={hero} />);

    fireEvent.click(screen.getByRole("button", { name: "Blitz" }));

    const after = getState().hero!;
    expect(after.gold).toBe(gold); // the run pays when it lands, not on the button press
    expect(after.blitzRun).toMatchObject({ gate: "campaign", target: 10 });
    expect(campaignStagesCleared(after)).toBe(10);
    expect(after.conquest?.blitzUsed).toBe(1);
    expect(screen.getByRole("status").textContent).toMatch(/Blitz started/);
    expect(screen.getByRole("group", { name: "Running blitz" })).toBeInTheDocument();
    expect(blitzesLeft(after)).toBe(BLITZ_PER_DAY - 1);
  });

  it("explains why a fresh hero cannot blitz yet", () => {
    const hero = newHero("Gate Tester", "warrior");
    setHero(hero);
    render(<CampaignBlitz hero={hero} />);

    expect(screen.getByText(/Clear your first campaign stage/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Blitz" })).toBeDisabled();
  });
});

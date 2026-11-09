import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { FarmPanel, FarmShopTab } from "@/game/Farm";
import {
  bloodoakRewards,
  ensureFarm,
  farmLevel,
  farmXpToNext,
  goldSeedReward,
  plantSeed,
  seedPrice,
} from "@/game/farm";
import { getState, setHero } from "@/game/store";

const hero = () => {
  const h = newHero("Farmer", "warrior");
  h.gold = 500_000;
  ensureFarm(h);
  return h;
};

describe("the farm panel", () => {
  afterEach(() => setHero(null));

  it("shows Farm Level 1 with one tilled plot and fifteen locked ones", () => {
    setHero(hero());
    render(<FarmPanel onClose={() => {}} />);

    expect(screen.getByText("Farm Level")).toBeInTheDocument();
    expect(screen.getByText("1 / 16 plots")).toBeInTheDocument();
    expect(screen.getByLabelText("Empty plot 1 — plant a seed")).toBeInTheDocument();
    expect(screen.getByLabelText("Plot 2 locked — Farm Level 2 required")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/locked — Farm Level \d+ required/)).toHaveLength(15);
  });

  it("charges the Bloodoak for gold and Farm XP, then shows its cooldown", () => {
    setHero(hero());
    const before = getState().hero!.gold;
    render(<FarmPanel onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText("Charge the Bloodoak"));

    const after = getState().hero!;
    expect(after.gold).toBe(before + bloodoakRewards(1).gold);
    expect(screen.getByLabelText(/Bloodoak recharging/)).toBeDisabled();
    expect(screen.getByRole("status").textContent).toContain("Bloodoak charged");
  });

  it("plants a seed from the planting dialog", () => {
    setHero(hero());
    const before = getState().hero!.gold;
    render(<FarmPanel onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText("Empty plot 1 — plant a seed"));
    const dialog = screen.getByRole("dialog");
    const plantButton = within(dialog)
      .getAllByRole("button")
      .find((b) => /Plant/.test(b.textContent ?? ""))!;
    fireEvent.click(plantButton);

    expect(screen.getByRole("status").textContent).toContain("planted in plot 1");
    const after = getState().hero!;
    expect(after.farm?.slots?.[0]).toMatchObject({ kind: "gold", tier: 1 });
    expect(after.gold).toBe(before - seedPrice("gold", 1));
  });

  it("harvests a ripe crop for its gold", () => {
    const h = hero();
    plantSeed(h, 0, "gold", 1, Date.now() - 60 * 60_000);
    setHero(h);
    const before = getState().hero!.gold;
    render(<FarmPanel onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText(/ready to harvest/));

    const after = getState().hero!;
    expect(screen.getByRole("status").textContent).toContain("Harvested");
    expect(after.gold).toBe(before + goldSeedReward(1));
    expect(after.farm?.slots?.[0]).toBeNull();
  });

  it("announces a Farm Level up and the new plot it tills", () => {
    const h = hero();
    h.farm!.xp = farmXpToNext(1) - 1;
    plantSeed(h, 0, "xp", 1, Date.now() - 60 * 60_000);
    setHero(h);
    render(<FarmPanel onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText(/ready to harvest/));

    expect(screen.getByText("Farm Level Up!")).toBeInTheDocument();
    expect(farmLevel(getState().hero!)).toBe(2);
  });
});

describe("the shop's farm tab", () => {
  afterEach(() => setHero(null));

  it("sells the tier-1 seeds and locks the rest behind the farm level", () => {
    setHero(hero());
    render(<FarmShopTab hero={getState().hero!} />);

    expect(screen.getByText("Gold Seeds")).toBeInTheDocument();
    expect(screen.getByText("XP Seeds")).toBeInTheDocument();
    expect(screen.getByLabelText("Buy Gold Seed · Lv 1")).toBeEnabled();
    // Tier 2 is not a buy button at all: the card shows the Farm Level it needs.
    expect(screen.queryByLabelText("Buy XP Seed · Lv 2")).toBeNull();
    expect(screen.getAllByText("Farm Level 2").length).toBeGreaterThan(0);
  });
});

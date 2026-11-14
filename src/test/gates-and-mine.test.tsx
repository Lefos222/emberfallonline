import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoldMinePanel } from "@/game/GoldMine";
import { Campaign } from "@/game/panels";
import { Challenges } from "@/game/Challenges";
import { ConquestTokens } from "@/game/ConquestGate";
import { fmt } from "@/game/ui";
import { heroStats, newHero, stageFoe } from "@/game/data";
import { forecastFight } from "@/game/battle-advice";
import { prepareFoe } from "@/game/foe-scaling";
import { floorRequirement } from "@/game/floor-rating";
import { getState, setHero } from "@/game/store";
import { conquestKeyActive } from "@/game/conquest";
import { MINE_MAX_LEVEL, mineLevel, minePerHour, mineUpgradeCost } from "@/game/mine";

describe("the Gold Mine building", () => {
  afterEach(() => setHero(null));

  it("banked gold fills while the hero is away and is collected whenever they like", () => {
    const hero = newHero("Miner", "warrior");
    const start = hero.gold;
    // Two hours of level 2 production, banked an hour ago: the cart already holds an hour.
    hero.mine = { level: 2, stored: minePerHour(2), lastAt: Date.now() - 60 * 60_000 };
    setHero(hero);
    render(<GoldMinePanel onClose={() => {}} />);

    expect(screen.getByText(/per hour/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Collect .* gold/ }));

    const after = getState().hero!;
    expect(after.gold).toBeGreaterThan(start + minePerHour(2));
    expect(getState().hero?.mine?.stored).toBeLessThan(minePerHour(2));
  });

  it("upgrades the shaft with gold, raising the hourly rate", () => {
    const hero = newHero("Miner", "warrior");
    hero.gold = mineUpgradeCost(1, hero.level);
    hero.mine = { level: 1, stored: 0, lastAt: Date.now() };
    setHero(hero);
    render(<GoldMinePanel onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /Upgrade ·/ }));

    const after = getState().hero!;
    expect(after.mine?.level).toBe(2);
    expect(after.gold).toBe(0);
    expect(minePerHour(2)).toBeGreaterThan(minePerHour(1));
    expect(MINE_MAX_LEVEL).toBe(40);
  });

  it("refuses an upgrade the hero cannot afford and never charges twice", () => {
    const hero = newHero("Miner", "warrior");
    hero.gold = 0;
    setHero(hero);
    render(<GoldMinePanel onClose={() => {}} />);

    const button = screen.getByRole("button", { name: /Upgrade ·/ });
    expect(button).toBeDisabled();
    expect(getState().hero?.gold).toBe(0);
    expect(mineLevel(getState().hero!)).toBe(1);
  });
});

describe("the reworked gates", () => {
  afterEach(() => setHero(null));

  it("splits the Dungeon Gate into clear tabs", () => {
    const hero = newHero("Delver", "warrior");
    hero.level = 60;
    setHero(hero);
    render(<Challenges onClose={() => {}} start={vi.fn()} />);

    expect(screen.getByRole("tab", { name: /Boss challenges/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Weekly/i }));
    expect(screen.getByText(/Weekly objective/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Expeditions/i }));
    expect(screen.getByText(/Material expeditions/i)).toBeInTheDocument();
  });

  it("splits the Campaign Gate into battle, blitz and adviser", () => {
    const hero = newHero("Walker", "warrior");
    hero.stage = 12;
    setHero(hero);
    render(<Campaign onClose={() => {}} start={vi.fn()} />);

    expect(screen.getByRole("button", { name: /FIGHT/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Blitz & progress/i }));
    expect(screen.getByRole("button", { name: /Blitz/ })).toBeInTheDocument();
  });

  it("shows the Battle Rating the floor requires, and the pill reads the real fight", () => {
    const hero = newHero("Rater", "warrior");
    hero.stage = 12;
    hero.level = 9;
    hero.attrs = { str: 4, int: 1, agi: 1, vit: 6 };
    setHero(hero);
    render(<Campaign onClose={() => {}} start={vi.fn()} />);

    // The gate previews the very foe the fight will start (prepareFoe), so the colour comes from a
    // real forecast of that fight, and the requirement is the same floor's reference-player
    // requirement (see floor-rating.ts) rather than a number that moves with the viewer's gear.
    const foe = prepareFoe(stageFoe(12), hero);
    const forecast = forecastFight(heroStats(hero), foe);
    const required = floorRequirement("campaign", 12, hero.level, hero.paragon);

    const line = screen.getByText(/Required rating/i);
    expect(line).toHaveTextContent(fmt(required));
    expect(screen.getByTitle(/compares to your battle rating/i)).toHaveTextContent(forecast.verdict);
    // The whole ladder is on screen, one row per stage up to the frontier and a few ahead.
    expect(screen.getByText(/Rating by floor/i)).toBeInTheDocument();
  });

  it("lists the rating every Conquest floor asks, and lets a floor be picked from it", () => {
    const hero = newHero("Climber", "warrior");
    hero.level = 40;
    hero.spire = 45;
    setHero(hero);
    render(<Campaign spire onClose={() => {}} start={vi.fn()} />);

    // One row per floor up to the frontier, then five floors still to come (floor 1 … floor 50).
    expect(screen.getAllByRole("button", { name: /^Floor \d+/ })).toHaveLength(50);
    const floor30 = screen.getByRole("button", { name: /^Floor 30/ });
    expect(floor30).toHaveTextContent(fmt(floorRequirement("conquest", 30, hero.level, hero.paragon)));
    // Floors past the frontier are listed but cannot be picked yet.
    expect(screen.getByRole("button", { name: /^Floor 50/ })).toBeDisabled();

    fireEvent.click(floor30);
    expect(screen.getByLabelText("Floor to fight")).toHaveValue(30);
  });

  it("pays the Conquest Gate's tokens on every floor and sells gems for tokens only", () => {
    const hero = newHero("Runner", "mage");
    hero.spire = 21;
    hero.conquest = { tokens: 0 };
    setHero(hero);
    render(<ConquestTokens hero={hero} />);

    expect(screen.getByRole("tab", { name: /Token Market/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Gem Stock/i }));
    expect(screen.getByText(/Conquest Tokens only/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buy · 25/ })).toBeDisabled();
  });

  it("lets the conquest blitz add today's Conquest Key for doubled rewards", () => {
    const hero = newHero("Keyed", "warrior");
    hero.spire = 21;
    hero.gold = 1e9;
    hero.conquest = { tokens: 0 };
    setHero(hero);
    render(<ConquestTokens hero={hero} />);

    // No key in the pack: the gate's own button buys one and lights it in a single tap.
    fireEvent.click(screen.getByRole("button", { name: /buy & light a key/i }));
    const after = getState().hero!;
    expect(conquestKeyActive(after)).toBe(true);
    expect(after.gold).toBeLessThan(1e9);
  });
});

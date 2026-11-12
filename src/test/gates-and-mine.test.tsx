import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoldMinePanel } from "@/game/GoldMine";
import { Campaign } from "@/game/panels";
import { Challenges } from "@/game/Challenges";
import { ConquestTokens } from "@/game/ConquestGate";
import { newHero } from "@/game/data";
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

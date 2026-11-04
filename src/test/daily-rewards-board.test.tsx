import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DailyRewardsBoard } from "@/game/DailyRewardsBoard";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import { DAILY_REWARD_DAYS } from "@/game/daily-rewards";

describe("30-day reward board", () => {
  afterEach(() => setHero(null));

  it("shows every day of the board with day 1 ready to claim", () => {
    setHero(newHero("Board", "warrior"));
    render(<DailyRewardsBoard />);
    const tiles = screen.getAllByLabelText(/^Day \d+: /);
    expect(tiles).toHaveLength(DAILY_REWARD_DAYS);
    expect(screen.getByLabelText(/^Day 1: .* available now$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Day 2: .* locked$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claim day 1/i })).toBeEnabled();
  });

  it("claims today's gift onto the hero and locks the board until the next Greek day", () => {
    setHero(newHero("Board", "warrior"));
    const goldBefore = getState().hero?.gold ?? 0;
    render(<DailyRewardsBoard />);

    fireEvent.click(screen.getByRole("button", { name: /Claim day 1/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/Received: \+120 gold/);
    expect(getState().hero?.gold).toBe(goldBefore + 120);
    expect(screen.getByLabelText(/^Day 1: .* claimed$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claimed today/i })).toBeDisabled();
  });
});

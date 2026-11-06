import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VipDailyBoard } from "@/game/VipDailyBoard";
import { newHero, type Hero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import { DAILY_REWARD_DAYS, VIP_DAILY_REWARDS } from "@/game/daily-rewards";

/** A hero with an active VIP membership in the server-owned premium wallet. */
const vipHero = (level: number): Hero => {
  const h = newHero("Member", "warrior") as Hero & { srv?: unknown };
  h.srv = {
    premium: { vip: { level, until: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString() } },
  };
  return h;
};

afterEach(() => setHero(null));

describe("VIP reward board", () => {
  it("shows the whole board locked below VIP 3", () => {
    setHero(vipHero(2));
    render(<VipDailyBoard />);

    expect(screen.getAllByLabelText(/^VIP day \d+: /)).toHaveLength(DAILY_REWARD_DAYS);
    expect(screen.getByRole("button", { name: /VIP 3 required/i })).toBeDisabled();
    expect(screen.getByLabelText(/^VIP day 1: .* locked$/)).toBeInTheDocument();
  });

  it("claims the next VIP day for a VIP 3 member", () => {
    const hero = vipHero(3);
    setHero(hero);
    const goldBefore = getState().hero?.gold ?? 0;
    render(<VipDailyBoard />);

    fireEvent.click(screen.getByRole("button", { name: /Claim VIP day 1/i }));

    expect(getState().hero?.gold).toBe(goldBefore + (VIP_DAILY_REWARDS[0].gold ?? 0));
    expect(screen.getByRole("status")).toHaveTextContent(/Received/);
    expect(screen.getByLabelText(/^VIP day 1: .* claimed$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claimed today/i })).toBeDisabled();
  });
});

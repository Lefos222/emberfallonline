import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MagicTower } from "@/game/Workshop";
import { ProfilePanel } from "@/game/CharacterSelect";
import { Hud } from "@/game/HeroHud";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import { grantTitles } from "@/game/titles";

const astralHero = () => {
  const h = newHero("Gazer", "mage");
  h.level = 30;
  h.gold = 1_000_000;
  h.astrals = [{ id: "a1", base: "ember", rarity: 0, lvl: 1 }];
  return h;
};

describe("astral vault", () => {
  afterEach(() => setHero(null));

  it("renders the 16x8 stone compendium with paging, zoom and the six gold tiers", () => {
    setHero(astralHero());
    const { container } = render(<MagicTower onClose={() => {}} />);

    expect(screen.getByText("ASTRAL VAULT")).toBeInTheDocument();
    // 132 species-rarity entries fill a 16x8 page, so the compendium pages over.
    expect(screen.getByText("Page 1 / 2")).toBeInTheDocument();
    expect(container.querySelectorAll("button[aria-pressed]")).toHaveLength(128);
    for (const tier of ["Grey", "Green", "Blue", "Purple", "Gold", "Red"]) {
      expect(screen.getAllByRole("button", { name: new RegExp(tier) }).length).toBeGreaterThan(0);
    }

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 2 / 2")).toBeInTheDocument();
  }, 20000);

  it("summons a grey stone for gold from the vault", () => {
    const h = astralHero();
    setHero(h);
    const before = h.astrals?.length ?? 0;
    render(<MagicTower onClose={() => {}} />);

    const grey = screen.getAllByRole("button", { name: /Grey/ }).find((b) => !b.hasAttribute("disabled"));
    expect(grey).toBeTruthy();
    fireEvent.click(grey!);

    expect(getState().hero?.astrals?.length).toBe(before + 1);
    expect(getState().hero?.gold).toBeLessThan(h.gold);
  });
});

describe("tiered titles on the profile", () => {
  afterEach(() => setHero(null));

  it("lists an earned title with its tier and buff", () => {
    const h = newHero("Titled", "warrior");
    h.level = 5;
    grantTitles(h);
    setHero(h);
    render(<ProfilePanel onClose={() => {}} />);

    expect(screen.getByText("Recruit")).toBeInTheDocument();
    expect(screen.getAllByText(/\+1% ATK/).length).toBeGreaterThan(0);
  });
});

describe("fortune chest beside the player card", () => {
  afterEach(() => setHero(null));

  it("opens a ready chest and pays a prize", () => {
    const h = newHero("Lucky", "archer");
    h.level = 8;
    setHero(h);
    render(<Hud muted setMuted={() => {}} cloud="saved" onProfile={() => {}} onSettings={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Fortune chest" }));
    expect(screen.getByText("Fortune Chest")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open chest" }));

    expect(getState().hero?.fortuneChest?.last).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Open chest" })).not.toBeInTheDocument();
  });

  it("shows a countdown while refilling", () => {
    const h = newHero("Lucky", "archer");
    h.level = 8;
    h.fortuneChest = { last: Date.now() };
    setHero(h);
    render(<Hud muted setMuted={() => {}} cloud="saved" onProfile={() => {}} onSettings={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Fortune chest" }));
    expect(screen.getByText(/Ready in/)).toBeInTheDocument();
  });
});

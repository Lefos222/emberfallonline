import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { GUIDE_CHAPTERS, GUIDE_GOALS, goalsDone } from "@/game/guide";
import { GameGuide } from "@/game/GameGuide";
import { setLang } from "@/game/i18n";
import { setHero } from "@/game/store";

/**
 * The game guide is the door a new player walks through, so its chapters, its live checklist and
 * both translations are checked here without a login (the castle windows sit behind one).
 */
describe("the game guide", () => {
  afterEach(() => {
    setHero(null);
    setLang("en");
  });

  it("opens on the first chapter with its picture and every step", () => {
    setHero(newHero("Tester", "warrior"));
    render(<GameGuide onClose={() => {}} />);

    expect(screen.getByText("Game Guide")).toBeInTheDocument();
    expect(screen.getByText(GUIDE_CHAPTERS[0].title)).toBeInTheDocument();
    for (const step of GUIDE_CHAPTERS[0].steps)
      expect(screen.getByText(step.title)).toBeInTheDocument();
    // Every chapter plus the Crafting tab the Forge's guide is merged into.
    expect(screen.getAllByRole("tab")).toHaveLength(GUIDE_CHAPTERS.length + 1);
  });

  it("switches chapters from the strip", () => {
    setHero(newHero("Tester", "warrior"));
    render(<GameGuide onClose={() => {}} />);

    const spire = GUIDE_CHAPTERS.find((c) => c.id === "spire")!;
    fireEvent.click(screen.getByRole("tab", { name: spire.tab }));

    expect(screen.getByText(spire.title)).toBeInTheDocument();
    expect(screen.getByText("Bring your friends")).toBeInTheDocument();
    expect(screen.getByText("Pick a dungeon")).toBeInTheDocument();
  });

  it("ticks the checklist off from the hero's own save", () => {
    const hero = newHero("Tester", "warrior");
    setHero(hero);
    const view = render(<GameGuide onClose={() => {}} />);
    expect(screen.getByText(`0/${GUIDE_GOALS.length}`)).toBeInTheDocument();

    hero.wins = 1;
    hero.level = 5;
    setHero({ ...hero });
    view.rerender(<GameGuide onClose={() => {}} />);
    expect(screen.getByText(`2/${GUIDE_GOALS.length}`)).toBeInTheDocument();
    expect(goalsDone(hero)).toBe(2);
  });

  it("pictures every chapter and every step with the game's own art", () => {
    setHero(newHero("Tester", "warrior"));
    const view = render(<GameGuide onClose={() => {}} />);

    // The banner plus one glyph per step, then the class models and the icon legend.
    const images = view.container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(GUIDE_CHAPTERS[0].steps.length + 2);
    expect(screen.getByText("Warrior")).toBeInTheDocument();
    expect(screen.getByText("Mage")).toBeInTheDocument();
    expect(screen.getByText("Archer")).toBeInTheDocument();
    expect(screen.getByText("Icons and materials")).toBeInTheDocument();
    expect(screen.getByText("Enchantment Stones")).toBeInTheDocument();

    // A chapter with a picture on its first step keeps it after switching.
    fireEvent.click(
      screen.getByRole("tab", { name: GUIDE_CHAPTERS.find((c) => c.id === "forge")!.tab }),
    );
    expect(view.container.querySelectorAll("img").length).toBeGreaterThan(2);
  });

  it("speaks Greek and Polish", () => {
    setHero(newHero("Tester", "warrior"));

    setLang("el");
    const el = render(<GameGuide onClose={() => {}} />);
    expect(screen.getByText("Οδηγός Παιχνιδιού")).toBeInTheDocument();
    expect(screen.getAllByText("Πρώτα βήματα").length).toBeGreaterThan(0);
    el.unmount();

    setLang("pl");
    render(<GameGuide onClose={() => {}} />);
    expect(screen.getByText("Poradnik Gry")).toBeInTheDocument();
    expect(screen.getAllByText("Pierwsze kroki").length).toBeGreaterThan(0);
  });
});

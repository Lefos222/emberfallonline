import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Panel } from "@/game/ui";
import { Battle, type Fighter } from "@/game/Battle";
import { readFastFights, saveFastFights } from "@/game/battle-prefs";

const hero: Fighter = {
  name: "Hero",
  img: "",
  hp: 600,
  atk: 40,
  def: 10,
  crit: 10,
  dodge: 5,
  level: 12,
  cls: "warrior",
  gender: "male",
};
const foe: Fighter = {
  name: "Goblin",
  img: "",
  hp: 300,
  atk: 12,
  def: 4,
  crit: 5,
  dodge: 5,
  level: 10,
};

/**
 * The small conveniences added for quality of life: Escape closes the window on top, and the
 * fight's pacing is remembered for the next battle.
 */

describe("Escape closes the topmost window", () => {
  it("closes only the window opened last", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Panel title="Forge" onClose={outer}>
          <span>forge body</span>
        </Panel>
        <Panel title="Crafting" onClose={inner}>
          <span>crafting body</span>
        </Panel>
      </>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("leaves the window alone when another key is pressed", () => {
    const close = vi.fn();
    render(
      <Panel title="Armory" onClose={close}>
        <span>bag</span>
      </Panel>,
    );
    fireEvent.keyDown(window, { key: "Enter" });
    expect(close).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe("the fight speed preference", () => {
  it("remembers the pacing chosen for the next fight", () => {
    expect(readFastFights()).toBe(false);
    saveFastFights(true);
    expect(readFastFights()).toBe(true);
    saveFastFights(false);
    expect(readFastFights()).toBe(false);
  });

  it("starts a battle in the pacing that was left on", () => {
    saveFastFights(true);
    const { unmount } = render(
      <Battle left={hero} right={foe} onEnd={() => {}} title="Campaign Gate" />,
    );
    const speed = screen.getByTitle("Speed");
    expect(speed.className).toContain("rarity-2");
    fireEvent.click(speed);
    expect(speed.className).not.toContain("rarity-2");
    expect(readFastFights()).toBe(false);
    unmount();
  });
});

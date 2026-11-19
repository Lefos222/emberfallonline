import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { Battle, type Fighter } from "@/game/Battle";
import { shotFor } from "@/game/battle-shots";
import mageOrb from "@/assets/fx/skills/mage-orb.svg";
import warriorWave from "@/assets/fx/skills/warrior-wave.svg";
import archerArrow from "@/assets/fx/skills/archer-arrow.svg";
import beastClaw from "@/assets/fx/skills/beast-claw.svg";

/** The mage's kit is all casts, so an auto-battle always looses a projectile across the field. */
const mage: Fighter = {
  name: "Hero", img: "", hp: 600, atk: 40, def: 10, crit: 10, dodge: 5, level: 12, cls: "mage", gender: "male",
};
const foe: Fighter = {
  name: "Goblin", img: "", hp: 300, atk: 12, def: 4, crit: 5, dodge: 5, level: 10,
};

describe("battle skillshots", () => {
  it("gives every class its own skillshot, and monsters a claw", () => {
    expect(shotFor("warrior")).toBe(warriorWave);
    expect(shotFor("mage")).toBe(mageOrb);
    expect(shotFor("archer")).toBe(archerArrow);
    expect(shotFor("mage", true)).toBe(beastClaw);
  });

  it("looses the class's painted skillshot and bursts on the target", async () => {
    const battle = render(<Battle left={mage} right={foe} onEnd={() => {}} auto />);
    let shotSrc: string | null = null;
    let impact = false;
    // The projectile and its burst only live for the length of one blow, so sample while it plays.
    for (let i = 0; i < 40 && !(shotSrc && impact); i += 1) {
      await act(async () => { await new Promise((r) => setTimeout(r, 80)); });
      const shot = document.querySelector(".battle-shot") as HTMLImageElement | null;
      if (shot) shotSrc = shot.getAttribute("src");
      if (document.querySelector(".battle-impact")) impact = true;
    }
    expect(shotSrc).toBe(mageOrb);
    expect(impact).toBe(true);
    battle.unmount();
  }, 15000);
});

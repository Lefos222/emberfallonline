import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SKILL_MOVE, SKILL_EFFECT, moveFor } from "@/game/skillAnim";

/** Every move the battle renderer can draw. */
const MOVES = ["swing", "overhead", "spin", "leap", "slam", "rage", "cast", "thrust", "nova", "rise", "channel", "siphon", "draw", "rapid", "aim", "dash", "drink"] as const;

describe("battle animations", () => {
  it("gives every skill in the move table an impact effect", () => {
    for (const id of Object.keys(SKILL_MOVE)) {
      if (id === "potion") continue;
      expect(SKILL_EFFECT[id], `${id} should have an effect`).toBeDefined();
    }
  });

  it("ships a keyframe rule for every move the table can ask for", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
    const missing = MOVES.filter((m) => !new RegExp(`(\\.|@utility\\s+)anim-${m}\\b`).test(css));
    expect(missing).toEqual([]);
  });

  it("still animates a skill the table has never heard of", () => {
    expect(moveFor({ cls: "mage" }, "brand-new-spell")).toBe("cast");
    expect(moveFor({ cls: "archer" })).toBe("draw");
    expect(moveFor({ cls: "warrior" })).toBe("swing");
    expect(moveFor({})).toBe("swing");
  });

  it("keeps the signature moves where the player expects them", () => {
    expect(SKILL_MOVE["strike"]).toBe("swing");
    expect(SKILL_MOVE["cleave"]).toBe("overhead");
    expect(SKILL_MOVE["bolt"]).toBe("cast");
    expect(SKILL_MOVE["meteor"]).toBe("rise");
    expect(SKILL_MOVE["shot"]).toBe("draw");
    expect(SKILL_MOVE["snipe"]).toBe("aim");
  });
});

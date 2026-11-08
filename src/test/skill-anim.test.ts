import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SKILLS } from "@/game/data";
import { TREES } from "@/game/talents";
import { SKILL_EFFECT, SKILL_MOVE, moveFor } from "@/game/skillAnim";

/** Every move the battle renderer can draw. */
const MOVES = ["swing", "overhead", "spin", "leap", "slam", "rage", "cast", "thrust", "nova", "rise", "channel", "siphon", "draw", "rapid", "aim", "dash", "drink"] as const;

/** Every skill the game can put on the bar: the three class kits plus every skill-tree ability. */
function everySkillId() {
  const ids = Object.values(SKILLS).flatMap((kit) => kit.map((s) => s.id));
  for (const specs of Object.values(TREES)) {
    for (const spec of specs) {
      for (const talent of spec.talents) if (talent.ability) ids.push(talent.ability.id);
    }
  }
  return [...new Set(ids)];
}

describe("skill battle animations", () => {
  it("knows every skill the game can actually put on the bar", () => {
    // Nine base abilities, nine specialization abilities and nine endless branches.
    expect(everySkillId()).toHaveLength(27);
  });

  it("gives every skill its own move", () => {
    expect(everySkillId().filter((id) => !SKILL_MOVE[id])).toEqual([]);
  });

  it("gives every skill impact artwork", () => {
    expect(everySkillId().filter((id) => !SKILL_EFFECT[id])).toEqual([]);
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
    expect(SKILL_MOVE["whirl"]).toBe("spin");
    expect(SKILL_MOVE["bolt"]).toBe("cast");
    expect(SKILL_MOVE["meteor"]).toBe("rise");
    expect(SKILL_MOVE["shot"]).toBe("draw");
    expect(SKILL_MOVE["snipe"]).toBe("aim");
  });
});

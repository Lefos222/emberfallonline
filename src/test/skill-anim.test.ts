import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { moveFor } from "@/game/skillAnim";

/** Every move the battle renderer can draw. */
const MOVES = ["swing", "overhead", "spin", "leap", "slam", "rage", "cast", "thrust", "nova", "rise", "channel", "siphon", "draw", "rapid", "aim", "dash", "drink"] as const;

describe("auto-battle animations", () => {
  it("ships a keyframe rule for every move the table can ask for", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
    const missing = MOVES.filter((m) => !new RegExp(`(\\.|@utility\\s+)anim-${m}\\b`).test(css));
    expect(missing).toEqual([]);
  });

  it("gives each class a signature weapon move", () => {
    expect(moveFor({ cls: "warrior" })).toBe("swing");
    expect(moveFor({ cls: "mage" })).toBe("cast");
    expect(moveFor({ cls: "archer" })).toBe("draw");
  });

  it("falls back to a class move for the basic attack", () => {
    expect(moveFor({ cls: "warrior" }, "hit")).toBe("swing");
    expect(moveFor({ cls: "mage" }, "hit")).toBe("cast");
    expect(moveFor({ cls: "archer" }, "hit")).toBe("draw");
  });

  it("falls back to swing for an unknown class", () => {
    expect(moveFor({})).toBe("swing");
  });
});

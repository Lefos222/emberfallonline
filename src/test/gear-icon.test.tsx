import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import gearAtlas from "@/assets/gear-atlas.jpg";
import { GearIcon } from "@/game/GearIcon";
import {
  ATLAS_BAND_H,
  ATLAS_BANDS,
  ATLAS_H,
  ATLAS_W,
  iconRect,
  type HeroClass,
  type Slot,
} from "@/game/data";

const CLASSES: HeroClass[] = ["warrior", "mage", "archer"];
const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

type IconItem = Parameters<typeof GearIcon>[0]["item"] & { name?: string };

const SIZE = 84;

/** The cropped atlas div GearIcon paints its icon onto (root frame → cropped sheet div). */
function painted(item: IconItem, relic = false) {
  const { container } = render(<GearIcon item={item} size={SIZE} relic={relic} />);
  return (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
}

/** The atlas pixel an element's background-position starts at. */
function atlasPixel(el: HTMLElement) {
  const [x, y] = el.style.backgroundPosition.split(" ").map((v) => Math.abs(parseFloat(v)));
  return { x: x!, y: y! };
}

describe("gear icon atlas", () => {
  it("cuts every class, slot and icon of both bands from the one gear atlas", () => {
    for (const cls of CLASSES) {
      for (const slot of SLOTS) {
        for (let icon = 0; icon < 16; icon += 1) {
          for (let art = 0; art < ATLAS_BANDS; art += 1) {
            const r = iconRect({ slot, cls, icon }, art);
            const s = SIZE / Math.max(r.w, r.h);
            const el = painted({ slot, cls, icon, name: "Iron Helm", art });
            expect(el.style.backgroundImage).toContain(gearAtlas);
            expect(el.style.backgroundSize).toBe(`${ATLAS_W * s}px ${ATLAS_H * s}px`);
            expect(atlasPixel(el)).toEqual({ x: r.x * s, y: r.y * s });
          }
        }
      }
    }
  });

  it("offsets the second band by exactly one painted sheet", () => {
    const first = painted({ slot: "helmet", cls: "warrior", icon: 0, name: "Iron Helm", art: 0 });
    const second = painted({ slot: "helmet", cls: "warrior", icon: 0, name: "Iron Helm", art: 1 });
    expect(ATLAS_H).toBe(ATLAS_BAND_H * ATLAS_BANDS);
    expect(atlasPixel(second).y - atlasPixel(first).y).toBe(ATLAS_BAND_H);
  });

  it("draws relic pieces from the relic band without needing the art field", () => {
    const plain = painted({ slot: "helmet", cls: "warrior", icon: 0, name: "Iron Helm" });
    const relic = painted({ slot: "helmet", cls: "warrior", icon: 0, name: "Emberforged Skullhelm" });
    expect(atlasPixel(relic).y - atlasPixel(plain).y).toBe(ATLAS_BAND_H);
  });

  it("lets a slot-only preview choose the relic band explicitly", () => {
    const plain = painted({ slot: "ring", cls: "archer", icon: 2 });
    const forced = painted({ slot: "ring", cls: "archer", icon: 2 }, true);
    const r = iconRect({ slot: "ring", cls: "archer", icon: 2 }, 1);
    const s = SIZE / Math.max(r.w, r.h);
    expect(atlasPixel(forced)).toEqual({ x: r.x * s, y: r.y * s });
    expect(atlasPixel(forced).y).toBeGreaterThan(atlasPixel(plain).y);
  });
});

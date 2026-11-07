import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import classSheet from "@/assets/equipment_for_classes.jpg";
import relicSheet from "@/assets/relic-gear.jpg";
import { GearIcon } from "@/game/GearIcon";
import type { HeroClass, Slot } from "@/game/data";

const CLASSES: HeroClass[] = ["warrior", "mage", "archer"];
const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

type IconItem = Parameters<typeof GearIcon>[0]["item"] & { name?: string };

/** The inline style GearIcon paints its cropped sheet onto (root frame → cropped sheet div). */
function sheetStyle(container: HTMLElement) {
  const frame = container.firstElementChild as HTMLElement;
  return (frame.firstElementChild as HTMLElement).getAttribute("style") ?? "";
}

function painted(item: IconItem) {
  const { container } = render(<GearIcon item={item} />);
  return sheetStyle(container);
}

describe("gear icon sheets", () => {
  it("draws ordinary gear of every class and slot from the original class sheet", () => {
    for (const cls of CLASSES) {
      for (const slot of SLOTS) {
        expect(painted({ slot, cls, icon: 1, name: "Iron Signet" })).toContain(classSheet);
      }
    }
  });

  it("draws every class relic collection from the relic sheet", () => {
    for (const cls of CLASSES) {
      expect(painted({ slot: "helmet", cls, icon: 0, name: "Emberforged Skullhelm" })).toContain(
        relicSheet,
      );
      expect(painted({ slot: "ring", cls, icon: 6, name: "Starweave Nebula Loop" })).toContain(
        relicSheet,
      );
    }
  });

  it("lets a slot-only preview choose the relic sheet explicitly", () => {
    expect(painted({ slot: "ring", cls: "archer", icon: 2 })).toContain(classSheet);
    const { container } = render(
      <GearIcon item={{ slot: "ring", cls: "archer", icon: 2 }} relic />,
    );
    expect(sheetStyle(container)).toContain(relicSheet);
  });
});

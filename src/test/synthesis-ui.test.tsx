import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";
import { synthCost, SYNTH_SLOTS } from "@/game/synthesis";
import { SynthesisPanel } from "@/game/Synthesis";

/** The panel driven by a local copy of the save, exactly as the live tab drives the real one. */
function Harness({ hero }: { hero: Hero }) {
  const [h, setH] = useState(hero);
  return <SynthesisPanel hero={h} gender="female" act={(fn) => {
    const copy = structuredClone(h);
    const err = fn(copy);
    setH(copy);
    return err;
  }} />;
}

function heroAt(level: number, mats: Partial<Record<string, number>> = {}): Hero {
  const h = newHero("Synthesis", "warrior");
  h.level = level;
  h.mats = mats as Hero["mats"];
  return h;
}

const tile = (name: RegExp) => screen.getByRole("button", { name });

describe("synthesis tab", () => {
  it("shows the level, the current set, the next set and all eight pieces", () => {
    render(<Harness hero={heroAt(40)} />);
    expect(screen.getByTestId("synthesis-tab")).toBeTruthy();
    expect(screen.getByText("Current set")).toBeTruthy();
    expect(screen.getAllByText("Synthesis Set I").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Requires level 50").length).toBeGreaterThan(0);
    // Eight equipment pieces, each with its own crafting state.
    for (const slot of SYNTH_SLOTS) {
      const label = slot === "weapon" ? "Sword" : slot === "ring1" ? "Ring I" : slot === "ring2" ? "Ring II" : null;
      if (label) expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText("Not forged").length).toBe(8);
  });

  it("blocks crafting while the player is short of materials", () => {
    render(<Harness hero={heroAt(40)} />);
    expect(screen.getAllByText(/Not enough/).length).toBeGreaterThan(0);
    const forge = tile(/^Forge piece$/i) as HTMLButtonElement;
    expect(forge.disabled).toBe(true);
  });

  it("forges a piece, then equips it, and the preview follows the equipment", () => {
    const cost = synthCost(1, "helmet");
    render(<Harness hero={heroAt(40, { ...cost })} />);
    const forge = tile(/^Forge piece$/i) as HTMLButtonElement;
    expect(forge.disabled).toBe(false);
    fireEvent.click(forge);
    expect(screen.getByText("Forged Synthesis Set I · Helmet!")).toBeTruthy();
    expect(screen.getByText("Default appearance — no synthesis gear worn")).toBeTruthy();

    fireEvent.click(tile(/^Equip piece$/i));
    expect(screen.getByText("Synthesis Set I · Helmet equipped")).toBeTruthy();
    expect(screen.getByText("1/8 pieces worn")).toBeTruthy();
    // Every slot line reports the set it now wears.
    expect(screen.getAllByText("I").length).toBeGreaterThan(0);
    expect(tile(/^Remove from helmet$/i)).toBeTruthy();
  });

  it("keeps the whole forge shut until level 30 and shows the first set at level 40", () => {
    render(<Harness hero={heroAt(29)} />);
    expect(screen.getByText(/Synthesis opens at character level 30/)).toBeTruthy();
    expect(screen.queryAllByText("Not forged").length).toBe(0);
    expect(screen.getAllByText("Lv 40").length).toBeGreaterThanOrEqual(8);
  });

  it("keeps locked sets visible with their required level", () => {
    render(<Harness hero={heroAt(45)} />);
    const rail = screen.getByRole("group", { name: /synthesis sets/i });
    expect(within(rail).getAllByRole("button")).toHaveLength(9);
    expect(within(rail).getByRole("button", { name: /Synthesis Set IX, locked until level 120/ })).toBeTruthy();
    fireEvent.click(within(rail).getByRole("button", { name: /Synthesis Set IX/ }));
    expect(screen.getByText(/Unlocks at level 120/)).toBeTruthy();
    const forge = tile(/^Requires level 120$/i) as HTMLButtonElement;
    expect(forge.disabled).toBe(true);
  });
});

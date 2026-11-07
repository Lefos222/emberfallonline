import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GearCodex } from "@/game/GearCodex";
import { SLOTS, iconCount } from "@/game/data";

const ICONS_PER_ERA = SLOTS.reduce((n, slot) => n + iconCount(slot), 0);

describe("gear codex", () => {
  it("shows every painted icon of the chosen era with the item stats", () => {
    render(<GearCodex cls="warrior" />);
    expect(screen.getAllByRole("button", { name: /icon \d+/ })).toHaveLength(ICONS_PER_ERA);

    const relic = screen.getByRole("button", { name: "Relic" });
    fireEvent.click(relic);
    expect(relic).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByLabelText("Codex rarity"), { target: { value: "5" } });
    fireEvent.click(screen.getAllByRole("button", { name: /icon \d+/ })[0]!);
    expect(screen.getByRole("status")).toHaveTextContent(/ATK \+/);
    expect(screen.getByRole("status")).toHaveTextContent(/Mythic/);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThroneHall } from "@/game/ThroneHall";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

describe("throne hall achievements", () => {
  afterEach(() => setHero(null));

  it("lists the new achievement families on the achievements tab", () => {
    setHero(newHero("Tester", "warrior"));
    render(<ThroneHall onClose={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: /Achievements/i }));

    for (const name of [
      "Beast Hunter",
      "Bestiary Master",
      "Reaver VI",
      "Realm Completionist",
      "Titan Slayer",
      "Guild Paragon",
      "Warlord",
      "Grandmaster",
      "Enlightened",
    ]) {
      expect(screen.getByText(new RegExp(`^${name}`))).toBeInTheDocument();
    }
  });
});

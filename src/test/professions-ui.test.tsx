import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Professions } from "@/game/Professions";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";

const HAUL = {
  "logging:0:0": 96,
  "logging:1:1": 34,
  "mining:0:0": 121,
  "mining:3:3": 3,
  "herbalism:1:0": 44,
  "fishing:2:1": 19,
  "archaeology:3:2": 5,
};

function heroWithHaul() {
  const hero = newHero("Tester", "warrior");
  Object.assign(hero, {
    srv: {
      gathering: {
        professions: { logging: { xp: 420, tool: 1, journeys: 12 } },
        resources: HAUL,
        history: [
          {
            request: "r1",
            profession: "logging",
            area: 0,
            rarity: 0,
            quantity: 4,
            resource: "logging:0:0",
            xp: 20,
            at: new Date(0).toISOString(),
          },
        ],
        active: null,
        nextAt: null,
      },
    },
  });
  return hero;
}

describe("the gatherer's lodge", () => {
  afterEach(() => setHero(null));

  it("banks every haul as material in the lodge stores", () => {
    setHero(heroWithHaul());
    const { container } = render(<Professions onClose={() => {}} />);

    expect(screen.getByText("Gatherer's Lodge")).toBeInTheDocument();
    expect(screen.getByText(/banked as material/)).toBeInTheDocument();
    expect(screen.getByText(/Send the gatherers/)).toBeInTheDocument();

    const cards = [...container.querySelectorAll("article")].map((a) => a.textContent ?? "");
    expect(cards.some((t) => /Wood\s*×130/.test(t))).toBe(true);
    expect(cards.some((t) => /Stone\s*×121/.test(t))).toBe(true);
    expect(cards.some((t) => /Iron\s*×3/.test(t))).toBe(true);
    expect(cards.some((t) => /Grass\s*×44/.test(t))).toBe(true);
    expect(cards.some((t) => /Fish\s*×19/.test(t))).toBe(true);
    expect(cards.some((t) => /Relic\s*×5/.test(t))).toBe(true);

    const text = container.textContent ?? "";
    expect(text).toMatch(/Recent hauls/);
    expect(text).not.toMatch(/Discoveries ·/);
  });
});

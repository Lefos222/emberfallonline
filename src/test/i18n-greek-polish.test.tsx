import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";
import { setLang, t } from "@/game/i18n";

/**
 * Greek and Polish cover the whole game.
 *
 * The first block reads every screen's source and fails when a phrase handed to `t()` has no
 * Greek or Polish row, so a new label cannot ship in English only. The second block renders a
 * real panel in both languages, which is the part the sign-in gate alone cannot prove: the
 * castle's windows are behind a login.
 */

/** Words that read the same in all three languages, so a "translation" would change nothing. */
const SAME_IN_EVERY_LANGUAGE = new Set([
  "EmberFall Online",
  "EMBER FALL",
  "VIP",
  "Blitz",
  "Blitzes",
  "BOSS",
  "AUTO",
  "HP",
  "Lv",
  "vs",
  "pc",
  "Bio",
  "Email",
  "VIP −",
  "Basic try",
  // Read the same in Greek or Polish, so translating them would only change the letters.
  "XP",
  "XP ·",
  "Arena",
  "min",
  "· Int",
]);

function calledPhrases(file: string): string[] {
  const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const found: string[] = [];
  for (const match of source.matchAll(/\b(?:t|tr)\("((?:[^"\\]|\\.)*)"\)/g)) {
    found.push(match[1].replace(/\\(.)/g, "$1"));
  }
  return found;
}

function screenFiles(): string[] {
  const dir = path.join(process.cwd(), "src");
  return [
    ...fs.readdirSync(path.join(dir, "game")).filter((f) => f.endsWith(".tsx")).map((f) => `src/game/${f}`),
    ...fs.readdirSync(path.join(dir, "routes")).filter((f) => f.endsWith(".tsx")).map((f) => `src/routes/${f}`),
  ];
}

describe("the game's Greek and Polish dictionary", () => {
  const phrases = [...new Set(screenFiles().flatMap(calledPhrases))].filter(
    (p) => !SAME_IN_EVERY_LANGUAGE.has(p),
  );

  for (const lang of ["el", "pl"] as const) {
    it(`translates every phrase a screen shows (${lang})`, () => {
      setLang(lang);
      const stillEnglish = phrases.filter((p) => t(p) === p);
      expect(stillEnglish).toEqual([]);
    });
  }
});

const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));

vi.mock("@/integrations/supabase/client", () => {
  const query = (resolved: { data: unknown; error: null }) => {
    const q: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "neq"]) q[method] = () => q;
    q["maybeSingle"] = async () => resolved;
    q["then"] = (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) => Promise.resolve(resolved).then(ok, fail);
    return q;
  };
  return {
    supabase: {
      from: (table: string) =>
        query({
          data: table === "arena_matches" ? [] : [
            { id: "h-1", user_id: "u-1", name: "Far Hero", hero_class: "mage", gender: "female", level: 60, power: 9000, arena_rating: 3200, stats: {} },
            { id: "h1", user_id: "u1", name: "Pit", hero_class: "warrior", gender: "male", level: 40, power: 3000, arena_rating: 1000, stats: {} },
          ],
          error: null,
        }),
      rpc: async () => ({ data: 3, error: null }),
    },
  };
});

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, userId: "u1", heroId: "h1" }),
  update: (fn: (h: Hero) => void) => { fn(store.hero); },
}));

import { Arena } from "@/game/Arena";

describe("a castle window in Greek and Polish", () => {
  beforeEach(() => { store.hero = newHero("Pit", "warrior"); });

  it("draws the arena in Greek", () => {
    setLang("el");
    render(<Arena onClose={() => {}} start={(() => {}) as never} />);
    expect(screen.getByText("Αρένα του Αίματος")).toBeTruthy();
    expect(screen.getByText("Κατάταξη, μονομαχίες και βαθμολογίες")).toBeTruthy();
    expect(document.body.textContent).not.toContain("Blood Arena");
  });

  it("draws the arena in Polish", () => {
    setLang("pl");
    render(<Arena onClose={() => {}} start={(() => {}) as never} />);
    expect(screen.getByText("Arena Krwi")).toBeTruthy();
    expect(document.body.textContent).not.toContain("Blood Arena");
  });

  it("goes back to English", () => {
    setLang("en");
    render(<Arena onClose={() => {}} start={(() => {}) as never} />);
    expect(screen.getByText("Blood Arena")).toBeTruthy();
  });
});

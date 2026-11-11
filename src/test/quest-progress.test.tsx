import { afterEach, describe, expect, it, vi } from "vitest";

/** A minimal stand-in for the hosted client: reads/writes resolve, RPCs resolve a beat later. */
const hero = vi.hoisted(() => ({ save: null as unknown }));
vi.mock("@/integrations/supabase/client", () => {
  // Rows come back for the list/save calls, so the store never treats the hero as removed.
  const result = { data: [{ id: "6f0d6b4e-0000-4000-8000-000000000001" }], error: null };
  const chain = () => {
    const q: Record<string, unknown> = {
      select: () => q,
      eq: () => q,
      order: () => q,
      insert: () => q,
      update: () => q,
      delete: () => q,
      single: () => Promise.resolve({ data: { save: hero.save, gender: "male" }, error: null }),
      maybeSingle: () =>
        Promise.resolve({ data: { save: hero.save, gender: "male" }, error: null }),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
    };
    return q;
  };
  return {
    supabase: {
      from: () => chain(),
      rpc: () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 50)),
    },
  };
});

import { render, screen } from "@testing-library/react";
import { QuestsPanel } from "@/game/Quests";
import { newHero } from "@/game/data";
import { getState } from "@/game/store";
import { resetLevelQuests, levelQuestRows } from "@/game/level-quests";
import { recordBattle } from "@/game/progress";
import { selectCharacter, setUser, update } from "@/game/store";
import { reportGuildBattle } from "@/game/guild-events";

/** The win counters the quest board reads. */
const progress = (kind: "wins" | "kills") =>
  levelQuestRows(getState().hero!).find((r) => r.quest.kind === kind)!.progress;

describe("quest progress after a won fight", () => {
  afterEach(() => vi.restoreAllMocks());

  it("records the fight's counters even while the guild quest report is in flight", async () => {
    const fresh = newHero("Questor", "warrior");
    fresh.level = 3;
    resetLevelQuests(fresh);
    hero.save = fresh;
    await setUser("6f0d6b4e-0000-4000-8000-000000000000", "questor@emberfall.test");
    const err = await selectCharacter("6f0d6b4e-0000-4000-8000-000000000001");
    expect(err).toBeNull();

    // The end of a won fight, in the order Game.tsx runs it: the shared guild quest report is
    // fired, then the fight's own counters (record + monsters slain) are written.
    reportGuildBattle();
    update((h) => recordBattle(h, { title: "skirmish", won: true, rewards: [] }));
    update((h) => {
      h.slain = (h.slain ?? 0) + 1;
    });

    await new Promise((r) => setTimeout(r, 120));

    expect(progress("wins")).toBe(1);
    expect(progress("kills")).toBe(1);

    // …and the board the player opens shows that progress.
    render(<QuestsPanel onClose={() => {}} />);
    expect(screen.getByText(`${progress("wins")}/5`)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// The region never talks to the backend on its own; the store's client is stubbed so the
// test runs offline.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      update: () => ({ eq: async () => ({ error: null }) }),
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: { message: "offline" } }) }),
      }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      getUser: async () => ({ data: { user: null } }),
      signOut: async () => ({}),
    },
  },
}));

import { CloudCity } from "@/game/CloudCity";
import { newHero } from "@/game/data";
import { getState, setHero } from "@/game/store";
import { ascRank, shards } from "@/game/cloudcity";

beforeAll(() => {
  // jsdom has no PointerEvent, so fireEvent would build a bare Event without clientX/button.
  const g = globalThis as unknown as { PointerEvent?: unknown; MouseEvent: typeof MouseEvent };
  if (!g.PointerEvent) {
    class PointerEventPolyfill extends MouseEvent {}
    g.PointerEvent = PointerEventPolyfill;
    (window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill;
  }
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = RO;
});

beforeEach(() => {
  const hero = newHero("Skytreader", "archer");
  setHero(hero);
});

describe("Cloud City region", () => {
  it("renders the island, its buildings and its citizens around the hero", () => {
    const { container } = render(<CloudCity onClose={() => {}} />);
    expect(container.querySelectorAll("[data-cc-building]").length).toBeGreaterThan(8);
    expect(container.querySelectorAll("[data-cc-npc]").length).toBe(12);
    expect(container.querySelector("[data-cc-player]")).toBeTruthy();
    expect(screen.getByLabelText("Ascension Nexus")).toBeInTheDocument();
    expect(screen.getByText("Cloud City")).toBeInTheDocument();
  });

  it("walks the hero to a click on the plaza", async () => {
    const { container } = render(<CloudCity onClose={() => {}} />);
    const player = container.querySelector("[data-cc-player]") as HTMLElement;
    const before = player.style.transform;

    fireEvent.pointerDown(container.querySelector("[data-cc-viewport]") as HTMLElement, {
      clientX: 320,
      clientY: 420,
      button: 0,
    });

    await waitFor(() => expect(player.style.transform).not.toBe(before), { timeout: 2000 });
    expect(container.querySelector(".cc-figure.is-walking")).toBeTruthy();
  });

  it("walks to a citizen, opens their dialogue and pays their daily gift", async () => {
    render(<CloudCity onClose={() => {}} />);
    const mira = screen.getByLabelText("Mira, Teahouse Keeper");
    const before = shards(getState().hero!);

    fireEvent.pointerDown(mira);
    fireEvent.click(mira);

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByRole("dialog").textContent).toContain("Mira");
    expect(screen.getByRole("dialog").textContent).toContain("Teahouse Keeper");
    expect(getState().hero?.cloud?.talks).toContain("mira");
    expect(shards(getState().hero!)).toBe(before + 1);
  });

  it("binds an Aether Ascension rank from the Nexus and spends shards", async () => {
    render(<CloudCity onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Ascension" }));
    const before = shards(getState().hero!);

    const bind = await screen.findAllByRole("button", { name: /Bind rank/ });
    fireEvent.click(bind[0]);

    await waitFor(() => expect(ascRank(getState().hero!, "might")).toBe(1));
    expect(shards(getState().hero!)).toBeLessThan(before);
  });
});

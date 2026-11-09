import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";
import type { GuildWarState } from "@/game/guild-wars";

const ACTIVE: GuildWarState = {
  guild: "g1",
  war: {
    id: "w1",
    side: "a",
    size: 10,
    my_score: 3,
    their_score: 2,
    starts_at: new Date(Date.now() - 3600_000).toISOString(),
    ends_at: new Date(Date.now() + 3600_000).toISOString(),
    attacks_left: 2,
    opponent: { id: "g2", name: "Ash Covenant", level: 7 },
    enemies: [
      {
        id: "h2",
        name: "Brannoc",
        level: 22,
        power: 9000,
        hero_class: "warrior",
        gender: "male",
        attacks: 0,
      },
    ],
  },
  challenges: [],
  history: [
    {
      id: "w0",
      size: 5,
      ends_at: new Date(Date.now() - 86400_000).toISOString(),
      result: "win",
      my_score: 6,
      their_score: 4,
      opponent: "Iron Pact",
      claimed: false,
    },
  ],
};

const CHALLENGE: GuildWarState = {
  guild: "g1",
  war: null,
  challenges: [
    {
      id: "c1",
      size: 25,
      outgoing: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
      guild: { id: "g3", name: "Dawn Legion", level: 9 },
    },
  ],
  history: [],
};

const loadGuildWar = vi.fn(async () => ACTIVE);
const respondGuildWar = vi.fn(async () => ({ status: "open" as const }));

vi.mock("@/game/guild-wars", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/game/guild-wars")>();
  return {
    ...actual,
    loadGuildWar: () => loadGuildWar(),
    respondGuildWar: () => respondGuildWar(),
  };
});

// The panel reads guilds/heroes straight from Supabase; a plain stub keeps these checks offline.
vi.mock("@/integrations/supabase/client", () => {
  const result = Promise.resolve({ data: [], error: null });
  const builder: Record<string, unknown> = {
    select: () => builder,
    neq: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => result,
    in: () => result,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (v: unknown) => unknown) => result.then(resolve),
  };
  return { supabase: { from: () => builder, rpc: () => result } };
});

const { GuildWars } = await import("@/game/GuildWars");

const start = () => {};

describe("the guild war panel", () => {
  it("shows the live war, my two attacks, the enemy roster and what each side is paid", async () => {
    setHero({ ...newHero("Warden", "warrior"), level: 20 });
    loadGuildWar.mockResolvedValueOnce(ACTIVE);
    render(<GuildWars heroId="h1" guildId="g1" role="member" start={start} />);

    await waitFor(() => expect(screen.getByText("Ash Covenant")).toBeInTheDocument());
    expect(screen.getByText("10v10")).toBeInTheDocument();
    expect(screen.getByText(/2 of 2 left/)).toBeInTheDocument();
    expect(screen.getByText("Brannoc")).toBeInTheDocument();
    expect(screen.getByText("Victory")).toBeInTheDocument();
    expect(screen.getByText("Defeat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Claim spoils/ })).toBeInTheDocument();
  });

  it("lets a leader accept an incoming challenge, and a member only read it", async () => {
    setHero({ ...newHero("Warden", "warrior"), level: 20 });
    loadGuildWar.mockResolvedValue(CHALLENGE);
    const view = render(<GuildWars heroId="h1" guildId="g1" role="member" start={start} />);

    await waitFor(() => expect(screen.getByText(/Dawn Legion/)).toBeInTheDocument());
    expect(screen.getByText("25v25")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Accept/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Waiting for a leader or officer/)).toBeInTheDocument();

    view.unmount();
    render(<GuildWars heroId="h1" guildId="g1" role="leader" start={start} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Accept/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Accept/ }));
    expect(respondGuildWar).toHaveBeenCalled();
  });

  it("offers every bracket when a leader declares a war", async () => {
    setHero({ ...newHero("Warden", "warrior"), level: 20 });
    loadGuildWar.mockResolvedValue({ guild: "g1", war: null, challenges: [], history: [] });
    render(<GuildWars heroId="h1" guildId="g1" role="officer" start={start} />);

    await waitFor(() => expect(screen.getByText("Declare a new war")).toBeInTheDocument());
    const hundred = screen.getByRole("button", { name: "100v100" });
    fireEvent.click(hundred);
    expect(hundred).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Each side fields its 100 strongest members/)).toBeInTheDocument();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FriendsPanel, presence } from "@/game/FriendsPanel";
import type { FriendProfile, FriendRequest, HeroSearchResult } from "@/game/social";

const social = vi.hoisted(() => ({
  listFriends: vi.fn(),
  listFriendRequests: vi.fn(),
  listIncomingDirectMessages: vi.fn(),
  listSentRequests: vi.fn(),
  requestFriend: vi.fn(),
  respondFriendRequest: vi.fn(),
  cancelFriendRequest: vi.fn(),
  removeFriend: vi.fn(),
  searchHeroes: vi.fn(),
  subscribeFriendChanges: vi.fn(() => () => {}),
}));

vi.mock("@/game/social", () => ({
  ...social,
  inspectHero: vi.fn(),
  listDirectMessages: vi.fn().mockResolvedValue([]),
  sendDirectMessage: vi.fn().mockResolvedValue(undefined),
  socialError: (e: unknown) => (e instanceof Error ? e.message : "failed"),
}));

const friend = (over: Partial<FriendProfile>): FriendProfile => ({
  id: "f1",
  name: "Bronn",
  hero_class: "warrior",
  gender: "male",
  level: 12,
  power: 900,
  arena_rating: 1000,
  title: "",
  frame: "iron",
  bio: "",
  last_played: new Date().toISOString(),
  ...over,
});

const request = (over: Partial<FriendRequest>): FriendRequest => ({
  id: "r1",
  hero_id: "s1",
  name: "Sera",
  hero_class: "mage",
  gender: "female",
  level: 8,
  power: 420,
  created_at: new Date().toISOString(),
  ...over,
});

const hero = (over: Partial<HeroSearchResult>): HeroSearchResult => ({
  id: "h1",
  name: "Kael",
  hero_class: "archer",
  gender: "male",
  level: 20,
  power: 1500,
  last_played: new Date().toISOString(),
  relation: "none",
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  social.listFriends.mockResolvedValue([
    friend({ id: "f1", name: "Bronn" }),
    friend({
      id: "f2",
      name: "Lyra",
      hero_class: "mage",
      last_played: new Date(Date.now() - 3 * 3600_000).toISOString(),
    }),
  ]);
  social.listFriendRequests.mockResolvedValue([request({})]);
  social.listIncomingDirectMessages.mockResolvedValue([]);
  social.listSentRequests.mockResolvedValue([
    request({ id: "out1", hero_id: "s2", name: "Tamsin" }),
  ]);
  social.requestFriend.mockResolvedValue("sent");
  social.respondFriendRequest.mockResolvedValue(undefined);
  social.cancelFriendRequest.mockResolvedValue(undefined);
  social.searchHeroes.mockResolvedValue([]);
});

describe("friend system", () => {
  it("counts friends, incoming and outgoing requests on the tabs", async () => {
    render(<FriendsPanel heroId="me" />);
    const panel = screen.getByTestId("friends-panel");

    expect(await within(panel).findByText("Friends (2)")).toBeTruthy();
    expect(within(panel).getByRole("tab", { name: /Requests \(2\)/ })).toBeTruthy();
    // Both friends listed, with the online one marked.
    expect(within(panel).getByText("Bronn")).toBeTruthy();
    expect(within(panel).getByText("Lyra")).toBeTruthy();
    expect(within(panel).getAllByText("Online now").length).toBeGreaterThan(0);

    fireEvent.click(within(panel).getByRole("tab", { name: /Requests/ }));
    expect(within(panel).getByText("Sera")).toBeTruthy();
    expect(within(panel).getByText("Tamsin")).toBeTruthy();
    expect(within(panel).getByText("Incoming (1)")).toBeTruthy();
    expect(within(panel).getByText("Waiting for them (1)")).toBeTruthy();

    fireEvent.click(within(panel).getByRole("button", { name: "Withdraw request to Tamsin" }));
    expect(await within(panel).findByText("Request to Tamsin withdrawn.")).toBeTruthy();
    expect(social.cancelFriendRequest).toHaveBeenCalledWith("me", "out1");
  });

  it("searches heroes by name and sends a request from the result", async () => {
    social.listFriendRequests.mockResolvedValue([
      request({ id: "r9", hero_id: "h3", name: "Kaelan" }),
    ]);
    social.searchHeroes.mockResolvedValue([
      hero({ id: "h1", name: "Kael", relation: "none" }),
      hero({ id: "h2", name: "Kaela", relation: "sent" }),
      hero({ id: "h3", name: "Kaelan", relation: "incoming" }),
      hero({ id: "h4", name: "Kaelum", relation: "friend" }),
    ]);
    render(<FriendsPanel heroId="me" />);
    const panel = screen.getByTestId("friends-panel");

    fireEvent.click(within(panel).getByRole("tab", { name: "Find heroes" }));
    fireEvent.change(within(panel).getByTestId("friend-search"), { target: { value: "kae" } });

    expect(await within(panel).findByText("Kael")).toBeTruthy();
    expect(social.searchHeroes).toHaveBeenCalledWith("me", "kae");
    const results = within(panel).getAllByTestId("hero-result");
    expect(within(results[1]).getByText("Requested")).toBeTruthy();
    expect(within(results[3]).getByText("Friends")).toBeTruthy();
    // The incoming hero is answered right from the search result.
    expect(within(panel).getByRole("button", { name: /Accept/ })).toBeTruthy();

    fireEvent.click(within(panel).getByRole("button", { name: /Add friend/ }));
    expect(
      await within(panel).findByText("Friend request sent to Kael. They must accept it first."),
    ).toBeTruthy();
    expect(social.requestFriend).toHaveBeenCalledWith("me", "Kael");
  });

  it("reports an instant friendship when the other hero had already asked", async () => {
    social.requestFriend.mockResolvedValue("friends");
    social.searchHeroes.mockResolvedValue([hero({ id: "h1", name: "Kael", relation: "none" })]);
    render(<FriendsPanel heroId="me" />);
    const panel = screen.getByTestId("friends-panel");

    fireEvent.click(within(panel).getByRole("tab", { name: "Find heroes" }));
    fireEvent.change(within(panel).getByTestId("friend-search"), { target: { value: "kae" } });

    fireEvent.click(await within(panel).findByRole("button", { name: /Add friend/ }));
    expect(await within(panel).findByText("You are now friends with Kael.")).toBeTruthy();
  });

  it("badges new messages from a friend until the conversation is opened", async () => {
    social.listIncomingDirectMessages.mockResolvedValue([
      {
        id: "m1",
        sender_id: "f1",
        sender_name: "Bronn",
        body: "Meet me at the gate",
        created_at: new Date().toISOString(),
        recipient_id: "me",
      },
    ]);
    render(<FriendsPanel heroId="me" />);
    const panel = screen.getByTestId("friends-panel");

    const chatButton = await within(panel).findByRole("button", {
      name: /Message Bronn \(1 new\)/,
    });
    expect(chatButton).toHaveTextContent("1");

    fireEvent.click(chatButton);
    expect(await within(panel).findByText(/No messages yet/)).toBeTruthy();
    expect(within(panel).queryByRole("button", { name: /1 new/ })).toBeNull();
  });

  it("marks a hero online only while the server saw them recently", () => {
    expect(presence(new Date().toISOString()).online).toBe(true);
    const old = new Date(Date.now() - 90 * 60_000).toISOString();
    expect(presence(old)).toEqual({ online: false, label: "Seen 1h ago" });
  });
});

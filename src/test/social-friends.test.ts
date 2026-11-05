import { describe, expect, it, vi, beforeEach } from "vitest";

const rpc = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

const missingFunction = {
  data: null,
  error: {
    code: "PGRST202",
    message: "Could not find the function public.request_friend(_hero, _name) in the schema cache",
  },
};

async function social() {
  vi.resetModules();
  return import("@/game/social");
}

beforeEach(() => {
  rpc.mockReset();
});

describe("friend requests reach the other hero through the server", () => {
  it("stores a pending request with the trimmed hero name", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce({ data: "request-1", error: null });

    expect(await mod.requestFriend("me", " Kael ")).toBe("sent");
    expect(rpc).toHaveBeenCalledWith("request_friend", { _hero: "me", _name: "Kael" });
  });

  it("reports a friendship when the other hero had already asked us", async () => {
    const mod = await social();
    // The RPC accepts the incoming request instead of creating a new one.
    rpc.mockResolvedValueOnce({ data: null, error: null });

    expect(await mod.requestFriend("me", "Kael")).toBe("friends");
  });

  it("surfaces a refused request instead of pretending it was sent", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce({ data: null, error: { message: "You are already friends" } });

    await expect(mod.requestFriend("me", "Kael")).rejects.toThrow("You are already friends");
  });

  it("explains that the database is missing the friend-request SQL", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce(missingFunction);

    await expect(mod.requestFriend("me", "Kael")).rejects.toThrow(mod.FRIEND_REQUESTS_SQL_MISSING);
  });

  it("lists the requests the other hero sent to us", async () => {
    const mod = await social();
    const rows = [
      {
        id: "r1",
        hero_id: "them",
        name: "Kael",
        hero_class: "archer",
        gender: "male",
        level: 9,
        power: 800,
        created_at: new Date().toISOString(),
      },
    ];
    rpc.mockResolvedValueOnce({ data: rows, error: null });

    expect(await mod.listFriendRequests("me")).toEqual(rows);
    expect(rpc).toHaveBeenCalledWith("list_friend_requests", { _hero: "me" });
  });

  it("answers and withdraws requests by id", async () => {
    const mod = await social();
    rpc.mockResolvedValue({ data: null, error: null });

    await mod.respondFriendRequest("me", "r1", true);
    expect(rpc).toHaveBeenCalledWith("respond_friend_request", {
      _hero: "me",
      _request: "r1",
      _accept: true,
    });

    await mod.cancelFriendRequest("me", "r2");
    expect(rpc).toHaveBeenCalledWith("cancel_friend_request", { _hero: "me", _request: "r2" });
  });

  it("reads the friend list from the server so an accepted request shows up", async () => {
    const mod = await social();
    const rows = [{ id: "them", name: "Kael" }];
    rpc.mockResolvedValueOnce({ data: rows, error: null });

    expect(await mod.listFriends("me")).toEqual(rows);
    expect(rpc).toHaveBeenCalledWith("list_friends", { _hero: "me" });
  });

  it("searches heroes with the relation the server already worked out", async () => {
    const mod = await social();
    const rows = [{ id: "them", name: "Kael", relation: "incoming" }];
    rpc.mockResolvedValueOnce({ data: rows, error: null });

    expect(await mod.searchHeroes("me", "kae")).toEqual(rows);
    expect(rpc).toHaveBeenCalledWith("search_heroes", { _hero: "me", _q: "kae" });
    // A one-letter query never reaches the server.
    expect(await mod.searchHeroes("me", "k")).toEqual([]);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});

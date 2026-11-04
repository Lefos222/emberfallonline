import { describe, expect, it, vi, beforeEach } from "vitest";

const rpc = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

const missing = {
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

describe("friend requests on a database without the request SQL", () => {
  it("falls back to add_friend when request_friend is missing", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce(missing).mockResolvedValueOnce({ data: "friendship", error: null });

    expect(await mod.requestFriend("me", " Kael ")).toBe("friendship");
    expect(rpc).toHaveBeenNthCalledWith(1, "request_friend", { _hero: "me", _name: "Kael" });
    expect(rpc).toHaveBeenNthCalledWith(2, "add_friend", { _hero: "me", _name: "Kael" });
    expect(mod.friendRequestsSupported()).toBe(false);
  });

  it("keeps the request when the function is deployed", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce({ data: "request-1", error: null });

    expect(await mod.requestFriend("me", "Kael")).toBe("request-1");
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(mod.friendRequestsSupported()).toBe(true);
  });

  it("does not hide real accept/decline failures behind add_friend", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce({ data: null, error: { message: "You cannot add yourself" } });

    await expect(mod.requestFriend("me", "me")).rejects.toThrow("You cannot add yourself");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("lists no pending requests when list_friend_requests is missing", async () => {
    const mod = await social();
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST202", message: "Could not find the function list_friend_requests" },
    });

    expect(await mod.listFriendRequests("me")).toEqual([]);
    expect(mod.friendRequestsSupported()).toBe(false);
  });
});

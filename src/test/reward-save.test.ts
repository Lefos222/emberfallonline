import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";

const fake = vi.hoisted(() => ({ writes: [] as string[], failed: false, save: {} as unknown }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({
    update: () => ({ eq: async () => { fake.writes.push("save"); return { error: fake.failed ? { message: "offline" } : null }; } }),
    select: (cols: string) => ({
      eq: () => ({
        order: async () => ({ data: [], error: null }),
        maybeSingle: async () => ({ data: { save: fake.save, gender: "male" }, error: null }),
        single: async () => { fake.writes.push("read"); return { data: { save: fake.save }, error: null }; },
      }),
    }),
  }) },
}));

describe("save and online reward ordering", () => {
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); fake.writes = []; fake.failed = false; fake.save = newHero("Saved", "warrior"); });
  afterEach(() => { vi.useRealTimers(); });
  const setup = async () => {
    const store = await import("@/game/store");
    await store.setUser("user", null);
    await store.selectCharacter("hero");
    fake.writes = [];
    return store;
  };
  it("syncs before a claim and adopts the online save without writing it again", async () => {
    const store = await setup();
    const awarded = { ...newHero("Saved", "warrior"), gold: 500, srv: { luckyShots: 6 } };
    store.update((h) => { h.gold = 300; });
    await store.withServerHero(async (id) => { fake.writes.push("claim"); store.adoptServerSave(id, awarded); });
    await vi.advanceTimersByTimeAsync(2000);
    expect(fake.writes).toEqual(["save", "claim"]);
    expect(store.getState().hero?.gold).toBe(500);
  });
  it("never claims when synchronizing the current save fails", async () => {
    const store = await setup(); fake.failed = true;
    const claim = vi.fn();
    await expect(store.withServerHero(claim)).rejects.toThrow("synced");
    expect(claim).not.toHaveBeenCalled();
    expect(fake.writes).toEqual(["save"]);
  });
  it("blocks duplicate requests and character switching while a claim is pending", async () => {
    const store = await setup();
    let release: (() => void) | undefined;
    const pending = store.withServerHero(() => new Promise<void>((resolve) => { release = resolve; }));
    await vi.advanceTimersByTimeAsync(0);
    await expect(store.withServerHero(async () => {})).rejects.toThrow("pending");
    expect(await store.selectCharacter("another")).toMatch(/Wait/);
    expect(await store.leaveCharacter()).toBe(false);
    release?.(); await pending;
  });
  it("reads a potentially committed reward before any retry can overwrite it", async () => {
    const store = await setup();
    await expect(store.withServerHero(async () => { fake.save = { ...newHero("Saved", "warrior"), gold: 900 }; throw new Error("connection lost"); })).rejects.toThrow("connection lost");
    expect(fake.writes).toEqual(["save", "read"]);
    expect(store.getState().hero?.gold).toBe(900);
  });
});
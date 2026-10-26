import { beforeEach, describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";

const fake = vi.hoisted(() => ({ rpc: vi.fn(), adopt: vi.fn(), serial: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: fake.rpc } }));
vi.mock("@/game/store", () => ({
  getState: () => ({ heroId: "character-1", hero: fake.hero }),
  withServerHero: async (action: (id: string) => Promise<unknown>) => { fake.serial(); return action("character-1"); },
  adoptServerSave: fake.adopt,
}));
import {
  blockReasonText, harvestNode, loadAttackTarget, loadWorld, openEncounter, readWorld, reportAssault, settleEncounter,
  type AttackTarget, type Encounter,
} from "@/game/worldcastles";

const save = () => ({ ...newHero("Hero", "warrior"), srv: { luckyShots: 0, scrolls: {}, buffs: {}, cosmetics: [], fame: 12 } });

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("world PvE keeps the server in charge of every reward", () => {
  it("opens an encounter with the server's own level and price, and keeps the request until it is settled", async () => {
    fake.rpc.mockResolvedValue({ data: { fame: 12, encounter: { req: "req-1", area: "wilds", monster: "Goblin Scout", kind: "normal", level: 7, xp: 90, gold: 40, fame: 1, encountersPerDay: 40, encountersLeft: 39, replay: false } }, error: null });
    const encounter = await openEncounter("character-1", "wilds", "Goblin Scout", "normal");
    expect(fake.rpc).toHaveBeenCalledOnce();
    const [fn, args] = fake.rpc.mock.calls[0]!;
    expect(fn).toBe("world_encounter");
    expect(args).toMatchObject({ _hero: "character-1", _area: "wilds", _monster: "Goblin Scout", _kind: "normal" });
    expect(typeof args._req).toBe("string");
    // The id survives an uncertain answer, so a retry cannot spend a second encounter.
    expect(localStorage.getItem("ef-pending:character-1:world-fight:wilds:Goblin Scout")).toBe(args._req);
    expect(encounter.level).toBe(7);
    expect(encounter.xp).toBe(90);
  });

  it("never trusts a kind the world could not have produced", async () => {
    fake.rpc.mockResolvedValue({ data: { encounter: { req: "r", area: "wilds", monster: "Goblin Scout", kind: "normal", level: 1, xp: 1, gold: 1, fame: 1, encountersPerDay: 40, encountersLeft: 39, replay: false } }, error: null });
    await openEncounter("character-1", "wilds", "Goblin Scout", "legendary" as never);
    expect(fake.rpc.mock.calls[0]![1]).toMatchObject({ _kind: "normal" });
  });

  it("adopts the save the server settled and adds no reward of its own", async () => {
    const settled = save();
    fake.rpc.mockResolvedValue({ data: { save: settled, encounter: { won: true, xp: 90, gold: 40, fame: 1, fameTotal: 13, loot: { mats: { ore: 2 } }, level: 7, monster: "Goblin Scout", kind: "normal", encountersPerDay: 40, encountersLeft: 38, replay: false } }, error: null });
    const encounter: Encounter = { req: "req-1", area: "wilds", monster: "Goblin Scout", kind: "normal", level: 7, xp: 90, gold: 40, fame: 1, encountersPerDay: 40, encountersLeft: 39, replay: false };
    const result = await settleEncounter(encounter, true);
    expect(fake.rpc).toHaveBeenCalledWith("world_settle", { _hero: "character-1", _req: "req-1", _won: true });
    expect(fake.adopt).toHaveBeenCalledWith("character-1", settled);
    expect(fake.serial).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ won: true, xp: 90, gold: 40, fame: 1, fameTotal: 13, encountersLeft: 38 });
    expect(result.loot.mats).toEqual({ ore: 2 });
    expect(localStorage.getItem("ef-pending:character-1:world-fight:wilds:Goblin Scout")).toBeNull();
  });

  it("reports a lost fight on the server's terms, and refuses an invented payload", async () => {
    fake.rpc.mockResolvedValue({ data: { save: save(), encounter: { won: false, xp: 0, gold: 0, fame: 0, fameTotal: 12, loot: {}, level: 7, monster: "Goblin Scout", kind: "normal", encountersPerDay: 40, encountersLeft: 37, replay: false } }, error: null });
    const encounter: Encounter = { req: "req-2", area: "wilds", monster: "Goblin Scout", kind: "normal", level: 7, xp: 90, gold: 40, fame: 1, encountersPerDay: 40, encountersLeft: 39, replay: false };
    expect((await settleEncounter(encounter, false)).won).toBe(false);

    fake.rpc.mockResolvedValue({ data: { encounter: {} }, error: null });
    await expect(settleEncounter(encounter, true)).rejects.toThrow("outcome could not be read");
  });

  it("harvests a node through the server and adopts its save", async () => {
    const harvested = save();
    fake.rpc.mockResolvedValue({ data: { save: harvested, harvest: { node: "ore", area: "wilds", mats: { ore: 2 }, harvestsPerDay: 25, harvestsLeft: 24, replay: false } }, error: null });
    const result = await harvestNode("wilds", "ore");
    const [fn, args] = fake.rpc.mock.calls[0]!;
    expect(fn).toBe("world_harvest");
    expect(args).toMatchObject({ _hero: "character-1", _area: "wilds", _node: "ore" });
    expect(fake.adopt).toHaveBeenCalledWith("character-1", harvested);
    expect(result.mats).toEqual({ ore: 2 });
    expect(result.harvestsLeft).toBe(24);
  });
});

describe("castle assaults read the server's rules", () => {
  it("reads the defender, the guard and the reason an assault is refused", async () => {
    fake.rpc.mockResolvedValue({ data: {
      hero_id: "target-1", name: "Rival", cls: "mage", gender: "female", level: 20, power: 900, coffers: 4000,
      stats: { hp: 900, atk: 90, def: 40, crit: 10, dodge: 6, critDmg: 200, pen: 2, acc: 3 },
      guard: { name: "Rival's Castle Guard", hp: 630, atk: 63, def: 28, crit: 10, dodge: 6, critDmg: 200, pen: 2, acc: 3, level: 20 },
      fameReward: 4, levelGap: 0, maxLevelGap: 10, shieldMinutes: 30, shieldUntil: null,
      assaultsPerDay: 5, assaultsLeft: 4, blocked: null,
    }, error: null });
    const target = await loadAttackTarget("character-1", "target-1");
    expect(target.guard.hp).toBe(630);
    expect(target.fameReward).toBe(4);
    expect(target.blocked).toBe("");
    expect(blockReasonText(target)).toBe("");
  });

  it("explains each protection rule the server can answer with", () => {
    const base = { name: "Rival", levelGap: 12, maxLevelGap: 10, shieldMinutes: 30 } as AttackTarget;
    expect(blockReasonText({ ...base, blocked: "level-gap" })).toMatch(/12 levels below/);
    expect(blockReasonText({ ...base, blocked: "shield" })).toMatch(/shielded for 30 minutes/);
    expect(blockReasonText({ ...base, blocked: "protected-lord" })).toMatch(/sheltered/);
    expect(blockReasonText({ ...base, blocked: "attacker-too-weak" })).toMatch(/open at level 3/);
    expect(blockReasonText({ ...base, blocked: "no-assaults" })).toMatch(/five times today/);
    expect(blockReasonText({ ...base, blocked: "already-assaulted" })).toMatch(/already assaulted/);
    expect(blockReasonText({ ...base, blocked: "own-account" })).toMatch(/own account/);
  });

  it("records an assault once and adopts the gold and fame the server moved", async () => {
    const after = save();
    fake.rpc.mockResolvedValue({ data: { save: after, attack: { won: true, gold: 400, fame: 4, fameTotal: 16, defender: "Rival", assaultsPerDay: 5, assaultsLeft: 3, replay: false } }, error: null });
    const result = await reportAssault("target-1", true);
    const [fn, args] = fake.rpc.mock.calls[0]!;
    expect(fn).toBe("attack_castle");
    expect(args).toMatchObject({ _hero: "character-1", _target: "target-1", _won: true });
    expect(fake.adopt).toHaveBeenCalledWith("character-1", after);
    expect(result).toMatchObject({ won: true, gold: 400, fame: 4, fameTotal: 16, assaultsLeft: 3 });
    expect(localStorage.getItem("ef-pending:character-1:castle-assault:target-1")).toBeNull();
  });
});

describe("the world payload", () => {
  it("says plainly when the world's server functions are not live on the backend yet", async () => {
    fake.rpc.mockResolvedValue({ data: null, error: { message: "Could not find the function public.world_map(_hero) in the schema cache" } });
    await expect(loadWorld("character-1")).rejects.toThrow("not live on this backend yet");
    fake.rpc.mockResolvedValue({ data: null, error: { message: "permission denied for function world_map" } });
    await expect(loadWorld("character-1")).rejects.toThrow("permission denied");
  });

  it("refuses a payload without the caller's own castle instead of showing an empty world", () => {
    expect(() => readWorld({ castles: [], resetAt: "2026-01-01T00:00:00Z" })).toThrow();
    expect(() => readWorld({ mine: { hero_id: "a", name: "A", cls: "mage", level: 3, x: 10, y: 10 }, castles: [] })).toThrow();
  });

  it("reads fame and the day's budgets", () => {
    const state = readWorld({
      day: "2026-01-01", resetAt: "2026-01-02T00:00:00Z", movesPerDay: 3, movesUsed: 1, movesLeft: 2,
      assaultsPerDay: 5, assaultsLeft: 5, fame: 7, encountersPerDay: 40, encountersLeft: 30,
      harvestsPerDay: 25, harvestsLeft: 20,
      mine: { hero_id: "a", name: "A", cls: "mage", gender: "female", level: 3, power: 40, x: 10, y: 10 },
      castles: [{ hero_id: "b", name: "B", cls: "warrior", gender: "male", level: 9, power: 90, x: 400, y: 400 }],
    });
    expect(state).toMatchObject({ fame: 7, movesLeft: 2, encountersLeft: 30, harvestsLeft: 20 });
    expect(state.castles.map((c) => c.hero_id)).toEqual(["b"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  FLOOR_PAUSE_MS,
  SPIRE_FLOORS,
  SPIRE_PARTY_MAX,
  SPIRE_RUNS_PER_DAY,
  cleanPartyCode,
  newBattle,
  parseReward,
  parseSpireState,
  partyCode,
  skillReady,
  spawnFloor,
  tick,
  type SpireBattle,
  type SpireMember,
} from "@/game/spire-party";

const member = (over: Partial<SpireMember> = {}): SpireMember => ({
  id: "h1", name: "Ann", cls: "warrior", gender: "female", level: 1,
  hp: 400, atk: 1e9, def: 0, crit: 0, dodge: 0, ...over,
});

/** Runs ticks until the fight reports something worth asserting, or the guard runs out. */
function run(battle: SpireBattle, party: SpireMember[], casts: { hero: string; skill: "strike" | "sweep" | "mend" }[] = [], ticks = 40) {
  let b = battle;
  let cleared: number | null = null;
  for (let i = 0; i < ticks && cleared === null && !b.over; i += 1) {
    const r = tick(b, party, casts);
    b = r.battle;
    cleared = r.cleared;
  }
  return { battle: b, cleared };
}

describe("the Spire's floors", () => {
  it("puts a boss on every tenth floor and nothing else", () => {
    for (const floor of [1, 9, 10, 11, 20, 239, 240]) {
      const foes = spawnFloor(floor, 20, 1);
      expect(foes.every((f) => f.boss)).toBe(floor % 10 === 0);
      if (floor % 10 === 0) expect(foes).toHaveLength(1);
    }
  });

  it("makes every floor harder than the one below it", () => {
    const shallow = spawnFloor(2, 20, 1);
    const deep = spawnFloor(80, 20, 1);
    const total = (foes: { hp: number }[]) => foes.reduce((a, f) => a + f.hp, 0);
    expect(total(deep)).toBeGreaterThan(total(shallow));
  });

  it("scales the floor with the party and starts the fight where it is asked to", () => {
    const solo = spawnFloor(12, 30, 1);
    const party = spawnFloor(12, 30, SPIRE_PARTY_MAX);
    expect(party[0].hp).toBeGreaterThan(solo[0].hp);
    expect(newBattle([member()], 37).floor).toBe(37);
    expect(newBattle([member()]).floor).toBe(1);
  });
});

describe("the shared party fight", () => {
  it("clears the floor, pays a breather and moves on to the next one", () => {
    const party = [member()];
    const first = newBattle(party);
    const cleared = run(first, party);
    expect(cleared.cleared).toBe(1);
    expect(cleared.battle.floor).toBe(2);
    expect(cleared.battle.pause).toBe(FLOOR_PAUSE_MS);
    expect(cleared.battle.over).toBe(false);
    expect(cleared.battle.log.join(" ")).toContain("+1 Spire Chest each");

    // The next floor's enemies arrive right after the pause.
    let b = cleared.battle;
    for (let i = 0; i < FLOOR_PAUSE_MS / 500; i += 1) b = tick(b, party, []).battle;
    expect(b.pause).toBe(0);
    expect(b.foes.every((f) => f.hp > 0)).toBe(true);
  });

  it("gets fallen heroes back up at a quarter health between floors", () => {
    const party = [member({ id: "h1" }), member({ id: "h2", name: "Bo" })];
    const battle: SpireBattle = {
      floor: 3, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [
        { id: "h1", hp: 0, max: 400, cd: {}, swing: 600 },
        { id: "h2", hp: 400, max: 400, cd: {}, swing: 0 },
      ],
      foes: [{ uid: "f", name: "Goblin Brute", img: "", hp: 1, max: 1, atk: 1, def: 0, boss: false, swing: 9999 }],
    };
    const r = tick(battle, party, []);
    expect(r.cleared).toBe(3);
    expect(r.battle.heroes[0].hp).toBe(100);
  });

  it("stops the run when the whole party has fallen", () => {
    const party = [member({ atk: 1 })];
    const battle: SpireBattle = {
      floor: 4, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [{ id: "h1", hp: 1, max: 400, cd: {}, swing: 9999 }],
      foes: [{ uid: "f", name: "Crimson Fiend", img: "", hp: 999, max: 999, atk: 1e6, def: 0, boss: false, swing: 0 }],
    };
    const r = tick(battle, party, [], () => 0);
    expect(r.battle.over).toBe(true);
    expect(r.battle.outcome).toBe("fallen");
    expect(r.cleared).toBeNull();
  });

  it("crowns the climb at floor 240", () => {
    const party = [member()];
    const battle: SpireBattle = {
      floor: SPIRE_FLOORS, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [{ id: "h1", hp: 400, max: 400, cd: {}, swing: 0 }],
      foes: [{ uid: "f", name: "Blood-Moon Wyrm", img: "", hp: 1, max: 1, atk: 1, def: 0, boss: true, swing: 9999 }],
    };
    const r = tick(battle, party, []);
    expect(r.cleared).toBe(SPIRE_FLOORS);
    expect(r.battle.over).toBe(true);
    expect(r.battle.outcome).toBe("summit");
  });

  it("keeps every class skill on its own cooldown, so it cannot be spammed", () => {
    const party = [member({ crit: 0 })];
    const battle: SpireBattle = {
      floor: 5, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [{ id: "h1", hp: 400, max: 400, cd: {}, swing: 99999 }],
      foes: [{ uid: "f", name: "Bone Reaver", img: "", hp: 999999, max: 999999, atk: 1, def: 0, boss: false, swing: 99999 }],
    };
    const once = tick(battle, party, [{ hero: "h1", skill: "strike" }, { hero: "h1", skill: "strike" }], () => 0.5);
    expect(once.battle.fx.filter((f) => f.skill === "strike")).toHaveLength(1);
    expect(once.battle.heroes[0].cd["strike"]).toBeGreaterThan(0);
    expect(skillReady(once.battle.heroes[0], "strike")).toBe(false);
    expect(skillReady(once.battle.heroes[0], "sweep")).toBe(true);
  });

  it("ignores casts from a hero who is not in the party or is already down", () => {
    const party = [member()];
    const battle: SpireBattle = {
      floor: 6, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [{ id: "h1", hp: 0, max: 400, cd: {}, swing: 99999 }, { id: "h2", hp: 400, max: 400, cd: {}, swing: 99999 }],
      foes: [{ uid: "f", name: "Crimson Fiend", img: "", hp: 999999, max: 999999, atk: 1, def: 0, boss: false, swing: 99999 }],
    };
    const r = tick(battle, [...party, member({ id: "h2" })], [
      { hero: "h1", skill: "strike" },
      { hero: "ghost", skill: "strike" },
    ], () => 0.5);
    expect(r.battle.fx).toHaveLength(0);
  });

  it("heals the mage's whole party and the others only themselves", () => {
    const party = [member({ id: "m", cls: "mage", atk: 1 }), member({ id: "w", cls: "warrior", atk: 1 })];
    const battle: SpireBattle = {
      floor: 7, t: 0, pause: 0, over: false, fx: [], log: [],
      heroes: [{ id: "m", hp: 100, max: 400, cd: {}, swing: 99999 }, { id: "w", hp: 100, max: 400, cd: {}, swing: 99999 }],
      foes: [{ uid: "f", name: "Crimson Fiend", img: "", hp: 999999, max: 999999, atk: 0, def: 0, boss: false, swing: 99999 }],
    };
    const r = tick(battle, party, [{ hero: "m", skill: "mend" }]);
    expect(r.battle.fx.filter((f) => f.kind === "heal").map((f) => f.tgt)).toEqual(["m", "w"]);
  });
});

describe("the Spire's server ledger", () => {
  it("reads the run count, the best floor and the chests the server reports", () => {
    const st = parseSpireState({ floor: 0, best: 34, runs_left: 2, chests: 5, active: false });
    expect(st).toEqual({ floor: 0, best: 34, runs_left: 2, chests: 5, active: false });
  });

  it("never invents runs or chests an older server did not report", () => {
    const st = parseSpireState({});
    expect(st.runs_left).toBe(0);
    expect(st.chests).toBe(0);
    expect(parseSpireState({ runs_left: 99 }).runs_left).toBe(SPIRE_RUNS_PER_DAY);
    // An older server answers without `active`; a live floor still means a run is open.
    expect(parseSpireState({ floor: 8 }).active).toBe(true);
  });

  it("reads a chest's reward from the server's own answer", () => {
    expect(parseReward({ reward: { gold: 900, mats: { ore: 3, essence: 0 } } })).toEqual({ gold: 900, mats: { ore: 3 } });
    expect(parseReward({})).toEqual({ gold: 0, mats: {} });
  });
});

describe("party codes", () => {
  it("hands out five characters a friend can read out loud", () => {
    const code = partyCode(() => 0.1);
    expect(code).toHaveLength(5);
    expect(code).toMatch(/^[A-Z0-9]{5}$/);
    expect(cleanPartyCode("  ab3de ")).toBe("AB3DE");
    expect(cleanPartyCode("ab-3d-e9z")).toBe("AB3DE");
  });
});

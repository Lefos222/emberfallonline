import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { REGIONS } from "@/game/world";
import {
  AREAS, AGGRO, AREA_IDS, MOVE, REACH, SCENE, areaAt, blockedAt, cameraFor, decoFor, kindFor, monstersFor,
  nearest, newActor, nodesFor, poisFor, stepActor, stepMonster, worldContent,
} from "@/game/worldscene";
import {
  CASTLE_ATTACK_MIN_LEVEL, CASTLE_GUARD_SHARE, CASTLE_LEVEL_GAP, CASTLE_SHIELD_MINUTES, NEW_LORD_LEVEL,
  WORLD_ENCOUNTERS_PER_DAY, WORLD_HARVESTS_PER_DAY, WORLD_MOVES_PER_DAY, WORLD_UNITS, spotClear,
} from "@/game/worldcastles";
import { newHero } from "@/game/data";

const sql = (file: string) => readFileSync(resolve(process.cwd(), "drizzle/migrations", file), "utf8");
const numberAfter = (text: string, marker: string) => {
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`missing ${marker}`);
  const found = /(-?\d+(?:\.\d+)?)/.exec(text.slice(at));
  if (!found) throw new Error(`no number after ${marker}`);
  return Number(found[1]);
};

describe("the world the World Tree opens", () => {
  it("shows exactly the five areas of the map, with the level bands the map labels promise", () => {
    expect(AREAS.map((a) => a.id)).toEqual([...AREA_IDS]);
    expect(AREAS.map((a) => a.openLevel)).toEqual(REGIONS.map((r) => r.level));
    for (const a of AREAS) expect(a.topLevel).toBe(a.openLevel + 9);
  });

  it("keeps every area inside the world grid the server stores castles in", () => {
    for (const a of AREAS) {
      expect(a.cx - a.rx).toBeGreaterThan(-40);
      expect(a.cx + a.rx).toBeLessThan(WORLD_UNITS + 40);
      expect(a.cy - a.ry).toBeGreaterThan(-40);
      expect(a.cy + a.ry).toBeLessThan(WORLD_UNITS + 40);
    }
  });

  it("places a point in the area it stands in, and the nearest one outside", () => {
    for (const a of AREAS) expect(areaAt(a.cx, a.cy).id).toBe(a.id);
    expect(areaAt(-400, -400)).toBeTruthy();
  });

  it("builds the same terrain, nodes and monsters every time — the world never reshuffles", () => {
    const area = AREAS[1]!;
    expect(JSON.stringify(decoFor(area))).toBe(JSON.stringify(decoFor(area)));
    expect(JSON.stringify(nodesFor(area))).toBe(JSON.stringify(nodesFor(area)));
    expect(JSON.stringify(monstersFor(area, 12))).toBe(JSON.stringify(monstersFor(area, 12)));
    expect(nodesFor(area).length).toBe(14);
    expect(monstersFor(area, 12).length).toBe(18);
    expect(poisFor(area).map((p) => p.kind)).toContain("lair");
  });

  it("distributes monsters by area and difficulty: rare beasts and bosses need the deeper world", () => {
    const kindsAt = (area: (typeof AREAS)[number], heroLevel: number) =>
      new Set(Array.from({ length: 200 }, (_, i) => kindFor(area, i / 200, heroLevel)));
    expect(kindsAt(AREAS[0]!, 60)).toEqual(new Set(["normal", "elite"]));
    expect(kindsAt(AREAS[1]!, 20)).toEqual(new Set(["normal", "elite", "rare"]));
    // An area boss only answers a lord who has gone all the way through that area.
    expect(kindsAt(AREAS[3]!, AREAS[3]!.openLevel)).toEqual(new Set(["normal", "elite", "rare"]));
    expect(kindsAt(AREAS[3]!, AREAS[3]!.openLevel + 9)).toEqual(new Set(["normal", "elite", "rare", "boss"]));
    // A lord below the area's own level band only ever meets ordinary beasts there.
    expect(kindsAt(AREAS[3]!, 1)).toEqual(new Set(["normal"]));
  });

  it("gates nothing by accident: a boss only stands at its own lair", () => {
    const content = worldContent(45);
    for (const { area, monsters, pois } of content) {
      for (const boss of monsters.filter((m) => m.kind === "boss")) {
        expect(Math.hypot(boss.x - pois[0]!.x, boss.y - pois[0]!.y)).toBeLessThan(1);
        expect(area.topLevel + 6).toBeGreaterThanOrEqual(boss.level);
      }
    }
  });
});

describe("walking the world", () => {
  it("walks, runs and stops, and never walks through a wall", () => {
    const start = newActor(500, 500);
    const walked = stepActor(start, { dx: 1, dy: 0, run: false }, 0.5, () => false);
    expect(walked.x - start.x).toBeCloseTo(MOVE.walk * 0.5, 5);
    expect(walked.anim).toBe("walk");
    const ran = stepActor(start, { dx: 1, dy: 0, run: true }, 0.5, () => false);
    expect(ran.x - start.x).toBeCloseTo(MOVE.run * 0.5, 5);
    expect(ran.anim).toBe("run");
    const stopped = stepActor(start, { dx: 0, dy: 0, run: false }, 0.5, () => false);
    expect(stopped.x).toBe(start.x);
    expect(stopped.anim).toBe("idle");
    const walled = stepActor(start, { dx: 1, dy: 1, run: true }, 0.5, () => true);
    expect(walled.x).toBe(start.x);
    expect(walled.y).toBe(start.y);
  });

  it("moves diagonally at the same speed as straight", () => {
    const start = newActor(500, 500);
    const straight = stepActor(start, { dx: 1, dy: 0, run: false }, 0.25, () => false);
    const diagonal = stepActor(start, { dx: 1, dy: 1, run: false }, 0.25, () => false);
    expect(Math.hypot(diagonal.x - start.x, diagonal.y - start.y)).toBeCloseTo(straight.x - start.x, 5);
  });

  it("holds an attack or a cast for its own time and then returns to walking", () => {
    const start = newActor(500, 500);
    const swinging = stepActor({ ...start, anim: "attack", animT: 0 }, { dx: 0, dy: 0, run: false }, 0.1, () => false);
    expect(swinging.anim).toBe("attack");
    const done = stepActor({ ...start, anim: "attack", animT: 600 }, { dx: 0, dy: 0, run: false }, 0.1, () => false);
    expect(done.anim).toBe("idle");
  });

  it("stands still while acting, but a walk still interrupts it", () => {
    const acting = stepActor({ ...newActor(500, 500), anim: "cast", animT: 0 }, { dx: 1, dy: 0, run: true }, 0.5, () => false);
    expect(acting.x).toBe(500);
  });

  it("keeps the camera on the character and inside the world's edge", () => {
    const view = { w: 900, h: 600 };
    let cam = { x: 500, y: 500 };
    for (let i = 0; i < 200; i++) cam = cameraFor(cam, { x: -50, y: -50 }, view);
    expect(cam.x).toBeGreaterThan(0);
    expect(cam.y).toBeGreaterThan(0);
    let far = { x: 500, y: 500 };
    for (let i = 0; i < 200; i++) far = cameraFor(far, { x: 5000, y: 5000 }, view);
    expect(far.x).toBeLessThan(WORLD_UNITS);
    expect(far.y).toBeLessThan(WORLD_UNITS);
  });

  it("treats solid scenery and the world's rim as walls", () => {
    expect(blockedAt(2, 2)).toBe(true);
    expect(blockedAt(WORLD_UNITS - 2, WORLD_UNITS - 2)).toBe(true);
    const tree = decoFor(AREAS[0]!).find((d) => d.solid)!;
    expect(blockedAt(tree.x, tree.y)).toBe(true);
    expect(blockedAt(500, 500, [{ x: 500, y: 500, r: 20 }])).toBe(true);
  });

  it("finds only what is really within reach, and chases only what is close", () => {
    const me = { x: 100, y: 100 };
    expect(nearest([{ x: 100, y: 100 + REACH - 2 }], me)).toBeTruthy();
    expect(nearest([{ x: 100, y: 100 + REACH + 20 }], me)).toBeNull();
    const monster = { ...monstersFor(AREAS[0]!, 5)[0]!, x: me.x + AGGRO - 4, y: me.y, hx: 900, hy: 900, wait: 0 };
    const chased = stepMonster(monster, me, 0.5, () => false);
    expect(Math.hypot(chased.x - me.x, chased.y - me.y)).toBeLessThan(Math.hypot(monster.x - me.x, monster.y - me.y));
    const calm = { ...monster, x: me.x + AGGRO + 40, y: me.y + AGGRO + 40, tx: 0, ty: 0 };
    const idle = stepMonster(calm, me, 0.5, () => true);
    expect(idle.x).toBe(calm.x);
    expect(idle.y).toBe(calm.y);
  });

  it("sizes one world unit so a walk across the map is a real journey", () => {
    expect(SCENE.px * WORLD_UNITS).toBeGreaterThan(1000);
    expect(SCENE.tilt).toBeGreaterThan(0);
    expect(SCENE.tilt).toBeLessThan(1);
  });
});

describe("the world keeps the server's own numbers", () => {
  const pve = sql("0013_world_pve.sql");
  const protection = sql("0014_castle_protection.sql");

  it("budgets the same encounters and harvests as the server enforces", () => {
    expect(numberAfter(pve, "_world_encounter_budget")).toBe(WORLD_ENCOUNTERS_PER_DAY);
    expect(numberAfter(pve, "_world_harvest_budget")).toBe(WORLD_HARVESTS_PER_DAY);
  });

  it("opens each area at the level the world shows", () => {
    for (const area of AREAS) {
      const marker = `WHEN '${area.id}' THEN `;
      expect(numberAfter(pve, marker)).toBe(area.openLevel);
      expect(area.topLevel).toBe(numberAfter(pve, marker) + 9);
    }
  });

  it("protects weaker lords with exactly the rules the client explains", () => {
    expect(numberAfter(protection, "_castle_level_gap")).toBe(CASTLE_LEVEL_GAP);
    expect(numberAfter(protection, "_castle_shield_minutes")).toBe(CASTLE_SHIELD_MINUTES);
    expect(numberAfter(protection, "_castle_new_lord_level")).toBe(NEW_LORD_LEVEL);
    expect(numberAfter(protection, "_castle_attacker_min_level")).toBe(CASTLE_ATTACK_MIN_LEVEL);
    expect(numberAfter(protection, "_castle_guard_share")).toBe(CASTLE_GUARD_SHARE);
    expect(WORLD_MOVES_PER_DAY).toBe(numberAfter(sql("0011_world_castles.sql"), "movesPerDay"));
  });

  it("refuses a spot the server would refuse", () => {
    const hero = { ...newHero("Hero", "warrior"), hero_id: "mine", x: 500, y: 500 };
    const state = { castles: [{ hero_id: "other", x: 520, y: 500 }], mine: hero } as never;
    expect(spotClear(state, 520, 500)).toBe(false);
    expect(spotClear(state, 700, 700)).toBe(true);
    expect(spotClear(state, 5, 5)).toBe(false);
  });
});

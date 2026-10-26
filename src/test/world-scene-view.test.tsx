import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorldScene } from "@/game/WorldScene";
import { newHero } from "@/game/data";
import { AREAS, areaAt, monstersFor, nodesFor, spawnPoint } from "@/game/worldscene";
import type { WorldCastle } from "@/game/worldcastles";

/**
 * The world scene is a canvas, so there are no pixels in jsdom: the 2D context is
 * replaced by a recorder and the frame clock is driven by hand. That still proves
 * the whole loop — it draws, the camera follows the character, walking and running
 * change what the character is doing, and what stands within reach can be acted on.
 */

declare global { // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const drawn: string[] = [];
const context = new Proxy({} as CanvasRenderingContext2D, {
  get(_t, prop) {
    if (prop === "canvas") return undefined;
    return (...args: unknown[]) => { drawn.push(`${String(prop)}:${args.length}`); };
  },
  set() { return true; },
});

let frames: FrameRequestCallback[] = [];
let root: ReturnType<typeof createRoot> | null = null;
let host: HTMLDivElement | null = null;

const step = (startMs: number, count = 1, gap = 50) => {
  for (let i = 0; i < count; i++) {
    const due = frames;
    frames = [];
    const at = startMs + i * gap;
    act(() => { for (const cb of due) cb(at); });
  }
};

const wrapEl = () => host!.firstElementChild as HTMLElement;
const state = () => JSON.parse(wrapEl().dataset["world"] ?? "{}") as {
  area: string; areaName: string; x: number; y: number; anim: string; monsters: number; prompt: string;
  near: { kind: string; id: string } | null;
};

const mine: WorldCastle = { hero_id: "mine-1", name: "Aldric", cls: "warrior", gender: "male", level: 12, power: 900, x: 500, y: 500 };

function renderScene(over: Partial<Parameters<typeof WorldScene>[0]> = {}) {
  const props = {
    hero: { ...newHero("Aldric", "warrior"), level: 12 },
    gender: "male" as const,
    mine,
    castles: [mine],
    selected: mine.hero_id,
    moving: false,
    busy: false,
    canPlace: () => true,
    onPlace: vi.fn(),
    onSelectCastle: vi.fn(),
    onFight: vi.fn(),
    onHarvest: vi.fn(),
    ...over,
  };
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => { root!.render(<WorldScene {...props} />); });
  step(1000, 3);
  const canvas = host.querySelector("canvas")!;
  const button = (re: RegExp) => [...host!.querySelectorAll("button")].find((b) => re.test(b.textContent ?? ""))!;
  return { props, canvas, button, host: wrapEl() };
}

const key = (type: "keydown" | "keyup", k: string) => act(() => { window.dispatchEvent(new KeyboardEvent(type, { key: k })); });

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  drawn.length = 0;
  frames = [];
  // Fake the clocks first: sinon's fake timers install their own requestAnimationFrame,
  // and the frame queue below must be the one the component drives.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { frames.push(cb); return frames.length; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { configurable: true, value: () => context });
});

afterEach(() => {
  act(() => { root?.unmount(); });
  host?.remove();
  root = null; host = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the world scene", () => {
  it("draws the world and reports where the character stands", () => {
    renderScene();
    expect(drawn.some((c) => c.startsWith("ellipse"))).toBe(true);
    expect(drawn.some((c) => c.startsWith("fillText"))).toBe(true);
    const at = state();
    const start = spawnPoint(mine);
    expect(at.x).toBe(start.x);
    expect(at.y).toBe(Math.round(start.y));
    expect(AREAS.map((a) => a.id)).toContain(at.area);
    expect(at.monsters).toBeGreaterThan(0);
    expect(at.anim).toBe("idle");
  });

  it("walks and runs where the keys say, and stops when they are released", () => {
    const { host: el } = renderScene();
    key("keydown", "d");
    step(1100, 20);
    expect(state().x).toBeGreaterThan(500);
    expect(state().anim).toBe("walk");
    key("keydown", "Shift");
    step(1200, 10);
    expect(state().anim).toBe("run");
    key("keyup", "d"); key("keyup", "Shift");
    step(1300, 5);
    expect(state().anim).toBe("idle");
    expect(el.dataset["world"]).toBeTruthy();
  });

  it("holds the character inside the world when it walks at the rim", () => {
    renderScene({ mine: { ...mine, x: 20, y: 20 } });
    key("keydown", "a"); key("keydown", "w");
    step(1100, 40);
    expect(state().x).toBeGreaterThanOrEqual(12);
    expect(state().y).toBeGreaterThanOrEqual(12);
    key("keyup", "a"); key("keyup", "w");
  });

  it("offers to harvest a node the character is standing next to, and does it", () => {
    const node = nodesFor(AREAS[0]!)[0]!;
    const { props, button } = renderScene({ mine: { ...mine, x: node.x, y: node.y - 20 } });
    expect(state().near?.kind).toBe("node");
    expect(state().prompt).toContain("Harvest");
    fireEventClick(button(/Harvest/));
    act(() => { vi.advanceTimersByTime(400); });
    expect(props.onHarvest).toHaveBeenCalledOnce();
    expect(props.onHarvest.mock.calls[0]![0].id).toBe(node.id);
  });

  it("offers to fight a monster that really stands in the world, and starts the fight", () => {
    const area = AREAS[3]!;
    const level = 45;
    const beast = monstersFor(area, level).find((m) => clearOf(m.x, m.y, nodesFor(area), 35))!;
    const { props, button } = renderScene({ hero: { ...newHero("Aldric", "warrior"), level }, mine: { ...mine, x: beast.x, y: beast.y - 20 } });
    expect(state().near?.kind).toBe("monster");
    expect(state().prompt).toContain("Fight");
    fireEventClick(button(/Fight/));
    act(() => { vi.advanceTimersByTime(500); });
    expect(props.onFight).toHaveBeenCalledOnce();
    const monster = props.onFight.mock.calls[0]![0];
    expect(monster.id).toBe(state().near?.id);
    expect(monster.level).toBeGreaterThanOrEqual(area.openLevel);
    expect(["normal", "elite", "rare", "boss"]).toContain(monster.kind);
  });

  it("touches a castle the character walks up to", () => {
    const ground = quietSpot(12);
    expect(areaAt(ground.x, ground.y).id).toBe(AREAS[0]!.id);
    const other = { ...mine, hero_id: "other-1", name: "Cerys", x: ground.x, y: ground.y + 20 };
    const { props, canvas, button } = renderScene({ mine: { ...mine, x: ground.x, y: ground.y }, castles: [{ ...mine, x: ground.x, y: ground.y }, other] });
    expect(state().near?.kind).toBe("castle");
    expect(state().prompt).toContain("Inspect castle");
    // The action button defers castle inspection to the side panel, the tap inspects it.
    fireEventClick(button(/Walk to a target/));
    expect(props.onSelectCastle).not.toHaveBeenCalled();
    fireEventDown(canvas, 400, 260);
    expect(props.onSelectCastle).toHaveBeenCalledOnce();
    expect(props.onSelectCastle.mock.calls[0]![0].hero_id).toBe("other-1");
  });

  it("moves the castle to the ground that is tapped while relocating", () => {
    const { props, canvas, button } = renderScene({ moving: true });
    expect(button(/Move castle here/)).toBeTruthy();
    fireEventDown(canvas, 500, 300);
    fireEventClick(button(/Move castle here/));
    expect(props.onPlace).toHaveBeenCalledOnce();
    const [x, y] = props.onPlace.mock.calls[0]!;
    expect(x).toBeGreaterThan(500);
    expect(y).toBeGreaterThan(500);
  });

  it("starts the walk at the character's own castle", () => {
    const at = spawnPoint(mine);
    expect(at.x).toBe(mine.x);
    expect(at.y).toBeCloseTo(mine.y + 18, 5);
  });
});

/** True when nothing of that kind stands within reach of that ground. */
function clearOf(x: number, y: number, list: { x: number; y: number }[], gap: number) {
  return list.every((o) => Math.hypot(o.x - x, o.y - y) > gap);
}

/** A patch of ground in the first area with no node and no monster anywhere near it. */
function quietSpot(level: number) {
  const area = AREAS[0]!;
  for (let ring = 1; ring < 30; ring++) {
    for (let a = 0; a < 12; a++) {
      const angle = (a / 12) * Math.PI * 2;
      const x = area.cx + Math.cos(angle) * (30 + ring * 10);
      const y = area.cy + Math.sin(angle) * (30 + ring * 10);
      if (clearOf(x, y, nodesFor(area), 40) && clearOf(x, y, monstersFor(area, level), 50)) return { x, y };
    }
  }
  throw new Error("no quiet ground found");
}

/** jsdom has no PointerEvent; React only needs the event type to reach the handler. */
function fireEventDown(el: Element, clientX: number, clientY: number) {
  act(() => {
    el.dispatchEvent(new MouseEvent("pointerdown", { clientX, clientY, bubbles: true }));
  });
}
function fireEventClick(el: Element) {
  act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flame, Move, Sparkles, TreePine } from "lucide-react";
import { MODELS } from "./CharacterModel";
import type { Hero } from "./data";
import { REGIONS } from "./world";
import type { WorldCastle } from "./worldcastles";
import {
  ACTION_MS, AREAS, MOVE, REACH, SCENE, act, areaAt, blockedAt, cameraFor, decoFor, kindLabel,
  monstersFor, newActor, nearest, nodeLabel, nodesFor, poisFor, project, spawnPoint, stepActor, stepMonster,
  type Camera, type Monster, type Node, type SceneActor,
} from "./worldscene";

/**
 * The world itself: a 2.5D ground plane the character really walks over, with a
 * following camera, terrain and scenery per area, monsters that stand and move in
 * the world, resource nodes and points of interest, and every player's castle.
 * Movement and the chase are simulated here; castles, encounters and their
 * rewards belong to the server (see worldcastles.ts).
 */

interface Props {
  hero: Hero;
  gender: "male" | "female";
  /** The character's own castle — where the walk begins. */
  mine: WorldCastle;
  castles: WorldCastle[];
  /** The castle currently inspected by the side panel. */
  selected: string;
  /** Relocation mode: the next tap on the ground picks the new ground. */
  moving: boolean;
  busy: boolean;
  canPlace: (x: number, y: number) => boolean;
  onPlace: (x: number, y: number) => void;
  onSelectCastle: (castle: WorldCastle) => void;
  onFight: (monster: Monster) => void;
  onHarvest: (node: Node) => void;
}

const images = new Map<string, HTMLImageElement>();
function image(src: string): HTMLImageElement {
  const found = images.get(src);
  if (found) return found;
  const img = new Image();
  img.src = src;
  images.set(src, img);
  return img;
}

const CLASS_COLOR: Record<string, { slash: string; cast: string }> = {
  warrior: { slash: "#ffd479", cast: "#ff9c3c" },
  mage: { slash: "#7fd0ff", cast: "#9b6bff" },
  archer: { slash: "#a8ff9b", cast: "#6bd9a0" },
};
const NODE_COLOR: Record<string, string> = { ore: "#c9743a", essence: "#7fd0ff", fragment: "#9aa3b5", sigil: "#f2c94c", starshard: "#a98bff" };
const KIND_RING: Record<string, string | null> = { normal: null, elite: "#f2c94c", rare: "#7fd0ff", boss: "#ff5f6d" };
/** Roads between the areas, from the same region paths the map art draws. */
const ROADS: { x: number; y: number }[][] = REGIONS.map((r) => r.path.map(([x, y]) => ({ x: x * 10, y: y * 10 })));

type View = { w: number; h: number };
type Target = { kind: "monster" | "node" | "castle"; id: string; label: string; hint: string };

export function WorldScene(props: Props) {
  const { hero, gender, mine, castles, selected, moving, busy, canPlace, onPlace, onSelectCastle, onFight, onHarvest } = props;
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const actor = useRef<SceneActor>(newActor(mine.x, mine.y + 20));
  const cam = useRef<Camera>({ x: mine.x, y: mine.y });
  const monsters = useRef<Monster[]>([]);
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const view = useRef<View>({ w: 800, h: 520 });
  const spawned = useRef(false);
  const target = useRef<Target | null>(null);
  const [near, setNear] = useState<Target | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const spotOk = !!spot && canPlace(spot.x, spot.y);
  const propsRef = useRef(props);
  propsRef.current = props;

  const level = hero.level + hero.paragon;
  /** Terrain, nodes and points of interest: built once, never reshuffled by a re-render. */
  const content = useMemo(() => AREAS.map((area) => ({ area, deco: decoFor(area), nodes: nodesFor(area), pois: poisFor(area) })), []);
  const allNodes = useMemo(() => content.flatMap((c) => c.nodes), [content]);
  const roads = ROADS;

  // The monsters that live in the world at this character's level.
  useEffect(() => { monsters.current = AREAS.flatMap((a) => monstersFor(a, level)); }, [level]);

  // Start the walk at the character's own castle, the first time the world opens.
  useEffect(() => {
    if (spawned.current) return;
    spawned.current = true;
    const at = spawnPoint(mine);
    actor.current = newActor(at.x, at.y);
    cam.current = { x: at.x, y: at.y };
  }, [mine]);

  const interact = useCallback((kind: Target["kind"], id: string) => {
    const p = propsRef.current;
    if (p.busy) return;
    if (kind === "monster") {
      const m = monsters.current.find((x) => x.id === id);
      if (!m) return;
      actor.current = act(actor.current, "attack");
      window.setTimeout(() => p.onFight(m), Math.round(ACTION_MS.attack * 0.55));
    } else if (kind === "node") {
      const n = allNodes.find((x) => x.id === id);
      if (!n) return;
      actor.current = act(actor.current, "cast");
      window.setTimeout(() => p.onHarvest(n), Math.round(ACTION_MS.cast * 0.5));
    } else {
      const c = p.castles.find((x) => x.hero_id === id);
      if (c) p.onSelectCastle(c);
    }
  }, [allNodes]);

  // ---------- keyboard ----------
  useEffect(() => {
    const norm = (k: string) => k.toLowerCase();
    const down = (e: KeyboardEvent) => {
      const key = norm(e.key);
      keys.current.add(key);
      if (key === " " || key === "Enter") {
        e.preventDefault();
        if (target.current) interact(target.current.kind, target.current.id);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(norm(e.key));
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [interact]);

  // ---------- the world loop ----------
  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = performance.now(), hud = 1, frames = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth || 800, h = el.clientHeight || 520;
      view.current = { w, h };
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const seconds = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const p = propsRef.current;
      const v = view.current;
      frames++;

      // 1: walk the character over the real ground
      const k = keys.current;
      const dx = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0) + stick.current.x;
      const dy = (k.has("s") || k.has("arrowdown") ? 1 : 0) - (k.has("w") || k.has("arrowup") ? 1 : 0) + stick.current.y;
      const run = k.has("shift");
      const solids = p.castles.map((c) => ({ x: c.x, y: c.y, r: 7 }));
      actor.current = stepActor(actor.current, { dx, dy, run }, seconds, (x, y) => blockedAt(x, y, solids));
      cam.current = cameraFor(cam.current, actor.current, v);

      // 2: only the monsters standing near the character are simulated
      const me = actor.current;
      for (let i = 0; i < monsters.current.length; i++) {
        const m = monsters.current[i]!;
        if (Math.abs(m.x - me.x) < 150 && Math.abs(m.y - me.y) < 150) {
          monsters.current[i] = stepMonster(m, me, seconds, (x, y) => blockedAt(x, y, []));
        }
      }

      // 3: what stands within reach of the character right now
      const node = nearest(allNodes, me, REACH);
      const castle = nearest(p.castles, me, 16);
      const mon = nearest(monsters.current, me, REACH + 6);
      const found: Target | null =
        moving ? null
        : node ? { kind: "node", id: node.id, label: nodeLabel[node.kind], hint: "Harvest" }
        : castle ? { kind: "castle", id: castle.hero_id, label: castle.name, hint: "Inspect castle" }
        : mon ? { kind: "monster", id: mon.id, label: `${mon.name} · Lv ${mon.level}`, hint: "Fight" }
        : null;
      target.current = found;

      // 4: draw the world, back to front
      ctx.clearRect(0, 0, v.w, v.h);
      const visible = (x: number, y: number, pad = 90) => {
        const { sx, sy } = project(x, y, cam.current, v);
        return sx > -pad && sx < v.w + pad && sy > -pad && sy < v.h + pad;
      };
      drawGround(ctx, content, roads, cam.current, v);
      type Drawable = { depth: number; paint: () => void };
      const items: Drawable[] = [];
      for (const { area, deco, pois } of content) {
        if (!visible(area.cx, area.cy, (area.rx + 40) * SCENE.px)) continue;
        for (const d of deco) if (visible(d.x, d.y)) items.push({ depth: d.y, paint: () => drawDeco(ctx, d, cam.current, v) });
        for (const poi of pois) if (visible(poi.x, poi.y)) items.push({ depth: poi.y, paint: () => drawPoi(ctx, poi, cam.current, v) });
      }
      for (const n of allNodes) if (visible(n.x, n.y)) items.push({ depth: n.y, paint: () => drawNode(ctx, n, cam.current, v, found?.id === n.id) });
      for (const m of monsters.current) if (visible(m.x, m.y, 200)) items.push({ depth: m.y, paint: () => drawMonster(ctx, m, cam.current, v, found?.id === m.id) });
      for (const c of p.castles) if (visible(c.x, c.y, 200)) items.push({ depth: c.y, paint: () => drawCastle(ctx, c, cam.current, v, c.hero_id === selected) });
      if (moving && spot) items.push({ depth: spot.y, paint: () => drawGhost(ctx, spot, spotOk, cam.current, v) });
      items.push({ depth: me.y, paint: () => drawHero(ctx, me, gender, hero.cls, cam.current, v) });
      items.sort((a, b) => a.depth - b.depth);
      for (const item of items) item.paint();

      // 5: HUD state for the DOM, refreshed five times a second
      hud += seconds;
      if (hud >= 0.2) {
        hud = 0;
        const area = areaAt(me.x, me.y);
        setNear(found);
        el.dataset["world"] = JSON.stringify({
          area: area.id, areaName: area.name, x: Math.round(me.x), y: Math.round(me.y), anim: me.anim,
          speed: Math.round(me.speed), monsters: monsters.current.length, frames,
          walking: Math.hypot(dx, dy) > 0, prompt: found ? `${found.hint}: ${found.label}` : "",
          near: found ? { kind: found.kind, id: found.id } : null,
        });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [content, allNodes, roads, gender, hero.cls, moving, spot, spotOk, selected, setNear]);

  // ---------- pointer: walk somewhere, or touch what is under the cursor ----------
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = canvas.current;
    if (!cv) return;
    const box = cv.getBoundingClientRect();
    const camP = cam.current, v = view.current;
    const x = (e.clientX - box.left - v.w / 2) / SCENE.px + camP.x;
    const y = (e.clientY - box.top - v.h / 2) / (SCENE.px * SCENE.tilt) + camP.y;
    if (moving) { setSpot({ x: Math.round(x), y: Math.round(y) }); return; }
    const monster = nearest(monsters.current, { x, y }, 10);
    const node = nearest(allNodes, { x, y }, 8);
    const castle = nearest(props.castles, { x, y }, 10);
    const me = actor.current;
    if (monster && Math.hypot(monster.x - me.x, monster.y - me.y) < REACH + monster.radius) return interact("monster", monster.id);
    if (node && Math.hypot(node.x - me.x, node.y - me.y) < REACH) return interact("node", node.id);
    if (castle && Math.hypot(castle.x - me.x, castle.y - me.y) < 16) return interact("castle", castle.hero_id);
    // Otherwise walk toward the tap: hold a direction for as long as the walk takes.
    const d = Math.hypot(x - me.x, y - me.y);
    if (d < 2) return;
    stick.current = { x: (x - me.x) / d, y: (y - me.y) / d };
    window.setTimeout(() => { stick.current = { x: 0, y: 0 }; }, Math.min(2500, (d / MOVE.walk) * 1000));
  };

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-[#141020]">
      <canvas
        ref={canvas} onPointerDown={onPointerDown} className="block h-full w-full touch-none select-none"
        aria-label="The world of Ember Fall — walk with WASD or the arrow keys, shift to run, space to act"
      />
      <div className="pointer-events-none absolute left-2 top-2 flex max-w-[70%] flex-col gap-1 font-display text-[11px]">
        <span className="rounded bg-background/70 px-2 py-0.5 text-gold">
          WASD / arrows to walk · Shift to run · Space to act
        </span>
        {near && (
          <span className="w-fit rounded bg-background/80 px-2 py-0.5 text-foreground" role="status">
            {near.hint}: <span className="text-gold">{near.label}</span>
          </span>
        )}
      </div>

      {/* Touch: a d-pad and one action button, so the world is playable without a keyboard. */}
      <div className="absolute bottom-3 left-3 md:hidden"><Pad stick={stick} /></div>
      {moving ? (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 md:bottom-4 md:right-4">
          <button className="btn-gold px-3 py-2 text-sm" disabled={!spot || !spotOk || busy} onClick={() => spot && onPlace(spot.x, spot.y)}>
            <Move className="mr-1 inline h-4 w-4" />{busy ? "Moving…" : "Move castle here"}
          </button>
          <button className="btn-blood px-3 py-2 text-sm" onClick={() => setSpot(null)}>Clear</button>
        </div>
      ) : (
        <button
          className="btn-blood absolute bottom-3 right-3 px-4 py-3 text-sm md:bottom-4 md:right-4"
          disabled={!near || busy || near.kind === "castle"} onClick={() => near && interact(near.kind, near.id)}
        >
          {near?.kind === "monster" ? <><Flame className="mr-1 inline h-4 w-4" />Fight</>
            : near?.kind === "node" ? <><Sparkles className="mr-1 inline h-4 w-4" />Harvest</>
            : <><TreePine className="mr-1 inline h-4 w-4" />Walk to a target</>}
        </button>
      )}
    </div>
  );
}

/** The on-screen d-pad for touch play. */
function Pad({ stick }: { stick: React.MutableRefObject<{ x: number; y: number }> }) {
  const hold = (x: number, y: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); stick.current = { x, y }; },
    onPointerUp: () => { stick.current = { x: 0, y: 0 }; },
    onPointerLeave: () => { stick.current = { x: 0, y: 0 }; },
    onPointerCancel: () => { stick.current = { x: 0, y: 0 }; },
  });
  const btn = "flex h-10 w-10 items-center justify-center rounded-full bg-background/80 font-display text-base text-gold";
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1">
      <span /><button className={btn} aria-label="Walk north" {...hold(0, -1)}>↑</button><span />
      <button className={btn} aria-label="Walk west" {...hold(-1, 0)}>←</button>
      <span className="flex h-10 w-10 items-center justify-center text-[10px] text-muted-foreground">walk</span>
      <button className={btn} aria-label="Walk east" {...hold(1, 0)}>→</button>
      <span /><button className={btn} aria-label="Walk south" {...hold(0, 1)}>↓</button><span />
    </div>
  );
}

// ---------- drawing ----------
const toScreen = (x: number, y: number, cam: Camera, view: View) => project(x, y, cam, view);

function shadow(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(sx, sy, Math.max(2, w), Math.max(1.5, w * 0.42), 0, 0, Math.PI * 2);
  ctx.fill();
}

function tileHash(x: number, y: number, seed: number) {
  let h = Math.imul(Math.round(x) ^ 0x2f1b3c7d, 0x27d4eb2d) ^ Math.imul(Math.round(y) ^ 0x51ed270b, 0x165667b1) ^ (seed * 2654435761);
  h ^= h >>> 15; h = Math.imul(h, 0x2545f491); h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** The ground: one plateau per area, patchwork detail, and the roads between them. */
function drawGround(
  ctx: CanvasRenderingContext2D,
  content: { area: (typeof AREAS)[number] }[],
  roads: { x: number; y: number }[][],
  cam: Camera,
  view: View,
) {
  for (const { area } of content) {
    const { sx, sy } = toScreen(area.cx, area.cy, cam, view);
    const rx = area.rx * SCENE.px, ry = area.ry * SCENE.px * SCENE.tilt;
    if (sx + rx < -60 || sx - rx > view.w + 60 || sy + ry < -60 || sy - ry > view.h + 60) continue;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = area.ground[0];
    ctx.fill();
    ctx.clip();
    // Detail tiles only where they can be seen.
    const step = 18;
    const wx0 = cam.x - view.w / 2 / SCENE.px, wx1 = cam.x + view.w / 2 / SCENE.px;
    const wy0 = cam.y - view.h / 2 / (SCENE.px * SCENE.tilt), wy1 = cam.y + view.h / 2 / (SCENE.px * SCENE.tilt);
    ctx.globalAlpha = 0.45;
    for (let gx = Math.ceil(wx0 / step) * step; gx < wx1; gx += step) {
      for (let gy = Math.ceil(wy0 / step) * step; gy < wy1; gy += step) {
        const dx = (gx - area.cx) / area.rx, dy = (gy - area.cy) / area.ry;
        if (dx * dx + dy * dy > 1) continue;
        const h = tileHash(gx, gy, area.index);
        if (h < 0.7) continue;
        const p = project(gx, gy, cam, view);
        ctx.fillStyle = h > 0.9 ? area.ground[2] : area.ground[1];
        ctx.beginPath();
        ctx.ellipse(p.sx, p.sy, SCENE.px * 9, SCENE.px * SCENE.tilt * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (sx > -160 && sx < view.w + 160) {
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(`${area.name.toUpperCase()} · LV ${area.openLevel}+`, sx + 1, sy - ry - 5);
      ctx.fillStyle = area.accent;
      ctx.fillText(`${area.name.toUpperCase()} · LV ${area.openLevel}+`, sx, sy - ry - 6);
    }
  }
  ctx.strokeStyle = "rgba(238,220,180,0.14)";
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  for (const road of roads) {
    ctx.beginPath();
    road.forEach((p, i) => {
      const s = toScreen(p.x, p.y, cam, view);
      if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy);
    });
    ctx.stroke();
  }
}

function drawDeco(ctx: CanvasRenderingContext2D, d: { kind: string; x: number; y: number; size: number }, cam: Camera, view: View) {
  const { sx, sy, scale } = toScreen(d.x, d.y, cam, view);
  const s = d.size * scale;
  shadow(ctx, sx, sy, 9 * s);
  if (d.kind === "pine" || d.kind === "oak") {
    const h = (d.kind === "pine" ? 44 : 34) * s;
    ctx.fillStyle = "#33241a";
    ctx.fillRect(sx - 2 * s, sy - h * 0.35, 4 * s, h * 0.35);
    ctx.fillStyle = d.kind === "pine" ? "#1f4a2c" : "#2c5a2e";
    ctx.beginPath();
    if (d.kind === "pine") { ctx.moveTo(sx, sy - h); ctx.lineTo(sx + 15 * s, sy - h * 0.3); ctx.lineTo(sx - 15 * s, sy - h * 0.3); }
    else ctx.ellipse(sx, sy - h * 0.75, 17 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (d.kind === "rock") {
    ctx.fillStyle = "#5b5964";
    ctx.beginPath(); ctx.moveTo(sx - 14 * s, sy); ctx.lineTo(sx - 5 * s, sy - 16 * s); ctx.lineTo(sx + 7 * s, sy - 13 * s); ctx.lineTo(sx + 14 * s, sy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath(); ctx.moveTo(sx - 5 * s, sy - 16 * s); ctx.lineTo(sx + 7 * s, sy - 13 * s); ctx.lineTo(sx, sy - 6 * s); ctx.closePath(); ctx.fill();
  } else if (d.kind === "pillar") {
    ctx.fillStyle = "#6d6a78";
    ctx.fillRect(sx - 6 * s, sy - 46 * s, 12 * s, 46 * s);
    ctx.fillStyle = "#8a8698";
    ctx.fillRect(sx - 9 * s, sy - 52 * s, 18 * s, 7 * s);
  } else if (d.kind === "banner") {
    ctx.strokeStyle = "#7a2a2a";
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 40 * s); ctx.stroke();
    ctx.fillStyle = "#a3232c";
    ctx.beginPath(); ctx.moveTo(sx, sy - 40 * s); ctx.lineTo(sx + 20 * s, sy - 34 * s); ctx.lineTo(sx, sy - 26 * s); ctx.closePath(); ctx.fill();
  } else if (d.kind === "crystal") {
    ctx.fillStyle = "rgba(160,120,255,0.85)";
    ctx.beginPath(); ctx.moveTo(sx, sy - 30 * s); ctx.lineTo(sx + 9 * s, sy - 8 * s); ctx.lineTo(sx, sy); ctx.lineTo(sx - 9 * s, sy - 8 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(230,220,255,0.45)";
    ctx.beginPath(); ctx.moveTo(sx, sy - 30 * s); ctx.lineTo(sx + 9 * s, sy - 8 * s); ctx.lineTo(sx, sy - 12 * s); ctx.closePath(); ctx.fill();
  } else if (d.kind === "lava") {
    ctx.fillStyle = "#e0512a";
    ctx.beginPath(); ctx.ellipse(sx, sy, 16 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb03a";
    ctx.beginPath(); ctx.ellipse(sx, sy, 8 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#d9d3c4";
    ctx.lineWidth = 2.4 * s;
    ctx.beginPath();
    ctx.moveTo(sx - 8 * s, sy); ctx.lineTo(sx - 2 * s, sy - 12 * s);
    ctx.moveTo(sx, sy); ctx.lineTo(sx + 3 * s, sy - 11 * s);
    ctx.moveTo(sx - 12 * s, sy - 4 * s); ctx.quadraticCurveTo(sx, sy - 16 * s, sx + 12 * s, sy - 3 * s);
    ctx.stroke();
  }
}

function drawPoi(ctx: CanvasRenderingContext2D, poi: { name: string; x: number; y: number; kind: string }, cam: Camera, view: View) {
  const { sx, sy, scale } = toScreen(poi.x, poi.y, cam, view);
  if (poi.kind === "lair") {
    ctx.fillStyle = "rgba(20,10,26,0.85)";
    ctx.beginPath(); ctx.ellipse(sx, sy, 34 * scale, 16 * scale, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(220,90,90,0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (poi.kind === "shrine") {
    ctx.fillStyle = "#3b3550";
    ctx.fillRect(sx - 20 * scale, sy - 8 * scale, 40 * scale, 8 * scale);
    ctx.fillStyle = "#6f63a8";
    ctx.fillRect(sx - 6 * scale, sy - 34 * scale, 12 * scale, 26 * scale);
  } else if (poi.kind === "gate") {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(sx, sy, 22 * scale, 11 * scale, 0, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(201,162,39,0.2)";
    ctx.beginPath(); ctx.ellipse(sx, sy, 22 * scale, 20 * scale, 0, Math.PI, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath(); ctx.moveTo(sx - 18 * scale, sy); ctx.lineTo(sx, sy - 26 * scale); ctx.lineTo(sx + 18 * scale, sy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a1e14";
    ctx.beginPath(); ctx.moveTo(sx - 6 * scale, sy); ctx.lineTo(sx, sy - 12 * scale); ctx.lineTo(sx + 6 * scale, sy); ctx.closePath(); ctx.fill();
  }
  ctx.font = "600 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText(poi.name, sx + 1, sy - 34 * scale + 1);
  ctx.fillStyle = "rgba(240,235,220,0.9)";
  ctx.fillText(poi.name, sx, sy - 34 * scale);
}

function drawNode(ctx: CanvasRenderingContext2D, n: Node, cam: Camera, view: View, active: boolean) {
  const { sx, sy, scale } = toScreen(n.x, n.y, cam, view);
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 340);
  shadow(ctx, sx, sy, 8 * scale);
  ctx.fillStyle = NODE_COLOR[n.kind] ?? "#cccccc";
  ctx.beginPath(); ctx.moveTo(sx, sy - 22 * scale); ctx.lineTo(sx + 8 * scale, sy - 8 * scale); ctx.lineTo(sx, sy - 2 * scale); ctx.lineTo(sx - 8 * scale, sy - 8 * scale); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${0.15 + pulse * 0.3})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(sx, sy, 13 * scale, 6 * scale, 0, 0, Math.PI * 2); ctx.stroke();
  if (active) {
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe9a8";
    ctx.fillText(nodeLabel[n.kind], sx, sy - 30 * scale);
  }
}

function drawMonster(ctx: CanvasRenderingContext2D, m: Monster, cam: Camera, view: View, active: boolean) {
  const { sx, sy, scale } = toScreen(m.x, m.y, cam, view);
  const size = (m.kind === "boss" ? 92 : m.kind === "elite" ? 64 : m.kind === "rare" ? 58 : 50) * scale;
  const sprite = image(m.sprite.url);
  const bob = Math.sin(Date.now() / 400 + m.x) * 1.5;
  const w = size, h = size * (m.sprite.h / m.sprite.w);
  shadow(ctx, sx, sy, w * 0.34);
  const ring = KIND_RING[m.kind];
  if (ring) {
    ctx.strokeStyle = ring;
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(Date.now() / 300);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy, w * 0.42, h * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.save();
    ctx.translate(sx, sy + bob);
    if (m.facing === "l") ctx.scale(-1, 1);
    ctx.drawImage(sprite, m.sprite.x, m.sprite.y, m.sprite.w, m.sprite.h, -w / 2, -h, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "#8b6b5a";
    ctx.fillRect(sx - w / 2, sy - h + bob, w, h);
  }
  ctx.font = "600 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = m.kind === "boss" ? "#ff9ba4" : m.kind === "elite" ? "#f7dd8a" : "rgba(235,232,225,0.85)";
  ctx.fillText(`${m.name} · Lv ${m.level}`, sx, sy - h - 4);
  if (active) {
    ctx.font = "500 9px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(kindLabel[m.kind], sx, sy + 11);
  }
}

/** Every player's castle: a keep with the lord's own character standing at its gate. */
function drawCastle(ctx: CanvasRenderingContext2D, c: WorldCastle, cam: Camera, view: View, selected: boolean) {
  const { sx, sy, scale } = toScreen(c.x, c.y, cam, view);
  const w = 74 * scale, h = 54 * scale;
  shadow(ctx, sx, sy, 34 * scale);
  if (selected) {
    ctx.strokeStyle = "#f2c94c";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy, w * 0.72, h * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = "#4c4356";
  ctx.fillRect(sx - w / 2, sy - h, w, h);
  ctx.fillStyle = "#5f5570";
  ctx.fillRect(sx - w / 2 - 8 * scale, sy - h - 12 * scale, w + 16 * scale, 12 * scale);
  ctx.fillStyle = "#8f829f";
  for (let i = 0; i < 4; i++) ctx.fillRect(sx - w / 2 + i * (w / 3.4), sy - h - 22 * scale, 12 * scale, 12 * scale);
  ctx.fillStyle = "#2a2233";
  ctx.fillRect(sx - 9 * scale, sy - 24 * scale, 18 * scale, 24 * scale);
  const portrait = image(MODELS[c.cls][c.gender]);
  const pw = 32 * scale;
  if (portrait.complete && portrait.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy + 14 * scale, pw / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(portrait, sx - pw / 2, sy + 14 * scale - pw, pw, pw);
    ctx.restore();
  }
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(sx, sy + 14 * scale, pw / 2, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "700 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillText(`${c.name} · Lv ${c.level}`, sx + 1, sy - h - 28 * scale + 1);
  ctx.fillStyle = "#ffe9a8";
  ctx.fillText(`${c.name} · Lv ${c.level}`, sx, sy - h - 28 * scale);
}

function drawGhost(ctx: CanvasRenderingContext2D, spot: { x: number; y: number }, ok: boolean, cam: Camera, view: View) {
  const { sx, sy, scale } = toScreen(spot.x, spot.y, cam, view);
  ctx.strokeStyle = ok ? "#7fc45f" : "#ff5f6d";
  ctx.fillStyle = ok ? "rgba(127,196,95,0.25)" : "rgba(255,95,109,0.25)";
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(sx, sy, 30 * scale, 14 * scale, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fill();
  ctx.setLineDash([]);
}

/** The player's own character: the shared class art, animated by what it is doing. */
function drawHero(ctx: CanvasRenderingContext2D, a: SceneActor, gender: "male" | "female", cls: Hero["cls"], cam: Camera, view: View) {
  const { sx, sy, scale } = toScreen(a.x, a.y, cam, view);
  const h = SCENE.actor * scale;
  const img = image(MODELS[cls][gender]);
  const t = Date.now() / 1000;
  const acting = a.anim === "attack" || a.anim === "cast" || a.anim === "hurt";
  const phase = acting ? Math.min(1, a.animT / ACTION_MS[a.anim as "attack"]) : 0;
  const stride = a.anim === "run" ? 9 : a.anim === "walk" ? 5 : 1.8;
  const bob = Math.sin(t * (a.anim === "run" ? 13 : a.anim === "walk" ? 9 : 2.4)) * stride * 0.4;
  const lunge = a.anim === "attack" ? Math.sin(phase * Math.PI) * 16 * (a.facing === "l" ? -1 : 1) : 0;
  const lean = a.anim === "run" ? (a.facing === "l" ? -6 : 6) : 0;
  shadow(ctx, sx, sy, h * 0.17);
  if (a.anim === "cast") {
    ctx.strokeStyle = `rgba(150,180,255,${Math.max(0, 0.8 - phase * 0.6)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(sx, sy + 2, h * 0.28 * (1 + phase), h * 0.12 * (1 + phase), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(sx + lunge, sy + bob);
  if (a.facing === "l") ctx.scale(-1, 1);
  ctx.rotate((lean * Math.PI) / 180);
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, -h * 0.39, -h, h * 0.78, h);
  } else {
    ctx.fillStyle = "#d8c7a8";
    ctx.fillRect(-h * 0.2, -h, h * 0.4, h);
  }
  if (a.anim === "attack") {
    ctx.strokeStyle = CLASS_COLOR[cls]?.slash ?? "#ffd479";
    ctx.lineWidth = 4;
    const arc = -Math.PI * (0.15 + 0.7 * phase);
    ctx.beginPath();
    ctx.arc(h * 0.3, -h * 0.55, h * 0.42, arc - 0.9, arc + 0.5);
    ctx.stroke();
  }
  ctx.restore();
  if (a.anim === "cast" && phase < 0.8) {
    ctx.fillStyle = CLASS_COLOR[cls]?.cast ?? "#9b6bff";
    ctx.globalAlpha = Math.max(0, 0.7 - phase * 0.5);
    ctx.beginPath();
    ctx.arc(sx + (a.facing === "l" ? -h * 0.3 : h * 0.3), sy - h * 0.7 - phase * 14, 7 * (1 - phase * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

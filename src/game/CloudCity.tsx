// ============= Cloud City: the sky region =============
// A full-screen second region, deliberately unlike the castle: bright marble, drifting
// clouds, and a hero who *walks*. Click anywhere on the plaza and the character walks
// there with a stride animation; click a citizen to walk over and talk; click a building
// to walk to its door and walk in. Depth is the isometric (x + y), so the hero passes
// behind towers and in front of the plaza's lower edge.

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Cloud, Coins, Flame, ScrollText } from "lucide-react";
import { update, useGame } from "./store";
import { CharacterModel } from "./CharacterModel";
import {
  CityProgress,
  CitizenDialog,
  MissionsPanel,
  NexusPanel,
  PlaceCard,
  VaultPanel,
} from "./CloudPanels";
import {
  CITY_BUILDINGS,
  CITY_PROPS,
  CLOUD_MISSIONS,
  GRID,
  NPCS,
  SPAWN,
  missionRows,
  npcById,
  noteSteps,
  noteTalk,
  noteVisit,
  rollCloud,
  standPoint,
  type CityBuilding,
  type CityNpc,
} from "./cloudcity";
import {
  CloudSky,
  IslandGround,
  IsoBuilding,
  NpcFigure,
  PropView,
  iso,
  unIso,
} from "./CloudScenery";

const SPEED = 3.4; // tiles per second
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

type Pending = { kind: "building"; id: string } | { kind: "npc"; id: string };
type PanelId = "nexus" | "board" | "vault";

export function CloudCity({ onClose }: { onClose: () => void }) {
  const { hero, gender } = useGame();
  const [pos, setPos] = useState({ ...SPAWN });
  const [walking, setWalking] = useState(false);
  const [face, setFace] = useState(1);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [place, setPlace] = useState<{ name: string; desc: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState({ w: 1200, h: 820 });

  const vp = useRef<HTMLDivElement>(null);
  const posRef = useRef({ ...SPAWN });
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const onArriveRef = useRef<(() => void) | null>(null);
  const steps = useRef(0);

  // Open on today's board: this snapshots the day's counters the first time the city is visited.
  useEffect(() => {
    update((h) => {
      rollCloud(h);
    });
  }, []);

  useEffect(() => {
    const el = vp.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth || 1200, h: el.clientHeight || 820 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The walk loop. One requestAnimationFrame drives movement, facing and the step counter.
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.06, Math.max(0, (now - prev) / 1000));
      prev = now;
      const t = targetRef.current;
      if (t) {
        const dx = t.x - posRef.current.x;
        const dy = t.y - posRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= SPEED * dt + 0.02) {
          posRef.current = { x: t.x, y: t.y };
          targetRef.current = null;
          setPos({ ...posRef.current });
          setWalking(false);
          const done = onArriveRef.current;
          onArriveRef.current = null;
          done?.();
        } else {
          const step = SPEED * dt;
          posRef.current = {
            x: posRef.current.x + (dx / dist) * step,
            y: posRef.current.y + (dy / dist) * step,
          };
          const screenDx = dx - dy; // movement direction measured across the screen
          if (Math.abs(screenDx) > 1e-4) setFace(screenDx >= 0 ? 1 : -1);
          setPos({ ...posRef.current });
          setWalking(true);
          steps.current += step;
          if (steps.current >= 1) {
            const n = Math.floor(steps.current);
            steps.current -= n;
            update((h) => noteSteps(h, n));
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dialogId) setDialogId(null);
      else if (panel) setPanel(null);
      else if (place) setPlace(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogId, panel, place]);

  // ---- camera: the island nearly fits a desktop, so it only pans on small screens
  const scale = clamp(view.w / 1080, 0.58, 1);
  const here = iso(pos.x, pos.y);
  const maxX = Math.max(0, 520 * scale - view.w / 2 + 60);
  const maxY = Math.max(0, 320 * scale - view.h / 2 + 60);
  const camX = clamp(-here.sx * scale * 0.55, -maxX, maxX);
  const camY = clamp(-here.sy * scale * 0.55, -maxY, maxY);

  // ---- ordering
  const walkTo = (x: number, y: number, onArrive?: () => void) => {
    targetRef.current = { x: clamp(x, 0.5, GRID - 0.5), y: clamp(y, 0.5, GRID - 0.5) };
    onArriveRef.current = onArrive ?? null;
    setWalking(true);
  };

  /** A point `gap` tiles short of a target, plus whether the hero is already that close. */
  const approach = (tx: number, ty: number, gap: number) => {
    const dx = posRef.current.x - tx,
      dy = posRef.current.y - ty;
    const d = Math.hypot(dx, dy);
    if (d <= gap) return { x: posRef.current.x, y: posRef.current.y, near: true };
    return { x: tx + (dx / d) * gap, y: ty + (dy / d) * gap, near: false };
  };

  const openBuilding = (b: CityBuilding) => {
    if (b.open === "exit") {
      onClose();
      return;
    }
    if (b.open === "nexus" || b.open === "board" || b.open === "vault") {
      update((h) => noteVisit(h, b.id));
      setPanel(b.open);
      return;
    }
    setPlace({ name: b.name, desc: b.desc ?? "A quiet corner of the city." });
  };

  const enterBuilding = (b: CityBuilding) => {
    const s = standPoint(b);
    const spot = approach(s.x, s.y, 0.45);
    if (spot.near) {
      openBuilding(b);
      return;
    }
    walkTo(spot.x, spot.y, () => openBuilding(b));
  };

  const talkTo = (npc: CityNpc) => {
    const spot = approach(npc.x, npc.y, 0.95);
    const greet = () => {
      setDialogId(npc.id);
      update((h) => {
        const gift = noteTalk(h, npc.id);
        if (gift > 0)
          setToast(`${npc.name} hands you ${gift} Aether Shard${gift === 1 ? "" : "s"}.`);
      });
    };
    if (spot.near) greet();
    else walkTo(spot.x, spot.y, greet);
  };

  const walkToPoint = (clientX: number, clientY: number) => {
    const el = vp.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const wx = (clientX - r.left - r.width / 2 - camX) / scale;
    const wy = (clientY - r.top - r.height / 2 - camY) / scale;
    const grid = unIso(wx, wy);
    const x = clamp(grid.x, 0.5, GRID - 0.5);
    const y = clamp(grid.y, 0.5, GRID - 0.5);
    // Never walk into a building: route to its doorway instead.
    const inside = CITY_BUILDINGS.find(
      (b) => x > b.x - 0.2 && x < b.x + b.w + 0.2 && y > b.y - 0.2 && y < b.y + b.d + 0.2,
    );
    if (inside) {
      enterBuilding(inside);
      return;
    }
    walkTo(x, y);
  };

  const claimable = useMemo(() => {
    if (!hero) return new Set<string>();
    const done = new Set(
      missionRows(hero)
        .filter((r) => r.done && !r.claimed)
        .map((r) => r.mission.id),
    );
    return new Set(CLOUD_MISSIONS.filter((m) => done.has(m.id)).map((m) => m.giver));
  }, [hero]);

  // Static scenery never changes, so it is built once.
  const props = useMemo(
    () =>
      CITY_PROPS.map((p, i) => (
        <div
          key={`${p.kind}-${i}`}
          className="cc-prop"
          style={{ zIndex: Math.round((p.x + p.y) * 100) }}
        >
          <PropView p={p} />
        </div>
      )),
    [],
  );

  if (!hero) return null;

  const npcLayer = NPCS.map((npc) => {
    const n = iso(npc.x, npc.y);
    return (
      <div
        key={npc.id}
        className="cc-actor"
        style={{
          transform: `translate3d(${n.sx}px, ${n.sy}px, 0)`,
          zIndex: Math.round((npc.x + npc.y) * 100),
        }}
      >
        <button
          className="cc-npc"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => talkTo(npc)}
          aria-label={`${npc.name}, ${npc.role}`}
          data-cc-npc={npc.id}
        >
          <NpcFigure npc={npc} />
          <span className="cc-npc-name">{npc.name}</span>
          {claimable.has(npc.id) && (
            <span className="cc-npc-mark" aria-hidden="true">
              !
            </span>
          )}
        </button>
      </div>
    );
  });

  return (
    <div className="cloudcity">
      <CloudSky />
      <div
        ref={vp}
        className="cc-viewport"
        onPointerDown={(e) => {
          if (e.button === 0) walkToPoint(e.clientX, e.clientY);
        }}
        data-cc-viewport
      >
        <div
          className="cc-world"
          style={{ transform: `translate3d(${camX}px, ${camY}px, 0) scale(${scale})` }}
        >
          <IslandGround />
          {props}
          {CITY_BUILDINGS.map((b) => (
            <div
              key={b.id}
              className="cc-prop"
              style={{ zIndex: Math.round((b.x + b.w / 2 + b.y + b.d / 2) * 100) }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => enterBuilding(b)}
              role="button"
              tabIndex={0}
              aria-label={b.name}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  enterBuilding(b);
                }
              }}
              data-cc-building={b.id}
            >
              <IsoBuilding b={b} />
              {b.open && <span className="cc-prop-label">{b.name}</span>}
            </div>
          ))}
          {npcLayer}
          {targetRef.current &&
            (() => {
              const t = iso(targetRef.current!.x, targetRef.current!.y);
              return (
                <span
                  className="cc-marker"
                  style={{ transform: `translate3d(${t.sx}px, ${t.sy}px, 0)`, zIndex: 4 }}
                  aria-hidden="true"
                />
              );
            })()}
          {/* the hero */}
          <div
            className="cc-actor cc-hero-actor"
            style={{
              transform: `translate3d(${here.sx}px, ${here.sy}px, 0)`,
              zIndex: Math.round((pos.x + pos.y) * 100) + 20,
            }}
            data-cc-player
          >
            <span className="cc-tag">{hero.name}</span>
            <span className="cc-shadow" />
            <div
              className={`cc-figure ${walking ? "is-walking" : ""}`}
              style={{ transform: `scaleX(${face})` }}
            >
              <div className="cc-bob">
                <CharacterModel
                  cls={hero.cls}
                  gender={gender}
                  equipment={hero.equipment}
                  className="cc-model"
                />
              </div>
              {walking && <span className="cc-puff" aria-hidden="true" />}
            </div>
          </div>
        </div>
      </div>

      <header className="cc-top">
        <button className="cc-btn cc-btn-quiet cc-back" onClick={onClose}>
          <ChevronLeft className="h-4 w-4" /> Ember Fall
        </button>
        <div className="cc-brand">
          <Cloud className="h-5 w-5" />
          <span>Cloud City</span>
        </div>
        <CityProgress />
        <nav className="cc-actions" aria-label="Cloud City">
          <button className="cc-btn cc-btn-quiet" onClick={() => setPanel("board")}>
            <ScrollText className="h-4 w-4" /> Missions
          </button>
          <button className="cc-btn cc-btn-quiet" onClick={() => setPanel("nexus")}>
            <Flame className="h-4 w-4" /> Ascension
          </button>
          <button className="cc-btn cc-btn-quiet" onClick={() => setPanel("vault")}>
            <Coins className="h-4 w-4" /> Vault
          </button>
        </nav>
      </header>

      <p className="cc-tip">
        Click the plaza to walk · click a citizen to talk · click a building to step inside
      </p>
      {toast && (
        <div className="cc-toast" role="status">
          {toast}
        </div>
      )}

      {panel === "nexus" && <NexusPanel onClose={() => setPanel(null)} />}
      {panel === "board" && <MissionsPanel onClose={() => setPanel(null)} />}
      {panel === "vault" && <VaultPanel onClose={() => setPanel(null)} />}
      {place && <PlaceCard name={place.name} desc={place.desc} onClose={() => setPlace(null)} />}
      {dialogId && npcById(dialogId) && (
        <CitizenDialog npc={npcById(dialogId)!} onClose={() => setDialogId(null)} />
      )}
    </div>
  );
}

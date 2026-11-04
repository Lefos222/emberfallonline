import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Castle, Crown, Gem, Hammer, Landmark, Minus, Plus, Skull, X } from "lucide-react";
import mapImg from "@/assets/world-map.jpg";
import { useGame } from "./store";
import type { StartBattle } from "./panels";
import { completeWorldRaid, loadWorldMap } from "./worldmap-services";
import {
  CASTLE_RAIDS_PER_DAY,
  RAID_LIMITS,
  nearestRuin,
  raidsLeft,
  sitesInView,
  siteFoe,
  terrainName,
  type RaidKind,
  type SiteKind,
  type WorldMapState,
  type WorldSite,
} from "./worldmap";
import {
  castleRaidNode,
  castleRaidsLeft,
  loadMyCastle,
  placeCastle,
  spendCastleRaid,
} from "./worldcastles";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;

/** One pass of the painted map art, in world units (the art is 2048×1143). */
const MAP_W = 4096;
const MAP_H = Math.round((MAP_W * 1143) / 2048);

const KIND_STYLE: Record<SiteKind, { ring: string; dot: string; label: string; Icon: typeof Gem }> =
  {
    gold: { ring: "ring-sky-400", dot: "bg-sky-400", label: "Gold mine", Icon: Gem },
    ore: { ring: "ring-emerald-400", dot: "bg-emerald-400", label: "Ore dungeon", Icon: Hammer },
    boss: { ring: "ring-blood", dot: "bg-blood", label: "World boss", Icon: Skull },
    keep: { ring: "ring-gold", dot: "bg-gold", label: "Rival castle", Icon: Castle },
    ruin: {
      ring: "ring-muted-foreground",
      dot: "bg-muted-foreground",
      label: "Abandoned castle",
      Icon: Landmark,
    },
  };

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

const rewardLines = (reward: Record<string, unknown>) =>
  Object.entries(reward).flatMap(([k, v]) =>
    typeof v === "number"
      ? [`+${v.toLocaleString()} ${k}`]
      : v && typeof v === "object"
        ? Object.entries(v as Record<string, number>).map(([m, n]) => `+${n} ${m}`)
        : [],
  );

/**
 * The World Map — the realm as EmberFall paints it, with no edge.
 *
 * The parchment map repeats as the ground, so the world keeps going in every
 * direction: drag to travel and scroll to zoom. Mines, ore dungeons, world bosses,
 * rival keeps and abandoned castles are generated from the world coordinates
 * (worldmap.ts), the player's own castle is remembered on this device
 * (worldcastles.ts) and every raid still settles on the server.
 */
export function WorldMap({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero, heroId } = useGame();
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | { x: number; y: number; cx: number; cy: number; z: number }>(null);
  const moved = useRef(false);
  const centered = useRef(false);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState({ x: 0, y: 0, z: 0.5 });
  const [state, setState] = useState<WorldMapState | null>(null);
  const [error, setError] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorldSite | null>(null);
  const [castle, setCastle] = useState(() => loadMyCastle(heroId));
  const [castleRaids, setCastleRaids] = useState(() => castleRaidsLeft(heroId));

  // The character can arrive a beat after the map opens; read its castle again then.
  useEffect(() => {
    setCastle(loadMyCastle(heroId));
    setCastleRaids(castleRaidsLeft(heroId));
  }, [heroId]);

  const refresh = useCallback(() => {
    loadWorldMap()
      .then(setState)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "The raid ledger could not be read."),
      );
  }, []);
  useEffect(refresh, [refresh]);

  // The stage fills the panel; the camera needs its pixel size to centre the world.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setSize({ w: Math.round(box.width), h: Math.round(box.height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Open on the player's own castle when one stands on the map; otherwise on the home region.
  useEffect(() => {
    if (centered.current || size.w === 0 || !castle) return;
    centered.current = true;
    setCam({ x: castle.x, y: castle.y, z: 0.5 });
  }, [size.w, castle]);

  const view = useMemo(
    () => ({
      left: cam.x - size.w / 2 / cam.z,
      top: cam.y - size.h / 2 / cam.z,
      right: cam.x + size.w / 2 / cam.z,
      bottom: cam.y + size.h / 2 / cam.z,
    }),
    [cam, size],
  );

  const sites = useMemo(
    () => (size.w > 0 ? sitesInView(view.left, view.top, view.right, view.bottom) : []),
    [view, size.w],
  );

  const screen = useCallback(
    (x: number, y: number) => ({
      left: (x - cam.x) * cam.z + size.w / 2,
      top: (y - cam.y) * cam.z + size.h / 2,
    }),
    [cam, size],
  );

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      setCam((c) => {
        const z = clampZoom(c.z * factor);
        const wx = c.x + (px - size.w / 2) / c.z;
        const wy = c.y + (py - size.h / 2) / c.z;
        return { x: wx - (px - size.w / 2) / z, y: wy - (py - size.h / 2) / z, z };
      });
    },
    [size],
  );

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  if (!hero) return null;

  const heroLevel = hero.level + hero.paragon;
  const goldLeft = state ? raidsLeft(state, "gold") : 0;

  const claim = (site: WorldSite) => {
    const placed = placeCastle(heroId, site);
    if (!placed) return;
    setCastle(placed);
    setSelected(null);
    setCam((c) => ({ ...c, x: site.x, y: site.y }));
  };

  const showRuin = () => {
    const ruin = nearestRuin(cam.x, cam.y);
    if (!ruin) return;
    setCam((c) => ({ ...c, x: ruin.x, y: ruin.y }));
    setSelected(ruin);
  };

  const raid = (site: WorldSite) => {
    const isCastle = site.kind === "keep";
    if (isCastle) {
      if (castleRaidsLeft(heroId) <= 0) {
        setError("All castle raids are spent — they refill at midnight UTC.");
        return;
      }
      if (!state || raidsLeft(state, "gold") <= 0) {
        setError("The daily raid allowance is spent — it refills at midnight UTC.");
        return;
      }
    } else if (!state || raidsLeft(state, site.kind as RaidKind) <= 0) {
      setError("The daily raid allowance is spent — it refills at midnight UTC.");
      return;
    }

    start({
      title: `World Map · ${site.name}`,
      right: siteFoe(site, heroLevel),
      onResult: async (won) => {
        if (!won) {
          return {
            lines: [
              isCastle
                ? "The castle holds. Its lord laughs from the walls."
                : "The defenders hold. Come back stronger.",
            ],
          };
        }
        const node = isCastle ? castleRaidNode(site) : site.node;
        if (!node) return { lines: ["The battle is won."] };
        try {
          const r = await completeWorldRaid(node);
          if (isCastle) setCastleRaids(spendCastleRaid(heroId));
          refresh();
          const lines = rewardLines(r.reward);
          return { lines: lines.length ? lines : ["Raid complete."] };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
        }
      },
    });
  };

  const footerHint = castle
    ? "Drag to travel the realm — it never ends. Scroll to zoom, and win the fight to claim a node's reward."
    : "Drag to travel the realm — it never ends. Find an abandoned castle and teleport your own castle there.";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-2 backdrop-blur-sm md:p-4">
      <div className="game-panel anim-pop relative flex h-full w-full flex-col overflow-hidden">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border px-3 py-2 md:px-6 md:py-3">
          <h2 className="panel-title min-w-0 truncate text-xl font-bold md:text-3xl">World Map</h2>

          <div className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px] md:gap-2 md:text-xs">
            {(Object.keys(RAID_LIMITS) as RaidKind[]).map((kind) => (
              <span key={kind} className="slot flex items-center gap-1.5 px-2 py-1">
                <span className={`h-2.5 w-2.5 rounded-full ${KIND_STYLE[kind].dot}`} />
                {KIND_STYLE[kind].label}:{" "}
                <b>
                  {state ? raidsLeft(state, kind) : "–"}/{RAID_LIMITS[kind]}
                </b>
              </span>
            ))}
            <span className="slot flex items-center gap-1.5 px-2 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              Castle raids:{" "}
              <b>
                {castleRaids}/{CASTLE_RAIDS_PER_DAY}
              </b>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => zoomAt(1 / 1.35, size.w / 2, size.h / 2)}
              className="slot flex h-8 w-8 items-center justify-center"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => zoomAt(1.35, size.w / 2, size.h / 2)}
              className="slot flex h-8 w-8 items-center justify-center"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="btn-blood ml-1 flex h-9 w-9 items-center justify-center"
              aria-label="Close world map"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {error && (
          <p
            role="alert"
            className="absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded bg-background/90 px-3 py-1.5 text-xs text-blood shadow"
          >
            {error}
          </p>
        )}

        <div
          ref={stageRef}
          className="relative flex-1 touch-none select-none overflow-hidden"
          style={{
            cursor: drag.current ? "grabbing" : "grab",
            backgroundImage: `url(${mapImg})`,
            backgroundRepeat: "repeat",
            backgroundSize: `${MAP_W * cam.z}px ${MAP_H * cam.z}px`,
            backgroundPosition: `${size.w / 2 - cam.x * cam.z}px ${size.h / 2 - cam.y * cam.z}px`,
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            drag.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, z: cam.z };
            moved.current = false;
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (!moved.current && Math.abs(dx) + Math.abs(dy) < 6) return;
            if (!moved.current) {
              moved.current = true;
              try {
                stageRef.current?.setPointerCapture(e.pointerId);
              } catch {
                /* pointer capture is best effort */
              }
            }
            setCam((c) => ({ ...c, x: d.cx - dx / d.z, y: d.cy - dy / d.z }));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onClick={() => {
            if (!moved.current) setSelected(null);
          }}
        >
          {sites
            .filter((s) => s.id !== castle?.siteId)
            .map((site) => {
              const { ring, dot, Icon, label } = KIND_STYLE[site.kind];
              const p = screen(site.x, site.y);
              if (p.left < -60 || p.top < -60 || p.left > size.w + 60 || p.top > size.h + 60)
                return null;
              return (
                <button
                  key={site.id}
                  aria-label={`${site.name} (${label})`}
                  className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/70 ring-2 backdrop-blur-sm transition hover:scale-125 ${
                    ring
                  } ${selected?.id === site.id ? "scale-125" : ""}`}
                  style={{ left: p.left, top: p.top }}
                  onMouseEnter={() => setHover(site.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!moved.current) setSelected(site);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span
                    className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${dot}`}
                  />
                  {hover === site.id && (
                    <span
                      role="tooltip"
                      className="hotspot-label pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 whitespace-normal rounded px-2 py-1 text-left text-xs"
                    >
                      <b>{site.name}</b> · {label}
                      <span className="block text-[10px] text-foreground/80">{site.desc}</span>
                    </span>
                  )}
                </button>
              );
            })}

          {castle &&
            (() => {
              const p = screen(castle.x, castle.y);
              if (p.left < -60 || p.top < -60 || p.left > size.w + 60 || p.top > size.h + 60)
                return null;
              return (
                <span
                  className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/80 text-gold ring-2 ring-gold backdrop-blur-sm"
                  style={{ left: p.left, top: p.top }}
                  title="Your castle"
                >
                  <Crown className="h-5 w-5" />
                </span>
              );
            })()}

          {!castle && (
            <div className="absolute left-1/2 top-3 z-20 w-[min(92vw,26rem)] -translate-x-1/2 rounded border border-gold/40 bg-background/90 px-3 py-2 text-center shadow">
              <p className="text-xs">
                Your banner is not planted yet. Find an abandoned castle and teleport your castle
                there.
              </p>
              <button onClick={showRuin} className="btn-gold mt-2 px-3 py-1 text-xs">
                Show me the nearest ruin
              </button>
            </div>
          )}

          {selected && (
            <div
              className="game-panel absolute bottom-3 left-3 z-30 w-[min(92vw,25rem)] p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {KIND_STYLE[selected.kind].label} · {terrainName(selected.terrain)}
                  </p>
                  <h3 className="truncate font-display text-xl text-gold">{selected.name}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Dismiss site"
                  className="btn-ghost flex h-7 w-7 items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{selected.desc}</p>
              <p className="mt-1 text-xs">
                Danger <b className="text-gold">Lv {Math.max(selected.level, heroLevel)}</b>
                {selected.lord && (
                  <>
                    {" "}
                    · {selected.lord.name} · {selected.lord.power.toLocaleString()} power
                  </>
                )}
              </p>

              <div className="mt-2.5">
                {selected.kind === "ruin" ? (
                  castle?.siteId === selected.id ? (
                    <p className="text-xs text-gold">Your banner already flies here.</p>
                  ) : (
                    <button className="btn-gold w-full py-1.5" onClick={() => claim(selected)}>
                      Teleport castle here
                    </button>
                  )
                ) : selected.kind === "keep" ? (
                  <button
                    className="btn-gold w-full py-1.5"
                    disabled={castleRaids <= 0 || goldLeft <= 0}
                    onClick={() => raid(selected)}
                  >
                    Raid castle · {castleRaids}/{CASTLE_RAIDS_PER_DAY} left today
                  </button>
                ) : (
                  <button
                    className="btn-gold w-full py-1.5"
                    disabled={!state || raidsLeft(state, selected.kind as RaidKind) <= 0}
                    onClick={() => raid(selected)}
                  >
                    {state
                      ? `Raid ${KIND_STYLE[selected.kind].label} · ${raidsLeft(state, selected.kind as RaidKind)} left today`
                      : "Raid allowances offline"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground md:px-6">
          {footerHint}
        </p>
      </div>
    </div>
  );
}

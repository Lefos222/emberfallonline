import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Castle,
  Crown,
  Gem,
  Hammer,
  Landmark,
  Minus,
  Plus,
  Skull,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useGame } from "./store";
import type { StartBattle } from "./panels";
import { completeWorldRaid, loadWorldMap } from "./worldmap-services";
import {
  CASTLE_RAIDS_PER_DAY,
  RAID_LIMITS,
  SECTOR,
  WORLD_TILE,
  nearestRuin,
  raidsLeft,
  sitesInView,
  siteFoe,
  terrainAt,
  terrainName,
  type RaidKind,
  type SiteKind,
  type WorldMapState,
  type WorldSite,
} from "./worldmap";
import { buildTerrainTile } from "./worldTerrain";
import {
  castleRaidNode,
  castleRaidsLeft,
  loadMyCastle,
  placeCastle,
  spendCastleRaid,
} from "./worldcastles";

const MIN_ZOOM = 0.18;
const MAX_ZOOM = 3;

const KIND_ICON: Record<SiteKind, typeof Gem> = {
  gold: Gem,
  ore: Hammer,
  boss: Skull,
  keep: Castle,
  ruin: Landmark,
};
const KIND_LABEL: Record<SiteKind, string> = {
  gold: "Gold mine",
  ore: "Ore dungeon",
  boss: "World boss",
  keep: "Rival castle",
  ruin: "Abandoned castle",
};
const KIND_STYLE: Record<SiteKind, string> = {
  gold: "border-sky-400/80 text-sky-300",
  ore: "border-emerald-400/80 text-emerald-300",
  boss: "border-blood text-blood",
  keep: "border-gold text-gold",
  ruin: "border-muted-foreground/70 text-muted-foreground",
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
 * The World Tree opens the realm itself: a full-screen, endless map that is dragged
 * with the mouse and scrolled to zoom. Ground, mines, bosses, rival keeps and
 * abandoned castles are generated from the world coordinates, so the map has no edge;
 * the player's own castle is remembered (worldcastles.ts) and every raid still settles
 * on the server.
 */
export function WorldMap({
  onClose,
  start,
  muted,
  onToggleMute,
}: {
  onClose: () => void;
  start: StartBattle;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const { hero, heroId } = useGame();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const drag = useRef<null | {
    x: number;
    y: number;
    cx: number;
    cy: number;
    z: number;
    moved: boolean;
  }>(null);
  const moved = useRef(false);
  const centered = useRef(false);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState({ x: 0, y: 0, z: 0.8 });
  const [tile, setTile] = useState<HTMLCanvasElement | null>(null);
  const [ledger, setLedger] = useState<WorldMapState | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<WorldSite | null>(null);
  const [castle, setCastle] = useState(() => loadMyCastle(heroId));
  const [castleRaids, setCastleRaids] = useState(() => castleRaidsLeft(heroId));

  // The character can arrive a beat after the map opens; read its castle again then.
  useEffect(() => {
    setCastle(loadMyCastle(heroId));
    setCastleRaids(castleRaidsLeft(heroId));
  }, [heroId]);

  // The daily raid ledger (server owned). The map still pans when it cannot be read.
  useEffect(() => {
    let live = true;
    loadWorldMap()
      .then((s) => {
        if (live) setLedger(s);
      })
      .catch((e) => {
        if (live) setError(e instanceof Error ? e.message : "The raid ledger could not be read.");
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    setTile(buildTerrainTile());
  }, []);

  // The stage fills the viewport; the camera needs its pixel size to centre the world.
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
    setCam({ x: castle.x, y: castle.y, z: 0.85 });
  }, [size.w, castle]);

  useEffect(() => {
    const a = musicRef.current;
    if (!a) return;
    a.volume = 0.5;
    if (muted) {
      a.pause();
      return;
    }
    void a.play().catch(() => {});
  }, [muted]);

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

  const regions = useMemo(() => {
    if (size.w === 0) return [] as { key: string; name: string; x: number; y: number }[];
    const out: { key: string; name: string; x: number; y: number }[] = [];
    const sx0 = Math.floor(view.left / SECTOR),
      sx1 = Math.floor(view.right / SECTOR);
    const sy0 = Math.floor(view.top / SECTOR),
      sy1 = Math.floor(view.bottom / SECTOR);
    for (let sy = sy0; sy <= sy1; sy += 1) {
      for (let sx = sx0; sx <= sx1; sx += 1) {
        const x = (sx + 0.5) * SECTOR;
        const y = (sy + 0.5) * SECTOR;
        out.push({ key: `${sx}:${sy}`, name: terrainName(terrainAt(x, y)), x, y });
        if (out.length >= 24) return out;
      }
    }
    return out;
  }, [view, size.w]);

  // Repaint the ground for the current camera.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tile || size.w === 0 || size.h === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(size.w * dpr);
    const height = Math.round(size.h * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0d0b08";
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.imageSmoothingEnabled = true;

    const startX = Math.floor(view.left / WORLD_TILE);
    const endX = Math.floor(view.right / WORLD_TILE);
    const startY = Math.floor(view.top / WORLD_TILE);
    const endY = Math.floor(view.bottom / WORLD_TILE);
    for (let ty = startY; ty <= endY; ty += 1) {
      for (let tx = startX; tx <= endX; tx += 1) {
        const left = (tx * WORLD_TILE - cam.x) * cam.z + size.w / 2;
        const top = (ty * WORLD_TILE - cam.y) * cam.z + size.h / 2;
        ctx.drawImage(tile, left, top, WORLD_TILE * cam.z, WORLD_TILE * cam.z);
      }
    }
  }, [cam, size, tile, view]);

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
      zoomAt(Math.exp(-e.deltaY * 0.0014), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  if (!hero) return null;

  const heroLevel = hero.level + hero.paragon;
  const goldLeft = ledger ? raidsLeft(ledger, "gold") : 0;

  const claim = (site: WorldSite) => {
    const placed = placeCastle(heroId, site);
    if (!placed) return;
    setCastle(placed);
    setSelected(null);
    setCam((c) => ({ ...c, x: site.x, y: site.y, z: Math.max(c.z, 0.85) }));
  };

  const showRuin = () => {
    const ruin = nearestRuin(cam.x, cam.y);
    if (!ruin) return;
    setCam((c) => ({ ...c, x: ruin.x, y: ruin.y, z: Math.max(c.z, 0.85) }));
    setSelected(ruin);
  };

  const raid = (site: WorldSite) => {
    const isCastle = site.kind === "keep";
    if (isCastle) {
      if (castleRaidsLeft(heroId) <= 0) {
        setError("All three castle raids are spent — they refill at midnight UTC.");
        return;
      }
      if (!ledger || raidsLeft(ledger, "gold") <= 0) {
        setError("The daily raid allowance is spent — it refills at midnight UTC.");
        return;
      }
    } else if (!ledger || raidsLeft(ledger, site.kind as RaidKind) <= 0) {
      setError("The daily raid allowance is spent — it refills at midnight UTC.");
      return;
    }

    start({
      title: `${isCastle ? "Castle raid" : "World raid"} · ${site.name}`,
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
          setLedger((prev) => {
            if (!prev) return prev;
            const kind = node.split("-")[0] as RaidKind;
            return {
              ...prev,
              used: { ...prev.used, [kind]: (prev.used[kind] ?? 0) + 1 },
              nodes: [...prev.nodes, node],
            };
          });
          const lines = rewardLines(r.reward);
          return { lines: lines.length ? lines : ["Raid complete."] };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
        }
      },
    });
  };

  return (
    <div className="world-tree fixed inset-0 z-40 flex flex-col bg-[#0b0908]">
      <audio ref={musicRef} src="/world-tree-theme.mp3" loop preload="auto" />

      <header className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/60 bg-background/85 px-3 py-2 backdrop-blur">
        <button
          onClick={onClose}
          className="btn-blood flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label="Close world map"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="panel-title truncate font-display text-lg md:text-2xl">World Tree</h2>
          <p className="hidden text-[11px] text-muted-foreground md:block">
            The realm has no edge — drag to travel, scroll to zoom.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px]">
          {(Object.keys(RAID_LIMITS) as RaidKind[]).map((kind) => {
            const left = ledger ? raidsLeft(ledger, kind) : null;
            return (
              <span
                key={kind}
                className="slot flex items-center gap-1 px-2 py-1"
                title={`${KIND_LABEL[kind]} raids left today`}
              >
                {kind === "gold" ? (
                  <Gem className="h-3.5 w-3.5 text-sky-300" />
                ) : kind === "ore" ? (
                  <Hammer className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Skull className="h-3.5 w-3.5 text-blood" />
                )}
                <b>
                  {left ?? "–"}/{RAID_LIMITS[kind]}
                </b>
              </span>
            );
          })}
          <span
            className="slot flex items-center gap-1 px-2 py-1"
            title="Castle assaults left today"
          >
            <Castle className="h-3.5 w-3.5 text-gold" />
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
            onClick={onToggleMute}
            className="slot flex h-8 w-8 items-center justify-center"
            aria-label={muted ? "Unmute music" : "Mute music"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-gold" />}
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
        style={{ cursor: drag.current?.moved ? "grabbing" : "grab" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            cx: cam.x,
            cy: cam.y,
            z: cam.z,
            moved: false,
          };
          moved.current = false;
          try {
            stageRef.current?.setPointerCapture(e.pointerId);
          } catch {
            /* pointer capture is best effort */
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
          d.moved = true;
          moved.current = true;
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
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="world-vignette pointer-events-none absolute inset-0" />

        {regions.map((r) => (
          <span key={r.key} className="world-region-label font-display" style={screen(r.x, r.y)}>
            {r.name}
          </span>
        ))}

        {sites
          .filter((s) => s.id !== castle?.siteId)
          .map((site) => {
            const Icon = KIND_ICON[site.kind];
            const p = screen(site.x, site.y);
            if (p.left < -80 || p.top < -80 || p.left > size.w + 80 || p.top > size.h + 80)
              return null;
            return (
              <button
                key={site.id}
                type="button"
                data-site
                aria-label={`${site.name}, ${KIND_LABEL[site.kind]}`}
                className={`world-site ${KIND_STYLE[site.kind]} ${selected?.id === site.id ? "is-selected" : ""}`}
                style={{ left: p.left, top: p.top }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!moved.current) setSelected(site);
                }}
              >
                <Icon className="h-4 w-4" />
                {cam.z > 0.5 && <span className="world-site-name">{site.name}</span>}
              </button>
            );
          })}

        {castle &&
          (() => {
            const p = screen(castle.x, castle.y);
            if (p.left < -100 || p.top < -100 || p.left > size.w + 100 || p.top > size.h + 100)
              return null;
            return (
              <span className="world-castle" style={{ left: p.left, top: p.top }}>
                <Crown className="h-5 w-5" />
                <span className="world-site-name">Your castle</span>
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

        {!ledger && (
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded bg-background/85 px-3 py-1 text-[11px] text-muted-foreground">
            Daily raid allowances are offline — the map is still yours to explore.
          </div>
        )}

        <div className="world-legend absolute bottom-3 right-3 z-10 hidden rounded border border-border/60 bg-background/85 px-2.5 py-2 text-[10px] md:block">
          {(["gold", "ore", "boss", "keep", "ruin"] as SiteKind[]).map((kind) => {
            const Icon = KIND_ICON[kind];
            return (
              <span key={kind} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {KIND_LABEL[kind]}
              </span>
            );
          })}
        </div>

        {selected && (
          <div
            className="world-site-card game-panel absolute bottom-3 left-3 z-30 w-[min(92vw,25rem)] p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {KIND_LABEL[selected.kind]} · {terrainName(selected.terrain)}
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
                  disabled={!ledger || raidsLeft(ledger, selected.kind as RaidKind) <= 0}
                  onClick={() => raid(selected)}
                >
                  {ledger
                    ? `Raid ${KIND_LABEL[selected.kind]} · ${raidsLeft(ledger, selected.kind as RaidKind)} left today`
                    : "Raid allowances offline"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

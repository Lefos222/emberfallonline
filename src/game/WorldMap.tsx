import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Castle,
  Compass,
  Crown,
  Flag,
  Gem,
  Hammer,
  Landmark,
  Minus,
  PackageOpen,
  Plus,
  ScrollText,
  Skull,
  X,
} from "lucide-react";
import mapImg from "@/assets/world-map.jpg";
import { update, useGame } from "./store";
import type { StartBattle } from "./panels";
import { completeWorldRaid, loadWorldMap } from "./worldmap-services";
import {
  CASTLE_RAIDS_PER_DAY,
  RAID_LIMITS,
  WORLD_H,
  WORLD_SITES,
  WORLD_W,
  cacheReward,
  clampCamera,
  clusterMarkers,
  fitZoom,
  nearestRuin,
  raidsLeft,
  regionAt,
  siteFoe,
  sitesInView,
  zoomCamera,
  type Camera,
  type RaidKind,
  type SiteKind,
  type StageSize,
  type WorldMapState,
  type WorldSite,
} from "./worldmap";
import {
  bountiesReady,
  bountyBoard,
  bountyLedger,
  bountyProgress,
  claimBounty,
  openVault,
  recordBounty,
  vaultClaimed,
  type Bounty,
  type BountyKind,
} from "./worldtree";
import {
  castleRaidNode,
  castleRaidsLeft,
  inWorld,
  loadMyCastle,
  loadWorldBanners,
  plantBanner,
  spendCastleRaid,
  type MyCastle,
  type WorldBanner,
} from "./worldcastles";

const KIND_STYLE: Record<SiteKind, { ring: string; dot: string; label: string; Icon: typeof Gem }> = {
  gold: { ring: "ring-sky-400", dot: "bg-sky-400", label: "Gold mine", Icon: Gem },
  ore: { ring: "ring-emerald-400", dot: "bg-emerald-400", label: "Ore dungeon", Icon: Hammer },
  boss: { ring: "ring-blood", dot: "bg-blood", label: "World boss", Icon: Skull },
  keep: { ring: "ring-gold", dot: "bg-gold", label: "Rival castle", Icon: Castle },
  ruin: { ring: "ring-muted-foreground", dot: "bg-muted-foreground", label: "Abandoned castle", Icon: Landmark },
  landmark: { ring: "ring-amber-300", dot: "bg-amber-300", label: "Landmark", Icon: Compass },
  cache: { ring: "ring-violet-400", dot: "bg-violet-400", label: "Sealed vault", Icon: PackageOpen },
};

const rewardLines = (reward: Record<string, unknown>) =>
  Object.entries(reward).flatMap(([k, v]) =>
    typeof v === "number"
      ? [`+${v.toLocaleString()} ${k}`]
      : v && typeof v === "object"
        ? Object.entries(v as Record<string, number>).map(([m, n]) => `+${n} ${m}`)
        : [],
  );

/**
 * The World Tree's map: one painted realm with an edge.
 *
 * The art is the whole world — mines, ore dungeons, world bosses, rival keeps,
 * ruins and painted landmarks all stand on it, and nothing exists past the frame.
 * Drag to travel, scroll to zoom out to the whole realm or in to a single banner.
 * Every hero plants one castle on it, so banners are read from the realm registry
 * and clustered by zoom so thousands of them stay readable.
 */
export function WorldMap({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero, heroId } = useGame();
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | { x: number; y: number; cx: number; cy: number; z: number }>(null);
  const moved = useRef(false);
  const seeded = useRef(false);

  const [size, setSize] = useState<StageSize>({ w: 0, h: 0 });
  const [cam, setCam] = useState<Camera>({ x: WORLD_W / 2, y: WORLD_H / 2, z: 0.2 });
  const [state, setState] = useState<WorldMapState | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorldSite | null>(null);
  const [picked, setPicked] = useState<WorldBanner | null>(null);
  const [planting, setPlanting] = useState(false);
  const [showBounties, setShowBounties] = useState(false);
  const [castle, setCastle] = useState(() => loadMyCastle(heroId));
  const [castleRaids, setCastleRaids] = useState(() => castleRaidsLeft(heroId));
  const [banners, setBanners] = useState<WorldBanner[]>([]);

  // The character can arrive a beat after the map opens; read its castle again then.
  useEffect(() => {
    setCastle(loadMyCastle(heroId));
    setCastleRaids(castleRaidsLeft(heroId));
  }, [heroId]);

  const refresh = useCallback(() => {
    loadWorldMap()
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : "The raid ledger could not be read."));
  }, []);
  useEffect(refresh, [refresh]);

  const refreshBanners = useCallback(() => {
    loadWorldBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);
  useEffect(refreshBanners, [refreshBanners]);

  // Other lords plant and move their banners while the map is open, so the realm is
  // re-read on a short cycle and whenever the tab comes back to the front.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refreshBanners();
    };
    const id = window.setInterval(tick, 10000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refreshBanners]);

  // The stage fills the panel; the camera needs its pixel size to frame the realm.
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

  // Open on the whole realm, or on the player's own castle when it already stands.
  useEffect(() => {
    if (seeded.current || size.w === 0 || size.h === 0) return;
    seeded.current = true;
    const fit = fitZoom(size);
    setCam(
      clampCamera(
        castle ? { x: castle.x, y: castle.y, z: fit * 2.6 } : { x: WORLD_W / 2, y: WORLD_H / 2, z: fit },
        size,
      ),
    );
  }, [size, castle]);

  const view = useMemo(
    () => ({
      left: cam.x - size.w / 2 / cam.z,
      top: cam.y - size.h / 2 / cam.z,
      right: cam.x + size.w / 2 / cam.z,
      bottom: cam.y + size.h / 2 / cam.z,
    }),
    [cam, size],
  );

  const screen = useCallback(
    (x: number, y: number) => ({
      left: (x - cam.x) * cam.z + size.w / 2,
      top: (y - cam.y) * cam.z + size.h / 2,
    }),
    [cam, size],
  );

  const onStage = ({ left, top }: { left: number; top: number }) =>
    left > -70 && top > -70 && left < size.w + 70 && top < size.h + 70;

  const visibleSites = useMemo(
    () => (size.w > 0 ? sitesInView(view.left, view.top, view.right, view.bottom) : []),
    [view, size.w],
  );

  // Markers that would share a few pixels collapse into one badge; zooming in splits them.
  const siteClusters = useMemo(() => {
    const cell = cam.z < 0.4 ? 60 : cam.z < 0.8 ? 42 : cam.z < 1.4 ? 26 : 0;
    return clusterMarkers(visibleSites, screen, cell);
  }, [visibleSites, screen, cam.z]);

  const bannerClusters = useMemo(() => {
    // Zoomed out to the whole realm the badges would bury the art; the header keeps the count.
    if (cam.z < 0.5) return [];
    const cell = cam.z < 0.9 ? 34 : 0;
    const shown = banners
      .filter((b) => b.heroId !== heroId)
      .filter((b) => b.x >= view.left && b.x <= view.right && b.y >= view.top && b.y <= view.bottom)
      .map((b) => ({ id: b.heroId, x: b.x, y: b.y, banner: b }));
    return clusterMarkers(shown, screen, cell);
  }, [banners, heroId, screen, view, cam.z]);

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => setCam((c) => zoomCamera(c, size, factor, px, py)),
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

  const bounties = bountyBoard(heroLevel);
  const ledger = bountyLedger(hero);
  const claimable = bountiesReady(hero, heroLevel);

  const claim = (bounty: Bounty) => {
    let paid = 0;
    update((h) => {
      paid = claimBounty(h, bounty);
    });
    if (paid) setNote(`Bounty paid: +${paid.toLocaleString("en-GB")} gold.`);
    else setError("That bounty is not finished yet.");
  };

  const focus = (x: number, y: number, z = cam.z) =>
    setCam((c) => clampCamera({ x, y, z }, size));

  const worldPoint = (px: number, py: number) => ({
    x: cam.x + (px - size.w / 2) / cam.z,
    y: cam.y + (py - size.h / 2) / cam.z,
  });

  const plant = async (x: number, y: number) => {
    if (!inWorld(x, y)) {
      setError("That ground lies beyond the realm.");
      return;
    }
    const done = await plantBanner(heroId, x, y, `${hero.name}'s Hold`);
    setCastle(done.castle);
    setPlanting(false);
    setSelected(null);
    focus(done.castle.x, done.castle.y, Math.max(cam.z, 1));
    setNote(
      done.synced
        ? "Your banner flies over the realm — every traveller can see it."
        : `Planted on this device. The realm registry did not answer (${done.error ?? "offline"}).`,
    );
    if (done.synced) refreshBanners();
  };

  const showRuin = () => {
    const ruin = nearestRuin(cam.x, cam.y);
    if (!ruin) return;
    focus(ruin.x, ruin.y, Math.max(cam.z, 0.9));
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
          const bountyKind: BountyKind = isCastle ? "castle" : (site.kind as BountyKind);
          update((h) => recordBounty(h, bountyKind));
          const lines = rewardLines(r.reward);
          return { lines: lines.length ? lines : ["Raid complete."] };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
        }
      },
    });
  };

  const breakSeal = (site: WorldSite) => {
    if (vaultClaimed(hero, site.id)) {
      setError("This vault is already broken — its seal is spent.");
      return;
    }
    start({
      title: `World Map · ${site.name}`,
      right: siteFoe(site, heroLevel),
      onResult: (won) => {
        if (!won) return { lines: ["The vault warden holds the seal. Come back stronger."] };
        const reward = cacheReward(site, heroLevel);
        let paid = false;
        update((h) => {
          paid = openVault(h, site.id, reward);
        });
        return {
          lines: paid
            ? [
                `+${reward.gold.toLocaleString("en-GB")} gold`,
                `${reward.mats.ore} Ember Ore`,
                `${reward.mats.essence} Soul Essence`,
              ]
            : ["The seal was already broken."],
        };
      },
    });
  };

  const worldLeft = (0 - cam.x) * cam.z + size.w / 2;
  const worldTop = (0 - cam.y) * cam.z + size.h / 2;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-2 backdrop-blur-sm md:p-4">
      <div className="game-panel anim-pop relative flex h-full w-full flex-col overflow-hidden">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border px-3 py-2 md:px-6 md:py-3">
          <h2 className="panel-title min-w-0 truncate text-xl font-bold md:text-3xl">The World Tree</h2>

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
              Castle raids: <b>{castleRaids}/{CASTLE_RAIDS_PER_DAY}</b>
            </span>
            <span className="slot flex items-center gap-1.5 px-2 py-1" title="Banners planted by players">
              <Flag className="h-3 w-3 text-gold" /> Banners: <b>{banners.length}</b>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setShowBounties((s) => !s)}
              className={`flex h-8 items-center gap-1 px-2 text-[11px] ${showBounties ? "btn-gold" : "btn-ghost"}`}
              aria-pressed={showBounties}
            >
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Bounties{claimable > 0 ? ` · ${claimable}` : ""}</span>
              {claimable > 0 && (
                <span className="rounded-full bg-gold px-1 text-[9px] font-bold text-background sm:hidden">
                  {claimable}
                </span>
              )}
            </button>
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
              onClick={() => setCam(clampCamera({ x: WORLD_W / 2, y: WORLD_H / 2, z: fitZoom(size) }, size))}
              className="slot flex h-8 items-center gap-1 px-2 text-[11px]"
              aria-label="Show the whole realm"
            >
              <Compass className="h-4 w-4" /> Realm
            </button>
            <button
              onClick={() => setPlanting((p) => !p)}
              className={`flex h-8 items-center gap-1 px-2 text-[11px] ${planting ? "btn-gold" : "btn-ghost"}`}
              aria-pressed={planting}
            >
              <Flag className="h-4 w-4" /> {castle ? "Move banner" : "Plant banner"}
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

        {(error || note) && (
          <p
            role="alert"
            className="absolute left-1/2 top-20 z-30 max-w-[92%] -translate-x-1/2 rounded bg-background/90 px-3 py-1.5 text-center text-xs text-gold shadow"
          >
            {error || note}
            <button
              className="ml-2 text-muted-foreground underline"
              onClick={() => {
                setError("");
                setNote("");
              }}
            >
              dismiss
            </button>
          </p>
        )}

        <div
          ref={stageRef}
          className={`relative flex-1 touch-none select-none overflow-hidden ${
            planting ? "cursor-crosshair" : drag.current ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            background:
              "radial-gradient(circle at 50% 40%, hsl(var(--muted) / 0.55), hsl(var(--background)) 72%)",
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
            setCam(clampCamera({ x: d.cx - dx / d.z, y: d.cy - dy / d.z, z: d.z }, size));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onClick={(e) => {
            if (moved.current) return;
            if (planting) {
              const rect = e.currentTarget.getBoundingClientRect();
              const p = worldPoint(e.clientX - rect.left, e.clientY - rect.top);
              void plant(p.x, p.y);
              return;
            }
            setSelected(null);
            setPicked(null);
            setShowBounties(false);
          }}
        >
          <div
            aria-hidden
            className="absolute bg-cover bg-center shadow-[0_0_0_2px_rgba(0,0,0,0.55),0_18px_60px_rgba(0,0,0,0.5)]"
            style={{
              left: worldLeft,
              top: worldTop,
              width: WORLD_W * cam.z,
              height: WORLD_H * cam.z,
              backgroundImage: `url(${mapImg})`,
            }}
          />

          {siteClusters.map((cluster) => {
            const p = screen(cluster.x, cluster.y);
            if (!onStage(p)) return null;
            const lead = cluster.items.length === 1 ? cluster.items[0]! : null;
            const kinds = new Set(cluster.items.map((s) => s.kind));
            if (cluster.items.length > 1) {
              const primary = cluster.items.find((s) => s.kind === "gold") ?? cluster.items[0]!;
              const { ring, Icon } = KIND_STYLE[primary.kind];
              return (
                <button
                  key={cluster.key}
                  aria-label={`${cluster.items.length} places of interest`}
                  className={`absolute z-10 flex h-9 min-w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full border border-background/60 bg-background/80 px-2 ring-2 backdrop-blur-sm transition hover:scale-110 ${ring}`}
                  style={{ left: p.left, top: p.top }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (moved.current) return;
                    zoomAt(2.2, p.left, p.top);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <b className="text-[11px]">{cluster.items.length}</b>
                </button>
              );
            }
            if (!lead) return null;
            const { ring, dot, Icon, label } = KIND_STYLE[lead.kind];
            const multi = kinds.size > 1;
            return (
              <button
                key={cluster.key}
                aria-label={`${lead.name} (${label})`}
                className={`absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/70 ring-2 backdrop-blur-sm transition hover:scale-125 ${ring} ${
                  selected?.id === lead.id ? "scale-125" : ""
                }`}
                style={{ left: p.left, top: p.top }}
                onMouseEnter={() => setHover(lead.id)}
                onMouseLeave={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (moved.current) return;
                  setPicked(null);
                  setShowBounties(false);
                  setSelected(lead);
                }}
              >
                <Icon className="h-4 w-4" />
                <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${dot}`} />
                {hover === lead.id && !multi && (
                  <span
                    role="tooltip"
                    className="hotspot-label pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 whitespace-normal rounded px-2 py-1 text-left text-xs"
                  >
                    <b>{lead.name}</b> · {label}
                    <span className="block text-[10px] text-foreground/80">{lead.desc}</span>
                  </span>
                )}
              </button>
            );
          })}

          {bannerClusters.map((cluster) => {
            const p = screen(cluster.x, cluster.y);
            if (!onStage(p)) return null;
            const lead = cluster.items[0]!.banner;
            return (
              <button
                key={cluster.key}
                aria-label={
                  cluster.items.length > 1
                    ? `${cluster.items.length} player castles`
                    : `${lead.name} · level ${lead.level}`
                }
                className="absolute flex h-4 min-w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border border-gold/40 bg-background/70 px-0.5 text-gold ring-1 ring-gold/60 backdrop-blur-sm transition hover:scale-125"
                style={{ left: p.left, top: p.top }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (moved.current) return;
                  if (cluster.items.length > 1) {
                    zoomAt(2.2, p.left, p.top);
                    return;
                  }
                  setSelected(null);
                  setPicked(lead);
                }}
              >
                <Crown className="h-2.5 w-2.5" />
                {cluster.items.length > 1 && <b className="text-[9px] leading-none">{cluster.items.length}</b>}
              </button>
            );
          })}

          {castle && (
            (() => {
              const p = screen(castle.x, castle.y);
              if (!onStage(p)) return null;
              return (
                <span
                  className="pointer-events-none absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/80 text-gold ring-2 ring-gold backdrop-blur-sm"
                  style={{ left: p.left, top: p.top }}
                  title="Your castle"
                >
                  <Crown className="h-5 w-5" />
                </span>
              );
            })()
          )}

          {!castle && !planting && (
            <div
              className="absolute left-1/2 top-3 z-20 w-[min(92vw,26rem)] -translate-x-1/2 rounded border border-gold/40 bg-background/90 px-3 py-2 text-center shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs">
                Your banner is not planted yet. Plant it anywhere in the realm — or on an abandoned
                castle.
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button onClick={() => setPlanting(true)} className="btn-gold px-3 py-1 text-xs">
                  Plant my banner
                </button>
                <button onClick={showRuin} className="btn-ghost px-3 py-1 text-xs">
                  Nearest ruin
                </button>
              </div>
            </div>
          )}

          {planting && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded border border-gold/50 bg-background/90 px-3 py-1.5 text-center text-xs text-gold shadow">
              Tap anywhere in the realm to raise your banner
            </div>
          )}

          {showBounties && (
            <div
              className="game-panel absolute bottom-3 right-3 z-30 w-[min(92vw,23rem)] p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bounty board</p>
                  <h3 className="font-display text-xl text-gold">Today in the realm</h3>
                </div>
                <button
                  onClick={() => setShowBounties(false)}
                  aria-label="Dismiss bounties"
                  className="btn-ghost flex h-7 w-7 items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Three bounties rotate every UTC day with the raid allowances.
              </p>
              {bounties.map((bounty) => {
                const progress = bountyProgress(hero, bounty.kind);
                const paid = ledger.claimed.includes(bounty.id);
                const ready = !paid && progress >= bounty.need;
                return (
                  <div key={bounty.id} className="mt-2 rounded border border-border/70 px-2 py-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold">{bounty.title}</p>
                      <p className="text-[11px] text-gold">+{bounty.gold.toLocaleString("en-GB")} gold</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{bounty.blurb}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px]">
                        {Math.min(progress, bounty.need)}/{bounty.need}
                      </span>
                      {paid ? (
                        <span className="ml-auto text-[11px] text-muted-foreground">Paid</span>
                      ) : (
                        <button
                          className="btn-gold ml-auto px-2 py-0.5 text-[11px]"
                          disabled={!ready}
                          onClick={() => claim(bounty)}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {picked && (
            <div
              className="game-panel absolute bottom-3 left-3 z-30 w-[min(92vw,22rem)] p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Player castle</p>
                  <h3 className="truncate font-display text-xl text-gold">{picked.name}</h3>
                </div>
                <button
                  onClick={() => setPicked(null)}
                  aria-label="Dismiss castle"
                  className="btn-ghost flex h-7 w-7 items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Level {picked.level} · {regionAt(picked.x, picked.y).name}
              </p>
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
                    {KIND_STYLE[selected.kind].label} · {regionAt(selected.x, selected.y).name}
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
                {selected.kind === "cache" ? (
                  vaultClaimed(hero, selected.id) ? (
                    <p className="text-xs text-muted-foreground">
                      The seal is broken — this vault stands empty for you.
                    </p>
                  ) : (
                    <button className="btn-gold w-full py-1.5" onClick={() => breakSeal(selected)}>
                      Break the seal · one-time hoard
                    </button>
                  )
                ) : selected.kind === "landmark" ? (
                  <p className="text-xs text-muted-foreground">
                    A painted wonder of the realm — no raid here, only the view.
                  </p>
                ) : selected.kind === "ruin" ? (
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-gold flex-1 py-1.5" onClick={() => void plant(selected.x, selected.y)}>
                      {castle ? "Move banner here" : "Plant banner here"}
                    </button>
                    <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setPlanting(true)}>
                      Pick another spot
                    </button>
                  </div>
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
          {WORLD_SITES.length} places of interest stand on one bounded realm — mines, ore dungeons,
          world bosses, rival castles, ruins, sealed vaults and painted wonders. Drag to travel, scroll
          or pinch the buttons to zoom, take the day's bounties, and plant your own castle anywhere on
          it. Banners are shared: every hero the realm holds can raise one.
        </p>
      </div>
    </div>
  );
}

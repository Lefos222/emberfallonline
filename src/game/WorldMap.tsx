import { useEffect, useRef, useState } from "react";
import { Castle, Compass, Crown, Gem, Loader2, Mountain, Move, X } from "lucide-react";
import { Sprite } from "./Sprite";
import { fmt } from "./ui";
import { CLASSES, type HeroClass } from "./data";
import { useGame } from "./store";
import {
  CASTLE_MOVES_PER_DAY, CASTLE_PLOTS, WORLD_BOSSES, WORLD_MONSTERS, WORLD_NODES, WORLD_ZONES,
  plotOf, zoneName, type FoeKind,
} from "./world-map";
import { castleMovesLeft, loadWorldCastles, moveCastle, myCastle, type WorldCastle } from "./world-map-services";

/** The map plane is drawn this many pixels wide; the camera scales and pans it. */
const PLANE = { w: 2600, h: 1740 };
const MIN_K = 0.5, MAX_K = 1.6;

const KIND: Record<FoeKind, { label: string; color: string }> = {
  beast: { label: "Beast", color: "var(--r1)" },
  undead: { label: "Undead", color: "var(--xp)" },
  demon: { label: "Demon", color: "var(--r5)" },
  elite: { label: "Elite", color: "var(--r3)" },
  boss: { label: "World boss", color: "var(--r4)" },
};

type Selection =
  | { kind: "castle"; heroId: string }
  | { kind: "monster"; id: string }
  | { kind: "plot"; plotId: string };

function centreOn(x: number, y: number, k: number) {
  return { x: -(x / 100 - 0.5) * PLANE.w * k, y: -(y / 100 - 0.5) * PLANE.h * k };
}
function camClamp(view: HTMLDivElement | null, x: number, y: number, k: number) {
  if (!view) return { x, y };
  const mx = Math.max(0, (PLANE.w * k - view.clientWidth) / 2);
  const my = Math.max(0, (PLANE.h * k - view.clientHeight) / 2);
  return { x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
}

/**
 * The world around the player's castle: the regions, the monsters standing in them, the
 * gathering grounds — and every other player's castle, drawn where it really is.
 * The World Tree in the castle opens this.
 */
export function WorldMap({ onClose }: { onClose: () => void }) {
  const { heroId } = useGame();
  const view = useRef<HTMLDivElement>(null);
  const drag = useRef<null | { x: number; y: number; ox: number; oy: number }>(null);
  const dragged = useRef(false);
  const centred = useRef(false);
  const [cam, setCam] = useState(() => ({ ...centreOn(50, 50, 1), k: 1 }));
  const [castles, setCastles] = useState<WorldCastle[] | null>(null);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<Selection | null>(null);
  const [relocating, setRelocating] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = myCastle(castles, heroId);
  const movesLeft = castleMovesLeft(mine);
  const home = mine ? plotOf(mine.plot) : undefined;

  useEffect(() => {
    let alive = true;
    void loadWorldCastles()
      .then((rows) => { if (alive) setCastles(rows); })
      .catch((e) => {
        if (!alive) return;
        setCastles([]);
        setError(e instanceof Error ? e.message : "The world map could not be loaded.");
      });
    return () => { alive = false; };
  }, []);

  // Open on the player's own castle the first time the map is drawn.
  useEffect(() => {
    if (centred.current || !castles) return;
    centred.current = true;
    const at = mine ? plotOf(mine.plot) : undefined;
    setCam((c) => ({ ...centreOn(at?.x ?? 50, at?.y ?? 50, c.k), k: c.k }));
  }, [castles, mine]);

  const zoom = (step: number) =>
    setCam((c) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, Math.round((c.k + step) * 100) / 100));
      const scaled = { x: (c.x * k) / c.k, y: (c.y * k) / c.k };
      return { ...camClamp(view.current, scaled.x, scaled.y, k), k };
    });

  const recentre = () =>
    setCam((c) => ({ ...centreOn(home?.x ?? 50, home?.y ?? 50, c.k), k: c.k }));

  const choose = (p: Selection) => { if (dragged.current) return; setSel(p); setPending(null); };

  const applyMove = async (plotId: string) => {
    setBusy(true);
    setError("");
    try {
      await moveCastle(plotId);
      setCastles(await loadWorldCastles());
      setPending(null);
      setRelocating(false);
      setSel({ kind: "castle", heroId: heroId ?? "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your castle could not be moved.");
    } finally {
      setBusy(false);
    }
  };

  const plotsHere = (plotId: string) => (castles ?? []).filter((c) => c.plot === plotId);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <header className="game-panel m-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-4">
        <div className="min-w-0">
          <h2 className="panel-title truncate text-lg font-bold md:text-2xl">World Map</h2>
          <p className="truncate text-xs text-muted-foreground">
            {WORLD_ZONES.length} regions · {WORLD_MONSTERS.length + WORLD_BOSSES.length} monster lairs · {castles?.length ?? 0} player castles
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn-ghost h-9 px-3" onClick={() => zoom(-0.15)} aria-label="Zoom out">−</button>
          <button className="btn-ghost h-9 px-3" onClick={() => zoom(0.15)} aria-label="Zoom in">+</button>
          <button className="btn-ghost h-9 px-3" onClick={recentre} aria-label="Centre on my castle"><Compass className="h-4 w-4" /></button>
          <button
            className="btn-gold h-9 px-3"
            disabled={busy || movesLeft === 0}
            onClick={() => { setRelocating((r) => !r); setPending(null); setSel(null); }}
          >
            <Move className="mr-1 inline h-4 w-4" />
            {relocating ? "Cancel move" : mine ? `Move castle (${movesLeft}/${CASTLE_MOVES_PER_DAY})` : "Place castle"}
          </button>
          <button className="btn-blood flex h-9 w-9 items-center justify-center" onClick={onClose} aria-label="Close the world map"><X className="h-5 w-5" /></button>
        </div>
      </header>

      {error && <p role="alert" className="game-panel mx-2 mb-2 px-3 py-2 text-sm text-hp">{error}</p>}
      {relocating && (
        <p role="status" className="game-panel mx-2 mb-2 px-3 py-2 text-sm text-gold">
          {mine
            ? `Choose a glowing plot to raise your castle. ${movesLeft} of ${CASTLE_MOVES_PER_DAY} moves left today (they reset at 00:00 UTC).`
            : "Choose a glowing plot to place your castle for the first time — placing it is free."}
        </p>
      )}

      <div
        ref={view}
        className="world-map-view relative flex-1"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, ox: cam.x, oy: cam.y };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x, dy = e.clientY - d.y;
          if (Math.abs(dx) + Math.abs(dy) < 6) return;
          dragged.current = true;
          setCam((c) => ({ ...camClamp(view.current, d.ox + dx, d.oy + dy, c.k), k: c.k }));
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div
          className="world-map-plane"
          style={{
            width: PLANE.w, height: PLANE.h, marginLeft: -PLANE.w / 2, marginTop: -PLANE.h / 2,
            transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.k})`,
          }}
        >
          {WORLD_ZONES.map((z) => (
            <div key={z.id} className={`world-zone zone-${z.terrain}`} style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}>
              <span className="world-zone-name">{z.name}</span>
              <span className="world-zone-meta">Lv {z.level[0]}–{z.level[1]}</span>
            </div>
          ))}

          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold"
              style={{ left: `${(i * 23) % 100}%`, animationDuration: `${7 + (i % 5)}s`, animationDelay: `${i * 0.6}s` }} />
          ))}

          {WORLD_NODES.map((n) => (
            <button
              key={n.id}
              className="world-marker world-node"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              title={`${n.name} · ${zoneName(n.zone)} · ${n.note}`}
              aria-label={`${n.name}, ${zoneName(n.zone)}`}
              onClick={() => choose({ kind: "monster", id: n.id })}
            >
              {n.kind === "resource" ? <Gem className="h-4 w-4" /> : <Mountain className="h-4 w-4" />}
            </button>
          ))}

          {WORLD_MONSTERS.map((m) => (
            <button
              key={m.id}
              className={`world-marker world-foe ${sel && sel.kind === "monster" && sel.id === m.id ? "world-marker-on" : ""}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              title={`${m.name} · Lv ${m.level} ${KIND[m.kind].label}`}
              aria-label={`${m.name}, level ${m.level}, ${KIND[m.kind].label}`}
              onClick={() => choose({ kind: "monster", id: m.id })}
            >
              <Sprite rect={m.sprite} className="w-9 md:w-11" />
              <span className="world-marker-level">{m.level}</span>
            </button>
          ))}

          {WORLD_BOSSES.map((b) => (
            <button
              key={b.id}
              className={`world-marker world-foe world-boss ${sel && sel.kind === "monster" && sel.id === b.id ? "world-marker-on" : ""}`}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              title={`${b.name} · Lv ${b.level} world boss`}
              aria-label={`${b.name}, level ${b.level}, world boss`}
              onClick={() => choose({ kind: "monster", id: b.id })}
            >
              <Sprite rect={b.sprite} className="w-20 md:w-24" />
              <span className="world-boss-flag"><Crown className="h-3 w-3" /> Lv {b.level}</span>
            </button>
          ))}

          {relocating && CASTLE_PLOTS.map((p) => (
            <button
              key={p.id}
              className={`world-plot ${mine?.plot === p.id ? "world-plot-mine" : "world-plot-free"} ${pending === p.id ? "world-plot-pending" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={`Castle plot in ${zoneName(p.zone)}`}
              title={`${zoneName(p.zone)}${plotsHere(p.id).length ? ` · ${plotsHere(p.id).length} castle(s) here` : " · empty plot"}`}
              onClick={() => choose({ kind: "plot", plotId: p.id })}
            >
              <Castle className="h-4 w-4" />
            </button>
          ))}

          {(castles ?? []).map((c) => {
            const plot = plotOf(c.plot);
            if (!plot) return null;
            const cluster = plotsHere(c.plot);
            const i = cluster.findIndex((x) => x.heroId === c.heroId);
            const isMine = c.heroId === heroId;
            return (
              <button
                key={c.heroId}
                className={`world-marker world-castle ${isMine ? "world-castle-mine" : ""} ${sel && sel.kind === "castle" && sel.heroId === c.heroId ? "world-marker-on" : ""}`}
                style={{ left: `${plot.x + ((i % 3) - 1) * 1.7}%`, top: `${plot.y + Math.floor(i / 3) * 2}%` }}
                title={`${c.owner} · Lv ${c.level} · ${zoneName(plot.zone)}`}
                aria-label={`Castle of ${c.owner}, level ${c.level}, ${zoneName(plot.zone)}`}
                onClick={() => { choose({ kind: "castle", heroId: c.heroId }); setRelocating(false); }}
              >
                <Castle className="h-5 w-5" />
                <span className="world-marker-name">{isMine ? "Your castle" : c.owner}</span>
              </button>
            );
          })}
        </div>

        {castles === null && (
          <p role="status" className="absolute inset-0 flex items-center justify-center gap-2 font-display text-lg">
            <Loader2 className="h-5 w-5 animate-spin" /> Charting the world…
          </p>
        )}
      </div>

      <section className="game-panel absolute inset-x-2 bottom-2 z-10 max-h-[46vh] overflow-y-auto p-3 md:inset-x-auto md:right-2 md:bottom-2 md:w-96">
        <Detail
          sel={sel}
          castles={castles}
          mine={mine}
          movesLeft={movesLeft}
          busy={busy}
          pending={pending}
          relocating={relocating}
          onStartMove={() => { setRelocating(true); setSel(null); setPending(null); }}
          onCancelMove={() => { setRelocating(false); setPending(null); setSel(null); }}
          onConfirm={(plotId) => void applyMove(plotId)}
        />
      </section>
    </div>
  );
}

function Detail({ sel, castles, mine, movesLeft, busy, pending, relocating, onStartMove, onCancelMove, onConfirm }: {
  sel: Selection | null; castles: WorldCastle[] | null; mine: WorldCastle | null; movesLeft: number;
  busy: boolean; pending: string | null; relocating: boolean;
  onStartMove: () => void; onCancelMove: () => void; onConfirm: (plotId: string) => void;
}) {
  if (sel && sel.kind === "castle") {
    const c = (castles ?? []).find((x) => x.heroId === sel.heroId);
    const plot = c ? plotOf(c.plot) : undefined;
    if (!c || !plot) return <p className="text-sm text-muted-foreground">That castle has moved. Select it again to see where it stands.</p>;
    const isMine = mine?.heroId === c.heroId;
    const cls = CLASSES[c.cls as HeroClass]?.name ?? "Adventurer";
    return (
      <div className="anim-pop">
        <h3 className="panel-title text-lg font-bold">{c.owner}{isMine && <span className="ml-2 text-xs text-gold">Your castle</span>}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{cls} · Level {c.level} · {fmt(c.power)} power · {c.gender === "female" ? "Lady" : "Lord"}</p>
        <p className="mt-1 text-sm">Holding <span className="text-gold">{zoneName(plot.zone)}</span></p>
        {isMine ? (
          <>
            <p className="mt-2 text-xs text-muted-foreground">Castle moves left today: {movesLeft} of {CASTLE_MOVES_PER_DAY}. They reset at 00:00 UTC.</p>
            {relocating ? (
              <button className="btn-ghost mt-2 w-full py-2" onClick={onCancelMove}>Cancel the move</button>
            ) : (
              <button className="btn-gold mt-3 w-full py-2" disabled={busy || movesLeft === 0} onClick={onStartMove}>
                <Move className="mr-1 inline h-4 w-4" />Move castle
              </button>
            )}
          </>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Castle attacks and visiting arrive with the walkable world in the next update.</p>
        )}
      </div>
    );
  }

  if (sel && sel.kind === "monster") {
    const m = WORLD_MONSTERS.find((x) => x.id === sel.id);
    const b = WORLD_BOSSES.find((x) => x.id === sel.id);
    if (m) {
      const kind = KIND[m.kind];
      return (
        <div className="anim-pop flex gap-3">
          <Sprite rect={m.sprite} className="w-16 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold" style={{ color: kind.color }}>{m.name}</h3>
            <p className="text-sm text-muted-foreground">{kind.label} · Level {m.level} · {zoneName(m.zone)}</p>
            <p className="mt-1 text-sm">Rewards: gold, fame, XP and gear scaled to level {m.level}.</p>
            <p className="mt-1 text-xs text-muted-foreground">Hunting it on foot arrives with the walkable world in the next update.</p>
          </div>
        </div>
      );
    }
    if (b) {
      return (
        <div className="anim-pop flex gap-3">
          <Sprite rect={b.sprite} className="w-24 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold" style={{ color: KIND.boss.color }}>{b.name}</h3>
            <p className="text-sm text-muted-foreground">World boss · Level {b.level} · {zoneName(b.zone)}</p>
            <p className="mt-1 text-xs text-muted-foreground">The strongest thing in the region. Bring a full party's worth of nerve.</p>
          </div>
        </div>
      );
    }
    const n = WORLD_NODES.find((x) => x.id === sel.id);
    if (n) {
      return (
        <div className="anim-pop">
          <h3 className="font-display text-lg font-bold text-gold">{n.name}</h3>
          <p className="text-sm text-muted-foreground">{n.kind === "resource" ? "Gathering ground" : "Landmark"} · {zoneName(n.zone)}</p>
          <p className="mt-1 text-sm">{n.note}</p>
        </div>
      );
    }
    return null;
  }

  if (sel && sel.kind === "plot") {
    const plot = plotOf(sel.plotId);
    if (!plot) return null;
    const here = (castles ?? []).filter((c) => c.plot === sel.plotId);
    return (
      <div className="anim-pop">
        <h3 className="panel-title text-lg font-bold">{zoneName(plot.zone)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {here.length === 0 ? "An empty castle plot." : `${here.length} castle${here.length === 1 ? "" : "s"} already stand here.`}
        </p>
        <p className="mt-1 text-sm">
          {mine
            ? `Move your castle here? You will have ${Math.max(0, movesLeft - 1)} of ${CASTLE_MOVES_PER_DAY} moves left today.`
            : "Place your castle here? The first placement is free."}
        </p>
        <div className="mt-3 flex gap-2">
          <button className="btn-gold flex-1 py-2" disabled={busy} onClick={() => onConfirm(sel.plotId)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mine ? "Confirm move" : "Place castle"}
          </button>
          <button className="btn-ghost px-3" disabled={busy} onClick={onCancelMove}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-base font-bold text-gold">The world around your castle</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag to travel, + and − to zoom. Select a castle, a monster lair, a gathering ground or a landmark.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {mine ? `Your castle stands in ${zoneName(plotOf(mine.plot)?.zone ?? "")}.` : "Your castle is not on the map yet — place it, free of charge."}
        {" "}Every player's castle appears here where they really left it.
      </p>
    </div>
  );
}

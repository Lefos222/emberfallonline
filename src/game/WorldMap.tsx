import { useEffect, useState, type MouseEvent } from "react";
import { Compass, Loader2, MapPin, Trophy } from "lucide-react";
import worldMap from "@/assets/world-map.jpg";
import { CLASSES, type HeroClass } from "./data";
import { REGIONS } from "./world";
import { useGame } from "./store";
import { fmt, Panel } from "./ui";
import { Portrait } from "./CharacterSelect";
import { CastleMarker } from "./CastleMarker";
import {
  WORLD_MARGIN, WORLD_UNITS, loadWorld, relocateCastle, resetLabel, spotClear,
  type WorldCastle, type WorldState,
} from "./worldcastles";

/** 10 world units per percent of the map. */
const pct = (unit: number) => `${(unit / WORLD_UNITS) * 100}%`;
const clsName = (cls: HeroClass) => CLASSES[cls].name;
const away = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) / 10);

/** The giant tree in the castle opens the world: every lord's real castle stands here. */
export function WorldMap({ onClose }: { onClose: () => void }) {
  const { heroId } = useGame();
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [moving, setMoving] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const open = () => {
    if (!heroId) return;
    setError(""); setWorld(null);
    loadWorld(heroId)
      .then((s) => { setWorld(s); setSelected(s.mine.hero_id); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "The world map could not be opened."));
  };

  useEffect(() => {
    let live = true;
    setError("");
    if (!heroId) { setError("Choose a character before opening the World Tree."); return; }
    loadWorld(heroId)
      .then((s) => { if (live) { setWorld(s); setSelected(s.mine.hero_id); } })
      .catch((e: unknown) => { if (live) setError(e instanceof Error ? e.message : "The world map could not be opened."); });
    return () => { live = false; };
  }, [heroId]);

  const mine = world?.mine ?? null;
  const chosen: WorldCastle | null = world && mine ? [mine, ...world.castles].find((c) => c.hero_id === selected) ?? mine : null;
  const outside = !!spot && (spot.x < WORLD_MARGIN || spot.x > WORLD_UNITS - WORLD_MARGIN || spot.y < WORLD_MARGIN || spot.y > WORLD_UNITS - WORLD_MARGIN);
  const free = !!(world && spot && spotClear(world, spot.x, spot.y));
  const reason = !spot ? "" : outside ? "Outside the world — choose ground inside the map." : free ? "This ground is free." : "Too close to another castle — leave about 4% of the map between them.";

  const pick = (e: MouseEvent<HTMLDivElement>) => {
    if (!moving) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(WORLD_UNITS, Math.round(((e.clientX - box.left) / box.width) * WORLD_UNITS)));
    const y = Math.max(0, Math.min(WORLD_UNITS, Math.round(((e.clientY - box.top) / box.height) * WORLD_UNITS)));
    setSpot({ x, y });
  };

  const move = async () => {
    if (!heroId || !spot || !free || busy) return;
    setBusy(true); setNote("");
    try {
      const next = await relocateCastle(heroId, spot.x, spot.y);
      setWorld(next); setSelected(next.mine.hero_id); setMoving(false); setSpot(null);
      setNote(`Castle moved — ${next.movesLeft} of ${next.movesPerDay} moves left today.`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "The move was refused. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <Panel title="The World Tree" onClose={onClose} wide>
      {error ? (
        <div className="py-10 text-center">
          <p className="text-hp" role="alert">{error}</p>
          <button className="btn-blood mx-auto mt-4 px-4 py-2" onClick={open}>Retry</button>
        </div>
      ) : !world || !mine ? (
        <div className="flex items-center justify-center gap-2 py-16 font-display text-lg">
          <Loader2 className="h-5 w-5 animate-spin" />Opening the World Tree…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
          <div>
            <div className="relative overflow-hidden rounded-lg border border-border" style={{ aspectRatio: "16 / 9" }} onClick={pick}>
              <img src={worldMap} alt="The world of Ember Fall" className="absolute inset-0 h-full w-full select-none object-cover" draggable={false} />
              <div className="pointer-events-none absolute inset-0 bg-background/20" aria-hidden="true" />
              {REGIONS.map((r) => {
                const at = r.path[Math.floor(r.path.length / 2)] ?? r.path[0]!;
                return (
                  <span
                    key={r.id}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-background/65 px-1.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-foreground/75"
                    style={{ left: `${at[0]}%`, top: `${at[1]}%` }}
                  >
                    {r.name} · Lv {r.level}+
                  </span>
                );
              })}
              {[mine, ...world.castles].map((c) => (
                <CastleMarker
                  key={c.hero_id}
                  castle={c}
                  mine={c.hero_id === mine.hero_id}
                  selected={c.hero_id === selected}
                  onSelect={() => { setSelected(c.hero_id); setMoving(false); setSpot(null); setNote(""); }}
                />
              ))}
              {moving && spot && (
                <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pct(spot.x), top: pct(spot.y) }}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed ${free ? "border-r1 bg-r1/25" : "border-hp bg-hp/25"}`}>
                    <MapPin className={`h-4 w-4 ${free ? "text-r1" : "text-hp"}`} />
                  </span>
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {moving
                ? "Click the map to choose the new ground for your castle."
                : `${world.castles.length} other castle${world.castles.length === 1 ? "" : "s"} standing in the world — click a marker to inspect it.`}
            </p>
          </div>

          <aside className="space-y-3">
            <div className="game-panel p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Castle moves today</span>
                <span className="font-display text-lg text-gold">{world.movesLeft} / {world.movesPerDay}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                A castle may travel three times a day; the next move unlocks at {resetLabel(world)} your time.
              </p>
            </div>

            {chosen && (
              <div className="slot p-3" style={{ borderColor: chosen.hero_id === mine.hero_id ? "var(--gold)" : "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <span className="slot h-12 w-12 shrink-0 overflow-hidden">
                    <Portrait cls={chosen.cls} gender={chosen.gender} className="w-full" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg">{chosen.name}</div>
                    <div className="text-xs text-muted-foreground">{clsName(chosen.cls)} · Lv {chosen.level}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span><Trophy className="mr-1 inline h-4 w-4 text-r4" />{fmt(chosen.power)}</span>
                  <span className="text-muted-foreground">
                    {chosen.hero_id === mine.hero_id ? "Your castle" : `${away(chosen, mine)} map units away`}
                  </span>
                </div>
                {chosen.hero_id === mine.hero_id ? (
                  moving ? (
                    <div className="mt-3 space-y-2">
                      <p className={`text-xs ${spot ? (free ? "text-r1" : "text-hp") : "text-muted-foreground"}`}>
                        {spot ? reason : "Click the map to choose a spot."}
                      </p>
                      <div className="flex gap-2">
                        <button className="btn-gold flex-1 py-2" disabled={!free || busy} onClick={() => void move()}>
                          {busy ? "Moving…" : "Move castle here"}
                        </button>
                        <button className="btn-blood px-3 py-2" onClick={() => { setMoving(false); setSpot(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <button className="btn-gold w-full py-2" disabled={world.movesLeft === 0} onClick={() => { setMoving(true); setSpot(null); setNote(""); }}>
                        Move castle
                      </button>
                      {world.movesLeft === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No moves left today — the World Tree opens your road again at {resetLabel(world)} your time.
                        </p>
                      )}
                    </div>
                  )
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This castle belongs to {chosen.name}. Challenging another lord for gold and fame arrives with the next world update.
                  </p>
                )}
              </div>
            )}

            {note && <p className="text-sm text-gold" role="status">{note}</p>}
            {world.castles.length === 0 && <p className="text-xs text-muted-foreground">Yours is the first castle standing in the world.</p>}
            <p className="text-xs text-muted-foreground">
              <Compass className="mr-1 inline h-3.5 w-3.5" />Every castle on this map belongs to a real player, and its ground is kept on the server.
            </p>
          </aside>
        </div>
      )}
    </Panel>
  );
}
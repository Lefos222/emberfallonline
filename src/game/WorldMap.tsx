import { useEffect, useRef, useState } from "react";
import { Swords, Trees, MoveRight, RefreshCw, Sparkles, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, Gold, fmt } from "./ui";
import { CharacterModel } from "./CharacterModel";
import { Sprite } from "./Sprite";
import { WorldField } from "./WorldField";
import { useGame, update, flushSave, getState } from "./store";
import { heroStats, type HeroClass } from "./data";
import type { StartBattle } from "./panels";
import {
  WORLD_MONSTERS, WORLD_RESOURCES, WORLD_W, WORLD_H, WORLD_MAX_MOVES,
  worldMonsterFighter, worldRewards, castleGuardFighter, fetchCastles, raidGuard, recordRaid,
  relocationsLeft, relocate, defaultPos,
  type WorldMonster, type WorldResource, type WorldCastle,
} from "./worldmap";
import { addMats, type Mat } from "./crafting";
import worldMapImg from "@/assets/world-map.jpg";

type View = "map" | "field";
type Pick = { kind: "monster"; m: WorldMonster } | { kind: "resource"; r: WorldResource } | { kind: "castle"; c: WorldCastle; blocked?: string } | null;

export function WorldMap({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero, heroId, userId, gender } = useGame();
  const [view, setView] = useState<View>("map");
  const [castles, setCastles] = useState<WorldCastle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pick, setPick] = useState<Pick>(null);
  const [relocating, setRelocating] = useState(false);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [gathered, setGathered] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Ensure the hero has a world position; assign a deterministic default on first entry.
  useEffect(() => {
    if (!hero) return;
    if (!hero.world) {
      update((h) => { h.world = defaultPos(h.name + (heroId ?? "")); });
    }
    setMoves(relocationsLeft(hero));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero?.world?.x, hero?.world?.y]);

  const loadCastles = async () => {
    if (!userId) return;
    setLoading(true);
    setCastles(await fetchCastles(userId));
    setLoading(false);
  };
  useEffect(() => { void loadCastles(); /* eslint-disable-next-line */ }, [userId]);

  if (!hero) return null;
  const myPos = hero.world ?? defaultPos(hero.name + (heroId ?? ""));

  const doRelocate = async (xPct: number, yPct: number) => {
    if (relocationsLeft(hero) <= 0) { setRelocating(false); return; }
    setBusy(true);
    update((h) => relocate(h, xPct, yPct));
    await flushSave();
    setMoves(relocationsLeft(getState().hero ?? hero));
    setBusy(false);
    setRelocating(false);
  };

  const fightMonster = (m: WorldMonster) => {
    setPick(null);
    const rw = worldRewards(m);
    start({
      title: m.boss ? `World Boss · ${m.name}` : `${m.name}`,
      auto: false,
      right: worldMonsterFighter(m),
      onResult: async (won, xpMult = 1) => {
        if (!won) return { lines: ["The beast drove you back. Return when you are stronger."] };
        const { grant, rollLoot, addLoot } = await import("./logic");
        const lines: string[] = [];
        let loot: ReturnType<typeof rollLoot> = null;
        update((h) => {
          const { levels } = grant(h, Math.round(rw.xp * xpMult), rw.gold);
          loot = rollLoot(h, m.stage, m.boss ? 1 : 0.4, m.boss ? 2 : 0);
          if (loot) addLoot(h, loot);
          h.wins++;
          lines.push(`+${fmt(Math.round(rw.xp * xpMult))} XP`, `+${fmt(rw.gold)} gold`, ...(levels ? [`LEVEL UP ×${levels}!`] : []));
        });
        return { lines, loot: loot ?? undefined };
      },
    });
  };

  const gather = (r: WorldResource) => {
    setPick(null);
    if (gathered.includes(r.id)) return;
    update((h) => { addMats(h, { [r.mat]: r.amount } as Partial<Record<Mat, number>>); h.gold += r.amount * 20; });
    setGathered((g) => [...g, r.id]);
  };

  const attackCastle = (c: WorldCastle) => {
    const guard = raidGuard(hero, c);
    if (!guard.ok) { setPick({ kind: "castle", c, blocked: guard.reason }); return; }
    setPick(null);
    start({
      title: `Castle Siege · ${c.name}`,
      auto: true,
      right: castleGuardFighter(c),
      onResult: async (won) => {
        if (!won) return { lines: [`${c.name}'s guard repelled your assault.`] };
        const gold = 60 + c.level * 18;
        const fame = 15 + Math.floor(c.level / 4);
        update((h) => { h.gold += gold; recordRaid(h, c.id); });
        return { lines: [`You sacked ${c.name}'s castle!`, `+${fmt(gold)} gold`, `+${fame} fame`] };
      },
    });
  };

  if (view === "field") {
    return <WorldField onClose={() => setView("map")} start={start} hero={hero} gender={gender} />;
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="panel-title truncate text-xl font-bold md:text-2xl"><Trees className="mr-2 inline h-6 w-6 text-r2" />World Map</h2>
        <div className="flex items-center gap-2">
          <span className="hidden rounded bg-panel px-2 py-1 text-sm sm:inline">Relocations: <b className="text-gold">{moves}</b>/{WORLD_MAX_MOVES}</span>
          <Button variant="ghost" size="sm" onClick={() => void loadCastles()} title="Refresh castles"><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={() => setView("field")}><Sparkles className="mr-1 h-4 w-4" />Enter World</Button>
          <button onClick={onClose} className="btn-blood flex h-9 w-9 items-center justify-center" aria-label="Close">✕</button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden" ref={mapRef}
        onClick={(e) => { if (relocating && mapRef.current) { const r = mapRef.current.getBoundingClientRect(); void doRelocate(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100); } }}>
        <img src={worldMapImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-35" draggable={false} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(120,80,30,0.18), transparent 60%), repeating-linear-gradient(0deg, transparent 0 9.9%, rgba(255,255,255,0.05) 9.9% 10%), repeating-linear-gradient(90deg, transparent 0 9.9%, rgba(255,255,255,0.05) 9.9% 10%)" }} />
        {/* Monsters */}
        {WORLD_MONSTERS.map((m) => (
          <Marker key={m.id} x={m.x} y={m.y} color={m.boss ? "var(--blood)" : m.elite ? "var(--r4)" : "var(--r3)"} onClick={() => setPick({ kind: "monster", m })}>
            <Sprite rect={worldMonsterFighter(m).sprite!} className="h-full w-full" />
            {m.boss && <span className="absolute -right-1 -top-1 rounded bg-blood px-1 text-[9px] font-bold">BOSS</span>}
          </Marker>
        ))}
        {/* Resources */}
        {WORLD_RESOURCES.map((r) => (
          <Marker key={r.id} x={r.x} y={r.y} color="var(--r1)" onClick={() => setPick({ kind: "resource", r })} faded={gathered.includes(r.id)}>
            <Sparkles className="h-full w-full text-r1" />
          </Marker>
        ))}
        {/* Other castles */}
        {loading && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin" /> Loading castles…</div>}
        {!loading && castles.length === 0 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">No other castles placed yet — be the first on the map!</div>}
        {castles.map((c) => (
          <Marker key={c.id} x={c.x} y={c.y} color="var(--r2)" onClick={() => setPick({ kind: "castle", c })}>
            <div className="flex h-full w-full flex-col items-center justify-center">
              <CastleIcon cls={c.cls} gender={c.gender} />
              <span className="max-w-[64px] truncate text-[8px] font-bold drop-shadow-[0_1px_1px_black]">{c.name}</span>
            </div>
          </Marker>
        ))}
        {/* My castle */}
        <Marker x={myPos.x} y={myPos.y} color="var(--gold)" onClick={() => setRelocating((r) => !r)} pulse>
          <div className="flex h-full w-full flex-col items-center justify-center">
            <CastleIcon cls={hero.cls} gender={gender} />
            <span className="max-w-[64px] truncate text-[9px] font-bold text-gold drop-shadow-[0_1px_1px black]">{hero.name}</span>
          </div>
        </Marker>

        {relocating && (
          <div className="pointer-events-none absolute inset-x-0 top-12 z-10 text-center text-sm font-display text-gold drop-shadow-[0_1px_2px_black]">
            {moves > 0 ? "Tap a spot to relocate your castle" : "No relocations left today"}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-sm">
        <button className={`btn-ghost px-3 py-1.5 ${relocating ? "ring-2 ring-gold" : ""}`} onClick={() => setRelocating((r) => !r)} disabled={busy || moves <= 0}>
          <MoveRight className="mr-1 inline h-4 w-4" /> Relocate ({moves})
        </button>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span><span className="text-gold">●</span> You</span>
          <span><span className="text-r2">●</span> Castles</span>
          <span><span className="text-r3">●</span> Monsters</span>
          <span><span className="text-r1">●</span> Resources</span>
        </div>
      </div>

      {pick && (
        <Panel title={pickTitle(pick)} onClose={() => setPick(null)}>
          {pick.kind === "monster" && <MonsterCard m={pick.m} onFight={() => fightMonster(pick.m)} />}
          {pick.kind === "resource" && <ResourceCard r={pick.r} gathered={gathered.includes(pick.r.id)} onGather={() => gather(pick.r)} />}
          {pick.kind === "castle" && <CastleCard c={pick.c} blocked={pick.blocked} onAttack={() => attackCastle(pick.c)} />}
        </Panel>
      )}
    </div>
  );
}

function pickTitle(p: Pick): string {
  if (!p) return "";
  if (p.kind === "monster") return p.m.boss ? "World Boss" : p.m.elite ? "Elite Monster" : "Monster";
  if (p.kind === "resource") return "Gathering Node";
  return "Player Castle";
}

function Marker({ x, y, color, children, onClick, pulse, faded }: { x: number; y: number; color: string; children: React.ReactNode; onClick: () => void; pulse?: boolean; faded?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition hover:z-10 hover:scale-125"
      style={{ left: `${(x / WORLD_W) * 100}%`, top: `${(y / WORLD_H) * 100}%`, width: "8%", aspectRatio: "1", opacity: faded ? 0.4 : 1, boxShadow: pulse ? `0 0 0 3px ${color}` : `0 0 0 2px ${color}`, outline: faded ? "1px dashed #888" : "none" }}
      aria-label="map node"
    >
      <div className={`h-full w-full rounded-full ${pulse ? "anim-idle" : ""}`}>{children}</div>
    </button>
  );
}

function CastleIcon({ cls, gender }: { cls: HeroClass; gender: "male" | "female" }) {
  return <CharacterModel cls={cls} gender={gender} className="h-full w-full" />;
}

function MonsterCard({ m, onFight }: { m: WorldMonster; onFight: () => void }) {
  const f = worldMonsterFighter(m);
  const power = Math.round(f.atk * 2 + f.def * 1.5 + f.hp * 0.2);
  const rw = worldRewards(m);
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="relative h-60 overflow-hidden rounded-lg bg-panel">
        <Sprite rect={f.sprite!} className="h-full w-full" />
        {m.boss && <span className="absolute left-2 top-2 rounded bg-blood px-2 py-0.5 font-display text-sm">BOSS</span>}
      </div>
      <div className="space-y-2 text-center">
        <div className="font-display text-2xl text-gold">{m.name}</div>
        <div className="text-sm text-muted-foreground">Stage {m.stage} · {m.elite ? "Elite" : m.boss ? "Boss" : "Normal"}</div>
        <div className="flex justify-center gap-4"><span><Swords className="inline h-4 w-4 text-r4" /> {fmt(power)}</span><span className="text-xp">+{fmt(rw.xp)} XP</span><Gold n={rw.gold} /></div>
        <button className="btn-gold mt-2 w-full py-2.5 text-lg" onClick={onFight}><Swords className="mr-2 inline h-5 w-5" />Fight</button>
      </div>
    </div>
  );
}

function ResourceCard({ r, gathered, onGather }: { r: WorldResource; gathered: boolean; onGather: () => void }) {
  return (
    <div className="py-6 text-center">
      <Sparkles className="mx-auto mb-3 h-12 w-12 text-r1" />
      <div className="font-display text-2xl text-gold">{r.name}</div>
      <p className="mt-1 text-muted-foreground">Gather <b>{r.amount}</b> {r.mat} and some gold.</p>
      <button className="btn-gold mt-4 w-full py-2.5 text-lg" disabled={gathered} onClick={onGather}>{gathered ? "Already gathered" : "Gather"}</button>
    </div>
  );
}

function CastleCard({ c, blocked, onAttack }: { c: WorldCastle; blocked?: string; onAttack: () => void }) {
  const s = c.stats;
  const power = Math.round((s.atk ?? 0) * 2 + (s.def ?? 0) * 1.5 + (s.hp ?? 0) * 0.2);
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="relative h-60 overflow-hidden rounded-lg bg-panel">
        <CharacterModel cls={c.cls} gender={c.gender} className="h-full w-full" />
        <span className="absolute left-2 top-2 rounded bg-r2 px-2 py-0.5 font-display text-sm"><Shield className="mr-1 inline h-3 w-3" />Castle</span>
      </div>
      <div className="space-y-2 text-center">
        <div className="font-display text-2xl text-gold">{c.name}</div>
        <div className="text-sm text-muted-foreground">Lv {c.level} · Guard power <Swords className="inline h-4 w-4 text-r4" /> {fmt(power)}</div>
        {blocked ? (
          <>
            <div className="text-xs text-hp">{blocked}</div>
            <button className="btn-blood mt-2 w-full py-2.5 text-lg opacity-60" disabled>Attack Castle</button>
          </>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">Attack to sack gold & fame. Guards defend automatically. One raid per castle per day.</div>
            <button className="btn-blood mt-2 w-full py-2.5 text-lg" onClick={onAttack}><Swords className="mr-2 inline h-5 w-5" />Attack Castle</button>
          </>
        )}
      </div>
    </div>
  );
}



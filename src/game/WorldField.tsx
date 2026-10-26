import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, LogOut, Gauge, Sparkles, Swords } from "lucide-react";
import { CharacterModel } from "./CharacterModel";
import { Sprite } from "./Sprite";
import { useGame, update } from "./store";
import { stageFoe, type Hero, type HeroClass } from "./data";
import { enemySprite, bossSprite } from "./world";
import type { StartBattle } from "./panels";
import { addMats, type Mat } from "./crafting";
import worldMapImg from "@/assets/world-map.jpg";

const FIELD_W = 3200;
const WALK = 3.2;
const RUN = 6.4;
const ENCOUNTER_DIST = 70;

interface FieldMonster { id: number; x: number; stage: number; boss: boolean; elite: boolean; row: number; col: number }
interface FieldResource { id: number; x: number; mat: Mat; amount: number }

function buildField(hero: Hero): { monsters: FieldMonster[]; resources: FieldResource[] } {
  const base = Math.max(3, hero.stage);
  const monsters: FieldMonster[] = Array.from({ length: 7 }).map((_, i) => {
    const boss = i === 6;
    const elite = !boss && i % 3 === 2;
    const stage = boss ? base + 6 : base - 3 + i * 2;
    const row = boss ? 4 : (i % 4);
    const col = boss ? (i % 7) : ((i * 3) % 12);
    return { id: i, x: 360 + i * 440, stage: Math.max(1, stage), boss, elite, row, col };
  });
  const resources: FieldResource[] = [
    { id: 0, x: 240, mat: "ore", amount: 5 }, { id: 1, x: 760, mat: "hide", amount: 4 },
    { id: 2, x: 1280, mat: "bloom", amount: 3 }, { id: 3, x: 1820, mat: "essence", amount: 3 },
    { id: 4, x: 2360, mat: "fragment", amount: 2 },
  ];
  return { monsters, resources };
}

type Anim = "idle" | "walk" | "run";

export function WorldField({ onClose, start, hero, gender }: { onClose: () => void; start: StartBattle; hero: Hero; gender: "male" | "female" }) {
  const [, force] = useState(0);
  const [anim, setAnim] = useState<Anim>("idle");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [defeated, setDefeated] = useState<Set<number>>(new Set());
  const [gathered, setGathered] = useState<Set<number>>(new Set());
  const [hint, setHint] = useState("Move with ◀ ▶ or A/D — hold Shift to run. Walk into monsters to fight, into glows to gather.");

  const field = useRef(buildField(hero));
  const heroEl = useRef<HTMLDivElement>(null);
  const worldEl = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 90, vx: 0, facing: 1 as 1 | -1 });
  const keys = useRef<Set<string>>(new Set());
  const inBattle = useRef(false);
  const raf = useRef(0);
  const lastAnim = useRef<Anim>("idle");

  useEffect(() => {
    let active = true;
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d", "shift"].includes(k)) { e.preventDefault(); keys.current.add(k); }
      if (k === "escape") onClose();
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    const loop = () => {
      if (!active) return;
      raf.current = requestAnimationFrame(loop);
      if (inBattle.current) return;
      const k = keys.current;
      const left = k.has("arrowleft") || k.has("a");
      const right = k.has("arrowright") || k.has("d");
      const running = k.has("shift");
      let vx = 0;
      if (left) { vx = -(running ? RUN : WALK); pos.current.facing = -1; }
      if (right) { vx = running ? RUN : WALK; pos.current.facing = 1; }
      pos.current.x = Math.min(FIELD_W - 60, Math.max(40, pos.current.x + vx));
      const mode: Anim = vx === 0 ? "idle" : running ? "run" : "walk";

      // camera follows hero
      if (worldEl.current) {
        const cw = worldEl.current.parentElement!.clientWidth;
        const cam = Math.min(0, Math.max(cw - FIELD_W, cw / 2 - pos.current.x));
        worldEl.current.style.transform = `translate3d(${cam}px,0,0)`;
      }
      if (heroEl.current) {
        heroEl.current.style.transform = `translate3d(${pos.current.x}px,0,0) scaleX(${pos.current.facing})`;
      }
      if (mode !== lastAnim.current) { lastAnim.current = mode; setAnim(mode); }
      if (pos.current.facing !== facingRef.current) { facingRef.current = pos.current.facing; setFacing(pos.current.facing); }

      // encounters
      for (const m of field.current.monsters) {
        if (defeatedRef.current.has(m.id)) continue;
        if (Math.abs(pos.current.x - m.x) < ENCOUNTER_DIST) { triggerMonster(m); break; }
      }
      for (const r of field.current.resources) {
        if (gatheredRef.current.has(r.id)) continue;
        if (Math.abs(pos.current.x - r.x) < 60) { doGather(r); break; }
      }
    };
    raf.current = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(raf.current); window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facingRef = useRef<1 | -1>(1);
  const defeatedRef = useRef<Set<number>>(new Set());
  const gatheredRef = useRef<Set<number>>(new Set());
  useEffect(() => { defeatedRef.current = defeated; }, [defeated]);
  useEffect(() => { gatheredRef.current = gathered; }, [gathered]);

  const press = (key: string, down: boolean) => {
    if (down) keys.current.add(key); else keys.current.delete(key);
  };

  const triggerMonster = (m: FieldMonster) => {
    if (inBattle.current) return;
    inBattle.current = true;
    keys.current.clear();
    setAnim("idle");
    const foe = stageFoe(m.stage, m.boss ? 2 : m.elite ? 1.4 : 1);
    const sprite = m.boss ? bossSprite(4, m.col % 7) : enemySprite(m.row, m.col);
    const rw = { xp: Math.round((25 + m.stage * 8) * Math.pow(1.09, m.stage - 1) * (m.boss ? 2 : m.elite ? 1.4 : 1)), gold: Math.round((12 + m.stage * 4) * Math.pow(1.09, m.stage - 1) * (m.boss ? 2 : m.elite ? 1.4 : 1)) };
    setHint(m.boss ? "World Boss encountered!" : `${foe.name} blocks your path!`);
    start({
      title: m.boss ? `World Boss · ${foe.name}` : foe.name,
      auto: false,
      right: { ...foe, name: foe.name, boss: m.boss, sprite },
      onResult: async (won, xpMult = 1) => {
        inBattle.current = false;
        if (!won) { setHint("You were defeated — the monster remains."); return { lines: ["Defeated… grow stronger and return."] }; }
        const { grant, rollLoot, addLoot } = await import("./logic");
        let lines: string[] = [];
        let loot: ReturnType<typeof rollLoot> = null;
        update((h) => {
          const { levels } = grant(h, Math.round(rw.xp * xpMult), rw.gold);
          loot = rollLoot(h, m.stage, m.boss ? 1 : 0.4, m.boss ? 2 : 0);
          if (loot) addLoot(h, loot);
          h.wins++;
          lines = [`+${Math.round(rw.xp * xpMult)} XP`, `+${rw.gold} gold`, ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        setDefeated((s) => new Set(s).add(m.id));
        setHint("Victory! Continue exploring the world.");
        return { lines, loot: loot ?? undefined };
      },
    });
  };

  const doGather = (r: FieldResource) => {
    if (gatheredRef.current.has(r.id)) return;
    update((h) => { addMats(h, { [r.mat]: r.amount } as Partial<Record<Mat, number>>); h.gold += r.amount * 20; });
    setGathered((s) => new Set(s).add(r.id));
    setHint(`Gathered ${r.amount} ${r.mat}!`);
    force((n) => n + 1);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-background" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-4 py-2">
        <div className="game-panel flex items-center gap-2 px-3 py-1.5 text-sm">
          <Gauge className="h-4 w-4 text-gold" />
          <span className="truncate max-w-[60vw]">{hint}</span>
        </div>
        <button onClick={onClose} className="btn-blood flex items-center gap-1 px-3 py-1.5 text-sm"><LogOut className="h-4 w-4" />Leave</button>
      </div>

      {/* the field */}
      <div className="relative flex-1 overflow-hidden">
        <div ref={worldEl} className="absolute inset-y-0 left-0" style={{ width: FIELD_W }}>
          {/* parallax background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1830] via-[#3a2418] to-[#1a1208]" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${worldMapImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          {/* distant hills */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: "radial-gradient(120% 80% at 50% 100%, rgba(60,40,20,0.7), transparent 70%)" }} />
          {/* ground */}
          <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: "linear-gradient(#3b2a14,#241a0c)" }}>
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 40px)" }} />
          </div>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={"g" + i} className="absolute bottom-24 h-3 w-1 rounded bg-[#1a1208]" style={{ left: `${i * 80}px`, height: `${4 + (i % 5) * 2}px` }} />
          ))}

          {/* resources */}
          {field.current.resources.map((r) => !gathered.has(r.id) && (
            <div key={r.id} className="absolute bottom-24 flex -translate-x-1/2 flex-col items-center" style={{ left: r.x }}>
              <Sparkles className="h-10 w-10 animate-pulse text-r1 drop-shadow-[0_0_8px_var(--r1)]" />
              <span className="mt-1 whitespace-nowrap rounded bg-background/70 px-1 text-[10px] text-r1">{r.mat}</span>
            </div>
          ))}

          {/* monsters */}
          {field.current.monsters.map((m) => !defeated.has(m.id) && (
            <div key={m.id} className="absolute bottom-20 flex -translate-x-1/2 flex-col items-center" style={{ left: m.x, width: 110 }}>
              <div className="anim-idle" style={{ width: m.boss ? 130 : 96 }}>
                <Sprite rect={m.boss ? bossSprite(4, m.col % 7) : enemySprite(m.row, m.col)} className="h-full w-full" />
              </div>
              {m.boss && <span className="rounded bg-blood px-1 text-[9px] font-bold">BOSS</span>}
            </div>
          ))}

          {/* hero */}
          <div ref={heroEl} className="absolute bottom-16" style={{ left: 0, width: 96, transform: "translate3d(90px,0,0)" }}>
            <div className={anim === "idle" ? "anim-idle" : anim === "run" ? "anim-run" : "anim-walk"} style={{ transformOrigin: "bottom center" }}>
              <CharacterModel cls={hero.cls as HeroClass} gender={gender} className="h-28 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* touch controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 md:p-8">
        <ControlButton onPress={(d) => press("arrowleft", d)}><ArrowLeft className="h-7 w-7" /></ControlButton>
        <div className="flex flex-col items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:block">Shift = run · Esc = leave</span>
          <span className="text-xs text-muted-foreground"><Swords className="mr-1 inline h-3 w-3" /> Walk into monsters to fight</span>
        </div>
        <ControlButton onPress={(d) => press("arrowright", d)}><ArrowRight className="h-7 w-7" /></ControlButton>
      </div>
    </div>
  );
}

function ControlButton({ children, onPress }: { children: React.ReactNode; onPress: (down: boolean) => void }) {
  return (
    <button
      className="slot flex h-16 w-16 touch-none select-none items-center justify-center active:ring-2 active:ring-gold md:h-14 md:w-14"
      onPointerDown={(e) => { e.preventDefault(); onPress(true); }}
      onPointerUp={() => onPress(false)}
      onPointerLeave={() => onPress(false)}
      onPointerCancel={() => onPress(false)}
    >{children}</button>
  );
}

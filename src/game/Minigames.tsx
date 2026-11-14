import { useEffect, useRef, useState } from "react";
import { tr } from "./i18n";
import { Panel, fmt } from "./ui";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { FishingPanel } from "./Fishing";
import { castsLeft, FISHING_CASTS_PER_DAY } from "./fishing";
import { MINIGAME_PLAYS, playMinigame, playsLeft, type MinigameId } from "./minigames";
import hall from "@/assets/minigame-hall.png";
import rod from "@/assets/fishing-rod.png";
import runesArt from "@/assets/minigame-runes.png";
import archeryArt from "@/assets/minigame-archery.png";
import diceArt from "@/assets/minigame-dice.png";
import runeWall from "@/assets/minigame-rune-wall.jpg";
import archeryRange from "@/assets/minigame-archery-range.jpg";
import targetArt from "@/assets/minigame-target.png";
import tavernTable from "@/assets/minigame-tavern-table.jpg";

const GAMES: { id: MinigameId; name: string; desc: string; icon: string }[] = [
  { id: "runes", name: "Rune Memory", desc: "Watch the runes light up, then repeat the order.", icon: runesArt },
  { id: "archery", name: "Archery Range", desc: "Hit the moving targets before time runs out.", icon: archeryArt },
  { id: "dice", name: "Tavern Dice", desc: "Hold or reroll five dice to chase a high hand.", icon: diceArt },
];

/** The Minigame Hall: every non-battle pastime in one place. */
export function MinigamesPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [game, setGame] = useState<MinigameId | "fishing" | null>(null);
  if (!hero) return null;
  if (game === "fishing") return <FishingPanel onClose={() => setGame(null)} />;
  return (
    <Panel title={tr("Minigame Hall")} subtitle={tr("Pastimes that pay a little gold every day")} art="quest" onClose={onClose}>
      {game ? (
        <div>
          <button className="btn-ghost mb-2 px-2 py-1 text-xs" onClick={() => setGame(null)}>← {tr("All minigames")}</button>
          {game === "runes" && <RuneMemory />}
          {game === "archery" && <Archery />}
          {game === "dice" && <Dice />}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <img src={hall} alt="" width={256} height={256} className="mx-auto h-28 w-28 object-contain sm:col-span-2" />
          <button className="slot flex items-center gap-3 p-3 text-left hover:ring-2 hover:ring-gold" onClick={() => setGame("fishing")}>
            <img src={rod} alt="" width={256} height={256} className="h-10 w-10 object-contain" />
            <span><b className="font-display text-gold">{tr("Fishing Pier")}</b><br /><span className="text-xs text-muted-foreground">{tr("Casts left today")}: {castsLeft(hero)}/{FISHING_CASTS_PER_DAY}</span></span>
          </button>
          {GAMES.map((g) => (
            <button key={g.id} className="slot flex items-center gap-3 p-3 text-left hover:ring-2 hover:ring-gold" onClick={() => setGame(g.id)}>
              <img src={g.icon} alt="" width={256} height={256} loading="lazy" className="h-10 w-10 object-contain" />
              <span><b className="font-display text-gold">{tr(g.name)}</b><br /><span className="text-xs text-muted-foreground">{tr(g.desc)}</span><br />
                <span className="text-xs">{tr("Plays left today")}: {playsLeft(hero, g.id)}/{MINIGAME_PLAYS[g.id]}</span></span>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}

function useFinish(id: MinigameId) {
  const { hero } = useGame();
  const [msg, setMsg] = useState("");
  const finish = (score: number) => {
    let g: number | null = null;
    update((h) => { g = playMinigame(h, id, score); });
    setMsg(g === null ? tr("No plays left today.") : tr("Score {s}% — earned {g} gold", { s: Math.round(score * 100), g: fmt(g) }));
  };
  return { left: hero ? playsLeft(hero, id) : 0, msg, setMsg, finish };
}

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"];
function RuneMemory() {
  const { left, msg, setMsg, finish } = useFinish("runes");
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [input, setInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "show" | "input">("idle");
  const start = () => {
    const s = Array.from({ length: 6 }, () => Math.floor(Math.random() * RUNES.length));
    setSeq(s); setInput([]); setMsg(""); setPhase("show");
    s.forEach((r, i) => {
      setTimeout(() => setLit(r), i * 700 + 300);
      setTimeout(() => setLit(null), i * 700 + 800);
    });
    setTimeout(() => setPhase("input"), s.length * 700 + 400);
  };
  const press = (r: number) => {
    if (phase !== "input") return;
    const next = [...input, r];
    setInput(next);
    const i = next.length - 1;
    if (seq[i] !== r || next.length === seq.length) {
      const right = seq[i] === r ? next.length : i;
      setPhase("idle"); finish(right / seq.length);
    }
  };
  return (
    <div className="text-center">
      <div className="grid grid-cols-3 gap-2 rounded border border-border bg-cover bg-center p-3" style={{ backgroundImage: `url(${runeWall})` }}>
        {RUNES.map((r, i) => (
          <button key={r} onClick={() => press(i)} className={`slot h-16 bg-background/70 font-display text-3xl transition ${lit === i ? "bg-gold text-background scale-105" : "text-gold"}`}>{r}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{phase === "input" ? tr("Your turn: {n} of {m}", { n: input.length, m: seq.length }) : tr("Plays left today") + `: ${left}`}</p>
      {msg && <p role="status" className="mt-1 font-display text-gold">{msg}</p>}
      <Button className="btn-gold mt-2 w-full" disabled={phase !== "idle" || left <= 0} onClick={start}>{tr("Start")}</Button>
    </div>
  );
}

function Archery() {
  const { left, msg, setMsg, finish } = useFinish("archery");
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const [time, setTime] = useState(0);
  const timer = useRef<number>(0);
  const hitsRef = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  const move = () => setTarget({ x: 8 + Math.random() * 84, y: 12 + Math.random() * 76 });
  const start = () => {
    hitsRef.current = 0; setHits(0); setMsg(""); setTime(15); move();
    timer.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timer.current); finish(Math.min(1, hitsRef.current / 15)); return 0; }
        if (Math.random() < 0.5) move();
        return t - 1;
      });
    }, 1000);
  };
  return (
    <div className="text-center">
      <div className="relative h-56 w-full overflow-hidden rounded border border-border bg-cover bg-center" style={{ backgroundImage: `url(${archeryRange})` }}>
        {time > 0 && (
          <button aria-label={tr("Target")} onClick={() => { hitsRef.current += 1; setHits(hitsRef.current); move(); }}
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full drop-shadow-lg"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}>
            <img src={targetArt} alt="" width={128} height={128} draggable={false} className="h-full w-full object-contain" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm">{tr("Hits")}: <b className="text-gold">{hits}</b> · {tr("Time")}: {time}s · {tr("Plays left today")}: {left}</p>
      {msg && <p role="status" className="font-display text-gold">{msg}</p>}
      <Button className="btn-gold mt-2 w-full" disabled={time > 0 || left <= 0} onClick={start}>{tr("Start")}</Button>
    </div>
  );
}

/** Tavern Dice: one reroll of any held-off dice, scored by the best matching set and total. */
export function diceScore(d: number[]) {
  const counts = Object.values(d.reduce<Record<number, number>>((a, v) => ({ ...a, [v]: (a[v] ?? 0) + 1 }), {})).sort((a, b) => b - a);
  const best = counts[0] ?? 0;
  const straight = new Set(d).size === 5 && (Math.max(...d) - Math.min(...d) === 4);
  if (best === 5) return 1;
  if (straight || best === 4) return 0.85;
  if (best === 3 && counts[1] === 2) return 0.7;
  if (best === 3) return 0.5;
  if (best === 2 && counts[1] === 2) return 0.35;
  return best === 2 ? 0.2 : 0.1;
}
function Dice() {
  const { left, msg, setMsg, finish } = useFinish("dice");
  const [dice, setDice] = useState<number[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const roll = () => 1 + Math.floor(Math.random() * 6);
  const start = () => { setMsg(""); setHeld([false, false, false, false, false]); setDice(Array.from({ length: 5 }, roll)); };
  const reroll = () => { const d = dice.map((v, i) => (held[i] ? v : roll())); setDice(d); setTimeout(() => { finish(diceScore(d)); setDice([]); }, 900); };
  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 rounded border border-border bg-cover bg-center px-2 py-6" style={{ backgroundImage: `url(${tavernTable})` }}>
        {(dice.length ? dice : [0, 0, 0, 0, 0]).map((v, i) => (
          <button key={i} disabled={!dice.length} onClick={() => setHeld((h) => h.map((x, j) => (j === i ? !x : x)))}
            className={`slot h-14 w-14 bg-background/80 font-display text-2xl ${held[i] ? "ring-2 ring-gold" : ""}`}>{v || "?"}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{tr("Click dice to hold them, then reroll the rest once.")} {tr("Plays left today")}: {left}</p>
      {msg && <p role="status" className="font-display text-gold">{msg}</p>}
      {dice.length ? <Button className="btn-gold mt-2 w-full" onClick={reroll}>{tr("Reroll")}</Button>
        : <Button className="btn-gold mt-2 w-full" disabled={left <= 0} onClick={start}>{tr("Roll")}</Button>}
    </div>
  );
}

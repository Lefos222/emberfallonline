import { useEffect, useRef, useState } from "react";
import { tr } from "./i18n";
import { Panel, fmt } from "./ui";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { CATCHES, FISHING_CASTS_PER_DAY, castsLeft, reel, type Catch } from "./fishing";
import lake from "@/assets/fishing-lake.jpg";
import rod from "@/assets/fishing-rod.png";

/** The reel minigame: a marker sweeps the bar; stop it inside the gold zone. */
export function FishingPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [phase, setPhase] = useState<"idle" | "wait" | "reel">("idle");
  const [pos, setPos] = useState(0);
  const [zone, setZone] = useState({ at: 40, w: 20 });
  const [msg, setMsg] = useState("");
  const raf = useRef(0);
  const t0 = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  if (!hero) return null;
  const left = castsLeft(hero);

  const cast = () => {
    setMsg(tr("Waiting for a bite…"));
    setPhase("wait");
    setTimeout(() => {
      setZone({ at: 10 + Math.random() * 65, w: 14 + Math.random() * 10 });
      setPhase("reel");
      setMsg(tr("A bite! Stop the marker in the gold zone."));
      t0.current = performance.now();
      const loop = (now: number) => {
        const p = ((now - t0.current) / 1100) % 2;
        setPos((p < 1 ? p : 2 - p) * 100);
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    }, 900 + Math.random() * 1800);
  };

  const stop = () => {
    cancelAnimationFrame(raf.current);
    const mid = zone.at + zone.w / 2;
    const off = Math.abs(pos - mid);
    const q = off > zone.w / 2 ? 0 : 1 - off / (zone.w / 2);
    let got: Catch | null | "none" = "none";
    update((h) => { got = reel(h, q); });
    const c = got as Catch | null | "none";
    setMsg(c === "none" ? tr("No casts left today.") : c ? tr("Caught a {fish}!", { fish: tr(c.name) }) : tr("It slipped away…"));
    setPhase("idle");
  };

  return (
    <Panel title={tr("Fishing Pier")} subtitle={tr("A quiet pastime — no battles, just the lake")} art="quest" onClose={onClose}>
      <div className="relative overflow-hidden rounded">
        <img src={lake} alt={tr("A lantern-lit pier over a dusk lake")} width={1088} height={608} className="block h-48 w-full object-cover" />
        <img src={rod} alt="" width={816} height={816} className={`absolute bottom-1 right-2 h-28 w-28 object-contain ${phase === "wait" ? "animate-pulse" : ""}`} />
      </div>
      <p className="mt-2 text-sm">{tr("Casts left today")}: <b className="text-gold">{left}/{FISHING_CASTS_PER_DAY}</b> · {tr("Fish caught")}: {fmt(hero.fishing?.caught ?? 0)}</p>
      <div className="relative mt-3 h-6 w-full overflow-hidden rounded border border-border bg-background" aria-label={tr("Reel bar")}>
        {phase === "reel" && <div className="absolute inset-y-0 bg-gold/60" style={{ left: `${zone.at}%`, width: `${zone.w}%` }} />}
        <div className="absolute inset-y-0 w-1 bg-blood" style={{ left: `${pos}%` }} />
      </div>
      {msg && <p role="status" className="mt-2 text-center font-display text-gold">{msg}</p>}
      <Button className="btn-gold mt-3 w-full py-2" disabled={phase === "wait" || (phase === "idle" && left <= 0)} onClick={phase === "reel" ? stop : cast}>
        {phase === "reel" ? tr("Reel in!") : tr("Cast the line")}
      </Button>
      <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
        {CATCHES.map((c) => (
          <li key={c.id} className="slot flex justify-between p-1.5"><span>{tr(c.name)}</span><span className="text-muted-foreground">{fmt(c.gold)}+ {tr("gold")}</span></li>
        ))}
      </ul>
    </Panel>
  );
}

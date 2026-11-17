import { useEffect, useRef, useState } from "react";
import { Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AstrionLogo } from "./Logo";

/** Called inside a user gesture so browsers allow the studio sound. */
function playIntroSound() {
  try {
    const ctx = new AudioContext();
    void ctx.resume();
    const out = ctx.createGain();
    out.gain.value = 0.25;
    out.connect(ctx.destination);
    const t0 = ctx.currentTime;
    const boom = ctx.createOscillator(); const bg = ctx.createGain();
    boom.type = "sine"; boom.frequency.setValueAtTime(110, t0); boom.frequency.exponentialRampToValueAtTime(40, t0 + 1.6);
    bg.gain.setValueAtTime(0.0001, t0); bg.gain.exponentialRampToValueAtTime(0.9, t0 + 0.08); bg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
    boom.connect(bg).connect(out); boom.start(t0); boom.stop(t0 + 1.9);
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain(); const s = t0 + 0.35 + i * 0.12;
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.35, s + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.6);
      o.connect(g).connect(out); o.start(s); o.stop(s + 1.7);
    });
    const timer = window.setTimeout(() => { void ctx.close(); }, 4000);
    return () => { window.clearTimeout(timer); if (ctx.state !== "closed") void ctx.close(); };
  } catch { return () => {}; }
}

/** Reusable studio sequence at every game opening, independent of player saves. */
export function AstrionIntro({ onDone }: { onDone: () => void }) {
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const stopAudio = useRef<(() => void) | undefined>(undefined);
  const start = () => {
    if (started) return;
    stopAudio.current = playIntroSound();
    setStarted(true);
  };
  useEffect(() => () => stopAudio.current?.(), []);
  useEffect(() => {
    if (!started) return;
    const fade = window.setTimeout(() => setLeaving(true), 3400);
    const done = window.setTimeout(onDone, 4000);
    return () => { window.clearTimeout(fade); window.clearTimeout(done); };
  }, [started, onDone]);
  return (
    <div role="dialog" aria-label="Astrion Entertainment intro" aria-modal="true" className={`astrion astr-intro ${started ? "astr-intro-playing" : ""} ${leaving ? "astr-intro-out" : ""}`}>
      {started && <div className="astr-intro-ring" aria-hidden="true" />}
      <div className="astr-intro-logo"><AstrionLogo size={150} /></div>
      <div className="astr-intro-name">ASTRION <span className="astr-accent">ENTERTAINMENT</span></div>
      <div className="astr-intro-sub astr-muted">presents</div>
      {!started && <Button autoFocus className="astr-intro-start" onClick={start}><Play /> Enter game</Button>}
      <Button variant="ghost" className="astr-intro-skip" onClick={onDone}><SkipForward /> Skip intro</Button>
    </div>
  );
}

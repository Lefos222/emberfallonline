import { useEffect, useState } from "react";
import { AstrionLogo } from "./Logo";

/** Synthesised shimmer + low swell so the intro needs no audio file. */
function playIntroSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
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
    setTimeout(() => ctx.close(), 3500);
  } catch { /* audio unavailable */ }
}

/** Studio intro shown once per browser session before an Astrion game. Click or key to skip. */
export function AstrionIntro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    playIntroSound();
    const a = setTimeout(() => setLeaving(true), 3200);
    const b = setTimeout(onDone, 3900);
    const skip = () => { setLeaving(true); setTimeout(onDone, 500); };
    window.addEventListener("keydown", skip);
    return () => { clearTimeout(a); clearTimeout(b); window.removeEventListener("keydown", skip); };
  }, [onDone]);
  return (
    <div className={`astrion astr-intro ${leaving ? "astr-intro-out" : ""}`} onClick={() => { setLeaving(true); setTimeout(onDone, 500); }}>
      <div className="astr-intro-ring" />
      <div className="astr-intro-logo"><AstrionLogo size={150} /></div>
      <div className="astr-intro-name">ASTRION <span className="astr-accent">ENTERTAINMENT</span></div>
      <div className="astr-intro-sub astr-muted">presents</div>
    </div>
  );
}

export const INTRO_KEY = "astrion.introSeen";

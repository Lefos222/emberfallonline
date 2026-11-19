import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ParticleField } from "./particles";
import { preloadFx, texture } from "./textures";
import { ambienceFor, sceneFor, styleFor } from "./choreo";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CueOpts {
  actor?: string;
  targets?: string[];
  cls?: string | null;
  skill?: string | null;
  /** The battle event: dmg, crit, heal, block, absorb, status. */
  kind?: string | null;
  /** The blow's element: fire, ice, arcane, arrow, slash, tether... */
  element?: string | null;
}

export interface BattleFxHandle {
  charge: (o: CueOpts) => void;
  travel: (o: CueOpts) => void;
  impact: (o: CueOpts) => void;
  clear: () => void;
}

const prefersReduced = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The battle's light show: one additive canvas over the stage plus a screen-shake and a flash.
 * Battle.tsx calls charge / travel / impact around the events it already plays, so every skill
 * in the game gains a wind-up, a projectile with a trail, and a burst that the SVG arcs sit on
 * top of. Ambient motes keep the arena alive between blows.
 */
export const BattleFxLayer = forwardRef<BattleFxHandle, { scene?: string; boss?: boolean }>(
  function BattleFxLayer(props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fieldRef = useRef<ParticleField | null>(null);
    const frameRef = useRef(0);
    const lastRef = useRef(0);
    const moteRef = useRef(0);
    const ambienceRef = useRef(ambienceFor(sceneFor(props.scene, props.boss)));

    const rectOf = (id?: string): Rect | null => {
      if (!id) return null;
      const el = document.querySelector('[data-unit="' + id + '"]') as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.56, w: r.width, h: r.height };
    };

    // Screen shake and full-screen skill flashes are disabled by request.
    const shake = (_px: number) => {};
    const pop = (_color: string) => {};

    const charge = (o: CueOpts) => {
      const f = fieldRef.current;
      const a = rectOf(o.actor);
      if (!f || !a) return;
      const st = styleFor(o.cls, o.element);
      // The ring or sigil that opens under the fighter: the Wartune wind-up.
      f.emit({
        count: 1,
        x: a.x,
        y: a.y + a.h * 0.32,
        speed: [0, 0],
        life: [0.5, 0.62],
        size: [a.w * 1.5, a.w * 1.7],
        endSize: a.w * 2.2,
        colors: [st.core],
        sprite: st.charge,
        drag: 0,
        spin: [0.8, 1.3],
        alpha: 0.85,
      });
      // Energy drawn off the ground into the cast.
      f.emit({
        count: 16,
        x: a.x,
        y: a.y + a.h * 0.42,
        angle: -Math.PI / 2,
        spread: Math.PI * 0.9,
        speed: [40, 150],
        life: [0.3, 0.7],
        size: [5, 14],
        endSize: 0,
        colors: [st.core, st.trail],
        sprite: "dot",
        gravity: -60,
        drag: 1.2,
        alpha: 0.9,
      });
    };

    const travel = (o: CueOpts) => {
      const f = fieldRef.current;
      const a = rectOf(o.actor);
      if (!f || !a) return;
      const st = styleFor(o.cls, o.element);
      const spots = (o.targets ?? []).map(rectOf).filter((r): r is Rect => !!r);
      for (const t of spots) {
        const dx = t.x - a.x;
        const dy = t.y - a.y;
        const angle = Math.atan2(dy, dx);
        for (let i = 0; i < 28; i++) {
          const k = i / 28;
          f.emit({
            count: 1,
            x: a.x + dx * k + (Math.random() - 0.5) * 14,
            y: a.y + dy * k + (Math.random() - 0.5) * 14,
            angle,
            spread: Math.PI,
            speed: [6, 34],
            life: [0.18, 0.42],
            size: [10, 26],
            endSize: 0,
            colors: [st.core, st.trail, st.glow],
            sprite: st.travel,
            drag: 2.6,
            alpha: 0.9,
          });
        }
      }
    };

    const impact = (o: CueOpts) => {
      const f = fieldRef.current;
      if (!f) return;
      const st = styleFor(o.cls, o.element);
      const spots = (o.targets ?? []).map(rectOf).filter((r): r is Rect => !!r);
      const spot = spots[0] ?? rectOf(o.actor);
      if (!spot) return;

      if (o.kind === "heal" || o.kind === "absorb") {
        f.emit({
          count: 26,
          x: spot.x,
          y: spot.y,
          speed: [12, 80],
          life: [0.6, 1.4],
          size: [8, 18],
          endSize: 2,
          colors: [st.core, st.glow],
          sprite: "star",
          gravity: -80,
          drag: 0.9,
          alpha: 0.9,
        });
        return;
      }

      if (o.kind === "block") {
        f.emit({
          count: 1,
          x: spot.x,
          y: spot.y,
          speed: [0, 0],
          life: [0.3, 0.36],
          size: [spot.w * 0.8, spot.w * 0.9],
          endSize: spot.w * 1.4,
          colors: [st.core],
          sprite: "ring",
          drag: 0,
          alpha: 0.9,
        });
        shake(st.shake * 0.5);
        return;
      }

      // Sparks, smoke, the painted bloom and the shockwave ring: one landed blow.
      f.emit({
        count: 30,
        x: spot.x,
        y: spot.y,
        speed: [150, 480],
        life: [0.2, 0.55],
        size: [6, 18],
        endSize: 0,
        colors: [st.core, st.glow, "#ffffff"],
        sprite: "spark",
        drag: 2.6,
        alpha: 1,
      });
      f.emit({
        count: 12,
        x: spot.x,
        y: spot.y,
        speed: [20, 130],
        life: [0.4, 0.95],
        size: [28, 64],
        endSize: 8,
        colors: [st.smoke],
        sprite: "smoke",
        drag: 1.4,
        gravity: -30,
        alpha: 0.5,
      });
      f.emit({
        count: 1,
        x: spot.x,
        y: spot.y,
        speed: [0, 0],
        life: [0.32, 0.4],
        size: [spot.w * 1.4, spot.w * 1.6],
        endSize: spot.w * 2.4,
        colors: [st.core],
        sprite: st.burst,
        drag: 0,
        alpha: 0.95,
      });
      f.emit({
        count: 1,
        x: spot.x,
        y: spot.y,
        speed: [0, 0],
        life: [0.28, 0.34],
        size: [spot.w * 0.6, spot.w * 0.7],
        endSize: spot.w * 2.6,
        colors: [st.glow],
        sprite: "ring",
        drag: 0,
        alpha: 0.8,
      });
      shake(st.shake);
      if (o.kind === "crit") {
        shake(st.shake * 0.6);
        pop(st.glow);
      }
      if (o.element === "fire" || o.element === "meteor") pop(st.glow);
    };

    useImperativeHandle(ref, () => ({
      charge,
      travel,
      impact,
      clear: () => fieldRef.current?.clear(),
    }), []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      ambienceRef.current = ambienceFor(sceneFor(props.scene, props.boss));
    }, [props.scene, props.boss]);

    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const field = new ParticleField(640);
      fieldRef.current = field;
      preloadFx();

      let w = 0;
      let h = 0;
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = c.clientWidth;
        h = c.clientHeight;
        c.width = Math.max(1, Math.round(w * dpr));
        c.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);

      const tick = (now: number) => {
        frameRef.current = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - (lastRef.current || now)) / 1000);
        lastRef.current = now;
        if (!w || !h) resize();
        const amb = ambienceRef.current;
        if (!prefersReduced() && w && h) {
          moteRef.current += dt * amb.rate;
          while (moteRef.current >= 1) {
            moteRef.current -= 1;
            field.emit({
              count: 1,
              x: Math.random() * w,
              y: h * (0.3 + Math.random() * 0.5),
              angle: -Math.PI / 2,
              spread: 0.6,
              speed: [0, 14],
              life: [1.8, 3.6],
              size: [3, 10],
              endSize: 0,
              colors: amb.motes,
              sprite: "dot",
              gravity: amb.drift,
              drag: 0.1,
              alpha: 0.75,
            });
          }
        }
        field.update(dt);
        ctx.clearRect(0, 0, w, h);
        field.draw(ctx, texture);
      };
      frameRef.current = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(frameRef.current);
        window.removeEventListener("resize", resize);
        field.clear();
        fieldRef.current = null;
      };
    }, []);

    return (
      <>
        <canvas ref={canvasRef} className="battle-fx-layer" aria-hidden="true" />
      </>
    );
  },
);

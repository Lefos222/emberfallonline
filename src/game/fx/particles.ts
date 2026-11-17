/**
 * Pooled particle field for the battle stage.
 *
 * One additive canvas, no dependencies and no React: BattleFx owns the loop and the canvas,
 * this file only knows how to spawn, integrate and draw motes of light. Every attack in the
 * game is built out of these four things: a burst, a trail, a ring and a smoking aftermath.
 */
export type FxSprite = "dot" | "spark" | "smoke" | "ring" | "shard" | "star" | "impact" | "sigil" | "slash";

export interface EmitSpec {
  count: number;
  x: number;
  y: number;
  /** Degrees are converted for the caller; radians in, radians out. Default: straight up. */
  angle?: number;
  /** Total cone width in radians. Default: a full circle. */
  spread?: number;
  speed?: [number, number];
  life?: [number, number];
  size?: [number, number];
  endSize?: number;
  gravity?: number;
  drag?: number;
  colors: string[];
  sprite?: FxSprite;
  spin?: [number, number];
  alpha?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  endSize: number;
  color: string;
  sprite: FxSprite;
  gravity: number;
  drag: number;
  spin: number;
  rot: number;
  alpha: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T;

export class ParticleField {
  private items: Particle[] = [];
  private limit: number;

  constructor(limit = 620) {
    this.limit = limit;
  }

  get count(): number {
    return this.items.length;
  }

  clear() {
    this.items.length = 0;
  }

  emit(spec: EmitSpec) {
    const speed = spec.speed ?? [40, 170];
    const life = spec.life ?? [0.32, 0.9];
    const size = spec.size ?? [4, 12];
    const spread = spec.spread ?? Math.PI * 2;
    const base = spec.angle ?? -Math.PI / 2;
    for (let i = 0; i < spec.count; i++) {
      if (this.items.length >= this.limit) break;
      const a = base + rand(-0.5, 0.5) * spread;
      const v = rand(speed[0], speed[1]);
      const max = rand(life[0], life[1]);
      this.items.push({
        x: spec.x,
        y: spec.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: max,
        max,
        size: rand(size[0], size[1]),
        endSize: spec.endSize ?? 0,
        color: pick(spec.colors),
        sprite: spec.sprite ?? "dot",
        gravity: spec.gravity ?? 0,
        drag: spec.drag ?? 1.6,
        spin: rand(spec.spin ? spec.spin[0] : 0, spec.spin ? spec.spin[1] : 0),
        rot: Math.random() * Math.PI * 2,
        alpha: spec.alpha ?? 1,
      });
    }
  }

  update(dt: number) {
    const alive: Particle[] = [];
    for (const p of this.items) {
      p.life -= dt;
      if (p.life <= 0) continue;
      const damp = Math.max(0, 1 - p.drag * dt);
      p.vx *= damp;
      p.vy = p.vy * damp + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      alive.push(p);
    }
    this.items = alive;
  }

  draw(ctx: CanvasRenderingContext2D, tex: (sprite: FxSprite, color: string) => CanvasImageSource | null) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.items) {
      const t = Math.max(0, Math.min(1, p.life / p.max));
      const size = p.size + (p.endSize - p.size) * (1 - t);
      if (size <= 0.3) continue;
      ctx.globalAlpha = Math.min(1, t * 1.4) * p.alpha;
      const img = tex(p.sprite, p.color);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);
      if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
      else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

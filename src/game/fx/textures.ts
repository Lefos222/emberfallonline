import type { FxSprite } from "./particles";
import impactArt from "@/assets/fx/wartune-impact.png";
import sigilArt from "@/assets/fx/wartune-sigil.png";
import slashArt from "@/assets/fx/wartune-slash.png";

/** Painted art used whole, drawn additively on top of a burst. */
const PAINTED: Partial<Record<FxSprite, string>> = { impact: impactArt, sigil: sigilArt, slash: slashArt };

const tints = new Map<string, HTMLCanvasElement>();
const painted = new Map<string, HTMLImageElement>();

/**
 * Canvas cannot read CSS variables, and the game's palette lives in tokens such as var(--gold),
 * so every colour is resolved once against the live document before it becomes a texture.
 */
export function resolveColor(color: string): string {
  const trimmed = color.trim();
  if (!trimmed) return "#ffffff";
  const token = /^var\(\s*(--[A-Za-z0-9-]+)\s*\)$/.exec(trimmed);
  if (!token) return trimmed;
  if (typeof window === "undefined") return "#ffffff";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token[1] as string).trim();
  if (!raw) return "#ffffff";
  if (/^[\d.]+%?\s+[\d.]+%?\s+[\d.]+%?$/.test(raw)) return "hsl(" + raw.split(/\s+/).join(" ") + ")";
  return raw;
}

function makeCanvas(size: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  return c;
}

function tint(source: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const g = source.getContext("2d");
  if (g) {
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, source.width, source.height);
    g.globalCompositeOperation = "source-over";
  }
  return source;
}

function build(sprite: FxSprite, color: string): HTMLCanvasElement | null {
  const S = 96;
  const c = makeCanvas(S);
  if (!c) return null;
  const g = c.getContext("2d");
  if (!g) return null;
  const r = S / 2;

  if (sprite === "dot" || sprite === "smoke") {
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    if (sprite === "dot") {
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(255,255,255,.85)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
    } else {
      grad.addColorStop(0, "rgba(255,255,255,.42)");
      grad.addColorStop(0.6, "rgba(255,255,255,.16)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
  } else if (sprite === "spark") {
    const grad = g.createLinearGradient(0, 0, S, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.45, "rgba(255,255,255,.95)");
    grad.addColorStop(0.55, "rgba(255,255,255,.95)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(S * 0.08, r - 4, S * 0.84, 8);
    g.fillStyle = "rgba(255,255,255,.4)";
    g.fillRect(S * 0.2, r - 1.5, S * 0.6, 3);
  } else if (sprite === "ring") {
    g.strokeStyle = "rgba(255,255,255,.95)";
    g.lineWidth = 5;
    g.beginPath();
    g.arc(r, r, r * 0.74, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 0.45;
    g.lineWidth = 14;
    g.beginPath();
    g.arc(r, r, r * 0.74, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  } else if (sprite === "shard") {
    g.fillStyle = "rgba(255,255,255,.95)";
    g.beginPath();
    g.moveTo(r, r * 0.08);
    g.lineTo(r + r * 0.3, r);
    g.lineTo(r, r * 1.92);
    g.lineTo(r - r * 0.3, r);
    g.closePath();
    g.fill();
  } else if (sprite === "star") {
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.22, "rgba(255,255,255,.65)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    g.fillStyle = "rgba(255,255,255,.85)";
    g.fillRect(r - 1.5, 0, 3, S);
    g.fillRect(0, r - 1.5, S, 3);
  } else {
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
  }

  return tint(c, color);
}

/** The texture a particle draws: painted art comes back as-is, procedural art is tinted per colour. */
export function texture(sprite: FxSprite, color: string): CanvasImageSource | null {
  const art = PAINTED[sprite];
  if (art) {
    const cached = painted.get(sprite);
    if (cached && cached.complete && cached.naturalWidth > 0) return cached;
    if (typeof window !== "undefined") {
      if (!cached) {
        const img = new Image();
        img.decoding = "async";
        img.src = art;
        painted.set(sprite, img);
      }
      return painted.get(sprite)?.complete ? painted.get(sprite) ?? null : null;
    }
    return null;
  }
  const resolved = resolveColor(color);
  const key = sprite + "|" + resolved;
  const hit = tints.get(key);
  if (hit) return hit;
  const made = build(sprite, resolved);
  if (made) tints.set(key, made);
  return made;
}

/** Warm the painted sprites so the first blow of a fight already has its art. */
export function preloadFx() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(PAINTED) as FxSprite[];
  for (const key of keys) texture(key, "#ffffff");
}

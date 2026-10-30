// ============= Cloud City scenery =============
// Everything the sky realm is drawn from: a 2:1 isometric projection, marble buildings
// built out of three lit faces, citizens, and the small props that make the plaza read as
// a city. All of it is plain SVG, so it stays crisp at any zoom and needs no image assets.
//
// The projection is the classic 2:1 iso: +x runs right-and-down, +y left-and-down, and a
// point's depth on screen is its (x + y), which the region uses for z-ordering.

import type { ReactNode } from "react";
import { GRID, type CityBuilding, type CityNpc, type CityProp } from "./cloudcity";

export const TW = 64;
export const TH = 32;

export const iso = (x: number, y: number) => ({
  sx: (x - y) * (TW / 2),
  sy: (x + y - GRID) * (TH / 2),
});

/** Screen point → grid point, the inverse of `iso` (used for click-to-walk). */
export function unIso(sx: number, sy: number) {
  const a = sx / (TW / 2);
  const b = sy / (TH / 2) + GRID;
  return { x: (b + a) / 2, y: (b - a) / 2 };
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Mix a hex colour toward black (k > 0) or white (k < 0). */
export function shade(hex: string, k: number): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16),
    g = parseInt(v.slice(2, 4), 16),
    b = parseInt(v.slice(4, 6), 16);
  const t = k > 0 ? 0 : 255;
  const p = Math.abs(k);
  return `rgb(${clampByte(r + (t - r) * p)} ${clampByte(g + (t - g) * p)} ${clampByte(b + (t - b) * p)})`;
}

const points = (pts: number[][]) =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const poly = (pts: { sx: number; sy: number }[]) =>
  pts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");
const box2 = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });

export interface LocalBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * An SVG whose local origin (0,0) sits exactly on a world point, so shapes can be drawn in
 * local coordinates: negative y is up. `box` is the local rectangle that must be visible.
 */
export function WorldSvg({
  at,
  box,
  children,
  className,
}: {
  at: { sx: number; sy: number };
  box: LocalBox;
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      width={box.w}
      height={box.h}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      className={className}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${at.sx + box.x}px, ${at.sy + box.y}px, 0)`,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ---------------------------------------------------------------- buildings
/**
 * One building: a marble box with two lit walls, a roof and windows, standing on its
 * footprint. The anchor is the front (south) corner of the footprint.
 */
export function IsoBuilding({ b }: { b: CityBuilding }) {
  const { w, d, h } = b;
  const cx = b.x + w / 2,
    cy = b.y + d / 2;
  const px = b.x + w,
    py = b.y + d; // front corner: the anchor
  const at = (gx: number, gy: number, up = 0): [number, number] => [
    (gx - px) * (TW / 2) - (gy - py) * (TW / 2),
    (gx - px) * (TH / 2) + (gy - py) * (TH / 2) - up,
  ];

  const pal = b.pal;
  const wallL = [at(b.x, py, h), at(px, py, h), at(px, py), at(b.x, py)];
  const wallR = [at(px, py, h), at(px, b.y, h), at(px, b.y), at(px, py)];
  const top = [at(b.x, b.y, h), at(px, b.y, h), at(px, py, h), at(b.x, py, h)];
  const inset = [
    at(b.x + w * 0.14, b.y + d * 0.14, h),
    at(b.x + w * 0.86, b.y + d * 0.14, h),
    at(b.x + w * 0.86, b.y + d * 0.86, h),
    at(b.x + w * 0.14, b.y + d * 0.86, h),
  ];

  /** A rectangle painted flat on the south-west wall (f = along the wall, y = height in px). */
  const swPanel = (f0: number, f1: number, y0: number, y1: number) => [
    at(b.x + w * f0, py, y1),
    at(b.x + w * f1, py, y1),
    at(b.x + w * f1, py, y0),
    at(b.x + w * f0, py, y0),
  ];
  /** The same on the south-east wall. */
  const sePanel = (f0: number, f1: number, y0: number, y1: number) => [
    at(px, b.y + d * f1, y1),
    at(px, b.y + d * f0, y1),
    at(px, b.y + d * f0, y0),
    at(px, b.y + d * f1, y0),
  ];

  const rows = h > 110 ? [0.22, 0.5] : [0.28];
  const winH = Math.min(26, h * 0.26);
  const glass = "#bfe3f7";

  const roofH = Math.min(w, d) * TW * 0.55;
  const apex = at(cx, cy, h + roofH);
  const tallApex = at(cx, cy, h + roofH * 1.7);
  const dome = at(cx, cy, h);
  const domeRx = ((w + d) * TW) / 4;
  const domeRy = domeRx * 0.62;

  // The drawing box must hold the tallest thing this roof can put up: the spire finial.
  const peak = h + Math.max(roofH * 1.75, domeRy + 34);
  const box = box2(
    -(w * TW) / 2 - 30,
    -peak - 24,
    ((w + d) * TW) / 2 + 60,
    peak + 24 + ((w + d) * TH) / 2 + 34,
  );

  return (
    <WorldSvg at={iso(px, py)} box={box}>
      {/* walls */}
      <polygon
        points={points(wallL)}
        fill={pal.left}
        stroke={shade(pal.left, 0.35)}
        strokeWidth={1}
      />
      <polygon
        points={points(wallR)}
        fill={pal.right}
        stroke={shade(pal.right, 0.35)}
        strokeWidth={1}
      />
      {/* wall trim + windows + door */}
      <polygon
        points={points(swPanel(0.04, 0.96, h * 0.86, h * 0.86 + 6))}
        fill={pal.trim}
        opacity={0.85}
      />
      <polygon
        points={points(sePanel(0.04, 0.96, h * 0.86, h * 0.86 + 6))}
        fill={shade(pal.trim, 0.22)}
        opacity={0.85}
      />
      {rows.map((r) => (
        <g key={r}>
          <polygon
            points={points(swPanel(0.16, 0.3, h * r, h * r + winH))}
            fill={glass}
            opacity={0.92}
          />
          <polygon
            points={points(swPanel(0.56, 0.7, h * r, h * r + winH))}
            fill={glass}
            opacity={0.92}
          />
          <polygon
            points={points(sePanel(0.2, 0.34, h * r, h * r + winH))}
            fill={shade(glass, 0.16)}
            opacity={0.92}
          />
          <polygon
            points={points(sePanel(0.58, 0.72, h * r, h * r + winH))}
            fill={shade(glass, 0.16)}
            opacity={0.92}
          />
        </g>
      ))}
      <polygon
        points={points(swPanel(0.42, 0.56, 0, Math.min(44, h * 0.45)))}
        fill={shade(pal.trim, 0.45)}
      />

      {/* roof */}
      {b.roof === "flat" && (
        <>
          <polygon
            points={points(top.map(([x, y]) => [x, y]))}
            fill={pal.top}
            stroke={pal.trim}
            strokeWidth={3}
          />
          <polygon
            points={points(inset)}
            fill={shade(pal.top, 0.08)}
            stroke={shade(pal.top, 0.2)}
            strokeWidth={1}
          />
          <circle cx={at(cx, cy, h)[0]} cy={at(cx, cy, h)[1]} r={7} fill={pal.trim} />
        </>
      )}
      {b.roof === "pyramid" && (
        <>
          <polygon
            points={points([at(b.x, b.y, h), at(b.x, py, h), apex])}
            fill={shade(pal.right, 0.3)}
          />
          <polygon
            points={points([at(b.x, b.y, h), at(px, b.y, h), apex])}
            fill={shade(pal.left, 0.16)}
          />
          <polygon
            points={points([at(b.x, py, h), at(px, py, h), apex])}
            fill={pal.left}
            stroke={shade(pal.left, 0.2)}
            strokeWidth={1}
          />
          <polygon
            points={points([at(px, py, h), at(px, b.y, h), apex])}
            fill={pal.right}
            stroke={shade(pal.right, 0.2)}
            strokeWidth={1}
          />
          <circle cx={apex[0]} cy={apex[1]} r={5} fill={pal.trim} />
        </>
      )}
      {b.roof === "spire" && (
        <>
          <polygon
            points={points([at(b.x, b.y, h), at(b.x, py, h), apex])}
            fill={shade(pal.right, 0.28)}
          />
          <polygon points={points([at(b.x, py, h), at(px, py, h), apex])} fill={pal.left} />
          <polygon points={points([at(px, py, h), at(px, b.y, h), apex])} fill={pal.right} />
          <polygon
            points={points([
              at(cx - w * 0.08, cy - d * 0.08, h + roofH * 0.75),
              at(cx + w * 0.08, cy + d * 0.08, h + roofH * 0.75),
              tallApex,
            ])}
            fill={pal.trim}
            opacity={0.9}
          />
          <circle
            cx={tallApex[0]}
            cy={tallApex[1]}
            r={7}
            fill={pal.trim}
            stroke={shade(pal.trim, 0.35)}
            strokeWidth={1.5}
          />
          <circle
            cx={tallApex[0]}
            cy={tallApex[1]}
            r={13}
            fill="none"
            stroke={pal.trim}
            strokeWidth={2}
            opacity={0.4}
          />
        </>
      )}
      {b.roof === "dome" && (
        <>
          <polygon
            points={points(top)}
            fill={pal.top}
            stroke={shade(pal.top, 0.25)}
            strokeWidth={1}
          />
          <path
            d={`M ${dome[0] - domeRx} ${dome[1]} A ${domeRx} ${domeRy} 0 0 1 ${dome[0] + domeRx} ${dome[1]} Z`}
            fill={pal.top}
            stroke={shade(pal.top, 0.22)}
            strokeWidth={1.5}
          />
          <path
            d={`M ${dome[0] - domeRx * 0.86} ${dome[1]} A ${domeRx * 0.86} ${domeRy * 0.86} 0 0 1 ${dome[0] + domeRx * 0.86} ${dome[1]}`}
            fill="none"
            stroke={pal.trim}
            strokeWidth={3}
            opacity={0.75}
          />
          <circle cx={dome[0]} cy={dome[1] - domeRy - 8} r={6} fill={pal.trim} />
          <polygon
            points={points([
              [dome[0] - 4, dome[1] - domeRy],
              [dome[0] + 4, dome[1] - domeRy],
              [dome[0], dome[1] - domeRy - 26],
            ])}
            fill={pal.trim}
          />
        </>
      )}
      {/* pennant on the east corner */}
      <polygon
        points={points([at(px, b.y, h + 8), at(px, b.y, h + 48), at(px - w * 0.4, b.y, h + 36)])}
        fill={pal.trim}
        opacity={0.85}
      />
    </WorldSvg>
  );
}

// ---------------------------------------------------------------- props
export function PropView({ p }: { p: CityProp }) {
  const s = p.s ?? 1;
  const at = iso(p.x, p.y);
  if (p.kind === "fountain") {
    return (
      <WorldSvg at={at} box={box2(-86 * s, -96 * s, 172 * s, 120 * s)}>
        <ellipse
          cx={0}
          cy={0}
          rx={74 * s}
          ry={37 * s}
          fill="#e6ded0"
          stroke="#cfc5b4"
          strokeWidth={3}
        />
        <ellipse cx={0} cy={0} rx={66 * s} ry={32 * s} fill="#8fd0ee" />
        <ellipse cx={0} cy={0} rx={46 * s} ry={22 * s} fill="#bfe9fb" opacity={0.75} />
        <ellipse cx={0} cy={2} rx={16 * s} ry={8 * s} fill="#dff4ff" />
        <polygon
          points={points([
            [0, -6 * s],
            [7 * s, -52 * s],
            [0, -70 * s],
            [-7 * s, -52 * s],
          ])}
          fill="#d9f2ff"
          opacity={0.95}
        />
        <circle cx={0} cy={-72 * s} r={6 * s} fill="#ffffff" opacity={0.9} />
        <circle cx={-26 * s} cy={-28 * s} r={4 * s} fill="#e8f8ff" opacity={0.8} />
        <circle cx={24 * s} cy={-34 * s} r={3.4 * s} fill="#e8f8ff" opacity={0.8} />
      </WorldSvg>
    );
  }
  if (p.kind === "lamp") {
    return (
      <WorldSvg at={at} box={box2(-24, -100, 48, 112)}>
        <ellipse cx={0} cy={0} rx={9} ry={4} fill="rgb(40 60 80 / .25)" />
        <rect x={-2.5} y={-62} width={5} height={62} fill="#6d7d8c" />
        <circle cx={0} cy={-70} r={16} fill="#ffe9a8" opacity={0.4} />
        <circle cx={0} cy={-70} r={8} fill="#fff3c9" stroke="#d8b56a" strokeWidth={2} />
      </WorldSvg>
    );
  }
  if (p.kind === "tree") {
    const leaf = p.color ?? "#6fbf8f";
    return (
      <WorldSvg at={at} box={box2(-44, -104, 88, 116)}>
        <ellipse cx={0} cy={0} rx={20} ry={9} fill="rgb(40 60 80 / .2)" />
        <rect x={-4} y={-34} width={8} height={34} rx={3} fill="#8a6a48" />
        <circle cx={-11} cy={-52} r={22} fill={shade(leaf, 0.18)} />
        <circle cx={13} cy={-48} r={19} fill={leaf} />
        <circle cx={0} cy={-68} r={24} fill={shade(leaf, -0.12)} />
        <circle cx={-6} cy={-74} r={10} fill={shade(leaf, -0.35)} opacity={0.7} />
      </WorldSvg>
    );
  }
  if (p.kind === "crystal") {
    return (
      <WorldSvg at={at} box={box2(-34, -96, 68, 108)}>
        <ellipse cx={0} cy={0} rx={16} ry={7} fill="rgb(70 120 160 / .28)" />
        <polygon
          points={points([
            [-13, 0],
            [-6, -46],
            [8, -30],
            [12, 0],
          ])}
          fill="#8ee6f2"
          opacity={0.95}
          stroke="#5ab8cc"
          strokeWidth={1.5}
        />
        <polygon
          points={points([
            [4, 0],
            [10, -34],
            [20, -20],
            [20, 0],
          ])}
          fill="#c8a8f0"
          opacity={0.92}
          stroke="#9a7ccc"
          strokeWidth={1.5}
        />
        <polygon
          points={points([
            [-8, 0],
            [-2, -54],
            [4, -40],
            [6, 0],
          ])}
          fill="#eafcff"
          opacity={0.75}
        />
      </WorldSvg>
    );
  }
  if (p.kind === "rock") {
    return (
      <WorldSvg at={at} box={box2(-30, -40, 60, 48)}>
        <ellipse cx={0} cy={0} rx={18} ry={8} fill="rgb(40 60 80 / .18)" />
        <polygon
          points={points([
            [-18, 0],
            [-12, -20],
            [6, -26],
            [19, -10],
            [14, 0],
          ])}
          fill="#c7c3bb"
          stroke="#a9a49a"
          strokeWidth={1.5}
        />
        <polygon
          points={points([
            [-12, -20],
            [6, -26],
            [-2, -14],
          ])}
          fill="#e3e0d8"
        />
      </WorldSvg>
    );
  }
  if (p.kind === "bush") {
    return (
      <WorldSvg at={at} box={box2(-26, -34, 52, 42)}>
        <ellipse cx={0} cy={0} rx={14} ry={6} fill="rgb(40 60 80 / .16)" />
        <circle cx={-7} cy={-10} r={11} fill="#7cc79a" />
        <circle cx={8} cy={-9} r={10} fill="#63b184" />
        <circle cx={0} cy={-16} r={11} fill="#8ed3a8" />
      </WorldSvg>
    );
  }
  return (
    <WorldSvg at={at} box={box2(-24, -108, 72, 118)}>
      <ellipse cx={0} cy={0} rx={8} ry={4} fill="rgb(40 60 80 / .2)" />
      <rect x={-2} y={-92} width={4} height={92} fill="#9aa6b2" />
      <polygon
        points={points([
          [2, -90],
          [38, -82],
          [30, -70],
          [38, -58],
          [2, -52],
        ])}
        fill={p.color ?? "#5f9fc9"}
        stroke="#3d7ba4"
        strokeWidth={1.5}
      />
      <circle cx={0} cy={-96} r={4} fill="#e3c26d" />
    </WorldSvg>
  );
}

// ---------------------------------------------------------------- citizens
const SKIN = "#f1cfae";

/** A citizen: a small painted figure. Rendered inside an actor div, so the anchor is 0,0. */
export function NpcFigure({ npc, scale = 1 }: { npc: CityNpc; scale?: number }) {
  const c = npc.color;
  const dark = shade(c, 0.3);
  const light = shade(c, -0.2);
  return (
    <WorldSvg at={{ sx: 0, sy: 0 }} box={box2(-28 * scale, -84 * scale, 56 * scale, 88 * scale)}>
      <g transform={`scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={15} ry={7} fill="rgb(40 60 80 / .22)" />
        {npc.look === "guard" ? (
          <>
            <rect x={-8} y={-26} width={6} height={26} rx={2} fill="#556573" />
            <rect x={2} y={-26} width={6} height={26} rx={2} fill="#556573" />
            <rect x={-2} y={-46} width={4} height={20} fill="#6e7d8a" />
            <path
              d="M -13 -44 Q -13 -26 0 -24 Q 13 -26 13 -44 Z"
              fill={c}
              stroke={dark}
              strokeWidth={1.4}
            />
            <path d="M -13 -44 Q 0 -50 13 -44 L 13 -50 Q 0 -56 -13 -50 Z" fill={light} />
            <circle cx={0} cy={-54} r={8} fill={SKIN} />
            <path d="M -9 -56 Q 0 -68 9 -56 Z" fill={dark} />
            <rect x={-1.6} y={-92} width={3.2} height={40} fill="#8a6a48" />
            <polygon
              points={points([
                [-4, -92],
                [4, -92],
                [0, -102],
              ])}
              fill="#cfd8e0"
            />
          </>
        ) : npc.look === "mage" ? (
          <>
            <path
              d="M -12 -4 Q -16 -36 0 -50 Q 16 -36 12 -4 Z"
              fill={c}
              stroke={dark}
              strokeWidth={1.4}
            />
            <path d="M -12 -10 Q 0 -4 12 -10 L 12 -4 Q 0 2 -12 -4 Z" fill={light} opacity={0.8} />
            <circle cx={0} cy={-56} r={8} fill={SKIN} />
            <path d="M -10 -58 Q 0 -72 10 -58 Q 0 -64 -10 -58 Z" fill={dark} />
            <rect x={14} y={-78} width={2.6} height={78} fill="#9c7c52" />
            <circle cx={15} cy={-82} r={5.5} fill={light} opacity={0.95} />
          </>
        ) : npc.look === "merchant" ? (
          <>
            <rect
              x={-11}
              y={-30}
              width={22}
              height={30}
              rx={4}
              fill={c}
              stroke={dark}
              strokeWidth={1.4}
            />
            <rect x={-11} y={-42} width={22} height={14} rx={3} fill={light} />
            <rect x={-9} y={-46} width={18} height={6} rx={2} fill={dark} />
            <circle cx={0} cy={-51} r={7.5} fill={SKIN} />
            <ellipse cx={0} cy={-57} rx={15} ry={4} fill={dark} />
            <rect x={-16} y={-32} width={7} height={16} rx={3} fill={shade(c, 0.18)} />
          </>
        ) : npc.look === "smith" ? (
          <>
            <rect
              x={-12}
              y={-34}
              width={24}
              height={34}
              rx={4}
              fill={c}
              stroke={dark}
              strokeWidth={1.4}
            />
            <rect
              x={-7}
              y={-30}
              width={14}
              height={26}
              rx={2}
              fill={shade(SKIN, 0.12)}
              opacity={0.5}
            />
            <circle cx={0} cy={-46} r={8} fill={SKIN} />
            <path d="M -9 -50 Q 0 -58 9 -50 L 9 -46 Q 0 -52 -9 -46 Z" fill="#4b4038" />
            <rect x={12} y={-64} width={2.6} height={64} fill="#8a6a48" />
            <rect x={7} y={-70} width={12} height={8} rx={2} fill="#7d8a96" />
          </>
        ) : npc.look === "child" ? (
          <>
            <path
              d="M -8 -2 Q -10 -22 0 -30 Q 10 -22 8 -2 Z"
              fill={c}
              stroke={dark}
              strokeWidth={1.3}
            />
            <circle cx={0} cy={-35} r={6.5} fill={SKIN} />
            <path d="M -7 -37 Q 0 -45 7 -37 Z" fill={dark} />
            <circle cx={10} cy={-12} r={3.4} fill="#ffe9a8" />
          </>
        ) : (
          <>
            <path
              d="M -12 -2 Q -15 -34 0 -46 Q 15 -34 12 -2 Z"
              fill={c}
              stroke={dark}
              strokeWidth={1.4}
            />
            <path d="M -12 -8 Q 0 -2 12 -8 L 12 -2 Q 0 4 -12 -2 Z" fill={light} opacity={0.85} />
            <circle cx={0} cy={-52} r={8} fill={SKIN} />
            <path d="M -11 -54 Q 0 -70 11 -54 Q 0 -60 -11 -54 Z" fill={dark} />
          </>
        )}
      </g>
    </WorldSvg>
  );
}

// ---------------------------------------------------------------- ground
const G = GRID;

/** The floating island, its plaza and its avenues. Drawn once, behind everything. */
export function IslandGround() {
  const top = iso(0, 0),
    right = iso(G, 0),
    bottom = iso(G, G),
    left = iso(0, G);
  const T = 104;
  const plaza = [iso(5.2, 5.2), iso(10.8, 5.2), iso(10.8, 10.8), iso(5.2, 10.8)];
  const southRoad = [iso(7.4, 10.4), iso(9.0, 10.4), iso(9.0, 14.8), iso(7.4, 14.8)];
  const northRoad = [iso(7.0, 4.9), iso(9.4, 4.9), iso(9.4, 10.6), iso(7.0, 10.6)];
  return (
    <svg
      width={1280}
      height={1020}
      viewBox="-640 -440 1280 1020"
      style={{ position: "absolute", left: -640, top: -440, overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bfe6ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#bfe6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cc-earth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9a98d" />
          <stop offset="100%" stopColor="#6d6154" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={bottom.sy + T * 0.7} rx={620} ry={180} fill="url(#cc-glow)" />
      <polygon
        points={points([
          [right.sx, right.sy],
          [bottom.sx, bottom.sy],
          [bottom.sx, bottom.sy + T],
          [right.sx, right.sy + T],
        ])}
        fill="#8d8172"
      />
      <polygon
        points={points([
          [left.sx, left.sy],
          [bottom.sx, bottom.sy],
          [bottom.sx, bottom.sy + T],
          [left.sx, left.sy + T],
        ])}
        fill="url(#cc-earth)"
      />
      <polygon
        points={points([
          [left.sx, left.sy],
          [bottom.sx, bottom.sy],
          [bottom.sx, bottom.sy + T * 0.45],
          [left.sx, left.sy + T * 0.45],
        ])}
        fill="#a2937e"
        opacity={0.6}
      />
      <polygon
        points={poly([top, right, bottom, left])}
        fill="#f2f7f4"
        stroke="#d9e6ef"
        strokeWidth={3}
      />
      <polygon
        points={poly([top, right, bottom, left])}
        fill="none"
        stroke="#bfe0c8"
        strokeWidth={22}
        opacity={0.5}
      />
      <polygon points={poly(southRoad)} fill="#e6e2d6" />
      <polygon points={poly(northRoad)} fill="#e6e2d6" />
      <polygon points={poly(plaza)} fill="#efeade" stroke="#d8d2c2" strokeWidth={4} />
      <polygon
        points={poly([iso(6.4, 6.4), iso(9.6, 6.4), iso(9.6, 9.6), iso(6.4, 9.6)])}
        fill="none"
        stroke="#dcd5c4"
        strokeWidth={2}
      />
      <g stroke="#cdd8e2" strokeWidth={1} opacity={0.45}>
        {Array.from({ length: G + 1 }).map((_, i) => {
          const a = iso(i, 0),
            b = iso(i, G),
            c = iso(0, i),
            d = iso(G, i);
          return (
            <g key={i}>
              <line x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} />
              <line x1={c.sx} y1={c.sy} x2={d.sx} y2={d.sy} />
            </g>
          );
        })}
      </g>
      {Array.from({ length: 7 }).map((_, i) => {
        const t = 0.14 + i * 0.12;
        return (
          <circle
            key={i}
            cx={left.sx + (bottom.sx - left.sx) * t}
            cy={left.sy + (bottom.sy - left.sy) * t - 4}
            r={4}
            fill="#cfd9df"
            stroke="#9fb0bd"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

/** Drifting clouds and distant sky islets, fixed behind the city. */
export function CloudSky() {
  return (
    <div className="cc-sky" aria-hidden="true">
      <div className="cc-sky-sun" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`c${i}`}
          className="cc-cloud"
          style={{
            top: `${6 + i * 13}%`,
            animationDelay: `${-i * 11}s`,
            animationDuration: `${70 + i * 26}s`,
            opacity: 0.9 - i * 0.12,
            scale: `${1.5 - i * 0.18}`,
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <div
          key={`i${i}`}
          className="cc-islet"
          style={{ top: `${16 + i * 24}%`, left: `${6 + i * 32}%`, animationDelay: `${-i * 6}s` }}
        >
          <span />
        </div>
      ))}
    </div>
  );
}

import ore from "@/assets/mat-ore.png";
import essence from "@/assets/mat-essence.png";
import starshard from "@/assets/mat-starshard.png";
import bossCore from "@/assets/mat-bossCore.png";
import fragment from '@/assets/mat-fragment.png';
import sigil from '@/assets/mat-sigil.png';
import ruby from "@/assets/gem-ruby.png";
import sapphire from "@/assets/gem-sapphire.png";
import emerald from "@/assets/gem-emerald.png";
import topaz from "@/assets/gem-topaz.png";
import gemSheet from "@/assets/gem-sprites.png.asset.json";
import astralSheet from "@/assets/astral-sprites.png.asset.json";
import type { ReactNode } from "react";
import type { GemType, Mat } from "./crafting";

const MAT_IMG: Partial<Record<Mat, string>> = { ore, essence, starshard, bossCore, fragment, sigil };
const GEM_IMG: Partial<Record<GemType, string>> = { ruby, sapphire, emerald, topaz };
import { ASTRAL_BASES, ASTRAL_COLORS, GEMS, MATS } from "./crafting";
import { uid } from "./data";

/** Drawn shapes for materials that have no painted sheet art. */
const MAT_SHAPE: Partial<Record<Mat, ReactNode>> = {
  fragment: (<><path d="M4 3h9l3 5-6 9-6-9z" fill="#9aa3b5" stroke="#222" /><path d="M4 3l6 5 3-5M10 8v9" stroke="#e6ebf5" strokeWidth="0.6" fill="none" /></>),
  sigil: (<><circle cx="10" cy="10" r="8" fill="#5a1220" stroke="#c9a227" strokeWidth="1.5" /><path d="M10 4l1.8 4 4.2.4-3.2 2.8 1 4.2L10 13l-3.8 2.4 1-4.2L4 8.4 8.2 8z" fill="#f2c94c" /></>),
  hide: (<><path d="M3 5c3-3 11-3 14 0 1 3-1 6-2 7 1 2 0 5-2 6-4 1-9-1-11-4-1-2 0-4 2-5C3 8 2 6 3 5z" fill="#8a5a32" stroke="#2b1a0f" strokeWidth="0.8" /><path d="M7 6c2 2 4 6 4 9" stroke="#5d3a1e" strokeWidth="0.8" fill="none" /></>),
  bloom: (<><path d="M10 11v7" stroke="#3f7a3a" strokeWidth="1.2" /><path d="M10 3c2 0 3 2 3 3s-1 2-3 2-3-1-3-2 1-3 3-3z" fill="#e2603a" stroke="#7a2a12" strokeWidth="0.8" /><path d="M5 7c2 0 3 2 3 3s-1 2-3 2-2-1-2-3 0-2 2-2z" fill="#c9452a" stroke="#7a2a12" strokeWidth="0.6" /><path d="M15 7c-2 0-3 2-3 3s1 2 3 2 2-1 2-3 0-2-2-2z" fill="#c9452a" stroke="#7a2a12" strokeWidth="0.6" /></>),
  crystal: (<><path d="M10 1.5l6 5.5-3 11.5H7L4 7z" fill="#7b5cd6" stroke="#2a1b4d" strokeWidth="0.9" /><path d="M10 1.5L8.5 18.5M4 7h12" stroke="#c9b6ff" strokeWidth="0.6" fill="none" /></>),
};
/**
 * Enhancement Stones: four drawn designs, one per level. Every level keeps the same cut stone
 * silhouette so the family reads as one item, and adds facets, runes and finally an aura so a
 * Lv 4 stone is unmistakable next to a Lv 1.
 */
const STONE_TINT = [
  { light: "#cfd8e4", mid: "#8b98a9", dark: "#414d5c", glow: "#7f8ea1", rune: "#eaf0f8" },
  { light: "#ffd89b", mid: "#d29b45", dark: "#6f4612", glow: "#e8ab4a", rune: "#fff3d6" },
  { light: "#dcb8ff", mid: "#8f55d6", dark: "#43216b", glow: "#a86ff0", rune: "#f4e8ff" },
  { light: "#fff3c4", mid: "#e6b02a", dark: "#7d4f05", glow: "#ffcc4d", rune: "#fffbea" },
] as const;
const STONE_CUT = "M12 1.5 19 5.8 21.5 13.4 16.8 21.4H7.2L2.5 13.4 5 5.8Z";
const STONE_RUNES: string[][] = [
  ["M12 9.5v5"],
  ["M8.6 12h6.8", "M9.6 9.4 12 12l2.4-2.6"],
  ["M9 10.4h6M9 13.6h6", "M12 8v8", "M10 15.6 12 17.6 14 15.6"],
  ["M9 10h6M9 14h6", "M12 7.6v8.8", "M9.6 8.6 12 6.4l2.4 2.2"],
];
export function EnhancementStoneIcon({ tier, size = 20, className = "" }: { tier: 1 | 2 | 3 | 4; size?: number; className?: string }) {
  const id = `stone${tier}-${uid()}`;
  const t = STONE_TINT[tier - 1];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={MATS[`enhStone${tier}` as Mat].name}
      className={`inline-block shrink-0 align-middle ${className}`}>
      <title>{MATS[`enhStone${tier}` as Mat].name}</title>
      <defs>
        <radialGradient id={`${id}-face`} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor={t.light} />
          <stop offset="52%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.dark} />
        </radialGradient>
        <radialGradient id={`${id}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="45%" stopColor={t.glow} stopOpacity={tier >= 4 ? 0.75 : tier >= 3 ? 0.45 : 0.22} />
          <stop offset="100%" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11.5" fill={`url(#${id}-aura)`} />
      {(tier >= 3) && (
        <g stroke={t.rune} strokeWidth="0.9" fill="none" opacity={tier >= 4 ? 0.85 : 0.6}>
          <path d="M2.5 12A9.5 9.5 0 0 1 21.5 12" />
          {tier >= 4 && <path d="M12 1 14 4 12 7 10 4Z" fill={t.rune} stroke="none" opacity="0.9" />}
          {tier >= 4 && <path d="M2 19.5 5.5 18 7 21Z" fill={t.rune} stroke="none" opacity="0.7" />}
          {tier >= 4 && <path d="M22 19.5 18.5 18 17 21Z" fill={t.rune} stroke="none" opacity="0.7" />}
        </g>
      )}
      <path d={STONE_CUT} fill={`url(#${id}-face)`} stroke="#12141a" strokeWidth="1.1" />
      <path d="M12 1.5 12 21.4M5 5.8 12 12l7-6.2M2.5 13.4 12 12l9.5 1.4" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" fill="none" />
      <path d="M5 5.8 7.6 12 7.2 21.4" stroke="#000000" strokeOpacity="0.3" strokeWidth="0.6" fill="none" />
      {/* The steel collar appears from Lv 2 and the heavier runed band from Lv 3. */}
      {tier >= 2 && <path d="M3.6 9.6h16.8" stroke="#2a2f3a" strokeWidth="2.1" strokeLinecap="round" />}
      {tier >= 2 && <path d="M3.6 9.6h16.8" stroke={tier >= 3 ? t.glow : "#b9c3d0"} strokeWidth="0.8" strokeLinecap="round" />}
      <g stroke={t.rune} strokeWidth={tier >= 3 ? 1.1 : 0.9} strokeLinecap="round" fill="none" opacity="0.95">
        {STONE_RUNES[tier - 1].map((d, i) => <path key={i} d={d} />)}
      </g>
      {tier >= 4 && <circle cx="12" cy="12" r="8.4" stroke={t.light} strokeWidth="0.5" fill="none" opacity="0.55" />}
    </svg>
  );
}

/** Material keys that render as an Enhancement Stone. */
const STONE_TIER: Partial<Record<Mat, 1 | 2 | 3 | 4>> = { enhStone1: 1, enhStone2: 2, enhStone3: 3, enhStone4: 4 };

export const MatIcon = ({ mat, size = 20 }: { mat: Mat; size?: number }) => STONE_TIER[mat] ? (
  <EnhancementStoneIcon tier={STONE_TIER[mat]!} size={size} />
) : MAT_IMG[mat] ? (
  <img src={MAT_IMG[mat]} alt="" width={size} height={size} loading="lazy" className="inline-block align-middle" style={{ width: size, height: size }} />
) : (
  <svg width={size} height={size} viewBox="0 0 20 20" className="inline-block align-middle" role="img" aria-label={MATS[mat].name}>
    {MAT_SHAPE[mat] ?? <path d="M5 3h10l4 5-9 10L1 8z" fill="#9aa3b5" stroke="#222" />}
  </svg>
);
/** Cut shapes so each gem type is recognisable even without a painted icon. */
const CUTS: Partial<Record<GemType, string>> = {
  amethyst: "M10 1l6 5-2 12H6L4 6z", aquamarine: "M3 7l7-6 7 6-7 12z", garnet: "M10 2a8 8 0 1 1 0 16a8 8 0 1 1 0-16z",
  peridot: "M10 1l8 9-8 9-8-9z", opal: "M10 2c5 0 8 3.5 8 8s-3 8-8 8-8-3.5-8-8 3-8 8-8z", onyx: "M3 3h14v14H3z",
  obsidian: "M10 1l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z", moonstone: "M13 2a8 8 0 1 0 5 13A7 7 0 0 1 13 2z", pearl: "M10 3a7 7 0 1 1 0 14a7 7 0 1 1 0-14z",
};
const GEM_SHEET: GemType[] = ["amethyst", "aquamarine", "garnet", "peridot", "opal", "onyx", "obsidian", "moonstone", "pearl"];
const GEM_SHEET_COLS = 3;
export const GemIcon = ({ type, size = 18 }: { type: GemType; size?: number }) => {
  const cell = GEM_SHEET.indexOf(type);
  if (GEM_IMG[type]) return (
    <img src={GEM_IMG[type]} alt={GEMS[type].name} width={size} height={size} loading="lazy" className="mr-1 inline-block align-middle" style={{ width: size, height: size }} />
  );
  if (cell >= 0) {
    const col = cell % GEM_SHEET_COLS;
    const row = Math.floor(cell / GEM_SHEET_COLS);
    return (
      <span role="img" aria-label={GEMS[type].name} title={GEMS[type].name} className="mr-1 inline-block shrink-0 align-middle"
        style={{ width: size, height: size, borderRadius: Math.max(2, size / 8), overflow: "hidden",
          backgroundImage: `url(${gemSheet.url})`,
          backgroundSize: `${size * GEM_SHEET_COLS}px ${size * GEM_SHEET_COLS}px`,
          backgroundPosition: `-${col * size}px -${row * size}px` }} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className="mr-1 inline-block align-middle" aria-label={GEMS[type].name} role="img">
      <defs>
        <radialGradient id={`g-${type}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="35%" stopColor={GEMS[type].color} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <path d={CUTS[type] ?? "M5 3h10l4 5-9 10L1 8z"} fill={`url(#g-${type})`} stroke="#111" strokeWidth="0.8" />
      <path d={CUTS[type] ?? "M5 3h10l4 5-9 10L1 8z"} fill="none" stroke="#fff8" strokeWidth="0.4" transform="translate(10 10) scale(0.55) translate(-10 -10)" />
      <circle cx="7" cy="6" r="1.2" fill="#fff" opacity="0.8" />
    </svg>
  );
};
/** Painted portrait for every Astral species, sliced from one 4x4 sprite sheet. */
const ASTRAL_KEYS = Object.keys(ASTRAL_BASES);
const ASTRAL_SHEET_COLS = 4;
export const AstralIcon = ({ base, rarity = 0, size = 48 }: { base: string; rarity?: number; size?: number }) => {
  const cell = Math.max(0, ASTRAL_KEYS.indexOf(base));
  const col = cell % ASTRAL_SHEET_COLS;
  const row = Math.floor(cell / ASTRAL_SHEET_COLS);
  const glow = ASTRAL_COLORS[rarity] ?? "#9a9a9a";
  return (
    <span role="img" aria-label={ASTRAL_BASES[base]?.name ?? "Astral"} title={ASTRAL_BASES[base]?.name ?? "Astral"}
      className="inline-block shrink-0 rounded-lg" style={{ width: size, height: size, overflow: "hidden",
        boxShadow: `0 0 0 2px ${glow}, 0 0 10px ${glow}66`,
        backgroundImage: `url(${astralSheet.url})`,
        backgroundSize: `${size * ASTRAL_SHEET_COLS}px ${size * ASTRAL_SHEET_COLS}px`,
        backgroundPosition: `-${col * size}px -${row * size}px` }} />
  );
};

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
import type { GemType, Mat } from "./crafting";

const MAT_IMG: Partial<Record<Mat, string>> = { ore, essence, starshard, bossCore, fragment, sigil };
const GEM_IMG: Partial<Record<GemType, string>> = { ruby, sapphire, emerald, topaz };
import { GEMS } from "./crafting";

export const MatIcon = ({ mat, size = 20 }: { mat: Mat; size?: number }) => !MAT_IMG[mat] ? (
  <svg width={size} height={size} viewBox="0 0 20 20" className="inline-block align-middle" role="img" aria-label={mat === "fragment" ? "Armor Fragment" : "Elite Sigil"}>
    {mat === "fragment" ? (<><path d="M4 3h9l3 5-6 9-6-9z" fill="#9aa3b5" stroke="#222" /><path d="M4 3l6 5 3-5M10 8v9" stroke="#e6ebf5" strokeWidth="0.6" fill="none" /></>) : (
      <><circle cx="10" cy="10" r="8" fill="#5a1220" stroke="#c9a227" strokeWidth="1.5" /><path d="M10 4l1.8 4 4.2.4-3.2 2.8 1 4.2L10 13l-3.8 2.4 1-4.2L4 8.4 8.2 8z" fill="#f2c94c" /></>
    )}
  </svg>
) : (
  <img src={MAT_IMG[mat]} alt="" width={size} height={size} loading="lazy" className="inline-block align-middle" style={{ width: size, height: size }} />
);
/** Cut shapes so each gem type is recognisable even without a painted icon. */
const CUTS: Partial<Record<GemType, string>> = {
  amethyst: "M10 1l6 5-2 12H6L4 6z", aquamarine: "M3 7l7-6 7 6-7 12z", garnet: "M10 2a8 8 0 1 1 0 16a8 8 0 1 1 0-16z",
  peridot: "M10 1l8 9-8 9-8-9z", opal: "M10 2c5 0 8 3.5 8 8s-3 8-8 8-8-3.5-8-8 3-8 8-8z", onyx: "M3 3h14v14H3z",
  obsidian: "M10 1l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z", moonstone: "M13 2a8 8 0 1 0 5 13A7 7 0 0 1 13 2z", pearl: "M10 3a7 7 0 1 1 0 14a7 7 0 1 1 0-14z",
};
export const GemIcon = ({ type, size = 18 }: { type: GemType; size?: number }) => !GEM_IMG[type] ? (
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
) : (
  <img src={GEM_IMG[type]} alt={GEMS[type].name} width={size} height={size} loading="lazy" className="mr-1 inline-block align-middle" style={{ width: size, height: size }} />
);

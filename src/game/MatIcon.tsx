import ore from "@/assets/mat-ore.png";
import essence from "@/assets/mat-essence.png";
import starshard from "@/assets/mat-starshard.png";
import bossCore from "@/assets/mat-bossCore.png";
import ruby from "@/assets/gem-ruby.png";
import sapphire from "@/assets/gem-sapphire.png";
import emerald from "@/assets/gem-emerald.png";
import topaz from "@/assets/gem-topaz.png";
import type { GemType, Mat } from "./crafting";

const MAT_IMG: Partial<Record<Mat, string>> = { ore, essence, starshard, bossCore };
const GEM_IMG: Partial<Record<GemType, string>> = { ruby, sapphire, emerald, topaz };
import { GEMS } from "./crafting";

export const MatIcon = ({ mat, size = 20 }: { mat: Mat; size?: number }) => !MAT_IMG[mat] ? (
  <svg width={size} height={size} viewBox="0 0 20 20" className="inline-block align-middle" aria-hidden><path d={mat === "fragment" ? "M4 3h9l3 5-6 9-6-9z" : "M10 2l7 4v8l-7 4-7-4V6z"} fill={mat === "fragment" ? "#9aa3b5" : "#c9a227"} stroke="#222" /></svg>
) : (
  <img src={MAT_IMG[mat]} alt="" width={size} height={size} loading="lazy" className="inline-block align-middle" style={{ width: size, height: size }} />
);
export const GemIcon = ({ type, size = 18 }: { type: GemType; size?: number }) => !GEM_IMG[type] ? (
  <svg width={size} height={size} viewBox="0 0 20 20" className="mr-1 inline-block align-middle" aria-hidden><path d="M5 3h10l4 5-9 10L1 8z" fill={GEMS[type].color} stroke="#111" /><path d="M1 8h18M5 3l5 15 5-15" stroke="#fff6" fill="none" /></svg>
) : (
  <img src={GEM_IMG[type]} alt="" width={size} height={size} loading="lazy" className="mr-1 inline-block align-middle" style={{ width: size, height: size }} />
);

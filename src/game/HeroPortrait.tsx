import { useId } from "react";
import { CharacterModel } from "./CharacterModel";
import {
  BEARD_STYLES,
  BROW_SHAPES,
  EYE_COLORS,
  EYE_SHAPES,
  FACE_MARKS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  normalizeFace,
  type HeroFace,
} from "./customization";
import type { HeroClass } from "./data";

const COLLAR: Record<HeroClass, [string, string]> = {
  warrior: ["#6f2b2b", "#3d1717"],
  mage: ["#34457f", "#1b2340"],
  archer: ["#2f6040", "#173222"],
};

/**
 * The hero's portrait.
 *
 * With no saved face it draws the original painted class model, so every existing character looks
 * exactly as it did. Once a face is chosen it draws the layered portrait instead — skin, hair,
 * eyes, brows, facial hair and a mark — using only cosmetic data.
 */
export function HeroPortrait({
  cls,
  gender,
  face,
  className = "",
  synth,
  look,
}: {
  cls: HeroClass;
  gender: "male" | "female";
  face?: Partial<HeroFace> | null;
  className?: string;
  synth?: number | null;
  look?: number | null;
}) {
  if (!face) {
    return <CharacterModel cls={cls} gender={gender} className={className} synth={synth} look={look} />;
  }
  return <FacePortrait cls={cls} gender={gender} face={face} className={className} />;
}

function FacePortrait({
  cls,
  gender,
  face,
  className,
}: {
  cls: HeroClass;
  gender: "male" | "female";
  face: Partial<HeroFace>;
  className: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const f = normalizeFace(face);
  const skin = SKIN_TONES[f.skin];
  const hair = HAIR_COLORS[f.hairColor];
  const eye = EYE_COLORS[f.eyes];
  const [collar, collarShade] = COLLAR[cls];
  const brow = BROW_SHAPES[f.brows];
  const browColor = hair.shade;
  const label = `${gender === "female" ? "Female" : "Male"} ${cls} portrait`;

  return (
    <svg viewBox="0 0 100 100" className={`hero-portrait ${className}`} role="img" aria-label={label}>
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#2a2536" />
          <stop offset="70%" stopColor="#15131c" />
          <stop offset="100%" stopColor="#0b0a10" />
        </radialGradient>
        <linearGradient id={`collar${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={collar} />
          <stop offset="100%" stopColor={collarShade} />
        </linearGradient>
        <linearGradient id={`hair${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hair.color} />
          <stop offset="100%" stopColor={hair.shade} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#bg${uid})`} />

      {/* Shoulders and collar in the class's own colour. */}
      <path d="M10 100 Q14 78 32 72 L50 80 L68 72 Q86 78 90 100 Z" fill={`url(#collar${uid})`} />
      <path d="M38 74 L50 86 L62 74 L58 70 L50 78 L42 70 Z" fill="#0f0d14" opacity="0.7" />

      {/* Neck and head. */}
      <path d="M43 58 H57 V70 Q50 76 43 70 Z" fill={skin.shade} />
      <ellipse cx="50" cy="44" rx="21" ry="25" fill={skin.color} />
      <ellipse cx="29.5" cy="46" rx="3.2" ry="4.6" fill={skin.shade} />
      <ellipse cx="70.5" cy="46" rx="3.2" ry="4.6" fill={skin.shade} />

      <HairBack style={f.hair} fill={`url(#hair${uid})`} />
      <Brows shape={brow.id} color={browColor} />
      <Eyes shape={EYE_SHAPES[f.eyeShape].id} color={eye.color} />
      <path d="M50 48 Q53 53 50 55.5" stroke={skin.shade} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M45 61.5 Q50 64.5 55 61.5" stroke={skin.shade} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Beard style={f.beard} fill={hair.color} />
      <HairFront style={f.hair} fill={`url(#hair${uid})`} shade={hair.shade} />
      <Mark style={f.mark} />
    </svg>
  );
}

function Eyes({ shape, color }: { shape: string; color: string }) {
  const at = (cx: number) => {
    switch (shape) {
      case "round":
        return <><ellipse cx={cx} cy={45} rx="4" ry="4" fill="#f7f1e6" /><circle cx={cx} cy={45} r="2.4" fill={color} /><circle cx={cx} cy={45} r="1" fill="#100d14" /><circle cx={cx - 0.8} cy={44.2} r="0.5" fill="#fff" /></>;
      case "narrow":
        return <><path d={`M${cx - 4} 45 Q${cx} 42.5 ${cx + 4} 45 Q${cx} 46.5 ${cx - 4} 45 Z`} fill="#f7f1e6" /><circle cx={cx} cy={45} r="1.8" fill={color} /><circle cx={cx} cy={45} r="0.8" fill="#100d14" /></>;
      case "wide":
        return <><ellipse cx={cx} cy={45} rx="4.8" ry="4.4" fill="#f7f1e6" /><circle cx={cx} cy={45} r="2.8" fill={color} /><circle cx={cx} cy={45} r="1.2" fill="#100d14" /><circle cx={cx - 0.9} cy={44} r="0.6" fill="#fff" /></>;
      case "sharp":
        return <><path d={`M${cx - 4.4} 47 L${cx} 42.6 L${cx + 4.4} 47 Q${cx} 46.4 ${cx - 4.4} 47 Z`} fill="#f7f1e6" /><circle cx={cx} cy={45.2} r="1.9" fill={color} /><circle cx={cx} cy={45.2} r="0.8" fill="#100d14" /></>;
      default:
        return <><path d={`M${cx - 4.4} 45 Q${cx} 41.4 ${cx + 4.4} 45 Q${cx} 48.2 ${cx - 4.4} 45 Z`} fill="#f7f1e6" /><circle cx={cx} cy={45} r="2.2" fill={color} /><circle cx={cx} cy={45} r="1" fill="#100d14" /><circle cx={cx - 0.7} cy={44.2} r="0.5" fill="#fff" /></>;
    }
  };
  return <>{at(41)}{at(59)}</>;
}

function Brows({ shape, color }: { shape: string; color: string }) {
  const line = (x: number, flip: number) => {
    switch (shape) {
      case "arched":
        return <path d={`M${x - 5 * flip} 38.5 Q${x} 35.8 ${x + 5 * flip} 38`} stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round" />;
      case "thick":
        return <path d={`M${x - 5 * flip} 38.4 Q${x} 36.6 ${x + 5 * flip} 38.2`} stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
      case "thin":
        return <path d={`M${x - 4.6 * flip} 38.6 Q${x} 37.4 ${x + 4.6 * flip} 38.2`} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />;
      default:
        return <path d={`M${x - 5 * flip} 38.8 L${x + 4.6 * flip} 38.4`} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    }
  };
  return <>{line(41, 1)}{line(59, -1)}</>;
}

function HairBack({ style, fill }: { style: number; fill: string }) {
  const id = HAIR_STYLES[style]?.id ?? "crop";
  if (id === "long") {
    return <path d="M26 46 Q24 16 50 13 Q76 16 74 46 L76 82 L68 84 L66 42 Q60 30 50 30 Q40 30 34 42 L32 84 L24 82 Z" fill={fill} />;
  }
  if (id === "braids") {
    return <g fill={fill}>
      <path d="M28 44 Q28 18 50 15 Q72 18 72 44 L72 52 L28 52 Z" />
      <ellipse cx="25" cy="58" rx="4.4" ry="6" />
      <ellipse cx="24" cy="69" rx="4" ry="5.4" />
      <ellipse cx="75" cy="58" rx="4.4" ry="6" />
      <ellipse cx="76" cy="69" rx="4" ry="5.4" />
    </g>;
  }
  if (id === "wild") {
    return <path d="M25 44 Q22 14 50 12 Q78 14 75 44 L72 40 L70 50 L66 42 L62 52 L58 44 L54 52 L50 44 L46 52 L42 44 L38 52 L34 42 L30 50 L28 40 Z" fill={fill} />;
  }
  if (id === "topknot") {
    return <g fill={fill}>
      <ellipse cx="50" cy="16" rx="7" ry="6" />
      <path d="M30 44 Q30 22 50 20 Q70 22 70 44 L68 40 Q62 32 50 32 Q38 32 32 40 Z" />
    </g>;
  }
  return null;
}

function HairFront({ style, fill, shade }: { style: number; fill: string; shade: string }) {
  const id = HAIR_STYLES[style]?.id ?? "crop";
  if (id === "shaved") {
    return <path d="M31 40 Q34 22 50 21 Q66 22 69 40 Q62 31 50 31 Q38 31 31 40 Z" fill={shade} opacity="0.55" />;
  }
  if (id === "mohawk") {
    return <g>
      <path d="M40 34 Q50 0 60 34 Q55 24 50 24 Q45 24 40 34 Z" fill={fill} />
      <path d="M31 40 Q34 26 44 23 Q38 32 35 42 Z" fill={shade} opacity="0.4" />
      <path d="M69 40 Q66 26 56 23 Q62 32 65 42 Z" fill={shade} opacity="0.4" />
    </g>;
  }
  if (id === "wild") {
    return <path d="M31 42 Q33 20 50 18 Q67 20 69 42 L64 34 L60 40 L55 31 L50 39 L45 31 L40 40 L36 34 Z" fill={fill} />;
  }
  if (id === "long") {
    return <path d="M30 44 Q30 18 50 16 Q70 18 70 44 L65 36 Q60 28 50 28 Q40 28 35 36 Z" fill={fill} />;
  }
  return <path d="M31 41 Q32 20 50 18 Q68 20 69 41 Q64 30 50 29 Q36 30 31 41 Z" fill={fill} />;
}

function Beard({ style, fill }: { style: number; fill: string }) {
  const id = BEARD_STYLES[style]?.id ?? "none";
  if (id === "stubble") {
    return <path d="M32 50 Q34 66 50 69 Q66 66 68 50 Q64 60 50 62 Q36 60 32 50 Z" fill={fill} opacity="0.28" />;
  }
  if (id === "short") {
    return <path d="M33 52 Q35 67 50 70 Q65 67 67 52 Q62 62 50 63 Q38 62 33 52 Z" fill={fill} />;
  }
  if (id === "full") {
    return <g fill={fill}>
      <path d="M31 48 Q32 70 50 74 Q68 70 69 48 Q66 64 50 66 Q34 64 31 48 Z" />
      <path d="M40 60 Q50 66 60 60 Q56 65 50 66 Q44 65 40 60 Z" fill="#0f0d14" opacity="0.25" />
    </g>;
  }
  if (id === "moustache") {
    return <path d="M42 58 Q50 55 58 58 Q54 61 50 60 Q46 61 42 58 Z" fill={fill} />;
  }
  return null;
}

function Mark({ style }: { style: number }) {
  const id = FACE_MARKS[style]?.id ?? "none";
  if (id === "scar") {
    return <path d="M61 32 L57 49 L60 52" stroke="#8c4b45" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.9" />;
  }
  if (id === "war_paint") {
    return <g fill="#8e1f2f" opacity="0.6">
      <path d="M35 40 L45 42 L44 46 L34 44 Z" />
      <path d="M65 40 L55 42 L56 46 L66 44 Z" />
    </g>;
  }
  if (id === "freckles") {
    return <g fill="#8c5a3c" opacity="0.65">
      <circle cx="38" cy="52" r="0.7" /><circle cx="41" cy="54" r="0.6" /><circle cx="36" cy="55" r="0.6" />
      <circle cx="62" cy="52" r="0.7" /><circle cx="59" cy="54" r="0.6" /><circle cx="64" cy="55" r="0.6" />
    </g>;
  }
  if (id === "rune") {
    return <path d="M34 34 L38 28 L42 34 M38 28 V40 M34 38 H42" stroke="#c9a227" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
  }
  return null;
}

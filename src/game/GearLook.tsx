import { useId } from "react";
import type { GearRecord, HeroClass, Item } from "./data";

/**
 * Worn-gear appearance: four textures per slot, drawn as art layered over the painted
 * character. The armour layers are clipped by the model's own alpha silhouette, so a
 * piece always sits on the body instead of floating beside it.
 *
 * Presentation only — nothing here feeds combat, saves or stats.
 */

/** The four looks every piece can have, by rarity band (Common → Mythic/Ancestral). */
export type LookTier = 0 | 1 | 2 | 3;
export function lookTier(it?: Item): LookTier | null {
  if (!it) return null;
  return it.rarity >= 5 ? 3 : it.rarity >= 3 ? 2 : it.rarity >= 1 ? 1 : 0;
}

const STYLE: Record<LookTier, {
  metal: string; shade: string; trim: string; gem: string; glow: string; tint: string; tintOpacity: number;
}> = {
  0: { metal: "#8a6a44", shade: "#52391f", trim: "#c39a63", gem: "#8fae76", glow: "#c39a63", tint: "#a5764a", tintOpacity: 0.3 },
  1: { metal: "#b9c6d6", shade: "#5f7189", trim: "#eef5ff", gem: "#5fa9d8", glow: "#9fd2ff", tint: "#6e8cad", tintOpacity: 0.4 },
  2: { metal: "#d9a83f", shade: "#7a5214", trim: "#ffe9a8", gem: "#d8354a", glow: "#ffcf5c", tint: "#c99a37", tintOpacity: 0.45 },
  3: { metal: "#4a3568", shade: "#20142f", trim: "#c9a2ff", gem: "#ff5b3a", glow: "#c08cff", tint: "#7a4bd0", tintOpacity: 0.5 },
};

/** Where the painted body sits in each standalone model, as fractions of its own pixels. */
interface Anchor {
  w: number; h: number; cx: number;
  headTop: number; headBot: number; shoulderY: number;
  chestTop: number; waistY: number; hipY: number; kneeY: number; footY: number;
}
const ANCHORS: Record<string, Anchor> = {
  "warrior-male": { w: 376, h: 409, cx: 0.55, headTop: 0.055, headBot: 0.205, shoulderY: 0.25, chestTop: 0.26, waistY: 0.53, hipY: 0.61, kneeY: 0.75, footY: 0.885 },
  "warrior-female": { w: 396, h: 404, cx: 0.53, headTop: 0.045, headBot: 0.195, shoulderY: 0.245, chestTop: 0.255, waistY: 0.52, hipY: 0.6, kneeY: 0.74, footY: 0.88 },
  "mage-male": { w: 355, h: 418, cx: 0.5, headTop: 0.035, headBot: 0.185, shoulderY: 0.235, chestTop: 0.245, waistY: 0.5, hipY: 0.58, kneeY: 0.73, footY: 0.88 },
  "mage-female": { w: 368, h: 417, cx: 0.49, headTop: 0.045, headBot: 0.195, shoulderY: 0.245, chestTop: 0.255, waistY: 0.51, hipY: 0.59, kneeY: 0.72, footY: 0.88 },
  "archer-male": { w: 351, h: 424, cx: 0.49, headTop: 0.035, headBot: 0.18, shoulderY: 0.225, chestTop: 0.235, waistY: 0.49, hipY: 0.58, kneeY: 0.72, footY: 0.85 },
  "archer-female": { w: 346, h: 420, cx: 0.51, headTop: 0.035, headBot: 0.18, shoulderY: 0.225, chestTop: 0.235, waistY: 0.49, hipY: 0.58, kneeY: 0.72, footY: 0.85 },
};

/** Shoulder half-width by class and gender, as a fraction of the model width. */
const SHOULDER: Record<HeroClass, Record<"male" | "female", number>> = {
  warrior: { male: 0.2, female: 0.18 },
  mage: { male: 0.19, female: 0.172 },
  archer: { male: 0.185, female: 0.172 },
};

/** Each class carries its weapon on a slightly different line; the glow follows it. */
const WEAPON: Record<HeroClass, { x: number; y0: number; y1: number; tilt: number }> = {
  warrior: { x: 0.71, y0: 0.62, y1: 0.055, tilt: -2 },
  mage: { x: 0.68, y0: 0.88, y1: 0.1, tilt: 1 },
  archer: { x: 0.36, y0: 0.2, y1: 0.66, tilt: 0 },
};

export function GearLook({ src, cls, gender, equipment }: {
  src: string; cls: HeroClass; gender: "male" | "female"; equipment?: GearRecord;
}) {
  const uid = useId().replace(/[:]/g, "");
  const a = ANCHORS[`${cls}-${gender}`];
  const chest = lookTier(equipment?.armour);
  const helm = lookTier(equipment?.helmet);
  const boots = lookTier(equipment?.boots);
  const belt = lookTier(equipment?.belt);
  const weapon = lookTier(equipment?.weapon);
  if (!a || (chest === null && helm === null && boots === null && belt === null && weapon === null)) return null;

  const X = (n: number) => +(n * a.w).toFixed(2);
  const Y = (n: number) => +(n * a.h).toFixed(2);
  const hw = SHOULDER[cls][gender];
  const bodyMask = `url(#gear-body-${uid})`;
  const chestClip = `url(#gear-chest-${uid})`;

  // Cuirass outline: wide at the collar, drawn in at the waist.
  const ct = a.chestTop, wy = a.waistY;
  const chestPath = `M${X(a.cx - hw)} ${Y(ct + 0.018)}Q${X(a.cx - hw * 0.8)} ${Y(ct - 0.03)} ${X(a.cx - hw * 0.36)} ${Y(ct - 0.034)}Q${X(a.cx)} ${Y(ct - 0.055)} ${X(a.cx + hw * 0.36)} ${Y(ct - 0.034)}Q${X(a.cx + hw * 0.8)} ${Y(ct - 0.03)} ${X(a.cx + hw)} ${Y(ct + 0.018)}L${X(a.cx + hw * 0.72)} ${Y(wy - 0.02)}Q${X(a.cx)} ${Y(wy + 0.055)} ${X(a.cx - hw * 0.72)} ${Y(wy - 0.02)}Z`;
  // Neck guard: a collar that hugs the body instead of floating above the shoulders.
  const collarPath = `M${X(a.cx - hw * 0.52)} ${Y(ct - 0.024)}Q${X(a.cx)} ${Y(ct - 0.062)} ${X(a.cx + hw * 0.52)} ${Y(ct - 0.024)}L${X(a.cx + hw * 0.47)} ${Y(ct + 0.014)}Q${X(a.cx)} ${Y(ct - 0.016)} ${X(a.cx - hw * 0.47)} ${Y(ct + 0.014)}Z`;
  const headH = a.headBot - a.headTop;
  const w = WEAPON[cls];

  return <svg className="gear-look pointer-events-none absolute inset-0 h-full w-full"
    viewBox={`0 0 ${a.w} ${a.h}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true"
    data-gear-chest={chest ?? ""} data-gear-helmet={helm ?? ""} data-gear-boots={boots ?? ""}
    data-gear-belt={belt ?? ""} data-gear-weapon={weapon ?? ""}>
    <defs>
      <mask id={`gear-body-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={a.w} height={a.h}>
        <image href={src} x="0" y="0" width={a.w} height={a.h} />
      </mask>
      <clipPath id={`gear-chest-${uid}`}><path d={chestPath} /></clipPath>
      {([0, 1, 2, 3] as LookTier[]).map((t) => <linearGradient key={t} id={`gear-metal-${uid}-${t}`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor={STYLE[t].trim} />
        <stop offset="0.42" stopColor={STYLE[t].metal} />
        <stop offset="1" stopColor={STYLE[t].shade} />
      </linearGradient>)}
      {([0, 1, 2, 3] as LookTier[]).map((t) => <radialGradient key={t} id={`gear-glow-${uid}-${t}`}>
        <stop offset="0" stopColor={STYLE[t].glow} stopOpacity="0.95" />
        <stop offset="0.55" stopColor={STYLE[t].glow} stopOpacity="0.35" />
        <stop offset="1" stopColor={STYLE[t].glow} stopOpacity="0" />
      </radialGradient>)}
      {/* Texture per tier: stitched leather, hammered steel, gilded filigree, mythic runes. */}
      <pattern id={`gear-tex-${uid}-0`} width={X(0.05)} height={Y(0.026)} patternUnits="userSpaceOnUse">
        <path d={`M0 ${Y(0.013)}H${X(0.022)}M${X(0.028)} ${Y(0.013)}H${X(0.05)}`} stroke="#2b1a0c" strokeWidth={X(0.006)} strokeOpacity="0.5" strokeDasharray={`${X(0.008)} ${X(0.006)}`} />
        <circle cx={X(0.025)} cy={Y(0.016)} r={X(0.007)} fill="#e8cfa4" fillOpacity="0.35" />
      </pattern>
      <pattern id={`gear-tex-${uid}-1`} width={X(0.045)} height={Y(0.03)} patternUnits="userSpaceOnUse">
        <path d={`M0 ${Y(0.03)}Q${X(0.0225)} ${Y(0.002)} ${X(0.045)} ${Y(0.03)}`} fill="none" stroke="#22303f" strokeWidth={X(0.005)} strokeOpacity="0.55" />
        <circle cx={X(0.0225)} cy={Y(0.012)} r={X(0.006)} fill="#ffffff" fillOpacity="0.5" />
      </pattern>
      <pattern id={`gear-tex-${uid}-2`} width={X(0.06)} height={Y(0.04)} patternUnits="userSpaceOnUse">
        <path d={`M0 ${Y(0.04)}Q${X(0.015)} ${Y(0.006)} ${X(0.03)} ${Y(0.028)}Q${X(0.045)} ${Y(0.05)} ${X(0.06)} ${Y(0.012)}`} fill="none" stroke="#6b4708" strokeWidth={X(0.0055)} strokeOpacity="0.6" />
        <circle cx={X(0.03)} cy={Y(0.028)} r={X(0.007)} fill="#fff4cd" fillOpacity="0.8" />
      </pattern>
      <pattern id={`gear-tex-${uid}-3`} width={X(0.07)} height={Y(0.05)} patternUnits="userSpaceOnUse">
        <path d={`M${X(0.012)} ${Y(0.01)}V${Y(0.038)}M${X(0.012)} ${Y(0.016)}L${X(0.03)} ${Y(0.01)}M${X(0.034)} ${Y(0.04)}V${Y(0.014)}M${X(0.05)} ${Y(0.008)}L${X(0.062)} ${Y(0.03)}L${X(0.048)} ${Y(0.042)}`}
          fill="none" stroke={STYLE[3].trim} strokeWidth={X(0.006)} strokeOpacity="0.75" strokeLinecap="round" />
      </pattern>
    </defs>

    {/* Whole-figure material change: the chest piece re-tempers the armour the hero wears. */}
    {chest !== null && <g mask={bodyMask} style={{ mixBlendMode: "color" }} opacity={STYLE[chest].tintOpacity}>
      <rect x="0" y="0" width={a.w} height={a.h} fill={STYLE[chest].tint} />
    </g>}

    {/* Boots / belt / helmet bands, all cut to the body so they wrap it. */}
    {boots !== null && <g mask={bodyMask}>
      <rect x="0" y={Y(a.footY - 0.115)} width={a.w} height={Y(0.2)} fill={`url(#gear-metal-${uid}-${boots})`} />
      <path d={`M0 ${Y(a.footY - 0.115)}H${a.w}`} stroke={STYLE[boots].trim} strokeWidth={X(0.008)} />
      <path d={`M0 ${Y(a.footY - 0.075)}H${a.w}`} stroke={STYLE[boots].shade} strokeWidth={X(0.005)} strokeOpacity="0.7" />
    </g>}
    {belt !== null && <g mask={bodyMask}>
      <rect x="0" y={Y(a.waistY - 0.032)} width={a.w} height={Y(0.05)} fill={`url(#gear-metal-${uid}-${belt})`} />
      <rect x="0" y={Y(a.waistY - 0.032)} width={a.w} height={Y(0.012)} fill={STYLE[belt].trim} fillOpacity="0.85" />
    </g>}
    {belt !== null && <g>
      <circle cx={X(a.cx)} cy={Y(a.waistY - 0.006)} r={X(0.026)} fill={STYLE[belt].shade} stroke={STYLE[belt].trim} strokeWidth={X(0.005)} />
      <circle cx={X(a.cx)} cy={Y(a.waistY - 0.006)} r={X(0.014)} fill={STYLE[belt].gem} />
    </g>}
    {helm !== null && <Helmet cls={cls} tier={helm} cx={a.cx} top={a.headTop} height={headH}
      X={X} Y={Y} hw={hw} mask={bodyMask} grad={`url(#gear-metal-${uid}-${helm})`} glow={`url(#gear-glow-${uid}-${helm})`} />}
    {boots !== null && <g>
      {[-1, 1].map((s) => <ellipse key={s} cx={X(a.cx + s * hw * 0.42)} cy={Y(a.kneeY)} rx={X(hw * 0.4)} ry={Y(0.032)}
        fill={`url(#gear-metal-${uid}-${boots})`} stroke={STYLE[boots].trim} strokeWidth={X(0.005)} />)}
    </g>}

    {/* Cuirass with trim, texture and gem. */}
    {chest !== null && <g>
      <path d={chestPath} fill={`url(#gear-metal-${uid}-${chest})`} stroke={STYLE[chest].shade} strokeWidth={X(0.006)} />
      <g clipPath={chestClip}>
        <rect x="0" y={Y(ct - 0.06)} width={a.w} height={Y(wy - ct + 0.12)} fill={`url(#gear-tex-${uid}-${chest})`} opacity="0.55" />
        <path d={`M${X(a.cx - hw * 0.55)} ${Y(ct + 0.02)}Q${X(a.cx)} ${Y(ct + 0.075)} ${X(a.cx + hw * 0.55)} ${Y(ct + 0.02)}`}
          fill="none" stroke={STYLE[chest].trim} strokeWidth={X(0.008)} strokeOpacity="0.9" />
        <path d={`M${X(a.cx)} ${Y(ct + 0.03)}V${Y(wy)}`} stroke={STYLE[chest].shade} strokeWidth={X(0.007)} strokeOpacity="0.65" />
        <path d={`M${X(a.cx - hw * 0.62)} ${Y(wy - 0.06)}Q${X(a.cx)} ${Y(wy + 0.005)} ${X(a.cx + hw * 0.62)} ${Y(wy - 0.06)}`}
          fill="none" stroke={STYLE[chest].trim} strokeWidth={X(0.006)} strokeOpacity="0.8" />
      </g>
      <g mask={bodyMask}>
        <path d={collarPath} fill={`url(#gear-metal-${uid}-${chest})`} stroke={STYLE[chest].trim} strokeWidth={X(0.006)} />
        {[-0.34, -0.12, 0.12, 0.34].map((f) => <circle key={f} cx={X(a.cx + hw * f)} cy={Y(ct - 0.004)} r={X(0.009)} fill={STYLE[chest].trim} />)}
      </g>
      <circle cx={X(a.cx)} cy={Y(ct + 0.095)} r={X(0.03)} fill={STYLE[chest].shade} stroke={STYLE[chest].trim} strokeWidth={X(0.005)} />
      <circle cx={X(a.cx)} cy={Y(ct + 0.095)} r={X(0.017)} fill={STYLE[chest].gem} />
      {chest === 3 && <circle cx={X(a.cx)} cy={Y(ct + 0.095)} r={X(0.06)} fill={`url(#gear-glow-${uid}-3)`} />}
      {/* Pauldrons sit over the shoulder line, outside the body cut. */}
      {[-1, 1].map((s) => <g key={s}>
        <path d={`M${X(a.cx + s * hw * 0.62)} ${Y(a.shoulderY - 0.045)}
          Q${X(a.cx + s * hw * 1.28)} ${Y(a.shoulderY - 0.075)} ${X(a.cx + s * hw * 1.3)} ${Y(a.shoulderY + 0.015)}
          Q${X(a.cx + s * hw * 1.12)} ${Y(a.shoulderY + 0.075)} ${X(a.cx + s * hw * 0.66)} ${Y(a.shoulderY + 0.045)}Z`}
          fill={`url(#gear-metal-${uid}-${chest})`} stroke={STYLE[chest].shade} strokeWidth={X(0.006)} />
        <path d={`M${X(a.cx + s * hw * 0.72)} ${Y(a.shoulderY - 0.018)}Q${X(a.cx + s * hw * 1.12)} ${Y(a.shoulderY - 0.042)} ${X(a.cx + s * hw * 1.22)} ${Y(a.shoulderY + 0.012)}`}
          fill="none" stroke={STYLE[chest].trim} strokeWidth={X(0.006)} strokeOpacity="0.9" />
        {chest >= 2 && <path d={`M${X(a.cx + s * hw * 1.28)} ${Y(a.shoulderY - 0.02)}L${X(a.cx + s * hw * 1.46)} ${Y(a.shoulderY - 0.075)}L${X(a.cx + s * hw * 1.33)} ${Y(a.shoulderY + 0.012)}Z`}
          fill={STYLE[chest].metal} stroke={STYLE[chest].trim} strokeWidth={X(0.005)} />}
        {chest === 3 && <circle cx={X(a.cx + s * hw * 1.02)} cy={Y(a.shoulderY - 0.005)} r={X(0.035)} fill={`url(#gear-glow-${uid}-3)`} />}
      </g>)}
    </g>}

    {/* Weapon: an enchantment along the hero's own weapon line, four temperings. */}
    {weapon !== null && <g style={{ mixBlendMode: "screen" }}>
      <path d={`M${X(w.x - 0.022)} ${Y(w.y0)}Q${X(w.x + 0.04)} ${Y((w.y0 + w.y1) / 2)} ${X(w.x + 0.006)} ${Y(w.y1)}L${X(w.x + 0.026)} ${Y(w.y1)}Q${X(w.x + 0.062)} ${Y((w.y0 + w.y1) / 2)} ${X(w.x + 0.004)} ${Y(w.y0)}Z`}
        fill={STYLE[weapon].glow} opacity={0.35 + weapon * 0.15} />
      <path d={`M${X(w.x + 0.002)} ${Y(w.y0)}L${X(w.x + 0.016)} ${Y(w.y1)}`} stroke={STYLE[weapon].glow} strokeWidth={X(0.012 + weapon * 0.004)} strokeLinecap="round" opacity="0.85" />
      {weapon >= 1 && <circle cx={X(w.x + 0.008)} cy={Y((w.y0 + w.y1) / 2)} r={X(0.05)} fill={`url(#gear-glow-${uid}-${weapon})`} />}
      {weapon >= 2 && <g stroke={STYLE[weapon].trim} strokeWidth={X(0.005)} fill="none" opacity="0.9">
        <path d={`M${X(w.x + 0.012)} ${Y(w.y0 - 0.06)}h${X(0.09)}`} />
        <path d={`M${X(w.x + 0.012)} ${Y(w.y0 - 0.04)}h${X(0.06)}`} />
      </g>}
      {weapon === 3 && <g fill={STYLE[3].trim}>
        {[0.18, 0.34, 0.5, 0.66].map((t, i) => <circle key={t} cx={X(w.x + 0.012 + (i % 2 ? 0.035 : -0.02))} cy={Y(w.y0 + (w.y1 - w.y0) * t)} r={X(0.012)} opacity="0.9" />)}
      </g>}
    </g>}
  </svg>;
}

function Helmet({ cls, tier, cx, top, height, X, Y, hw, mask, grad, glow }: {
  cls: HeroClass; tier: LookTier; cx: number; top: number; height: number;
  X: (n: number) => number; Y: (n: number) => number; hw: number; mask: string; grad: string; glow: string;
}) {
  const s = STYLE[tier];
  const domeBottom = top + height * (cls === "warrior" ? 0.72 : 0.62);
  return <g>
    <g mask={mask}>
      <ellipse cx={X(cx)} cy={Y(top + height * 0.16)} rx={X(hw * 0.72)} ry={Y(height * 0.62)} fill={grad} />
      <path d={`M${X(cx - hw * 0.62)} ${Y(domeBottom)}h${X(hw * 1.24)}`} stroke={s.trim} strokeWidth={X(0.009)} />
      {cls === "warrior" && <path d={`M${X(cx)} ${Y(top - 0.01)}V${Y(top + height * 0.52)}`} stroke={s.metal} strokeWidth={X(0.026)} />}
      {cls !== "warrior" && <ellipse cx={X(cx)} cy={Y(top + height * 0.5)} rx={X(hw * 0.42)} ry={Y(height * 0.22)} fill={s.shade} opacity="0.45" />}
    </g>
    {/* Crest, hood point and feather rise off the head. */}
    {cls === "warrior" && <g>
      <path d={`M${X(cx)} ${Y(top - 0.012)}Q${X(cx + 0.05)} ${Y(top - 0.075)} ${X(cx - 0.02)} ${Y(top - 0.11)}Q${X(cx + 0.005)} ${Y(top - 0.05)} ${X(cx - 0.028)} ${Y(top - 0.005)}Z`}
        fill={s.trim} opacity="0.95" />
      <circle cx={X(cx)} cy={Y(top + height * 0.34)} r={X(0.022)} fill={s.gem} />
    </g>}
    {cls === "mage" && <g>
      <path d={`M${X(cx)} ${Y(top - 0.005)}Q${X(cx + 0.055)} ${Y(top - 0.055)} ${X(cx + 0.01)} ${Y(top - 0.095)}Q${X(cx + 0.012)} ${Y(top - 0.03)} ${X(cx - 0.02)} ${Y(top)}Z`} fill={s.metal} stroke={s.trim} strokeWidth={X(0.005)} />
      <circle cx={X(cx)} cy={Y(top + height * 0.16)} r={X(0.03)} fill={s.gem} />
      {tier === 3 && <circle cx={X(cx)} cy={Y(top + height * 0.16)} r={X(0.075)} fill={glow} />}
    </g>}
    {cls === "archer" && <g stroke={s.trim} strokeWidth={X(0.008)} fill="none" strokeLinecap="round">
      <path d={`M${X(cx - 0.03)} ${Y(top + 0.005)}L${X(cx + 0.09)} ${Y(top - 0.05)}M${X(cx - 0.01)} ${Y(top + 0.02)}L${X(cx + 0.1)} ${Y(top - 0.025)}`} />
      <path d={`M${X(cx - hw * 0.6)} ${Y(domeBottom)}h${X(hw * 1.2)}`} stroke={s.metal} strokeWidth={X(0.012)} />
    </g>}
  </g>;
}

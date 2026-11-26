/**
 * Hero face customization.
 *
 * The painted class models stay exactly as they are. This adds an optional layered portrait that
 * sits on top of the character card: skin tone, hair, eyes, brows, facial hair and a mark. Every
 * choice is cosmetic only — nothing here is read by the stat or combat pipeline.
 *
 * A save with no `face` keeps the original painted model, so the default appearance is untouched.
 */
export interface HeroFace {
  /** Index into SKIN_TONES. */
  skin: number;
  /** Index into HAIR_STYLES (0 = no painted hair, a close-cropped scalp). */
  hair: number;
  /** Index into HAIR_COLORS. */
  hairColor: number;
  /** Index into EYE_COLORS. */
  eyes: number;
  /** Index into EYE_SHAPES. */
  eyeShape: number;
  /** Index into BROW_SHAPES. */
  brows: number;
  /** Index into BEARD_STYLES (0 = clean-shaven). */
  beard: number;
  /** Index into FACE_MARKS (0 = none). */
  mark: number;
}

export const SKIN_TONES = [
  { id: "porcelain", name: "Porcelain", color: "#f3d6bf", shade: "#e0b79c" },
  { id: "fair", name: "Fair", color: "#e8c0a0", shade: "#d3a482" },
  { id: "olive", name: "Olive", color: "#cf9f74", shade: "#b5825a" },
  { id: "bronze", name: "Bronze", color: "#ab7148", shade: "#8d5a37" },
  { id: "umber", name: "Umber", color: "#7d4e2f", shade: "#643c23" },
  { id: "ebony", name: "Ebony", color: "#54341f", shade: "#3f2616" },
] as const;

export const HAIR_COLORS = [
  { id: "raven", name: "Raven", color: "#221f26", shade: "#15131a" },
  { id: "chestnut", name: "Chestnut", color: "#5b3a24", shade: "#422917" },
  { id: "auburn", name: "Auburn", color: "#8f3d1f", shade: "#6b2b14" },
  { id: "golden", name: "Golden", color: "#d6ac55", shade: "#b18a3b" },
  { id: "silver", name: "Silver", color: "#c6ccd6", shade: "#9aa2b0" },
  { id: "crimson", name: "Crimson", color: "#8e1f2f", shade: "#6a1422" },
  { id: "frost", name: "Frost", color: "#ece7dd", shade: "#c9c1b4" },
] as const;

export const HAIR_STYLES = [
  { id: "shaved", name: "Close-cropped" },
  { id: "crop", name: "Cropped" },
  { id: "long", name: "Long" },
  { id: "braids", name: "Braids" },
  { id: "mohawk", name: "Mohawk" },
  { id: "topknot", name: "Topknot" },
  { id: "wild", name: "Wild" },
] as const;

export const EYE_COLORS = [
  { id: "amber", name: "Amber", color: "#b8862b" },
  { id: "green", name: "Green", color: "#3f7d4a" },
  { id: "blue", name: "Blue", color: "#3f6fa8" },
  { id: "grey", name: "Grey", color: "#6b7280" },
  { id: "violet", name: "Violet", color: "#6d4b8f" },
  { id: "ember", name: "Ember", color: "#9b2c2c" },
] as const;

export const EYE_SHAPES = [
  { id: "round", name: "Round" },
  { id: "almond", name: "Almond" },
  { id: "narrow", name: "Narrow" },
  { id: "wide", name: "Wide" },
  { id: "sharp", name: "Sharp" },
] as const;

export const BROW_SHAPES = [
  { id: "straight", name: "Straight" },
  { id: "arched", name: "Arched" },
  { id: "thick", name: "Heavy" },
  { id: "thin", name: "Fine" },
] as const;

export const BEARD_STYLES = [
  { id: "none", name: "Clean-shaven" },
  { id: "stubble", name: "Stubble" },
  { id: "short", name: "Short beard" },
  { id: "full", name: "Full beard" },
  { id: "moustache", name: "Moustache" },
] as const;

export const FACE_MARKS = [
  { id: "none", name: "None" },
  { id: "scar", name: "Scar" },
  { id: "war_paint", name: "War paint" },
  { id: "freckles", name: "Freckles" },
  { id: "rune", name: "Rune mark" },
] as const;

export const DEFAULT_FACE: HeroFace = {
  skin: 1,
  hair: 1,
  hairColor: 0,
  eyes: 2,
  eyeShape: 1,
  brows: 0,
  beard: 0,
  mark: 0,
};

const clamp = (n: unknown, max: number) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) ? Math.min(max - 1, Math.max(0, v)) : 0;
};

/** Clamp a saved face onto the current option tables, so a renamed option never breaks a save. */
export function normalizeFace(face: Partial<HeroFace> | undefined | null): HeroFace {
  if (!face) return { ...DEFAULT_FACE };
  return {
    skin: clamp(face.skin, SKIN_TONES.length),
    hair: clamp(face.hair, HAIR_STYLES.length),
    hairColor: clamp(face.hairColor, HAIR_COLORS.length),
    eyes: clamp(face.eyes, EYE_COLORS.length),
    eyeShape: clamp(face.eyeShape, EYE_SHAPES.length),
    brows: clamp(face.brows, BROW_SHAPES.length),
    beard: clamp(face.beard, BEARD_STYLES.length),
    mark: clamp(face.mark, FACE_MARKS.length),
  };
}

/** One line describing a face, used by the picker and the profile summary. */
export function faceSummary(face: Partial<HeroFace> | undefined | null): string {
  if (!face) return "Original portrait";
  const f = normalizeFace(face);
  return [
    SKIN_TONES[f.skin].name,
    `${HAIR_COLORS[f.hairColor].name} ${HAIR_STYLES[f.hair].name.toLowerCase()}`,
    `${EYE_COLORS[f.eyes].name.toLowerCase()} eyes`,
  ].join(" · ");
}

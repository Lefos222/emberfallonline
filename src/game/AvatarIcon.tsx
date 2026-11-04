import sheet from "@/assets/profile-portraits.png.asset.json";

/** Painted portrait sheet: 5 columns x 4 rows, row-major (see asset URL above). */
export const AVATAR_COUNT = 20;
const COLS = 5;
const ROWS = 4;

/**
 * The sheet is a screenshot of a 5x4 portrait gallery, so the portraits do NOT sit
 * edge to edge in equal fifths: every portrait is a 43x43 square at
 * (11 + 58*col, 5 + 55*row), separated by background gaps and a 1px frame.
 * Cropping to that inner square is what makes a portrait fill its whole container
 * instead of showing gap strips and slivers of the neighbouring portraits.
 */
const SHEET_W = 295;
const SHEET_H = 222;
const ART = 43;
const ART_X = 11;
const ART_Y = 5;
const COL_PITCH = 58;
const ROW_PITCH = 55;

const pct = (n: number) => `${(n * 100).toFixed(4)}%`;

/** One portrait from the shared sheet, so profile art stays one cached file. */
export function AvatarIcon({
  index,
  size = 40,
  className = "",
  fill = false,
}: {
  index: number;
  size?: number;
  className?: string;
  /** Stretch to the parent box instead of a fixed square (used by the full-screen gallery). */
  fill?: boolean;
}) {
  const cell = Math.min(AVATAR_COUNT - 1, Math.max(0, Math.trunc(index) || 0));
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  const x = ART_X + col * COL_PITCH;
  const y = ART_Y + row * ROW_PITCH;
  return (
    <span
      role="img"
      aria-label={`Portrait ${cell + 1}`}
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] bg-black bg-no-repeat align-middle ${className}`}
      style={{
        width: fill ? "100%" : size,
        height: fill ? "100%" : size,
        backgroundImage: `url(${sheet.url})`,
        // Percentages keep one 43px portrait mapped to the whole box on both axes.
        backgroundSize: `${pct(SHEET_W / ART)} ${pct(SHEET_H / ART)}`,
        backgroundPosition: `${pct(x / (SHEET_W - ART))} ${pct(y / (SHEET_H - ART))}`,
      }}
    />
  );
}

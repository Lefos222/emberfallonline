import sheet from "@/assets/profile-portraits.png.asset.json";

/** Painted portrait sheet: 5 columns x 4 rows, row-major (see asset URL above). */
export const AVATAR_COUNT = 20;
const COLS = 5;
const ROWS = 4;

/** One portrait from the shared sheet, so profile art stays one cached file. */
export function AvatarIcon({
  index,
  size = 40,
  className = "",
}: {
  index: number;
  size?: number;
  className?: string;
}) {
  const cell = Math.min(AVATAR_COUNT - 1, Math.max(0, Math.trunc(index) || 0));
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  return (
    <span
      role="img"
      aria-label={`Portrait ${cell + 1}`}
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] bg-black bg-no-repeat align-middle ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet.url})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${(col * 100) / (COLS - 1)}% ${(row * 100) / (ROWS - 1)}%`,
      }}
    />
  );
}

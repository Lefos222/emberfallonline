import { SHEET_H, SHEET_W, type SpriteRect } from "./world";

/** Renders one cell of an uploaded art sheet, scaled to the container width. */
export function Sprite({ rect, className = "" }: { rect: SpriteRect; className?: string }) {
  const sw = rect.sheetW ?? SHEET_W, sh = rect.sheetH ?? SHEET_H;
  return (
    <div className={`overflow-hidden ${className}`} style={{ aspectRatio: `${rect.w} / ${rect.h}` }}>
      <div className="h-full w-full" style={{
        backgroundImage: `url(${rect.url})`,
        backgroundSize: `${(sw / rect.w) * 100}% ${(sh / rect.h) * 100}%`,
        backgroundPosition: `${sw === rect.w ? 0 : (rect.x / (sw - rect.w)) * 100}% ${sh === rect.h ? 0 : (rect.y / (sh - rect.h)) * 100}%`,
      }} />
    </div>
  );
}

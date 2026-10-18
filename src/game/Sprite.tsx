import { SHEET_H, SHEET_W, type SpriteRect } from "./world";

/** Renders one cell of an uploaded art sheet, scaled to the container width. */
export function Sprite({ rect, className = "" }: { rect: SpriteRect; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ aspectRatio: `${rect.w} / ${rect.h}` }}>
      <div className="h-full w-full" style={{
        backgroundImage: `url(${rect.url})`,
        backgroundSize: `${(SHEET_W / rect.w) * 100}% ${(SHEET_H / rect.h) * 100}%`,
        backgroundPosition: `${(rect.x / (SHEET_W - rect.w)) * 100}% ${(rect.y / (SHEET_H - rect.h)) * 100}%`,
      }} />
    </div>
  );
}

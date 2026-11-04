import crown from "@/assets/hud-crown.png.asset.json";

/**
 * Painted interface art, keyed by icon name. Add the asset file here and every
 * crown glyph that reads `ART_ICONS` renders the painting instead of the line
 * drawing — the surrounding buttons keep their markup and behaviour.
 */
const ART_ICONS: Partial<Record<string, { url: string }>> = { crown };

export type ArtIconName = keyof typeof ART_ICONS;

/** Painted icon on a transparent-looking dark mat; renders nothing when no art exists yet. */
export function ArtIcon({
  name,
  size = 22,
  className = "",
}: {
  name: ArtIconName;
  size?: number;
  className?: string;
}) {
  const art = ART_ICONS[name];
  if (!art) return null;
  return (
    <img
      src={art.url}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-[3px] object-contain align-middle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

import crown from "@/assets/hud-crown.png.asset.json";
import mail from "@/assets/icons/ui-mail.png";
import lucky from "@/assets/icons/ui-lucky.png";
import scroll from "@/assets/icons/ui-scroll.png";
import spellbook from "@/assets/icons/ui-spellbook.png";
import goblet from "@/assets/icons/ui-goblet.png";
import diamond from "@/assets/icons/ui-diamond.png";
import hammer from "@/assets/icons/ui-hammer.png";
import bag from "@/assets/icons/ui-bag.png";
import anvil from "@/assets/icons/ui-anvil.png";
import gem from "@/assets/icons/ui-gem.png";
import gift from "@/assets/icons/ui-gift.png";
import star from "@/assets/icons/ui-star.png";
import calendar from "@/assets/icons/ui-calendar.png";
import guild from "@/assets/icons/ui-guild.png";
import profile from "@/assets/icons/ui-profile.png";
import quest from "@/assets/icons/ui-quest.png";
import astral from "@/assets/icons/ui-astral.png";
import auction from "@/assets/icons/ui-auction.svg";

/**
 * Painted interface art, keyed by icon name. Add the asset file here and every
 * glyph that reads `ArtIcon` renders the painting instead of a line drawing —
 * the surrounding buttons keep their markup and behaviour.
 */
const ART_ICONS = {
  crown: crown.url,
  mail,
  lucky,
  scroll,
  spellbook,
  goblet,
  diamond,
  hammer,
  bag,
  anvil,
  gem,
  gift,
  star,
  calendar,
  guild,
  profile,
  quest,
  astral,
  auction,
} as const;

export type ArtIconName = keyof typeof ART_ICONS;

/** Painted icon on its dark mat, sized to the slot it sits in. */
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
      src={art}
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

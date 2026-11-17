import { useRouterState } from "@tanstack/react-router";
import { AstrionLogo } from "./Logo";

/** Small "by Astrion" mark shown on every page except the studio site and the game screen. */
export function AstrionBadge() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/astrion") || path.startsWith("/play")) return null;
  return (
    <a href="/astrion" className="astr-badge" aria-label="Astrion Entertainment">
      <AstrionLogo size={22} />
      <span>ASTRION</span>
    </a>
  );
}

import { useRouterState } from "@tanstack/react-router";
import { AstrionLogo } from "./Logo";

/** Small studio mark on EmberFall pages outside the game screen. */
export function AstrionBadge() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/play")) return null;
  return (
    <div className="astr-badge" aria-label="Astrion Entertainment">
      <AstrionLogo size={22} />
      <span>ASTRION</span>
    </div>
  );
}

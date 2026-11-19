import warriorWave from "@/assets/fx/skills/warrior-wave.svg";
import mageOrb from "@/assets/fx/skills/mage-orb.svg";
import archerArrow from "@/assets/fx/skills/archer-arrow.svg";
import beastClaw from "@/assets/fx/skills/beast-claw.svg";
import impactBurst from "@/assets/fx/skills/impact-burst.svg";

/**
 * The painted skillshot each class looses across the battlefield, plus the small burst that
 * lands on the target. Presentation only: Battle.tsx shows these for the blow it already plays,
 * so they never touch damage, pacing or the combat log.
 */
const CLASS_SHOT: Record<string, string> = {
  warrior: warriorWave,
  mage: mageOrb,
  archer: archerArrow,
};

/** The projectile asset for a fighter: the class's own skillshot, or a beast's claw for monsters. */
export const shotFor = (cls: string | null | undefined, foe = false) =>
  foe ? beastClaw : CLASS_SHOT[cls ?? ""] ?? warriorWave;

/** The burst drawn at the target's feet when a blow lands. */
export const IMPACT_BURST = impactBurst;

import type { HeroClass } from "../data";
import { Arm, Cape, Head, LowerBody, Torso } from "./HeroBody";
import { Chest, Weapon } from "./HeroGear";
import { CLASS_ACCENT, METAL, tierOf } from "./palette";
import { POSE } from "./rig";

export interface HeroLook {
  cls: HeroClass;
  gender: "male" | "female";
  /** Chest look tier 0–3 (iron, ember, moon, ancestral). */
  chest?: number;
  /** Weapon look tier 0–3. */
  weapon?: number;
}

const CLASS_LABEL: Record<HeroClass, string> = {
  warrior: "Knight",
  mage: "Mage",
  archer: "Archer",
};

/**
 * One hero, drawn as a battle-ready figure in a 300×400 frame. Layer order matters:
 * cloak, legs, torso, chest piece, weapon, arms, then the head on top. The stance
 * comes from the rig, so each class really stands differently.
 */
export function HeroArt({
  cls,
  gender,
  chest = 0,
  weapon = 0,
  className = "",
}: HeroLook & { className?: string }) {
  const chestTier = tierOf(chest);
  const weaponTier = tierOf(weapon);
  const pose = POSE[cls];
  const m = METAL[tierOf(Math.max(chestTier, weaponTier))];
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      role="img"
      aria-label={`${gender === "female" ? "Female" : "Male"} ${CLASS_LABEL[cls]}`}
    >
      {/* grounding shadow */}
      <ellipse cx="152" cy="368" rx="78" ry="12" fill="#000000" opacity="0.38" />
      <ellipse cx="152" cy="368" rx="52" ry="7" fill={m.glow} opacity="0.14" />
      <g transform={`rotate(${pose.lean} 152 356)`}>
        <Cape cls={cls} tier={chestTier} />
        <LowerBody cls={cls} gender={gender} tier={chestTier} />
        <Torso cls={cls} tier={chestTier} />
        <Chest cls={cls} tier={chestTier} />
        <g transform={pose.weaponAt}>
          <Weapon cls={cls} tier={weaponTier} />
        </g>
        <Arm cls={cls} tier={chestTier} which="weapon" />
        <Arm cls={cls} tier={chestTier} which="free" />
        {cls === "mage" && (
          <g>
            <circle
              cx={pose.freeHand.x}
              cy={pose.freeHand.y - 20}
              r="7"
              fill={CLASS_ACCENT.mage}
              opacity="0.35"
            />
            <circle
              cx={pose.freeHand.x}
              cy={pose.freeHand.y - 20}
              r="3.6"
              fill="#dff7ff"
              opacity="0.95"
            />
            <circle
              cx={pose.freeHand.x}
              cy={pose.freeHand.y - 20}
              r="13"
              fill={CLASS_ACCENT.mage}
              opacity="0.16"
            />
          </g>
        )}
        <Head cls={cls} gender={gender} />
      </g>
    </svg>
  );
}

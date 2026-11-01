import type { HeroClass } from '../data';
import { Arm, Cape, Head, LowerBody, Torso } from './HeroBody';
import { Chest, Weapon } from './HeroGear';
import { tierOf } from './palette';

export interface HeroLook {
  cls: HeroClass;
  gender: 'male' | 'female';
  /** Chest look tier 0–3 (iron, ember, moon, ancestral). */
  chest?: number;
  /** Weapon look tier 0–3. */
  weapon?: number;
}

const CLASS_LABEL: Record<HeroClass, string> = { warrior: 'Knight', mage: 'Mage', archer: 'Archer' };

/** Where each class holds its weapon: translate + rotate from the grip. */
const WEAPON_AT: Record<HeroClass, string> = {
  warrior: 'translate(70 136) rotate(-22)',
  mage: 'translate(70 136) rotate(-13)',
  archer: 'translate(72 138) rotate(-7)',
};

/**
 * One hero, drawn as a battle-ready figure in a 300×400 frame. Layer order matters:
 * cloak, legs, torso, chest piece, weapon, arms, then the head on top.
 */
export function HeroArt({ cls, gender, chest = 0, weapon = 0, className = '' }: HeroLook & { className?: string }) {
  const chestTier = tierOf(chest);
  const weaponTier = tierOf(weapon);
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax meet" className={className}
      role="img" aria-label={`${gender === 'female' ? 'Female' : 'Male'} ${CLASS_LABEL[cls]}`}>
      <g transform="rotate(-2 150 300)">
        <Cape cls={cls} tier={chestTier} />
        <LowerBody cls={cls} gender={gender} tier={chestTier} />
        <Torso cls={cls} tier={chestTier} />
        <Chest cls={cls} tier={chestTier} />
        <g transform={WEAPON_AT[cls]}>
          <Weapon cls={cls} tier={weaponTier} />
        </g>
        <Arm cls={cls} tier={chestTier} which="weapon" />
        <Arm cls={cls} tier={chestTier} which="free" />
        <Head cls={cls} gender={gender} />
      </g>
    </svg>
  );
}

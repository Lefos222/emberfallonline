import warriorMale from '@/assets/heroes/knight-male-idle.png';
import warriorMaleAction from '@/assets/heroes/knight-male-action.png';
import warriorFemale from '@/assets/heroes/knight-female-idle.png';
import warriorFemaleAction from '@/assets/heroes/knight-female-action.png';
import archerMale from '@/assets/heroes/archer-male-idle.png';
import archerMaleAction from '@/assets/heroes/archer-male-action.png';
import archerFemale from '@/assets/heroes/archer-female-idle.png';
import archerFemaleAction from '@/assets/heroes/archer-female-action.png';
import mageMale from '@/assets/heroes/mage-male-idle.png';
import mageMaleAction from '@/assets/heroes/mage-male-action.png';
import mageFemale from '@/assets/heroes/mage-female-idle.png';
import mageFemaleAction from '@/assets/heroes/mage-female-action.png';
import { synthArt, tierName } from './synthesis';
import { armourArt } from './appearance';
import type { HeroClass } from './data';

const MODELS: Record<HeroClass, Record<'male' | 'female', [string, string]>> = {
  warrior: { male: [warriorMale, warriorMaleAction], female: [warriorFemale, warriorFemaleAction] },
  archer: { male: [archerMale, archerMaleAction], female: [archerFemale, archerFemaleAction] },
  mage: { male: [mageMale, mageMaleAction], female: [mageFemale, mageFemaleAction] },
};
export type HeroPose = 'auto' | 'idle' | 'action';

/**
 * The hero's body. A worn synthesis set keeps its own painted set art; otherwise the
 * painted armour variant the worn chest piece rolled when it dropped or was forged is
 * shown instead of the default class look. The appearance always follows the equipment,
 * never the level.
 */
export function CharacterModel({ cls, gender, className = '', pose = 'auto', synth, look }: { cls: HeroClass; gender: 'male' | 'female'; className?: string; pose?: HeroPose; synth?: number | null; look?: number | null }) {
  const label = `${gender === 'female' ? 'Female' : 'Male'} ${cls === 'warrior' ? 'Knight' : cls === 'mage' ? 'Mage' : 'Archer'}`;
  const art = synth ? synthArt(cls, gender, synth) : undefined;
  if (art && synth) {
    return <div className={`hero-model synth-card ${className}`} data-character-model={`${cls}-${gender}-synthesis`} data-synthesis-tier={synth}>
      <img src={art} alt={`${label} in ${tierName(synth)} armour`} draggable={false} className="synth-card-art hero-model-flip" />
    </div>;
  }
  const gearArt = look !== null && look !== undefined ? armourArt(cls, gender, look) : undefined;
  if (gearArt) {
    return <div className={`hero-model ${className}`} data-character-model={`${cls}-${gender}`} data-armour-look={look}>
      <img src={gearArt} alt={`${label} in armour`} draggable={false} className="hero-model-idle hero-model-flip" />
    </div>;
  }
  const [idle, action] = MODELS[cls][gender];
  return <div className={`hero-model ${className}`} data-character-model={`${cls}-${gender}`} data-hero-pose={pose}>
    <img src={idle} alt={label} draggable={false} className={`hero-model-idle${cls === 'warrior' ? ' hero-model-flip' : ''}`} />
    <img src={action} alt="" aria-hidden="true" draggable={false} className={`hero-model-action${cls === 'warrior' ? ' hero-model-flip' : ''}`} />
  </div>;
}

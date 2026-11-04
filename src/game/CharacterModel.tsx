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
import type { HeroClass } from './data';

const MODELS: Record<HeroClass, Record<'male' | 'female', [string, string]>> = {
  warrior: { male: [warriorMale, warriorMaleAction], female: [warriorFemale, warriorFemaleAction] },
  archer: { male: [archerMale, archerMaleAction], female: [archerFemale, archerFemaleAction] },
  mage: { male: [mageMale, mageMaleAction], female: [mageFemale, mageFemaleAction] },
};
export type HeroPose = 'auto' | 'idle' | 'action';
export function CharacterModel({ cls, gender, className = '', pose = 'auto' }: { cls: HeroClass; gender: 'male' | 'female'; className?: string; pose?: HeroPose }) {
  const [idle, action] = MODELS[cls][gender];
  const label = `${gender === 'female' ? 'Female' : 'Male'} ${cls === 'warrior' ? 'Knight' : cls === 'mage' ? 'Mage' : 'Archer'}`;
  return <div className={`hero-model ${className}`} data-character-model={`${cls}-${gender}`} data-hero-pose={pose}>
    <img src={idle} alt={label} draggable={false} className="hero-model-idle" />
    <img src={action} alt="" aria-hidden="true" draggable={false} className="hero-model-action" />
  </div>;
}
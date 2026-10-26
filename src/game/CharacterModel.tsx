import warriorMale from '@/assets/model-warrior-male.png';
import warriorFemale from '@/assets/model-warrior-female.png';
import archerMale from '@/assets/model-archer-male.png';
import archerFemale from '@/assets/model-archer-female.png';
import mageMale from '@/assets/model-mage-male.png';
import mageFemale from '@/assets/model-mage-female.png';
import type { HeroClass } from './data';

/** The shared standalone class/gender art, one source for every screen that draws a character. */
export const MODELS: Record<HeroClass, Record<'male' | 'female', string>> = {
  warrior: { male: warriorMale, female: warriorFemale },
  archer: { male: archerMale, female: archerFemale },
  mage: { male: mageMale, female: mageFemale },
};
export function CharacterModel({ cls, gender, className = '' }: { cls: HeroClass; gender: 'male' | 'female'; className?: string }) {
  return <div className={`overflow-hidden ${className}`} data-character-model={`${cls}-${gender}`} style={{ aspectRatio: '1 / 1' }}>
    <img src={MODELS[cls][gender]} alt={`${gender === 'female' ? 'Female' : 'Male'} ${cls === 'warrior' ? 'Knight' : cls === 'mage' ? 'Mage' : 'Archer'}`} draggable={false} className="h-full w-full object-contain object-bottom" />
  </div>;
}
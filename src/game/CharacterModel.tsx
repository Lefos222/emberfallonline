import warriorMale from '@/assets/model-warrior-male.png';
import warriorFemale from '@/assets/model-warrior-female.png';
import archerMale from '@/assets/model-archer-male.png';
import archerFemale from '@/assets/model-archer-female.png';
import mageMale from '@/assets/model-mage-male.png';
import mageFemale from '@/assets/model-mage-female.png';
import { GearLook } from './GearLook';
import type { GearRecord, HeroClass } from './data';

const MODELS: Record<HeroClass, Record<'male' | 'female', string>> = {
  warrior: { male: warriorMale, female: warriorFemale },
  archer: { male: archerMale, female: archerFemale },
  mage: { male: mageMale, female: mageFemale },
};
/**
 * The painted class/gender model. Pass `equipment` to show what the hero is wearing: the
 * worn pieces are layered on top (see GearLook), so a new chestplate or weapon changes the
 * look. Without equipment the painted base character is unchanged.
 */
export function CharacterModel({ cls, gender, className = '', equipment }: {
  cls: HeroClass; gender: 'male' | 'female'; className?: string; equipment?: GearRecord;
}) {
  return <div className={`relative overflow-hidden ${className}`} data-character-model={`${cls}-${gender}`} style={{ aspectRatio: '1 / 1' }}>
    <img src={MODELS[cls][gender]} alt={`${gender === 'female' ? 'Female' : 'Male'} ${cls === 'warrior' ? 'Knight' : cls === 'mage' ? 'Mage' : 'Archer'}`} draggable={false} className="h-full w-full object-contain object-bottom" />
    <GearLook src={MODELS[cls][gender]} cls={cls} gender={gender} equipment={equipment} />
  </div>;
}

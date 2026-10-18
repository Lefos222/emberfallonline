import sheet from '@/assets/character_selection.jpg.asset.json';
import type { HeroClass } from './data';

const BOX: Record<HeroClass, Record<'male' | 'female', [number, number]>> = {
  warrior: { female: [150, 395], male: [395, 395] },
  mage: { female: [735, 385], male: [1000, 385] },
  archer: { female: [1320, 395], male: [1595, 395] },
};
export function CharacterModel({ cls, gender, className = '' }: { cls: HeroClass; gender: 'male' | 'female'; className?: string }) {
  const [x, y] = BOX[cls][gender];
  return <div className={`overflow-hidden ${className}`} data-character-model={`${cls}-${gender}`} style={{ aspectRatio: '250 / 380' }}>
    <div className="h-full w-full" style={{ backgroundImage: `url(${sheet.url})`, backgroundSize: '768% 282.105263%', backgroundPosition: `${x / 1670 * 100}% ${y / 692 * 100}%` }} />
  </div>;
}
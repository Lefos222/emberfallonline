import { HeroArt } from './hero/HeroArt';
import { gearLook } from './hero/looks';
import type { HeroClass, Item } from './data';

export interface CharacterModelProps {
  cls: HeroClass;
  gender: 'male' | 'female';
  className?: string;
  /** Worn chest piece — its power band picks one of the four chest looks. */
  chest?: Item | null;
  /** Worn weapon — its power band picks one of the four weapon looks. */
  weapon?: Item | null;
  /** Pre-computed looks (battle units carry these instead of items). */
  look?: { chest?: number; weapon?: number };
}

/**
 * The single source of hero art: creation, equipment, profiles and battles all
 * render this so a hero looks identical everywhere.
 */
export function CharacterModel({ cls, gender, className = '', chest, weapon, look }: CharacterModelProps) {
  return <div className={`overflow-hidden ${className}`} data-character-model={`${cls}-${gender}`} style={{ aspectRatio: '1 / 1' }}>
    <HeroArt cls={cls} gender={gender}
      chest={look?.chest ?? gearLook(chest)}
      weapon={look?.weapon ?? gearLook(weapon)}
      className="h-full w-full" />
  </div>;
}

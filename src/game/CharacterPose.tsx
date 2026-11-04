import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterModel } from './CharacterModel';
import { WeaponArc } from './BattleArt';
import { moveFor } from './skillAnim';
import type { HeroClass } from './data';

export function CharacterPose({ cls, gender, className = '' }: { cls: HeroClass; gender: 'male' | 'female'; className?: string }) {
  const [replay, setReplay] = useState(0);
  const move = moveFor({ cls });
  return <div className={`pose-unit relative ${className}`}>
    <div key={replay} className={`relative h-full w-full ${replay ? `anim-${move}` : 'anim-idle'}`}>
      <CharacterModel cls={cls} gender={gender} className="h-full w-full" />
      {replay > 0 && <WeaponArc move={move} />}
    </div>
    <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 bg-background/70" title="Preview class action" aria-label="Preview class action" onClick={() => setReplay(n => n + 1)}><Play className="h-4 w-4" /></Button>
  </div>;
}
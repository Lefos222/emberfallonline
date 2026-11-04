import { useEffect, useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterModel } from './CharacterModel';
import { WeaponArc } from './BattleArt';
import { moveFor } from './skillAnim';
import type { HeroClass } from './data';

export function CharacterPose({ cls, gender, className = '', synth, look }: { cls: HeroClass; gender: 'male' | 'female'; className?: string; synth?: number | null; look?: number | null }) {
  const [replay, setReplay] = useState(0);
  const [actionPose, setActionPose] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPlaying(false), 1100);
    return () => clearTimeout(timer);
  }, [playing, replay]);
  const move = moveFor({ cls });
  return <div className={`pose-unit relative ${className}`}>
    <div key={replay} className={`relative h-full w-full ${playing ? `anim-${move}` : 'anim-idle'}`}>
      <CharacterModel cls={cls} gender={gender} pose={playing || actionPose ? 'action' : 'idle'} className="h-full w-full" synth={synth} look={look} />
      {playing && <WeaponArc move={move} />}
    </div>
    <div className="absolute bottom-1 right-1 flex gap-1">
      <Button variant="ghost" size="icon" className="bg-background/70" title="Change hero pose" aria-label="Change hero pose" aria-pressed={actionPose} onClick={() => setActionPose(p => !p)}><RefreshCw className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="bg-background/70" title="Preview class action" aria-label="Preview class action" onClick={() => { setReplay(n => n + 1); setPlaying(true); }}><Play className="h-4 w-4" /></Button>
    </div>
  </div>;
}
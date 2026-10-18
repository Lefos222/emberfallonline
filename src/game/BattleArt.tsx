import heroes from '@/assets/battle-heroes.png';
import enemies from '@/assets/battle-enemies.png';
import type { Unit } from './combat';

export function BattleCharacter({ u }: { u: Unit }) {
  const identity = `${u.name} ${u.img}`;
  const col = u.cls ? ({ warrior: 0, archer: 1, mage: 2 }[u.cls]) : /dragon|wyrm/i.test(identity) ? 3 : /goblin|brute grunt/i.test(identity) ? 1 : /skeleton|bone/i.test(identity) ? 0 : 2;
  const row = u.cls && u.gender === 'female' ? 1 : 0;
  return <div className={`battle-character h-full w-full ${u.side === 'foe' && u.cls ? 'battle-mirror' : ''}`}>
    <div className="relative h-full w-full overflow-hidden">
      <img src={u.cls ? heroes : enemies} alt={u.name} width={u.cls ? 1536 : 1920} height={1024} draggable={false}
        className="absolute max-w-none" style={{ width: u.cls ? '300%' : '400%', height: u.cls ? '200%' : '100%', left: `${-col * 100}%`, top: `${-row * 100}%` }} />
    </div>
  </div>;
}

export function CombatEffect({ kind }: { kind: string }) {
  return <svg className={`combat-effect effect-${kind}`} viewBox="0 0 200 240" aria-hidden="true">
    {kind === 'arrow' ? <path d="M15 190L175 50M142 50H175V83M20 170L38 188M30 160L48 178" /> :
      kind === 'slash' ? <path d="M25 200Q60 90 180 30Q130 140 25 200Z" /> :
      kind === 'ice' ? <path d="M100 30V210M25 70L175 170M25 170L175 70M80 50L100 70L120 50M80 190L100 170L120 190" /> :
      kind === 'heal' ? <path d="M100 60V160M50 110H150M40 180L40 155M160 190V165M70 45V20"/> :
      kind === 'shield' ? <path d="M100 25L170 55V115Q165 170 100 210Q35 170 30 115V55Z" /> :
      kind === 'fire' ? <path d="M100 20Q135 80 118 110Q160 75 162 120Q190 190 100 220Q15 200 38 135Q55 105 58 75Q75 120 90 130Q72 70 100 20Z" /> :
      <g><path d="M25 175L85 125L60 95L140 65L105 120L145 145L25 175Z"/><circle cx="100" cy="120" r="75"/></g>}
  </svg>;
}

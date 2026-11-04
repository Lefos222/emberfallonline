import { CharacterModel } from './CharacterModel';
import enemies from '@/assets/battle-enemies.png';
import type { Unit } from './combat';
import type { Move } from './skillAnim';

export function BattleCharacter({ u }: { u: Unit }) {
  if (u.cls) return <div className={`battle-character flex h-full w-full items-end justify-center ${u.side === 'foe' ? 'battle-mirror' : ''}`}>
    <CharacterModel cls={u.cls} gender={u.gender === 'female' ? 'female' : 'male'} className="h-full w-full" />
  </div>;
  const identity = `${u.name} ${u.img}`;
  const col = /dragon|wyrm/i.test(identity) ? 3 : /goblin|brute grunt/i.test(identity) ? 1 : /skeleton|bone/i.test(identity) ? 0 : 2;
  return <div className={`battle-character h-full w-full ${u.side === 'foe' && u.cls ? 'battle-mirror' : ''}`}>
    <div className="relative h-full w-full overflow-hidden">
      <img src={enemies} alt={u.name} width={1920} height={1024} draggable={false}
        className="absolute max-w-none" style={{ width: '400%', height: '100%', left: `${-col * 100}%`, top: 0 }} />
    </div>
  </div>;
}

/** Impact artwork drawn on the target when a blow lands. */
export function CombatEffect({ kind }: { kind: string }) {
  return <svg className={`combat-effect effect-${kind}`} viewBox="0 0 200 240" aria-hidden="true">
    {kind === 'arrow' ? <path d="M15 190L175 50M142 50H175V83M20 170L38 188M30 160L48 178" /> :
      kind === 'slash' ? <path d="M25 200Q60 90 180 30Q130 140 25 200Z" /> :
      kind === 'ice' ? <path d="M100 30V210M25 70L175 170M25 170L175 70M80 50L100 70L120 50M80 190L100 170L120 190" /> :
      kind === 'heal' ? <path d="M100 60V160M50 110H150M40 180L40 155M160 190V165M70 45V20" /> :
      kind === 'shield' ? <path d="M100 25L170 55V115Q165 170 100 210Q35 170 30 115V55Z" /> :
      kind === 'fire' ? <path d="M100 20Q135 80 118 110Q160 75 162 120Q190 190 100 220Q15 200 38 135Q55 105 58 75Q75 120 90 130Q72 70 100 20Z" /> :
      kind === 'meteor' ? <g><path d="M150 15L110 95M175 40L135 120M125 8L95 60" /><circle cx="95" cy="150" r="34" /><path d="M95 116Q140 130 150 175Q110 205 60 185Q55 140 95 116Z" /></g> :
      kind === 'tether' ? <g><path d="M20 40Q100 120 180 200M40 200Q110 130 180 60M100 90V150M70 120H130" /><circle cx="100" cy="120" r="26" /></g> :
      kind === 'mark' ? <g><circle cx="100" cy="120" r="60" /><path d="M100 40V70M100 170V200M20 120H50M150 120H180" /><circle cx="100" cy="120" r="12" /></g> :
      <g><path d="M25 175L85 125L60 95L140 65L105 120L145 145L25 175Z" /><circle cx="100" cy="120" r="75" /></g>}
  </svg>;
}

/**
 * The weapon or energy trail drawn over the fighter while the move plays. Each move draws a
 * different shape, so a sword swing reads differently from a bow draw or a frost nova.
 */
export function WeaponArc({ move }: { move: Move }) {
  const art: Record<Move, React.ReactNode> = {
    swing: <path d="M30 180Q70 70 175 45Q120 105 60 195Z" />,
    overhead: <path d="M100 15Q165 60 150 165Q105 95 95 25Z" />,
    spin: <g><path d="M40 120Q100 30 160 120Q100 210 40 120Z" /><path d="M100 30Q190 120 100 210Q10 120 100 30Z" /></g>,
    leap: <g><path d="M150 20L70 150M175 55L105 170" /><path d="M60 150L110 175L80 200Z" /></g>,
    slam: <g><path d="M60 90L140 90L150 150Q100 190 50 150Z" /><path d="M100 30V70M40 60L60 85M160 60L140 85" /></g>,
    rage: <g><path d="M60 210Q45 150 75 110Q70 160 95 175Z" /><path d="M140 210Q155 145 120 105Q130 160 105 175Z" /><path d="M100 205Q80 140 100 70Q120 140 100 205Z" /></g>,
    cast: <g><circle cx="120" cy="90" r="24" /><path d="M120 40V60M120 120V140M70 90H90M150 90H170M85 55L100 70M140 110L155 125" /></g>,
    thrust: <g><path d="M40 120H150M150 120L120 95M150 120L120 145" /><path d="M60 90L80 120L60 150" /></g>,
    nova: <g><circle cx="100" cy="130" r="30" /><circle cx="100" cy="130" r="60" /><circle cx="100" cy="130" r="88" /></g>,
    rise: <g><path d="M100 210Q70 150 100 60Q130 150 100 210Z" /><path d="M60 190Q50 140 75 100M140 190Q150 140 125 100" /></g>,
    channel: <g><path d="M50 60Q100 100 150 60M50 110Q100 150 150 110M50 160Q100 200 150 160" /></g>,
    siphon: <g><path d="M20 200Q100 150 180 60M35 160Q100 130 165 90M60 210Q110 180 150 140" /><circle cx="100" cy="140" r="18" /></g>,
    draw: <g><path d="M30 60Q90 120 30 180M30 120H165M165 120L140 100M165 120L140 140" /></g>,
    rapid: <g><path d="M30 70H150M30 120H170M30 170H150" /><path d="M150 70L130 55M170 120L150 105M150 170L130 155" /></g>,
    aim: <g><circle cx="140" cy="110" r="34" /><path d="M140 50V76M140 144V170M80 110H106M174 110H200M20 190L110 130" /></g>,
    dash: <g><path d="M20 90H110M30 130H140M20 170H110" /><path d="M150 60L185 120L150 180" /></g>,
    drink: <g><circle cx="90" cy="70" r="10" /><circle cx="120" cy="110" r="14" /><circle cx="85" cy="150" r="18" /><path d="M60 200H140" /></g>,
  };
  return <svg className={`battle-arc arc-${move}`} viewBox="0 0 200 240" aria-hidden="true">{art[move]}</svg>;
}

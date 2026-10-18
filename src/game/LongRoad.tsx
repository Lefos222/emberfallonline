import { useGame, update } from './store';
import { Panel, Gold, fmt } from './ui';
import { Sprite } from './Sprite';
import type { StartBattle } from './panels';
import { matsLine } from './crafting';
import { canEnterRoad, canEnterSpire, dailyRoad, recordRoadClear, roadFoe, roadRegion, roadRewards, roadState, roadWeekIndex, spireRewards, spireWave, weeklyRoad, type RoadClear } from './longroad';

export function LongRoad({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero } = useGame();
  if (!hero) return null;
  const state = roadState(hero);
  const region = roadRegion(state.stage);
  const now = Date.now();
  const fight = (mode: RoadClear['mode']) => {
    if (!(mode === 'road' ? canEnterRoad(hero) : canEnterSpire(hero))) return;
    const value = mode === 'road' ? state.stage : state.wave;
    const foe = mode === 'road' ? roadFoe(value) : spireWave(Math.max(91, state.cleared), value);
    start({ title: `${mode === 'road' ? 'Long Road' : 'Infinite Spire'} · ${value}`, right: foe,
      onResult: (won, xpMultiplier = 1) => {
        if (!won) return { lines: ['The path remains. No progression lost.'] };
        let lines = ['Already recorded — no duplicate rewards.'];
        update(h => {
          const next = recordRoadClear(h, { mode, value, xpMultiplier });
          if (next === h) return;
          const rw = mode === 'road' ? roadRewards(value, true) : spireRewards(value);
          lines = [`+${fmt(rw.gold)} gold`, `+${fmt(Math.round(rw.xp * (xpMultiplier === 1.2 ? 1.2 : 1)))} XP`, ...matsLine(rw.materials), ...(rw.items ? ['Roadwarden weapon delivered to bag or Overflow Chest.'] : [])];
          Object.assign(h, next);
        });
        return { lines };
      },
    });
  };
  return <Panel title="The Long Road · Unending Endgame" onClose={onClose} wide>
    <p className="mb-3 text-sm text-muted-foreground">Daily destination: {dailyRoad(now).name} · Weekly destination: {weeklyRoad(roadWeekIndex(now)).name}. UTC midnight / Monday rotations; destinations are guides, not bonus payouts.</p>
    <div className="mb-4 slot p-3" style={{ borderColor: region.color }}>
      <div className="font-display text-xl" style={{ color: region.color }}>{region.name} · Circuit {region.circuit}</div>
      <p>Level band {region.minLevel}–{region.maxLevel} · Road stage {state.stage} · Cleared through {state.cleared}</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {(['road', 'spire'] as const).map(mode => {
        const value = mode === 'road' ? state.stage : state.wave;
        const allowed = mode === 'road' ? canEnterRoad(hero) : canEnterSpire(hero);
        const foe = mode === 'road' ? roadFoe(value) : spireWave(Math.max(91, state.cleared), value);
        const rw = mode === 'road' ? roadRewards(value, value > state.cleared) : spireRewards(value, value > state.best);
        return <section key={mode} className="slot p-4">
          <h3 className="font-display text-lg text-gold">{mode === 'road' ? 'The Long Road' : 'Infinite Spire'}</h3>
          <p className="text-sm">{mode === 'road' ? `Stage ${value}` : `Wave ${value} · Best ${state.best}`}</p>
          <Sprite rect={foe.sprite} className="mx-auto h-36 w-36" />
          <p>{foe.name} · Lv {foe.level}</p>
          <p className="text-sm text-muted-foreground">HP {fmt(foe.hp)} · ATK {fmt(foe.atk)} · DEF {fmt(foe.def)}<br />{foe.ability}</p>
          <div className="my-3 text-sm"><Gold n={rw.gold} /> · {fmt(rw.xp)} XP<br />{matsLine(rw.materials).join(' · ')}{rw.items > 0 && ` · ${rw.items} Rare weapon`}</div>
          <button className="btn-gold w-full py-2" disabled={!allowed} onClick={() => fight(mode)}>{allowed ? `Fight ${mode === 'road' ? 'stage' : 'wave'} ${value}` : mode === 'road' ? 'Clear the campaign to enter' : 'Clear road stage 91 to enter'}</button>
        </section>;
      })}
    </div>
  </Panel>;
}

import { useGame, update } from './store';
import { Panel, Gold, fmt } from './ui';
import { Sprite } from './Sprite';
import worldMap from '@/assets/world-map.jpg';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import type { StartBattle } from './panels';
import { matsLine } from './crafting';
import { canEnterRoad, canEnterSpire, dailyRoad, recordRoadClear, roadFoe, roadRegion, roadRewards, roadState, roadWeekIndex, spireCircuit, spireRewards, spireWave, weeklyRoad, type RoadClear } from './longroad';

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
    <div className="relative mb-4 overflow-hidden border-y border-border px-4 py-6">
      <img src={worldMap} alt="The lands beyond the Ember Fall campaign" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative font-display text-xl text-gold">{region.name} · Circuit {region.circuit}</div>
      <p className="relative">Level band {region.minLevel}–{region.maxLevel} · Road stage {state.stage} · Cleared through {state.cleared}</p>
      <p className="relative mt-2 text-sm text-muted-foreground">Spire circuit {spireCircuit(state.wave).circuit} · Floor {spireCircuit(state.wave).floor}/100</p>
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
          <Button className="w-full whitespace-normal" disabled={!allowed} onClick={() => fight(mode)}><Swords />{allowed ? `Fight ${mode === 'road' ? 'stage' : 'wave'} ${value}` : mode === 'road' ? 'Clear the campaign to enter' : 'Clear road stage 91 to enter'}</Button>
        </section>;
      })}
    </div>
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="font-display text-lg text-gold">Next road milestones</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => Math.ceil(state.stage / 10) * 10 + i * 10).map(stage => {
          const boss = roadFoe(stage);
          return <div key={stage} className="flex items-center gap-2">
            <Sprite rect={boss.sprite} className="w-14 shrink-0" />
            <div className="min-w-0 text-sm"><div className="text-gold">Stage {stage}</div><div className="break-words">{boss.name}</div><div className="text-muted-foreground">Rare weapon · Boss Core</div></div>
          </div>;
        })}
      </div>
    </section>
  </Panel>;
}

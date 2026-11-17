import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Swords, ShoppingBag, ScrollText } from 'lucide-react';
import { useGame, getState } from './store';
import { tr } from './i18n';
import { fmt, GameTabs } from './ui';
import { Sprite } from './Sprite';
import { MatIcon } from './MatIcon';
import { MATS } from './crafting';
import type { StartBattle } from './panels';
import { FRONTIERS, FRONTIER_SHOP, eclipseWindow, frontierCall, frontierFoe, frontierState, type FrontierKind } from './awakening-frontiers';
import art from '@/assets/awakening/frontiers.webp.asset.json';
import { DUNGEON_STAMINA, staminaBlocker } from './stamina';
import { battleLockedByBlitz } from './blitz-run';

export const frontierArt = (i: number) => ({ url: art.url, x: i % 3 * 512, y: Math.floor(i / 3) * 512, w: 512, h: 512, sheetW: 1536, sheetH: 1024 });
export function FrontierWallet() {
  const { hero } = useGame();
  if (!hero) return null;
  const a = frontierState(hero);
  return <div className="flex flex-wrap justify-end gap-3 text-xs">
    <span className="inline-flex items-center gap-1 text-gold"><Sprite rect={frontierArt(4)} className="h-7 w-7" />{fmt(a.marks ?? 0)} {tr('Ember Marks')}</span>
    <span className="inline-flex items-center gap-1 text-foreground"><Sprite rect={frontierArt(5)} className="h-7 w-7" />{fmt(a.seals ?? 0)} {tr('Eclipse Seals')}</span>
  </div>;
}
export function AwakeningFrontiers({ start, setNote, mode }: { start: StartBattle; setNote: (s: string) => void; mode: 'campaign' | 'events' | 'shops' | 'contracts' }) {
  const { hero } = useGame();
  const [busy, setBusy] = useState(false);
  const [shop, setShop] = useState<'marks' | 'seals'>('marks');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  if (!hero) return null;
  const a = frontierState(hero, now); const window = eclipseWindow(now);
  const act = async (action: 'buy' | 'claim', key: string) => {
    setBusy(true);
    try { await frontierCall(action, key); setNote(tr(action === 'buy' ? 'Supplies bought' : 'Contract claimed')); }
    catch (e) { setNote(tr(e instanceof Error ? e.message : 'Battle entry failed.')); }
    finally { setBusy(false); }
  };
  const fight = async (kind: FrontierKind) => {
    const entryHero = getState().hero;
    if (!entryHero) return;
    const blocked = battleLockedByBlitz(entryHero) || staminaBlocker(entryHero, DUNGEON_STAMINA);
    if (blocked) { setNote(tr(blocked)); return; }
    setBusy(true);
    try {
      const s = await frontierCall('begin', kind); const run = s.run;
      if (!run) return;
      const current = getState().hero; const entry = FRONTIERS.find(x => x.id === kind);
      if (!current || !entry) return;
      start({ title: `${entry.name} · ${run.node}`, right: frontierFoe(kind, run.node, current.level + current.paragon, frontierArt(entry.art)), dungeon: true,
        onResult: async won => {
          const paid = await frontierCall('settle', run.id, won);
          return { lines: won ? [tr('Expedition complete'), `+${Math.max(0, (paid.marks ?? 0) - (s.marks ?? 0))} ${tr('Ember Marks')}`, `+${Math.max(0, (paid.seals ?? 0) - (s.seals ?? 0))} ${tr('Eclipse Seals')}`, `+${100 + Math.min(2000, run.node * 8)} ${tr('Awakening XP')}`] : [tr('The expedition ends. Return stronger.') ] };
        },
      });
    } catch (e) { setNote(tr(e instanceof Error ? e.message : 'Battle entry failed.')); }
    finally { setBusy(false); }
  };

  if (mode === 'shops') return <div>
    <div className="mb-3 flex items-center gap-3"><Sprite rect={frontierArt(3)} className="h-20 w-20 shrink-0 rounded" /><p className="text-sm text-muted-foreground">{tr('Earn currencies in expeditions, then buy real crafting materials. No Diamonds required.')}</p></div>
    <GameTabs label={tr('Shops')} tabs={[{ id: 'marks', name: tr('Ember Exchange') }, { id: 'seals', name: tr('Eclipse Curios') }]} value={shop} onChange={setShop} />
    <div className="grid gap-2 sm:grid-cols-3">{FRONTIER_SHOP.filter(x => x.currency === shop).map(x => <div key={x.id} className="slot flex flex-col items-center gap-2 p-3">
      <MatIcon mat={x.mat} size={48} /><div className="text-center font-display text-gold">{x.qty} {MATS[x.mat].name}</div>
      <span className="text-xs text-muted-foreground">{tr('Owned')}: {fmt(hero.mats?.[x.mat] ?? 0)}</span>
      <Button variant="outline" size="sm" className="w-full whitespace-normal" disabled={busy || (a[shop] ?? 0) < x.cost} onClick={() => void act('buy', x.id)}><ShoppingBag />{x.cost} {tr(shop === 'marks' ? 'Ember Marks' : 'Eclipse Seals')}</Button>
    </div>)}</div>
  </div>;

  if (mode === 'contracts') return <div className="grid gap-3 sm:grid-cols-2">{(['daily', 'weekly'] as const).map(period => {
    const target = period === 'daily' ? 5 : 30; const progress = period === 'daily' ? a.dailyWins ?? 0 : a.weeklyWins ?? 0;
    const claimed = period === 'daily' ? a.dailyClaimed : a.weeklyClaimed;
    return <div className="slot p-4" key={period}><ScrollText className="mb-2 h-8 w-8 text-gold" /><h3 className="font-display text-lg text-gold">{tr(period === 'daily' ? 'Daily expedition contract' : 'Weekly expedition contract')}</h3>
      <p className="my-2 text-sm text-muted-foreground">{tr('Win expeditions across the three fronts, hunts or incursions.')}</p>
      <div className="text-sm">{Math.min(target, progress)}/{target} · {period === 'daily' ? 20 : 100} {tr('Ember Marks')} · {period === 'daily' ? 1 : 8} {tr('Eclipse Seals')}</div>
      <Button variant="outline" className="mt-3 w-full" disabled={busy || claimed || progress < target} onClick={() => void act('claim', period)}>{tr(claimed ? 'Claimed' : 'Claim')}</Button>
    </div>;
  })}</div>;

  return <div>
    <p className="mb-3 text-sm text-muted-foreground">{tr('Separate endless campaign fronts, each with its own saved progress. Each battle costs 10 dungeon stamina; rewards are paid only for a victory.')}</p>
    {a.run && <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-border p-3 text-sm"><span>{tr('An expedition is waiting to be finished.')}</span><Button variant="outline" size="sm" disabled={busy} onClick={() => a.run && void fight(a.run.kind)}>{tr('Resume expedition')}</Button><Button variant="ghost" size="sm" disabled={busy} onClick={async () => { if (!a.run) return; setBusy(true); try { await frontierCall('settle', a.run.id, false); setNote(tr('The expedition ends. Return stronger.')); } catch(e) { setNote(tr(e instanceof Error ? e.message : 'Battle entry failed.')); } finally { setBusy(false); } }}>{tr('Abandon')}</Button></div>}
    <div className="grid gap-3 sm:grid-cols-2">{FRONTIERS.filter(x => mode === 'events' ? ['hunt', 'event'].includes(x.id) : !['hunt', 'event'].includes(x.id)).map(x => {
      const node = x.id === 'hunt' ? (a.huntBest ?? 0) + 1 : x.id === 'event' ? (a.eventBest ?? 0) + 1 : (a.fronts?.[x.id] ?? 0) + 1;
      const off = busy || !!a.run || x.id === 'hunt' && (a.huntUsed ?? 0) >= 3 || x.id === 'event' && (!window.open || (a.eventUsed ?? 0) >= 2);
      return <div className="slot overflow-hidden" key={x.id}><Sprite rect={frontierArt(x.art)} className="aspect-square w-full" />
        <div className="p-3"><h3 className="font-display text-lg text-gold">{tr(x.name)}</h3><p className="mt-1 min-h-10 text-xs text-muted-foreground">{tr(x.desc)}</p>
          <div className="my-2 text-xs">{tr('Encounter')} {node} · {tr('Reward')}: {4 + Math.min(16, Math.floor(node / 5))} {tr('Ember Marks')}</div>
          {x.id === 'hunt' && <div className="mb-2 text-xs text-gold">{Math.max(0, 3 - (a.huntUsed ?? 0))}/3 {tr('Entries left')}</div>}
          {x.id === 'event' && <div className="mb-2 text-xs text-gold">{tr(window.open ? 'Live now' : 'Next opening')}: {new Date(window.open ? window.end : window.next).toISOString().slice(11, 16)} UTC · {Math.max(0, 2 - (a.eventUsed ?? 0))}/2</div>}
          <Button variant="outline" className="w-full" disabled={off} onClick={() => void fight(x.id)}><Swords />{tr('Enter expedition')}</Button>
        </div></div>;
    })}</div>
  </div>;
}
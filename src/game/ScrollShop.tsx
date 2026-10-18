import { useState } from 'react';
import scrollArt from '@/assets/battle-scrolls.png';
import { Button } from '@/components/ui/button';
import { Panel, Gold } from './ui';
import { getState, useGame } from './store';
import { activateScroll, buyScroll } from './services';
import { SCROLLS, scrollState, type ScrollKind } from './scrolls';

export function ScrollShop({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!hero) return null;
  const { owned, buffs } = scrollState(hero);
  async function act(kind: ScrollKind, buy: boolean) {
    if (busy) return;
    setBusy(true); setError('');
    try { if (buy) await buyScroll(kind); else await activateScroll(kind); }
    catch (e) { setError(e instanceof Error ? e.message : 'The scroll request failed.'); }
    finally { setBusy(false); }
  }
  return <Panel title="Battle Scrolls" onClose={onClose}>
    <div className="mb-4"><Gold n={hero.gold} /></div>
    <div className="space-y-3">{(Object.keys(SCROLLS) as ScrollKind[]).map(kind => {
      const scroll = SCROLLS[kind]; const col = kind === 'dmg' ? 0 : kind === 'def' ? 1 : 2;
      return <div key={kind} className="flex flex-wrap items-center gap-3 border-b border-border py-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden slot rarity-2"><img src={scrollArt} alt={scroll.name} loading="lazy" width={1536} height={512} className="absolute h-full max-w-none" style={{ width: '300%', left: `${-col * 100}%` }} /></div>
        <div className="min-w-36 flex-1"><h3 className="font-display text-gold">{scroll.name}</h3><p className="text-sm">+20% · 10 battles</p><p className="text-xs text-muted-foreground">Owned {owned[kind]}{buffs[kind] > 0 ? ` · Active: ${buffs[kind]} battles remaining` : ''}</p></div>
        <Button variant="outline" disabled={busy || owned[kind] < 1 || buffs[kind] > 0} onClick={() => void act(kind, false)}>{buffs[kind] > 0 ? 'Active' : 'Activate'}</Button>
        <Button disabled={busy || (getState().hero?.gold ?? 0) < scroll.price} onClick={() => void act(kind, true)}>Buy · {scroll.price.toLocaleString()} gold</Button>
      </div>;
    })}</div>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </Panel>;
}
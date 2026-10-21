import { useEffect, useState } from 'react';
import { Gift, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from './store';
import { RequestStatus, useRequest } from './Rewards';
import { gatheringState } from './professions';
import { resourceLabel } from './auction-services';
import { canClaimGuildEvent, eligibleGuildResource, type GuildEvent } from './guild-events';
import { claimGuildEvent, contributeGuildSupply, loadGuildEvents } from './guild-event-services';
import { SkillIcon } from './SkillIcon';

export function GuildEvents() {
  const { hero, heroId } = useGame();
  const request = useRequest();
  const [state, setState] = useState<Awaited<ReturnType<typeof loadGuildEvents>> | null>(null);
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);
  const load = async () => {
    if (!heroId) return;
    const result = await loadGuildEvents(heroId);
    setOffset(Date.parse(result.now) - Date.now());
    setState(result);
  };
  useEffect(() => { void request.run(load); }, [heroId]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const refresh = window.setInterval(() => { void request.run(load); }, 30000);
    return () => { clearInterval(timer); clearInterval(refresh); };
  }, [heroId]);
  const remaining = Math.max(0, Math.floor(((state ? Date.parse(state.resetAt) : now) - now - offset) / 1000));
  const expired = remaining === 0;
  if (!hero) return null;
  return <section className="mt-5 border-y border-border py-4" aria-label="Guild events">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="font-display text-xl text-gold">Guild events</h4>
      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">New situations in {Math.floor(remaining / 3600)}h {Math.floor(remaining % 3600 / 60)}m</span><Button variant="ghost" size="icon" aria-label="Refresh guild events" disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    </div>
    <RequestStatus {...request} />
    <div className="grid gap-4 lg:grid-cols-3">
      {state?.events.map(event => <SupplyEvent key={event.id} event={event} resources={gatheringState(hero).resources} busy={request.busy || expired}
        onDonate={(resource, quantity) => void request.run(async () => { await contributeGuildSupply(event.id, resource, quantity); await load(); })}
        onClaim={() => void request.run(async () => { await claimGuildEvent(event.id); await load(); })} />)}
    </div>
    {state && <div className="mt-4"><h5 className="font-display text-sm">Today's contributions</h5>{state.contributions.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">No supplies delivered yet.</p> : state.contributions.map(c => <div key={`${c.hero_name}:${c.event}`} className="flex flex-wrap justify-between gap-2 border-b border-border/30 py-1 text-sm"><span>{c.hero_name} · {state.events.find(e => e.id === c.event)?.name}</span><span className="text-gold">{c.quantity} supplies</span></div>)}</div>}
  </section>;
}

function SupplyEvent({ event, resources, busy, onDonate, onClaim }: { event: GuildEvent; resources: Record<string, number>; busy: boolean; onDonate: (resource: string, quantity: number) => void; onClaim: () => void }) {
  const [selected, setSelected] = useState('');
  const [quantity, setQuantity] = useState(1);
  const options = Object.entries(resources).filter(([key, count]) => count > 0 && eligibleGuildResource(event, key));
  const resource = options.some(([key]) => key === selected) ? selected : options[0]?.[0] ?? '';
  const limit = Math.min(resources[resource] ?? 0, Math.max(0, event.target - event.progress), 100);
  const amount = Math.min(quantity, limit);
  return <article className="border border-border rounded-md p-3">
    <div className="flex items-start gap-2"><SkillIcon icon={event.scroll === 'def' ? 'shield' : event.scroll === 'dmg' ? 'sword' : 'star'} className="h-10 w-10 shrink-0" /><h5 className="font-display text-base text-gold">{event.name}</h5></div>
    <p className="mt-2 min-h-16 text-sm text-muted-foreground">{event.story}</p>
    <p className="mt-3 text-sm">{event.progress}/{event.target} supplies · Yours: {event.personal}</p>
    <progress className="mt-1 h-2 w-full accent-primary" value={event.progress} max={event.target} aria-label={`${event.name} progress`} />
    <p className="mt-2 text-xs text-muted-foreground">Contributor reward: 1 {event.scroll === 'def' ? 'Defense' : event.scroll === 'dmg' ? 'Damage' : 'XP'} Scroll</p>
    {event.progress < event.target && <form className="mt-3 space-y-2" onSubmit={e => { e.preventDefault(); if (amount > 0) onDonate(resource, amount); }}>
      <select className="slot w-full min-w-0 px-2 py-1 text-sm" aria-label={`${event.name} supply`} value={resource} onChange={e => setSelected(e.target.value)} disabled={busy || !options.length}>
        {!options.length && <option value="">No matching gathered supplies</option>}
        {options.map(([key, count]) => <option key={key} value={key}>{resourceLabel(key)} ×{count}</option>)}
      </select>
      <div className="flex gap-2"><input className="slot w-16 px-2 text-sm" type="number" aria-label={`${event.name} quantity`} min={1} max={Math.max(1, limit)} value={amount || 1} onChange={e => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} disabled={busy || !limit} /><Button variant="outline" className="flex-1" disabled={busy || !limit}><Package className="h-4 w-4" />Deliver</Button></div>
    </form>}
    <Button variant="outline" className="mt-3 w-full" disabled={busy || !canClaimGuildEvent(event)} onClick={onClaim}><Gift className="h-4 w-4" />{event.claimed ? 'Reward claimed' : 'Claim scroll'}</Button>
  </article>;
}
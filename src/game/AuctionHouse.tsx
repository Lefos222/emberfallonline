import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, RefreshCw } from 'lucide-react';
import { Panel, fmt, Gold } from './ui';
import { useGame } from './store';
import { DISCOVERY_NAMES, DISCOVERY_RARITIES, GATHERING_AREAS, gatheringState, type ProfessionId } from './professions';
import { DiscoveryArt } from './Professions';
import { buyListing, cancelListing, fetchListings, listResource, type Listing } from './auction-services';
import { RequestStatus, useRequest } from './Rewards';

function resourceName(key: string) {
  const [p, , r] = key.split(':');
  return DISCOVERY_NAMES[p as ProfessionId]?.[Number(r)] ?? key;
}

export function AuctionHouse({ onClose }: { onClose: () => void }) {
  const { hero, heroId } = useGame();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notice, setNotice] = useState('');
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(100);
  const request = useRequest();

  const refresh = useCallback(async () => { setListings(await fetchListings()); }, []);
  useEffect(() => { void refresh().catch(() => setListings([])); }, [refresh]);

  if (!hero) return null;
  const resources = Object.entries(gatheringState(hero).resources).filter(([, n]) => n > 0);
  const chosen = resources.find(([k]) => k === sel);

  const run = (label: string, fn: () => Promise<void>) => void request.run(async () => { await fn(); await refresh(); setNotice(label); });

  return (
    <Panel title="Auction House" onClose={onClose} wide>
      <RequestStatus {...request} />
      {notice && <p role="status" className="mb-3 text-sm text-r1">{notice}</p>}

      <h3 className="font-display text-lg">Sell gathered supplies</h3>
      {resources.length === 0 ? (
        <p className="my-2 text-sm text-muted-foreground">You have no gathered resources yet — visit the Profession Lodge first.</p>
      ) : (
        <div className="my-3 flex flex-wrap items-end gap-2">
          <label className="text-xs">Resource
            <select aria-label="Resource to sell" value={sel} onChange={e => setSel(e.target.value)} className="mt-1 block w-44 rounded border border-border bg-background p-2">
              <option value="">Choose…</option>
              {resources.map(([k, n]) => <option key={k} value={k}>{resourceName(k)} (×{n})</option>)}
            </select>
          </label>
          <label className="text-xs">Quantity
            <input aria-label="Quantity" type="number" min={1} max={chosen?.[1] ?? 1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-20 rounded border border-border bg-background p-2" />
          </label>
          <label className="text-xs">Total price (Gold)
            <input aria-label="Price" type="number" min={1} value={price} onChange={e => setPrice(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-28 rounded border border-border bg-background p-2" />
          </label>
          <Button disabled={request.busy || !sel || qty < 1 || qty > (chosen?.[1] ?? 0) || price < 1}
            onClick={() => run(`Listed ${qty} × ${resourceName(sel)} for ${fmt(price)} Gold`, () => listResource(sel, qty, price))}>
            <Gavel className="mr-1 h-4 w-4" />List for sale
          </Button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-display text-lg">Open listings · {listings.length}</h3>
        <Button size="sm" variant="outline" onClick={() => void refresh()}><RefreshCw className="mr-1 h-3 w-3" />Refresh</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {listings.length === 0 && <p className="py-4 text-sm text-muted-foreground">No listings yet. Be the first to sell something.</p>}
        {listings.map(l => {
          const [p, a, r] = l.resource.split(':');
          const mine = l.seller_hero === heroId;
          return (
            <article key={l.id} className={`slot rarity-${Math.min(Number(r) + 1, 5)} flex items-center gap-3 p-3`}>
              <DiscoveryArt profession={p as ProfessionId} rarity={Number(r)} className="h-10 w-10 rounded" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display">{resourceName(l.resource)} ×{l.quantity}</p>
                <p className="text-xs text-muted-foreground">{DISCOVERY_RARITIES[Number(r)]} · {GATHERING_AREAS[Number(a)]} · by {l.seller_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold"><Gold n={l.price} /></p>
                {mine ? (
                  <Button size="sm" variant="outline" disabled={request.busy}
                    onClick={() => run('Listing cancelled — resources returned', () => cancelListing(l.id))}>Cancel</Button>
                ) : (
                  <Button size="sm" disabled={request.busy || hero.gold < l.price}
                    onClick={() => run(`Bought ${l.quantity} × ${resourceName(l.resource)}`, () => buyListing(l.id))}>Buy</Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Trades settle instantly and are recorded on the server — gold and resources move atomically, and a sold listing can never be sold twice.</p>
    </Panel>
  );
}

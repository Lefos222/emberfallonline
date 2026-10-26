import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, RefreshCw } from 'lucide-react';
import { DiscoveryArt } from './Professions';
import { GemIcon } from './MatIcon';
import { GearIcon } from './GearIcon';
import { gemName, parseGem } from './crafting';
import { DISCOVERY_NAMES, DISCOVERY_RARITIES, GATHERING_AREAS, gatheringState, type ProfessionId } from './professions';
import { buyListing, cancelListing, fetchListings, listGem, listItem, listResource, type Listing } from './auction-services';
import { RequestStatus, useRequest } from './Rewards';
import { useGame } from './store';
import { GameTabs, Gold, Panel, fmt } from './ui';

function resourceName(key: string) {
  const [p, , r] = key.split(':');
  return DISCOVERY_NAMES[p as ProfessionId]?.[Number(r)] ?? key;
}

type Category = 'supplies' | 'equipment' | 'gems';

export function AuctionHouse({ onClose }: { onClose: () => void }) {
  const { hero, heroId } = useGame();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notice, setNotice] = useState('');
  const [cat, setCat] = useState<Category>('supplies');
  const [sel, setSel] = useState('');
  const [itemId, setItemId] = useState('');
  const [gem, setGem] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(100);
  const request = useRequest();

  const refresh = useCallback(async () => { setListings(await fetchListings()); }, []);
  useEffect(() => { void refresh().catch(() => setListings([])); }, [refresh]);

  if (!hero) return null;
  const resources = Object.entries(gatheringState(hero).resources).filter(([, n]) => n > 0);
  const chosen = resources.find(([k]) => k === sel);
  const bag = hero.inventory;
  const item = bag.find((i) => i.id === itemId);
  const gems = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
  const gemHeld = gems.find(([k]) => k === gem)?.[1] ?? 0;

  const run = (label: string, fn: () => Promise<void>) => void request.run(async () => { await fn(); await refresh(); setNotice(label); });
  const pick = (c: Category) => { setCat(c); setQty(1); setNotice(''); };

  const canList = price >= 1 && (
    cat === 'supplies' ? !!sel && qty >= 1 && qty <= (chosen?.[1] ?? 0)
    : cat === 'equipment' ? !!item
    : !!gem && qty >= 1 && qty <= gemHeld
  );
  const list = () => {
    if (cat === 'supplies' && sel) return run(`Listed ${qty} × ${resourceName(sel)} for ${fmt(price)} Gold`, () => listResource(sel, qty, price));
    if (cat === 'equipment' && item) return run(`Listed ${item.name} for ${fmt(price)} Gold`, () => listItem(item, price));
    if (cat === 'gems' && gem) return run(`Listed ${qty} × ${gemName(gem)} for ${fmt(price)} Gold`, () => listGem(gem, qty, price));
  };

  return (
    <Panel title="Auction House" onClose={onClose} wide>
      <RequestStatus {...request} />
      {notice && <p role="status" className="mb-3 text-sm text-r1">{notice}</p>}

      <h3 className="font-display text-lg">Sell anything</h3>
      <p className="mt-1 text-xs text-muted-foreground">Gathered supplies, gems from your pouch, or a piece of equipment straight from your bag.</p>
      <div className="mt-3">
        <GameTabs label="What to sell" value={cat} onChange={pick} tabs={[
          { id: 'supplies', name: 'Supplies' },
          { id: 'equipment', name: 'Equipment' },
          { id: 'gems', name: 'Gems' },
        ]} />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        {cat === 'supplies' && (resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no gathered resources yet — visit the Profession Lodge first.</p>
        ) : (
          <label className="text-xs">Resource
            <select aria-label="Resource to sell" value={sel} onChange={e => setSel(e.target.value)} className="mt-1 block w-44 rounded border border-border bg-background p-2">
              <option value="">Choose…</option>
              {resources.map(([k, n]) => <option key={k} value={k}>{resourceName(k)} (×{n})</option>)}
            </select>
          </label>
        ))}

        {cat === 'equipment' && (bag.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your bag is empty. Worn gear stays equipped — move a piece to the bag to sell it.</p>
        ) : (
          <label className="text-xs">Bag item
            <select aria-label="Equipment to sell" value={itemId} onChange={e => setItemId(e.target.value)} className="mt-1 block w-64 rounded border border-border bg-background p-2">
              <option value="">Choose…</option>
              {bag.map(i => <option key={i.id} value={i.id}>{i.name}{i.enh > 0 ? ` +${i.enh}` : ''} · iLvl {i.ilvl}</option>)}
            </select>
          </label>
        ))}

        {cat === 'gems' && (gems.length === 0 ? (
          <p className="text-sm text-muted-foreground">You own no gems yet — cut some at the Gem Workshop.</p>
        ) : (
          <label className="text-xs">Gem
            <select aria-label="Gem to sell" value={gem} onChange={e => setGem(e.target.value)} className="mt-1 block w-52 rounded border border-border bg-background p-2">
              <option value="">Choose…</option>
              {gems.map(([k, n]) => <option key={k} value={k}>{gemName(k)} (×{n})</option>)}
            </select>
          </label>
        ))}

        {cat !== 'equipment' && (
          <label className="text-xs">Quantity
            <input aria-label="Quantity" type="number" min={1} max={cat === 'gems' ? gemHeld || 1 : chosen?.[1] ?? 1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-20 rounded border border-border bg-background p-2" />
          </label>
        )}
        <label className="text-xs">Total price (Gold)
          <input aria-label="Price" type="number" min={1} value={price} onChange={e => setPrice(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-28 rounded border border-border bg-background p-2" />
        </label>
        <Button disabled={request.busy || !canList} onClick={list}>
          <Gavel className="mr-1 h-4 w-4" />List for sale
        </Button>
        {cat === 'equipment' && item && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <GearIcon item={item} size={36} />{item.name} · iLvl {item.ilvl} · sells whole, sockets included
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-display text-lg">Open listings · {listings.length}</h3>
        <Button size="sm" variant="outline" onClick={() => void refresh()}><RefreshCw className="mr-1 h-3 w-3" />Refresh</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {listings.length === 0 && <p className="py-4 text-sm text-muted-foreground">No listings yet. Be the first to sell something.</p>}
        {listings.map(l => {
          const [p, a, r] = l.resource.split(':');
          const gemInfo = l.kind === 'gem' ? parseGem(l.resource) : null;
          const mine = l.seller_hero === heroId;
          const rc = l.kind === 'item' ? (l.payload?.rarity ?? 0) : l.kind === 'gem' ? Math.min(gemInfo?.tier ?? 1, 5) : Math.min(Number(r) + 1, 5);
          const name = l.kind === 'item' ? (l.payload?.name ?? 'Equipment') : l.kind === 'gem' ? `${gemName(l.resource)} ×${l.quantity}` : `${resourceName(l.resource)} ×${l.quantity}`;
          const sub = l.kind === 'item' ? `Equipment · iLvl ${l.payload?.ilvl ?? '—'} · by ${l.seller_name}`
            : l.kind === 'gem' ? `Gem · by ${l.seller_name}`
            : `${DISCOVERY_RARITIES[Number(r)]} · ${GATHERING_AREAS[Number(a)]} · by ${l.seller_name}`;
          return (
            <article key={l.id} className={`slot rarity-${rc} flex items-center gap-3 p-3`}>
              {l.kind === 'item' && l.payload ? <GearIcon item={l.payload} size={40} />
                : gemInfo ? <span className="flex h-10 w-10 shrink-0 items-center justify-center"><GemIcon type={gemInfo.type} /></span>
                : <DiscoveryArt profession={p as ProfessionId} rarity={Number(r)} className="h-10 w-10 rounded" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display">{name}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold"><Gold n={l.price} /></p>
                {mine ? (
                  <Button size="sm" variant="outline" disabled={request.busy}
                    onClick={() => run('Listing cancelled — returned to you', () => cancelListing(l.id))}>Cancel</Button>
                ) : (
                  <Button size="sm" disabled={request.busy || hero.gold < l.price}
                    onClick={() => run(`Bought ${name}`, () => buyListing(l.id))}>Buy</Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Trades settle instantly and are recorded on the server — gold and goods move atomically, and a sold listing can never be sold twice. Cancelling returns the goods to your bag or pouch.</p>
    </Panel>
  );
}

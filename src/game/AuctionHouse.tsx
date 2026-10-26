import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, Gem, Package, RefreshCw } from 'lucide-react';
import { Panel, fmt, Gold, ItemSlot } from './ui';
import { useGame } from './store';
import { DISCOVERY_NAMES, DISCOVERY_RARITIES, GATHERING_AREAS, gatheringState, type ProfessionId } from './professions';
import { DiscoveryArt } from './Professions';
import { buyListing, cancelListing, fetchListings, listGem, listItem, listResource, type Listing } from './auction-services';
import { gemName, gemStatText } from './crafting';
import { RARITIES, sellValue, type Item } from './data';
import { RequestStatus, useRequest } from './Rewards';

function resourceName(key: string) {
  const [p, , r] = key.split(':');
  return DISCOVERY_NAMES[p as ProfessionId]?.[Number(r)] ?? key;
}

type SellTab = 'resources' | 'items' | 'gems';

export function AuctionHouse({ onClose }: { onClose: () => void }) {
  const { hero, heroId } = useGame();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<SellTab>('resources');
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(100);
  const [itemSel, setItemSel] = useState<string>('');
  const [itemPrice, setItemPrice] = useState(1000);
  const request = useRequest();

  const refresh = useCallback(async () => { setListings(await fetchListings()); }, []);
  useEffect(() => { void refresh().catch(() => setListings([])); }, [refresh]);

  if (!hero) return null;
  const resources = Object.entries(gatheringState(hero).resources).filter(([, n]) => n > 0);
  const chosen = resources.find(([k]) => k === sel);
  const sellableItems = hero.inventory.filter((it) => !it.anc);
  const chosenItem = sellableItems.find((it) => it.id === itemSel);
  const gems = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
  const chosenGem = gems.find(([k]) => k === sel);

  const run = (label: string, fn: () => Promise<void>) => void request.run(async () => { await fn(); await refresh(); setNotice(label); });

  const sellItem = () => {
    if (!chosenItem) return;
    run(`Listed ${chosenItem.name} for ${fmt(itemPrice)} Gold`, () => listItem(chosenItem, itemPrice));
    setItemSel('');
  };

  return (
    <Panel title="Auction House" onClose={onClose} wide>
      <RequestStatus {...request} />
      {notice && <p role="status" className="mb-3 text-sm text-r1">{notice}</p>}

      {/* Sell tabs */}
      <div className="mb-4 flex gap-2">
        <SellTabButton active={tab === 'resources'} onClick={() => setTab('resources')} icon={Package} label="Supplies" />
        <SellTabButton active={tab === 'items'} onClick={() => setTab('items')} icon={Gavel} label="Equipment" />
        <SellTabButton active={tab === 'gems'} onClick={() => setTab('gems')} icon={Gem} label="Gems" />
      </div>

      {tab === 'resources' && (
        <>
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
        </>
      )}

      {tab === 'items' && (
        <>
          <h3 className="font-display text-lg">Sell equipment</h3>
          <p className="mb-2 text-xs text-muted-foreground">Select an item from your bag to list. Ancestral gear cannot be sold.</p>
          {sellableItems.length === 0 ? (
            <p className="my-2 text-sm text-muted-foreground">Your bag is empty. Loot gear from battles first.</p>
          ) : (
            <>
              <div className="my-3 flex flex-wrap gap-1.5">
                {sellableItems.map((it) => (
                  <ItemSlot key={it.id} item={it} size={44} selected={itemSel === it.id} onClick={() => { setItemSel(it.id); setItemPrice(Math.max(100, sellValue(it))); }} />
                ))}
              </div>
              {chosenItem && (
                <div className="my-3 flex flex-wrap items-end gap-2">
                  <div className="text-sm">
                    <span className="font-display" style={{ color: `var(--r${chosenItem.rarity})` }}>{chosenItem.name}</span>
                    {chosenItem.enh > 0 && ` +${chosenItem.enh}`} · {RARITIES[chosenItem.rarity].name} · iLvl {chosenItem.ilvl}
                    <span className="ml-2 text-xs text-muted-foreground">Suggested: {fmt(sellValue(chosenItem))} Gold</span>
                  </div>
                  <label className="text-xs">Price (Gold)
                    <input aria-label="Item price" type="number" min={1} value={itemPrice} onChange={e => setItemPrice(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-32 rounded border border-border bg-background p-2" />
                  </label>
                  <Button disabled={request.busy || itemPrice < 1} onClick={sellItem}>
                    <Gavel className="mr-1 h-4 w-4" />List item
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'gems' && (
        <>
          <h3 className="font-display text-lg">Sell gems</h3>
          {gems.length === 0 ? (
            <p className="my-2 text-sm text-muted-foreground">You have no gems to sell. Cut gems at the Gem Workshop first.</p>
          ) : (
            <div className="my-3 flex flex-wrap items-end gap-2">
              <label className="text-xs">Gem
                <select aria-label="Gem to sell" value={sel} onChange={e => { setSel(e.target.value); setQty(1); }} className="mt-1 block w-48 rounded border border-border bg-background p-2">
                  <option value="">Choose…</option>
                  {gems.map(([k, n]) => <option key={k} value={k}>{gemName(k)} (×{n})</option>)}
                </select>
              </label>
              <label className="text-xs">Quantity
                <input aria-label="Gem quantity" type="number" min={1} max={chosenGem?.[1] ?? 1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-20 rounded border border-border bg-background p-2" />
              </label>
              <label className="text-xs">Total price (Gold)
                <input aria-label="Gem price" type="number" min={1} value={price} onChange={e => setPrice(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-28 rounded border border-border bg-background p-2" />
              </label>
              <Button disabled={request.busy || !sel || qty < 1 || qty > (chosenGem?.[1] ?? 0) || price < 1}
                onClick={() => run(`Listed ${qty} × ${gemName(sel)} for ${fmt(price)} Gold`, () => listGem(sel, qty, price))}>
                <Gavel className="mr-1 h-4 w-4" />List for sale
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-display text-lg">Open listings · {listings.length}</h3>
        <Button size="sm" variant="outline" onClick={() => void refresh()}><RefreshCw className="mr-1 h-3 w-3" />Refresh</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {listings.length === 0 && <p className="py-4 text-sm text-muted-foreground">No listings yet. Be the first to sell something.</p>}
        {listings.map(l => {
          const mine = l.seller_hero === heroId;
          const isItem = !!l.item_data;
          const isGem = !isItem && l.resource.startsWith('gem:');
          const gemParts = isGem ? l.resource.split(':') : null;
          const gemKey = gemParts ? `${gemParts[1]}:${gemParts[2]}` : '';
          return (
            <article key={l.id} className={`slot ${isItem ? `rarity-${(l.item_data as Item).rarity}` : isGem ? 'rarity-2' : 'rarity-' + Math.min(Number(l.resource.split(':')[2] ?? 0) + 1, 5)} flex items-center gap-3 p-3`}>
              {isItem ? (
                <ItemSlot item={l.item_data as Item} size={40} />
              ) : isGem ? (
                <span className="flex h-12 w-12 items-center justify-center rounded border-2 border-r2 bg-r2/10"><Gem className="h-6 w-6 text-r2" /></span>
              ) : (
                (() => { const [p, a, r] = l.resource.split(':'); return <DiscoveryArt profession={p as ProfessionId} rarity={Number(r)} className="h-10 w-10 rounded" />; })()
              )}
              <div className="min-w-0 flex-1">
                {isItem ? (
                  <>
                    <p className="truncate font-display" style={{ color: `var(--r${(l.item_data as Item).rarity})` }}>
                      {(l.item_data as Item).name}{(l.item_data as Item).enh > 0 && ` +${(l.item_data as Item).enh}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{RARITIES[(l.item_data as Item).rarity].name} · {(l.item_data as Item).slot} · iLvl {(l.item_data as Item).ilvl} · by {l.seller_name}</p>
                  </>
                ) : isGem ? (
                  <>
                    <p className="truncate font-display">{gemName(gemKey)} ×{l.quantity}</p>
                    <p className="text-xs text-muted-foreground">{gemStatText(gemKey)} · by {l.seller_name}</p>
                  </>
                ) : (
                  <>
                    <p className="truncate font-display">{resourceName(l.resource)} ×{l.quantity}</p>
                    <p className="text-xs text-muted-foreground">{DISCOVERY_RARITIES[Number(l.resource.split(':')[2])]} · {GATHERING_AREAS[Number(l.resource.split(':')[1])]} · by {l.seller_name}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold"><Gold n={l.price} /></p>
                {mine ? (
                  <Button size="sm" variant="outline" disabled={request.busy}
                    onClick={() => run('Listing cancelled — item returned', () => cancelListing(l.id))}>Cancel</Button>
                ) : (
                  <Button size="sm" disabled={request.busy || hero.gold < l.price}
                    onClick={() => run(`Bought ${isItem ? (l.item_data as Item).name : isGem ? gemName(gemKey) : resourceName(l.resource)}`, () => buyListing(l.id))}>Buy</Button>
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

function SellTabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Package; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-display transition ${active ? 'bg-gold/20 text-gold ring-1 ring-gold' : 'text-muted-foreground hover:text-foreground'}`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gem, Crown, Coins, ShoppingBag, History } from 'lucide-react';
import { Panel, fmt } from './ui';
import { useGame } from './store';
import { DIAMOND_PACKS, DIAMOND_SHOP, GOLD_PACKS, VIP_LEVELS, premiumState } from './economy';
import { activateVip, buyDiamondItem, buyGoldPack, claimVipDaily } from './economy-services';
import { RequestStatus, useRequest } from './Rewards';

const TABS = [
  { id: 'diamonds', name: 'Get Diamonds', icon: Gem },
  { id: 'gold', name: 'Gold Packs', icon: Coins },
  { id: 'shop', name: 'Diamond Shop', icon: ShoppingBag },
  { id: 'vip', name: 'VIP', icon: Crown },
  { id: 'history', name: 'History', icon: History },
] as const;
type Tab = typeof TABS[number]['id'];

export function PremiumShop({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>('diamonds');
  const [notice, setNotice] = useState('');
  const request = useRequest();
  if (!hero) return null;
  const p = premiumState(hero);
  const vip = VIP_LEVELS.find(v => v.level === p.vip.level);

  const run = (label: string, fn: () => Promise<void>) => void request.run(async () => { await fn(); setNotice(label); });

  return (
    <Panel title="Premium Shop" onClose={onClose} wide>
      <RequestStatus {...request} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map(t => (
            <Button key={t.id} size="sm" variant={tab === t.id ? 'default' : 'outline'} onClick={() => { setTab(t.id); setNotice(''); }}>
              <t.icon className="mr-1 h-4 w-4" />{t.name}
            </Button>
          ))}
        </div>
        <div className="slot flex items-center gap-1.5 px-3 py-1.5 font-display text-lg text-r4">
          <Gem className="h-5 w-5" />{fmt(p.balance)} Diamonds
        </div>
      </div>
      {notice && <p role="status" className="mb-3 text-sm text-r1">{notice}</p>}

      {tab === 'diamonds' && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIAMOND_PACKS.map(pack => (
              <article key={pack.id} className="slot flex flex-col gap-2 p-4">
                <h3 className="font-display text-lg">{pack.name}</h3>
                <p className="flex items-center gap-1 text-2xl font-bold text-r4"><Gem className="h-5 w-5" />{fmt(pack.diamonds)}</p>
                {pack.bonus > 0 && <p className="text-xs text-r1">Includes {fmt(pack.bonus)} bonus Diamonds</p>}
                <Button disabled title="Real-money purchases activate once the payment provider is connected">
                  €{(pack.eurCents / 100).toFixed(2)} — coming soon
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Real-money checkout is being connected to a payment provider with server-side verification. Until it is verified live, purchases stay disabled — no Diamonds are ever granted without a confirmed payment.
          </p>
        </div>
      )}

      {tab === 'gold' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {GOLD_PACKS.map(pack => (
            <article key={pack.id} className="slot flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-display text-lg">{pack.name}</h3>
                <p className="text-sm text-gold">{fmt(pack.gold)} Gold</p>
                <p className="text-xs text-muted-foreground">{fmt(pack.diamonds)} Diamonds</p>
              </div>
              <Button disabled={request.busy || p.balance < pack.diamonds}
                onClick={() => run(`${pack.name}: ${fmt(pack.gold)} Gold added`, () => buyGoldPack(pack.id))}>
                {p.balance < pack.diamonds ? 'Not enough Diamonds' : 'Buy'}
              </Button>
            </article>
          ))}
        </div>
      )}

      {tab === 'shop' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIAMOND_SHOP.map(item => (
            <article key={item.id} className="slot flex flex-col gap-2 p-4">
              <h3 className="font-display">{item.name}</h3>
              <p className="flex-1 text-xs text-muted-foreground">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-r4"><Gem className="h-4 w-4" />{fmt(item.diamonds)}</span>
                <Button size="sm" disabled={request.busy || p.balance < item.diamonds}
                  onClick={() => run(`${item.name} added to your collection`, () => buyDiamondItem(item.id))}>
                  {p.balance < item.diamonds ? 'Not enough' : 'Buy'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'vip' && (
        <div>
          {vip && p.vip.until && (
            <div className="slot mb-4 flex flex-wrap items-center justify-between gap-3 border-gold/60 p-4">
              <div>
                <p className="font-display text-lg text-gold"><Crown className="mr-1 inline h-5 w-5" />VIP {vip.level} — {vip.name}</p>
                <p className="text-xs text-muted-foreground">Active until {new Date(p.vip.until).toLocaleString()}</p>
              </div>
              <Button disabled={request.busy || p.claimedToday} onClick={() => run('VIP daily reward claimed', () => claimVipDaily())}>
                {p.claimedToday ? 'Claimed today' : `Claim daily: ${fmt(vip.dailyGold)} Gold + ${vip.dailyResources} resources`}
              </Button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VIP_LEVELS.map(v => (
              <article key={v.level} className={`slot flex flex-col gap-2 p-4 ${p.vip.level === v.level ? 'ring-2 ring-gold' : ''}`}>
                <h3 className="font-display text-lg">VIP {v.level} — {v.name}</h3>
                <ul className="flex-1 list-inside list-disc text-xs text-muted-foreground">
                  {v.perks.map(perk => <li key={perk}>{perk}</li>)}
                  <li>Daily: {fmt(v.dailyGold)} Gold + {v.dailyResources} of each common resource</li>
                </ul>
                <Button size="sm" disabled={request.busy || p.balance < v.diamonds30}
                  onClick={() => run(`VIP ${v.level} active for 30 days`, () => activateVip(v.level))}>
                  {fmt(v.diamonds30)} Diamonds / 30 days
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Memberships never renew automatically. When a membership expires your items, cosmetics and progress stay — only the daily benefits pause.</p>
        </div>
      )}

      {tab === 'history' && (
        <div className="max-h-96 overflow-y-auto">
          {p.history.length === 0 && <p className="py-6 text-center text-muted-foreground">No Diamond transactions yet.</p>}
          {[...p.history].reverse().map((h, i) => (
            <div key={i} className="flex justify-between border-b border-border py-2 text-sm">
              <span>{h.detail.replaceAll(':', ' · ')}</span>
              <span className={h.kind === 'spend' ? 'text-blood' : 'text-r1'}>{h.kind === 'spend' ? '-' : '+'}{fmt(h.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

import { useState } from "react";
import { Gem, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame, update } from "./store";
import { fmt, Gold } from "./ui";
import { GoldCoin } from "./CoinIcon";
import { MatIcon } from "./MatIcon";
import { matCount } from "./crafting";
import {
  GUILD_SHOP, GUILD_VAULT, GUILD_CONTRIB_MIN,
  buyGuildShopItem, contributeGold, guildLedger, sellToVault,
} from "./guild-tower";

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const el = msg && <div className={`anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>;
  return [el, (ok: boolean, t: string) => setMsg({ ok, t })] as const;
}

/** Gold → Guild Coins contribution panel, with the guild's book of what you gave. */
export function GuildContribute() {
  const { hero } = useGame();
  const [amount, setAmount] = useState(GUILD_CONTRIB_MIN);
  const [toast, say] = useToast();
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  const book = guildLedger(hero);
  const doContribute = (sum: number) => update((h) => {
    const err = contributeGold(h, sum);
    say(!err, err ?? `Contributed ${fmt(sum)} gold → +${fmt(sum)} guild coins!`);
  });
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><GoldCoin size={16} />Guild Treasury</span>
        <span className="text-lg">{fmt(coins)} coins</span>
      </div>
      <p className="text-xs text-muted-foreground">Contribute gold to earn guild coins (1 gold = 1 guild coin). Spend them in the shop, the vault and the skill tower.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <div className="slot p-2"><span className="block text-muted-foreground">Gold donated</span><Gold n={book.donated} /></div>
        <div className="slot p-2"><span className="block text-muted-foreground">Coins spent</span><span className="font-bold text-gold">{fmt(book.spent)}</span></div>
        <div className="slot p-2"><span className="block text-muted-foreground">Coins on hand</span><span className="font-bold text-gold">{fmt(coins)}</span></div>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs">Gold to contribute
          <input type="number" min={GUILD_CONTRIB_MIN} step={1000} value={amount}
            onChange={(e) => setAmount(Math.max(GUILD_CONTRIB_MIN, Number(e.target.value) || GUILD_CONTRIB_MIN))}
            className="mt-1 block w-32 rounded border border-border bg-background p-2" />
        </label>
        <Button disabled={hero.gold < amount} onClick={() => doContribute(amount)}>Contribute <Gold n={amount} /></Button>
        {[1000, 10000, 100000].map((n) => (
          <Button key={n} variant="outline" size="sm" disabled={hero.gold < n} onClick={() => doContribute(n)}>+{fmt(n)}</Button>
        ))}
      </div>
      {toast}
    </div>
  );
}

/** Guild Shop — buy materials and enchantment stones with guild coins. */
export function GuildShopPanel() {
  const { hero } = useGame();
  const [toast, say] = useToast();
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Gem className="h-4 w-4" />Guild Shop</span>
        <span>{fmt(coins)} coins</span>
      </div>
      <p className="text-xs text-muted-foreground">Buy materials and enchantment stones with your guild coins.</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {GUILD_SHOP.map((item) => (
          <button key={item.id} className="slot flex items-center justify-between gap-2 p-2 text-left text-xs" disabled={coins < item.cost}
            title={item.desc}
            onClick={() => update((h) => { const err = buyGuildShopItem(h, item.id); say(!err, err ?? `Bought ${item.name}!`); })}>
            <span className="flex min-w-0 items-center gap-1.5">
              <MatIcon mat={item.mat} size={18} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-bold text-gold">{fmt(item.cost)} c</span>
          </button>
        ))}
      </div>
      {toast}
    </div>
  );
}

/** Guild Vault — trade surplus materials from the bag for guild coins. */
export function GuildVaultPanel() {
  const { hero } = useGame();
  const [toast, say] = useToast();
  if (!hero) return null;
  const trade = (mat: (typeof GUILD_VAULT)[number]["mat"], qty: number) => update((h) => {
    const have = matCount(h, mat);
    const count = Math.min(have, qty);
    const err = sellToVault(h, mat, qty);
    say(!err, err ?? `Sold ${fmt(count)} for ${fmt(count * (GUILD_VAULT.find((l) => l.mat === mat)?.rate ?? 0))} guild coins.`);
  });
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Archive className="h-4 w-4" />Guild Vault</span>
        <span>{fmt(hero.guildCoins ?? 0)} coins</span>
      </div>
      <p className="text-xs text-muted-foreground">The vaultkeeper buys surplus materials from your bag and pays in guild coins. Rates are a fraction of shop prices, so this is a way to clear clutter — not to turn a profit.</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {GUILD_VAULT.map((lot) => {
          const have = matCount(hero, lot.mat);
          return <div key={lot.mat} className="slot flex items-center justify-between gap-2 p-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5">
              <MatIcon mat={lot.mat} size={18} />
              <span className="min-w-0"><span className="block truncate">{lot.name}</span><span className="text-muted-foreground">{fmt(have)} held · {lot.rate} c each</span></span>
            </span>
            <span className="flex shrink-0 gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" disabled={have < 1} onClick={() => trade(lot.mat, Math.min(10, have))}>10</Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" disabled={have < 1} onClick={() => trade(lot.mat, have)}>All</Button>
            </span>
          </div>;
        })}
      </div>
      {toast}
    </div>
  );
}

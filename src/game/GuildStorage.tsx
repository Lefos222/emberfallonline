import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { tr, itemName } from "./i18n";
import { useGame } from "./store";
import { adoptServerSave, getState, withServerHero } from "./store";
import { requestKey, returnedSave } from "./services-contract";
import { ItemCard, ItemSlot } from "./ui";
import type { Item } from "./data";
import { MATS, gemName, parseGem, type Mat } from "./crafting";
import { MatIcon, GemIcon } from "./MatIcon";
import { GoldChestIcon, GemChestIcon } from "./CoinIcon";
import { CHESTS, type ChestKind } from "./chests";

/**
 * Personal guild storage: three pages of 256 slots per player, moved only through server-checked
 * RPCs. Each player sees only what their own characters stored (the database policy in
 * 0056_personal_guild_vault.sql enforces it; ownStash keeps the screen personal as well).
 */
export const VAULT_PAGES = 3;
export const VAULT_SLOTS = 256;

type Stack = { id: string; stack: "mat" | "gem" | "chest"; key: string; qty: number };
interface Entry { id: string; page: number; slot: number; item: Item | Stack; depositor_name: string; deposited_by?: string }

/** Only the entries stored by one of the player's own characters. */
export function ownStash<T extends { deposited_by?: string | null }>(rows: T[], myHeroIds: Iterable<string>): T[] {
  const mine = new Set(myHeroIds);
  return rows.filter((r) => !!r.deposited_by && mine.has(r.deposited_by));
}
const isStack = (x: unknown): x is Stack => !!x && typeof x === "object" && "stack" in x;
const stackName = (st: Stack) => st.stack === "mat" ? MATS[st.key as Mat]?.name ?? st.key : st.stack === "gem" ? gemName(st.key) : CHESTS[st.key as ChestKind]?.name ?? st.key;
function StackTile({ st, selected, onClick, size = 36 }: { st: Stack; selected?: boolean; onClick?: () => void; size?: number }) {
  const g = st.stack === "gem" ? parseGem(st.key) : null;
  return (
    <button className={`slot bag-mat ${selected ? "ring-2 ring-gold" : ""}`} style={{ width: size, height: size }} onClick={onClick} title={`${stackName(st)} ×${st.qty}`}>
      {st.stack === "mat" ? <MatIcon mat={st.key as Mat} size={size - 8} /> : g ? <GemIcon type={g.type} size={size - 10} /> : st.key === "gold" ? <GoldChestIcon size={size - 8} /> : <GemChestIcon size={size - 8} />}
      <span className="bag-mat-count">{st.qty >= 1000 ? `${Math.floor(st.qty / 1000)}k` : st.qty}</span>
    </button>
  );
}

async function vaultCall(op: string, rpc: "guild_vault_deposit" | "guild_vault_withdraw" | "guild_vault_deposit_stack", args: Record<string, unknown>) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc(rpc, { _hero: heroId, _req: req, ...args } as never);
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}

export function GuildStorage({ guildId }: { guildId: string }) {
  const { hero, heroId, chars } = useGame();
  const myIds = [heroId, ...(chars ?? []).map((c) => c.id)].filter((x): x is string => !!x).sort().join(",");
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sel, setSel] = useState<Entry | null>(null);
  const [pick, setPick] = useState<Item | null>(null);
  const [spick, setSpick] = useState<Stack | null>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const load = useCallback(async () => {
    const ids = myIds ? myIds.split(",") : [];
    if (!ids.length) { setEntries([]); return; }
    const { data, error } = await supabase.from("guild_vault").select("id, page, slot, item, depositor_name, deposited_by").eq("guild_id", guildId).in("deposited_by", ids);
    if (!error) setEntries(ownStash((data ?? []) as unknown as Entry[], ids));
  }, [guildId, myIds]);
  useEffect(() => { void load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);
  if (!hero) return null;
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true); setNote("");
    try { await fn(); setNote(ok); setSel(null); setPick(null); setSpick(null); await load(); }
    catch (e) { setNote(e instanceof Error ? tr(e.message) : tr("Something went wrong")); }
    setBusy(false);
  };
  const bagStacks: Stack[] = [
    ...Object.entries(hero.mats ?? {}).filter(([, n]) => (n ?? 0) > 0).map(([k, n]) => ({ id: "mat:" + k, stack: "mat" as const, key: k, qty: Math.floor(n ?? 0) })),
    ...Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).map(([k, n]) => ({ id: "gem:" + k, stack: "gem" as const, key: k, qty: n })),
    ...Object.entries(hero.chests ?? {}).filter(([, n]) => (n ?? 0) > 0).map(([k, n]) => ({ id: "chest:" + k, stack: "chest" as const, key: k, qty: n ?? 0 })),
  ];
  const onPage = entries.filter((e) => e.page === page);
  const bySlot = new Map(onPage.map((e) => [e.slot, e]));
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-gold">{tr("Guild Vault")} · {entries.length}/{VAULT_PAGES * VAULT_SLOTS}</span>
        <div className="flex gap-1">
          {Array.from({ length: VAULT_PAGES }, (_, i) => i + 1).map((p) => (
            <Button key={p} size="sm" variant={p === page ? "default" : "ghost"} onClick={() => setPage(p)}>{tr("Page")} {p}</Button>
          ))}
        </div>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{tr("Your own stash inside the guild: nobody else sees what you store here, and only you can take it back.")}</p>
      {note && <p className="mb-2 text-xs text-gold">{note}</p>}
      <div className="grid max-h-80 grid-cols-8 gap-1 overflow-y-auto sm:grid-cols-12 lg:grid-cols-16">
        {Array.from({ length: VAULT_SLOTS }, (_, i) => {
          const e = bySlot.get(i);
          if (e && isStack(e.item)) return <StackTile key={i} st={e.item} selected={sel?.id === e.id} onClick={() => setSel(e)} />;
          return <ItemSlot key={i} item={e?.item as Item | undefined} size={36} selected={!!e && sel?.id === e.id} onClick={() => e && setSel(e)} />;
        })}
      </div>
      {sel && (
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
          {isStack(sel.item) ? <div className="flex items-center gap-2"><StackTile st={sel.item} size={48} /><b>{stackName(sel.item)} ×{sel.item.qty}</b></div> : <ItemCard item={sel.item} />}
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">{tr("Stored by")} {sel.depositor_name}</p>
            <Button size="sm" disabled={busy} onClick={() => run(() => vaultCall(`guild-vault-withdraw:${sel.id}`, "guild_vault_withdraw", { _entry: sel.id }), `${isStack(sel.item) ? stackName(sel.item) : itemName(sel.item.name)} ✓`)}>{tr("Take to bag")}</Button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <div className="mb-1 font-display text-sm text-gold">{tr("Deposit from your bag")}</div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
          {hero.inventory.map((it) => <ItemSlot key={it.id} item={it} size={36} selected={pick?.id === it.id} onClick={() => { setPick(it); setSpick(null); }} />)}
          {bagStacks.map((st) => <StackTile key={st.id} st={st} selected={spick?.id === st.id} onClick={() => { setSpick(st); setPick(null); setQty(st.qty); }} />)}
        </div>
        {spick && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span>{stackName(spick)}</span>
            <input type="number" min={1} max={spick.qty} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(spick.qty, Math.floor(Number(e.target.value) || 1))))}
              className="w-24 rounded bg-secondary px-2 py-1" aria-label={tr("Amount")} />
            <Button size="sm" disabled={busy} onClick={() => run(() => vaultCall(`guild-vault-stack:${spick.id}:${qty}`, "guild_vault_deposit_stack", { _kind: spick.stack, _key: spick.key, _qty: qty }), `${qty}× ${stackName(spick)} → ${tr("Guild Vault")}`)}>{tr("Store")}</Button>
          </div>
        )}
        {pick && (
          <Button className="mt-2" size="sm" disabled={busy} onClick={() => run(() => vaultCall(`guild-vault-deposit:${pick.id}`, "guild_vault_deposit", { _item_id: pick.id }), `${itemName(pick.name)} → ${tr("Guild Vault")}`)}>
            {tr("Store")} {itemName(pick.name)}
          </Button>
        )}
      </div>
    </div>
  );
}

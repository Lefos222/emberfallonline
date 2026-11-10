import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { tr, itemName } from "./i18n";
import { useGame } from "./store";
import { adoptServerSave, getState, withServerHero } from "./store";
import { requestKey, returnedSave } from "./services-contract";
import { ItemCard, ItemSlot } from "./ui";
import type { Item } from "./data";

/** Shared guild storage: three pages of 256 slots, moved only through server-checked RPCs. */
export const VAULT_PAGES = 3;
export const VAULT_SLOTS = 256;

interface Entry { id: string; page: number; slot: number; item: Item; depositor_name: string }

async function vaultCall(op: string, rpc: "guild_vault_deposit" | "guild_vault_withdraw", args: Record<string, unknown>) {
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
  const { hero } = useGame();
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sel, setSel] = useState<Entry | null>(null);
  const [pick, setPick] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("guild_vault").select("id, page, slot, item, depositor_name").eq("guild_id", guildId);
    if (!error) setEntries((data ?? []) as unknown as Entry[]);
  }, [guildId]);
  useEffect(() => { void load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);
  if (!hero) return null;
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true); setNote("");
    try { await fn(); setNote(ok); setSel(null); setPick(null); await load(); }
    catch (e) { setNote(e instanceof Error ? tr(e.message) : tr("Something went wrong")); }
    setBusy(false);
  };
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
      <p className="mb-2 text-xs text-muted-foreground">{tr("Store gear for the whole guild. Any member can take an item out when their bag has room.")}</p>
      {note && <p className="mb-2 text-xs text-gold">{note}</p>}
      <div className="grid max-h-80 grid-cols-8 gap-1 overflow-y-auto sm:grid-cols-12 lg:grid-cols-16">
        {Array.from({ length: VAULT_SLOTS }, (_, i) => {
          const e = bySlot.get(i);
          return <ItemSlot key={i} item={e?.item} size={36} selected={!!e && sel?.id === e.id} onClick={() => e && setSel(e)} />;
        })}
      </div>
      {sel && (
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
          <ItemCard item={sel.item} />
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">{tr("Stored by")} {sel.depositor_name}</p>
            <Button size="sm" disabled={busy} onClick={() => run(() => vaultCall(`guild-vault-withdraw:${sel.id}`, "guild_vault_withdraw", { _entry: sel.id }), `${itemName(sel.item.name)} ✓`)}>{tr("Take to bag")}</Button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <div className="mb-1 font-display text-sm text-gold">{tr("Deposit from your bag")}</div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
          {hero.inventory.map((it) => <ItemSlot key={it.id} item={it} size={36} selected={pick?.id === it.id} onClick={() => setPick(it)} />)}
        </div>
        {pick && (
          <Button className="mt-2" size="sm" disabled={busy} onClick={() => run(() => vaultCall(`guild-vault-deposit:${pick.id}`, "guild_vault_deposit", { _item_id: pick.id }), `${itemName(pick.name)} → ${tr("Guild Vault")}`)}>
            {tr("Store")} {itemName(pick.name)}
          </Button>
        )}
      </div>
    </div>
  );
}

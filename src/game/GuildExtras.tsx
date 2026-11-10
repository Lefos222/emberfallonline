import { useCallback, useEffect, useState } from "react";
import { t } from "./i18n";
import { Button } from "@/components/ui/button";
import { MATS, type Mat } from "./crafting";
import { fmt } from "./ui";
import { waitLabel } from "./farm";
import { rewardText } from "./guild-events";
import {
  GUILD_BUFFS,
  GUILD_RANKS,
  GUILD_SHOP,
  activateBuff,
  buyGuildShop,
  donateToBank,
  loadGuildExtras,
  rankIndex,
  rollGuildDice,
  type GuildExtrasState,
} from "./guild-extras";

/** Guild bank, buffs, contribution shop, daily dice and member ranks. Every action is a server RPC. */
export function GuildExtras() {
  const [st, setSt] = useState<GuildExtrasState | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => {
    loadGuildExtras().then((s) => { setSt(s); setErr(""); }).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const act = async (fn: () => Promise<unknown>, ok: (r: Record<string, unknown>) => string) => {
    setMsg(""); setErr(""); setBusy(true);
    try { const r = (await fn()) as Record<string, unknown>; setMsg(ok(r ?? {})); reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  if (err && !st) return <p className="mt-4 text-sm text-hp">{err}</p>;
  if (!st) return <p className="mt-4 text-sm text-muted-foreground">{t("Loading…")}</p>;
  const officer = st.role === "leader" || st.role === "officer";
  const myRank = rankIndex(st.rank);
  const next = GUILD_RANKS[myRank + 1];
  const now = Date.now();

  return (
    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      {err && <p className="text-sm text-hp lg:col-span-2">{err}</p>}
      {msg && <p className="text-sm text-r1 lg:col-span-2">{msg}</p>}

      <section className="rounded-lg border border-border bg-card p-3">
        <h3 className="font-display text-gold">{t("Guild Bank")}</h3>
        <p className="text-sm">{t("Funds")}: <b>{fmt(st.funds)}</b> {t("gold")}</p>
        <p className="text-xs text-muted-foreground">{t("Every 100 gold donated earns 1 contribution point.")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[10000, 50000, 200000].map((g) => (
            <Button key={g} size="sm" disabled={busy} onClick={() => act(() => donateToBank(g), (r) => `+${r["points"]} ${t("contribution")}`)}>{t("Donate")} {fmt(g)}</Button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <h3 className="font-display text-gold">{t("Your Rank")}: {t(st.rank)}</h3>
        <p className="text-sm">{t("Contribution points")}: <b>{fmt(st.points)}</b> · {t("lifetime")} {fmt(st.total)}</p>
        {next && <p className="text-xs text-muted-foreground">{t("Next rank")}: {t(next.name)} ({fmt(next.at - st.total)} {t("more")})</p>}
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" disabled={busy || st.dice != null} onClick={() => act(rollGuildDice, (r) => `🎲 ${r["face"]} · ${rewardText(r["reward"])} · +${r["points"]} ${t("contribution")}`)}>
            {st.dice != null ? `${t("Rolled today")}: ${st.dice}` : t("Roll the Guild Dice")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("Once a day")}</span>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-3 lg:col-span-2">
        <h3 className="font-display text-gold">{t("Guild Buffs")}</h3>
        <p className="text-xs text-muted-foreground">{t("Leaders and officers light buffs from the bank. Each lasts 24 hours for every member.")}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {GUILD_BUFFS.map((b) => {
            const live = st.buffs.find((x) => x.kind === b.kind);
            const left = live ? new Date(live.expires_at).getTime() - now : 0;
            return (
              <div key={b.kind} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                <div><b className="text-sm">{t(b.name)}</b><p className="text-xs text-muted-foreground">{t(b.desc)}</p></div>
                {left > 0 ? <span className="text-xs text-r1">{waitLabel(left)}</span> : (
                  <Button size="sm" disabled={busy || !officer || st.funds < b.cost} onClick={() => act(() => activateBuff(b.kind), () => t("Buff lit for 24 hours"))}>{fmt(b.cost)}</Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <h3 className="font-display text-gold">{t("Guild Shop")}</h3>
        <div className="mt-2 grid gap-1">
          {GUILD_SHOP.map((it) => {
            const locked = myRank < it.rank;
            return (
              <div key={it.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{it.qty}× {MATS[it.mat as Mat]?.name ?? it.mat}{locked && <small className="ml-1 text-muted-foreground">({t(GUILD_RANKS[it.rank].name)})</small>}</span>
                <Button size="sm" variant="outline" disabled={busy || locked || st.points < it.cost} onClick={() => act(() => buyGuildShop(it.id), (r) => rewardText(r["reward"]))}>{fmt(it.cost)} {t("pts")}</Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-3">
        <h3 className="font-display text-gold">{t("Member Ranks")}</h3>
        <ol className="mt-2 grid gap-1 text-sm">
          {st.roster.map((m, i) => (
            <li key={m.name} className="flex justify-between"><span>{i + 1}. {m.name}</span><span className="text-muted-foreground">{t(m.rank)} · {fmt(m.total)}</span></li>
          ))}
        </ol>
      </section>
    </div>
  );
}

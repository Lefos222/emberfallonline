import { useCallback, useEffect, useState } from "react";
import { t } from "./i18n";
import bossArt from "@/assets/guild-raid-boss.webp";
import trophyArt from "@/assets/guild-tournament.webp";
import questArt from "@/assets/guild-quests.webp";
import bankArt from "@/assets/guild-bank.webp";
import { GuildExtras } from "./GuildExtras";
import { Button } from "@/components/ui/button";
import { useGame } from "./store";
import type { StartBattle } from "./panels";
import { stageFoe } from "./data";
import { Gold, fmt } from "./ui";
import { waitLabel } from "./farm";
import {
  QUEST_INFO,
  RAID_ATTACKS,
  TOURNAMENT_REWARDS,
  claimQuest,
  claimRaid,
  claimTournament,
  donateGold,
  loadGuildEvents,
  raidDamage,
  raidHit,
  rewardText,
  type GuildEventsState,
} from "./guild-events";

type Tab = "raid" | "quests" | "tournament" | "bank";

/** The guild's events hall: timed boss raids, weekly shared quests and the guild tournament. */
export function GuildEvents({ start }: { start: StartBattle }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("raid");
  const [st, setSt] = useState<GuildEventsState | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [, tick] = useState(0);
  const reload = useCallback(() => {
    loadGuildEvents().then((s) => { setSt(s); setErr(""); }).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);
  useEffect(() => { reload(); const i = setInterval(reload, 20000); const j = setInterval(() => tick((n) => n + 1), 1000); return () => { clearInterval(i); clearInterval(j); }; }, [reload]);

  const act = async (fn: () => Promise<unknown>, ok: (r: unknown) => string) => {
    setMsg("");
    try { const r = await fn(); setMsg(ok(r)); reload(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  if (!hero) return null;
  const now = Date.now();

  const fightBoss = () => {
    const lvl = hero.level + (hero.paragon ?? 0);
    const base = stageFoe(Math.max(5, lvl), 1.5);
    start({
      title: t("Guild Raid · The Obsidian Behemoth"),
      right: { ...base, name: "Obsidian Behemoth", img: bossArt, level: lvl, boss: true, hp: Math.round(base.hp * 2.2) },
      onResult: async (won) => {
        try {
          const r = await raidHit(won);
          reload();
          return { lines: [won ? t("The Behemoth staggers!") : t("You were driven back, but your blows still count."), `${fmt(r.damage)} ${t("raid damage")}`, ...(r.slain ? [t("The guild boss is slain! Claim the spoils in the Guild Hall.")] : [])] };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "Raid confirmation failed."] };
        }
      },
    });
  };

  return (
    <div className="mt-4">
      <div className="guild-events-tabs" role="tablist">
        {([
          ["raid", bossArt, "Boss Raid", "Every 4 hours"],
          ["quests", questArt, "Weekly Quests", "Shared rewards"],
          ["tournament", trophyArt, "Tournament", "Guild vs guild"],
          ["bank", bankArt, "Guild Bank", "Buffs · shop · dice"],
        ] as const).map(([id, art, name, note]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`gate-tab ${tab === id ? "gate-tab-on" : ""}`} onClick={() => setTab(id)}>
            <img src={art} alt="" width={256} height={256} />
            <span><b>{t(name)}</b><small>{t(note)}</small></span>
          </button>
        ))}
      </div>
      {err && <p className="mt-2 text-sm text-hp">{err}</p>}
      {msg && <p className="mt-2 text-sm text-r1">{msg}</p>}
      {tab === "bank" && <GuildExtras />}
      {tab !== "bank" && !st && !err && <p className="mt-4 text-sm text-muted-foreground">{t("Loading…")}</p>}

      {st && tab === "raid" && (() => {
        const r = st.raid;
        const pct = Math.min(100, (r.dealt / Math.max(1, r.hp)) * 100);
        const closesIn = new Date(r.opens_until).getTime() - now;
        const nextIn = new Date(r.next).getTime() - now;
        const slain = r.dealt >= r.hp;
        return (
          <section className="guild-raid mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="slot relative overflow-hidden p-4">
              <img src={bossArt} alt={t("The Obsidian Behemoth")} width={512} height={512} className="guild-raid-boss" />
              <div className="relative">
                <h3 className="font-display text-2xl text-gold">{t("The Obsidian Behemoth")}</h3>
                <p className="text-xs text-muted-foreground">{t("Wakes every 4 hours (UTC) for 60 minutes. Every member gets 3 attacks; when the guild's damage beats its health, everyone who fought claims the spoils.")}</p>
                <div className="bar-track mt-3 h-4"><div className="bar-hp h-full transition-all" style={{ width: `${100 - pct}%` }} /></div>
                <p className="mt-1 text-xs">{fmt(Math.max(0, r.hp - r.dealt))} / {fmt(r.hp)} {t("health")}</p>
                <p className="mt-2 text-sm">
                  {r.open
                    ? slain ? t("Slain this window!") : `${t("Awake")} · ${t("closes in")} ${waitLabel(closesIn)}`
                    : `${t("Sleeping")} · ${t("wakes in")} ${waitLabel(nextIn)}`}
                </p>
                <p className="text-xs text-muted-foreground">{t("Your attack")}: {fmt(raidDamage(hero.level, true))} {t("on a win")}, {fmt(raidDamage(hero.level, false))} {t("on a loss")}</p>
                <Button className="btn-gold mt-3 w-full md:w-auto md:px-8" variant="ghost" disabled={!r.open || slain || r.my_hits >= RAID_ATTACKS} onClick={fightBoss}>
                  {t("Attack")} · {RAID_ATTACKS - r.my_hits}/{RAID_ATTACKS}
                </Button>
                {r.claimable.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.claimable.map((w) => (
                      <Button key={w} variant="ghost" className="btn-gold px-3 py-1 text-xs" onClick={() => void act(() => claimRaid(w), (x) => rewardText((x as { reward?: unknown }).reward))}>
                        {t("Claim raid spoils")} · {new Date(w).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="slot p-3">
              <h4 className="font-display text-sm text-gold">{t("Damage board")}</h4>
              {r.board.length === 0 ? <p className="text-xs text-muted-foreground">{t("No attacks yet this window.")}</p> : (
                <ol className="mt-1 space-y-1 text-xs">
                  {r.board.map((b, i) => <li key={b.name} className="flex justify-between"><span>{i + 1}. {b.name}</span><b className="text-gold">{fmt(b.dmg)}</b></li>)}
                </ol>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">{t("Spoils per member: gold, a Boss Core, Starshards and Soul Essence.")}</p>
            </div>
          </section>
        );
      })()}

      {st && tab === "quests" && (
        <section className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">{t("The whole guild works on these together. When a quest is done, every member claims its reward once. They reset each Monday (UTC)")} · {waitLabel(new Date(st.week_ends).getTime() - now)}</p>
          {st.quests.map((q) => {
            const info = QUEST_INFO[q.kind];
            const done = q.amount >= q.target;
            return (
              <div key={q.kind} className="slot flex flex-wrap items-center gap-3 p-3">
                <img src={questArt} alt="" width={256} height={256} className="h-12 w-12 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-gold">{t(info.name)}</div>
                  <div className="text-xs text-muted-foreground">{t(info.desc)} · {t(info.reward)}</div>
                  <div className="bar-track mt-1.5 h-2"><div className="farm-bar h-full" style={{ width: `${Math.min(100, (q.amount / q.target) * 100)}%` }} /></div>
                  <div className="text-[11px]">{fmt(Math.min(q.amount, q.target))} / {fmt(q.target)}</div>
                </div>
                {q.kind === "gold" && !done && (
                  <Button variant="ghost" className="btn-ghost px-2 py-1 text-xs" disabled={hero.gold < 10000} onClick={() => void act(() => donateGold(10000), () => t("Donated 10,000 gold to the guild."))}>
                    {t("Donate")} <Gold n={10000} />
                  </Button>
                )}
                <Button variant="ghost" className="btn-gold px-3 py-1 text-xs" disabled={!done || q.claimed} onClick={() => void act(() => claimQuest(q.kind), (x) => rewardText((x as { reward?: unknown }).reward))}>
                  {q.claimed ? t("Claimed") : t("Claim")}
                </Button>
              </div>
            );
          })}
        </section>
      )}

      {st && tab === "tournament" && (
        <section className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="slot p-3">
            <h4 className="font-display text-lg text-gold">{t("This week's standings")}</h4>
            <p className="text-xs text-muted-foreground">{t("Guilds compete all week: a Guild War win scores 10, a draw 5, a slain raid boss 3 and a finished guild quest 2. Ends in")} {waitLabel(new Date(st.week_ends).getTime() - now)}</p>
            <ol className="mt-2 space-y-1">
              {st.tournament.map((g, i) => (
                <li key={g.id} className={`flex items-center justify-between rounded px-2 py-1 text-sm ${g.id === st.guild ? "bg-gold/15 text-gold" : ""}`}>
                  <span><b className="mr-2 font-display">{i + 1}.</b>{g.name}</span>
                  <b>{g.points} {t("pts")}</b>
                </li>
              ))}
            </ol>
          </div>
          <div className="slot p-3">
            <img src={trophyArt} alt="" width={256} height={256} className="mx-auto h-20 w-20 object-contain" />
            <h4 className="text-center font-display text-sm text-gold">{t("Rewards for every member")}</h4>
            <ul className="mt-1 space-y-1 text-[11px]">
              {TOURNAMENT_REWARDS.map((r) => <li key={r.rank}><b>{t(r.rank)}</b> · <Gold n={r.gold} /> · {t(r.mats)}</li>)}
            </ul>
            {st.last_week ? (
              <Button variant="ghost" className="btn-gold mt-3 w-full py-1.5 text-xs" disabled={st.last_week.claimed} onClick={() => void act(claimTournament, (x) => rewardText((x as { reward?: unknown }).reward))}>
                {st.last_week.claimed ? t("Claimed") : `${t("Claim last week's reward")} · #${st.last_week.rank}`}
              </Button>
            ) : <p className="mt-3 text-center text-[11px] text-muted-foreground">{t("Your guild scored no points last week.")}</p>}
          </div>
        </section>
      )}
    </div>
  );
}

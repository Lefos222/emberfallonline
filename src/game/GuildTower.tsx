import { useState } from "react";
import { ArrowUp, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame, update } from "./store";
import { fmt, Gold } from "./ui";
import { STAT_LABEL } from "./crafting";
import { heroStats } from "./data";
import {
  GUILD_SKILLS, GUILD_RELICS,
  affordableRanks, guildSkillBlocker, guildSkillPrice, guildSkillRank, guildTotalRanks,
  learnGuildSkill, nextRelic, relicUnlocked,
} from "./guild-tower";

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const el = msg && <div className={`anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>;
  return [el, (ok: boolean, t: string) => setMsg({ ok, t })] as const;
}

const BATCHES = [1, 5, 10] as const;

/** Guild Skill Tower — endless stat ranks, bought with guild coins and gold, plus their relics. */
export function GuildSkillTower() {
  const { hero } = useGame();
  const [toast, say] = useToast();
  const [batch, setBatch] = useState<number>(1);
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  const total = guildTotalRanks(hero);
  const s = heroStats(hero);
  const next = nextRelic(hero);
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><ArrowUp className="h-4 w-4" />Guild Skill Tower</span>
        <span className="flex flex-wrap items-center gap-3 text-sm">
          <span>{fmt(coins)} coins</span>
          <Gold n={hero.gold} />
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        The tower has no top. Every rank costs guild coins <em>and</em> gold, and both prices climb with each rank — so there is always another step, and it always costs more.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <span className="slot px-2 py-1">Total ranks: <b className="text-gold">{fmt(total)}</b></span>
        <span className="slot px-2 py-1">Battle Rating: <b className="text-gold">{fmt(s.power)}</b></span>
        {next && <span className="slot px-2 py-1">Next relic: <b className="text-gold">{next.name}</b> at {next.ranks} ranks</span>}
        <span className="ml-auto flex items-center gap-1">Buy
          {BATCHES.map((n) => <Button key={n} size="sm" variant={batch === n ? "default" : "outline"} className="h-7 px-2 text-[11px]" onClick={() => setBatch(n)}>×{n}</Button>)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GUILD_SKILLS.map((skill) => {
          const rank = guildSkillRank(hero, skill.id);
          const price = guildSkillPrice(skill, rank, hero.level);
          const blocker = guildSkillBlocker(hero, skill);
          const affordable = affordableRanks(hero, skill, batch);
          return (
            <div key={skill.id} className="slot p-2 text-sm">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold">{skill.name}</span>
                <span className="rounded-full bg-blood px-1.5 text-[10px] font-bold text-primary-foreground">Rank {rank}</span>
              </div>
              <p className="text-xs text-muted-foreground">{skill.desc}</p>
              <p className="mt-1 text-xs">Banked: +{+(skill.per * rank).toFixed(1)}{STAT_LABEL[skill.stat]}</p>
              <p className="text-xs text-muted-foreground">Next: +{+(skill.per * (rank + 1)).toFixed(1)}{STAT_LABEL[skill.stat]}</p>
              <button className="btn-gold mt-2 w-full py-1.5 text-xs" disabled={!affordable}
                onClick={() => update((h) => {
                  const res = learnGuildSkill(h, skill.id, batch);
                  say(!res.error, res.error ?? `Learned ${res.bought} rank${res.bought === 1 ? "" : "s"} of ${skill.name} — now rank ${rank + res.bought}.`);
                })}>
                {blocker ? blocker : <>Upgrade ×{batch} · {fmt(price.coins)} c + <Gold n={price.gold} /></>}
              </button>
            </div>
          );
        })}
      </div>
      {toast}
    </div>
  );
}

/** Reliquary — the guild's heirlooms, woken by climbing the skill tower. */
export function GuildReliquary() {
  const { hero } = useGame();
  if (!hero) return null;
  const total = guildTotalRanks(hero);
  const woken = GUILD_RELICS.filter((r) => relicUnlocked(hero, r)).length;
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Crown className="h-4 w-4" />Reliquary</span>
        <span className="text-sm">{woken}/{GUILD_RELICS.length} relics woken · {fmt(total)} tower ranks</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Every relic on these shelves was paid for by the skill tower. Climb the ranks and the next heirloom wakes on its own, adding its bonus to every fight.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {GUILD_RELICS.map((relic) => {
          const open = relicUnlocked(hero, relic);
          const text = (Object.entries(relic.bonus) as [keyof typeof STAT_LABEL, number][])
            .map(([k, v]) => `+${v}${STAT_LABEL[k]}`).join(", ");
          return <div key={relic.id} className={`slot p-2 text-sm ${open ? "border-gold" : "opacity-70"}`}>
            <div className="flex items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 font-bold"><Sparkles className={`h-3.5 w-3.5 ${open ? "text-gold" : "text-muted-foreground"}`} />{relic.name}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{open ? "Woken" : `${relic.ranks} ranks`}</span>
            </div>
            <p className="text-xs text-muted-foreground">{relic.desc}</p>
            <p className={`mt-1 text-xs ${open ? "text-gold" : ""}`}>{text}</p>
            {!open && <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-muted">
              <div className="h-full bg-gold" style={{ width: `${Math.min(100, Math.round((total / relic.ranks) * 100))}%` }} />
            </div>}
          </div>;
        })}
      </div>
    </div>
  );
}

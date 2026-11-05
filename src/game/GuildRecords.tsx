import { ScrollText, Trophy, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useGame } from "./store";
import { fmt } from "./ui";
import { guildTotalRanks, guildLedger, GUILD_SKILLS, guildSkillRank } from "./guild-tower";

export interface MemberHero { name: string; level: number; power: number }

/**
 * Hall of Records — the guild's book: who founded it, who carries it, what its members have
 * given, and the personal ledger of the hero reading it.
 */
export function GuildRecords({ guild, members, memberHeroes, heroId }: {
  guild: Tables<"guilds">;
  members: Tables<"guild_members">[];
  memberHeroes: Record<string, MemberHero>;
  heroId?: string | null;
}) {
  const { hero } = useGame();
  const roster = members
    .map((m) => ({ ...m, hero: memberHeroes[m.hero_id] }))
    .sort((a, b) => (b.hero?.power ?? 0) - (a.hero?.power ?? 0));
  const known = roster.filter((m) => m.hero);
  const totalPower = known.reduce((sum, m) => sum + (m.hero?.power ?? 0), 0);
  const avgLevel = known.length ? known.reduce((sum, m) => sum + (m.hero?.level ?? 0), 0) / known.length : 0;
  const officers = members.filter((m) => m.role !== "member").length;
  const founded = new Date(guild.created_at);
  const ageDays = Math.max(0, Math.floor((Date.now() - founded.getTime()) / 86_400_000));
  const book = hero ? guildLedger(hero) : null;
  const ranks = hero ? guildTotalRanks(hero) : 0;
  const mySpot = roster.findIndex((m) => m.hero_id === heroId) + 1;

  return <div className="mt-5">
    <div className="slot mb-4 p-4">
      <div className="mb-2 flex items-center gap-2 font-display text-lg text-gold"><ScrollText className="h-4 w-4" />Guild Records</div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="slot p-2"><span className="block text-muted-foreground">Founded</span><b>{founded.toLocaleDateString()}</b><span className="block text-muted-foreground">{ageDays} days ago</span></div>
        <div className="slot p-2"><span className="block text-muted-foreground">Members</span><b>{members.length}/30</b><span className="block text-muted-foreground">{officers} officers & leader</span></div>
        <div className="slot p-2"><span className="block text-muted-foreground">Combined power</span><b>{fmt(totalPower)}</b><span className="block text-muted-foreground">Avg level {avgLevel ? avgLevel.toFixed(1) : "—"}</span></div>
        <div className="slot p-2"><span className="block text-muted-foreground">Your rank</span><b>{mySpot || "—"}</b><span className="block text-muted-foreground">{ranks} tower ranks</span></div>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="slot p-4">
        <div className="mb-2 flex items-center gap-2 font-display text-lg text-gold"><Trophy className="h-4 w-4" />Might of the guild</div>
        <p className="mb-2 text-xs text-muted-foreground">Every member, strongest first. Power is what the hero last reported to the hall.</p>
        {roster.map((m, i) => <div key={m.hero_id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">{i + 1}</span>
            <span className="truncate">{m.hero?.name ?? "Member"}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.role}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">Lv {m.hero?.level ?? "—"} · {m.hero ? fmt(m.hero.power) : "—"} power</span>
        </div>)}
      </div>

      <div className="slot p-4">
        <div className="mb-2 flex items-center gap-2 font-display text-lg text-gold"><Users className="h-4 w-4" />Your ledger</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="slot p-2"><span className="block text-muted-foreground">Gold donated</span><b className="text-gold">{fmt(book?.donated ?? 0)}</b></div>
          <div className="slot p-2"><span className="block text-muted-foreground">Coins spent</span><b className="text-gold">{fmt(book?.spent ?? 0)}</b></div>
          <div className="slot p-2"><span className="block text-muted-foreground">Coins on hand</span><b className="text-gold">{fmt(hero?.guildCoins ?? 0)}</b></div>
          <div className="slot p-2"><span className="block text-muted-foreground">Tower ranks</span><b className="text-gold">{fmt(ranks)}</b></div>
        </div>
        <h5 className="mt-3 font-display text-sm text-gold">Tower breakdown</h5>
        <div className="mt-1 max-h-56 overflow-y-auto pr-1">
          {GUILD_SKILLS.map((s) => <div key={s.id} className="flex justify-between gap-2 border-b border-border py-1 text-xs">
            <span className="truncate">{s.name}</span><span className="shrink-0 text-muted-foreground">rank {hero ? guildSkillRank(hero, s.id) : 0}</span>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

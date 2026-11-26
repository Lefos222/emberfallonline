import { tr } from "./i18n";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame, update } from "./store";
import { fmt } from "./ui";
import { STAT_LABEL } from "./crafting";
import { guildRanks } from "./progress";
import {
  GUILD_RELICS,
  nextRelic, relicUnlocked,
  RELIC_MAX_ATTUNE, attuneCost, attuneRelic, relicLevel, relicPower,
} from "./guild-tower";

/**
 * Reliquary — the guild's heirlooms, woken by giving to the guild.
 *
 * Each rank of guild standing is 5,000 gold donated (see guildRanks in progress.ts); the relics
 * wake on their own as that rank climbs, and guild coins attune the ones already woken.
 */
export function GuildReliquary() {
  const { hero } = useGame();
  if (!hero) return null;
  const total = guildRanks(hero);
  const woken = GUILD_RELICS.filter((r) => relicUnlocked(hero, r)).length;
  const next = nextRelic(hero);
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Crown className="h-4 w-4" />{tr("Reliquary")}</span>
        <span className="text-sm">{woken}/{GUILD_RELICS.length}  {tr("relics woken ·")} {fmt(total)}  {tr("guild ranks")}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {tr("Every relic on these shelves was earned by giving to the guild. Each rank is 5,000 gold donated — climb the ranks and the next heirloom wakes on its own, adding its bonus to every fight.")}{" "}
        {tr("Spend guild coins to attune a woken relic: each attunement adds half its bonus again, up to five times.")}
      </p>
      {next && (
        <p className="mt-1 text-xs">
          {tr("Next relic:")} <b className="text-gold">{next.name}</b> {tr("at")} {next.ranks} {tr("ranks")}
        </p>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {GUILD_RELICS.map((relic) => {
          const open = relicUnlocked(hero, relic);
          const text = (Object.entries(relic.bonus) as [keyof typeof STAT_LABEL, number][])
            .map(([k, v]) => `+${Math.round(v * relicPower(hero, relic.id) * 10) / 10}${STAT_LABEL[k]}`).join(", ");
          const lvl = relicLevel(hero, relic.id);
          const cost = attuneCost(relic, lvl);
          return <div key={relic.id} className={`slot p-2 text-sm ${open ? "border-gold" : "opacity-70"}`}>
            <div className="flex items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 font-bold"><Sparkles className={`h-3.5 w-3.5 ${open ? "text-gold" : "text-muted-foreground"}`} />{relic.name}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{open ? tr("Woken") : `${relic.ranks} ranks`}</span>
            </div>
            <p className="text-xs text-muted-foreground">{relic.desc}</p>
            <p className={`mt-1 text-xs ${open ? "text-gold" : ""}`}>{text}</p>
            {open && <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{tr("Attunement")} {lvl}/{RELIC_MAX_ATTUNE}</span>
              {lvl < RELIC_MAX_ATTUNE ? (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={(hero.guildCoins ?? 0) < cost}
                  onClick={() => update((h) => { attuneRelic(h, relic.id); })}>
                  {tr("Attune")} · {fmt(cost)} {tr("guild coins")}
                </Button>
              ) : <span className="text-xs text-gold">{tr("Fully attuned")}</span>}
            </div>}
            {!open && <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-muted">
              <div className="h-full bg-gold" style={{ width: `${Math.min(100, Math.round((total / relic.ranks) * 100))}%` }} />
            </div>}
          </div>;
        })}
      </div>
    </div>
  );
}

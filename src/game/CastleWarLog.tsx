import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { fmt } from "./ui";
import { loadWarLog, type WarEvent } from "./worldcastles";

/** The assaults fought over a lord's own castle, from either side. */
export function CastleWarLog({ heroId, refreshKey }: { heroId: string | null; refreshKey: number }) {
  const [events, setEvents] = useState<WarEvent[] | null>(null);

  useEffect(() => {
    if (!heroId) return undefined;
    let live = true;
    loadWarLog(heroId)
      .then((list) => { if (live) setEvents(list.slice(0, 6)); })
      .catch(() => { if (live) setEvents([]); });
    return () => { live = false; };
  }, [heroId, refreshKey]);

  if (!heroId || !events) return null;

  return (
    <div className="game-panel p-3">
      <div className="flex items-center gap-2 font-display text-sm text-gold">
        <ScrollText className="h-4 w-4" />War log
      </div>
      {events.length === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">No assaults have been fought over your castle yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {events.map((e) => {
            const mine = e.attacker_id === heroId;
            const won = mine ? !e.defender_won : e.defender_won;
            const foe = mine ? e.defender : e.attacker;
            const when = new Date(e.at).toLocaleDateString([], { month: "short", day: "numeric" });
            return (
              <li key={e.id} className="text-xs">
                <span className={`font-display ${won ? "text-r1" : "text-hp"}`}>{won ? "Won" : "Lost"}</span>{" "}
                <span className="text-muted-foreground">
                  {mine ? `your assault on ${foe}` : `${foe}'s assault on your castle`} ·{" "}
                  {e.gold === 0 ? "no gold changed hands" : `${won ? "+" : "−"}${fmt(Math.abs(e.gold))} gold`} · {when}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
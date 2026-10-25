import { Lock, Trophy } from "lucide-react";
import type { Hero } from "./data";
import { BARRACKS_MAX, BARRACKS_UNLOCKS, barracksCost, barracksLevel, trainingDiscount, upgradeBarracks } from "./barracks";
import { update } from "./store";
import { Gold } from "./ui";

/** Barracks upgrade card: level, cost and everything that unlocks on the way to level 30. */
export function BarracksUpgrade({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  const maxed = level >= BARRACKS_MAX;
  const cost = barracksCost(level);
  const discount = Math.round(trainingDiscount(hero) * 100);
  return (
    <div className="slot mb-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg text-gold"><Trophy className="mr-1 inline h-4 w-4" />Barracks level {level} / {BARRACKS_MAX}</div>
          <div className="text-xs text-muted-foreground">Training costs {discount}% less gold. Bigger batches and instructor grades unlock as it levels up.</div>
        </div>
        <button className="btn-gold px-4 py-2" disabled={maxed || hero.gold < cost} onClick={() => update((h) => { upgradeBarracks(h); })}>
          {maxed ? "Fully upgraded" : <>Upgrade level {level + 1} <Gold n={cost} className="text-primary-foreground" /></>}
        </button>
      </div>
      <div className="bar-track mt-3 h-2"><div className="bar-xp h-full" style={{ width: Math.round((level / BARRACKS_MAX) * 100) + "%" }} /></div>
      <div className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {BARRACKS_UNLOCKS.map((u) => (
          <div key={u.level} className={"flex items-start gap-2 " + (level >= u.level ? "" : "opacity-50")}>
            {level >= u.level ? <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> : <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            <span><b>Lv {u.level} · {u.name}</b><span className="block text-muted-foreground">{u.desc}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

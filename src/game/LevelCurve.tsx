import { EASY_FIGHTS, LATE_LEVEL, fightsToLevel, fightsToNextLevel, xpPerFight, xpToNext, type Hero } from "./data";
import { fmt } from "./ui";

/**
 * The level bill, spelled out: how far the hero is, how many fights the level still costs and
 * what the next few levels ask for: ten fights a level below 20, then a smooth climb with no wall.
 */
export function LevelProgress({ hero, rows = 0 }: { hero: Hero; rows?: number }) {
  const need = xpToNext(hero);
  const pct = Math.min(100, (hero.xp / Math.max(1, need)) * 100);
  const left = fightsToNextLevel(hero);
  return (
    <div className="slot space-y-2 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-display text-gold">
          Level {hero.level}
          {hero.paragon > 0 && <span className="ml-1 text-xs text-foreground/80">Ascension {hero.paragon}</span>}
        </span>
        <span className="text-muted-foreground">{fmt(hero.xp)} / {fmt(need)} XP</span>
      </div>
      <div className="bar-track h-2.5">
        <div className="bar-xp h-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span><b className="text-foreground">{left}</b> more fight{left === 1 ? "" : "s"} to level {hero.level + 1}</span>
        <span>{fmt(xpPerFight(hero.level))} XP a fight</span>
        <span>this level costs {fmt(fightsToLevel(hero.level))} fights</span>
      </div>
      {rows > 0 && <LevelLadder level={hero.level} rows={rows} />}
    </div>
  );
}

/** The next few levels and their fight bills, so the grind ahead is never a surprise. */
function LevelLadder({ level, rows }: { level: number; rows: number }) {
  const list = Array.from({ length: rows }, (_, i) => level + i);
  return (
    <div className="pt-1">
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-5">
        {list.map((lv) => (
          <div key={lv} className={`rounded border px-2 py-1 text-center text-xs ${lv >= LATE_LEVEL ? "border-gold/60 bg-gold/10" : "border-border"}`}>
            <div className="font-display font-bold text-gold">Level {lv + 1}</div>
            <div className="text-foreground">{fmt(fightsToLevel(lv))} fights</div>
            <div className="text-muted-foreground">{fmt(xpToNext({ level: lv, paragon: 0 }))} XP</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Levels 1–{LATE_LEVEL - 1} cost {EASY_FIGHTS} fights each. From level {LATE_LEVEL} the bill climbs gently — {fmt(fightsToLevel(20))} fights at 20, {fmt(fightsToLevel(50))} at 50, {fmt(fightsToLevel(80))} at 80 — so every level is a session's work and none of them is a wall.
      </p>
    </div>
  );
}

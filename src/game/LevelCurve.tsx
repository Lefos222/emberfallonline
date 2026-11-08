import { AWAKENING_LEVEL, EASY_FIGHTS, GRIND_FIGHTS, LATE_LEVEL, fightsToLevel, fightsToNextLevel, xpPerFight, xpToNext, type Hero } from "./data";
import { fmt } from "./ui";

/**
 * The level bill, spelled out: how far the hero is, how many fights the level still costs and
 * what the next few levels ask for. Five fights a level up to 20, twenty-six more each level after
 * it, then a compounding bill from level 30 (see fightsToLevel).
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
        Levels 1–{LATE_LEVEL - 1} cost {EASY_FIGHTS} fights each; from level {LATE_LEVEL} every level asks for {GRIND_FIGHTS} fights more than the one before it, and from level {AWAKENING_LEVEL} the bill grows by 10% every level — the deep grind that keeps you coming back.
      </p>
    </div>
  );
}

import { t } from "./i18n";
import { BATTLES_PER_LEVEL, fightsToLevel, fightsToNextLevel, type Hero } from "./data";
import { fmt } from "./ui";

/**
 * The level bill, spelled out: how far the hero is, how many fights the level still costs and
 * what the next few levels ask for: eleven fights a level below 20, then a smooth climb with no wall.
 */
export function LevelProgress({ hero, rows = 0 }: { hero: Hero; rows?: number }) {
  const fought = Math.min(BATTLES_PER_LEVEL, Math.max(0, hero.levelBattles ?? 0));
  const pct = (fought / BATTLES_PER_LEVEL) * 100;
  const left = fightsToNextLevel(hero);
  return (
    <div className="slot space-y-2 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-display text-gold">
           {t("Level")} {hero.level}
          {hero.paragon > 0 && <span className="ml-1 text-xs text-foreground/80">{t("Ascension")} {hero.paragon}</span>}
        </span>
        <span className="text-muted-foreground">{fought} / {BATTLES_PER_LEVEL}  {t("fights")}</span>
      </div>
      <div className="bar-track h-2.5">
        <div className="bar-xp h-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span><b className="text-foreground">{left}</b>  {t("more fight")}{left === 1 ? "" : "s"}  {t("to level")} {hero.level + 1}</span>
        <span>{t("this level costs")} {fmt(fightsToLevel(hero.level))}  {t("fights")}</span>
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
          <div key={lv} className="rounded border border-border px-2 py-1 text-center text-xs">
            <div className="font-display font-bold text-gold">{t("Level")} {lv + 1}</div>
            <div className="text-foreground">{fmt(fightsToLevel(lv))}  {t("fights")}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
         {t("this level costs")} {fightsToLevel(1)}  {t("fights")} </p>
    </div>
  );
}

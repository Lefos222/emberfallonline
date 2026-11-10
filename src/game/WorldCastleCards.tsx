import { useCallback, useEffect, useState } from "react";
import { t } from "./i18n";
import castleArt from "@/assets/world-castle.png";
import { CLASSES, type HeroClass } from "./data";
import { update, useGame } from "./store";
import type { StartBattle } from "./panels";
import { Gold, fmt } from "./ui";
import { waitLabel } from "./farm";
import type { WorldBanner } from "./worldcastles";
import {
  FORT_MAX,
  PLAYER_RAIDS_PER_DAY,
  fortCost,
  fortLevel,
  fortStatMult,
  loadCastleLog,
  loadDefender,
  raidPlunder,
  raidsUsedToday,
  rebuildWait,
  reportCastleRaid,
  upgradeFort,
  type CastleRaidLog,
} from "./castle-raids";

export { castleArt };

const asClass = (c: string): HeroClass => (c in CLASSES ? (c as HeroClass) : "warrior");

function useRaidLog(heroId: string | null) {
  const [log, setLog] = useState<CastleRaidLog[]>([]);
  const reload = useCallback(() => {
    if (!heroId) return;
    loadCastleLog(heroId).then(setLog).catch(() => setLog([]));
  }, [heroId]);
  useEffect(reload, [reload]);
  return { log, reload };
}

/** Raid card for another lord's castle. */
export function PlayerCastleRaid({ banner, start, hasCastle }: { banner: WorldBanner; start: StartBattle; hasCastle: boolean }) {
  const { heroId } = useGame();
  const { log, reload } = useRaidLog(heroId);
  const [msg, setMsg] = useState("");
  const [fort, setFort] = useState<number | null>(null);
  useEffect(() => {
    loadDefender(banner.heroId).then((d) => setFort(d?.fort ?? 0));
  }, [banner.heroId]);
  if (!heroId) return null;
  const left = PLAYER_RAIDS_PER_DAY - raidsUsedToday(log, heroId);
  const wait = rebuildWait(log, heroId, banner.heroId);
  const own = banner.heroId === heroId;

  const raid = async () => {
    setMsg("");
    const d = await loadDefender(banner.heroId);
    if (!d) return setMsg(t("That castle no longer stands"));
    const cls = asClass(d.hero_class);
    const m = fortStatMult(d.fort);
    const s = d.stats;
    start({
      title: `${t("Castle raid")} · ${d.name}`,
      auto: true,
      right: {
        name: d.name, img: CLASSES[cls].img, gender: d.gender === "female" ? "female" : "male",
        hp: Math.round(s.hp * m), atk: Math.round(s.atk * m), def: Math.round(s.def * m), crit: s.crit,
        dodge: s.dodge ?? 5, critDmg: s.critDmg ?? 200, pen: s.pen ?? 0, acc: s.acc ?? 0,
        level: d.level + (s.paragon ?? 0), cls, mirror: true,
      },
      onResult: async (won) => {
        try {
          const r = await reportCastleRaid(d.id, won);
          reload();
          return { lines: won ? [t("The gates fall!"), `+${fmt(r.gold)} gold`] : [t("The castle holds. Its lord laughs from the walls.")] };
        } catch (e) {
          reload();
          return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
        }
      },
    });
  };

  if (own) return <p className="mt-2 text-xs text-muted-foreground">{t("Your castle")}</p>;
  return (
    <div className="mt-2 space-y-1.5 text-xs">
      <p>
        {t("Walls")} <b className="text-gold">{fort ?? "…"}/{FORT_MAX}</b> · {t("Plunder")} <Gold n={raidPlunder(banner.level, fort ?? 0)} />
      </p>
      <button
        className="btn-gold w-full py-1.5"
        disabled={!hasCastle || left <= 0 || wait > 0}
        onClick={() => void raid()}
      >
        {!hasCastle
          ? t("Plant your own banner before raiding")
          : wait > 0
            ? `${t("Rebuilding walls")} · ${waitLabel(wait)}`
            : `${t("Raid castle ·")} ${left}/${PLAYER_RAIDS_PER_DAY} ${t("left today")}`}
      </button>
      <p className="text-[10px] text-muted-foreground">{t("Defenders lose nothing — plunder comes from the realm. Each castle can be raided once every 8 hours.")}</p>
      {msg && <p className="text-hp">{msg}</p>}
    </div>
  );
}

/** Your own castle: walls, defence log and raid history. */
export function MyCastleCard({ onClose }: { onClose: () => void }) {
  const { hero, heroId } = useGame();
  const { log } = useRaidLog(heroId);
  const [msg, setMsg] = useState("");
  if (!hero || !heroId) return null;
  const f = fortLevel(hero);
  const cost = f < FORT_MAX ? fortCost(f, hero.level) : 0;
  const up = () => {
    let err: string | null = null;
    update((h) => { err = upgradeFort(h); });
    setMsg(err ?? t("The walls rise higher."));
  };
  return (
    <div className="game-panel absolute right-3 top-14 z-30 w-[min(92vw,22rem)] p-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3">
        <img src={castleArt} alt="" width={512} height={512} className="h-16 w-16 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("Your castle")}</p>
          <h3 className="truncate font-display text-lg text-gold">{hero.name}</h3>
          <p className="text-xs">{t("Walls")} <b className="text-gold">{f}/{FORT_MAX}</b> · +{Math.round((fortStatMult(f) - 1) * 100)}% {t("defence")}</p>
        </div>
        <button className="btn-ghost h-7 w-7" aria-label={t("Close")} onClick={onClose}>×</button>
      </div>
      {f < FORT_MAX && (
        <button className="btn-gold mt-2 w-full py-1.5 text-sm" disabled={hero.gold < cost} onClick={up}>
          {t("Raise walls")} · <Gold n={cost} className="text-primary-foreground" />
        </button>
      )}
      {msg && <p className="mt-1 text-xs text-gold">{msg}</p>}
      <p className="mt-2 font-display text-sm text-gold">{t("Raid log")}</p>
      {log.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("No raids yet.")}</p>
      ) : (
        <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-xs">
          {log.map((r) => {
            const mine = r.attacker_id === heroId;
            return (
              <li key={r.id} className="slot flex justify-between gap-2 px-2 py-1">
                <span className="truncate">
                  {mine ? `⚔ ${r.defender_name}` : `🛡 ${r.attacker_name}`}
                </span>
                <b className={(mine ? r.won : !r.won) ? "text-r1" : "text-hp"}>
                  {mine ? (r.won ? `+${fmt(r.gold)}` : t("Repelled")) : r.won ? t("Breached") : t("Held")}
                </b>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

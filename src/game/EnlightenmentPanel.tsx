import essenceIcon from "@/assets/currency-essence.png";
import shardIcon from "@/assets/currency-soul-shard.png";
import { t } from "./i18n";
import { Sparkles, Lock } from "lucide-react";
import type { Hero } from "./data";
import { update } from "./store";
import { fmt, Gold } from "./ui";
import {
  ENLIGHTENMENT_LEVEL, ENLIGHTENMENT_MAX, battleEssence, battleEssenceGain, buyEnlightenment,
  enlightenmentCost, enlightenmentLevel, enlightenmentUnlocked,
  SOUL_INFUSIONS, SOUL_SHARD_BOSS_CHANCE, SOUL_SHARD_CHANCE, soulBlocker, soulCost, soulRank, soulShards, buySoulInfusion,
} from "./enlightenment";

/** Battle Essence badge — the purple-tinted currency of the Enlightenment track. */
export function EssenceBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-[#a78bfa]" title={t("Battle Essence — earned from battles after level 20")}>
      <img src={essenceIcon} alt="" width={128} height={128} className="h-5 w-5 object-contain" />
      {fmt(n)}
    </span>
  );
}

/** Soul Shard badge — the shimmering fragments of fallen foes. */
export function ShardBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-[#67e8f9]" title={t("Soul Shards — chance drops from battles, spent on permanent infusions")}>
      <img src={shardIcon} alt="" width={128} height={128} className="h-5 w-5 object-contain" />
      {fmt(n)}
    </span>
  );
}

/**
 * Enlightenment: the post-20 permanent stat track. Each level grants +1% to attack,
 * defense and health. Fed by Battle Essence from every won fight, the cost grows
 * exponentially so the deep levels are a real grind that rewards daily play.
 */
export function EnlightenmentTraining({ hero }: { hero: Hero }) {
  if (!enlightenmentUnlocked(hero)) {
    return (
      <div className="mt-6">
        <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold">
          <Sparkles className="h-4 w-4" />{t("Enlightenment")} </div>
        <div className="slot flex items-center gap-3 p-4 opacity-60">
          <Lock className="h-5 w-5" />
          <div>
            <div className="font-display">{t("Unlocks at level")} {ENLIGHTENMENT_LEVEL}</div>
            <div className="text-xs text-muted-foreground">
               {t("A permanent stat track beyond the campaign: each level grants +1% to attack, defense and health, fed by Battle Essence from every battle you win.")} </div>
          </div>
        </div>
      </div>
    );
  }

  const lv = enlightenmentLevel(hero);
  const ess = battleEssence(hero);
  const cost = enlightenmentCost(lv);
  const maxed = lv >= ENLIGHTENMENT_MAX;

  return (
    <div className="mt-6">
      <div className="mb-1 flex flex-wrap items-center gap-2 font-display text-sm text-gold">
        <EssenceBadge n={ess} />
        <span>{t("Enlightenment")}</span>
        <span className="text-xs font-normal text-muted-foreground">{t("· +1% attack, defense & health per level ·")} {ENLIGHTENMENT_MAX}  {t("levels")}</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
         {t("Every won battle banks Battle Essence. Spend it here for permanent stat growth — the cost rises each level, so the deep levels are a long grind that keeps daily play worthwhile. Bosses pay extra essence.")} </p>
      <div className="slot p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-2xl text-[#a78bfa]">{t("Level")} {lv}</div>
            <div className="text-xs text-muted-foreground">
              +{lv}{t("% attack · +")}{lv}{t("% defense · +")}{lv}{t("% health")}{lv > 0 ? ` · +${(lv * 0.2).toFixed(1)}% crit` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t("Next battle earns")}</div>
            <div className="font-bold text-[#a78bfa]">+{battleEssenceGain(hero.level + hero.paragon, false)}  {t("essence")}</div>
          </div>
        </div>
        <div className="bar-track mt-3 h-2.5">
          <div className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${Math.min(100, (ess / Math.max(1, cost)) * 100)}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{fmt(ess)} / {fmt(cost)}  {t("essence")}</span>
          <span>{t("Level")} {lv + (maxed ? 0 : 1)}  {t("costs")} {fmt(cost)}  {t("essence")}</span>
        </div>
        <button
          className="btn-gold mt-3 w-full py-2.5 text-lg"
          disabled={maxed || ess < cost}
          onClick={() => update((h) => { const err = buyEnlightenment(h); if (err) return; })}
        >
          {maxed ? t("Maximum Enlightenment") : <>{t("Advance to level")} {lv + 1} · <EssenceBadge n={cost} /></>}
        </button>
      </div>
    </div>
  );
}

/**
 * The Soul Forge: spend Soul Shards — chance-based drops from battles — on permanent stat
 * infusions. Each rank is a small but permanent step that never resets. Bosses drop shards
 * more often and in larger stacks.
 */
export function SoulForge({ hero }: { hero: Hero }) {
  const shards = soulShards(hero);
  return (
    <div className="mt-6">
      <div className="mb-1 flex flex-wrap items-center gap-2 font-display text-sm text-gold">
        <ShardBadge n={shards} />
        <span>{t("Soul Forge")}</span>
        <span className="text-xs font-normal text-muted-foreground">
          · {Math.round(SOUL_SHARD_CHANCE * 100)}{t("% drop chance (bosses")} {Math.round(SOUL_SHARD_BOSS_CHANCE * 100)}%)
        </span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
         {t("Fallen foes sometimes leave Soul Shards. Infuse them here for permanent stat bonuses that never reset — every rank is a small step toward a much stronger hero.")} </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SOUL_INFUSIONS.map((inf) => {
          const rank = soulRank(hero, inf.id);
          const cost = soulCost(rank);
          const blocked = soulBlocker(hero, inf.id);
          const maxed = rank >= inf.max;
          return (
            <div key={inf.id} className="slot p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm text-[#67e8f9]">{inf.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{t("Rank")} {rank}/{inf.max}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{inf.desc}</div>
              <div className="mt-1 text-xs">
                 {t("Now")} <b className="text-[#67e8f9]">+{(inf.per * rank).toFixed(1)}</b>
                {!maxed && <>  {t("· next")} <b>+{inf.per}</b></>}
              </div>
              <button
                className="btn-gold mt-2 w-full py-1.5 text-sm"
                disabled={!!blocked}
                title={blocked ?? `Infuse rank ${rank + 1}`}
                onClick={() => update((h) => { buySoulInfusion(h, inf.id); })}
              >
                {maxed ? t("Maxed") : <>{t("Infuse rank")} {rank + 1} · <ShardBadge n={cost} /></>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

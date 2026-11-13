import { tName , t} from "./i18n";
import { warDropKind, dungeonDrops, bossCrystals, capDropBundle, DUNGEON_DROP_CHANCE } from "./war-drops";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { scrollXp } from "./scrolls";
import { Crown, Lock, Skull, Sparkles, Trophy } from "lucide-react";
import { Swords } from "./PaintedIcons";
import { foeRating, invCap, heroStats, makeItem, RARITIES, type Item } from "./data";
import { update, useGame } from "./store";
import { GameTabs, Gold, Panel, fmt } from "./ui";
import { DangerPill, Meter, StaminaMeter, VERDICT_STYLE } from "./GateUI";
import { forecastFight } from "./battle-advice";
import { prepareFoe } from "./foe-scaling";
import { Sprite } from "./Sprite";
import type { StartBattle } from "./panels";
import { TIER_BOSSES } from "./world";
import { addMats, MATS, type Mat } from "./crafting";
import { DUNGEON_RUNS_PER_DAY, DUNGEON_STAMINA, staminaLeft } from "./stamina";
import {
  BOSS_ORDER, ENDGAME_LEVEL, MAX_DIFFICULTY, WEEKLY_GOAL, WEEKLY_REWARD, addWeeklyKill, bossUnlocked, canClaimWeekly, challengeFoe, challengeRewards,
  cleared, currentWeekly, eliteFoe, weekIndex, weeklyModifier,
} from "./endgame";

type DungeonTab = "bosses" | "elite" | "expeditions" | "relics" | "weekly";

export function Challenges({ onClose, start, onExpeditions, onRelics }: { onClose: () => void; start: StartBattle; onExpeditions?:()=>void; onRelics?:()=>void }) {
  const { hero } = useGame();
  const [diff, setDiff] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<DungeonTab>("bosses");
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  const mod = weeklyModifier(weekIndex());
  const weekly = currentWeekly(hero);
  const stats = heroStats(hero);
  const power = stats.power;
  const stamina = staminaLeft(hero);

  if (hero.level < ENDGAME_LEVEL) {
    return (
      <Panel title={t("Dungeon Gate")} subtitle={t("Boss challenges, elite hunts, expeditions and relics")} art="star" onClose={onClose} wide>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center gap-2 font-display text-gold"><Swords className="h-4 w-4" />{t("Material expeditions")}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t("Crates of forge materials from held-out sites — the steadiest way to feed the Forge while you level.")}</p>
            {onExpeditions && <Button className="mt-auto w-full" onClick={onExpeditions}>{t("Open expeditions")}</Button>}
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center gap-2 font-display text-gold"><Sparkles className="h-4 w-4" />{t("Relic Trials")}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t("Fight your class's relic ranks for the Emberforged, Starweave and Verdant collections.")}</p>
            {onRelics && <Button className="mt-auto w-full" variant="outline" onClick={onRelics}>{t("Open relic trials")}</Button>}
          </div>
        </div>
        <div className="slot mt-3 p-6 text-center">
          <Lock className="mx-auto mb-2 h-10 w-10 text-gold" />
          <p className="font-display text-xl text-gold">{t("Boss challenges open at level")} {ENDGAME_LEVEL}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
             {t("You are level")} {hero.level} — {ENDGAME_LEVEL - hero.level}  {t("more to go. Keep clearing the Campaign Gate, then come back for boss difficulties, elite hunts and the weekly objective.")} </p>
          <div className="mx-auto mt-3 max-w-sm">
            <Meter value={hero.level} max={ENDGAME_LEVEL} label={`Level ${hero.level} of ${ENDGAME_LEVEL}`} />
            <div className="mt-1 text-[11px] text-muted-foreground">{t("Level")} {hero.level} / {ENDGAME_LEVEL}</div>
          </div>
        </div>
      </Panel>
    );
  }

  const fightBoss = (i: number) => {
    const id = BOSS_ORDER[i];
    const d = Math.min(diff[id] ?? cleared(hero, id) + 1, Math.min(MAX_DIFFICULTY, cleared(hero, id) + 1));
    const foe = challengeFoe(id, d, mod);
    const rw = challengeRewards(id, d, mod);
    start({
      title: `Boss Challenge · ${tName(TIER_BOSSES[id].name)} · Difficulty ${d}`,
      right: foe,
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The boss stands victorious. Grow stronger."] };
        const { grant, addLoot, makeDrop, cappedRarity } = await import("./logic");
        let lines: string[] = []; let loot: Item | null = null;
        update((h) => {
          const { levels } = grant(h, scrollXp(rw.xp, xpMultiplier), rw.gold);
          h.challenges = { ...(h.challenges ?? {}), [id]: Math.max(cleared(h, id), d) };
          const drops = dungeonDrops();
          const materials = drops && warDropKind() === "materials";
          if (materials && rw.bossCore) addMats(h, { bossCore: rw.bossCore });
          // Higher-armour crystals: Frost from every boss, Void from deeper ranks, Sun rarely from the deepest.
          const cry = bossCrystals(d) as Partial<Record<Mat, number>>;
          if(materials) addMats(h, cry);
          addWeeklyKill(h);
          if(drops && !materials) {
          loot = makeDrop(h.cls, h.level + Math.floor(h.paragon / 2) + d * 2, cappedRarity(rw.minRarity, h.level));
          loot.name = `${TIER_BOSSES[id].name.split(",")[0]}'s ${loot.name.split(" ").slice(1).join(" ")}`;
          const full = h.inventory.length >= invCap(h); addLoot(h, loot); if (full) lines.push("Bag full — gear placed in your Overflow Chest (Armory)");
          }
          lines = [...lines, `+${fmt(scrollXp(rw.xp, xpMultiplier))} XP`, `+${fmt(rw.gold)} gold`, ...(materials && rw.bossCore ? [`+${rw.bossCore} Boss Core`] : []), ...(materials ? Object.entries(cry).map(([k, n]) => `+${n} ${MATS[k as Mat].name}`) : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        return { lines, loot };
      },
    });
  };

  const fightElite = () => {
    const foe = eliteFoe(lvl);
    start({
      title: `Elite Hunt · ${foe.name}`,
      right: foe,
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The elite escaped…"] };
        const { grant, rollLoot, addLoot } = await import("./logic");
        let lines: string[] = []; let loot: Item | null = null;
        update((h) => {
          const { levels } = grant(h, scrollXp(lvl * 60, xpMultiplier), lvl * 12);
          const drops = dungeonDrops();
          const materials = drops && warDropKind() === "materials";
          loot = drops && !materials ? rollLoot(h, lvl + 5, 1, 1) : null;
          if (loot) addLoot(h, loot);
          const bundle = capDropBundle({ essence: 2, wyrmBone: 1 + Math.floor(lvl / 40) });
          if(materials) addMats(h, bundle);
          lines = [`+${fmt(scrollXp(lvl * 60, xpMultiplier))} XP`, `+${fmt(lvl * 12)} gold`, ...(materials ? [`+${bundle.essence ?? 0} Soul Essence`, `+${bundle.wyrmBone ?? 0} Wyrm Bone`] : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        return { lines, loot };
      },
    });
  };

  const claimWeekly = () => update((h) => {
    if (!canClaimWeekly(h)) return;
    h.weekly = { ...currentWeekly(h), claimed: true };
    h.gold += WEEKLY_REWARD.gold;
    addMats(h, { starshard: WEEKLY_REWARD.starshard, bossCore: WEEKLY_REWARD.bossCore });
  });

  const elite = eliteFoe(lvl);
  const shownElite = prepareFoe(elite, hero);
  const eliteDanger = VERDICT_STYLE[forecastFight(stats, shownElite).verdict];
  const defeated = BOSS_ORDER.filter((id) => cleared(hero, id) > 0).length;

  return (
    <Panel title={t("Dungeon Gate")} subtitle={t("Boss challenges, elite hunts, expeditions and relics")} art="star" onClose={onClose} wide>
      {/* The gate's status strip: one line each for stamina, the bosses down and this week's twist. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <StaminaMeter hero={hero} cost={DUNGEON_STAMINA} unit="run" compact />
        <span className="slot px-2.5 py-1.5">
           {t("Bosses")} <b className="text-gold">{defeated}</b> / {BOSS_ORDER.length}
          <span className="text-muted-foreground">  {t("· up to D")}{MAX_DIFFICULTY}</span>
        </span>
        <span className="slot px-2.5 py-1.5" title={mod.desc}>
          {mod.name} <b className="text-r1">{t("rewards ×")}{mod.reward}</b>
        </span>
      </div>

      <GameTabs label={t("Dungeon Gate")} value={tab} onChange={setTab} tabs={[
        { id: "bosses", name: "Boss challenges" },
        { id: "elite", name: "Elite hunt" },
        { id: "expeditions", name: "Expeditions" },
        { id: "relics", name: "Relic trials" },
        { id: "weekly", name: "Weekly", badge: canClaimWeekly(hero) ? 1 : 0 },
      ]} />

      {tab === "bosses" && (
        <div className="grid gap-2 md:grid-cols-2">
          {BOSS_ORDER.map((id, i) => {
            const unlocked = bossUnlocked(hero, i);
            const c = cleared(hero, id);
            const max = Math.min(MAX_DIFFICULTY, c + 1);
            const d = Math.min(diff[id] ?? max, max);
            const foe = challengeFoe(id, d, mod);
            const danger = VERDICT_STYLE[forecastFight(stats, prepareFoe(foe, hero)).verdict];
            const rw = challengeRewards(id, d, mod);
            const previous = i > 0 ? TIER_BOSSES[BOSS_ORDER[i - 1]]?.name : null;
            return (
              <div key={id} className={`slot flex items-center gap-2 p-2 ${unlocked ? "" : "opacity-70"}`}>
                <div className="relative shrink-0">
                  <Sprite rect={TIER_BOSSES[id].sprite} className="h-14 w-14" />
                  {!unlocked && (
                    <span className="absolute inset-0 flex items-center justify-center rounded bg-background/60">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="truncate font-display text-sm">{tName(TIER_BOSSES[id].name)}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {c ? <>{t("Best D")}{c}{c >= MAX_DIFFICULTY && <Crown className="ml-0.5 inline h-3 w-3 text-gold" />}</> : t("New")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1" role="group" aria-label={`${tName(TIER_BOSSES[id].name)} difficulty`}>
                    {Array.from({ length: max }, (_, k) => k + 1).map((k) => (
                      <button key={k} className={`px-1.5 py-0.5 text-[11px] ${d === k ? "btn-gold" : "btn-ghost"}`}
                        aria-pressed={d === k} onClick={() => setDiff({ ...diff, [id]: k })}>D{k}</button>
                    ))}
                    {Array.from({ length: MAX_DIFFICULTY - max }, (_, k) => max + k + 1).map((k) => (
                      <span key={k} className="px-1 py-0.5 text-[11px] text-muted-foreground/50" title={`Clear D${k - 1} to open this difficulty`}>D{k}</span>
                    ))}
                    <span className={`ml-1 text-[10px] font-bold ${danger.c}`}>{danger.t}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                    <Gold n={rw.gold} />
                    <span className="text-xp">{fmt(rw.xp)}  {t("XP")}</span>
                    {rw.bossCore ? <span>{rw.bossCore}{t("× core")}</span> : null}
                    <span className="text-r2">{RARITIES[rw.minRarity].name}{t("+ gear")}</span>
                    <span>{DUNGEON_STAMINA}  {t("stamina ·")} {fmt(foe.hp)}  {t("HP")}</span>
                  </div>
                </div>
                <button className="btn-blood shrink-0 px-2 py-2 text-xs" disabled={!unlocked}
                  title={unlocked ? `Challenge at difficulty ${d}` : previous ? `Defeat ${previous} first` : "Defeat the previous boss first"}
                  onClick={() => fightBoss(i)}>
                  {unlocked
                    ? <><Skull className="mr-1 inline h-3.5 w-3.5" />D{d}</>
                    : <><Lock className="mr-1 inline h-3.5 w-3.5" />{t("Locked")}</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "elite" && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="slot flex items-center justify-center gap-3 p-3 text-center">
            <Sprite rect={elite.sprite} className="h-20 w-20 shrink-0" />
            <div className="min-w-0">
              <div className="font-display text-lg leading-tight">{elite.name}</div>
              <div className="text-xs text-muted-foreground">{t("Level")} {shownElite.level} · {fmt(foeRating(shownElite))}  {t("power")}</div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <DangerPill danger={eliteDanger} />
                <span className="text-[11px] text-muted-foreground">{t("you")} {fmt(power)}</span>
              </div>
            </div>
          </div>
          <div className="slot flex flex-col p-3 text-sm">
            <p className="text-xs text-muted-foreground">
               {t("An elite scaled to your level — the best repeatable source of Soul Essence, but only half of your wins pay a bundle.")} {DUNGEON_STAMINA}  {t("stamina per run, win or lose.")} </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-xp">{fmt(lvl * 60)}  {t("XP")}</span>
              <Gold n={lvl * 12} />
              <span className="text-muted-foreground">{t("Drop chance")} {Math.round(DUNGEON_DROP_CHANCE * 100)}%</span>
              <span>{t("+2 Soul Essence")}</span>
              <span className="text-r2">{t("Uncommon+ loot")}</span>
            </div>
            <div className="mt-auto pt-2">
              <Button className="w-full py-2" disabled={stamina < DUNGEON_STAMINA} onClick={fightElite}
                title={stamina < DUNGEON_STAMINA ? "Out of stamina — it refills at Greek midnight" : "Hunt"}>
                <Swords className="mr-1 inline h-4 w-4" />{t("Hunt ·")} {DUNGEON_STAMINA}  {t("stamina")} </Button>
              {stamina < DUNGEON_STAMINA && <p className="mt-2 text-center text-xs text-hp">{t("No stamina left — drink a potion from the HUD or wait for the reset.")}</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "expeditions" && (
        <div className="slot flex flex-wrap items-center gap-3 p-3 text-sm">
          <Swords className="h-8 w-8 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-gold">{t("Material expeditions")}</div>
            <p className="text-xs text-muted-foreground">
               {t("A crate of forge materials — ore, essence, starshards, fragments, sigils and boss cores — but only half your wins pay it.")} {DUNGEON_STAMINA}  {t("stamina, win or lose. Deeper sites open as you level.")} </p>
          </div>
          {onExpeditions
            ? <Button className="shrink-0" onClick={onExpeditions}><Swords className="mr-1 inline h-4 w-4" />{t("Open expeditions")}</Button>
            : <p className="shrink-0 text-xs text-muted-foreground">{t("Open Expeditions from the castle.")}</p>}
        </div>
      )}

      {tab === "relics" && (
        <div className="slot flex flex-wrap items-center gap-3 p-3 text-sm">
          <Sparkles className="h-8 w-8 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-gold">{t("Relic Trials")}</div>
            <p className="text-xs text-muted-foreground">
               {t("The only source of the Emberforged, Starweave and Verdant collections. Every win recovers a piece, and each piece levels with you —")} {DUNGEON_STAMINA}  {t("stamina per run.")} </p>
          </div>
          {onRelics
            ? <Button className="shrink-0" onClick={onRelics}><Sparkles className="mr-1 inline h-4 w-4" />{t("Open relic trials")}</Button>
            : <p className="shrink-0 text-xs text-muted-foreground">{t("Open Relic Trials from the castle.")}</p>}
        </div>
      )}

      {tab === "weekly" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="slot p-4 text-sm">
            <div className="font-display text-gold">{t("This week's modifier")}</div>
            <div className="mt-1 text-lg">{mod.name}</div>
            <p className="text-xs text-muted-foreground">{mod.desc}</p>
            <p className="mt-2 text-xs text-r1">{t("All boss and elite rewards ×")}{mod.reward}  {t("this week.")}</p>
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-gold">{t("Weekly objective")}</div>
              <Trophy className="h-4 w-4 text-r4" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("Defeat")} {WEEKLY_GOAL}  {t("challenge bosses this week · resets Monday 00:00 UTC.")}</p>
            <Meter value={Math.min(weekly.kills, WEEKLY_GOAL)} max={WEEKLY_GOAL} label={t("Weekly objective")} className="mt-2" />
            <div className="mt-1 text-xs">{Math.min(weekly.kills, WEEKLY_GOAL)} / {WEEKLY_GOAL}  {t("bosses defeated")}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Gold n={WEEKLY_REWARD.gold} />
              <span>{WEEKLY_REWARD.starshard}  {t("Starshards")}</span>
              <span>{WEEKLY_REWARD.bossCore}  {t("Boss Cores")}</span>
            </div>
            <Button className="mt-auto w-full" disabled={!canClaimWeekly(hero)} onClick={claimWeekly}>
              {weekly.claimed ? t("Reward claimed") : canClaimWeekly(hero) ? t("Claim weekly reward") : `Defeat ${WEEKLY_GOAL - weekly.kills} more`}
            </Button>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        {DUNGEON_RUNS_PER_DAY}  {t("runs a day at full stamina · every run spends its stamina on entry, win or lose.")} </p>
    </Panel>
  );
}

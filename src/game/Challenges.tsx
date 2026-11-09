import { useState } from "react";
import { Button } from '@/components/ui/button';
import { scrollXp } from "./scrolls";
import { Crown, Lock, Skull, Sparkles, Swords, Trophy } from "lucide-react";
import { foeRating, invCap, heroStats, makeItem, type Item } from "./data";
import { update, useGame } from "./store";
import { GameTabs, Gold, Panel, fmt } from "./ui";
import { DangerPill, Meter, RewardChip, StaminaMeter } from "./GateUI";
import { Sprite } from "./Sprite";
import type { StartBattle } from "./panels";
import { TIER_BOSSES } from "./world";
import { addMats } from "./crafting";
import { DUNGEON_RUNS_PER_DAY, DUNGEON_STAMINA, staminaLeft } from "./stamina";
import {
  BOSS_ORDER, ENDGAME_LEVEL, MAX_DIFFICULTY, WEEKLY_GOAL, WEEKLY_REWARD, addWeeklyKill, bossUnlocked, canClaimWeekly, challengeFoe, challengeRewards,
  cleared, currentWeekly, eliteFoe, weekIndex, weeklyModifier,
} from "./endgame";

type DungeonTab = "bosses" | "elite" | "expeditions" | "relics" | "weekly";

/** A small colour-coded verdict on how the chosen fight compares to the hero. */
function dangerOf(power: number, foePower: number) {
  const ratio = power / Math.max(1, foePower);
  if (ratio > 1.15) return { t: "Fair fight", c: "text-r1" };
  if (ratio > 0.9) return { t: "Hard", c: "text-r4" };
  if (ratio > 0.7) return { t: "Very hard", c: "text-hp" };
  return { t: "Deadly", c: "text-blood" };
}

export function Challenges({ onClose, start, onExpeditions, onRelics }: { onClose: () => void; start: StartBattle; onExpeditions?:()=>void; onRelics?:()=>void }) {
  const { hero } = useGame();
  const [diff, setDiff] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<DungeonTab>("bosses");
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  const mod = weeklyModifier(weekIndex());
  const weekly = currentWeekly(hero);
  const power = heroStats(hero).power;
  const stamina = staminaLeft(hero);

  if (hero.level < ENDGAME_LEVEL) {
    return (
      <Panel title="Dungeon Gate" subtitle="Boss challenges, elite hunts, expeditions and relics" art="star" onClose={onClose} wide>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center gap-2 font-display text-gold"><Swords className="h-4 w-4" />Material expeditions</div>
            <p className="mt-1 text-xs text-muted-foreground">Crates of forge materials from held-out sites — the steadiest way to feed the Forge while you level.</p>
            {onExpeditions && <Button className="mt-auto w-full" onClick={onExpeditions}>Open expeditions</Button>}
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center gap-2 font-display text-gold"><Sparkles className="h-4 w-4" />Relic Trials</div>
            <p className="mt-1 text-xs text-muted-foreground">Fight your class's relic ranks for the Emberforged, Starweave and Verdant collections.</p>
            {onRelics && <Button className="mt-auto w-full" variant="outline" onClick={onRelics}>Open relic trials</Button>}
          </div>
        </div>
        <div className="slot mt-3 p-6 text-center">
          <Lock className="mx-auto mb-2 h-10 w-10 text-gold" />
          <p className="font-display text-xl text-gold">Boss challenges open at level {ENDGAME_LEVEL}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            You are level {hero.level} — {ENDGAME_LEVEL - hero.level} more to go. Keep clearing the Campaign Gate,
            then come back for boss difficulties, elite hunts and the weekly objective.
          </p>
          <div className="mx-auto mt-3 max-w-sm">
            <Meter value={hero.level} max={ENDGAME_LEVEL} label={`Level ${hero.level} of ${ENDGAME_LEVEL}`} />
            <div className="mt-1 text-[11px] text-muted-foreground">Level {hero.level} / {ENDGAME_LEVEL}</div>
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
      title: `Boss Challenge · ${TIER_BOSSES[id].name} · Difficulty ${d}`,
      right: foe,
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The boss stands victorious. Grow stronger."] };
        const { grant, addLoot, makeDrop, cappedRarity } = await import("./logic");
        let lines: string[] = []; let loot: Item | null = null;
        update((h) => {
          const { levels } = grant(h, scrollXp(rw.xp, xpMultiplier), rw.gold);
          h.challenges = { ...(h.challenges ?? {}), [id]: Math.max(cleared(h, id), d) };
          if (rw.bossCore) addMats(h, { bossCore: rw.bossCore });
          addWeeklyKill(h);
          loot = makeDrop(h.cls, h.level + Math.floor(h.paragon / 2) + d * 2, cappedRarity(rw.minRarity, h.level));
          loot.name = `${TIER_BOSSES[id].name.split(",")[0]}'s ${loot.name.split(" ").slice(1).join(" ")}`;
          const full = h.inventory.length >= invCap(h); addLoot(h, loot); if (full) lines.push("Bag full — gear placed in your Overflow Chest (Armory)");
          lines = [...lines, `+${fmt(scrollXp(rw.xp, xpMultiplier))} XP`, `+${fmt(rw.gold)} gold`, ...(rw.bossCore ? [`+${rw.bossCore} Boss Core`] : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
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
          loot = rollLoot(h, lvl + 5, 0.8, 2);
          if (loot) addLoot(h, loot);
          addMats(h, { essence: 2 });
          lines = [`+${fmt(scrollXp(lvl * 60, xpMultiplier))} XP`, `+${fmt(lvl * 12)} gold`, "+2 Soul Essence", ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
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
  const eliteDanger = dangerOf(power, foeRating(elite));
  const defeated = BOSS_ORDER.filter((id) => cleared(hero, id) > 0).length;

  return (
    <Panel title="Dungeon Gate" subtitle="Boss challenges, elite hunts, expeditions and relics" art="star" onClose={onClose} wide>
      {/* The gate's status strip: what a run costs, how the hero stands and this week's twist. */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StaminaMeter hero={hero} cost={DUNGEON_STAMINA} unit="run" />
        <div className="slot p-3 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-gold">Boss challenges</span>
            <span className="text-[11px] text-muted-foreground">{defeated} / {BOSS_ORDER.length} down</span>
          </div>
          <div className="text-2xl font-bold">{defeated}<span className="text-sm text-muted-foreground"> / {BOSS_ORDER.length}</span></div>
          <Meter value={defeated} max={BOSS_ORDER.length} fill="bar-hp" label="Bosses defeated" className="mt-1.5" />
          <div className="mt-1 text-[11px] text-muted-foreground">Each boss unlocks the next · difficulties climb to D{MAX_DIFFICULTY}</div>
        </div>
        <div className="slot p-3 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-gold">{mod.name}</span>
            <span className="text-[11px] font-bold text-r1">×{mod.reward}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{mod.desc}</p>
          <p className="mt-1 text-[11px] text-r1">Boss and elite rewards ×{mod.reward} this week</p>
        </div>
      </div>

      <GameTabs label="Dungeon Gate" value={tab} onChange={setTab} tabs={[
        { id: "bosses", name: "Boss challenges" },
        { id: "elite", name: "Elite hunt" },
        { id: "expeditions", name: "Expeditions" },
        { id: "relics", name: "Relic trials" },
        { id: "weekly", name: "Weekly", badge: canClaimWeekly(hero) ? 1 : 0 },
      ]} />

      {tab === "bosses" && (
        <div className="grid gap-3 md:grid-cols-2">
          {BOSS_ORDER.map((id, i) => {
            const unlocked = bossUnlocked(hero, i);
            const c = cleared(hero, id);
            const max = Math.min(MAX_DIFFICULTY, c + 1);
            const d = Math.min(diff[id] ?? max, max);
            const foe = challengeFoe(id, d, mod);
            const danger = dangerOf(power, foeRating(foe));
            const rw = challengeRewards(id, d, mod);
            const previous = i > 0 ? TIER_BOSSES[BOSS_ORDER[i - 1]]?.name : null;
            return (
              <div key={id} className={`slot flex flex-col p-3 ${unlocked ? "" : "opacity-75"}`}>
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <Sprite rect={TIER_BOSSES[id].sprite} className="h-24 w-24" />
                    {!unlocked && (
                      <span className="absolute inset-0 flex items-center justify-center rounded bg-background/60">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="font-display text-lg leading-tight">{TIER_BOSSES[id].name}</span>
                      <span className="shrink-0 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-bold">
                        {c ? `Best D${c}` : "Not yet beaten"}
                        {c >= MAX_DIFFICULTY && <Crown className="ml-0.5 inline h-3 w-3 text-gold" />}
                      </span>
                    </div>
                    <Meter value={c} max={MAX_DIFFICULTY} fill="bar-hp" label={`${TIER_BOSSES[id].name} best difficulty`} className="mt-1.5" />
                    <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label={`${TIER_BOSSES[id].name} difficulty`}>
                      {Array.from({ length: max }, (_, k) => k + 1).map((k) => (
                        <button key={k} className={`px-2 py-0.5 text-xs ${d === k ? "btn-gold" : "btn-ghost"}`}
                          aria-pressed={d === k} onClick={() => setDiff({ ...diff, [id]: k })}>D{k}</button>
                      ))}
                      {Array.from({ length: MAX_DIFFICULTY - max }, (_, k) => max + k + 1).map((k) => (
                        <span key={k} className="rounded px-2 py-0.5 text-xs text-muted-foreground/50" title={`Clear D${k - 1} to open this difficulty`}>D{k}</span>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>HP <b className="text-foreground">{fmt(foe.hp)}</b></span>
                      <span>ATK <b className="text-foreground">{fmt(foe.atk)}</b></span>
                      <span>Your power <b className="text-foreground">{fmt(power)}</b></span>
                      <span className={`font-bold ${danger.c}`}>{danger.t}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RewardChip><Gold n={rw.gold} /></RewardChip>
                  <RewardChip tone="text-xp">{fmt(rw.xp)} XP</RewardChip>
                  {rw.bossCore ? <RewardChip>{rw.bossCore}× Boss Core</RewardChip> : null}
                  <RewardChip tone="text-r2">{["", "", "", "Epic", "Legendary", "Mythic"][rw.minRarity] ?? "Rare"}+ gear</RewardChip>
                  <RewardChip>{DUNGEON_STAMINA} stamina</RewardChip>
                </div>
                <button className="btn-blood mt-2 w-full py-1.5" disabled={!unlocked}
                  title={unlocked ? "" : previous ? `Defeat ${previous} first` : "Defeat the previous boss first"}
                  onClick={() => fightBoss(i)}>
                  {unlocked
                    ? <><Skull className="mr-1 inline h-4 w-4" />Challenge at difficulty {d}</>
                    : <><Lock className="mr-1 inline h-4 w-4" />{previous ? `Defeat ${previous.split(",")[0]}` : "Locked"}</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "elite" && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="slot flex flex-col items-center p-4 text-center">
            <Sprite rect={elite.sprite} className="h-32 w-32" />
            <div className="font-display text-lg">{elite.name}</div>
            <div className="text-xs text-muted-foreground">Elite level {elite.level} · {fmt(foeRating(elite))} power</div>
            <div className="mt-2 flex items-center gap-2">
              <DangerPill danger={eliteDanger} />
              <span className="text-[11px] text-muted-foreground">your power {fmt(power)}</span>
            </div>
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-gold">Elite Hunt</span>
              <span className="text-[11px] text-muted-foreground">{Math.floor(stamina / DUNGEON_STAMINA)} runs left today</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              A tough elite scaled to your level. The best repeatable source of Soul Essence, with
              a high chance of rare gear. Costs {DUNGEON_STAMINA} stamina per run, win or lose.
            </p>
            <dl className="mt-3 grid gap-1.5">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Experience</dt><dd className="text-xp">{fmt(lvl * 60)} XP</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Gold</dt><dd><Gold n={lvl * 12} /></dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Materials</dt><dd>+2 Soul Essence</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Loot</dt><dd className="text-r2">High chance, Rare+</dd></div>
            </dl>
            <div className="mt-auto pt-3">
              <Button className="w-full py-2" disabled={stamina < DUNGEON_STAMINA} onClick={fightElite}
                title={stamina < DUNGEON_STAMINA ? "Out of stamina — it refills at Greek midnight" : "Hunt"}>
                <Swords className="mr-1 inline h-4 w-4" />Hunt · {DUNGEON_STAMINA} stamina
              </Button>
              {stamina < DUNGEON_STAMINA && <p className="mt-2 text-center text-xs text-hp">No stamina left — drink a potion from the HUD or wait for the reset.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "expeditions" && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="slot flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Swords className="h-10 w-10 text-gold" />
            <div className="font-display text-lg text-gold">Material expeditions</div>
            <div className="text-[11px] text-muted-foreground">{DUNGEON_STAMINA} stamina per run</div>
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Send the hero to a held-out site for a crate of forge materials — ore, essence,
              starshards, fragments, sigils and boss cores. Every expedition is a
              {' '}{DUNGEON_STAMINA}-stamina Dungeon Gate run and opens as the hero levels.
            </p>
            <dl className="mt-3 grid gap-1.5 text-xs">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Pays</dt><dd>Forge materials by the crate</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Costs</dt><dd>{DUNGEON_STAMINA} stamina, win or lose</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Opens</dt><dd>Level 1+ · deeper sites with your level</dd></div>
            </dl>
            <div className="mt-auto pt-3">
              {onExpeditions
                ? <Button className="w-full" onClick={onExpeditions}><Swords className="mr-1 inline h-4 w-4" />Open expeditions</Button>
                : <p className="text-xs text-muted-foreground">Close this panel and open Expeditions from the castle.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "relics" && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="slot flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Sparkles className="h-10 w-10 text-gold" />
            <div className="font-display text-lg text-gold">Relic Trials</div>
            <div className="text-[11px] text-muted-foreground">{DUNGEON_STAMINA} stamina per run</div>
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Fight your class's relic ranks for the only source of the Emberforged, Starweave and
              Verdant collections. Every win recovers a piece, and each piece levels with you.
              A trial is a {DUNGEON_STAMINA}-stamina Dungeon Gate run.
            </p>
            <dl className="mt-3 grid gap-1.5 text-xs">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Pays</dt><dd>One relic piece per win</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Costs</dt><dd>{DUNGEON_STAMINA} stamina, win or lose</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Opens</dt><dd>Rank by rank · each piece levels with you</dd></div>
            </dl>
            <div className="mt-auto pt-3">
              {onRelics
                ? <Button className="w-full" onClick={onRelics}><Sparkles className="mr-1 inline h-4 w-4" />Open relic trials</Button>
                : <p className="text-xs text-muted-foreground">Close this panel and open Relic Trials from the castle.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "weekly" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="slot p-4 text-sm">
            <div className="font-display text-gold">This week's modifier</div>
            <div className="mt-1 text-lg">{mod.name}</div>
            <p className="text-xs text-muted-foreground">{mod.desc}</p>
            <p className="mt-2 text-xs text-r1">All boss and elite rewards ×{mod.reward} this week.</p>
          </div>
          <div className="slot flex flex-col p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-gold">Weekly objective</div>
              <Trophy className="h-4 w-4 text-r4" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Defeat {WEEKLY_GOAL} challenge bosses this week · resets Monday 00:00 UTC.</p>
            <Meter value={Math.min(weekly.kills, WEEKLY_GOAL)} max={WEEKLY_GOAL} label="Weekly objective" className="mt-2" />
            <div className="mt-1 text-xs">{Math.min(weekly.kills, WEEKLY_GOAL)} / {WEEKLY_GOAL} bosses defeated</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Gold n={WEEKLY_REWARD.gold} />
              <span>{WEEKLY_REWARD.starshard} Starshards</span>
              <span>{WEEKLY_REWARD.bossCore} Boss Cores</span>
            </div>
            <Button className="mt-auto w-full" disabled={!canClaimWeekly(hero)} onClick={claimWeekly}>
              {weekly.claimed ? "Reward claimed" : canClaimWeekly(hero) ? "Claim weekly reward" : `Defeat ${WEEKLY_GOAL - weekly.kills} more`}
            </Button>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        {DUNGEON_RUNS_PER_DAY} runs a day at full stamina · every run spends its stamina on entry, win or lose.
      </p>
    </Panel>
  );
}

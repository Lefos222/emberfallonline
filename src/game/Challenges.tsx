import { useState } from "react";
import { Button } from '@/components/ui/button';
import { scrollXp } from "./scrolls";
import { Crown, Lock, Skull, Swords } from "lucide-react";
import { invCap, heroStats, makeItem, type Item } from "./data";
import { update, useGame } from "./store";
import { Gold, Panel, fmt } from "./ui";
import { Sprite } from "./Sprite";
import type { StartBattle } from "./panels";
import { TIER_BOSSES } from "./world";
import { addMats } from "./crafting";
import {
  BOSS_ORDER, ENDGAME_LEVEL, MAX_DIFFICULTY, WEEKLY_GOAL, WEEKLY_REWARD, addWeeklyKill, bossUnlocked, canClaimWeekly, challengeFoe, challengeRewards,
  cleared, currentWeekly, eliteFoe, weekIndex, weeklyModifier,
} from "./endgame";

export function Challenges({ onClose, start, onExpeditions }: { onClose: () => void; start: StartBattle; onExpeditions?:()=>void }) {
  const { hero } = useGame();
  const [diff, setDiff] = useState<Record<string, number>>({});
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  const mod = weeklyModifier(weekIndex());
  const weekly = currentWeekly(hero);
  const power = heroStats(hero).power;

  if (hero.level < ENDGAME_LEVEL) {
    return (
      <Panel title="Dungeon Gate" onClose={onClose}>
        {onExpeditions&&<Button className="w-full" onClick={onExpeditions}><Swords/>Material expeditions · Level 1+</Button>}
        <div className="py-10 text-center"><Lock className="mx-auto mb-2 h-10 w-10 text-gold" />
          <p className="font-display text-xl text-gold">Locked</p>
          <p className="text-muted-foreground">Boss challenges open at level {ENDGAME_LEVEL}. You are level {hero.level}.</p></div>
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
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The boss stands victorious. Grow stronger."] };
        const { grant, addLoot, makeDrop } = await import("./logic");
        let lines: string[] = []; let loot: Item | null = null;
        update((h) => {
          const { levels } = grant(h, scrollXp(rw.xp, xpMultiplier), rw.gold);
          h.challenges = { ...(h.challenges ?? {}), [id]: Math.max(cleared(h, id), d) };
          if (rw.bossCore) addMats(h, { bossCore: rw.bossCore });
          addWeeklyKill(h);
          loot = makeDrop(h.cls, h.level + Math.floor(h.paragon / 2) + d * 2, rw.minRarity);
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
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The elite escaped…"] };
        const { grant, rollLoot, addLoot } = await import("./logic");
        let lines: string[] = []; let loot: Item | null = null;
        update((h) => {
          const { levels } = grant(h, scrollXp(lvl * 60, xpMultiplier), lvl * 40);
          loot = rollLoot(h, lvl + 5, 0.8, 2);
          if (loot) addLoot(h, loot);
          addMats(h, { essence: 2 });
          lines = [`+${fmt(scrollXp(lvl * 60, xpMultiplier))} XP`, `+${fmt(lvl * 40)} gold`, "+2 Soul Essence", ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
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

  return (
    <Panel title="Dungeon Gate · Challenges" onClose={onClose} wide>
      {onExpeditions&&<Button className="mb-4 w-full" onClick={onExpeditions}><Swords/>Material expeditions</Button>}
      <div className="mb-4 grid gap-2 md:grid-cols-2">
        <div className="slot p-3 text-sm">
          <div className="font-display text-gold">This week's modifier: {mod.name}</div>
          <div className="text-muted-foreground">{mod.desc} · rewards ×{mod.reward}</div>
        </div>
        <div className="slot flex items-center justify-between gap-2 p-3 text-sm">
          <div>
            <div className="font-display text-gold">Weekly objective</div>
            <div className="text-muted-foreground">Defeat {WEEKLY_GOAL} challenge bosses: {Math.min(weekly.kills, WEEKLY_GOAL)}/{WEEKLY_GOAL}</div>
            <div className="text-xs"><Gold n={WEEKLY_REWARD.gold} /> + {WEEKLY_REWARD.starshard} Starshards + {WEEKLY_REWARD.bossCore} Boss Cores · resets Monday 00:00 UTC</div>
          </div>
          <button className="btn-gold px-3 py-1.5" disabled={!canClaimWeekly(hero)} onClick={claimWeekly}>{weekly.claimed ? "Claimed" : "Claim"}</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {BOSS_ORDER.map((id, i) => {
          const unlocked = bossUnlocked(hero, i);
          const c = cleared(hero, id);
          const max = Math.min(MAX_DIFFICULTY, c + 1);
          const d = Math.min(diff[id] ?? max, max);
          const foe = challengeFoe(id, d, mod);
          const ratio = power / Math.max(1, foe.atk * 2 + foe.def * 1.5 + foe.hp * 0.2);
          const rw = challengeRewards(id, d, mod);
          return (
            <div key={id} className={`slot p-3 ${unlocked ? "" : "opacity-60"}`}>
              <div className="flex gap-3">
                <Sprite rect={TIER_BOSSES[id].sprite} className="h-24 w-24 shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="font-display text-lg">{TIER_BOSSES[id].name}</div>
                  <div className="text-xs text-muted-foreground">Best clear: {c ? `Difficulty ${c}` : "none"}{c >= MAX_DIFFICULTY && <Crown className="ml-1 inline h-3 w-3 text-gold" />}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Array.from({ length: max }, (_, k) => k + 1).map((k) => (
                      <button key={k} className={`px-2 py-0.5 text-xs ${d === k ? "btn-gold" : "btn-ghost"}`} onClick={() => setDiff({ ...diff, [id]: k })}>D{k}</button>
                    ))}
                  </div>
                  <div className="mt-1 text-xs">HP {fmt(foe.hp)} · ATK {fmt(foe.atk)} · <span className={ratio > 1.1 ? "text-r1" : ratio > 0.8 ? "text-r4" : "text-blood"}>{ratio > 1.1 ? "Fair" : ratio > 0.8 ? "Hard" : "Deadly"}</span></div>
                  <div className="text-xs text-muted-foreground"><Gold n={rw.gold} /> · {fmt(rw.xp)} XP{rw.bossCore ? ` · ${rw.bossCore} Boss Core` : ""} · {["", "", "", "Epic", "Legendary", "Mythic"][rw.minRarity]}+ gear</div>
                </div>
              </div>
              <button className="btn-blood mt-2 w-full py-1.5" disabled={!unlocked} title={unlocked ? "" : "Defeat the previous boss first"} onClick={() => fightBoss(i)}>
                {unlocked ? <><Skull className="mr-1 inline h-4 w-4" />Challenge D{d}</> : <><Lock className="mr-1 inline h-4 w-4" />Defeat the previous boss</>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="slot mt-4 flex items-center justify-between gap-2 p-3 text-sm">
        <div><div className="font-display text-gold">Elite Hunt</div><div className="text-muted-foreground">Tough elite monsters at your level. High loot chance and Soul Essence. Repeatable.</div></div>
        <button className="btn-gold px-4 py-1.5" onClick={fightElite}><Swords className="mr-1 inline h-4 w-4" />Hunt</button>
      </div>
    </Panel>
  );
}

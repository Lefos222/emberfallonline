import { useState } from "react";
import { Check, Gift, Skull } from "lucide-react";
import { ACHIEVEMENTS, ACH_CATEGORIES, SET_BONUSES, achGold, achProgress, activeSets, emptyRecord, isClaimable, type AchCategory } from "./progress";
import { CLASSES, heroSkills, heroStats, powerBreakdown, xpToNext } from "./data";
import { update, useGame } from "./store";
import { GameTabs, Gold, Panel, fmt } from "./ui";
import { LevelProgress } from "./LevelCurve";
import { QUEST_POINT_CHANCE } from "./quest-board";
import { TREES } from "./talents";
import { RenownTraining } from "./RenownPanel";
import { SkillLoadout } from "./SkillLoadout";
import { SkillTreeContent } from "./SkillTree";
import { PassiveTreeContent } from "./PassiveTree";

export function ThroneHall({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<"overview" | "skills" | "passives" | "ach" | "history">("skills");
  const [achCat, setAchCat] = useState<AchCategory | "All">("All");
  if (!hero) return null;
  const s = heroStats(hero);
  const trees = TREES[hero.cls];
  const claimable = ACHIEVEMENTS.filter((a) => isClaimable(hero, a)).length;
  const rec = { ...emptyRecord(), ...(hero.record ?? {}) };
  const claim = (id: string) => update((h) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a || !isClaimable(h, a)) return; // one-time: re-checked against latest save
    h.achClaimed = [...(h.achClaimed ?? []), a.id];
    h.gold += achGold(a);
    // Achievements occasionally pay a bonus skill point alongside their Insight reward.
    if (Math.random() < QUEST_POINT_CHANCE) h.bonusPts = (h.bonusPts ?? 0) + 1;
  });

  return (
    <Panel title="Throne Hall" subtitle="Skill tree, passives, hero training and achievements" art="crown" onClose={onClose} wide>
      <GameTabs label="Throne Hall" value={tab} onChange={setTab} tabs={[
        { id: "skills", name: "Skill Tree" },
        { id: "passives", name: "Passives" },
        { id: "overview", name: "Progression" },
        { id: "ach", name: "Achievements", badge: claimable },
        { id: "history", name: "Battle History" },
      ]} />

      {tab === "ach" ? (
        <div>
          <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label="Achievement categories">
            {(["All", ...ACH_CATEGORIES] as const).map((c) => {
              const n = c === "All" ? ACHIEVEMENTS.length : ACHIEVEMENTS.filter((a) => a.cat === c).length;
              return (
                <button key={c} onClick={() => setAchCat(c)} aria-pressed={achCat === c}
                  className={`btn-ghost px-2 py-0.5 text-xs ${achCat === c ? "ring-1 ring-gold text-gold" : "text-muted-foreground"}`}>
                  {c} <span className="text-[10px]">{n}</span>
                </button>
              );
            })}
          </div>
        <div className="grid gap-2 md:grid-cols-2">
          {ACHIEVEMENTS.filter((a) => achCat === "All" || a.cat === achCat).map((a) => {
            const p = achProgress(hero, a);
            const done = (hero.achClaimed ?? []).includes(a.id);
            return (
              <div key={a.id} className={`slot p-3 ${done ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">{a.name} <span className="text-xs text-muted-foreground">· {a.cat}</span></div>
                    <div className="text-xs text-muted-foreground">{a.desc}: {fmt(p)} / {fmt(a.goal)}</div>
                    <div className="text-xs"><Gold n={achGold(a)} />{a.title && <span className="ml-2 text-gold">Title: {a.title}</span>}</div>
                  </div>
                  {done ? <Check className="h-5 w-5 text-gold" aria-label="Claimed" /> : (
                    <button className="btn-gold flex items-center gap-1 px-3 py-1 text-sm" disabled={!isClaimable(hero, a)} onClick={() => claim(a.id)}
                      title={isClaimable(hero, a) ? "Claim reward" : "Not completed yet"}><Gift className="h-4 w-4" />Claim</button>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-gold" style={{ width: `${(p / a.goal) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
        </div>
      ) : tab === "history" ? (
        <div>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm md:grid-cols-6">
            {[["Battles", rec.battles], ["Wins", rec.wins], ["Losses", rec.losses], ["Bosses", rec.bosses], ["Arena wins", rec.arenaWins], ["Win rate", rec.battles ? `${Math.round((rec.wins / rec.battles) * 100)}%` : "—"]].map(([l, v]) => (
              <div key={l} className="slot p-2"><div className="font-display text-lg text-gold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
            ))}
          </div>
          {(hero.history ?? []).length === 0 && <p className="py-8 text-center text-muted-foreground">No battles yet — head to the Campaign Gate.</p>}
          <div className="space-y-1">
            {(hero.history ?? []).map((e) => (
              <div key={e.t} className="slot flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                <span className={e.won ? "font-bold text-gold" : "font-bold text-blood"}>{e.won ? "Victory" : "Defeat"}</span>
                <span className="flex-1 truncate">{e.boss && <Skull className="mr-1 inline h-4 w-4" />}{e.title}</span>
                <span className="hidden truncate text-xs text-muted-foreground md:block">{e.rewards.join(" · ")}</span>
                <span className="text-xs text-muted-foreground">{new Date(e.t).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "overview" ? (
        <div className="space-y-4">
        <div>
          <div className="mb-1 font-display text-lg text-gold">Level curve</div>
          <LevelProgress hero={hero} rows={5} />
        </div>
        <RenownTraining hero={hero} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <div className="font-display text-2xl">{hero.name}</div>
            <div className="text-muted-foreground">{CLASSES[hero.cls].name} · Level {hero.level}{hero.paragon > 0 && ` · Ascension ${hero.paragon}`}</div>
            <div className="text-sm">XP {fmt(hero.xp)} / {fmt(xpToNext(hero))}</div>
            <div className="text-sm">Campaign stage {hero.stage} · Conquest {hero.spire} · Wins {hero.wins}</div>
            <div className="text-sm">Specialization: {trees.find((t) => t.id === hero.spec)?.name ?? "none"}</div>
            <div className="pt-2 font-display text-gold">Battle Rating {fmt(s.power)}</div>
            {powerBreakdown(hero).map((p) => <div key={p.label} className="flex justify-between text-sm"><span>{p.label}</span><span>{fmt(p.power)}</span></div>)}
          </div>
          <div>
            <div className="mb-2 font-display">Gear set bonuses</div>
            {activeSets(hero.equipment).filter((x) => x.count >= 2).length === 0 && <p className="mb-3 text-sm text-muted-foreground">Equip 2+ pieces from the same family (e.g. two "Bloodforged" items) to activate bonuses.</p>}
            {activeSets(hero.equipment).filter((x) => x.count >= 2).map((x) => (
              <div key={x.name} className="slot mb-1 px-3 py-1.5 text-sm">
                <b>{x.name}</b> ({x.count}/6): {SET_BONUSES.map((b) => <span key={b.pieces} className={x.count >= b.pieces ? "text-gold" : "text-muted-foreground"}> {b.pieces}pc {b.label};</span>)}
              </div>
            ))}
            <div className="mb-2 mt-4 font-display">Abilities</div>
            {heroSkills(hero).map((k) => (
              <div key={k.id} className="slot mb-1 px-3 py-1.5 text-sm">
                <b>{k.name}</b> — {Math.round(k.mult * (k.hits ?? 1) * 100)}% dmg{k.hits ? ` (${k.hits} hits)` : ""}, cooldown {k.cd}
                {k.heal ? `, heals ${Math.round(k.heal * 100)}%` : ""}{k.stun ? ", stuns" : ""}{k.crit ? ", always crits" : ""}
              </div>
            ))}
          </div>
        </div>
        </div>
      ) : tab === "passives" ? (
        <PassiveTreeContent />
      ) : (
        <>
          <SkillLoadout />
          <SkillTreeContent />
        </>
      )}
    </Panel>
  );
}

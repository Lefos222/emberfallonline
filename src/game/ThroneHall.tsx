import { useState } from "react";
import { Check, Gift, Lock, RotateCcw, Skull, Star } from "lucide-react";
import { ACHIEVEMENTS, SET_BONUSES, achProgress, activeSets, emptyRecord, isClaimable } from "./progress";
import { CLASSES, heroSkills, heroStats, powerBreakdown, xpToNext } from "./data";
import { update, useGame } from "./store";
import { Gold, Panel, fmt } from "./ui";
import { SPEC_LEVEL, TIER_REQ, TREES, freePoints, learnBlocker, resetCost, spentIn, totalPoints } from "./talents";

export function ThroneHall({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<"overview" | "skills" | "ach" | "history">("skills");
  const [confirmReset, setConfirmReset] = useState(false);
  if (!hero) return null;
  const s = heroStats(hero);
  const free = freePoints(hero);
  const trees = TREES[hero.cls];
  const claimable = ACHIEVEMENTS.filter((a) => isClaimable(hero, a)).length;
  const rec = { ...emptyRecord(), ...(hero.record ?? {}) };
  const claim = (id: string) => update((h) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a || !isClaimable(h, a)) return; // one-time: re-checked against latest save
    h.achClaimed = [...(h.achClaimed ?? []), a.id];
    h.gold += a.gold;
  });

  const learn = (id: string) => update((h) => {
    if (learnBlocker(h, id)) return; // re-validated against the latest state
    h.talents = { ...(h.talents ?? {}), [id]: (h.talents?.[id] ?? 0) + 1 };
  });
  const chooseSpec = (id: string) => update((h) => { if (h.level >= SPEC_LEVEL && !h.spec) h.spec = id; });
  const reset = () => update((h) => {
    const cost = resetCost(h);
    if (h.gold < cost || (spentIn(h) === 0 && !h.spec)) return;
    h.gold -= cost; h.talents = {}; h.spec = undefined;
  });

  return (
    <Panel title="Throne Hall" onClose={onClose} wide>
      <div className="mb-4 flex gap-2">
        <button className={tab === "skills" ? "btn-gold px-4 py-1.5" : "btn-ghost px-4 py-1.5"} onClick={() => setTab("skills")}>Skill Tree</button>
        <button className={tab === "overview" ? "btn-gold px-4 py-1.5" : "btn-ghost px-4 py-1.5"} onClick={() => setTab("overview")}>Progression</button>
        <button className={`relative ${tab === "ach" ? "btn-gold px-4 py-1.5" : "btn-ghost px-4 py-1.5"}`} onClick={() => setTab("ach")}>
          Achievements{claimable > 0 && <span className="ml-1 rounded-full bg-blood px-1.5 text-xs">{claimable}</span>}
        </button>
        <button className={tab === "history" ? "btn-gold px-4 py-1.5" : "btn-ghost px-4 py-1.5"} onClick={() => setTab("history")}>Battle History</button>
      </div>

      {tab === "ach" ? (
        <div className="grid gap-2 md:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const p = achProgress(hero, a);
            const done = (hero.achClaimed ?? []).includes(a.id);
            return (
              <div key={a.id} className={`slot p-3 ${done ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">{a.name} <span className="text-xs text-muted-foreground">· {a.cat}</span></div>
                    <div className="text-xs text-muted-foreground">{a.desc}: {fmt(p)} / {fmt(a.goal)}</div>
                    <div className="text-xs"><Gold n={a.gold} />{a.title && <span className="ml-2 text-gold">Title: {a.title}</span>}</div>
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
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-display text-lg">Skill points: <span className="text-gold">{free}</span> / {totalPoints(hero)}</div>
            {!confirmReset ? (
              <button className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm" disabled={spentIn(hero) === 0 && !hero.spec} onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" /> Reset tree
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                Reset all skills and specialization for <Gold n={resetCost(hero)} />?
                <button className="btn-gold px-3 py-1" disabled={hero.gold < resetCost(hero)} onClick={() => { reset(); setConfirmReset(false); }}>Confirm</button>
                <button className="btn-ghost px-3 py-1" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            )}
          </div>
          {hero.level >= SPEC_LEVEL && !hero.spec && (
            <p className="mb-3 text-sm text-gold">Choose a specialization to unlock its tier 3 ability and capstone. You can change it later with a reset.</p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {trees.map((spec) => {
              const spent = spentIn(hero, spec.id);
              const mine = hero.spec === spec.id;
              return (
                <div key={spec.id} className={`slot p-3 ${mine ? "ring-2 ring-gold spec-mine" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-lg">{spec.name}{mine && <Star className="ml-1 inline h-4 w-4 text-gold" />}</div>
                      <div className="text-xs text-muted-foreground">{spec.blurb} · {spent} pts</div>
                    </div>
                    {!hero.spec && (
                      <button className="btn-ghost px-2 py-1 text-xs" disabled={hero.level < SPEC_LEVEL} title={hero.level < SPEC_LEVEL ? `Requires level ${SPEC_LEVEL}` : `Specialize in ${spec.name}`}
                        onClick={() => chooseSpec(spec.id)}>{hero.level < SPEC_LEVEL ? `Lv ${SPEC_LEVEL}` : "Specialize"}</button>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {spec.talents.map((t, i) => {
                      const rank = hero.talents?.[t.id] ?? 0;
                      const block = learnBlocker(hero, t.id);
                      const prevRank = i > 0 ? hero.talents?.[spec.talents[i - 1].id] ?? 0 : 1;
                      return (
                        <div key={t.id}>
                          {i > 0 && <div className={`talent-link ${prevRank > 0 ? "talent-link-on" : ""}`} aria-hidden="true" />}
                          <button disabled={!!block} onClick={() => learn(t.id)} title={block ?? `Learn rank ${rank + 1} (${t.cost} pt)`}
                            className={`talent-node w-full rounded border border-border p-2 text-left ${rank > 0 ? "talent-filled bg-primary/15" : ""} ${block ? "opacity-70" : "hover:border-gold"}`}>
                            <span key={rank} className={rank > 0 ? "talent-burst" : "hidden"} aria-hidden="true" />
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold">{t.ability ? "◆ " : ""}{t.name}</span>
                              <span className="flex items-center gap-1" aria-label={`${rank} of ${t.max} ranks learned`}>
                                {Array.from({ length: t.max }, (_, p) => <i key={p} className={`talent-pip ${p < rank ? "talent-pip-on" : ""}`} />)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">{t.desc}</div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                              Tier {t.tier}{TIER_REQ[t.tier] ? ` · needs ${TIER_REQ[t.tier]} pts here` : ""} · {t.cost} pt/rank
                              {block && block !== "Maxed" && <span className="ml-1 text-blood"><Lock className="inline h-3 w-3" /> {block}</span>}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}

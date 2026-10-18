import { useState } from "react";
import { CLASSES } from "./data";
import { update, useGame } from "./store";
import { Panel, fmt } from "./ui";
import { PASSIVES, PASSIVE_TIER_REQ, insightBank, learnPassive, passiveBlocker, passiveRank, spentInsight, totalInsight, type PassiveFx } from "./passives";

const labels: Record<keyof PassiveFx, string> = { hpPct: "max HP", atkPct: "attack", defPct: "defense", crit: "critical chance", dodge: "dodge", critDmg: "critical damage", pen: "penetration", heal: "Healing Power", block: "Block", acc: "accuracy" };
const effects = (fx: PassiveFx, rank: number) => (Object.keys(fx) as (keyof PassiveFx)[]).map(k => `+${Number(((fx[k] ?? 0) * rank).toFixed(2))}% ${labels[k]}`).join(" · ");

export function PassiveTree({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [selected, setSelected] = useState("field_medicine");
  const [hovered, setHovered] = useState<string | null>(null);
  if (!hero) return null;
  const detail = PASSIVES.find(p => p.id === (hovered ?? selected)) ?? PASSIVES[0];
  const rank = passiveRank(hero, detail.id);
  const reason = passiveBlocker(hero, detail.id);
  return (
    <Panel title="Passive Tree" onClose={onClose} wide>
      <div className="mb-4 font-display text-lg">Insight: <span className="text-gold">{fmt(insightBank(hero))}</span><span className="ml-3 text-sm text-muted-foreground">{fmt(spentInsight(hero))} spent · {fmt(totalInsight(hero))} earned</span></div>
      <p className="mb-4 text-sm text-muted-foreground">Earn Insight from victorious campaign stages, elites, bosses, dungeons, endless waves and achievement claims. Ranks are permanent. Block remains capped at 25%; Healing Power at 50%.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {(["general", hero.cls] as const).map(group => (
          <section key={group} className={`slot p-3 ${group === hero.cls ? "spec-mine" : ""}`}>
            <h3 className="font-display text-lg">{group === "general" ? "General" : CLASSES[hero.cls].name} <span className="text-sm text-gold">{spentInsight(hero, group)} Insight spent</span></h3>
            {([1, 2, 3] as const).map(tier => (
              <div key={tier}>
                {tier > 1 && <div className={`talent-link ${spentInsight(hero, group) >= PASSIVE_TIER_REQ[tier] ? "talent-link-on" : ""}`} />}
                <div className="my-2 text-xs text-muted-foreground">Tier {tier} · requires {PASSIVE_TIER_REQ[tier]} Insight spent in this branch</div>
                <div className="grid grid-cols-2 gap-2">
                  {PASSIVES.filter(p => p.group === group && p.tier === tier).map(p => {
                    const r = passiveRank(hero, p.id), blocker = passiveBlocker(hero, p.id);
                    return (
                      <button key={p.id} type="button" aria-pressed={selected === p.id} title={`${p.name}: ${blocker ?? `Learn for ${p.cost} Insight`}`} onClick={() => { setSelected(p.id); setHovered(null); }} onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(p.id)} onBlur={() => setHovered(null)} className={`talent-node slot p-3 text-left ${r ? "talent-filled" : ""} ${blocker ? "opacity-70" : ""} ${selected === p.id ? "ring-2 ring-gold" : ""}`}>
                        {r > 0 && <span key={r} className="talent-burst" />}
                        <span className="block font-bold text-sm">{p.name}</span>
                        <span className="my-1 flex gap-1" aria-label={`${r} of ${p.max} ranks`}>{Array.from({ length: p.max }, (_, i) => <span key={i} className={`talent-pip ${i < r ? "bg-gold" : "bg-muted"}`} />)}</span>
                        <span className="block text-xs">{r}/{p.max} · {p.cost} Insight / rank</span>
                        <span className="block text-xs text-muted-foreground">{blocker ?? "Ready to learn"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className="slot mt-4 p-4" aria-live="polite">
        <h3 className="font-display text-lg text-gold">{detail.name} · {rank}/{detail.max}</h3>
        <p className="text-sm">{detail.desc}</p>
        <p className="mt-2 text-sm">Per rank: {effects(detail.fx, 1)}</p>
        <p className="text-sm">Current total: {effects(detail.fx, rank)}</p>
        {rank < detail.max && <p className="text-sm">Next total: {effects(detail.fx, rank + 1)}</p>}
        <p className="text-xs text-muted-foreground">Tier {detail.tier}: spend {PASSIVE_TIER_REQ[detail.tier]} Insight in {detail.group}.{detail.prereq && ` Requires ${PASSIVES.find(p => p.id === detail.prereq!.id)?.name} rank ${detail.prereq.rank}.`}</p>
        <button type="button" className="btn-gold mt-3 px-4 py-2" disabled={!!reason} title={reason ?? `Spend ${detail.cost} Insight`} onClick={() => { update(h => { const next = learnPassive(h, detail.id); h.passives = next.passives; h.insight = next.insight; }); }}>
          {reason ?? `Learn rank ${rank + 1} · ${detail.cost} Insight`}
        </button>
      </section>
    </Panel>
  );
}

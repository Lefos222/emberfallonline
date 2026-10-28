import { useState, useRef, useMemo } from "react";
import { CLASSES } from "./data";
import { update, useGame } from "./store";
import { fmt } from "./ui";
import { PASSIVES, PASSIVE_TIER_REQ, insightBank, learnPassive, passiveBlocker, passiveRank, spentInsight, totalInsight, type PassiveFx } from "./passives";

const labels: Record<keyof PassiveFx, string> = { hpPct: "Max HP", atkPct: "Attack", defPct: "Defense", crit: "Crit Chance", dodge: "Dodge", critDmg: "Crit Damage", pen: "Penetration", heal: "Healing Power", block: "Block", acc: "Accuracy" };
const effects = (fx: PassiveFx, rank: number) => (Object.keys(fx) as (keyof PassiveFx)[]).map(k => `+${Number(((fx[k] ?? 0) * rank).toFixed(2))}% ${labels[k]}`).join(" · ");

/** Tree positions for each passive node, grouped into two branches. */
interface NodePos { x: number; y: number }
const NODE_R = 28;

// General branch layout (left side)
const GENERAL_POS: Record<string, NodePos> = {
  field_medicine: { x: 100, y: 80 },
  brace: { x: 220, y: 80 },
  trail_sense: { x: 340, y: 80 },
  provisions: { x: 460, y: 80 },
  anatomy: { x: 100, y: 220 },
  footwork: { x: 220, y: 220 },
  watch: { x: 340, y: 220 },
  reserve: { x: 460, y: 220 },
  triage: { x: 100, y: 360 },
  veteran: { x: 340, y: 360 },
};

// Class branch layouts (right side) — same shape for all classes
const CLASS_POS: Record<string, NodePos> = {
  // warrior
  w_staunch: { x: 580, y: 80 }, w_angle: { x: 700, y: 80 },
  w_march: { x: 700, y: 220 }, w_scar: { x: 580, y: 220 },
  w_reprisal: { x: 700, y: 360 }, w_refuge: { x: 580, y: 360 },
  // mage
  m_restorative: { x: 580, y: 80 }, m_geometry: { x: 700, y: 80 },
  m_vessel: { x: 580, y: 220 }, m_sight: { x: 700, y: 220 },
  m_recuperate: { x: 580, y: 360 }, m_refraction: { x: 700, y: 360 },
  // archer
  a_herbal: { x: 580, y: 80 }, a_range: { x: 700, y: 80 },
  a_camp: { x: 580, y: 220 }, a_retreat: { x: 700, y: 220 },
  a_return: { x: 580, y: 360 }, a_gap: { x: 700, y: 360 },
};

const TREE_W = 780;
const TREE_H = 440;

/** Rendered as the Passives tab inside the Throne Hall's skill tree. */
export function PassiveTreeContent() {
  const { hero } = useGame();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!hero) return null;

  const posOf = (id: string): NodePos => GENERAL_POS[id] ?? CLASS_POS[id] ?? { x: 0, y: 0 };
  const detailId = hovered ?? selected ?? "field_medicine";
  const detail = PASSIVES.find(p => p.id === detailId) ?? PASSIVES[0];
  const rank = passiveRank(hero, detail.id);
  const reason = passiveBlocker(hero, detail.id);

  const edges = useMemo(() => {
    const list: { from: NodePos; to: NodePos; active: boolean }[] = [];
    for (const p of PASSIVES) {
      if (!p.prereq) continue;
      const from = posOf(p.prereq.id);
      const to = posOf(p.id);
      const active = passiveRank(hero, p.prereq.id) >= (p.prereq.rank ?? 1);
      list.push({ from, to, active });
    }
    return list;
  }, [hero]);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-lg">Insight: <span className="text-gold">{fmt(insightBank(hero))}</span>
          <span className="ml-3 text-sm text-muted-foreground">{fmt(spentInsight(hero))} spent · {fmt(totalInsight(hero))} earned</span>
        </div>
        <div className="text-xs text-muted-foreground">Earn Insight from level-ups, victories, quests & achievements. Ranks are permanent.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* ── Tree canvas ── */}
        <div ref={scrollRef} className="slot overflow-auto p-2" style={{ maxHeight: "460px" }}>
          <div className="relative mx-auto" style={{ width: TREE_W, height: TREE_H }}>
            <svg className="absolute inset-0" width={TREE_W} height={TREE_H} style={{ pointerEvents: "none" }}>
              {/* Branch dividers */}
              <line x1={520} y1={20} x2={520} y2={TREE_H - 20} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 6" />
              {/* Tier dividers */}
              {[150, 290].map(y => <line key={y} x1={20} y1={y} x2={TREE_W - 20} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 8" opacity={0.4} />)}
              {/* Connection lines */}
              {edges.map((e, i) => (
                <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                  stroke={e.active ? "var(--gold)" : "var(--muted-foreground)"} strokeWidth={e.active ? 2.5 : 1.5}
                  opacity={e.active ? 0.8 : 0.3} strokeDasharray={e.active ? "0" : "5 5"} />
              ))}
            </svg>

            {/* Branch labels */}
            <span className="absolute left-2 top-0 font-display text-sm text-gold/80">General</span>
            <span className="absolute right-2 top-0 font-display text-sm text-gold/80">{CLASSES[hero.cls].name}</span>
            {([1, 2, 3] as const).map(tier => (
              <span key={tier} className="absolute left-2 text-[10px] text-muted-foreground" style={{ top: tier === 1 ? 55 : tier === 2 ? 195 : 335 }}>
                T{tier} · {PASSIVE_TIER_REQ[tier]} pts
              </span>
            ))}

            {/* Nodes */}
            {PASSIVES.filter(p => p.group === "general" || p.group === hero.cls).map(p => {
              const pos = posOf(p.id);
              const r = passiveRank(hero, p.id);
              const blocker = passiveBlocker(hero, p.id);
              const isHover = hovered === p.id;
              const isSel = selected === p.id;
              const maxed = r >= p.max;
              const locked = blocker && r === 0;
              const ready = !blocker && !maxed;
              return (
                <button key={p.id} type="button"
                  className="absolute flex items-center justify-center rounded-full border-2 transition hover:scale-110 hover:z-10"
                  style={{
                    left: pos.x - NODE_R, top: pos.y - NODE_R, width: NODE_R * 2, height: NODE_R * 2,
                    borderColor: maxed ? "var(--gold)" : ready ? "var(--r1)" : locked ? "var(--muted-foreground)" : "var(--r4)",
                    background: r > 0 ? "color-mix(in srgb, var(--gold) 25%, var(--card))" : "var(--card)",
                    boxShadow: ready ? "0 0 8px color-mix(in srgb, var(--gold) 40%, transparent)" : maxed ? "0 0 12px var(--gold)" : "none",
                    opacity: locked ? 0.55 : 1,
                    cursor: ready ? "pointer" : "default",
                  }}
                  title={`${p.name}${r > 0 ? ` (${r}/${p.max})` : ""}`}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(p.id)}
                >
                  {/* Rank pips */}
                  <div className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {Array.from({ length: p.max }, (_, i) => (
                      <span key={i} className="rounded-full" style={{
                        width: 5, height: 5,
                        background: i < r ? "var(--gold)" : "var(--muted-foreground)",
                        opacity: i < r ? 1 : 0.3,
                      }} />
                    ))}
                  </div>
                  {/* Tier number */}
                  <span className="font-display text-sm font-bold" style={{
                    color: maxed ? "var(--gold)" : r > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                  }}>{p.tier}</span>
                  {/* Ready glow ring */}
                  {ready && <span className="absolute inset-0 animate-ping rounded-full" style={{
                    border: "1px solid var(--gold)", opacity: 0.3, animationDuration: "2s",
                  }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <section className="slot flex flex-col p-4" aria-live="polite">
          <h3 className="font-display text-lg text-gold">{detail.name}</h3>
          <div className="mb-1 text-sm text-muted-foreground">
            {detail.group === "general" ? "General" : CLASSES[detail.group as keyof typeof CLASSES]?.name ?? detail.group} · Tier {detail.tier}
          </div>
          <p className="text-sm">{detail.desc}</p>
          <div className="mt-3 space-y-1 text-sm">
            <div><span className="text-muted-foreground">Per rank:</span> {effects(detail.fx, 1)}</div>
            <div><span className="text-muted-foreground">Current ({rank}):</span> {effects(detail.fx, rank)}</div>
            {rank < detail.max && <div><span className="text-muted-foreground">Next ({rank + 1}):</span> {effects(detail.fx, rank + 1)}</div>}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rank {rank}/{detail.max} · {detail.cost} Insight/rank
            {detail.prereq && ` · Requires ${PASSIVES.find(p => p.id === detail.prereq!.id)?.name} rank ${detail.prereq.rank}`}
          </div>
          <div className="mt-auto pt-4">
            <button type="button" className="btn-gold w-full px-4 py-2" disabled={!!reason}
              title={reason ?? `Spend ${detail.cost} Insight`}
              onClick={() => { update(h => { const next = learnPassive(h, detail.id); h.passives = next.passives; h.insight = next.insight; }); }}>
              {reason ?? `Learn rank ${rank + 1} · ${detail.cost} Insight`}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

import { useState, useRef, useMemo } from "react";
import { Eye, Lock, RotateCcw, Star } from "lucide-react";
import { CLASSES } from "./data";
import { update, useGame } from "./store";
import { fmt, Gold } from "./ui";
import { SPEC_LEVEL, TREES, freePoints, learnBlocker, rankCost, resetCost, spentIn, totalPoints, type Talent, type TalentFx } from "./talents";
import { SkillPreview } from "./SkillPreview";

const fxLabels: Record<keyof TalentFx, string> = {
  hpPct: "Max HP", atkPct: "Attack", defPct: "Defense", crit: "Crit Chance",
  dodge: "Dodge", critDmg: "Crit Damage", pen: "Penetration",
};
const fxText = (fx: TalentFx, rank: number) =>
  (Object.keys(fx) as (keyof TalentFx)[]).map(k => `+${Number(((fx[k] ?? 0) * rank).toFixed(2))}% ${fxLabels[k]}`).join(" · ");

/** Human-readable per-rank effects of a talent (stats, ability boosts or a new ability). */
function talentEffects(t: Talent, rank: number): string {
  if (t.fx && Object.keys(t.fx).length) return fxText(t.fx, rank);
  if (t.boost) {
    const name = t.boost.skill.charAt(0).toUpperCase() + t.boost.skill.slice(1);
    return `+${t.boost.multPct * rank}% damage to ${name}`;
  }
  if (t.ability) {
    const a = t.ability;
    const dmg = `${Math.round(a.mult * 100)}%${a.hits ? ` × ${a.hits} hits` : ""}`;
    const tags = [a.stun ? "stuns" : "", a.crit ? "always crits" : "", a.heal ? `heals ${Math.round(a.heal * 100)}%` : ""].filter(Boolean).join(", ");
    return `${dmg} damage${tags ? ` · ${tags}` : ""}${t.selfBoost && rank > 1 ? ` · +${t.selfBoost.multPct * (rank - 1)}% from upgrades` : ""}`;
  }
  return t.desc;
}

interface NodePos { x: number; y: number }
const NODE_R = 28;
const TREE_W = 780;
const TREE_H = 460;
// Three specialization columns (branches), five tiers stacked vertically.
const COL_X = [140, 390, 640];
const ROW_Y = [80, 160, 240, 320, 400];

/** Rendered as the Skill Tree tab inside the Throne Hall, mirroring the Passive tree canvas. */
export function SkillTreeContent() {
  const { hero, gender } = useGame();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!hero) return null;

  const trees = TREES[hero.cls];
  const posOf = (specIdx: number, tier: number): NodePos => ({ x: COL_X[specIdx], y: ROW_Y[tier - 1] });
  const firstTalent = trees[0].talents[0];
  const detailId = hovered ?? selected ?? firstTalent.id;
  const detail = trees.flatMap(s => s.talents).find(t => t.id === detailId) ?? firstTalent;
  const detailSpec = trees.find(s => s.talents.some(t => t.id === detail.id))!;
  const rank = hero.talents?.[detail.id] ?? 0;
  const blocker = learnBlocker(hero, detail.id);
  const free = freePoints(hero);

  const learn = (id: string) => update(h => {
    if (learnBlocker(h, id)) return;
    h.talents = { ...(h.talents ?? {}), [id]: (h.talents?.[id] ?? 0) + 1 };
  });
  const chooseSpec = (id: string) => update(h => { if (h.level >= SPEC_LEVEL && !h.spec) h.spec = id; });
  const reset = () => update(h => {
    const cost = resetCost(h);
    if (h.gold < cost || (spentIn(h) === 0 && !h.spec)) return;
    h.gold -= cost; h.talents = {}; h.spec = undefined;
  });

  const edges = useMemo(() => {
    const list: { from: NodePos; to: NodePos; active: boolean }[] = [];
    trees.forEach((spec, si) => {
      for (let i = 1; i < spec.talents.length; i++) {
        const from = posOf(si, spec.talents[i - 1].tier);
        const to = posOf(si, spec.talents[i].tier);
        const active = (hero.talents?.[spec.talents[i - 1].id] ?? 0) > 0;
        list.push({ from, to, active });
      }
    });
    return list;
  }, [hero, trees]);

  const preview = trees.flatMap(s => s.talents).find(t => t.id === previewId) ?? null;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-lg">Skill points: <span className="text-gold">{fmt(free)}</span>
          <span className="ml-3 text-sm text-muted-foreground">{fmt(spentIn(hero))} spent · {fmt(totalPoints(hero))} earned</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Earn 1 point per level, plus a bonus every 5 levels — quests and achievements can add more.</span>
          {!confirmReset ? (
            <button className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm" disabled={spentIn(hero) === 0 && !hero.spec} onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" /> Reset tree
            </button>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              Reset for <Gold n={resetCost(hero)} />?
              <button className="btn-gold px-3 py-1" disabled={hero.gold < resetCost(hero)} onClick={() => { reset(); setConfirmReset(false); }}>Confirm</button>
              <button className="btn-ghost px-3 py-1" onClick={() => setConfirmReset(false)}>Cancel</button>
            </span>
          )}
        </div>
      </div>

      {hero.level >= SPEC_LEVEL && !hero.spec && (
        <p className="mb-3 text-sm text-gold">Choose a specialization to unlock its tier 3+ abilities — you can change it later with a reset.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* ── Tree canvas ── */}
        <div ref={scrollRef} className="slot overflow-auto p-2" style={{ maxHeight: "460px" }}>
          <div className="relative mx-auto" style={{ width: TREE_W, height: TREE_H }}>
            <svg className="absolute inset-0" width={TREE_W} height={TREE_H} style={{ pointerEvents: "none" }}>
              {/* Branch dividers (between spec columns) */}
              {[265, 515].map(x => <line key={x} x1={x} y1={20} x2={x} y2={TREE_H - 20} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 6" />)}
              {/* Tier dividers */}
              {[120, 200, 280, 360].map(y => <line key={y} x1={20} y1={y} x2={TREE_W - 20} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 8" opacity={0.4} />)}
              {/* Connection lines */}
              {edges.map((e, i) => (
                <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                  stroke={e.active ? "var(--gold)" : "var(--muted-foreground)"} strokeWidth={e.active ? 2.5 : 1.5}
                  opacity={e.active ? 0.8 : 0.3} strokeDasharray={e.active ? "0" : "5 5"} />
              ))}
            </svg>

            {/* Branch (spec) labels + specialize */}
            {trees.map((spec, si) => {
              const mine = hero.spec === spec.id;
              return (
                <div key={spec.id} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: COL_X[si], top: 0 }}>
                  <span className="font-display text-sm text-gold/80">{spec.name}{mine && <Star className="ml-1 inline h-3 w-3 text-gold" />}</span>
                  {!hero.spec && (
                    <button className="btn-ghost mt-0.5 px-2 py-0.5 text-[10px]" disabled={hero.level < SPEC_LEVEL}
                      title={hero.level < SPEC_LEVEL ? `Requires level ${SPEC_LEVEL}` : `Specialize in ${spec.name}`}
                      onClick={() => chooseSpec(spec.id)}>{hero.level < SPEC_LEVEL ? `Lv ${SPEC_LEVEL}` : "Specialize"}</button>
                  )}
                </div>
              );
            })}
            {/* Tier labels */}
            {([1, 2, 3, 4, 5] as const).map(tier => (
              <span key={tier} className="absolute left-2 text-[10px] text-muted-foreground" style={{ top: ROW_Y[tier - 1] - 5 }}>
                T{tier}
              </span>
            ))}

            {/* Nodes */}
            {trees.map((spec, si) => spec.talents.map(t => {
              const pos = posOf(si, t.tier);
              const r = hero.talents?.[t.id] ?? 0;
              const block = learnBlocker(hero, t.id);
              const isHover = hovered === t.id;
              const isSel = selected === t.id;
              const maxed = r >= t.max;
              const locked = block && r === 0;
              const ready = !block && !maxed;
              return (
                <button key={t.id} type="button"
                  className="absolute flex items-center justify-center rounded-full border-2 transition hover:scale-110 hover:z-10"
                  style={{
                    left: pos.x - NODE_R, top: pos.y - NODE_R, width: NODE_R * 2, height: NODE_R * 2,
                    borderColor: maxed ? "var(--gold)" : ready ? "var(--r1)" : locked ? "var(--muted-foreground)" : "var(--r4)",
                    background: r > 0 ? "color-mix(in srgb, var(--gold) 25%, var(--card))" : "var(--card)",
                    boxShadow: ready ? "0 0 8px color-mix(in srgb, var(--gold) 40%, transparent)" : maxed ? "0 0 12px var(--gold)" : "none",
                    opacity: locked ? 0.55 : 1,
                    cursor: ready ? "pointer" : "default",
                    outline: isSel ? "2px solid var(--gold)" : "none",
                  }}
                  title={`${t.name}${r > 0 ? ` (${r}/${t.max})` : ""}`}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(t.id)}
                >
                  {/* Rank pips */}
                  <div className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {Array.from({ length: t.max }, (_, i) => (
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
                  }}>{t.tier}</span>
                  {/* Ability marker */}
                  {t.ability && <span className="absolute right-1 top-1 text-[10px] text-gold">◆</span>}
                  {/* Ready glow ring */}
                  {ready && <span className="absolute inset-0 animate-ping rounded-full" style={{
                    border: "1px solid var(--gold)", opacity: 0.3, animationDuration: "2s",
                  }} />}
                </button>
              );
            }))}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <section className="slot flex flex-col p-4" aria-live="polite">
          <h3 className="font-display text-lg text-gold">{detail.ability ? "◆ " : ""}{detail.name}</h3>
          <div className="mb-1 text-sm text-muted-foreground">
            {detailSpec.name} specialization · Tier {detail.tier}
          </div>
          <p className="text-sm">{detail.desc}</p>
          <div className="mt-3 space-y-1 text-sm">
            <div><span className="text-muted-foreground">Per rank:</span> {talentEffects(detail, 1)}</div>
            <div><span className="text-muted-foreground">Current ({rank}):</span> {rank > 0 ? talentEffects(detail, rank) : "—"}</div>
            {rank < detail.max && <div><span className="text-muted-foreground">Next ({rank + 1}):</span> {talentEffects(detail, rank + 1)}</div>}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rank {rank}/{detail.max} · {rankCost(detail, rank)} pt/rank
          </div>
          {blocker && blocker !== "Maxed" && (
            <div className="mt-1 text-xs text-blood"><Lock className="inline h-3 w-3" /> {blocker}</div>
          )}
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <button type="button" className="btn-gold w-full px-4 py-2" disabled={!!blocker}
              title={blocker ?? `Spend ${rankCost(detail, rank)} skill point`}
              onClick={() => learn(detail.id)}>
              {blocker ?? `Learn rank ${rank + 1} · ${rankCost(detail, rank)} pt`}
            </button>
            {detail.ability && (
              <button type="button" className="btn-ghost w-full px-4 py-2 text-sm text-gold"
                onClick={() => setPreviewId(id => id === detail.id ? null : detail.id)}>
                <Eye className="h-4 w-4" />{previewId === detail.id ? "Hide preview" : `Preview ${detail.name}`}
              </button>
            )}
          </div>
        </section>
      </div>

      {preview && <SkillPreview talent={preview} cls={hero.cls} gender={gender} locked={learnBlocker(hero, preview.id)} />}
    </>
  );
}

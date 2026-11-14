import { tr } from "./i18n";
import { useState } from "react";
import { Panel, GameTabs, fmt } from "./ui";
import { update, useGame } from "./store";
import { MATS, matCount, STAT_LABEL, type BonusFx, type Mat } from "./crafting";
import { scaledGold } from "./gold";
import type { StartBattle } from "./panels";
import type { Hero } from "./data";
import { Sprite } from "./Sprite";
import {
  ASPECTS, ASPECT_MAX, ASPECT_NAMES, ASPECT_SWAP, AWAKEN_LEVEL, ECHO_SPRITE, LATTICE, SET_BONUS, SET_NAME, SIGIL_FORGE,
  SIGIL_SETS, SIGIL_SLOTS, SLOT_BASE, SLOT_NAME, STAGES, STAGE_PCT, advanceStage, aspectMult, aspectRankCost, attuneNode,
  awakeningOf, chooseAspect, echoFoe, forgeSigil, latticeCost, latticeMax, latticeRank, masterAspect, maxDepth,
  refineSigil, setCounts, sigilMax, sigilMult, sigilRefineCost, spendTrial, stageBlocker, trialShards, trialsLeft,
  winTrial, type AspectKind, type SigilSet, type SigilSlot,
} from "./awakening";
import sanctum from "@/assets/awakening/sanctum.webp";
import shardImg from "@/assets/awakening/dawnshard.webp";
import bulwark from "@/assets/awakening/aspect-bulwark.webp";
import fury from "@/assets/awakening/aspect-fury.webp";
import ascendant from "@/assets/awakening/aspect-ascendant.webp";
import dawnCrown from "@/assets/awakening/dawn-crown.webp";
import dawnHeart from "@/assets/awakening/dawn-heart.webp";
import dawnWings from "@/assets/awakening/dawn-wings.webp";
import dawnSeal from "@/assets/awakening/dawn-seal.webp";
import eclCrown from "@/assets/awakening/eclipse-crown.webp";
import eclHeart from "@/assets/awakening/eclipse-heart.webp";
import eclWings from "@/assets/awakening/eclipse-wings.webp";
import eclSeal from "@/assets/awakening/eclipse-seal.webp";
import tmpCrown from "@/assets/awakening/tempest-crown.webp";
import tmpHeart from "@/assets/awakening/tempest-heart.webp";
import tmpWings from "@/assets/awakening/tempest-wings.webp";
import tmpSeal from "@/assets/awakening/tempest-seal.webp";

const ASPECT_ART: Record<AspectKind, string> = { bulwark, fury, ascendant };
const SIGIL_ART: Record<SigilSet, Record<SigilSlot, string>> = {
  dawn: { crown: dawnCrown, heart: dawnHeart, wings: dawnWings, seal: dawnSeal },
  eclipse: { crown: eclCrown, heart: eclHeart, wings: eclWings, seal: eclSeal },
  tempest: { crown: tmpCrown, heart: tmpHeart, wings: tmpWings, seal: tmpSeal },
};

const fxText = (fx: Partial<BonusFx>, m = 1) =>
  Object.entries(fx).map(([k, v]) => `+${Math.round((v as number) * m * 10) / 10}${STAT_LABEL[k as keyof BonusFx]}`).join(", ");

export function Shards({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-gold" title={tr("Dawnshards")}>
      <img src={shardImg} alt="" className="h-5 w-5 object-contain" />{fmt(n)}
    </span>
  );
}

type Tab = "path" | "lattice" | "aspect" | "sigils" | "trials";

/** The Awakening sanctum: the post-90 game. */
export function AwakeningPanel({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("path");
  const [note, setNote] = useState("");
  if (!hero) return null;
  const a = awakeningOf(hero);
  const run = (fn: (h: Hero) => string | null, ok: string) => {
    let err: string | null = null;
    update((h) => { err = fn(h as Hero); });
    setNote(err ? tr(err) : tr(ok));
  };

  if (hero.level < AWAKEN_LEVEL) {
    return (
      <Panel title="Awakening" subtitle="The path beyond level 90" onClose={onClose} wide>
        <img src={sanctum} alt="" className="mb-3 h-40 w-full rounded object-cover" />
        <p className="text-center font-display text-lg text-gold">{tr("Awakening opens at level 90.")}</p>
        <p className="mt-1 text-center text-sm text-muted-foreground">{tr("Reach level 90 to awaken your hero: five stages, the Soul Lattice, class Aspects, Awakened Sigils and Echo Trials wait here.")}</p>
      </Panel>
    );
  }

  const tabs: { id: Tab; name: string }[] = [
    { id: "path", name: tr("Awakening path") },
    { id: "lattice", name: tr("Soul Lattice") },
    { id: "aspect", name: tr("Aspect") },
    { id: "sigils", name: tr("Sigils") },
    { id: "trials", name: tr("Echo Trials") },
  ];
  const locked = (need: number) => a.stage < need && (
    <p className="slot p-4 text-center text-sm text-muted-foreground">{tr("Unlocks at Awakening stage {n}.", { n: need })}</p>
  );

  return (
    <Panel title="Awakening" subtitle="The path beyond level 90" onClose={onClose} wide>
      <div className="relative mb-3 overflow-hidden rounded">
        <img src={sanctum} alt="" className="h-32 w-full object-cover sm:h-40" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-background/95 to-transparent p-3">
          <div>
            <div className="font-display text-xl text-gold">{a.stage ? tr(STAGES[a.stage - 1].name) : tr("Unawakened")}</div>
            <div className="text-xs text-muted-foreground">{tr("Stage")} {a.stage}/{STAGES.length}</div>
          </div>
          <Shards n={a.shards} />
        </div>
      </div>
      <GameTabs label={tr("Awakening")} tabs={tabs} value={tab} onChange={(t) => { setTab(t); setNote(""); }} />
      {note && <div className="slot mb-3 p-2 text-center text-sm text-gold">{note}</div>}

      {tab === "path" && (
        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">{tr("Every stage adds {p}% attack, magic attack, defence, magic defence and health, and opens a new part of the sanctum. Dawnshards come from every fight you win at level 90+ and from Echo Trials.", { p: STAGE_PCT })}</p>
          {STAGES.map((s, i) => {
            const done = a.stage > i, next = a.stage === i;
            const err = next ? stageBlocker(hero) : null;
            return (
              <div key={s.name} className={`slot flex flex-wrap items-center justify-between gap-2 p-3 ${done ? "opacity-70" : ""}`}>
                <div>
                  <div className="font-display text-gold">{i + 1}. {tr(s.name)}</div>
                  <div className="text-xs text-muted-foreground">{tr("Level")} {s.level} · {tr("Unlocks")}: {tr(s.unlock)}</div>
                </div>
                {done ? <span className="text-xs text-gold">{tr("Awakened")}</span> : next ? (
                  <button className="btn-gold px-3 py-1 text-xs" disabled={!!err} title={err ? tr(err) : undefined}
                    onClick={() => run(advanceStage, "Your hero awakens!")}>
                    {tr("Awaken")} · {fmt(s.shards)} ✦ · {fmt(scaledGold(s.gold, hero.level))} {tr("gold")}
                  </button>
                ) : <span className="text-xs text-muted-foreground">{tr("Locked")}</span>}
              </div>
            );
          })}
        </div>
      )}

      {tab === "lattice" && (locked(1) || (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {LATTICE.map((n) => {
            const r = latticeRank(a, n.id), max = latticeMax(a.stage), c = latticeCost(r, hero.level);
            return (
              <div key={n.id} className="slot p-3">
                <div className="font-display text-gold">{tr(n.name)}</div>
                <div className="text-xs text-muted-foreground">{tr("Rank")} {r}/{max}</div>
                <div className="my-1 text-sm">+{Math.round(n.per * r * 100) / 100}{STAT_LABEL[n.stat]}</div>
                <button className="btn-ghost w-full px-2 py-1 text-xs" disabled={r >= max || a.shards < c.shards || hero.gold < c.gold}
                  onClick={() => run((h) => attuneNode(h, n.id), "Node attuned")}>
                  {r >= max ? tr("Fully attuned") : `${tr("Attune")} · ${c.shards} ✦ · ${fmt(c.gold)}`}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      {tab === "aspect" && (locked(2) || (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">{tr("Choose the form your awakened hero takes. The first choice is free; changing later costs {n} Dawnshards and keeps your mastery.", { n: ASPECT_SWAP })}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {ASPECTS.map((x) => {
              const on = a.aspect === x.id;
              return (
                <button key={x.id} className={`slot p-3 text-left ${on ? "ring-2 ring-gold" : ""}`} onClick={() => run((h) => chooseAspect(h, x.id), "Aspect chosen")}>
                  <img src={ASPECT_ART[x.id]} alt="" className="mx-auto h-24 w-24 object-contain" />
                  <div className="text-center font-display text-gold">{tr(ASPECT_NAMES[hero.cls][x.id])}</div>
                  <div className="text-xs text-muted-foreground">{tr(x.desc)}</div>
                  <div className="mt-1 text-xs">{fxText(x.fx, on ? aspectMult(a.aspectRank) : 1)}</div>
                </button>
              );
            })}
          </div>
          {a.aspect && (
            <div className="slot mt-3 flex flex-wrap items-center justify-between gap-2 p-3">
              <span>{tr("Mastery")} {a.aspectRank}/{ASPECT_MAX} · +{a.aspectRank * 15}%</span>
              <button className="btn-gold px-3 py-1 text-xs" disabled={a.aspectRank >= ASPECT_MAX || a.shards < aspectRankCost(a.aspectRank)}
                onClick={() => run(masterAspect, "Mastery deepened")}>
                {a.aspectRank >= ASPECT_MAX ? tr("Fully mastered") : `${tr("Deepen mastery")} · ${aspectRankCost(a.aspectRank)} ✦`}
              </button>
            </div>
          )}
        </div>
      ))}

      {tab === "sigils" && (locked(3) || (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {tr("Four new equipment slots. Forging costs {s} Dawnshards plus crystals; reforging into another set keeps half the refinement.", { s: SIGIL_FORGE.shards })}{" "}
            {(Object.entries(SIGIL_FORGE.mats) as [Mat, number][]).map(([k, v]) => `${v} ${MATS[k].name} (${matCount(hero, k)})`).join(" · ")}
          </p>
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            {SIGIL_SETS.map((set) => {
              const n = setCounts(a)[set];
              return (
                <div key={set} className="slot p-2 text-xs">
                  <div className="font-display text-gold">{tr(SET_NAME[set])} · {n}/4</div>
                  <div className={n >= 2 ? "text-gold" : "text-muted-foreground"}>2: {tr(SET_BONUS[set].desc2)}</div>
                  <div className={n >= 4 ? "text-gold" : "text-muted-foreground"}>4: {tr(SET_BONUS[set].desc4)}</div>
                </div>
              );
            })}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {SIGIL_SLOTS.map((slot) => {
              const g = a.sigils[slot];
              const c = g ? sigilRefineCost(g.lv, hero.level) : null;
              const max = sigilMax(a.stage);
              return (
                <div key={slot} className="slot p-3">
                  <div className="font-display text-gold">{tr(SLOT_NAME[slot])}</div>
                  {g ? <img src={SIGIL_ART[g.set][slot]} alt="" className="mx-auto h-20 w-20 rounded object-contain" />
                    : <div className="mx-auto grid h-20 w-20 place-items-center rounded border border-dashed border-border text-xs text-muted-foreground">{tr("Empty")}</div>}
                  <div className="text-center text-xs">{g ? `${tr(SET_NAME[g.set])} +${g.lv}` : ""}</div>
                  <div className="text-center text-xs text-muted-foreground">{fxText(SLOT_BASE[slot], g ? sigilMult(g.lv) : 1)}</div>
                  {g && c && (
                    <button className="btn-gold mt-1 w-full px-2 py-1 text-xs" disabled={g.lv >= max || a.shards < c.shards || hero.gold < c.gold}
                      onClick={() => run((h) => refineSigil(h, slot), "Sigil refined")}>
                      {g.lv >= max ? tr("Fully refined") : `${tr("Refine")} · ${c.shards} ✦ · ${fmt(c.gold)}`}
                    </button>
                  )}
                  <div className="mt-1 flex justify-center gap-1">
                    {SIGIL_SETS.map((set) => (
                      <button key={set} title={tr(SET_NAME[set])} disabled={g?.set === set}
                        className="btn-ghost p-0.5 disabled:opacity-40" onClick={() => run((h) => forgeSigil(h, slot, set), "Sigil forged")}>
                        <img src={SIGIL_ART[set][slot]} alt={tr(SET_NAME[set])} className="h-8 w-8 rounded object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {tab === "trials" && (locked(1) || <Trials start={start} setNote={setNote} />)}
    </Panel>
  );
}

function Trials({ start, setNote }: { start: StartBattle; setNote: (s: string) => void }) {
  const { hero } = useGame();
  const a = hero ? awakeningOf(hero) : null;
  const [depth, setDepth] = useState(() => (a ? maxDepth(a) : 1));
  if (!hero || !a) return null;
  const left = trialsLeft(a), top = maxDepth(a);
  const d = Math.max(1, Math.min(top, depth));
  const foe = echoFoe(d, hero.level + hero.paragon);
  const go = () => {
    if (left <= 0) { setNote(tr("No Echo Trials left today")); return; }
    start({
      title: `Echo Trial · Depth ${d}`,
      right: foe,
      onResult: async (won) => {
        update((h) => { spendTrial(h); });
        if (!won) return { lines: [tr("The Echo endures. Grow stronger and return.")] };
        let n = 0;
        update((h) => { n = winTrial(h, d); });
        return { lines: [tr("+{n} Dawnshards", { n })] };
      },
    });
  };
  return (
    <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
      <Sprite rect={ECHO_SPRITE} className="mx-auto h-48 w-48" />
      <div className="slot p-3">
        <div className="font-display text-lg text-gold">{tr("Awakened Echo")}</div>
        <p className="text-xs text-muted-foreground">{tr("A burning reflection of your own power. Every depth is harder and pays more Dawnshards. Each win opens two deeper levels.")}</p>
        <div className="my-2 text-sm">{tr("Trials left today")}: <b className="text-gold">{left}</b> · {tr("Best depth")}: <b className="text-gold">{a.best}</b></div>
        <label className="flex items-center gap-2 text-sm">
          {tr("Depth")} <input type="range" min={1} max={top} value={d} onChange={(e) => setDepth(+e.target.value)} className="flex-1" /> <b className="text-gold">{d}</b>
        </label>
        <div className="mt-1 text-xs text-muted-foreground">{tr("Health")} {fmt(foe.hp)} · {tr("Attack")} {fmt(foe.atk)} · {tr("Reward")}: {trialShards(d)} ✦</div>
        <button className="btn-gold mt-2 w-full py-1.5" disabled={left <= 0} onClick={go}>{tr("Challenge the Echo")}</button>
      </div>
    </div>
  );
}

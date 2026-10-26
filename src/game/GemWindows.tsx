import { useState } from "react";
import { Gem, X } from "lucide-react";
import { GemIcon, MatIcon } from "./MatIcon";
import {
  FUSE_COUNT, GEMS, GEM_CUT_COST, GEM_MAX_TIER, GEM_TARGET_COST, GEM_TIER_NAMES, GEM_TYPES, STAT_LABEL,
  gemKey, gemName, gemValue, matCount, parseGem, type GemType,
} from "./crafting";
import type { Hero } from "./data";
import { Gold } from "./ui";

const modal = "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4";

/** Effects a gem type has beyond its raw number: defensive and utility gems change how a fight plays out. */
const NOTABLE: Partial<Record<GemType, string>> = {
  onyx: "Block: flat chance to shrug off a hit.",
  opal: "Dodge: chance to avoid a hit entirely.",
  pearl: "Healing power: strengthens heals and life-steal.",
  obsidian: "Armour pen: cuts through enemy defence.",
  moonstone: "Magic pen: cuts through enemy magic defence.",
  peridot: "Accuracy: helps land hits on high-dodge foes.",
};

/** Pick one of the gems you own for one socket. */
export function GemPicker({ hero, socket, onPick, onCut, onClose }: { hero: Hero; socket: number; onPick: (key: string) => void; onCut: () => void; onClose: () => void }) {
  const owned = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
  return (
    <div className={modal} role="dialog" aria-modal="true" aria-label="Insert a gem" onClick={onClose}>
      <div className="game-panel anim-pop max-h-[85vh] w-full max-w-lg overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="font-display text-lg text-gold">Insert a gem · socket {socket + 1}</div>
          <button className="btn-ghost px-2 py-1" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {owned.length === 0 ? (
          <div className="py-6 text-center">
            <p className="mb-3 text-muted-foreground">You have no gems in your pouch yet. Cut one from Ember Ore first.</p>
            <button className="btn-gold px-4 py-2" onClick={onCut}><Gem className="mr-1 inline h-4 w-4" />Open gem cutting</button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {owned.map(([key, n]) => {
              const g = parseGem(key)!;
              return (
                <button key={key} className="slot flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm" onClick={() => onPick(key)}>
                  <span>
                    <GemIcon type={g.type} /> {gemName(key)} ×{n}
                    <span className="block text-xs text-muted-foreground">
                      +{gemValue(key)} {STAT_LABEL[GEMS[g.type].stat]} · best on {GEMS[g.type].classes}
                      {NOTABLE[g.type] ? " · " + NOTABLE[g.type] : ""}
                    </span>
                  </span>
                  <span className="btn-ghost px-2 py-0.5 text-xs">Insert</span>
                </button>
              );
            })}
            <button className="btn-ghost mt-2 w-full py-1.5 text-xs" onClick={onCut}><Gem className="mr-1 inline h-3 w-3" />Cut another gem</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Shows what a cut will produce — stats and side effects — before any ore or gold is spent. */
export function GemCutWindow({ hero, onClose, onCut }: { hero: Hero; onClose: () => void; onCut: (type?: GemType) => void }) {
  const [choice, setChoice] = useState<GemType | "random">("random");
  const target = choice === "random" ? undefined : choice;
  const cost = target ? GEM_TARGET_COST : { ore: GEM_CUT_COST.ore, gold: GEM_CUT_COST.gold, essence: 0 };
  const afford = matCount(hero, "ore") >= cost.ore && hero.gold >= cost.gold && matCount(hero, "essence") >= cost.essence;
  const shown: GemType[] = target ? [target] : GEM_TYPES;
  return (
    <div className={modal} role="dialog" aria-modal="true" aria-label="Gem cutting" onClick={onClose}>
      <div className="game-panel anim-pop max-h-[85vh] w-full max-w-2xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="font-display text-lg text-gold">Cut a gem</div>
          <button className="btn-ghost px-2 py-1" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          A cut always gives a {GEM_TIER_NAMES[0]} tier-1 gem. Fuse {FUSE_COUNT} identical gems to reach the next tier; each tier multiplies the bonus, up to {GEM_TIER_NAMES[GEM_MAX_TIER - 1]} ×{GEM_MAX_TIER}.
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <button className={"px-3 py-1.5 text-sm " + (choice === "random" ? "btn-gold" : "btn-ghost")} onClick={() => setChoice("random")}>Random gem</button>
          {GEM_TYPES.map((t) => (
            <button key={t} className={"px-3 py-1.5 text-sm " + (choice === t ? "btn-gold" : "btn-ghost")} onClick={() => setChoice(t)}>
              <GemIcon type={t} /> {GEMS[t].name}
            </button>
          ))}
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="slot px-2 py-1">{target ? "Chosen cut" : "Random cut"}</span>
          <span className="slot px-2 py-1"><MatIcon mat="ore" size={16} /> {cost.ore} Ember Ore</span>
          <span className="slot px-2 py-1"><Gold n={cost.gold} /></span>
          {cost.essence > 0 && <span className="slot px-2 py-1">{cost.essence} Soul Essence</span>}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {shown.map((t) => {
            const g = GEMS[t];
            const one = gemKey(t, 1);
            return (
              <div key={t} className="slot flex items-start gap-3 p-3">
                <span className="mt-0.5 shrink-0"><GemIcon type={t} size={32} /></span>
                <div className="min-w-0 text-sm">
                  <div className="font-display text-gold">{gemName(one)}</div>
                  <div>+{gemValue(one)} {STAT_LABEL[g.stat]} per socketed gem</div>
                  <div className="text-xs text-muted-foreground">Best on {g.classes}{NOTABLE[t] ? " · " + NOTABLE[t] : ""}</div>
                  <div className="text-xs text-muted-foreground">At tier {GEM_MAX_TIER}: +{+(g.per * GEM_MAX_TIER * GEM_MAX_TIER).toFixed(1)} {STAT_LABEL[g.stat]}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-gold flex-1 py-2" disabled={!afford} onClick={() => onCut(target)}>
            <Gem className="mr-1 inline h-4 w-4" />{target ? "Cut a " + GEM_TIER_NAMES[0] + " " + GEMS[target].name : "Cut a random gem"}
          </button>
          <button className="btn-ghost px-4 py-2" onClick={onClose}>Cancel</button>
        </div>
        {!afford && <p className="mt-2 text-center text-xs text-hp">Not enough Ember Ore, gold or essence for this cut.</p>}
      </div>
    </div>
  );
}

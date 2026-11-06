import { useState } from "react";
import { Gem, Hammer, ShoppingBag, X } from "lucide-react";
import { GemIcon, MatIcon } from "./MatIcon";
import {
  FUSE_COUNT, GEMS, GEM_MAX_TIER, GEM_STAT_LABEL, GEM_TIER_NAMES, GEM_TYPES, MATS,
  craftGem, gemBlocker, gemCraftCost, gemCraftLevel, gemKey, gemName, gemValue, matCount, parseGem,
  type GemType, type Mat,
} from "./crafting";
import { buyConquestGem, gemGoldPrice } from "./conquest";
import type { Hero } from "./data";
import { update } from "./store";
import { Gold, fmt } from "./ui";

const modal = "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4";

/** Pick one of the gems you own for one socket. */
export function GemPicker({ hero, socket, onPick, onForge, onClose }: { hero: Hero; socket: number; onPick: (key: string) => void; onForge: () => void; onClose: () => void }) {
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
            <p className="mb-3 text-muted-foreground">You have no gems in your pouch yet. Forge one from materials first.</p>
            <button className="btn-gold px-4 py-2" onClick={onForge}><Gem className="mr-1 inline h-4 w-4" />Open the gem forge</button>
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
                      +{gemValue(key)} {GEM_STAT_LABEL[GEMS[g.type].stat]} · best on {GEMS[g.type].classes}
                      {" · " + GEMS[g.type].note}
                    </span>
                  </span>
                  <span className="btn-ghost px-2 py-0.5 text-xs">Insert</span>
                </button>
              );
            })}
            <button className="btn-ghost mt-2 w-full py-1.5 text-xs" onClick={onForge}><Gem className="mr-1 inline h-3 w-3" />Forge another gem</button>
          </div>
        )}
      </div>
    </div>
  );
}

/** The gem forge: pick a family and a level, see exactly what it grants, then forge it from
 *  materials or buy it with Conquest Tokens. */
export function GemCraftWindow({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const [type, setType] = useState<GemType>("ruby");
  const [level, setLevel] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const key = gemKey(type, level);
  const g = GEMS[type];
  const cost = gemCraftCost(level, hero.level);
  const blocked = gemBlocker(hero, level);
  const price = gemGoldPrice(level, hero.level);
  const costs: [Mat, number][] = [["ore", cost.ore], ["essence", cost.essence], ["crystal", cost.crystal], ["starshard", cost.starshard], ["bossCore", cost.bossCore]];

  const forge = () => update((h) => {
    const e = craftGem(h, type, level);
    setMsg(e ? { ok: false, t: e } : { ok: true, t: `Forged a ${gemName(key)} — +${gemValue(key)} ${GEM_STAT_LABEL[g.stat]}.` });
  });
  const buy = () => update((h) => {
    const e = buyConquestGem(h, type, level);
    setMsg(e ? { ok: false, t: e } : { ok: true, t: `Bought a ${gemName(key)} for ${fmt(price)} gold.` });
  });

  return (
    <div className={modal} role="dialog" aria-modal="true" aria-label="Gem forge" onClick={onClose}>
      <div className="game-panel anim-pop max-h-[88vh] w-full max-w-2xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="font-display text-lg text-gold">Forge a gem</div>
          <button className="btn-ghost px-2 py-1" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Eight gem families, twelve levels each — the chart values are the stats a socketed gem grants.
          Forge with materials, buy with gold at the Conquest Gate, or fuse {FUSE_COUNT} identical gems into the next level.
        </p>

        <div className="mb-2 flex flex-wrap gap-2">
          {GEM_TYPES.map((t) => (
            <button key={t} className={"px-3 py-1.5 text-sm " + (type === t ? "btn-gold" : "btn-ghost")} onClick={() => setType(t)}>
              <GemIcon type={t} /> {GEMS[t].name}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-4 gap-1 sm:grid-cols-6">
          {Array.from({ length: GEM_MAX_TIER }, (_, i) => i + 1).map((n) => {
            const k = gemKey(type, n);
            return (
              <button key={n} className={"slot px-1 py-1 text-center text-xs " + (level === n ? "ring-2 ring-gold" : "")} onClick={() => setLevel(n)}>
                <span className="block font-bold">Lv {n}</span>
                <span className="block text-[10px] text-muted-foreground">+{gemValue(k)}</span>
              </button>
            );
          })}
        </div>

        <div className="slot mb-3 flex items-start gap-3 p-3">
          <span className="mt-0.5 shrink-0"><GemIcon type={type} size={32} /></span>
          <div className="min-w-0 text-sm">
            <div className="font-display text-gold">{gemName(key)} <span className="text-xs text-muted-foreground">· {GEM_TIER_NAMES[level - 1]} · level {level}</span></div>
            <div>+{gemValue(key)} {GEM_STAT_LABEL[g.stat]} per socketed gem</div>
            <div className="text-xs text-muted-foreground">Best on {g.classes} · {g.note}</div>
            <div className="text-xs text-muted-foreground">Unlocks at hero level {gemCraftLevel(level)}</div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          {costs.filter(([, n]) => n > 0).map(([m, n]) => (
            <span key={m} className={"slot px-2 py-1 " + (matCount(hero, m) >= n ? "" : "text-hp")} title={MATS[m].desc}>
              <MatIcon mat={m} size={16} /> {matCount(hero, m)}/{n} {MATS[m].name}
            </span>
          ))}
          <span className={"slot px-2 py-1 " + (hero.gold >= cost.gold ? "" : "text-hp")}><Gold n={cost.gold} /></span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-gold flex-1 py-2" disabled={!!blocked} title={blocked ?? "Forge with materials"} onClick={forge}>
            <Hammer className="mr-1 inline h-4 w-4" />Forge {GEMS[type].name}
          </button>
          <button className="btn-ghost flex-1 py-2" disabled={hero.gold < price} title={hero.gold < price ? `Needs ${fmt(price)} gold` : "Buy with gold at the Conquest Gate"} onClick={buy}>
            <ShoppingBag className="mr-1 inline h-4 w-4" />Buy · <Gold n={price} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>Gold held: <Gold n={hero.gold} /></span>
          <span>{blocked ? blocked : "Ready to forge."}</span>
        </div>
        {msg && <p role="status" className={`anim-pop mt-2 text-center text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      </div>
    </div>
  );
}

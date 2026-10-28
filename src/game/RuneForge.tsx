import { useState } from "react";
import { update, useGame } from "./store";
import { Panel, Gold, fmt } from "./ui";
import { STAT_LABEL } from "./crafting";
import {
  RUNES, RUNE_TYPES, RUNE_TIER_NAMES, RUNE_SLOTS, RUNE_SLOT_LEVELS, RUNE_FUSE_COUNT, RUNE_MAX_TIER,
  runeKey, parseRune, runeName, runeValue, runeStatText, runeColor, runeFx, runePower,
  runeCraftCost, craftRune, runeFuseCost, fuseRune, equipRune, unequipRune,
  type RuneType,
} from "./runes";
import type { Mat, StatKey } from "./crafting";

export function RuneForge({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [target, setTarget] = useState<RuneType | undefined>(undefined);
  if (!hero) return null;
  const fx = runeFx(hero);
  const board = Array.from({ length: RUNE_SLOTS }, (_, i) => hero.runeBoard?.[i] ?? null);
  const pouch = Object.entries(hero.runes ?? {})
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([k, n]) => ({ key: k, count: n!, ...parseRune(k)! }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.tier - b.tier);

  return (
    <Panel title="Rune Forge" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-display text-lg">Rune Bonus: <span className="text-gold">+{fmt(runePower(hero))} BR</span></div>
        <div className="text-xs text-muted-foreground">Craft runes from ore, fuse duplicates to raise tiers, and socket them for permanent bonuses.</div>
      </div>

      {/* Active rune bonuses */}
      {(Object.entries(fx) as [StatKey, number][]).filter(([, v]) => v > 0).length > 0 && (
        <div className="slot mb-4 p-3">
          <div className="mb-1 font-display text-sm text-gold">Equipped Bonuses</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {(Object.entries(fx) as [StatKey, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} className="rounded bg-muted px-2 py-0.5 text-xs">+{v.toFixed(1)}{STAT_LABEL[k]}</span>
            ))}
          </div>
        </div>
      )}

      {/* Rune board */}
      <div className="mb-4">
        <h3 className="mb-2 font-display text-gold">Rune Board</h3>
        <div className="flex flex-wrap gap-2">
          {board.map((key, slot) => {
            const locked = hero.level < RUNE_SLOT_LEVELS[slot];
            const r = key ? parseRune(key) : null;
            return (
              <div key={slot} className={`slot flex h-16 w-16 items-center justify-center rounded-lg border-2 ${locked ? "opacity-40" : ""}`}
                style={{ borderColor: r ? runeColor(key!) : "var(--border)" }}>
                {locked ? (
                  <span className="text-center text-[10px] text-muted-foreground">Lv {RUNE_SLOT_LEVELS[slot]}</span>
                ) : r ? (
                  <button className="group flex h-full w-full flex-col items-center justify-center" title={`${runeName(key!)} — ${runeStatText(key!)}`}
                    onClick={() => update(h => { unequipRune(h, slot); })}>
                    <span className="text-2xl" style={{ color: runeColor(key!) }}>◈</span>
                    <span className="text-[9px] text-muted-foreground">T{r.tier} · {RUNES[r.type].name.split(" ")[2]}</span>
                  </button>
                ) : (
                  <span className="text-2xl text-muted-foreground/30">◇</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Rune Pouch & Socketing ── */}
        <div>
          <h3 className="mb-2 font-display text-gold">Rune Pouch</h3>
          {pouch.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runes yet. Craft one below.</p>
          ) : (
            <div className="space-y-1.5">
              {pouch.map(r => (
                <div key={r.key} className="slot flex items-center gap-2 p-2">
                  <span className="text-lg" style={{ color: runeColor(r.key) }}>◈</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{runeName(r.key)} <span className="text-xs text-muted-foreground">×{r.count}</span></div>
                    <div className="text-xs text-muted-foreground">{runeStatText(r.key)}</div>
                  </div>
                  {/* Socket buttons */}
                  <div className="flex gap-1">
                    {Array.from({ length: RUNE_SLOTS }, (_, slot) => {
                      const locked = hero.level < RUNE_SLOT_LEVELS[slot];
                      return (
                        <button key={slot} className="slot h-7 w-7 text-[10px] hover:scale-110" disabled={locked}
                          title={locked ? `Slot ${slot + 1} at level ${RUNE_SLOT_LEVELS[slot]}` : `Socket into slot ${slot + 1}`}
                          onClick={() => update(h => { equipRune(h, r.key, slot); })}>
                          {slot + 1}
                        </button>
                      );
                    })}
                  </div>
                  {/* Fuse button */}
                  {r.tier < RUNE_MAX_TIER && r.count >= RUNE_FUSE_COUNT && (
                    <button className="btn-gold px-2 py-1 text-xs"
                      title={`Fuse ${RUNE_FUSE_COUNT} → tier ${r.tier + 1}`}
                      onClick={() => update(h => { fuseRune(h, r.key); })}>
                      Fuse →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Crafting ── */}
        <div>
          <h3 className="mb-2 font-display text-gold">Craft Runes</h3>
          <div className="slot p-3">
            <div className="mb-2 text-sm">
              <span className="text-muted-foreground">Type: </span>
              <select className="ml-1 rounded border border-border bg-card px-2 py-1 text-sm" value={target ?? ""}
                onChange={e => setTarget(e.target.value ? e.target.value as RuneType : undefined)}>
                <option value="">Random</option>
                {RUNE_TYPES.map(t => <option key={t} value={t}>{RUNES[t].name}</option>)}
              </select>
            </div>
            {(() => {
              const c = runeCraftCost(hero.level, target);
              return (
                <div className="mb-2 text-xs text-muted-foreground">
                  Cost: <Gold n={c.gold} /> · {c.ore} Ember Ore{c.essence > 0 && ` · ${c.essence} Soul Essence`}
                </div>
              );
            })()}
            <button className="btn-gold w-full px-4 py-2"
              onClick={() => update(h => { craftRune(h, Math.random, target); })}>
              Craft {target ? RUNES[target].name : "Random Rune"}
            </button>
          </div>

          {/* Fuse help */}
          <div className="mt-3 slot p-3 text-xs text-muted-foreground">
            <div className="font-display text-sm text-foreground">Fusion</div>
            Fuse {RUNE_FUSE_COUNT} identical runes into one of the next tier (up to {RUNE_TIER_NAMES[RUNE_MAX_TIER - 1]}). Fusion costs gold and Soul Essence.
          </div>

          {/* Rune types legend */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {RUNE_TYPES.map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs">
                <span style={{ color: RUNES[t].color }}>◈</span>
                <span className="text-muted-foreground">{RUNES[t].name.split(" ")[2]}: +{RUNES[t].per}{STAT_LABEL[RUNES[t].stat]}/tier</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

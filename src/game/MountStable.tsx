import { update, useGame } from "./store";
import { Panel, Gold, fmt } from "./ui";
import { MATS, STAT_LABEL } from "./crafting";
import { MOUNTS, MOUNT_UNLOCK_LEVEL, mountLevel, mountBlocker, mountUpgradeCost, upgradeMount, setActiveMount, activeMount, mountPower, mountFx } from "./mounts";
import type { Mat, StatKey } from "./crafting";

export function MountStable({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  if (!hero) return null;
  const active = activeMount(hero);
  const fx = mountFx(hero);

  return (
    <Panel title="Stable" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-display text-lg">Mount Bonus: <span className="text-gold">+{fmt(mountPower(hero))} BR</span></div>
        <div className="text-xs text-muted-foreground">Unlock mounts at level {MOUNT_UNLOCK_LEVEL}. The active mount contributes double bonuses.</div>
      </div>

      {/* Active mount stat summary */}
      {active && (
        <div className="slot mb-4 p-3">
          <div className="mb-1 font-display text-gold">Active: {MOUNTS.find(m => m.id === active)?.name} · Lv {mountLevel(hero, active)}</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {(Object.entries(fx) as [StatKey, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
              <span key={k} className="rounded bg-muted px-2 py-0.5 text-xs">+{v.toFixed(1)}{STAT_LABEL[k]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {MOUNTS.map(m => {
          const lvl = mountLevel(hero, m.id);
          const owned = lvl > 0;
          const blocked = mountBlocker(hero, m.id);
          const cost = mountUpgradeCost(m, lvl, hero.level);
          const isActive = active === m.id;
          const maxed = lvl >= m.max;
          return (
            <div key={m.id} className={`slot p-3 ${isActive ? "ring-2 ring-gold" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg" style={{ color: owned ? "var(--gold)" : "var(--muted-foreground)" }}>{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                  {owned ? <div className="mt-0.5 text-sm font-bold">Level {lvl}/{m.max}</div> : <div className="mt-0.5 text-xs text-muted-foreground">Requires level {m.req}</div>}
                </div>
                {owned && (
                  <button className={`btn-ghost px-2 py-1 text-xs ${isActive ? "ring-1 ring-gold text-gold" : ""}`}
                    disabled={isActive} onClick={() => update(h => setActiveMount(h, m.id))}>
                    {isActive ? "Active" : "Set Active"}
                  </button>
                )}
              </div>
              {/* Stat bonuses */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(Object.entries(m.fx) as [StatKey, number][]).map(([k, v]) => (
                  <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">+{(v * Math.max(1, lvl)).toFixed(1)}{STAT_LABEL[k]}</span>
                ))}
              </div>
              {/* Upgrade button */}
              <div className="mt-3 flex items-center justify-between gap-2">
                {!maxed ? (
                  <>
                    <div className="text-xs">
                      <Gold n={cost.gold} />
                      {(Object.entries(cost.mats) as [Mat, number][]).map(([k, v]) => (
                        <span key={k} className="ml-2 text-muted-foreground">{v} {MATS[k].name}</span>
                      ))}
                    </div>
                    <button className="btn-gold px-3 py-1.5 text-sm" disabled={!!blocked}
                      title={blocked ?? `Upgrade to level ${lvl + 1}`}
                      onClick={() => update(h => { upgradeMount(h, m.id); })}>
                      {lvl === 0 ? "Unlock" : `Upgrade → ${lvl + 1}`}
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-bold text-gold">★ Maxed ★</span>
                )}
              </div>
              {blocked && !maxed && <div className="mt-1 text-xs text-blood">{blocked}</div>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

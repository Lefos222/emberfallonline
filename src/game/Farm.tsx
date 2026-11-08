import { useEffect, useState } from "react";
import { Lock, Sprout, Wheat, Sparkles, Timer, Tractor, Coins } from "lucide-react";
import type { Hero } from "./data";
import { getState, update, useGame } from "./store";
import { Gold, Panel, fmt } from "./ui";
import {
  FARM_MAX_LEVEL,
  FARM_TOTAL_SLOTS,
  buySeed,
  cropAt,
  cropProgress,
  durationLabel,
  farmLevel,
  farmProgress,
  farmXp,
  farmXpToNext,
  goldSeedReward,
  harvestAll,
  harvestSlot,
  heldSeeds,
  plantSeed,
  readyCount,
  seedCount,
  seedName,
  seedPrice,
  seedReward,
  slotsForLevel,
  timeLeft,
  unlockLevelForSlot,
  xpSeedReward,
  type SeedKind,
} from "./farm";

/**
 * Crop artwork, drawn as inline SVG in the castle's palette instead of emoji: golden wheat for
 * Gold Seeds, violet soul blooms for XP Seeds, each with three growth stages.
 */
export function CropArt({
  kind,
  stage,
  size = 46,
}: {
  kind: SeedKind;
  stage: 0 | 1 | 2;
  size?: number;
}) {
  const gold = kind === "gold";
  const leaf = gold ? "oklch(0.66 0.12 128)" : "oklch(0.56 0.13 285)";
  const crop = gold ? "oklch(0.86 0.15 85)" : "oklch(0.74 0.19 300)";
  const cropDark = gold ? "oklch(0.64 0.13 72)" : "oklch(0.5 0.17 292)";
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ filter: stage === 2 ? `drop-shadow(0 0 6px ${crop})` : undefined }}
    >
      <ellipse cx="24" cy="42" rx="15" ry="4" fill="oklch(0.24 0.04 45)" opacity="0.9" />
      {stage === 0 ? (
        <>
          <path
            d="M24 41 C23 35 24 31 24 28"
            stroke={leaf}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="19" cy="31" rx="4" ry="2.2" fill={leaf} transform="rotate(-24 19 31)" />
          <ellipse cx="29" cy="33" rx="4" ry="2.2" fill={leaf} transform="rotate(20 29 33)" />
        </>
      ) : stage === 1 ? (
        <>
          <path
            d="M24 41 C22 33 25 27 24 20"
            stroke={leaf}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="18" cy="32" rx="5" ry="2.6" fill={leaf} transform="rotate(-28 18 32)" />
          <ellipse cx="30" cy="29" rx="5" ry="2.6" fill={leaf} transform="rotate(24 30 29)" />
          <ellipse cx="20" cy="25" rx="4.5" ry="2.3" fill={leaf} transform="rotate(-20 20 25)" />
          {gold ? (
            <ellipse cx="24" cy="18" rx="3" ry="5" fill={crop} opacity="0.85" />
          ) : (
            <polygon points="24,13 27,20 24,24 21,20" fill={crop} opacity="0.85" />
          )}
        </>
      ) : (
        <>
          <path
            d="M24 42 C22 33 25 26 24 18"
            stroke={leaf}
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="17" cy="33" rx="6" ry="3" fill={leaf} transform="rotate(-30 17 33)" />
          <ellipse cx="31" cy="30" rx="6" ry="3" fill={leaf} transform="rotate(26 31 30)" />
          {gold ? (
            <>
              <ellipse cx="24" cy="11" rx="3.4" ry="6" fill={crop} />
              <ellipse
                cx="19.5"
                cy="15"
                rx="3"
                ry="5"
                fill={cropDark}
                transform="rotate(-22 19.5 15)"
              />
              <ellipse
                cx="28.5"
                cy="15"
                rx="3"
                ry="5"
                fill={cropDark}
                transform="rotate(22 28.5 15)"
              />
              <ellipse cx="24" cy="20" rx="3" ry="4.4" fill={cropDark} />
            </>
          ) : (
            <>
              <polygon points="24,5 29,14 24,21 19,14" fill={crop} />
              <polygon points="18,12 22,18 18,24 14,18" fill={cropDark} />
              <polygon points="30,12 34,18 30,24 26,18" fill={cropDark} />
              <circle cx="24" cy="16" r="2" fill="oklch(0.98 0.04 320)" opacity="0.8" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

/** The farm's progress rail: Farm XP toward the next level, or MAX LEVEL at the top. */
function FarmProgress({ hero }: { hero: Hero }) {
  const level = farmLevel(hero);
  const maxed = level >= FARM_MAX_LEVEL;
  const need = farmXpToNext(level);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-lg text-gold">
          Farm Level <b className="text-2xl">{level}</b>
          {maxed && <span className="ml-2 text-xs text-r1">MAX LEVEL</span>}
        </span>
        <span className="text-xs text-muted-foreground">
          {maxed ? (
            "All 18 plots tilled"
          ) : (
            <>
              {fmt(farmXp(hero))} / {fmt(need)} Farm XP
            </>
          )}
          <span className="ml-2">
            {slotsForLevel(level)} / {FARM_TOTAL_SLOTS} plots
          </span>
        </span>
      </div>
      {maxed ? (
        <div className="bar-track mt-2 h-2.5">
          <div className="farm-bar-max h-full" style={{ width: "100%" }} />
        </div>
      ) : (
        <div className="bar-track mt-2 h-2.5">
          <div
            className="farm-bar h-full"
            style={{ width: `${Math.round(farmProgress(hero) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

/** One seed row in the planting dialog. */
function SeedOption({
  hero,
  slot,
  kind,
  tier,
  onDone,
}: {
  hero: Hero;
  slot: number;
  kind: SeedKind;
  tier: number;
  onDone: (msg: string, bad?: boolean) => void;
}) {
  const held = seedCount(hero, kind, tier);
  const price = seedPrice(kind, tier);
  const affordable = held > 0 || hero.gold >= price;
  const plant = () => {
    let err: string | null = null;
    update((h) => {
      err = plantSeed(h, slot, kind, tier);
    });
    onDone(err ?? `${seedName(kind, tier)} planted in plot ${slot + 1}`, !!err);
  };
  return (
    <div className="slot flex flex-wrap items-center gap-2 p-2">
      <CropArt kind={kind} stage={0} size={30} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{seedName(kind, tier)}</div>
        <div className="text-[11px] text-muted-foreground">
          {durationLabel(kind, tier)} · pays{" "}
          {kind === "gold" ? (
            <>{fmt(seedReward(kind, tier))} gold</>
          ) : (
            <>{fmt(seedReward(kind, tier))} Farm XP</>
          )}{" "}
          · held ×{fmt(held)}
        </div>
      </div>
      <button
        className="btn-gold px-2.5 py-1 text-xs"
        disabled={!affordable}
        title={affordable ? "Plant this seed" : "Not enough gold"}
        onClick={plant}
      >
        {held > 0 ? (
          "Plant"
        ) : (
          <>
            Plant · <Gold n={price} className="text-primary-foreground" />
          </>
        )}
      </button>
    </div>
  );
}

/** The Farm: opened from the tree beside the Campaign Gate. */
export function FarmPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [pickSlot, setPickSlot] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  // One local ticker keeps growth timers visibly moving; the truth is the saved timestamp.
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!hero) return null;

  const now = Date.now();
  const level = farmLevel(hero);
  const unlocked = slotsForLevel(level);
  const ripe = readyCount(hero, now);
  const pouch = heldSeeds(hero);

  const say = (text: string, bad = false) => {
    setToast({ text, bad });
    window.setTimeout(() => setToast(null), 2600);
  };

  const plant = (index: number) => setPickSlot(index);

  const harvest = (index: number) => {
    const out: { got: ReturnType<typeof harvestSlot> } = { got: null };
    update((h) => {
      out.got = harvestSlot(h, index);
    });
    const got = out.got;
    if (!got) {
      say("That crop is still growing.", true);
      return;
    }
    const parts: string[] = [];
    if (got.gold > 0) parts.push(`+${fmt(got.gold)} gold`);
    if (got.xp > 0) parts.push(`+${fmt(got.xp)} Farm XP`);
    say(`Harvested ${parts.join(" · ")}`);
    if (got.levels > 0) setLevelUp(farmLevel(getState().hero ?? hero));
  };

  const harvestRipe = () => {
    const out: { total: ReturnType<typeof harvestAll> | null } = { total: null };
    update((h) => {
      out.total = harvestAll(h);
    });
    const total = out.total;
    if (!total || total.crops === 0) {
      say("Nothing is ripe yet.", true);
      return;
    }
    const parts: string[] = [];
    if (total.gold > 0) parts.push(`+${fmt(total.gold)} gold`);
    if (total.xp > 0) parts.push(`+${fmt(total.xp)} Farm XP`);
    say(`Harvested ${total.crops} crop${total.crops === 1 ? "" : "s"} · ${parts.join(" · ")}`);
    if (total.levels > 0) setLevelUp(farmLevel(getState().hero ?? hero));
  };

  const buy = (kind: SeedKind, tier: number, qty: number) => {
    let err: string | null = null;
    update((h) => {
      err = buySeed(h, kind, tier, qty);
    });
    if (err) say(err, true);
    else say(`Bought ${qty} × ${seedName(kind, tier)}`);
  };

  return (
    <Panel
      title="Farm"
      subtitle="Sow seeds, harvest the fields and raise your Farm Level"
      art="quest"
      onClose={onClose}
      wide
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <FarmProgress hero={hero} />
        <span className="slot flex items-center gap-1 px-2 py-1" title="Gold in your purse">
          <Gold n={hero.gold} />
        </span>
        <button
          className="btn-gold px-3 py-1.5 text-sm"
          disabled={ripe === 0}
          onClick={harvestRipe}
        >
          <Tractor className="mr-1 inline h-4 w-4" />
          Harvest All{ripe > 0 ? ` (${ripe})` : ""}
        </button>
      </div>

      {toast && (
        <p
          role="status"
          aria-live="polite"
          className={`anim-pop mb-2 rounded-md border px-3 py-1.5 text-center font-display text-sm ${toast.bad ? "border-hp/60 bg-hp/10 text-hp" : "border-r1/60 bg-r1/10 text-r1"}`}
        >
          {toast.text}
        </p>
      )}

      <div className="farm-field grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: FARM_TOTAL_SLOTS }, (_, index) => {
          const locked = index >= unlocked;
          const crop = locked ? null : cropAt(hero, index);
          const ready = !!crop && now >= crop.readyAt;
          const progress = crop ? cropProgress(crop, now) : 0;
          const stage = ready ? 2 : progress >= 0.45 ? 1 : 0;
          return (
            <button
              key={index}
              type="button"
              aria-label={
                locked
                  ? `Plot ${index + 1} locked — Farm Level ${unlockLevelForSlot(index)} required`
                  : crop
                    ? `${seedName(crop.kind, crop.tier)} in plot ${index + 1} — ${ready ? "ready to harvest" : timeLeft(crop, now)}`
                    : `Empty plot ${index + 1} — plant a seed`
              }
              disabled={locked || (!!crop && !ready)}
              onClick={() => (crop ? harvest(index) : plant(index))}
              className={`farm-plot relative flex aspect-square flex-col items-center justify-center gap-0.5 p-1 text-center transition ${locked ? "farm-plot-locked" : ready ? "farm-plot-ready anim-pop" : ""}`}
            >
              {locked ? (
                <span className="flex flex-col items-center gap-0.5 text-muted-foreground">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[10px] leading-tight">
                    Farm Lv {unlockLevelForSlot(index)}
                  </span>
                </span>
              ) : crop ? (
                <>
                  <CropArt kind={crop.kind} stage={stage as 0 | 1 | 2} size={44} />
                  {ready ? (
                    <span className="font-display text-[11px] font-bold text-r1">HARVEST</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Timer className="h-2.5 w-2.5" />
                      {timeLeft(crop, now)}
                    </span>
                  )}
                  <span className="text-[9px] text-muted-foreground">
                    Lv {crop.tier} {crop.kind === "gold" ? "gold" : "XP"}
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Sprout className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-display">Plant</span>
                </span>
              )}
              {crop && !ready && (
                <span
                  className="farm-plot-progress"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="slot p-3">
          <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold">
            <Wheat className="h-4 w-4" />
            Seed pouch
          </div>
          {pouch.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No seeds in the pouch. Buy some from the Farm tab of the Shop, or plant straight into
              an empty plot.
            </p>
          ) : (
            <ul className="space-y-1">
              {pouch.map((s) => (
                <li
                  key={`${s.kind}:${s.tier}`}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1">
                    <CropArt kind={s.kind} stage={0} size={20} />
                    <span className="truncate">{seedName(s.kind, s.tier)}</span>
                  </span>
                  <b className="text-gold">×{fmt(s.count)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="slot p-3">
          <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold">
            <Sparkles className="h-4 w-4" />
            Farm Shop
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Gold Seeds pay gold when harvested; XP Seeds pay Farm XP and are the only way to level
            the Farm. Higher tiers unlock as the Farm grows.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => buy("gold", level, 1)}>
              <Coins className="mr-1 inline h-3.5 w-3.5" />
              Gold Seed Lv {level} · <Gold n={seedPrice("gold", level)} />
            </button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => buy("xp", level, 1)}>
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              XP Seed Lv {level} · <Gold n={seedPrice("xp", level)} />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            The full seed catalogue lives in the Shop's Farm tab.
          </p>
        </section>
      </div>

      {pickSlot !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 p-4"
          onClick={() => setPickSlot(null)}
        >
          <div
            className="game-panel anim-pop max-h-[85vh] w-full max-w-lg overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg text-gold">Plant in plot {pickSlot + 1}</h3>
              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setPickSlot(null)}>
                Close
              </button>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: level }, (_, i) => level - i).map((tier) => (
                <div key={`t${tier}`} className="space-y-1.5">
                  <SeedOption
                    hero={hero}
                    slot={pickSlot}
                    kind="gold"
                    tier={tier}
                    onDone={(m, bad) => {
                      say(m, bad);
                      if (!bad) setPickSlot(null);
                    }}
                  />
                  <SeedOption
                    hero={hero}
                    slot={pickSlot}
                    kind="xp"
                    tier={tier}
                    onDone={(m, bad) => {
                      say(m, bad);
                      if (!bad) setPickSlot(null);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {levelUp !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 p-4"
          onClick={() => setLevelUp(null)}
        >
          <div
            className="game-panel anim-pop farm-levelup w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-2xl text-gold">Farm Level Up!</div>
            <div className="my-2 font-display text-6xl font-black text-r1">{farmLevel(hero)}</div>
            <p className="text-sm">
              A new plot is tilled. {slotsForLevel(farmLevel(hero))} of {FARM_TOTAL_SLOTS} plots are
              now yours.
            </p>
            <button className="btn-gold mt-4 w-full py-2" onClick={() => setLevelUp(null)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/** The Shop's dedicated Farm tab: Gold Seeds and XP Seeds, gated by Farm Level. */
export function FarmShopTab({ hero }: { hero: Hero }) {
  const [notice, setNotice] = useState<{ ok: boolean; t: string } | null>(null);
  const level = farmLevel(hero);
  const buy = (kind: SeedKind, tier: number, qty: number) => {
    let err: string | null = null;
    update((h) => {
      err = buySeed(h, kind, tier, qty);
    });
    setNotice(
      err ? { ok: false, t: err } : { ok: true, t: `Bought ${qty} × ${seedName(kind, tier)}` },
    );
  };
  const section = (kind: SeedKind, title: string, blurb: string) => (
    <section className="mt-4">
      <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold">
        {kind === "gold" ? <Wheat className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {title}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{blurb}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: FARM_MAX_LEVEL }, (_, i) => i + 1).map((tier) => {
          const locked = tier > level;
          const price = seedPrice(kind, tier);
          const held = seedCount(hero, kind, tier);
          const reward = kind === "gold" ? goldSeedReward(tier) : xpSeedReward(tier);
          return (
            <article
              key={tier}
              className={`slot flex flex-col items-center gap-1 p-2 text-center ${locked ? "opacity-60" : ""}`}
            >
              <CropArt kind={kind} stage={locked ? 0 : 2} size={34} />
              <div className="text-[11px] font-bold">{seedName(kind, tier)}</div>
              <div className="text-[10px] text-muted-foreground">
                {durationLabel(kind, tier)} · Lv {tier} Farm
              </div>
              <div className="text-[10px]">
                Pays{" "}
                {kind === "gold" ? (
                  <b className="text-gold">{fmt(reward)} gold</b>
                ) : (
                  <b className="text-[#b57bff]">{fmt(reward)} XP</b>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">Held ×{fmt(held)}</div>
              {locked ? (
                <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Farm Level {tier}
                </span>
              ) : (
                <div className="mt-1 flex w-full gap-1">
                  <button
                    className="btn-gold flex-1 px-1 py-1 text-[10px]"
                    disabled={hero.gold < price}
                    aria-label={`Buy ${seedName(kind, tier)}`}
                    onClick={() => buy(kind, tier, 1)}
                  >
                    ×1 · <Gold n={price} className="text-primary-foreground" />
                  </button>
                  <button
                    className="btn-ghost px-1 py-1 text-[10px]"
                    disabled={hero.gold < price * 5}
                    aria-label={`Buy five ${seedName(kind, tier)}`}
                    onClick={() => buy(kind, tier, 5)}
                  >
                    ×5
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        Seeds for the fields by the Campaign Gate. Gold Seeds grow gold; XP Seeds grow Farm XP,
        which raises the Farm Level and tills one more plot each time. Seeds unlock as the Farm
        grows and keep in your pouch until planted.
      </p>
      {notice && (
        <p role="status" className={`mt-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>
          {notice.t}
        </p>
      )}
      {section(
        "gold",
        "Gold Seeds",
        "Paid in gold. A ripe Gold Seed pays 30% more than it cost, so the fields are a slow, steady income.",
      )}
      {section(
        "xp",
        "XP Seeds",
        "Paid in gold, and the only source of Farm XP. Each harvest pays a share of a Farm Level — never a whole one.",
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">
        Farm Level {level} of {FARM_MAX_LEVEL} · seeds up to Lv {level} are available.
      </p>
    </div>
  );
}

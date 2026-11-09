import { useEffect, useState } from "react";
import { Coins, Pickaxe, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { Gold, Panel, fmt } from "./ui";
import {
  MINE_MAX_LEVEL,
  MINE_STORE_HOURS,
  collectMine,
  mineCapacity,
  minePerHour,
  mineStatus,
  upgradeMine,
} from "./mine";

/** "7h 20m" / "41m" for the cart's remaining filling time. */
function fillLabel(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "Full";
  const mins = Math.ceil(ms / 60_000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  return `${mins}m`;
}

/**
 * The Gold Mine beside the Guild Hall: a one-screen building where the hero reads the hourly
 * rate, collects the cart whenever they like and buys the next level of the ladder.
 */
export function GoldMinePanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  // One local ticker keeps the cart visibly filling; the truth is the saved timestamp.
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!hero) return null;

  const now = Date.now();
  const mine = mineStatus(hero, hero.level, now);
  const collectable = Math.floor(mine.stored);
  const canAfford = mine.upgradeCost !== null && hero.gold >= mine.upgradeCost;

  const say = (text: string, bad = false) => setToast({ text, bad });

  const collect = () => {
    const out: { got: ReturnType<typeof collectMine> } = { got: null };
    update((h) => {
      out.got = collectMine(h);
    });
    if (!out.got) {
      say("The cart is still empty — give the miners a little time.", true);
      return;
    }
    say(`Collected ${fmt(out.got.gold)} gold from the cart.`);
  };

  const upgrade = () => {
    let err: string | null = "Please wait for your character to finish syncing, then try again.";
    update((h) => {
      err = upgradeMine(h);
    });
    if (err) say(err, true);
    else say(`Gold Mine upgraded to Level ${Math.min(MINE_MAX_LEVEL, mine.level + 1)}.`);
  };

  return (
    <Panel
      title="Gold Mine"
      subtitle="Gold while you are away — collect the cart whenever you like"
      art="anvil"
      onClose={onClose}
      wide
    >
      {toast && (
        <p
          role="status"
          aria-live="polite"
          className={`anim-pop mb-3 rounded-md border px-3 py-1.5 text-center font-display text-sm ${toast.bad ? "border-hp/60 bg-hp/10 text-hp" : "border-r1/60 bg-r1/10 text-r1"}`}
        >
          {toast.text}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <section className="slot p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="font-display text-lg text-gold">
                Level <b className="text-2xl">{mine.level}</b>
                <span className="ml-1 text-xs text-muted-foreground">/ {MINE_MAX_LEVEL}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The miners never sleep: every hour this level banks gold, in or out of the game.
              </p>
            </div>
            <div className="text-right">
              <Gold n={mine.perHour} />
              <span className="block text-[11px] text-muted-foreground">per hour</span>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border/60 bg-background/40 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-display text-sm text-gold">The cart</span>
              <span className="text-xs text-muted-foreground">
                <b className="text-foreground">{fmt(collectable)}</b> / {fmt(mine.capacity)} gold
              </span>
            </div>
            <div className="bar-track mt-2 h-3" role="progressbar" aria-label="Gold in the cart" aria-valuemin={0} aria-valuemax={Math.round(mine.capacity)} aria-valuenow={collectable}>
              <div className="farm-bar h-full" style={{ width: `${Math.round(mine.fill * 100)}%` }} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Timer className="h-3 w-3" aria-hidden />
              {mine.full
                ? `Full — a cart holds ${MINE_STORE_HOURS} hours of mining, so collect it to start earning again.`
                : `Fills in ${fillLabel(mine.msToFull)} · a full cart holds ${MINE_STORE_HOURS} hours of mining.`}
            </p>
            <Button className="mt-3 w-full py-2" disabled={collectable < 1} onClick={collect}>
              <Coins className="mr-1 inline h-4 w-4" />
              {collectable < 1 ? "Nothing to collect yet" : `Collect ${fmt(collectable)} gold`}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Gold keeps filling while you fight, farm or are away from the castle. Collecting is
            always free and never costs anything — the cart simply starts filling again.
          </p>
        </section>

        <section className="slot flex flex-col p-4">
          <div className="flex items-center gap-2 font-display text-gold">
            <Pickaxe className="h-4 w-4" /> Upgrade the shaft
          </div>
          {mine.maxed ? (
            <div className="mt-3 rounded-md border border-r1/50 bg-r1/10 p-3 text-sm">
              <b className="text-r1">Deepest shaft reached.</b>
              <p className="mt-1 text-xs text-muted-foreground">
                Level {MINE_MAX_LEVEL} pays {fmt(minePerHour(MINE_MAX_LEVEL))} gold an hour and holds{" "}
                {fmt(mineCapacity(MINE_MAX_LEVEL))} gold.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Each level widens the shaft: more gold every hour and a bigger cart.
              </p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Now</dt>
                  <dd>{fmt(mine.perHour)} gold / hour · holds {fmt(mine.capacity)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Next level</dt>
                  <dd className="text-r1">
                    {fmt(mine.nextPerHour ?? 0)} gold / hour · holds {fmt(mineCapacity(mine.level + 1))}
                  </dd>
                </div>
              </dl>
              <Button className="mt-auto w-full py-2" disabled={!canAfford} onClick={upgrade}
                title={canAfford ? "" : `Not enough gold — ${fmt(mine.upgradeCost ?? 0)} needed`}>
                <Pickaxe className="mr-1 inline h-4 w-4" />Upgrade · {fmt(mine.upgradeCost ?? 0)} gold
              </Button>
              {!canAfford && (
                <p className="mt-2 text-center text-[11px] text-hp">
                  You have <Gold n={hero.gold} /> — {fmt((mine.upgradeCost ?? 0) - hero.gold)} more gold needed.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </Panel>
  );
}

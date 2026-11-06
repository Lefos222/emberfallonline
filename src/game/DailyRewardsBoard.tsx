import { useEffect, useState } from "react";
import { Check, Gift, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import emberArt from "@/assets/gathering-ember.jpg";
import { update, useGame } from "./store";
import { GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { ArtIcon } from "./ArtIcon";
import { DailyRewardArt } from "./DailyRewardArt";
import { VipDailyBoard } from "./VipDailyBoard";
import {
  CHESTS,
  REWARD_CHEST_HOURS,
  claimRewardChest,
  formatChestCountdown,
  rewardChestCountdown,
  rewardChestReady,
  type ChestKind,
} from "./chests";
import {
  DAILY_REWARDS,
  DAILY_REWARD_DAYS,
  boardReward,
  canClaimBoardDay,
  claimBoardDay,
  claimedBoardDays,
  nextBoardDay,
} from "./daily-rewards";

/**
 * The free reward chest on a timer. Collecting puts a real chest in the Armory
 * vault, so the player decides when to redeem it. Every fourth chest is a Gem
 * Chest, and the pips below the countdown track that.
 */
function RewardChest() {
  const { hero } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [receipt, setReceipt] = useState<ChestKind | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!hero) return null;

  const claims = Math.max(0, Math.floor(hero.rewardChest?.claims ?? 0));
  const nextKind: ChestKind = (claims + 1) % 4 === 0 ? "gem" : "gold";
  const ready = rewardChestReady(hero, now);
  const gem = nextKind === "gem";
  const toGem = 4 - (claims % 4);
  const claim = () => {
    setError("");
    setReceipt(null);
    let kind: ChestKind | null = null;
    update((h) => {
      if (!rewardChestReady(h)) return;
      kind = claimRewardChest(h);
    });
    if (!kind) {
      setError("Your save is still syncing — try the claim again in a moment.");
      return;
    }
    setReceipt(kind);
  };

  return (
    <div
      role="group"
      aria-label="Reward chest"
      className={`relative mb-4 overflow-hidden rounded-xl border-2 p-3 ${gem ? "border-r3/70" : "border-gold/60"}`}
      style={{
        background: gem
          ? "radial-gradient(120% 150% at 10% 0%, oklch(0.34 0.12 300 / 0.5), transparent 62%), linear-gradient(120deg, oklch(0.24 0.05 295 / 0.95), oklch(0.16 0.03 25 / 0.97))"
          : "radial-gradient(120% 150% at 10% 0%, oklch(0.44 0.1 70 / 0.5), transparent 62%), linear-gradient(120deg, oklch(0.26 0.05 45 / 0.97), oklch(0.16 0.03 25 / 0.97))",
      }}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full blur-2xl ${gem ? "bg-r3/30" : "bg-gold/25"}`}
      />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="relative shrink-0">
          <span
            aria-hidden
            className={`absolute inset-1 rounded-full blur-md ${gem ? "bg-r3/50" : "bg-gold/45"}`}
          />
          {gem ? (
            <GemChestIcon size={64} className="relative rounded-lg ring-2 ring-white/20" />
          ) : (
            <GoldChestIcon size={64} className="relative rounded-lg ring-2 ring-white/20" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ArtIcon name="gift" size={18} />
            <span className="font-display text-lg text-gold">Reward Chest</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${gem ? "bg-r3/25 text-r3" : "bg-gold/20 text-gold"}`}
            >
              {CHESTS[nextKind].name}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground/80">
            A free {CHESTS[nextKind].name} every {REWARD_CHEST_HOURS} hours. It is stored in your
            Armory vault — open it whenever you like.
          </p>
          <p
            className={`mt-1 text-sm font-bold ${ready ? "flex items-center gap-1.5 text-r1" : "text-foreground/90"}`}
          >
            {ready ? (
              <>
                <Sparkles className="h-4 w-4" />
                Ready to collect.
              </>
            ) : (
              `Next chest in ${formatChestCountdown(rewardChestCountdown(hero, now))}`
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Gem track
            </span>
            <span className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`h-2 w-5 rounded-full ${i < claims % 4 ? "bg-gold" : "bg-white/15"}`}
                />
              ))}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {toGem === 4 ? "Gem Chest next" : `${toGem} chest${toGem === 1 ? "" : "s"} to a Gem Chest`}
            </span>
          </div>
        </div>
        <Button disabled={!ready} onClick={claim}>
          <Gift />
          {ready ? `Collect ${CHESTS[nextKind].name}` : "Refilling"}
        </Button>
      </div>
      {receipt && (
        <p role="status" className="w-full text-sm text-r1">
          {CHESTS[receipt].name} added to your vault — open it from the Armory.
        </p>
      )}
      {error && (
        <p role="alert" className="w-full text-sm text-hp">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The 30-day reward board: one gift per Greek day, taken in order. Chest days bundle a bigger
 * gold and material gift; the board rolls over to day 1 after the thirtieth claim.
 */
export function DailyRewardsBoard() {
  const { hero } = useGame();
  const [receipt, setReceipt] = useState<string[]>([]);
  const [error, setError] = useState("");
  if (!hero) return null;

  const claimed = claimedBoardDays(hero);
  const next = nextBoardDay(hero);
  const ready = canClaimBoardDay(hero);
  const cycles = hero.dailyRewards?.cycles ?? 0;
  const today = boardReward(next);
  const progress = Math.round((claimed / DAILY_REWARD_DAYS) * 100);

  const claim = () => {
    setError("");
    let lines: string[] = [];
    update((h) => {
      lines = claimBoardDay(h);
    });
    if (lines.length === 0) {
      setReceipt([]);
      setError("Your save is still syncing — try the claim again in a moment.");
      return;
    }
    setReceipt(lines);
  };

  return (
    <>
      <RewardChest />
      <section className="mb-2 pb-4" aria-label="30-day reward board">
        <div className="relative overflow-hidden rounded-xl border-2 border-gold/45 shadow-[0_10px_30px_oklch(0_0_0/0.45)]">
          <img
            src={emberArt}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-70"
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, oklch(0.13 0.035 25 / 0.9) 8%, oklch(0.22 0.06 50 / 0.38) 52%, oklch(0.13 0.035 25 / 0.92))",
            }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-gold/85">
                <ArtIcon name="calendar" size={14} /> Daily login
              </p>
              <h3 className="panel-title text-2xl font-bold md:text-3xl">30-Day Reward Board</h3>
              <p className="mt-1 text-sm text-foreground/85">
                One gift each Greek day, in order — next up is day {next} of {DAILY_REWARD_DAYS}
                {cycles > 0 ? ` · ${cycles} full cycle${cycles > 1 ? "s" : ""} finished` : ""}.
              </p>
              <p className="text-xs text-muted-foreground">
                {today.label} · the board refills at Greek midnight.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-gold/40 bg-black/35 px-2.5 py-1.5 sm:flex">
                <DailyRewardArt rw={today} size={22} />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Today
                  </div>
                  <div className="max-w-[12rem] truncate text-xs font-semibold text-gold">
                    {today.label}
                  </div>
                </div>
              </div>
              <Button disabled={!ready} onClick={claim}>
                <Gift />
                {ready ? `Claim day ${next}` : "Claimed today"}
              </Button>
            </div>
          </div>
          <div className="relative px-4 pb-4">
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="uppercase tracking-wider">Cycle progress</span>
              <span>
                {claimed} / {DAILY_REWARD_DAYS} days
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full border border-gold/40 bg-black/45"
              role="progressbar"
              aria-label="Board progress"
              aria-valuemin={0}
              aria-valuemax={DAILY_REWARD_DAYS}
              aria-valuenow={claimed}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${progress}%`,
                  background: "var(--gold-gradient)",
                  boxShadow: "0 0 12px oklch(0.85 0.15 82 / 0.55)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {DAILY_REWARDS.map((rw) => {
            const done = rw.day <= claimed;
            const isToday = rw.day === next && ready;
            const state = done ? "Claimed" : isToday ? "Available now" : "Locked";
            const grand = rw.day === DAILY_REWARD_DAYS;
            return (
              <div
                key={rw.day}
                aria-label={`Day ${rw.day}: ${rw.label} — ${state.toLowerCase()}`}
                className={[
                  "reward-tile flex flex-col items-center gap-1 p-2 text-center",
                  done ? "reward-tile-claimed opacity-70" : "",
                  isToday ? "reward-tile-next reward-glow" : "",
                  grand && !done ? "reward-tile-grand" : "",
                  rw.chest && !done && !isToday ? "ring-1 ring-gold/30" : "",
                ].join(" ")}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="rounded-sm bg-black/35 px-1 font-display text-[10px] font-bold uppercase tracking-wider text-gold/90">
                    Day {rw.day}
                  </span>
                  {(rw.chest || grand) && <Sparkles className="h-3 w-3 shrink-0 text-gold" />}
                </div>
                <span className="flex min-h-[26px] items-center">
                  <DailyRewardArt rw={rw} size={grand ? 28 : 24} />
                </span>
                <span
                  className={`text-[11px] font-semibold leading-tight ${rw.chest || grand ? "text-gold" : "text-foreground/90"}`}
                >
                  {rw.label}
                </span>
                <span
                  className={`mt-auto flex items-center justify-center gap-1 text-[10px] ${isToday ? "font-bold text-gold" : "text-muted-foreground"}`}
                >
                  {done ? (
                    <>
                      <Check className="h-3 w-3" />
                      Claimed
                    </>
                  ) : isToday ? (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Available now
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      Locked
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {receipt.length > 0 && (
          <p role="status" className="mt-3 break-words text-sm text-r1">
            Received: {receipt.join(" · ")}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-hp">
            {error}
          </p>
        )}
      </section>
      <VipDailyBoard />
    </>
  );
}

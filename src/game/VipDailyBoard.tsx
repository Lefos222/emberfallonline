import { useState } from "react";
import { Check, Crown, Gift, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { ArtIcon } from "./ArtIcon";
import { DailyRewardArt } from "./DailyRewardArt";
import {
  DAILY_REWARD_DAYS,
  VIP_BOARD_LOCKED,
  VIP_BOARD_MIN_LEVEL,
  VIP_DAILY_REWARDS,
  canClaimVipBoardDay,
  claimVipBoardDay,
  vipBoardReward,
  vipBoardUnlocked,
  vipClaimedBoardDays,
  vipNextBoardDay,
} from "./daily-rewards";

/**
 * The VIP board: a second thirty-day track that only VIP 3 members can claim. It is far richer
 * than the free board — several gifts every day, more gold, better gems, gem chests
 * and elite sigils — while still never paying Diamonds (that wallet is server-owned).
 */
export function VipDailyBoard() {
  const { hero } = useGame();
  const [receipt, setReceipt] = useState<string[]>([]);
  const [error, setError] = useState("");
  if (!hero) return null;

  const unlocked = vipBoardUnlocked(hero);
  const claimed = vipClaimedBoardDays(hero);
  const next = vipNextBoardDay(hero);
  const ready = canClaimVipBoardDay(hero);
  const today = vipBoardReward(next);
  const cycles = hero.dailyRewards?.vip?.cycles ?? 0;
  const progress = Math.round((claimed / DAILY_REWARD_DAYS) * 100);

  const claim = () => {
    setError("");
    const lines: string[] = [];
    try {
      update((h) => {
        lines.push(...claimVipBoardDay(h));
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : VIP_BOARD_LOCKED);
      return;
    }
    if (lines.length === 0) {
      setReceipt([]);
      setError("Your save is still syncing — try the claim again in a moment.");
      return;
    }
    setReceipt(lines);
  };

  return (
    <section className="mt-4 pb-4" aria-label="VIP reward board">
      <div className="relative overflow-hidden rounded-xl border-2 border-r3/60 shadow-[0_10px_30px_oklch(0_0_0/0.45)]">
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 150% at 8% 0%, oklch(0.38 0.12 300 / 0.55), transparent 60%), linear-gradient(110deg, oklch(0.17 0.05 300 / 0.97), oklch(0.19 0.05 30 / 0.92))",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-r3">
              <Crown size={14} /> VIP {VIP_BOARD_MIN_LEVEL}+ board
            </p>
            <h3 className="panel-title text-2xl font-bold md:text-3xl">VIP Reward Board</h3>
            <p className="mt-1 text-sm text-foreground/85">
              {unlocked
                ? `A second thirty-day board for members — next up is VIP day ${next} of ${DAILY_REWARD_DAYS}${
                    cycles > 0 ? ` · ${cycles} full cycle${cycles > 1 ? "s" : ""} finished` : ""
                  }.`
                : `A second thirty-day board stacked with gold, gems, chests and materials — it opens at VIP ${VIP_BOARD_MIN_LEVEL}.`}
            </p>
            <p className="text-xs text-muted-foreground">
              {unlocked
                ? `${today.label} · it refills at Greek midnight, separately from the free board.`
                : `${VIP_BOARD_LOCKED} Members receive far more gold, better gems, extra chests and rare materials — never Diamonds.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-r3/40 bg-black/35 px-2.5 py-1.5 sm:flex">
              <DailyRewardArt rw={today} size={22} />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Next
                </div>
                <div className="max-w-[12rem] truncate text-xs font-semibold text-r3">
                  {today.label}
                </div>
              </div>
            </div>
            <Button disabled={!ready} onClick={claim}>
              {unlocked ? <Gift /> : <Lock />}
              {!unlocked
                ? `VIP ${VIP_BOARD_MIN_LEVEL} required`
                : ready
                  ? `Claim VIP day ${next}`
                  : "Claimed today"}
            </Button>
          </div>
        </div>
        <div className="relative px-4 pb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="uppercase tracking-wider">VIP cycle progress</span>
            <span>
              {claimed} / {DAILY_REWARD_DAYS} days
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full border border-r3/40 bg-black/45"
            role="progressbar"
            aria-label="VIP board progress"
            aria-valuemin={0}
            aria-valuemax={DAILY_REWARD_DAYS}
            aria-valuenow={claimed}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, oklch(0.62 0.16 305), oklch(0.78 0.14 330))",
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {VIP_DAILY_REWARDS.map((rw) => {
          const done = rw.day <= claimed;
          const isToday = unlocked && rw.day === next && ready;
          const state = done ? "Claimed" : isToday ? "Available now" : "Locked";
          const grand = rw.day === DAILY_REWARD_DAYS;
          return (
            <div
              key={rw.day}
              aria-label={`VIP day ${rw.day}: ${rw.label} — ${state.toLowerCase()}`}
              className={[
                "reward-tile flex flex-col items-center gap-1 p-2 text-center",
                done ? "reward-tile-claimed opacity-70" : "",
                isToday ? "reward-tile-next reward-glow" : "",
                grand && !done ? "reward-tile-grand" : "",
                !unlocked ? "opacity-60" : "",
                rw.chest && !done && !isToday ? "ring-1 ring-r3/30" : "",
              ].join(" ")}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="rounded-sm bg-black/35 px-1 font-display text-[10px] font-bold uppercase tracking-wider text-r3/90">
                  VIP {rw.day}
                </span>
                {(rw.chest || grand) && <Sparkles className="h-3 w-3 shrink-0 text-r3" />}
              </div>
              <span className="flex min-h-[26px] items-center">
                <DailyRewardArt rw={rw} size={grand ? 28 : 24} />
              </span>
              <span
                className={`text-[11px] font-semibold leading-tight ${
                  rw.chest || grand ? "text-r3" : "text-foreground/90"
                }`}
              >
                {rw.label}
              </span>
              <span
                className={`mt-auto flex items-center justify-center gap-1 text-[10px] ${
                  isToday ? "font-bold text-r3" : "text-muted-foreground"
                }`}
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
  );
}

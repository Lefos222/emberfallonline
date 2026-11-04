import { useEffect, useState } from "react";
import { Check, Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { GemChestIcon, GoldChestIcon } from "./CoinIcon";
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
 * vault, so the player decides when to redeem it.
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
    <div className="slot mb-4 flex flex-wrap items-center gap-3 border-gold/50 bg-gold/5 p-3" aria-label="Reward chest">
      {nextKind === "gem" ? <GemChestIcon size={52} /> : <GoldChestIcon size={52} />}
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg text-gold">Reward Chest</div>
        <p className="text-xs text-muted-foreground">
          A free {CHESTS[nextKind].name} every {REWARD_CHEST_HOURS} hours. It is stored in your Armory vault —
          open it whenever you like.
        </p>
        <p className="text-xs font-bold">
          {ready ? "Ready to collect." : `Next chest in ${formatChestCountdown(rewardChestCountdown(hero, now))}`}
        </p>
      </div>
      <Button disabled={!ready} onClick={claim}>
        <Gift />
        {ready ? `Collect ${CHESTS[nextKind].name}` : "Refilling"}
      </Button>
      {receipt && (
        <p role="status" className="w-full text-sm text-r1">
          {CHESTS[receipt].name} added to your vault — open it from the Armory.
        </p>
      )}
      {error && <p role="alert" className="w-full text-sm text-hp">{error}</p>}
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
    <section className="mb-2 border-b border-border pb-5" aria-label="30-day reward board">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-gold">30-Day Reward Board</h3>
          <p className="text-sm text-muted-foreground">
            One gift each Greek day, in order — next up is day {next} of {DAILY_REWARD_DAYS}
            {cycles > 0 ? ` · ${cycles} full cycle${cycles > 1 ? "s" : ""} finished` : ""}.
          </p>
          <p className="text-xs text-muted-foreground">
            {boardReward(next).label} · the board refills at Greek midnight.
          </p>
        </div>
        <Button disabled={!ready} onClick={claim}>
          <Gift />
          {ready ? `Claim day ${next}` : "Claimed today"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {DAILY_REWARDS.map((rw) => {
          const done = rw.day <= claimed;
          const today = rw.day === next && ready;
          const state = done ? "Claimed" : today ? "Available now" : "Locked";
          return (
            <div
              key={rw.day}
              aria-label={`Day ${rw.day}: ${rw.label} — ${state.toLowerCase()}`}
              className={`slot flex flex-col gap-1 p-2 text-center text-[11px] ${done ? "opacity-55" : today ? "ring-2 ring-gold" : "opacity-85"} ${rw.chest ? "bg-gold/10" : ""}`}
            >
              <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
                Day {rw.day}
              </span>
              <span className={`font-semibold leading-tight ${rw.chest ? "text-gold" : ""}`}>
                {rw.label}
              </span>
              <span className="mt-auto flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                {done ? (
                  <>
                    <Check className="h-3 w-3" />
                    Claimed
                  </>
                ) : today ? (
                  "Available now"
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
    </>
  );
}

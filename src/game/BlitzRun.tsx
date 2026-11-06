import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { premiumState } from "./economy";
import { payBlitzSkip } from "./economy-services";
import { Gold, fmt } from "./ui";
import { ArtIcon } from "./ArtIcon";
import {
  BLITZ_DURATION_MS,
  BLITZ_SKIP_DIAMONDS,
  formatBlitzLeft,
  settleBlitzRun,
  type BlitzReceipt,
} from "./blitz-run";

/** A skip that fails because the premium RPC is not deployed yet is not the player's fault. */
function skipError(e: unknown): string {
  const message = e instanceof Error ? e.message : "The skip could not be bought.";
  if (/could not find the function|schema cache|does not exist/i.test(message))
    return "Finishing a blitz early is not live yet — wait for the run to end.";
  return message;
}

const receiptLine = (r: BlitzReceipt) =>
  `Blitz finished — +${fmt(r.xp)} XP, +${fmt(r.gold)} gold${r.tokens ? `, +${fmt(r.tokens)} tokens` : ""}`;

/** Pay the run onto the live save and hand back what it paid. */
function settleNow(): BlitzReceipt | null {
  const out: { paid: BlitzReceipt | null } = { paid: null };
  update((h) => {
    out.paid = settleBlitzRun(h);
  });
  return out.paid;
}

/**
 * The run a blitz turns into: a ten-minute countdown that locks battles until it lands, with
 * 25 Diamonds paid to finish it on the spot. It pays itself out the moment the clock runs out.
 */
export function BlitzRunCard() {
  const { hero } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [receipt, setReceipt] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const run = hero?.blitzRun;
  const endsAt = run?.endsAt ?? 0;

  // The run pays as soon as its ten minutes are up, even while the panel sits open.
  useEffect(() => {
    if (!run || endsAt > now) return;
    const paid = settleNow();
    if (paid) setReceipt(receiptLine(paid));
  }, [run, endsAt, now]);

  if (!hero || !run) {
    return receipt ? (
      <p role="status" className="mt-3 text-sm text-r1">
        {receipt}
      </p>
    ) : null;
  }

  const left = Math.max(0, endsAt - now);
  const pct = Math.min(
    100,
    Math.max(0, Math.round(((BLITZ_DURATION_MS - left) / BLITZ_DURATION_MS) * 100)),
  );
  const balance = premiumState(hero).balance;
  const short = balance < BLITZ_SKIP_DIAMONDS;

  const skip = async () => {
    setError("");
    setBusy(true);
    try {
      await payBlitzSkip();
      const paid = settleNow();
      if (paid) setReceipt(receiptLine(paid));
    } catch (e) {
      setError(skipError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="group" aria-label="Running blitz" className="slot mt-3 border-gold/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Blitz running · {run.gate === "campaign" ? "campaign" : "conquest"} {run.target}
        </span>
        <span className="font-bold tabular-nums">{formatBlitzLeft(left)}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full border border-gold/40 bg-black/45"
        role="progressbar"
        aria-label="Blitz progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "var(--gold-gradient)" }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        The run pays <span className="font-bold text-xp">+{fmt(run.xp)} XP</span>
        {run.tokens ? (
          <>
            {" "}
            and <span className="font-bold text-gold">+{fmt(run.tokens)} tokens</span>
          </>
        ) : null}{" "}
        and <Gold n={run.gold} /> when it lands. No battle can start until it finishes.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={busy || short} onClick={() => void skip()}>
          <ArtIcon name="diamond" size={16} />
          Finish now · {BLITZ_SKIP_DIAMONDS}
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {short
            ? `Needs ${BLITZ_SKIP_DIAMONDS} Diamonds — you have ${fmt(balance)}.`
            : `You have ${fmt(balance)} Diamonds.`}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-hp">
          {error}
        </p>
      )}
      {receipt && (
        <p role="status" className="mt-2 text-sm text-r1">
          {receipt}
        </p>
      )}
    </div>
  );
}

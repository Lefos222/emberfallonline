import { Crown, Gift, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { claimVipActivity, openVipActivities, vipActivityStates } from "./vip-activities";
import { vipLevelOf } from "./vip-perks";

/** The two VIP-only daily activities, shown inside the Premium Shop's VIP tab. */
export function VipActivities() {
  const { hero } = useGame();
  const [receipt, setReceipt] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Roll today's baseline once, so the activities count from the first visit of the day.
  useEffect(() => {
    update((h) => {
      openVipActivities(h);
    });
  }, []);

  if (!hero) return null;
  const vip = vipLevelOf(hero);
  const states = vipActivityStates(hero);

  const claim = (id: string) => {
    const lines: string[] = [];
    try {
      update((h) => {
        lines.push(...claimVipActivity(h, id));
      });
      setReceipt(lines);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The activity could not be claimed.");
    }
  };

  return (
    <section aria-label="VIP-only activities" className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <Crown size={16} className="text-gold" />
        <h3 className="font-display text-lg">VIP-only activities</h3>
        {vip < 1 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Members only
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {states.map(({ def, progress, claimed, ready, locked }) => (
          <article key={def.id} className="slot flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display text-base">{def.name}</h4>
              <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                VIP
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{def.desc}</p>
            <div
              className="h-2 overflow-hidden rounded-full bg-black/40"
              role="progressbar"
              aria-label={`${def.name} progress`}
              aria-valuemin={0}
              aria-valuemax={def.goal}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-gold transition-[width]"
                style={{ width: `${Math.round((progress / def.goal) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {progress} / {def.goal} · {def.reward}
            </p>
            <Button
              className="mt-auto w-full"
              size="sm"
              disabled={!ready || claimed}
              onClick={() => claim(def.id)}
            >
              {locked ? <Lock /> : ready ? <Gift /> : <Sparkles />}
              {locked
                ? "VIP members only"
                : claimed
                  ? "Claimed today"
                  : ready
                    ? "Claim reward"
                    : "In progress"}
            </Button>
          </article>
        ))}
      </div>
      {receipt.length > 0 && (
        <p role="status" className="mt-2 break-words text-sm text-r1">
          Received: {receipt.join(" · ")}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-hp">
          {error}
        </p>
      )}
    </section>
  );
}

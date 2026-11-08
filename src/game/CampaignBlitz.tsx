import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLITZ_PER_DAY, blitzesLeft } from "./conquest";
import {
  campaignBlitz,
  campaignBlitzBlocker,
  campaignBlitzRewards,
  campaignStagesCleared,
} from "./campaign-blitz";
import { BlitzRunCard } from "./BlitzRun";
import type { Hero } from "./data";
import { update } from "./store";
import { Gold, fmt } from "./ui";

/**
 * The Campaign Gate's blitz: instantly clear the stages you have already beaten.
 * It spends the same three-per-day allowance as the Conquest Gate.
 */
export function CampaignBlitz({ hero }: { hero: Hero }) {
  const cap = campaignStagesCleared(hero);
  const [target, setTarget] = useState(() => Math.max(1, cap || 1));
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
  const left = blitzesLeft(hero);
  const blocked = campaignBlitzBlocker(hero, usable);
  const preview = blocked ? null : campaignBlitzRewards(usable);
  const jump = (n: number) => {
    setTarget(n);
    setMsg(null);
  };

  return (
    <div className="slot mt-5 p-3">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Blitz
        </span>
        <span className="text-xs font-bold">
          Blitzes today {Math.min(left, BLITZ_PER_DAY)}/{BLITZ_PER_DAY}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Clear stages 1 to a stage you have already beaten without fighting them again. Your record
        is stage {cap}; a blitz pays those stages' gold but only 30% of their XP, and it takes ten
        minutes to run — no battle can start until it lands, and 25 Diamonds finish it on the spot.
        It shares the daily blitz allowance with the Conquest Gate, which returns at Greek midnight.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs">
          Blitz to stage
          <input
            aria-label="Blitz target stage"
            type="number"
            min={1}
            max={Math.max(1, cap)}
            value={target}
            onChange={(e) => jump(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 block w-24 rounded border border-border bg-background p-2"
          />
        </label>
        <Button
          disabled={!!blocked || left < 1}
          onClick={() =>
            update((h) => {
              const err = campaignBlitz(h, usable);
              setMsg(
                err
                  ? { ok: false, t: err }
                  : {
                      ok: true,
                      t: `Blitz started — stages 1-${usable} will pay +${fmt(preview?.xp ?? 0)} XP and +${fmt(preview?.gold ?? 0)} gold in ten minutes`,
                    },
              );
            })
          }
        >
          Blitz
        </Button>
        <button
          className="btn-ghost px-3 py-1.5 text-xs"
          disabled={cap < 1}
          onClick={() => jump(Math.max(1, cap))}
        >
          Deepest ({cap})
        </button>
      </div>
      {blocked ? (
        <p className="mt-2 text-xs text-muted-foreground">{blocked}</p>
      ) : (
        preview && (
          <p className="mt-2 text-xs">
            Pays <span className="font-bold text-xp">+{fmt(preview.xp)} XP</span> and{" "}
            <Gold n={preview.gold} />.
          </p>
        )
      )}
      <BlitzRunCard />
      {msg && (
        <p role="status" className={`anim-pop mt-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>
          {msg.t}
        </p>
      )}
    </div>
  );
}

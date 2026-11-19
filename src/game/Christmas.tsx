import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { update, useGame } from "./store";
import { fmt } from "./ui";
import { SNOWBALL_GOLD, openSnowChest, redeemSnowballs, snowChestWait } from "./snow-chest";

/** Slow snowflakes drifting over the whole castle view (decoration only). */
export function Snowfall() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 60 }).map((_, i) => {
        const size = 2 + (i % 4);
        return (
          <span
            key={i}
            className="snowflake anim-snow absolute"
            style={{
              left: `${(i * 53) % 100}%`,
              width: size,
              height: size,
              opacity: 0.5 + (i % 5) / 10,
              animationDuration: `${14 + (i % 9) * 2}s`,
              animationDelay: `-${(i * 1.7) % 30}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function waitLabel(ms: number) {
  const mins = Math.ceil(ms / 60_000);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m` : `${mins}m`;
}

/** "Christmas is coming" banner plus the snow chest that hands out snowballs for gold. */
export function ChristmasCorner() {
  const { hero } = useGame();
  const [msg, setMsg] = useState<string | null>(null);
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!hero) return null;
  const wait = snowChestWait(hero, Date.now());
  const balls = hero.snow?.balls ?? 0;

  const open = () => {
    let got: number | null = null;
    update((h) => {
      got = openSnowChest(h, Date.now());
    });
    setMsg(got ? `You found ${got} snowballs!` : "The chest is still frozen shut.");
  };
  const redeem = () => {
    let gold = 0;
    update((h) => {
      gold = redeemSnowballs(h);
    });
    setMsg(gold ? `Traded snowballs for ${fmt(gold)} gold!` : "You have no snowballs yet.");
  };

  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-lg border border-border bg-card/85 px-5 py-2 text-center shadow-lg backdrop-blur">
        <p className="text-lg font-semibold text-gold md:text-2xl">❄ Christmas is coming! ❄</p>
      </div>
      <div
        className="absolute bottom-24 left-4 z-20 w-60 rounded-lg border border-border bg-card/90 p-3 text-sm shadow-lg backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Gift className="h-5 w-5 text-gold" /> Snow Chest
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Snowballs: {balls} · each worth {fmt(SNOWBALL_GOLD)} gold
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={open} disabled={wait > 0} className="flex-1">
            {wait > 0 ? waitLabel(wait) : "Open"}
          </Button>
          <Button size="sm" variant="outline" onClick={redeem} disabled={balls === 0} className="flex-1">
            Redeem
          </Button>
        </div>
        {msg && <p role="status" className="mt-2 text-xs">{msg}</p>}
      </div>
    </>
  );
}

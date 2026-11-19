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

/** "Christmas is coming" — shown for a few seconds when the castle opens, then fades away. */
export function ChristmasBanner() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="anim-banner pointer-events-none absolute left-1/2 top-16 z-20 rounded-lg border border-border bg-card/85 px-5 py-2 text-center shadow-lg backdrop-blur">
      <p className="text-lg font-semibold text-gold md:text-2xl">❄ Christmas is coming! ❄</p>
    </div>
  );
}

/** A glowing chest standing in the snowy courtyard; tap it to open the Snow Chest window. */
export function SnowChestSpot() {
  const { hero } = useGame();
  const [openPanel, setOpenPanel] = useState(false);
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
      <button
        aria-label="Snow Chest"
        className={`absolute z-20 text-4xl md:text-5xl ${wait === 0 ? "anim-chest" : "-translate-x-1/2 -translate-y-1/2 opacity-70 grayscale"}`}
        style={{ left: "50%", top: "82%" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          setMsg(null);
          setOpenPanel(true);
        }}
      >
        🎁
      </button>
      {openPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpenPanel(false)}
        >
          <div
            className="w-72 rounded-xl border border-border bg-card p-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Gift className="h-5 w-5 text-gold" /> Snow Chest
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Open it every 4 hours for snowballs. Each snowball is worth {fmt(SNOWBALL_GOLD)} gold.
            </p>
            <p className="mt-3 text-2xl font-bold">❄ {balls}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={open} disabled={wait > 0} className="flex-1">
                {wait > 0 ? `Ready in ${waitLabel(wait)}` : "Open chest"}
              </Button>
              <Button variant="outline" onClick={redeem} disabled={balls === 0} className="flex-1">
                Redeem
              </Button>
            </div>
            {msg && <p role="status" className="mt-3 text-sm">{msg}</p>}
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setOpenPanel(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

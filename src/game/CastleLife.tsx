import { useEffect, useState } from "react";
import { tr } from "./i18n";

/** Positions are percentages of the castle picture, so effects stay on their spot at any size. */
const TORCHES: [number, number][] = [
  [40, 10.5],
  [30.3, 14],
  [47.5, 16.5],
  [9.2, 35],
  [4, 55.5],
  [21.3, 73.5],
  [26.6, 77.5],
  [65, 72],
  [69.2, 68.5],
  [81.2, 50],
  [31.3, 39.5],
  [33.8, 36.5],
  [44.4, 37.5],
  [45.6, 40.5],
];
const GLOWS = [
  { x: 50, y: 34, s: 9, kind: "lava" },
  { x: 45, y: 48.5, s: 7, kind: "rune" },
  { x: 47.5, y: 66.5, s: 7, kind: "rune" },
  { x: 72.5, y: 48, s: 6, kind: "portal" },
  { x: 83, y: 6.5, s: 13, kind: "moon" },
] as const;

type Npc = {
  id: string;
  name: string;
  from: [number, number];
  to: [number, number];
  secs: number;
  tone: string;
  quotes: string[];
};
const NPCS: Npc[] = [
  {
    id: "guard",
    name: "Old Guard Bram",
    from: [38, 47],
    to: [43.5, 55],
    secs: 14,
    tone: "npc-guard",
    quotes: [
      "The walls have stood a thousand moons. They'll stand one more.",
      "Keep your blade sharp and your boots dry, hero.",
      "I saw the Awakening light flare last night... something stirs.",
    ],
  },
  {
    id: "merchant",
    name: "Merchant Ysolde",
    from: [52, 62],
    to: [59.5, 67],
    secs: 17,
    tone: "npc-merchant",
    quotes: [
      "Gold buys bread. Blood buys glory. I sell both!",
      "The Auction House never sleeps, and neither do I.",
      "Fine silks, rare gems... for you, only double the price.",
    ],
  },
  {
    id: "monk",
    name: "Ember Monk Cael",
    from: [31.5, 74],
    to: [40, 64.5],
    secs: 20,
    tone: "npc-monk",
    quotes: [
      "Under the blood moon, every ember remembers its fire.",
      "Seek the Awakening, and you will find yourself.",
      "Patience, traveler. Even stone becomes sand.",
    ],
  },
];

function NpcWalker({ npc, canTap }: { npc: Npc; canTap: () => boolean }) {
  const [say, setSay] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!say) return;
    const id = window.setTimeout(() => setSay(null), 4500);
    return () => window.clearTimeout(id);
  }, [say]);
  const style = {
    "--fx": `${npc.from[0]}%`,
    "--fy": `${npc.from[1]}%`,
    "--tx": `${npc.to[0]}%`,
    "--ty": `${npc.to[1]}%`,
    animationDuration: `${npc.secs}s`,
    animationPlayState: say ? "paused" : "running",
  } as React.CSSProperties;
  return (
    <div className="npc-walker" style={style}>
      <div
        className="npc-flip"
        style={{
          animationDuration: `${npc.secs}s`,
          animationPlayState: say ? "paused" : "running",
        }}
      >
        <button
          type="button"
          aria-label={tr(npc.name)}
          className={`npc-body ${npc.tone}${say ? "" : " npc-bob"}`}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail !== 0 && !canTap()) return;
            setSay(npc.quotes[n % npc.quotes.length]);
            setN((v) => v + 1);
          }}
        >
          <svg viewBox="0 0 20 32" className="h-full w-full">
            <ellipse cx="10" cy="30.5" rx="6" ry="1.5" className="npc-shadow" />
            <path d="M4 29 L6 13 Q10 9 14 13 L16 29 Z" className="npc-cloak" />
            <circle cx="10" cy="8" r="4" className="npc-skin" />
            <path d="M5.5 9 Q10 0 14.5 9 Q10 6 5.5 9 Z" className="npc-cloak" />
          </svg>
        </button>
      </div>
      {say && (
        <div className="npc-bubble" role="status">
          <span className="npc-bubble-name">{tr(npc.name)}</span>
          {tr(say)}
        </div>
      )}
    </div>
  );
}

/** Living details on the castle: torch flicker, glowing magic, the Awakening beam and walking townsfolk. */
export function CastleLife({ canTap }: { canTap: () => boolean }) {
  return (
    <>
      <div
        className="awakening-beam pointer-events-none absolute"
        style={{ left: "19.5%", top: 0, height: "50%" }}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={`aw-${i}`}
          className="awakening-spark pointer-events-none absolute rounded-full"
          style={{
            left: `${18 + ((i * 7) % 4)}%`,
            top: "47%",
            animationDelay: `${i * 0.45}s`,
            animationDuration: `${3.5 + (i % 3)}s`,
          }}
        />
      ))}
      {GLOWS.map((g, i) => (
        <span
          key={`g-${i}`}
          className={`castle-glow castle-glow-${g.kind} pointer-events-none absolute rounded-full`}
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: `${g.s}%`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
      {TORCHES.map(([x, y], i) => (
        <span
          key={`t-${i}`}
          className="torch-flicker pointer-events-none absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${(i * 0.37) % 2}s`,
            animationDuration: `${1.4 + (i % 4) * 0.3}s`,
          }}
        />
      ))}
      {NPCS.map((npc) => (
        <NpcWalker key={npc.id} npc={npc} canTap={canTap} />
      ))}
    </>
  );
}

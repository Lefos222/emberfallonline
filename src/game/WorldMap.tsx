import { useEffect, useState } from "react";
import { Gem, Hammer, Loader2, Skull } from "lucide-react";
import mapImg from "@/assets/world-map.jpg";
import { useGame } from "./store";
import { Gold, Panel } from "./ui";
import type { StartBattle } from "./panels";
import { completeWorldRaid, loadWorldMap } from "./worldmap-services";
import { MAP_NODES, RAID_LIMITS, canRaid, mapFoe, nodeUses, raidsLeft, type MapNode, type WorldMapState } from "./worldmap";

const KIND_STYLE = {
  gold: { ring: "ring-sky-400", dot: "bg-sky-400", label: "Gold mine", Icon: Gem },
  ore: { ring: "ring-emerald-400", dot: "bg-emerald-400", label: "Ore dungeon", Icon: Hammer },
  boss: { ring: "ring-blood", dot: "bg-blood", label: "World boss", Icon: Skull },
} as const;

export function WorldMap({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero } = useGame();
  const [state, setState] = useState<WorldMapState | null>(null);
  const [error, setError] = useState("");
  const [hover, setHover] = useState<string | null>(null);

  const refresh = () => {
    loadWorldMap().then(setState).catch((e) => setError(e instanceof Error ? e.message : "Failed to load the world map."));
  };
  useEffect(refresh, []);

  if (!hero) return null;

  const raid = (node: MapNode) => {
    if (!state || !canRaid(state, node)) return;
    const foe = mapFoe(node, hero.level + hero.paragon);
    start({
      title: `World Map · ${node.name}`,
      right: foe,
      onResult: async (won) => {
        if (!won) return { lines: ["The defenders hold. Come back stronger."] };
        try {
          const r = await completeWorldRaid(node.id);
          const lines = Object.entries(r.reward).flatMap(([k, v]) =>
            typeof v === "number" ? [`+${v.toLocaleString()} ${k}`]
            : v && typeof v === "object" ? Object.entries(v as Record<string, number>).map(([m, n]) => `+${n} ${m}`)
            : []);
          refresh();
          return { lines: lines.length ? lines : ["Raid complete."] };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
        }
      },
    });
  };

  return (
    <Panel title="World Map" onClose={onClose} wide>
      {error && <p role="alert" className="mb-2 text-sm text-blood">{error}</p>}
      {!state ? (
        <div className="flex items-center justify-center gap-2 py-16"><Loader2 className="h-5 w-5 animate-spin" />Charting the realm…</div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-3 text-xs">
            {(Object.keys(RAID_LIMITS) as (keyof typeof RAID_LIMITS)[]).map((k) => {
              const { label, dot } = KIND_STYLE[k];
              return (
                <span key={k} className="slot flex items-center gap-1.5 px-2 py-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  {label}: <b>{raidsLeft(state, k)}/{RAID_LIMITS[k]}</b> left today
                </span>
              );
            })}
            <span className="ml-auto text-muted-foreground">Resets {new Date(state.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img src={mapImg} alt="World map" className="h-auto w-full select-none" draggable={false} loading="lazy" width={1536} height={1024} />
            {MAP_NODES.map((n) => {
              const { ring, dot, Icon } = KIND_STYLE[n.kind];
              const uses = nodeUses(state, n.id);
              const locked = !canRaid(state, n);
              return (
                <button
                  key={n.id}
                  aria-label={`${n.name} (${KIND_STYLE[n.kind].label})`}
                  disabled={locked}
                  className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/70 ring-2 backdrop-blur-sm transition hover:scale-125 ${ring} ${locked ? "opacity-40" : ""}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => raid(n)}
                >
                  <Icon className="h-4 w-4" />
                  <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${dot}`} />
                  {uses > 0 && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-background/85 px-1 text-[9px] font-bold leading-tight text-gold">×{uses}</span>}
                  {hover === n.id && (
                    <span role="tooltip" className="hotspot-label pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 whitespace-normal rounded px-2 py-1 text-left text-xs">
                      <b>{n.name}</b> · {KIND_STYLE[n.kind].label}
                      <span className="block text-[10px] text-foreground/80">{n.desc}</span>
                      <span className="block text-[10px]">{locked ? "Daily allowance spent" : uses > 0 ? `Cleared ${uses}× today · tap to raid` : "Tap to raid"}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Win the fight to claim the node. Gold mines pay <Gold n={500} />+ scaling with level, ore dungeons drop ore and Soul Essence, and world bosses drop Boss Cores and Starshards. Rewards are granted by the server on every win; each raid type has its own daily allowance and a node can be raided again while it lasts.
          </p>
        </>
      )}
    </Panel>
  );
}

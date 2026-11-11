import star from "@/assets/icons/ui-star.png";
import goblet from "@/assets/icons/ui-goblet.png";
import diamond from "@/assets/icons/ui-diamond.png";
import gem from "@/assets/icons/ui-gem.png";
import scroll from "@/assets/icons/ui-scroll.png";
import hourglass from "@/assets/icons/ui-hourglass.webp";
import gift from "@/assets/icons/ui-gift.png";
import { GoldCoin, GoldChestIcon, GemChestIcon } from "./CoinIcon";
import { MatIcon, StoneIcon } from "./MatIcon";
import { lootTiles, type LootTile } from "./loot-tiles";

const IMG: Record<string, string> = { xp: star, renown: goblet, diamond, shards: gem, scroll, potion: hourglass, other: gift };
const SIZE = 36;

function TileArt({ tile }: { tile: LootTile }) {
  switch (tile.kind) {
    case "gold": return <GoldCoin size={SIZE} />;
    case "goldChest": return <GoldChestIcon size={SIZE} />;
    case "gemChest": return <GemChestIcon size={SIZE} />;
    case "mat": return <MatIcon mat={tile.mat} size={SIZE} />;
    case "stone": return <StoneIcon level={tile.level} size={SIZE} />;
    default: return <img src={IMG[tile.kind]} alt="" width={SIZE} height={SIZE} style={{ width: SIZE, height: SIZE }} />;
  }
}

/** Compact after-fight loot: a grid of item pictures with amounts instead of a wall of text. */
export function LootGrid({ lines }: { lines: string[] }) {
  const { tiles, notes } = lootTiles(lines);
  return (
    <div className="my-3">
      {tiles.length > 0 && (
        <ul className="flex max-h-48 flex-wrap justify-center gap-2 overflow-y-auto" aria-label="Loot">
          {tiles.map((tile, i) => (
            <li
              key={i}
              title={`${tile.amount} ${tile.label}`}
              aria-label={`${tile.amount} ${tile.label}`}
              className="relative flex h-14 w-14 items-center justify-center rounded-md border border-border bg-muted/60"
            >
              <TileArt tile={tile} />
              <span className="absolute bottom-0 right-0.5 font-display text-xs font-bold text-foreground [text-shadow:0_1px_2px_var(--background)]">
                {tile.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
      {notes.length > 0 && (
        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          {notes.map((n, i) => <div key={i}>{n}</div>)}
        </div>
      )}
    </div>
  );
}

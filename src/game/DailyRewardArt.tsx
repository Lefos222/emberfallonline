import type { ReactNode } from "react";
import { GemChestIcon, GoldChestIcon, GoldCoin } from "./CoinIcon";
import { GemIcon, MatIcon } from "./MatIcon";
import type { Mat } from "./crafting";
import type { DailyReward } from "./daily-rewards";

/** The painted art that stands for one day's gift, so a board tile reads at a glance. */
export function DailyRewardArt({ rw, size = 24 }: { rw: DailyReward; size?: number }) {
  const art: ReactNode[] = [];
  if (rw.gold) art.push(<GoldCoin key="gold" size={size} />);
  (rw.gems ?? []).forEach((g, i) =>
    art.push(<GemIcon key={`gem-${i}-${g.gem}`} type={g.gem} size={size} />),
  );
  (Object.keys(rw.mats ?? {}) as Mat[]).forEach((m) =>
    art.push(<MatIcon key={m} mat={m} size={size} />),
  );
  (rw.chests ?? []).forEach((c, i) =>
    art.push(
      c === "gem" ? (
        <GemChestIcon key={`chest-${i}`} size={size} />
      ) : (
        <GoldChestIcon key={`chest-${i}`} size={size} />
      ),
    ),
  );
  return (
    <span className="flex flex-wrap items-center justify-center gap-1">{art.slice(0, 3)}</span>
  );
}

import classGear from "@/assets/equipment_for_classes.jpg";
import relicGear from "@/assets/relic-gear.jpg";
import { ATLAS_H, ATLAS_W, iconRect, type Item } from "./data";
import { isRelicItem } from "./relics";

/**
 * Both sheets are committed 1920x1072 paintings sharing one icon grid, so a class keeps its old
 * art and gains the relic collection: `equipment_for_classes.jpg` draws every ordinary drop,
 * forge piece and synthesis piece, `relic-gear.jpg` draws the Relic Trials pieces (named by their
 * set prefix). Pass `relic` for callers that only hold a slot/class/icon preview.
 */
export function GearIcon({ item, size = 56, relic = isRelicItem(item.name) }: {
  item: Pick<Item, "slot" | "cls" | "icon"> & { name?: string }; size?: number; relic?: boolean;
}) {
  const r = iconRect(item);
  const s = size / Math.max(r.w, r.h);
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: r.w * s,
          height: r.h * s,
          backgroundImage: `url(${relic ? relicGear : classGear})`,
          backgroundSize: `${ATLAS_W * s}px ${ATLAS_H * s}px`,
          backgroundPosition: `-${r.x * s}px -${r.y * s}px`,
          borderRadius: 6,
        }}
      />
    </div>
  );
}

import gearAtlas from "@/assets/gear-atlas.jpg";
import { ATLAS_H, ATLAS_W, iconRect, type Item } from "./data";
import { isRelicItem } from "./relics";

/**
 * Every gear icon is cut from one committed atlas painting: two 1920x1072 class sheets stacked into
 * a single image (see ATLAS_BANDS in data.ts). Band 0 is the original class gear — ordinary drops,
 * forge pieces, synthesis pieces and starter kit; band 1 is the relic collection art, worn by the
 * Relic Trials pieces and also rolled by ordinary drops and crafts, so both updates live in one set.
 * The band is read from the item's own `art`, falling back to its relic set prefix, and `relic`
 * forces band 1 for callers that only hold a slot/class/icon preview.
 */
export function GearIcon({ item, size = 56, relic = false }: {
  item: Pick<Item, "slot" | "cls" | "icon"> & { name?: string; art?: number }; size?: number; relic?: boolean;
}) {
  const band = relic ? 1 : item.art ?? (isRelicItem(item.name) ? 1 : 0);
  const r = iconRect(item, band);
  const s = size / Math.max(r.w, r.h);
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: r.w * s,
          height: r.h * s,
          backgroundImage: `url(${gearAtlas})`,
          backgroundSize: `${ATLAS_W * s}px ${ATLAS_H * s}px`,
          backgroundPosition: `-${r.x * s}px -${r.y * s}px`,
          borderRadius: 6,
        }}
      />
    </div>
  );
}

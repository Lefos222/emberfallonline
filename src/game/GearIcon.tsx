import gear from "@/assets/equipment_for_classes.jpg.asset.json";
import anc from "@/assets/astrals.jpg.asset.json";
import { ATLAS_H, ATLAS_W, iconRect, type Item } from "./data";

export function GearIcon({ item, size = 56 }: { item: Pick<Item, "slot" | "cls" | "icon"> & { anc?: boolean }; size?: number }) {
  const r = iconRect(item);
  const s = size / Math.max(r.w, r.h);
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: r.w * s,
          height: r.h * s,
          backgroundImage: `url(${item.anc ? anc.url : gear.url})`,
          backgroundSize: `${ATLAS_W * s}px ${ATLAS_H * s}px`,
          backgroundPosition: `-${r.x * s}px -${r.y * s}px`,
          borderRadius: 6,
        }}
      />
    </div>
  );
}

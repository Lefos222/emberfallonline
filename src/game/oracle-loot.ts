import { makeItem as _mk, type Hero, type Item } from "./data";
import { addLoot, makeDrop } from "./logic";
export { grant } from "./logic";
export function makeLoot(h: Hero, stage: number, rarity: number): Item {
  const it = makeDrop(h.cls, Math.max(1, Math.round(stage * 0.9 + h.level * 0.3)), Math.min(5, rarity));
  addLoot(h, it);
  return it;
}

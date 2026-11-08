import type { ChestKind } from "./chests";
import type { GemType } from "./crafting";
import type { DiamondMat } from "./economy";
import {
  CHEST_OFFERS,
  DIAMOND_PACKS,
  GEM_TIER_PRICES,
  GOLD_PACKS,
  MATERIAL_PRICES,
  vipPlanFor,
} from "./economy";

/** Diamond purchases are not live yet: checkout and server verification must come first, so
 *  every purchase path reports the same lock instead of crediting or spending anything. */
const LOCKED = "Purchases aren't open yet — coming soon.";

/** Never grant a diamond pack client-side; the pack only has to exist in the catalogue. */
export function buyDiamondPack(id: string): string | null {
  const pack = DIAMOND_PACKS.find((p) => p.id === id);
  if (!pack) return "Unknown diamond pack.";
  return LOCKED;
}

export function buyGoldPack(id: string): string | null {
  const pack = GOLD_PACKS.find((p) => p.id === id);
  if (!pack) return "Unknown gold pack.";
  return LOCKED;
}

export function buyMaterial(mat: DiamondMat, quantity: 1 | 5): string | null {
  const prices = MATERIAL_PRICES[mat];
  if (!prices) return "Unknown material.";
  const cost = quantity === 1 ? prices.one : prices.five;
  if (!cost) return "Unknown material quantity.";
  return LOCKED;
}

export function buyGem(type: GemType, tier: number): string | null {
  const cost = GEM_TIER_PRICES[tier - 1];
  if (!cost || !type) return "Unknown gem.";
  return LOCKED;
}

export function buyChest(kind: ChestKind): string | null {
  const offer = CHEST_OFFERS.find((c) => c.kind === kind);
  if (!offer) return "Unknown chest.";
  return LOCKED;
}

export function buyVip(level: number): string | null {
  const plan = vipPlanFor(level);
  if (!plan) return "Unknown VIP plan.";
  return LOCKED;
}

/** VIP gold is part of the closed shop too: no membership can be activated, so nothing is paid. */
export function claimVipDaily(): string | null {
  return LOCKED;
}

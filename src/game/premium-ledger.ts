import { MATS, gemKey, type GemType } from "./crafting";
import type { Hero } from "./data";
import {
  CHEST_OFFERS,
  DIAMOND_SHOP,
  GEM_TIER_PRICES,
  GOLD_PACKS,
  MATERIAL_PRICES,
  materialBaseCost,
  vipPlanFor,
  type DiamondMat,
} from "./economy";
import { VIP_DAYS, vipPrice } from "./vip-perks";

/** Server-side ledger for the premium wallet.
 *
 *  These functions are pure: the payment server parses the character's save, applies a purchase or
 *  a Diamond spend here, and writes the result back through the server-only `_write_save`. Nothing
 *  here trusts a client price — every amount is read from the same catalogue the shop displays.
 */

export interface CardGrant {
  /** Stripe Checkout session id: the idempotency key of a real-money purchase. */
  ref: string;
  kind: "diamonds" | "vip";
  diamonds?: number;
  vipLevel?: number;
  days?: number;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const premiumOf = (save: Hero) => {
  save.srv = save.srv ?? {};
  save.srv.premium = save.srv.premium ?? {};
  save.srv.premium.history = Array.isArray(save.srv.premium.history)
    ? save.srv.premium.history
    : [];
  return save.srv.premium;
};

export const walletBalance = (save: Hero) => {
  const n = Number(save.srv?.premium?.balance ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

const history = (save: Hero) => premiumOf(save).history!;

/** True once a Stripe session has already been credited, so a refresh cannot double-pay it. */
export function cardPurchaseApplied(save: Hero, ref: string): boolean {
  return history(save).some(
    (entry) => typeof entry.detail === "string" && entry.detail.startsWith(`stripe:${ref}`),
  );
}

function extendMembership(save: Hero, level: number, days: number, now: number) {
  const wallet = premiumOf(save);
  const current = wallet.vip?.until ? Date.parse(wallet.vip.until) : Number.NaN;
  const base = Math.max(now, Number.isFinite(current) ? current : 0);
  const wasActive = Number.isFinite(current) && current > now;
  const keptLevel = wasActive ? Math.max(Number(wallet.vip?.level ?? 0), level) : level;
  wallet.vip = { level: keptLevel, until: new Date(base + days * 86_400_000).toISOString() };
}

/** Credit a confirmed Stripe payment. Idempotent per session id. */
export function applyCardPurchase(save: Hero, grant: CardGrant, now = Date.now()): Hero {
  const next = clone(save);
  if (cardPurchaseApplied(next, grant.ref)) return next;
  if (grant.kind === "diamonds") {
    const amount = Math.max(0, Math.floor(grant.diamonds ?? 0));
    const wallet = premiumOf(next);
    wallet.balance = walletBalance(next) + amount;
    history(next).push({
      at: new Date(now).toISOString(),
      kind: "purchase",
      amount,
      detail: `stripe:${grant.ref}`,
    });
  } else {
    const level = Math.max(1, Math.floor(grant.vipLevel ?? 1));
    extendMembership(next, level, grant.days ?? VIP_DAYS, now);
    history(next).push({
      at: new Date(now).toISOString(),
      kind: "purchase",
      amount: level,
      detail: `stripe:${grant.ref} vip:${level}`,
    });
  }
  return next;
}

export type SpendKind = "material" | "gem" | "chest" | "gold" | "vip" | "item";

export interface SpendRequest {
  kind: SpendKind;
  itemId: string;
  qty?: number;
}

export interface SpendQuote {
  /** What the hero pays after their VIP discount. */
  price: number;
  /** The same price with no discount, for the "VIP saves X" line. */
  basePrice: number;
  label: string;
}

/** The authoritative Diamond price of one shop good for a hero's VIP level. */
export function spendQuote(req: SpendRequest, vipLevel = 0): SpendQuote {
  switch (req.kind) {
    case "material": {
      const mat = req.itemId as DiamondMat;
      if (!MATERIAL_PRICES[mat]) throw new Error("Unknown material.");
      const qty = Math.max(1, Math.min(999, Math.floor(req.qty ?? 1)));
      const base = materialBaseCost(mat, qty);
      return {
        price: vipPrice(base, vipLevel),
        basePrice: base,
        label: `${qty} × ${MATS[mat].name}`,
      };
    }
    case "gem": {
      const [type, tier] = req.itemId.split(":");
      const level = Number(tier);
      if (!type || !Number.isInteger(level) || level < 1 || level > 3)
        throw new Error("Unknown gem.");
      const base = GEM_TIER_PRICES[level - 1];
      return {
        price: vipPrice(base, vipLevel),
        basePrice: base,
        label: `${type} gem, tier ${level}`,
      };
    }
    case "chest": {
      const offer = CHEST_OFFERS.find((c) => c.kind === req.itemId);
      if (!offer) throw new Error("Unknown chest.");
      return {
        price: vipPrice(offer.diamonds, vipLevel),
        basePrice: offer.diamonds,
        label: offer.name,
      };
    }
    case "gold": {
      const pack = GOLD_PACKS.find((p) => p.id === req.itemId);
      if (!pack) throw new Error("Unknown gold pack.");
      return {
        price: vipPrice(pack.diamonds, vipLevel),
        basePrice: pack.diamonds,
        label: pack.name,
      };
    }
    case "vip": {
      const plan = vipPlanFor(Number(req.itemId));
      if (!plan) throw new Error("Unknown VIP plan.");
      return {
        price: vipPrice(plan.diamonds, vipLevel),
        basePrice: plan.diamonds,
        label: `VIP ${plan.level} — ${plan.name} (${plan.days} days)`,
      };
    }
    case "item": {
      const item = DIAMOND_SHOP.find((i) => i.id === req.itemId);
      if (!item) throw new Error("Unknown shop item.");
      return {
        price: vipPrice(item.diamonds, vipLevel),
        basePrice: item.diamonds,
        label: item.name,
      };
    }
    default:
      throw new Error("Unknown purchase.");
  }
}

/** Debit Diamonds and grant the good. Throws when the wallet cannot cover the price. */
export function applyDiamondSpend(
  save: Hero,
  req: SpendRequest,
  requestId: string,
  now = Date.now(),
): Hero {
  const vipLevel = Number(save.srv?.premium?.vip?.level ?? 0);
  const quote = spendQuote(req, vipLevel);
  const next = clone(save);
  const balance = walletBalance(next);
  if (balance < quote.price) throw new Error(`Not enough Diamonds — ${quote.price} needed.`);
  const wallet = premiumOf(next);
  wallet.balance = balance - quote.price;

  switch (req.kind) {
    case "material": {
      const mat = req.itemId as DiamondMat;
      const qty = Math.max(1, Math.min(999, Math.floor(req.qty ?? 1)));
      next.mats = { ...(next.mats ?? {}) };
      next.mats[mat] = (next.mats[mat] ?? 0) + qty;
      break;
    }
    case "gem": {
      const [type, tier] = req.itemId.split(":");
      const key = gemKey(type as GemType, Number(tier));
      next.gems = { ...(next.gems ?? {}) };
      next.gems[key] = (next.gems[key] ?? 0) + 1;
      break;
    }
    case "chest": {
      const kind = req.itemId as "gold" | "gem";
      next.chests = { ...(next.chests ?? {}) };
      next.chests[kind] = (next.chests[kind] ?? 0) + 1;
      break;
    }
    case "gold": {
      const pack = GOLD_PACKS.find((p) => p.id === req.itemId)!;
      next.gold += pack.gold;
      break;
    }
    case "vip": {
      const plan = vipPlanFor(Number(req.itemId))!;
      extendMembership(next, plan.level, plan.days, now);
      break;
    }
    case "item": {
      const item = DIAMOND_SHOP.find((i) => i.id === req.itemId)!;
      if (item.kind === "cosmetic") {
        const owned = next.srv?.cosmetics ?? [];
        if (owned.includes(item.id)) throw new Error("Already owned.");
        next.srv = { ...(next.srv ?? {}), cosmetics: [...owned, item.id] };
      } else if (item.id === "scroll_bundle") {
        const scrolls = { ...(next.srv?.scrolls ?? {}) };
        for (const k of ["dmg", "def", "xp"]) scrolls[k] = (scrolls[k] ?? 0) + 5;
        next.srv = { ...(next.srv ?? {}), scrolls };
      }
      break;
    }
  }

  history(next).push({
    at: new Date(now).toISOString(),
    kind: "spend",
    amount: quote.price,
    detail: `${req.kind}:${req.itemId}${req.qty && req.qty > 1 ? `:${req.qty}` : ""}#${requestId}`,
  });
  return next;
}

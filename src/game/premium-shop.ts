import { addChests, type ChestKind } from "./chests";
import { addGem, addMats, type GemType, type Mat } from "./crafting";
import {
  CHEST_OFFERS,
  DIAMOND_PACKS,
  GEM_TIER_PRICES,
  GOLD_PACKS,
  MATERIAL_PRICES,
  PREMIUM_TEST_MODE,
  VIP_PLANS,
  diamondPackTotal,
  premiumState,
  todayKey,
  vipPlanFor,
  type PremiumHistoryEntry,
  type PremiumWallet,
} from "./economy";
import { update } from "./store";
import type { Hero } from "./data";
import { object } from "./services-contract";

const historyEntry = (kind: string, amount: number, detail: string): PremiumHistoryEntry => ({
  at: new Date().toISOString(),
  kind,
  amount,
  detail,
});

/** The preview test wallet, seeded once from any server-owned premium balance so an existing
 *  membership or diamond balance is not lost when the shop switches to test mode. */
export function testWallet(h: Hero): PremiumWallet {
  if (!h.premiumTest) {
    const srv = object(object(object(h)["srv"])["premium"]);
    const balance = Number(srv["balance"]);
    const vip = object(srv["vip"]);
    h.premiumTest = {
      balance: Number.isFinite(balance) && balance > 0 ? Math.floor(balance) : 0,
      vip: {
        level: Number.isInteger(vip["level"]) ? Number(vip["level"]) : 0,
        until: typeof vip["until"] === "string" ? vip["until"] : null,
      },
      claimed: typeof srv["claimed"] === "string" ? srv["claimed"] : undefined,
      history: [],
    };
  }
  const w = h.premiumTest;
  if (!w.vip) w.vip = { level: 0, until: null };
  if (!Array.isArray(w.history)) w.history = [];
  if (!Number.isFinite(w.balance)) w.balance = 0;
  return w;
}

const record = (w: PremiumWallet, kind: string, amount: number, detail: string) => {
  w.history = [...(w.history ?? []), historyEntry(kind, amount, detail)].slice(-80);
};

/** Deduct diamonds from the test wallet, or leave it untouched and report the shortfall. */
const spend = (h: Hero, cost: number, detail: string): string | null => {
  const w = testWallet(h);
  const balance = Math.max(0, Math.floor(w.balance ?? 0));
  if (balance < cost) return "Not enough Diamonds.";
  w.balance = balance - cost;
  record(w, "spend", cost, detail);
  return null;
};

const locked = () =>
  PREMIUM_TEST_MODE
    ? null
    : "Payments are not connected yet — purchases open once checkout is live.";

/** Test-mode diamond pack purchase: no money changes hands, the pack is granted instantly. */
export function buyDiamondPack(id: string): string | null {
  const pack = DIAMOND_PACKS.find((p) => p.id === id);
  if (!pack) return "Unknown diamond pack.";
  const blocked = locked();
  if (blocked) return blocked;
  update((h) => {
    const w = testWallet(h);
    const total = diamondPackTotal(pack);
    w.balance = Math.max(0, Math.floor(w.balance ?? 0)) + total;
    record(w, "grant", total, `diamond pack: ${pack.name}`);
  });
  return null;
}

export function buyGoldPack(id: string): string | null {
  const pack = GOLD_PACKS.find((p) => p.id === id);
  if (!pack) return "Unknown gold pack.";
  const blocked = locked();
  if (blocked) return blocked;
  let error: string | null = null;
  update((h) => {
    error = spend(h, pack.diamonds, `gold pack: ${pack.name}`);
    if (!error) h.gold += pack.gold;
  });
  return error;
}

export function buyMaterial(mat: Mat, quantity: 1 | 5): string | null {
  const prices = MATERIAL_PRICES[mat];
  if (!prices) return "Unknown material.";
  const blocked = locked();
  if (blocked) return blocked;
  const cost = quantity === 1 ? prices.one : prices.five;
  let error: string | null = null;
  update((h) => {
    error = spend(h, cost, `material: ${mat} ×${quantity}`);
    if (!error) addMats(h, { [mat]: quantity } as Partial<Record<Mat, number>>);
  });
  return error;
}

export function buyGem(type: GemType, tier: number): string | null {
  const cost = GEM_TIER_PRICES[tier - 1];
  if (!cost) return "Unknown gem tier.";
  const blocked = locked();
  if (blocked) return blocked;
  let error: string | null = null;
  update((h) => {
    error = spend(h, cost, `gem: ${type} tier ${tier}`);
    if (!error) addGem(h, type, tier);
  });
  return error;
}

export function buyChest(kind: ChestKind): string | null {
  const offer = CHEST_OFFERS.find((c) => c.kind === kind);
  if (!offer) return "Unknown chest.";
  const blocked = locked();
  if (blocked) return blocked;
  let error: string | null = null;
  update((h) => {
    error = spend(h, offer.diamonds, `chest: ${offer.name}`);
    if (!error) addChests(h, kind, 1);
  });
  return error;
}

/** Buy or extend a VIP plan. Extending keeps the highest tier and adds the new days on top. */
export function buyVip(level: number): string | null {
  const plan = vipPlanFor(level);
  if (!plan) return "Unknown VIP plan.";
  const blocked = locked();
  if (blocked) return blocked;
  let error: string | null = null;
  update((h) => {
    error = spend(h, plan.diamonds, `vip: ${plan.name}`);
    if (error) return;
    const w = testWallet(h);
    const current = premiumState(h);
    const now = Date.now();
    const active = current.vip.until !== null && Date.parse(current.vip.until) > now;
    const base = active && current.vip.until ? Date.parse(current.vip.until) : now;
    const nextLevel = active ? Math.max(current.vip.level, plan.level) : plan.level;
    w.vip = { level: nextLevel, until: new Date(base + plan.days * 86_400_000).toISOString() };
  });
  return error;
}

/** Claim the once-per-day VIP gold. The reward is paid into the hero's purse and never renews
 *  the membership — only the daily benefit pauses when it expires. */
export function claimVipDaily(): string | null {
  const blocked = locked();
  if (blocked) return blocked;
  let error: string | null = null;
  update((h) => {
    const current = premiumState(h);
    if (!current.vip.level) {
      error = "No active VIP membership.";
      return;
    }
    if (current.claimedToday) {
      error = "The VIP daily reward was already claimed today.";
      return;
    }
    const plan = vipPlanFor(current.vip.level);
    const gold =
      plan?.dailyGold ?? (current.vip.level >= 5 ? 25000 : current.vip.level >= 4 ? 12000 : 0);
    if (gold <= 0) {
      error = "This membership has no daily reward.";
      return;
    }
    h.gold += gold;
    const w = testWallet(h);
    w.claimed = todayKey();
    record(w, "vip-daily", gold, `vip daily: ${plan?.name ?? `VIP ${current.vip.level}`}`);
  });
  return error;
}

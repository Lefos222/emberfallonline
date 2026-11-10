import { addChests, type ChestKind } from "./chests";
import { addGem, addMats, type GemType, type Mat } from "./crafting";
import type { Hero } from "./data";
import { grant } from "./logic";
import { vipLevelOf } from "./vip-perks";

/** The two VIP-only daily activities. They live beside the membership because they are part of
 *  what a one-month VIP buys: a second, richer set of daily goals on top of the free boards.
 *  Rewards are ordinary gold/materials/gems/chests, so nothing here touches the Diamond wallet. */

export interface VipActivityDef {
  id: string;
  name: string;
  desc: string;
  goal: number;
  metric: "wins" | "crafts";
  reward: string;
  gold?: number;
  chests?: ChestKind[];
  mats?: Partial<Record<Mat, number>>;
  gem?: { type: GemType; tier: number };
}

export const VIP_ACTIVITIES: VipActivityDef[] = [
  {
    id: "vip-hunt",
    name: "Champion's Hunt",
    desc: "Win 5 battles today",
    goal: 5,
    metric: "wins",
    reward: "8,000 gold (VIP gold bonus included) + a Gold Chest",
    gold: 8000,
    chests: ["gold"],
  },
  {
    id: "vip-forge",
    name: "Master Forge",
    desc: "Forge 1 item at the Forge today",
    goal: 1,
    metric: "crafts",
    reward: "6 Armor Fragments, 2 Elite Sigils and a Flawed Ruby",
    mats: { fragment: 6, sigil: 2 },
    gem: { type: "ruby", tier: 2 },
  },
];

export interface VipActivityLedger {
  day: string;
  base: { wins?: number; crafts?: number };
  claimed: string[];
}

const dayKey = (now: number) => new Date(now).toISOString().slice(0, 10);

/** Today's ledger, or the snapshot a fresh day would start from. Never mutates the save. */
function ledgerOf(h: Hero, now = Date.now()): VipActivityLedger {
  const day = dayKey(now);
  const saved = h.vipActivities;
  if (saved && saved.day === day) return saved;
  return { day, base: { wins: h.wins ?? 0, crafts: h.crafts ?? 0 }, claimed: [] };
}

/** Roll the ledger over at the first look of a new day (called from the activities panel). */
export function openVipActivities(h: Hero, now = Date.now()): VipActivityLedger {
  const ledger = ledgerOf(h, now);
  h.vipActivities = ledger;
  return ledger;
}

function progressOf(h: Hero, def: VipActivityDef, now = Date.now()): number {
  const ledger = ledgerOf(h, now);
  const current = def.metric === "wins" ? (h.wins ?? 0) : (h.crafts ?? 0);
  const base = def.metric === "wins" ? (ledger.base.wins ?? 0) : (ledger.base.crafts ?? 0);
  return Math.max(0, Math.min(def.goal, current - base));
}

export interface VipActivityState {
  def: VipActivityDef;
  progress: number;
  claimed: boolean;
  ready: boolean;
  /** True for a hero with no active membership: the cards are visible but not claimable. */
  locked: boolean;
}

export function vipActivityStates(h: Hero, now = Date.now()): VipActivityState[] {
  const vip = vipLevelOf(h) > 0;
  const ledger = ledgerOf(h, now);
  return VIP_ACTIVITIES.map((def) => {
    const progress = progressOf(h, def, now);
    const claimed = ledger.claimed.includes(def.id);
    return { def, progress, claimed, ready: vip && !claimed && progress >= def.goal, locked: !vip };
  });
}

/** Pay one activity onto the save. Throws a readable message when it is not claimable. */
export function claimVipActivity(h: Hero, id: string, now = Date.now()): string[] {
  if (vipLevelOf(h) < 1)
    throw new Error("VIP members only — this activity opens with an active membership.");
  const def = VIP_ACTIVITIES.find((a) => a.id === id);
  if (!def) throw new Error("Unknown VIP activity.");
  const ledger = openVipActivities(h, now);
  if (ledger.claimed.includes(id)) throw new Error("Already claimed today.");
  const progress = progressOf(h, def, now);
  if (progress < def.goal) throw new Error(`Not finished yet — ${progress}/${def.goal}.`);

  const lines: string[] = [];
  if (def.gold) {
    const before = h.gold;
    grant(h, 0, def.gold);
    lines.push(`${(h.gold - before).toLocaleString()} gold`);
  }
  if (def.mats) {
    addMats(h, def.mats);
    for (const [mat, n] of Object.entries(def.mats) as [Mat, number][]) lines.push(`${n} ${mat}`);
  }
  if (def.gem) {
    addGem(h, def.gem.type, def.gem.tier);
    lines.push(`${def.gem.type} gem (tier ${def.gem.tier})`);
  }
  for (const kind of def.chests ?? []) {
    addChests(h, kind);
    lines.push(`${kind} chest`);
  }
  ledger.claimed.push(id);
  h.vipActivities = ledger;
  return lines;
}

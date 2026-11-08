// ============= The World Tree: daily bounties and sealed vaults =============
// The realm is larger than a day's raids, so the World Tree posts three bounties each UTC day:
// clear a set number of raids of one kind and the board pays gold. Progress is recorded in the
// hero's own save (`hero.worldTree`), rolls over with the raid allowances at midnight UTC, and
// pays through the ordinary client reward path (like arena duels and the daily chest).
// Sealed vaults are the realm's one-time finds: break the warden once and the seal is spent.

import { addMats } from "./crafting";
import type { Hero } from "./data";
import { goldGain } from "./gold";

export const BOUNTY_KINDS = ["gold", "ore", "boss", "castle"] as const;
export type BountyKind = (typeof BOUNTY_KINDS)[number];

export interface Bounty {
  /** Stable per day and kind, so a claim can never pay twice. */
  id: string;
  kind: BountyKind;
  need: number;
  gold: number;
  title: string;
  blurb: string;
}

/** Today's raid tallies and the bounties already claimed. */
export interface BountyLedger {
  day: string;
  gold: number;
  ore: number;
  boss: number;
  castle: number;
  claimed: string[];
}

export type WorldTreeSave = Hero["worldTree"];

/** The same UTC day the raid allowances reset on. */
export const worldTreeDay = (now = new Date()) => now.toISOString().slice(0, 10);

const SPECS: Record<
  BountyKind,
  { need: number; title: string; blurb: string; gold: (level: number) => number }
> = {
  gold: {
    need: 6,
    title: "Plunder the Mines",
    blurb: "Clear six gold-mine raids anywhere in the realm.",
    gold: (level) => goldGain(160 + level * 26, level),
  },
  ore: {
    need: 5,
    title: "Break the Seams",
    blurb: "Clear five ore-dungeon raids.",
    gold: (level) => goldGain(190 + level * 30, level),
  },
  boss: {
    need: 2,
    title: "Hunt the Tyrants",
    blurb: "Fell two world bosses.",
    gold: (level) => goldGain(360 + level * 60, level),
  },
  castle: {
    need: 4,
    title: "Answer the Banners",
    blurb: "Storm four rival castles.",
    gold: (level) => goldGain(230 + level * 40, level),
  },
};

const dayHash = (day: string) =>
  [...day].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** The three bounties posted today, rotating through the four raid kinds so every kind comes up. */
export function bountyBoard(level: number, day = worldTreeDay()): Bounty[] {
  const start = dayHash(day) % BOUNTY_KINDS.length;
  return [0, 1, 2].map((step) => {
    const kind = BOUNTY_KINDS[(start + step) % BOUNTY_KINDS.length]!;
    const spec = SPECS[kind];
    return {
      id: `${day}:${kind}`,
      kind,
      need: spec.need,
      gold: spec.gold(level),
      title: spec.title,
      blurb: spec.blurb,
    };
  });
}

const emptyLedger = (day: string): BountyLedger => ({
  day,
  gold: 0,
  ore: 0,
  boss: 0,
  castle: 0,
  claimed: [],
});

/** Today's ledger; a ledger from an earlier day reads as empty. */
export function bountyLedger(h: Pick<Hero, "worldTree">, day = worldTreeDay()): BountyLedger {
  const saved = h.worldTree?.bounties;
  if (!saved || saved.day !== day) return emptyLedger(day);
  return {
    day,
    gold: Math.max(0, saved.gold ?? 0),
    ore: Math.max(0, saved.ore ?? 0),
    boss: Math.max(0, saved.boss ?? 0),
    castle: Math.max(0, saved.castle ?? 0),
    claimed: saved.claimed ?? [],
  };
}

/** How many raids of a kind today's ledger has counted. */
export const bountyProgress = (
  h: Pick<Hero, "worldTree">,
  kind: BountyKind,
  day = worldTreeDay(),
) => bountyLedger(h, day)[kind];

/** A bounty is claimable once its count is met and it has not been paid yet. */
export const bountyReady = (h: Pick<Hero, "worldTree">, bounty: Bounty) => {
  const ledger = bountyLedger(h);
  return ledger[bounty.kind] >= bounty.need && !ledger.claimed.includes(bounty.id);
};

export const bountiesReady = (h: Pick<Hero, "worldTree">, level: number) =>
  bountyBoard(level).filter((bounty) => bountyReady(h, bounty)).length;

/** Count one cleared raid. Call it from inside `update`, after the reward was confirmed. */
export function recordBounty(h: Hero, kind: BountyKind) {
  const ledger = bountyLedger(h);
  h.worldTree = {
    ...h.worldTree,
    bounties: {
      ...ledger,
      [kind]: ledger[kind] + 1,
      claimed: ledger.claimed.filter((id) => id.startsWith(`${ledger.day}:`)),
    },
  };
}

/** Pay a finished bounty. Returns the gold paid, or 0 when it was not ready. */
export function claimBounty(h: Hero, bounty: Bounty): number {
  if (!bountyReady(h, bounty)) return 0;
  const ledger = bountyLedger(h);
  h.gold += bounty.gold;
  h.worldTree = {
    ...h.worldTree,
    bounties: { ...ledger, claimed: [...ledger.claimed, bounty.id] },
  };
  return bounty.gold;
}

/* ------------------------------ sealed vaults ------------------------------ */

/** Whether this hero has already broken a vault's seal. */
export const vaultClaimed = (h: Pick<Hero, "worldTree">, siteId: string) =>
  (h.worldTree?.caches ?? []).includes(siteId);

/** Open a vault once. Returns false when another hero already has this seal in their ledger. */
export function claimVault(h: Hero, siteId: string): boolean {
  const caches = h.worldTree?.caches ?? [];
  if (caches.includes(siteId)) return false;
  h.worldTree = { ...h.worldTree, caches: [...caches, siteId] };
  return true;
}

/** Pay a broken vault into the save: gold plus forge stock. */
export function openVault(
  h: Hero,
  siteId: string,
  reward: { gold: number; mats: { ore: number; essence: number } },
) {
  if (!claimVault(h, siteId)) return false;
  h.gold += reward.gold;
  addMats(h, reward.mats);
  return true;
}

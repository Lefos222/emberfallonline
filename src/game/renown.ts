import { zeroFx, type BonusFx } from "./crafting";
import type { Hero } from "./data";

// ============= Renown: the hero's own battle-earned upgrades =============
// Every won fight pays Renown, and Renown is spent on the hero alone: no gold,
// no barracks level and no building gate. Each track is a short ladder of
// permanent stat ranks, so fighting is always worth something by itself and a
// player who keeps playing keeps getting stronger outside the barracks.

export interface RenownTrack {
  id: string;
  name: string;
  /** The bonus the track feeds, in the shared bonus shape. */
  stat: keyof BonusFx;
  /** What one rank grants, in the stat's own unit. */
  per: number;
  /** Deepest rank of the track. */
  max: number;
  desc: string;
}

export const RENOWN_TRACKS: RenownTrack[] = [
  {
    id: "might",
    name: "Might",
    stat: "atkPct",
    per: 1,
    max: 20,
    desc: "Every fight won teaches a heavier strike.",
  },
  {
    id: "vigour",
    name: "Vigour",
    stat: "hpPct",
    per: 1.5,
    max: 20,
    desc: "Long campaigns build a deeper well of life.",
  },
  {
    id: "guard",
    name: "Guard",
    stat: "defPct",
    per: 1,
    max: 20,
    desc: "The scars you survived turn into armour.",
  },
  {
    id: "precision",
    name: "Precision",
    stat: "crit",
    per: 0.4,
    max: 15,
    desc: "A veteran reads the opening before it appears.",
  },
  {
    id: "footwork",
    name: "Footwork",
    stat: "dodge",
    per: 0.2,
    max: 15,
    desc: "A blade that has missed once misses twice.",
  },
  {
    id: "ferocity",
    name: "Ferocity",
    stat: "critDmg",
    per: 2,
    max: 15,
    desc: "The hits that land land harder than before.",
  },
];

/** Renown the hero has banked. */
export const renown = (h: Pick<Hero, "renown">) => Math.max(0, Math.floor(h.renown ?? 0));

/** Ranks the hero has bought in one track. */
export const renownRank = (h: Pick<Hero, "renownRanks">, id: string) =>
  Math.max(0, Math.floor(h.renownRanks?.[id] ?? 0));

/** Renown the next rank costs: every second rank of a track asks for one more. */
export const renownCost = (rank: number) => 1 + Math.floor(rank / 2);

/** Renown a won battle pays: bosses and dungeon/arena wins pay extra. */
export function renownGain(o: { boss?: boolean; dungeon?: boolean; arena?: boolean } = {}): number {
  return 2 + (o.boss ? 3 : 0) + (o.dungeon ? 1 : 0) + (o.arena ? 1 : 0);
}

/** What one rank is worth as text (one rank by default). */
export const renownText = (t: RenownTrack, ranks = 1) =>
  `+${+(t.per * ranks).toFixed(1)}% ${t.name.toLowerCase()}`;

/** Every bonus the hero's renown ranks grant, in the shared bonus shape. */
export function renownFx(h: Pick<Hero, "renownRanks">): BonusFx {
  const out = zeroFx();
  for (const t of RENOWN_TRACKS) {
    const r = renownRank(h, t.id);
    if (r > 0) out[t.stat] += t.per * r;
  }
  return out;
}

/** Why the next rank can't be bought, or null when it can. */
export function renownBlocker(h: Pick<Hero, "renown" | "renownRanks">, id: string): string | null {
  const t = RENOWN_TRACKS.find((x) => x.id === id);
  if (!t) return "Unknown upgrade";
  const rank = renownRank(h, id);
  if (rank >= t.max) return "Fully trained";
  const cost = renownCost(rank);
  if (renown(h) < cost) return `Need ${cost} Renown`;
  return null;
}

/** Spend Renown on one rank. Returns an error string, or null on success. */
export function buyRenownRank(h: Pick<Hero, "renown" | "renownRanks">, id: string): string | null {
  const blocked = renownBlocker(h, id);
  if (blocked) return blocked;
  const rank = renownRank(h, id);
  h.renown = renown(h) - renownCost(rank);
  h.renownRanks = { ...(h.renownRanks ?? {}), [id]: rank + 1 };
  return null;
}

/** Bank a won battle's Renown on the hero. */
export function addRenown(h: Pick<Hero, "renown">, n: number) {
  h.renown = renown(h) + Math.max(0, Math.floor(n));
}

/** Total ranks bought across every track — the hero's training level. */
export const renownTotal = (h: Pick<Hero, "renownRanks">) =>
  RENOWN_TRACKS.reduce((sum, t) => sum + renownRank(h, t.id), 0);

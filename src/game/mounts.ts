import type { Hero } from "./data";
import { scaledGold } from "./gold";
import bay from "@/assets/mounts/bay.webp";
import wolf from "@/assets/mounts/wolf.webp";
import boar from "@/assets/mounts/boar.webp";
import stallion from "@/assets/mounts/stallion.webp";
import drake from "@/assets/mounts/drake.webp";
import stag from "@/assets/mounts/stag.webp";
import nightmare from "@/assets/mounts/nightmare.webp";
import griffin from "@/assets/mounts/griffin.webp";

/**
 * Mounts shorten every blitz by a percentage. Three are bought with gold (saved in `hero.mounts`);
 * the other five cost Diamonds and are owned server-side (`srv.mounts`, granted by `premium_service`,
 * whose SQL price table must match the `diamonds` values below).
 *
 * Every mount is hired, not kept: buying one starts a seven-day lease (`hero.mounts.until`), and
 * once it lapses the mount is stabled — it gives no blitz cut until it is renewed for gold.
 */
export interface Mount { id: string; name: string; desc: string; blitzPct: number; gold?: number; diamonds?: number; img: string }

export const MOUNT_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
export const MOUNT_LIFETIME_MS = MOUNT_DAYS * DAY_MS;

export const MOUNTS: Mount[] = [
  { id: "bay", name: "Bay Warhorse", desc: "A steady road horse from the castle stables.", blitzPct: 5, gold: 20000, img: bay },
  { id: "wolf", name: "Dire Wolf", desc: "Runs the forest paths faster than any horse.", blitzPct: 8, gold: 60000, img: wolf },
  { id: "boar", name: "Iron Boar", desc: "An armoured boar that charges through every gate.", blitzPct: 10, gold: 150000, img: boar },
  { id: "stallion", name: "Royal Stallion", desc: "A gold-barded white stallion of the royal line.", blitzPct: 12, diamonds: 330, img: stallion },
  { id: "drake", name: "Crimson Drake", desc: "A fire drake that crosses the realm in a breath.", blitzPct: 15, diamonds: 660, img: drake },
  { id: "stag", name: "Frost Spirit Stag", desc: "A spectral stag that walks between snowflakes.", blitzPct: 18, diamonds: 990, img: stag },
  { id: "nightmare", name: "Nightmare", desc: "A shadow steed whose hooves burn the road.", blitzPct: 21, diamonds: 1430, img: nightmare },
  { id: "griffin", name: "Golden Griffin", desc: "The swiftest mount in Emberfall, master of the skies.", blitzPct: 25, diamonds: 2200, img: griffin },
];

export const mountPrice = (m: Mount, level: number) => (m.gold ? scaledGold(m.gold, level) : 0);

/** What stabling a lapsed mount costs for another week: half a gold mount's price, a flat fee otherwise. */
export const mountRenewPrice = (m: Mount, level: number) =>
  m.gold ? Math.max(1, Math.round(mountPrice(m, level) / 2)) : scaledGold(40000, level);

/** A mount the hero has unlocked (gold purchase or server-owned Diamond purchase). */
export function ownsMount(h: Hero, id: string) {
  return (h.mounts?.owned ?? []).includes(id) || ((h.srv as { mounts?: string[] } | undefined)?.mounts ?? []).includes(id);
}

/** When the current seven-day lease ends (epoch ms); 0 when the save predates the clock. */
export const mountUntil = (h: Hero, id: string) => h.mounts?.until?.[id] ?? 0;

export const mountExpired = (h: Hero, id: string) => {
  const until = mountUntil(h, id);
  return until > 0 && Date.now() >= until;
};

/** Whole days left on the lease, rounded up; 0 once it has lapsed. */
export function mountDaysLeft(h: Hero, id: string) {
  const until = mountUntil(h, id);
  return until > 0 ? Math.max(0, Math.ceil((until - Date.now()) / DAY_MS)) : 0;
}

/** Unlocked and still on its lease — the only state in which a mount does anything. */
export const mountReady = (h: Hero, id: string) => ownsMount(h, id) && !mountExpired(h, id);

/** The blitz-time cut of the ridden mount, or 0 when none is ridden or its lease has lapsed. */
export function mountBlitzPct(h: Hero) {
  const id = h.mounts?.active;
  const m = MOUNTS.find((x) => x.id === id);
  return m && mountReady(h, m.id) ? m.blitzPct : 0;
}

/** Start (or restart) a mount's seven-day lease. Used on purchase and renewal. */
export function startMountClock(h: Hero, id: string) {
  h.mounts = { ...(h.mounts ?? {}), until: { ...(h.mounts?.until ?? {}), [id]: Date.now() + MOUNT_LIFETIME_MS } };
}

export function buyGoldMount(h: Hero, id: string): string | null {
  const m = MOUNTS.find((x) => x.id === id);
  if (!m || !m.gold) return "That mount is not sold for gold";
  if (ownsMount(h, id)) return "Already owned";
  const price = mountPrice(m, h.level);
  if (h.gold < price) return "Not enough gold";
  h.gold -= price;
  h.mounts = { ...(h.mounts ?? {}), owned: [...(h.mounts?.owned ?? []), id], active: id };
  startMountClock(h, id);
  return null;
}

/** Pay a lapsed mount's stabling fee and ride it again for another week. */
export function renewMount(h: Hero, id: string): string | null {
  const m = MOUNTS.find((x) => x.id === id);
  if (!m) return "Unknown mount";
  if (!ownsMount(h, id)) return "You do not own that mount";
  const fee = mountRenewPrice(m, h.level);
  if (h.gold < fee) return "Not enough gold";
  h.gold -= fee;
  startMountClock(h, id);
  h.mounts = { ...(h.mounts ?? {}), active: id };
  return null;
}

export function rideMount(h: Hero, id: string | null) {
  if (id && !mountReady(h, id)) return;
  h.mounts = { ...(h.mounts ?? {}), active: id ?? undefined };
}

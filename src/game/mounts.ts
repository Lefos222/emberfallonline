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
 */
export interface Mount { id: string; name: string; desc: string; blitzPct: number; gold?: number; diamonds?: number; img: string }

export const MOUNTS: Mount[] = [
  { id: "bay", name: "Bay Warhorse", desc: "A steady road horse from the castle stables.", blitzPct: 5, gold: 20000, img: bay },
  { id: "wolf", name: "Dire Wolf", desc: "Runs the forest paths faster than any horse.", blitzPct: 8, gold: 60000, img: wolf },
  { id: "boar", name: "Iron Boar", desc: "An armoured boar that charges through every gate.", blitzPct: 10, gold: 150000, img: boar },
  { id: "stallion", name: "Royal Stallion", desc: "A gold-barded white stallion of the royal line.", blitzPct: 12, diamonds: 300, img: stallion },
  { id: "drake", name: "Crimson Drake", desc: "A fire drake that crosses the realm in a breath.", blitzPct: 15, diamonds: 600, img: drake },
  { id: "stag", name: "Frost Spirit Stag", desc: "A spectral stag that walks between snowflakes.", blitzPct: 18, diamonds: 900, img: stag },
  { id: "nightmare", name: "Nightmare", desc: "A shadow steed whose hooves burn the road.", blitzPct: 21, diamonds: 1300, img: nightmare },
  { id: "griffin", name: "Golden Griffin", desc: "The swiftest mount in Emberfall, master of the skies.", blitzPct: 25, diamonds: 2000, img: griffin },
];

export const mountPrice = (m: Mount, level: number) => (m.gold ? scaledGold(m.gold, level) : 0);

export function ownsMount(h: Hero, id: string) {
  return (h.mounts?.owned ?? []).includes(id) || ((h.srv as { mounts?: string[] } | undefined)?.mounts ?? []).includes(id);
}

/** The blitz-time cut of the ridden mount, or 0 when none is ridden or it is not owned. */
export function mountBlitzPct(h: Hero) {
  const id = h.mounts?.active;
  const m = MOUNTS.find((x) => x.id === id);
  return m && ownsMount(h, m.id) ? m.blitzPct : 0;
}

export function buyGoldMount(h: Hero, id: string): string | null {
  const m = MOUNTS.find((x) => x.id === id);
  if (!m || !m.gold) return "That mount is not sold for gold";
  if (ownsMount(h, id)) return "Already owned";
  const price = mountPrice(m, h.level);
  if (h.gold < price) return "Not enough gold";
  h.gold -= price;
  h.mounts = { ...(h.mounts ?? {}), owned: [...(h.mounts?.owned ?? []), id], active: id };
  return null;
}

export function rideMount(h: Hero, id: string | null) {
  if (id && !ownsMount(h, id)) return;
  h.mounts = { ...(h.mounts ?? {}), active: id ?? undefined };
}

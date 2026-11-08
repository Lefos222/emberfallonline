import { invCap, makeItem, type Hero, type Item, type Slot } from "./data";
import { scaledGold } from "./gold";

/**
 * The Auction House catalogue: six separate copies of ordinary armour (and the occasional
 * weapon) open to every player. It is deliberately unimpressive gear at a steep price — a wide
 * shop for early heroes, never a shortcut past the Forge or a boss drop — and restocks every
 * hour. The stock is rolled per hero and saved, so it survives refreshes within the hour.
 */

export const CATALOGUE_SIZE = 6;
export const CATALOGUE_REFRESH_MS = 60 * 60 * 1000;
const CATALOGUE_SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring"];

/** The hour stamp the stock belongs to. */
export const catalogueHour = (now = Date.now()) =>
  new Date(Math.floor(now / CATALOGUE_REFRESH_MS) * CATALOGUE_REFRESH_MS).toISOString();

/** When the catalogue restocks. */
export const catalogueRefreshAt = (now = Date.now()) =>
  Math.floor(now / CATALOGUE_REFRESH_MS) * CATALOGUE_REFRESH_MS + CATALOGUE_REFRESH_MS;

/**
 * One catalogue roll: plain gear (mostly common, sometimes uncommon) built a few levels below the
 * buyer, so nothing here is ever overpowered. `makeItem` paints them from the same atlas.
 */
export function rollCatalogue(h: Pick<Hero, "cls" | "level">, rand = Math.random): Item[] {
  return Array.from({ length: CATALOGUE_SIZE }, (_, i) => {
    const slot = CATALOGUE_SLOTS[i % CATALOGUE_SLOTS.length];
    const rarity = rand() < 0.25 ? 1 : 0;
    const ilvl = Math.max(1, Math.round(h.level * 0.55 + rand() * 3));
    return makeItem(h.cls, ilvl, rarity, slot);
  });
}

/** The hero's current catalogue stock, rolled again whenever the hour turns. */
export function catalogueStock(h: Hero, now = Date.now()): Item[] {
  const hour = catalogueHour(now);
  if (!h.catalogue || h.catalogue.hour !== hour || !Array.isArray(h.catalogue.items) || h.catalogue.items.length === 0) {
    h.catalogue = { hour, items: rollCatalogue(h) };
  }
  return h.catalogue.items;
}

/** The house's cut on gear: every armour and weapon in the catalogue sells 70% off its old price. */
export const CATALOGUE_DISCOUNT = 0.7;

/**
 * What the catalogue charges: a premium over what the piece is worth, scaled by the hero's level
 * like every other gold price, then cut by the house's 70% discount on gear.
 */
export const cataloguePrice = (it: Item, level = 1) =>
  Math.max(
    1,
    Math.round(
      scaledGold(Math.round((12000 + it.ilvl * 1400) * (1 + it.rarity * 0.9)), level) * (1 - CATALOGUE_DISCOUNT),
    ),
  );

/** Buy one catalogue piece. Returns an error message, or null on success. */
export function buyCatalogueItem(h: Hero, id: string, now = Date.now()): string | null {
  const stock = catalogueStock(h, now);
  const it = stock.find((x) => x.id === id);
  if (!it) return "That piece has already been sold — the catalogue restocks on the hour";
  const price = cataloguePrice(it, h.level);
  if (h.gold < price) return `Not enough gold — ${price.toLocaleString()} needed`;
  if (h.inventory.length >= invCap(h)) return "Your bag is full";
  h.gold -= price;
  h.catalogue = { hour: catalogueHour(now), items: stock.filter((x) => x.id !== id) };
  h.inventory.unshift(it);
  return null;
}

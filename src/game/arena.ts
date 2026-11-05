import { makeItem, type Hero, type HeroClass, type Item, type Slot } from "./data";

/**
 * The Blood Arena's own economy.
 *
 * Arena Marks are earned only by duelling real heroes — never bought, never dropped — and
 * are spent in the Arena armory on a unique piece for each class. The armory is deliberately
 * the most expensive shop in the castle: a single piece costs more than a full forged set,
 * so wearing arena gear is proof of the pit, not of a deep purse.
 */
export const ARENA_MARK_WIN = 60;
export const ARENA_MARK_LOSS = 15;

/** What a hero has in the bank right now. */
export const arenaMarks = (h: { arenaMarks?: number }) => h.arenaMarks ?? 0;

/** Marks a finished duel pays. Every fight pays something, so a losing streak still progresses. */
export const duelMarks = (won: boolean) => (won ? ARENA_MARK_WIN : ARENA_MARK_LOSS);

export interface ArenaGood {
  id: string;
  name: string;
  desc: string;
  /** Only a hero of this class may buy and wear it. */
  cls: HeroClass;
  slot: Slot;
  ilvl: number;
  /** Index into the shared gear atlas for this slot. */
  icon: number;
  /** Price in Arena Marks. */
  marks: number;
}

/** The armory: four unique pieces per class, each sold at a pit-fighter's price. */
export const ARENA_SHOP: ArenaGood[] = [
  // ---- Knight ----
  { id: "w-bloodsworn-blade", name: "Bloodsworn Greatblade", desc: "Quenched in the pit's sand; it has never been drawn in peace.", cls: "warrior", slot: "weapon", ilvl: 100, icon: 5, marks: 4200 },
  { id: "w-bulwark-pit", name: "Bulwark of the Blood Pit", desc: "Scarred plate hammered from the shields of the fallen.", cls: "warrior", slot: "armour", ilvl: 96, icon: 5, marks: 3400 },
  { id: "w-duelist-crown", name: "Crown of the Undefeated", desc: "An iron circlet worn only while the crowd still cheers.", cls: "warrior", slot: "helmet", ilvl: 92, icon: 5, marks: 2400 },
  { id: "w-pit-treads", name: "Treads of the Long Duel", desc: "Sand-worn greaves that never slip on blood.", cls: "warrior", slot: "boots", ilvl: 88, icon: 5, marks: 1800 },
  // ---- Mage ----
  { id: "m-bloodsigil-staff", name: "Bloodsigil Staff", desc: "Every rune on it is a name the arena has taken.", cls: "mage", slot: "weapon", ilvl: 100, icon: 5, marks: 4200 },
  { id: "m-voidmantle", name: "Voidmantle of the Arena", desc: "A robe woven where the pit's shadows pool thickest.", cls: "mage", slot: "armour", ilvl: 96, icon: 5, marks: 3400 },
  { id: "m-bloodpact-circlet", name: "Circlet of the Blood Pact", desc: "Whispers the next move of anyone who has ever lost here.", cls: "mage", slot: "helmet", ilvl: 92, icon: 5, marks: 2400 },
  { id: "m-banished-steps", name: "Steps of the Banished", desc: "Slippers that leave no print in the arena sand.", cls: "mage", slot: "boots", ilvl: 88, icon: 5, marks: 1800 },
  // ---- Archer ----
  { id: "a-redwind-bow", name: "Redwind Longbow", desc: "Strung with the tendon of something that used to hunt duelists.", cls: "archer", slot: "weapon", ilvl: 100, icon: 5, marks: 4200 },
  { id: "a-stalker-hide", name: "Stalker's Bloodhide", desc: "The crowd never sees the archer, only the wound.", cls: "archer", slot: "armour", ilvl: 96, icon: 5, marks: 3400 },
  { id: "a-pit-hood", name: "Hood of the Pit", desc: "Cut so the roar of the stands never reaches the ear.", cls: "archer", slot: "helmet", ilvl: 92, icon: 5, marks: 2400 },
  { id: "a-swiftblood-boots", name: "Swiftblood Boots", desc: "Light enough to cross the whole arena in three strides.", cls: "archer", slot: "boots", ilvl: 88, icon: 5, marks: 1800 },
];

/** The armory, filtered to what this character may actually buy. */
export const arenaStock = (h: Pick<Hero, "cls">) => ARENA_SHOP.filter((g) => g.cls === h.cls);

/** What blocks this purchase right now, or null when the marks are there. */
export function arenaBuyBlocker(h: Hero, g: ArenaGood, cap: number): string | null {
  if (h.cls !== g.cls) return "Your class cannot wield this";
  if (arenaMarks(h) < g.marks) return `Needs ${g.marks.toLocaleString()} Arena Marks`;
  if (h.inventory.length >= cap) return "Bag is full";
  return null;
}

/** The atlas only has so many variants per slot; the armory's picks stay inside it. */
const iconLimit = (slot: Slot) => (slot === "ring" ? 15 : slot === "talisman" ? 7 : 5);

/** The piece as it would sit in the bag — the armory uses it for previews too. */
export function arenaPreview(g: ArenaGood): Item {
  const item = makeItem(g.cls, g.ilvl, 5, g.slot);
  item.name = g.name;
  item.icon = Math.min(iconLimit(g.slot), g.icon);
  item.crafted = true;
  return item;
}

/** Buy one armory piece: spends its marks and hands back the unique item. */
export function buyArenaGood(h: Hero, g: ArenaGood, cap: number): Item | string {
  const blocked = arenaBuyBlocker(h, g, cap);
  if (blocked) return blocked;
  h.arenaMarks = arenaMarks(h) - g.marks;
  const item = arenaPreview(g);
  h.inventory.unshift(item);
  return item;
}

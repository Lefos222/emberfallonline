/** Version 1.00 — the release marker shown on the castle and in the patch notes. */
export const VERSION = "1.00";

export interface NoteSection { title: string; lines: string[] }

export const RELEASE_NOTES: NoteSection[] = [
  {
    title: "Stamina & potions",
    lines: [
      "200 stamina a day. Every Campaign Gate battle costs 20 — win or lose — and a dungeon run costs 10.",
      "Stamina Potions restore 50 each and at most 5 can be drunk a day. They are a rare dungeon drop and cost 85,000 gold at the Auction House.",
      "New Elixir of Strength: the red battle elixir, +20% physical attack for 30 minutes.",
      "Your potion pouch now lives under the stamina bar — tap it to drink.",
    ],
  },
  {
    title: "Magic Tower",
    lines: [
      "Full Astral rework: 23 species across Shadow, Chaos and Void, each with its own unique stat mix.",
      "Astrals upgrade to infinite levels with gold — the deeper the level, the steeper the price.",
      "New vault screen with the species codex, seating ring and duplicate absorption.",
    ],
  },
  {
    title: "Barracks",
    lines: [
      "The Barracks is now exactly four cards: Strength, Intelligence, Agility and Vitality.",
      "Each card is a permanent, endless gold upgrade. Nothing else lives in the building.",
    ],
  },
  {
    title: "Auction House",
    lines: [
      "The Royal Treasury is now the Auction House, with three tabs: Catalogue, Shop and Auction.",
      "Catalogue: modest armour for every player, restocked every hour — expensive, never overpowered.",
      "Shop: game goods for gold, including Stamina Potions and Elixirs of Strength.",
      "Auction: the player-to-player market for trading gear and gems.",
    ],
  },
  {
    title: "Progression",
    lines: [
      "Levelling is far harder: every level asks for much more XP from the start and deepens past level 20.",
      "Level 30 is a wall: one level there costs 1,300 extra fights and every level after it grows by 172 fights instead of 52, so 30→31 and beyond is a long grind.",
      "Quest XP shrinks past the wall (a level-40 commission pays about a third of its old share), so fighting — not the quest board — is how you level.",
      "Blitzes now pay 70% less XP; they remain a gold and clearing shortcut, not a levelling one.",
    ],
  },
  {
    title: "Quality of life",
    lines: [
      "Tap any bag or worn item to compare, equip, unequip or sell it right where you are — no more scrolling.",
      "This is version 1.00. Thank you for playing Emberfall.",
    ],
  },
];

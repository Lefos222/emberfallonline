import type { ArtIconName } from "./ArtIcon";
import { ArtIcon } from "./ArtIcon";
import { GemIcon, MatIcon, StoneIcon } from "./MatIcon";
import { GoldCoin } from "./CoinIcon";
import { GEMS, MATS, type GemType, type Mat } from "./crafting";
import { t } from "./i18n";
import activityDesk from "@/assets/activity-command-desk.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaField from "@/assets/arena-field.jpg";
import cardName from "@/assets/card-name.webp";
import chestGold from "@/assets/chest-gold.webp";
import craftingTrophies from "@/assets/crafting-trophies.png";
import farmCountryside from "@/assets/farm-countryside.jpg";
import farmCropStages from "@/assets/farm-crop-stages.png";
import farmEstate from "@/assets/farm-estate.jpg";
import farmMoon from "@/assets/farm-moon.webp";
import farmSun from "@/assets/farm-sun.webp";
import gateCampaign from "@/assets/gate-campaign.webp";
import gateConquest from "@/assets/gate-conquest.webp";
import gateDungeon from "@/assets/gate-dungeon.webp";
import gatheringRegions from "@/assets/gathering-regions.jpg";
import gearAtlas from "@/assets/gear-atlas.jpg";
import archerIdle from "@/assets/heroes/archer-male-idle.png";
import knightIdle from "@/assets/heroes/knight-male-idle.png";
import mageIdle from "@/assets/heroes/mage-male-idle.png";
import selectionBloodmoon from "@/assets/heroes/selection-bloodmoon.jpg";
import magicTower from "@/assets/magic-tower-observatory.jpg";
import stallion from "@/assets/mounts/stallion.webp";
import potionStrength from "@/assets/potion-strength.png";
import rose from "@/assets/friendship-rose.png";
import runeFlame from "@/assets/runes/flame.webp";
import sceneAuctionHouse from "@/assets/scene-auction-house.jpg";
import sceneGuildHall from "@/assets/scene-guild-hall.jpg";
import sceneWorldMap from "@/assets/scene-world-map.jpg";
import spireCatacomb from "@/assets/spire-catacomb.jpg";
import spireChest from "@/assets/spire-chest.webp";
import staminaPotion from "@/assets/stamina-potion.png";
import wheel from "@/assets/wheel-of-fortune.webp";
import worldCastle from "@/assets/world-castle.png";
import worldMap from "@/assets/world-map.jpg";
import worldKeep from "@/assets/worldtree/keep.webp";

/**
 * The guide's pictures and icons.
 *
 * Everything here is game art the player already sees in the castle: the gate banners, the painted
 * class heroes, the real material, gem and enchantment-stone icons. A newcomer recognises a picture
 * faster than a sentence, so every chapter carries a painted scene and every step a glyph.
 */

/** A picture or an in-game icon, drawn at the head of one guide step. */
export type GuideGlyph =
  | { kind: "art"; name: ArtIconName }
  | { kind: "mat"; mat: Mat }
  | { kind: "gem"; gem: GemType }
  | { kind: "stone"; level: number }
  | { kind: "gold" }
  | { kind: "img"; src: string; fit?: "cover" | "contain" };

/** The painted band across the top of a chapter. */
export const CHAPTER_ART: Record<string, { src: string; fit: string }> = {
  start: { src: gateCampaign, fit: "object-cover" },
  classes: { src: selectionBloodmoon, fit: "object-cover" },
  fight: { src: arenaField, fit: "object-cover" },
  gear: { src: gearAtlas, fit: "object-cover object-top" },
  forge: { src: craftingTrophies, fit: "object-cover" },
  gates: { src: gateDungeon, fit: "object-cover" },
  spire: { src: spireCatacomb, fit: "object-cover" },
  castle: { src: worldCastle, fit: "object-contain" },
  farm: { src: farmEstate, fit: "object-cover" },
  economy: { src: sceneAuctionHouse, fit: "object-cover" },
  grow: { src: gateConquest, fit: "object-cover" },
  guild: { src: sceneGuildHall, fit: "object-cover" },
  world: { src: sceneWorldMap, fit: "object-cover" },
  arena: { src: arenaCrypt, fit: "object-cover" },
  diamonds: { src: wheel, fit: "object-contain" },
  premium: { src: magicTower, fit: "object-cover" },
  daily: { src: activityDesk, fit: "object-cover" },
  tips: { src: farmCountryside, fit: "object-cover" },
  materials: { src: gatheringRegions, fit: "object-cover" },
};

/** One glyph per step, in the order the chapter lists them. */
export const STEP_GLYPHS: Record<string, GuideGlyph[]> = {
  start: [
    { kind: "art", name: "profile" },
    { kind: "img", src: gateCampaign },
    { kind: "art", name: "swords" },
    { kind: "art", name: "star" },
    { kind: "art", name: "bag" },
    { kind: "gold" },
  ],
  classes: [
    { kind: "img", src: knightIdle, fit: "contain" },
    { kind: "img", src: mageIdle, fit: "contain" },
    { kind: "img", src: archerIdle, fit: "contain" },
    { kind: "art", name: "star" },
    { kind: "art", name: "swords" },
  ],
  fight: [
    { kind: "art", name: "hourglass" },
    { kind: "art", name: "spellbook" },
    { kind: "img", src: potionStrength, fit: "contain" },
    { kind: "img", src: staminaPotion, fit: "contain" },
    { kind: "art", name: "swords" },
    { kind: "art", name: "shield" },
  ],
  gear: [
    { kind: "art", name: "star" },
    { kind: "art", name: "shield" },
    { kind: "gem", gem: "topaz" },
    { kind: "art", name: "bag" },
    { kind: "img", src: chestGold, fit: "contain" },
  ],
  forge: [
    { kind: "art", name: "hammer" },
    { kind: "gem", gem: "ruby" },
    { kind: "art", name: "astral" },
    { kind: "img", src: craftingTrophies },
    { kind: "mat", mat: "dragonScale" },
    { kind: "img", src: runeFlame, fit: "contain" },
  ],
  gates: [
    { kind: "img", src: gateCampaign },
    { kind: "img", src: gateDungeon },
    { kind: "img", src: gateConquest },
    { kind: "art", name: "scroll" },
    { kind: "img", src: spireChest, fit: "contain" },
  ],
  spire: [
    { kind: "img", src: spireCatacomb },
    { kind: "art", name: "friends" },
    { kind: "art", name: "swords" },
    { kind: "img", src: spireChest, fit: "contain" },
    { kind: "art", name: "hourglass" },
  ],
  castle: [
    { kind: "gold" },
    { kind: "art", name: "hammer" },
    { kind: "img", src: worldCastle, fit: "contain" },
    { kind: "art", name: "gift" },
    { kind: "art", name: "mail" },
  ],
  farm: [
    { kind: "img", src: farmEstate },
    { kind: "img", src: farmSun, fit: "contain" },
    { kind: "img", src: farmCropStages, fit: "contain" },
    { kind: "img", src: farmMoon, fit: "contain" },
    { kind: "art", name: "goblet" },
  ],
  economy: [
    { kind: "gold" },
    { kind: "art", name: "auction" },
    { kind: "art", name: "gift" },
    { kind: "img", src: wheel, fit: "contain" },
    { kind: "mat", mat: "sunCrystal" },
  ],
  grow: [
    { kind: "art", name: "star" },
    { kind: "mat", mat: "essence" },
    { kind: "img", src: stallion, fit: "contain" },
    { kind: "art", name: "quest" },
  ],
  guild: [
    { kind: "art", name: "guild" },
    { kind: "art", name: "coins" },
    { kind: "art", name: "swords" },
    { kind: "img", src: worldKeep, fit: "contain" },
    { kind: "mat", mat: "ore" },
    { kind: "art", name: "gift" },
  ],
  world: [
    { kind: "img", src: worldMap },
    { kind: "img", src: gatheringRegions },
    { kind: "img", src: worldKeep, fit: "contain" },
    { kind: "art", name: "quest" },
    { kind: "art", name: "swords" },
  ],
  arena: [
    { kind: "art", name: "swords" },
    { kind: "art", name: "star" },
    { kind: "art", name: "goblet" },
    { kind: "art", name: "shield" },
    { kind: "art", name: "hourglass" },
  ],
  diamonds: [
    { kind: "art", name: "diamond" },
    { kind: "gold" },
    { kind: "art", name: "star" },
    { kind: "img", src: wheel, fit: "contain" },
    { kind: "art", name: "hourglass" },
    { kind: "mat", mat: "fateStone" },
  ],
  premium: [
    { kind: "art", name: "crown" },
    { kind: "img", src: stallion, fit: "contain" },
    { kind: "img", src: cardName, fit: "contain" },
    { kind: "art", name: "coins" },
    { kind: "art", name: "notes" },
  ],
  daily: [
    { kind: "art", name: "gift" },
    { kind: "img", src: staminaPotion, fit: "contain" },
    { kind: "art", name: "hourglass" },
    { kind: "art", name: "guild" },
    { kind: "art", name: "bag" },
  ],
  tips: [
    { kind: "art", name: "shield" },
    { kind: "art", name: "scroll" },
    { kind: "img", src: chestGold, fit: "contain" },
    { kind: "art", name: "settings" },
    { kind: "gem", gem: "emerald" },
    { kind: "art", name: "spellbook" },
  ],
};

/** The materials chapter lists one step per entry of `MATS`, in table order, plus the rose. */
export function materialGlyph(index: number): GuideGlyph | undefined {
  const key = (Object.keys(MATS) as Mat[])[index];
  return key ? { kind: "mat", mat: key } : { kind: "img", src: rose, fit: "contain" };
}

/** The first things a new hero does, drawn with the icon of the screen that does it. */
export const GOAL_GLYPHS: Record<string, GuideGlyph> = {
  battle: { kind: "art", name: "swords" },
  level: { kind: "art", name: "star" },
  stage: { kind: "img", src: gateCampaign },
  forge: { kind: "art", name: "anvil" },
  dungeon: { kind: "img", src: gateDungeon },
  farm: { kind: "img", src: farmSun, fit: "contain" },
  talent: { kind: "art", name: "astral" },
  spire: { kind: "img", src: spireChest, fit: "contain" },
};

/** The three heroes a new player can pick, shown with the same painted models the game uses. */
export const CLASS_CARDS: {
  id: string;
  name: string;
  resource: string;
  note: string;
  art: string;
}[] = [
  {
    id: "warrior",
    name: "Warrior",
    resource: "Energy",
    note: "Sword and shield, the toughest of the three. Energy builds as you attack.",
    art: knightIdle,
  },
  {
    id: "mage",
    name: "Mage",
    resource: "Mana",
    note: "Fire and ice spells, paid for from a Mana pool.",
    art: mageIdle,
  },
  {
    id: "archer",
    name: "Archer",
    resource: "Focus",
    note: "Bows, high crit and dodge, paid for with Focus.",
    art: archerIdle,
  },
];

/** The recurring icons of the game — the legend that makes every screen readable. */
export const GUIDE_LEGEND: { get label(): string; glyph: GuideGlyph }[] = [
  {
    get label() {
      return t("Gold");
    },
    glyph: { kind: "gold" },
  },
  {
    get label() {
      return t("Diamonds");
    },
    glyph: { kind: "art", name: "diamond" },
  },
  {
    get label() {
      return t("Stamina Potion");
    },
    glyph: { kind: "img", src: staminaPotion, fit: "contain" },
  },
  {
    get label() {
      return MATS.enchantStone.name;
    },
    glyph: { kind: "stone", level: 1 },
  },
  {
    get label() {
      return MATS.ore.name;
    },
    glyph: { kind: "mat", mat: "ore" },
  },
  {
    get label() {
      return MATS.essence.name;
    },
    glyph: { kind: "mat", mat: "essence" },
  },
  {
    get label() {
      return MATS.starshard.name;
    },
    glyph: { kind: "mat", mat: "starshard" },
  },
  {
    get label() {
      return MATS.fragment.name;
    },
    glyph: { kind: "mat", mat: "fragment" },
  },
  {
    get label() {
      return MATS.hide.name;
    },
    glyph: { kind: "mat", mat: "hide" },
  },
  {
    get label() {
      return MATS.bloom.name;
    },
    glyph: { kind: "mat", mat: "bloom" },
  },
  {
    get label() {
      return GEMS.ruby.name;
    },
    glyph: { kind: "gem", gem: "ruby" },
  },
  {
    get label() {
      return GEMS.sapphire.name;
    },
    glyph: { kind: "gem", gem: "sapphire" },
  },
  {
    get label() {
      return GEMS.emerald.name;
    },
    glyph: { kind: "gem", gem: "emerald" },
  },
  {
    get label() {
      return GEMS.topaz.name;
    },
    glyph: { kind: "gem", gem: "topaz" },
  },
  {
    get label() {
      return t("Gold Chest");
    },
    glyph: { kind: "img", src: chestGold, fit: "contain" },
  },
];

/** Draws one glyph at the head of a step, whichever kind of picture it is. */
export function GuideGlyphIcon({ glyph, size = 32 }: { glyph: GuideGlyph; size?: number }) {
  switch (glyph.kind) {
    case "gold":
      return <GoldCoin size={size} />;
    case "mat":
      return <MatIcon mat={glyph.mat} size={size} />;
    case "gem":
      return <GemIcon type={glyph.gem} size={size} />;
    case "stone":
      return <StoneIcon level={glyph.level} size={size} />;
    case "art":
      return <ArtIcon name={glyph.name} size={size} />;
    case "img":
      return (
        <img
          src={glyph.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`h-full w-full ${glyph.fit === "contain" ? "object-contain p-0.5" : "object-cover"}`}
        />
      );
    default:
      return null;
  }
}

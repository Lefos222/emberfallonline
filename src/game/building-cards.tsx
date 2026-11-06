import castle from "@/assets/castle.jpg.asset.json";
import arenaField from "@/assets/arena-field.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import guildArt from "@/assets/guild-hall-buildings.webp";
import worldMapArt from "@/assets/world-map.jpg";
import gatheringAstral from "@/assets/gathering-astral.jpg";
import gatheringFrost from "@/assets/gathering-frost.jpg";
import gatheringEmber from "@/assets/gathering-ember.jpg";
import { ArtIcon, type ArtIconName } from "./ArtIcon";
import { CONQUEST_LEVEL, fightsToNextLevel, invCap, stageRewards, xpToNext, type BuildingId, type Hero } from "./data";
import { fmt } from "./ui";

const BUILDING_NAMES: Record<BuildingId, string> = {
  hall: "Throne Hall",
  armory: "Armory",
  temple: "Barracks",
  forge: "Blacksmith",
  oracle: "Quest Board",
  portal: "Campaign Gate",
  spire: "Conquest Gate",
  arena: "Arena",
  market: "Royal Treasury",
  dungeon: "Dungeon Gate",
  tower: "Magic Tower",
  gems: "Gem Workshop",
  guild: "Guild Hall",
  friends: "Friends",
  daily: "Daily Rewards",
  worldmap: "World Tree",
};

/**
 * What every castle building holds. Pressing a building on the castle map opens this card first:
 * the painted place, what waits inside and the hero's own progress, then one button into the window.
 */
export interface BuildingDetail {
  art: ArtIconName;
  banner?: string;
  tagline: string;
  inside: string[];
  /** One line of live progress for the hero standing in front of the door. */
  progress: (h: Hero) => string;
  /** Character level the door needs, when it has one. */
  requires?: number;
}

const equipped = (h: Hero) => Object.values(h.equipment ?? {}).filter(Boolean).length;

export const BUILDING_DETAILS: Record<BuildingId, BuildingDetail> = {
  hall: {
    art: "crown",
    banner: castle.url,
    tagline: "The seat of your power",
    inside: ["Skill tree and passive tree", "Attribute points and talent ranks", "Achievements, titles and battle history"],
    progress: (h) => `Level ${h.level} · ${fmt(h.xp)} / ${fmt(xpToNext(h))} XP · ${fightsToNextLevel(h)} fights to go`,
  },
  armory: {
    art: "bag",
    tagline: "Everything you carry",
    inside: ["Worn gear and set bonuses", "Bag, vault and overflow chest", "Full stat sheet and power breakdown"],
    progress: (h) => `Bag ${h.inventory.length}/${invCap(h)} · ${equipped(h)}/6 pieces worn`,
  },
  temple: {
    art: "profile",
    banner: gatheringEmber,
    tagline: "Train the body that carries the blade",
    inside: ["Strength, Intellect, Agility and Vitality", "Batch training with growing costs", "Barracks discounts and drill ranks"],
    progress: (h) => `STR ${h.attrs.str} · INT ${h.attrs.int} · AGI ${h.attrs.agi} · VIT ${h.attrs.vit}`,
  },
  forge: {
    art: "hammer",
    tagline: "Flame, hammer and patience",
    inside: ["Enhance worn gear for more power", "Salvage what you no longer wear", "Craft new armor from materials"],
    progress: (h) => `${fmt(h.gold)} gold to spend · ${fmt(h.crafts ?? 0)} items forged`,
  },
  oracle: {
    art: "quest",
    tagline: "Work for hire",
    inside: ["Daily commissions paid in gold and XP", "One level board per character level", "Bonus skill points from lucky boards"],
    progress: (h) => `Level ${h.level} board · ${(h.quests ?? []).length} region quests claimed`,
  },
  portal: {
    art: "quest",
    banner: worldMapArt,
    tagline: "The campaign road",
    inside: ["Zone stages with boss stages every tenth", "Catch-up XP when you fight above your level", "Stamina is spent only on a lost fight"],
    progress: (h) => `Stage ${h.stage} · a clear pays ${fmt(stageRewards(h.stage).xp)} XP · ${fightsToNextLevel(h)} fights to level ${h.level + 1}`,
  },
  spire: {
    art: "star",
    banner: arenaRift,
    tagline: "Endless floors, forever harder",
    inside: ["One floor at a time, no ceiling", "Conquest Tokens on every clear", "Rare+ loot from the deeper floors"],
    progress: (h) => (h.level >= CONQUEST_LEVEL ? `Floor ${h.spire} · ${fmt(h.conquest?.tokens ?? 0)} tokens` : `Locked · reach level ${CONQUEST_LEVEL}`),
    requires: CONQUEST_LEVEL,
  },
  arena: {
    art: "goblet",
    banner: arenaField,
    tagline: "Blood on the sand",
    inside: ["Challenge any hero on the ladder", "Duels pay gold and rating", "Full ladder standings"],
    progress: (h) => `${fmt(h.record?.arenaWins ?? 0)} arena wins`,
  },
  market: {
    art: "auction",
    tagline: "The Royal Treasury",
    inside: ["Six wares refreshed as you fight", "Buy gear for gold, no diamonds needed", "Gold packs and merchant stock"],
    progress: (h) => `${fmt(h.gold)} gold in hand · ${h.merchant?.length ?? 0} wares on the table`,
  },
  dungeon: {
    art: "star",
    banner: arenaCrypt,
    tagline: "Bosses, elites and expeditions",
    inside: ["Challenge bosses at rising difficulty", "Material expeditions by the crate", "Trial rewards and boss cores"],
    progress: (h) => `${Object.values(h.challenges ?? {}).reduce((a, n) => a + n, 0)} trial ranks cleared`,
  },
  tower: {
    art: "astral",
    banner: gatheringAstral,
    tagline: "Summon the small gods",
    inside: ["Summon Astrals for stat bonuses", "Upgrade and absorb duplicates", "Equip astrals into their own slots"],
    progress: (h) => `${h.astrals?.length ?? 0} astrals bound · ${(h.astralSlots ?? []).filter(Boolean).length} equipped`,
  },
  gems: {
    art: "gem",
    banner: gatheringFrost,
    tagline: "Cut, socket, fuse",
    inside: ["Cut gems from gathered ore", "Socket gems into worn gear", "Fuse three gems into a higher level"],
    progress: (h) => `${Object.values(h.gems ?? {}).reduce((a, n) => a + n, 0)} gems in the vault`,
  },
  guild: {
    art: "guild",
    banner: guildArt,
    tagline: "Steel is stronger in company",
    inside: ["Guild roster, charter and chat", "Guild skill tower with endless ranks", "Treasury, shop and records"],
    progress: () => "Guild courtyard",
  },
  friends: {
    art: "goblet",
    tagline: "Everyone you fight beside",
    inside: ["Friends, requests and messages", "See who is online", "Private conversations"],
    progress: () => "Friends list",
  },
  daily: {
    art: "gift",
    tagline: "Rewards for turning up",
    inside: ["30-day reward board", "Daily and weekly activities", "Gold chests and gem chests"],
    progress: (h) => `${h.dailyRewards?.cycles ?? 0} reward cycles finished`,
  },
  worldmap: {
    art: "star",
    banner: worldMapArt,
    tagline: "The world tree and its tyrants",
    inside: ["Regions with bosses and raids", "World events on a live clock", "Banner castles and conquest"],
    progress: (h) => `Best road stage ${h.road?.best ?? 0} · ${(h.quests ?? []).length} regions claimed`,
  },
};

/**
 * The door card: painted banner, the building's purpose, what is inside, the hero's own
 * progress and the single button that opens the real window.
 */
export function BuildingCard({ id, hero, onEnter, onClose }: { id: BuildingId; hero: Hero; onEnter: () => void; onClose: () => void }) {
  const d = BUILDING_DETAILS[id];
  const name = BUILDING_NAMES[id];
  const locked = d.requires !== undefined && hero.level < d.requires;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/75 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="game-panel anim-pop w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="building-banner relative h-32 md:h-40">
          {d.banner && <img src={d.banner} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-4 bottom-2 flex items-end gap-3">
            <span className="panel-crest shrink-0"><ArtIcon name={d.art} size={26} /></span>
            <div className="min-w-0">
              <h2 className="panel-title truncate text-2xl font-bold md:text-3xl">{name}</h2>
              <p className="truncate text-xs text-gold/90 md:text-sm">{d.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="btn-blood absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-sm">✕</button>
        </div>
        <div className="space-y-3 p-4">
          <ul className="space-y-1 text-sm">
            {d.inside.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
          <div className="slot px-3 py-2 text-xs">
            <span className="mr-2 uppercase tracking-wider text-muted-foreground">Your standing</span>
            <span className="font-bold text-foreground">{d.progress(hero)}</span>
          </div>
          {locked && <p className="text-sm text-hp">This door opens at character level {d.requires}.</p>}
          <div className="flex gap-2">
            <button className="btn-gold flex-1 py-2.5 text-lg" onClick={onEnter}>Enter</button>
            <button className="btn-ghost px-4" onClick={onClose}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

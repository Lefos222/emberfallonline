import enemiesSheet from "@/assets/enemies.jpg.asset.json";
import bossSheet from "@/assets/bosses.jpg.asset.json";
import { stageFoe, stageRewards, type Foe, type Hero } from "./data";

/** A rectangle on one of the uploaded 1920x1072 art sheets. */
export interface SpriteRect { url: string; x: number; y: number; w: number; h: number }
const SHEET_W = 1920, SHEET_H = 1072;
export { SHEET_W, SHEET_H };

// ---------- Bestiary (enemies.jpg: 12 x 5 grid) ----------
const B_X = (c: number) => 88 + c * 147.6;
const B_Y = [150, 330, 512, 693, 873];
export const BESTIARY: string[][] = [
  ["Goblin Scout", "Goblin Raider", "Dire Wolf", "Venom Spider", "Bandit", "Shadow Imp", "Bandit Chief", "Giant Slime", "Slime Brood", "Corrupted Treant", "Elder Treant", "Ancient Treant"],
  ["Skeleton", "Ghoul", "Ghoul Pack", "Ghost", "Banshee", "Skeleton Warrior", "Wailing Banshee", "Zombie Warrior", "Zombie Horde", "Plague Zombies", "Rotting Zombies", "Zombie Champion"],
  ["Gargoyle", "Stone Golem", "Bronze Golem", "Harpy", "Centaur", "Centaur Warlord", "Lava Hound", "Frost-fire Hound", "Fire Hound", "Hellhound", "Ice Troll", "Frost Troll"],
  ["Succubus", "Shadow Assassin", "Void Lurker", "Horned Fiend", "Horned Brute", "Chaos Mage", "Chaos Sorcerer", "Demon Mage", "Demon Knight", "Demon Warlock", "Chaos Archon", "Chaos Hierarch"],
  ["Death Knight", "Chimera", "Behemoth", "Stone Behemoth", "Giant Dragon", "Frost Dragon", "Ember Dragon", "Demon Lord", "Demon Overlord", "Infernal Lord", "Demon Warlords", "Abyssal Dragon"],
];
export const enemySprite = (row: number, col: number): SpriteRect => ({ url: enemiesSheet.url, x: B_X(col), y: B_Y[row]!, w: 120, h: 126 });

// ---------- Boss roster (bosses.jpg left grid 7 x 5 + four tier bosses) ----------
export const bossSprite = (row: number, col: number): SpriteRect => ({ url: bossSheet.url, x: 65 + col * 122, y: 213 + row * 149, w: 100, h: 108 });
export const TIER_BOSSES = {
  aegis: { name: "Aegis, the Iron Overlord", sprite: { url: bossSheet.url, x: 1050, y: 190, w: 330, h: 330 } },
  gorefiend: { name: "Gorefiend, the Blood Lord", sprite: { url: bossSheet.url, x: 1420, y: 185, w: 440, h: 340 } },
  tenebris: { name: "Tenebris, the Void Empress", sprite: { url: bossSheet.url, x: 940, y: 625, w: 520, h: 300 } },
  vulkan: { name: "Vulkan, the Ember Titan", sprite: { url: bossSheet.url, x: 1450, y: 625, w: 420, h: 300 } },
} as const;
export type TierBossId = keyof typeof TIER_BOSSES;

// ---------- Campaign regions ----------
export interface Region {
  id: string; name: string; row: number; level: number; color: string;
  boss: { name: string; sprite: SpriteRect; ability: string };
  /** map polyline (percent coords) the 10 stage nodes are placed along */
  path: [number, number][];
}
export const REGIONS: Region[] = [
  { id: "wilds", name: "Goblin Wilds", row: 0, level: 1, color: "var(--r1)",
    boss: { name: "Soul Harvester", sprite: bossSprite(0, 2), ability: "Drains life each hit" },
    path: [[6, 80], [14, 74], [22, 71], [30, 68], [37, 63]] },
  { id: "barrows", name: "Haunted Barrows", row: 1, level: 10, color: "var(--xp)",
    boss: { name: "Death Knight Malgor", sprite: bossSprite(0, 4), ability: "Heavy armor" },
    path: [[37, 60], [33, 50], [28, 43], [25, 34], [30, 27]] },
  { id: "peaks", name: "Molten Peaks", row: 2, level: 20, color: "var(--r4)",
    boss: { name: "Fire Titan", sprite: bossSprite(0, 3), ability: "Crushing blows" },
    path: [[40, 52], [47, 48], [53, 44], [58, 40], [62, 47]] },
  { id: "wastes", name: "Demon Wastes", row: 3, level: 30, color: "var(--r3)",
    boss: { name: "Abyssal Lord", sprite: bossSprite(0, 0), ability: "Chaotic critical strikes" },
    path: [[66, 54], [72, 60], [79, 52], [84, 44], [80, 36]] },
  { id: "throne", name: "Dragon Throne", row: 4, level: 40, color: "var(--r5)",
    boss: { name: "Void Dragon", sprite: bossSprite(0, 1), ability: "Breath of the void" },
    path: [[78, 30], [82, 26], [86, 22], [89, 18], [92, 14]] },
];
export const STAGES_PER_REGION = 10;
export const CAMPAIGN_STAGES = REGIONS.length * STAGES_PER_REGION;
const ENEMY_COLS = [0, 2, 3, 4, 1, 5, 7, 9, 11];

export const regionOf = (stage: number) => REGIONS[Math.min(REGIONS.length - 1, Math.floor((stage - 1) / STAGES_PER_REGION))]!;
export const isElite = (stage: number) => stage % STAGES_PER_REGION === 5;
export const isBoss = (stage: number) => stage % STAGES_PER_REGION === 0;

export function nodePos(stage: number): [number, number] {
  const r = regionOf(stage);
  const t = ((stage - 1) % STAGES_PER_REGION) / (STAGES_PER_REGION - 1);
  const segs = r.path.length - 1;
  const f = t * segs; const i = Math.min(segs - 1, Math.floor(f)); const k = f - i;
  const a = r.path[i]!, b = r.path[i + 1]!;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

export interface CampaignFoe extends Foe { sprite: SpriteRect; elite: boolean; ability?: string }
export function campaignFoe(stage: number): CampaignFoe {
  const r = regionOf(stage);
  const base = stageFoe(stage, isElite(stage) ? 1.25 : 1);
  if (isBoss(stage)) {
    return { ...base, name: r.boss.name, sprite: r.boss.sprite, boss: true, elite: false, ability: r.boss.ability, crit: base.crit + 5 };
  }
  const col = ENEMY_COLS[((stage - 1) % STAGES_PER_REGION)]!;
  return { ...base, boss: false, name: (isElite(stage) ? "Elite " : "") + BESTIARY[r.row]![col]!, sprite: enemySprite(r.row, col), elite: isElite(stage) };
}
export function campaignRewards(stage: number, firstClear: boolean) {
  const rw = stageRewards(stage, isBoss(stage) ? 2 : isElite(stage) ? 1.4 : 1);
  return firstClear ? { xp: rw.xp * 2, gold: rw.gold * 3, first: true } : { ...rw, first: false };
}

// ---------- Region quests ----------
export interface Quest { id: string; region: string; name: string; desc: string; done: (h: Hero) => boolean; reward: { gold: number; xp: number; item?: number } }
export const REGION_QUESTS: Quest[] = REGIONS.flatMap((r, i) => {
  const first = i * STAGES_PER_REGION + 1;
  const g = Math.pow(1.09, first);
  return [
    { id: `${r.id}-elite`, region: r.id, name: `Elite of ${r.name}`, desc: `Defeat the elite at stage ${first + 4}.`,
      done: (h) => h.stage > first + 4, reward: { gold: Math.round(150 * g), xp: Math.round(120 * g) } },
    { id: `${r.id}-boss`, region: r.id, name: `Slay ${r.boss.name}`, desc: `Defeat the boss of ${r.name} (stage ${first + 9}).`,
      done: (h) => h.stage > first + 9, reward: { gold: Math.round(400 * g), xp: Math.round(300 * g), item: 3 } },
  ];
});
export const questClaimed = (h: Hero, id: string) => (h.quests ?? []).includes(id);

// ---------- Dungeons (tier bosses) ----------
export interface Dungeon { id: TierBossId; level: number; mult: number; ability: string; desc: string }
export const DUNGEONS: Dungeon[] = [
  { id: "aegis", level: 15, mult: 1.15, ability: "Iron Guard: very high defense", desc: "The Iron Overlord's fortress vault." },
  { id: "gorefiend", level: 30, mult: 1.3, ability: "Blood Rage: hits harder", desc: "A crimson pit beneath the Demon Wastes." },
  { id: "tenebris", level: 45, mult: 1.45, ability: "Void Veil: high evasion", desc: "The Void Empress's shattered sanctum." },
  { id: "vulkan", level: 60, mult: 1.6, ability: "Ember Core: massive health", desc: "The molten heart of the Ember Titan." },
];
export function dungeonFoe(d: Dungeon, heroLevel: number, extra = 1): Foe & { sprite: SpriteRect } {
  const lvl = Math.max(d.level, heroLevel);
  const base = stageFoe(Math.round(lvl * 0.95), d.mult * extra);
  const b = TIER_BOSSES[d.id];
  const tweak = d.id === "aegis" ? { def: base.def * 1.8 } : d.id === "gorefiend" ? { atk: Math.round(base.atk * 1.25) }
    : d.id === "tenebris" ? { dodge: base.dodge + 12 } : { hp: Math.round(base.hp * 1.5) };
  return { ...base, ...tweak, name: b.name, level: lvl, boss: true, sprite: b.sprite };
}

// ---------- Ancestral questline ----------
export const RELICS_NEEDED = 5;
export const ANC_LEVEL = 30;
export interface AncStep { title: string; desc: string; kind: "unlock" | "relics" | "boss"; boss?: TierBossId; mult?: number }
export const ANC_STEPS: AncStep[] = [
  { title: "Whispers of the Ancestors", desc: `Reach level ${ANC_LEVEL} and clear Molten Peaks (stage 30) to hear the Sanctuary's call.`, kind: "unlock" },
  { title: "Relics of the Ancients", desc: `Recover ${RELICS_NEEDED} Ancestral Relics. Campaign bosses and dungeon bosses have a chance to drop them.`, kind: "relics" },
  { title: "Trial of Iron", desc: "Defeat the Ancestral echo of Aegis, the Iron Overlord.", kind: "boss", boss: "aegis", mult: 1.5 },
  { title: "Trial of the Void", desc: "Defeat the Ancestral echo of Tenebris, the Void Empress.", kind: "boss", boss: "tenebris", mult: 1.6 },
  { title: "Judgment of Embers", desc: "Defeat the Ancestral echo of Vulkan, the Ember Titan, to claim your heritage.", kind: "boss", boss: "vulkan", mult: 1.75 },
];
export const ancState = (h: Hero) => h.anc ?? { step: 0, relics: 0, done: false };
export const canBeginAncestral = (h: Hero) => h.level + h.paragon >= ANC_LEVEL && h.stage > 30;
export const RELIC_DROP = 0.4;

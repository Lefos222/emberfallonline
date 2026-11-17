import type { Hero, HeroClass } from './data';
import type { SpriteRect } from './world';
import { ROSTER, ROSTER_BY_ID, recordRosterEncounter } from './bestiary';
import { translateName } from './i18n';

/** Snapshot the actual creature, never a translated label or a random battle instance ID. */
export interface EncounterCreature {
  name: string;
  img: string;
  level?: number;
  boss?: boolean;
  elite?: boolean;
  cls?: HeroClass;
  sprite?: SpriteRect;
  rosterId?: string;
  creatureName?: string;
}

export interface CollectedCreature {
  id: string;
  name: string;
  kind: 'enemy' | 'boss';
  tier: number;
  levelBand: readonly [number, number];
  sprite?: SpriteRect;
  img?: string;
}

/** Extra entries share the ordinary character-save path; no new reward or database writes. */
export type CollectionHero = Pick<Hero, 'kills'> & {
  encounterRoster?: Record<string, CollectedCreature>;
};

const originalName = (foe: EncounterCreature): string => {
  const name = (foe.creatureName ?? foe.name).trim();
  // These are the original standalone battle creatures, not sheet cells.
  const originals = ['Goblin Brute', 'Bone Reaver', 'Crimson Fiend', 'Blood-Moon Wyrm'];
  for (const original of originals) {
    if (['en', 'el', 'pl'].some(lang => translateName(original, lang as 'en' | 'el' | 'pl') === name)) return original;
    const grunt = `${original.split(' ').slice(-1)[0]} Grunt`;
    if (['en', 'el', 'pl'].some(lang => `${translateName(original, lang as 'en' | 'el' | 'pl').split(' ').slice(-1)[0]} Grunt` === name)) return grunt;
  }
  return name;
};

export function creatureEntry(foe: EncounterCreature): CollectedCreature | undefined {
  // Player characters, including PvP opponents outside the Arena, are not monsters.
  if (foe.cls) return;
  const kind = foe.boss ? 'boss' : 'enemy';
  const name = originalName(foe);
  if (!name) return;
  const explicit = foe.rosterId ? ROSTER_BY_ID[foe.rosterId] : undefined;
  if (explicit?.kind === kind) return explicit;
  // Canonical sprites identify elites and renamed world-site encounters across languages.
  const known = ROSTER.find(e => e.kind === kind && !e.portrait && (
    (foe.sprite && e.sprite.url === foe.sprite.url && e.sprite.x === foe.sprite.x &&
      e.sprite.y === foe.sprite.y && e.sprite.w === foe.sprite.w && e.sprite.h === foe.sprite.h) ||
    e.name === name || translateName(e.name, 'el') === name || translateName(e.name, 'pl') === name
  ));
  if (known) return known;
  // Bespoke bosses and summoned creatures remain their own entries, with their actual art.
  const level = Math.max(1, Math.floor(foe.level ?? 1));
  return {
    id: `encounter:${kind}:${encodeURIComponent(name)}`,
    name, kind, tier: Math.min(5, Math.max(1, Math.ceil(level / 10))),
    levelBand: [level, level], img: foe.img,
    ...(foe.sprite ? { sprite: { ...foe.sprite } } : {}),
  };
}

/** Sightings save zero defeats; victories increment only actual defeated combatants. */
export function collectCreature(h: CollectionHero, foe: EncounterCreature, defeated = false): string | undefined {
  const entry = creatureEntry(foe);
  if (!entry) return;
  if (ROSTER_BY_ID[entry.id]) recordRosterEncounter(h, entry.id, defeated);
  else {
    h.encounterRoster = { ...h.encounterRoster, [entry.id]: entry };
    const previous = h.kills?.[entry.id];
    const count = Number.isSafeInteger(previous) && (previous ?? -1) >= 0 ? (previous ?? 0) : 0;
    h.kills = { ...h.kills, [entry.id]: count + (defeated ? 1 : 0) };
  }
  return entry.id;
}

/** Fill only missing defeat credit after mode callbacks, which may already count their foe. */
export function settleCreatureDefeats(h: CollectionHero, foes: EncounterCreature[], before: Record<string, number>) {
  const defeats = new Map<string, { foe: EncounterCreature; count: number }>();
  for (const foe of foes) {
    const entry = creatureEntry(foe);
    if (!entry) continue;
    const previous = defeats.get(entry.id);
    defeats.set(entry.id, { foe, count: (previous?.count ?? 0) + 1 });
  }
  for (const [id, { foe, count }] of defeats) {
    const remaining = Math.max(0, (before[id] ?? 0) + count - (h.kills?.[id] ?? 0));
    for (let i = 0; i < remaining; i++) collectCreature(h, foe, true);
  }
}

export function collectedRoster(h: CollectionHero): CollectedCreature[] {
  return [...ROSTER, ...Object.values(h.encounterRoster ?? {}).filter(e => !ROSTER_BY_ID[e.id])];
}

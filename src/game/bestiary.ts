import { BESTIARY, enemySprite, bossSprite, TIER_BOSSES, SHEET_W, SHEET_H, type SpriteRect } from './world';
import type { Hero } from './data';

export interface RosterEntry {
  id: string; name: string; kind: 'enemy' | 'boss'; tier: number;
  levelBand: readonly [number, number]; cell: string; sprite: SpriteRect;
  signatureAbilityId: string;
}
const abilities = ['cleave', 'nova', 'meteor', 'bolt', 'rage'] as const;
export const ENEMY_ROSTER: RosterEntry[] = BESTIARY.flatMap((row, r) => row.map((name, c) => ({
  id: `enemy-${r}-${c}`, name, kind: 'enemy' as const, tier: r + 1,
  levelBand: [r * 10 + 1, r * 10 + 10] as const, cell: `enemies:${r}:${c}`,
  sprite: enemySprite(r, c), signatureAbilityId: abilities[r]!,
})));

/** Visual audit of the original 1920×1072 sheet, zero-based row/column.
 * Six visible rows, not five; row 5 is clipped by the painted UI at y=1037.
 * Repeated labels are NOT repeated designs. Only the following two portraits repeat.
 * The seven clipped row-5 portraits are distinct, usable head portraits (not full bodies).
 * No visible cells are empty. There are no additional hidden/scrollable image pixels.
 */
export const BOSS_ART_AUDIT = {
  duplicates: [{ cell: 'bosses:4:5', sameAs: 'bosses:1:5' }, { cell: 'bosses:4:6', sameAs: 'bosses:1:6' }],
  empty: [] as string[],
  clipped: Array.from({ length: 7 }, (_, c) => `bosses:5:${c}`),
  missingForFifty: 6,
} as const;
const bossNames = [
  ['Abyssal Lord', 'Void Dragon', 'Soul Harvester', 'Fire Titan', 'Death Knight Malgor', 'Ashen Sentinel', 'Tenebre'],
  ['Obsidian Wyrm', 'Spectral King', 'Dusk Wyrm', 'Cinder Drake', 'Ironcrest Dragon', 'Frostguard', 'Ice Behemoth'],
  ['Flame Sovereign', 'Violet Regent', 'Horned Matriarch', 'Soul Dragon', 'Pale Executioner', 'Gilded Warden', 'Azure Reaper'],
  ['Furnace Tyrant', 'Drowned Revenant', 'Void Titan', 'Thorn Harvester', 'Crimson Wyrm', 'Sunless Knight', 'Storm Dragon'],
  ['Alenhs', 'Antlered Oracle', 'Dregon', 'Viwck Roua', 'Ember Maw', 'Frostguard', 'Ice Behemoth'],
  ['Bone Sovereign', 'Amethyst Terror', 'Scarlet Devourer', 'Glacial Oracle', 'Grizzled Warlord', 'Golden Infernal', 'Redfang Fiend'],
];
export const BOSS_ROSTER: RosterEntry[] = bossNames.flatMap((row, r) => row.flatMap((name, c): RosterEntry[] => {
  const cell = `bosses:${r}:${c}`;
  if (BOSS_ART_AUDIT.duplicates.some(d => d.cell === cell)) return [];
  return [{ id: `boss-${r}-${c}`, name, kind: 'boss', tier: Math.min(5, r + 1),
    levelBand: [r * 10 + 1, r * 10 + 10], cell,
    // The sixth row has only 79 pixels of portrait above the frame; never sample the frame.
    sprite: r === 5 ? { ...bossSprite(r, c), h: 79 } : bossSprite(r, c),
    signatureAbilityId: abilities[r % abilities.length]! }];
})).concat(Object.entries(TIER_BOSSES).map(([id, boss], i) => ({
  id: `boss-${id}`, name: boss.name, kind: 'boss' as const, tier: i + 2,
  levelBand: [(i + 1) * 15, (i + 1) * 15 + 14] as const,
  cell: `bosses:featured:${id}`, sprite: boss.sprite, signatureAbilityId: abilities[i]!,
})));
export const ROSTER = [...ENEMY_ROSTER, ...BOSS_ROSTER];
export function validateRoster(entries: readonly RosterEntry[]) {
  const ids = new Set<string>(), names = new Set<string>(), cells = new Set<string>(), rects = new Set<string>();
  for (const e of entries) {
    const s = e.sprite, rect = `${s.url}:${s.x}:${s.y}:${s.w}:${s.h}`;
    if (ids.has(e.id) || names.has(e.name) || cells.has(e.cell) || rects.has(rect)) throw new Error(`Duplicate roster identity: ${e.id}`);
    if (![s.x, s.y, s.w, s.h].every(Number.isFinite) || s.x < 0 || s.y < 0 || s.w <= 0 || s.h <= 0 || s.x + s.w > SHEET_W || s.y + s.h > SHEET_H) throw new Error(`Invalid sprite: ${e.id}`);
    ids.add(e.id); names.add(e.name); cells.add(e.cell); rects.add(rect);
  }
}
validateRoster(ROSTER);
export const ROSTER_BY_ID = Object.fromEntries(ROSTER.map(e => [e.id, e]));
/** Explicit IDs for encounter consumers; selection uses a caller-owned persisted cursor, never random mock encounters. */
export const ENCOUNTER_TABLES = {
  road: ENEMY_ROSTER.map(e => e.id),
  elite: ENEMY_ROSTER.map(e => e.id),
  dungeon: BOSS_ROSTER.map(e => e.id),
  spire: ROSTER.map(e => e.id),
};
export function encounterEntry(hook: keyof typeof ENCOUNTER_TABLES, cursor: number): RosterEntry {
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error('Encounter cursor must be a nonnegative integer');
  const ids = ENCOUNTER_TABLES[hook];
  return ROSTER_BY_ID[ids[cursor % ids.length]!]!;
}
/** A stored zero is an explicit sighting; absent keys never imply a sighting or a defeat.
 * Call only from the authoritative save transaction, once per resolved encounter.
 */
export function recordRosterEncounter(h: Pick<Hero, 'kills'>, id: string, defeated: boolean) {
  if (!ROSTER_BY_ID[id]) throw new Error(`Unknown roster ID: ${id}`);
  const previous = h.kills?.[id] ?? 0;
  h.kills = { ...h.kills, [id]: previous + (defeated ? 1 : 0) };
}
export function rosterProgress(h: Pick<Hero, 'kills'>, id: string) {
  const count = h.kills?.[id];
  if (count === undefined || !Number.isSafeInteger(count) || count < 0) return { state: 'undiscovered' as const, count: undefined };
  return { state: count > 0 ? 'defeated' as const : 'seen' as const, count };
}

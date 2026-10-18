import { describe, expect, it } from 'vitest';
import { buildKit } from '../game/combat';
import { BOSS_ART_AUDIT, BOSS_ROSTER, ENEMY_ROSTER, ROSTER, ENCOUNTER_TABLES, encounterEntry, recordRosterEncounter, rosterProgress, validateRoster } from '../game/bestiary';

describe('audited bestiary', () => {
  it('ships exactly 60 enemy and 44 unique boss designs', () => {
    expect(ENEMY_ROSTER).toHaveLength(60);
    expect(BOSS_ROSTER).toHaveLength(44);
    expect(BOSS_ART_AUDIT.duplicates.map(d => d.cell)).toEqual(['bosses:4:5', 'bosses:4:6']);
    expect(BOSS_ART_AUDIT.empty).toEqual([]);
    expect(BOSS_ART_AUDIT.clipped).toHaveLength(7);
  });
  it('has unique names, IDs, cells and rectangles within the original sheet', () => {
    for (const field of ['id', 'name', 'cell'] as const) expect(new Set(ROSTER.map(e => e[field])).size).toBe(104);
    expect(new Set(ROSTER.map(e => JSON.stringify(e.sprite))).size).toBe(104);
    for (const { sprite: s } of ROSTER) {
      expect(s.x).toBeGreaterThanOrEqual(0); expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.w).toBeGreaterThan(0); expect(s.h).toBeGreaterThan(0);
      expect(s.x + s.w).toBeLessThanOrEqual(1920); expect(s.y + s.h).toBeLessThanOrEqual(1072);
    }
    expect(() => validateRoster([ROSTER[0]!, ROSTER[0]!])).toThrow('Duplicate');
    expect(() => validateRoster([{ ...ROSTER[0]!, sprite: { ...ROSTER[0]!.sprite, x: 1920 } }])).toThrow('Invalid sprite');
  });
  it('references only real combat abilities and encounter entries', () => {
    const abilities = new Set(['warrior', 'mage', 'archer'].flatMap(cls => buildKit(cls as 'warrior' | 'mage' | 'archer').map(s => s.id)));
    for (const e of ROSTER) expect(abilities.has(e.signatureAbilityId)).toBe(true);
    const ids = new Set(ROSTER.map(e => e.id));
    for (const table of Object.values(ENCOUNTER_TABLES)) for (const id of table) expect(ids.has(id)).toBe(true);
    expect(encounterEntry('road', 60).id).toBe('enemy-0-0');
    expect(encounterEntry('dungeon', 43).id).toBe('boss-vulkan');
    expect(() => encounterEntry('road', -1)).toThrow();
  });
  it('never invents discovery or defeats', () => {
    const h: { kills?: Record<string, number> } = {};
    expect(rosterProgress(h, 'enemy-0-0')).toEqual({ state: 'undiscovered', count: undefined });
    recordRosterEncounter(h, 'enemy-0-0', false);
    expect(rosterProgress(h, 'enemy-0-0')).toEqual({ state: 'seen', count: 0 });
    recordRosterEncounter(h, 'enemy-0-0', true);
    expect(rosterProgress(h, 'enemy-0-0')).toEqual({ state: 'defeated', count: 1 });
    expect(rosterProgress(h, 'enemy-0-1').state).toBe('undiscovered');
    expect(() => recordRosterEncounter(h, 'fake', true)).toThrow('Unknown roster ID');
  });
});

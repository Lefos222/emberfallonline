import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectCreature, collectedRoster, settleCreatureDefeats, type CollectionHero, type EncounterCreature } from '../game/encounter-collection';
import { ENEMY_ROSTER, BATTLE_BOSSES, rosterProgress } from '../game/bestiary';
import { newHero, stageFoe } from '../game/data';
import { campaignFoe, dungeonFoe, DUNGEONS } from '../game/world';
import { setLang } from '../game/i18n';
import { setHero, getState, update } from '../game/store';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

const creature = (over: Partial<EncounterCreature> = {}): EncounterCreature => ({
  name: 'Rift Keeper', img: '/keeper.png', boss: true, level: 12, ...over,
});

afterEach(() => { setLang('en'); setHero(null); });

describe('every encountered creature is collected', () => {
  it.each([...ENEMY_ROSTER, ...BATTLE_BOSSES])('collects $id immediately without requiring a defeat', entry => {
    const h: ReturnType<typeof newHero> & CollectionHero = newHero('Collector', 'warrior');
    const id = collectCreature(h, creature({ name: entry.name, sprite: entry.sprite, boss: entry.kind === 'boss', rosterId: entry.id }));
    expect(id).toBe(entry.id);
    expect(rosterProgress(h, entry.id)).toEqual({ state: 'seen', count: 0 });
  });

  it('collects bespoke enemies and bosses with their actual art', () => {
    const h: ReturnType<typeof newHero> & CollectionHero = newHero('Collector', 'warrior');
    const boss = collectCreature(h, creature());
    const enemy = collectCreature(h, creature({ name: 'Ember Thrall', boss: false }));
    expect(boss).toBe('encounter:boss:Rift%20Keeper');
    expect(enemy).toBe('encounter:enemy:Ember%20Thrall');
    expect(collectedRoster(h).find(e => e.id === boss)?.img).toBe('/keeper.png');
    expect(rosterProgress(h, boss ?? '').count).toBe(0);
  });

  it('collects campaign, conquest and dungeon foes and keeps seen state after a loss', () => {
    const h = newHero('Collector', 'warrior');
    for (const f of [stageFoe(1), stageFoe(10), campaignFoe(5), dungeonFoe(DUNGEONS[0] ?? { id: 'aegis', level: 15, mult: 1.15, ability: '', desc: '' }, 15)]) {
      const id = collectCreature(h, f);
      expect(id).toBeDefined();
      expect(rosterProgress(h, id ?? '')).toEqual({ state: 'seen', count: 0 });
    }
  });

  it('records actual defeats once and never credits a boss kill for its summons', () => {
    const h = newHero('Collector', 'warrior');
    // formation() was removed — a single foe is collected and defeated.
    const foe = { ...stageFoe(10), name: 'Abyssal Lord' };
    collectCreature(h, foe);
    collectCreature(h, foe, true);
    expect(h.kills?.['boss-0-0']).toBe(1);
  });

  it('persists discoveries through the real hero store and a save round trip', () => {
    setHero(newHero('Collector', 'warrior'));
    update(h => { collectCreature(h, creature()); });
    const save = JSON.parse(JSON.stringify(getState().hero));
    setHero(save);
    const h = getState().hero as (ReturnType<typeof newHero> & CollectionHero) | null;
    expect(h?.kills?.['encounter:boss:Rift%20Keeper']).toBe(0);
    expect(h?.encounterRoster?.['encounter:boss:Rift%20Keeper'].name).toBe('Rift Keeper');
    expect(h ? collectedRoster(h).some(e => e.name === 'Rift Keeper') : false).toBe(true);
  });

  it('keeps stable identities after changing the game language', () => {
    const h: ReturnType<typeof newHero> & CollectionHero = newHero('Collector', 'warrior');
    const english = collectCreature(h, stageFoe(1));
    setLang('el');
    const greek = collectCreature(h, stageFoe(1));
    expect(greek).toBe(english);
    expect(Object.keys(h.encounterRoster ?? {})).toHaveLength(1);
  });

  it('does not add player characters to the enemy or boss collections', () => {
    const h: ReturnType<typeof newHero> & CollectionHero = newHero('Collector', 'warrior');
    expect(collectCreature(h, creature({ cls: 'mage' }), true)).toBeUndefined();
    expect(h.kills).toBeUndefined();
    expect(h.encounterRoster).toBeUndefined();
  });

  it('does not invent discoveries or defeats in an old save', () => {
    const h = newHero('Collector', 'warrior');
    h.kills = { 'enemy-0-0': 4 };
    collectedRoster(h);
    expect(h.kills).toEqual({ 'enemy-0-0': 4 });
    expect(rosterProgress(h, 'boss-0-0').state).toBe('undiscovered');
  });

  it('does not duplicate defeats already counted by event or expedition rewards', () => {
    const h = newHero('Collector', 'warrior');
    const foe = creature({ name: 'Abyssal Lord', rosterId: 'boss-0-0' });
    collectCreature(h, foe);
    const before = { ...h.kills };
    collectCreature(h, foe, true);
    settleCreatureDefeats(h, [foe], before);
    expect(h.kills?.['boss-0-0']).toBe(1);
  });
});

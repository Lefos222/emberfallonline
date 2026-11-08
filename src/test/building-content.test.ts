import { describe, expect, it } from 'vitest';
import { attrCost, newHero } from '@/game/data';
import { EXPEDITIONS, expeditionFoe, trainingCost, trainAttribute } from '@/game/building-content';
import { RECIPES, craftGem, absorbAstral, recipeMats } from '@/game/crafting';
import { WORLD_EVENTS, H } from '@/game/events';
import { eventEncounter, liveOccurrence } from '@/game/event-encounters';
import { makeDrop } from '@/game/logic';

describe('building content preserves existing progression', () => {
  it('batch training charges the exact sum of existing escalating single-point costs', () => {
    const h = newHero('Test', 'warrior'); h.gold = 100000;
    const before = h.attrs.str;
    const expected = Array.from({ length: 5 }, (_, i) => attrCost(before + i)).reduce((a,b) => a+b,0);
    expect(trainingCost(h, 'str', 5)).toBe(expected);
    expect(trainAttribute(h, 'str', 5)).toBeNull();
    expect(h.gold).toBe(100000 - expected); expect(h.attrs.str).toBe(before + 5);
  });
  it('unaffordable training never spends gold or grants attributes', () => {
    const h = newHero('Test', 'mage'); h.gold = 0; const before = h.attrs.int;
    expect(trainAttribute(h, 'int', 10)).toBe('Not enough gold');
    expect(h.attrs.int).toBe(before); expect(h.gold).toBe(0);
  });
  it('each material expedition resolves an actual encounter from saved progress', () => {
    const h = newHero('Test', 'archer');
    expect(EXPEDITIONS.map(e => e.material)).toEqual(['ore','essence','starshard','fragment','sigil','bossCore']);
    for (let i=0;i<EXPEDITIONS.length;i++) {
      expect(expeditionFoe(h,i)).toEqual(expeditionFoe(h,i));
      expect(expeditionFoe(h,i).hp).toBeGreaterThan(0);
    }
    const old = expeditionFoe(h,0).rosterId; h.wins++;
    expect(expeditionFoe(h,0).rosterId).not.toBe(old);
  });
  it('new armor recipes still require armor fragments', () => {
    for (const id of ['sentinel','starweave','voidforged']) {
      const r = RECIPES.find(r => r.id === id); if (!r) throw new Error(id);
      expect(recipeMats(r,'armour').fragment).toBeGreaterThan(0);
    }
  });
  it('forging a gem spends its materials exactly once', () => {
    const h=newHero('Test','mage'); h.gold=200; h.mats={ore:10};
    expect(craftGem(h,'sapphire',1)).toBeNull();
    expect(h.gold).toBe(0); expect(h.mats).toMatchObject({ore:0}); expect(h.gems?.['sapphire:1']).toBe(1);
    expect(craftGem(h,'sapphire',1)).toBe('Not enough Ember Ore');
  });
  it('feeding an equipped duplicate is rejected and preserves both Astrals', () => {
    const h=newHero('Test','warrior'); h.astrals=[{id:'a',base:'ember',rarity:1,lvl:0},{id:'b',base:'ember',rarity:2,lvl:0}];h.astralSlots=['b'];
    expect(absorbAstral(h,'a','b')).toBe('Unequip the duplicate first'); expect(h.astrals).toHaveLength(2);
  });
});
describe('world event encounters',()=>{
  const siege=WORLD_EVENTS.find(e=>e.id==='rift-siege'); if(!siege) throw new Error('Missing event');
  const live=siege.anchor+2*H; // the first 4-hour rift window on the Greek clock
  it('rotates a real champion each occurrence',()=>{
    const first=eventEncounter(siege,live); const next=eventEncounter(siege,live+4*H);
    expect(first.boss).toBe(true); expect(first.rosterId).not.toBe(next.rosterId); expect(first.sprite.url).toBeTruthy();
  });
  it('rejects event entry outside its open window',()=>{
    expect(()=>liveOccurrence(siege,live+2*H)).toThrow('not open');
    expect(liveOccurrence(siege,live+10*60_000)).toBe(live);
  });
  it('Rare world boss gear never includes finished Rare armor',()=>{
    for(let i=0;i<100;i++) expect(['weapon','ring','talisman']).toContain(makeDrop('warrior',40,2).slot);
  });
});

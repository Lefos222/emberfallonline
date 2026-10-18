import { describe, expect, it } from 'vitest';
import { attrCost, newHero, makeItem, INVENTORY_CAP } from '@/game/data';
import { EXPEDITIONS, expeditionFoe, trainingCost, trainAttribute, advanceAncestral, awardAncestralRelic, completeAncestralTrial } from '@/game/building-content';
import { RECIPES, craft, recipeMats, cutGem, absorbAstral } from '@/game/crafting';
import { WORLD_EVENTS, H } from '@/game/events';
import { eventEncounter, liveOccurrence } from '@/game/event-encounters';
import { makeDrop } from '@/game/logic';

describe('building content preserves existing progression', () => {
  it('ancestral opening preserves the existing level 30 and cleared stage 30 gates',()=>{
    const h=newHero('Test','warrior');h.level=29;h.stage=31;expect(advanceAncestral(h)).toBe(false);
    h.level=30;h.stage=30;expect(advanceAncestral(h)).toBe(false);
    h.stage=31;expect(advanceAncestral(h)).toBe(true);expect(h.anc?.step).toBe(1);
  });
  it('only eligible bosses drop relics and five relics unlock trials',()=>{
    const h=newHero('Test','warrior');h.anc={step:1,relics:4,done:false};
    expect(awardAncestralRelic(h,false,()=>0)).toBe(false);expect(awardAncestralRelic(h,true,()=>0.4)).toBe(false);
    expect(awardAncestralRelic(h,true,()=>0.39)).toBe(true);expect(h.anc.relics).toBe(5);
    expect(awardAncestralRelic(h,true,()=>0)).toBe(false);expect(advanceAncestral(h)).toBe(true);expect(h.anc.step).toBe(2);
  });
  it('ancestral losses and repeated results cannot advance trials',()=>{
    const h=newHero('Test','warrior');h.anc={step:2,relics:5,done:false};
    expect(completeAncestralTrial(h,2,false)).toBe(false);expect(h.anc.step).toBe(2);
    expect(completeAncestralTrial(h,2,true)).toBe(true);expect(completeAncestralTrial(h,2,true)).toBe(false);
    expect(completeAncestralTrial(h,3,true)).toBe(true);expect(completeAncestralTrial(h,4,true)).toBe(true);expect(h.anc.done).toBe(true);
  });
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
    for (const id of ['sentinel','starweave','voidforged','ancestral']) {
      const r = RECIPES.find(r => r.id === id); if (!r) throw new Error(id);
      expect(recipeMats(r,'armour').fragment).toBeGreaterThan(0);
    }
  });
  it('ancestral crafting is locked until the Sanctuary is complete', () => {
    const h = newHero('Test','warrior'); h.level=80; h.gold=1000000;
    const r = RECIPES.find(r=>r.id==='ancestral'); if(!r) throw new Error('Recipe missing');
    h.mats={ore:500,essence:100,bossCore:20,fragment:80,sigil:20};
    expect(craft(h,r,INVENTORY_CAP,()=>makeItem(h.cls,80,6))).toBe('Complete the Ancestral Sanctuary trials');
    expect(h.gold).toBe(1000000);
    h.anc={step:5,relics:5,done:true};
    const result=craft(h,r,INVENTORY_CAP,()=>makeItem(h.cls,80,6));
    expect(typeof result).toBe('object'); expect(h.inventory[0].crafted).toBe(true); expect(h.mats.ore).toBe(0);
  });
  it('targeted gem cuts spend the existing targeted cost once', () => {
    const h=newHero('Test','mage'); h.gold=450; h.mats={ore:24,essence:1};
    expect(cutGem(h,()=>0,'moonstone')).toBe('moonstone:1');
    expect(h.gold).toBe(0); expect(h.mats).toMatchObject({ore:0,essence:0}); expect(h.gems?.['moonstone:1']).toBe(1);
  });
  it('feeding an equipped duplicate is rejected and preserves both Astrals', () => {
    const h=newHero('Test','warrior'); h.astrals=[{id:'a',base:'ember',rarity:1,lvl:0},{id:'b',base:'ember',rarity:2,lvl:0}];h.astralSlots=['b'];
    expect(absorbAstral(h,'a','b')).toBe('Unequip the duplicate first'); expect(h.astrals).toHaveLength(2);
  });
});
describe('two-hour world boss encounters',()=>{
  const boss=WORLD_EVENTS.find(e=>e.id==='world-boss'); if(!boss) throw new Error('Missing event');
  it('rotates a real boss each two-hour occurrence',()=>{
    const first=eventEncounter(boss,boss.anchor); const next=eventEncounter(boss,boss.anchor+2*H);
    expect(first.boss).toBe(true); expect(first.rosterId).not.toBe(next.rosterId); expect(first.sprite.url).toBeTruthy();
  });
  it('rejects event entry outside its open window',()=>{
    expect(()=>liveOccurrence(boss,boss.anchor+H)).toThrow('not open');
    expect(liveOccurrence(boss,boss.anchor+2*H)).toBe(boss.anchor+2*H);
  });
  it('Rare world boss gear never includes finished Rare armor',()=>{
    for(let i=0;i<100;i++) expect(['weapon','ring','talisman']).toContain(makeDrop('warrior',40,2).slot);
  });
});
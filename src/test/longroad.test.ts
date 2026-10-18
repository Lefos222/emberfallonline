import { describe, expect, it } from 'vitest';
import type { Hero } from '../game/data';
import { dailyRoad, weeklyRoad, roadWeekIndex, roadFoe, roadRewards, recordRoadClear, spireWave } from '../game/longroad';
const hero = (): Hero => ({ name: 'Test', cls: 'warrior', level: 80, paragon: 0, xp: 0, gold: 100, attrs: { str: 0, int: 0, agi: 0, vit: 0 }, equipment: {}, inventory: [], stage: 91, spire: 1, merchant: [], wins: 0 });
describe('Long Road', () => {
  it('stage 91 has level 91', () => expect(roadFoe(91).level).toBe(91));
  it('stage 91 has 90 million health', () => expect(roadFoe(91).hp).toBe(90000000));
  it('stage 91 has 800000 attack', () => expect(roadFoe(91).atk).toBe(800000));
  it('stage 91 has 300000 defense', () => expect(roadFoe(91).def).toBe(300000));
  it('first stage awards 5250 gold', () => expect(roadRewards(91, true).gold).toBe(5250));
  it('replay reward table awards zero gold', () => expect(roadRewards(91, false).gold).toBe(0));
  it('duplicate result cannot grant gold twice', () => {
    const once = recordRoadClear(hero(), { mode: 'road', value: 91 });
    expect(recordRoadClear(once, { mode: 'road', value: 91 }).gold).toBe(5350);
  });
  it('clear does not mutate the source hero', () => {
    const h = hero(); recordRoadClear(h, { mode: 'road', value: 91 }); expect(h.gold).toBe(100);
  });
  it('clearing road unlocks next stage', () => expect(recordRoadClear(hero(), { mode: 'road', value: 91 }).road?.stage).toBe(92));
  it('Spire replay cannot pay twice', () => {
    const h = recordRoadClear(recordRoadClear(hero(), { mode: 'road', value: 91 }), { mode: 'spire', value: 1 });
    expect(recordRoadClear(h, { mode: 'spire', value: 1 }).gold).toBe(7550);
  });
  it('Spire health multiplier caps at eight', () => expect(spireWave(91, 1000).hp).toBe(720000000));
  it('daily selection is fixed throughout the epoch day', () => expect(dailyRoad(Date.UTC(1970, 0, 1, 23, 59)).name).toBe('Ashen March'));
  it('daily rotates at UTC midnight', () => expect(dailyRoad(Date.UTC(1970, 0, 2)).name).toBe('Widowroot Expanse'));
  it('weekly selection stays fixed through Sunday', () => expect(weeklyRoad(roadWeekIndex(Date.UTC(1970, 0, 4, 23, 59))).name).toBe('Ashen March'));
  it('weekly rotates Monday at UTC midnight', () => expect(weeklyRoad(roadWeekIndex(Date.UTC(1970, 0, 5))).name).toBe('Widowroot Expanse'));
  it('full bags retain the deterministic boss trophy in overflow', () => {
    const h = hero(); h.road = { stage: 100, cleared: 99, wave: 1, best: 0 };
    h.inventory = Array.from({ length: 100 }, (_, i) => ({ id: String(i), cls: 'warrior', slot: 'weapon', name: 'Existing', ilvl: 1, rarity: 0, icon: 0, enh: 0 }));
    expect(recordRoadClear(h, { mode: 'road', value: 100 }).overflow?.[0].id).toBe('longroad-100-warrior');
  });
});

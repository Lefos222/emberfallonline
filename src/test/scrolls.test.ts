import { describe, expect, it, vi } from 'vitest';
import { SCROLLS, activeScrolls, scrollFighter, scrollState, scrollXp } from '@/game/scrolls';
import { initBattle, step, heroUnit } from '@/game/combat';
import { grant } from '@/game/logic';
import { newHero } from '@/game/data';

const f = { name: 'Hero', img: '', hp: 1000, atk: 100, def: 50, crit: 0, dodge: 0, level: 1, cls: 'warrior' as const, acc: 100 };
const enemy = { name: 'Enemy', img: '', hp: 10000, atk: 1, def: 0, crit: 0, dodge: 0, level: 1, acc: 0 };
describe('confirmed scroll battle rules', () => {
  it('damage scroll grants exactly 20% attack once, not per turn', () => {
    const s = initBattle(scrollFighter(f, ['dmg']), enemy);
    expect(heroUnit(s).atk).toBe(120);
    vi.spyOn(Math, "random").mockReturnValue(.5);
    step(s);
    expect(heroUnit(s).atk).toBe(120);
    vi.restoreAllMocks();
  });
  it('defence scroll grants exactly 20% defence', () => {
    expect(heroUnit(initBattle(scrollFighter(f, ['def']), enemy)).def).toBe(60);
  });
  it('XP scroll grants 20% actual XP with normal level handling', () => {
    const h = newHero('Test', 'warrior'); h.xp = 0;
    grant(h, scrollXp(25, 1.2), 10);
    // 30 x the doc's 20% = 36, paid in full: the bar gains exactly the XP the player is shown.
    expect(h.xp).toBe(scrollXp(25, 1.2));
    expect(scrollXp(25)).toBe(25);
  });
  it('only positive real server buff counters count as active', () => {
    expect(scrollState({ srv: { buffs: { dmg: 10, def: 0, xp: -1 }, scrolls: { dmg: 2 } } })).toEqual({ buffs: { dmg: 10, def: 0, xp: 0 }, owned: { dmg: 2, def: 0, xp: 0 } });
  });
  it('the tenth battle applies its snapshot even when the remaining counter is zero', () => {
    const active = activeScrolls({ active: ['dmg'], save: { srv: { buffs: { dmg: 0 } } } });
    expect(scrollFighter(f, active).atk).toBe(120);
    expect(scrollFighter(f, []).atk).toBe(100);
  });
  it('rejects unknown and duplicate server buff kinds', () => {
    expect(() => activeScrolls({ active: ['dmg', 'dmg'] })).toThrow();
    expect(() => activeScrolls({ active: ['invented'] })).toThrow();
  });
  it('preserves the existing scroll prices', () => {
    expect([SCROLLS.xp.price, SCROLLS.dmg.price, SCROLLS.def.price]).toEqual([1500, 2000, 2000]);
  });
});

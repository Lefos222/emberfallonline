import { describe, expect, it, vi } from 'vitest';
import { SCROLLS, activeScrolls, scrollFighter, scrollState, scrollXp } from '@/game/scrolls';
import { heroUnit, initBattle, playerAct } from '@/game/combat';
import { grant } from '@/game/logic';
import { newHero } from '@/game/data';

const f = { name: 'Hero', img: '', hp: 1000, atk: 100, def: 50, crit: 0, dodge: 0, level: 1, cls: 'warrior' as const, acc: 100 };
describe('confirmed scroll battle rules', () => {
  it('damage scroll grants exactly 20% attack once, not per turn', () => {
    const s = initBattle(scrollFighter(f, ['dmg']), [{ ...f, name: 'Enemy', cls: undefined, hp: 10000, def: 0, atk: 1 }]);
    expect(heroUnit(s).atk).toBe(120);
    vi.spyOn(Math, 'random').mockReturnValue(.5);
    const r = playerAct(s, 'strike', ['F0']);
    expect(r.ok).toBe(true);
    expect(heroUnit(s).atk).toBe(120);
    if (r.ok) expect(r.events.find(e => e.kind === 'dmg')?.value).toBeGreaterThan(100);
    vi.restoreAllMocks();
  });
  it('defence scroll grants exactly 20% defence', () => {
    expect(heroUnit(initBattle(scrollFighter(f, ['def']), [f])).def).toBe(60);
  });
  it('XP scroll grants 20% actual XP with normal level handling', () => {
    const h = newHero('Test', 'warrior'); h.xp = 0;
    grant(h, scrollXp(25, 1.2), 10);
    expect(h.xp).toBe(30);
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
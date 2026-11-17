import { describe, expect, it } from 'vitest';
import { newHero } from '@/game/data';
import { eclipseWindow, frontierState, frontierFoe, FRONTIER_SHOP } from '@/game/awakening-frontiers';
import { readFileSync } from 'node:fs';

describe('Awakening frontiers', () => {
  it('opens Eclipse for one hour every six hours in UTC', () => {
    const start = Date.UTC(2026, 10, 17, 18);
    expect(eclipseWindow(start).open).toBe(true);
    expect(eclipseWindow(start + 3_599_999).open).toBe(true);
    expect(eclipseWindow(start + 3_600_000).open).toBe(false);
    expect(eclipseWindow(start + 21_600_000).open).toBe(true);
  });
  it('resets daily and weekly counters without resetting wallets or campaigns', () => {
    const h = newHero('A','mage');
    h.srv = { awakeningExpansion: { day: '2026-11-15', week: '2026-11-09', dailyWins: 5, weeklyWins: 30, marks: 80, seals: 9, fronts: { citadel: 12 }, huntUsed: 3 } };
    const a = frontierState(h, Date.UTC(2026,10,17));
    expect(a.dailyWins).toBe(0); expect(a.weeklyWins).toBe(0); expect(a.huntUsed).toBe(0);
    expect(a.marks).toBe(80); expect(a.seals).toBe(9); expect(a.fronts?.citadel).toBe(12);
    expect(h.srv.awakeningExpansion?.dailyWins).toBe(5);
  });
  it('every fifth campaign encounter is a commander and the next is ordinary', () => {
    const sprite = {url:'art',x:0,y:0,w:1,h:1,sheetW:1,sheetH:1};
    expect(frontierFoe('citadel',5,90,sprite).boss).toBe(true);
    expect(frontierFoe('citadel',6,90,sprite).boss).toBe(false);
    expect(frontierFoe('grove',40,90,sprite).hp).toBeGreaterThan(frontierFoe('grove',5,90,sprite).hp);
  });
  it('shop prices and quantities match the authoritative SQL catalogue', () => {
    const sql = readFileSync('drizzle/migrations/0056_awakening_frontiers.sql','utf8');
    for (const item of FRONTIER_SHOP) expect(sql).toContain(`('${item.id}','${item.currency}',${item.cost},'${item.mat}',${item.qty})`);
    expect(FRONTIER_SHOP.find(x => x.id === 'heart')?.cost).toBe(40);
  });
});
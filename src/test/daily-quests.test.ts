import { describe, expect, it } from 'vitest';
import { DAILY_QUESTS, canClaimDailyQuest, dailyQuestSchema } from '../game/daily-quests';

describe('Six daily commissions', () => {
  it('provides exactly six distinct daily quests', () => {
    expect(DAILY_QUESTS).toHaveLength(6);
    expect(new Set(DAILY_QUESTS.map(q => q.id)).size).toBe(6);
  });
  it('requires completion before claiming', () => {
    const quest = { id: 'mining' as const, target: 1 as const, progress: 0, claimed: false, scroll: 'def' as const };
    expect(canClaimDailyQuest(quest)).toBe(false);
    expect(canClaimDailyQuest({ ...quest, progress: 1 })).toBe(true);
    expect(canClaimDailyQuest({ ...quest, progress: 1, claimed: true })).toBe(false);
  });
  it('rejects a duplicate or missing daily commission', () => {
    const rows = DAILY_QUESTS.map(q => ({ ...q, progress: 0, claimed: false }));
    const base = { now: '2026-10-23T12:00:00Z', resetAt: '2026-10-24T00:00:00Z' };
    expect(dailyQuestSchema.safeParse({ ...base, quests: rows }).success).toBe(true);
    expect(dailyQuestSchema.safeParse({ ...base, quests: rows.slice(1) }).success).toBe(false);
    expect(dailyQuestSchema.safeParse({ ...base, quests: Array(6).fill(rows[0]) }).success).toBe(false);
  });
});
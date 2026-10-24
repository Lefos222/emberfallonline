import { z } from 'zod';
import { PROFESSIONS } from './professions';

export const DAILY_QUESTS = PROFESSIONS.map(p => ({ id: p.id, name: `${p.name} commission`, target: 1,
  scroll: p.id === 'mining' || p.id === 'logging' ? 'def' : p.id === 'herbalism' || p.id === 'fishing' ? 'xp' : 'dmg',
}));
export const dailyQuestSchema = z.object({
  now: z.string().datetime({ offset: true }), resetAt: z.string().datetime({ offset: true }),
  quests: z.array(z.object({ id: z.enum(['mining','herbalism','logging','fishing','archaeology','treasure']),
    target: z.literal(1), progress: z.number().int().nonnegative(), claimed: z.boolean(), scroll: z.enum(['def','xp','dmg']),
  })).length(6).refine(rows => new Set(rows.map(r => r.id)).size === 6, 'Incomplete daily quest board'),
});
export type DailyQuest = z.infer<typeof dailyQuestSchema>['quests'][number];
export const canClaimDailyQuest = (quest: DailyQuest) => !quest.claimed && quest.progress >= quest.target;
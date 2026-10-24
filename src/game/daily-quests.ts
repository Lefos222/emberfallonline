import { z } from 'zod';
import { stageFoe, type Hero } from './data';
import { BOSS_ROSTER } from './bestiary';

export const DAILY_QUESTS = [
  { id: 0, name: 'Abyssal Lord', scroll: 'def' as const },
  { id: 1, name: 'Void Dragon', scroll: 'xp' as const },
  { id: 2, name: 'Soul Harvester', scroll: 'dmg' as const },
  { id: 3, name: 'Fire Titan', scroll: 'def' as const },
  { id: 4, name: 'Death Knight Malgor', scroll: 'xp' as const },
];
export const dailyQuestSchema = z.object({
  now: z.string().datetime({ offset: true }), resetAt: z.string().datetime({ offset: true }),
  quests: z.array(z.object({ id: z.number().int().min(0).max(4), target: z.literal(1),
    progress: z.number().int().nonnegative(), claimed: z.boolean(), scroll: z.enum(['def','xp','dmg']),
  })).length(5).refine(rows => new Set(rows.map(r => r.id)).size === 5, 'Incomplete daily boss board'),
});
export type DailyQuest = z.infer<typeof dailyQuestSchema>['quests'][number];
export const canClaimDailyQuest = (q: DailyQuest) => !q.claimed && q.progress >= q.target;
export function dailyBossFoe(h: Hero, id: number) {
  const quest = DAILY_QUESTS.find(q => q.id === id);
  const art = BOSS_ROSTER[id];
  if (!quest || !art) throw new Error('Unknown daily boss');
  const level = Math.max(1, h.level + h.paragon);
  // Unlimited linear daily scaling rather than campaign's exponential wall.
  const base = stageFoe(1, 1, 'dragon', quest.name);
  return { ...base, name: quest.name, level, boss: true, sprite: art.sprite,
    hp: Math.round((130 + level * 35) * (1 + id * .12)),
    atk: Math.round((9 + level * 2.5) * (1 + id * .08)), def: Math.round(4 + level * 1.3) };
}

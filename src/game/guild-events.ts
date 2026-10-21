import { z } from 'zod';

export const guildEventSchema = z.object({
  id: z.enum(['siege', 'caravan', 'ritual']), name: z.string(), story: z.string(),
  professions: z.array(z.string()), target: z.number().int().positive(),
  scroll: z.enum(['def', 'xp', 'dmg']), progress: z.number().nonnegative(),
  personal: z.number().nonnegative(), claimed: z.boolean(),
});
export const guildStateSchema = z.object({
  now: z.string().datetime({ offset: true }), resetAt: z.string().datetime({ offset: true }),
  events: z.array(guildEventSchema),
  contributions: z.array(z.object({ hero_name: z.string(), event: z.string(), quantity: z.number().int().positive() })),
});
export type GuildEvent = z.infer<typeof guildEventSchema>;
export function canClaimGuildEvent(event: GuildEvent) {
  return !event.claimed && event.personal > 0 && event.progress >= event.target;
}
export function eligibleGuildResource(event: GuildEvent, resource: string) {
  const parts = resource.split(':');
  return parts.length === 3 && event.professions.includes(parts[0]) && /^[0-4]$/.test(parts[1]) && /^[0-3]$/.test(parts[2]);
}
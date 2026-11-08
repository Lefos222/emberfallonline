import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { MAX_LEVEL } from './data';
import { WORLD_EVENTS } from './events';
import { eventEncounter, liveOccurrence } from './event-encounters';

export const confirmEventEntry = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    eventId: z.string(),
    /** The caller's level, so the shared encounter scales like the rest of the world. It only
     *  affects the foe's stats; every reward is fixed by the event itself. */
    heroLevel: z.number().int().min(1).max(MAX_LEVEL).optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const event = WORLD_EVENTS.find(e => e.id === data.eventId);
    if (!event) throw new Error('Unknown event');
    const startedAt = liveOccurrence(event, Date.now());
    return { startedAt, foe: eventEncounter(event, startedAt, data.heroLevel ?? event.stage) };
  });

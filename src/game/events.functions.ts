import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { WORLD_EVENTS } from './events';
import { eventEncounter, liveOccurrence } from './event-encounters';

export const confirmEventEntry = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ eventId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const event = WORLD_EVENTS.find(e => e.id === data.eventId);
    if (!event) throw new Error('Unknown event');
    const startedAt = liveOccurrence(event, Date.now());
    return { startedAt, foe: eventEncounter(event, startedAt) };
  });
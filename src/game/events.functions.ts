import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MAX_LEVEL } from "./data";
import { WORLD_EVENTS } from "./events";
import { eventEncounter, liveOccurrence } from "./event-encounters";
import { vipLevelFromPremium } from "./vip-perks";

export const confirmEventEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        eventId: z.string(),
        /** The caller's level, so the shared encounter scales like the rest of the world. It only
         *  affects the foe's stats; every reward is fixed by the event itself. */
        heroLevel: z.number().int().min(1).max(MAX_LEVEL).optional(),
        /** The active character, needed only to check a members-only window server-side. */
        heroId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const event = WORLD_EVENTS.find((e) => e.id === data.eventId);
    if (!event) throw new Error("Unknown event");
    // A VIP-only window must not be enterable by calling the server function directly: the save's
    // server-owned premium wallet is the only authority on an active membership.
    if (event.vipOnly) {
      if (!data.heroId) throw new Error("Select a character before entering a VIP event.");
      const { data: row, error } = await context.supabase
        .from("heroes")
        .select("save")
        .eq("id", data.heroId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const save = row?.save as { srv?: { premium?: unknown } } | null | undefined;
      if (vipLevelFromPremium(save?.srv?.premium) < 1) {
        throw new Error("VIP members only — this event opens with an active membership.");
      }
    }
    const startedAt = liveOccurrence(event, Date.now());
    return { startedAt, foe: eventEncounter(event, startedAt, data.heroLevel ?? event.stage) };
  });

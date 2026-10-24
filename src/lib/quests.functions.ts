import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adviseStrategyWithAI } from "./quests.server";

export const adviseStrategy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { heroClass: string; level: number; hero: Record<string, number>; enemy: Record<string, number | string | boolean>; skills: string[] }) => ({
    heroClass: String(i.heroClass).slice(0, 20),
    level: Number(i.level) || 1,
    hero: Object.fromEntries(Object.entries(i.hero ?? {}).slice(0, 8).map(([k, v]) => [k.slice(0, 12), Number(v) || 0])),
    enemy: Object.fromEntries(Object.entries(i.enemy ?? {}).slice(0, 10).map(([k, v]) => [k.slice(0, 12), typeof v === "string" ? v.slice(0, 40) : v])),
    skills: (i.skills ?? []).slice(0, 5).map((s) => String(s).slice(0, 60)),
  }))
  .handler(async ({ data }) => {
    try {
      return { advice: await adviseStrategyWithAI(data), error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      console.error("strategy failed", msg);
      return { advice: "", error: msg.includes("402") ? "Out of AI credits" : msg.includes("429") ? "Tactician busy, try again shortly" : "The tactician is silent, try again" };
    }
  });

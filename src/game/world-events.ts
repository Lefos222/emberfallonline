import { supabase } from "@/integrations/supabase/client";
import { greekTime, statusOf, WORLD_EVENTS } from "./events";

/**
 * World-chat event lines (level-ups, good drops, event openings) are ordinary world messages
 * carrying this sigil. The shared `chat_messages` table and its `send_chat` RPC therefore stay the
 * only chat write path, with their existing validation, rate limits and realtime feed.
 */
export const EVENT_SIGIL = "⟡";
export const eventLine = (text: string) => `${EVENT_SIGIL} ${text}`;
export const isEventLine = (body: string) => body.startsWith(`${EVENT_SIGIL} `);
export const stripEventSigil = (body: string) => body.slice(EVENT_SIGIL.length).trim();

const NO_RECIPIENT = "00000000-0000-0000-0000-000000000000";
/** How far back the duplicate check looks, so the same line is announced once, not once per player. */
const RECENT = 40;

/** Post one world-chat event line. Best-effort: chat limits must never interrupt a battle or a reward. */
export async function announceWorldEvent(heroId: string | null, text: string) {
  if (!heroId) return;
  const body = eventLine(text).slice(0, 200);
  try {
    const { data } = await supabase
      .from("chat_messages")
      .select("body")
      .eq("channel", "world")
      .order("created_at", { ascending: false })
      .limit(RECENT);
    if ((data ?? []).some((row) => row.body === body)) return;
    await supabase.rpc("send_chat", {
      _hero: heroId,
      _channel: "world",
      _body: body,
      _to: NO_RECIPIENT,
    });
  } catch {
    // A rate limit or a dropped connection simply skips the announcement.
  }
}

/**
 * Announce every world event that opened recently, once per occurrence: the line names the
 * occurrence's closing time, so it is identical for every player and differs next time it runs.
 */
export async function announceOpenEvents(heroId: string | null, now = Date.now()) {
  if (!heroId) return;
  for (const ev of WORLD_EVENTS) {
    const s = statusOf(now, ev);
    if (s.state !== "live" || now - s.startedAt > 30 * 60_000) continue;
    await announceWorldEvent(heroId, `${ev.name} is live until ${greekTime(s.endsAt)} — join in!`);
  }
}

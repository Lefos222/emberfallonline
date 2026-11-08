import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { isEventLine, stripEventSigil } from "./world-events";
import { InspectPanel } from "./InspectPanel";

/**
 * Public rooms: General is for players talking to everyone, System carries the world-event
 * announcements, and Guild is for members. All three read the shared world/guild chat rows;
 * General simply hides the announcement lines (they carry the event sigil, see world-events.ts).
 */
type Channel = "general" | "system" | "guild";
const NO_RECIPIENT = "00000000-0000-0000-0000-000000000000";
const ROOMS: { id: Channel; name: string }[] = [
  { id: "general", name: "General" },
  { id: "system", name: "System" },
  { id: "guild", name: "Guild" },
];

export function WorldChat({ heroId }: { heroId: string | null }) {
  const [channel, setChannel] = useState<Channel>("general");
  const [world, setWorld] = useState<Tables<"chat_messages">[]>([]);
  const [guild, setGuild] = useState<Tables<"chat_messages">[]>([]);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [inspect, setInspect] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const general = world.filter((m) => !isEventLine(m.body));
  const system = world.filter((m) => isEventLine(m.body));
  const messages = channel === "general" ? general : channel === "system" ? system : guild;
  const canSend = channel !== "system" && (channel === "general" || !!guildId);

  // Guild chat is readable by members only, so the feed follows the hero's membership.
  useEffect(() => {
    if (!heroId) { setGuildId(null); return; }
    let active = true;
    void supabase.from("guild_members").select("guild_id").eq("hero_id", heroId).maybeSingle()
      .then(({ data }) => { if (active) setGuildId(data?.guild_id ?? null); });
    return () => { active = false; };
  }, [heroId]);

  // World room: the last 50 lines plus every new one as it lands (General and System split them).
  useEffect(() => {
    if (!heroId) return;
    let active = true;
    void (async () => {
      const { data, error: loadError } = await supabase.from("chat_messages").select("*").eq("channel", "world").order("created_at", { ascending: false }).limit(50);
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setWorld((data ?? []).reverse());
    })();
    const room = supabase.channel(`world-chat:${heroId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.world" }, (payload) => {
      const row = payload.new as Tables<"chat_messages">;
      setWorld((current) => current.some((m) => m.id === row.id) ? current : [...current, row].slice(-50));
    }).subscribe();
    return () => { active = false; void supabase.removeChannel(room); };
  }, [heroId]);

  // Guild room: only while the hero has a guild.
  useEffect(() => {
    if (!heroId || !guildId) { setGuild([]); return; }
    let active = true;
    void (async () => {
      const { data, error: loadError } = await supabase.from("chat_messages").select("*").eq("channel", "guild").eq("guild_id", guildId).order("created_at", { ascending: false }).limit(50);
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setGuild((data ?? []).reverse());
    })();
    const room = supabase.channel(`guild-chat:${guildId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `guild_id=eq.${guildId}` }, (payload) => {
      const row = payload.new as Tables<"chat_messages">;
      if (row.channel !== "guild") return;
      setGuild((current) => current.some((m) => m.id === row.id) ? current : [...current, row].slice(-50));
    }).subscribe();
    return () => { active = false; void supabase.removeChannel(room); };
  }, [heroId, guildId]);

  useEffect(() => {
    if (heroId && !collapsed) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, channel, collapsed, heroId]);

  const send = async () => {
    if (!heroId) return;
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 200 || sending || channel === "system") return;
    if (channel === "guild" && !guildId) { setError("Join a guild to use guild chat."); return; }
    setSending(true); setError("");
    try {
      // General and Guild both use the validated world/guild write path; General is world chat
      // minus the announcement lines.
      const { error: sendError } = await supabase.rpc("send_chat", { _hero: heroId, _channel: channel === "guild" ? "guild" : "world", _body: trimmed, _to: NO_RECIPIENT });
      if (sendError) throw new Error(sendError.message);
      setBody("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not send message."); }
    finally { setSending(false); }
  };

  const emptyText = channel === "general"
    ? "No one has spoken yet — say hello."
    : channel === "system"
      ? "No system messages yet. Level-ups, rare loot and live world events appear here."
      : guildId ? "No guild messages yet." : "Join a guild at the Guild Hall to talk with your guild.";
  const placeholder = channel === "general" ? "Speak to everyone…" : channel === "guild" ? "Speak to your guild…" : "System messages are announcements only";

  if (!heroId) return null;
  return <section className="game-panel world-chat pointer-events-auto absolute bottom-16 left-3 z-20 w-[min(22rem,calc(100vw-1.5rem))] p-2">
    <header className="flex items-center justify-between gap-2 border-b border-border pb-1">
      <div role="tablist" aria-label="Chat channels" className="flex gap-1">
        {ROOMS.map((room) => (
          <button key={room.id} role="tab" aria-selected={channel === room.id}
            className={`rounded px-2 py-0.5 font-display text-sm font-bold transition ${channel === room.id ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
            onClick={() => { setChannel(room.id); setError(""); }}>
            {room.name}
          </button>
        ))}
      </div>
      <button className="text-xs text-muted-foreground hover:text-gold" aria-expanded={!collapsed} onClick={() => setCollapsed((v) => !v)}>{collapsed ? "Expand" : "Collapse"}</button>
    </header>
    {!collapsed && <>
      <div ref={listRef} className="mt-1 h-44 overflow-y-auto py-1" aria-live="polite">
        {messages.length === 0
          ? <p className="py-2 text-sm text-muted-foreground">{emptyText}</p>
          : messages.map((m) => isEventLine(m.body)
            ? <p key={m.id} className="chat-event mb-1 break-words text-xs">
                <time className="mr-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                <button type="button" className="font-bold text-gold underline-offset-2 hover:underline" title={`Inspect ${m.sender_name}`}
                  onClick={() => setInspect(m.sender_id)}>{m.sender_name}</button> {stripEventSigil(m.body)}
              </p>
            : <p key={m.id} className={`mb-1 break-words text-xs ${m.sender_id === heroId ? "text-gold" : ""}`}>
                <time className="mr-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                <button type="button" className="font-bold underline-offset-2 hover:text-gold hover:underline" title={`Inspect ${m.sender_name}`}
                  onClick={() => setInspect(m.sender_id)}>{m.sender_name}</button>
                <span className="ml-1">{m.body}</span>
              </p>)}
      </div>
      <form className="mt-1 flex gap-1" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <input className="slot min-w-0 flex-1 px-2 py-1 text-sm" aria-label={`${channel} message`}
          placeholder={placeholder} disabled={!canSend}
          value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void send(); } }} />
        <button className="btn-gold px-3 text-sm" disabled={sending || !body.trim() || body.trim().length > 200 || !canSend}>Send</button>
      </form>
      {body.trim().length > 200 && <p className="mt-1 text-xs text-muted-foreground">Messages must be 200 characters or fewer.</p>}
      <p className="mt-1 text-[10px] text-muted-foreground">
        {channel === "system"
          ? "System messages are the world's announcements. Click a name to inspect that hero."
          : channel === "guild" && !guildId
            ? "Guild chat opens once you join a guild."
            : "1 message per second · max 5 per 15 seconds. Click any name to inspect that hero."}
      </p>
      {error && <p role="alert" className="mt-1 break-words text-xs text-hp">{error}</p>}
    </>}
    {inspect && <InspectPanel heroId={heroId} targetId={inspect} onClose={() => setInspect(null)} />}
  </section>;
}

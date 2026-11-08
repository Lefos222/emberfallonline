import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { isEventLine, stripEventSigil } from "./world-events";
import { InspectPanel } from "./InspectPanel";

/** The three public rooms: everyone shares World, General is for player chat only, guild members share their Guild. */
type Channel = "world" | "general" | "guild";
const NO_RECIPIENT = "00000000-0000-0000-0000-000000000000";

export function WorldChat({ heroId }: { heroId: string | null }) {
  const [channel, setChannel] = useState<Channel>("world");
  const [world, setWorld] = useState<Tables<"chat_messages">[]>([]);
  const [general, setGeneral] = useState<Tables<"chat_messages">[]>([]);
  const [guild, setGuild] = useState<Tables<"chat_messages">[]>([]);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [inspectTarget, setInspectTarget] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const feed = channel === "world" ? world : channel === "general" ? general : guild;
  const canSend = channel !== "guild" || !!guildId;

  // Guild chat is readable by members only, so the feed follows the hero's membership.
  useEffect(() => {
    if (!heroId) { setGuildId(null); return; }
    let active = true;
    void supabase.from("guild_members").select("guild_id").eq("hero_id", heroId).maybeSingle()
      .then(({ data }) => { if (active) setGuildId(data?.guild_id ?? null); });
    return () => { active = false; };
  }, [heroId]);

  // World room: the last 50 lines plus every new one as it lands.
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

  // General room: player chat only (no system/event messages). Last 50 lines plus realtime.
  useEffect(() => {
    if (!heroId) return;
    let active = true;
    void (async () => {
      const { data, error: loadError } = await supabase.from("chat_messages").select("*").eq("channel", "general").order("created_at", { ascending: false }).limit(50);
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setGeneral((data ?? []).reverse());
    })();
    const room = supabase.channel(`general-chat:${heroId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.general" }, (payload) => {
      const row = payload.new as Tables<"chat_messages">;
      setGeneral((current) => current.some((m) => m.id === row.id) ? current : [...current, row].slice(-50));
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
  }, [feed.length, channel, collapsed, heroId]);

  const send = async () => {
    if (!heroId) return;
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 200 || sending) return;
    if (channel === "guild" && !guildId) { setError("Join a guild to use guild chat."); return; }
    setSending(true); setError("");
    try {
      const { error: sendError } = await supabase.rpc("send_chat", { _hero: heroId, _channel: channel, _body: trimmed, _to: NO_RECIPIENT });
      if (sendError) throw new Error(sendError.message);
      setBody("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not send message."); }
    finally { setSending(false); }
  };

  // Click a player name in chat to inspect them (not system/event lines, not yourself).
  const onNameClick = (m: Tables<"chat_messages">) => {
    if (isEventLine(m.body) || !m.sender_id || m.sender_id === heroId) return;
    setInspectTarget(m.sender_id);
  };

  if (!heroId) return null;
  return <>
    <section className="game-panel world-chat pointer-events-auto absolute bottom-16 left-3 z-20 w-[min(22rem,calc(100vw-1.5rem))] p-2">
      <header className="flex items-center justify-between gap-2 border-b border-border pb-1">
        <div role="tablist" aria-label="Chat channels" className="flex gap-1">
          {(["world", "general", "guild"] as const).map((room) => (
            <button key={room} role="tab" aria-selected={channel === room}
              className={`rounded px-2 py-0.5 font-display text-sm font-bold transition ${channel === room ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
              onClick={() => { setChannel(room); setError(""); }}>
              {room === "world" ? "World" : room === "general" ? "General" : "Guild"}
            </button>
          ))}
        </div>
        <button className="text-xs text-muted-foreground hover:text-gold" aria-expanded={!collapsed} onClick={() => setCollapsed((v) => !v)}>{collapsed ? "Expand" : "Collapse"}</button>
      </header>
      {!collapsed && <>
        <div ref={listRef} className="mt-1 h-44 overflow-y-auto py-1" aria-live="polite">
          {feed.length === 0
            ? <p className="py-2 text-sm text-muted-foreground">{channel === "world" ? "No one has spoken yet." : channel === "general" ? "General chat is empty — say hello!" : guildId ? "No guild messages yet." : "Join a guild at the Guild Hall to talk with your guild."}</p>
            : feed.map((m) => isEventLine(m.body)
              ? <p key={m.id} className="chat-event mb-1 break-words text-xs">
                  <time className="mr-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                  <b className="text-gold">{m.sender_name}</b> {stripEventSigil(m.body)}
                </p>
              : <p key={m.id} className={`mb-1 break-words text-xs ${m.sender_id === heroId ? "text-gold" : ""}`}>
                  <time className="mr-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                  <button
                    className="font-bold hover:underline hover:text-gold"
                    onClick={() => onNameClick(m)}
                    title={`Inspect ${m.sender_name}`}
                  >{m.sender_name}</button><span className="ml-1">{m.body}</span>
                </p>)}
        </div>
        <form className="mt-1 flex gap-1" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <input className="slot min-w-0 flex-1 px-2 py-1 text-sm" aria-label={`${channel} message`}
            placeholder={canSend ? undefined : "Join a guild to chat"} disabled={!canSend}
            value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void send(); } }} />
          <button className="btn-gold px-3 text-sm" disabled={sending || !body.trim() || body.trim().length > 200 || !canSend}>Send</button>
        </form>
        {body.trim().length > 200 && <p className="mt-1 text-xs text-muted-foreground">Messages must be 200 characters or fewer.</p>}
        <p className="mt-1 text-[10px] text-muted-foreground">{channel === "guild" && !guildId ? "Guild chat opens once you join a guild." : "1 message per second · max 5 per 15 seconds. Muted senders cannot chat."}</p>
        {error && <p role="alert" className="mt-1 break-words text-xs text-hp">{error}</p>}
      </>}
    </section>
    {inspectTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setInspectTarget(null)}>
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <InspectPanel heroId={heroId} targetId={inspectTarget} onClose={() => setInspectTarget(null)} />
        </div>
      </div>
    )}
  </>;
}

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function WorldChat({ heroId }: { heroId: string | null }) {
  const [messages, setMessages] = useState<Tables<"chat_messages">[]>([]);
  const [body, setBody] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!heroId) return;
    let active = true;
    const load = async () => {
      const { data, error: loadError } = await supabase.from("chat_messages").select("*").eq("channel", "world").order("created_at", { ascending: false }).limit(50);
      if (!active) return;
      if (loadError) setError(loadError.message);
      else setMessages((data ?? []).reverse());
    };
    void load();
    const channel = supabase.channel(`world-chat:${heroId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.world" }, (payload) => {
      const row = payload.new as Tables<"chat_messages">;
      setMessages((current) => current.some((m) => m.id === row.id) ? current : [...current, row].slice(-50));
    }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [heroId]);

  useEffect(() => { if (heroId && !collapsed) listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages, collapsed, heroId]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 200 || sending) return;
    setSending(true); setError("");
    try {
      const { error: sendError } = await supabase.rpc("send_chat", { _hero: heroId, _channel: "world", _body: trimmed, _to: "00000000-0000-0000-0000-000000000000" });
      if (sendError) throw new Error(sendError.message);
      setBody("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not send message."); }
    finally { setSending(false); }
  };

  if (!heroId) return null;
  return <section className="game-panel pointer-events-auto absolute bottom-16 left-3 z-20 w-[min(22rem,calc(100vw-1.5rem))] p-2">
    <header className="flex items-center justify-between border-b border-border pb-1">
      <h2 className="panel-title text-sm font-bold">World</h2>
      <button className="text-xs text-muted-foreground hover:text-gold" aria-expanded={!collapsed} onClick={() => setCollapsed((v) => !v)}>{collapsed ? "Expand" : "Collapse"}</button>
    </header>
    {!collapsed && <>
      <div ref={listRef} className="mt-1 h-44 overflow-y-auto py-1" aria-live="polite">
        {messages.length === 0 ? <p className="py-2 text-sm text-muted-foreground">No one has spoken yet.</p> : messages.map((m) => <p key={m.id} className={`mb-1 break-words text-xs ${m.sender_id === heroId ? "text-gold" : ""}`}><time className="mr-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time><b>{m.sender_name}</b><span className="ml-1">{m.body}</span></p>)}
      </div>
      <form className="mt-1 flex gap-1" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <input className="slot min-w-0 flex-1 px-2 py-1 text-sm" aria-label="World message" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void send(); } }} />
        <button className="btn-gold px-3 text-sm" disabled={sending || !body.trim() || body.trim().length > 200}>Send</button>
      </form>
      {body.trim().length > 200 && <p className="mt-1 text-xs text-muted-foreground">Messages must be 200 characters or fewer.</p>}
      <p className="mt-1 text-[10px] text-muted-foreground">1 message per second · max 5 per 15 seconds. Muted senders cannot chat.</p>
      {error && <p role="alert" className="mt-1 break-words text-xs text-hp">{error}</p>}
    </>}
  </section>;
}

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  listDirectMessages,
  sendDirectMessage,
  socialError,
  type DirectMessage,
  type FriendProfile,
} from "./social";

/** One-to-one conversation with an accepted friend, over the existing private chat channel. */
export function FriendChat({
  heroId,
  friend,
  onClose,
}: {
  heroId: string;
  friend: FriendProfile;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void listDirectMessages(heroId, friend.id).then(
      (rows) => {
        if (active) setMessages(rows);
      },
      (e: unknown) => {
        if (active) setError(socialError(e));
      },
    );
    const channel = supabase
      .channel(`dm:${heroId}:${friend.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.private" },
        (payload) => {
          const row = payload.new as Tables<"chat_messages">;
          const mine = row.sender_id === heroId && row.recipient_id === friend.id;
          const theirs = row.sender_id === friend.id && row.recipient_id === heroId;
          if (!mine && !theirs) return;
          setMessages((current) =>
            current.some((m) => m.id === row.id)
              ? current
              : [
                  ...current,
                  {
                    id: row.id,
                    sender_id: row.sender_id,
                    sender_name: row.sender_name,
                    body: row.body,
                    created_at: row.created_at,
                  },
                ].slice(-50),
          );
        },
      )
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [heroId, friend.id]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (typeof list.scrollTo === "function") list.scrollTo({ top: list.scrollHeight });
    else list.scrollTop = list.scrollHeight;
  }, [messages]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 200 || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectMessage(heroId, friend.id, trimmed);
      setBody("");
    } catch (e) {
      setError(socialError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="slot mt-3 p-3" aria-label={`Conversation with ${friend.name}`}>
      <header className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-gold">{friend.name}</h3>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-gold"
          onClick={onClose}
        >
          Close
        </button>
      </header>
      <div ref={listRef} className="h-40 overflow-y-auto py-1" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No messages yet - say hello.</p>
        ) : (
          messages.map((m) => (
            <p
              key={m.id}
              className={`mb-1 break-words text-sm ${m.sender_id === heroId ? "text-gold" : ""}`}
            >
              <time className="mr-1 text-[10px] text-muted-foreground">
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              {m.sender_id !== heroId && <b className="mr-1">{m.sender_name}</b>}
              {m.body}
            </p>
          ))
        )}
      </div>
      <form
        className="mt-1 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className="slot min-w-0 flex-1 px-2 py-1 text-sm"
          aria-label={`Message ${friend.name}`}
          value={body}
          maxLength={200}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn-gold px-3 text-sm" disabled={sending || !body.trim()}>
          Send
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-1 break-words text-xs text-hp">
          {error}
        </p>
      )}
    </section>
  );
}

import { t } from "./i18n";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MessageSquare, X } from "./PaintedIcons";
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
    <section
      className="slot mt-3 overflow-hidden p-0"
      aria-label={`Conversation with ${friend.name}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <h3 className="flex min-w-0 items-center gap-1.5 font-display text-sm text-gold">
          <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{friend.name}</span>
          <span className="truncate text-[10px] font-normal text-muted-foreground">
            <span className="capitalize">{friend.hero_class}</span> {t("· Level")} {friend.level}
          </span>
        </h3>
        <button
          type="button"
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-gold"
          aria-label={t("Close")}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <div ref={listRef} className="h-48 space-y-1.5 overflow-y-auto px-3 py-2" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("No messages yet - say hello.")}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === heroId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-sm ${
                    mine ? "bg-gold/15 text-foreground" : "bg-background/60 text-foreground"
                  }`}
                >
                  {!mine && <b className="mr-1 text-gold">{m.sender_name}</b>}
                  <span className="break-words">{m.body}</span>
                  <time className="ml-1.5 align-baseline text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form
        className="flex items-center gap-1.5 border-t border-border/70 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className="slot min-w-0 flex-1 px-2 py-1.5 text-sm outline-none"
          aria-label={`Message ${friend.name}`}
          placeholder={t("Write a message…")}
          value={body}
          maxLength={200}
          onChange={(e) => setBody(e.target.value)}
        />
        <span className="hidden text-[10px] text-muted-foreground sm:inline">
          {body.length}/200
        </span>
        <button className="btn-gold px-3 py-1.5 text-sm" disabled={sending || !body.trim()}>
          {t("Send")}
        </button>
      </form>
      {error && (
        <p role="alert" className="break-words px-3 pb-2 text-xs text-hp">
          {error}
        </p>
      )}
    </section>
  );
}

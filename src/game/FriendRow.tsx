import { useState } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Swords, X } from "./PaintedIcons";
import { RoseItem } from "./Roses";
import { presence } from "./presence";
import { t } from "./i18n";
import type { FriendProfile } from "./social";

export interface FriendRowProps {
  friend: FriendProfile;
  myPower: number;
  unread: number;
  lastMessage?: { body: string; at: string };
  chatting: boolean;
  busy: boolean;
  onInspect: () => void;
  onMessage: () => void;
  onRemove: () => void;
  onNote: (message: string) => void;
}

/** One friend in the list: presence, progress and the actions that matter on that hero. */
export function FriendRow({
  friend,
  myPower,
  unread,
  lastMessage,
  chatting,
  busy,
  onInspect,
  onMessage,
  onRemove,
  onNote,
}: FriendRowProps) {
  const [confirming, setConfirming] = useState(false);
  const seen = presence(friend.last_played);
  const gap = friend.power - myPower;
  const initial = friend.name.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <li
      className={`slot relative flex items-center gap-1 p-1.5 transition-colors ${
        chatting ? "border-gold/70" : ""
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left focus-visible:outline focus-visible:outline-ring"
        onClick={onInspect}
        aria-label={`Inspect ${friend.name}`}
      >
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background/60 font-display text-sm text-gold">
          {initial}
          <span
            aria-hidden="true"
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
              seen.online ? "bg-r1" : "bg-muted-foreground/50"
            }`}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="truncate text-sm text-gold">{friend.name}</span>
            {friend.title && (
              <span className="truncate text-[10px] uppercase tracking-wide text-gold/70">
                {friend.title}
              </span>
            )}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            <span className="capitalize">{friend.hero_class}</span>
            {t("· Level")} {friend.level}
            {t("· BR")} {friend.power.toLocaleString()}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {seen.label}
            </span>
            {friend.arena_rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Swords className="h-3 w-3" aria-hidden="true" />
                {friend.arena_rating.toLocaleString()}
              </span>
            )}
            {myPower > 0 && (
              <span className={gap >= 0 ? "text-hp" : "text-r1"}>
                {gap >= 0
                  ? `${gap.toLocaleString()} BR above you`
                  : `${Math.abs(gap).toLocaleString()} BR below you`}
              </span>
            )}
          </span>
          {lastMessage && (
            <span className="mt-0.5 flex items-center gap-1 text-[11px] italic text-muted-foreground/90">
              <MessageSquare className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{lastMessage.body}</span>
            </span>
          )}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        <RoseItem friend={friend.id} friendName={friend.name} onNote={onNote} />
        <Button
          type="button"
          variant={chatting ? "default" : "outline"}
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Message ${friend.name}${unread ? ` (${unread} new)` : ""}`}
          title={
            unread ? `${unread} new message${unread > 1 ? "s" : ""}` : `Message ${friend.name}`
          }
          disabled={busy}
          onClick={onMessage}
        >
          <MessageSquare className="h-4 w-4" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-blood px-1 text-center text-[10px] font-bold leading-4 text-foreground"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
        {confirming ? (
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-2 text-[11px]"
              disabled={busy}
              onClick={onRemove}
            >
              {t("Remove")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("Cancel")}
              onClick={() => setConfirming(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-hp"
            aria-label={`Remove ${friend.name}`}
            title={`Remove ${friend.name}`}
            disabled={busy}
            onClick={() => setConfirming(true)}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

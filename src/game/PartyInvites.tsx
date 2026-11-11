import { useEffect, useState } from "react";
import { tr } from "./i18n";
import { Button } from "@/components/ui/button";
import { CharacterModel } from "./CharacterModel";
import { openInviteInbox, type PartyInvite } from "./party-invite";
import { dungeonOf } from "./spire-party";
import { useGame } from "./store";

/**
 * The card a called friend sees: who is asking, which room, and two buttons — reject or join.
 * It sits above every other window (a battle included) and fades on its own after a minute, so
 * an unanswered call never blocks the game.
 */
export function PartyInvites({ onAccept }: { onAccept: (invite: PartyInvite) => void }) {
  const { heroId } = useGame();
  const [queue, setQueue] = useState<PartyInvite[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!heroId) return;
    return openInviteInbox(heroId, (invite) => {
      setQueue((list) => (list.some((i) => i.id === invite.id) ? list : [...list, invite]));
    });
  }, [heroId]);

  // A card that is not answered in time disappears with the rest of its call.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const live = queue.filter((i) => i.expires > now);
  const invite = live[0];
  if (!invite) return null;

  const dismiss = () => setQueue((list) => list.filter((i) => i.id !== invite.id));
  const place =
    invite.kind === "arena"
      ? tr("Arena Clash")
      : `${tr("Party Dungeons")} · ${tr(dungeonOf(invite.dungeon).name)}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3">
      <div
        role="dialog"
        aria-label={tr("Party invite")}
        className="game-panel anim-pop pointer-events-auto w-full max-w-sm border border-gold/60 p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 shrink-0">
            <CharacterModel
              cls={invite.from.cls}
              gender={invite.from.gender}
              className="h-full w-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gold">
              {tr("Party invite")}
            </p>
            <p className="truncate font-display text-sm">
              {tr("{name} invites you to {place}", { name: invite.from.name, place })}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tr("Lv")} {invite.from.level}
              {live.length > 1 ? ` · +${live.length - 1}` : ""}
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label={tr("Dismiss")}
            className="btn-ghost h-7 w-7 shrink-0 text-xs"
          >
            ✕
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Button
            className="btn-gold py-1.5 text-sm"
            onClick={() => {
              dismiss();
              onAccept(invite);
            }}
          >
            {tr("Join")}
          </Button>
          <Button variant="ghost" className="btn-ghost py-1.5 text-sm" onClick={dismiss}>
            {tr("Reject")}
          </Button>
        </div>
      </div>
    </div>
  );
}

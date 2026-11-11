import { useEffect, useState } from "react";
import { tr } from "./i18n";
import { Button } from "@/components/ui/button";
import { listFriends, type FriendProfile } from "./social";
import { useGame } from "./store";
import { inviteId, sendPartyInvite, type PartyKind } from "./party-invite";

/**
 * The room's guest list: every accepted friend with one button that calls them to the party.
 * The call shows up as a card on their screen (see `PartyInvites`), and joining goes through the
 * same code the room has always used.
 */
export function InviteFriends({
  heroId,
  kind,
  code,
  dungeon,
}: {
  heroId: string;
  kind: PartyKind;
  code: string;
  dungeon?: string;
}) {
  const { hero, gender } = useGame();
  const [friends, setFriends] = useState<FriendProfile[] | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    let on = true;
    listFriends(heroId)
      .then((f) => on && setFriends(f))
      .catch(() => on && setFriends([]));
    return () => {
      on = false;
    };
  }, [heroId]);

  if (!friends) return null;
  if (!friends.length)
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        {tr("Add friends to invite them to your party.")}
      </p>
    );

  const call = (f: FriendProfile) => {
    if (!hero) return;
    setErr("");
    const ok = sendPartyInvite(f.id, {
      id: inviteId(heroId),
      kind,
      code,
      dungeon,
      expires: Date.now() + 60_000,
      from: {
        id: heroId,
        name: hero.name,
        cls: hero.cls,
        gender,
        level: hero.level + (hero.paragon ?? 0),
      },
    });
    if (!ok) {
      setErr(tr("The invitation could not be sent. Try again."));
      return;
    }
    setSent((s) => ({ ...s, [f.id]: true }));
  };

  return (
    <div className="mt-2 rounded border border-border/60 bg-background/40 p-2">
      <p className="mb-1 text-xs font-bold text-gold">{tr("Invite friends")}</p>
      <p className="mb-1.5 text-[11px] text-muted-foreground">
        {tr("They get a card on their screen to join or reject.")}
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {friends.map((f) => (
          <li key={f.id} className="slot flex items-center justify-between gap-2 p-1.5 text-xs">
            <span className="min-w-0">
              <span className="block truncate">{f.name}</span>
              <span className="block text-[10px] text-muted-foreground">
                {tr("Lv")} {f.level} · {tr("Battle Rating")} {f.power}
              </span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="btn-gold h-7 shrink-0 px-2 text-xs"
              disabled={sent[f.id]}
              onClick={() => call(f)}
            >
              {sent[f.id] ? tr("Invited") : tr("Invite")}
            </Button>
          </li>
        ))}
      </ul>
      {err && (
        <p role="alert" className="mt-1 text-xs text-blood">
          {err}
        </p>
      )}
    </div>
  );
}

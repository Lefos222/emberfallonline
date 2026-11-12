import { useEffect, useState } from "react";
import { tr } from "./i18n";
import { Button } from "@/components/ui/button";
import { listFriends, sendDirectMessage, type FriendProfile } from "./social";
import {
  INVITE_TTL_MS,
  acceptInvite,
  clearReply,
  declineInvite,
  expireInvites,
  listenForInvites,
  receiveInvite,
  receiveReply,
  replyKey,
  sendInviteReply,
  sendPartyInvite,
  useInvites,
  type InviteKind,
  type PartyInvite,
} from "./party-invites";

const MODE_NAME: Record<InviteKind, string> = { spire: "Party Spire", arena: "Arena Clash" };

/**
 * The friend list under a party code: each Invite button pops an Accept / Decline window on the
 * friend's screen. A chat message with the code goes too, so a friend who is offline right now
 * still finds the code later.
 */
export function InviteFriends({
  heroId,
  kind,
  code,
  from,
  full,
}: {
  heroId: string;
  kind: InviteKind;
  code: string;
  from: { name: string; level: number };
  /** The party has no free seat left. */
  full?: boolean;
}) {
  const [friends, setFriends] = useState<FriendProfile[] | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");
  const { replies } = useInvites();
  useEffect(() => {
    let on = true;
    listFriends(heroId)
      .then((f) => on && setFriends(f))
      .catch(() => on && setFriends([]));
    return () => {
      on = false;
    };
  }, [heroId]);
  // A new party code is a new party: every friend can be invited again.
  useEffect(() => {
    setSent({});
  }, [code]);
  if (!friends) return null;
  if (!friends.length)
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        {tr("Add friends to invite them to your party.")}
      </p>
    );
  const chat =
    kind === "spire"
      ? tr("Join my Spire party! Code: {code}", { code })
      : tr("Join my Arena Clash party! Code: {code}", { code });
  return (
    <div className="mt-2">
      <p className="mb-1 text-xs font-bold text-gold">{tr("Invite friends")}</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {friends.map((f) => {
          const answer = sent[f.id] ? replies[replyKey(f.id, kind)] : undefined;
          const label =
            answer === "accepted"
              ? tr("Accepted")
              : answer === "declined"
                ? tr("Declined")
                : sent[f.id]
                  ? tr("Invited")
                  : tr("Invite");
          return (
            <li key={f.id} className="slot flex items-center justify-between gap-2 p-1.5 text-xs">
              <span className="truncate">{f.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="btn-gold h-7 px-2 text-xs"
                disabled={full || (sent[f.id] && answer !== "declined")}
                onClick={() => {
                  setErr("");
                  clearReply(f.id, kind);
                  setSent((s) => ({ ...s, [f.id]: true }));
                  sendPartyInvite(f.id, kind, code, { id: heroId, ...from }).catch((e) => {
                    setSent((s) => ({ ...s, [f.id]: false }));
                    setErr(e instanceof Error ? tr(e.message) : tr("Invite failed"));
                  });
                  // The chat copy is only a fallback, so its failure never blocks the popup.
                  void sendDirectMessage(heroId, f.id, chat).catch(() => {});
                }}
              >
                {label}
              </Button>
            </li>
          );
        })}
      </ul>
      {err && (
        <p role="alert" className="mt-1 text-xs text-blood">
          {err}
        </p>
      )}
    </div>
  );
}

/**
 * Listens for invites to this hero and shows them one at a time. Accept opens the right panel,
 * which joins the party; Decline closes the window and nothing else happens.
 */
export function InvitePopup({
  heroId,
  blocked,
  onAccept,
}: {
  heroId: string | null;
  /** A battle is on screen: joining has to wait until it ends. */
  blocked?: boolean;
  onAccept: (kind: InviteKind) => void;
}) {
  const { pending } = useInvites();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!heroId) return;
    let friendIds: Set<string> | null = null;
    let loading: Promise<Set<string>> | null = null;
    const friends = () => {
      if (friendIds) return Promise.resolve(friendIds);
      loading ??= listFriends(heroId)
        .then((f) => (friendIds = new Set(f.map((x) => x.id))))
        .catch(() => new Set<string>())
        .finally(() => {
          loading = null;
        });
      return loading;
    };
    return listenForInvites(
      heroId,
      (invite) => {
        // Only friends can pop a window on this screen; the list is re-read once if they are new.
        void friends().then(async (ids) => {
          if (!ids.has(invite.from.id)) {
            friendIds = null;
            ids = await friends();
          }
          if (ids.has(invite.from.id)) receiveInvite(invite);
        });
      },
      receiveReply,
    );
  }, [heroId]);

  useEffect(() => {
    if (!pending.length) return;
    const id = setInterval(() => {
      setNow(Date.now());
      expireInvites();
    }, 1000);
    return () => clearInterval(id);
  }, [pending.length]);

  const invite: PartyInvite | undefined = pending[0];
  if (!invite || !heroId) return null;
  const left = Math.max(0, Math.ceil((INVITE_TTL_MS - (now - invite.at)) / 1000));

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center p-4 pt-20">
      <div
        role="alertdialog"
        aria-modal="false"
        aria-label={tr("Party invite")}
        className="game-panel pointer-events-auto w-full max-w-sm rounded-md border border-gold/60 bg-background/95 p-4 text-center shadow-lg anim-pop"
      >
        <p className="font-display text-lg text-gold">{tr("Party invite")}</p>
        <p className="mt-1 text-sm">
          {tr("{name} invites you to their {mode} party.", {
            name: invite.from.name,
            mode: tr(MODE_NAME[invite.kind]),
          })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tr("Lv")} {invite.from.level} · {tr("Party code")}:{" "}
          <b className="text-gold">{invite.code}</b> · {left}s
        </p>
        {blocked && (
          <p className="mt-2 text-xs text-blood">{tr("Finish your battle first, then accept.")}</p>
        )}
        {pending.length > 1 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {tr("{n} more invites waiting", { n: pending.length - 1 })}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            className="btn-gold"
            disabled={blocked}
            onClick={() => {
              const taken = acceptInvite(invite.id);
              if (!taken) return;
              sendInviteReply(taken, heroId, true);
              onAccept(taken.kind);
            }}
          >
            {tr("Accept")}
          </Button>
          <Button
            variant="ghost"
            className="btn-ghost"
            onClick={() => {
              const taken = declineInvite(invite.id);
              if (taken) sendInviteReply(taken, heroId, false);
            }}
          >
            {tr("Decline")}
          </Button>
        </div>
      </div>
    </div>
  );
}

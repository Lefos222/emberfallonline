import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InspectPanel } from "./InspectPanel";
import { FriendChat } from "./FriendChat";
import {
  listFriendRequests,
  listFriends,
  removeFriend,
  requestFriend,
  respondFriendRequest,
  socialError,
  type FriendProfile,
  type FriendRequest,
} from "./social";

/** Requests are best-effort: a project without the request SQL still lists working friendships. */
function friendsAndRequests(heroId: string): [Promise<FriendProfile[]>, Promise<FriendRequest[]>] {
  return [listFriends(heroId), listFriendRequests(heroId).catch(() => [] as FriendRequest[])];
}

export function FriendsPanel({ heroId }: { heroId: string | null }) {
  // Remount on active-character changes so old requests cannot affect the new panel.
  return <FriendsContent key={heroId ?? "no-character"} heroId={heroId} />;
}

function FriendsContent({ heroId }: { heroId: string | null }) {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [chatWith, setChatWith] = useState<FriendProfile | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    if (heroId) {
      locked.current = true;
      setBusy(true);
      void Promise.all(friendsAndRequests(heroId))
        .then(
          ([rows, pending]) => {
            if (active) {
              setFriends(rows);
              setRequests(pending);
              setLoaded(true);
            }
          },
          (e: unknown) => {
            if (active) setError(socialError(e));
          },
        )
        .finally(() => {
          if (active) {
            locked.current = false;
            setBusy(false);
          }
        });
    }
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [heroId]);

  /** Every change re-reads both lists, so the tabs always show what the server accepted. */
  const mutate = async (action: (id: string) => Promise<unknown>, done?: string) => {
    if (!heroId || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await action(heroId);
      if (!mounted.current) return;
      if (done) setNote(done);
      const [rows, pending] = await Promise.all(friendsAndRequests(heroId));
      if (mounted.current) {
        setFriends(rows);
        setRequests(pending);
        setLoaded(true);
      }
    } catch (e) {
      if (mounted.current) setError(socialError(e));
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <section className="game-panel anim-pop p-4" aria-label="Friends">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">Friends</h2>
        <div className="flex gap-1" role="tablist" aria-label="Friends sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "friends"}
            className={`px-3 py-1 text-xs ${tab === "friends" ? "btn-gold" : "slot"}`}
            onClick={() => setTab("friends")}
          >
            Friends ({friends.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "requests"}
            className={`px-3 py-1 text-xs ${tab === "requests" ? "btn-gold" : "slot"}`}
            onClick={() => setTab("requests")}
          >
            Requests ({requests.length})
          </button>
        </div>
      </div>
      {!heroId ? (
        <p className="text-sm text-muted-foreground">Select a character to manage friends.</p>
      ) : (
        <>
          {tab === "friends" && (
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void mutate(
                  (id) => requestFriend(id, name),
                  `Request sent to ${name.trim()}. They must accept it first.`,
                ).then(() => setName(""));
              }}
            >
              <label className="block min-w-0 flex-1 text-sm">
                Hero name
                <input
                  className="slot mt-1 w-full px-3 py-2"
                  placeholder="Hero name"
                  required
                  maxLength={18}
                  value={name}
                  disabled={busy}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <Button className="btn-gold" disabled={busy || !name.trim()} type="submit">
                Send request
              </Button>
            </form>
          )}
          {busy && (
            <p role="status" className="py-2 text-sm text-muted-foreground">
              Loading…
            </p>
          )}
          {note && (
            <p role="status" className="py-2 text-sm text-gold">
              {note}
            </p>
          )}
          {error && (
            <p role="alert" className="py-2 text-sm text-muted-foreground">
              {error}
            </p>
          )}

          {tab === "friends" && (
            <ul className="mt-3 space-y-2">
              {friends.map((friend) => (
                <li key={friend.id} className="slot flex items-center gap-2 p-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded p-2 text-left focus-visible:outline focus-visible:outline-ring"
                    onClick={() => setTargetId(friend.id)}
                    aria-label={`Inspect ${friend.name}`}
                  >
                    <span className="block break-words text-gold">{friend.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      <span className="capitalize">{friend.hero_class}</span> · Level {friend.level}{" "}
                      · Battle Rating {friend.power.toLocaleString()}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant={chatWith?.id === friend.id ? "default" : "outline"}
                    disabled={busy}
                    onClick={() => setChatWith(chatWith?.id === friend.id ? null : friend)}
                  >
                    Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    aria-label={`Remove ${friend.name}`}
                    onClick={() => void mutate((id) => removeFriend(id, friend.id))}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {tab === "friends" && loaded && friends.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">
              No friends yet - send a request by hero name.
            </p>
          )}

          {tab === "requests" && (
            <ul className="mt-3 space-y-2">
              {requests.map((request) => (
                <li key={request.id} className="slot flex flex-wrap items-center gap-2 p-2">
                  <div className="min-w-0 flex-1 p-2">
                    <span className="block break-words text-gold">{request.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      <span className="capitalize">{request.hero_class}</span> · Level{" "}
                      {request.level} · Battle Rating {request.power.toLocaleString()} · asks to be
                      friends
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="btn-gold"
                    disabled={busy}
                    onClick={() =>
                      void mutate(
                        (id) => respondFriendRequest(id, request.id, true),
                        `You are now friends with ${request.name}.`,
                      )
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void mutate((id) => respondFriendRequest(id, request.id, false))}
                  >
                    Decline
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {tab === "requests" && loaded && requests.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No open requests.</p>
          )}

          {chatWith && (
            <FriendChat heroId={heroId} friend={chatWith} onClose={() => setChatWith(null)} />
          )}
        </>
      )}
      {heroId && targetId && (
        <InspectPanel heroId={heroId} targetId={targetId} onClose={() => setTargetId(null)} />
      )}
    </section>
  );
}

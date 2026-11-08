import { useEffect, useRef, useState } from "react";
import { Check, Clock, Copy, Loader2, MessageSquare, Search, Swords, UserPlus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroStats } from "./data";
import { useGame } from "./store";
import { InspectPanel } from "./InspectPanel";
import { FriendChat } from "./FriendChat";
import {
  cancelFriendRequest,
  listFriendRequests,
  listFriends,
  listIncomingDirectMessages,
  listSentRequests,
  removeFriend,
  requestFriend,
  respondFriendRequest,
  searchHeroes,
  socialError,
  subscribeFriendChanges,
  type FriendProfile,
  type FriendRequest,
  type HeroSearchResult,
  type RequestOutcome,
  type SentFriendRequest,
} from "./social";

type Tab = "friends" | "requests" | "find";

const ONLINE_MS = 5 * 60 * 1000;

/** Last time this device opened each conversation, so the list can badge new messages. */
const seenKey = (heroId: string) => `ef-dm-seen:${heroId}`;
function readSeen(heroId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(seenKey(heroId)) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
function markSeen(heroId: string, friendId: string) {
  const seen = readSeen(heroId);
  seen[friendId] = new Date().toISOString();
  try {
    localStorage.setItem(seenKey(heroId), JSON.stringify(seen));
  } catch {
    // A blocked storage bucket only costs the badge, never the conversation.
  }
}

/** "Online now" for a hero the server saw playing in the last few minutes. */
export function presence(lastPlayed: string): { online: boolean; label: string } {
  const at = new Date(lastPlayed).getTime();
  if (!Number.isFinite(at)) return { online: false, label: "Unknown" };
  const mins = (Date.now() - at) / 60000;
  if (mins < 5) return { online: true, label: "Online now" };
  if (mins < 60) return { online: false, label: `Seen ${Math.floor(mins)}m ago` };
  if (mins < 60 * 24) return { online: false, label: `Seen ${Math.floor(mins / 60)}h ago` };
  return { online: false, label: `Seen ${Math.floor(mins / 1440)}d ago` };
}

/** Pending incoming requests, for the badge on the Friends shortcut. */
export function useFriendRequestCount(heroId: string | null) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!heroId) {
      setCount(0);
      return;
    }
    let active = true;
    const sync = () => {
      void listFriendRequests(heroId).then(
        (rows) => {
          if (active) setCount(rows.length);
        },
        () => undefined,
      );
    };
    sync();
    const timer = setInterval(sync, 60000);
    window.addEventListener("focus", sync);
    const stop = subscribeFriendChanges(heroId, sync);
    return () => {
      active = false;
      stop();
      clearInterval(timer);
      window.removeEventListener("focus", sync);
    };
  }, [heroId]);
  return count;
}

export function FriendsPanel({ heroId }: { heroId: string | null }) {
  // Remount on active-character changes so old requests cannot affect the new panel.
  return <FriendsContent key={heroId ?? "no-character"} heroId={heroId} />;
}

function FriendsContent({ heroId }: { heroId: string | null }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<SentFriendRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeroSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [chatWith, setChatWith] = useState<FriendProfile | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [targetId, setTargetId] = useState<string | null>(null);
  const alive = useRef(true);
  const locked = useRef(false);
  const chatRef = useRef<FriendProfile | null>(null);
  useEffect(() => {
    chatRef.current = chatWith;
  }, [chatWith]);

  const reload = async () => {
    if (!heroId) return;
    const [rows, pending, waiting, inbox] = await Promise.all([
      listFriends(heroId),
      listFriendRequests(heroId).catch(() => [] as FriendRequest[]),
      listSentRequests(heroId),
      listIncomingDirectMessages(heroId).catch(() => []),
    ]);
    if (!alive.current) return;
    const seen = readSeen(heroId);
    const counts: Record<string, number> = {};
    for (const message of inbox) {
      if (message.sender_id === chatRef.current?.id) continue;
      const at = Date.parse(message.created_at);
      const readAt = Date.parse(seen[message.sender_id] ?? "");
      if (Number.isFinite(at) && at > (Number.isFinite(readAt) ? readAt : 0)) {
        counts[message.sender_id] = (counts[message.sender_id] ?? 0) + 1;
      }
    }
    setFriends(rows);
    setIncoming(pending);
    setSent(waiting);
    setUnread(counts);
    setLoaded(true);
  };

  /** Open or close a conversation; opening marks everything from that friend as read. */
  const openChat = (friend: FriendProfile) => {
    if (chatWith?.id === friend.id) {
      setChatWith(null);
      return;
    }
    if (heroId) markSeen(heroId, friend.id);
    setUnread((current) => {
      const next = { ...current };
      delete next[friend.id];
      return next;
    });
    setChatWith(friend);
  };

  useEffect(() => {
    alive.current = true;
    if (heroId) {
      void reload().catch((e: unknown) => {
        if (alive.current) setError(socialError(e));
      });
    }
    const timer = setInterval(() => {
      if (!heroId || locked.current) return;
      void reload().catch(() => undefined);
    }, 20000);
    const onFocus = () => {
      if (!heroId || locked.current) return;
      void reload().catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    const stop = heroId ? subscribeFriendChanges(heroId, onFocus) : () => undefined;
    return () => {
      alive.current = false;
      stop();
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
    // reload closes over heroId only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroId]);

  /** Live name search: waits for a pause in typing, then asks the server. */
  useEffect(() => {
    const q = query.trim();
    if (!heroId || tab !== "find" || q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearched(false);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      searchHeroes(heroId, q)
        .then(
          (rows) => {
            if (active) setResults(rows);
          },
          (e: unknown) => {
            if (active) {
              setResults([]);
              setError(socialError(e));
            }
          },
        )
        .finally(() => {
          if (active) {
            setSearching(false);
            setSearched(true);
          }
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, heroId, tab]);

  /** Every change re-reads the lists, so the tabs always show what the server accepted. */
  const mutate = async (action: (id: string) => Promise<unknown>, done?: string) => {
    if (!heroId || locked.current) return false;
    locked.current = true;
    setBusy(true);
    setError(null);
    setNote(null);
    let ok = false;
    try {
      await action(heroId);
      ok = true;
      if (alive.current && done) setNote(done);
      await reload();
    } catch (e) {
      if (alive.current) setError(socialError(e));
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
    return ok;
  };

  const addHero = async (hero: HeroSearchResult) => {
    // The server answers "sent", or "friends" when they had already asked us.
    const result: { outcome: RequestOutcome | null } = { outcome: null };
    const ok = await mutate(async (id) => {
      result.outcome = await requestFriend(id, hero.name);
    });
    if (!ok) return;
    const pendingRequest = result.outcome !== "friends";
    setNote(
      pendingRequest
        ? `Friend request sent to ${hero.name}. They must accept it first.`
        : `You are now friends with ${hero.name}.`,
    );
    setResults((rows) =>
      rows.map((r) =>
        r.id === hero.id ? { ...r, relation: pendingRequest ? "sent" : "friend" } : r,
      ),
    );
  };

  const acceptFromSearch = async (hero: HeroSearchResult) => {
    const request = incoming.find((r) => r.hero_id === hero.id);
    if (!request) return;
    const ok = await mutate(
      (id) => respondFriendRequest(id, request.id, true),
      `You are now friends with ${hero.name}.`,
    );
    if (ok) {
      setResults((rows) =>
        rows.map((r) => (r.id === hero.id ? { ...r, relation: "friend" as const } : r)),
      );
    }
  };

  const visibleFriends = filter.trim()
    ? friends.filter((f) => f.name.toLowerCase().includes(filter.trim().toLowerCase()))
    : friends;
  const onlineCount = friends.filter((f) => presence(f.last_played).online).length;
  const pending = incoming.length + sent.length;
  const unreadTotal = Object.values(unread).reduce((sum, n) => sum + n, 0);
  const myPower = hero ? heroStats(hero).power : 0;
  // Friends are listed online first, then by how recently the server saw them playing.
  const sortedFriends = [...visibleFriends].sort((a, b) => {
    const on = Number(presence(b.last_played).online) - Number(presence(a.last_played).online);
    if (on !== 0) return on;
    return Date.parse(b.last_played) - Date.parse(a.last_played);
  });
  const copyMyName = async () => {
    if (!hero) return;
    try {
      await navigator.clipboard.writeText(hero.name);
      setNote(`Your hero name is copied — send it to a friend so they can find you.`);
    } catch {
      setNote(`Ask your friend to search for "${hero.name}" in Find heroes.`);
    }
  };

  return (
    <section className="game-panel anim-pop p-4" aria-label="Friends" data-testid="friends-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">Friends</h2>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Friends sections">
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
            className={`relative px-3 py-1 text-xs ${tab === "requests" ? "btn-gold" : "slot"}`}
            onClick={() => setTab("requests")}
          >
            Requests ({pending})
            {incoming.length > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-blood px-1 text-center text-[10px] font-bold text-foreground">
                {incoming.length}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "find"}
            className={`px-3 py-1 text-xs ${tab === "find" ? "btn-gold" : "slot"}`}
            onClick={() => setTab("find")}
          >
            Find heroes
          </button>
        </div>
      </div>

      {!heroId ? (
        <p className="text-sm text-muted-foreground">Select a character to manage friends.</p>
      ) : (
        <>
          {busy && (
            <p role="status" className="py-1 text-xs text-muted-foreground">
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              Syncing…
            </p>
          )}
          {note && (
            <p role="status" className="py-2 text-sm text-gold">
              {note}
            </p>
          )}
          {error && (
            <p role="alert" className="py-2 text-sm text-hp">
              {error}
            </p>
          )}

          {tab === "friends" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="slot p-2 text-center">
                  <div className="font-display text-xl text-gold">{friends.length}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Friends</div>
                </div>
                <div className="slot p-2 text-center">
                  <div className="font-display text-xl text-r1">{onlineCount}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Online now</div>
                </div>
                <div className="slot p-2 text-center">
                  <div className="font-display text-xl text-gold">{pending}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pending requests</div>
                </div>
                <div className="slot p-2 text-center">
                  <div className="font-display text-xl text-blood">{unreadTotal}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Unread messages</div>
                </div>
              </div>
              {hero && (
                <div className="slot flex flex-wrap items-center gap-2 p-2">
                  <Users className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                    Your hero name is <b className="text-gold">{hero.name}</b> — share it so friends can find you.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyMyName()}>
                    <Copy className="mr-1 h-3.5 w-3.5" />Copy name
                  </Button>
                  <Button type="button" size="sm" onClick={() => setTab("find")}>
                    <UserPlus className="mr-1 h-3.5 w-3.5" />Add a friend
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {friends.length} friend{friends.length === 1 ? "" : "s"}
                  {friends.length > 0 && ` · ${onlineCount} online`}
                </p>
                {friends.length > 3 && (
                  <label className="relative flex-1 sm:max-w-48">
                    <span className="sr-only">Filter friends</span>
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="slot w-full py-1.5 pl-7 pr-2 text-sm outline-none"
                      placeholder="Filter friends"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </label>
                )}
              </div>

              <ul className="space-y-2">
                {sortedFriends.map((friend) => {
                  const seen = presence(friend.last_played);
                  const gap = friend.power - myPower;
                  return (
                    <li key={friend.id} className="slot flex flex-wrap items-center gap-2 p-2">
                      <button
                        type="button"
                        className="min-w-0 flex-1 rounded p-2 text-left focus-visible:outline focus-visible:outline-ring"
                        onClick={() => setTargetId(friend.id)}
                        aria-label={`Inspect ${friend.name}`}
                      >
                        <span className="flex items-center gap-1.5 break-words text-gold">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-2 w-2 shrink-0 rounded-full ${seen.online ? "bg-r1" : "bg-muted-foreground/50"}`}
                          />
                          {friend.name}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          <span className="capitalize">{friend.hero_class}</span> · Level{" "}
                          {friend.level} · BR {friend.power.toLocaleString()}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {seen.label}
                          </span>
                          {friend.arena_rating > 0 && (
                            <span className="flex items-center gap-1"><Swords className="h-3 w-3" aria-hidden="true" />Rating {friend.arena_rating.toLocaleString()}</span>
                          )}
                          {myPower > 0 && (
                            <span className={gap >= 0 ? "text-hp" : "text-r1"}>
                              {gap >= 0 ? `${gap.toLocaleString()} BR above you` : `${Math.abs(gap).toLocaleString()} BR below you`}
                            </span>
                          )}
                          {friend.title && <span className="text-gold">{friend.title}</span>}
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant={chatWith?.id === friend.id ? "default" : "outline"}
                        size="icon"
                        className="relative"
                        aria-label={`Message ${friend.name}${unread[friend.id] ? ` (${unread[friend.id]} new)` : ""}`}
                        title={unread[friend.id] ? `${unread[friend.id]} new message${unread[friend.id] > 1 ? "s" : ""}` : `Message ${friend.name}`}
                        disabled={busy}
                        onClick={() => openChat(friend)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {unread[friend.id] > 0 && (
                          <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-blood px-1 text-center text-[10px] font-bold leading-4 text-foreground">
                            {unread[friend.id] > 9 ? "9+" : unread[friend.id]}
                          </span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        aria-label={`Remove ${friend.name}`}
                        title={`Remove ${friend.name}`}
                        onClick={() => void mutate((id) => removeFriend(id, friend.id))}
                      >
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>

              {loaded && friends.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <p>No friends yet.</p>
                  <button
                    type="button"
                    className="mt-1 text-gold hover:underline"
                    onClick={() => setTab("find")}
                  >
                    Find heroes to send your first request
                  </button>
                </div>
              )}
              {friends.length > 0 && visibleFriends.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">No friend matches “{filter}”.</p>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="space-y-4">
              <section aria-label="Incoming requests">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Incoming ({incoming.length})
                </h3>
                <ul className="space-y-2">
                  {incoming.map((request) => (
                    <li key={request.id} className="slot flex flex-wrap items-center gap-2 p-2">
                      <div className="min-w-0 flex-1 p-2">
                        <span className="block break-words text-gold">{request.name}</span>
                        <span className="block text-sm text-muted-foreground">
                          <span className="capitalize">{request.hero_class}</span> · Level{" "}
                          {request.level} · BR {request.power.toLocaleString()} · asks to be friends
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
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        aria-label={`Decline ${request.name}`}
                        onClick={() =>
                          void mutate((id) => respondFriendRequest(id, request.id, false))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                {loaded && incoming.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">No incoming requests.</p>
                )}
              </section>

              <section aria-label="Sent requests">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Waiting for them ({sent.length})
                </h3>
                <ul className="space-y-2">
                  {sent.map((request) => (
                    <li key={request.id} className="slot flex flex-wrap items-center gap-2 p-2">
                      <div className="min-w-0 flex-1 p-2">
                        <span className="block break-words text-gold">{request.name}</span>
                        <span className="block text-sm text-muted-foreground">
                          <span className="capitalize">{request.hero_class}</span> · Level{" "}
                          {request.level} — waiting for an answer
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        aria-label={`Withdraw request to ${request.name}`}
                        onClick={() =>
                          void mutate(
                            (id) => cancelFriendRequest(id, request.id),
                            `Request to ${request.name} withdrawn.`,
                          )
                        }
                      >
                        Withdraw
                      </Button>
                    </li>
                  ))}
                </ul>
                {loaded && sent.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">
                    Nothing waiting — everyone answered.
                  </p>
                )}
              </section>
            </div>
          )}

          {tab === "find" && (
            <div className="space-y-3">
              <label className="relative block">
                <span className="sr-only">Search heroes by name</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="slot w-full py-2 pl-9 pr-3 outline-none"
                  placeholder="Search heroes by name (2+ letters)"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  data-testid="friend-search"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </label>
              <p className="text-xs text-muted-foreground">
                Only heroes with a public profile appear here. Requests are answered in the Requests
                tab — friends you both asked for connect instantly.
              </p>

              <ul className="space-y-2">
                {results.map((hero) => {
                  const seen = presence(hero.last_played);
                  const incomingRequest = incoming.find((r) => r.hero_id === hero.id);
                  return (
                    <li
                      key={hero.id}
                      className="slot flex flex-wrap items-center gap-2 p-2"
                      data-testid="hero-result"
                    >
                      <div className="min-w-0 flex-1 p-2">
                        <span className="flex items-center gap-1.5 break-words text-gold">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-2 w-2 shrink-0 rounded-full ${seen.online ? "bg-r1" : "bg-muted-foreground/50"}`}
                          />
                          {hero.name}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          <span className="capitalize">{hero.hero_class}</span> · {hero.gender} ·
                          Level {hero.level} · BR {hero.power.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{seen.label}</span>
                      </div>
                      {hero.relation === "friend" ? (
                        <span className="px-2 text-xs text-r1">Friends</span>
                      ) : hero.relation === "sent" ? (
                        <span className="px-2 text-xs text-muted-foreground">Requested</span>
                      ) : incomingRequest ? (
                        <Button
                          type="button"
                          className="btn-gold"
                          disabled={busy}
                          onClick={() => void acceptFromSearch(hero)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="btn-gold"
                          disabled={busy}
                          onClick={() => void addHero(hero)}
                        >
                          <UserPlus className="mr-1 h-4 w-4" />
                          Add friend
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {searched && !searching && results.length === 0 && query.trim().length >= 2 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No public hero matches “{query.trim()}”.
                </p>
              )}
              {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Type at least two letters.
                </p>
              )}
            </div>
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

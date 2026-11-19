import { t } from "./i18n";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Inbox, Loader2, Search, UserPlus, X } from "lucide-react";
import { Users } from "./PaintedIcons";
import { Button } from "@/components/ui/button";
import { heroStats } from "./data";
import { useGame } from "./store";
import { InspectPanel } from "./InspectPanel";
import { FriendChat } from "./FriendChat";
import { FriendRow } from "./FriendRow";
import { presence } from "./presence";
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

export { presence } from "./presence";

type Tab = "friends" | "requests" | "find";

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

function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="slot px-1 py-1.5 text-center">
      <div className={`font-display text-lg leading-none ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
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
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeroSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [chatWith, setChatWith] = useState<FriendProfile | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { body: string; at: string }>>(
    {},
  );
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
    const latest: Record<string, { body: string; at: string }> = {};
    for (const message of inbox) {
      const previous = latest[message.sender_id];
      if (!previous || Date.parse(message.created_at) > Date.parse(previous.at)) {
        latest[message.sender_id] = { body: message.body, at: message.created_at };
      }
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
    setLastMessages(latest);
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

  const visibleFriends = friends.filter((f) => {
    if (onlineOnly && !presence(f.last_played).online) return false;
    const needle = filter.trim().toLowerCase();
    return !needle || f.name.toLowerCase().includes(needle);
  });
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
  const onlineFriends = sortedFriends.filter((f) => presence(f.last_played).online);
  const offlineFriends = sortedFriends.filter((f) => !presence(f.last_played).online);

  const copyMyName = async () => {
    if (!hero) return;
    try {
      await navigator.clipboard.writeText(hero.name);
      setNote(`Your hero name is copied — send it to a friend so they can find you.`);
    } catch {
      setNote(`Ask your friend to search for "${hero.name}" in Find heroes.`);
    }
  };

  const renderRow = (friend: FriendProfile) => (
    <FriendRow
      key={friend.id}
      friend={friend}
      myPower={myPower}
      unread={unread[friend.id] ?? 0}
      lastMessage={lastMessages[friend.id]}
      chatting={chatWith?.id === friend.id}
      busy={busy}
      onInspect={() => setTargetId(friend.id)}
      onMessage={() => openChat(friend)}
      onRemove={() => void mutate((id) => removeFriend(id, friend.id))}
      onNote={setNote}
    />
  );

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    {
      id: "friends",
      label: `${t("Friends (")}${friends.length})`,
      icon: <Users className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    {
      id: "requests",
      label: `${t("Requests (")}${pending})`,
      icon: <Inbox className="h-3.5 w-3.5" aria-hidden="true" />,
      badge: incoming.length,
    },
    {
      id: "find",
      label: t("Find heroes"),
      icon: <Search className="h-3.5 w-3.5" aria-hidden="true" />,
    },
  ];

  return (
    <section
      className="game-panel anim-pop p-4"
      aria-label={t("Friends")}
      data-testid="friends-panel"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="panel-crest shrink-0">
            <Users className="h-5 w-5 text-gold" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="panel-title text-xl leading-tight">{t("Friends")}</h2>
            {hero && (
              <p className="truncate text-[11px] text-muted-foreground">
                {t("Playing as")} {hero.name}
              </p>
            )}
          </div>
        </div>
        <div
          role="tablist"
          aria-label={t("Friends sections")}
          className="flex shrink-0 gap-1 rounded-lg border border-border/70 bg-background/40 p-1"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`relative flex items-center gap-1 rounded-md px-2 py-1 font-display text-[11px] transition-colors ${
                tab === item.id ? "btn-gold" : "text-muted-foreground hover:text-gold"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 min-w-4 rounded-full bg-blood px-1 text-center text-[10px] font-bold leading-4 text-foreground"
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      {!heroId ? (
        <p className="text-sm text-muted-foreground">
          {t("Select a character to manage friends.")}
        </p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-4 gap-1.5">
            <Stat value={friends.length} label={t("Friends")} tone="text-gold" />
            <Stat value={onlineCount} label={t("Online now")} tone="text-r1" />
            <Stat value={pending} label={t("Pending requests")} tone="text-gold" />
            <Stat value={unreadTotal} label={t("Unread messages")} tone="text-blood" />
          </div>

          {busy && (
            <p role="status" className="py-1 text-xs text-muted-foreground">
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              {t("Syncing…")}
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
            <div className="space-y-2.5">
              {incoming.length > 0 && (
                <button
                  type="button"
                  className="slot flex w-full items-center gap-2 border-gold/50 p-2 text-left transition-colors hover:border-gold"
                  onClick={() => setTab("requests")}
                >
                  <Inbox className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-xs">
                    {t("Friend requests:")} <b className="text-gold">{incoming.length}</b>
                  </span>
                  <span className="shrink-0 text-xs text-gold">{t("View requests")} →</span>
                </button>
              )}

              {hero && (
                <div className="slot flex flex-wrap items-center gap-2 p-2">
                  <Users className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                    {t("Your hero name is")} <b className="text-gold">{hero.name}</b>{" "}
                    {t("— share it so friends can find you.")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copyMyName()}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {t("Copy name")}
                  </Button>
                  <Button type="button" size="sm" onClick={() => setTab("find")}>
                    <UserPlus className="mr-1 h-3.5 w-3.5" />
                    {t("Add a friend")}
                  </Button>
                </div>
              )}

              {friends.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-pressed={onlineOnly}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      onlineOnly
                        ? "border-r1/60 bg-r1/10 text-r1"
                        : "border-border text-muted-foreground hover:text-gold"
                    }`}
                    onClick={() => setOnlineOnly((value) => !value)}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        onlineOnly ? "bg-r1" : "bg-muted-foreground/60"
                      }`}
                    />
                    {t("Online only")} · {onlineCount}
                  </button>
                  {friends.length > 3 && (
                    <label className="relative flex-1 sm:max-w-48">
                      <span className="sr-only">{t("Filter friends")}</span>
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="slot w-full py-1.5 pl-7 pr-2 text-sm outline-none"
                        placeholder={t("Filter friends")}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      />
                    </label>
                  )}
                </div>
              )}

              {onlineFriends.length > 0 && (
                <section aria-label={t("Online now")} className="space-y-1.5">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-r1" />
                    {t("Online now")} · {onlineFriends.length}
                  </h3>
                  <ul className="space-y-1.5">{onlineFriends.map(renderRow)}</ul>
                </section>
              )}

              {offlineFriends.length > 0 && (
                <section aria-label={t("Offline")} className="space-y-1.5">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                    />
                    {t("Offline")} · {offlineFriends.length}
                  </h3>
                  <ul className="space-y-1.5">{offlineFriends.map(renderRow)}</ul>
                </section>
              )}

              {loaded && friends.length === 0 && (
                <div className="slot flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <UserPlus className="h-7 w-7 text-gold/70" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t("No friends yet.")}</p>
                  <button
                    type="button"
                    className="text-sm text-gold hover:underline"
                    onClick={() => setTab("find")}
                  >
                    {t("Find heroes to send your first request")} →
                  </button>
                </div>
              )}
              {friends.length > 0 && visibleFriends.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {onlineOnly && !filter.trim()
                    ? t("None of your friends are online right now.")
                    : `${t("No friend matches “")}${filter}”.`}
                </p>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="space-y-4">
              <section aria-label={t("Incoming requests")}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("Incoming (")}
                  {incoming.length})
                </h3>
                <ul className="space-y-1.5">
                  {incoming.map((request) => (
                    <li
                      key={request.id}
                      className="slot flex flex-wrap items-center gap-2 border-gold/40 p-2"
                    >
                      <div className="min-w-0 flex-1 p-1">
                        <span className="block break-words text-sm text-gold">{request.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          <span className="capitalize">{request.hero_class}</span>
                          {t("· Level")} {request.level}
                          {t("· BR")} {request.power.toLocaleString()}
                          {t("· asks to be friends")}
                        </span>
                      </div>
                      <Button
                        type="button"
                        className="btn-gold"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void mutate(
                            (id) => respondFriendRequest(id, request.id, true),
                            `You are now friends with ${request.name}.`,
                          )
                        }
                      >
                        <Check className="mr-1 h-4 w-4" />
                        {t("Accept")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
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
                  <p className="py-2 text-sm text-muted-foreground">{t("No incoming requests.")}</p>
                )}
              </section>

              <section aria-label={t("Sent requests")}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("Waiting for them (")}
                  {sent.length})
                </h3>
                <ul className="space-y-1.5">
                  {sent.map((request) => (
                    <li key={request.id} className="slot flex flex-wrap items-center gap-2 p-2">
                      <div className="min-w-0 flex-1 p-1">
                        <span className="block break-words text-sm text-gold">{request.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          <span className="capitalize">{request.hero_class}</span>
                          {t("· Level")} {request.level}
                          {t("— waiting for an answer")}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        aria-label={`Withdraw request to ${request.name}`}
                        onClick={() =>
                          void mutate(
                            (id) => cancelFriendRequest(id, request.id),
                            `Request to ${request.name} withdrawn.`,
                          )
                        }
                      >
                        {t("Withdraw")}
                      </Button>
                    </li>
                  ))}
                </ul>
                {loaded && sent.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">
                    {t("Nothing waiting — everyone answered.")}
                  </p>
                )}
              </section>
            </div>
          )}

          {tab === "find" && (
            <div className="space-y-3">
              <label className="relative block">
                <span className="sr-only">{t("Search heroes by name")}</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="slot w-full py-2 pl-9 pr-3 outline-none"
                  placeholder={t("Search heroes by name (2+ letters)")}
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
                {t(
                  "Only heroes with a public profile appear here. Requests are answered in the Requests tab — friends you both asked for connect instantly.",
                )}
              </p>

              <ul className="space-y-1.5">
                {results.map((hero) => {
                  const seen = presence(hero.last_played);
                  const incomingRequest = incoming.find((r) => r.hero_id === hero.id);
                  return (
                    <li
                      key={hero.id}
                      className="slot flex flex-wrap items-center gap-2 p-2"
                      data-testid="hero-result"
                    >
                      <div className="min-w-0 flex-1 p-1">
                        <span className="flex items-center gap-1.5 break-words text-sm text-gold">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-2 w-2 shrink-0 rounded-full ${seen.online ? "bg-r1" : "bg-muted-foreground/50"}`}
                          />
                          {hero.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          <span className="capitalize">{hero.hero_class}</span> · {hero.gender}
                          {t("· Level")} {hero.level}
                          {t("· BR")} {hero.power.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{seen.label}</span>
                      </div>
                      {hero.relation === "friend" ? (
                        <span className="px-2 text-xs text-r1">{t("Friends")}</span>
                      ) : hero.relation === "sent" ? (
                        <span className="px-2 text-xs text-muted-foreground">{t("Requested")}</span>
                      ) : incomingRequest ? (
                        <Button
                          type="button"
                          className="btn-gold"
                          size="sm"
                          disabled={busy}
                          onClick={() => void acceptFromSearch(hero)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          {t("Accept")}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="btn-gold"
                          size="sm"
                          disabled={busy}
                          onClick={() => void addHero(hero)}
                        >
                          <UserPlus className="mr-1 h-4 w-4" />
                          {t("Add friend")}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {searched && !searching && results.length === 0 && query.trim().length >= 2 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("No public hero matches “")}
                  {query.trim()}”.
                </p>
              )}
              {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("Type at least two letters.")}
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

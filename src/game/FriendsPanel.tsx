import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InspectPanel } from "./InspectPanel";
import { addFriend, listFriends, removeFriend, socialError, type FriendProfile } from "./social";

export function FriendsPanel({ heroId }: { heroId: string | null }) {
  // Remount on active-character changes so old requests cannot affect the new panel.
  return <FriendsContent key={heroId ?? "no-character"} heroId={heroId} />;
}
function FriendsContent({ heroId }: { heroId: string | null }) {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    if (heroId) {
      locked.current = true;
      setBusy(true);
      void listFriends(heroId).then(
        (rows) => { if (active) { setFriends(rows); setLoaded(true); } },
        (e: unknown) => { if (active) setError(socialError(e)); },
      ).finally(() => { if (active) { locked.current = false; setBusy(false); } });
    }
    return () => { active = false; mounted.current = false; };
  }, [heroId]);
  const mutate = async (action: (id: string) => Promise<unknown>, clearName = false) => {
    if (!heroId || locked.current) return;
    locked.current = true; setBusy(true); setError(null);
    try {
      await action(heroId);
      if (!mounted.current) return;
      if (clearName) setName("");
      const rows = await listFriends(heroId);
      if (mounted.current) { setFriends(rows); setLoaded(true); }
    } catch (e) { if (mounted.current) setError(socialError(e)); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  return <section className="game-panel anim-pop p-4" aria-label="Friends">
    <h2 className="panel-title mb-4">Friends</h2>
    {!heroId ? <p className="text-sm text-muted-foreground">Select a character to manage friends.</p> : <>
      <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); void mutate((id) => addFriend(id, name), true); }}>
        <label className="block min-w-0 flex-1 text-sm">Hero name<input className="slot mt-1 w-full px-3 py-2" placeholder="Hero name" required maxLength={18} value={name} disabled={busy} onChange={(e) => setName(e.target.value)} /></label>
        <Button className="btn-gold" disabled={busy || !name.trim()} type="submit">Add</Button>
      </form>
      {busy && <p role="status" className="py-2 text-sm text-muted-foreground">Loading…</p>}
      {error && <p role="alert" className="py-2 text-sm text-muted-foreground">{error}</p>}
      {loaded && friends.length === 0 && <p className="py-4 text-sm text-muted-foreground">No friends yet - add someone by name.</p>}
      <ul className="mt-3 space-y-2">{friends.map((friend) => <li key={friend.id} className="slot flex items-center gap-2 p-2">
        <button type="button" className="min-w-0 flex-1 rounded p-2 text-left focus-visible:outline focus-visible:outline-ring" onClick={() => setTargetId(friend.id)} aria-label={`Inspect ${friend.name}`}>
          <span className="block break-words text-gold">{friend.name}</span>
          <span className="block text-sm text-muted-foreground"><span className="capitalize">{friend.hero_class}</span> · Level {friend.level} · Battle Rating {friend.power.toLocaleString()}</span>
        </button>
        <Button type="button" variant="outline" disabled={busy} aria-label={`Remove ${friend.name}`} onClick={() => void mutate((id) => removeFriend(id, friend.id))}>Remove</Button>
      </li>)}</ul>
    </>}
    {heroId && targetId && <InspectPanel heroId={heroId} targetId={targetId} onClose={() => setTargetId(null)} />}
  </section>;
}

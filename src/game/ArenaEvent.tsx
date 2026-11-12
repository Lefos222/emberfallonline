import { useEffect, useMemo, useRef, useState } from "react";
import { tr } from "./i18n";
import { Panel, fmt } from "./ui";
import { Button } from "@/components/ui/button";
import { useGame } from "./store";
import { InviteFriends } from "./InviteFriends";
import { CharacterModel } from "./CharacterModel";
import { arenaEvent, claimArenaEvent } from "./services";
import { ARENA_STEP_MS, arenaEventGold, arenaTimeline, type ArenaUnit } from "./arena-event";
import type { HeroClass } from "./data";
import art from "@/assets/arena-event.png";

type Member = { id: string; name: string; cls: string; gender: string; level: number; power: number };
type Team = { id: string; code: string; leader: string; status: string; members: Member[] };
type State = { open: boolean; closes?: string; next: string; now: string; team: Team | null;
  match: { id: string; seed: number; starts_at: string; winner: string; a: Team; b: Team; claimed: boolean; gold: number | null } | null };

const clock = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`; };

/** Arena party event: parties of 1-4 meet another party of the same size, live, every six hours. */
export function ArenaEventPanel({
  onClose,
  invite,
}: {
  onClose: () => void;
  /** A friend's call to their team: the panel opens already joined, if the arena is open. */
  invite?: { code: string; from: string } | null;
}) {
  const { hero, heroId } = useGame();
  const [st, setSt] = useState<State | null>(null);
  const [skew, setSkew] = useState(0);
  const [err, setErr] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [paid, setPaid] = useState<string>("");

  const run = async (fn: Parameters<typeof arenaEvent>[0], c?: string) => {
    setBusy(true); setErr("");
    try { const s = (await arenaEvent(fn, c)) as unknown as State; setSt(s); setSkew(new Date(s.now).getTime() - Date.now()); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  useEffect(() => { void run("arena_event_state"); }, [heroId]);
  // A friend's call drops this hero into their team, once — and only while the arena is open.
  const joined = useRef(false);
  useEffect(() => {
    if (!invite?.code || joined.current || !st?.open || st.team) return;
    joined.current = true;
    void run("arena_event_join", invite.code);
  }, [invite?.code, st?.open, st?.team]);
  // Poll while forming/queued so party members and the match appear live.
  useEffect(() => { const i = setInterval(() => { setNow(Date.now()); }, 250); return () => clearInterval(i); }, []);
  useEffect(() => {
    if (!st || (st.match && st.match.claimed)) return;
    const i = setInterval(() => { void arenaEvent("arena_event_state").then((s) => setSt(s as unknown as State)).catch(() => {}); }, 3000);
    return () => clearInterval(i);
  }, [st?.team?.status, st?.match?.claimed]);

  const m = st?.match;
  const units = useMemo<ArenaUnit[]>(() => m ? [...m.a.members.map((u) => ({ ...u, side: "a" as const })), ...m.b.members.map((u) => ({ ...u, side: "b" as const }))] : [], [m?.id]);
  const frames = useMemo(() => m ? arenaTimeline(units, m.seed, m.winner === m.a.id ? "a" : "b") : [], [m?.id, units]);
  if (!hero) return null;
  const serverNow = now + skew;
  const elapsed = m ? serverNow - new Date(m.starts_at).getTime() : 0;
  const step = Math.min(frames.length - 1, Math.max(0, Math.floor(elapsed / ARENA_STEP_MS)));
  const done = m && elapsed >= frames.length * ARENA_STEP_MS;
  const claimable = m && elapsed > 20000 && !m.claimed;
  const mySide = m ? (m.a.members.some((u) => u.id === heroId) ? "a" : "b") : null;
  const won = m ? (mySide === "a" ? m.winner === m.a.id : m.winner === m.b.id) : false;
  const isLeader = st?.team?.leader === heroId;

  const side = (team: Team, s: "a" | "b") => (
    <div className="flex flex-1 flex-wrap justify-center gap-2">
      {team.members.map((u) => {
        const hp = frames[step]?.hp[u.id] ?? 100;
        return (
          <div key={u.id} className={`w-24 text-center text-xs ${hp <= 0 ? "opacity-40 grayscale" : ""}`}>
            <div className={`h-24 ${s === "b" ? "scale-x-[-1]" : ""}`}><CharacterModel cls={u.cls as HeroClass} gender={u.gender === "female" ? "female" : "male"} className="h-full w-full" /></div>
            <div className="truncate font-display">{u.name}</div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-background"><div className="h-full bg-blood transition-all" style={{ width: `${hp}%` }} /></div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Panel title={tr("Arena Clash")} subtitle={tr("Party battles every six hours — parties of 1 to 4")} art="swords" onClose={onClose} wide>
      <div className="flex items-center gap-3">
        <img src={art} alt="" width={256} height={256} className="h-20 w-20 object-contain" />
        <div className="text-sm">
          {st?.open ? <p className="text-gold">{tr("The arena is open")} · {tr("closes in")} {clock(new Date(st.closes!).getTime() - serverNow)}</p>
            : st && <p>{tr("Next arena opens in")} <b className="text-gold">{clock(new Date(st.next).getTime() - serverNow)}</b> (00:00, 06:00, 12:00, 18:00 UTC)</p>}
          <p className="text-xs text-muted-foreground">{tr("Winners earn")} {fmt(arenaEventGold(hero.level, true))} {tr("gold")} · {tr("the losing party still earns")} {fmt(arenaEventGold(hero.level, false))}</p>
        </div>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-blood">{tr(err)}</p>}
      {invite?.code && st && !st.open && (
        <p className="mt-2 text-sm text-gold">
          {tr("The arena is closed right now — you will join {name}'s team when it opens.", { name: invite.from })}
        </p>
      )}
      {m ? (
        <div className="mt-3">
          <div className="flex items-center gap-2">{side(m.a, "a")}<span className="font-display text-2xl text-gold">VS</span>{side(m.b, "b")}</div>
          <p className="mt-2 h-5 text-center text-xs text-muted-foreground">{elapsed < 0 ? tr("The battle begins in {s}s", { s: Math.ceil(-elapsed / 1000) }) : frames[step]?.log}</p>
          {done && <p className="text-center font-display text-xl text-gold">{won ? tr("Victory!") : tr("Defeat")}</p>}
          {m.claimed ? <p className="text-center text-sm">{tr("Reward claimed")}: {fmt(m.gold ?? 0)} {tr("gold")}</p>
            : <Button className="btn-gold mt-2 w-full" disabled={!claimable || busy} onClick={async () => {
                setBusy(true);
                try { const r = await claimArenaEvent(); setPaid(`${fmt(r.gold)}`); await run("arena_event_state"); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
                finally { setBusy(false); }
              }}>{claimable ? tr("Claim reward") : tr("Fighting…")}</Button>}
          {paid && <p role="status" className="text-center text-gold">+{paid} {tr("gold")}</p>}
        </div>
      ) : st?.team ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm">{tr("Party code")}: <b className="select-all font-display text-xl text-gold">{st.team.code}</b> <span className="text-xs text-muted-foreground">{tr("— share it with up to 3 friends")}</span></p>
          <ul className="grid gap-1 sm:grid-cols-2">{st.team.members.map((u) => <li key={u.id} className="slot p-2 text-sm">{u.name} · {tr("Lv")} {u.level} · BR {fmt(u.power)}{u.id === st.team!.leader && " ★"}</li>)}</ul>
          {isLeader && heroId && <InviteFriends heroId={heroId} kind="arena" code={st.team.code} />}
          {st.team.status === "queued" ? <p className="text-center text-gold">{tr("Searching for a party of {n}…", { n: st.team.members.length })}</p>
            : isLeader ? <Button className="btn-gold w-full" disabled={busy} onClick={() => void run("arena_event_queue")}>{tr("Find opponents")} ({st.team.members.length}v{st.team.members.length})</Button>
            : <p className="text-center text-sm text-muted-foreground">{tr("Waiting for the leader to start the search")}</p>}
          <Button variant="ghost" className="btn-ghost w-full" disabled={busy} onClick={() => void run("arena_event_leave")}>{tr("Leave party")}</Button>
        </div>
      ) : st?.open ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button className="btn-gold" disabled={busy} onClick={() => void run("arena_event_form")}>{tr("Create a party")}</Button>
          <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); void run("arena_event_join", code); }}>
            <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder={tr("Party code")} aria-label={tr("Party code")} className="w-full rounded bg-secondary px-2 uppercase" />
            <Button type="submit" className="btn-gold" disabled={busy || code.length < 6}>{tr("Join")}</Button>
          </form>
        </div>
      ) : null}
    </Panel>
  );
}

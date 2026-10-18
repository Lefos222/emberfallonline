import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from '@tanstack/react-start';
import { Bell, BellOff, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, fmt } from "./ui";
import { stageRewards, type Hero, type Item } from "./data";
import type { StartBattle } from "./panels";
import { update } from "./store";
import { scrollXp } from "./scrolls";
import { confirmEventEntry } from './events.functions';
import { eventEncounter } from './event-encounters';
import { recordRosterEncounter } from './bestiary';
import { Sprite } from './Sprite';
import {
  countdown,
  occurrenceKey,
  reminderDue,
  REMIND_LEAD_MS,
  statusOf,
  timeIn,
  TZ_CHOICES,
  WORLD_EVENTS,
  zoneLabel,
  type WorldEvent,
} from "./events";

const STORE_KEY = "ef-event-reminders";

export function EventCalendar({ h, onClose, start }: { h: Hero; onClose: () => void; start: StartBattle }) {
  const [now, setNow] = useState(() => Date.now());
  const [tz, setTz] = useState("local");
  const [remind, setRemind] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const fired = useRef<Set<string>>(new Set());
  const confirmEntry = useServerFn(confirmEventEntry);
  const entering = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Restore saved reminders once the client exists (SSR has no localStorage).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) setRemind(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* first visit */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(remind));
    } catch {
      /* storage disabled */
    }
  }, [remind]);

  // Fire each reminder once per occurrence: in-game banner plus a system notification when allowed.
  useEffect(() => {
    for (const ev of WORLD_EVENTS) {
      if (!remind[ev.id] || !reminderDue(now, ev)) continue;
      const s = statusOf(now, ev); if (s.state !== "upcoming") continue; const key = `${ev.id}:notify:${s.startsAt}`;
      if (fired.current.has(key)) continue;
      fired.current.add(key);
      setBanner(`${ev.name} opens in ${countdown(statusOf(now, ev).msLeft)}`);
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Ember Fall", { body: `${ev.name} opens in ${countdown(statusOf(now, ev).msLeft)}` });
        }
      } catch {
        /* notifications unavailable */
      }
    }
  }, [now, remind]);

  const rows = useMemo(
    () => WORLD_EVENTS.map((ev) => ({ ev, s: statusOf(now, ev) })),
    [now],
  );

  const toggle = (ev: WorldEvent) => {
    const on = !remind[ev.id];
    setRemind((r) => ({ ...r, [ev.id]: on }));
    if (on) {
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
      } catch {
        /* notifications unavailable */
      }
    }
  };

  const join = async (ev: WorldEvent) => {
    if (entering.current) return;
    entering.current = true; setBusy(true); setError('');
    try {
    const { foe } = await confirmEntry({ data: { eventId: ev.id } });
    const rw = stageRewards(ev.stage, ev.kind === "boss" ? 2 : ev.kind === "season" ? 1.5 : 1);
    start({
      title: `${ev.name} · Live Event`,
      right: foe,
      onResult: async (won, xpMultiplier = 1) => {
        const { grant, rollLoot, addLoot } = await import("./logic");
        const lines: string[] = [];
        let loot: Item | null = null;
        update((hh) => {
          if (!won) {
            lines.push("The event is still open — return before the countdown ends.");
            return;
          }
          const xp = scrollXp(rw.xp, xpMultiplier);
          const { levels } = grant(hh, xp, rw.gold);
          loot = rollLoot(hh, ev.stage, 1, ev.kind === "boss" ? 2 : 0);
          recordRosterEncounter(hh, foe.rosterId, true);
          if (loot) addLoot(hh, loot);
          lines.push(`+${fmt(rw.gold)} gold`, `+${fmt(xp)} XP`);
          if (loot) lines.push(`Loot: ${(loot as Item).name}`);
          if (levels > 0) lines.push(`Level up! Now level ${hh.level}`);
        });
        return { lines, loot };
      },
    });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not confirm event opening.'); }
    finally { entering.current = false; setBusy(false); }
  };

  return (
    <Panel title="World Event Calendar" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Recurring events run on one shared clock. Times below are shown in{" "}
          <span className="font-semibold text-foreground">{tz === "local" ? zoneLabel(now) : tz}</span>.
        </p>
        <label className="flex items-center gap-2 text-sm">
          Show times in
          <select
            className="rounded border border-border bg-background p-2"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            aria-label="Time zone"
          >
            {TZ_CHOICES.map((z) => (
              <option key={z} value={z}>
                {z === "local" ? "My zone" : z}
              </option>
            ))}
          </select>
        </label>
      </div>

      {banner && (
        <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded border border-[var(--xp)] bg-[var(--xp)]/10 p-3">
          <span className="text-sm font-semibold">{banner}</span>
          <Button variant="ghost" size="icon" aria-label="Dismiss reminder" onClick={() => setBanner(null)}>
            <X />
          </Button>
        </div>
      )}

      {error && <p role="alert" className="mb-4 text-sm text-hp">{error}</p>}

      <div className="grid gap-3">
        {rows.map(({ ev, s }) => {
          const at = s.state === "live" ? s.endsAt : s.startsAt;
          const encounter = eventEncounter(ev, s.state === 'live' ? s.startedAt : s.startsAt);
          return (
            <article
              key={ev.id}
              className="rounded border bg-background/60 p-4"
              style={{ borderColor: s.state === "live" ? "var(--xp)" : "var(--border)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-3"><Sprite rect={encounter.sprite} className="h-20 w-20 shrink-0" /><div><p className="font-display text-gold">{encounter.name}</p><p className="text-xs text-muted-foreground">Level {encounter.level} · {fmt(encounter.hp)} HP</p></div></div>
                  <h3 className="font-display text-lg font-bold">
                    {ev.name}
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      {ev.kind}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{ev.blurb}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reward: {ev.reward}</p>
                </div>
                <div className="text-right">
                  <p
                    className="font-display text-2xl font-bold tabular-nums"
                    style={{ color: s.state === "live" ? "var(--xp)" : undefined }}
                    aria-label={`${ev.name} ${s.state === "live" ? "ends in" : "opens in"} ${countdown(s.msLeft)}`}
                  >
                    {countdown(s.msLeft)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.state === "live" ? "live now · ends" : "opens"} {timeIn(at, tz)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant={s.state === "live" ? "default" : "outline"} disabled={s.state !== "live" || busy} onClick={() => void join(ev)}>
                  {busy ? 'Confirming…' : s.state === "live" ? "Join event" : "Opens later"}
                </Button>
                <Button size="sm" variant="ghost" aria-pressed={!!remind[ev.id]} onClick={() => toggle(ev)}>
                  {remind[ev.id] ? <Bell /> : <BellOff />}
                  {remind[ev.id] ? "Reminder on" : "Remind me"}
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">
                  <Calendar /> repeats every {ev.everyMs >= 24 * 3_600_000 ? `${Math.round(ev.everyMs / (24 * 3_600_000))} days` : `${Math.round(ev.everyMs / 3_600_000)} hours`}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

import { useEffect, useState } from "react";
import { WORLD_EVENTS, statusOf, greekTime } from "./events";
import { tr } from "./i18n";
import { Panel } from "./ui";
import { ArtIcon } from "./ArtIcon";
import minigameIcon from "@/assets/minigame-hall.png";
import arenaEventIcon from "@/assets/arena-event.png";

export type EventsTarget = "arenaEvent" | "minigames" | "calendar";

/** One window that lists every event and pastime, opened from the button beside the Auction House. */
export function EventsHub({ onClose, onOpen }: { onClose: () => void; onOpen: (t: EventsTarget) => void }) {
  const open = new Date().getUTCHours() % 6 === 0;
  const rows: { id: EventsTarget; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: "arenaEvent", name: "Arena Clash", desc: "Party battles every six hours", icon: <img src={arenaEventIcon} alt="" width={256} height={256} className="h-10 w-10 object-contain" /> },
    { id: "minigames", name: "Minigame Hall", desc: "Pastimes that pay a little gold every day", icon: <img src={minigameIcon} alt="" width={256} height={256} className="h-10 w-10 object-contain" /> },
    { id: "calendar", name: "Event Calendar", desc: "World event calendar & reminders", icon: <ArtIcon name="calendar" size={40} /> },
  ];
  return (
    <Panel title={tr("Events")} subtitle={tr("Every event in one place")} art="calendar" onClose={onClose}>
      <div className="grid gap-2">
        {rows.map((r) => (
          <button key={r.id} className="slot flex items-center gap-3 p-3 text-left hover:ring-2 hover:ring-gold" onClick={() => onOpen(r.id)}>
            {r.icon}
            <span className="flex-1"><b className="font-display text-gold">{tr(r.name)}</b><br /><span className="text-xs text-muted-foreground">{tr(r.desc)}</span></span>
            {r.id === "arenaEvent" && open && <span className="text-xs font-bold text-blood">{tr("OPEN")}</span>}
          </button>
        ))}
      </div>
    </Panel>
  );
}

/** Live events to announce: world-calendar events plus the six-hourly Arena Clash. */
function liveEvents(now: number): { key: string; name: string; endsAt: number }[] {
  const out = WORLD_EVENTS.map((ev) => ({ ev, s: statusOf(now, ev) }))
    .filter(({ s }) => s.state === "live")
    .map(({ ev, s }) => ({ key: `${ev.id}:${s.startedAt}`, name: ev.name, endsAt: (s as { endsAt: number }).endsAt }));
  const d = new Date(now);
  if (d.getUTCHours() % 6 === 0) {
    const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours());
    out.push({ key: `arena:${start}`, name: "Arena Clash", endsAt: start + 3_600_000 });
  }
  return out;
}

const SEEN_KEY = "emberfall.eventsSeen";

/** An on-screen announcement whenever an event is running that this device hasn't been shown yet. */
export function EventPopup({ onOpen }: { onOpen: () => void }) {
  const [shown, setShown] = useState<{ key: string; name: string; endsAt: number } | null>(null);
  useEffect(() => {
    const check = () => {
      let seen: string[] = [];
      try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"); } catch { /* fresh */ }
      const next = liveEvents(Date.now()).find((e) => !seen.includes(e.key));
      if (!next) return;
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, next.key].slice(-40)));
      setShown(next);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(() => setShown(null), 12_000);
    return () => clearTimeout(id);
  }, [shown]);
  if (!shown) return null;
  return (
    <div role="status" className="game-panel pointer-events-auto absolute left-1/2 top-20 z-40 flex -translate-x-1/2 items-center gap-3 rounded-md px-4 py-3 animate-in fade-in slide-in-from-top-4">
      <ArtIcon name="calendar" size={32} />
      <div>
        <div className="font-display text-gold">{tr("{name} is live!", { name: tr(shown.name) })}</div>
        <div className="text-xs text-muted-foreground">{tr("Ends at {time}", { time: greekTime(shown.endsAt) })}</div>
      </div>
      <button className="slot px-3 py-1 text-xs font-bold text-gold hover:ring-2 hover:ring-gold" onClick={() => { setShown(null); onOpen(); }}>{tr("View")}</button>
      <button aria-label={tr("Close")} className="px-1 text-muted-foreground" onClick={() => setShown(null)}>✕</button>
    </div>
  );
}

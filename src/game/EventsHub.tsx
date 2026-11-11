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

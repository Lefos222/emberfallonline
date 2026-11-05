import { Shield } from "lucide-react";

/** The three places a guild member can walk to inside the hall (see GuildHall). */
export type GuildLocation = "merchant" | "tower" | "headquarters";

const LANES: { id: GuildLocation; name: string; hint: string }[] = [
  { id: "merchant", name: "Guild Merchant", hint: "Guild coins & shop" },
  { id: "tower", name: "Master Skill Tower", hint: "Permanent stat ranks" },
  { id: "headquarters", name: "Guild Headquarters", hint: "Roster, banner & chat" },
];

/**
 * The guild courtyard: a blood-moon night over the bazaar, with its merchant tent, the master
 * skill tower and the headquarters keep. Each lane is the way into that part of the guild hall.
 */
export function GuildHallScene({ name, level, members, role, location, onSelect }: {
  name: string;
  level: number;
  members: number;
  role?: string;
  location: GuildLocation;
  onSelect: (where: GuildLocation) => void;
}) {
  return <section className="guild-hall-scene">
    <div className="guild-hall-sky" aria-hidden />
    <div className="guild-hall-moon" aria-hidden />
    <div className="guild-hall-smoke" aria-hidden />
    <div className="guild-hall-ridge" aria-hidden />
    <div className="guild-hall-lava" aria-hidden />
    {Array.from({ length: 10 }).map((_, i) => (
      <span key={i} aria-hidden className="anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold"
        style={{ left: `${6 + i * 9}%`, animationDuration: `${5 + (i % 4)}s`, animationDelay: `${i * 0.6}s` }} />
    ))}
    <header className="guild-hall-banner">
      <span className="guild-hall-emblem" aria-hidden><Shield className="h-5 w-5" /></span>
      <div className="min-w-0">
        <h3 className="truncate font-display text-2xl font-black text-gold">{name}</h3>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Guild level {level} · {members} {members === 1 ? "member" : "members"}{role ? ` · ${role}` : ""}
        </p>
      </div>
    </header>
    <div role="tablist" aria-label="Guild Hall locations" className="guild-hall-lanes">
      {LANES.map((lane) => (
        <button key={lane.id} role="tab" aria-selected={location === lane.id} aria-label={lane.name}
          className={`guild-lane ${location === lane.id ? "guild-lane-active" : ""}`}
          onClick={() => onSelect(lane.id)}>
          <span className={`guild-lane-art guild-lane-${lane.id}`} aria-hidden />
          {lane.id === "tower" && <span className="guild-lane-level">Lv {level}</span>}
          <span className="guild-lane-name">{lane.name}</span>
          <span className="guild-lane-hint">{lane.hint}</span>
        </button>
      ))}
    </div>
  </section>;
}

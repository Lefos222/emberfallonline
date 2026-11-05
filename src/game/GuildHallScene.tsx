import { Shield } from "lucide-react";
import buildingsArt from "@/assets/guild-hall-buildings.webp";

/** The four buildings of the guild hall (see GuildHall). */
export type GuildLocation = "headquarters" | "merchant" | "tower" | "reliquary";

interface GuildBuilding {
  id: GuildLocation;
  name: string;
  hint: string;
  /** Position of the painted building inside the scene, in percent of the artwork. */
  box: { left: number; top: number; width: number; height: number };
}

const BUILDINGS: GuildBuilding[] = [
  {
    id: "merchant",
    name: "Guild Merchant",
    hint: "Treasury, shop & vault",
    box: { left: 0, top: 40, width: 20, height: 40 },
  },
  {
    id: "tower",
    name: "Master Skill Tower",
    hint: "Endless stat ranks",
    box: { left: 18, top: 15, width: 20, height: 62 },
  },
  {
    id: "reliquary",
    name: "Skill Tower Lvl. 10",
    hint: "Reliquary heirlooms",
    box: { left: 36, top: 30, width: 26, height: 58 },
  },
  {
    id: "headquarters",
    name: "Guild Headquarters",
    hint: "Roster, charter, records & chat",
    box: { left: 64, top: 18, width: 33, height: 64 },
  },
];

/**
 * The guild courtyard under the blood moon: the merchant's stall at the left, the master
 * skill tower behind it, the tiered skill tower in the middle and the keep on the right.
 * Each painted building is the way into that part of the hall.
 */
export function GuildHallScene({
  name,
  level,
  members,
  power,
  relics,
  role,
  location,
  onSelect,
}: {
  name: string;
  level: number;
  members: number;
  power?: number;
  relics?: { woken: number; total: number };
  role?: string;
  location: GuildLocation;
  onSelect: (where: GuildLocation) => void;
}) {
  return (
    <section className="guild-hall-scene">
      <header className="guild-hall-banner">
        <span className="guild-hall-emblem" aria-hidden>
          <Shield className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl font-black text-gold">{name}</h3>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Guild level {level} · {members} {members === 1 ? "member" : "members"}
            {power ? ` · ${Math.round(power).toLocaleString()} power` : ""}
            {role ? ` · ${role}` : ""}
          </p>
        </div>
      </header>
      <div className="guild-hall-view" role="tablist" aria-label="Guild Hall buildings">
        <img
          src={buildingsArt}
          alt="The guild hall under the blood moon: the guild merchant, the master skill tower, the tiered skill tower and the guild headquarters"
          className="guild-hall-art"
          draggable={false}
        />
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="anim-ember guild-hall-ember"
            style={{
              left: `${8 + i * 11}%`,
              animationDuration: `${5 + (i % 4)}s`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
        {BUILDINGS.map((b) => (
          <button
            key={b.id}
            role="tab"
            aria-selected={location === b.id}
            aria-label={b.name}
            className="guild-building"
            title={`${b.name} — ${b.hint}`}
            style={{
              left: `${b.box.left}%`,
              top: `${b.box.top}%`,
              width: `${b.box.width}%`,
              height: `${b.box.height}%`,
            }}
            onClick={() => onSelect(b.id)}
          >
            {b.id === "reliquary" && relics && (
              <span className="guild-building-badge">
                {relics.woken}/{relics.total}
              </span>
            )}
            <span className="guild-building-plate">
              <b>{b.name}</b>
              <em>{b.hint}</em>
            </span>
          </button>
        ))}
      </div>
      <div className="guild-hall-rooms">
        {BUILDINGS.map((b) => (
          <button
            key={b.id}
            aria-pressed={location === b.id}
            className={`guild-room ${location === b.id ? "guild-room-active" : ""}`}
            onClick={() => onSelect(b.id)}
          >
            <span className="guild-room-name">{b.name}</span>
            <span className="guild-room-hint">{b.hint}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

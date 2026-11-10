import { t } from "./i18n";
import { Map as MapIcon, ArrowUp } from "lucide-react";
import { Shield, Swords, Coins, Users } from "./PaintedIcons";
import { Button } from "@/components/ui/button";
import buildingsArt from "@/assets/guild-courtyard.jpg";

/** The four buildings of the guild hall (see GuildHall). */
export type GuildLocation = "headquarters" | "merchant" | "tower" | "wars";

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
    box: { left: 0, top: 36, width: 23, height: 30 },
  },
  {
    id: "tower",
    name: "Master Skill Tower",
    hint: "Endless stat ranks",
    box: { left: 23, top: 5, width: 16, height: 53 },
  },
  {
    id: "wars",
    name: "Guild Wars",
    hint: "War room · challenges & spoils",
    box: { left: 42, top: 28, width: 29, height: 34 },
  },
  {
    id: "headquarters",
    name: "Guild Headquarters",
    hint: "Roster, charter, records & chat",
    box: { left: 73, top: 5, width: 27, height: 60 },
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
  court = false,
  onToggleCourt,
}: {
  name: string;
  level: number;
  members: number;
  power?: number;
  relics?: { woken: number; total: number };
  role?: string;
  location: GuildLocation;
  onSelect: (where: GuildLocation) => void;
  /** The painted courtyard is folded away until asked for, so its rooms are one tap away. */
  court?: boolean;
  onToggleCourt?: () => void;
}) {
  return (
    <section className="guild-hall-scene">
      <header className="guild-hall-banner">
        <span className="guild-hall-emblem" aria-hidden>
          <Shield className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-2xl font-black text-gold">{name}</h3>
          <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
             {t("Level")} {level} · {members} {members === 1 ? t("member") : t("members")}
            {power ? ` · ${Math.round(power).toLocaleString()} power` : ""}
            {role ? ` · ${role}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="sm"
          className="shrink-0"
          aria-expanded={court}
          title={t("Show or hide the painted courtyard")}
          onClick={onToggleCourt}
        >
          <MapIcon className="mr-1 inline h-3.5 w-3.5" />{court ? t("Hide map") : t("Map")}
        </Button>
      </header>
      {court && (
        <>
          <div className="guild-hall-view" role="tablist" aria-label={t("Guild Hall buildings")}>
            <img
              src={buildingsArt}
              alt={t("Guild courtyard with a merchant pavilion, crystal training tower, war room and grand headquarters")}
              className="guild-hall-art"
              width={1536} height={1024}
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
              <Button variant="ghost"
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
                <span className="guild-building-plate">
                  <b>{b.name}</b>
                  <em>{b.hint}</em>
                </span>
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="guild-hall-rooms">
        {BUILDINGS.map((b) => (
          <Button variant="ghost"
            key={b.id}
            aria-pressed={location === b.id}
            className={`guild-room ${location === b.id ? "guild-room-active" : ""}`}
            onClick={() => onSelect(b.id)}
          >
            {b.id === "wars" ? <Swords className="guild-room-icon" /> : b.id === "tower" ? <ArrowUp className="guild-room-icon" /> : b.id === "merchant" ? <Coins className="guild-room-icon" /> : <Users className="guild-room-icon" />}
            <span className="guild-room-name">{b.name}</span>
            <span className="guild-room-hint">{b.hint}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}

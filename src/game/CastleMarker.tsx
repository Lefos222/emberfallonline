import { Castle } from "lucide-react";
import { CLASSES } from "./data";
import { Portrait } from "./CharacterSelect";
import { WORLD_UNITS, type WorldCastle } from "./worldcastles";

/** A castle on the world map: the lord's own character model, marked when it is yours. */
export function CastleMarker({ castle, mine, selected, onSelect }: {
  castle: WorldCastle; mine: boolean; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(castle.x / WORLD_UNITS) * 100}%`, top: `${(castle.y / WORLD_UNITS) * 100}%` }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      aria-pressed={selected}
      aria-label={`${castle.name}, ${CLASSES[castle.cls].name}, level ${castle.level}${mine ? ", your castle" : ""}`}
    >
      <span
        className={`slot flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full transition group-hover:scale-110 ${
          mine ? "border-gold" : ""
        } ${selected ? "ring-2 ring-gold" : ""}`}
      >
        <Portrait cls={castle.cls} gender={castle.gender} className="w-full" />
      </span>
      {mine && <Castle className="absolute -right-1.5 -top-1.5 h-4 w-4 text-gold drop-shadow-[0_1px_1px_black]" aria-hidden="true" />}
      <span
        className={`hotspot-label absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] ${
          selected ? "opacity-100" : "opacity-85"
        }`}
      >
        {castle.name}
      </span>
    </button>
  );
}
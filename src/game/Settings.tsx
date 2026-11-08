import { Volume2, VolumeX } from "lucide-react";
import { SOUNDTRACKS, type AudioSettings } from "./audio";
import { Panel } from "./ui";

/** Game settings: the music volume and the soundtrack the game plays. */
export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: AudioSettings;
  onChange: (patch: Partial<AudioSettings>) => void;
  onClose: () => void;
}) {
  const percent = Math.round(settings.volume * 100);
  return (
    <Panel title="Settings" subtitle="Music and sound" onClose={onClose}>
      <section className="slot p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-display text-sm text-gold">Music volume</h3>
          <button
            className="btn-ghost flex items-center gap-1 px-2 py-1 text-xs"
            onClick={() => onChange({ muted: !settings.muted })}
            aria-pressed={settings.muted}
          >
            {settings.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {settings.muted ? "Muted" : "On"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <VolumeX className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={percent}
            aria-label="Music volume"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--gold)]"
            onChange={(e) => onChange({ volume: Number(e.target.value) / 100, muted: false })}
          />
          <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">{percent}%</span>
        </div>
      </section>

      <h3 className="mt-4 mb-2 font-display text-sm text-gold">Soundtrack</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {SOUNDTRACKS.map((track, i) => {
          const active = settings.track === track.id;
          return (
            <button
              key={track.id}
              onClick={() => onChange({ track: track.id, muted: false })}
              aria-pressed={active}
              className={`slot flex items-start gap-3 p-3 text-left transition hover:scale-[1.01] ${active ? "ring-2 ring-gold" : ""}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/40 font-display text-sm text-gold">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-bold">
                  {track.name}
                  {i === 0 && <span className="rounded bg-gold/20 px-1 text-[10px] text-gold">Default</span>}
                </span>
                <span className="block text-[11px] text-muted-foreground">{track.note}</span>
                <span className={`mt-1 block text-[11px] font-bold ${active ? "text-r1" : "text-muted-foreground"}`}>
                  {active ? "Now playing" : "Play this"}
                </span>
              </span>
              {active && <Volume2 className="h-4 w-4 shrink-0 text-gold" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Music starts after your first tap on the castle. Your choice and volume are remembered on this device.
      </p>
    </Panel>
  );
}

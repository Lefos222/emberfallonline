import theme from "@/assets/theme.mp3.asset.json";

/**
 * The game's music, in the order players see it in the settings panel. The original theme is the
 * default; the second track is the Sibling Showdown score shipped with the game.
 */
export const SOUNDTRACKS = [
  { id: "original", name: "Original theme", note: "The Emberfall soundtrack", url: theme.url },
  { id: "sibling-showdown", name: "Sibling Showdown", note: "The duel score", url: "/audio/sibling-showdown.mp3" },
] as const;

export type SoundtrackId = (typeof SOUNDTRACKS)[number]["id"];

export const DEFAULT_SOUNDTRACK: SoundtrackId = "original";
/** Music sits under the game at just over a third volume by default. */
export const DEFAULT_VOLUME = 0.35;

export interface AudioSettings {
  muted: boolean;
  /** 0 to 1. */
  volume: number;
  track: SoundtrackId;
}

const MUTED_KEY = "bm-muted";
const VOLUME_KEY = "bm-volume";
const TRACK_KEY = "bm-track";

const clampVolume = (v: number) => Math.min(1, Math.max(0, v));

/** The saved music settings, falling back to the defaults on a first visit or unreadable storage. */
export function readAudioSettings(): AudioSettings {
  if (typeof localStorage === "undefined") return { muted: false, volume: DEFAULT_VOLUME, track: DEFAULT_SOUNDTRACK };
  const stored = Number(localStorage.getItem(VOLUME_KEY));
  const track = localStorage.getItem(TRACK_KEY);
  return {
    muted: localStorage.getItem(MUTED_KEY) === "1",
    volume: Number.isFinite(stored) && localStorage.getItem(VOLUME_KEY) !== null ? clampVolume(stored) : DEFAULT_VOLUME,
    track: SOUNDTRACKS.some((s) => s.id === track) ? (track as SoundtrackId) : DEFAULT_SOUNDTRACK,
  };
}

/** Remember the music settings for the next visit. */
export function saveAudioSettings(s: AudioSettings): AudioSettings {
  const kept = { ...s, volume: clampVolume(s.volume) };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(MUTED_KEY, kept.muted ? "1" : "0");
    localStorage.setItem(VOLUME_KEY, String(kept.volume));
    localStorage.setItem(TRACK_KEY, kept.track);
  }
  return kept;
}

/** Where a soundtrack's audio file lives. */
export function soundtrackUrl(id: SoundtrackId) {
  return (SOUNDTRACKS.find((s) => s.id === id) ?? SOUNDTRACKS[0]).url;
}

import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * The anti-cheat runs in the database (drizzle/migrations/0043_anti_cheat.sql): every hero save is
 * checked against the most the game can actually produce, impossible values are rolled back and the
 * attempt is counted. This module holds only what the player sees — the warnings and the deletion
 * notice — plus the shared curve the client uses to sanity-check its own drafts.
 *
 * The numbers below are duplicated in the SQL guard on purpose: the database is the authority, and
 * `src/test/anticheat.test.ts` proves the two agree so a change here cannot silently drift.
 */

/** No real hero sits below this rating, whatever the level. */
export const RATING_CEILING_FLOOR = 10_000;
/** Three times the strongest benchmark build at the cap (see src/test/battle-rating.test.ts). */
export const RATING_CEILING_SLOPE = 147;
export const RATING_CEILING_EXPONENT = 1.87;
/** Ascension adds a little room to the line, never removes it. */
export const RATING_CEILING_PARAGON = 0.03;

const clampLevel = (level: number) => Math.max(1, Math.min(140, Math.round(Number(level) || 1)));

/** The highest Battle Rating a hero of this level and Ascension can legitimately reach. */
export function ratingCeiling(level: number, paragon = 0) {
  const lift = 1 + RATING_CEILING_PARAGON * Math.max(0, Math.round(Number(paragon) || 0));
  return Math.round(
    (RATING_CEILING_FLOOR +
      RATING_CEILING_SLOPE * Math.pow(clampLevel(level), RATING_CEILING_EXPONENT)) *
      lift,
  );
}

/** Would this rating be impossible for the hero carrying it? */
export function impossibleRating(power: number, level: number, paragon = 0) {
  return !Number.isFinite(power) || power > ratingCeiling(level, paragon) || power < 0;
}

export type BlockedKind =
  "battle_rating" | "power" | "gold" | "level" | "arena_rating" | "server_owned";

/** One line per blocked value, so the warning can say what the server refused to believe. */
export function blockedKinds(detail: unknown): BlockedKind[] {
  if (!detail || typeof detail !== "object") return [];
  const keys = Object.keys(detail as Record<string, unknown>);
  const known: BlockedKind[] = [
    "battle_rating",
    "power",
    "gold",
    "level",
    "arena_rating",
    "server_owned",
  ];
  return known.filter((k) => keys.includes(k));
}

export interface CheatNotice {
  id: number;
  kind: "warning" | "removed";
  hero: string;
  detail: Record<string, unknown>;
}

let notices: CheatNotice[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function parse(value: unknown): CheatNotice[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((n): n is Record<string, unknown> => !!n && typeof n === "object")
    .map((n) => ({
      id: Number(n["id"] ?? 0),
      kind: (n["kind"] === "removed" ? "removed" : "warning") as CheatNotice["kind"],
      hero: String(n["hero"] ?? ""),
      detail: (n["detail"] && typeof n["detail"] === "object" ? n["detail"] : {}) as Record<
        string,
        unknown
      >,
    }))
    .filter((n) => n.id > 0);
}

/** Read the player's unseen anti-cheat notices. Never throws: a warning is not worth a broken screen. */
export async function refreshAntiCheatNotices(): Promise<CheatNotice[]> {
  try {
    const { data, error } = await supabase.rpc("my_anti_cheat_notices");
    if (error) return notices;
    notices = parse(data);
    emit();
    return notices;
  } catch {
    return notices;
  }
}

/** Mark the notices the player has just read as seen. */
export async function acknowledgeCheatNotices(ids: number[]) {
  if (!ids.length) return;
  notices = notices.filter((n) => !ids.includes(n.id));
  emit();
  try {
    await supabase.rpc("ack_anti_cheat_notices", { _ids: ids });
  } catch {
    /* the notice stays unseen and is shown again next time */
  }
}

export function clearCheatNotices() {
  notices = [];
  emit();
}

export function useCheatNotices() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => notices,
    () => notices,
  );
}

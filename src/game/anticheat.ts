import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/** A warning the server issued when it refused a cheating save and removed the character. */
export interface CheatWarning {
  id: string;
  hero_name: string;
  reason: string;
  created_at: string;
}

// The anticheat tables are newer than the generated database types, so they are read untyped here.
type Loose = {
  from: (t: string) => {
    select: (c: string) => {
      is: (
        c: string,
        v: null,
      ) => {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => Promise<{ data: CheatWarning[] | null; error: unknown }>;
      };
    };
  };
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
};
const db = supabase as unknown as Loose;

let warnings: CheatWarning[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Read the signed-in player's unacknowledged warnings. Failures stay silent: nothing to show. */
export async function loadCheatWarnings() {
  try {
    const { data, error } = await db
      .from("anticheat_warnings")
      .select("id,hero_name,reason,created_at")
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false });
    if (error || !data) return;
    warnings = data;
    emit();
  } catch {
    // Offline or not yet migrated: there is simply nothing to show.
  }
}

export async function acknowledgeCheatWarning(id: string) {
  warnings = warnings.filter((w) => w.id !== id);
  emit();
  await db.rpc("anticheat_acknowledge", { _id: id });
}

export function useCheatWarnings() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => warnings,
    () => warnings,
  );
}

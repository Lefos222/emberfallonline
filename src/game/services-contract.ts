import { ASTRAL_BASES, type Astral } from "./crafting";
import type { Hero } from "./data";

export function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/** RPCs return either a save directly or an envelope containing save. Never fabricate missing state. */
export function returnedSave(value: unknown): Hero {
  const root = object(value);
  const save = object(root.save ?? value);
  if (typeof save.name !== "string" || !["warrior", "mage", "archer"].includes(String(save.cls)) ||
      !Array.isArray(save.inventory) || !Array.isArray(save.merchant) ||
      !Number.isFinite(save.level) || !Number.isFinite(save.gold) || !save.attrs || !save.equipment) {
    throw new Error("The game server returned an incomplete save. Reopen your character before continuing.");
  }
  return save as unknown as Hero;
}

export function returnedAstral(value: unknown): Astral {
  const a = object(object(value).astral);
  if (typeof a.id !== "string" || typeof a.base !== "string" || !ASTRAL_BASES[a.base] ||
      !Number.isInteger(a.rarity) || Number(a.rarity) < 0 || Number(a.rarity) > 5 || !Number.isInteger(a.lvl)) {
    throw new Error("The game server returned an unrecognized Astral. Reopen your character to check your collection.");
  }
  return a as unknown as Astral;
}

export interface Objective { id: string; kind: string; target: number; progress: number; claimed: boolean; stage?: number }
export interface Activities {
  now: string; dailyReset: string; weeklyReset: string; daily: Objective[]; weekly: Objective[];
  dailyBonusClaimed: boolean; login: { claimedToday: boolean; streak: number; total: number };
}
export function returnedActivities(value: unknown): Activities {
  const a = object(value);
  const valid = (entry: unknown) => {
    const e = object(entry);
    return typeof e.id === "string" && typeof e.kind === "string" && Number(e.target) > 0 &&
      Number.isFinite(e.progress) && typeof e.claimed === "boolean";
  };
  const login = object(a.login);
  if (!Array.isArray(a.daily) || !Array.isArray(a.weekly) || !a.daily.every(valid) || !a.weekly.every(valid) ||
      typeof login.claimedToday !== "boolean" || !Number.isFinite(login.streak) || !Number.isFinite(login.total) ||
      typeof a.dailyReset !== "string" || typeof a.weeklyReset !== "string") throw new Error("Activity data is unavailable. Please retry.");
  return a as unknown as Activities;
}

/** Retry the same valuable request after uncertainty, including after refresh. */
export function requestKey(storage: Pick<Storage, "getItem" | "setItem">, heroId: string, kind: string, uuid: () => string): string {
  const key = `ef-pending:${heroId}:${kind}`;
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = uuid();
  storage.setItem(key, id);
  return id;
}
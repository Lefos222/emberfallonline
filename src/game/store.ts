import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { heroStats, newHero, normalizeHero, type Hero, type HeroClass } from "./data";

export type Gender = "male" | "female";
export interface CharacterRow {
  id: string; name: string; hero_class: HeroClass; gender: Gender; level: number; power: number;
  arena_rating: number; last_played: string; bio: string; title: string; frame: string; is_public: boolean;
  stats: { paragon?: number } | null;
}

interface State {
  hero: Hero | null;
  heroId: string | null;
  gender: Gender;
  userId: string | null;
  email: string | null;
  authReady: boolean;
  chars: CharacterRow[] | null; // null = loading
  charsError: string | null;
  cloud: "off" | "loading" | "saved" | "saving" | "error";
}

let state: State = { hero: null, heroId: null, gender: "male", userId: null, email: null, authReady: false, chars: null, charsError: null, cloud: "off" };
const listeners = new Set<() => void>();
const LAST = "ef-last-char";
const COLS = "id,name,hero_class,gender,level,power,arena_rating,last_played,bio,title,frame,is_public,stats";

function set(p: Partial<State>) { state = { ...state, ...p }; listeners.forEach((l) => l()); }

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveInFlight: Promise<boolean> | null = null;
let serverOperation = false;
let needsServerReload = false;
let lastSavedAt = "";
async function performSave(): Promise<boolean> {
  if (needsServerReload) return false;
  const h = state.hero; const id = state.heroId;
  if (!state.userId || !h || !id) return false;
  set({ cloud: "saving" });
  const s = heroStats(h);
  const now = new Date().toISOString();
  const { error } = await supabase.from("heroes").update({
    level: h.level, power: s.power, stats: { ...s, paragon: h.paragon } as never, save: h as never,
    updated_at: now, last_played: now,
  }).eq("id", id);
  lastSavedAt = now;
  if (state.heroId === id) set({ cloud: error ? "error" : "saved" });
  return !error;
}

async function pushCloud(): Promise<boolean> {
  const previous = saveInFlight;
  const pending = (async () => { if (previous) await previous; return performSave(); })();
  saveInFlight = pending;
  try { return await pending; } finally { if (saveInFlight === pending) saveInFlight = null; }
}

export function flushSave() { clearTimeout(saveTimer); return pushCloud(); }

/** Serialize valuable RPCs with cloud writes; never overwrite their returned save with an old draft. */
export async function withServerHero<T>(action: (id: string) => Promise<T>): Promise<T> {
  if (serverOperation) throw new Error("Another reward request is still pending.");
  const id = state.heroId;
  if (!id || !state.hero || !state.userId) throw new Error("Select a character first.");
  serverOperation = true;
  clearTimeout(saveTimer);
  let requested = false;
  try {
    if (needsServerReload) await reloadServerHero(id);
    if (!await flushSave()) throw new Error("Your save could not be synced. Please retry before claiming rewards.");
    requested = true;
    return await action(id);
  } catch (error) {
    // A disconnected response may still represent a committed reward. Read it before another write.
    if (requested) {
      needsServerReload = true;
      try { await reloadServerHero(id); } catch { set({ cloud: "error" }); }
    }
    throw error;
  } finally { serverOperation = false; }
}

async function reloadServerHero(id: string) {
  const { data, error } = await supabase.from("heroes").select("save").eq("id", id).single();
  if (error || !data) throw new Error("Reconnect to the game server before continuing.");
  const hero = data.save as unknown as Hero;
  if (!hero?.name || !Array.isArray(hero.inventory)) throw new Error("Your save could not be read.");
  adoptServerSave(id, hero);
}

export function adoptServerSave(id: string, hero: Hero) {
  if (state.heroId !== id) throw new Error("Your active character changed. Reopen the character to see the reward.");
  clearTimeout(saveTimer);
  needsServerReload = false;
  set({ hero: normalizeHero(hero), cloud: "saved" });
}

export async function loadCharacters() {
  if (!state.userId) return;
  set({ chars: null, charsError: null });
  const { data, error } = await supabase.from("heroes").select(COLS).eq("user_id", state.userId).order("last_played", { ascending: false });
  if (error) { set({ charsError: error.message, chars: [] }); return; }
  set({ chars: (data ?? []) as unknown as CharacterRow[] });
}

export async function setUser(userId: string | null, email: string | null) {
  if (userId === state.userId && state.authReady) return;
  set({ userId, email, authReady: true, hero: null, heroId: null, chars: null, cloud: userId ? "loading" : "off" });
  if (userId) await loadCharacters();
}

export async function selectCharacter(id: string): Promise<string | null> {
  if (serverOperation) return "Wait for the current reward request to finish.";
  set({ cloud: "loading" });
  const { data, error } = await supabase.from("heroes").select("save,gender").eq("id", id).maybeSingle();
  if (error || !data) { set({ cloud: "error" }); return error?.message ?? "Character not found"; }
  const hero = data.save as unknown as Hero;
  if (hero?.name) normalizeHero(hero);
  if (!hero?.name) { set({ cloud: "error" }); return "Save data is corrupted"; }
  localStorage.setItem(LAST, id);
  needsServerReload = false;
  set({ hero, heroId: id, gender: (data.gender as Gender) ?? "male", cloud: "saved" });
  void supabase.from("heroes").update({ last_played: new Date().toISOString() }).eq("id", id);
  return null;
}

export async function createCharacter(name: string, cls: HeroClass, gender: Gender): Promise<string | null> {
  if (!state.userId) return "Not signed in";
  const hero = newHero(name, cls);
  const s = heroStats(hero);
  const { data, error } = await supabase.from("heroes").insert({
    user_id: state.userId, name, hero_class: cls, gender, level: 1, power: s.power,
    stats: { ...s, paragon: 0 } as never, save: hero as never,
  }).select("id").single();
  if (error) {
    if (error.code === "23505") return "That name is already taken";
    if (error.code === "42501") return "You can have at most 4 characters";
    if (error.code === "23514") return "Name must be 3–18 letters, numbers, spaces, - or _";
    return error.message;
  }
  await loadCharacters();
  return selectCharacter(data.id);
}

export async function deleteCharacter(id: string): Promise<string | null> {
  const { error } = await supabase.from("heroes").delete().eq("id", id);
  if (error) return error.message;
  if (localStorage.getItem(LAST) === id) localStorage.removeItem(LAST);
  await loadCharacters();
  return null;
}

export async function updateProfile(p: { bio?: string; title?: string; frame?: string; is_public?: boolean }): Promise<string | null> {
  if (!state.heroId) return "No character";
  const { error } = await supabase.from("heroes").update(p).eq("id", state.heroId);
  if (error) return error.message;
  await loadCharacters();
  return null;
}

export async function leaveCharacter() {
  if (serverOperation) return false;
  if (needsServerReload && state.heroId) await reloadServerHero(state.heroId);
  await flushSave();
  set({ hero: null, heroId: null });
  await loadCharacters();
  return true;
}

export function lastCharacterId() { return typeof window === "undefined" ? null : localStorage.getItem(LAST); }

export function setHero(h: Hero | null) {
  set({ hero: h });
  if (state.userId && h) { clearTimeout(saveTimer); saveTimer = setTimeout(pushCloud, 1500); }
}

/** Mutate the hero with a draft function (works on a deep copy). */
export function update(fn: (h: Hero) => void) {
  if (!state.hero || serverOperation || needsServerReload) return;
  const h = structuredClone(state.hero);
  fn(h);
  setHero(h);
}

export function getState() { return state; }
export const _lastSavedAt = () => lastSavedAt;

export function useGame() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => state,
  );
}

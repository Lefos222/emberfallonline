import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedActivities, returnedAstral, returnedSave } from "./services-contract";
import type { Database, Json } from "@/integrations/supabase/types";
import { activeScrolls, scrollState, type ScrollKind } from './scrolls';

type Rpc = Database["public"]["Functions"];
type RewardRpc = "claim_mail" | "claim_login" | "claim_activity" | "lucky_shot";

export async function reward<K extends RewardRpc>(name: K, args: Omit<Rpc[K]["Args"], "_hero">) {
  return withServerHero(async (id) => {
    const { data, error } = await supabase.rpc(name, { ...args, _hero: id } as Rpc[K]["Args"]);
    if (error) throw new Error(error.message);
    const save = returnedSave(data);
    if (name === "lucky_shot") returnedAstral(data);
    adoptServerSave(id, save);
    return data;
  });
}

export async function takeLuckyShot() {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const req = requestKey(localStorage, id, "lucky", () => crypto.randomUUID());
  const result = await reward("lucky_shot", { _req: req });
  const astral = returnedAstral(result);
  localStorage.removeItem(`ef-pending:${id}:lucky`);
  return astral;
}

export async function activities(id: string) {
  const { data, error } = await supabase.rpc("get_activities", { _hero: id });
  if (error) throw new Error(error.message);
  return returnedActivities(data);
}

export function rewardLines(value: unknown): string[] {
  const r = object(value);
  return Object.entries(object(r['reward'] ?? value)).flatMap(([key, v]) => {
    if (typeof v === "number") return v ? [`${key}: ${v.toLocaleString()}`] : [];
    if (typeof v === "string") return [`${key}: ${v.replaceAll("_", " ")}`];
    if (v && typeof v === "object") return rewardLines(v).map((line) => `${key} · ${line}`);
    return [];
  });
}

export type MailAttachments = Json;

export async function beginScrollBattle() {
  const state = getState();
  if (!state.heroId || !state.hero) throw new Error('Select a character first.');
  const key = `ef-scroll-battle:${state.heroId}`;
  if (localStorage.getItem(key)) throw new Error('A previous battle confirmation was interrupted. A scroll charge may already have been consumed. Acknowledge it before starting a new battle.');
  if (!Object.values(scrollState(state.hero).buffs).some(n => n > 0)) return [];
  return withServerHero(async id => {
    localStorage.setItem(key, 'pending');
    const { data, error } = await supabase.rpc('begin_battle', { _hero: id });
    if (error) throw new Error('Battle confirmation failed. A scroll charge may have been consumed; this request will not retry automatically.');
    const save = returnedSave(data);
    const active = activeScrolls(data);
    adoptServerSave(id, save);
    localStorage.removeItem(key);
    return active;
  });
}

export async function buyScroll(kind: ScrollKind) {
  const id = getState().heroId;
  if (!id) throw new Error('Select a character first.');
  const op = `scroll-buy:${kind}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async heroId => {
    const { data, error } = await supabase.rpc('buy_scroll', { _hero: heroId, _kind: kind, _req: req });
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}
export async function activateScroll(kind: ScrollKind) {
  return withServerHero(async id => {
    const hero = getState().hero;
    if (scrollState(hero).buffs[kind] > 0) throw new Error('This scroll is already active.');
    const { data, error } = await supabase.rpc('activate_scroll', { _hero: id, _kind: kind });
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data));
  });
}
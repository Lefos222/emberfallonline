import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedActivities, returnedAstral, returnedSave } from "./services-contract";
import type { Database, Json } from "@/integrations/supabase/types";

type Rpc = Database["public"]["Functions"];
type RewardRpc = "claim_mail" | "claim_login" | "claim_activity" | "lucky_shot";

export async function reward<K extends RewardRpc>(name: K, args: Omit<Rpc[K]["Args"], "_hero">) {
  return withServerHero(async (id) => {
    const { data, error } = await supabase.rpc(name, { ...args, _hero: id } as Rpc[K]["Args"]);
    if (error) throw new Error(error.message);
    const save = returnedSave(data);
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
  return Object.entries(object(r.reward ?? value)).flatMap(([key, v]) => {
    if (typeof v === "number") return v ? [`${key}: ${v.toLocaleString()}`] : [];
    if (typeof v === "string") return [`${key}: ${v.replaceAll("_", " ")}`];
    if (v && typeof v === "object") return rewardLines(v).map((line) => `${key} · ${line}`);
    return [];
  });
}

export type MailAttachments = Json;
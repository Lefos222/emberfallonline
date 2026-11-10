import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { requestKey, returnedSave } from "./services-contract";

type PremiumRpc =
  "buy_gold_pack" | "buy_diamond_item" | "activate_vip" | "claim_vip_daily" | "skip_blitz";

async function premiumCall(op: string, rpc: PremiumRpc, args: Record<string, unknown>) {
  // The deployed schema does not yet expose this purchase. Fail before syncing or charging.
  if (rpc === "skip_blitz") throw new Error("Finishing a blitz early is not available yet. Wait for the run to finish.");
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc(rpc, { _hero: heroId, _req: req, ...args });
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}

export const buyGoldPack = (pack: string) =>
  premiumCall(`goldpack:${pack}`, "buy_gold_pack", { _pack: pack });
export const buyDiamondItem = (item: string) =>
  premiumCall(`diamond:${item}`, "buy_diamond_item", { _item: item });
export const activateVip = (level: number) =>
  premiumCall(`vip:${level}`, "activate_vip", { _level: level });
export const claimVipDaily = () => premiumCall("vip-daily", "claim_vip_daily", {});

/** Pay the 25 Diamonds that end a running blitz on the spot. The balance is server-owned, so the
 *  charge goes through the premium RPCs rather than the client save. */
export const payBlitzSkip = () => premiumCall("blitz-skip", "skip_blitz", {});

/** Diamond services priced and debited by the server's `premium_service` RPC. */
export const SERVICE_PRICES = { gender_card: 500, name_card: 700, shop_refresh: 50, arena_duel: 50 } as const;
export type ServiceKind = keyof typeof SERVICE_PRICES;

export async function buyService(kind: ServiceKind, value?: string) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const op = `service:${kind}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc("premium_service", { _hero: heroId, _kind: kind, _req: req, _value: value ?? undefined });
    // A database refusal (taken name, too few Diamonds) charged nothing, so a fresh key is safe;
    // a lost connection keeps the key so a retry cannot pay twice.
    if (error) { if (error.code) localStorage.removeItem(`ef-pending:${id}:${op}`); throw new Error(error.message); }
    adoptServerSave(heroId, returnedSave(data));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}

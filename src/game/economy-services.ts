import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { requestKey, returnedSave } from "./services-contract";

type PremiumRpc = "buy_gold_pack" | "buy_diamond_item" | "activate_vip" | "claim_vip_daily";

async function premiumCall(op: string, rpc: PremiumRpc, args: Record<string, unknown>) {
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

export const buyGoldPack = (pack: string) => premiumCall(`goldpack:${pack}`, "buy_gold_pack", { _pack: pack });
export const buyDiamondItem = (item: string) => premiumCall(`diamond:${item}`, "buy_diamond_item", { _item: item });
export const activateVip = (level: number) => premiumCall(`vip:${level}`, "activate_vip", { _level: level });
export const claimVipDaily = () => premiumCall("vip-daily", "claim_vip_daily", {});

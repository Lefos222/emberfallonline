import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";

export interface Listing {
  id: string; seller_hero: string; seller_name: string; resource: string;
  quantity: number; price: number; status: string; created_at: string;
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("auction_listings")
    .select("id, seller_hero, seller_name, resource, quantity, price, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

async function auctionCall(op: string, rpc: "auction_list" | "auction_buy" | "auction_cancel", args: Record<string, unknown>) {
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

export const listResource = (resource: string, qty: number, price: number) =>
  auctionCall(`auction-list:${resource}`, "auction_list", { _resource: resource, _qty: qty, _price: price });
export const buyListing = (listing: string) => auctionCall(`auction-buy:${listing}`, "auction_buy", { _listing: listing });
export const cancelListing = (listing: string) => auctionCall(`auction-cancel:${listing}`, "auction_cancel", { _listing: listing });

export function resourceLabel(key: string): string {
  const parts = key.split(":");
  return parts.length === 3 ? parts[0] : key;
}
export { object };

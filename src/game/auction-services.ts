import { supabase } from "@/integrations/supabase/client";
import type { Item } from "./data";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";

/** A listing is a stack of gathered supplies, a stack of gems, or one finished piece of equipment. */
export interface Listing {
  id: string; seller_hero: string; seller_name: string; resource: string;
  quantity: number; price: number; status: string; created_at: string;
  kind: string; payload: Item | null;
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("auction_listings")
    .select("id, seller_hero, seller_name, resource, quantity, price, status, created_at, kind, payload")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

async function auctionCall(op: string, rpc: "auction_list" | "auction_list_item" | "auction_list_gem" | "auction_buy" | "auction_cancel", args: Record<string, unknown>) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc(rpc, { _hero: heroId, _req: req, ...args } as never);
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}

export const listResource = (resource: string, qty: number, price: number) =>
  auctionCall(`auction-list:${resource}`, "auction_list", { _resource: resource, _qty: qty, _price: price });
/** List a bagged piece of equipment whole — it keeps its stats, enhancement and socketed gems. */
export const listItem = (item: Item, price: number) =>
  auctionCall(`auction-list-item:${item.id}`, "auction_list_item", { _item: item, _price: price });
/** List a stack of gems. */
export const listGem = (gem: string, qty: number, price: number) =>
  auctionCall(`auction-list-gem:${gem}`, "auction_list_gem", { _gem: gem, _qty: qty, _price: price });
export const buyListing = (listing: string) => auctionCall(`auction-buy:${listing}`, "auction_buy", { _listing: listing });
export const cancelListing = (listing: string) => auctionCall(`auction-cancel:${listing}`, "auction_cancel", { _listing: listing });

export function resourceLabel(key: string): string {
  const parts = key.split(":");
  return parts.length === 3 ? parts[0] : key;
}
export { object };

import { useEffect, useState } from "react";
import { Clock, Gavel, Store, Trash2 } from "lucide-react";
import { AuctionBoard } from "./AuctionHouse";
import { buyCatalogueItem, catalogueHour, cataloguePrice, catalogueRefreshAt, catalogueStock } from "./catalogue";
import { invCap, RARITIES, type Hero } from "./data";
import { scaledGold } from "./gold";
import { POTIONS, addPotion, potionHeld, type PotionId } from "./potions";
import { POTION_PER_DAY, potionUsesLeft } from "./stamina";
import { update, useGame } from "./store";
import { GameTabs, Gold, ItemCard, Panel, fmt } from "./ui";
import { GearIcon } from "./GearIcon";
import { MatIcon } from "./MatIcon";

type Tab = "catalogue" | "shop" | "auction";

/** Goods sold for gold in the Auction House shop. */
export const SHOP_STOCK: { id: "stamina" | "strength" | "enchantStone"; name: string; note: string; price: number }[] = [
  { id: "stamina", name: "Stamina Potion", note: `+50 stamina · ${POTION_PER_DAY} a day`, price: POTIONS.stamina.shop },
  { id: "strength", name: "Elixir of Strength", note: "+20% physical attack for 30 minutes", price: POTIONS.strength.shop },
  { id: "enchantStone", name: "Enchantment Stones ×2", note: "Safer gear enhancing at the Forge", price: 22000 },
];

/** Gold one shop good costs for this hero. */
export const shopPrice = (id: (typeof SHOP_STOCK)[number]["id"], level = 1) =>
  scaledGold(SHOP_STOCK.find((g) => g.id === id)?.price ?? 0, level);

/** Buy a shop good. Returns an error message, or null on success. */
export function buyShopGood(h: Hero, id: (typeof SHOP_STOCK)[number]["id"]): string | null {
  const price = shopPrice(id, h.level);
  if (h.gold < price) return `Not enough gold — ${fmt(price)} needed`;
  h.gold -= price;
  if (id === "enchantStone") {
    h.mats = { ...(h.mats ?? {}), enchantStone: (h.mats?.enchantStone ?? 0) + 2 };
  } else {
    addPotion(h, id as PotionId);
  }
  return null;
}

function CatalogueTab({ hero }: { hero: Hero }) {
  const [notice, setNotice] = useState<{ ok: boolean; t: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const stock = hero.catalogue?.items ?? [];
  const item = stock.find((i) => i.id === preview);
  const left = Math.max(0, catalogueRefreshAt() - Date.now());
  const minutes = Math.ceil(left / 60000);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-lg text-xs text-muted-foreground">
          Ordinary armour and weapons, open to every player. The catalogue is deliberately modest gear at a
          steep price — useful while you are starting out, never a match for the Forge or a boss drop.
        </p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />Restocks in {minutes} min</span>
      </div>
      {notice && <p role="status" className={`mb-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>{notice.t}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stock.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted-foreground">Everything is sold — the next shipment lands on the hour.</p>}
        {stock.map((it) => {
          const price = cataloguePrice(it, hero.level);
          return (
            <article key={it.id} className={`slot rarity-${it.rarity} flex flex-col items-center gap-1 p-2 text-center`}>
              <button onClick={() => setPreview(it.id)} aria-label={`Inspect ${it.name}`}>
                <GearIcon item={it} size={52} />
              </button>
              <div className="w-full truncate text-[11px] font-bold">{it.name}</div>
              <div className="text-[10px] text-muted-foreground">{RARITIES[it.rarity].name} · iLvl {it.ilvl}</div>
              <button className="btn-gold mt-1 w-full px-1 py-1 text-[11px]" disabled={hero.gold < price || hero.inventory.length >= invCap(hero)}
                onClick={() => update((h) => { const err = buyCatalogueItem(h, it.id); setNotice(err ? { ok: false, t: err } : { ok: true, t: `Bought ${it.name} for ${fmt(price)} gold` }); })}
                title={hero.gold < price ? "Not enough gold" : "Buy"}>
                <Gold n={price} className="text-primary-foreground" />
              </button>
            </article>
          );
        })}
      </div>
      {item && (
        <div className="mt-3">
          <ItemCard item={item} actions={<button className="btn-ghost px-3 py-1 text-xs" onClick={() => setPreview(null)}>Close</button>} />
        </div>
      )}
    </div>
  );
}

function ShopTab({ hero }: { hero: Hero }) {
  const [notice, setNotice] = useState<{ ok: boolean; t: string } | null>(null);
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">Game goods for gold. Potions land straight in your pouch; the HUD pouch beside the stamina bar drinks them.</p>
      {notice && <p role="status" className={`mb-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>{notice.t}</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_STOCK.map((g) => {
          const price = shopPrice(g.id, hero.level);
          const held = g.id === "enchantStone" ? (hero.mats?.enchantStone ?? 0) : potionHeld(hero, g.id as PotionId);
          const art = g.id === "enchantStone" ? <MatIcon mat="enchantStone" size={44} /> : (
            <img src={POTIONS[g.id as PotionId].art} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
          );
          return (
            <article key={g.id} className="slot flex flex-col items-center gap-1 p-3 text-center">
              {art}
              <div className="text-sm font-bold">{g.name}</div>
              <div className="min-h-8 text-[11px] text-muted-foreground">{g.note}</div>
              <div className="text-[11px]">Held: <b>{fmt(held)}</b>{g.id === "stamina" && <span className="text-muted-foreground"> · {potionUsesLeft(hero)}/{POTION_PER_DAY} drinks left today</span>}</div>
              <button className="btn-gold mt-1 w-full py-1.5 text-sm" disabled={hero.gold < price}
                onClick={() => update((h) => { const err = buyShopGood(h, g.id); setNotice(err ? { ok: false, t: err } : { ok: true, t: `Bought ${g.name}` }); })}>
                <Gold n={price} className="text-primary-foreground" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The Royal Treasury's replacement: one building with the catalogue of cheap, overpriced gear,
 * a gold shop for potions and goods, and the player-to-player auction house.
 */
export function AuctionHousePanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("catalogue");
  // Roll (or roll forward) the catalogue on open so the hour's stock is always current.
  useEffect(() => {
    if (!hero || hero.catalogue?.hour === catalogueHour()) return;
    update((h) => { catalogueStock(h); });
  }, [hero?.catalogue?.hour]);
  if (!hero) return null;
  return (
    <Panel title="Auction House" subtitle="Catalogue · Shop · Player auctions" art="auction" onClose={onClose} wide>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-display text-gold">Auction House</span>
        <span className="flex items-center gap-3">
          <Gold n={hero.gold} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><img src={POTIONS.stamina.art} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />{potionHeld(hero, "stamina")}</span>
        </span>
      </div>
      <GameTabs label="Auction House sections" value={tab} onChange={setTab} tabs={[
        { id: "catalogue", name: "Catalogue" },
        { id: "shop", name: "Shop" },
        { id: "auction", name: "Auction" },
      ]} />
      {tab === "catalogue" && <CatalogueTab hero={hero} />}
      {tab === "shop" && <ShopTab hero={hero} />}
      {tab === "auction" && <AuctionBoard />}
      <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <Store className="h-3.5 w-3.5" />The catalogue restocks every hour.
        <Gavel className="h-3.5 w-3.5" />The Auction tab is where players trade with each other.
        <Trash2 className="h-3.5 w-3.5" />Selling gear works from the Auction tab, straight from your bag.
      </p>
    </Panel>
  );
}

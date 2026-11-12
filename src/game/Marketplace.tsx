import { itemName , t} from "./i18n";
import { useEffect, useState } from "react";
import { Gavel, Store, Trash2 } from "lucide-react";
import conquestKeyArt from "@/assets/conquest-key.png";
import vulcanArt from "@/assets/vulcan-card.jpg";
import { Clock } from "./PaintedIcons";
import { AuctionBoard } from "./AuctionHouse";
import { CATALOGUE_DISCOUNT, buyCatalogueItem, catalogueHour, cataloguePrice, catalogueRefreshAt, catalogueStock, restockCatalogue } from "./catalogue";
import { DiamondService } from "./DiamondService";
import { BlackMarketTab } from "./Emporium";
import { CONQUEST_KEY_GOLD, addConquestKey, conquestKeyActive, conquestKeys } from "./conquest";
import { buyVulcanCard, vulcanCardPrice, vulcanCards } from "./vulcan";
import { invCap, RARITIES, type Hero } from "./data";
import { scaledGold } from "./gold";
import { POTIONS, addPotion, potionHeld, type PotionId } from "./potions";
import { POTION_PER_DAY, potionUsesLeft } from "./stamina";
import { update, useGame } from "./store";
import { GameTabs, Gold, ItemCard, Panel, fmt } from "./ui";
import { GearIcon } from "./GearIcon";
import { MatIcon, StoneIcon } from "./MatIcon";
import { ScrollGoods } from "./ScrollShop";
import { STONE_LEVELS, addStones, clampStone, stoneBonus, stoneCount, stonePrice } from "./enchant";
import { FATE_STONE_PRICE, FATE_SUCCESS_BONUS, addFateStones, fateStoneCost, fateStoneCount } from "./fate";
import { FarmShopTab } from "./Farm";

type Tab = "catalogue" | "shop" | "farm" | "auction" | "black";

/**
 * The Auction House undercuts every other stall: its shop goods sell 73% cheaper than the old
 * stalls (the previous 70% plus a further 10% off every price).
 */
export const SHOP_DISCOUNT = 0.73;
/** Apply the shop's permanent discount to a gold price. */
const cutPrice = (gold: number) => Math.max(1, Math.round(gold * (1 - SHOP_DISCOUNT)));

/** Potions sold for gold in the Auction House shop. */
export const SHOP_STOCK: { id: PotionId; name: string; note: string; price: number }[] = [
  { id: "stamina", name: "Stamina Potion", note: `+50 stamina · ${POTION_PER_DAY} a day`, price: POTIONS.stamina.shop },
  { id: "strength", name: "Elixir of Strength", note: "+20% physical attack for 30 minutes", price: POTIONS.strength.shop },
  { id: "warding", name: "Elixir of Warding", note: "+25% physical & magic defence for 30 minutes", price: POTIONS.warding.shop },
  { id: "fortune", name: "Draught of Fortune", note: "+8% crit chance · +15% crit damage for 30 minutes", price: POTIONS.fortune.shop },
  { id: "sorcery", name: "Elixir of Sorcery", note: "+20% magic attack for 30 minutes", price: POTIONS.sorcery.shop },
];

/** Gold one shop good costs for this hero. */
export const shopPrice = (id: PotionId, level = 1) => cutPrice(scaledGold(POTIONS[id].shop, level));

/** Buy a shop good. Returns an error message, or null on success. */
export function buyShopGood(h: Hero, id: PotionId): string | null {
  const price = shopPrice(id, h.level);
  if (h.gold < price) return `Not enough gold — ${fmt(price)} needed`;
  h.gold -= price;
  addPotion(h, id);
  return null;
}

/** Gold one Conquest Key costs in the shop, after the house discount. */
export const conquestKeyShopPrice = (level = 1) => cutPrice(scaledGold(CONQUEST_KEY_GOLD, level));

/** Buy one Conquest Key into the pack. Buying never spends it: the player chooses inside the
 *  Conquest Gate whether to light it for the day (see activateConquestKey). */
export function buyConquestKey(h: Hero): string | null {
  const price = conquestKeyShopPrice(h.level);
  if (h.gold < price) return `Not enough gold — ${fmt(price)} needed`;
  h.gold -= price;
  addConquestKey(h);
  return null;
}

/** Gold one Fate Stone costs in the shop, after the house discount. */
export const fateStoneShopPrice = (level = 1) => cutPrice(scaledGold(FATE_STONE_PRICE, level));

/** Buy one Fate Stone for the Forge's refinement. */
export function buyFateStone(h: Hero): string | null {
  const price = fateStoneShopPrice(h.level);
  if (h.gold < price) return `Not enough gold — ${fmt(price)} needed`;
  h.gold -= price;
  addFateStones(h, 1);
  return null;
}

/** Gold one enchantment stone of a grade costs in the shop, after the house discount. */
export const stoneShopPrice = (stone: number, level = 1) => cutPrice(stonePrice(stone, level));

/** Buy one enchantment stone of a grade. Grade 1 is the stone every other source pays out. */
export function buyEnchantStone(h: Hero, stone: number): string | null {
  const grade = clampStone(stone);
  const price = stoneShopPrice(grade, h.level);
  if (h.gold < price) return `Not enough gold — ${fmt(price)} needed`;
  h.gold -= price;
  addStones(h, grade, 1);
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
           {t("Ordinary armour and weapons, open to every player — every piece")} {Math.round(CATALOGUE_DISCOUNT * 100)}{t("% off. The catalogue is deliberately modest gear — useful while you are starting out, never a match for the Forge or a boss drop.")} </p>
        <DiamondService kind="shop_refresh" label="Restock now" onDone={() => update((h) => restockCatalogue(h))} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{t("Restocks in")} {minutes}  {t("min")}</span>
      </div>
      {notice && <p role="status" className={`mb-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>{notice.t}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stock.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted-foreground">{t("Everything is sold — the next shipment lands on the hour.")}</p>}
        {stock.map((it) => {
          const price = cataloguePrice(it, hero.level);
          return (
            <article key={it.id} className={`slot rarity-${it.rarity} flex flex-col items-center gap-1 p-2 text-center`}>
              <button onClick={() => setPreview(it.id)} aria-label={`Inspect ${itemName(it.name)}`}>
                <GearIcon item={it} size={52} />
              </button>
              <div className="w-full truncate text-[11px] font-bold">{itemName(it.name)}</div>
              <div className="text-[10px] text-muted-foreground">{RARITIES[it.rarity].name}  {t("· iLvl")} {it.ilvl}</div>
              <button className="btn-gold mt-1 w-full px-1 py-1 text-[11px]" disabled={hero.gold < price || hero.inventory.length >= invCap(hero)}
                onClick={() => update((h) => { const err = buyCatalogueItem(h, it.id); setNotice(err ? { ok: false, t: err } : { ok: true, t: `Bought ${itemName(it.name)} for ${fmt(price)} gold` }); })}
                title={hero.gold < price ? "Not enough gold" : "Buy"}>
                <Gold n={price} className="text-primary-foreground" />
              </button>
            </article>
          );
        })}
      </div>
      {item && (
        <div className="mt-3">
          <ItemCard item={item} actions={<button className="btn-ghost px-3 py-1 text-xs" onClick={() => setPreview(null)}>{t("Close")}</button>} />
        </div>
      )}
    </div>
  );
}

function ShopTab({ hero }: { hero: Hero }) {
  const [notice, setNotice] = useState<{ ok: boolean; t: string } | null>(null);
  const say = (err: string | null, good: string) => setNotice(err ? { ok: false, t: err } : { ok: true, t: `Bought ${good}` });
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
         {t("Game goods for gold, every one of them")} {Math.round(SHOP_DISCOUNT * 100)}{t("% under the old stalls. Potions land straight in your pouch; the HUD pouch beside the stamina bar drinks them. (Battle Scrolls are priced by the game server and are the one exception.)")} </p>
      {notice && <p role="status" className={`mb-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>{notice.t}</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_STOCK.map((g) => {
          const price = shopPrice(g.id, hero.level);
          const held = potionHeld(hero, g.id);
          return (
            <article key={g.id} className="slot flex flex-col items-center gap-1 p-3 text-center">
              <img src={POTIONS[g.id].art} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
              <div className="text-sm font-bold">{g.name}</div>
              <div className="min-h-8 text-[11px] text-muted-foreground">{g.note}</div>
              <div className="text-[11px]">{t("Held:")} <b>{fmt(held)}</b>{g.id === "stamina" && <span className="text-muted-foreground"> · {potionUsesLeft(hero)}/{POTION_PER_DAY}  {t("drinks left today")}</span>}</div>
              <button className="btn-gold mt-1 w-full py-1.5 text-sm" disabled={hero.gold < price}
                onClick={() => update((h) => { say(buyShopGood(h, g.id), g.name); })}>
                <Gold n={price} className="text-primary-foreground" />
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-5 mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <span className="font-display text-sm text-gold">{t("Gate goods · used inside the gate")}</span>
        <span className="text-xs text-muted-foreground">{t("Buy here · decide at the gate")}</span>
      </div>

      {/* The Conquest Key: bought here, lit only when the player chooses to inside the gate. */}
      <article className={`slot flex flex-wrap items-center gap-3 p-3 sm:max-w-md ${conquestKeyActive(hero) ? "border-gold/60" : ""}`}>
        <img src={conquestKeyArt} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 object-contain" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{t("Conquest Key")}</div>
          <div className="text-[11px] text-muted-foreground">
            {conquestKeyActive(hero)
              ? t("Lit today — double gold and tokens until Greek midnight")
              : t("Doubles every Conquest Gate reward for a day. Keep it in your pack until the gate asks.")}
          </div>
          <div className="text-[11px]">{t("In your pack:")} <b>{fmt(conquestKeys(hero))}</b></div>
        </div>
        {(() => {
          const price = conquestKeyShopPrice(hero.level);
          return (
            <button className="btn-gold px-3 py-1.5 text-sm" disabled={hero.gold < price}
              aria-label={t("Buy a Conquest Key")}
              title={hero.gold < price ? "Not enough gold" : "Buy a Conquest Key"}
              onClick={() => update((h) => { say(buyConquestKey(h), "a Conquest Key"); })}>
              <Gold n={price} className="text-primary-foreground" />
            </button>
          );
        })()}
      </article>

      {/* The Vulcan Card: 80,000 gold, one extra Spire run on the day it is burned. */}
      <article className="slot mt-2 flex flex-wrap items-center gap-3 p-3 sm:max-w-md">
        <img src={vulcanArt} alt="" aria-hidden="true" className="h-16 w-12 shrink-0 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{t("Vulcan Card")}</div>
          <div className="text-[11px] text-muted-foreground">
            {t("Burns for one more Spire run on the day you spend it.")}
          </div>
          <div className="text-[11px]">{t("In your pack:")} <b>{fmt(vulcanCards(hero))}</b></div>
        </div>
        {(() => {
          const price = vulcanCardPrice(hero.level);
          return (
            <button className="btn-gold px-3 py-1.5 text-sm" disabled={hero.gold < price}
              aria-label={t("Buy a Vulcan Card")}
              title={hero.gold < price ? "Not enough gold" : "Buy a Vulcan Card"}
              onClick={() => update((h) => { say(buyVulcanCard(h), "a Vulcan Card"); })}>
              <Gold n={price} className="text-primary-foreground" />
            </button>
          );
        })()}
      </article>

      <div className="mt-5 mb-2 font-display text-sm text-gold">{t("Enchantment Stones · nine grades")}</div>
      <p className="mb-2 text-xs text-muted-foreground">
         {t("Stones taken to the Forge enchant gear instead of gold — each grade adds 10% success. Two stones of one grade plus gold forge the next grade up at the Forge.")} </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {Array.from({ length: STONE_LEVELS }, (_, i) => i + 1).map((grade) => {
          const price = stoneShopPrice(grade, hero.level);
          const held = stoneCount(hero, grade);
          return (
            <article key={grade} className="slot flex flex-col items-center gap-1 p-2 text-center">
              <StoneIcon level={grade} size={34} />
              <div className="text-[11px] font-bold">{t("Lv")} {grade}</div>
              <div className="text-[10px] text-muted-foreground">+{stoneBonus(grade)}% · ×{fmt(held)}</div>
              <button className="btn-gold mt-1 w-full px-1 py-1 text-[11px]" disabled={hero.gold < price}
                aria-label={`Buy a Lv ${grade} stone`}
                title={hero.gold < price ? "Not enough gold" : `Buy a Lv ${grade} stone`}
                onClick={() => update((h) => { say(buyEnchantStone(h, grade), `Lv ${grade} Enchantment Stone`); })}>
                <Gold n={price} className="text-primary-foreground" />
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-5 mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <span className="font-display text-sm text-gold">{t("Fate Stones · refinement")}</span>
        <span className="text-xs text-muted-foreground">{t("Held ×")}{fmt(fateStoneCount(hero))}</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
         {t("One Fate Stone adds a flat +")}{Math.round(FATE_SUCCESS_BONUS * 100)}{t("% to a Forge refinement and is spent whether the metal holds or not — one stone per step, more as the gear climbs.")} </p>
      {(() => {
        const price = fateStoneShopPrice(hero.level);
        return (
          <article className="slot flex items-center gap-3 p-3 sm:max-w-sm">
            <MatIcon mat="fateStone" size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{t("Fate Stone")}</div>
              <div className="text-[11px] text-muted-foreground">{t("Refines gear at the Forge · held ×")}{fmt(fateStoneCount(hero))}</div>
            </div>
            <button className="btn-gold px-3 py-1.5 text-sm" disabled={hero.gold < price}
              aria-label={t("Buy a Fate Stone")}
              title={hero.gold < price ? "Not enough gold" : "Buy a Fate Stone"}
              onClick={() => update((h) => { say(buyFateStone(h), "a Fate Stone"); })}>
              <Gold n={price} className="text-primary-foreground" />
            </button>
          </article>
        );
      })()}

      <div className="mt-5 mb-1 font-display text-sm text-gold">{t("Battle Scrolls")}</div>
      <ScrollGoods />
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
    <Panel title={t("Auction House")} subtitle={t("Catalogue · Shop · Farm · Player auctions")} art="auction" onClose={onClose} wide>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-display text-gold">{t("Auction House")}</span>
        <span className="flex items-center gap-3">
          <Gold n={hero.gold} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><img src={POTIONS.stamina.art} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />{potionHeld(hero, "stamina")}</span>
        </span>
      </div>
      <GameTabs label={t("Auction House sections")} value={tab} onChange={setTab} tabs={[
        { id: "catalogue", name: "Catalogue" },
        { id: "black", name: "Black Market" },
        { id: "shop", name: "Shop" },
        { id: "farm", name: "Farm" },
        { id: "auction", name: "Auction" },
      ]} />
      {tab === "catalogue" && <CatalogueTab hero={hero} />}
      {tab === "black" && <BlackMarketTab />}
      {tab === "shop" && <ShopTab hero={hero} />}
      {tab === "farm" && <FarmShopTab hero={hero} />}
      {tab === "auction" && <AuctionBoard />}
      <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <Store className="h-3.5 w-3.5" />{t("The catalogue restocks every hour.")} <Gavel className="h-3.5 w-3.5" />{t("The Auction tab is where players trade with each other.")} <Trash2 className="h-3.5 w-3.5" />{t("Selling gear works from the Auction tab, straight from your bag.")} </p>
    </Panel>
  );
}

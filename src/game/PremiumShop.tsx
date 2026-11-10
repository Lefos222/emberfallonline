import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArtIcon } from "./ArtIcon";
import { DiamondService } from "./DiamondService";
import { getState, selectCharacter, loadCharacters } from "./store";
import genderCard from "@/assets/card-gender.webp";
import nameCard from "@/assets/card-name.webp";
import { GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { GemIcon, MatIcon } from "./MatIcon";
import { Diamonds, GameTabs, Gold, Panel, fmt } from "./ui";
import { useGame } from "./store";
import { chestCount } from "./chests";
import { GEMS, GEM_TIER_NAMES, GEM_TYPES, MATS } from "./crafting";
import {
  CHEST_OFFERS,
  DIAMOND_PACKS,
  GEM_TIER_PRICES,
  GOLD_PACKS,
  MATERIAL_ORDER,
  MATERIAL_PRICES,
  VIP_DAYS,
  VIP_PLANS,
  diamondPackTotal,
  materialCost,
  premiumState,
  vipDailyGold,
  vipPlanFor,
} from "./economy";
import { tName , tr} from "./i18n";
import { vipDiscountPct } from "./vip-perks";
import { VipActivities } from "./VipActivities";
import {
  buyChest,
  buyDiamondPack,
  buyGem,
  buyGoldPack,
  buyMaterial,
  buyVip,
  buyVipWithCard,
} from "./premium-shop";

const TABS = [
  { id: "diamonds", name: "Diamonds" },
  { id: "vip", name: "VIP" },
  { id: "gold", name: "Gold" },
  { id: "gems", name: "Stones" },
  { id: "materials", name: "Materials" },
  { id: "chests", name: "Chests" },
  { id: "cards", name: "Cards" },
  { id: "history", name: "History" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** A price line that shows the VIP saving when the hero has a membership. */
function DiamondPrice({
  base,
  vip,
  className = "",
}: {
  base: number;
  vip: number;
  className?: string;
}) {
  const off = vipDiscountPct(vip);
  if (!off) return <span className={className}>{fmt(base)}◆</span>;
  const price = Math.max(1, Math.ceil((base * (100 - off)) / 100));
  return (
    <span className={className}>
      <s className="mr-1 text-muted-foreground/70">{fmt(base)}◆</s>
      <span className="font-bold text-gold">{fmt(price)}◆</span>
      <span className="ml-1 text-[10px] font-bold uppercase text-gold">{tr("VIP −")}{off}%</span>
    </span>
  );
}

export function PremiumShop({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("diamonds");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  if (!hero) return null;
  const p = premiumState(hero);
  const vip = p.vip.level;
  const discount = vipDiscountPct(vip);
  const activePlan = vipPlanFor(vip);
  const dailyGold = vipDailyGold(hero);

  const run = async (
    key: string,
    action: () => Promise<string | null>,
    success: string,
    card = false,
  ) => {
    setBusy(key);
    setNotice(null);
    const error = await action();
    setBusy(null);
    if (error) setNotice({ ok: false, text: error });
    else
      setNotice({
        ok: true,
        text: card
          ? "Secure checkout opened in a new tab — Diamonds and VIP are credited automatically as soon as Stripe confirms the payment, then you return here."
          : success,
      });
  };

  return (
    <Panel
      title={tr("Premium Shop")}
      subtitle={tr("Diamonds, monthly VIP, gold, stones, materials and chests")}
      art="diamond"
      onClose={onClose}
      wide
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <GameTabs
          label={tr("Premium Shop")}
          value={tab}
          onChange={setTab}
          tabs={TABS.map((t) => ({ id: t.id, name: t.name }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          {vip > 0 && p.vip.until && (
            <span className="slot flex items-center gap-1.5 border-gold/60 px-3 py-1.5 text-xs font-bold text-gold">
              <ArtIcon name="crown" size={16} />
               {tr("VIP")} {vip}
              {activePlan ? ` · ${tName(activePlan.name)}` : ""}  {tr("· ends")}{" "}
              {new Date(p.vip.until).toLocaleDateString()}
            </span>
          )}
          <div className="slot flex items-center gap-1.5 px-3 py-1.5 font-display text-lg text-r4">
            <ArtIcon name="diamond" size={20} />
            {fmt(p.balance)}  {tr("Diamonds")} </div>
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className={`mb-3 rounded-md border px-3 py-2 text-xs ${notice.ok ? "border-r1/40 bg-r1/10" : "border-hp/50 bg-hp/10 text-hp"}`}
        >
          {notice.text}
        </p>
      )}

      {tab === "diamonds" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
             {tr("Real-money packs are paid through Stripe's secure checkout. The server verifies the payment and credits the exact pack before it appears in your wallet — closing the tab early is checked again the next time you open this shop.")} </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIAMOND_PACKS.map((pack) => {
              const total = diamondPackTotal(pack);
              const key = `diamonds:${pack.id}`;
              return (
                <article key={pack.id} className="slot flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">{tName(pack.name)}</h3>
                    {pack.tag && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                        {pack.tag}
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-2xl font-bold text-r4">
                    <ArtIcon name="diamond" size={20} />
                    {fmt(total)}
                  </p>
                  {pack.bonus > 0 ? (
                    <p className="text-xs text-r1">
                      {fmt(pack.diamonds)} + {fmt(pack.bonus)}  {tr("bonus Diamonds")} </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{tr("One-time Diamond pack")}</p>
                  )}
                  <p className="mt-auto font-display text-lg text-gold">{money(pack.priceCents)}</p>
                  <Button
                    disabled={busy !== null}
                    onClick={() =>
                      void run(key, () => buyDiamondPack(pack.id), "Diamonds credited.", true)
                    }
                  >
                    {busy === key ? tr("Opening checkout…") : tr("Buy with card")}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {tab === "vip" && (
        <div>
          {vip > 0 && p.vip.until && (
            <div className="slot mb-4 flex flex-wrap items-center justify-between gap-3 border-gold/60 p-4">
              <div>
                <p className="font-display text-lg text-gold">
                  <ArtIcon name="crown" className="mr-1" size={22} />
                   {tr("VIP")} {vip}
                  {activePlan ? ` — ${tName(activePlan.name)}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                   {tr("Active until")} {new Date(p.vip.until).toLocaleString()}  {tr("· every purchase adds another")} {VIP_DAYS}  {tr("days")} </p>
                <p className="text-xs text-r1">
                  +{vipDiscountPct(vip)}{tr("% shop discount ·")} {fmt(dailyGold)}  {tr("gold every day · faster blitzes")} </p>
              </div>
            </div>
          )}

          <p className="mb-3 rounded-md border border-gold/40 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-bold text-gold">{tr("VIP lasts one month (")}{VIP_DAYS}  {tr("days).")}</span>  {tr("It is not a permanent unlock and never renews by itself. Members get two VIP-only daily activities, two VIP-only world events, a richer daily board, faster blitzes, more gold from every payout and a discount on every Diamond price below.")} </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VIP_PLANS.map((plan) => {
              const current = vip === plan.level;
              const cardKey = `vipcard:${plan.level}`;
              const gemKey = `vipgem:${plan.level}`;
              return (
                <article
                  key={plan.level}
                  className={`slot flex flex-col gap-2 p-4 ${current ? "ring-2 ring-gold" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">
                       {tr("VIP")} {plan.level} — {tName(plan.name)}
                    </h3>
                    <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                      {plan.days}  {tr("days")} </span>
                  </div>
                  <ul className="flex-1 list-inside list-disc text-xs text-muted-foreground">
                    {plan.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  <div className="mt-auto space-y-2">
                    <p className="flex items-center justify-between text-sm">
                      <DiamondPrice base={plan.diamonds} vip={vip} />
                      <span className="text-[11px] text-muted-foreground">
                         {tr("or")} {money(plan.priceCents)}
                      </span>
                    </p>
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={busy !== null}
                      onClick={() =>
                        void run(
                          cardKey,
                          () => buyVipWithCard(plan.level),
                          "VIP activated for 30 days.",
                          true,
                        )
                      }
                    >
                      {busy === cardKey
                        ? tr("Opening checkout…")
                        : `Pay with card · ${money(plan.priceCents)}`}
                    </Button>
                    <Button
                      className="w-full"
                      size="sm"
                      variant="outline"
                      disabled={busy !== null}
                      onClick={() =>
                        void run(gemKey, () => buyVip(plan.level), `${VIP_DAYS} days of VIP added.`)
                      }
                    >
                      {busy === gemKey ? tr("Buying…") : tr("Buy with Diamonds")}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
             {tr("VIP is a separate membership — it does not include Diamond or gold packs. Buying a higher tier while a membership is active keeps the higher tier and adds another month.")} </p>

          <VipActivities />
        </div>
      )}

      {tab === "gold" && (
        <div>
          {discount > 0 && (
            <p className="mb-2 text-xs font-semibold text-gold">
               {tr("VIP")} {vip}: {discount}{tr("% off every Diamond price in this tab.")} </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {GOLD_PACKS.map((pack) => {
              const key = `gold:${pack.id}`;
              return (
                <article key={pack.id} className="slot flex items-center justify-between gap-3 p-4">
                  <div>
                    <h3 className="font-display text-lg">{tName(pack.name)}</h3>
                    <p className="text-sm">
                      <Gold n={pack.gold} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <DiamondPrice base={pack.diamonds} vip={vip} />
                    </p>
                  </div>
                  <Button
                    disabled={busy !== null}
                    onClick={() => void run(key, () => buyGoldPack(pack.id), "Gold credited.")}
                  >
                    {busy === key ? tr("Buying…") : tr("Buy")}
                  </Button>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
             {tr("Gold is still earned from battles, quests and raids. These packs are a shortcut — they never unlock anything that cannot be earned by playing.")} </p>
        </div>
      )}

      {tab === "gems" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
             {tr("Small stones start at")} <DiamondPrice base={GEM_TIER_PRICES[0]} vip={vip} />{tr(". Only cut stones are sold — no armour.")} </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GEM_TYPES.map((type) => (
              <article key={type} className="slot flex flex-col gap-2 p-3">
                <div className="flex items-center gap-2">
                  <GemIcon type={type} size={30} />
                  <div className="min-w-0">
                    <h3 className="font-display leading-tight">{GEMS[type].name}</h3>
                    <p className="text-[11px] text-muted-foreground">{GEMS[type].note}</p>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-3 gap-1">
                  {GEM_TIER_PRICES.map((cost, i) => {
                    const key = `gem:${type}:${i + 1}`;
                    return (
                      <Button
                        key={key}
                        size="sm"
                        variant="outline"
                        disabled={busy !== null}
                        onClick={() =>
                          void run(key, () => buyGem(type, i + 1), `${GEMS[type].name} added.`)
                        }
                      >
                        {GEM_TIER_NAMES[i]}{" "}
                        {Math.max(1, Math.ceil((cost * (100 - discount)) / 100))}◆
                      </Button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
             {tr("Higher tiers are earned by cutting and fusing the lower ones at the Gem Workshop.")} </p>
        </div>
      )}

      {tab === "materials" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIAL_ORDER.map((mat) => {
              const prices = MATERIAL_PRICES[mat];
              const oneKey = `mat:${mat}:1`;
              const fiveKey = `mat:${mat}:5`;
              return (
                <article key={mat} className="slot flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-2">
                    <MatIcon mat={mat} size={28} />
                    <h3 className="font-display leading-tight">{MATS[mat].name}</h3>
                  </div>
                  <p className="flex-1 text-[11px] text-muted-foreground">{MATS[mat].desc}</p>
                  <div className="mt-auto grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy !== null}
                      onClick={() =>
                        void run(oneKey, () => buyMaterial(mat, 1), `1 ${MATS[mat].name} added.`)
                      }
                    >
                      {busy === oneKey ? "…" : `1× ${materialCost(mat, 1, vip)}◆`}
                    </Button>
                    <Button
                      size="sm"
                      disabled={busy !== null}
                      onClick={() =>
                        void run(fiveKey, () => buyMaterial(mat, 5), `5 ${MATS[mat].name} added.`)
                      }
                    >
                      {busy === fiveKey ? "…" : `5× ${materialCost(mat, 5, vip)}◆`}
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">
                     {tr("Base: 1×")} {prices.one}◆ · 5× {prices.five}◆
                    {discount > 0 ? ` · VIP −${discount}%` : ""}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
             {tr("Materials are the same ones battles, raids and gathering award. Missing a few Armour Fragments for a piece? The Forge's recipe rows now sell exactly the shortfall.")} </p>
        </div>
      )}

      {tab === "chests" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHEST_OFFERS.map((offer) => {
              const key = `chest:${offer.kind}`;
              return (
                <article
                  key={offer.kind}
                  className="slot flex flex-col items-center gap-2 p-4 text-center"
                >
                  {offer.kind === "gold" ? <GoldChestIcon size={64} /> : <GemChestIcon size={64} />}
                  <h3 className="font-display text-lg">{tName(offer.name)}</h3>
                  <p className="text-xs text-muted-foreground">{offer.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                     {tr("In your vault:")}{" "}
                    <span className="font-bold text-foreground">
                      {chestCount(hero, offer.kind)}
                    </span>
                  </p>
                  <p className="text-[11px]">
                    <DiamondPrice base={offer.diamonds} vip={vip} />
                  </p>
                  <Button
                    disabled={busy !== null}
                    onClick={() =>
                      void run(key, () => buyChest(offer.kind), "Chest added to your vault.")
                    }
                  >
                    {busy === key ? tr("Buying…") : tr("Buy")}
                  </Button>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
             {tr("Chests also drop from won battles and the free reward chest, so this is never the only way to get one.")} </p>
        </div>
      )}

      {tab === "cards" && <IdentityCards />}

      {tab === "history" && (
        <div className="max-h-96 overflow-y-auto">
          {p.history.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">{tr("No Diamond transactions yet.")}</p>
          )}
          {[...p.history].reverse().map((entry, i) => (
            <div
              key={`${entry.at}-${i}`}
              className="flex justify-between gap-3 border-b border-border py-2 text-sm"
            >
              <span>{entry.detail.replaceAll(":", " · ").split("#")[0]}</span>
              <span className={`shrink-0 ${entry.kind === "spend" ? "text-blood" : "text-r1"}`}>
                {entry.kind === "spend" ? "-" : entry.kind === "purchase" ? "+" : ""}
                {fmt(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground">
         {tr("Every paid purchase goes through Stripe and is verified on the server; every Diamond spend is priced and debited by the server.")} <Diamonds n={p.balance} />  {tr("in your wallet.")} </p>
    </Panel>
  );
}

/** Gender swap (500 Diamonds) and name change (700 Diamonds) cards, applied by the server on purchase. */
function IdentityCards() {
  const [name, setName] = useState("");
  const reload = async () => { const id = getState().heroId; if (id) { await selectCharacter(id); void loadCharacters(); } };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="slot flex flex-col items-center gap-2 p-4 text-center">
        <img src={genderCard} alt="" className="h-40 w-auto object-contain" />
        <h3 className="font-display text-lg">{tr("Gender Swap Card")}</h3>
        <p className="text-xs text-muted-foreground">{tr("Switches your hero between male and female. Level, gear and progress stay exactly as they are.")}</p>
        <DiamondService kind="gender_card" label="Use card" onDone={reload} />
      </article>
      <article className="slot flex flex-col items-center gap-2 p-4 text-center">
        <img src={nameCard} alt="" className="h-40 w-auto object-contain" />
        <h3 className="font-display text-lg">{tr("Name Change Card")}</h3>
        <p className="text-xs text-muted-foreground">{tr("Gives your hero a new name: 3-16 letters, numbers, spaces, _ or -.")}</p>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} placeholder={tr("New name")} aria-label={tr("New name")} className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm" />
        <DiamondService kind="name_card" label="Use card" value={name.trim()} disabled={name.trim().length < 3} onDone={reload} />
      </article>
    </div>
  );
}

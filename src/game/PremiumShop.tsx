import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArtIcon } from "./ArtIcon";
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
  PREMIUM_TEST_MODE,
  VIP_PLANS,
  diamondPackTotal,
  premiumState,
  vipDailyGold,
  vipPlanFor,
  vipXpBonusPct,
} from "./economy";
import {
  buyChest,
  buyDiamondPack,
  buyGem,
  buyGoldPack,
  buyMaterial,
  buyVip,
  claimVipDaily,
} from "./premium-shop";

const TABS = [
  { id: "diamonds", name: "Diamonds" },
  { id: "gold", name: "Gold" },
  { id: "gems", name: "Stones" },
  { id: "materials", name: "Materials" },
  { id: "chests", name: "Chests" },
  { id: "vip", name: "VIP" },
  { id: "history", name: "History" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function PremiumShop({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<Tab>("diamonds");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  if (!hero) return null;
  const p = premiumState(hero);
  const activePlan = vipPlanFor(p.vip.level);
  const activeXp = vipXpBonusPct(p.vip.level);
  const activeGold = vipDailyGold(hero);

  const run = (okText: string, action: () => string | null) => {
    const error = action();
    setNotice(error ? { ok: false, text: error } : { ok: true, text: okText });
  };
  const canBuy = (cost: number) => PREMIUM_TEST_MODE && p.balance >= cost;

  return (
    <Panel
      title="Premium Shop"
      subtitle="Diamonds, gold, stones, materials, chests and VIP"
      art="diamond"
      onClose={onClose}
      wide
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <GameTabs
          label="Premium Shop"
          value={tab}
          onChange={(id) => {
            setTab(id);
            setNotice(null);
          }}
          tabs={TABS.map((t) => ({ id: t.id, name: t.name }))}
        />
        <div className="slot flex items-center gap-1.5 px-3 py-1.5 font-display text-lg text-r4">
          <ArtIcon name="diamond" size={20} />
          {fmt(p.balance)} Diamonds
        </div>
      </div>

      {PREMIUM_TEST_MODE ? (
        <p
          role="status"
          className="mb-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold"
        >
          Test mode — no payment provider is connected. Diamond packs are granted instantly so you
          can test the full shop; nothing is charged.
        </p>
      ) : (
        <p
          role="status"
          className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
        >
          Checkout is not connected yet. The catalogue is visible, but purchases stay locked until
          payments and server verification are live.
        </p>
      )}
      {notice && (
        <p role="status" className={`mb-3 text-sm ${notice.ok ? "text-r1" : "text-blood"}`}>
          {notice.text}
        </p>
      )}

      {tab === "diamonds" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIAMOND_PACKS.map((pack) => {
              const total = diamondPackTotal(pack);
              return (
                <article key={pack.id} className="slot flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">{pack.name}</h3>
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
                      {fmt(pack.diamonds)} + {fmt(pack.bonus)} bonus Diamonds
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">One-time Diamond pack</p>
                  )}
                  <p className="mt-auto font-display text-lg text-gold">{money(pack.priceCents)}</p>
                  <Button
                    disabled={!PREMIUM_TEST_MODE}
                    onClick={() =>
                      run(`${fmt(total)} Diamonds added to your test wallet.`, () =>
                        buyDiamondPack(pack.id),
                      )
                    }
                  >
                    {PREMIUM_TEST_MODE ? "Test purchase" : "Coming soon"}
                  </Button>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every pack is a one-time purchase. When checkout is connected, the same button will open
            the payment provider and the server will credit the confirmed amount.
          </p>
        </div>
      )}

      {tab === "gold" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GOLD_PACKS.map((pack) => (
              <article key={pack.id} className="slot flex items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-display text-lg">{pack.name}</h3>
                  <p className="text-sm">
                    <Gold n={pack.gold} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Diamonds n={pack.diamonds} />
                  </p>
                </div>
                <Button
                  disabled={!canBuy(pack.diamonds)}
                  title={
                    !PREMIUM_TEST_MODE
                      ? "Payments not connected yet"
                      : p.balance < pack.diamonds
                        ? "Not enough Diamonds"
                        : undefined
                  }
                  onClick={() =>
                    run(`${pack.name}: ${fmt(pack.gold)} gold added.`, () => buyGoldPack(pack.id))
                  }
                >
                  {!PREMIUM_TEST_MODE
                    ? "Coming soon"
                    : p.balance < pack.diamonds
                      ? "Not enough"
                      : "Buy"}
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Gold is still earned from battles, quests and raids. These packs are a shortcut for
            players who want one — they never unlock anything that cannot be earned by playing.
          </p>
        </div>
      )}

      {tab === "gems" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Small stones start at <span className="text-r4">5 Diamonds</span>. Only cut stones are
            sold — no armour.
          </p>
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
                  {GEM_TIER_PRICES.map((cost, i) => (
                    <Button
                      key={cost}
                      size="sm"
                      variant="ghost"
                      className="flex-col gap-0 px-1 py-1 text-[11px]"
                      disabled={!canBuy(cost)}
                      title={`${GEM_TIER_NAMES[i]} ${GEMS[type].name} — ${cost} Diamonds`}
                      onClick={() =>
                        run(
                          `${GEM_TIER_NAMES[i]} ${GEMS[type].name} added to your gem pouch.`,
                          () => buyGem(type, i + 1),
                        )
                      }
                    >
                      <span className="font-bold">{["I", "II", "III"][i]}</span>
                      <span className="text-r4">{cost}◆</span>
                    </Button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Higher tiers are earned by cutting and fusing the lower ones at the Gem Workshop.
          </p>
        </div>
      )}

      {tab === "materials" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIAL_ORDER.map((mat) => {
              const prices = MATERIAL_PRICES[mat];
              return (
                <article key={mat} className="slot flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-2">
                    <MatIcon mat={mat} size={28} />
                    <h3 className="font-display leading-tight">{MATS[mat].name}</h3>
                  </div>
                  <p className="flex-1 text-[11px] text-muted-foreground">{MATS[mat].desc}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      disabled={!canBuy(prices.one)}
                      onClick={() => run(`1× ${MATS[mat].name} added.`, () => buyMaterial(mat, 1))}
                    >
                      <span>1×</span>
                      <Diamonds n={prices.one} />
                    </Button>
                    <Button
                      size="sm"
                      disabled={!canBuy(prices.five)}
                      onClick={() => run(`5× ${MATS[mat].name} added.`, () => buyMaterial(mat, 5))}
                    >
                      <span>5×</span>
                      <Diamonds n={prices.five} />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Materials are the same ones battles, raids and gathering award. Buying them shortens a
            grind; it does not sell finished armour.
          </p>
        </div>
      )}

      {tab === "chests" && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHEST_OFFERS.map((offer) => (
              <article
                key={offer.kind}
                className="slot flex flex-col items-center gap-2 p-4 text-center"
              >
                {offer.kind === "gold" ? <GoldChestIcon size={64} /> : <GemChestIcon size={64} />}
                <h3 className="font-display text-lg">{offer.name}</h3>
                <p className="text-xs text-muted-foreground">{offer.description}</p>
                <p className="text-[11px] text-muted-foreground">
                  In your vault:{" "}
                  <span className="font-bold text-foreground">{chestCount(hero, offer.kind)}</span>
                </p>
                <Button
                  disabled={!canBuy(offer.diamonds)}
                  onClick={() =>
                    run(`${offer.name} sent to your Armory vault.`, () => buyChest(offer.kind))
                  }
                >
                  Buy · <Diamonds n={offer.diamonds} />
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Chests also drop from won battles and the free reward chest, so this is never the only
            way to get one.
          </p>
        </div>
      )}

      {tab === "vip" && (
        <div>
          {p.vip.level > 0 && p.vip.until && (
            <div className="slot mb-4 flex flex-wrap items-center justify-between gap-3 border-gold/60 p-4">
              <div>
                <p className="font-display text-lg text-gold">
                  <ArtIcon name="crown" className="mr-1" size={22} />
                  VIP {p.vip.level}
                  {activePlan ? ` — ${activePlan.name}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active until {new Date(p.vip.until).toLocaleString()}
                </p>
                <p className="text-xs text-r1">
                  +{activeXp}% battle XP · {fmt(activeGold)} gold every day
                </p>
              </div>
              <Button
                disabled={!PREMIUM_TEST_MODE || p.claimedToday}
                onClick={() => run(`Claimed ${fmt(activeGold)} VIP gold.`, claimVipDaily)}
              >
                {p.claimedToday ? "Claimed today" : `Claim ${fmt(activeGold)} gold`}
              </Button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VIP_PLANS.map((plan) => {
              const current = p.vip.level === plan.level;
              return (
                <article
                  key={plan.level}
                  className={`slot flex flex-col gap-2 p-4 ${current ? "ring-2 ring-gold" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">
                      VIP {plan.level} — {plan.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                      {plan.days} days
                    </span>
                  </div>
                  <ul className="flex-1 list-inside list-disc text-xs text-muted-foreground">
                    {plan.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="flex items-center justify-between text-sm">
                      <Diamonds n={plan.diamonds} />
                      <span className="text-[11px] text-muted-foreground">
                        ≈{Math.ceil(plan.diamonds / plan.days)}◆ / day
                      </span>
                    </p>
                    <Button
                      className="mt-2 w-full"
                      size="sm"
                      disabled={!canBuy(plan.diamonds)}
                      onClick={() =>
                        run(
                          `VIP ${plan.level} active until ${new Date(Date.now() + plan.days * 86_400_000).toLocaleDateString()}.`,
                          () => buyVip(plan.level),
                        )
                      }
                    >
                      {!PREMIUM_TEST_MODE
                        ? "Coming soon"
                        : p.balance < plan.diamonds
                          ? "Not enough Diamonds"
                          : current
                            ? "Extend membership"
                            : "Buy membership"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            VIP is a separate membership — it does not include Diamonds or gold packs. It never
            renews automatically; buying again adds days and keeps your highest tier.
          </p>
        </div>
      )}

      {tab === "history" && (
        <div className="max-h-96 overflow-y-auto">
          {p.history.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">No Diamond transactions yet.</p>
          )}
          {[...p.history].reverse().map((entry, i) => (
            <div
              key={`${entry.at}-${i}`}
              className="flex justify-between gap-3 border-b border-border py-2 text-sm"
            >
              <span>{entry.detail.replaceAll(":", " · ")}</span>
              <span className={`shrink-0 ${entry.kind === "spend" ? "text-blood" : "text-r1"}`}>
                {entry.kind === "spend" ? "-" : "+"}
                {fmt(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

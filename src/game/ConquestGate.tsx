import { mountBlitzPct } from "./mounts";
import { tr } from "./i18n";
import { useState } from "react";
import { Gem, Sparkles, Zap } from "lucide-react";
import { Swords } from "./PaintedIcons";
import { Button } from "@/components/ui/button";
import { ConquestCoin, GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { GemIcon, MatIcon, StoneIcon } from "./MatIcon";
import { stoneName } from "./enchant";
import { GEMS, GEM_MAX_TIER, GEM_STAT_LABEL, GEM_TYPES, MATS, gemKey, gemValue, type GemType } from "./crafting";
import { BlitzRunCard } from "./BlitzRun";
import { buyConquestKey, conquestKeyShopPrice } from "./Marketplace";
import {
  BLITZ_PER_DAY, activateConquestKey, blitz, blitzBlocker, blitzRewards, blitzesLeft, buyConquestGem,
  buyTokenOffer, conquestKeyActive, conquestKeys, conquestRewardMultiplier, conquestTokens, floorTokens,
  floorsCleared, gemTokenPrice, TOKEN_OFFERS,
} from "./conquest";
import conquestKeyArt from "@/assets/conquest-key.png";
import { blitzDurationMs } from "./blitz-run";
import { vipLevelOf } from "./vip-perks";
import type { Hero } from "./data";
import { update } from "./store";
import { GameTabs, Gold, fmt } from "./ui";

/**
 * The Conquest Gate's own screens, shown under the Endless Conquest floor selector: the blitz,
 * the token market and the gem stock. Everything here is paid for with Conquest Tokens — the
 * gate deals in no other coin.
 */
export function ConquestTokens({ hero }: { hero: Hero }) {
  const [tab, setTab] = useState<"blitz" | "market" | "gems">("blitz");
  const cap = floorsCleared(hero);
  const tokens = conquestTokens(hero);
  const left = blitzesLeft(hero);

  return (
    <section className="mt-4 border-t border-border pt-3">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg text-gold">{tr("The Conquest Gate")}</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="slot flex items-center gap-1.5 px-2 py-1" title={tr("Conquest Tokens — the gate's own coin")}>
            <ConquestCoin size={18} />
            <b className="font-display text-base text-gold">{fmt(tokens)}</b>
            <span className="text-muted-foreground">{tr("tokens")}</span>
          </span>
          <span className="slot px-2 py-1">{tr("Deepest")} <b className="text-gold">{cap || "—"}</b></span>
          <span className="slot px-2 py-1">{tr("Blitzes")} <b className="text-gold">{left}/{BLITZ_PER_DAY}</b></span>
          {conquestKeyActive(hero) && (
            <span className="slot border-gold/60 px-2 py-1 text-gold" title={tr("Today's Conquest Key doubles every reward the gate pays")}>
              <b>{tr("Key ×2")}</b>  {tr("today")} </span>
          )}
        </div>
      </header>

      {/* The key decision belongs to the gate, not to the shop: light a key or keep it for later. */}
      <ConquestKeyCard hero={hero} />

      <GameTabs
        label={tr("Conquest Gate")}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "blitz", name: `Blitz · ${left} left` },
          { id: "market", name: "Token Market" },
          { id: "gems", name: "Gem Stock" },
        ]}
      />

      {tab === "blitz" && <BlitzTab hero={hero} cap={cap} />}
      {tab === "market" && <MarketTab hero={hero} />}
      {tab === "gems" && <GemTab hero={hero} />}
    </section>
  );
}

/**
 * The gate's own key decision. Keys are bought for gold in the Auction House and kept in the
 * hero's pack; the player chooses here whether to light one — doubling every reward the gate pays
 * until Greek midnight — or to leave it in the pack for a deeper climb. Buying from the gate is
 * the same stall, so an empty pack can be filled in one tap.
 */
function ConquestKeyCard({ hero }: { hero: Hero }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const active = conquestKeyActive(hero);
  const keys = conquestKeys(hero);
  const price = conquestKeyShopPrice(hero.level);
  const light = () => update((h) => {
    if (conquestKeys(h) < 1) {
      const bought = buyConquestKey(h);
      if (bought) {
        setMsg({ ok: false, t: bought });
        return;
      }
    }
    const err = activateConquestKey(h);
    setMsg(err
      ? { ok: false, t: err }
      : { ok: true, t: "Conquest Key lit — every reward the gate pays is doubled until Greek midnight." });
  });

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/70 p-2.5">
      <img src={conquestKeyArt} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm text-gold">{tr("Conquest Key · your choice")}</div>
        <div className="text-[11px] text-muted-foreground">
          {active
            ? tr("Lit today: every floor, blitz and payout pays ×2 until Greek midnight.")
            : tr("Light one for ×2 rewards today, or keep it in your pack — buying a key never spends it.")}
        </div>
        <div className="text-[11px]">{tr("In your pack:")} <b>{fmt(keys)}</b></div>
      </div>
      {active ? (
        <span className="btn-ghost px-3 py-1.5 text-xs text-gold">{tr("Lit · ×2")}</span>
      ) : (
        <button className="btn-gold px-3 py-1.5 text-sm" disabled={keys < 1 && hero.gold < price}
          title={keys > 0 ? "Spend one key from your pack" : "Buy a key and light it now"}
          onClick={light}>
          {keys > 0 ? tr("Use a key · ×2 today") : <><Gold n={price} className="text-primary-foreground" />{tr(" · buy & light")}</>}
        </button>
      )}
      {msg && <p role="status" className={`w-full text-xs ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
    </div>
  );
}

/** Blitz floors already beaten: pick a depth, add today's Conquest Key if you like, then send the hero out. */
function BlitzTab({ hero, cap }: { hero: Hero; cap: number }) {
  const [target, setTarget] = useState(() => Math.max(1, cap || 1));
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const left = blitzesLeft(hero);
  const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
  const blocked = blitzBlocker(hero, usable);
  // Today's Conquest Key doubles what the run banks (see conquest.ts).
  const keyOn = conquestKeyActive(hero);
  const keyMult = conquestRewardMultiplier(hero);
  const keyPrice = conquestKeyShopPrice(hero.level);
  const preview = blocked ? null : blitzRewards(usable, keyMult);
  const runMinutes = Math.round(blitzDurationMs(usable, vipLevelOf(hero), mountBlitzPct(hero)) / 60_000);
  const jump = (n: number) => { setTarget(n); setMsg(null); };
  const perFloor = usable > 0 ? Math.max(1, Math.round((preview?.tokens ?? 0) / usable)) : 0;
  // The blitz can light today's key itself: a key already in the pack is spent, otherwise the same
  // Auction House stall is paid. Either way the player chooses here whether this run pays ×2.
  const keys = conquestKeys(hero);
  const useKey = () => update((h) => {
    if (conquestKeys(h) < 1) {
      const bought = buyConquestKey(h);
      if (bought) {
        setMsg({ ok: false, t: bought });
        return;
      }
    }
    const err = activateConquestKey(h);
    setMsg(err
      ? { ok: false, t: err }
      : { ok: true, t: "Conquest Key lit — this run and every gate reward pay ×2 until Greek midnight." });
  });

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="slot p-3">
        <div className="flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" />{tr("Blitz run")}</span>
          <span className="text-xs text-muted-foreground">{Math.min(left, BLITZ_PER_DAY)}/{BLITZ_PER_DAY}  {tr("today")}</span>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
          <span className="text-muted-foreground">{tr("Blitz depth")}</span>
          <span className="font-display text-gold">{tr("Floor")} {usable}  {tr("of")} {Math.max(1, cap)}</span>
        </div>
        <input aria-label={tr("Blitz target floor")} type="range" min={1} max={Math.max(1, cap)} value={usable}
          disabled={cap < 1} onChange={(e) => jump(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--gold)]" />
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap))}>
             {tr("Deepest")} </button>
          <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap - 9))}>
             {tr("Last 10")} </button>
          <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, Math.round(cap / 2)))}>
             {tr("Halfway")} </button>
          <label className="ml-auto flex items-center gap-1 text-muted-foreground">
             {tr("Floor")} <input aria-label={tr("Blitz depth typed")} type="number" min={1} max={Math.max(1, cap)} value={target}
              onChange={(e) => jump(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 rounded border border-border bg-background px-1.5 py-1 text-sm text-foreground" />
          </label>
        </div>

        {keyOn ? (
          <p className="mt-2 flex items-center gap-1.5 rounded border border-gold/60 px-2 py-1 text-xs text-gold">
            <img src={conquestKeyArt} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
            {tr("Conquest Key active — this run pays ×")}{keyMult}
          </p>
        ) : (
          <button className="mt-2 flex w-full items-center justify-between gap-2 rounded border border-border bg-background/40 px-2 py-1 text-xs disabled:opacity-60"
            disabled={keys < 1 && hero.gold < keyPrice}
            title={keys > 0 ? "Spend a key from your pack" : "Buy a key and double this blitz and every gate reward until Greek midnight"}
            onClick={useKey}>
            <span className="flex items-center gap-1.5">
              <img src={conquestKeyArt} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
              {keys > 0 ? tr("Use a key · ×2 rewards") : tr("Buy & light a key · ×2 rewards")}
            </span>
            {keys > 0 ? <span className="font-bold text-gold">×{keys}</span> : <Gold n={keyPrice} />}
          </button>
        )}

        <Button className="mt-2 w-full py-2" disabled={!!blocked || left < 1} onClick={() => update((h) => {
          const err = blitz(h, usable);
          setMsg(err ? { ok: false, t: err } : {
            ok: true,
            t: `Blitz started — floors 1-${usable} pay +${fmt(preview?.gold ?? 0)} gold and +${fmt(preview?.tokens ?? 0)} tokens in ${runMinutes} minutes`,
          });
        })}>
          <Zap className="mr-1 inline h-4 w-4" />{left < 1 ? tr("No blitzes left today") : `Blitz floors 1-${usable}`}
        </Button>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          {preview && (
            <span className="md:hidden">
               {tr("Pays")} <Gold n={preview.gold} />  {tr("and")} <span className="font-bold text-gold">+{fmt(preview.tokens)}  {tr("tokens")}</span> ·{" "}
            </span>
          )}
          {runMinutes}  {tr("min · 25 Diamonds finish it now · pays no XP")} </p>
        <BlitzRunCard />
        {blocked && <p className="mt-2 text-xs text-hp">{blocked}</p>}
        {msg && <p role="status" className={`anim-pop mt-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      </div>

      <div className="slot hidden flex-col p-3 md:flex">
        <div className="font-display text-sm text-gold">{tr("What this run pays")}</div>
        {preview ? (
          <>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{tr("Floors replayed")}</dt>
                <dd className="font-display text-lg">{usable}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{tr("Gold")}</dt>
                <dd><Gold n={preview.gold} /></dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{tr("Conquest Tokens")}</dt>
                <dd className="flex items-center gap-1.5 font-bold text-gold">
                  <ConquestCoin size={16} />+{fmt(preview.tokens)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <dt className="text-muted-foreground">{tr("Tokens per floor")}</dt>
                <dd>≈ {fmt(perFloor)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <dt className="text-muted-foreground">{tr("Run time")}</dt>
                <dd>{runMinutes}  {tr("min")}{keyMult > 1 ? ` ${tr("· Key ×2")}` : ""}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
               {tr("Deeper floors pay more tokens (")}{fmt(floorTokens(cap || 1))}  {tr("at your deepest, floor")} {cap}).
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{tr("Clear a floor in the gate above to unlock the blitz.")}</p>
        )}
        <p className="mt-auto pt-2 text-[11px] text-muted-foreground">
          <Sparkles className="mr-1 inline h-3 w-3" />{tr("XP stays in the Campaign Gate — a blitz never levels you.")} </p>
      </div>
    </div>
  );
}

/** The token market: chests and materials, paid only in Conquest Tokens. */
function MarketTab({ hero }: { hero: Hero }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const tokens = conquestTokens(hero);
  const chests = TOKEN_OFFERS.filter((o) => !!o.chest);
  const mats = TOKEN_OFFERS.filter((o) => !o.chest);

  const buy = (o: (typeof TOKEN_OFFERS)[number]) => update((h) => {
    const err = buyTokenOffer(h, o.id);
    const isChest = !!o.chest;
    setMsg(err ? { ok: false, t: err } : {
      ok: true,
      t: isChest
        ? `${o.name} added to your vault — open it from the Armory`
        : o.stone
          ? `Bought ${stoneName(o.stone)} ×${o.qty}`
          : `Bought ${MATS[o.mat!].name} ×${o.qty}`,
    });
  });

  const offer = (o: (typeof TOKEN_OFFERS)[number]) => {
    const isChest = !!o.chest;
    const label = isChest ? (o.name ?? "Chest") : o.stone ? `${stoneName(o.stone)} ×${o.qty}` : `${MATS[o.mat!].name} ×${o.qty}`;
    const note = isChest ? "" : o.stone ? "Enchantment Stones for the Forge" : MATS[o.mat!].src;
    const short = Math.max(0, o.cost - tokens);
    return (
      <button key={o.id} className="slot flex items-center justify-between gap-2 p-2.5 text-left text-xs"
        disabled={tokens < o.cost}
        title={short > 0 ? `${fmt(short)} more tokens needed` : (isChest ? "Goes to your vault — open it from the Armory" : `${MATS[o.mat!].desc} (${MATS[o.mat!].src})`)}
        onClick={() => buy(o)}>
        <span className="flex min-w-0 items-center gap-2">
          {o.chest === "gold" ? <GoldChestIcon size={22} /> : o.chest === "gem" ? <GemChestIcon size={22} /> : o.stone ? <StoneIcon level={o.stone} size={20} /> : <MatIcon mat={o.mat!} size={20} />}
          <span className="min-w-0">
            <span className="block truncate font-bold">{label}</span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {short > 0 ? `${fmt(short)} tokens short` : isChest ? tr("Vault item") : note}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 font-bold text-gold"><ConquestCoin size={14} />{fmt(o.cost)}</span>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      <div className="slot flex flex-wrap items-center justify-between gap-2 p-2 text-sm">
        <span>{tr("Tokens to spend:")} <b className="text-gold">{fmt(tokens)}</b></span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{tr("Floors pay tokens; blitzing a cleared floor pays them again.")}</span>
      </div>
      {msg && <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      <div>
        <h4 className="mb-1.5 font-display text-sm text-gold">{tr("Chests")}</h4>
        <div className="grid grid-cols-2 gap-1.5">{chests.map(offer)}</div>
      </div>
      <div>
        <h4 className="mb-1.5 font-display text-sm text-gold">{tr("Forge materials")}</h4>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">{mats.map(offer)}</div>
      </div>
    </div>
  );
}

/** The gate's gem stock: a gem family and level, its exact stat value, and its token price. */
function GemTab({ hero }: { hero: Hero }) {
  const [gemType, setGemType] = useState<GemType>("ruby");
  const [gemLevel, setGemLevel] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const tokens = conquestTokens(hero);
  const price = gemTokenPrice(gemLevel);
  const key = gemKey(gemType, gemLevel);

  return (
    <div className="space-y-2">
      <div className="slot flex flex-wrap items-center justify-between gap-2 p-2 text-sm">
        <span>{tr("Tokens to spend:")} <b className="text-gold">{fmt(tokens)}</b></span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{tr("Any gem family, any level — bought with Conquest Tokens only.")}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {GEM_TYPES.map((t) => (
          <button key={t} className={"px-2 py-1 text-xs " + (gemType === t ? "btn-gold" : "btn-ghost")}
            onClick={() => { setGemType(t); setMsg(null); }}>
            <GemIcon type={t} size={16} /> {GEMS[t].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-12">
        {Array.from({ length: GEM_MAX_TIER }, (_, i) => i + 1).map((n) => {
          const p = gemTokenPrice(n);
          return (
            <button key={n} className={"slot px-1 py-1.5 text-center text-xs " + (gemLevel === n ? "ring-2 ring-gold" : "")}
              onClick={() => { setGemLevel(n); setMsg(null); }}>
              <span className="block font-bold">{tr("Lv")} {n}</span>
              <span className="block text-[10px] text-muted-foreground">+{gemValue(gemKey(gemType, n))}</span>
              <span className="block text-[10px] text-gold">{fmt(p)} t</span>
            </button>
          );
        })}
      </div>

      <div className="slot flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="min-w-0 text-sm">
          <div className="font-display text-gold"><Gem className="mr-1 inline h-4 w-4" />{GEMS[gemType].name}  {tr("gem · Level")} {gemLevel}</div>
          <div className="text-xs text-muted-foreground">
            +{gemValue(key)} {GEM_STAT_LABEL[GEMS[gemType].stat]}  {tr("when socketed · best on")} {GEMS[gemType].classes}
          </div>
        </div>
        <Button size="sm" disabled={tokens < price} onClick={() => update((h) => {
          const err = buyConquestGem(h, gemType, gemLevel);
          setMsg(err ? { ok: false, t: err } : { ok: true, t: `Bought a ${GEMS[gemType].name} gem (Lv ${gemLevel}) for ${fmt(price)} tokens` });
        })}>
          <ConquestCoin size={16} />{tr("Buy ·")} {fmt(price)}
        </Button>
      </div>
      {tokens < price && (
        <p className="text-xs text-hp">{tr("You need")} {fmt(price - tokens)}  {tr("more tokens for this gem.")}</p>
      )}
      {msg && <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      <p className="hidden text-[11px] text-muted-foreground sm:block">
        <Swords className="mr-1 inline h-3 w-3" />{tr("Prefer to craft? Gems are also forged from materials in the Gem Workshop.")} </p>
    </div>
  );
}

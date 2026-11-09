import { useState } from "react";
import { Gem, Sparkles, Swords, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConquestCoin, GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { GemIcon, MatIcon } from "./MatIcon";
import { GEMS, GEM_MAX_TIER, GEM_STAT_LABEL, GEM_TYPES, MATS, gemKey, gemValue, type GemType } from "./crafting";
import { BlitzRunCard } from "./BlitzRun";
import {
  BLITZ_PER_DAY, blitz, blitzBlocker, blitzRewards, blitzesLeft, buyConquestGem, buyTokenOffer,
  conquestKeyActive, conquestRewardMultiplier, conquestTokens, floorTokens, floorsCleared,
  gemTokenPrice, TOKEN_OFFERS,
} from "./conquest";
import { blitzDurationMs } from "./blitz-run";
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
    <section className="mt-5 border-t border-border pt-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-gold">The Conquest Gate</h3>
          <p className="text-xs text-muted-foreground">
            Clear floors with your hero, then blitz the ones you have beaten and spend the tokens
            you earned. The gate takes only Conquest Tokens — never gold.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="slot flex items-center gap-1.5 px-2.5 py-1.5" title="Conquest Tokens">
            <ConquestCoin size={20} />
            <b className="font-display text-base text-gold">{fmt(tokens)}</b>
            <span className="text-muted-foreground">tokens</span>
          </span>
          <span className="slot px-2.5 py-1.5">Deepest floor <b className="text-gold">{cap || "—"}</b></span>
          <span className="slot px-2.5 py-1.5">Blitzes <b className="text-gold">{left}/{BLITZ_PER_DAY}</b></span>
          {conquestKeyActive(hero) && (
            <span className="slot border-gold/60 px-2.5 py-1.5 text-gold" title="Today's Conquest Key doubles every reward the gate pays">
              <b>Conquest Key ×2</b> · until Greek midnight
            </span>
          )}
        </div>
      </header>

      <GameTabs
        label="Conquest Gate"
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

/** Blitz floors already beaten: pick a depth, see exactly what it pays, then send the hero out. */
function BlitzTab({ hero, cap }: { hero: Hero; cap: number }) {
  const [target, setTarget] = useState(() => Math.max(1, cap || 1));
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const left = blitzesLeft(hero);
  const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
  const blocked = blitzBlocker(hero, usable);
  // Today's Conquest Key doubles what the run banks (see conquest.ts).
  const keyMult = conquestRewardMultiplier(hero);
  const preview = blocked ? null : blitzRewards(usable, keyMult);
  const runMinutes = Math.round(blitzDurationMs(usable) / 60_000);
  const jump = (n: number) => { setTarget(n); setMsg(null); };
  const perFloor = usable > 0 ? Math.max(1, Math.round((preview?.tokens ?? 0) / usable)) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="slot p-4">
        <div className="flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" />Blitz run</span>
          <span className="text-xs text-muted-foreground">{Math.min(left, BLITZ_PER_DAY)}/{BLITZ_PER_DAY} today</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          A blitz replays floors 1 to a depth you have already beaten, without a single fight.
          It pays those floors' gold and tokens — no XP: levels are earned in the Campaign Gate
          only. A run takes 20 minutes, and up to 50 for a deep climb; 25 Diamonds finish it on
          the spot. The allowance returns at Greek midnight, and the floors themselves are never
          limited.{keyMult > 1 ? " Today's Conquest Key doubles everything this run banks." : ""}
        </p>

        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Blitz depth</span>
            <span className="font-display text-gold">Floor {usable} of {Math.max(1, cap)}</span>
          </div>
          <input aria-label="Blitz target floor" type="range" min={1} max={Math.max(1, cap)} value={usable}
            disabled={cap < 1} onChange={(e) => jump(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--gold)]" />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <label className="flex items-center gap-1 text-muted-foreground">
              Type
              <input aria-label="Blitz depth typed" type="number" min={1} max={Math.max(1, cap)} value={target}
                onChange={(e) => jump(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded border border-border bg-background px-2 py-1 text-sm text-foreground" />
            </label>
            <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap))}>
              Deepest ({cap})
            </button>
            <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap - 9))}>
              Last 10
            </button>
            <button className="btn-ghost px-2 py-1 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, Math.round(cap / 2)))}>
              Halfway
            </button>
          </div>
        </div>

        <Button className="mt-3 w-full py-2" disabled={!!blocked || left < 1} onClick={() => update((h) => {
          const err = blitz(h, usable);
          setMsg(err ? { ok: false, t: err } : {
            ok: true,
            t: `Blitz started — floors 1-${usable} pay +${fmt(preview?.gold ?? 0)} gold and +${fmt(preview?.tokens ?? 0)} tokens in ${runMinutes} minutes`,
          });
        })}>
          <Zap className="mr-1 inline h-4 w-4" />{left < 1 ? "No blitzes left today" : `Blitz floors 1-${usable}`}
        </Button>
        <BlitzRunCard />
        {blocked && <p className="mt-2 text-xs text-hp">{blocked}</p>}
        {msg && <p role="status" className={`anim-pop mt-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      </div>

      <div className="slot flex flex-col p-4">
        <div className="font-display text-gold">What this run pays</div>
        {preview ? (
          <>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Floors replayed</dt>
                <dd className="font-display text-lg">{usable}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Gold</dt>
                <dd><Gold n={preview.gold} /></dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Conquest Tokens</dt>
                <dd className="flex items-center gap-1.5 font-bold text-gold">
                  <ConquestCoin size={16} />+{fmt(preview.tokens)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <dt className="text-muted-foreground">Tokens per floor</dt>
                <dd>≈ {fmt(perFloor)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <dt className="text-muted-foreground">Run time</dt>
                <dd>{runMinutes} min{keyMult > 1 ? " · Key ×2" : ""}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              The deepest floor you can reach is {cap}. Every new floor you clear yourself raises
              that cap, and deeper floors pay more tokens ({fmt(floorTokens(cap || 1))} at the
              frontier).
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Clear a floor in the gate above to unlock the blitz.</p>
        )}
        <p className="mt-auto pt-3 text-[11px] text-muted-foreground">
          <Sparkles className="mr-1 inline h-3 w-3" />XP stays in the Campaign Gate — a blitz never levels you.
        </p>
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
        : `Bought ${MATS[o.mat].name} ×${o.qty}`,
    });
  });

  const offer = (o: (typeof TOKEN_OFFERS)[number]) => {
    const isChest = !!o.chest;
    const label = isChest ? (o.name ?? "Chest") : `${MATS[o.mat].name} ×${o.qty}`;
    const short = Math.max(0, o.cost - tokens);
    return (
      <button key={o.id} className="slot flex items-center justify-between gap-2 p-2.5 text-left text-xs"
        disabled={tokens < o.cost}
        title={short > 0 ? `${fmt(short)} more tokens needed` : (isChest ? "Goes to your vault — open it from the Armory" : `${MATS[o.mat].desc} (${MATS[o.mat].src})`)}
        onClick={() => buy(o)}>
        <span className="flex min-w-0 items-center gap-2">
          {o.chest === "gold" ? <GoldChestIcon size={22} /> : o.chest === "gem" ? <GemChestIcon size={22} /> : <MatIcon mat={o.mat} size={20} />}
          <span className="min-w-0">
            <span className="block truncate font-bold">{label}</span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {short > 0 ? `${fmt(short)} tokens short` : isChest ? "Vault item" : MATS[o.mat].src}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 font-bold text-gold"><ConquestCoin size={14} />{fmt(o.cost)}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="slot flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
        <span>Tokens to spend: <b className="text-gold">{fmt(tokens)}</b></span>
        <span className="text-xs text-muted-foreground">Floors pay tokens; blitzing a floor you have cleared pays them again.</span>
      </div>
      {msg && <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      <div>
        <h4 className="mb-1.5 font-display text-sm text-gold">Chests</h4>
        <div className="grid gap-1.5 sm:grid-cols-2">{chests.map(offer)}</div>
      </div>
      <div>
        <h4 className="mb-1.5 font-display text-sm text-gold">Forge materials</h4>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{mats.map(offer)}</div>
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
    <div className="space-y-3">
      <div className="slot flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
        <span>Tokens to spend: <b className="text-gold">{fmt(tokens)}</b></span>
        <span className="text-xs text-muted-foreground">Any gem family, any level — bought with Conquest Tokens only.</span>
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
              <span className="block font-bold">Lv {n}</span>
              <span className="block text-[10px] text-muted-foreground">+{gemValue(gemKey(gemType, n))}</span>
              <span className="block text-[10px] text-gold">{fmt(p)} t</span>
            </button>
          );
        })}
      </div>

      <div className="slot flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="min-w-0 text-sm">
          <div className="font-display text-gold"><Gem className="mr-1 inline h-4 w-4" />{GEMS[gemType].name} gem · Level {gemLevel}</div>
          <div className="text-xs text-muted-foreground">
            +{gemValue(key)} {GEM_STAT_LABEL[GEMS[gemType].stat]} when socketed · best on {GEMS[gemType].classes}
          </div>
        </div>
        <Button size="sm" disabled={tokens < price} onClick={() => update((h) => {
          const err = buyConquestGem(h, gemType, gemLevel);
          setMsg(err ? { ok: false, t: err } : { ok: true, t: `Bought a ${GEMS[gemType].name} gem (Lv ${gemLevel}) for ${fmt(price)} tokens` });
        })}>
          <ConquestCoin size={16} />Buy · {fmt(price)}
        </Button>
      </div>
      {tokens < price && (
        <p className="text-xs text-hp">You need {fmt(price - tokens)} more tokens for this gem.</p>
      )}
      {msg && <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      <p className="text-[11px] text-muted-foreground">
        <Swords className="mr-1 inline h-3 w-3" />Prefer to craft? Gems are also forged from materials in the Gem Workshop.
      </p>
    </div>
  );
}

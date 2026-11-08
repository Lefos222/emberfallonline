import { useState } from "react";
import { Gem, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConquestCoin, GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { GemIcon, MatIcon } from "./MatIcon";
import { GEMS, GEM_MAX_TIER, GEM_STAT_LABEL, GEM_TYPES, MATS, gemKey, gemValue, type GemType } from "./crafting";
import { BlitzRunCard } from "./BlitzRun";
import { BLITZ_PER_DAY, blitz, blitzBlocker, blitzRewards, blitzesLeft, buyConquestGem, buyTokenOffer, conquestTokens, floorsCleared, gemGoldPrice, TOKEN_OFFERS } from "./conquest";
import type { Hero } from "./data";
import { update } from "./store";
import { Gold, fmt } from "./ui";

/**
 * The Conquest Gate's token side: blitz the floors you have already beaten and spend
 * Conquest Tokens on materials, gold chests and enchantment stones.
 */
export function ConquestTokens({ hero }: { hero: Hero }) {
  const cap = floorsCleared(hero);
  const [target, setTarget] = useState(() => Math.max(1, cap || 1));
  const [gemType, setGemType] = useState<GemType>("ruby");
  const [gemLevel, setGemLevel] = useState(1);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const tokens = conquestTokens(hero);
  const gemPrice = gemGoldPrice(gemLevel, hero.level);
  const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
  const left = blitzesLeft(hero);
  const blocked = blitzBlocker(hero, usable);
  const preview = blocked ? null : blitzRewards(usable);
  const jump = (n: number) => { setTarget(n); setMsg(null); };

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="slot p-3">
        <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" />Blitz</span>
          <span className="text-xs font-bold">Blitzes today {Math.min(left, BLITZ_PER_DAY)}/{BLITZ_PER_DAY}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Clear floors 1 to a floor you have already beaten without fighting them again. Your record
          is floor {cap}; a blitz pays those floors' gold and tokens and no XP — levels are earned in the
          Campaign Gate only. It takes ten minutes to run — no battle can start until it lands, and 25
          Diamonds finish it on the spot.
          The blitz is the only limit — the floors themselves never stop, and the allowance returns at
          Greek midnight.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs">Blitz to floor
            <input aria-label="Blitz target floor" type="number" min={1} max={Math.max(1, cap)} value={target}
              onChange={(e) => jump(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 block w-24 rounded border border-border bg-background p-2" />
          </label>
          <Button disabled={!!blocked || left < 1} onClick={() => update((h) => {
            const err = blitz(h, usable);
            setMsg(err ? { ok: false, t: err } : { ok: true, t: `Blitz started — floors 1-${usable} will pay +${fmt(preview?.gold ?? 0)} gold and +${fmt(preview?.tokens ?? 0)} tokens in ten minutes` });
          })}>Blitz</Button>
          <button className="btn-ghost px-3 py-1.5 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap))}>
            Deepest ({cap})
          </button>
        </div>
        <BlitzRunCard />
        {blocked ? <p className="mt-2 text-xs text-muted-foreground">{blocked}</p> : preview && (
          <p className="mt-2 text-xs">Pays <Gold n={preview.gold} /> and <span className="font-bold text-gold">+{fmt(preview.tokens)} tokens</span> — no XP.</p>
        )}
      </div>

      <div className="slot p-3">
        <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><ConquestCoin size={20} />Conquest Tokens</span>
          <span>{fmt(tokens)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Every cleared floor pays tokens. Spend them on materials, chests and enchantment stones. Chests go to your vault — open them from the Armory.</p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {TOKEN_OFFERS.map((o) => {
            const isChest = !!o.chest;
            const label = isChest ? (o.name ?? "Chest") : `${MATS[o.mat].name} ×${o.qty}`;
            return (
              <button key={o.id} className="slot flex items-center justify-between gap-2 p-2 text-left text-xs" disabled={tokens < o.cost}
                title={isChest ? "Goes to your vault — open it from the Armory" : `${MATS[o.mat].desc} (${MATS[o.mat].src})`}
                onClick={() => update((h) => { const err = buyTokenOffer(h, o.id); setMsg(err ? { ok: false, t: err } : { ok: true, t: isChest ? `${o.name} added to your vault — open it from the Armory` : `Bought ${MATS[o.mat].name} ×${o.qty}` }); })}>
                <span className="flex min-w-0 items-center gap-1.5">
                  {o.chest === "gold" ? <GoldChestIcon size={20} /> : o.chest === "gem" ? <GemChestIcon size={20} /> : <MatIcon mat={o.mat} size={18} />}
                  <span className="truncate">{label}</span>
                </span>
                <span className="shrink-0 font-bold text-gold">{fmt(o.cost)} t</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="slot p-3 md:col-span-2">
        <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><Gem className="h-4 w-4" />Gem stock</span>
          <Gold n={hero.gold} />
        </div>
        <p className="text-xs text-muted-foreground">Every gem family at any level, bought straight from the gate for gold. A level 1 gem costs 1,800 gold whatever the family; deeper tiers cost far more.</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {GEM_TYPES.map((t) => (
            <button key={t} className={"px-2 py-1 text-xs " + (gemType === t ? "btn-gold" : "btn-ghost")}
              onClick={() => { setGemType(t); setMsg(null); }}>
              <GemIcon type={t} size={16} /> {GEMS[t].name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <label>Level
            <select aria-label="Gem level" className="ml-1 rounded border border-border bg-background p-1" value={gemLevel}
              onChange={(e) => { setGemLevel(Number(e.target.value)); setMsg(null); }}>
              {Array.from({ length: GEM_MAX_TIER }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Lv {n}</option>)}
            </select>
          </label>
          <span className="slot px-2 py-1">+{gemValue(gemKey(gemType, gemLevel))} {GEM_STAT_LABEL[GEMS[gemType].stat]}</span>
          <Button size="sm" disabled={hero.gold < gemPrice} onClick={() => update((h) => {
            const err = buyConquestGem(h, gemType, gemLevel);
            setMsg(err ? { ok: false, t: err } : { ok: true, t: `Bought a ${GEMS[gemType].name} gem (Lv ${gemLevel}) for ${fmt(gemPrice)} gold` });
          })}>Buy · {fmt(gemPrice)} gold</Button>
        </div>
      </div>
      {msg && <p role="status" className={`anim-pop text-sm md:col-span-2 ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
    </div>
  );
}

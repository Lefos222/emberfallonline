import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatIcon } from "./MatIcon";
import { MATS } from "./crafting";
import { BLITZ_PER_DAY, blitz, blitzBlocker, blitzRewards, blitzesLeft, buyTokenOffer, conquestTokens, floorsCleared, TOKEN_OFFERS } from "./conquest";
import type { Hero } from "./data";
import { update } from "./store";
import { Gold, fmt } from "./ui";

/**
 * The Conquest Gate's token side: blitz the floors you have already beaten and spend
 * Conquest Tokens on the materials that equipment recipes need.
 */
export function ConquestTokens({ hero }: { hero: Hero }) {
  const cap = floorsCleared(hero);
  const [target, setTarget] = useState(() => Math.max(1, cap || 1));
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const tokens = conquestTokens(hero);
  const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
  const left = blitzesLeft(hero);
  const blocked = blitzBlocker(hero, usable);
  const preview = blocked ? null : blitzRewards(usable);
  // The floor the player can blitz to is their own record, so the control never offers more.
  const jump = (n: number) => { setTarget(n); setMsg(null); };

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="slot p-3">
        <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
          <span className="flex items-center gap-2"><Zap className="h-4 w-4" />Blitz</span>
          <span className="text-xs font-bold">Blitzes today {Math.min(left, BLITZ_PER_DAY)}/{BLITZ_PER_DAY}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Instantly clear floors 1 to a floor you have already beaten. Your record is floor {cap};
          blitzing pays the same XP, gold and tokens as fighting those floors again.
          The blitz is the only limit — the floors themselves never stop, and the allowance returns at Greek midnight.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs">Blitz to floor
            <input aria-label="Blitz target floor" type="number" min={1} max={Math.max(1, cap)} value={target}
              onChange={(e) => jump(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 block w-24 rounded border border-border bg-background p-2" />
          </label>
          <Button disabled={!!blocked || left < 1} onClick={() => update((h) => {
            const err = blitz(h, usable);
            setMsg(err ? { ok: false, t: err } : { ok: true, t: `Blitzed ${usable} floor${usable === 1 ? "" : "s"} — +${fmt(preview?.xp ?? 0)} XP, +${fmt(preview?.gold ?? 0)} gold, +${fmt(preview?.tokens ?? 0)} tokens` });
          })}>Blitz</Button>
          <button className="btn-ghost px-3 py-1.5 text-xs" disabled={cap < 1} onClick={() => jump(Math.max(1, cap))}>
            Deepest ({cap})
          </button>
        </div>
        {blocked ? <p className="mt-2 text-xs text-muted-foreground">{blocked}</p> : preview && (
          <p className="mt-2 text-xs">Pays <span className="font-bold text-xp">+{fmt(preview.xp)} XP</span>, <Gold n={preview.gold} />, <span className="font-bold text-gold">+{fmt(preview.tokens)} tokens</span>.</p>
        )}
        {msg && <p role="status" className={`anim-pop mt-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      </div>

      <div className="slot p-3">
        <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
          <span>Conquest Tokens</span>
          <span>{fmt(tokens)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Every cleared floor pays tokens. Spend them on the materials equipment recipes need.</p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {TOKEN_OFFERS.map((o) => (
            <button key={o.id} className="slot flex items-center justify-between gap-2 p-2 text-left text-xs" disabled={tokens < o.cost}
              title={`${MATS[o.mat].desc} (${MATS[o.mat].src})`}
              onClick={() => update((h) => { const err = buyTokenOffer(h, o.id); setMsg(err ? { ok: false, t: err } : { ok: true, t: `Bought ${MATS[o.mat].name} ×${o.qty}` }); })}>
              <span className="flex min-w-0 items-center gap-1.5"><MatIcon mat={o.mat} size={18} /><span className="truncate">{MATS[o.mat].name} ×{o.qty}</span></span>
              <span className="shrink-0 font-bold text-gold">{fmt(o.cost)} t</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

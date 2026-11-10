import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MOUNTS, buyGoldMount, mountPrice, ownsMount, rideMount, mountBlitzPct } from "./mounts";
import { RUNES, RUNE_MAX, carveRune, runeBlocker, runeCost, runeRank } from "./runes";
import { blackMarketStock, bmItemPrice, rollBlackMarket } from "./black-market";
import { DiamondService } from "./DiamondService";
import { spinWheel } from "./economy-services";
import { MATS, matCount, addMats, type Mat } from "./crafting";
import { MatIcon } from "./MatIcon";
import { vipLevelOf } from "./daily-rewards";
import { getState, update, useGame } from "./store";
import { addLoot } from "./logic";
import { ItemCard, Panel, fmt } from "./ui";
import { itemName, tName, tr } from "./i18n";
import { ArtIcon } from "./ArtIcon";
import { WHEEL_PRICE, WHEEL_SEGMENTS, WHEEL_SEG_DEG, wheelGoodChance } from "./wheel";
import marketImg from "@/assets/scene-black-market.jpg";

type Note = { ok: boolean; t: string } | null;
const NoteLine = ({ n }: { n: Note }) => n ? <p role="status" className={`mb-3 rounded-md border px-3 py-2 text-xs ${n.ok ? "border-r1/40 bg-r1/10" : "border-hp/50 bg-hp/10 text-hp"}`}>{n.t}</p> : null;

export function MountsPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [note, setNote] = useState<Note>(null);
  if (!hero) return null;
  return (
    <Panel title={tr("Stables")} subtitle={tr("Mounts shorten every blitz")} art="crown" onClose={onClose} wide>
      <NoteLine n={note} />
      <p className="mb-3 text-sm text-muted-foreground">{tr("Riding now")}: <span className="text-gold">{mountBlitzPct(hero) ? `−${mountBlitzPct(hero)}% ${tr("blitz time")}` : tr("no mount")}</span></p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOUNTS.map((m) => {
          const owned = ownsMount(hero, m.id);
          const riding = hero.mounts?.active === m.id && owned;
          return (
            <article key={m.id} className={`slot ornate-card flex flex-col items-center gap-2 p-3 text-center ${riding ? "ring-2 ring-gold" : ""}`}>
              <img src={m.img} alt={tName(m.name)} loading="lazy" className="mount-art h-32 w-full object-contain" />
              <h3 className="font-display text-lg text-gold">{tName(m.name)}</h3>
              <p className="text-xs text-muted-foreground">{tr(m.desc)}</p>
              <p className="text-sm font-bold">−{m.blitzPct}% {tr("blitz time")}</p>
              {owned ? (
                <Button size="sm" variant={riding ? "secondary" : "default"} onClick={() => update((h) => rideMount(h, riding ? null : m.id))}>{riding ? tr("Dismount") : tr("Ride")}</Button>
              ) : m.gold ? (
                <Button size="sm" disabled={hero.gold < mountPrice(m, hero.level)} onClick={() => update((h) => { const e = buyGoldMount(h, m.id); setNote(e ? { ok: false, t: tr(e) } : { ok: true, t: `${tName(m.name)} ✓` }); })}>{fmt(mountPrice(m, hero.level))} {tr("gold")}</Button>
              ) : (
                <DiamondService kind={`mount_${m.id}`} price={m.diamonds} label="Buy" onDone={() => update((h) => rideMount(h, m.id))} />
              )}
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

export function RunesPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [note, setNote] = useState<Note>(null);
  if (!hero) return null;
  const crystals: Mat[] = ["frostCrystal", "voidCrystal", "sunCrystal"];
  return (
    <Panel title={tr("Rune Altar")} subtitle={tr("Carve runes with crystals for permanent power")} art="gem" onClose={onClose} wide>
      <NoteLine n={note} />
      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        {crystals.map((c) => <span key={c} className="slot flex items-center gap-1 px-2 py-1"><MatIcon mat={c} size={22} />{MATS[c].name} {fmt(matCount(hero, c))}</span>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RUNES.map((r) => {
          const rank = runeRank(hero, r.id);
          const cost = runeCost(rank, hero.level);
          const block = runeBlocker(hero, r.id);
          return (
            <article key={r.id} className="slot ornate-card flex gap-3 p-3">
              <img src={r.img} alt="" loading="lazy" className="rune-art h-20 w-20 shrink-0 object-contain" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="font-display text-lg text-gold">{tName(r.name)} <span className="text-sm text-muted-foreground">{rank}/{RUNE_MAX}</span></h3>
                <p className="text-xs text-muted-foreground">{tr(r.desc)} +{+(r.per * rank).toFixed(1)}% → +{+(r.per * Math.min(RUNE_MAX, rank + 1)).toFixed(1)}%</p>
                {rank < RUNE_MAX && (
                  <p className="flex flex-wrap items-center gap-2 text-xs">
                    {fmt(cost.gold)} {tr("gold")}
                    {(Object.entries(cost.mats) as [Mat, number][]).map(([k, v]) => <span key={k} className="flex items-center gap-0.5"><MatIcon mat={k} size={16} />{v}</span>)}
                  </p>
                )}
                <Button size="sm" disabled={!!block} title={block ? tr(block) : undefined} onClick={() => update((h) => { const e = carveRune(h, r.id); setNote(e ? { ok: false, t: tr(e) } : { ok: true, t: `${tName(r.name)} ${rank + 1}/${RUNE_MAX}` }); })}>{rank >= RUNE_MAX ? tr("Fully carved") : tr("Carve")}</Button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{tr("Crystals drop from boss challenges, the Wheel of Fortune and the VIP Black Market.")}</p>
    </Panel>
  );
}

/** The wheel face: one slice per prize, good prizes in gold, drawn clockwise from the pointer. */
function WheelFace() {
  const n = WHEEL_SEGMENTS.length;
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${50 + r * Math.cos(a)} ${50 + r * Math.sin(a)}`;
  };
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="49.5" className="fill-background stroke-gold" strokeWidth="1" />
      {WHEEL_SEGMENTS.map((s, i) => {
        const a0 = i * WHEEL_SEG_DEG - WHEEL_SEG_DEG / 2;
        const a1 = a0 + WHEEL_SEG_DEG;
        const fill = s.good ? "fill-gold" : i % 2 ? "fill-secondary" : "fill-card";
        return (
          <g key={i}>
            <path d={`M50 50 L${pt(a0, 48)} A48 48 0 0 1 ${pt(a1, 48)} Z`} className={`${fill} stroke-border`} strokeWidth="0.3" />
            <text
              x="50" y="9" textAnchor="middle" transform={`rotate(${i * WHEEL_SEG_DEG} 50 50)`}
              className={s.good ? "fill-background font-bold" : "fill-foreground"} style={{ fontSize: n > 12 ? 3 : 4 }}
            >{tr(s.label)}</text>
          </g>
        );
      })}
      <circle cx="50" cy="50" r="7" className="fill-gold stroke-background" strokeWidth="1" />
    </svg>
  );
}

export function WheelPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [angle, setAngle] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  if (!hero) return null;
  const balance = (hero.srv?.premium?.balance ?? 0) as number;
  const spin = async () => {
    setBusy(true); setNote(null);
    try {
      await spinWheel();
      const { grant } = await import("./logic");
      update((h) => { grant(h, 0, 0); }); // settle any level-up from wheel XP
      const w = (getState().hero?.srv as { wheel?: { seg: number; gold: number; xp: number; diamonds?: number; mats: Record<string, number> } } | undefined)?.wheel;
      const seg = w?.seg ?? 0;
      const jitter = (Math.random() - 0.5) * WHEEL_SEG_DEG * 0.7; // land anywhere inside the slice
      setAngle((a) => a - (a % 360) + 360 * 6 - seg * WHEEL_SEG_DEG + jitter);
      setTimeout(() => {
        const parts = [w?.diamonds ? `+${fmt(w.diamonds)} ${tr("Diamonds")}` : "", w?.gold ? `+${fmt(w.gold)} ${tr("gold")}` : "", w?.xp ? `+${fmt(w.xp)} XP` : "", ...Object.entries(w?.mats ?? {}).map(([k, n]) => `+${n} ${MATS[k as Mat]?.name ?? k}`)].filter(Boolean);
        const s = WHEEL_SEGMENTS[seg];
        setNote({ ok: true, t: `${s?.good ? "★ " : ""}${tr(s?.label ?? "Gold")}! ${parts.join(" · ")}` });
        setBusy(false);
      }, 4200);
    } catch (e) { setNote({ ok: false, t: e instanceof Error ? e.message : String(e) }); setBusy(false); }
  };
  return (
    <Panel title={tr("Wheel of Fortune")} subtitle={tr("100 Diamonds per spin")} art="diamond" onClose={onClose}>
      <NoteLine n={note} />
      <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
        <div className="h-full w-full drop-shadow-[0_0_24px_hsl(var(--gold)/0.35)]" style={{ transform: `rotate(${angle}deg)`, transition: busy ? "transform 4s cubic-bezier(.17,.67,.21,1)" : "none" }}><WheelFace /></div>
        <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 border-x-[12px] border-t-[22px] border-x-transparent border-t-gold drop-shadow" />
      </div>
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="flex items-center gap-1 text-sm"><ArtIcon name="diamond" size={16} />{fmt(balance)} {tr("Diamonds")}</p>
        <Button disabled={busy || balance < WHEEL_PRICE} onClick={() => void spin()}>{busy ? tr("Spinning…") : tr("Spin · 100 Diamonds")}</Button>
        <p className="text-center text-xs text-muted-foreground">{tr("Only the gold slices are worth chasing — together they hit about")} {wheelGoodChance()}% {tr("of the time. Every other prize is rolled between half and one and a half of its usual size.")}</p>
        <details className="w-full text-xs">
          <summary className="cursor-pointer text-center text-gold">{tr("Show the odds")}</summary>
          <ul className="mt-2 grid gap-1">
            {[...WHEEL_SEGMENTS].sort((a, b) => b.weight - a.weight).map((s, i) => (
              <li key={i} className={`flex justify-between gap-2 ${s.good ? "text-gold" : "text-muted-foreground"}`}>
                <span>{s.good ? "★ " : ""}{tr(s.prize)}</span><span>{s.weight}%</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </Panel>
  );
}

export function BlackMarketTab() {
  const { hero } = useGame();
  const [note, setNote] = useState<Note>(null);
  const vip = hero ? vipLevelOf(hero) : 0;
  useEffect(() => { if (hero) update((h) => { blackMarketStock(h); }); }, [hero?.blackMarket?.window]);
  if (!hero) return null;
  const bm = hero.blackMarket;
  if (!bm) return null;
  const buyItem = (id: string) => update((h) => {
    const b = h.blackMarket; const it = b?.items.find((i) => i.id === id);
    if (vipLevelOf(h) <= 0) return setNote({ ok: false, t: tr("Only VIP members can buy from the Black Market.") });
    if (!b || !it || b.sold.includes(id)) return setNote({ ok: false, t: tr("Already sold") });
    const p = bmItemPrice(it, h.level); if (h.gold < p) return setNote({ ok: false, t: tr("Not enough gold") });
    h.gold -= p; b.sold = [...b.sold, id]; addLoot(h, it); // a full bag goes to the Overflow Chest, never lost
    setNote({ ok: true, t: `${itemName(it.name)} ✓` });
  });
  const buyMat = (i: number) => update((h) => {
    const b = h.blackMarket; const o = b?.mats[i]; const key = `mat${i}`;
    if (vipLevelOf(h) <= 0) return setNote({ ok: false, t: tr("Only VIP members can buy from the Black Market.") });
    if (!b || !o || b.sold.includes(key)) return setNote({ ok: false, t: tr("Already sold") });
    if (h.gold < o.gold) return setNote({ ok: false, t: tr("Not enough gold") });
    h.gold -= o.gold; b.sold = [...b.sold, key]; addMats(h, { [o.mat]: o.qty });
    setNote({ ok: true, t: `+${o.qty} ${MATS[o.mat].name}` });
  });
  return (
    <div>
      <div className="relative mb-3 h-28 overflow-hidden rounded-lg border border-gold/40">
        <img src={marketImg} alt="" className="h-full w-full object-cover" />
        <p className="absolute bottom-2 left-3 font-display text-2xl text-gold drop-shadow-[0_2px_3px_black]">{tr("Black Market")} · VIP</p>
      </div>
      <NoteLine n={note} />
      {bm.lucky && <p className="mb-3 rounded-md border border-gold/60 bg-gold/10 px-3 py-2 text-xs text-gold">★ {tr("Lucky stock! An Epic piece and a Sun Crystal are on the shelf this time.")}</p>}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-lg text-xs text-muted-foreground">{tr("Slightly better wares for VIP members — restocks every six hours.")}</p>
        {vip > 0 ? <DiamondService kind="black_market_refresh" label="Restock now" onDone={() => update((h) => rollBlackMarket(h))} />
          : <p className="text-xs text-gold">{tr("Anyone can browse — only VIP members can buy. Activate VIP in the Premium Shop.")}</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {bm.items.map((it) => (
          <div key={it.id} className="slot flex flex-col gap-2 p-2">
            <ItemCard item={it} />
            <Button size="sm" disabled={vip <= 0 || bm.sold.includes(it.id)} onClick={() => buyItem(it.id)}>{bm.sold.includes(it.id) ? tr("Sold") : `${fmt(bmItemPrice(it, hero.level))} ${tr("gold")}`}</Button>
          </div>
        ))}
        {bm.mats.map((o, i) => (
          <div key={o.mat} className="slot flex items-center gap-2 p-2">
            <MatIcon mat={o.mat} size={36} /><span className="flex-1 text-sm">{o.qty}× {MATS[o.mat].name}</span>
            <Button size="sm" disabled={vip <= 0 || bm.sold.includes(`mat${i}`)} onClick={() => buyMat(i)}>{bm.sold.includes(`mat${i}`) ? tr("Sold") : `${fmt(o.gold)} ${tr("gold")}`}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

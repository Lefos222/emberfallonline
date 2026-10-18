import type { ReactNode } from "react";
import { X, Coins } from "lucide-react";
import { GearIcon } from "./GearIcon";
import { itemStats, itemScore, RARITIES, type Item } from "./data";

export function Panel({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`game-panel anim-pop relative flex max-h-[92vh] w-full flex-col ${wide ? "max-w-6xl" : "max-w-3xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <h2 className="panel-title text-2xl font-bold md:text-3xl">{title}</h2>
          <button onClick={onClose} className="btn-blood flex h-9 w-9 items-center justify-center" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export function Gold({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-gold ${className}`}>
      <Coins className="h-4 w-4" />
      {fmt(n)}
    </span>
  );
}

export function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
}

export function ItemSlot({ item, size = 56, onClick, selected, empty }: { item?: Item; size?: number; onClick?: () => void; selected?: boolean; empty?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`slot relative flex shrink-0 items-center justify-center transition hover:scale-105 ${item ? `rarity-${item.rarity}` : ""} ${selected ? "ring-2 ring-gold" : ""}`}
      style={{ width: size + 8, height: size + 8 }}
    >
      {item ? <GearIcon item={item} size={size} /> : <span className="text-muted-foreground/50">{empty}</span>}
      {item && item.enh > 0 && <span className="absolute right-0.5 top-0 font-display text-xs font-black text-gold drop-shadow-[0_1px_1px_black]">+{item.enh}</span>}
      {item && <span className="absolute bottom-0 left-1 text-[10px] font-bold drop-shadow-[0_1px_1px_black]">{item.ilvl}</span>}
    </button>
  );
}

export function ItemCard({ item, compare, actions }: { item: Item; compare?: Item; actions?: ReactNode }) {
  const s = itemStats(item);
  const c = compare ? itemStats(compare) : null;
  const delta = compare ? Math.round(itemScore(item) - itemScore(compare)) : null;
  const row = (label: string, v: number, cv?: number) =>
    v || cv ? (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>
          {v.toLocaleString()}
          {cv !== undefined && v !== cv && <span className={v > cv ? "ml-2 text-r1" : "ml-2 text-hp"}>{v > cv ? "▲" : "▼"}{Math.abs(v - cv).toLocaleString()}</span>}
        </span>
      </div>
    ) : null;
  return (
    <div className="slot w-full p-3 anim-pop" style={{ borderColor: `var(--r${item.rarity})` }}>
      <div className="flex gap-3">
        <ItemSlot item={item} size={64} />
        <div className="min-w-0">
          <div className="font-display font-bold leading-tight" style={{ color: `var(--r${item.rarity})` }}>
            {item.name} {item.enh > 0 && `+${item.enh}`}
          </div>
          <div className="text-xs text-muted-foreground">{RARITIES[item.rarity].name} · {item.slot} · iLvl {item.ilvl}</div>
          {delta !== null && <div className={`text-xs font-bold ${delta >= 0 ? "text-r1" : "text-hp"}`}>{delta >= 0 ? "▲ Upgrade" : "▼ Weaker"} ({delta >= 0 ? "+" : ""}{delta} power)</div>}
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        {row("Attack", s.atk, c?.atk)}
        {row("Defense", s.def, c?.def)}
        {row("Health", s.hp, c?.hp)}
        {row("Crit %", s.crit, c?.crit)}
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

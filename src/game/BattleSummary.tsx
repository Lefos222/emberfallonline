import { BattleCharacter } from "./BattleArt";
import { Sprite } from "./Sprite";
import { LootGrid } from "./LootGrid";
import { ItemCard } from "./ui";
import { tr, tName } from "./i18n";
import type { BattleEndHp, Fighter } from "./Battle";
import type { Unit } from "./combat";
import type { Item } from "./data";

/** Both fighters as battle units, which is all the painted art needs to draw them. */
const asUnit = (f: Fighter, side: "hero" | "foe") => ({ ...f, id: side, side }) as Unit;

function Portrait({ f, side }: { f: Fighter; side: "hero" | "foe" }) {
  const u = asUnit(f, side);
  return (
    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-gold/60 bg-background/60">
      {u.sprite && !u.cls
        ? <div className="flex h-full w-full items-end justify-center"><Sprite rect={u.sprite} className="h-full w-auto" /></div>
        : <div className="h-full w-full"><BattleCharacter u={u} /></div>}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/40 py-0.5 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function FighterColumn({ f, side, hp, maxHp, dead }: { f: Fighter; side: "hero" | "foe"; hp: number; maxHp: number; dead: boolean }) {
  const share = Math.max(0, Math.min(100, (hp / Math.max(1, maxHp)) * 100));
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1 ${dead ? "opacity-80" : ""}`}>
      <Portrait f={f} side={side} />
      <div className="mt-1 truncate text-center font-display text-sm">{tName(f.name)}</div>
      <div className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">{tr("Lv")} {f.level}</div>
      <div className="bar-track mt-1 h-3">
        <div className="bar-hp h-full transition-all" style={{ width: `${share}%` }} />
      </div>
      <div className="text-center text-[10px] text-muted-foreground">
        {Math.max(0, Math.round(hp)).toLocaleString()} / {Math.round(maxHp).toLocaleString()}
      </div>
      <div className="mt-1">
        <StatRow label={tr("Health")} value={Math.round(f.hp).toLocaleString()} />
        <StatRow label={tr("Attack")} value={Math.round(f.atk).toLocaleString()} />
        <StatRow label={tr("Defense")} value={Math.round(f.def).toLocaleString()} />
        <StatRow label={tr("Crit")} value={`${Math.round(f.crit)}%`} />
        <StatRow label={tr("Dodge")} value={`${Math.round(f.dodge)}%`} />
      </div>
    </div>
  );
}

/**
 * The battle report: both fighters side by side with the health they kept, their stats, and
 * everything the fight paid out underneath. It is the only screen a finished fight shows.
 */
export function BattleSummary({ left, right, hp, won, lines, loot, onContinue, onRepeat, canRepeat }: {
  left: Fighter; right: Fighter; hp?: BattleEndHp; won: boolean;
  lines: string[]; loot?: Item | null;
  onContinue: () => void; onRepeat?: () => void; canRepeat?: boolean;
}) {
  const heroHp = hp?.hero ?? (won ? left.hp : 0);
  const heroMax = hp?.heroMax ?? left.hp;
  const foeHp = hp?.foe ?? (won ? 0 : right.hp);
  const foeMax = hp?.foeMax ?? right.hp;
  return (
    <div className="game-panel anim-pop w-full max-w-xl p-4 md:p-5">
      <h2 className={`text-center font-display text-4xl font-black ${won ? "panel-title" : "text-blood"}`}>
        {won ? tr("VICTORY") : tr("DEFEAT")}
      </h2>
      <div className="mt-3 flex items-start gap-3 md:gap-5">
        <FighterColumn f={left} side="hero" hp={heroHp} maxHp={heroMax} dead={heroHp <= 0} />
        <div className="flex h-28 flex-col items-center justify-center self-center px-1 text-center">
          <span className="font-display text-lg text-muted-foreground">vs</span>
        </div>
        <FighterColumn f={right} side="foe" hp={foeHp} maxHp={foeMax} dead={foeHp <= 0} />
      </div>
      <div className="mt-3 border-t border-border pt-2">
        <LootGrid lines={lines} />
        {loot && <ItemCard item={loot} />}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button className="btn-gold flex-1 py-2.5 text-lg" onClick={onContinue}>{tr("Continue")}</button>
        {onRepeat && canRepeat && (
          <button className="btn-ghost flex-1 py-2.5 text-lg" onClick={onRepeat}>{tr("Fight again")}</button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">{tr("Enter continues · Esc closes")}</p>
    </div>
  );
}

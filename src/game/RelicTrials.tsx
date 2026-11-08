import { useState } from "react";
import { Lock, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GearIcon } from "./GearIcon";
import { Sprite } from "./Sprite";
import { Gold, ItemCard, Panel, fmt } from "./ui";
import { update, useGame } from "./store";
import { RARITIES, invCap, type Item } from "./data";
import { SET_BONUSES, activeSets, signatureOf } from "./progress";
import { scrollXp } from "./scrolls";
import type { StartBattle } from "./panels";
import gearAtlas from "@/assets/gear-atlas.jpg";
import {
  RELIC_RANKS, equipBestRelics, noteRelic, noteRelicClear, recoveredRelics, relicClears, relicFoe, relicFound,
  relicItem, relicLevel, relicRank, relicRewards, relicSet, relicUnlocked, rollRelic, wornRelics,
  type RelicPiece, type RelicRank,
} from "./relics";

/** Relic Trials: the class wardrobe's only source, fought rank by rank inside the Dungeon Gate. */
export function RelicTrials({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero } = useGame();
  const [sel, setSel] = useState<RelicPiece | null>(null);
  if (!hero) return null;
  const set = relicSet(hero.cls);
  const recovered = recoveredRelics(hero);
  const worn = wornRelics(hero);
  const active = activeSets(hero.equipment).find((s) => s.name === set.set)?.count ?? 0;
  const signature = signatureOf(set.set);

  const fight = (rank: RelicRank) => {
    if (!relicUnlocked(hero, rank)) return;
    start({
      title: `${set.trial} · Rank ${relicRank(hero, rank).label}`,
      right: relicFoe(hero, rank),
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The warden holds the field. The relics stay sealed."] };
        const { grant, addLoot } = await import("./logic");
        const rw = relicRewards(hero, rank);
        let loot: Item | null = null;
        const lines: string[] = [];
        update((h) => {
          const xp = scrollXp(rw.xp, xpMultiplier);
          const { levels } = grant(h, xp, rw.gold);
          const roll = rollRelic(h, rank);
          const first = noteRelic(h, roll.piece.id);
          noteRelicClear(h, rank);
          if (first) h.insight = (h.insight ?? 0) + 1;
          loot = roll.item;
          const full = h.inventory.length >= invCap(h);
          addLoot(h, roll.item);
          lines.push(`+${fmt(xp)} XP`, `+${fmt(rw.gold)} gold`, `Recovered ${roll.item.name}`);
          if (first) lines.push("+1 Insight — new relic discovered");
          if (full) lines.push("Bag full — the relic waits in your Overflow Chest (Armory)");
          if (levels) lines.push(`LEVEL UP ×${levels}!`);
        });
        return { lines, loot };
      },
    });
  };

  const equipAll = () => update((h) => { equipBestRelics(h); });

  return (
    <Panel title="Relic Trials" subtitle={`${set.name} · every win recovers a piece`} art="star" onClose={onClose} wide>
      <div className="relative mb-4 overflow-hidden rounded-lg border border-border">
        <div
          aria-hidden="true"
          className="h-32 w-full md:h-40"
          style={{ backgroundImage: `url(${gearAtlas})`, backgroundSize: "300% auto", backgroundPosition: set.crop }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 flex flex-col justify-center gap-0.5 p-4">
          <div className="font-display text-2xl text-gold md:text-3xl">{set.name}</div>
          <p className="max-w-lg text-xs text-muted-foreground md:text-sm">{set.blurb}</p>
          <p className="text-xs">Recovered <b>{recovered}</b>/{set.pieces.length} · Worn <b>{worn}</b> · {set.trial}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {RELIC_RANKS.map(({ rank, label, level }) => {
          const foe = relicFoe(hero, rank);
          const rw = relicRewards(hero, rank);
          const unlocked = relicUnlocked(hero, rank);
          const clears = relicClears(hero, rank);
          const pool = set.pieces.filter((p) => p.rank <= rank).length;
          return (
            <article key={rank} className={`slot flex flex-col gap-2 p-3 ${unlocked ? "" : "opacity-70"}`}>
              <div className="flex items-center gap-2">
                <Sprite rect={set.boss.sprite} className="h-16 w-16 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-lg leading-tight">Rank {label}</div>
                  <div className="truncate text-xs text-muted-foreground">{set.boss.name}</div>
                  <div className="text-xs text-gold">
                    {clears ? `Cleared ×${clears}` : unlocked ? "Not yet cleared" : `Level ${level} required`}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">HP {fmt(foe.hp)} · ATK {fmt(foe.atk)} · DEF {fmt(foe.def)}</div>
              <div className="text-xs"><Gold n={rw.gold} /> · {fmt(rw.xp)} XP · {pool} possible relics</div>
              <Button className="mt-auto" disabled={!unlocked} onClick={() => fight(rank)}>
                {unlocked ? <><Swords />Begin Rank {label}</> : <><Lock />Level {level} required</>}
              </Button>
            </article>
          );
        })}
      </div>

      {sel && (
        <div className="mt-4">
          <ItemCard
            item={relicItem(sel, hero.cls, relicLevel(hero))}
            actions={<Button variant="ghost" size="sm" onClick={() => setSel(null)}>Close</Button>}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {sel.blurb} · Recovered {relicFound(hero, sel.id)}× · Found at your current level.
          </p>
        </div>
      )}

      <h3 className="mt-5 font-display text-lg text-gold">Collection</h3>
      <p className="mb-2 text-xs text-muted-foreground">
        Recovered pieces are ordinary gear: enhance them, socket gems and wear them. Rank I recovers the armour, II the
        weapons and rings, III the talisman and the mythic pieces.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {set.pieces.map((piece) => {
          const owned = relicFound(hero, piece.id);
          return (
            <button
              key={piece.id}
              title={piece.blurb}
              onClick={() => setSel(piece)}
              className={`slot flex flex-col items-center gap-1 p-2 text-center transition hover:scale-[1.03] ${owned ? "" : "opacity-40"}`}
            >
              <GearIcon item={{ slot: piece.slot, cls: hero.cls, icon: piece.icon, name: piece.name }} size={40} />
              <span className="text-[10px] leading-tight">{piece.name.replace(`${set.set} `, "")}</span>
              <span className="text-[10px]" style={{ color: `var(--r${piece.rarity})` }}>
                {RARITIES[piece.rarity].name} · {RELIC_RANKS[piece.rank - 1]!.label}
              </span>
              {!owned && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Not recovered yet" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="slot p-3 text-sm">
          <div className="font-display text-gold">Set bonuses · {active}/8 worn</div>
          {SET_BONUSES.map((b) => (
            <div key={b.pieces} className={active >= b.pieces ? "text-gold" : "text-muted-foreground"}>{b.pieces} pieces · {b.label}</div>
          ))}
          {signature && (
            <div className={active >= 6 ? "mt-1 text-gold" : "mt-1 text-muted-foreground"}>
              6 pieces · {signature.label} <span className="opacity-70">(set signature)</span>
            </div>
          )}
        </div>
        <div className="slot flex flex-col justify-between gap-2 p-3 text-sm">
          <div>
            <div className="font-display text-gold">Wardrobe</div>
            <div className="text-muted-foreground">
              {recovered}/{set.pieces.length} pieces recovered. The first recovery of each piece also banks 1 Insight.
            </div>
          </div>
          <Button onClick={equipAll}>Equip best relics</Button>
        </div>
      </div>
    </Panel>
  );
}

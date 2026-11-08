import { useState } from "react";
import { Button } from '@/components/ui/button';
import { trainingCost, trainAttribute } from './building-content';
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Heart, Swords, Clover, Sparkles, Trophy, Gem, Hammer, Trash2, Skull, Backpack, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recordEnhance } from "./progress";
import { adviseStrategy } from "@/lib/quests.functions";
import {
  SKILLS, heroSkills, type Foe, CLASSES, enhanceChance, enhanceCost, enhanceMaxed, enhanceStoneChance, enchantStoneCost, enchantStoneGrade, goldEnhanceAllowed, ENHANCE_MAX, ENHANCE_GOLD_LIMIT, heroStats, invCap, bagRowCost, MAX_BAG_ROWS, sellValue,
  CONQUEST_LEVEL, MAX_LEVEL, SLOTS, WEAR_SLOTS, WEAR_LABEL, wearOf, equipItem, unequipItem, wornCompare, posOf, powerBreakdown, stageFoe, stageRewards, xpToNext, xpPerFight, fightsToNextLevel, zoneOf, catchUpXpFactor, scaledFoe, foeRating, type Attr, type EnemyType, type Hero, type Item, type Slot, type Stats, type WearSlot,
} from "./data";
import { addConquestTokens, floorTokens } from "./conquest";
import { CAMPAIGN_STAMINA, STAMINA_PER_DAY, staminaBlocker, staminaLeft } from "./stamina";
import { ConquestTokens } from "./ConquestGate";
import { CampaignBlitz } from "./CampaignBlitz";
import { LevelProgress } from "./LevelCurve";
import { update, useGame } from "./store";
import { GameTabs, Gold, ItemCard, ItemSlot, Panel, fmt } from "./ui";
import { GemIcon, MatIcon, StoneIcon } from "./MatIcon";
import { Vault } from "./Vault";
import { GearCodex } from "./GearCodex";
import { MAX_SOCKETS, MATS, REFINE, gemName, gemStatText, matCount, parseGem, refine, scrapItem, scrapYield, socketCount, sockets, type Mat } from "./crafting";
import { STONE_FAIL_SAVE_CHANCE, STONE_LEVELS, combineAllStones, combineGold, combineStones, heldStoneLevels, spendStones, stoneBonus, stoneCount, stoneName } from "./enchant";
import { FATE_SUCCESS_BONUS, enhanceFateChance, fateStoneCost, fateStoneCount, spendFateStones } from "./fate";
import worldMap from "@/assets/world-map.jpg";
import type { Fighter } from "./Battle";
import { scrollXp } from "./scrolls";
import { QuestBoard } from "./QuestBoard";
import { AdvancedTraining, BarracksUpgrade, DrillTracks, StatTrainings } from "./Barracks";
import { EnlightenmentTraining, SoulForge } from "./EnlightenmentPanel";
import { barracksCost, barracksLevel, batchSizes } from "./barracks";
import { CharacterPose } from "./CharacterPose";
import { heroAppearance } from "./appearance";

export type StartBattle = (opts: {
  right: Fighter; auto?: boolean; title: string;
  /** A Dungeon Gate run: it costs its stamina on entry, win or lose (see stamina.ts). */
  dungeon?: boolean;
  /** Stamina this battle costs on entry, charged win or lose. */
  stamina?: number;
  /** A Blood Arena duel: it spends one of the five fights allowed every twelve hours (see arena-limits.ts). */
  arena?: boolean;
  onResult: (won: boolean, xpMultiplier?: number) => { lines: string[]; loot?: Item | null } | Promise<{ lines: string[]; loot?: Item | null }>;
}) => void;

export const heroFighter = (h: Hero, s: Stats, gender: "male" | "female"): Fighter => ({
  name: h.name, img: CLASSES[h.cls].img, hp: s.hp, atk: s.atk, def: s.def, crit: s.crit, dodge: s.dodge,
  critDmg: s.critDmg, pen: s.pen, acc: s.acc, block: s.block, heal: s.heal,
  level: h.level + h.paragon, cls: h.cls, gender, skills: heroSkills(h), skillLoadout: h.skillLoadout, ...heroAppearance(h, gender),
});

const SLOT_LABEL: Record<Slot, string> = { helmet: "Head", armour: "Chest", boots: "Feet", belt: "Waist", weapon: "Weapon", ring: "Ring", talisman: "Amulet" };
const LEFT_DOLL: WearSlot[] = ["helmet", "armour", "belt", "boots"];
const RIGHT_DOLL: WearSlot[] = ["weapon", "ring", "ring2", "talisman"];

// ---------------- Hero Keep ----------------
export function HeroHall({ onClose, title = "Armory" }: { onClose: () => void; title?: string }) {
  const { hero, gender } = useGame();
  const [sel, setSel] = useState<{ id: string; equipped: boolean } | null>(null);
  const [filter, setFilter] = useState<Slot | "all">("all");
  const [sort, setSort] = useState<"new" | "rarity" | "level">("new");
  const [q, setQ] = useState("");
  if (!hero) return null;
  const s = heroStats(hero);
  const selItem = sel ? (sel.equipped ? Object.values(hero.equipment).find((i) => i?.id === sel.id) : hero.inventory.find((i) => i.id === sel.id)) : undefined;

  const equip = (it: Item, at?: WearSlot) => update((h) => { equipItem(h, it, at); });
  const unequip = (it: Item) => update((h) => { unequipItem(h, it, invCap(h)); });
  /** Click a worn piece to inspect it; click an empty position to wear the selected bag item there. */
  const wearClick = (sl: WearSlot) => {
    const worn = hero.equipment[sl];
    if (worn) { setSel({ id: worn.id, equipped: true }); return; }
    const it = sel && !sel.equipped ? hero.inventory.find((i) => i.id === sel.id) : undefined;
    if (it && wearOf(it.slot).includes(sl)) { equip(it, sl); setSel({ id: it.id, equipped: true }); }
  };
  const sell = (it: Item) => update((h) => { h.inventory = h.inventory.filter((i) => i.id !== it.id); h.gold += sellValue(it); });

  return (
    <Panel title={title} subtitle="Bag, equipment and sets" art="bag" onClose={onClose} wide>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="relative mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-2">
            <div className="flex flex-col gap-2">
              {LEFT_DOLL.map((sl) => (
                <ItemSlot key={sl} item={hero.equipment[sl]} empty={WEAR_LABEL[sl]} selected={sel?.id === hero.equipment[sl]?.id}
                  onClick={() => wearClick(sl)} />
              ))}
            </div>
            <div className="relative mx-auto h-[320px] w-full max-w-[320px] self-center">
              <CharacterPose cls={hero.cls} gender={gender} className="inventory-character h-full w-full" {...heroAppearance(hero, gender)} />
            </div>
            <div className="flex flex-col gap-2">
              {RIGHT_DOLL.map((sl) => (
                <ItemSlot key={sl} item={hero.equipment[sl]} empty={WEAR_LABEL[sl]} selected={sel?.id === hero.equipment[sl]?.id}
                  onClick={() => wearClick(sl)} />
              ))}
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="font-display text-2xl">{hero.name}</div>
            <div className="text-sm text-muted-foreground">
              {CLASSES[hero.cls].name} · Level {hero.level}{hero.paragon > 0 && <span className="text-gold"> · Ascension {hero.paragon}</span>}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            {([
              ["Health", fmt(s.hp)], ["Battle Rating", fmt(s.power)],
              ["Physical attack", fmt(s.patk)], ["Magic attack", fmt(s.matk)],
              ["Physical defense", fmt(s.pdef)], ["Magic defense", fmt(s.mdef)],
              ["Critical chance", `${s.crit}%`], ["Critical damage", `${s.critDmg}%`],
              ["Armor penetration", `${s.pen}%`], ["Accuracy", `${s.acc}%`],
              ["Evasion", `${s.dodge}%`], ["XP", `${fmt(hero.xp)} / ${fmt(xpToNext(hero))}`],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/30 py-0.5"><span className="text-muted-foreground">{k}</span><span className="font-bold">{v}</span></div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Str {hero.attrs.str} · Int {hero.attrs.int} · Agi {hero.attrs.agi} · Vit {hero.attrs.vit}
          </div>
          <div className="slot mt-2 p-2 text-xs">
            <div className="mb-1 font-display text-sm text-gold"><Trophy className="mr-1 inline h-3 w-3" />Battle Rating sources</div>
            {powerBreakdown(hero).map((p) => (
              <div key={p.label} className="flex justify-between"><span>{p.label}</span><span>+{fmt(p.power)}</span></div>
            ))}
            <div className="mt-1 text-muted-foreground">{hero.level < CONQUEST_LEVEL ? `Conquest unlocks at level ${CONQUEST_LEVEL}` : hero.level < MAX_LEVEL ? `Ascension begins at level ${MAX_LEVEL}` : `Ascending — each level grants +2% to all stats`}</div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display">Bag {hero.inventory.length}/{invCap(hero)}</span>
            <button className="btn-blood px-3 py-1 text-xs" onClick={() => update((h) => {
              const junk = h.inventory.filter((i) => i.rarity <= 1 && i.enh === 0);
              h.gold += junk.reduce((a, i) => a + sellValue(i), 0);
              h.inventory = h.inventory.filter((i) => !(i.rarity <= 1 && i.enh === 0));
            })}>
              <Trash2 className="mr-1 inline h-3 w-3" />Sell common
            </button>
            {(hero.bagRows ?? 0) < MAX_BAG_ROWS && (
              <button className="btn-gold ml-2 px-3 py-1 text-xs" disabled={hero.gold < bagRowCost(hero)}
                title="Adds one more row of bag slots"
                onClick={() => update((h) => { const c = bagRowCost(h); if (h.gold < c || (h.bagRows ?? 0) >= MAX_BAG_ROWS) return; h.gold -= c; h.bagRows = (h.bagRows ?? 0) + 1; })}>
                + Row ({fmt(bagRowCost(hero))} gold)
              </button>
            )}
          </div>
          {(hero.overflow?.length ?? 0) > 0 && (
            <div className="mb-2 flex items-center justify-between rounded-md border border-gold/60 bg-gold/10 px-2 py-1.5 text-xs">
              <span>Overflow Chest: <b>{hero.overflow!.length}</b> item(s) waiting — free bag space to claim them.</span>
              <button className="btn-gold px-2 py-0.5 text-xs" disabled={hero.inventory.length >= invCap(hero)}
                onClick={async () => { const { claimOverflow } = await import("./logic"); update((h) => { claimOverflow(h); }); }}>Claim</button>
            </div>
          )}
          <div className="mb-2 flex flex-wrap items-center gap-1 text-xs">
            {(["all", ...SLOTS] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded px-2 py-0.5 ${filter === f ? "bg-gold text-background" : "bg-secondary"}`}>{f === "all" ? "All" : SLOT_LABEL[f]}</button>
            ))}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="ml-auto w-24 rounded bg-secondary px-2 py-0.5" aria-label="Search bag" />
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded bg-secondary px-1 py-0.5" aria-label="Sort bag">
              <option value="new">Newest</option><option value="rarity">Rarity</option><option value="level">Item level</option>
            </select>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {(() => {
              const view = hero.inventory.filter((it) => (filter === "all" || it.slot === filter) && (!q || it.name.toLowerCase().includes(q.toLowerCase())));
              if (sort === "rarity") view.sort((a, b) => b.rarity - a.rarity || b.ilvl - a.ilvl);
              if (sort === "level") view.sort((a, b) => b.ilvl - a.ilvl);
              const filtered = filter !== "all" || !!q;
              return Array.from({ length: filtered ? Math.max(view.length, 8) : invCap(hero) }).map((_, i) => [view[i], i] as const);
            })().map(([it, i]) => {
              return <ItemSlot key={it?.id ?? i} item={it} size={44} selected={!!it && sel?.id === it.id} onClick={() => it && setSel({ id: it.id, equipped: false })} />;
            })}
          </div>
          <Vault />
          <GearCodex cls={hero.cls} />
          {(() => {
            const all = Object.keys(MATS) as Mat[];
            const owned = all.filter((m) => matCount(hero, m) > 0);
            const total = owned.reduce((a, m) => a + matCount(hero, m), 0);
            return (
              <div className="mt-4">
                <div className="mb-1.5 font-display text-sm text-gold">Forge materials · {total} in your bag · {owned.length}/{all.length} types</div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {all.map((m) => (
                    <div key={m} className={"slot rarity-" + Math.min(MATS[m].rarity + 1, 5) + " flex items-center gap-2 p-1.5"} title={MATS[m].desc + " Source: " + MATS[m].src}>
                      <MatIcon mat={m} size={34} />
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-bold">{MATS[m].name}</div>
                        <div className="text-[10px] text-muted-foreground">×{fmt(matCount(hero, m))}{matCount(hero, m) ? " · Bag item" : " · Not found yet"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="mt-4 rounded border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground">
            Tap any bag or worn item and it opens on the spot — compare, equip, unequip or sell without scrolling down.
          </div>
        </div>
      </div>
      {selItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true"
          aria-label={`${selItem.name} details`} onClick={() => setSel(null)}>
          <div className="game-panel anim-pop w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <ItemCard
              item={selItem}
              compare={!sel?.equipped ? wornCompare(hero, selItem) : undefined}
              actions={sel?.equipped ? (
                <button className="btn-blood px-4 py-1.5 text-sm" onClick={() => { unequip(selItem); setSel(null); }}>Unequip</button>
              ) : (
                <>
                  <button className="btn-gold px-4 py-1.5 text-sm" onClick={() => { equip(selItem); setSel(null); }}>Equip</button>
                  <button className="btn-blood px-4 py-1.5 text-sm" onClick={() => { sell(selItem); setSel(null); }}>Sell <Gold n={sellValue(selItem)} /></button>
                </>
              )}
            />
            <button className="btn-ghost mt-3 w-full py-1.5 text-sm" onClick={() => setSel(null)}>Close</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Stat({ icon, v }: { icon: React.ReactNode; v: string }) {
  return <div className="slot flex items-center justify-center gap-1.5 py-1.5 font-bold">{icon}{v}</div>;
}

// ---------------- Campaign & Spire ----------------
export function Campaign({ onClose, start, spire }: { onClose: () => void; start: StartBattle; spire?: boolean }) {
  const { hero } = useGame();
  const [stage, setStage] = useState(spire ? hero?.spire ?? 1 : hero?.stage ?? 1);
  const [auto, setAuto] = useState(false);
  if (!hero) return null;
  const max = spire ? hero.spire : hero.stage;
  const mult = spire ? 1.35 : 1;
  // Enemies level up with the hero (see scaledFoe): old stages never become a free tutorial.
  const foe = scaledFoe(stageFoe(stage, mult), hero.level);
  const rw = stageRewards(stage, spire ? 2 : 1);
  const s = heroStats(hero);
  const foePower = foeRating(foe);
  const ratio = s.power / foePower;
  const danger = ratio > 1.3 ? { t: "Easy", c: "text-r1" } : ratio > 0.95 ? { t: "Fair", c: "text-r4" } : ratio > 0.7 ? { t: "Hard", c: "text-hp" } : { t: "Deadly", c: "text-blood" };
  const zone = zoneOf(stage);
  // Campaign Gate battles cost 20 stamina, spent on entry win or lose (see stamina.ts).
  const staminaCost = spire ? 0 : CAMPAIGN_STAMINA;
  const staminaLock = staminaCost ? staminaBlocker(hero, staminaCost) : null;

  const fight = () => {
    if (staminaLock) return;
    start({
      title: spire ? `Endless Conquest · Floor ${stage}` : `${zone.name} · Stage ${stage}`,
      auto,
      stamina: staminaCost || undefined,
      right: { ...foe, name: foe.boss ? `${foe.name}` : foe.name },
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["Defeated… grow stronger and return."] };
        const { grant, rollLoot, addLoot } = await import("./logic");
        let lines: string[] = [];
        let loot: Item | null = null;
        // Clearing a floor pays Conquest Tokens; deeper floors pay more. The gate pays no XP at
        // all — the Campaign Gate is the only place a hero earns levels.
        const tokens = spire ? floorTokens(stage) : 0;
        update((h) => {
          // Fighting above the hero's level pays catch-up XP (see catchUpXpFactor).
          // Non-campaign (Conquest) fights pay 30% XP but never enough to level up.
          const xp = spire
            ? Math.max(0, Math.min(Math.round(rw.xp * 0.3 * xpMultiplier), Math.max(0, xpToNext(h) - h.xp - 1)))
            : scrollXp(rw.xp * catchUpXpFactor(h.level, stage), xpMultiplier);
          const { levels } = grant(h, xp, rw.gold);
          loot = rollLoot(h, stage, foe.boss || spire ? 1 : 0.45, spire ? 2 : foe.boss ? 2 : 0);
          if (loot) addLoot(h, loot);
          if (tokens) addConquestTokens(h, tokens);
          if (spire && stage === h.spire) h.spire++;
          if (!spire && stage === h.stage) h.stage++;
          h.wins++;
          lines = [...(xp ? [`+${fmt(xp)} XP`] : []), `+${fmt(rw.gold)} gold`, ...(tokens ? [`+${tokens} Conquest Tokens`] : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        if (stage === max) setStage(stage + 1);
        return { lines, loot };
      },
    });
  };

  return (
    <Panel title={spire ? "Endless Conquest" : "Campaign Gate"} subtitle={spire ? "Every floor higher than the last" : "Endless stages — the world levels up with you"} art="quest" onClose={onClose}>
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="relative h-72 overflow-hidden rounded-lg">
          <img src={worldMap} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-background/55" aria-hidden="true" />
          <div className="absolute inset-x-10 bottom-2 h-8 rounded-full bg-blood/50 blur-xl" />
          <img src={foe.img} alt={foe.name} className="relative h-full w-full object-contain anim-idle" />
          {foe.boss && <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-blood px-2 py-0.5 font-display text-sm"><Skull className="h-4 w-4" />BOSS</div>}
        </div>
        <div className="space-y-3 text-center">
          <div className="text-sm uppercase tracking-widest text-muted-foreground">{spire ? `Floor` : `${zone.name}${zone.cycle > 1 ? ` · Cycle ${zone.cycle}` : ""}`}</div>
          <div className="flex items-center justify-center gap-3">
            <button className="btn-blood h-9 w-9" onClick={() => setStage(Math.max(1, stage - 1))}>‹</button>
            <span className="font-display text-5xl text-gold">{stage}</span>
            <button className="btn-blood h-9 w-9" disabled={stage >= max} onClick={() => setStage(Math.min(max, stage + 1))}>›</button>
          </div>
          <div className="font-display text-xl">{foe.name}</div>
          <div className="text-xs text-muted-foreground">Enemy level {foe.level}</div>
          <div className="flex justify-center gap-4 text-sm">
            <span><Trophy className="inline h-4 w-4 text-r4" /> {fmt(foePower)}</span>
            <span className={`font-bold ${danger.c}`}>{danger.t}</span>
          </div>
          <div className="flex justify-center gap-4">
            {spire
              ? <span className="font-bold text-gold">+{fmt(floorTokens(stage))} tokens</span>
              : <span className="font-bold text-xp">+{fmt(rw.xp)} XP</span>}
            <Gold n={rw.gold} />
            {(spire || foe.boss) && <span className="font-bold text-r2">Rare+ loot</span>}
          </div>
          <label className="flex items-center justify-center gap-2 text-sm">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[var(--gold)]" /> Auto-battle
          </label>
          {!!staminaCost && (
            <div className={`text-xs ${staminaLock ? "text-hp" : "text-muted-foreground"}`}>
              <b className="text-foreground">{staminaCost} stamina</b> per battle · {staminaLeft(hero)}/{STAMINA_PER_DAY} left ({Math.floor(staminaLeft(hero) / staminaCost)} battles)
            </div>
          )}
          <button className="btn-gold w-full py-3 text-xl" onClick={fight} disabled={!!staminaLock} title={staminaLock ?? "Fight"}>
            <Swords className="mr-2 inline" />{staminaLock ? "OUT OF STAMINA" : "FIGHT"}
          </button>
          {staminaLock && <p className="text-xs text-hp">{staminaLock}</p>}
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-1 font-display text-lg text-gold">Level up</div>
        <LevelProgress hero={hero} rows={3} />
      </div>
      {spire && <ConquestTokens hero={hero} />}
      {!spire && <CampaignBlitz hero={hero} />}
      <Advisor hero={hero} stats={s} foe={foe} key={stage + (spire ? "s" : "c")} />
    </Panel>
  );
}

// ---------------- Forge ----------------
export function Forge({ onClose, onCraft }: { onClose: () => void; onCraft?: () => void }) {
  const { hero } = useGame();
  const [selId, setSelId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [warn, setWarn] = useState<Item | null>(null);
  const [mode, setMode] = useState<"gold" | "stone" | "fate">("gold");
  const [stonePick, setStonePick] = useState<number | null>(null);
  const [q, setQ] = useState("");
  if (!hero) return null;
  // The stone the forge would use: whichever grade the player picked, else the best one held.
  const heldStones = heldStoneLevels(hero);
  const stoneLvl = stonePick !== null && heldStones.includes(stonePick) ? stonePick : (heldStones[heldStones.length - 1] ?? 1);
  const equipped = WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean) as Item[];
  const bagged = hero.inventory;
  const shown = bagged.filter((it) => !q || it.name.toLowerCase().includes(q.toLowerCase()));
  /** Selecting a piece also clears any half-finished salvage and the last result. */
  const pick = (id: string) => { setSelId(id); setArmed(null); setMsg(null); };
  const all: (Item & { eq?: boolean })[] = [
    ...equipped.map((i) => ({ ...i, eq: true })),
    ...bagged,
  ];
  const sel = all.find((i) => i.id === selId);
  /** Stone grade the selected piece's next step demands (see enchantStoneGrade). */
  const needGrade = sel ? enchantStoneGrade(sel) : 1;
  const equippedSel = !!sel && equipped.some((i) => i.id === sel.id);
  const salvage = () => {
    if (!sel) return;
    
    if (armed !== sel.id) { setArmed(sel.id); setMsg(null); return; }
    const gain = (Object.entries(scrapYield(sel)) as [Mat, number][]).map(([m, n]) => "+" + n + " " + MATS[m].name).join(" - ");
    update((h) => { scrapItem(h, sel.id); });
    setArmed(null);
    setSelId(null);
    setMsg({ ok: true, t: "Salvaged " + sel.name + ": " + gain });
  };
  // Salvaging worn gear takes a second, explicit confirmation and unequips it first.
  const salvageEquipped = () => {
    const it = warn;
    if (!it) return;
    const gain = (Object.entries(scrapYield(it)) as [Mat, number][]).map(([m, n]) => "+" + n + " " + MATS[m].name).join(" - ");
    update((h) => { unequipItem(h, it, invCap(h)); scrapItem(h, it.id); });
    setWarn(null);
    setArmed(null);
    setSelId(null);
    setMsg({ ok: true, t: "Unequipped and salvaged " + it.name + ": " + gain });
  };
  const enhance = () => {
    if (!sel || enhanceMaxed(sel)) return;
    // Past +13 the forge's plain rolls stop being enough: only Enchantment Stones carry gear deeper.
    if ((mode === "gold" || mode === "fate") && !goldEnhanceAllowed(sel)) {
      setMsg({ ok: false, t: `Beyond +${ENHANCE_GOLD_LIMIT} the forge only answers to Enchantment Stones` });
      return;
    }
    if (mode === "fate") {
      const fateCost = fateStoneCost(sel);
      if (fateStoneCount(hero) < fateCost) return;
      // Fate Stones carry their own luck: a flat lift on the plain roll, never a certainty.
      const ok = Math.random() < enhanceFateChance(sel);
      update((h) => {
        spendFateStones(h, fateCost);
        const pos = sel.eq ? posOf(h.equipment, sel.id) : undefined;
        const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
        if (target && ok) { target.enh++; recordEnhance(h, target.enh); }
      });
      setMsg(ok
        ? { ok, t: `Refined! +${sel.enh + 1} (Fate Stone)` }
        : { ok, t: `Fate turned — ${fateCost} stone${fateCost === 1 ? "" : "s"} spent` });
    } else if (mode === "stone") {
      const stoneCost = enchantStoneCost(sel);
      const needGrade = enchantStoneGrade(sel);
      if (stoneLvl < needGrade) { setMsg({ ok: false, t: `+${sel.enh} needs a Lv ${needGrade} Enchantment Stone` }); return; }
      if (stoneCount(hero, stoneLvl) < stoneCost) return;
      // Even the rarest stone never guarantees the step: the roll keeps its sliver of bad luck.
      const ok = Math.random() < enhanceStoneChance(sel, stoneLvl);
      // A failed roll sometimes leaves one stone unspent, so a bad attempt is not always a total loss.
      const survived = !ok && Math.random() < STONE_FAIL_SAVE_CHANCE ? 1 : 0;
      update((h) => {
        spendStones(h, stoneLvl, stoneCost - survived);
        const pos = sel.eq ? posOf(h.equipment, sel.id) : undefined;
        const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
        if (target && ok) { target.enh++; recordEnhance(h, target.enh); }
      });
      setMsg(ok
        ? { ok, t: `Success! +${sel.enh + 1} (Lv ${stoneLvl} stone)` }
        : { ok, t: survived ? "The stone cracked… failed — one stone survived" : "The stone cracked… failed" });
    } else {
      const cost = enhanceCost(sel, hero.level);
      if (hero.gold < cost) return;
      const ok = Math.random() < enhanceChance(sel);
      update((h) => {
        h.gold -= cost;
        const pos = sel.eq ? posOf(h.equipment, sel.id) : undefined;
        const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
        if (target && ok) { target.enh++; recordEnhance(h, target.enh); }
      });
      setMsg(ok ? { ok, t: `Success! +${sel.enh + 1}` } : { ok, t: "The metal cracked… failed" });
    }
  };
  return (
    <Panel title="Forge" subtitle="Enhance, socket and salvage your gear" art="hammer" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {onCraft && (
          <button className="btn-gold flex-1 px-3 py-2 text-sm" onClick={onCraft}>
            <Hammer className="mr-2 inline h-4 w-4" />Open crafting recipes · Standard &amp; Synthesis
          </button>
        )}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="slot px-2 py-1" title="Gold in your purse"><Gold n={hero.gold} /></span>
          <span className="slot px-2 py-1" title="Fate Stones refine gear instead of gold"><MatIcon mat="fateStone" size={16} /> <b className="text-gold">{fmt(fateStoneCount(hero))}</b> Fate</span>
          <span className="slot px-2 py-1" title={stoneName(stoneLvl) + " — the best grade you hold"}><StoneIcon level={stoneLvl} size={16} /> <b className="text-gold">{fmt(stoneCount(hero, stoneLvl))}</b> Lv {stoneLvl}</span>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="slot p-3">
            <div className="mb-2 flex items-center gap-2 font-display text-sm text-gold">
              <Shield className="h-4 w-4" />Worn gear
              <span className="ml-auto text-xs font-normal text-muted-foreground">{equipped.length} piece{equipped.length === 1 ? "" : "s"}</span>
            </div>
            {equipped.length
              ? <div className="grid grid-cols-4 content-start gap-1.5">{equipped.map((it) => <ForgeSlot key={it.id} item={it} selected={it.id === selId} onClick={() => pick(it.id)} />)}</div>
              : <p className="text-xs text-muted-foreground">Nothing equipped yet.</p>}
          </section>
          <section className="slot p-3">
            <div className="mb-2 flex items-center gap-2 font-display text-sm text-gold">
              <Backpack className="h-4 w-4" />In your bag
              <span className="ml-auto text-xs font-normal text-muted-foreground">{bagged.length} item{bagged.length === 1 ? "" : "s"}</span>
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your bag…" aria-label="Search forge bag"
              className="mb-2 w-full rounded bg-secondary px-2 py-1 text-xs" />
            {shown.length
              ? <div className="grid max-h-64 grid-cols-4 content-start gap-1.5 overflow-y-auto pr-1">{shown.map((it) => <ForgeSlot key={it.id} item={it} selected={it.id === selId} onClick={() => pick(it.id)} />)}</div>
              : <p className="text-xs text-muted-foreground">{bagged.length ? "No item matches that name." : "Your bag is empty."}</p>}
          </section>
          <p className="text-[11px] text-muted-foreground">Tap a piece to work on it. A gold badge on an icon counts the gems socketed in it.</p>
        </div>

        <div className="space-y-3">
          {msg && <div role="status" aria-live="polite" className={`anim-pop rounded-md border px-3 py-2 text-center font-display ${msg.ok ? "border-r1/60 bg-r1/10 text-r1" : "border-hp/60 bg-hp/10 text-hp"}`}>{msg.t}</div>}
          {sel ? (
            <>
              <ItemCard item={sel} />
              <section className="slot p-3">
                <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
                  <span>Enchantment <b className="text-gold">+{sel.enh}</b> / +{ENHANCE_MAX}</span>
                  {!enhanceMaxed(sel) && (mode === "gold" && !goldEnhanceAllowed(sel)
                    ? <span className="text-xs text-hp">Enchantment Stones required</span>
                    : <span>Chance <b className="text-gold">{Math.round((mode === "fate" ? enhanceFateChance(sel) : mode === "stone" ? enhanceStoneChance(sel, stoneLvl) : enhanceChance(sel)) * 100)}%</b>{mode === "stone" && <span className="ml-1 text-xs text-r1">+{stoneBonus(stoneLvl)}% Lv {stoneLvl} stone</span>}{mode === "fate" && <span className="ml-1 text-xs text-r1">+{Math.round(FATE_SUCCESS_BONUS * 100)}% fate</span>}</span>)}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs" role="group" aria-label="Enhancement method">
                  <button className={`py-1.5 ${mode === "gold" ? "btn-gold" : "btn-ghost"}`} aria-pressed={mode === "gold"} disabled={!goldEnhanceAllowed(sel)}
                    title={goldEnhanceAllowed(sel) ? "Pay gold for the next step" : `Gold stops at +${ENHANCE_GOLD_LIMIT} — use Enchantment Stones`}
                    onClick={() => setMode("gold")}>Gold</button>
                  <button className={`py-1.5 ${mode === "stone" ? "btn-gold" : "btn-ghost"}`} aria-pressed={mode === "stone"} onClick={() => setMode("stone")}>Enchantment Stone</button>
                  <button className={`py-1.5 ${mode === "fate" ? "btn-gold" : "btn-ghost"}`} aria-pressed={mode === "fate"} disabled={!goldEnhanceAllowed(sel)}
                    title={goldEnhanceAllowed(sel) ? "Refine with a Fate Stone" : `Fate refining stops at +${ENHANCE_GOLD_LIMIT} — use Enchantment Stones`}
                    onClick={() => setMode("fate")}>Fate Stone</button>
                </div>
                {mode === "gold" && (
                  <p className="mt-2 text-xs text-muted-foreground">Pays gold only. The chance shrinks as the piece climbs, and gold stops at +{ENHANCE_GOLD_LIMIT} — deeper steps need Enchantment Stones.</p>
                )}
                {mode === "fate" && (
                  <div className="slot mt-2 p-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-display text-gold"><MatIcon mat="fateStone" size={16} />Fate Stone</span>
                      <span className="text-muted-foreground">+{Math.round(FATE_SUCCESS_BONUS * 100)}% success</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Held <b className="text-gold">×{fmt(fateStoneCount(hero))}</b> — a refinement spends {fateStoneCost(sel)}, win or lose.
                      Fate Stones drop from rare battles and are sold in the Auction House shop.
                    </p>
                  </div>
                )}
                {mode === "stone" && (
                  <div className="slot mt-2 p-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-display text-gold">Stone grade</span>
                      <span className="text-muted-foreground">+{stoneBonus(stoneLvl)}% success</span>
                    </div>
                    <p className="mb-1 text-[11px] text-muted-foreground">
                      +{sel.enh} demands a <b className="text-gold">Lv {needGrade}</b> stone or better — the deeper the enchantment, the rarer the stone.
                    </p>
                    {heldStones.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No stones yet — battle wins drop them, and the Auction House shop sells all nine grades.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {heldStones.map((lvl) => (
                          <button key={lvl} className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${lvl === stoneLvl ? "border-gold text-gold" : "border-border"} ${lvl < needGrade ? "opacity-50" : ""}`}
                            title={lvl < needGrade ? `${stoneName(lvl)} is too weak for +${sel.enh}` : stoneName(lvl)}
                            disabled={lvl < needGrade}
                            onClick={() => setStonePick(lvl)}>
                            <StoneIcon level={lvl} size={16} /> ×{fmt(stoneCount(hero, lvl))}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!enhanceMaxed(sel) && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next step</span>
                    {mode === "fate"
                      ? <span className="flex items-center gap-1"><MatIcon mat="fateStone" size={18} /> {fmt(fateStoneCount(hero))}/{fateStoneCost(sel)} Fate Stone{fateStoneCost(sel) === 1 ? "" : "s"}</span>
                      : mode === "stone"
                      ? <span className="flex items-center gap-1"><StoneIcon level={stoneLvl} size={18} /> {fmt(stoneCount(hero, stoneLvl))}/{enchantStoneCost(sel)} Lv {stoneLvl}</span>
                      : goldEnhanceAllowed(sel)
                        ? <Gold n={enhanceCost(sel, hero.level)} />
                        : <span className="text-xs text-hp">Enchantment Stones required</span>}
                  </div>
                )}
                <button className="btn-gold mt-2 w-full py-3 text-lg" disabled={
                  enhanceMaxed(sel)
                  || (mode === "fate" ? !goldEnhanceAllowed(sel) || fateStoneCount(hero) < fateStoneCost(sel)
                    : mode === "stone" ? stoneLvl < needGrade || stoneCount(hero, stoneLvl) < enchantStoneCost(sel)
                      : !goldEnhanceAllowed(sel) || hero.gold < enhanceCost(sel, hero.level))} onClick={enhance}>
                  <Hammer className="mr-2 inline" />{enhanceMaxed(sel)
                    ? `Fully enhanced · +${ENHANCE_MAX}`
                    : mode === "gold" && !goldEnhanceAllowed(sel)
                      ? "Requires Enchantment Stones"
                      : `${mode === "fate" ? "Refine" : "Enhance"} +${sel.enh + 1}`}
                </button>
              </section>

              <section className="slot p-3">
                <div className="mb-2 flex items-center justify-between font-display text-sm">
                  <span className="flex items-center gap-2"><Gem className="h-4 w-4" />Gem sockets</span>
                  <span className="text-xs font-normal text-muted-foreground">{socketCount(sel)}/{MAX_SOCKETS} holes</span>
                </div>
                {socketCount(sel) === 0 ? (
                  <p className="text-xs text-muted-foreground">This piece has no sockets — Uncommon and better gear is born with them.</p>
                ) : (
                  <ul className="space-y-1">
                    {sockets(sel).map((g, i) => {
                      const gem = g ? parseGem(g) : null;
                      return (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          {gem ? (
                            <>
                              <GemIcon type={gem.type} size={16} />
                              <span className="font-bold">{gemName(g!)}</span>
                              <span className="ml-auto text-muted-foreground">{gemStatText(g!)}</span>
                            </>
                          ) : (
                            <>
                              <span className="h-4 w-4 rounded-sm border border-dashed border-border/70" />
                              <span className="text-muted-foreground">Empty socket {i + 1}</span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">Sockets are cut and filled at the Gem Workshop — every piece of gear can hold up to {MAX_SOCKETS} gems.</p>
              </section>

              <section className="slot p-3">
                <div className="mb-2 flex items-center gap-2 font-display text-sm"><Trash2 className="h-4 w-4" />Salvage into materials</div>
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  {(Object.entries(scrapYield(sel)) as [Mat, number][]).map(([m, n]) => (
                    <span key={m} className="slot px-2 py-0.5"><MatIcon mat={m} size={14} /> {MATS[m].name} +{n}</span>
                  ))}
                  {sockets(sel).some(Boolean) && <span className="slot px-2 py-0.5">Socketed gems return to your pouch</span>}
                </div>
                {equippedSel ? (
                  <>
                    <p className="mb-2 text-xs text-blood">This piece is equipped right now.</p>
                    <button className="btn-blood w-full py-2" onClick={() => { setWarn(sel); setArmed(null); }}>Salvage equipped gear...</button>
                  </>
                ) : (
                  <button className={"w-full py-2 " + (armed === sel.id ? "btn-blood" : "btn-ghost")} onClick={salvage}>
                    {armed === sel.id ? "Confirm - destroy " + sel.name : "Salvage this piece"}
                  </button>
                )}
              </section>
            </>
          ) : (
            <div className="slot flex min-h-[260px] flex-col items-center justify-center gap-2 p-6 text-center">
              <Hammer className="h-10 w-10 text-muted-foreground" />
              <p className="font-display text-lg">Choose a piece of gear</p>
              <p className="text-xs text-muted-foreground">Pick a worn or bagged item on the left to enhance it, check the gems inside it, or salvage it for materials.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="slot p-3">
          <div className="mb-2 flex items-center gap-2 font-display text-sm"><Sparkles className="h-4 w-4" />Enchantment stones</div>
          <p className="mb-2 text-xs text-muted-foreground">Two stones of one grade plus gold forge one of the next grade.</p>
          <div className="space-y-1">
            {heldStoneLevels(hero).filter((lvl) => lvl < STONE_LEVELS).map((lvl) => (
              <button key={lvl} className="btn-ghost flex w-full items-center justify-between gap-2 px-2 py-1 text-xs" disabled={stoneCount(hero, lvl) < 2 || hero.gold < combineGold(lvl, hero.level)}
                onClick={() => update((h) => { const e = combineStones(h, lvl); setMsg(!e ? { ok: true, t: `Forged a ${stoneName(lvl + 1)}` } : { ok: false, t: e }); })}>
                <span className="flex items-center gap-1"><StoneIcon level={lvl} size={16} /> ×2 <span className="text-muted-foreground">({fmt(stoneCount(hero, lvl))} held)</span></span>
                <span className="flex items-center gap-1 text-gold">→ <StoneIcon level={lvl + 1} size={16} /> <Gold n={combineGold(lvl, hero.level)} /></span>
              </button>
            ))}
            {heldStoneLevels(hero).filter((lvl) => lvl < STONE_LEVELS).length === 0 && (
              <p className="text-xs text-muted-foreground">Nothing to forge yet — stones drop from won battles and are sold in the Auction House shop.</p>
            )}
          </div>
          {heldStoneLevels(hero).some((lvl) => lvl < STONE_LEVELS && stoneCount(hero, lvl) >= 2) && (
            <button className="btn-ghost mt-2 flex w-full items-center justify-center gap-1 px-2 py-1 text-xs"
              title="Forge every pair you hold into the next grade"
              onClick={() => update((h) => {
                const r = combineAllStones(h);
                setMsg(r.made
                  ? { ok: true, t: `Forged ${r.made} stone${r.made === 1 ? "" : "s"} into higher grades` }
                  : { ok: false, t: r.error ?? "No pairs to forge" });
              })}>
              <Layers className="h-3.5 w-3.5" />Forge every pair
            </button>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">A stone that fails an enchantment survives {Math.round(STONE_FAIL_SAVE_CHANCE * 100)}% of the time, so a bad roll still keeps one in the pouch.</p>
        </section>

        <section className="slot p-3">
          <div className="mb-2 flex items-center gap-2 font-display text-sm"><Sparkles className="h-4 w-4" />Refine spare materials</div>
          <div className="space-y-2">
            {REFINE.map((r) => (
              <button key={r.id} className="btn-ghost flex w-full items-center justify-between gap-2 px-2 py-1.5 text-xs" disabled={matCount(hero, r.from) < r.need}
                onClick={() => update((h) => { const err = refine(h, r.id); setMsg(err ? { ok: false, t: err } : { ok: true, t: "Refined: +" + r.gain + " " + MATS[r.to].name }); })}>
                <span className="flex items-center gap-1"><MatIcon mat={r.from} size={16} /> {MATS[r.from].name} ×{r.need}</span>
                <span className="flex items-center gap-1 text-gold">→ <MatIcon mat={r.to} size={16} /> {MATS[r.to].name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Spare materials from battles refine into the ones recipes need.</p>
        </section>
      </div>
      {warn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="alertdialog" aria-modal="true" aria-label="Confirm salvaging equipped gear">
          <div className="game-panel anim-pop w-full max-w-md p-5">
            <div className="mb-2 flex items-center gap-2 font-display text-xl text-blood"><Trash2 className="h-5 w-5" />This gear is equipped</div>
            <p className="text-sm"><b>{warn.name}</b> is worn right now. Salvaging it will unequip and permanently destroy it, returning its materials and socketed gems. This cannot be undone.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-ghost flex-1 py-2" onClick={() => setWarn(null)}>Keep it equipped</button>
              <button className="btn-blood flex-1 py-2" onClick={salvageEquipped}>Unequip and destroy</button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

/** One gear tile in the Forge's picker, badged with how many gems it carries. */
function ForgeSlot({ item, selected, onClick }: { item: Item; selected: boolean; onClick: () => void }) {
  const gems = sockets(item).filter(Boolean).length;
  return (
    <span className="relative inline-flex">
      <ItemSlot item={item} size={40} selected={selected} onClick={onClick} />
      {gems > 0 && (
        <span title={`${gems} gem${gems === 1 ? "" : "s"} socketed`}
          className="pointer-events-none absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full border border-gold/70 bg-background px-1 py-px text-[9px] font-bold leading-none text-gold">
          <Gem className="h-2.5 w-2.5" />{gems}
        </span>
      )}
    </span>
  );
}

// ---------------- Temple ----------------
const ATTRS: { k: Attr; name: string; icon: React.ReactNode; d: string }[] = [
  { k: "str", name: "Strength", icon: <Swords className="h-8 w-8 text-gold" />, d: "+Phys attack, phys def, crit dmg, pen" },
  { k: "int", name: "Intelligence", icon: <Sparkles className="h-8 w-8 text-r3" />, d: "+Magic attack, magic def, pen" },
  { k: "agi", name: "Agility", icon: <Clover className="h-8 w-8 text-r1" />, d: "+Crit, dodge, accuracy, loot" },
  { k: "vit", name: "Vitality", icon: <Heart className="h-8 w-8 text-hp" />, d: "+Most health, both defenses" },
];
export function Temple({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<"attributes" | "drills" | "mastery" | "upgrade">("attributes");
  const [count,setCount]=useState(1);
  if (!hero) return null;
  const s = heroStats(hero);
  return (
    <Panel title="Barracks — Attribute Training" subtitle="Turn gold into permanent stats" art="profile" onClose={onClose} wide>
      <GameTabs label="Barracks sections" value={tab} onChange={setTab} tabs={[
        { id: "attributes", name: "Attributes" },
        { id: "drills", name: "Drills" },
        { id: "mastery", name: "Mastery" },
        { id: "upgrade", name: "Upgrade", badge: hero.gold >= barracksCost(barracksLevel(hero), hero.level) ? 1 : undefined },
      ]} />

      {tab === "attributes" && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            {([["Health", fmt(s.hp), "text-hp"], ["Attack", fmt(s.atk), "text-gold"], ["Defense", fmt(s.def), ""]] as const).map(([label, v, cls]) => (
              <div key={label} className="slot p-2">
                <div className={`font-display text-lg ${cls}`}>{v}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <div className="mb-1 font-display text-sm text-gold">Attribute training</div>
          <div role="group" aria-label="Training batch" className="mb-4 flex flex-wrap gap-2">{batchSizes(hero).map(n=><Button key={n} size="sm" variant={count===n?'default':'outline'} aria-pressed={count===n} onClick={()=>setCount(n)}>+{n} points</Button>)}</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ATTRS.map((a) => {
              const cost = trainingCost(hero,a.k,count);
              return (
                <div key={a.k} className="slot flex flex-col items-center gap-2 p-4 text-center">
                  {a.icon}
                  <div className="font-display">{a.name}</div>
                  <div className="font-display text-3xl text-gold">{hero.attrs[a.k]}</div>
                  <div className="text-xs text-muted-foreground">{a.d}</div>
                  <Button className="w-full" disabled={hero.gold < cost} onClick={() => update((h) => { trainAttribute(h,a.k,count); })}>
                    <Gold n={cost} className="text-primary-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
          <StatTrainings hero={hero} />
        </div>
      )}

      {tab === "drills" && <DrillTracks hero={hero} />}

      {tab === "mastery" && (
        <div>
          <AdvancedTraining hero={hero} />
          <EnlightenmentTraining hero={hero} />
          <SoulForge hero={hero} />
        </div>
      )}

      {tab === "upgrade" && <BarracksUpgrade hero={hero} />}
    </Panel>
  );
}

// ---------------- Quest Board (daily commissions) ----------------
/** The old AI oracle is gone: the board is six fixed daily commissions that reset at Greek midnight. */
export function Oracle(props: { onClose: () => void; start?: StartBattle }) {
  return <QuestBoard onClose={props.onClose} />;
}

/** The top-left HUD's XP readout: the exact numbers, the bar, and what the next level really asks. */
export function XpBar({ hero }: { hero: Hero }) {
  const need = xpToNext(hero);
  const pct = Math.min(100, Math.max(0, (hero.xp / Math.max(1, need)) * 100));
  const left = fightsToNextLevel(hero);
  const next =
    hero.level >= MAX_LEVEL ? `Ascension ${hero.paragon + 1}` : `level ${hero.level + 1}`;
  return (
    <div className="hud-xp" title={`${fmt(hero.xp)} / ${fmt(need)} XP · ${left} fight${left === 1 ? "" : "s"} to ${next}`}>
      <div className="mb-0.5 flex items-baseline justify-between gap-1 text-[10px] leading-none">
        <span className="truncate font-bold text-xp">
          {fmt(hero.xp)}
          <span className="text-muted-foreground"> / {fmt(need)} XP</span>
        </span>
        <span className="shrink-0 font-bold text-foreground/80">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
      </div>
      <div
        className="bar-track hud-xp-track w-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`Experience toward ${next}`}
      >
        <div className="bar-xp h-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        <span className="truncate">
          {left} fight{left === 1 ? "" : "s"} → {next}
        </span>
        <span className="shrink-0 text-gold/90" title="XP a fight at your own level pays before scrolls and catch-up bonuses">
          {fmt(xpPerFight(hero.level))} xp/fight
        </span>
      </div>
    </div>
  );
}

export function Advisor({ hero, stats, foe }: { hero: Hero; stats: Stats; foe: Foe }) {
  const { userId } = useGame();
  const ask = useServerFn(adviseStrategy);
  const [advice, setAdvice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setErr(null); setAdvice(null);
    try {
      const r = await ask({ data: {
        heroClass: hero.cls, level: hero.level + hero.paragon,
        hero: { hp: stats.hp, atk: stats.atk, def: stats.def, crit: stats.crit, dodge: stats.dodge },
        enemy: { name: foe.name, level: foe.level, boss: !!foe.boss, hp: foe.hp, atk: foe.atk, def: foe.def, crit: foe.crit, dodge: foe.dodge },
        skills: ["Basic Attack: 100% dmg"],
      } });
      if (r.error) setErr(r.error); else setAdvice(r.advice);
    } catch { setErr("The tactician is silent, try again"); }
    setLoading(false);
  };
  return (
    <div className="slot mt-5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-gold"><Sparkles className="mr-1 inline h-4 w-4" />War Tactician</span>
        {userId ? (
          <button className="btn-blood px-4 py-1.5 text-sm" disabled={loading} onClick={run}>{loading ? "Thinking…" : "Get strategy"}</button>
        ) : <Link to="/auth" className="btn-gold px-4 py-1.5 text-sm">Sign in</Link>}
      </div>
      {err && <p className="mt-2 text-sm text-hp">{err}</p>}
      {advice && <p className="anim-pop mt-2 whitespace-pre-line text-sm">{advice}</p>}
    </div>
  );
}

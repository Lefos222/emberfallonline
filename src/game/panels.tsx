import xpScrollArt from "@/assets/xp-scroll.webp";
import { warDropKind, capDropBundle } from "./war-drops";
import { RoseItem } from "./Roses";
import { roseCount } from "./friendship";
import { xpScrollValue } from "./xp-scrolls";
import { itemName, tName , t} from "./i18n";
import { useState, type ReactNode, type DragEvent } from "react";
import { Button } from '@/components/ui/button';
import { trainingCost, trainAttribute } from './building-content';
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Clover, Sparkles, Trophy, Gem, Hammer, Trash2, Skull, Backpack, Layers } from "lucide-react";
import { Shield, Swords } from "./PaintedIcons";
import { supabase } from "@/integrations/supabase/client";
import { recordEnhance } from "./progress";
import {
  SKILLS, heroSkills, type Foe, CLASSES, enhanceChance, enhanceCost, enhanceMaxed, enhanceStoneChance, enchantStoneCost, goldEnhanceAllowed, ENHANCE_MAX, REFINE_STAT_BONUS, refineRank, heroStats, invCap, bagSize, matSlots, MAT_STACK, bagRowCost, MAX_BAG_ROWS, sellValue,
  CONQUEST_LEVEL, MAX_LEVEL, SLOTS, WEAR_SLOTS, WEAR_LABEL, wearOf, equipItem, unequipItem, wornCompare, posOf, powerBreakdown, stageFoe, stageRewards, campaignFightRewards, xpToNext, xpPerFight, fightsToNextLevel, zoneOf, foeRating, type Attr, type EnemyType, type Hero, type Item, type Slot, type Stats, type WearSlot,
} from "./data";
import {
  addConquestTokens, CONQUEST_XP_RATE, conquestDropFloor, conquestFoe, conquestKeyActive,
  conquestRewardMultiplier, conquestTokens, floorTokens,
} from "./conquest";
import { floorRequirement, floorTargets, type GateKind } from "./floor-rating";
import { CAMPAIGN_STAMINA, staminaBlocker, staminaLeft } from "./stamina";
import { ConquestTokens } from "./ConquestGate";
import { CampaignBlitz } from "./CampaignBlitz";
import { LevelProgress } from "./LevelCurve";
import { update, useGame } from "./store";
import { GameTabs, Gold, InfoTip, ItemCard, ItemSlot, Panel, fmt } from "./ui";
import { WtButton, WtFrame, WtWindow } from "./wartune";
import { ConquestCoin } from "./CoinIcon";
import { DangerPill, FloorLadder, StageStepper, StaminaMeter, VERDICT_STYLE } from "./GateUI";
import { prepareFoe } from "./foe-scaling";
import { forecastFight } from "./battle-advice";
import { GemIcon, MatIcon, StoneIcon } from "./MatIcon";
import { Vault, vaultTiles, type VaultPick } from "./Vault";
import { GearCodex } from "./GearCodex";
import { MAX_SOCKETS, MATS, REFINE, addMats, gemName, gemStatText, matCount, parseGem, refine, scrapItem, scrapYield, socketCount, sockets, type Mat } from "./crafting";
import { STONE_FAIL_SAVE_CHANCE, STONE_LEVELS, combineAllStones, combineGold, combineStones, heldStoneLevels, spendStones, stoneBonus, stoneCount, stoneName } from "./enchant";
import { FATE_SUCCESS_BONUS, fateRefineChance, fateStoneCost, fateStoneCount, spendFateStones } from "./fate";
import worldMap from "@/assets/world-map.jpg";
import type { Fighter } from "./Battle";
import { scrollXp } from "./scrolls";
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
  const [vpick, setVpick] = useState<VaultPick | null>(null);
  const [filter, setFilter] = useState<Slot | "all">("all");
  const [sort, setSort] = useState<"new" | "rarity" | "level">("new");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"equipment" | "profile">("equipment");
  const [page, setPage] = useState(0);
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
  /** PC drag and drop: drag a bag item onto a worn slot to wear it, a worn item onto the bag to take it off. */
  const dropOnWear = (e: DragEvent, sl: WearSlot) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/ef-bag");
    const it = id ? hero.inventory.find((i) => i.id === id) : undefined;
    if (it && wearOf(it.slot).includes(sl)) { equip(it, sl); setSel({ id: it.id, equipped: true }); }
  };
  const dropOnBag = (e: DragEvent) => {
    const id = e.dataTransfer.getData("text/ef-worn");
    if (!id) return;
    e.preventDefault();
    const it = Object.values(hero.equipment).find((i) => i?.id === id);
    if (it) { unequip(it); setSel(null); }
  };
  const sell = (it: Item) => update((h) => { h.inventory = h.inventory.filter((i) => i.id !== it.id); h.gold += sellValue(it); });

  const leftStats: [string, string][] = [
    [t("Strength"), String(hero.attrs.str)],
    [t("Intellect"), String(hero.attrs.int)],
    [t("Agility"), String(hero.attrs.agi)],
    [t("Vitality"), String(hero.attrs.vit)],
    [t("Penetration"), `${s.pen}%`],
    [t("Accuracy"), `${s.acc}%`],
    [t("Evasion"), `${s.dodge}%`],
  ];
  const rightStats: [string, string][] = [
    ["PATK", fmt(s.patk)],
    ["PDEF", fmt(s.pdef)],
    ["MATK", fmt(s.matk)],
    ["MDEF", fmt(s.mdef)],
    [t("Crit"), `${s.crit}%`],
    [t("Block"), `${s.block}%`],
    ["HP", fmt(s.hp)],
    [t("Battle Rating"), fmt(s.power)],
  ];
  // The bag grid is paged like the game's own inventory: gear first, then materials and the vault.
  const PAGE_SIZE = 24;
  const bagView = hero.inventory.filter((it) => (filter === "all" || it.slot === filter) && (!q || it.name.toLowerCase().includes(q.toLowerCase())));
  if (sort === "rarity") bagView.sort((a, b) => b.rarity - a.rarity || b.ilvl - a.ilvl);
  if (sort === "level") bagView.sort((a, b) => b.ilvl - a.ilvl);
  const bagCells: ReactNode[] = bagView.map((it) => (
    <div key={it.id} className="wt-cell" draggable title={t("Drag onto your hero to equip · right-click to equip")}
      onDragStart={(e) => e.dataTransfer.setData("text/ef-bag", it.id)}
      onContextMenu={(e) => { e.preventDefault(); equip(it); setSel(null); }}>
      <ItemSlot item={it} size={36} selected={sel?.id === it.id} onClick={() => setSel({ id: it.id, equipped: false })} />
    </div>
  ));
  if (filter === "all" && !q) {
    if (roseCount(hero) > 0) bagCells.push(<div key="roses" className="wt-cell"><RoseItem compact /></div>);
    vaultTiles(hero, vpick, (p) => { setVpick(p); setSel(null); }).forEach((tile, i) => bagCells.push(<div key={"vault" + i} className="wt-cell">{tile}</div>));
    (Object.keys(MATS) as Mat[]).forEach((m) => {
      const n = matCount(hero, m);
      if (n <= 0) return;
      for (let k = 0; k < Math.ceil(n / MAT_STACK); k++) {
        const here = Math.min(MAT_STACK, n - k * MAT_STACK);
        bagCells.push(
          <div key={m + k} className="wt-cell">
            <InfoTip title={`${MATS[m].name} ×${fmt(here)}`} lines={[MATS[m].desc, `${t("Found:")} ${MATS[m].src}`]}>
              <button type="button" aria-label={`${MATS[m].name}, ${here}`} className={"slot bag-mat rarity-" + Math.min(MATS[m].rarity + 1, 5)} style={{ width: 40, height: 40 }}>
                <MatIcon mat={m} size={30} /><span className="bag-mat-count">{here >= 1000 ? `${Math.floor(here / 1000)}k` : here}</span>
              </button>
            </InfoTip>
          </div>,
        );
      }
    });
  }
  const bagFilled = filter !== "all" || q ? bagCells.length : Math.max(bagCells.length, invCap(hero));
  const pageCount = Math.max(1, Math.ceil(bagFilled / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount - 1);
  const pageCells = Array.from({ length: PAGE_SIZE }, (_, i) => bagCells[pageSafe * PAGE_SIZE + i] ?? <div key={"ph" + i} className="wt-cell" />);

  return (
    <WtWindow
      title={title}
      onClose={onClose}
      tabs={[
        { id: "equipment" as const, name: t("Equipment") },
        { id: "profile" as const, name: t("Profile") },
      ]}
      value={tab}
      onChange={setTab}
    >
      {tab === "equipment" ? (
        <div className="grid items-start gap-3 lg:grid-cols-[185px_minmax(0,1fr)_320px]">
          {/* The hero's general attributes, listed the way the game's window does. */}
          <div className="wt-inset p-2">
            <div className="wt-heading">{t("General")}</div>
            <div className="mb-1 mt-1 flex items-center gap-1 text-[10px]">
              <button className="text-gold underline decoration-dotted" onClick={() => setTab("profile")}>{t("Change Title")}</button>
              <span className="text-white/30">·</span>
              <button className="text-white/60" onClick={() => setTab("profile")}>{t("Title Info")}</button>
            </div>
            <ul className="space-y-0.5 text-[11px]">
              {leftStats.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-white/5 pb-0.5">
                  <span className="text-white/70">{k}</span><b className="text-r1">{v}</b>
                </li>
              ))}
            </ul>
            <ul className="mt-2 space-y-0.5 text-[11px]">
              {rightStats.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-white/5 pb-0.5">
                  <span className="text-white/70">{k}</span><b className="text-r1">{v}</b>
                </li>
              ))}
            </ul>
          </div>

          {/* The hero, ringed by the worn slots, over a starfield. */}
          <div className="flex flex-col items-center">
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5">
              <div className="flex flex-col gap-1.5">
                {LEFT_DOLL.map((sl) => (
                  <div key={sl} draggable={!!hero.equipment[sl]} onDragStart={(e) => { const w = hero.equipment[sl]; if (w) e.dataTransfer.setData("text/ef-worn", w.id); }}
                    onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropOnWear(e, sl)}>
                    <ItemSlot item={hero.equipment[sl]} size={46} empty={WEAR_LABEL[sl]} selected={sel?.id === hero.equipment[sl]?.id} onClick={() => wearClick(sl)} />
                  </div>
                ))}
              </div>
              <div className="wt-nebula relative mx-auto h-[290px] w-full max-w-[260px]">
                <CharacterPose cls={hero.cls} gender={gender} className="relative z-10 h-full w-full" {...heroAppearance(hero, gender)} />
              </div>
              <div className="flex flex-col gap-1.5">
                {RIGHT_DOLL.map((sl) => (
                  <div key={sl} draggable={!!hero.equipment[sl]} onDragStart={(e) => { const w = hero.equipment[sl]; if (w) e.dataTransfer.setData("text/ef-worn", w.id); }}
                    onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropOnWear(e, sl)}>
                    <ItemSlot item={hero.equipment[sl]} size={46} empty={WEAR_LABEL[sl]} selected={sel?.id === hero.equipment[sl]?.id} onClick={() => wearClick(sl)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="wt-nameplate text-sm">
                {t("Lvl.")} {hero.level} {hero.name}
                {hero.paragon > 0 && <span className="text-gold"> · {t("Ascension")} {hero.paragon}</span>}
              </div>
              <div className="wt-battle-rating mt-0.5 text-lg">{t("Battle Rating")}: {fmt(s.power)}</div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <WtButton className="px-3 py-1 text-[11px]" onClick={() => setTab("profile")}>{t("Stats")}</WtButton>
              {(hero.xpScrolls ?? 0) > 0 && (
                <WtButton className="px-3 py-1 text-[11px]" title={t("Read one XP Scroll")}
                  onClick={() => void import("./logic").then(({ grant }) => update((h) => { if ((h.xpScrolls ?? 0) <= 0) return; h.xpScrolls = (h.xpScrolls ?? 0) - 1; grant(h, xpScrollValue(h.level), 0); }))}>
                  {t("Read XP Scroll")} ×{hero.xpScrolls}
                </WtButton>
              )}
              {(hero.bagRows ?? 0) < MAX_BAG_ROWS && (
                <WtButton className="px-3 py-1 text-[11px]" disabled={hero.gold < bagRowCost(hero)} title={t("Adds one more row of bag slots")}
                  onClick={() => update((h) => { const c = bagRowCost(h); if (h.gold < c || (h.bagRows ?? 0) >= MAX_BAG_ROWS) return; h.gold -= c; h.bagRows = (h.bagRows ?? 0) + 1; })}>
                  {t("+ Row (")}{fmt(bagRowCost(hero))}{t("gold)")}
                </WtButton>
              )}
            </div>
          </div>

          {/* The bag: paged slots, then the sell and sort row. */}
          <div>
            <div className="flex items-end justify-between">
              <span className="wt-heading border-0 pb-0">{t("Bag")}</span>
              <span className="text-[11px] text-white/70">{hero.inventory.length + matSlots(hero)}/{bagSize(hero)}</span>
            </div>
            <div className="wt-pages mt-1" role="tablist" aria-label={t("Bag")}>
              {Array.from({ length: pageCount }, (_, i) => (
                <button key={i} role="tab" aria-selected={i === pageSafe} className="wt-page" onClick={() => setPage(i)}>{i + 1}</button>
              ))}
            </div>
            {(hero.overflow?.length ?? 0) > 0 && (
              <div className="mb-1 flex items-center justify-between gap-1 rounded border border-gold/60 bg-gold/10 px-2 py-1 text-[10px]">
                <span>{t("Overflow Chest:")} <b>{hero.overflow!.length}</b></span>
                <button className="wt-btn px-2 py-0.5 text-[10px]" disabled={hero.inventory.length >= invCap(hero)}
                  onClick={async () => { const { claimOverflow } = await import("./logic"); update((h) => { claimOverflow(h); }); }}>{t("Claim")}</button>
              </div>
            )}
            <div className="wt-grid mt-1" onDragOver={(e) => { if (e.dataTransfer.types.includes("text/ef-worn")) e.preventDefault(); }} onDrop={dropOnBag}>
              {pageCells}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <button className="wt-btn px-2 py-1 text-[10px]" onClick={() => update((h) => {
                const junk = h.inventory.filter((i) => i.rarity <= 1 && i.enh === 0);
                h.gold += junk.reduce((a, i) => a + sellValue(i), 0);
                h.inventory = h.inventory.filter((i) => !(i.rarity <= 1 && i.enh === 0));
              })}>
                <Trash2 className="mr-1 inline h-3 w-3" />{t("Sell")}
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t("Sort bag")}
                className="rounded border border-gold/40 bg-[#24100b] px-1 py-1 text-[10px] text-foreground">
                <option value="new">{t("Newest")}</option><option value="rarity">{t("Rarity")}</option><option value="level">{t("Item level")}</option>
              </select>
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={t("Search…")} aria-label={t("Search bag")}
                className="ml-auto w-20 rounded border border-gold/40 bg-[#24100b] px-1.5 py-1 text-[10px]" />
            </div>
            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
              {(["all", ...SLOTS] as const).map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                  className={`rounded px-1.5 py-0.5 ${filter === f ? "bg-gold text-background" : "border border-gold/30 text-white/70"}`}>
                  {f === "all" ? t("All") : SLOT_LABEL[f]}
                </button>
              ))}
            </div>
            <Vault pick={vpick} setPick={setVpick} />
            <GearCodex cls={hero.cls} />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="wt-inset p-3">
            <div className="wt-heading">{t("Attributes")}</div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              {([
                ["Health", fmt(s.hp)], ["Battle Rating", fmt(s.power)],
                ["Physical attack", fmt(s.patk)], ["Magic attack", fmt(s.matk)],
                ["Physical defense", fmt(s.pdef)], ["Magic defense", fmt(s.mdef)],
                ["Critical chance", `${s.crit}%`], ["Critical damage", `${s.critDmg}%`],
                ["Armor penetration", `${s.pen}%`], ["Accuracy", `${s.acc}%`],
                ["Evasion", `${s.dodge}%`], ["XP", `${fmt(hero.xp)} / ${fmt(xpToNext(hero))}`],
              ] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-0.5"><span className="text-white/60">{k}</span><span className="font-bold">{v}</span></div>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-white/60">
              {t("Str")} {hero.attrs.str} {t("· Int")} {hero.attrs.int} {t("· Agi")} {hero.attrs.agi} {t("· Vit")} {hero.attrs.vit}
            </div>
          </div>
          <div className="wt-inset p-3">
            <div className="wt-heading"><Trophy className="mr-1 inline h-3.5 w-3.5" />{t("Battle Rating sources")}</div>
            <div className="mt-2 space-y-0.5 text-xs">
              {powerBreakdown(hero).map((p) => (
                <div key={p.label} className="flex justify-between border-b border-white/5 py-0.5"><span className="text-white/60">{p.label}</span><span className="font-bold text-gold">+{fmt(p.power)}</span></div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/60">
              {hero.level < CONQUEST_LEVEL ? `Conquest unlocks at level ${CONQUEST_LEVEL}` : hero.level < MAX_LEVEL ? `Ascension begins at level ${MAX_LEVEL}` : `Ascending — each level grants +2% to all stats`}
            </p>
          </div>
        </div>
      )}
      {selItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true"
          aria-label={`${itemName(selItem.name)} details`} onClick={() => setSel(null)}>
          <div className="game-panel anim-pop w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <ItemCard
              item={selItem}
              compare={!sel?.equipped ? wornCompare(hero, selItem) : undefined}
              actions={sel?.equipped ? (
                <button className="btn-blood px-4 py-1.5 text-sm" onClick={() => { unequip(selItem); setSel(null); }}>{t("Unequip")}</button>
              ) : (
                <>
                  <button className="btn-gold px-4 py-1.5 text-sm" onClick={() => { equip(selItem); setSel(null); }}>{t("Equip")}</button>
                  <button className="btn-blood px-4 py-1.5 text-sm" onClick={() => { sell(selItem); setSel(null); }}>{t("Sell")} <Gold n={sellValue(selItem)} /></button>
                </>
              )}
            />
            <button className="btn-ghost mt-3 w-full py-1.5 text-sm" onClick={() => setSel(null)}>{t("Close")}</button>
          </div>
        </div>
      )}
    </WtWindow>
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
  const [tab, setTab] = useState<"battle" | "extras">("battle");
  if (!hero) return null;
  const max = spire ? hero.spire : hero.stage;
  /** Which gate's ladder this is: the Conquest Gate answers to its own floor curve (see conquest.ts). */
  const gate: GateKind = spire ? "conquest" : "campaign";
  // Every fight the gate starts is prepared the same way the battle itself prepares it (see
  // prepareFoe). Monsters keep the numbers they were built with — the ladder is the difficulty —
  // so the preview is exactly the fight the player gets.
  const foe = prepareFoe(spire ? conquestFoe(stage) : stageFoe(stage));
  // A cleared campaign stage is a replay: it still pays, but at a reduced share (see campaignFightRewards).
  const rw = spire ? stageRewards(stage, 2) : campaignFightRewards(hero.level, stage, hero.stage);
  const replay = !spire && "replay" in rw && Boolean(rw.replay);
  // Today's Conquest Key doubles every Conquest Gate payout (see conquest.ts).
  const keyOn = spire && conquestKeyActive(hero);
  const keyMult = keyOn ? 2 : 1;
  const s = heroStats(hero);
  const foePower = foeRating(foe);
  // One forecast of the real fight (see battle-advice.ts) drives the verdict pill, so the pill and
  // the fight can never disagree.
  const forecast = forecastFight(s, foe);
  const danger = VERDICT_STYLE[forecast.verdict];
  // What this floor asks of a hero at the player's level, and the whole ladder around it (see
  // floor-rating.ts): the reference player's own forecast, so the number does not move when the
  // hero buys a new piece of gear — the requirement belongs to the floor, not to the viewer.
  const required = floorRequirement(gate, stage, hero.level, hero.paragon);
  const covered = s.power >= required;
  const ladder = floorTargets(
    gate,
    Array.from({ length: max + 5 }, (_, i) => i + 1),
    hero,
    s.power,
  );
  const zone = zoneOf(stage);
  // Campaign Gate battles cost 20 stamina, spent on entry win or lose (see stamina.ts).
  const staminaCost = spire ? 0 : CAMPAIGN_STAMINA;
  const staminaLock = staminaCost ? staminaBlocker(hero, staminaCost) : null;
  const cleared = Math.max(0, max - 1);
  // Where the chosen stage sits inside its ten-stage zone, and the next boss stage ahead of it.
  const stageInZone = ((stage - 1) % 10) + 1;
  const nextBoss = (Math.floor(stage / 10) + 1) * 10;
  const jump = (n: number) => setStage(Math.max(1, Math.min(Math.max(1, max), Number.isFinite(n) ? Math.floor(n) : 1)));

  const fight = () => {
    if (staminaLock) return;
    // Auto-battle is chosen for this fight only: the switch clears itself once the hero is sent
    // off, so a later fight never starts fighting on its own from a switch left on earlier.
    const autoThisFight = auto;
    setAuto(false);
    start({
      title: spire ? `Endless Conquest · Floor ${stage}` : `${zone.name} · Stage ${stage}`,
      auto: autoThisFight,
      stamina: staminaCost || undefined,
      // The battle prepares the foe exactly as this preview did, so the shown fight is the real one.
      right: { ...foe, name: tName(foe.name) },
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["Defeated… grow stronger and return."] };
        const { grant, rollLoot, addLoot } = await import("./logic");
        let lines: string[] = [];
        let loot: Item | null = null;
        // Clearing a floor pays Conquest Tokens; deeper floors pay more, and today's Conquest Key
        // doubles both the floor's gold and its tokens. The gate pays no XP at all — the Campaign
        // Gate is the only place a hero earns levels.
        const keyMult = spire ? conquestRewardMultiplier(hero) : 1;
        const tokens = spire ? floorTokens(stage) * keyMult : 0;
        const gold = spire ? Math.round(rw.gold * keyMult) : rw.gold;
        update((h) => {
          // Both gates pay from the hero's own level, never from the stage number: the frontier can
          // run far ahead of the level, and a stage-priced payout would fill the bar in a handful of
          // fights (see campaignFightRewards). Conquest pays CONQUEST_XP_RATE of it, capped below a
          // level-up — the Campaign Gate is where levels are earned.
          const xp = spire
            ? Math.max(0, Math.min(Math.round(xpPerFight(h.level) * CONQUEST_XP_RATE * xpMultiplier), Math.max(0, xpToNext(h) - h.xp - 1)))
            : scrollXp(campaignFightRewards(h.level, stage, h.stage).xp, xpMultiplier);
          const { levels } = grant(h, xp, gold);
          // A Conquest floor no longer guarantees Rare gear: its rarity floor is rolled (see conquestDropFloor).
          if (warDropKind() === "gear") loot = rollLoot(h, stage, 1, spire ? conquestDropFloor() : foe.boss ? 2 : 0);
          else addMats(h, capDropBundle({ ...(stage >= 10 ? { hide: 1, bloom: 1 } : {}), ore: 2 }));
          if (loot) addLoot(h, loot);
          if (tokens) addConquestTokens(h, tokens);
          if (spire && stage === h.spire) h.spire++;
          if (!spire && stage === h.stage) h.stage++;
          h.wins++;
          lines = [...(xp ? [`+${fmt(xp)} XP`] : []), `+${fmt(gold)} gold`, ...(tokens ? [`+${tokens} Conquest Tokens${keyMult > 1 ? " (Conquest Key ×2)" : ""}`] : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        if (stage === max) setStage(stage + 1);
        return { lines, loot };
      },
    });
  };

  return (
    <Panel title={spire ? "Endless Conquest" : "Campaign Gate"} subtitle={spire ? "Every floor higher than the last" : "Endless stages — the world levels up with you"} art="quest" onClose={onClose} wide>
      {/* The gate's status strip: one line each for stamina, the frontier and this fight's pay. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        {spire ? (
          <span className="slot flex items-center gap-1.5 px-2.5 py-1.5" title={t("Conquest Tokens — the gate's own coin")}>
            <ConquestCoin size={18} />
            <b className="font-display text-base text-gold">{fmt(conquestTokens(hero))}</b>
            <span className="text-muted-foreground">{t("tokens")}</span>
          </span>
        ) : (
          <StaminaMeter hero={hero} cost={CAMPAIGN_STAMINA} unit="battle" compact />
        )}
        <span className="slot px-2.5 py-1.5">
          {spire ? t("Deepest floor") : t("Frontier")} <b className="text-gold">{max}</b>
          <span className="text-muted-foreground"> · {cleared}  {t("cleared")}</span>
        </span>
        <span className="slot flex items-center gap-1.5 px-2.5 py-1.5" title={`What this ${spire ? "floor" : "stage"} pays`}>
          {spire
            ? <span className="flex items-center gap-1 font-bold text-gold"><ConquestCoin size={16} />+{fmt(floorTokens(stage) * keyMult)}</span>
            : <span className="font-bold text-xp">+{fmt(rw.xp)}  {t("XP")}</span>}
          <Gold n={spire ? Math.round(rw.gold * keyMult) : rw.gold} />
        </span>
        {replay && <span className="slot px-2.5 py-1.5 text-muted-foreground">{t("Replay · reduced rewards")}</span>}
        <span className="slot px-2.5 py-1.5 text-muted-foreground">
          {keyOn
            ? t("Conquest Key ×2 today")
            : spire
              ? t("Floors never stop scaling")
              : `Boss at stage ${nextBoss} · ${nextBoss - stage} to go`}
        </span>
      </div>

      <GameTabs label={spire ? "Endless Conquest" : "Campaign Gate"} value={tab} onChange={setTab} tabs={[
        { id: "battle", name: "Battle" },
        { id: "extras", name: spire ? "Conquest Gate" : "Blitz & progress" },
      ]} />

      {tab === "battle" && (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* What the hero is about to face */}
          <div className="slot overflow-hidden">
            <div className="relative h-28 sm:h-48">
              <img src={worldMap} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" aria-hidden="true" />
              <div className="absolute inset-x-10 bottom-6 h-8 rounded-full bg-blood/50 blur-xl" aria-hidden="true" />
              <img src={foe.img} alt={tName(foe.name)} className="relative h-full w-full object-contain anim-idle" />
              {foe.boss && <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-blood px-2 py-0.5 font-display text-sm"><Skull className="h-4 w-4" />{t("BOSS")}</div>}
              <div className="absolute right-2 top-2"><DangerPill danger={danger} /></div>
            </div>
            <div className="border-t border-border/60 px-3 py-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-display text-lg leading-tight">{tName(foe.name)}</span>
                <span className="text-[11px] text-muted-foreground">{t("Level")} {foe.level} · {fmt(foePower)}  {t("power")}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px]">
                {([["HP", foe.hp], ["ATK", foe.atk], ["DEF", foe.def]] as const).map(([k, v]) => (
                  <span key={k} className="rounded border border-border/50 bg-background/50 px-1.5 py-0.5">
                    <span className="text-muted-foreground">{k}</span> <b>{fmt(v)}</b>
                  </span>
                ))}
                <span className="ml-auto flex items-center gap-1 text-muted-foreground"><Trophy className="h-3.5 w-3.5 text-r4" />{t("You")} <b className="text-gold">{fmt(s.power)}</b></span>
              </div>
              {/* What this floor asks of a hero: the rating at which the very same fight reads Fair for
                  the game's reference player at this level (see floorRequirement). */}
              <div className="mt-1 border-t border-border/40 pt-1 text-[11px] text-muted-foreground">
                {t("Required rating")}{" "}
                <b className={covered ? "text-r1" : "text-hp"}>{fmt(required)}</b>
                <span className="text-muted-foreground">
                  {" · "}
                  {covered ? t("you meet it") : `${t("short")} ${fmt(required - s.power)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Pick the stage, then go */}
          <div className="space-y-2">
            <StageStepper
              value={stage} max={max} onChange={jump}
              title={spire ? "Choose a floor" : `Choose a stage · ${zone.name}${zone.cycle > 1 ? ` · Cycle ${zone.cycle}` : ""}`}
              noun={spire ? "floor" : "stage"}
              inputLabel={spire ? "Floor to fight" : "Stage to fight"} />
            {!spire && (
              <p className="px-1 text-[11px] text-muted-foreground">{t("Stage")} {stageInZone}  {t("of 10 in")} {zone.name}  {t("· every tenth stage is a boss")}</p>
            )}
            <div className="slot p-3">
              <label className="flex items-center justify-between gap-2 text-sm">
                <span>{t("Auto-battle")} <span className="text-[11px] text-muted-foreground">{t("— the hero fights it alone")}</span></span>
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />
              </label>
              <button className="btn-gold mt-2 w-full py-2.5 text-xl" onClick={fight} disabled={!!staminaLock} title={staminaLock ?? "Fight"}>
                <Swords className="mr-2 inline" />{staminaLock ? t("OUT OF STAMINA") : t("FIGHT")}
              </button>
              {staminaLock
                ? <p className="mt-1.5 text-xs text-hp">{staminaLock}</p>
                : <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                    {staminaCost
                      ? <><b className="text-foreground">{staminaCost}  {t("stamina")}</b>{t(", win or lose ·")} {Math.floor(staminaLeft(hero) / staminaCost)}  {t("battles left today")}</>
                      : t("Conquest battles cost no stamina")}
                  </p>}
            </div>
            <FloorLadder
              rows={ladder}
              current={stage}
              frontier={max}
              onPick={jump}
              rating={s.power}
              noun={spire ? t("Floor") : t("Stage")}
            />
          </div>
        </div>
      )}

      {tab === "extras" && (
        <>
          {!spire && (
            <div className="mb-4">
              <div className="mb-1 font-display text-lg text-gold">{t("Level up")}</div>
              <LevelProgress hero={hero} rows={3} />
            </div>
          )}
          {spire ? <ConquestTokens hero={hero} /> : <CampaignBlitz hero={hero} />}
        </>
      )}

    </Panel>
  );
}

// ---------------- Blacksmith (the Forge) ----------------
export function Forge({ onClose, onCraft }: { onClose: () => void; onCraft?: () => void }) {
  const { hero } = useGame();
  /** Three quiet sections instead of one long wall of controls. */
  const [tab, setTab] = useState<"gear" | "stones" | "refine">("gear");
  // Opening on the first worn piece saves a tap: the smith is ready the moment the door opens.
  const [selId, setSelId] = useState<string | null>(() => {
    if (!hero) return null;
    const first = (WEAR_SLOTS.map((s) => hero.equipment[s]).find(Boolean) as Item | undefined) ?? hero.inventory[0];
    return first?.id ?? null;
  });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [warn, setWarn] = useState<Item | null>(null);
  const [mode, setMode] = useState<"gold" | "stone" | "fate">("gold");
  const [stonePick, setStonePick] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [info, setInfo] = useState(false);
  if (!hero) return null;
  // The stone the forge would use: whichever grade the player picked, else the best one held.
  const heldStones = heldStoneLevels(hero);
  const stoneLvl = stonePick !== null && heldStones.includes(stonePick) ? stonePick : (heldStones[heldStones.length - 1] ?? 2);
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
  const equippedSel = !!sel && equipped.some((i) => i.id === sel.id);
  const salvage = () => {
    if (!sel) return;
    
    if (armed !== sel.id) { setArmed(sel.id); setMsg(null); return; }
    const gain = (Object.entries(scrapYield(sel)) as [Mat, number][]).map(([m, n]) => "+" + n + " " + MATS[m].name).join(" - ");
    update((h) => { scrapItem(h, sel.id); });
    setArmed(null);
    setSelId(null);
    setMsg({ ok: true, t: "Salvaged " + itemName(sel.name) + ": " + gain });
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
    setMsg({ ok: true, t: "Unequipped and salvaged " + itemName(it.name) + ": " + gain });
  };
  const enhance = () => {
    if (!sel) return;
    // Refinement is its own uncapped track, so a fully enchanted piece can still be refined.
    if (mode !== "fate" && enhanceMaxed(sel)) return;
    if (mode === "fate") {
      const fateCost = fateStoneCost(sel);
      if (fateStoneCount(hero) < fateCost) return;
      // Fate Stones refine the piece: a won roll raises its refinement rank and leaves `enh` alone,
      // because refining and enchanting are different crafts.
      const ok = Math.random() < fateRefineChance(sel);
      update((h) => {
        spendFateStones(h, fateCost);
        const pos = sel.eq ? posOf(h.equipment, sel.id) : undefined;
        const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
        if (target && ok) target.refine = refineRank(target) + 1;
      });
      setMsg(ok
        ? { ok, t: `Refined! Refinement +${refineRank(sel) + 1} (Fate Stone)` }
        : { ok, t: `Fate turned — ${fateCost} stone${fateCost === 1 ? "" : "s"} spent` });
    } else if (mode === "stone") {
      const stoneCost = enchantStoneCost(sel);
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
  /** What the next step costs, shown on the forge's own row. */
  const stepCost = !sel ? null : (mode !== "fate" && enhanceMaxed(sel)) ? null : mode === "fate"
    ? <span className="flex items-center gap-1"><MatIcon mat="fateStone" size={18} /> {fmt(fateStoneCount(hero))}/{fateStoneCost(sel)}  {t("Fate Stone")}{fateStoneCost(sel) === 1 ? "" : "s"}</span>
    : mode === "stone"
      ? <span className="flex items-center gap-1"><StoneIcon level={stoneLvl} size={18} /> {fmt(stoneCount(hero, stoneLvl))}/{enchantStoneCost(sel)}  {t("Lv")} {stoneLvl}</span>
      : goldEnhanceAllowed(sel)
        ? <Gold n={enhanceCost(sel, hero.level)} />
        : <span className="text-xs text-hp">{t("Enchantment Stones required")}</span>;
  const chance = !sel ? 0 : mode === "fate" ? fateRefineChance(sel) : mode === "stone" ? enhanceStoneChance(sel, stoneLvl) : enhanceChance(sel);
  const canPay = !!sel && (mode === "fate" ? fateStoneCount(hero) < fateStoneCost(sel)
    : mode === "stone" ? stoneCount(hero, stoneLvl) < enchantStoneCost(sel)
      : hero.gold < enhanceCost(sel, hero.level));
  return (
    <WtWindow
      title={t("Blacksmith")}
      onClose={onClose}
      tabs={[
        { id: "gear" as const, name: t("Enchant") },
        { id: "stones" as const, name: t("Enchantment stones") },
        { id: "refine" as const, name: t("Refine") },
      ]}
      value={tab}
      onChange={setTab}
    >
      {/* The purse, the stones and the door to crafting, in one quiet strip. */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="wt-inset flex items-center gap-1 px-2 py-1" title={t("Gold in your purse")}><Gold n={hero.gold} /></span>
        <span className="wt-inset flex items-center gap-1 px-2 py-1" title={t("Fate Stones refine gear on their own track")}>
          <MatIcon mat="fateStone" size={14} /> <b className="text-gold">{fmt(fateStoneCount(hero))}</b> <span className="text-white/60">{t("Fate")}</span>
        </span>
        <span className="wt-inset flex items-center gap-1 px-2 py-1" title={stoneName(stoneLvl) + " " + t("— the best grade you hold")}>
          <StoneIcon level={stoneLvl} size={14} /> <b className="text-gold">{fmt(stoneCount(hero, stoneLvl))}</b> <span className="text-white/60">{t("Lv")} {stoneLvl}</span>
        </span>
      </div>

      {tab === "gear" && (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_290px]">
          {/* The smith's bench: the piece, the stone, then the price of the next step. */}
          <div className="wt-inset p-3">
            {msg && <div role="status" aria-live="polite" className={`mb-2 rounded border px-2 py-1 text-center text-xs ${msg.ok ? "border-r1/60 bg-r1/10 text-r1" : "border-hp/60 bg-hp/10 text-hp"}`}>{msg.t}</div>}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <WtFrame label={t("Equipment")} size={104}>
                {sel ? <ItemSlot item={sel} size={78} noHover /> : <Hammer className="h-8 w-8 text-white/25" />}
              </WtFrame>
              <div className="wt-emblem" aria-hidden="true" />
              <WtFrame label={mode === "fate" ? t("Fate Stone") : t("Luck Stone")} size={104}>
                {mode === "fate" ? <MatIcon mat="fateStone" size={62} /> : <StoneIcon level={stoneLvl} size={62} />}
              </WtFrame>
            </div>

            <div className="mx-auto mt-3 max-w-sm">
              <div className="wt-statrow"><span>{t("Required Gold")}</span><b>{sel ? stepCost : "—"}</b></div>
              <div className="wt-statrow"><span>{t("Success Rate")}</span><b>{sel ? `${Math.round(chance * 100)}%` : "—"}</b></div>
            </div>

            <div className="mx-auto mt-2 grid max-w-sm grid-cols-3 gap-1" role="group" aria-label={t("Enhancement method")}>
              <button aria-pressed={mode === "gold"} disabled={!sel || !goldEnhanceAllowed(sel)}
                className={`rounded border px-1 py-1 text-[10px] font-bold uppercase tracking-wide ${mode === "gold" ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-white/70"}`}
                onClick={() => setMode("gold")}>{t("Gold")}</button>
              <button aria-pressed={mode === "stone"} disabled={!sel}
                className={`rounded border px-1 py-1 text-[10px] font-bold uppercase tracking-wide ${mode === "stone" ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-white/70"}`}
                onClick={() => setMode("stone")}>{t("Enchantment Stone")}</button>
              <button aria-pressed={mode === "fate"} disabled={!sel}
                className={`rounded border px-1 py-1 text-[10px] font-bold uppercase tracking-wide ${mode === "fate" ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-white/70"}`}
                onClick={() => setMode("fate")}>{t("Fate Stone")}</button>
            </div>

            <WtButton className="mx-auto mt-2 block w-full max-w-sm py-3 text-lg" disabled={!sel || canPay || (mode !== "fate" && enhanceMaxed(sel))} onClick={enhance}>
              <Hammer className="mr-2 inline h-4 w-4" />
              {mode === "fate"
                ? `${t("Refine")} +${sel ? refineRank(sel) + 1 : 1}`
                : sel && enhanceMaxed(sel)
                  ? `+${ENHANCE_MAX}`
                  : `${t("Enchant")}${sel ? ` +${sel.enh + 1}` : ""}`}
            </WtButton>

            <div className="mx-auto mt-2 flex max-w-sm items-center justify-between gap-1">
              <button className="wt-btn px-2 py-1 text-[10px]" aria-expanded={info} onClick={() => setInfo((v) => !v)}>? {t("More Info")}</button>
              {onCraft && <button className="wt-btn px-2 py-1 text-[10px]" onClick={onCraft}>{t("Open crafting recipes · Standard & Synthesis")}</button>}
            </div>

            {info && sel && (
              <div className="mt-3 space-y-2">
                <ItemCard item={sel} />
                <section className="wt-inset p-2 text-[11px]">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="wt-heading border-0 pb-0">{mode === "fate" ? t("Refinement") : t("Enchantment")}</span>
                    <span className="text-white/70">
                      {mode === "fate" ? `+${refineRank(sel)} · +${Math.round(REFINE_STAT_BONUS * 100)}%` : `+${sel.enh} / +${ENHANCE_MAX}`}
                    </span>
                  </div>
                  <p className="text-white/60">
                    {mode === "gold"
                      ? t("Pays gold only. The chance shrinks as the piece climbs, all the way to +60.")
                      : mode === "fate"
                        ? t("Fate Stones never touch the +60 enchantment. Each win adds one to the Fate counter, with no limit — but every few ranks the next refine costs more stones.")
                        : t("Any stone works, but rarer gear resists weaker stones — a higher grade lands far more often.")}
                  </p>
                  {mode === "stone" && heldStones.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {heldStones.map((lvl) => (
                        <button key={lvl} className={`flex items-center gap-1 rounded border px-2 py-0.5 ${lvl === stoneLvl ? "border-gold text-gold" : "border-gold/30"}`}
                          title={stoneName(lvl)} onClick={() => setStonePick(lvl)}>
                          <StoneIcon level={lvl} size={14} /> ×{fmt(stoneCount(hero, lvl))}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
                <div className="grid gap-2 sm:grid-cols-2">
                  <section className="wt-inset p-2">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-bold"><Gem className="h-3.5 w-3.5" />{t("Gem sockets")}</span>
                      <span className="text-white/60">{socketCount(sel)}/{MAX_SOCKETS}</span>
                    </div>
                    {socketCount(sel) === 0 ? (
                      <p className="text-[10px] text-white/60">{t("This piece has no sockets — Uncommon and better gear is born with them.")}</p>
                    ) : (
                      <ul className="space-y-0.5">
                        {sockets(sel).map((g, i) => {
                          const gem = g ? parseGem(g) : null;
                          return (
                            <li key={i} className="flex items-center gap-1.5 text-[10px]">
                              {gem ? (
                                <>
                                  <GemIcon type={gem.type} size={14} />
                                  <span className="font-bold">{gemName(g!)}</span>
                                  <span className="ml-auto text-white/60">{gemStatText(g!)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="h-3.5 w-3.5 rounded-sm border border-dashed border-white/30" />
                                  <span className="text-white/60">{t("Empty socket")} {i + 1}</span>
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                  <section className="wt-inset p-2">
                    <div className="mb-1 flex items-center gap-1 text-[11px] font-bold"><Trash2 className="h-3.5 w-3.5" />{t("Salvage into materials")}</div>
                    <div className="mb-2 flex flex-wrap gap-1 text-[10px]">
                      {(Object.entries(scrapYield(sel)) as [Mat, number][]).map(([m, n]) => (
                        <span key={m} className="flex items-center gap-1 rounded border border-gold/30 px-1"><MatIcon mat={m} size={12} /> {MATS[m].name} +{n}</span>
                      ))}
                    </div>
                    {equippedSel ? (
                      <>
                        <p className="mb-1 text-[10px] text-blood">{t("This piece is equipped right now.")}</p>
                        <button className="btn-blood w-full py-1 text-[10px]" onClick={() => { setWarn(sel); setArmed(null); }}>{t("Salvage equipped gear...")}</button>
                      </>
                    ) : (
                      <button className={"w-full py-1 text-[10px] " + (armed === sel.id ? "btn-blood" : "btn-ghost")} onClick={salvage}>
                        {armed === sel.id ? "Confirm - destroy " + itemName(sel.name) : t("Salvage this piece")}
                      </button>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>

          {/* Everything the smith can work on: worn gear first, then the bag. */}
          <div className="wt-inset p-2">
            <div className="wt-heading flex items-center justify-between">
              <span>{t("Inventory")}</span>
              <span className="text-[10px] font-normal text-white/60">{equipped.length + bagged.length}</span>
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search your bag…")} aria-label={t("Search forge bag")}
              className="mt-1 h-7 w-full rounded border border-gold/40 bg-[#24100b] px-2 text-[11px]" />
            <div className="mt-1 grid max-h-[420px] grid-cols-4 gap-1 overflow-y-auto pr-1">
              {equipped.map((it) => (
                <div key={"eq" + it.id} className="wt-cell"><ForgeSlot item={it} selected={it.id === selId} onClick={() => pick(it.id)} /></div>
              ))}
              {shown.map((it) => (
                <div key={it.id} className="wt-cell"><ForgeSlot item={it} selected={it.id === selId} onClick={() => pick(it.id)} /></div>
              ))}
            </div>
            {!shown.length && !equipped.length && <p className="mt-2 text-center text-[10px] text-white/60">{t("Your bag is empty.")}</p>}
            <p className="mt-1 text-[10px] text-white/50">{t("Tap a piece to work on it. A gold badge on an icon counts the gems socketed in it.")}</p>
          </div>
        </div>
      )}

      {tab === "stones" && (
        <section className="wt-inset p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold"><Sparkles className="h-4 w-4 text-gold" />{t("Enchantment stones")}</div>
          <p className="mb-2 text-[11px] text-white/60">{t("Two stones of one grade plus gold forge one of the next grade.")}</p>
          <div className="space-y-1">
            {heldStoneLevels(hero).filter((lvl) => lvl < STONE_LEVELS).map((lvl) => (
              <button key={lvl} className="btn-ghost flex w-full items-center justify-between gap-2 px-2 py-1 text-xs" disabled={stoneCount(hero, lvl) < 2 || hero.gold < combineGold(lvl, hero.level)}
                onClick={() => update((h) => { const e = combineStones(h, lvl); setMsg(!e ? { ok: true, t: `Forged a ${stoneName(lvl + 1)}` } : { ok: false, t: e }); })}>
                <span className="flex items-center gap-1"><StoneIcon level={lvl} size={16} /> ×2 <span className="text-muted-foreground">({fmt(stoneCount(hero, lvl))} {t("held)")}</span></span>
                <span className="flex items-center gap-1 text-gold">→ <StoneIcon level={lvl + 1} size={16} /> <Gold n={combineGold(lvl, hero.level)} /></span>
              </button>
            ))}
            {heldStoneLevels(hero).filter((lvl) => lvl < STONE_LEVELS).length === 0 && (
              <p className="text-xs text-muted-foreground">{t("Nothing to forge yet — stones drop from won battles and are sold in the Auction House shop.")}</p>
            )}
          </div>
          {heldStoneLevels(hero).some((lvl) => lvl < STONE_LEVELS && stoneCount(hero, lvl) >= 2) && (
            <button className="btn-ghost mt-2 flex w-full items-center justify-center gap-1 px-2 py-2 text-xs"
              title={t("Forge every pair you hold into the next grade")}
              onClick={() => update((h) => {
                const r = combineAllStones(h);
                setMsg(r.made
                  ? { ok: true, t: `Forged ${r.made} stone${r.made === 1 ? "" : "s"} into higher grades` }
                  : { ok: false, t: r.error ?? "No pairs to forge" });
              })}>
              <Layers className="h-3.5 w-3.5" />{t("Forge every pair")} </button>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">{t("A stone that fails an enchantment survives")} {Math.round(STONE_FAIL_SAVE_CHANCE * 100)}{t("% of the time, so a bad roll still keeps one in the pouch.")}</p>
        </section>
      )}

      {tab === "refine" && (
        <section className="wt-inset p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold"><Sparkles className="h-4 w-4 text-gold" />{t("Refine spare materials")}</div>
          <div className="space-y-2">
            {REFINE.map((r) => (
              <button key={r.id} className="btn-ghost flex w-full items-center justify-between gap-2 px-2 py-2 text-xs" disabled={matCount(hero, r.from) < r.need}
                onClick={() => update((h) => { const err = refine(h, r.id); setMsg(err ? { ok: false, t: err } : { ok: true, t: "Refined: +" + r.gain + " " + MATS[r.to].name }); })}>
                <span className="flex items-center gap-1"><MatIcon mat={r.from} size={16} /> {MATS[r.from].name} ×{r.need}</span>
                <span className="flex items-center gap-1 text-gold">→ <MatIcon mat={r.to} size={16} /> {MATS[r.to].name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("Spare materials from battles refine into the ones recipes need.")}</p>
        </section>
      )}
      {warn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="alertdialog" aria-modal="true" aria-label={t("Confirm salvaging equipped gear")}>
          <div className="game-panel anim-pop w-full max-w-md p-5">
            <div className="mb-2 flex items-center gap-2 font-display text-xl text-blood"><Trash2 className="h-5 w-5" />{t("This gear is equipped")}</div>
            <p className="text-sm"><b>{itemName(warn.name)}</b> {t("is worn right now. Salvaging it will unequip and permanently destroy it, returning its materials and socketed gems. This cannot be undone.")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-ghost flex-1 py-2" onClick={() => setWarn(null)}>{t("Keep it equipped")}</button>
              <button className="btn-blood flex-1 py-2" onClick={salvageEquipped}>{t("Unequip and destroy")}</button>
            </div>
          </div>
        </div>
      )}
    </WtWindow>
  );

}

/** One gear tile in the Forge's picker, badged with how many gems it carries. */
function ForgeSlot({ item, selected, onClick }: { item: Item; selected: boolean; onClick: () => void }) {
  const gems = sockets(item).filter(Boolean).length;
  return (
    <span className="relative inline-flex">
      <ItemSlot item={item} size={44} selected={selected} onClick={onClick} />
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
    <Panel title={t("Barracks — Attribute Training")} subtitle={t("Turn gold into permanent stats")} art="profile" onClose={onClose} wide>
      <GameTabs label={t("Barracks sections")} value={tab} onChange={setTab} tabs={[
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
          <div className="mb-1 font-display text-sm text-gold">{t("Attribute training")}</div>
          <div role="group" aria-label={t("Training batch")} className="mb-4 flex flex-wrap gap-2">{batchSizes(hero).map(n=><Button key={n} size="sm" variant={count===n?'default':'outline'} aria-pressed={count===n} onClick={()=>setCount(n)}>+{n}  {t("points")}</Button>)}</div>
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
          <span className="text-muted-foreground"> / {fmt(need)}  {t("XP")}</span>
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
          {left}  {t("fight")}{left === 1 ? "" : "s"} → {next}
        </span>
        <span className="shrink-0 text-gold/90" title={t("XP a fight at your own level pays before scroll buffs")}>
          {fmt(xpPerFight(hero.level))}  {t("xp/fight")} </span>
      </div>
    </div>
  );
}


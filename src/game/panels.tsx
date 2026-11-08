import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Heart, Swords, Clover, Sparkles, Trophy, Hammer, Trash2, Skull, Backpack } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recordEnhance } from "./progress";
import { adviseStrategy } from "@/lib/quests.functions";
import {
  SKILLS, heroSkills, type Foe, CLASSES, enhanceChance, enhanceCost, enhanceMaxed, enhanceStoneChance, enchantStoneCost, ENHANCE_MAX, heroStats, invCap, bagRowCost, MAX_BAG_ROWS, sellValue,
  CONQUEST_LEVEL, MAX_LEVEL, SLOTS, WEAR_SLOTS, WEAR_LABEL, wearOf, equipItem, unequipItem, wornCompare, posOf, powerBreakdown, stageFoe, stageRewards, xpToNext, fightsToNextLevel, zoneOf, catchUpXpFactor, type Attr, type EnemyType, type Hero, type Item, type Slot, type Stats, type WearSlot,
} from "./data";
import { addConquestTokens, floorTokens } from "./conquest";
import { CAMPAIGN_STAMINA, STAMINA_PER_DAY, staminaBlocker, staminaLeft } from "./stamina";
import { ConquestTokens } from "./ConquestGate";
import { CampaignBlitz } from "./CampaignBlitz";
import { LevelProgress } from "./LevelCurve";
import { update, useGame } from "./store";
import { Gold, ItemCard, ItemSlot, Panel, fmt } from "./ui";
import { MatIcon } from "./MatIcon";
import { Vault } from "./Vault";
import { GearCodex } from "./GearCodex";
import { MATS, REFINE, matCount, refine, scrapItem, scrapYield, sockets, type Mat } from "./crafting";
import worldMap from "@/assets/world-map.jpg";
import type { Fighter } from "./Battle";
import { scrollXp } from "./scrolls";
import { QuestBoard } from "./QuestBoard";
import { BarracksTraining } from "./Barracks";
import { CharacterPose } from "./CharacterPose";
import { heroAppearance } from "./appearance";

export type StartBattle = (opts: {
  right: Fighter; auto?: boolean; title: string;
  /** A Dungeon Gate run: it costs its stamina on entry, win or lose (see stamina.ts). */
  dungeon?: boolean;
  /** Stamina this battle costs on entry, charged win or lose. */
  stamina?: number;
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
  const foe = stageFoe(stage, mult);
  const rw = stageRewards(stage, spire ? 2 : 1);
  const s = heroStats(hero);
  const foePower = Math.round(foe.atk * 2 + foe.def * 1.5 + foe.hp * 0.2);
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
        // Clearing a floor pays Conquest Tokens; deeper floors pay more.
        const tokens = spire ? floorTokens(stage) : 0;
        update((h) => {
          // Fighting above the hero's level pays catch-up XP (see catchUpXpFactor).
          const xp = scrollXp(rw.xp * catchUpXpFactor(h.level, stage), xpMultiplier);
          const { levels } = grant(h, xp, rw.gold);
          loot = rollLoot(h, stage, foe.boss || spire ? 1 : 0.45, spire ? 2 : foe.boss ? 2 : 0);
          if (loot) addLoot(h, loot);
          if (tokens) addConquestTokens(h, tokens);
          if (spire && stage === h.spire) h.spire++;
          if (!spire && stage === h.stage) h.stage++;
          h.wins++;
          lines = [`+${fmt(xp)} XP`, `+${fmt(rw.gold)} gold`, ...(tokens ? [`+${tokens} Conquest Tokens`] : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        if (stage === max) setStage(stage + 1);
        return { lines, loot };
      },
    });
  };

  return (
    <Panel title={spire ? "Endless Conquest" : "Campaign Gate"} subtitle={spire ? "Every floor higher than the last" : "Push the road, level up and loot"} art="quest" onClose={onClose}>
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
          <div className="flex justify-center gap-4 text-sm">
            <span><Trophy className="inline h-4 w-4 text-r4" /> {fmt(foePower)}</span>
            <span className={`font-bold ${danger.c}`}>{danger.t}</span>
          </div>
          <div className="flex justify-center gap-4">
            <span className="font-bold text-xp">+{fmt(rw.xp)} XP</span>
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
  const [useStone, setUseStone] = useState(false);
  if (!hero) return null;
  const equipped = WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean) as Item[];
  const bagged = hero.inventory;
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
    if (useStone) {
      const stoneCost = enchantStoneCost(sel);
      if (matCount(hero, "enchantStone") < stoneCost) return;
      const ok = Math.random() < enhanceStoneChance(sel);
      update((h) => {
        const m = { ...(h.mats ?? {}) };
        m.enchantStone = (m.enchantStone ?? 0) - stoneCost;
        h.mats = m;
        const pos = sel.eq ? posOf(h.equipment, sel.id) : undefined;
        const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
        if (target && ok) { target.enh++; recordEnhance(h, target.enh); }
      });
      setMsg(ok ? { ok, t: `Success! +${sel.enh + 1} (Stone)` } : { ok, t: "The stone cracked… failed" });
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
    <Panel title="Forge" subtitle="Enhance and salvage gear" art="hammer" onClose={onClose}>
      {onCraft && <button className="btn-gold mb-4 w-full py-2" onClick={onCraft}><Hammer className="mr-2 inline h-4 w-4" />Open crafting recipes · Standard &amp; Synthesis</button>}
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2 font-display text-sm text-gold"><Shield className="h-4 w-4" />Equipped on you <span className="text-xs text-muted-foreground">({equipped.length})</span></div>
            {equipped.length ? (
              <div className="grid grid-cols-3 content-start gap-1.5 md:grid-cols-6">
                {equipped.map((it) => (
                  <span key={it.id} className="relative inline-flex">
                    <ItemSlot item={it} size={40} selected={it.id === selId} onClick={() => { setSelId(it.id); setArmed(null); setMsg(null); }} />
                    <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded bg-gold px-1 text-[9px] font-bold uppercase text-background">Worn</span>
                  </span>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">Nothing equipped yet.</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-2 font-display text-sm text-gold"><Backpack className="h-4 w-4" />In your bag <span className="text-xs text-muted-foreground">({bagged.length})</span></div>
            {bagged.length ? (
              <div className="grid grid-cols-3 content-start gap-1.5 md:grid-cols-6">
                {bagged.map((it) => <ItemSlot key={it.id} item={it} size={40} selected={it.id === selId} onClick={() => { setSelId(it.id); setArmed(null); setMsg(null); }} />)}
              </div>
            ) : <p className="text-xs text-muted-foreground">Your bag is empty.</p>}
          </div>
        </div>
        <div className="space-y-3">
          {sel ? (
            <>
              <ItemCard item={sel} />
              <div className="flex gap-1 text-sm">
                <button className={`flex-1 py-1.5 text-xs ${!useStone ? "btn-gold" : "btn-ghost"}`} onClick={() => setUseStone(false)}>Gold</button>
                <button className={`flex-1 py-1.5 text-xs ${useStone ? "btn-gold" : "btn-ghost"}`} onClick={() => setUseStone(true)}>Enchantment Stone</button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Enhancement <b className="text-gold">+{sel.enh}</b> / +{ENHANCE_MAX}</span>
                {!enhanceMaxed(sel) && <span>Chance <b className="text-gold">{Math.round((useStone ? enhanceStoneChance(sel) : enhanceChance(sel)) * 100)}%</b>{useStone && <span className="ml-1 text-xs text-r1">+15% stone bonus</span>}</span>}
              </div>
              {!enhanceMaxed(sel) && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next step</span>
                  {useStone
                    ? <span className="flex items-center gap-1"><MatIcon mat="enchantStone" size={18} /> {matCount(hero, "enchantStone")}/{enchantStoneCost(sel)}</span>
                    : <Gold n={enhanceCost(sel, hero.level)} />}
                </div>
              )}
              <button className="btn-gold w-full py-3 text-lg" disabled={enhanceMaxed(sel) || (useStone ? matCount(hero, "enchantStone") < enchantStoneCost(sel) : hero.gold < enhanceCost(sel, hero.level))} onClick={enhance}>
                <Hammer className="mr-2 inline" />{enhanceMaxed(sel) ? `Fully enhanced · +${ENHANCE_MAX}` : `Enhance +${sel.enh + 1}`}
              </button>

              <div className="slot p-3">
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
              </div>
              {msg && <div className={`anim-pop text-center font-display text-lg ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>}
            </>
          ) : <div className="py-16 text-center text-muted-foreground"><Hammer className="mx-auto mb-2 h-10 w-10" />Choose gear to empower</div>}
          <div className="slot p-3">
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
          </div>
        </div>
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

// ---------------- Temple (Barracks) ----------------
/** The Barracks: exactly the four attributes, each a permanent gold upgrade track. */
export function Temple({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  if (!hero) return null;
  const s = heroStats(hero);
  return (
    <Panel title="Barracks" subtitle="Four attributes · permanent training" art="profile" onClose={onClose} wide>
      <BarracksTraining hero={hero} />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {([["Health", fmt(s.hp), "text-hp"], ["Attack", fmt(s.atk), "text-gold"], ["Defense", fmt(s.def), ""]] as const).map(([label, v, cls]) => (
          <div key={label} className="slot p-2">
            <div className={`font-display text-lg ${cls}`}>{v}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Quest Board (daily commissions) ----------------
/** The old AI oracle is gone: the board is six fixed daily commissions that reset at Greek midnight. */
export function Oracle(props: { onClose: () => void; start?: StartBattle }) {
  return <QuestBoard onClose={props.onClose} />;
}

export function XpBar({ hero }: { hero: Hero }) {
  const need = xpToNext(hero);
  const left = fightsToNextLevel(hero);
  return (
    <div
      className="bar-track h-2.5 w-full"
      title={`${fmt(hero.xp)} / ${fmt(need)} XP · ${left} fight${left === 1 ? "" : "s"} to level ${hero.level + 1}`}
    >
      <div className="bar-xp h-full" style={{ width: `${Math.min(100, (hero.xp / need) * 100)}%` }} />
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

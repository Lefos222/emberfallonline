import { MatIcon, GemIcon } from "./MatIcon";
import { AstralVault } from "./AstralVault";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { ArrowUp, Gem, Hammer, X } from "lucide-react";
import { invCap, SLOTS, WEAR_SLOTS, wornCompare, makeItem, type Hero, type Item, type Slot } from "./data";
import { update, useGame } from "./store";
import { GemCraftWindow, GemPicker } from "./GemWindows";
import { SynthesisTab } from "./Synthesis";
import { GameTabs, Gold, ItemCard, Panel, fmt } from "./ui";
import {
  FUSE_COUNT, GEMS, GEM_MAX_TIER, MATS, MAX_SOCKETS, RECIPES,
  craft, craftBlocker, cutHole, fuseCost, fuseGem, gemName, gemValue, GEM_STAT_LABEL, holeCost, insertGem, matCount, parseGem, recipeGold, removeGem,
  socketCount, sockets, recipeMats,
  type Mat, type Recipe,
} from "./crafting";

function MatsBar() {
  const { hero } = useGame();
  if (!hero) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2 text-sm">
      {(Object.keys(MATS) as Mat[]).map((m) => (
        <span key={m} className="slot px-2 py-1" title={MATS[m].desc}><MatIcon mat={m} /> {MATS[m].name}: <b className="text-gold">{fmt(matCount(hero, m))}</b></span>
      ))}
      <span className="slot px-2 py-1"><Gold n={hero.gold} /></span>
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const el = msg && <div className={`anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>;
  return [el, (ok: boolean, t: string) => setMsg({ ok, t })] as const;
}

// ---------------- Gem Workshop ----------------
export function GemWorkshop({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [selId, setSelId] = useState<string | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [toast, say] = useToast();
  if (!hero) return null;
  const gear = [...WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean) as Item[], ...hero.inventory].filter((i) => socketCount(i) > 0);
  const sel = gear.find((i) => i.id === selId);
  const owned = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();

  const act = (fn: Parameters<typeof update>[0]) => update(fn);
  return (
    <Panel title="Gem Workshop" subtitle="Cut, socket and fuse gems" art="gem" onClose={onClose} wide>
      <MatsBar />
      {toast}
      <div className="grid gap-5 lg:grid-cols-3">
        <div>
          <div className="mb-2 font-display">Socketed gear</div>
          {gear.length === 0 && <p className="text-sm text-muted-foreground">Uncommon or better gear is born with sockets (Epic: 2, Mythic: 3), and the Gem Workshop cuts extra holes into any piece — up to four.</p>}
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {gear.map((it) => (
              <button key={it.id} onClick={() => setSelId(it.id)} className={`slot w-full px-2 py-1.5 text-left text-sm ${selId === it.id ? "ring-2 ring-gold" : ""}`} style={{ borderColor: `var(--r${it.rarity})` }}>
                {it.name} <span className="text-xs text-muted-foreground">{sockets(it).filter(Boolean).length}/{socketCount(it)}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          {sel ? (
            <>
              <ItemCard item={sel} />
              <div className="mt-3 space-y-2">
                {sockets(sel).map((g, i) => (
                  <div key={i} className="slot flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    {g ? <span><GemIcon type={parseGem(g)!.type} />{gemName(g)} (+{gemValue(g)} {GEM_STAT_LABEL[GEMS[parseGem(g)!.type].stat]})</span>
                       : <span className="text-muted-foreground">Empty socket {i + 1}</span>}
                    {g
                      ? <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => act((h) => { const e = removeGem(h, sel.id, i); say(!e, e ?? "Gem removed"); })}><X className="inline h-3 w-3" /> Remove</button>
                      : <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => setPick(i)}><Gem className="inline h-3 w-3" /> Insert gem</button>}
                  </div>
                ))}
              </div>
              <div className="slot mt-3 p-3">
                <div className="mb-2 flex items-center justify-between font-display text-sm">
                  <span className="flex items-center gap-2"><Gem className="h-4 w-4" />Cut a socket</span>
                  <span className="text-xs text-muted-foreground">{socketCount(sel)}/{MAX_SOCKETS} holes</span>
                </div>
                <div className="mb-2 flex items-center gap-1.5">
                  {Array.from({ length: MAX_SOCKETS }, (_, i) => (
                    <span key={i} title={sockets(sel)[i] ? "Gem socketed" : "Empty socket"}
                      className={`h-5 w-5 rounded-sm border ${i < socketCount(sel) ? (sockets(sel)[i] ? "border-gold bg-gold/60" : "border-gold bg-black/40") : "border-border/60 bg-black/20"}`} />
                  ))}
                </div>
                <button className="btn-gold w-full py-2 text-sm"
                  disabled={socketCount(sel) >= MAX_SOCKETS || hero.gold < holeCost(sel, hero.level)}
                  onClick={() => act((h) => { const e = cutHole(h, sel.id); say(!e, e ?? "Cut a new gem socket"); })}>
                  {socketCount(sel) >= MAX_SOCKETS
                    ? `All ${MAX_SOCKETS} sockets cut`
                    : <>Cut a gem socket <Gold n={holeCost(sel, hero.level)} className="text-primary-foreground" /></>}
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground">Each extra hole costs more than the last; every piece can hold up to {MAX_SOCKETS} gems.</p>
              </div>
            </>
          ) : <p className="py-16 text-center text-muted-foreground">Pick a piece of gear to socket</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between font-display">
            Your gems
            <Button size="sm" onClick={() => setForgeOpen(true)}><Gem className="h-4 w-4" />Forge a gem</Button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">The forge shows exactly what a gem grants and what it costs before you spend anything.</p>
          {owned.length === 0 && <p className="text-sm text-muted-foreground">No gems yet. Forge one from materials, or buy one with Conquest Tokens.</p>}
          <div className="space-y-1">
            {owned.map(([k, n]) => {
              const g = parseGem(k)!;
              const free = sel ? sockets(sel).findIndex((x) => !x) : -1;
              const fc = fuseCost(g.tier, hero.level);
              return (
                <div key={k} className="slot flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 text-sm">
                  <span><GemIcon type={g.type} />{gemName(k)} ×{n}<span className="block text-xs text-muted-foreground">Level {g.tier} · +{gemValue(k)} {GEM_STAT_LABEL[GEMS[g.type].stat]}</span></span>
                  <span className="flex gap-1">
                    <button className="btn-ghost px-2 py-0.5 text-xs" disabled={free < 0} title={!sel ? "Select gear first" : free < 0 ? "No empty socket" : "Insert"}
                      onClick={() => sel && act((h) => { const e = insertGem(h, sel.id, free, k); say(!e, e ?? "Gem socketed"); })}>Insert</button>
                    {g.tier < GEM_MAX_TIER && (
                      <button className="btn-ghost px-2 py-0.5 text-xs" disabled={n < FUSE_COUNT} title={`Fuse ${FUSE_COUNT} → 1 level higher · ${fmt(fc.gold)} gold + ${fc.essence} essence`}
                        onClick={() => act((h) => { const e = fuseGem(h, k); say(!e, e ?? "Fusion complete!"); })}><ArrowUp className="inline h-3 w-3" />Fuse</button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {pick !== null && sel && (
        <GemPicker hero={hero} socket={pick} onClose={() => setPick(null)}
          onForge={() => { setPick(null); setForgeOpen(true); }}
          onPick={(key) => act((h) => { const e = insertGem(h, sel.id, pick, key); say(!e, e ?? "Gem socketed"); setPick(null); })} />
      )}
      {forgeOpen && <GemCraftWindow hero={hero} onClose={() => setForgeOpen(false)} />}
    </Panel>
  );
}

// ---------------- Magic Tower (Astrals) ----------------
/** The Magic Tower is the Astral Vault: the 16x8 stone compendium and its gold summon tiers. */
export function MagicTower({ onClose }: { onClose: () => void }) {
  return <AstralVault onClose={onClose} />;
}

// ---------------- Forge crafting ----------------
/** One recipe line: what it costs right now (materials held vs needed, plus the level-scaled gold) and its Craft button. */
function RecipeRow({ r, slot, hero, ilvl, busy, onCraft }: { r: Recipe; slot: Slot; hero: Hero; ilvl: number; busy: boolean; onCraft: () => void }) {
  const b = craftBlocker(hero, r, invCap(hero), slot);
  return (
    <div className="slot flex flex-wrap items-center justify-between gap-2 p-3 text-sm" style={{ borderColor: `var(--r${r.rarity})` }}>
      <div>
        <div className="font-bold">{r.name} <span className="text-xs text-muted-foreground">· item level {ilvl} · Lv {r.minLevel}+</span></div>
        <div className="text-xs text-muted-foreground">{r.desc}</div>
        <div className="text-xs">
          {(Object.entries(recipeMats(r, slot)) as [Mat, number][]).map(([m, n]) => <span key={m} className={matCount(hero, m) >= n ? "mr-2" : "mr-2 text-hp"}><MatIcon mat={m} size={16} /> {MATS[m].name} {matCount(hero, m)}/{n}</span>)}
          <Gold n={recipeGold(r, hero.level)} />
        </div>
      </div>
      <Button size="sm" disabled={!!b || busy} title={b ?? 'Craft'} onClick={onCraft}><Hammer className="h-4 w-4" />Craft</Button>
    </div>
  );
}

/** The Forge's crafting window: standard recipes for any slot, plus the Synthesis tab. */
export function Crafting({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<"standard" | "synthesis">("standard");
  const [slot, setSlot] = useState<Slot>("weapon");
  const [last, setLast] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, say] = useToast();
  if (!hero) return null;
  const ilvl = hero.level + Math.floor(hero.paragon / 2);
  const doCraft = (r: Recipe, at: Slot) => {
    if (busy) return; // prevents double-click double crafts
    setBusy(true);
    update((h) => {
      const recipe = RECIPES.find((x) => x.id === r.id);
      if (!recipe) return;
      const out = craft(h, recipe, invCap(h), () => makeItem(h.cls, ilvl, recipe.rarity, at), at);
      if (typeof out !== 'string' && !['rare','epic','legend','mythic'].includes(recipe.id)) out.name = `${recipe.name} ${at}`;
      if (typeof out === "string") say(false, out); else { setLast(out); say(true, `Forged ${out.name}!`); }
    });
    setTimeout(() => setBusy(false), 400);
  };
  return (
    <Panel title="Forge · Crafting" subtitle="Shape materials into armor" art="anvil" onClose={onClose} wide>
      <MatsBar />
      {toast}
      <GameTabs label="Forge recipes" value={tab} onChange={setTab} tabs={[
        { id: "standard", name: "Standard recipes" },
        { id: "synthesis", name: "Synthesis" },
      ]} />
      {tab === "synthesis" && <SynthesisTab />}
      {tab === "standard" && (
        <div className="mb-3 flex flex-wrap gap-1 text-sm">
          {SLOTS.map((s) => <Button key={s} size="sm" variant={slot === s ? 'default' : 'ghost'} onClick={() => setSlot(s)}>{s}</Button>)}
        </div>
      )}
      {tab !== "synthesis" && (
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            {RECIPES.map((r) => <RecipeRow key={r.id} r={r} slot={slot} hero={hero} ilvl={ilvl} busy={busy} onCraft={() => doCraft(r, slot)} />)}
            <p className="text-xs text-muted-foreground">Crafted items: {hero.crafts ?? 0}</p>
          </div>
          <div>{last ? <ItemCard item={last} compare={wornCompare(hero, last)} /> : <p className="py-10 text-center text-muted-foreground">Your newest creation appears here, compared with what you wear.</p>}</div>
        </div>
      )}
    </Panel>
  );
}

import { MatIcon, GemIcon } from "./MatIcon";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { ArrowUp, Gem, Hammer, Sparkles, X } from "lucide-react";
import { invCap, SLOTS, WEAR_SLOTS, wornCompare, makeItem, type Item, type Slot } from "./data";
import { update, useGame } from "./store";
import { GemCutWindow, GemPicker } from "./GemWindows";
import { Gold, ItemCard, Panel, fmt } from "./ui";
import {
  ASTRAL_BASES, ASTRAL_MAX_LVL, ASTRAL_MILESTONES, ASTRAL_RARITY, ASTRAL_SLOTS, FUSE_COUNT, GEMS, GEM_MAX_TIER, MATS, RECIPES, SUMMON_COST,
  astralUpgradeCost, astralValue, craft, craftBlocker, cutGem, equipAstral, fuseCost, fuseGem, gemName, gemValue, insertGem, matCount, parseGem, removeGem,
  socketCount, sockets, STAT_LABEL, recipeMats, summonAstral, upgradeAstral, absorbAstral, type Mat,
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
  const [cutOpen, setCutOpen] = useState(false);
  const [toast, say] = useToast();
  if (!hero) return null;
  const gear = [...WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean) as Item[], ...hero.inventory].filter((i) => socketCount(i) > 0);
  const sel = gear.find((i) => i.id === selId);
  const owned = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();

  const act = (fn: Parameters<typeof update>[0]) => update(fn);
  return (
    <Panel title="Gem Workshop" onClose={onClose} wide>
      <MatsBar />
      {toast}
      <div className="grid gap-5 lg:grid-cols-3">
        <div>
          <div className="mb-2 font-display">Socketed gear</div>
          {gear.length === 0 && <p className="text-sm text-muted-foreground">Uncommon or better gear has sockets (Epic: 2, Mythic: 3).</p>}
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
                    {g ? <span><GemIcon type={parseGem(g)!.type} />{gemName(g)} (+{gemValue(g)} {STAT_LABEL[GEMS[parseGem(g)!.type].stat]})</span>
                       : <span className="text-muted-foreground">Empty socket {i + 1}</span>}
                    {g
                      ? <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => act((h) => { const e = removeGem(h, sel.id, i); say(!e, e ?? "Gem removed"); })}><X className="inline h-3 w-3" /> Remove</button>
                      : <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => setPick(i)}><Gem className="inline h-3 w-3" /> Insert gem</button>}
                  </div>
                ))}
              </div>
            </>
          ) : <p className="py-16 text-center text-muted-foreground">Pick a piece of gear to socket</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between font-display">
            Your gems
            <Button size="sm" onClick={() => setCutOpen(true)}><Gem className="h-4 w-4" />Cut a gem</Button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Cutting opens a window that shows exactly what the gem will do before you spend anything.</p>
          {owned.length === 0 && <p className="text-sm text-muted-foreground">No gems yet. Cut some from Ember Ore.</p>}
          <div className="space-y-1">
            {owned.map(([k, n]) => {
              const g = parseGem(k)!;
              const free = sel ? sockets(sel).findIndex((x) => !x) : -1;
              const fc = fuseCost(g.tier);
              return (
                <div key={k} className="slot flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 text-sm">
                  <span><GemIcon type={g.type} />{gemName(k)} ×{n}<span className="block text-xs text-muted-foreground">+{gemValue(k)} {STAT_LABEL[GEMS[g.type].stat]}</span></span>
                  <span className="flex gap-1">
                    <button className="btn-ghost px-2 py-0.5 text-xs" disabled={free < 0} title={!sel ? "Select gear first" : free < 0 ? "No empty socket" : "Insert"}
                      onClick={() => sel && act((h) => { const e = insertGem(h, sel.id, free, k); say(!e, e ?? "Gem socketed"); })}>Insert</button>
                    {g.tier < GEM_MAX_TIER && (
                      <button className="btn-ghost px-2 py-0.5 text-xs" disabled={n < FUSE_COUNT} title={`Fuse ${FUSE_COUNT} → 1 higher tier · ${fmt(fc.gold)} gold + ${fc.essence} essence`}
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
          onCut={() => { setPick(null); setCutOpen(true); }}
          onPick={(key) => act((h) => { const e = insertGem(h, sel.id, pick, key); say(!e, e ?? "Gem socketed"); setPick(null); })} />
      )}
      {cutOpen && (
        <GemCutWindow hero={hero} onClose={() => setCutOpen(false)}
          onCut={(type) => act((h) => { const k = cutGem(h, Math.random, type); say(!!k && k.includes(':'), k && k.includes(':') ? `Cut a ${gemName(k)}!` : k ?? ''); setCutOpen(false); })} />
      )}
    </Panel>
  );
}

// ---------------- Magic Tower (Astrals) ----------------
export function MagicTower({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [toast, say] = useToast();
  if (!hero) return null;
  const list = hero.astrals ?? [];
  const slots = Array.from({ length: ASTRAL_SLOTS }, (_, i) => hero.astralSlots?.[i] ?? null);
  const species = new Set(list.map((a) => a.base)).size;
  const label = (a: { base: string; rarity: number; lvl: number }) => `${ASTRAL_RARITY[a.rarity]} ${ASTRAL_BASES[a.base].name} Lv${a.lvl}`;
  const fx = (a: Parameters<typeof astralValue>[0]) => `+${astralValue(a)} ${STAT_LABEL[ASTRAL_BASES[a.base].stat]}`;

  return (
    <Panel title="Magic Tower" onClose={onClose} wide>
      <MatsBar />
      {toast}
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        {slots.map((id, i) => {
          const a = list.find((x) => x.id === id);
          return (
            <div key={i} className="slot p-3 text-center text-sm">
              <div className="text-xs text-muted-foreground">Astral slot {i + 1}</div>
              {a ? <><div className="font-display text-gold">{label(a)}</div><div className="text-xs">{fx(a)}</div>
                <button className="btn-ghost mt-1 px-2 py-0.5 text-xs" onClick={() => update((h) => { equipAstral(h, null, i); })}>Unequip</button></> : <div className="py-3 text-muted-foreground">Empty</div>}
            </div>
          );
        })}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className="btn-gold flex items-center gap-1 px-4 py-2" disabled={matCount(hero, "starshard") < SUMMON_COST}
          onClick={() => update((h) => { const r = summonAstral(h); say(typeof r !== "string", typeof r === "string" ? r : `Summoned ${label(r)}!`); })}>
          <Sparkles className="h-4 w-4" />Summon ({SUMMON_COST} Starshards)
        </button>
        <span className="text-sm text-muted-foreground">Collection: {species}/{Object.keys(ASTRAL_BASES).length} species
          {ASTRAL_MILESTONES.map((m) => {
            const key = `astral_${m.n}`;
            const got = (hero.achClaimed ?? []).includes(key);
            return <button key={key} className="btn-ghost ml-2 px-2 py-0.5 text-xs" disabled={got || species < m.n}
              onClick={() => update((h) => { if (new Set((h.astrals ?? []).map((a) => a.base)).size >= m.n && !(h.achClaimed ?? []).includes(key)) { h.achClaimed = [...(h.achClaimed ?? []), key]; h.gold += m.gold; } })}>
              {got ? `✓ ${m.n} species` : `${m.n} species: ${fmt(m.gold)} gold`}</button>;
          })}
        </span>
      </div>
      {list.length === 0 && <p className="py-6 text-center text-muted-foreground">No Astrals yet. Starshards drop from battles and bosses.</p>}
      <div className="grid gap-2 md:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className="slot flex items-center justify-between gap-2 p-2 text-sm">
            <span className="min-w-0"><b>{label(a)}</b> <span className="text-xs text-muted-foreground">· {ASTRAL_BASES[a.base].kind}</span><span className="block text-xs">{fx(a)}</span></span>
            <span className="flex flex-wrap gap-1">
              {list.some(f=>f.id !== a.id && f.base === a.base) && <Button size="sm" variant="outline" disabled={a.lvl >= ASTRAL_MAX_LVL || !list.some(f=>f.id !== a.id && f.base === a.base && !slots.includes(f.id))} onClick={()=>update(h=>{const food=h.astrals?.find(f=>f.id!==a.id && f.base===a.base && !(h.astralSlots??[]).includes(f.id));if(!food)return;const err=absorbAstral(h,a.id,food.id);say(!err,err??'Duplicate absorbed');})}><Sparkles className="h-3 w-3" />Absorb duplicate</Button>}
              {slots.map((_, i) => <button key={i} className="btn-ghost px-2 py-0.5 text-xs" disabled={slots[i] === a.id} onClick={() => update((h) => { equipAstral(h, a.id, i); })}>Slot {i + 1}</button>)}
              <button className="btn-ghost px-2 py-0.5 text-xs" disabled={a.lvl >= ASTRAL_MAX_LVL || matCount(hero, "starshard") < astralUpgradeCost(a)} title={`Upgrade: ${astralUpgradeCost(a)} Starshards`}
                onClick={() => update((h) => { const e = upgradeAstral(h, a.id); say(!e, e ?? "Astral upgraded"); })}><ArrowUp className="inline h-3 w-3" />{astralUpgradeCost(a)}</button>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------- Forge crafting ----------------
export function Crafting({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [slot, setSlot] = useState<Slot>("weapon");
  const [last, setLast] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, say] = useToast();
  if (!hero) return null;
  const ilvl = hero.level + Math.floor(hero.paragon / 2);
  const doCraft = (id: string) => {
    if (busy) return; // prevents double-click double crafts
    setBusy(true);
    update((h) => {
      const r = RECIPES.find((x) => x.id === id);
      if (!r) return;
      const out = craft(h, r, invCap(h), () => makeItem(h.cls, ilvl, r.rarity, slot), slot);
      if (typeof out !== 'string' && !['rare','epic','legend','mythic'].includes(r.id)) out.name = `${r.name} ${slot}`;
      if (typeof out === "string") say(false, out); else { setLast(out); say(true, `Forged ${out.name}!`); }
    });
    setTimeout(() => setBusy(false), 400);
  };
  return (
    <Panel title="Forge · Crafting" onClose={onClose} wide>
      <MatsBar />
      {toast}
      <div className="mb-3 flex flex-wrap gap-1 text-sm">
        {SLOTS.map((s) => <Button key={s} size="sm" variant={slot === s ? 'default' : 'ghost'} onClick={() => setSlot(s)}>{s}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          {RECIPES.map((r) => {
            const b = craftBlocker(hero, r, invCap(hero), slot);
            return (
              <div key={r.id} className="slot flex flex-wrap items-center justify-between gap-2 p-3 text-sm" style={{ borderColor: `var(--r${r.rarity})` }}>
                <div>
                  <div className="font-bold">{r.name} <span className="text-xs text-muted-foreground">· item level {ilvl} · Lv {r.minLevel}+</span></div>
                  <div className="text-xs text-muted-foreground">{r.desc}</div>
                  <div className="text-xs">
                    {(Object.entries(recipeMats(r, slot)) as [Mat, number][]).map(([m, n]) => <span key={m} className={matCount(hero, m) >= n ? "mr-2" : "mr-2 text-hp"}><MatIcon mat={m} size={16} /> {MATS[m].name} {matCount(hero, m)}/{n}</span>)}
                    <Gold n={r.gold} />
                  </div>
                </div>
                <Button size="sm" disabled={!!b || busy} title={b ?? 'Craft'} onClick={() => doCraft(r.id)}><Hammer className="h-4 w-4" />Craft</Button>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Crafted items: {hero.crafts ?? 0}</p>
        </div>
        <div>{last ? <ItemCard item={last} compare={wornCompare(hero, last)} /> : <p className="py-10 text-center text-muted-foreground">Your newest creation appears here, compared with what you wear.</p>}</div>
      </div>
    </Panel>
  );
}

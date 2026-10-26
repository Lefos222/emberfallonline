import { useEffect, useState } from "react";
import { Compass, Flame, Loader2, MapPin, Move, Shield, Sparkles, Swords, Trophy } from "lucide-react";
import { CLASSES, stageFoe } from "./data";
import { gemName } from "./crafting";
import { matsLine } from "./crafting";
import { useGame } from "./store";
import { fmt, Panel } from "./ui";
import { Portrait } from "./CharacterSelect";
import { CastleWarLog } from "./CastleWarLog";
import { WorldScene } from "./WorldScene";
import type { StartBattle } from "./panels";
import { areaAt, type Monster, type Node } from "./worldscene";
import {
  CASTLE_GUARD_SHARE, WORLD_MARGIN, WORLD_UNITS, blockReasonText, harvestNode, loadAttackTarget, loadWorld, openEncounter,
  relocateCastle, reportAssault, resetLabel, settleEncounter, spotClear,
  type AttackTarget, type Encounter, type WorldCastle, type WorldState,
} from "./worldcastles";

const clsName = (cls: WorldCastle["cls"]) => CLASSES[cls].name;
const away = (a: { x: number; y: number }) => Math.round(Math.hypot(a.x, a.y) / 10);

/** How strong a monster of each kind stands in the world. Mirrors the server's kind weights. */
const KIND_MULT: Record<Monster["kind"], number> = { normal: 1, elite: 1.25, rare: 1.5, boss: 2 };

/**
 * The World Tree. The giant tree at the centre of the castle opens the world: the
 * player walks a real 2.5D world (WorldScene), every other lord's castle stands on
 * it, monsters and nodes are fought and gathered there, and every reward is
 * decided by the server (worldcastles.ts -> drizzle/migrations/0013, 0014).
 */
export function WorldMap({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { heroId, hero, gender } = useGame();
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [moving, setMoving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [assault, setAssault] = useState<AttackTarget | null>(null);
  const [assaultError, setAssaultError] = useState("");
  const [guardBroken, setGuardBroken] = useState(false);
  const [logKey, setLogKey] = useState(0);

  const open = () => {
    if (!heroId) return;
    setError(""); setWorld(null);
    loadWorld(heroId)
      .then((s) => { setWorld(s); setSelected(s.mine.hero_id); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "The world map could not be opened."));
  };

  useEffect(open, [heroId]);

  const mine = world?.mine ?? null;
  const chosen: WorldCastle | null = world && mine ? [mine, ...world.castles].find((c) => c.hero_id === selected) ?? mine : null;

  const move = async (x: number, y: number) => {
    if (!heroId || busy) return;
    setBusy(true); setNote("");
    try {
      const next = await relocateCastle(heroId, x, y);
      setWorld(next); setSelected(next.mine.hero_id); setMoving(false);
      setNote(`Castle moved — ${next.movesLeft} of ${next.movesPerDay} moves left today.`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "The move was refused. Please try again.");
    } finally { setBusy(false); }
  };

  /** Inspect a castle before riding out: the server answers with who may be attacked. */
  const inspect = async (target: WorldCastle) => {
    setSelected(target.hero_id); setMoving(false); setNote(""); setGuardBroken(false);
    setAssault(null); setAssaultError("");
    if (!heroId || target.hero_id === heroId) return;
    try {
      const t = await loadAttackTarget(heroId, target.hero_id);
      if (t.blocked) { setAssaultError(blockReasonText(t)); return; }
      setAssault(t);
    } catch (e) {
      setAssaultError(e instanceof Error ? e.message : "That castle cannot be challenged right now.");
    }
  };

  /** Stage one of an assault: the castle guard. */
  const breakGuard = (target: AttackTarget) => {
    start({
      title: `Castle Assault · ${target.name}'s guard`,
      serverRewards: true,
      right: {
        name: target.guard.name, img: CLASSES[target.cls].img, gender: target.gender,
        hp: target.guard.hp, atk: target.guard.atk, def: target.guard.def, crit: target.guard.crit,
        dodge: target.guard.dodge, critDmg: target.guard.critDmg, pen: target.guard.pen, acc: target.guard.acc,
        level: target.guard.level, mirror: true,
      },
      onResult: async (won) => {
        if (won) {
          setGuardBroken(true);
          return { lines: [`${target.guard.name} is broken — ${Math.round(CASTLE_GUARD_SHARE * 100)}% of their defences lie scattered.`, `${target.name} himself now stands before you.`] };
        }
        setGuardBroken(false);
        const r = await settle(target, false);
        return { lines: [`${target.guard.name} holds the gate — your warband is driven back.`, ...r.lines] };
      },
    });
  };

  /** Stage two: the lord. Only the outcome of this fight is recorded against the castle. */
  const strikeLord = (target: AttackTarget) => {
    start({
      title: `Castle Assault · ${target.name}`,
      serverRewards: true,
      right: {
        name: target.name, img: CLASSES[target.cls].img, gender: target.gender,
        hp: target.stats.hp, atk: target.stats.atk, def: target.stats.def, crit: target.stats.crit,
        dodge: target.stats.dodge, critDmg: target.stats.critDmg, pen: target.stats.pen, acc: target.stats.acc,
        level: target.level, cls: target.cls, mirror: true,
      },
      onResult: async (won) => settle(target, won),
    });
  };

  /** The server records the assault once, moves the gold and pays the fame. */
  const settle = async (target: AttackTarget, won: boolean) => {
    try {
      const r = await reportAssault(target.hero_id, won);
      setWorld((w) => (w ? { ...w, assaultsLeft: r.assaultsLeft, assaultsPerDay: r.assaultsPerDay, fame: r.fameTotal } : w));
      if (r.won) setLogKey((n) => n + 1);
      setAssault(null); setGuardBroken(false);
      return {
        lines: [
          won ? `${target.name}'s castle has fallen!` : `Your assault on ${target.name} was repelled.`,
          r.gold > 0 ? `+${fmt(r.gold)} gold taken from their coffers` : r.gold < 0 ? `${fmt(-r.gold)} gold paid in repairs` : "No gold changed hands.",
          r.fame > 0 ? `+${r.fame} fame` : "No fame earned",
          `${r.assaultsLeft} of ${r.assaultsPerDay} assaults left today`,
        ],
      };
    } catch (e) {
      return { lines: [e instanceof Error ? e.message : "The assault could not be recorded."] };
    }
  };

  /** A monster standing in the world: the server opens the encounter and prices it. */
  const fight = async (monster: Monster) => {
    if (!heroId || busy) return;
    setBusy(true); setNote("");
    let encounter: Encounter;
    try {
      encounter = await openEncounter(heroId, monster.area, monster.name, monster.kind);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "That monster cannot be fought right now.");
      setBusy(false);
      return;
    }
    setWorld((w) => (w ? { ...w, encountersLeft: encounter.encountersLeft, encountersPerDay: encounter.encountersPerDay } : w));
    setBusy(false);
    const base = stageFoe(encounter.level, KIND_MULT[monster.kind]);
    start({
      title: `World · ${encounter.monster}`,
      serverRewards: true,
      right: {
        ...base,
        name: encounter.monster,
        level: encounter.level,
        sprite: monster.sprite,
        boss: monster.kind === "boss",
        elite: monster.kind === "elite",
      },
      onResult: async (won) => {
        try {
          const r = await settleEncounter(encounter, won);
          setWorld((w) => (w ? { ...w, encountersLeft: r.encountersLeft, encountersPerDay: r.encountersPerDay, fame: r.fameTotal } : w));
          const loot = [...matsLine(r.loot.mats ?? {}), ...Object.entries(r.loot.gems ?? {}).map(([k, v]) => `+${v} ${gemName(k)}`)];
          return {
            lines: won
              ? [`${r.monster} falls.`, `+${fmt(r.xp)} XP · +${fmt(r.gold)} gold`, r.fame > 0 ? `+${r.fame} fame` : "No fame earned", ...loot,
                 `${r.encountersLeft} of ${r.encountersPerDay} encounters left today`]
              : [`${r.monster} drives you back — no reward is paid for a lost fight.`, `${r.encountersLeft} of ${r.encountersPerDay} encounters left today`],
          };
        } catch (e) {
          return { lines: [e instanceof Error ? e.message : "The encounter could not be settled."] };
        }
      },
    });
  };

  /** A resource node: the server decides what it yields. */
  const harvest = async (node: Node) => {
    if (busy) return;
    setBusy(true); setNote("");
    try {
      const r = await harvestNode(node.area, node.kind);
      setWorld((w) => (w ? { ...w, harvestsLeft: r.harvestsLeft, harvestsPerDay: r.harvestsPerDay } : w));
      setNote(`Gathered ${matsLine(r.mats as never).join(", ")} — ${r.harvestsLeft} of ${r.harvestsPerDay} left today.`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "That node could not be gathered.");
    } finally { setBusy(false); }
  };

  return (
    <Panel title="The World Tree" onClose={onClose} wide>
      {error ? (
        <div className="py-10 text-center">
          <p className="text-hp" role="alert">{error}</p>
          <button className="btn-blood mx-auto mt-4 px-4 py-2" onClick={open}>Retry</button>
        </div>
      ) : !world || !mine || !hero ? (
        <div className="flex items-center justify-center gap-2 py-16 font-display text-lg">
          <Loader2 className="h-5 w-5 animate-spin" />Opening the World Tree…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
          <div className="flex flex-col gap-2">
            <div className="h-[46vh] min-h-[300px] lg:h-[58vh]">
              <WorldScene
                hero={hero}
                gender={gender}
                mine={mine}
                castles={[mine, ...world.castles]}
                selected={selected}
                moving={moving}
                busy={busy}
                canPlace={(x, y) => spotClear(world, x, y)}
                onPlace={(x, y) => void move(x, y)}
                onSelectCastle={(c) => { if (c.hero_id === mine.hero_id) { setSelected(c.hero_id); setMoving(false); setNote(""); setAssault(null); } else void inspect(c); }}
                onFight={(m) => void fight(m)}
                onHarvest={(n) => void harvest(n)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <Compass className="mr-1 inline h-3.5 w-3.5" />
              {moving
                ? "Tap the ground to choose where your castle travels. Green ground is free, red is too close to another castle."
                : "Walk the world: fight the monsters that roam it, gather the nodes that grow there, and walk up to a castle to inspect it."}
            </p>
          </div>

          <aside className="space-y-3">
            <div className="game-panel grid grid-cols-2 gap-2 p-3 text-sm">
              <Stat label="Fame" value={fmt(world.fame)} tone="text-r4" />
              <Stat label="Area" value={areaAt(mine.x, mine.y).name} />
              <Stat label="Castle moves" value={`${world.movesLeft} / ${world.movesPerDay}`} tone="text-gold" />
              <Stat label="Assaults" value={`${world.assaultsLeft} / ${world.assaultsPerDay}`} tone="text-blood" />
              <Stat label="Encounters" value={`${world.encountersLeft} / ${world.encountersPerDay}`} />
              <Stat label="Harvests" value={`${world.harvestsLeft} / ${world.harvestsPerDay}`} />
            </div>

            {chosen && (
              <div className="slot p-3" style={{ borderColor: chosen.hero_id === mine.hero_id ? "var(--gold)" : "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <span className="slot h-12 w-12 shrink-0 overflow-hidden">
                    <Portrait cls={chosen.cls} gender={chosen.gender} className="w-full" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg">{chosen.name}</div>
                    <div className="text-xs text-muted-foreground">{clsName(chosen.cls)} · Lv {chosen.level}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span><Trophy className="mr-1 inline h-4 w-4 text-r4" />{fmt(chosen.power)}</span>
                  <span className="text-muted-foreground">
                    {chosen.hero_id === mine.hero_id ? "Your castle" : `${away({ x: chosen.x - mine.x, y: chosen.y - mine.y })} map units away`}
                  </span>
                </div>

                {chosen.hero_id === mine.hero_id ? (
                  <div className="mt-3 space-y-1">
                    <button className="btn-gold w-full py-2" disabled={world.movesLeft === 0 || moving} onClick={() => { setMoving(true); setNote(""); }}>
                      <Move className="mr-1 inline h-4 w-4" />Move castle
                    </button>
                    {moving && <p className="text-xs text-gold">Choose the new ground in the world.</p>}
                    {world.movesLeft === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No moves left today — the World Tree opens your road again at {resetLabel(world)} your time.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">A castle may travel {world.movesPerDay} times a day; the new ground is kept on the server for every other lord.</p>
                    )}
                  </div>
                ) : assault && assault.hero_id === chosen.hero_id ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Their coffers hold {fmt(assault.coffers)} gold. Break the guard (their defences fight at {Math.round(CASTLE_GUARD_SHARE * 100)}% of their strength), then face the lord. A victory takes a tenth of their gold, up to 5,000, and {assault.fameReward} fame; a repelled assault pays them up to 300 gold in repairs.
                    </p>
                    <div className="flex gap-2">
                      <button className="btn-blood flex-1 py-2" onClick={() => breakGuard(assault)}>
                        <Shield className="mr-1 inline h-4 w-4" />{guardBroken ? "Guard broken" : "Break the guard"}
                      </button>
                    </div>
                    <button className="btn-gold w-full py-2" disabled={!guardBroken} onClick={() => strikeLord(assault)}>
                      <Swords className="mr-1 inline h-4 w-4" />Strike {assault.name}
                    </button>
                    {!guardBroken && <p className="text-xs text-muted-foreground">The lord will not face you until his guard is broken.</p>}
                  </div>
                ) : (
                  <div className="mt-3 space-y-1">
                    <button className="btn-blood w-full py-2" disabled={world.assaultsLeft === 0} onClick={() => void inspect(chosen)}>
                      <Swords className="mr-1 inline h-4 w-4" />Assault castle
                    </button>
                    {assaultError && <p className="text-xs text-hp">{assaultError}</p>}
                    {world.assaultsLeft === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No assaults left today — your warband rests until {resetLabel(world)} your time.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {chosen && chosen.hero_id === mine.hero_id && moving && (
              <p className="text-xs text-muted-foreground">
                <MapPin className="mr-1 inline h-3.5 w-3.5" />
                The world spans {WORLD_UNITS / 10} × {WORLD_UNITS / 10} map units; castles stay {WORLD_MARGIN / 10} units from the edge.
              </p>
            )}

            <div className="game-panel p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1 font-display text-sm text-gold"><Flame className="h-4 w-4" />The world is alive</div>
              Monsters roam by area — elites everywhere, rare beasts from the Haunted Barrows on, and an area boss at each lair from the Demon Wastes. Every kill, node and assault is settled by the server: XP, gold, fame and loot are written into your character there, never here.
            </div>

            {note && <p className="text-sm text-gold" role="status">{note}</p>}
            <CastleWarLog heroId={heroId} refreshKey={logKey} />
            {world.castles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />Yours is the first castle standing in the world.
              </p>
            )}
          </aside>
        </div>
      )}
    </Panel>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`truncate font-display ${tone}`}>{value}</div>
    </div>
  );
}

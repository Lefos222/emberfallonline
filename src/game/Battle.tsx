import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check } from "lucide-react";
import arenaField from "@/assets/arena-field.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaLair from "@/assets/arena-lair.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import arenaSpire from "@/assets/arena-spire.jpg";
import arenaAbyss from "@/assets/arena-abyss.jpg";
import arenaColosseum from "@/assets/arena-colosseum.jpg";
import arenaDepths from "@/assets/arena-depths.jpg";
import { Button } from "@/components/ui/button";
import { collectCreature, settleCreatureDefeats } from "./encounter-collection";
import { getState, update } from "./store";
import { tr } from "./i18n";
import { CombatStage } from "./CombatStage";
import {
  foeUnit, heroUnit, initBattle, paceGateBattle, runBattle,
  type BattleState, type FighterInput,
} from "./combat";

export type Fighter = FighterInput;

/** What the result screen needs to draw the two fighters at the bell. */
export interface BattleEndHp { hero: number; heroMax: number; foe: number; foeMax: number }

/** Kept for callers that still reference the old pacing constant. */
export const BATTLE_PACE = 1.45;

export function arenaFor(title: string | undefined, boss?: boolean) {
  const t = (title ?? "").toLowerCase();
  if (/abyss|echo/.test(t)) return arenaAbyss;
  if (/spire|warden|rift path/.test(t)) return arenaSpire;
  if (/duel|arena|clash|pvp/.test(t)) return arenaColosseum;
  if (/expedition|relic|depth|dungeon|elite/.test(t)) return arenaDepths;
  if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return arenaLair;
  if (/bone|crypt|elite/.test(t)) return arenaCrypt;
  if (/fiend|rift|conquest|arena/.test(t)) return arenaRift;
  return arenaField;
}

/**
 * A fight, Shakes & Fidget style: the result is calculated the moment the screen opens and shown
 * as two cards, their health, their stats and the blow-by-blow text. Nothing is animated and
 * nothing is pressed mid-fight — the only choice is to accept the outcome (or save its log).
 */
export function Battle({ left, right, onEnd, title, gate = false, onSaveLog }: {
  left: Fighter; right: Fighter;
  /** Accepted for callers that used to choose auto-battle; every fight is automatic now. */
  auto?: boolean;
  onEnd: (won: boolean, hp?: BattleEndHp) => void | Promise<void>;
  title?: string;
  /** A War Gate monster fight: the same fight, paced to a readable length. */
  gate?: boolean;
  /** Called when the player chooses to keep this fight's log with the result. */
  onSaveLog?: (log: string[]) => void;
}) {
  const state = useRef<BattleState | null>(null);
  if (!state.current) {
    const s = initBattle(left, right);
    if (gate) paceGateBattle(s);
    state.current = runBattle(s);
  }
  const s = state.current;
  const hero = heroUnit(s);
  const foe = foeUnit(s);
  const ended = useRef(false);
  const killsBefore = useRef<Record<string, number>>(getState().hero?.kills ?? {});
  const bg = useMemo(() => arenaFor(title, right.boss), [title, right.boss]);
  const face = getState().hero?.face;
  const chrono = useMemo(() => [...s.log].reverse(), [s]);
  const [shown, setShown] = useState(0);
  const [saved, setSaved] = useState(false);

  // Collect the foe as a creature encounter on mount, before the result is accepted.
  useEffect(() => { update((h) => { collectCreature(h, right); }); }, []);
  // Reveal the calculated blows in order, so the log reads like a fight without any animation.
  useEffect(() => {
    if (shown >= chrono.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 90);
    return () => clearTimeout(t);
  }, [shown, chrono.length]);

  function finish() {
    if (ended.current) return;
    ended.current = true;
    const dead = s.units.filter((u) => u.side === "foe" && u.hp <= 0);
    const hp: BattleEndHp = { hero: hero.hp, heroMax: hero.maxHp, foe: foe.hp, foeMax: foe.maxHp };
    void Promise.resolve(onEnd(s.over === "won", hp)).then(() => {
      update((h) => settleCreatureDefeats(h, dead, killsBefore.current));
    });
  }

  function saveLog() {
    onSaveLog?.(s.log);
    setSaved(true);
  }

  const won = s.over === "won";

  return (
    <div className="battle-screen fixed inset-0 z-40 flex flex-col overflow-hidden bg-background anim-pop">
      <img src={bg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 vignette" />

      <CombatStage
        title={title}
        subtitle={tr("Battle report")}
        round={s.round}
        outcome={s.over}
        log={chrono.slice(0, shown)}
        heroes={[{
          id: hero.id,
          name: hero.name,
          level: hero.level,
          hp: hero.hp,
          maxHp: hero.maxHp,
          atk: hero.atk,
          def: hero.def,
          crit: hero.crit,
          dodge: hero.dodge,
          cls: hero.cls,
          gender: hero.gender,
          look: hero.look,
          synth: hero.synth,
          face,
        }]}
        foes={[{
          id: foe.id,
          name: foe.name,
          level: foe.level,
          hp: foe.hp,
          maxHp: foe.maxHp,
          atk: foe.atk,
          def: foe.def,
          crit: foe.crit,
          dodge: foe.dodge,
          boss: foe.boss,
          elite: foe.elite,
          cls: foe.cls,
          sprite: foe.sprite,
        }]}
        footer={
          <>
            {hero.scrolls && hero.scrolls.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gold">
                {hero.scrolls.map((k) => (
                  <span key={k}>{tr(k === "dmg" ? "Damage Scroll" : k === "def" ? "Defence Scroll" : "Experience Scroll")} +20%</span>
                ))}
              </div>
            )}
            <div className="flex w-full max-w-xl items-center justify-center gap-2">
              <button className="btn-gold min-w-40 px-6 py-2 text-lg" onClick={finish}>
                {tr("OK")} · {won ? tr("Victory") : tr("Defeat")}
              </button>
              <Button
                variant="ghost"
                className={`slot flex items-center gap-1.5 px-3 py-2 text-xs ${saved ? "text-gold" : ""}`}
                onClick={saveLog}
                disabled={saved}
                title={tr("Keep this fight's log in your battle history")}
              >
                {saved ? <Check className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                {saved ? tr("Fight saved") : tr("Save fight")}
              </Button>
            </div>
          </>
        }
      />
    </div>
  );
}

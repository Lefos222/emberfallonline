import { useState } from "react";
import { Check, Gift, Lock, ScrollText } from "lucide-react";
import { Gold, Panel, fmt } from "./ui";
import { update, useGame } from "./store";
import { claimLevelQuest, levelQuestRows, questsForLevel } from "./level-quests";

/**
 * The level quest track: a button pinned to the right edge of the castle screen and the
 * board behind it. Every character level owns three quests (see level-quests.ts).
 */

/** Right-edge button, vertically centred, badged with the quests ready to claim. */
export function QuestsButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Quests"
      title="Quests"
      className="game-panel pointer-events-auto absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-xl px-2.5 py-3 font-display text-xs text-gold transition hover:pr-4"
    >
      <ScrollText className="h-5 w-5" />
      Quests
      {count > 0 && (
        <span className="absolute -left-2 -top-2 min-w-5 rounded-full bg-blood px-1.5 py-0.5 text-center text-[10px] font-bold text-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

export function QuestsPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  if (!hero) return null;
  const rows = levelQuestRows(hero);
  const done = rows.filter((r) => r.done).length;

  return (
    <Panel title={`Level ${hero.level} Quests`} subtitle="One board per level, paid in gold and XP" art="quest" onClose={onClose} wide>
      <p className="mb-4 text-sm text-muted-foreground">
        Every level brings its own three quests. {done}/{rows.length} finished on this board —
        rewards scale with your level, and a new set opens the moment you level up.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map(({ quest, progress, claimed, done }) => (
          <article key={quest.id} className="slot flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg text-gold">{quest.name}</h3>
              {claimed && <Check className="h-4 w-4 shrink-0 text-r1" />}
            </div>
            <p className="text-sm">{quest.desc}</p>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {progress}/{quest.target}
                </span>
              </div>
              <div className="bar-track h-2">
                <div
                  className="bar-xp h-full"
                  style={{ width: `${Math.min(100, (progress / quest.target) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-xs">
              <span className="font-bold text-xp">+{fmt(quest.xp)} XP</span> ·{" "}
              <Gold n={quest.gold} />
            </p>
            <button
              className={
                claimed ? "slot py-2 text-sm text-muted-foreground" : "btn-gold py-2 text-sm"
              }
              disabled={claimed || !done}
              onClick={() =>
                update((h) => {
                  const err = claimLevelQuest(h, quest.id);
                  setMsg(
                    err
                      ? { ok: false, t: err }
                      : {
                          ok: true,
                          t: `${quest.name} complete — +${fmt(quest.xp)} XP, +${fmt(quest.gold)} gold`,
                        },
                  );
                })
              }
            >
              {claimed ? (
                "Claimed"
              ) : done ? (
                <>
                  <Gift className="mr-1 inline h-4 w-4" />
                  Claim reward
                </>
              ) : (
                "In progress"
              )}
            </button>
          </article>
        ))}
      </div>
      {msg && (
        <p role="status" className={`anim-pop mt-3 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>
          {msg.t}
        </p>
      )}

      <div className="mt-6">
        <h3 className="mb-2 font-display text-sm uppercase tracking-widest text-muted-foreground">
          Coming with your next levels
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[hero.level + 1, hero.level + 2].map((lv) => (
            <div key={lv} className="slot p-3 text-sm">
              <div className="mb-1 flex items-center gap-1 font-display text-gold">
                <Lock className="h-3.5 w-3.5" />
                Level {lv}
              </div>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {questsForLevel(lv).map((q) => (
                  <li key={q.id}>
                    {q.name} — {q.desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

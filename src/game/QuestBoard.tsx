import { useEffect } from "react";
import { MatIcon } from "./MatIcon";
import { MATS, matCount } from "./crafting";
import { countdown } from "./events";
import { grant } from "./logic";
import { update, useGame } from "./store";
import { Gold, Panel, fmt } from "./ui";
import { DAILY_QUESTS, boardResetAt, boardRows, rollBoard } from "./quest-board";

/** Six fixed commissions a day. No AI, nothing random: every quest tracks real progress on your save. */
export function QuestBoard({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  useEffect(() => { update((h) => { rollBoard(h); }); }, [hero?.daily?.day]);
  if (!hero) return null;
  const now = Date.now();
  const rows = boardRows(hero, now);
  const claimed = rows.filter((r) => r.claimed).length;

  const claim = (id: string) => update((h) => {
    const state = rollBoard(h);
    const row = boardRows(h).find((r) => r.quest.id === id);
    if (!row || row.claimed || !row.done) return;
    state.claimed.push(id);
    grant(h, row.quest.xp, row.quest.gold);
    h.mats = { ...(h.mats ?? {}), [row.quest.mat]: matCount(h, row.quest.mat) + row.quest.mats };
  });

  return (
    <Panel title="Quest Board" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {DAILY_QUESTS.length} commissions, {claimed} claimed · every one pays gold, XP and materials ·
          resets in <b className="text-gold">{countdown(boardResetAt(now) - now)}</b> (Greek midnight)
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ quest, progress, claimed: done, done: complete }) => (
          <div key={quest.id} className={"slot flex flex-col gap-2 p-3 " + (done ? "opacity-60" : complete ? "rarity-3" : "")}>
            <div className="font-display text-gold">{quest.name}</div>
            <div className="text-xs text-muted-foreground">{quest.desc}</div>
            <div className="bar-track h-2"><div className="bar-xp h-full" style={{ width: Math.round((progress / quest.target) * 100) + "%" }} /></div>
            <div className="text-xs text-muted-foreground">Progress {progress}/{quest.target}</div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="slot px-2 py-0.5"><Gold n={quest.gold} className="text-xs" /></span>
              <span className="slot px-2 py-0.5 font-bold text-xp">{fmt(quest.xp)} XP</span>
              <span className="slot px-2 py-0.5"><MatIcon mat={quest.mat} size={14} /> {MATS[quest.mat].name} ×{quest.mats}</span>
            </div>
            <button className="btn-gold mt-auto py-1.5" disabled={done || !complete} onClick={() => claim(quest.id)}>
              {done ? "Claimed" : complete ? "Claim rewards" : "In progress"}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

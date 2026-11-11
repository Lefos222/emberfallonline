import questDesk from "@/assets/activity-command-desk.jpg";
import { Button } from "@/components/ui/button";
import { ArtIcon } from "./ArtIcon";
import { t } from "./i18n";
import { useState } from "react";
import { Check, Gift, Lock } from "lucide-react";
import { ScrollText } from "./PaintedIcons";
import { Gold, Panel, fmt } from "./ui";
import { update, useGame } from "./store";
import type { QuestKind } from "./level-quests";
import { claimLevelQuest, levelQuestRows, questsForLevel } from "./level-quests";

const QUEST_HELP: Record<QuestKind, string> = {
  wins: "Win fights in any gate. Losses do not count.",
  stages: "Clear new Campaign stages in the War Gates.",
  kills: "Defeat monsters in Campaign, Dungeon or Conquest battles.",
  enhances: "Successfully enhance equipment at the Forge.",
  bosses: "Defeat bosses in the War Gates or timed events.",
  crafts: "Craft equipment using recipes at the Forge.",
  arena: "Win duels against other heroes in the Blood Arena.",
  floors: "Clear Conquest floors in the War Gates. Unlocks at level 10.",
};
/**
 * The level quest track: a button pinned to the right edge of the castle screen and the
 * board behind it. Every character level owns eight quests (see level-quests.ts).
 */

/** Right-edge button, vertically centred, badged with the quests ready to claim. */
export function QuestsButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick} aria-label={t("Quests")} title={t("Quests")}
      className="game-panel relative h-auto min-h-16 w-20 flex-col gap-1 rounded-md px-2 py-2 font-display text-xs text-gold">
      <ArtIcon name="quest" size={32} />{t("Quests")}
      {count > 0 && <span className="absolute -left-1 -top-1 min-w-5 rounded-full bg-blood px-1 text-[10px] text-foreground">{count}</span>}
    </Button>
  );
}

export function QuestsPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  if (!hero) return null;
  const rows = levelQuestRows(hero);
  const done = rows.filter((r) => r.done).length;

  return (
    <Panel title={`Level ${hero.level} Quests`} subtitle={t("One board per level, paid in gold and XP")} art="quest" onClose={onClose} wide>
      <img src={questDesk} alt="" width={1536} height={1024} loading="lazy" className="mb-4 h-36 w-full rounded-md object-cover object-center" />
      <p className="mb-4 text-sm text-muted-foreground">
         {t("Every level brings eight quests.")} {done}/{rows.length}  {t("finished on this board — rewards scale with your level, and a new set opens the moment you level up.")} </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map(({ quest, progress, claimed, done }) => (
          <article key={quest.id} className="slot flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg text-gold">{quest.name}</h3>
              {claimed && <Check className="h-4 w-4 shrink-0 text-r1" />}
            </div>
            <ArtIcon name={quest.kind === "crafts" || quest.kind === "enhances" ? "hammer" : quest.kind === "arena" ? "shield" : "swords"} size={36} />
            <p className="text-sm">{quest.desc}</p>
            <p className="text-xs text-muted-foreground">{t(QUEST_HELP[quest.kind])}</p>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{t("Progress")}</span>
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
              <span className="font-bold text-xp">+{fmt(quest.xp)}  {t("XP")}</span> ·{" "}
              <Gold n={quest.gold} />
            </p>
            <Button
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
                   {t("Claim reward")} </>
              ) : (
                "In progress"
              )}
            </Button>
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
           {t("Coming with your next levels")} </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[hero.level + 1, hero.level + 2].map((lv) => (
            <div key={lv} className="slot p-3 text-sm">
              <div className="mb-1 flex items-center gap-1 font-display text-gold">
                <Lock className="h-3.5 w-3.5" />
                 {t("Level")} {lv}
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

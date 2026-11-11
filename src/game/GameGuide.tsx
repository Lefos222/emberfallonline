import { useState } from "react";
import { tr } from "./i18n";
import { Panel } from "./ui";
import { GUIDE_CHAPTERS } from "./guide";
import { GuideChecklist, GuideClassCards, GuideLegend, GuideReader } from "./GuideReader";

/**
 * The game guide: a painted, step-by-step handbook for a new hero, plus a checklist that ticks
 * itself off the hero's own save. Read-only — nothing here changes the game state but the
 * "seen the guide" flag the castle banner sets.
 */
export function GameGuide({ onClose }: { onClose: () => void }) {
  const [chapterId, setChapterId] = useState(GUIDE_CHAPTERS[0].id);

  return (
    <Panel title="Game Guide" subtitle="Everything a new hero needs, step by step" art="spellbook" onClose={onClose} wide>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        {/* On a phone the checklist, the classes and the icon legend come first; on a wide screen
            they sit in a column beside the chapter. */}
        <aside className="order-1 space-y-3 lg:order-2">
          <GuideChecklist />
          <GuideClassCards />
          <GuideLegend />
        </aside>
        <div className="order-2 min-w-0 lg:order-1">
          <GuideReader chapterId={chapterId} onChapter={setChapterId} />
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {tr("Every number in this guide comes from the game itself, so it stays true as the game grows.")}
      </p>
    </Panel>
  );
}

import { useEffect, useState } from "react";
import { tr } from "./i18n";
import { Panel } from "./ui";
import { GUIDE_CHAPTERS } from "./guide";
import { GuideChecklist, GuideClassCards, GuideLegend, GuideReader } from "./GuideReader";
import { CraftingGuide } from "./CraftingGuide";
import { playGuideSound } from "./guide-sound";

/**
 * The game guide: a painted, step-by-step handbook for a new hero, plus a checklist that ticks
 * itself off the hero's own save. Read-only — nothing here changes the game state but the
 * "seen the guide" flag the castle banner sets.
 *
 * The crafting guide from the Forge is merged in here as a "Crafting" tab, so everything a hero
 * needs to know lives in one place above the Quests button.
 */
export function GameGuide({ onClose }: { onClose: () => void }) {
  const [chapterId, setChapterId] = useState(GUIDE_CHAPTERS[0].id);
  const [showCrafting, setShowCrafting] = useState(false);

  // Play the book-opening sound when the guide opens.
  useEffect(() => {
    playGuideSound();
  }, []);

  const handleChapter = (id: string) => {
    setChapterId(id);
    setShowCrafting(false);
    playGuideSound();
  };

  const handleCraftingTab = () => {
    setShowCrafting(true);
    playGuideSound();
  };

  return (
    <Panel title="Game Guide" subtitle="Everything a new hero needs, step by step" art="spellbook" onClose={onClose} wide>
      {/* Chapter tabs, with the crafting guide appended as a final tab */}
      <div className="mb-3 flex flex-wrap gap-1">
        {GUIDE_CHAPTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleChapter(c.id)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-display transition-colors ${
              !showCrafting && chapterId === c.id
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-secondary/40"
            }`}
          >
            {c.tab}
          </button>
        ))}
        <button
          onClick={handleCraftingTab}
          className={`rounded-md px-2.5 py-1.5 text-xs font-display transition-colors ${
            showCrafting
              ? "bg-gold/20 text-gold border border-gold/40"
              : "text-muted-foreground hover:text-foreground border border-transparent hover:bg-secondary/40"
          }`}
        >
          {tr("Crafting")}
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        {/* On a phone the checklist, the classes and the icon legend come first; on a wide screen
            they sit in a column beside the chapter. */}
        <aside className="order-1 space-y-3 lg:order-2">
          <GuideChecklist />
          <GuideClassCards />
          <GuideLegend />
        </aside>
        <div className="order-2 min-w-0 lg:order-1">
          {showCrafting ? (
            <CraftingGuide />
          ) : (
            <GuideReader chapterId={chapterId} onChapter={handleChapter} />
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {tr("Every number in this guide comes from the game itself, so it stays true as the game grows.")}
      </p>
    </Panel>
  );
}

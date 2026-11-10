import { useState } from "react";
import { tr } from "./i18n";
import { useGame } from "./store";
import { GameTabs, Panel } from "./ui";
import { GUIDE_CHAPTERS, GUIDE_GOALS, goalsDone, type GuideChapter } from "./guide";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaField from "@/assets/arena-field.jpg";
import cardGender from "@/assets/card-gender.webp";
import craftingTrophies from "@/assets/crafting-trophies.png";
import farmCountryside from "@/assets/farm-countryside.jpg";
import farmEstate from "@/assets/farm-estate.jpg";
import gateCampaign from "@/assets/gate-campaign.webp";
import gateConquest from "@/assets/gate-conquest.webp";
import gateDungeon from "@/assets/gate-dungeon.webp";
import gearAtlas from "@/assets/gear-atlas.jpg";
import sceneAuctionHouse from "@/assets/scene-auction-house.jpg";
import sceneGuildHall from "@/assets/scene-guild-hall.jpg";
import sceneWorldMap from "@/assets/scene-world-map.jpg";
import spireChest from "@/assets/spire-chest.webp";
import worldCastle from "@/assets/world-castle.png";

/** One painted picture per chapter, so a new player can see what a gate or a building looks like. */
const CHAPTER_ART: Record<string, { src: string; fit: string }> = {
  start: { src: gateCampaign, fit: "object-cover" },
  classes: { src: cardGender, fit: "object-contain" },
  fight: { src: arenaField, fit: "object-cover" },
  gear: { src: gearAtlas, fit: "object-cover object-top" },
  forge: { src: craftingTrophies, fit: "object-cover" },
  gates: { src: gateDungeon, fit: "object-cover" },
  spire: { src: spireChest, fit: "object-contain" },
  castle: { src: worldCastle, fit: "object-contain" },
  farm: { src: farmEstate, fit: "object-cover" },
  economy: { src: sceneAuctionHouse, fit: "object-cover" },
  grow: { src: gateConquest, fit: "object-cover" },
  guild: { src: sceneGuildHall, fit: "object-cover" },
  world: { src: sceneWorldMap, fit: "object-cover" },
  arena: { src: arenaCrypt, fit: "object-cover" },
  daily: { src: farmCountryside, fit: "object-cover" },
  tips: { src: sceneWorldMap, fit: "object-cover" },
};

/**
 * The game guide: a painted, step-by-step handbook for a new hero, plus a checklist that ticks
 * itself off the hero's own save. Read-only — nothing here changes the game state but the
 * "seen the guide" flag the castle banner sets.
 */
export function GameGuide({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [chapterId, setChapterId] = useState(GUIDE_CHAPTERS[0].id);
  const chapter: GuideChapter = GUIDE_CHAPTERS.find((c) => c.id === chapterId) ?? GUIDE_CHAPTERS[0];
  const art = CHAPTER_ART[chapter.id] ?? CHAPTER_ART["start"];
  const done = goalsDone(hero);

  return (
    <Panel title="Game Guide" subtitle="Everything a new hero needs, step by step" art="spellbook" onClose={onClose} wide>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* The first steps a new hero should take, ticked off from their own save. */}
        <section className="slot p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg text-gold">{tr("First steps")}</h3>
            <span className="font-display text-sm text-muted-foreground">
              {done}/{GUIDE_GOALS.length}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-background/70">
            <div className="h-full bg-gold transition-[width]" style={{ width: `${Math.round((done / GUIDE_GOALS.length) * 100)}%` }} />
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {GUIDE_GOALS.map((g) => {
              const ok = !!hero && g.done(hero);
              return (
                <li key={g.id} className={`flex items-center gap-2 ${ok ? "text-r1" : "text-muted-foreground"}`}>
                  <span aria-hidden className="w-4 text-center font-bold">{ok ? "✓" : "○"}</span>
                  <span className={ok ? "line-through decoration-r1/50" : ""}>{tr(g.label)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {done === GUIDE_GOALS.length
              ? tr("All done — you know the game. The chapters beside this card cover everything else.")
              : tr("Finish these and the rest of the game opens up naturally.")}
          </p>
        </section>

        {/* The chapter picture, so the guide shows where to look as well as what to press. */}
        <section className="slot overflow-hidden">
          <div className="relative h-36 sm:h-44">
            <img src={art.src} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full opacity-80 ${art.fit}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-3 bottom-2">
              <div className="font-display text-xl panel-title">{chapter.title}</div>
              <p className="text-xs text-muted-foreground">{chapter.blurb}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-3">
        <GameTabs
          label={tr("Guide chapters")}
          value={chapter.id}
          onChange={setChapterId}
          tabs={GUIDE_CHAPTERS.map((c) => ({ id: c.id, name: c.tab }))}
        />
      </div>

      <ol className="space-y-2">
        {chapter.steps.map((s, i) => (
          <li key={s.title} className="slot flex gap-3 p-3">
            <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm text-gold">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm text-foreground">{s.title}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {chapter.tip && (
        <p className="mt-2 rounded border border-gold/50 bg-gold/5 p-2 text-xs text-gold">
          <b>{tr("Worth knowing:")}</b> {chapter.tip}
        </p>
      )}

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {tr("Every number in this guide comes from the game itself, so it stays true as the game grows.")}
      </p>
    </Panel>
  );
}

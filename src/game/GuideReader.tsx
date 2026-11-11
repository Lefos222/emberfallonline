import { useState } from "react";
import { tr } from "./i18n";
import { GameTabs } from "./ui";
import { GUIDE_CHAPTERS, GUIDE_GOALS, goalsDone, type GuideChapter } from "./guide";
import { useGame } from "./store";
import {
  CHAPTER_ART,
  CLASS_CARDS,
  GOAL_GLYPHS,
  GUIDE_LEGEND,
  GuideGlyphIcon,
  STEP_GLYPHS,
  materialGlyph,
  type GuideGlyph,
} from "./guide-art";
import { ArtIcon } from "./ArtIcon";

/**
 * The guide's reader: one painted chapter at a time, with a picture on every step.
 *
 * It is shared by the in-game window (`GameGuide`) and the public handbook at `/guide`, so a
 * player can read the whole game before making a hero and everything stays in one place.
 */

function stepGlyph(chapter: GuideChapter, index: number): GuideGlyph | undefined {
  if (chapter.id === "materials") return materialGlyph(index);
  return STEP_GLYPHS[chapter.id]?.[index];
}

export function GuideReader({
  chapterId,
  onChapter,
}: {
  chapterId?: string;
  onChapter?: (id: string) => void;
}) {
  const [own, setOwn] = useState(GUIDE_CHAPTERS[0].id);
  const current = chapterId ?? own;
  const setChapter = (id: string) => {
    setOwn(id);
    onChapter?.(id);
  };
  const index = Math.max(
    0,
    GUIDE_CHAPTERS.findIndex((c) => c.id === current),
  );
  const chapter = GUIDE_CHAPTERS[index];
  const art = CHAPTER_ART[chapter.id] ?? CHAPTER_ART["start"];

  return (
    <section className="min-w-0">
      <GameTabs
        label={tr("Guide chapters")}
        value={chapter.id}
        onChange={setChapter}
        tabs={GUIDE_CHAPTERS.map((c) => ({ id: c.id, name: c.tab }))}
      />

      <article className="slot overflow-hidden">
        {/* The chapter's painted scene, so every topic looks like the place it is about. */}
        <div className="relative h-40 sm:h-52 lg:h-56">
          <img
            src={art.src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full opacity-90 ${art.fit}`}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent"
            aria-hidden="true"
          />
          <span className="absolute right-2 top-2 rounded bg-background/75 px-1.5 py-0.5 font-display text-[11px] text-gold">
            {index + 1} / {GUIDE_CHAPTERS.length}
          </span>
          <div className="absolute inset-x-3 bottom-2 sm:inset-x-4 sm:bottom-3">
            <h3 className="panel-title font-display text-lg leading-tight sm:text-2xl">
              {chapter.title}
            </h3>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-sm">
              {chapter.blurb}
            </p>
          </div>
        </div>

        <ol className="grid gap-2 p-2 sm:p-3 md:grid-cols-2">
          {chapter.steps.map((s, i) => {
            const glyph = stepGlyph(chapter, i);
            return (
              <li
                key={s.title}
                className="flex gap-2.5 rounded-md border border-border/40 bg-background/50 p-2.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gold/40 bg-gradient-to-b from-secondary/60 to-background/80">
                  {glyph ? (
                    <GuideGlyphIcon glyph={glyph} size={26} />
                  ) : (
                    <span className="font-display text-base text-gold">{i + 1}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-sm leading-tight text-foreground">
                    <span className="mr-1.5 text-gold/70">{i + 1}.</span>
                    {s.title}
                  </h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {chapter.tip && (
          <p className="m-2 mt-0 rounded border border-gold/50 bg-gold/5 p-2 text-xs text-gold sm:m-3 sm:mt-0">
            <b>{tr("Worth knowing:")}</b> {chapter.tip}
          </p>
        )}
      </article>
    </section>
  );
}

/** The first eight things a hero does, ticked off from their own save. */
export function GuideChecklist() {
  const { hero } = useGame();
  const done = goalsDone(hero);
  if (!hero) return null;
  const next = GUIDE_GOALS.find((g) => !g.done(hero));
  return (
    <section className="slot p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg text-gold">{tr("First steps")}</h3>
        <span className="font-display text-sm text-muted-foreground">
          {done}/{GUIDE_GOALS.length}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-background/70">
        <div
          className="h-full bg-gold transition-[width]"
          style={{ width: `${Math.round((done / GUIDE_GOALS.length) * 100)}%` }}
        />
      </div>
      <ul className="mt-2 space-y-1 text-xs">
        {GUIDE_GOALS.map((g) => {
          const ok = g.done(hero);
          const glyph = GOAL_GLYPHS[g.id];
          return (
            <li
              key={g.id}
              className={`flex items-center gap-2 rounded px-1 py-0.5 ${ok ? "text-r1" : g === next ? "bg-gold/10 text-foreground" : "text-muted-foreground"}`}
            >
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border ${ok ? "border-r1/50 bg-r1/10" : "border-border/50 bg-background/60"}`}
              >
                {glyph ? <GuideGlyphIcon glyph={glyph} size={16} /> : null}
              </span>
              <span className={ok ? "line-through decoration-r1/50" : ""}>{tr(g.label)}</span>
              <span aria-hidden className="ml-auto font-bold">
                {ok ? "✓" : ""}
              </span>
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
  );
}

/** The three classes, painted exactly as they stand in the hero picker. */
export function GuideClassCards() {
  return (
    <section className="slot overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
        <ArtIcon name="profile" size={20} />
        <h3 className="font-display text-sm text-gold">{tr("Your hero")}</h3>
      </div>
      <ul className="divide-y divide-border/40">
        {CLASS_CARDS.map((c) => (
          <li key={c.id} className="flex items-center gap-2 p-2">
            <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-gold/30 bg-gradient-to-b from-secondary/50 to-background/80">
              <img
                src={c.art}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-contain object-bottom"
              />
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm text-foreground">{tr(c.name)}</div>
              <div className="text-[11px] font-bold text-gold">{tr(c.resource)}</div>
              <p className="text-[11px] leading-snug text-muted-foreground">{tr(c.note)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The icons every screen uses — gold, stones, gems, ores — with the name of each. */
export function GuideLegend() {
  return (
    <section className="slot p-3">
      <div className="mb-2 flex items-center gap-2">
        <ArtIcon name="gem" size={20} />
        <h3 className="font-display text-sm text-gold">{tr("Icons and materials")}</h3>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3 lg:grid-cols-2">
        {GUIDE_LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border border-border/50 bg-background/60">
              <GuideGlyphIcon glyph={item.glyph} size={18} />
            </span>
            <span className="min-w-0 truncate text-muted-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

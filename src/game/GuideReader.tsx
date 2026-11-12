import { useState } from "react";
import { tr } from "./i18n";
import { GameTabs } from "./ui";
import { GUIDE_CHAPTERS, GUIDE_GOALS, goalsDone, searchGuide, type GuideChapter } from "./guide";
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
 * Steps are interactive — click to expand/collapse the full description.
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
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [query, setQuery] = useState("");
  const current = chapterId ?? own;
  const setChapter = (id: string) => {
    setOwn(id);
    setExpanded(new Set([0]));
    onChapter?.(id);
  };
  const index = Math.max(
    0,
    GUIDE_CHAPTERS.findIndex((c) => c.id === current),
  );
  const chapter = GUIDE_CHAPTERS[index];
  const art = CHAPTER_ART[chapter.id] ?? CHAPTER_ART["start"];

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(chapter.steps.map((_, i) => i)));
  const collapseAll = () => setExpanded(new Set());

  const hits = query.trim().length >= 2 ? searchGuide(query) : [];

  return (
    <section className="min-w-0">
      {/* Search across every chapter and step, so a long book still answers one question fast. */}
      <div className="mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr("Search the guide")}
          aria-label={tr("Search the guide")}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
        {query.trim().length >= 2 &&
          (hits.length ? (
            <ul className="mt-1 grid gap-1">
              {hits.map((h, i) => (
                <li key={`${h.chapterId}-${i}`}>
                  <button
                    onClick={() => {
                      setChapter(h.chapterId);
                      setQuery("");
                    }}
                    className="slot w-full p-2 text-left text-xs"
                  >
                    <b className="text-gold">{h.title}</b>
                    <span className="text-muted-foreground"> · {h.chapterTab}</span>
                    <span className="mt-0.5 block text-muted-foreground">{h.excerpt}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">{tr("Nothing in the guide matches that word.")}</p>
          ))}
      </div>

      {/* The internal tab bar only renders for the public handbook route (/guide);
          GameGuide passes chapterId/onChapter and renders its own tabs above. */}
      {!chapterId && (
        <GameTabs
          label={tr("Guide chapters")}
          value={chapter.id}
          onChange={setChapter}
          tabs={GUIDE_CHAPTERS.map((c) => ({ id: c.id, name: c.tab }))}
        />
      )}

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

        {/* Interactive expand/collapse controls */}
        <div className="flex items-center justify-between gap-2 px-2 pt-2 sm:px-3">
          <span className="text-[11px] text-muted-foreground">
            {tr("Tap a step to expand or collapse")}
          </span>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-[11px] font-display text-gold/70 hover:text-gold">
              {tr("Expand all")}
            </button>
            <span className="text-muted-foreground/40">·</span>
            <button onClick={collapseAll} className="text-[11px] font-display text-gold/70 hover:text-gold">
              {tr("Collapse all")}
            </button>
          </div>
        </div>

        <ol className="grid gap-2 p-2 sm:p-3 md:grid-cols-2">
          {chapter.steps.map((s, i) => {
            const glyph = stepGlyph(chapter, i);
            const isOpen = expanded.has(i);
            return (
              <li
                key={s.title}
                className={`flex flex-col rounded-md border bg-background/50 transition-all cursor-pointer ${
                  isOpen
                    ? "border-gold/40 bg-gold/5"
                    : "border-border/40 hover:border-gold/20 hover:bg-secondary/20"
                }`}
                onClick={() => toggle(i)}
              >
                <div className="flex gap-2.5 p-2.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gold/40 bg-gradient-to-b from-secondary/60 to-background/80">
                    {glyph ? (
                      <GuideGlyphIcon glyph={glyph} size={26} />
                    ) : (
                      <span className="font-display text-base text-gold">{i + 1}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-sm leading-tight text-foreground">
                      <span className="mr-1.5 text-gold/70">{i + 1}.</span>
                      {s.title}
                    </h4>
                    <div
                      className={`grid transition-all duration-200 ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="overflow-hidden text-xs leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
                    </div>
                    {!isOpen && (
                      <span className="mt-0.5 inline-block text-[10px] text-gold/50">▾ {tr("click to read")}</span>
                    )}
                  </div>
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

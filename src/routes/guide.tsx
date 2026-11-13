import { createFileRoute, Link } from "@tanstack/react-router";
import castle from "@/assets/castle.jpg.asset.json";
import { useT } from "@/game/i18n";
import { ArtIcon } from "@/game/ArtIcon";
import { LanguagePicker } from "@/game/LanguagePicker";
import { GuideClassCards, GuideLegend, GuideReader } from "@/game/GuideReader";

export const Route = createFileRoute("/guide")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "How to play — EmberFall Online" },
      {
        name: "description",
        content:
          "The painted handbook of EmberFall Online: classes, battles, gear, gates, guilds and the daily routine, with the game's own pictures and icons.",
      },
      { property: "og:title", content: "How to play — EmberFall Online" },
      {
        property: "og:description",
        content:
          "Classes, battles, gear, gates, guilds and the daily routine — the whole game, with its own pictures.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

/** The handbook, readable before signing in, so a first-time player knows the game before making a hero. */
function GuidePage() {
  const t = useT();
  return (
    <div className="h-[100dvh] overflow-y-auto">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${castle.url})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-background/80 vignette" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 sm:py-5">
        <header className="game-panel anim-pop mb-3 flex flex-wrap items-center gap-3 p-3 sm:p-4">
          <span className="panel-crest shrink-0">
            <ArtIcon name="spellbook" size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="panel-title text-xl font-bold sm:text-3xl">{t("Game Guide")}</h1>
            <p className="text-[11px] text-muted-foreground sm:text-sm">
              {t("How to play, step by step")}
            </p>
          </div>
          <LanguagePicker className="order-3 w-full justify-end sm:order-2 sm:w-auto" />
          <Link to="/auth" className="btn-gold order-2 px-3 py-2 text-sm sm:order-3">
            {t("Sign in")}
          </Link>
        </header>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <aside className="order-1 space-y-3 lg:order-2">
            <GuideClassCards />
            <GuideLegend />
          </aside>
          <div className="order-2 min-w-0 lg:order-1">
            <GuideReader />
          </div>
        </div>

        <footer className="game-panel mt-4 flex flex-col items-center gap-2 p-4 text-center">
          <p className="max-w-xl text-xs text-muted-foreground sm:text-sm">
            {t(
              "Read the handbook before you play — every chapter matches a real screen in the game.",
            )}
          </p>
          <Link to="/auth" className="btn-gold px-5 py-2.5 font-display">
            {t("Create account")}
          </Link>
        </footer>
      </div>
    </div>
  );
}

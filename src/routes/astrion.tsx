import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GAMES } from "@/astrion/games";
import { AstrionLogo } from "@/astrion/Logo";

export const Route = createFileRoute("/astrion")({
  head: () => ({
    meta: [
      { title: "Astrion Entertainment — Browser Games" },
      { name: "description", content: "Astrion Entertainment is a small indie team making browser games. Play EmberFall Online and discover our catalogue." },
      { property: "og:title", content: "Astrion Entertainment — Browser Games" },
      { property: "og:description", content: "A small indie team making browser experiences. Browse our games catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  staticData: { sitemap: true },
  component: AstrionPage,
});

function AstrionPage() {
  const [filter, setFilter] = useState<"all" | "live" | "soon">("all");
  const list = GAMES.filter((g) => filter === "all" || g.status === filter);
  return (
    <div className="astrion font-sans">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/astrion" className="flex items-center gap-3">
          <AstrionLogo />
          <span className="font-display text-lg font-bold tracking-widest">ASTRION<span className="astr-accent"> ENTERTAINMENT</span></span>
        </a>
        <nav className="flex gap-6 text-sm astr-muted">
          <a href="#games">Games</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="flex justify-center"><AstrionLogo size={96} /></div>
        <h1 className="mt-6 text-4xl font-bold md:text-6xl">Worlds you can play <span className="astr-accent">in your browser</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-lg astr-muted">We are a small indie team that makes browser experiences. No downloads — just open a tab and play.</p>
        <a href="#games" className="astr-btn mt-8 inline-block rounded-full px-8 py-3 font-semibold">Browse games</a>
      </section>

      <section id="games" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">Games catalogue</h2>
          <div className="flex gap-2 text-sm">
            {(["all", "live", "soon"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 ${filter === f ? "astr-btn" : "astr-card astr-muted"}`}>
                {f === "all" ? "All" : f === "live" ? "Play now" : "Coming soon"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <article key={g.id} className="astr-card overflow-hidden rounded-2xl">
              {g.cover ? (
                <img src={g.cover} alt={g.title} className="aspect-video w-full object-cover" loading="lazy" />
              ) : (
                <div className="astr-placeholder flex aspect-video items-center justify-center"><AstrionLogo size={56} /></div>
              )}
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest astr-accent">{g.genre}</p>
                <h3 className="mt-1 text-xl font-bold">{g.title}</h3>
                <p className="mt-2 text-sm astr-muted">{g.tagline}</p>
                {g.status === "live" && g.href ? (
                  <a href={g.href} className="astr-btn mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold">Play now</a>
                ) : (
                  <span className="astr-card mt-4 inline-block rounded-full px-5 py-2 text-sm astr-muted">Coming soon</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">About us</h2>
        <p className="mt-4 astr-muted">Astrion Entertainment is an independent studio building games that run straight in the browser. We keep our team small, ship often and grow every world with our players.</p>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm astr-muted" style={{ borderColor: "var(--astr-border)" }}>
        © {new Date().getFullYear()} Astrion Entertainment. All rights reserved.
      </footer>
    </div>
  );
}

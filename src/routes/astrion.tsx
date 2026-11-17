import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gamepad2, Zap, Users, Menu, X, ArrowRight, Sparkles, Mail } from "lucide-react";
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

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".astr-reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("astr-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

const NAV = [["#games", "Games"], ["#featured", "Featured"], ["#news", "News"], ["#about", "Studio"], ["#contact", "Contact"]];
const NEWS = [
  ["Nov 2026", "The Awakening Update", "EmberFall Online opens a whole new path after level 90: the Endless Abyss, Raiment and the Constellation."],
  ["Nov 2026", "Arena Clash goes live", "Parties of up to four now fight other players in real time every six hours."],
  ["Oct 2026", "EmberFall on your phone", "Install EmberFall as an app on PC and phone and play full-screen."],
];

function AstrionPage() {
  const [filter, setFilter] = useState<"all" | "live" | "soon">("all");
  const [open, setOpen] = useState(false);
  const list = GAMES.filter((g) => filter === "all" || g.status === filter);
  useReveal();
  const live = GAMES.filter((g) => g.status === "live").length;
  return (
    <div className="astrion font-sans">
      <div className="astr-stars" aria-hidden />
      <header className="astr-nav sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/astrion" className="flex items-center gap-3">
            <AstrionLogo />
            <span className="font-display text-lg font-bold tracking-widest">ASTRION<span className="astr-accent"> ENTERTAINMENT</span></span>
          </a>
          <nav className="hidden gap-7 text-sm astr-muted md:flex">
            {NAV.map(([h, l]) => <a key={h} href={h} className="astr-link">{l}</a>)}
          </nav>
          <a href="/" className="astr-btn hidden rounded-full px-5 py-2 text-sm font-semibold md:inline-flex">Play now</a>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 px-6 pb-5 astr-muted md:hidden">
            {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}
          </nav>
        )}
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="astr-orb h-72 w-72 -left-10 top-10" style={{ background: "var(--astr-primary)" }} />
        <div className="astr-orb h-60 w-60 right-0 top-40" style={{ background: "var(--astr-glow)", animationDelay: "-6s" }} />
        <div className="astr-logo-spin flex justify-center"><AstrionLogo size={110} /></div>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs uppercase tracking-widest astr-card astr-accent"><Sparkles size={14} /> Independent browser game studio</p>
        <h1 className="mt-6 text-4xl font-bold md:text-7xl">Worlds you can play <span className="astr-gradtext">in your browser</span></h1>
        <p className="mx-auto mt-6 max-w-xl text-lg astr-muted">We are a small indie team that makes browser experiences. No downloads — just open a tab and play.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <a href="#games" className="astr-btn inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold">Browse games <ArrowRight size={18} /></a>
          <a href="#about" className="astr-ghost rounded-full px-8 py-3 font-semibold">Meet the studio</a>
        </div>
        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
          {[[String(live), "Live game"], [String(GAMES.length - live), "In development"], ["100%", "In your browser"]].map(([n, l]) => (
            <div key={l} className="astr-card astr-reveal rounded-2xl p-4">
              <div className="text-3xl font-bold astr-gradtext">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider astr-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="overflow-hidden border-y py-3" style={{ borderColor: "var(--astr-border)" }}>
        <div className="astr-marquee flex w-max gap-12 whitespace-nowrap text-sm uppercase tracking-[0.3em] astr-muted">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Instant play", "Cross-platform", "Cloud saves", "Free to start", "Built with players", "EmberFall Online"].map((w) => <span key={k + w}>✦ {w}</span>))}
        </div>
      </div>

      <section className="mx-auto mt-16 grid max-w-6xl gap-5 px-6 sm:grid-cols-3">
        {([
          [Zap, "Instant play", "Every game runs in your browser on PC and phone. Nothing to install."],
          [Gamepad2, "Free to start", "Make an account and jump straight in. Progress saves to the cloud."],
          [Users, "Built with players", "We are a small team that listens, updates often and adds new worlds."],
        ] as const).map(([Icon, t, d], i) => (
          <div key={t} className="astr-card astr-lift astr-reveal rounded-2xl p-6" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="astr-btn inline-flex rounded-xl p-2.5"><Icon size={22} /></div>
            <h3 className="mt-4 text-lg font-bold">{t}</h3>
            <p className="mt-2 text-sm astr-muted">{d}</p>
          </div>
        ))}
      </section>

      <section id="featured" className="astr-reveal mx-auto mt-20 max-w-6xl scroll-mt-24 px-6">
        <div className="astr-card astr-lift grid overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="overflow-hidden"><img src={GAMES[0].cover} alt={GAMES[0].title} className="h-full min-h-56 w-full object-cover" /></div>
          <div className="p-8 md:p-10">
            <p className="text-xs uppercase tracking-widest astr-accent">Featured game</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">{GAMES[0].title}</h2>
            <p className="mt-3 astr-muted">A fantasy MMORPG with castles, guild wars, dungeons, live arena events and a long road to level 90 and beyond.</p>
            <ul className="mt-5 grid grid-cols-2 gap-2 text-sm astr-muted">
              {["3 classes", "Guild Wars", "Live Arena Clash", "The Awakening"].map((x) => <li key={x}>✦ {x}</li>)}
            </ul>
            <a href={GAMES[0].href} className="astr-btn mt-7 inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold">Play {GAMES[0].title} <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section id="games" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="astr-reveal mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest astr-accent">Our worlds</p>
            <h2 className="mt-1 text-3xl font-bold md:text-4xl">Games catalogue</h2>
          </div>
          <div className="flex gap-2 text-sm">
            {(["all", "live", "soon"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 transition ${filter === f ? "astr-btn" : "astr-ghost astr-muted"}`}>
                {f === "all" ? "All" : f === "live" ? "Play now" : "Coming soon"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 && <p className="astr-muted">No games here yet.</p>}
          {list.map((g) => (
            <article key={g.id} className="astr-card astr-lift overflow-hidden rounded-2xl">
              <div className="relative overflow-hidden">
                {g.cover ? (
                  <img src={g.cover} alt={g.title} className="aspect-video w-full object-cover" loading="lazy" />
                ) : (
                  <div className="astr-placeholder flex aspect-video items-center justify-center"><AstrionLogo size={56} /></div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${g.status === "live" ? "astr-btn" : "astr-card astr-muted"}`}>{g.status === "live" ? "● Live" : "In development"}</span>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest astr-accent">{g.genre}</p>
                <h3 className="mt-1 text-xl font-bold">{g.title}</h3>
                <p className="mt-2 text-sm astr-muted">{g.tagline}</p>
                {g.status === "live" && g.href ? (
                  <a href={g.href} className="astr-btn mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold">Play now <ArrowRight size={14} /></a>
                ) : (
                  <span className="astr-ghost mt-4 inline-block rounded-full px-5 py-2 text-sm astr-muted">Coming soon</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="news" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <p className="astr-reveal text-xs uppercase tracking-widest astr-accent">Studio news</p>
        <h2 className="astr-reveal mt-1 text-3xl font-bold md:text-4xl">Latest updates</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {NEWS.map(([d, t, b], i) => (
            <a key={t} href="/" className="astr-card astr-lift astr-reveal block rounded-2xl p-6" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="text-xs astr-muted">{d} · EmberFall Online</p>
              <h3 className="mt-2 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm astr-muted">{b}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm astr-accent">Read more <ArrowRight size={14} /></span>
            </a>
          ))}
        </div>
      </section>

      <section id="about" className="astr-reveal mx-auto max-w-3xl scroll-mt-24 px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-widest astr-accent">The studio</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">About Astrion</h2>
        <p className="mt-5 astr-muted">Astrion Entertainment is an independent studio building games that run straight in the browser. We keep our team small, ship often and grow every world together with our players.</p>
      </section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24">
        <div className="astr-card astr-reveal relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
          <div className="astr-orb h-64 w-64 -right-10 -top-10" style={{ background: "var(--astr-primary)" }} />
          <h2 className="text-3xl font-bold md:text-4xl">Ready to <span className="astr-gradtext">jump in?</span></h2>
          <p className="mx-auto mt-4 max-w-lg astr-muted">Start your adventure in EmberFall Online today, and keep an eye out for our next worlds.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/" className="astr-btn inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold"><Gamepad2 size={18} /> Play EmberFall</a>
            <a href="#games" className="astr-ghost inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold"><Mail size={18} /> See all games</a>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-10 text-sm astr-muted" style={{ borderColor: "var(--astr-border)" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3"><AstrionLogo size={28} /><span>© {new Date().getFullYear()} Astrion Entertainment. All rights reserved.</span></div>
          <nav className="flex gap-6">{NAV.map(([h, l]) => <a key={h} href={h} className="astr-link">{l}</a>)}</nav>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { InstallAppButton } from "@/components/InstallAppButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VERSION } from "@/game/version";
import updates from "@/game/update-history.json";
import castle from "@/assets/castle.jpg.asset.json";
import worldMap from "@/assets/scene-world-map.jpg";
import guildHall from "@/assets/scene-guild-hall.jpg";
import spire from "@/assets/spire-catacomb.jpg";
import tower from "@/assets/magic-tower-observatory.jpg";
import farm from "@/assets/farm-estate.jpg";
import arena from "@/assets/arena-rift.jpg";
import knight from "@/assets/heroes/knight-male-idle.png";
import mage from "@/assets/heroes/mage-female-idle.png";
import archer from "@/assets/heroes/archer-male-idle.png";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "EmberFall Online — Official Site of the Dark-Fantasy Browser MMORPG" },
      { name: "description", content: "Rule your castle, forge legendary armour, raid bosses with your guild and fight real players. Sign in and play EmberFall Online free in your browser." },
      { property: "og:title", content: "EmberFall Online — Official Site" },
      { property: "og:description", content: "A dark-fantasy browser MMORPG: castles, guilds, bosses, Arena Clash and endless gear." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: castle.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/* ------------------------------------------------------------------ content */

const CLASSES = [
  {
    name: "Knight",
    role: "The wall",
    img: knight,
    text: "Hold the front line. Heavy armour, deep health and a bloodrage that turns a long fight in your favour.",
    tags: ["Frontline", "Sustain", "Heavy armour"],
    skills: "Strike · Cleave · Bloodrage",
  },
  {
    name: "Mage",
    role: "The storm",
    img: mage,
    text: "Break a whole room at once. Frost holds enemies in place while meteors end them — and Renewal keeps a party standing.",
    tags: ["Burst", "Control", "Party healing"],
    skills: "Arcane Bolt · Frost Nova · Meteor",
  },
  {
    name: "Archer",
    role: "The hunter",
    img: archer,
    text: "Strike first and never be hit. Precision shots, dodges and volleys that grow with every critical hit.",
    tags: ["Precision", "Critical", "Speed"],
    skills: "Shot · Volley · Death Snipe",
  },
];

const FEATURES = [
  { img: castle.url, title: "Your own castle", text: "Upgrade the Blacksmith, Barracks, Gold Mine, Magic Tower and more. Every building opens a new way to grow your hero." },
  { img: spire, title: "War Gates & dungeons", text: "Climb the Campaign, Dungeon and Conquest gates, and the Party Spire with friends — bosses guard the rarest materials." },
  { img: arena, title: "Arena & Arena Clash", text: "Duel any hero in the Blood Arena, or join Arena Clash every six hours: parties of up to four fight live, in sync." },
  { img: guildHall, title: "Guilds & Guild Wars", text: "Raid guild bosses, share weekly quests and declare wars from 5v5 to 100v100." },
  { img: worldMap, title: "The World Tree", text: "Explore a painted realm of keeps, ruins and sealed vaults, raid sites and chase daily bounties." },
  { img: tower, title: "Forge, gems & Astrals", text: "Craft Synthesis and Epic armour, cut gems, summon Astrals and try your luck with Lucky Shots." },
  { img: farm, title: "Farm, mine & minigames", text: "Grow crops, fill your gold cart while offline and relax with fishing, archery and tavern dice." },
];

const WORLD = [
  { img: worldMap, title: "The World Tree", text: "A painted realm of keeps, ruins and sealed vaults." },
  { img: guildHall, title: "The Guild Hall", text: "Wars, shared quests and a vault your whole guild fills." },
  { img: tower, title: "The Magic Tower", text: "Astrals, Lucky Shots and upgrades with no ceiling." },
  { img: farm, title: "The Farm Estate", text: "Crops, the Bloodoak and a gold cart that fills offline." },
];

const EVENTS = [
  { when: "Every 6 hours", title: "Arena Clash", text: "Form a party of 1 to 4 and fight another party live — everyone sees the same battle. Winners and losers both earn gold." },
  { when: "Every 2 hours", title: "World Boss", text: "The whole realm strikes one giant foe. Every hit counts toward the shared reward." },
  { when: "Every day", title: "Minigame Hall", text: "Fishing Pier, Rune Memory, Archery Range and Tavern Dice — quick rounds for gold and materials." },
  { when: "All week", title: "Calendar & bounties", text: "Daily and weekly boards, login rewards, World Tree bounties and seasonal events on the calendar." },
];

const GUILD = [
  "Declare a challenge against another guild in brackets from 5v5 up to 100v100.",
  "Once accepted, rosters lock and a 24-hour war begins — every fighter gets two attacks.",
  "Each win scores a point; the higher score takes the bigger spoils, and the losers are still paid.",
  "Between wars: timed guild boss raids, weekly shared quests, tournaments and a shared Guild Vault.",
];

const STEPS = [
  { title: "Sign in", text: "Use Google or email — your progress is saved to the cloud." },
  { title: "Create your hero", text: "Choose Knight, Mage or Archer, male or female." },
  { title: "Enter your castle", text: "Press Play, upgrade buildings, fight and join a guild." },
];

const FAQ = [
  { q: "Is EmberFall Online free to play?", a: "Yes. Sign in with Google or an email address, create a hero and play the whole game in your browser — no purchase is needed to start." },
  { q: "Do I need to download anything?", a: "No. The game runs in the browser on desktop, tablet and phone. Sign in on another device and your castle is exactly where you left it." },
  { q: "Is my progress saved?", a: "Your hero, castle, equipment and guild membership are saved to your account in the cloud, not to one device." },
  { q: "Can I play with friends?", a: "Yes. Climb the Party Spire with up to four heroes, join an Arena Clash party, or build a guild and declare wars from 5v5 to 100v100." },
  { q: "Which languages are supported?", a: "English, Greek and Polish. The language is chosen by hand on the sign-in screen, the hero picker and in Settings." },
  { q: "How often does the realm change?", a: "All the time. Updates, hotfixes and balance changes are published in the in-game Announcements panel — more than 400 entries so far." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Read straight from the ISO day so the server and the browser never disagree. */
function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function shortText(text: string, max = 210) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

/* ---------------------------------------------------------------------- page */

function Home() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  const cta = signedIn ? (
    <Link to="/play" className="btn-gold inline-block px-8 py-3 font-display text-lg">Play now</Link>
  ) : (
    <Link to="/auth" className="btn-gold inline-block px-8 py-3 font-display text-lg">Sign in to play</Link>
  );
  const latest = updates.slice(0, 3);

  return (
    <div className="h-screen overflow-y-auto scroll-smooth bg-background text-foreground">
      {/* A slim realm bar: the official build, always in view. */}
      <div className="border-b border-gold/20 bg-card/60 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
        <span className="text-gold">◆</span> EmberFall Online · Version {VERSION} is live <span className="text-gold">·</span> Free to play in your browser
      </div>

      <header className="sticky top-0 z-30 border-b border-gold/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 font-display text-xl text-gold">EmberFall Online</Link>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#classes" className="hidden text-muted-foreground hover:text-gold md:inline">Classes</a>
            <a href="#world" className="hidden text-muted-foreground hover:text-gold md:inline">World</a>
            <a href="#features" className="hidden text-muted-foreground hover:text-gold md:inline">Features</a>
            <a href="#events" className="hidden text-muted-foreground hover:text-gold lg:inline">Events</a>
            <a href="#guild-wars" className="hidden text-muted-foreground hover:text-gold lg:inline">Guilds</a>
            <a href="#updates" className="hidden text-muted-foreground hover:text-gold lg:inline">Updates</a>
            <a href="#faq" className="hidden text-muted-foreground hover:text-gold xl:inline">FAQ</a>
            <Link to="/guide" className="text-muted-foreground hover:text-gold">Guide</Link>
            {signedIn ? (
              <>
                <button className="hidden text-muted-foreground hover:text-gold sm:inline" onClick={() => void supabase.auth.signOut()}>Sign out</button>
                <Link to="/play" className="btn-gold px-4 py-1.5 font-display">Play</Link>
              </>
            ) : (
              <Link to="/auth" className="btn-gold px-4 py-1.5 font-display">Sign in</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={castle.url} alt="The EmberFall castle" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="font-display text-sm uppercase tracking-widest text-gold/80">A dark-fantasy browser MMORPG</p>
            <h1 className="mt-2 font-display text-5xl leading-tight text-gold md:text-6xl">Rise from the embers.</h1>
            <p className="mt-4 max-w-md text-lg text-foreground/85">
              Choose a Knight, Mage or Archer, take command of your own castle and carve your name into the realm — alone, with friends, or with your whole guild.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {cta}
              <span className="text-sm text-muted-foreground">Free to play · English, Ελληνικά, Polski</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {["No download", "Desktop & mobile", "Cloud saves", "Touch controls"].map((chip) => (
                <span key={chip} className="slot px-2.5 py-1">{chip}</span>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-center gap-2">
            <img src={mage} alt="Mage" className="h-56 object-contain md:h-80" />
            <img src={knight} alt="Knight" className="h-72 object-contain md:h-[26rem]" />
            <img src={archer} alt="Archer" className="h-56 object-contain md:h-80" />
          </div>
        </div>
      </section>

      {/* Realm in numbers */}
      <section className="border-y border-gold/20 bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 text-center sm:grid-cols-4">
          {[
            ["3", "classes to master"],
            ["6", "Spire dungeons"],
            ["100v100", "guild wars"],
            [`${updates.length}+`, "realm updates"],
          ].map(([n, label]) => (
            <div key={label} className="game-panel rounded-md px-3 py-3">
              <div className="font-display text-2xl text-gold">{n}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <p className="text-center font-display text-sm uppercase tracking-widest text-gold/80">Choose your path</p>
        <h2 className="mt-1 text-center font-display text-3xl text-gold">Three classes, three ways to win</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Every class carries its own active skills, passive talents and party role. Pick the one that fits how you fight — the castle serves all three.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CLASSES.map((c) => (
            <article key={c.name} className="game-panel overflow-hidden rounded-md">
              <div className="relative flex h-52 items-end justify-center bg-gradient-to-b from-card to-background">
                <img src={c.img} alt={c.name} loading="lazy" className="h-52 object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]" />
                <span className="absolute left-4 top-4 rounded bg-background/80 px-2 py-0.5 font-display text-xs uppercase tracking-widest text-gold">{c.role}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl text-gold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {c.tags.map((tag) => (
                    <span key={tag} className="slot px-2 py-0.5">{tag}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gold/90">{c.skills}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The world */}
      <section id="world" className="scroll-mt-20 border-y border-gold/20 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-center font-display text-sm uppercase tracking-widest text-gold/80">The realm</p>
          <h2 className="mt-1 text-center font-display text-3xl text-gold">A painted world, built to explore</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {WORLD.map((w) => (
              <figure key={w.title} className="game-panel relative overflow-hidden rounded-md">
                <img src={w.img} alt={w.title} loading="lazy" className="h-52 w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-xl text-gold">{w.title}</h3>
                  <p className="text-sm text-foreground/85">{w.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <p className="text-center font-display text-sm uppercase tracking-widest text-gold/80">Everything in one realm</p>
        <h2 className="mt-1 text-center font-display text-3xl text-gold">What you do in EmberFall</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Fight, craft, build and trade. Your hero, castle and loot are saved to your account, so you pick up exactly where you left off on any device.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="game-panel overflow-hidden rounded-md">
              <img src={f.img} alt={f.title} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-display text-lg text-gold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="scroll-mt-20 border-y border-gold/20 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-center font-display text-sm uppercase tracking-widest text-gold/80">Something is always happening</p>
          <h2 className="mt-1 text-center font-display text-3xl text-gold">Live events</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            The realm runs on a clock. When an event opens, a notice appears in your castle and the Events button takes you straight there.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EVENTS.map((e) => (
              <div key={e.title} className="game-panel rounded-md p-5">
                <p className="font-display text-xs uppercase tracking-widest text-gold/70">{e.when}</p>
                <h3 className="mt-1 font-display text-xl text-gold">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guilds */}
      <section id="guild-wars" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img src={guildHall} alt="The Guild Hall" loading="lazy" className="game-panel w-full rounded-md object-cover" />
          <div>
            <p className="font-display text-sm uppercase tracking-widest text-gold/80">Stronger together</p>
            <h2 className="mt-1 font-display text-3xl text-gold">Guilds & Guild Wars</h2>
            <ul className="mt-5 space-y-3 text-foreground/85">
              {GUILD.map((g) => (
                <li key={g} className="flex gap-3"><span className="text-gold">◆</span><span>{g}</span></li>
              ))}
            </ul>
            <Link to="/guide" className="btn-ghost mt-6 inline-block px-4 py-2 text-sm">Read the guild chapter</Link>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section id="updates" className="scroll-mt-20 border-y border-gold/20 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-sm uppercase tracking-widest text-gold/80">From the forge</p>
              <h2 className="mt-1 font-display text-3xl text-gold">Latest realm updates</h2>
            </div>
            <span className="text-xs text-muted-foreground">The full change log lives in the game under Announcements.</span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {latest.map((u) => (
              <article key={u.id} className="game-panel flex flex-col rounded-md p-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded border border-gold/40 px-1.5 py-0.5 uppercase tracking-wide text-gold">{u.kind}</span>
                  <span>{shortDate(u.date)}</span>
                </div>
                <h3 className="mt-2 font-display text-lg leading-snug text-gold">{u.title}</h3>
                {typeof u.details === "string" && u.details ? (
                  <p className="mt-2 text-sm text-muted-foreground">{shortText(u.details)}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Play on your phone */}
      <section id="mobile" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center font-display text-3xl text-gold">Play on phone or desktop</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          EmberFall runs right in your phone's browser with touch controls, and installs as its own app on Windows, Mac and Android — sign in with the same account and your castle is waiting.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["1. Open the site", "Visit EmberFall Online in Safari or Chrome on your phone."],
            ["2. Add to home screen", "iPhone: Share → Add to Home Screen. Android: menu → Install app."],
            ["3. Tap the icon", "It opens full-screen straight into your castle, with the same cloud save."],
          ].map(([h, b]) => (
            <div key={h} className="game-panel rounded-lg p-5">
              <div className="font-display text-lg text-gold">{h}</div>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-6"><InstallAppButton /></div>
      </section>

      {/* How to begin */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl text-gold">How to begin</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="game-panel rounded-md p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 font-display text-lg text-gold">{i + 1}</div>
              <h3 className="mt-3 font-display text-lg text-gold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-y border-gold/20 bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-center font-display text-sm uppercase tracking-widest text-gold/80">Before you enter</p>
          <h2 className="mt-1 text-center font-display text-3xl text-gold">Questions from the gate</h2>
          <div className="mt-8 space-y-2">
            {FAQ.map((f) => (
              <details key={f.q} className="game-panel group rounded-md px-4 py-3">
                <summary className="cursor-pointer list-none font-display text-gold marker:hidden">
                  <span className="mr-2 inline-block text-gold/70 transition group-open:rotate-90">▸</span>
                  {f.q}
                </summary>
                <p className="mt-2 pl-5 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final call */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="game-panel rounded-md p-8">
          <h2 className="font-display text-3xl text-gold">Your castle is waiting</h2>
          <p className="mt-2 text-muted-foreground">Sign in with Google or email, create your hero and step through the gates.</p>
          <div className="mt-6">{cta}</div>
        </div>
      </section>

      <footer className="border-t border-gold/20 bg-background/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-lg text-gold">EmberFall Online</div>
            <p className="mt-1 text-xs text-muted-foreground">A dark-fantasy browser MMORPG. Build your castle, forge your legend and fight for the realm.</p>
            <p className="mt-3 text-[11px] text-muted-foreground">Version {VERSION} · English · Ελληνικά · Polski</p>
          </div>
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-gold/80">Play</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-gold">Sign in</Link></li>
              <li><Link to="/play" className="hover:text-gold">Enter the castle</Link></li>
              <li><Link to="/guide" className="hover:text-gold">How to play</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-gold/80">The game</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li><a href="#classes" className="hover:text-gold">Classes</a></li>
              <li><a href="#world" className="hover:text-gold">The world</a></li>
              <li><a href="#events" className="hover:text-gold">Live events</a></li>
              <li><a href="#features" className="hover:text-gold">Features</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-gold/80">The realm</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li><a href="#guild-wars" className="hover:text-gold">Guild Wars</a></li>
              <li><a href="#updates" className="hover:text-gold">Updates</a></li>
              <li><a href="#faq" className="hover:text-gold">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gold/10 px-4 py-4 text-center text-xs text-muted-foreground">
          © 2026 EmberFall Online. Free to play in your browser.
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { img: castle.url, title: "Your own castle", text: "Upgrade the Forge, Barracks, Gold Mine, Magic Tower and more. Every building opens a new way to grow your hero." },
  { img: spire, title: "War Gates & dungeons", text: "Climb the Campaign, Dungeon and Conquest gates, and the Party Spire with friends — bosses guard the rarest materials." },
  { img: arena, title: "Arena & Arena Clash", text: "Duel any hero in the Blood Arena, or join Arena Clash every six hours: parties of up to four fight live, in sync." },
  { img: guildHall, title: "Guilds & Guild Wars", text: "Raid guild bosses, share weekly quests and declare wars from 5v5 to 100v100." },
  { img: worldMap, title: "The World Tree", text: "Explore a painted realm of keeps, ruins and sealed vaults, raid sites and chase daily bounties." },
  { img: tower, title: "Forge, gems & Astrals", text: "Craft Synthesis and Epic armour, cut gems, summon Astrals and try your luck with Lucky Shots." },
  { img: farm, title: "Farm, mine & minigames", text: "Grow crops, fill your gold cart while offline and relax with fishing, archery and tavern dice." },
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
  return (
    <div className="h-screen overflow-y-auto scroll-smooth bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-gold/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-xl text-gold">EmberFall Online</span>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#features" className="hidden text-muted-foreground hover:text-gold sm:inline">Features</a>
            <a href="#events" className="hidden text-muted-foreground hover:text-gold sm:inline">Events</a>
            <a href="#guild-wars" className="hidden text-muted-foreground hover:text-gold sm:inline">Guild Wars</a>
            <Link to="/guide" className="text-muted-foreground hover:text-gold">Guide</Link>
            {signedIn ? (
              <>
                <button className="text-muted-foreground hover:text-gold" onClick={() => void supabase.auth.signOut()}>Sign out</button>
                <Link to="/play" className="btn-gold px-4 py-1.5 font-display">Play</Link>
              </>
            ) : (
              <Link to="/auth" className="btn-gold px-4 py-1.5 font-display">Sign in</Link>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={castle.url} alt="The EmberFall castle" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-20 md:grid-cols-2">
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
          </div>
          <div className="flex items-end justify-center gap-2">
            <img src={mage} alt="Mage" className="h-64 object-contain md:h-80" />
            <img src={knight} alt="Knight" className="h-80 object-contain md:h-[26rem]" />
            <img src={archer} alt="Archer" className="h-64 object-contain md:h-80" />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <h2 className="text-center font-display text-3xl text-gold">What you do in EmberFall</h2>
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


      <section id="events" className="scroll-mt-16 border-y border-gold/20 bg-card/40">
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

      <section id="guild-wars" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
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

      <section className="mx-auto max-w-4xl px-4 pb-20 text-center">
        <div className="game-panel rounded-md p-8">
          <h2 className="font-display text-3xl text-gold">Your castle is waiting</h2>
          <p className="mt-2 text-muted-foreground">Sign in with Google or email, create your hero and step through the gates.</p>
          <div className="mt-6">{cta}</div>
        </div>
      </section>

      <footer className="border-t border-gold/20 py-6 text-center text-xs text-muted-foreground">© 2026 EmberFall Online</footer>
    </div>
  );
}

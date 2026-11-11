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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-gold/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-xl text-gold">EmberFall Online</span>
          <nav className="flex items-center gap-3 text-sm">
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

      <section className="mx-auto max-w-6xl px-4 py-16">
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

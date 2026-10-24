import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Backpack, Anvil, Gift, Mail, Crosshair, ScrollText, Sparkles, UserCircle, Volume2, VolumeX, Cloud, CloudOff, Trophy, LogOut, Users, IdCard, Loader2, BookOpen, Leaf, CalendarDays, Gem, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityBoard, LuckyShots, Mailbox } from "./Rewards";
import { GuildHall } from "./GuildHall";
import { WorldChat } from "./WorldChat";
import { FriendsPanel } from "./FriendsPanel";
import { ScrollShop } from "./ScrollShop";
import { Bestiary } from "./Bestiary";
import { PassiveTree } from "./PassiveTree";
import { EventCalendar } from "./EventCalendar";
import { Boutique } from './Boutique';
import { Sanctuary } from './Sanctuary';
import { Expeditions } from './Expeditions';
import { Professions } from './Professions';
import { PremiumShop } from './PremiumShop';
import { AuctionHouse } from './AuctionHouse';
import { awardAncestralRelic } from './building-content';
import { beginScrollBattle } from "./services";
import { scrollFighter } from "./scrolls";
import castle from "@/assets/castle.jpg.asset.json";
import theme from "@/assets/theme.mp3.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { BUILDINGS, CASTLE_BUILDINGS, heroStats, type BuildingId, type Item } from "./data";
import { authHandoffPending, getState, leaveCharacter, update, useGame } from "./store";
import { recordBattle } from "./progress";
import { CharacterSelect, Portrait, ProfilePanel, frameClass } from "./CharacterSelect";
import { Battle, type Fighter } from "./Battle";
import { Arena, Campaign, Forge, HeroHall, Market, Oracle, Temple, XpBar, heroFighter, type StartBattle } from "./panels";
import { ThroneHall } from "./ThroneHall";
import { Challenges } from "./Challenges";
import { LongRoad } from "./LongRoad";
import { Crafting, GemWorkshop, MagicTower } from "./Workshop";
import { battleMats, matsLine, addMats } from "./crafting";
import { Gold, ItemCard, Panel, fmt } from "./ui";
import { CONQUEST_LEVEL, canEnterConquest } from "./data";

const useGameOverflow = () => getState().hero?.overflow?.length ?? 0;

export function Game() {
  const { hero, heroId, userId, cloud, authReady } = useGame();
  const nav = useNavigate();
  const [open, setOpen] = useState<ShortcutTarget | null>(null);
  const [battle, setBattle] = useState<null | { right: Fighter; left: Fighter; auto?: boolean; title: string; onResult: Parameters<StartBattle>[0]["onResult"] }>(null);
  const [result, setResult] = useState<null | { won: boolean; lines: string[]; loot?: Item | null }>(null);
  const [crafting, setCrafting] = useState(false);
  const [expeditions, setExpeditions] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem("bm-muted") === "1");
  const audio = useRef<HTMLAudioElement>(null);
  const starting = useRef(false);
  const [entryError, setEntryError] = useState("");

  // A sign-in that lands a beat late must not bounce the player out; re-check live state at fire time.
  useEffect(() => {
    if (!authReady || userId) return;
    const t = setTimeout(() => {
      if (getState().userId || authHandoffPending()) return;
      void nav({ to: "/auth" });
    }, 1500);
    return () => clearTimeout(t);
  }, [authReady, userId, nav]);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = 0.35;
    localStorage.setItem("bm-muted", muted ? "1" : "0");
    if (muted) { a.pause(); return; }
    const play = () => { if (!muted) void a.play().catch(() => {}); };
    play();
    window.addEventListener("pointerdown", play, { once: true });
    return () => window.removeEventListener("pointerdown", play);
  }, [muted]);

  const start: StartBattle = (o) => {
    if (!hero || starting.current || battle) return;
    starting.current = true; setEntryError("");
    void (async () => {
      try {
        const active = await beginScrollBattle();
        const current = getState();
        if (!current.hero) return;
        setOpen(null);
        setBattle({ ...o, left: scrollFighter({ ...heroFighter(current.hero, heroStats(current.hero)), gender: current.gender }, active) });
      } catch (e) { setEntryError(e instanceof Error ? e.message : "Battle entry failed."); }
      finally { starting.current = false; }
    })();
  };

  const settled = useRef<object | null>(null);
  const onEnd = async (won: boolean) => {
    // Rewards resolve exactly once per battle, even if onEnd fires twice.
    if (!battle || settled.current === battle) return;
    settled.current = battle;
    const before = useGameOverflow();
    const r0 = await battle.onResult(won, battle.left.scrolls?.includes("xp") ? 1.2 : 1);
    const r = { ...r0, lines: [...r0.lines] };
    if (useGameOverflow() > before && !r.lines.some((l) => /Overflow/.test(l))) r.lines.push("Bag full — loot placed in your Overflow Chest (Armory)");
    if (won) update((h) => { const m = battleMats(h.level + h.paragon, !!battle.right.boss); addMats(h, m); r.lines.push(...matsLine(m));
      if (awardAncestralRelic(h, !!battle.right.boss)) r.lines.push('+1 Ancestral Relic');
    });
    update((h) => recordBattle(h, { title: battle.title, won, boss: !!battle.right.boss, arena: /arena/i.test(battle.title), rewards: [...r.lines, ...(r.loot ? [r.loot.name] : [])] }));
    setResult({ won, ...r });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <audio ref={audio} src={theme.url} loop preload="auto" />
      {!authReady || !userId ? (
        <div className="flex h-full items-center justify-center gap-2 font-display text-lg"><Loader2 className="h-5 w-5 animate-spin" />Loading…</div>
      ) : !hero ? (
        <CharacterSelect />
      ) : (
        <>
          <CastleMap onOpen={setOpen} />
          <ShortcutBar open={open} onOpen={setOpen} />
          <nav aria-label="Rewards" className="game-panel absolute bottom-3 left-3 z-20 flex gap-1 p-1.5">
            <Button variant="ghost" size="icon" aria-label="Mailbox" title="Mailbox" onClick={() => setOpen("mailbox")}><Mail /></Button>
            <Button variant="ghost" size="icon" aria-label="Lucky Shots" title="Lucky Shots" onClick={() => setOpen("lucky")}><Crosshair /></Button>
            <Button variant="ghost" size="icon" aria-label="Battle Scrolls" title="Battle Scrolls" onClick={() => setOpen("scrolls")}><ScrollText /></Button>
            <Button variant="ghost" size="icon" aria-label="Passive Tree" title="Passive Tree" onClick={() => setOpen("passives")}><Leaf /></Button>
            <Button variant="ghost" size="icon" aria-label="Bestiary" title="Bestiary" onClick={() => setOpen("bestiary")}><BookOpen /></Button>
            <Button variant="ghost" size="icon" aria-label="Profession Lodge" title="Profession Lodge" onClick={()=>setOpen('professions')}><Anvil/></Button>
            <Button variant="ghost" size="icon" aria-label="Premium Shop" title="Premium Shop" onClick={()=>setOpen('premium')}><Gem/></Button>
            <Button variant="ghost" size="icon" aria-label="Auction House" title="Auction House" onClick={()=>setOpen('auction')}><Gavel/></Button>
          </nav>
          <WorldChat heroId={heroId} />
          <Hud muted={muted} setMuted={setMuted} cloud={cloud} onProfile={() => setOpen("profile")} />
          {open === "profile" && <ProfilePanel onClose={() => setOpen(null)} />}
          {open === "mailbox" && <Mailbox onClose={() => setOpen(null)} />}
          {open === "lucky" && <LuckyShots onClose={() => setOpen(null)} />}
          {open === "daily" && <ActivityBoard onClose={() => setOpen(null)} />}
          {open === "guild" && <GuildHall onClose={() => setOpen(null)} />}
          {open === "scrolls" && <ScrollShop onClose={() => setOpen(null)} />}
          {open === "hall" && <ThroneHall onClose={() => setOpen(null)} />}
          {open === "armory" && <HeroHall onClose={() => setOpen(null)} />}
          {open === "passives" && <PassiveTree onClose={() => setOpen(null)} />}
          {open === "bestiary" && <Bestiary h={hero} onClose={() => setOpen(null)} />}
          {open === "road" && <LongRoad onClose={() => setOpen(null)} start={start} />}
          {open === "calendar" && <EventCalendar h={hero} onClose={() => setOpen(null)} start={start} />}
          {open === 'boutique' && <Boutique onClose={()=>setOpen(null)} />}
          {open === 'professions' && <Professions onClose={()=>setOpen(null)} />}
          {open === 'premium' && <PremiumShop onClose={()=>setOpen(null)} />}
          {open === 'auction' && <AuctionHouse onClose={()=>setOpen(null)} />}
          {open === 'sanctuary' && <Sanctuary onClose={()=>setOpen(null)} start={start} />}
          {open && BUILDINGS.find((b) => b.id === open)?.soon && <ComingSoon id={open} onClose={() => setOpen(null)} />}
          {open === "friends" && (
            <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-background/70 p-4 pt-16" onClick={() => setOpen(null)}>
              <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <FriendsPanel heroId={heroId} />
                <button className="btn-ghost mt-2 w-full py-2" onClick={() => setOpen(null)}>Close</button>
              </div>
            </div>
          )}
          {open === "portal" && <Campaign onClose={() => setOpen(null)} start={start} />}
          {open === "spire" && (canEnterConquest(hero.level) ? <Campaign spire onClose={() => setOpen(null)} start={start} /> : <ComingSoon id="spire" locked onClose={() => setOpen(null)} />)}
          {open === "forge" && <Forge onClose={() => setOpen(null)} onCraft={() => setCrafting(true)} />}
          {crafting && <Crafting onClose={() => setCrafting(false)} />}
          {open === "dungeon" && <Challenges onClose={() => setOpen(null)} start={start} onExpeditions={()=>{setOpen(null);setExpeditions(true);}} />}
          {expeditions && <Expeditions onClose={()=>setExpeditions(false)} start={o=>{setExpeditions(false);start(o);}} />}
          {open === "gems" && <GemWorkshop onClose={() => setOpen(null)} />}
          {open === "tower" && <MagicTower onClose={() => setOpen(null)} />}
          {open === "temple" && <Temple onClose={() => setOpen(null)} />}
          {open === "market" && <Market onClose={() => setOpen(null)} />}
          {open === "arena" && <Arena onClose={() => setOpen(null)} start={start} />}
          {open === "oracle" && <Oracle onClose={() => setOpen(null)} start={start} />}
        </>
      )}
      {battle && <Battle key={battle.title + battle.right.name} left={battle.left} right={battle.right} auto={battle.auto} title={battle.title} onEnd={onEnd} />}
      {entryError && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"><div className="game-panel max-w-md p-5"><p role="alert">{entryError}</p><Button className="mt-4" onClick={() => { const id = getState().heroId; if (id) localStorage.removeItem(`ef-scroll-battle:${id}`); setEntryError(""); }}>Acknowledge and close</Button></div></div>}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="game-panel anim-pop w-full max-w-sm p-6 text-center">
            <h2 className={`font-display text-5xl font-black ${result.won ? "panel-title" : "text-blood"}`}>{result.won ? "VICTORY" : "DEFEAT"}</h2>
            <div className="my-4 space-y-1 font-display text-lg">{result.lines.map((l) => <div key={l}>{l}</div>)}</div>
            {result.loot && <ItemCard item={result.loot} />}
            <button className="btn-gold mt-5 w-full py-2.5 text-lg" onClick={() => { setResult(null); setBattle(null); }}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Hud({ muted, setMuted, cloud, onProfile }: { muted: boolean; setMuted: (m: boolean) => void; cloud: string; onProfile: () => void }) {
  const { hero, gender, chars, heroId } = useGame();
  const frame = chars?.find((c) => c.id === heroId)?.frame ?? "iron";
  if (!hero) return null;
  const s = heroStats(hero);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
      <div className="game-panel pointer-events-auto flex items-center gap-3 p-2 pr-4">
        <button className={`slot h-14 w-14 overflow-hidden ${frameClass(frame)}`} onClick={onProfile} aria-label="Profile">
          <Portrait cls={hero.cls} gender={gender} className="w-full" />
        </button>
        <div className="w-40">
          <div className="truncate font-display">{hero.name}</div>
          <div className="text-xs text-muted-foreground">Lv {hero.level}{hero.paragon ? ` · Asc ${hero.paragon}` : ""}</div>
          <XpBar hero={hero} />
        </div>
        <div className="hidden flex-col text-sm sm:flex">
          <Gold n={hero.gold} />
          <span className="font-bold"><Trophy className="mr-1 inline h-4 w-4 text-r4" />{fmt(s.power)}</span>
        </div>
      </div>
      <div className="game-panel pointer-events-auto flex items-center gap-2 p-2">
        <button className="slot flex h-10 w-10 items-center justify-center" onClick={() => setMuted(!muted)} aria-label="Music">
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-gold" />}
        </button>
        <span className="slot flex h-10 w-10 items-center justify-center" title={`Cloud: ${cloud}`}>
          {cloud === "error" ? <CloudOff className="h-5 w-5 text-hp" /> : <Cloud className={`h-5 w-5 ${cloud === "saved" ? "text-r1" : "text-muted-foreground"}`} />}
        </span>
        <button className="slot flex h-10 w-10 items-center justify-center" onClick={onProfile} aria-label="Profile"><IdCard className="h-5 w-5" /></button>
        <button className="slot flex h-10 w-10 items-center justify-center" onClick={() => void leaveCharacter()} aria-label="Switch character" title="Switch character"><Users className="h-5 w-5" /></button>
        <button className="slot flex h-10 w-10 items-center justify-center" onClick={async () => { if (await leaveCharacter()) await supabase.auth.signOut(); }} aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

function CastleMap({ onOpen }: { onOpen: (b: BuildingId) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative" style={{ width: "max(100vw, calc(100vh * 1.791))", aspectRatio: "1920 / 1072" }}>
        <img src={castle.url} alt="Blood moon castle" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold"
            style={{ left: `${(i * 37) % 100}%`, animationDuration: `${6 + (i % 5)}s`, animationDelay: `${i * 0.7}s` }} />
        ))}
        {CASTLE_BUILDINGS.map((b) => (
          <button key={b.id} className="hotspot" aria-label={b.name}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.r * 2}%`, aspectRatio: "1" }}
            onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onClick={() => onOpen(b.id)}>
            <span className={`hotspot-label ${b.soon ? "opacity-60" : ""} absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-xs transition md:text-sm ${hover === b.id ? "scale-110" : "opacity-90"}`}>
              {b.name}{b.soon ? " · soon" : ""}
              {hover === b.id && <span className="block text-[10px] text-foreground/80">{b.desc}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="vignette pointer-events-none absolute inset-0" />
    </div>
  );
}


const SOON_TEXT: Record<string, string> = {
  dungeon: "Replayable dungeons with boss encounters, entry requirements and reward tables.",
  boutique: "Outfits, weapon skins, mounts, auras and profile frames for Gold and Ember Crystals.",
  tower: "Collect Astrals, equip them into slots and upgrade them for stat bonuses.",
  sanctuary: "A multi-stage Ancestral questline unlocking the Ancestral skill tree and equipment.",
  gems: "Socket gems into gear, combine fragments and upgrade gems for real stat bonuses.",
  guild: "Create or join guilds, with roles, contribution, guild chat and co-op bosses.",
  friends: "Add friends, see who is online and send private messages.",
  daily: "A 7-day reward board that rotates to a new theme every week.",
};

function ComingSoon({ id, locked, onClose }: { id: string; locked?: boolean; onClose: () => void }) {
  const b = BUILDINGS.find((x) => x.id === id);
  return (
    <Panel title={b?.name ?? "Building"} onClose={onClose}>
      <div className="py-10 text-center">
        {locked ? (
          <>
            <p className="mb-2 font-display text-2xl text-gold">Locked</p>
            <p className="text-muted-foreground">Endless Conquest opens at character level {CONQUEST_LEVEL}. Keep clearing the Campaign Gate to level up.</p>
          </>
        ) : (
          <>
            <p className="mb-2 font-display text-2xl text-gold">Under construction</p>
            <p className="mx-auto max-w-md text-muted-foreground">{SOON_TEXT[id]}</p>
            <p className="mt-3 text-xs text-muted-foreground">This building isn't playable yet — it's coming in a future update.</p>
          </>
        )}
      </div>
    </Panel>
  );
}

type ShortcutTarget = BuildingId | "profile" | "mailbox" | "lucky" | "scrolls" | "passives" | "bestiary" | "road" | "calendar" | 'professions' | 'premium' | 'auction';
const SHORTCUTS: { id: ShortcutTarget; label: string; tip: string; Icon: typeof Backpack }[] = [
  { id: "armory", label: "Inventory", tip: "Bag & equipment", Icon: Backpack },
  { id: "forge", label: "Forge", tip: "Enhance & salvage gear", Icon: Anvil },
  { id: "daily", label: "Daily Rewards", tip: "7-day reward board", Icon: Gift },
  { id: "road", label: "Long Road", tip: "Endless regions past the campaign", Icon: Sparkles },
  { id: "calendar", label: "Events", tip: "World event calendar & reminders", Icon: CalendarDays },
  { id: "friends", label: "Friends", tip: "Friends & messages", Icon: Users },
  { id: "profile", label: "Profile", tip: "Your hero profile", Icon: UserCircle },
  { id: "oracle", label: "Quest Board", tip: "AI-generated quests", Icon: ScrollText },
  { id: "sanctuary", label: "Ancestral Sanctuary", tip: "Ancestral questline", Icon: Sparkles },
];

function ShortcutBar({ open, onOpen }: { open: ShortcutTarget | null; onOpen: (t: ShortcutTarget) => void }) {
  return (
    <nav aria-label="Shortcuts" className="game-panel pointer-events-auto absolute bottom-3 right-3 z-20 flex gap-1.5 p-1.5">
      {SHORTCUTS.map(({ id, label, tip, Icon }) => (
        <button key={id} onClick={() => onOpen(id)} aria-label={label} aria-pressed={open === id}
          className={`slot group relative flex h-11 w-11 items-center justify-center transition hover:scale-110 ${open === id ? "ring-2 ring-gold" : ""}`}>
          <Icon className={`h-5 w-5 ${open === id ? "text-gold" : ""}`} />
          <span role="tooltip" className="hotspot-label pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded px-2 py-1 text-left text-xs group-hover:block group-focus-visible:block">
            {label}<span className="block text-[10px] text-foreground/80">{tip}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

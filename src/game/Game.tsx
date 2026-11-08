import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityBoard, LuckyShots, Mailbox } from "./Rewards";
import { ArtIcon, type ArtIconName } from "./ArtIcon";
import { GuildHall } from "./GuildHall";
import { WorldChat } from "./WorldChat";
import { FarmPanel } from "./Farm";
import { announceOpenEvents, announceWorldEvent } from "./world-events";
import { FriendsPanel, useFriendRequestCount } from "./FriendsPanel";
import { ScrollShop } from "./ScrollShop";
import { Bestiary } from "./Bestiary";
import { EventCalendar } from "./EventCalendar";
import { Expeditions } from './Expeditions';
import { PremiumShop } from './PremiumShop';
import { AuctionHousePanel } from './Marketplace';
import { WorldMap } from './WorldMap';
import { beginScrollBattle } from "./services";
import { battleLockedByBlitz, settleBlitzRun } from "./blitz-run";
import { scrollFighter } from "./scrolls";
import castle from "@/assets/castle.jpg.asset.json";
import { readAudioSettings, saveAudioSettings, soundtrackUrl, type AudioSettings } from "./audio";
import { SettingsPanel } from "./Settings";
import { BUILDINGS, CASTLE_BUILDINGS, heroStats, type BuildingId, type Item } from "./data";
import { CHESTS, addChests, rewardChestReady, rollBattleChest } from "./chests";
import { vipXpMultiplier } from "./economy";
import { authHandoffPending, getState, update, useGame } from "./store";
import { recordBattle } from "./progress";
import { BOSS_CRYSTALS } from "./logic";
import { battleEssenceGain, enlightenmentUnlocked, rollSoulShards } from "./enlightenment";
import { DUNGEON_STAMINA, POTION_STAMINA, addPotions, rollStaminaPotion, spendStamina, staminaBlocker } from "./stamina";
import { arenaBlocker, spendArenaFight } from "./arena-limits";
import { addRenown, renownGain } from "./renown";
import { CharacterSelect } from "./CharacterSelect";
import { ProfilePanel } from "./ProfilePanel";
import { Battle, type Fighter } from "./Battle";
import { Campaign, Forge, HeroHall, Oracle, Temple, heroFighter, type StartBattle } from "./panels";
import { Arena } from "./Arena";
import { ThroneHall } from "./ThroneHall";
import { Challenges } from "./Challenges";
import { RelicTrials } from "./RelicTrials";
import { Crafting, GemWorkshop, MagicTower } from "./Workshop";
import { battleMats, matsLine, addMats } from "./crafting";
import { addStones, rollStoneDrop } from "./enchant";
import { addFateStones, rollFateStone } from "./fate";
import { ItemCard, Panel } from "./ui";
import { CONQUEST_LEVEL, canEnterConquest } from "./data";
import { QuestsButton, QuestsPanel } from "./Quests";
import { claimableLevelQuests, rollLevelQuests } from "./level-quests";
import { Hud } from "./HeroHud";
import { VERSION, RELEASE_NOTES } from "./version";

const useGameOverflow = () => getState().hero?.overflow?.length ?? 0;

/** Buildings whose battle leaves the panel open underneath, so the player lands back in it. */
const BATTLE_PANELS = ["portal", "spire", "worldmap"] as const;

export function Game() {
  const { hero, heroId, userId, cloud, authReady } = useGame();
  const friendRequests = useFriendRequestCount(heroId);
  const nav = useNavigate();
  const [open, setOpen] = useState<ShortcutTarget | null>(null);
  const [battle, setBattle] = useState<null | { right: Fighter; left: Fighter; auto?: boolean; title: string; dungeon?: boolean; onResult: Parameters<StartBattle>[0]["onResult"] }>(null);
  const [result, setResult] = useState<null | { won: boolean; lines: string[]; loot?: Item | null }>(null);
  const [crafting, setCrafting] = useState(false);
  const [expeditions, setExpeditions] = useState(false);
  const [relics, setRelics] = useState(false);
  // Music settings (volume, soundtrack, mute) live on the device, behind the HUD's settings button.
  const [sound, setSound] = useState<AudioSettings>(() => readAudioSettings());
  const changeSound = (patch: Partial<AudioSettings>) => setSound((s) => saveAudioSettings({ ...s, ...patch }));
  const audio = useRef<HTMLAudioElement>(null);
  const starting = useRef(false);
  const [entryError, setEntryError] = useState("");

  // Every level opens its own quest board: snapshot its counters the moment the level starts.
  useEffect(() => {
    if (!hero) return;
    update((h) => { if (!h.levelQuests || h.levelQuests.level !== h.level) rollLevelQuests(h); });
  }, [hero?.level]);

  // World chat announces each world event as it opens, so everyone sees the window go live.
  useEffect(() => {
    if (!heroId) return;
    void announceOpenEvents(heroId);
    const timer = setInterval(() => void announceOpenEvents(heroId), 10 * 60_000);
    return () => clearInterval(timer);
  }, [heroId]);

  // A sign-in that lands a beat late must not bounce the player out; re-check live state at fire time.
  useEffect(() => {
    if (!authReady || userId) return;
    const t = setTimeout(() => {
      if (getState().userId || authHandoffPending()) return;
      void nav({ to: "/auth" });
    }, 1500);
    return () => clearTimeout(t);
  }, [authReady, userId, nav]);

  // One soundtrack for the whole game: it starts on the first gesture and only
  // pauses while the player has the game muted. Opening the world map or entering
  // a battle never swaps it for another track; only the settings panel changes the
  // volume or picks the other soundtrack (see audio.ts).
  useEffect(() => {
    const main = audio.current;
    if (!main) return;
    main.volume = sound.volume;
    if (sound.muted) { main.pause(); return; }
    const play = () => { if (!sound.muted) void main.play().catch(() => {}); };
    play();
    window.addEventListener("pointerdown", play, { once: true });
    return () => window.removeEventListener("pointerdown", play);
  }, [sound]);

  const keepsPanel = open !== null && (BATTLE_PANELS as readonly string[]).includes(open);

  const start: StartBattle = (o) => {
    if (!hero || starting.current || battle) return;
    // A blitz keeps the hero out in the field: nothing fights until the run lands (see blitz-run.ts).
    const blitzLock = battleLockedByBlitz(hero);
    if (blitzLock) { setEntryError(blitzLock); return; }
    // Every priced battle charges its stamina up front, so a loss costs exactly as much as a win:
    // 20 for a Campaign Gate battle, 10 for a Dungeon Gate run (see stamina.ts).
    const staminaCost = o.stamina ?? (o.dungeon ? DUNGEON_STAMINA : 0);
    if (staminaCost > 0) {
      const staminaLock = staminaBlocker(hero, staminaCost);
      if (staminaLock) { setEntryError(staminaLock); return; }
    }
    // The Blood Arena allows five duels every twelve hours; a duel is spent on entry, win or lose
    // (see arena-limits.ts).
    if (o.arena) {
      const arenaLock = arenaBlocker(hero);
      if (arenaLock) { setEntryError(arenaLock); return; }
    }
    if (hero.blitzRun) update((h) => { settleBlitzRun(h); });
    if (staminaCost > 0) update((h) => spendStamina(h, staminaCost));
    if (o.arena) update((h) => spendArenaFight(h));
    starting.current = true; setEntryError("");
    void (async () => {
      try {
        const active = await beginScrollBattle();
        const current = getState();
        if (!current.hero) return;
        // The Campaign Gate, Conquest Gate and World Tree stay mounted under the battle, so the
        // player comes back to the exact screen they fought from instead of the castle.
        if (!keepsPanel) setOpen(null);
        setBattle({ ...o, left: scrollFighter({ ...heroFighter(current.hero, heroStats(current.hero), current.gender), gender: current.gender }, active) });
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
    const levelBefore = getState().hero?.level ?? 1;
    // VIP raises battle XP only; scrolls stack with it.
    const scrollXp = battle.left.scrolls?.includes("xp") ? 1.2 : 1;
    const r0 = await battle.onResult(won, scrollXp * vipXpMultiplier(getState().hero));
    const r = { ...r0, lines: [...r0.lines] };
    // World chat hears about the milestones worth bragging about, never about ordinary fights.
    const after = getState().hero;
    if (after && after.level > levelBefore) void announceWorldEvent(heroId, `reached level ${after.level}!`);
    if (r.loot && r.loot.rarity >= 2) void announceWorldEvent(heroId, `looted ${r.loot.name}!`);
    if (useGameOverflow() > before && !r.lines.some((l) => /Overflow/.test(l))) r.lines.push("Bag full — loot placed in your Overflow Chest (Armory)");
    if (won) update((h) => { const m = battleMats(h.level + h.paragon, !!battle.right.boss); addMats(h, m); r.lines.push(...matsLine(m)); });
    // Won fights pay Renown, the hero's own upgrade currency (see renown.ts).
    if (won) {
      const gained = renownGain({ boss: !!battle.right.boss, dungeon: !!battle.dungeon, arena: /arena/i.test(battle.title) });
      update((h) => addRenown(h, gained));
      r.lines.push(`+${gained} Renown`);
    }
    // A won fight sometimes leaves a chest on the field: gold is the common find, gems the rare one.
    if (won) {
      const drop = rollBattleChest();
      if (drop) {
        update((h) => addChests(h, drop, 1));
        r.lines.push(`${CHESTS[drop].name} found — open it in the Armory vault`);
      }
    }
    update((h) => recordBattle(h, { title: battle.title, won, boss: !!battle.right.boss, arena: /arena/i.test(battle.title), rewards: [...r.lines, ...(r.loot ? [r.loot.name] : [])] }));
    // Boss victories are the second source of Void Crystals beside level-ups (see logic.grant).
    if (won && battle.right.boss) {
      update((h) => { h.voidCrystals = (h.voidCrystals ?? 0) + BOSS_CRYSTALS; });
      r.lines.push(`+${BOSS_CRYSTALS} Void Crystal`);
    }
    // Battle Essence feeds the Enlightenment track (unlocked at level 20); Soul Shards are a chance drop.
    if (won && enlightenmentUnlocked(getState().hero ?? { level: 0 })) {
      const essence = battleEssenceGain((getState().hero?.level ?? 1) + (getState().hero?.paragon ?? 0), !!battle.right.boss);
      update((h) => { h.battleEssence = (h.battleEssence ?? 0) + essence; });
      r.lines.push(`+${essence} Battle Essence`);
    }
    if (won) {
      const shards = rollSoulShards(!!battle.right.boss);
      if (shards > 0) {
        update((h) => { h.soulShards = (h.soulShards ?? 0) + shards; });
        r.lines.push(`+${shards} Soul Shard${shards > 1 ? "s" : ""} ✦`);
      }
    }
    // Won fights sometimes leave an enchantment stone behind: bosses always, elites often (see enchant.ts).
    if (won) {
      const live = getState().hero;
      const stone = rollStoneDrop((live?.level ?? 1) + (live?.paragon ?? 0), !!battle.right.boss);
      if (stone) {
        update((h) => addStones(h, stone.level, stone.n));
        r.lines.push(`+${stone.n} Lv ${stone.level} Enchantment Stone`);
      }
    }
    // A won fight can very rarely leave a Fate Stone behind for the Forge's refinement (see fate.ts).
    if (won) {
      const fate = rollFateStone(!!battle.right.boss, !!battle.right.elite);
      if (fate > 0) {
        update((h) => addFateStones(h, fate));
        r.lines.push(`+${fate} Fate Stone${fate > 1 ? "s" : ""}`);
      }
    }
    // A won dungeon run can leave a Stamina Potion behind — rare, but the only source (see stamina.ts).
    if (won && battle.dungeon) {
      const potions = rollStaminaPotion();
      if (potions > 0) {
        update((h) => addPotions(h, potions));
        r.lines.push(`+${potions} Stamina Potion — +${POTION_STAMINA} stamina`);
      }
    }
    setResult({ won, ...r });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <audio key={sound.track} ref={audio} src={soundtrackUrl(sound.track)} loop preload="auto" />
      {!authReady || !userId ? (
        <div className="flex h-full items-center justify-center gap-2 font-display text-lg"><Loader2 className="h-5 w-5 animate-spin" />Loading…</div>
      ) : !hero ? (
        <CharacterSelect />
      ) : (
        <>
          <CastleMap onOpen={setOpen} />
          <ShortcutBar open={open} onOpen={setOpen} friendRequests={friendRequests} chestReady={rewardChestReady(hero)} />
          <nav aria-label="Rewards" className="game-panel bottom-nav rewards-nav absolute bottom-3 left-3 z-20 flex gap-1 p-1.5">
            <Button variant="ghost" size="icon" aria-label="Mailbox" title="Mailbox" onClick={() => setOpen("mailbox")}><ArtIcon name="mail" size={24} /></Button>
            <Button variant="ghost" size="icon" aria-label="Lucky Shots" title="Lucky Shots" onClick={() => setOpen("lucky")}><ArtIcon name="lucky" size={24} /></Button>
            <Button variant="ghost" size="icon" aria-label="Battle Scrolls" title="Battle Scrolls" onClick={() => setOpen("scrolls")}><ArtIcon name="scroll" size={24} /></Button>
            <Button variant="ghost" size="icon" aria-label="Bestiary" title="Bestiary" onClick={() => setOpen("bestiary")}><ArtIcon name="spellbook" size={24} /></Button>
            <Button variant="ghost" size="icon" aria-label="Premium Shop" title="Premium Shop" onClick={()=>setOpen('premium')}><ArtIcon name="diamond" size={24} /></Button>
            <Button variant="ghost" size="icon" aria-label="Auction House" title="Auction House" onClick={()=>setOpen('auction')}><ArtIcon name="auction" size={24} /></Button>
          </nav>
          <WorldChat heroId={heroId} />
          <QuestsButton count={claimableLevelQuests(hero)} onClick={() => setOpen("quests")} />
          <Hud muted={sound.muted} setMuted={(m) => changeSound({ muted: m })} cloud={cloud} onProfile={() => setOpen("profile")} onSettings={() => setOpen("settings")} />
          <button onClick={() => setOpen("notes")} title="Version 1.00 patch notes"
            className="game-panel absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded px-2.5 py-1 font-display text-[11px] font-bold text-gold">
            v{VERSION}
          </button>
          <p className="castle-hint pointer-events-none absolute inset-x-0 top-32 z-20 text-center font-display text-xs text-gold drop-shadow-[0_1px_2px_black]">Tap a building to open it · drag the castle to reach the rest</p>
          {open === "profile" && <ProfilePanel onClose={() => setOpen(null)} />}
          {open === "notes" && <UpdateNotes onClose={() => setOpen(null)} />}
          {open === "settings" && <SettingsPanel settings={sound} onChange={changeSound} onClose={() => setOpen(null)} />}
          {open === "quests" && <QuestsPanel onClose={() => setOpen(null)} />}
          {open === "mailbox" && <Mailbox onClose={() => setOpen(null)} />}
          {open === "lucky" && <LuckyShots onClose={() => setOpen(null)} />}
          {open === "daily" && <ActivityBoard onClose={() => setOpen(null)} />}
          {open === "guild" && <GuildHall onClose={() => setOpen(null)} />}
          {open === "scrolls" && <ScrollShop onClose={() => setOpen(null)} />}
          {open === "hall" && <ThroneHall onClose={() => setOpen(null)} />}
          {open === "armory" && <HeroHall onClose={() => setOpen(null)} />}
          {open === "bestiary" && <Bestiary h={hero} onClose={() => setOpen(null)} />}
          {open === "calendar" && <EventCalendar h={hero} onClose={() => setOpen(null)} start={start} />}
          {open === 'premium' && <PremiumShop onClose={()=>setOpen(null)} />}
          {open === 'auction' && <AuctionHousePanel onClose={()=>setOpen(null)} />}
          {open && BUILDINGS.find((b) => b.id === open)?.soon && <ComingSoon id={open} onClose={() => setOpen(null)} />}
          {open === "friends" && (
            <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-background/70 p-4 pt-16" onClick={() => setOpen(null)}>
              <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <FriendsPanel heroId={heroId} />
                <button className="btn-ghost mt-2 w-full py-2" onClick={() => setOpen(null)}>Close</button>
              </div>
            </div>
          )}
          {open === "portal" && <Campaign onClose={() => setOpen(null)} start={start} />}
          {open === "farm" && <FarmPanel onClose={() => setOpen(null)} />}
          {open === "spire" && (canEnterConquest(hero.level) ? <Campaign spire onClose={() => setOpen(null)} start={start} /> : <ComingSoon id="spire" locked onClose={() => setOpen(null)} />)}
          {open === "forge" && <Forge onClose={() => setOpen(null)} onCraft={() => setCrafting(true)} />}
          {crafting && <Crafting onClose={() => setCrafting(false)} />}
          {open === "dungeon" && <Challenges onClose={() => setOpen(null)} start={start} onExpeditions={()=>{setOpen(null);setExpeditions(true);}} onRelics={()=>{setOpen(null);setRelics(true);}} />}
          {expeditions && <Expeditions onClose={()=>setExpeditions(false)} start={o=>{setExpeditions(false);start(o);}} />}
          {relics && <RelicTrials onClose={()=>setRelics(false)} start={o=>{setRelics(false);start(o);}} />}
          {open === "gems" && <GemWorkshop onClose={() => setOpen(null)} />}
          {open === "tower" && <MagicTower onClose={() => setOpen(null)} />}
          {open === "temple" && <Temple onClose={() => setOpen(null)} />}
          {open === "market" && <AuctionHousePanel onClose={() => setOpen(null)} />}
          {open === "arena" && <Arena onClose={() => setOpen(null)} start={start} />}
          {open === "worldmap" && <WorldMap onClose={() => setOpen(null)} start={start} />}
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

/** The patch notes behind the version chip: what version 1.00 changed. */
function UpdateNotes({ onClose }: { onClose: () => void }) {
  return (
    <Panel title={`Emberfall ${VERSION}`} subtitle="Version 1.00 patch notes" art="quest" onClose={onClose}>
      <div className="space-y-3">
        {RELEASE_NOTES.map((sec) => (
          <section key={sec.title}>
            <h3 className="font-display text-sm text-gold">{sec.title}</h3>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
              {sec.lines.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}

/** Keep the castle centred: it may be dragged, never past its own edges. */
function castleClamp(el: HTMLDivElement | null, x: number, y: number) {
  if (!el) return { x: 0, y: 0 };
  const maxX = Math.max(0, (el.offsetWidth - window.innerWidth) / 2);
  const maxY = Math.max(0, (el.offsetHeight - window.innerHeight) / 2);
  return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
}

function CastleMap({ onOpen }: { onOpen: (b: BuildingId) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const map = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<null | { x: number; y: number; ox: number; oy: number; moved: boolean }>(null);
  // A tap must still open a building: only a real drag counts as panning.
  const moved = useRef(false);
  useEffect(() => {
    const onResize = () => setOffset((o) => castleClamp(map.current, o.x, o.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <div
      className="castle-view absolute inset-0 flex items-center justify-center overflow-hidden"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, moved: false };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (!d.moved && Math.abs(dx) + Math.abs(dy) < 10) return;
        d.moved = true;
        moved.current = true;
        setOffset(castleClamp(map.current, d.ox + dx, d.oy + dy));
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <div ref={map} className="castle-map relative" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}>
        <img src={castle.url} alt="Blood moon castle" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold"
            style={{ left: `${(i * 37) % 100}%`, animationDuration: `${6 + (i % 5)}s`, animationDelay: `${i * 0.7}s` }} />
        ))}
        {CASTLE_BUILDINGS.map((b) => (
          <button key={b.id} className={`hotspot${b.id === "farm" ? " hotspot-farm" : ""}`} aria-label={b.name}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.r * 2}%`, aspectRatio: "1" }}
            onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onClick={(e) => { if (e.detail === 0 || !moved.current) onOpen(b.id); }}>
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
  tower: "Collect Astrals, equip them into slots and upgrade them for stat bonuses.",
  gems: "Socket gems into gear, combine fragments and upgrade gems for real stat bonuses.",
  guild: "Create or join guilds, with roles, contribution, guild chat and co-op bosses.",
  friends: "Add friends, see who is online and send private messages.",
  daily: "A 30-day reward board with gold, gems, materials and gold chests.",
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
            <p className="mt-3 text-xs text-muted-foreground">
              This building isn't playable yet — it's coming in a future update.
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}

type ShortcutTarget = BuildingId | "profile" | "mailbox" | "lucky" | "scrolls" | "bestiary" | "calendar" | 'premium' | 'auction' | 'quests' | 'notes' | 'settings';
const SHORTCUTS: { id: ShortcutTarget; label: string; tip: string; icon: ArtIconName }[] = [
  { id: "armory", label: "Inventory", tip: "Bag & equipment", icon: "bag" },
  { id: "forge", label: "Forge", tip: "Enhance & salvage gear", icon: "hammer" },
  { id: "gems", label: "Gem Workshop", tip: "Cut, socket & fuse gems", icon: "gem" },
  { id: "daily", label: "Daily Rewards", tip: "30-day reward board", icon: "gift" },
  { id: "calendar", label: "Events", tip: "World event calendar & reminders", icon: "calendar" },
  { id: "friends", label: "Friends", tip: "Friends & messages", icon: "goblet" },
  { id: "profile", label: "Profile", tip: "Your hero profile", icon: "profile" },
  { id: "oracle", label: "Quest Board", tip: "AI-generated quests", icon: "quest" },
];

function ShortcutBar({ open, onOpen, friendRequests = 0, chestReady = false }: { open: ShortcutTarget | null; onOpen: (t: ShortcutTarget) => void; friendRequests?: number; chestReady?: boolean }) {
  return (
    <nav aria-label="Shortcuts" className="game-panel bottom-nav shortcut-nav pointer-events-auto absolute bottom-3 right-3 z-20 flex gap-1.5 p-1.5">
      {SHORTCUTS.map(({ id, label, tip, icon }) => (
        <button key={id} onClick={() => onOpen(id)} aria-label={label} aria-pressed={open === id}
          className={`slot group relative flex h-11 w-11 items-center justify-center transition hover:scale-110 ${open === id ? "ring-2 ring-gold" : ""}`}>
          <ArtIcon name={icon} size={32} className={open === id ? "ring-1 ring-gold" : ""} />
          {id === "daily" && chestReady && (
            <span aria-label="Reward chest ready" className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-r1 ring-2 ring-background" />
          )}
          {id === "friends" && friendRequests > 0 && (
            <span aria-label={`${friendRequests} pending friend requests`} className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blood px-1.5 py-0.5 text-center text-[10px] font-bold text-foreground">
              {friendRequests > 9 ? "9+" : friendRequests}
            </span>
          )}
          <span role="tooltip" className="hotspot-label pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded px-2 py-1 text-left text-xs group-hover:block group-focus-visible:block">
            {label}<span className="block text-[10px] text-foreground/80">{tip}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

import { Announcements } from "./Announcements";
import { MinigamesPanel } from "./Minigames";
import { ArenaEventPanel } from "./ArenaEvent";
import { InvitePopup } from "./PartyInvite";
import { EventsHub, EventPopup } from "./EventsHub";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MountsPanel, RunesPanel, WheelPanel } from "./Emporium";
import mountIcon from "@/assets/mounts/griffin.webp";
import runeIcon from "@/assets/runes/flame.webp";
import wheelIcon from "@/assets/wheel-of-fortune.webp";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityBoard, LuckyShots, Mailbox } from "./Rewards";
import { LootGrid } from "./LootGrid";
import { ArtIcon, type ArtIconName } from "./ArtIcon";
import { GuildHall } from "./GuildHall";
import { WorldChat } from "./WorldChat";
import { FarmPanel } from "./Farm";
import { GoldMinePanel } from "./GoldMine";
import { announceOpenEvents, announceWorldEvent } from "./world-events";
import { FriendsPanel, useFriendRequestCount } from "./FriendsPanel";
import { ScrollShop } from "./ScrollShop";
import { Bestiary } from "./Bestiary";
import { EventCalendar } from "./EventCalendar";
import { Expeditions } from "./Expeditions";
import { PremiumShop } from "./PremiumShop";
import { AuctionHousePanel } from "./Marketplace";
import { WorldMap } from "./WorldMap";
import { beginScrollBattle, trackActivity } from "./services";
import { battleLockedByBlitz, settleBlitzRun } from "./blitz-run";
import { scrollFighter } from "./scrolls";
import castle from "@/assets/castle.jpg.asset.json";
import gateCampaign from "@/assets/gate-campaign.webp";
import gateDungeon from "@/assets/gate-dungeon.webp";
import gateConquest from "@/assets/gate-conquest.webp";
import spireChest from "@/assets/spire-chest.webp";
import { readAudioSettings, saveAudioSettings, soundtrackUrl, type AudioSettings } from "./audio";
import { SettingsPanel } from "./Settings";
import { BUILDINGS, CASTLE_BUILDINGS, heroStats, type BuildingId, type Item } from "./data";
import { CHESTS, addChests, rewardChestReady, rollBattleChest } from "./chests";
import { vipXpMultiplier } from "./economy";
import { confirmCardPurchase, reconcilePendingPurchases } from "./premium-shop";
import { openVipActivities } from "./vip-activities";
import { authHandoffPending, getState, update, useGame } from "./store";
import { itemName, useLang, useT , tr} from "./i18n";
import { recordBattle } from "./progress";
import { BOSS_CRYSTALS } from "./logic";
import { battleEssenceGain, enlightenmentUnlocked, rollSoulShards } from "./enlightenment";
import {
  DUNGEON_STAMINA,
  POTION_STAMINA,
  addPotions,
  rollStaminaPotion,
  spendStamina,
  staminaBlocker,
} from "./stamina";
import { arenaBlocker, spendArenaFight } from "./arena-limits";
import { addRenown, renownGain } from "./renown";
import { reportGuildBattle } from "./guild-events";
import { addXpScrolls, rollXpScroll } from "./xp-scrolls";
import { CharacterSelect } from "./CharacterSelect";
import { ProfilePanel } from "./ProfilePanel";
import { Battle, type Fighter } from "./Battle";
import { Campaign, Forge, HeroHall, Temple, heroFighter, type StartBattle } from "./panels";
import { Arena } from "./Arena";
import { ThroneHall } from "./ThroneHall";
import { Challenges } from "./Challenges";
import { SpireHub } from "./SpireVentures";
import { AwakeningPanel } from "./Awakening";
import { addShards, canAwaken, fightShards } from "./awakening";
import { GameGuide } from "./GameGuide";
import { playGuideSound, playLevelUpSound, playBattleEndSound } from "./guide-sound";
import { prepareFoe } from "./foe-scaling";
import { RelicTrials } from "./RelicTrials";
import { Crafting, GemWorkshop, MagicTower } from "./Workshop";
import { battleMats, matsLine, addMats } from "./crafting";
import { addStones, rollStoneDrop } from "./enchant";
import { addFateStones, rollFateStone } from "./fate";
import { ItemCard, Panel, useEscapeClose } from "./ui";
import { CONQUEST_LEVEL, canEnterConquest } from "./data";
import { QuestsButton, QuestsPanel } from "./Quests";
import { claimableLevelQuests, rollLevelQuests } from "./level-quests";
import { Hud } from "./HeroHud";
import { VERSION } from "./version";

const useGameOverflow = () => getState().hero?.overflow?.length ?? 0;

/** Buildings whose battle leaves the panel open underneath, so the player lands back in it. */
const BATTLE_PANELS = ["portal", "spire", "dungeon", "worldmap", "guild", "party", "awakening"] as const;

export function Game() {
  const t = useT();
  const { hero, heroId, userId, cloud, authReady } = useGame();
  const friendRequests = useFriendRequestCount(heroId);
  const nav = useNavigate();
  const [open, setOpen] = useState<ShortcutTarget | null>(null);
  const [battle, setBattle] = useState<null | {
    right: Fighter;
    left: Fighter;
    auto?: boolean;
    title: string;
    gate?: boolean;
    dungeon?: boolean;
    onResult: Parameters<StartBattle>[0]["onResult"];
  }>(null);
  const [result, setResult] = useState<null | {
    won: boolean;
    lines: string[];
    loot?: Item | null;
  }>(null);
  const [partyBattleVisible, setPartyBattleVisible] = useState(false);
  const [crafting, setCrafting] = useState(false);
  const [expeditions, setExpeditions] = useState(false);
  const [relics, setRelics] = useState(false);
  // Music settings (volume, soundtrack, mute) live on the device, behind the HUD's settings button.
  const [sound, setSound] = useState<AudioSettings>(() => readAudioSettings());
  const changeSound = (patch: Partial<AudioSettings>) =>
    setSound((s) => saveAudioSettings({ ...s, ...patch }));
  const audio = useRef<HTMLAudioElement>(null);
  const starting = useRef(false);
  // The fight on screen, plus the options that started it so a result can offer a rematch.
  const fightOpen = useRef(false);
  const lastFight = useRef<Parameters<StartBattle>[0] | null>(null);
  const [entryError, setEntryError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");

  // Stripe sends the player back to `/?checkout=success&session_id=…`. The server verifies that
  // session and credits the wallet before the shop shows anything, so a forged URL credits nothing.
  useEffect(() => {
    if (typeof window === "undefined" || !heroId) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const state = params.get("checkout");
    if (!sessionId && !state) return;
    const clean = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };
    void (async () => {
      try {
        if (sessionId) {
          const result = await confirmCardPurchase(sessionId);
          setCheckoutNotice(
            result.already
              ? "That payment was already credited to your account."
              : "Payment confirmed — your purchase is in your account.",
          );
        } else {
          setCheckoutNotice("Checkout cancelled — nothing was charged.");
          await reconcilePendingPurchases();
        }
      } catch (e) {
        setCheckoutNotice(e instanceof Error ? e.message : "The payment could not be confirmed.");
      } finally {
        clean();
      }
    })();
  }, [heroId]);

  // The VIP activities count from the first load of the day, not from when the shop is opened.
  useEffect(() => {
    if (!heroId) return;
    update((h) => {
      openVipActivities(h);
    });
  }, [heroId]);

  // A tab closed before Stripe redirected back is reconciled the next time the shop opens.
  useEffect(() => {
    if (open === "premium" && heroId) void reconcilePendingPurchases();
  }, [open, heroId]);

  useEffect(() => {
    if (!checkoutNotice) return;
    const timer = setTimeout(() => setCheckoutNotice(""), 10_000);
    return () => clearTimeout(timer);
  }, [checkoutNotice]);

  // The quest board opens the first time the hero's castle loads; `rollLevelQuests` is idempotent,
  // so a later level-up re-checks it without resetting any progress.
  useEffect(() => {
    if (!hero) return;
    update((h) => {
      rollLevelQuests(h);
    });
  }, [heroId, hero?.level]);

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
    if (sound.muted) {
      main.pause();
      return;
    }
    const play = () => {
      if (!sound.muted) void main.play().catch(() => {});
    };
    play();
    window.addEventListener("pointerdown", play, { once: true });
    return () => window.removeEventListener("pointerdown", play);
  }, [sound]);

  const keepsPanel = open !== null && (BATTLE_PANELS as readonly string[]).includes(open);

  const start: StartBattle = (o) => {
    if (!hero || starting.current || fightOpen.current) return;
    // A blitz keeps the hero out in the field: nothing fights until the run lands (see blitz-run.ts).
    const blitzLock = battleLockedByBlitz(hero);
    if (blitzLock) {
      setEntryError(blitzLock);
      return;
    }
    // Every priced battle charges its stamina up front, so a loss costs exactly as much as a win:
    // 20 for a Campaign Gate battle, 10 for a Dungeon Gate run (see stamina.ts).
    const staminaCost = o.stamina ?? (o.dungeon ? DUNGEON_STAMINA : 0);
    if (staminaCost > 0) {
      const staminaLock = staminaBlocker(hero, staminaCost);
      if (staminaLock) {
        setEntryError(staminaLock);
        return;
      }
    }
    // The Blood Arena allows five duels every twelve hours; a duel is spent on entry, win or lose
    // (see arena-limits.ts).
    if (o.arena) {
      const arenaLock = arenaBlocker(hero);
      if (arenaLock) {
        setEntryError(arenaLock);
        return;
      }
    }
    if (hero.blitzRun)
      update((h) => {
        settleBlitzRun(h);
      });
    if (staminaCost > 0) update((h) => spendStamina(h, staminaCost));
    if (o.arena) update((h) => spendArenaFight(h));
    // Remembered so the result screen can offer the same fight again — through this same entry
    // point, so its stamina, duel allowance and blitz lock are checked once more.
    lastFight.current = o;
    starting.current = true;
    setEntryError("");
    void (async () => {
      try {
        const active = await beginScrollBattle();
        const current = getState();
        if (!current.hero) return;
        // The Campaign Gate, Conquest Gate, Dungeon Gate and World Tree stay mounted under the
        // battle, so the player comes back to the exact screen they fought from instead of the castle.
        if (!keepsPanel) setOpen(null);
        fightOpen.current = true;
        setBattle({
          ...o,
          right: o.arena ? o.right : prepareFoe(o.right, current.hero, o.scaling),
          gate: !o.arena && ["portal", "spire", "dungeon"].includes(open ?? ""),
          left: scrollFighter(
            {
              ...heroFighter(current.hero, heroStats(current.hero), current.gender),
              gender: current.gender,
            },
            active,
          ),
        });
      } catch (e) {
        fightOpen.current = false;
        setEntryError(e instanceof Error ? e.message : "Battle entry failed.");
      } finally {
        starting.current = false;
      }
    })();
  };
  // A rematch goes back through `start` after the screen has closed, so the freshest closure runs.
  const nextFight = useRef(start);
  nextFight.current = start;

  /** Leave the result screen (and the fight under it). */
  const closeResult = () => {
    fightOpen.current = false;
    setResult(null);
    setBattle(null);
  };

  /** Retry the fight that just ended — the same foe, through the same checks as the first time. */
  const repeatFight = () => {
    const o = lastFight.current;
    closeResult();
    if (o) window.setTimeout(() => nextFight.current(o), 0);
  };

  /** The battle-entry lock: dismissing it clears the scroll marker, exactly like its button. */
  const dismissEntryError = () => {
    const id = getState().heroId;
    if (id) localStorage.removeItem(`ef-scroll-battle:${id}`);
    setEntryError("");
  };

  // Escape closes whatever is on top: an entry lock, the battle's result, or the friends list.
  const dialogOpen = !!entryError || !!result || open === "friends";
  useEscapeClose(() => {
    if (entryError) dismissEntryError();
    else if (result) closeResult();
    else setOpen(null);
  }, dialogOpen);

  // Enter takes the battle's result, so a fight can be closed without the mouse.
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== "Enter" || (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      closeResult();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (after && after.level > levelBefore) playLevelUpSound();
    if (after && after.level > levelBefore)
      void announceWorldEvent(heroId, `reached level ${after.level}!`);
    if (r.loot && r.loot.rarity >= 2)
      void announceWorldEvent(heroId, `looted ${itemName(r.loot.name)}!`);
    if (useGameOverflow() > before && !r.lines.some((l) => /Overflow/.test(l)))
      r.lines.push(t("Bag full — loot placed in your Overflow Chest (Armory)"));
    if (won)
      update((h) => {
        const m = battleMats(h.level + h.paragon, !!battle.right.boss);
        addMats(h, m);
        r.lines.push(...matsLine(m));
      });
    // Won fights pay Renown, the hero's own upgrade currency (see renown.ts).
    if (won) {
      const gained = renownGain({
        boss: !!battle.right.boss,
        dungeon: !!battle.dungeon,
        arena: /arena/i.test(battle.title),
      });
      update((h) => addRenown(h, gained));
      reportGuildBattle();
      r.lines.push(t("+{n} Renown", { n: gained }));
      // Heroes of level 90+ earn Dawnshards from every won fight (see awakening.ts).
      const hz = getState().hero;
      if (hz && canAwaken(hz)) {
        const n = fightShards(!!battle.right.boss);
        update((h) => addShards(h, n));
        r.lines.push(t("+{n} Dawnshards", { n }));
      }
    }
    // A won fight sometimes leaves a chest on the field: gold is the common find, gems the rare one.
    if (won) {
      const drop = rollBattleChest();
      if (drop) {
        update((h) => addChests(h, drop, 1));
        r.lines.push(t("{name} found — open it in the Armory vault", { name: CHESTS[drop].name }));
      }
    }
    update((h) =>
      recordBattle(h, {
        title: battle.title,
        won,
        boss: !!battle.right.boss,
        arena: /arena/i.test(battle.title),
        rewards: [...r.lines, ...(r.loot ? [r.loot.name] : [])],
      }),
    );
    // Daily & weekly challenges and level quests count every won fight.
    if (won) {
      update((h) => { h.slain = (h.slain ?? 0) + 1; });
      trackActivity("kill");
      if (battle.right.boss) trackActivity("boss");
      if (battle.dungeon) trackActivity("dungeon");
      if (/arena/i.test(battle.title)) trackActivity("arena");
    }
    // Boss victories are the second source of Void Crystals beside level-ups (see logic.grant).
    if (won && battle.right.boss) {
      update((h) => {
        h.voidCrystals = (h.voidCrystals ?? 0) + BOSS_CRYSTALS;
      });
      r.lines.push(t("+{n} Void Crystal", { n: BOSS_CRYSTALS }));
    }
    // Battle Essence feeds the Enlightenment track (unlocked at level 20); Soul Shards are a chance drop.
    if (won && enlightenmentUnlocked(getState().hero ?? { level: 0 })) {
      const essence = battleEssenceGain(
        (getState().hero?.level ?? 1) + (getState().hero?.paragon ?? 0),
        !!battle.right.boss,
      );
      update((h) => {
        h.battleEssence = (h.battleEssence ?? 0) + essence;
      });
      r.lines.push(t("+{n} Battle Essence", { n: essence }));
    }
    if (won) {
      const shards = rollSoulShards(!!battle.right.boss);
      if (shards > 0) {
        update((h) => {
          h.soulShards = (h.soulShards ?? 0) + shards;
        });
        r.lines.push(t("+{n} Soul Shards ✦", { n: shards }));
      }
    }
    // Won fights sometimes leave an enchantment stone behind: bosses always, elites often (see enchant.ts).
    if (won) {
      const live = getState().hero;
      const stone = rollStoneDrop((live?.level ?? 1) + (live?.paragon ?? 0), !!battle.right.boss);
      if (stone) {
        update((h) => addStones(h, stone.level, stone.n));
        r.lines.push(t("+{n} Lv {level} Enchantment Stone", { n: stone.n, level: stone.level }));
      }
    }
    // A won fight can very rarely leave a Fate Stone behind for the Forge's refinement (see fate.ts).
    if (won) {
      const fate = rollFateStone(!!battle.right.boss, !!battle.right.elite);
      if (fate > 0) {
        update((h) => addFateStones(h, fate));
        r.lines.push(t("+{n} Fate Stones", { n: fate }));
      }
    }
    // Any won fight can drop an XP Scroll, read later from the bag (see xp-scrolls.ts).
    if (won) {
      const scrolls = rollXpScroll(!!battle.right.boss);
      if (scrolls > 0) {
        update((h) => addXpScrolls(h, scrolls));
        r.lines.push(t("+1 XP Scroll"));
      }
    }
    // A won dungeon run can leave a Stamina Potion behind — rare, but the only source (see stamina.ts).
    if (won && battle.dungeon) {
      const potions = rollStaminaPotion();
      if (potions > 0) {
        update((h) => addPotions(h, potions));
        r.lines.push(t("+{n} Stamina Potion — +{amount} stamina", { n: potions, amount: POTION_STAMINA }));
      }
    }
    playBattleEndSound();
    setResult({ won, ...r });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <audio key={sound.track} ref={audio} src={soundtrackUrl(sound.track)} loop preload="auto" />
      {!authReady || !userId ? (
        <div className="flex h-full items-center justify-center gap-2 font-display text-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
           {tr("Loading…")} </div>
      ) : !hero ? (
        <CharacterSelect />
      ) : (
        <>
          <CastleMap onOpen={setOpen} />
          <ShortcutBar
            open={open}
            onOpen={setOpen}
            friendRequests={friendRequests}
            chestReady={rewardChestReady(hero)}
          />
          <nav
            aria-label={t("Rewards")}
            className="game-panel bottom-nav rewards-nav absolute bottom-3 left-3 z-20 flex gap-1 p-1.5"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Mailbox")}
              title={t("Mailbox")}
              onClick={() => setOpen("mailbox")}
            >
              <ArtIcon name="mail" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Lucky Shots")}
              title={t("Lucky Shots")}
              onClick={() => setOpen("lucky")}
            >
              <ArtIcon name="lucky" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Battle Scrolls")}
              title={t("Battle Scrolls")}
              onClick={() => setOpen("scrolls")}
            >
              <ArtIcon name="scroll" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Bestiary")}
              title={t("Bestiary")}
              onClick={() => setOpen("bestiary")}
            >
              <ArtIcon name="spellbook" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Premium Shop")}
              title={t("Premium Shop")}
              onClick={() => setOpen("premium")}
            >
              <ArtIcon name="diamond" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Auction House")}
              title={t("Auction House")}
              onClick={() => setOpen("auction")}
            >
              <ArtIcon name="auction" size={24} />
            </Button>
          </nav>
          <WorldChat heroId={heroId} />
          <EventPopup onOpen={() => setOpen("events")} />
          <InvitePopup heroId={heroId} blocked={!!battle || partyBattleVisible} onAccept={(kind) => setOpen(kind === "spire" ? "party" : "arenaEvent")} />
          <nav aria-label={tr("Help and quests")} className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
            <Button variant="ghost" aria-label={tr("Game Guide")} title={tr("Game Guide")} className="game-panel h-auto min-h-16 w-20 flex-col gap-1 rounded-md px-2 py-2 font-display text-xs text-gold" onClick={() => setOpen("guide")}><ArtIcon name="spellbook" size={32} />{tr("Guide")}</Button>
            <QuestsButton count={claimableLevelQuests(hero)} onClick={() => { playGuideSound(); setOpen("quests"); }} />
            <Button variant="ghost" aria-label={tr("Announcements")} title={tr("Announcements")} className="game-panel h-auto min-h-16 w-20 flex-col gap-1 whitespace-normal rounded-md px-1 py-2 font-display text-[10px] text-gold" onClick={() => { playGuideSound(); setOpen("notes"); }}><ArtIcon name="notes" size={30} />{tr("Announcements")}</Button>
          </nav>
          <Hud
            muted={sound.muted}
            setMuted={(m) => changeSound({ muted: m })}
            cloud={cloud}
            onProfile={() => setOpen("profile")}
            onSettings={() => setOpen("settings")}
          />
          {checkoutNotice && (
            <p
              role="status"
              className="game-panel absolute inset-x-4 top-3 z-40 mx-auto max-w-xl rounded border border-gold/50 bg-background/95 px-3 py-2 text-center text-sm"
            >
              {checkoutNotice}
            </p>
          )}
          <button
            onClick={() => setOpen("notes")}
            title={tr("Version 1.00 patch notes")}
            className="game-panel absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded px-2.5 py-1 font-display text-[11px] font-bold text-gold"
          >
            v{VERSION}
          </button>
          <p className="castle-hint pointer-events-none absolute inset-x-0 top-32 z-20 text-center font-display text-xs text-gold drop-shadow-[0_1px_2px_black]">
            {t("Tap a building to open it · drag the castle to reach the rest")}
          </p>
          {/* A brand-new hero gets one pointer to the guide; opening (or dismissing) it hides this. */}
          {!hero.guideSeen && !open && !battle && (
            <div className="game-panel absolute inset-x-4 top-3 z-30 mx-auto flex max-w-xl items-center gap-2 rounded border border-gold/50 bg-background/95 px-3 py-2 text-sm">
              <button
                className="flex-1 text-left"
                onClick={() => {
                  update((h) => {
                    h.guideSeen = true;
                  });
                  setOpen("guide");
                }}
              >
                {tr("New here? Open the guide — it walks you through your first hour, step by step.")}
              </button>
              <button
                aria-label={tr("Dismiss")}
                className="btn-ghost px-2 py-1 text-xs"
                onClick={() =>
                  update((h) => {
                    h.guideSeen = true;
                  })
                }
              >
                ✕
              </button>
            </div>
          )}
          {open === "guide" && <GameGuide onClose={() => setOpen(null)} />}
          {open === "profile" && <ProfilePanel onClose={() => setOpen(null)} />}
          {open === "notes" && <Announcements onClose={() => setOpen(null)} />}
          {open === "settings" && (
            <SettingsPanel settings={sound} onChange={changeSound} onClose={() => setOpen(null)} />
          )}
          {open === "quests" && <QuestsPanel onClose={() => setOpen(null)} />}
          {open === "events" && <EventsHub onClose={() => setOpen(null)} onOpen={(id) => setOpen(id)} />}
          {open === "minigames" && <MinigamesPanel onClose={() => setOpen(null)} />}
          {open === "arenaEvent" && <ArenaEventPanel onClose={() => setOpen(null)} />}
          {open === "mailbox" && <Mailbox onClose={() => setOpen(null)} />}
          {open === "lucky" && <LuckyShots onClose={() => setOpen(null)} />}
          {open === "daily" && <ActivityBoard onClose={() => setOpen(null)} />}
          {open === "guild" && <GuildHall onClose={() => setOpen(null)} start={start} />}
          {open === "scrolls" && <ScrollShop onClose={() => setOpen(null)} />}
          {open === "hall" && <ThroneHall onClose={() => setOpen(null)} />}
          {open === "armory" && <HeroHall onClose={() => setOpen(null)} />}
          {open === "mounts" && <MountsPanel onClose={() => setOpen(null)} />}
          {open === "runes" && <RunesPanel onClose={() => setOpen(null)} />}
          {open === "wheel" && <WheelPanel onClose={() => setOpen(null)} />}
          {open === "bestiary" && <Bestiary h={hero} onClose={() => setOpen(null)} />}
          {open === "calendar" && (
            <EventCalendar h={hero} onClose={() => setOpen(null)} start={start} />
          )}
          {open === "premium" && <PremiumShop onClose={() => setOpen(null)} />}
          {open === "auction" && <AuctionHousePanel onClose={() => setOpen(null)} />}
          {open && BUILDINGS.find((b) => b.id === open)?.soon && (
            <ComingSoon id={open} onClose={() => setOpen(null)} />
          )}
          {open === "friends" && (
            <div
              className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-background/70 p-4 pt-16"
              onClick={() => setOpen(null)}
            >
              <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <FriendsPanel heroId={heroId} />
                <button className="btn-ghost mt-2 w-full py-2" onClick={() => setOpen(null)}>
                  {t("Close")}
                </button>
              </div>
            </div>
          )}
          {!battle && !partyBattleVisible && (open === "portal" || open === "dungeon" || open === "spire" || open === "party") && (
            <GateSwitcher current={open} onPick={(g) => setOpen(g)} level={hero.level} />
          )}
          {open === "portal" && <Campaign onClose={() => setOpen(null)} start={start} />}
          {open === "farm" && <FarmPanel onClose={() => setOpen(null)} />}
          {open === "mine" && <GoldMinePanel onClose={() => setOpen(null)} />}
          {open === "spire" &&
            (canEnterConquest(hero.level) ? (
              <Campaign spire onClose={() => setOpen(null)} start={start} />
            ) : (
              <ComingSoon id="spire" locked onClose={() => setOpen(null)} />
            ))}
          {open === "party" && <SpireHub onClose={() => setOpen(null)} start={start} onBattleVisible={setPartyBattleVisible} />}
          {open === "forge" && (
            <Forge onClose={() => setOpen(null)} onCraft={() => setCrafting(true)} />
          )}
          {crafting && <Crafting onClose={() => setCrafting(false)} />}
          {open === "dungeon" && (
            <Challenges
              onClose={() => setOpen(null)}
              start={start}
              onExpeditions={() => {
                setOpen(null);
                setExpeditions(true);
              }}
              onRelics={() => {
                setOpen(null);
                setRelics(true);
              }}
            />
          )}
          {expeditions && (
            <Expeditions
              onClose={() => setExpeditions(false)}
              start={(o) => {
                setExpeditions(false);
                start(o);
              }}
            />
          )}
          {relics && (
            <RelicTrials
              onClose={() => setRelics(false)}
              start={(o) => {
                setRelics(false);
                start(o);
              }}
            />
          )}
          {open === "gems" && <GemWorkshop onClose={() => setOpen(null)} />}
          {open === "awakening" && <AwakeningPanel onClose={() => setOpen(null)} start={start} />}
          {open === "tower" && <MagicTower onClose={() => setOpen(null)} />}
          {open === "temple" && <Temple onClose={() => setOpen(null)} />}
          {open === "market" && <AuctionHousePanel onClose={() => setOpen(null)} />}
          {open === "arena" && <Arena onClose={() => setOpen(null)} start={start} />}
          {open === "worldmap" && <WorldMap onClose={() => setOpen(null)} start={start} />}
        </>
      )}
      {battle && (
        <Battle
          key={battle.title + battle.right.name}
          left={battle.left}
          right={battle.right}
          auto={battle.auto}
          title={battle.title}
          gate={battle.gate}
          onEnd={onEnd}
        />
      )}
      {entryError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="game-panel max-w-md p-5">
            <p role="alert">{entryError}</p>
            <Button className="mt-4" onClick={dismissEntryError}>
               {tr("Acknowledge and close")} </Button>
          </div>
        </div>
      )}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="game-panel anim-pop w-full max-w-sm p-6 text-center">
            <h2
              className={`font-display text-5xl font-black ${result.won ? "panel-title" : "text-blood"}`}
            >
              {result.won ? tr("VICTORY") : tr("DEFEAT")}
            </h2>
            <LootGrid lines={result.lines} />
            {result.loot && <ItemCard item={result.loot} />}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button className="btn-gold flex-1 py-2.5 text-lg" onClick={closeResult}>
                 {tr("Continue")} </button>
              {lastFight.current && (
                <button className="btn-ghost flex-1 py-2.5 text-lg" onClick={repeatFight}>
                  {tr("Fight again")}
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{tr("Enter continues · Esc closes")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Keep the castle centred: it may be dragged, never past its own edges. */
function castleClamp(el: HTMLDivElement | null, x: number, y: number) {
  if (!el) return { x: 0, y: 0 };
  const maxX = Math.max(0, (el.offsetWidth - window.innerWidth) / 2);
  const maxY = Math.max(0, (el.offsetHeight - window.innerHeight) / 2);
  return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
}

/** The castle with its building hotspots; exported so the label layout can be checked. */
export function CastleMap({ onOpen }: { onOpen: (b: BuildingId) => void }) {
  const t = useT();
  const lang = useLang();
  const [hover, setHover] = useState<string | null>(null);
  const map = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<null | { x: number; y: number; ox: number; oy: number; moved: boolean }>(
    null,
  );
  // A tap must still open a building: only a real drag counts as panning.
  const moved = useRef(false);

  // Each building's name is drawn on the building itself. Names differ in length from
  // language to language and the castle is a different size on every screen, so the
  // labels are measured and stacked clear of one another before they are painted.
  const labelNodes = useRef(new Map<string, HTMLSpanElement>());
  const [labelShift, setLabelShift] = useState<Record<string, number>>({});
  const laidOut = useRef("");

  const layoutLabels = useCallback(() => {
    const el = map.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (!W || !H) return;
    const taken: { left: number; right: number; top: number; bottom: number }[] = [];
    const next: Record<string, number> = {};
    // Big buildings (the ones with the widest hotspots) claim their spot first.
    const order = [...CASTLE_BUILDINGS].sort((a, b) => b.r - a.r);
    for (const b of order) {
      const node = labelNodes.current.get(b.id);
      const w = node?.offsetWidth ?? 0;
      const h = node?.offsetHeight ?? 0;
      if (!w || !h) continue;
      const cx = (b.x / 100) * W;
      const cy = (b.y / 100) * H;
      const top0 = Math.max(2, Math.min(H - h - 2, cy - h / 2));
      let chosen: number | null = null;
      // Try the building first, then its own height up and down, alternating sides.
      for (let step = 0; step < 25 && chosen === null; step += 1) {
        const dy = (step % 2 === 1 ? 1 : -1) * Math.ceil(step / 2) * (h + 2);
        const top = Math.max(2, Math.min(H - h - 2, top0 + dy));
        const left = Math.max(2, Math.min(W - w - 2, cx - w / 2));
        const box = { left, top, right: left + w, bottom: top + h };
        const clashes = taken.some(
          (p) =>
            p.left < box.right && box.left < p.right && p.top < box.bottom && box.top < p.bottom,
        );
        if (!clashes) {
          taken.push(box);
          chosen = top;
        }
      }
      next[b.id] = chosen === null ? 0 : Math.round(chosen - top0);
    }
    const key = JSON.stringify(next);
    if (key === laidOut.current) return;
    laidOut.current = key;
    setLabelShift(next);
  }, []);

  useEffect(() => {
    const onResize = () => setOffset((o) => castleClamp(map.current, o.x, o.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    layoutLabels();
    const el = map.current;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => layoutLabels());
    }
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => layoutLabels());
    observer.observe(el);
    return () => observer.disconnect();
  }, [layoutLabels]);

  // A new language (or an opened hover card) changes the size of the labels.
  useLayoutEffect(() => {
    layoutLabels();
  }, [layoutLabels, lang, hover]);

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
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div
        ref={map}
        className="castle-map relative"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        <img
          src={castle.url}
          alt={tr("Blood moon castle")}
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDuration: `${6 + (i % 5)}s`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {CASTLE_BUILDINGS.map((b) => (
          <button
            key={b.id}
            className={`hotspot${b.id === "farm" ? " hotspot-farm" : ""}`}
            aria-label={t(b.name)}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.r * 2}%`, aspectRatio: "1" }}
            onMouseEnter={() => setHover(b.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(b.id)}
            onBlur={() => setHover(null)}
            onClick={(e) => {
              if (e.detail === 0 || !moved.current) onOpen(b.id);
            }}
          />
        ))}
        {/* Each name sits on its own building; `labelShift` keeps neighbours from colliding. */}
        {CASTLE_BUILDINGS.map((b) => (
          <span
            key={`label-${b.id}`}
            ref={(node) => {
              if (node) labelNodes.current.set(b.id, node);
              else labelNodes.current.delete(b.id);
            }}
            className={`hotspot-label pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-center text-xs md:text-sm ${b.soon ? "opacity-60" : ""} ${hover === b.id ? "scale-110" : "opacity-90"}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, marginTop: `${labelShift[b.id] ?? 0}px` }}
          >
            <span className="block whitespace-nowrap">
              {t(b.name)}
              {b.soon ? t(" · soon") : ""}
            </span>
            {hover === b.id && (
              <span className="mt-0.5 block max-w-44 whitespace-normal text-[10px] leading-tight text-foreground/80">
                {t(b.desc)}
              </span>
            )}
          </span>
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

function ComingSoon({
  id,
  locked,
  onClose,
}: {
  id: string;
  locked?: boolean;
  onClose: () => void;
}) {
  const b = BUILDINGS.find((x) => x.id === id);
  return (
    <Panel title={b?.name ?? "Building"} onClose={onClose}>
      <div className="py-10 text-center">
        {locked ? (
          <>
            <p className="mb-2 font-display text-2xl text-gold">{tr("Locked")}</p>
            <p className="text-muted-foreground">
               {tr("Endless Conquest opens at character level")} {CONQUEST_LEVEL}{tr(". Keep clearing the Campaign Gate to level up.")} </p>
          </>
        ) : (
          <>
            <p className="mb-2 font-display text-2xl text-gold">{tr("Under construction")}</p>
            <p className="mx-auto max-w-md text-muted-foreground">{SOON_TEXT[id]}</p>
            <p className="mt-3 text-xs text-muted-foreground">
               {tr("This building isn't playable yet — it's coming in a future update.")} </p>
          </>
        )}
      </div>
    </Panel>
  );
}

type ShortcutTarget =
  | BuildingId
  | "party"
  | "mounts"
  | "runes"
  | "wheel"
  | "profile"
  | "mailbox"
  | "lucky"
  | "scrolls"
  | "bestiary"
  | "calendar"
  | "premium"
  | "auction"
  | "quests"
  | "notes"
  | "guide"
  | "settings"
  | "minigames"
  | "events"
  | "arenaEvent";
const SHORTCUTS: { id: ShortcutTarget; label: string; tip: string; icon: ArtIconName; img?: string }[] = [
  { id: "armory", label: "Inventory", tip: "Bag & equipment", icon: "bag" },
  { id: "mounts", label: "Mounts", tip: "Stables — faster blitzes", icon: "crown", img: mountIcon },
  { id: "runes", label: "Runes", tip: "Rune Altar", icon: "gem", img: runeIcon },
  { id: "wheel", label: "Wheel of Fortune", tip: "100 Diamonds per spin", icon: "diamond", img: wheelIcon },
  { id: "forge", label: "Forge", tip: "Enhance & salvage gear", icon: "hammer" },
  { id: "gems", label: "Gem Workshop", tip: "Cut, socket & fuse gems", icon: "gem" },
  { id: "daily", label: "Daily Rewards", tip: "30-day reward board", icon: "gift" },
  { id: "events", label: "Events", tip: "Every event in one place", icon: "calendar" },
  { id: "friends", label: "Friends", tip: "Friends & messages", icon: "friends" },
  { id: "profile", label: "Profile", tip: "Your hero profile", icon: "profile" },
];

function ShortcutBar({
  open,
  onOpen,
  friendRequests = 0,
  chestReady = false,
}: {
  open: ShortcutTarget | null;
  onOpen: (t: ShortcutTarget) => void;
  friendRequests?: number;
  chestReady?: boolean;
}) {
  const t = useT();
  return (
    <nav
      aria-label={t("Shortcuts")}
      className="game-panel bottom-nav shortcut-nav pointer-events-auto absolute bottom-3 right-3 z-20 flex gap-1.5 p-1.5"
    >
      {SHORTCUTS.map(({ id, label, tip, icon, img }) => (
        <button
          key={id}
          onClick={() => onOpen(id)}
          aria-label={t(label)}
          aria-pressed={open === id}
          className={`slot group relative flex h-11 w-11 items-center justify-center transition hover:scale-110 ${open === id ? "ring-2 ring-gold" : ""}`}
        >
          {img ? <img src={img} alt="" className="h-8 w-8 object-contain" /> : <ArtIcon name={icon} size={32} className={open === id ? "ring-1 ring-gold" : ""} />}
          {id === "daily" && chestReady && (
            <span
              aria-label={t("Reward chest ready")}
              className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-r1 ring-2 ring-background"
            />
          )}
          {id === "friends" && friendRequests > 0 && (
            <span
              aria-label={t("{count} pending friend requests", { count: friendRequests })}
              className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blood px-1.5 py-0.5 text-center text-[10px] font-bold text-foreground"
            >
              {friendRequests > 9 ? "9+" : friendRequests}
            </span>
          )}
          <span
            role="tooltip"
            className="hotspot-label pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded px-2 py-1 text-left text-xs group-hover:block group-focus-visible:block"
          >
            {t(label)}
            <span className="block text-[10px] text-foreground/80">{t(tip)}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

/** The War Gates: one building, four gates. A painted tab strip floats above whichever gate is open. */
function GateSwitcher({ current, onPick, level }: { current: string; onPick: (g: "portal" | "dungeon" | "spire" | "party") => void; level: number }) {
  const gates = [
    { id: "portal" as const, name: "Campaign Gate", note: "Story stages", art: gateCampaign },
    { id: "dungeon" as const, name: "Dungeon Gate", note: "Bosses & elites", art: gateDungeon },
    { id: "spire" as const, name: "Conquest Gate", note: canEnterConquest(level) ? "Endless floors" : "Lv 10+", art: gateConquest },
    { id: "party" as const, name: "Spire", note: "Parties, wardens, rifts", art: spireChest },
  ];
  return (
    <div className="gate-switcher" role="tablist" aria-label={tr("War Gates")}>
      {gates.map((g) => (
        <button
          key={g.id}
          role="tab"
          aria-selected={current === g.id}
          className={`gate-tab ${current === g.id ? "gate-tab-on" : ""}`}
          onClick={() => onPick(g.id)}
        >
          <img src={g.art} alt="" width={256} height={256} />
          <span>
            <b>{tr(g.name)}</b>
            <small>{tr(g.note)}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

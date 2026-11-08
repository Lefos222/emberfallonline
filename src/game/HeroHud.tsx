import { useState } from "react";
import { Cloud, CloudOff, IdCard, LogOut, Settings, Trophy, Users, Volume2, VolumeX, Gift } from "lucide-react";
import { AvatarIcon } from "./AvatarIcon";
import { Portrait } from "./CharacterSelect";
import { frameClass } from "./profile-frames";
import { heroAppearance } from "./appearance";
import { CLASSES, heroStats, type Hero } from "./data";
import { premiumState } from "./economy";
import { XpBar } from "./panels";
import {
  CAMPAIGN_STAMINA,
  DUNGEON_STAMINA,
  POTION_PER_DAY,
  POTION_STAMINA,
  STAMINA_PER_DAY,
  potionCount,
  potionUsesLeft,
  staminaLeft,
} from "./stamina";
import {
  POTIONS,
  POTION_IDS,
  potionBlocker,
  potionBuffLeft,
  potionHeld,
  takePotion,
  type PotionId,
} from "./potions";
import { Diamonds, Gold, VoidCrystals, fmt } from "./ui";
import { leaveCharacter, update, useGame } from "./store";
import { supabase } from "@/integrations/supabase/client";
import { dailyChestReady, dailyChestCountdown, formatDailyChestCountdown, claimDailyChest, DAILY_CHEST_MAX_LEVEL } from "./daily-chest";

/**
 * The top-left player card: portrait, name, class, XP, currencies, power and stamina.
 */
export function Hud({
  muted,
  setMuted,
  cloud,
  onProfile,
  onSettings,
}: {
  muted: boolean;
  setMuted: (m: boolean) => void;
  cloud: string;
  onProfile: () => void;
  onSettings: () => void;
}) {
  const { hero, gender, chars, heroId } = useGame();
  const me = chars?.find((c) => c.id === heroId);
  const frame = me?.frame ?? "iron";
  if (!hero) return null;
  const s = heroStats(hero);
  return (
    <div className="hud-top pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2">
      <div className="player-card pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <button
            className={`player-portrait ${frameClass(frame)}`}
            onClick={onProfile}
            aria-label={`Profile — level ${hero.level}${hero.paragon > 0 ? `, ascension ${hero.paragon}` : ""}`}
            title="Open your profile"
          >
            {hero.avatar !== undefined ? (
              <AvatarIcon index={hero.avatar} fill className="block h-full w-full" />
            ) : (
              <Portrait cls={hero.cls} gender={gender} className="w-full" {...heroAppearance(hero, gender)} />
            )}
            <span className="player-level">Lv {hero.level}</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="player-name" title={hero.name}>{hero.name}</span>
              {hero.paragon > 0 && (
                <span className="shrink-0 rounded bg-gold/20 px-1 text-[10px] font-bold text-gold">
                  Asc {hero.paragon}
                </span>
              )}
            </div>
            <div className="mb-1 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {CLASSES[hero.cls].name}
              {me?.title ? ` · ${me.title}` : ""}
            </div>
            <XpBar hero={hero} />
          </div>
        </div>
        <div className="player-divider" />
        <div className="player-currencies" role="group" aria-label="Currencies and power">
          <Gold n={hero.gold} />
          <Diamonds n={premiumState(hero).balance} />
          <VoidCrystals n={hero.voidCrystals ?? 0} />
          <span className="font-bold" title="Power">
            <Trophy className="text-r4" />
            {fmt(s.power)}
          </span>
        </div>
        <StaminaBar hero={hero} />
      </div>
      {hero.level < DAILY_CHEST_MAX_LEVEL && (
        <DailyChestButton hero={hero} />
      )}
      <div className="game-panel pointer-events-auto flex items-center gap-1 p-2 lg:gap-2">
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={() => setMuted(!muted)}
          aria-label="Music"
          title={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-gold" />}
        </button>
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={onSettings}
          aria-label="Game settings"
          title="Game settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <span
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          title={`Cloud: ${cloud}`}
        >
          {cloud === "error" ? (
            <CloudOff className="h-5 w-5 text-hp" />
          ) : (
            <Cloud
              className={`h-5 w-5 ${cloud === "saved" ? "text-r1" : "text-muted-foreground"}`}
            />
          )}
        </span>
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={onProfile}
          aria-label="Profile"
        >
          <IdCard className="h-5 w-5" />
        </button>
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={() => void leaveCharacter()}
          aria-label="Switch character"
          title="Switch character"
        >
          <Users className="h-5 w-5" />
        </button>
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={async () => {
            if (await leaveCharacter()) await supabase.auth.signOut();
          }}
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** Daily stamina and the potion pouch, under the player plate in the top-left HUD. */
export function StaminaBar({ hero }: { hero: Hero }) {
  const [shelf, setShelf] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; t: string } | null>(null);
  const left = staminaLeft(hero);
  const potions = potionCount(hero);
  const drinksLeft = potionUsesLeft(hero);
  const running = POTION_IDS.filter((id) => POTIONS[id].buff && potionBuffLeft(hero, id) > 0);
  const use = (id: PotionId) =>
    update((h) => {
      const err = takePotion(h, id);
      setNotice(err ? { ok: false, t: err } : { ok: true, t: id === "stamina" ? `+${POTION_STAMINA} stamina` : `${POTIONS[id].name} is burning` });
    });
  return (
    <div
      className="hud-stamina-bar"
      title={`Stamina ${left}/${STAMINA_PER_DAY} — ${CAMPAIGN_STAMINA} per Campaign Gate battle, ${DUNGEON_STAMINA} per dungeon run, refills at Greek midnight`}
    >
      <div className="mb-0.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="font-display">Stamina</span>
        <span className={left < CAMPAIGN_STAMINA ? "font-bold text-hp" : "font-bold text-foreground"}>
          {left}/{STAMINA_PER_DAY}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="bar-track h-2 flex-1">
          <div
            className="bar-stamina h-full"
            style={{ width: `${Math.min(100, (left / STAMINA_PER_DAY) * 100)}%` }}
          />
        </div>
        <button
          className="flex shrink-0 items-center gap-0.5 rounded bg-black/40 px-1 py-0.5 text-[10px] font-bold"
          onClick={() => { setShelf(true); setNotice(null); }}
          aria-label={`Potion pouch (${potions} stamina potions)`}
          title={`Potion pouch — ${potions} Stamina Potion${potions === 1 ? "" : "s"}, ${drinksLeft}/${POTION_PER_DAY} drinks left today`}
        >
          <img src={POTIONS.stamina.art} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
          <span>{potions}</span>
        </button>
      </div>
      {running.length > 0 && (
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-bold text-r1">
          {running.map((id) => (
            <span key={id} className="flex items-center gap-1" title={POTIONS[id].name}>
              <img src={POTIONS[id].art} alt="" aria-hidden="true" className="h-3 w-3 object-contain" />{POTIONS[id].name} · {potionBuffLeft(hero, id)}m
            </span>
          ))}
        </div>
      )}
      {shelf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-modal="true"
          aria-label="Potion pouch" onClick={() => setShelf(false)}>
          <div className="game-panel anim-pop w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-display text-lg text-gold">Potion pouch</div>
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => setShelf(false)}>Close</button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Stamina {left}/{STAMINA_PER_DAY} · {drinksLeft}/{POTION_PER_DAY} Stamina Potions left today. Restocks at Greek midnight.
            </p>
            {notice && <p role="status" className={`mb-2 text-sm ${notice.ok ? "text-r1" : "text-hp"}`}>{notice.t}</p>}
            <div className="space-y-2">
              {POTION_IDS.map((id) => {
                const def = POTIONS[id];
                const held = potionHeld(hero, id);
                const blocked = potionBlocker(hero, id);
                const running = potionBuffLeft(hero, id);
                return (
                  <div key={id} className="slot flex items-center gap-3 p-2">
                    <img src={def.art} alt="" aria-hidden="true" className="h-11 w-11 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{def.name} <span className="text-muted-foreground">×{held}</span></div>
                      <div className="text-[11px] text-muted-foreground">{def.desc}</div>
                      {running > 0 && <div className="text-[11px] font-bold text-r1">Active · {running} min left</div>}
                    </div>
                    <button className="btn-gold shrink-0 px-3 py-1 text-xs" disabled={!!blocked} title={blocked ?? "Use"}
                      onClick={() => use(id)}>Use</button>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Buy more at the Auction House's shop, or find Stamina Potions as a rare dungeon drop.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Daily bonus chest icon next to the player card: free prize every 30 min until level 30. */
function DailyChestButton({ hero }: { hero: Hero }) {
  const [msg, setMsg] = useState<string | null>(null);
  const ready = dailyChestReady(hero);
  const countdown = dailyChestCountdown(hero);

  const claim = () => {
    update((h) => {
      const result = claimDailyChest(h);
      setMsg(result);
    });
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-0.5">
      <button
        className={`slot relative flex h-10 w-10 items-center justify-center transition hover:scale-110 ${ready ? "ring-2 ring-gold" : ""}`}
        onClick={ready ? claim : undefined}
        disabled={!ready}
        aria-label={ready ? "Claim daily chest" : `Daily chest in ${formatDailyChestCountdown(countdown)}`}
        title={ready ? "Free daily chest — click to claim!" : `Next chest in ${formatDailyChestCountdown(countdown)}`}
      >
        <Gift className={`h-5 w-5 ${ready ? "text-gold animate-pulse" : "text-muted-foreground"}`} />
        {ready && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-r1 ring-2 ring-background" />
        )}
      </button>
      {!ready && (
        <span className="text-[8px] text-muted-foreground">{formatDailyChestCountdown(countdown)}</span>
      )}
      {msg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setMsg(null)}>
          <div className="game-panel anim-pop w-full max-w-xs p-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 font-display text-lg text-gold">Daily Chest</div>
            <p className="text-sm text-r1">{msg}</p>
            <button className="btn-gold mt-3 w-full py-2 text-sm" onClick={() => setMsg(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

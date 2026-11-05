import { Cloud, CloudOff, IdCard, LogOut, Trophy, Users, Volume2, VolumeX } from "lucide-react";
import { AvatarIcon } from "./AvatarIcon";
import { Portrait, frameClass } from "./CharacterSelect";
import { heroAppearance } from "./appearance";
import { CLASSES, heroStats, type Hero } from "./data";
import { premiumState } from "./economy";
import { XpBar } from "./panels";
import { STAMINA_PER_DAY, staminaLeft } from "./stamina";
import { Diamonds, Gold, VoidCrystals, fmt } from "./ui";
import { leaveCharacter, useGame } from "./store";
import { supabase } from "@/integrations/supabase/client";
import frameArt from "@/assets/character-frame.webp";

/**
 * The top-left player plate. The painted character-card border carries the portrait on
 * its left, the name banner, the four currency slots and the wide footer, so the HUD
 * content is pinned to those slots instead of being drawn as a separate panel.
 */
export function Hud({
  muted,
  setMuted,
  cloud,
  onProfile,
}: {
  muted: boolean;
  setMuted: (m: boolean) => void;
  cloud: string;
  onProfile: () => void;
}) {
  const { hero, gender, chars, heroId } = useGame();
  const me = chars?.find((c) => c.id === heroId);
  const frame = me?.frame ?? "iron";
  if (!hero) return null;
  const s = heroStats(hero);
  return (
    <div className="hud-top pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2">
      <div className="pointer-events-auto">
        <div className="hud-card">
          <img src={frameArt} alt="" aria-hidden className="hud-card-art" draggable={false} />
          <button
            className="hud-portrait"
            onClick={onProfile}
            aria-label="Profile"
            title="Open your profile"
          >
            {hero.avatar !== undefined ? (
              <AvatarIcon index={hero.avatar} fill className="block h-full w-full" />
            ) : (
              <Portrait
                cls={hero.cls}
                gender={gender}
                className="w-full"
                {...heroAppearance(hero)}
              />
            )}
            <span
              className={`hud-portrait-ring pointer-events-none ${frameClass(frame)}`}
              aria-hidden
            />
            <span className="hud-level">Lv {hero.level}</span>
          </button>
          <div className="hud-name">
            <span className="hud-name-text">{hero.name}</span>
            {hero.paragon > 0 && <span className="hud-asc">Asc {hero.paragon}</span>}
          </div>
          <div className="hud-stats" role="group" aria-label="Currencies and power">
            <Gold n={hero.gold} />
            <Diamonds n={premiumState(hero).balance} />
            <VoidCrystals n={hero.voidCrystals ?? 0} />
            <span className="inline-flex items-center gap-0.5 font-bold" title="Power">
              <Trophy className="text-r4" />
              {fmt(s.power)}
            </span>
          </div>
          <div className="hud-foot">
            <span className="hud-class">
              {CLASSES[hero.cls].name}
              {me?.title ? ` · ${me.title}` : ""}
            </span>
            <XpBar hero={hero} />
          </div>
        </div>
        <div className="hud-stamina">
          <StaminaBar hero={hero} />
        </div>
      </div>
      <div className="game-panel pointer-events-auto flex items-center gap-1 p-2 lg:gap-2">
        <button
          className="slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
          onClick={() => setMuted(!muted)}
          aria-label="Music"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-gold" />}
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

/** Campaign Gate stamina, under the player plate in the top-left HUD. */
export function StaminaBar({ hero }: { hero: Hero }) {
  const left = staminaLeft(hero);
  return (
    <div
      className="hud-stamina-bar"
      title={`Campaign stamina ${left}/${STAMINA_PER_DAY} — it refills at Greek midnight`}
    >
      <div className="mb-0.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="font-display">Stamina</span>
        <span className={left < 10 ? "font-bold text-hp" : "font-bold text-foreground"}>
          {left}/{STAMINA_PER_DAY}
        </span>
      </div>
      <div className="bar-track h-2">
        <div
          className="bar-stamina h-full"
          style={{ width: `${Math.min(100, (left / STAMINA_PER_DAY) * 100)}%` }}
        />
      </div>
    </div>
  );
}

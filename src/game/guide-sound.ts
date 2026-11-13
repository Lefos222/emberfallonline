import pagesSound from "@/assets/fliping_pages_in_guide.mp3.asset.json";
import levelUpSound from "@/assets/levelup.mp3.asset.json";
import winLoseSound from "@/assets/winlose.mp3.asset.json";

const cache = new Map<string, HTMLAudioElement>();

function play(url: string, volume = 0.5) {
  if (typeof Audio === "undefined") return;
  let audio = cache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.volume = volume;
    cache.set(url, audio);
  }
  try {
    audio.currentTime = 0;
    const started = audio.play() as Promise<void> | undefined;
    started?.catch(() => {});
  } catch {
    /* A media element that cannot play never breaks the game. */
  }
}

/** Page-flip sound when the guide opens or a guide tab changes. */
export const playGuideSound = () => play(pagesSound.url);
/** Played when a hero gains a level. */
export const playLevelUpSound = () => play(levelUpSound.url, 0.6);
/** Played when a battle ends, won or lost. */
export const playBattleEndSound = () => play(winLoseSound.url, 0.5);

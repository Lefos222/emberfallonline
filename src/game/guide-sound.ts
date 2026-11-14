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

/** A short rising chime when a quest is completed and claimed (synthesised, no file needed). */
export function playQuestCompleteSound() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.55);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    /* Sound never breaks the game. */
  }
}

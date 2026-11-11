import bookOpenSound from "@/assets/book-open.mp3";

let audio: HTMLAudioElement | null = null;

/**
 * Plays the book-opening sound when the guide opens or a guide tab changes.
 * The Audio element is lazily created and reused so the sound stays responsive.
 */
export function playGuideSound() {
  if (!audio) {
    audio = new Audio(bookOpenSound);
    audio.volume = 0.5;
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    /* Autoplay can be blocked until the user has interacted with the page */
  });
}

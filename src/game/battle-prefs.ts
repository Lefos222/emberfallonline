/**
 * Battle presentation preferences, remembered on the device like the music settings.
 *
 * Only the fight's pacing lives here: the fast-forward switch is pure presentation, so keeping it
 * on for the next fight saves the player a toggle every time. Auto-battle is deliberately NOT
 * remembered — a gate chooses it per fight (see `autoThisFight` in panels.tsx), because a switch
 * left on must never send the hero into a later fight on its own.
 */

const FAST_KEY = "emberfall.fight.fast";

/** Whether fights start in fast-forward. */
export function readFastFights(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(FAST_KEY) === "1";
  } catch {
    return false;
  }
}

/** Remember the pacing for the next fight. */
export function saveFastFights(fast: boolean) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(FAST_KEY, fast ? "1" : "0");
  } catch {
    /* Private mode: the choice simply lasts for this visit. */
  }
}

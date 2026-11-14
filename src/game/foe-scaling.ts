import type { Foe } from "./data";

/**
 * Monsters do not scale.
 *
 * Every fight keeps the numbers it was built with: the stage-1 wolf stays the stage-1 wolf, and
 * nothing about the hero — level, attributes or gear — makes a monster tougher. The ladder itself
 * is the difficulty: deeper stages, higher floors, harder dungeons and the endless ladders ask for
 * more, so a player grows strong enough by climbing, training and gearing up.
 *
 * `prepareFoe` is still the single door every monster fight goes through (the `start` in Game.tsx
 * and the gate previews that show it), so a preview is always exactly the foe that will be fought.
 * It only tags the foe with its own numbers, so a previewed foe can never be prepared twice into
 * something different.
 */
type Prepared<T> = T & { baseFoe?: { hp: number; atk: number; def: number; level: number } };

export function prepareFoe<T extends Foe>(foe: T): T {
  const base = (foe as Prepared<T>).baseFoe ?? {
    hp: foe.hp,
    atk: foe.atk,
    def: foe.def,
    level: foe.level,
  };
  return { ...foe, ...base, baseFoe: base } as T;
}

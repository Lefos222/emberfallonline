/** Battle presentation preferences, remembered on this device (never affects results). */
export type BattleSpeed = "slow" | "normal" | "fast";
export const BATTLE_SPEEDS: { id: BattleSpeed; label: string; note: string; ms: number }[] = [
  { id: "slow", label: "Slow", note: "Every blow lands with weight", ms: 750 },
  { id: "normal", label: "Normal", note: "A steady, readable duel", ms: 450 },
  { id: "fast", label: "Fast", note: "For seasoned fighters", ms: 180 },
];
const KEY = "bm-battle-speed";

export function getBattleSpeed(): BattleSpeed {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(KEY);
  return v === "slow" || v === "fast" || v === "normal" ? v : "normal";
}
export function setBattleSpeed(v: BattleSpeed) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, v);
}
export const battleStepMs = (v: BattleSpeed = getBattleSpeed()) =>
  BATTLE_SPEEDS.find((s) => s.id === v)?.ms ?? 450;

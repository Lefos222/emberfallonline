/**
 * One authoritative table pairing every battle skill with the move the fighter performs and the
 * impact artwork that lands. Anything missing here falls back to the actor's class move, so a new
 * skill still animates — but src/test/skill-anim.test.ts fails if a skill ships without an entry.
 */
export type Move =
  | "swing" | "overhead" | "spin" | "leap" | "slam" | "rage"
  | "cast" | "thrust" | "nova" | "rise" | "channel" | "siphon"
  | "draw" | "rapid" | "aim" | "dash" | "drink";

export const SKILL_MOVE: Record<string, Move> = {
  // Knight — steel and shield
  strike: "swing",
  cleave: "overhead",
  rage: "rage",
  slam: "slam",
  whirl: "spin",
  execute: "leap",
  // Mage — somatic casting
  bolt: "cast",
  nova: "nova",
  meteor: "rise",
  inferno: "channel",
  spike: "thrust",
  drain: "siphon",
  // Archer — bow work
  shot: "draw",
  volley: "rapid",
  snipe: "aim",
  pierce: "draw",
  rain: "rapid",
  shadow: "dash",
  // Consumables
  potion: "drink",
  guard: "slam", taunt: "thrust", counter: "overhead", mark: "aim", evade: "dash",
  firestorm: "channel", barrier: "nova", restore: "siphon",
  aegis: "slam", cyclone: "spin", sovereign: "leap", solar: "rise", winter: "nova",
  "astral-siphon": "siphon", horizon: "aim", tempest: "rapid", eclipse: "dash",
};

/** Impact art that lands on the target. Heal/block events keep their own kind; this covers strikes. */
export const SKILL_EFFECT: Record<string, string> = {
  strike: "slash", cleave: "slash", rage: "fire", slam: "shield", whirl: "slash", execute: "slash",
  bolt: "arcane", nova: "ice", meteor: "meteor", inferno: "fire", spike: "ice", drain: "tether",
  shot: "arrow", volley: "arrow", snipe: "mark", pierce: "arrow", rain: "arrow", shadow: "slash",
  potion: "heal",
  guard: "shield", taunt: "slash", counter: "shield", mark: "mark", evade: "arcane",
  firestorm: "fire", barrier: "arcane", restore: "heal",
  aegis: "shield", cyclone: "slash", sovereign: "mark", solar: "meteor", winter: "ice",
  "astral-siphon": "tether", horizon: "mark", tempest: "arrow", eclipse: "tether",
};

/** The move an actor performs. Unknown skills fall back to that class's signature move. */
export function moveFor(actor: { cls?: string | null; name?: string | null }, skillId?: string | null): Move {
  const known = skillId ? SKILL_MOVE[skillId] : undefined;
  if (known) return known;
  if (actor.cls === "mage") return "cast";
  if (actor.cls === "archer") return "draw";
  if (actor.cls === "warrior") return "swing";
  const n = (actor.name ?? "").toLowerCase();
  if (/dragon|wyrm|demon|fiend|brute|golem|titan/.test(n)) return "slam";
  if (/skeleton|bone|wraith|spirit|ghost|lich|undead/.test(n)) return "thrust";
  if (/goblin|imp|rat|hound|wolf|bat/.test(n)) return "dash";
  if (/shaman|witch|seer|priest|cultist|warlock/.test(n)) return "cast";
  if (/hunter|sniper|marksman|ranger/.test(n)) return "draw";
  if (/guard|captain|lord|king|queen|knight|champion|warden/.test(n)) return "overhead";
  return "swing";
}

/** Impact artwork for a strike. Returns null when the caller should use the event's own kind. */
export function effectFor(skillId?: string | null): string | null {
  return skillId ? SKILL_EFFECT[skillId] ?? null : null;
}

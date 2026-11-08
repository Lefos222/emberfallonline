/** Portrait frames: a small cosmetic ladder unlocked by level. Shared by the profile and the HUD. */
export const FRAMES = [
  { id: "iron", name: "Iron", minLevel: 1 },
  { id: "bronze", name: "Bronze", minLevel: 10 },
  { id: "silver", name: "Silver", minLevel: 25 },
  { id: "gold", name: "Gold", minLevel: 50 },
  { id: "ember", name: "Ember", minLevel: 80 },
];

export const frameClass = (f: string) =>
  ({ iron: "rarity-0", bronze: "rarity-1", silver: "rarity-2", gold: "rarity-4", ember: "rarity-5" }[f] ?? "rarity-0");

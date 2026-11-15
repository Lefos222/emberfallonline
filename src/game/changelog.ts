// Hand-written player-facing changelog pinned above the Git-generated announcement archive.
export const CHANGELOG: { date: string; title: string; sections: { name: string; lines: string[] }[] }[] = [{
  date: "2026-11-15",
  title: "The Awakening Update",
  sections: [
    { name: "Awakening (level 90+)", lines: [
      "New Awakening building left of the Throne Hall: the endgame after level 90.",
      "Five Awakening stages (levels 90-130), each adding 3% to all main stats.",
      "Soul Lattice: eight long upgrade ladders paid in the new Dawnshard currency.",
      "Aspects: three forms per class with 10 mastery ranks each.",
      "Sigils: four new gear slots (Crown, Heart, Wings, Seal) and three sets: Dawnbreaker, Eclipse and Tempest.",
      "Echo Trials: five daily fights against the Awakened Echo.",
      "Endless Abyss: a campaign with no last floor and a guardian every 10th floor.",
      "Awakening levels and the Constellation: endless points to grow Battle Rating.",
      "Awakened Raiment: a new painted outfit for every class and gender, forged in six tiers.",
    ] },
    { name: "New materials", lines: [
      "Aether Ember, Voidsteel Ingot, Celestial Pearl and Eclipsed Heart. Bosses can drop Pearls and Hearts.",
    ] },
    { name: "Speed-ups (Diamonds)", lines: [
      "XP Surge, Stamina Refill, Dawnshard Cache and Echo Reset. Everything can also be earned by playing.",
    ] },
    { name: "Balance", lines: [
      "Slower climb from level 30; the road to 90 is about twice as long.",
      "Dungeon drops reduced; Gold Mine income cut by 40%.",
      "Fate Stones cost half as much and refine without a cap through the new Fate counter.",
    ] },
    { name: "Spire, World Tree and more", lines: [
      "Spire Solo Ventures: Warden Hunts and the daily Rift Path.",
      "Server-wide Battle Rating leaderboard in the Arena.",
      "World Tree daily Tree Chest after all three bounties.",
      "Farm: Sow all and Harvest & replant buttons.",
      "Daily and weekly challenges now show progress; the Quests under the Guide count won fights.",
      "New sounds for level-up, battle end, quests and the Guide.",
      "New painted battle backdrops, Spire wardens and strike effects.",
    ] },
    { name: "Fixes", lines: [
      "The cheat check no longer bans for earning lots of gold.",
      "Conquest Gate token market crash fixed.",
      "Hero XP from campaign wins fixed.",
    ] },
  ],
}];

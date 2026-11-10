import { locText } from "./i18n";
import type { Hero } from "./data";

/**
 * The game guide: what a new hero should do first, how every system works and what to do each day.
 *
 * It is written as data so the panel stays a plain reader and the text lives in one place. Every
 * field is localised through `locText`, which turns it into a getter over the dictionary, exactly
 * like the world's own content (see content-i18n.ts).
 */

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideChapter {
  id: string;
  /** Short name for the chapter strip. */
  tab: string;
  title: string;
  blurb: string;
  steps: GuideStep[];
  /** The one line worth remembering from this chapter. */
  tip?: string;
}

const step = (title: string, body: string): GuideStep => ({ title, body });

const chapters: GuideChapter[] = [
  {
    id: "start",
    tab: "First steps",
    title: "Your first ten minutes",
    blurb: "Everything you need to be fighting, levelling and equipped in a quarter of an hour.",
    steps: [
      step(
        "Pick your hero",
        "Warrior (sword and shield, energy), Mage (spells, mana) or Archer (arrows, focus). Each class has its own skills and its own resource bar. You can create more heroes later, so pick what looks fun.",
      ),
      step(
        "Open the War Gates",
        "Tap the War Gates building in the castle, then the Campaign Gate tab. Stage 1 is an easy fight: press FIGHT, then pick a skill when it is your turn. A win pays XP, gold, a chance at gear, and Renown.",
      ),
      step(
        "Clear stage after stage",
        "Every stage is a little harder and enemy level follows yours, so you never outgrow the story. Every tenth stage is a boss with better loot. Keep pushing stages — they unlock the rest of the castle's content.",
      ),
      step(
        "Spend what you just earned",
        "A level pays attribute points and a talent point. Put attributes into the stat your class uses. Talents unlock new abilities — take a damage ability first, it is the biggest power jump early on.",
      ),
      step(
        "Wear anything better",
        "Open the Armory, tap a bag item and press Equip. Anything you no longer need can be salvaged at the Forge for gold and materials. An empty slot is a free stat upgrade.",
      ),
    ],
    tip: "Battles cost stamina, not gold: 20 for the Campaign Gate and 10 for the Dungeon Gate, win or lose. Stamina refills every day.",
  },
  {
    id: "fight",
    tab: "Battles",
    title: "How a battle works",
    blurb: "Turns, skills, potions and the two buttons that make fights shorter.",
    steps: [
      step(
        "Turns follow speed",
        "The strip at the top of the fight shows who acts next. When it is your turn, pick a skill and then tap a target. Some skills hit one enemy, some hit all of them, and some help you instead.",
      ),
      step(
        "Skills cost your resource",
        "Every skill has a cooldown in turns, and most also cost energy, mana or focus. The basic attack is always free and refills your bar, so it is never wasted.",
      ),
      step(
        "Two potions per fight",
        "The potion button heals you and you carry two into every battle. They are free — use them instead of losing.",
      ),
      step(
        "AUTO and the fast-forward",
        "AUTO hands the fight to the hero: it picks the strongest ready skill each turn. The fast-forward arrow makes the same fight play out quicker. Both can be switched off at any time, and pressing A and F on a keyboard does the same.",
      ),
      step(
        "Losing costs the same as winning",
        "Entry is charged up front, so a loss is never double-priced. You keep what you already own, and the XP from a defeat still helps.",
      ),
    ],
    tip: "Number keys 1-4 cast your skills during a battle and P drinks a potion.",
  },
  {
    id: "gear",
    tab: "Gear",
    title: "Gear, the Forge and gems",
    blurb: "Where your power really comes from after the first few levels.",
    steps: [
      step(
        "Rarity first, level second",
        "Gear drops in rarities from common to mythic; the colour of the slot tells you which. A higher rarity with the right class bonus usually beats a higher item level.",
      ),
      step(
        "Enhance at the Forge",
        "The Forge raises a piece up to +30 with gold and materials. Enhancing keeps working at every level, so it is never wasted on a piece you use often.",
      ),
      step(
        "Gems and astrals",
        "The Gem Workshop cuts gems that are socketed into gear for flat stats; Astrals are slotted on your hero for percentage bonuses. Both stack with everything else.",
      ),
      step(
        "Sets and special armours",
        "Synthesis sets are forged piece by piece and pay a set bonus when worn together. Epic Armours are tagged set pieces whose materials each drop from one specific place — the guide in the Forge lists every recipe.",
      ),
    ],
    tip: "Salvage spare gear at the Forge instead of selling it: the materials come back and feed your next craft.",
  },
  {
    id: "gates",
    tab: "War Gates",
    title: "The four gates",
    blurb: "The War Gates building holds every fight in the game. Each gate pays differently.",
    steps: [
      step(
        "Campaign Gate — levels",
        "The only gate that pays real XP. Endless stages, a boss every tenth, and a blitz that replays cleared stages for gold while you are away.",
      ),
      step(
        "Dungeon Gate — materials",
        "Boss challenges, elite hunts, expeditions and relic trials. A run costs 10 stamina. These are the only sources of the rare crafting materials and of the class relic pieces.",
      ),
      step(
        "Conquest Gate — tokens",
        "Endless floors past level 10 that pay Conquest Tokens instead of XP. Tokens buy chests, materials and any gem in the gate's own shop. Deeper floors pay more, and a Conquest Key doubles a whole day of payouts.",
      ),
      step(
        "Spire Gate — parties",
        "Five dungeons of 20, 40, 60, 120 and 240 floors. It is the only place where up to four heroes fight one battle together, and the only gate that hands out Spire Chests.",
      ),
    ],
    tip: "Conquest blitzes and the Campaign blitz share the same three-a-day allowance — spend it where you need the reward.",
  },
  {
    id: "spire",
    tab: "Spire Gate",
    title: "Party climbs in the Spire Gate",
    blurb: "One battle, up to four heroes, a chest for every floor.",
    steps: [
      step(
        "Pick a dungeon",
        "Cinder Crypt (20 floors, from level 1) is the friendly one. Ember Reach (40) opens at 8, Frostwind Vault (60) at 18, Obsidian Deep (120) at 30 and the great Endless Spire (240) at 45. Short dungeons pack the same difficulty into fewer floors, so each one ends in a real fight.",
      ),
      step(
        "Bring your friends",
        "Copy the party code and send it to a friend; they type it in and their hero joins your climb. The party's leader starts the fight and everyone else sees the same battle live.",
      ),
      step(
        "Fight without stopping",
        "A climb is one continuous fight: clear a floor and the next set of enemies walks in after a moment. Fallen heroes stand back up at a quarter health between floors, so a party can go far.",
      ),
      step(
        "A chest for every floor",
        "Every cleared floor is one Spire Chest, for every hero in the party. Chests wait in the gate until you open them, and what they pay grows with the deepest floor you have ever reached.",
      ),
      step(
        "Three climbs a day",
        "Each hero spends one of three daily runs on entry. A climb can be left at any time — the chests you already won are yours.",
      ),
    ],
    tip: "Everyone in the party spends their own run and wins their own chest, so a strong friend can pull you up floors you could not clear alone.",
  },
  {
    id: "castle",
    tab: "Castle",
    title: "The castle earns while you fight",
    blurb: "Income and free rewards that cost you nothing but a tap each day.",
    steps: [
      step(
        "Gold Mine",
        "The mine banks gold every hour into a cart that holds a full day, even while you are offline. Upgrade it when you can afford it — it is the steadiest gold in the game.",
      ),
      step(
        "Farm",
        "Plant seeds, come back later and harvest gold, Farm XP and produce. Harvests also feed Hearth feasts, which are timed combat buffs for the whole party.",
      ),
      step(
        "Daily Rewards and the daily chest",
        "The reward board pays a gift every day and even more for a streak; the small chest in the corner refills through the day. Both are free — never leave them unclaimed.",
      ),
      step(
        "Auction House and the Wheel",
        "Sell what you do not need and buy what you do need. The Wheel of Fortune and the VIP Black Market are the Diamond side of the castle; the Premium Shop explains the rest.",
      ),
    ],
    tip: "The Mailbox collects rewards that arrive while you are away — check it after every session.",
  },
  {
    id: "guild",
    tab: "Guild",
    title: "Join a guild",
    blurb: "Everything in the Guild Hall is shared, and none of it costs you progress.",
    steps: [
      step(
        "Join or found one",
        "The Guild Hall lists open guilds and takes applications. A guild gives you a bank, buffs, bosses, quests and wars you cannot get alone.",
      ),
      step(
        "Bank and buffs",
        "Donate gold to fill the guild bank and earn contribution. Leaders and officers light guild buffs from that bank; they last 24 hours and help every member.",
      ),
      step(
        "Bosses, quests, the tournament",
        "The guild boss wakes through the day and everyone chips away at it; weekly quests and the weekly tournament pay for teamwork. All of the rewards are minted by the server.",
      ),
      step(
        "Wars and the vault",
        "Guild wars are declared in brackets from 5v5 to 100v100 and every roster hero gets two attacks. The guild vault is a shared store of gear, gems and materials with three pages.",
      ),
    ],
    tip: "Contribution is what buys guild shop goods — donating spare gold is never wasted.",
  },
  {
    id: "grow",
    tab: "Get stronger",
    title: "Every way to grow",
    blurb: "Past level 20 the hero grows along many tracks at once. Here is what each one is for.",
    steps: [
      step(
        "Talents and the Barracks",
        "Talents unlock and improve abilities; the Barracks drills raise your percentage stats and your attributes over time. Both are permanent and always worth doing.",
      ),
      step(
        "Renown and Enlightenment",
        "Winning any fight banks Renown, which buys six permanent stat ladders. Battle Essence from won fights feeds Enlightenment, and Soul Shards buy infusions — the two late-game tracks.",
      ),
      step(
        "Mounts and runes",
        "Mounts shorten blitzes and add stats; runes are carved with crystals and join the same percentage pipeline as everything else. Both live in the castle.",
      ),
      step(
        "Titles, relics and the Bestiary",
        "Titles are earned from milestones and grant real buffs when worn. Relic trials recover class relic pieces, and the Bestiary keeps your kill counters.",
      ),
    ],
    tip: "Nothing in this list replaces gear: the fastest way to get stronger is still a better weapon and a higher enhancement.",
  },
  {
    id: "daily",
    tab: "Each day",
    title: "Your daily routine",
    blurb: "Ten minutes a day keeps every counter running. Do these in order.",
    steps: [
      step(
        "1. Collect",
        "Claim the daily chest, the reward board, the mine cart and your farm harvest before anything else — they are free.",
      ),
      step(
        "2. Spend stamina",
        "You have 200 stamina a day: 20 per Campaign battle, 10 per dungeon. Spend it where you need progress — stages for levels, dungeons for materials.",
      ),
      step(
        "3. Use your allowances",
        "Three Conquest blitzes, three Spire climbs, three castle raids and your arena duels all reset daily or half-daily. They are the cheapest rewards in the game.",
      ),
      step(
        "4. Help the guild",
        "Hit the guild boss, hand in the weekly quests and keep your two war attacks for a bracket you can win.",
      ),
      step(
        "5. Tidy up",
        "Salvage junk gear, sell what is worth gold, spend your attribute and talent points, and check the Auction House for an upgrade.",
      ),
    ],
    tip: "Everything daily resets at midnight in Greece (UTC+2), not at your own midnight.",
  },
  {
    id: "tips",
    tab: "Tips",
    title: "Things new players miss",
    blurb: "Small habits that make the first month much smoother.",
    steps: [
      step(
        "Read the danger pill",
        "Before a fight the gate shows Easy, Fair, Hard or Deadly, comparing your power to the enemy's. Deadly fights are a stamina donation — come back stronger.",
      ),
      step(
        "Check the Conquest Key",
        "One key doubles every Conquest Gate payout for the rest of the day. Buy it before you spend your blitzes, not after.",
      ),
      step(
        "Bag full? Nothing is lost",
        "Loot that does not fit goes to the Overflow Chest in the Armory instead of disappearing.",
      ),
      step(
        "Play in your language",
        "Settings has the language picker — English, Greek or Polish — and the whole game follows, including gear names and enemy names.",
      ),
      step(
        "Use the guide's checklist",
        "This window's first card tracks the first eight things a new hero should do. Finish them and you will be ready for everything else in here.",
      ),
    ],
  },
];

/** The chapter list, with every text field reading in the player's language. */
export const GUIDE_CHAPTERS: GuideChapter[] = chapters.map((c) => {
  c.steps.forEach((s) => locText(s, ["title", "body"]));
  return locText(c, ["tab", "title", "blurb", "tip"]);
});

export const guideChapter = (id: string): GuideChapter =>
  GUIDE_CHAPTERS.find((c) => c.id === id) ?? GUIDE_CHAPTERS[0];

/** The first things a new hero should do; the guide ticks them off from the hero's own save. */
export interface GuideGoal {
  id: string;
  label: string;
  done: (h: Hero) => boolean;
}

export const GUIDE_GOALS: GuideGoal[] = [
  { id: "battle", label: "Win your first battle", done: (h) => h.wins > 0 },
  { id: "level", label: "Reach level 5", done: (h) => h.level >= 5 },
  { id: "stage", label: "Clear Campaign stage 3", done: (h) => h.stage > 3 },
  { id: "forge", label: "Forge something at the Forge", done: (h) => (h.crafts ?? 0) > 0 },
  { id: "dungeon", label: "Clear a Dungeon Gate run", done: (h) => Object.keys(h.dungeons ?? {}).length > 0 },
  { id: "farm", label: "Plant a crop on the farm", done: (h) => (h.farm?.slots ?? []).some(Boolean) },
  { id: "talent", label: "Spend your first talent point", done: (h) => Object.keys(h.talents ?? {}).length > 0 },
  { id: "spire", label: "Clear a floor in the Spire Gate", done: (h) => Object.keys(h.spireFloors ?? {}).length > 0 },
];

export const goalsDone = (h: Hero | null | undefined): number =>
  h ? GUIDE_GOALS.filter((g) => g.done(h)).length : 0;

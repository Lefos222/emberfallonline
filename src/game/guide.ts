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
      step(
        "Collect your idle income",
        "Visit the Gold Mine and the Farm in your castle. Both accumulate rewards while you are battling or logged off.",
      ),
    ],
    tip: "Battles cost stamina, not gold: 20 for the Campaign Gate and 10 for the Dungeon Gate, win or lose. Stamina refills every day.",
  },
  {
    id: "classes",
    tab: "Classes & Stats",
    title: "Mastering classes and attributes",
    blurb: "How the three hero archetypes, resource pools, and primary attributes function.",
    steps: [
      step(
        "Warrior: Iron and Energy",
        "Warriors excel at soaking damage and close-quarters cleaves. They use Energy, which starts depleted and generates through basic attacks and receiving hits, fueling devastating strikes like Whirlwind and Shield Slam.",
      ),
      step(
        "Mage: Arcane and Mana",
        "Mages channel Mana pools to unleash destructive elemental bursts and crowd control. Spells consume mana upfront, demanding tactical timing between high-cost nukes and basic mana-restoring cantrips.",
      ),
      step(
        "Archer: Precision and Focus",
        "Archers rely on Focus to execute piercing critical shots and arrow volleys. With naturally high dodge and crit rates, they whittle down high-threat targets before enemies can close the distance.",
      ),
      step(
        "Primary Attributes",
        "Strength boosts physical attack and health for Warriors; Agility drives attack, critical chance, and dodge for Archers; Intelligence powers spell damage and mana capacity for Mages; Vitality grants maximum HP and armor across all classes.",
      ),
      step(
        "Secondary Combat Stats",
        "Critical Rate (% chance to critically strike), Critical Damage (% bonus damage on crit), Accuracy (counters enemy dodge), and Damage Reduction (mitigates incoming physical and magical hits).",
      ),
    ],
    tip: "Attribute points can be reallocated if you wish to experiment with full-damage or defensive survival builds.",
  },
  {
    id: "fight",
    tab: "Battles",
    title: "How a battle works",
    blurb: "Turns, skills, potions and the two buttons that make fights shorter.",
    steps: [
      step(
        "Turns follow speed",
        "The strip at the top of the fight shows who acts next. When it is your turn, pick a skill and then tap a target. Some skills hit one enemy, some hit all of them, and some help you instead. High-speed heroes can even act twice before slower behemoths.",
      ),
      step(
        "Skills cost your resource",
        "Every skill has a cooldown in turns, and most also cost energy, mana or focus. The basic attack is always free and refills your bar, so it is never wasted.",
      ),
      step(
        "Status conditions and crowd control",
        "Watch for status icons: Burn deals fire damage over turns; Freeze skips enemy turns; Bleed damages on action; Stun incapacitates; and Shields absorb incoming damage before touching your HP.",
      ),
      step(
        "Two potions per fight",
        "The potion button heals you and you carry two into every battle. They are free and refill every match — use them instead of losing.",
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
    tip: "Number keys 1-4 cast your skills during a battle, P drinks a potion, A toggles AUTO, and F toggles fast-forward.",
  },
  {
    id: "gear",
    tab: "Gear",
    title: "Equipment, rarities and slots",
    blurb: "How item tiers, equipment slots, and stat rolls define your hero's power.",
    steps: [
      step(
        "Six rarity tiers",
        "Gear drops in six color-coded rarities: Common (Grey), Uncommon (Green), Rare (Blue), Epic (Purple), Legendary (Orange), and Mythic (Red). Higher rarities roll more bonus affix lines.",
      ),
      step(
        "Eight equipment slots",
        "Equip Main Hand, Off-Hand, Helm, Chest, Gloves, Boots, Ring, and Amulet. Weapons give the highest raw attack, while Chest and Helm supply the largest defensive pools.",
      ),
      step(
        "Rarity first, level second",
        "A higher rarity with the right class bonus usually beats a higher item level with unfocused stats. Always prioritize pieces carrying your hero's main attribute.",
      ),
      step(
        "Armory and Bag management",
        "Open the Armory to equip items, compare stat changes, and lock prized equipment so you never salvage them by accident.",
      ),
      step(
        "Overflow Chest protection",
        "When your bag is completely full, new loot is never destroyed. It drops directly into the Armory Overflow Chest, waiting until you clear inventory space.",
      ),
    ],
    tip: "Salvage spare gear at the Forge instead of selling it: the materials come back and feed your next craft.",
  },
  {
    id: "forge",
    tab: "Forge & Craft",
    title: "Enhancing, gems, synthesis and runes",
    blurb: "The workshop systems that transform standard drops into endgame armaments.",
    steps: [
      step(
        "Enhance at the Forge (+1 to +30)",
        "The Forge raises a piece up to +30 with gold and materials. Enhancing keeps working at every level, so it is never wasted on a piece you use often.",
      ),
      step(
        "Gem Workshop & Socketing",
        "The Gem Workshop cuts gems socketed into gear for flat stats: Rubies grant Attack, Sapphires boost Mana and Defense, Emeralds grant Health, and Topazes raise Speed and Crit.",
      ),
      step(
        "Astrals for percentage power",
        "Astrals are celestial spheres slotted directly onto your hero for massive percentage bonuses. Both gems and astrals stack with everything else.",
      ),
      step(
        "Synthesis sets",
        "Synthesis sets are forged piece by piece and pay powerful 2-piece and 4-piece set bonuses when worn together.",
      ),
      step(
        "Epic Armours and Boss Drops",
        "Epic Armours are tagged set pieces whose materials each drop from specific Dungeon Gate bosses (Wyrm Bones, Phoenix Ash, Dragon Scales, and Titan Hearts).",
      ),
      step(
        "Runic Inscriptions",
        "Carve ancient runic stones using crystals collected from deep runs. Runes apply global stat multipliers to your entire combat profile.",
      ),
    ],
    tip: "Salvage all unwanted gear at the Forge instead of selling to generic vendors — crafting dust and ores are indispensable.",
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
        "Endless floors past level 10 that pay Conquest Tokens instead of XP. Tokens buy chests, materials and any gem in the gate's own shop. Deeper floors pay more.",
      ),
      step(
        "Conquest Keys",
        "A Conquest Key doubles an entire day of Conquest Gate token payouts and shop currency. Always activate one before doing heavy runs!",
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
        "Gold Mine accumulation",
        "The mine banks gold every hour into a cart that holds a full day, even while you are offline. Upgrade it when you can afford it — it is the steadiest gold in the game.",
      ),
      step(
        "Upgrading the Mine",
        "Invest surplus gold into the Gold Mine to increase both gold generation rate per hour and the total cart storage capacity.",
      ),
      step(
        "Castle facilities",
        "The castle complex houses the Barracks, the Workshop, the Vault, the Hearth, the War Gates, and the central World Tree.",
      ),
      step(
        "Daily Rewards and the daily chest",
        "The reward board pays a gift every day and even more for a streak; the small chest in the corner refills through the day. Both are free — never leave them unclaimed.",
      ),
      step(
        "Mailbox collections",
        "The Mailbox collects rewards that arrive while you are away, including tournament payouts, auction proceeds, and system gifts.",
      ),
    ],
    tip: "Empty the mine cart at least once every 24 hours so it never sits capped at maximum capacity.",
  },
  {
    id: "farm",
    tab: "Farmstead",
    title: "Farming, harvesting and Hearth feasts",
    blurb: "Cultivate 16 fertile plots, raise exotic crops, and prepare combat-enhancing feasts.",
    steps: [
      step(
        "The 16-slot farm",
        "Your farmstead features a 4x4 grid of fertile soil. Purchase seeds from the farm shop, plant them into open plots, and water them to start growth.",
      ),
      step(
        "Six Seed Families",
        "Grow Sun seeds (Gold affinity), Moon seeds (XP affinity), Star seeds (Essence), Frost seeds (Crafting materials), Blood seeds (Vitality), and Ember seeds (Combat power).",
      ),
      step(
        "Growth cycles and stages",
        "Crops progress visually through seed, sprout, and bloom stages. Fast crops mature in minutes; legendary crops take hours but yield massive bounties.",
      ),
      step(
        "Farm XP and soil upgrades",
        "Harvesting crops earns Farm XP, raising your farm rank. Higher farm ranks unlock richer seed varieties, faster growth modifiers, and higher yield chances.",
      ),
      step(
        "Hearth Feasts",
        "Take harvested produce to the Castle Hearth to cook legendary feasts. Consuming a feast grants long-duration party combat buffs such as bonus attack or maximum health.",
      ),
    ],
    tip: "Plant quick-growing seeds while you are actively playing and exploring, and plant long-growth crops right before you log off for the night.",
  },
  {
    id: "economy",
    tab: "Economy & Trade",
    title: "Currencies, Auction House and markets",
    blurb: "Trading with other players, shopping at vendors, and managing the realm's currencies.",
    steps: [
      step(
        "Currencies of Emberfall",
        "Gold (upgrades, crafting, forging); Diamonds (premium shop, special rolls, auction buyout); Conquest Tokens (gem shop); and Guild Contribution (guild store).",
      ),
      step(
        "The Auction House",
        "Buy and sell equipment, crafting reagents, and rare blueprints with other real players. List unwanted high-rarity loot for gold or diamonds.",
      ),
      step(
        "Marketplace and Emporium",
        "Daily rotating vendors offering discounted materials, stamina potions, and rare upgrade scrolls.",
      ),
      step(
        "Wheel of Fortune",
        "Each spin costs 100 Diamonds. The wheel has sixteen slices, but only the six gold ones are big prizes — together they hit about 5% of spins. See the Diamonds & Luck chapter for the full odds.",
      ),
      step(
        "VIP Black Market",
        "VIP members can buy slightly better gear and crystals for gold. Stock rolls every six hours, quantities swing every roll, and 1 roll in 20 is Lucky Stock with an Epic piece and a Sun Crystal.",
      ),
    ],
    tip: "Browse the Auction House regularly — players who outlevel mid-tier legendary gear often sell it at bargain prices.",
  },
  {
    id: "grow",
    tab: "Get stronger",
    title: "Every way to grow",
    blurb: "Past level 20 the hero grows along many tracks at once. Here is what each one is for.",
    steps: [
      step(
        "Talents and the Barracks",
        "Talents unlock and improve abilities; the Barracks drills raise your percentage stats and your attributes over real time. Both are permanent and always worth doing.",
      ),
      step(
        "Renown and Enlightenment",
        "Winning any fight banks Renown, which buys six permanent stat ladders. Battle Essence from won fights feeds Enlightenment, and Soul Shards buy infusions — the two late-game tracks.",
      ),
      step(
        "Mounts and runes",
        "Mounts shorten blitzes, speed up world travel, and add stats; runes are carved with crystals and join the same percentage pipeline as everything else.",
      ),
      step(
        "Titles, relics and the Bestiary",
        "Titles are earned from milestones and grant real buffs when worn. Relic trials recover class relic pieces, and the Bestiary keeps your kill counters.",
      ),
    ],
    tip: "Barracks drills work in real time even while you are logged out — keep training drills queued around the clock.",
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
        "Donate gold to fill the guild bank and earn contribution. Leaders and officers light guild buffs from that bank; they last 24 hours and help every member with Attack, Defense, XP, and Gold.",
      ),
      step(
        "Bosses, quests, the tournament",
        "The guild boss wakes through the day and everyone chips away at it; weekly quests and the weekly tournament pay for teamwork. All of the rewards are minted by the server.",
      ),
      step(
        "Guild Tower",
        "Ascend the Guild Tower floor by floor together. Every milestone floor conquered permanently enhances baseline attributes for all guild members.",
      ),
      step(
        "Wars and the vault",
        "Guild wars are declared in brackets from 5v5 to 100v100 and every roster hero gets two attacks. The guild vault is a shared store of gear, gems and materials with three pages.",
      ),
      step(
        "Guild Shop",
        "Spend earned Contribution tokens on exclusive XP scrolls, high-tier crafting recipes, and rare gems in the guild shop.",
      ),
    ],
    tip: "Always use both of your Guild War attacks — even a partial defeat or chip damage awards valuable war points and contribution.",
  },
  {
    id: "world",
    tab: "World Map",
    title: "The World Map and player castles",
    blurb: "Journey through the World Tree gateway into a shared living realm.",
    steps: [
      step(
        "The World Tree Gateway",
        "Tap the majestic World Tree at the center of your castle to open the expansive global world map.",
      ),
      step(
        "Regions and gathering grounds",
        "Explore distinct wilderness zones, monster territories, and rich gathering grounds (Ember, Verdant, Sunken, Astral).",
      ),
      step(
        "Real player castles",
        "Every active player's castle stands on the global map. Select any player castle to inspect their Lord's level, equipment, and character model.",
      ),
      step(
        "Relocating your castle",
        "You are granted 3 castle relocations per UTC day. Move your castle between 24 distinct strategic castle plots to be near resources or allies.",
      ),
      step(
        "World events and roaming bosses",
        "Keep watch for roaming world bosses and temporal rifts appearing across global territories for limited-time server encounters.",
      ),
    ],
    tip: "Relocate your castle close to your guildmates to coordinate map control and rally for world events.",
  },
  {
    id: "arena",
    tab: "Arena & PvP",
    title: "Glory in the Arena",
    blurb: "Test your build against other heroes, climb rankings, and earn Honor.",
    steps: [
      step(
        "Asynchronous PvP Duels",
        "Challenge rival player heroes in the Arena. Battles simulate asynchronous combat against their registered equipment and skill loadouts.",
      ),
      step(
        "Ladder ranks and leagues",
        "Win duels to earn ladder rating. Advance from Bronze and Silver up to Diamond and Master leagues for higher daily rewards.",
      ),
      step(
        "Honor Tokens and Arena Shop",
        "Every duel awards Honor Tokens regardless of outcome. Spend Honor in the Arena vendor for exclusive PvP gear and combat scrolls.",
      ),
      step(
        "Setting your defensive loadout",
        "Configure your defensive skill bar and gear in the Arena panel so your hero fights effectively when other players challenge you.",
      ),
      step(
        "Daily duel allowances",
        "You have a set number of free arena duel attempts daily. Use all free attempts to maximize your daily Honor earnings.",
      ),
    ],
    tip: "Speed and first-turn burst damage are king in the Arena — striking before your opponent acts often decides the fight.",
  },
  {
    id: "diamonds",
    tab: "Diamonds & Luck",
    title: "Diamonds, the Wheel and pure luck",
    blurb: "Everything that costs Diamonds, and exactly how much luck each roll needs.",
    steps: [
      step(
        "What Diamonds are for",
        "Diamonds are the premium currency. They pay for Wheel spins, VIP, mounts, name and gender cards, shop refreshes, extra arena duels and Black Market restocks. Gold can never buy them.",
      ),
      step(
        "The Wheel is mostly small prizes",
        "95% of spins land on a common slice: gold, XP, ore, essence, Frost Crystals or a few Armor Fragments. Every common prize is rolled between half and one and a half of its usual size, so two spins on the same slice rarely pay the same.",
      ),
      step(
        "The six gold slices (5% together)",
        "Void Crystals 1.6%, Sun Crystals 1.2%, 100–300 Diamonds back 0.8%, Fate Stones 0.8%, the gold Jackpot 0.5%, and the Mega Jackpot 0.1% — 1,000 Diamonds, 3 Sun Crystals and a mountain of gold.",
      ),
      step(
        "The Dust slice",
        "One slice in twenty is Dust: a handful of coins and nothing else. It is the wheel's way of reminding you it is a gamble.",
      ),
      step(
        "Luck has no memory",
        "Every spin is rolled fresh by the server. A long losing streak does not make the next spin luckier, and a jackpot does not make the next one worse.",
      ),
      step(
        "Black Market Lucky Stock",
        "Each Black Market roll — the free one every six hours or a 50-Diamond restock — has a 5% chance of Lucky Stock: one weapon or trinket turns Epic and a Sun Crystal is added to the shelf. Crystal and fragment quantities also change every roll.",
      ),
    ],
    tip: "Spin for fun, not for a plan: on average you need about 20 spins (2,000 Diamonds) to see one gold slice.",
  },
  {
    id: "premium",
    tab: "VIP & Services",
    title: "VIP, mounts and Diamond services",
    blurb: "The fixed-price side of the Diamond shop — no luck involved.",
    steps: [
      step(
        "VIP levels",
        "VIP unlocks the Black Market, a daily VIP board and better daily rewards. Higher VIP levels last longer and add more perks; check the Premium Shop for the current price of each level.",
      ),
      step(
        "Diamond mounts",
        "Stallion 300, Drake 600, Stag 900, Nightmare 1,300 and Griffin 2,000 Diamonds. Every mount shortens blitz time and speeds up world travel, and you keep it forever.",
      ),
      step(
        "Name and gender cards",
        "A name card (700 Diamonds) renames your hero — 3 to 16 letters, numbers, spaces, _ or -, and the name must be free. A gender card (500) swaps your hero's look.",
      ),
      step(
        "Small services (50 each)",
        "Refresh a shop, buy one extra arena duel, or restock the Black Market for 50 Diamonds. Restocking is also a fresh chance at Lucky Stock.",
      ),
      step(
        "Your Diamond history",
        "Every Diamond spent or won is written to your history in the Premium Shop, so you can always see where they went.",
      ),
    ],
    tip: "Buy permanent things first — a mount or VIP keeps paying every day, a spin is gone in four seconds.",
  },
  {
    id: "daily",
    tab: "Each day",
    title: "Your daily routine",
    blurb: "Ten minutes a day keeps every counter running. Do these in order.",
    steps: [
      step(
        "1. Collect free resources",
        "Claim the daily chest, the reward board streak, the mine cart and your farm harvest before anything else — they are free.",
      ),
      step(
        "2. Spend stamina",
        "You have 200 stamina a day: 20 per Campaign battle, 10 per dungeon. Spend it where you need progress — stages for levels, dungeons for materials.",
      ),
      step(
        "3. Use your allowances",
        "Three Conquest blitzes, three Spire climbs, three castle raids and your arena duels all reset daily. They are the cheapest rewards in the game.",
      ),
      step(
        "4. Help the guild",
        "Hit the guild boss, donate gold, hand in weekly quests and keep your two war attacks for a bracket you can win.",
      ),
      step(
        "5. Tidy up & drill",
        "Salvage junk gear, spend your attribute and talent points, queue up Barracks drills, and check the Auction House for an upgrade.",
      ),
    ],
    tip: "Everything daily resets at midnight in Greece (UTC+2 / EET), not at your own local midnight.",
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
        "Percentage and flat stat stacking",
        "Flat stats from Gems and Enhancements multiply with percentage bonuses from Astrals, Runes, and Guild Buffs for exponential power.",
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

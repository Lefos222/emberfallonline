# Emberfall: The Long Road

Import and continue here — use pixel-perfect-match-main.zip and its assets as the existing EMBER FALL codebase, not a generic starter, then apply the Stage 5 expansion.

# EMBER FALL — STAGE 5: MMORPG EXPANSION, SOCIAL SYSTEMS & LONG-TERM PROGRESSION

Act as a senior MMORPG game developer and full-stack engineer. Continue developing my existing browser MMORPG, **EMBER FALL**, using its current codebase, existing assets, authentication, and Lovable Cloud backend.

This is an expansion of the existing game, NOT a new project.

## CRITICAL DEVELOPMENT RULES

1. Inspect the existing project before making changes.
2. Do not rebuild, replace, or duplicate features that already work.
3. Preserve existing player accounts, character progression, campaign, equipment, inventory expansion, skill trees, achievements, battle history, crafting, gems, Astrals, boss challenges, and existing castle navigation.
4. Reuse the current backend and data models where possible.
5. Every feature must be connected to real gameplay and persistent player data. Do not substitute mock interfaces, simulated multiplayer, or local-only data for functional systems.
6. Validate valuable actions and rewards on the backend.
7. Implement and test incrementally. Avoid changing unrelated files or systems.
8. Use the exact game name **EMBER FALL** wherever new branding is required.
9. If a requested system already exists, audit and improve only the missing or broken parts.
10. Clearly report completed, incomplete, and tested features. Never claim a feature works if it has only been visually implemented.

# STAGE 5A — COSMETICS, MAILBOX & DAILY/WEEKLY ACTIVITIES

## 1. Cosmetic collection

Introduce collectible cosmetics with suitable artwork and previews:

- Character outfits.
- Weapon skins.
- Wings and back accessories.
- Mounts, if compatible with the current character system.
- Profile frames and cosmetic titles.

Cosmetics should be earned through achievements, bosses, events, quests, and long-term progression.

Requirements:

- Display owned and locked cosmetics.
- Preview appearances before equipping.
- Support equipping and unequipping.
- Persist cosmetic ownership and equipped appearance.
- Keep cosmetic effects separate from combat statistics unless a specific item is intentionally designed to provide stats.
- Reuse existing art where appropriate and create matching new artwork for missing assets.

## 2. Functional mailbox

Create a persistent in-game mailbox supporting:

- System announcements.
- Event rewards.
- Compensation.
- Gifts and future reward distributions.
- Unread indicators.
- Message history.
- Claimable currency and item attachments.

Every attachment must be delivered to the player's actual inventory or currency balance.

Prevent duplicate claims, repeated rewards after refreshing, and simultaneous requests that could grant the same attachment twice.

Messages, attachments, and claim records must be stored using the backend. Do not create a fake local-only mailbox.

## 3. Daily and weekly activities

Expand the existing daily and weekly activity systems without duplicating existing quests or achievements.

Include rotating objectives involving:

- Defeating monsters.
- Completing dungeons.
- Defeating bosses.
- Crafting equipment.
- Collecting or upgrading gems.
- Collecting or upgrading Astrals.
- Winning eligible battles.

Provide multi-step objectives, progress indicators, claimable rewards, login streaks, and long-term milestones where appropriate.

Requirements:

- Use trusted server-side time for resets.
- Validate progress and rewards on the backend.
- Prevent duplicate claims and device-clock manipulation.
- Display exact reset times.
- Ensure rewards are appropriate for the player's progression.

# STAGE 5B — UNIVERSAL INVENTORY

## Every collected object must be a real item

Audit the entire game so every collectible object is stored in the actual inventory system, including:

- Weapons, armor, and accessories.
- Ember Ore.
- Soul Essence.
- Starshards.
- Boss Cores.
- All gems.
- All Astrals.
- Crafting materials, fragments, blueprints, and collectible recipes.
- Double XP, Damage Boost, and Defense Boost scrolls.
- Cosmetics and collectible quest/event items.

Currency such as gold can remain a dedicated currency balance, but every physical collectible must be represented as a proper item.

## Inventory requirements

- Use one consistent item system across drops, quests, crafting, shops, bosses, events, and mailbox rewards.
- Every item must have a stable identifier, name, icon, rarity, description, and appropriate stacking rules.
- Preserve unique properties for equipment, socketed gems, and individual Astrals.
- Display item quantities and inventory capacity.
- Provide suitable filters for Equipment, Materials, Gems, Astrals, Consumables, Quest Items, and Cosmetics.
- Ensure every item uses the correct artwork.
- Fix incorrect mappings between material names and their image assets.
- If the inventory is full, clearly explain what happened and never silently delete an item or reward.
- Persist all changes to the backend.

### Preserve existing inventory expansion

Keep the current inventory expansion system:

- Each expansion adds eight slots.
- The first expansion costs 5,000 gold.
- Each subsequent expansion doubles in cost.
- Preserve the current maximum capacity.

Do not change these rules unless the existing implementation demonstrably contradicts them.

# STAGE 5C — EXPANDED SOCKETABLE GEMS

Expand the existing gem system with genuinely different effects.

## Gem statistics

Support the following stats where compatible with the current combat engine:

- Physical Attack.
- Magic Attack.
- Physical Defense.
- Magic Defense.
- Maximum HP.
- Critical Chance.
- Critical Damage.
- Accuracy.
- Dodge.
- Block.
- Armor Penetration.
- Magic Penetration.
- Healing Power.
- Attack Speed, if supported.

Each gem must have:

- Unique name and artwork.
- Rarity and tier.
- Clear description.
- Exact stat bonus.
- Upgrade or combination path.
- Appropriate crafting or farming source.

## Class synergy

**Knight:** Physical Attack, HP, Physical Defense, Block, and suitable Critical stats.

**Archer:** Physical Attack, Critical Chance, Critical Damage, Accuracy, and Dodge.

**Mage:** Magic Attack, Magic Penetration, Magic Defense, HP, and suitable Critical stats.

These are recommendations, not mandatory restrictions. Players must retain the freedom to experiment with alternative builds.

## Socket functionality

- Support sockets on eligible weapons and armor.
- Allow gems to be inserted, removed, and replaced.
- Preview the resulting stats before confirming changes.
- Preserve gems when equipment is unequipped.
- Prevent unique items from being equipped in multiple places simultaneously.
- Support combining three matching gems into the next tier where compatible with the existing system.
- Show all material and currency costs before upgrading.
- Apply gem bonuses to real character stats, Battle Rating, and combat.
- Save all socket configurations.

Validate socketing, combining, and equipment changes on the backend.

# STAGE 5D — ASTRALS & SEVEN LUCKY SHOTS

Expand the existing Astral system. Do not create a disconnected replacement.

## Seven Lucky Shots

Create a dedicated interface containing seven Lucky Shot attempts.

Each attempt must:

1. Consume exactly one available shot.
2. Generate exactly one Astral.
3. Show the Astral's name, rarity, stat, bonus, and artwork.
4. Add the awarded Astral to the universal inventory.
5. Save the result to the player's account.

Requirements:

- Players can earn additional shots through gameplay, achievements, quests, and events.
- Show the rarity odds before the player uses a shot.
- Use server-side random generation and reward validation.
- Prevent duplicate rewards from double-clicking, refreshing, or repeating requests.
- A failed network request must not consume a shot without a valid reward.
- Do not guarantee a Gold Astral after seven attempts unless a clearly disclosed pity system explicitly defines that guarantee.

## Astral rarity

Support these six rarities:

- Grey — Common.
- Green — Uncommon.
- Blue — Rare.
- Purple — Epic.
- Orange — Legendary.
- Gold — Mythic.

Grey and Green should be common. Blue and Purple should be less common. Orange should be rare, and Gold should be exceptionally rare.

Display the actual configured probabilities rather than misleading or invented odds.

## Astral attributes

Astrals may provide:

- Physical Attack.
- Magic Attack.
- Physical Defense.
- Magic Defense.
- HP.
- Critical Chance.
- Critical Damage.
- Accuracy.
- Dodge.
- Block.
- Armor Penetration.
- Magic Penetration.
- Healing Power.

Balance values by rarity and avoid unlimited stacking.

## Astral inventory and equipment

- Store every Astral as an actual inventory item.
- Provide dedicated Astral equipment slots.
- Allow players to inspect, equip, unequip, and replace Astrals.
- Show the exact bonuses provided by each equipped Astral.
- Preserve ownership, upgrades, and equipped status after refreshing.
- Make duplicate Astrals useful for upgrades or progression where appropriate.
- Keep Astral inventory separate from equipped Astrals.
- Ensure Astral bonuses affect actual combat and Battle Rating.

Support useful Knight, Archer, and Mage builds without making Astrals class-exclusive unless required by existing design.

# STAGE 5E — CRAFT-ONLY RARE ARMOR & LONG-TERM GRINDING

Create a rewarding, long-term progression loop around monster farming, boss challenges, material collection, crafting, and equipment upgrades.

## Mandatory rule: Rare armor must be crafted

**Finished Rare armor must never drop directly from enemies or be granted as a finished item through alternative reward systems. It must be produced through crafting.**

Audit all reward sources, including:

- Ordinary monsters.
- Elite monsters.
- Bosses.
- Dungeons.
- Quests.
- Achievements.
- Mailbox rewards.
- Shops.
- Daily and weekly activities.
- Events.
- Any other existing reward table.

Enemies and reward systems may award Rare armor ingredients, fragments, recipes, and blueprints, but never finished Rare armor directly.

Apply the same rule to higher armor tiers when they are designated as craft-only.

Do not accidentally prohibit weapon drops if the existing design allows weapons to drop. This rule specifically targets finished armor.

## Material sources

- Ordinary monsters: common materials.
- Elite enemies: improved quantities or chances for uncommon materials.
- Bosses: specialized ingredients and Boss Cores.
- Dungeons: targeted crafting materials.
- Higher-level regions: better-tier materials.
- Achievements and weekly activities: supplementary resources.

All materials must appear as inventory items with the correct icon and quantity.

## Crafting progression

- Common equipment supports early progression.
- Uncommon equipment provides accessible upgrades.
- Rare armor requires deliberate farming and crafting.
- Epic and Mythic craft-only armor requires increasingly valuable ingredients and progression.
- Recipes must display required materials, gold costs, level requirements, and crafting results.
- Provide a clear way to discover where materials drop.
- Make Boss Cores and rare materials valuable throughout the game.
- Keep the grind meaningful and rewarding without making progress excessively repetitive.
- Prevent shops, quests, mail, and events from bypassing the craft-only armor rule.

Audit and correct existing loot tables instead of replacing the entire drop system.

# STAGE 5F — CONSUMABLE SCROLLS

Expand the existing shop with three consumable items.

## Double XP Scroll

Increases eligible XP rewards by a clearly specified percentage for a defined duration or number of battles.

## Damage Boost Scroll

Increases eligible damage by a clearly specified percentage for a defined duration or number of battles.

## Defense Boost Scroll

Increases physical defense, magic defense, or both by clearly specified amounts for a defined duration or number of battles.

Requirements:

- Add appropriate artwork, prices, descriptions, and rarity where relevant.
- Scrolls must be actual stackable inventory items.
- Players must manually activate them from their inventory.
- Show remaining duration or remaining eligible uses.
- Apply their effects to actual gameplay.
- Clearly explain whether identical buffs stack, refresh, or replace one another.
- Prevent use when the player does not own the item.
- Prevent duplicate purchases and double consumption.
- Persist inventory counts and active buffs.
- Validate purchases, activation, and consumption on the backend.
- Keep the scrolls useful without making them mandatory for progression.

# STAGE 5G — FUNCTIONAL GUILD SYSTEM

Build a genuine multiplayer guild system using the existing authentication and backend.

## Guild creation

Players can:

- Create a guild.
- Choose a unique guild name.
- Set a description and emblem.
- Pay a clearly displayed gold creation fee.
- Invite other players.
- Receive and respond to invitations.
- Join or leave guilds.

The creator becomes the Guild Leader.

Prevent duplicate guild creation, invalid names, and repeated charges.

## Guild roles and permissions

Support:

- Guild Leader.
- Officer.
- Member.

Implement appropriate permissions for invitations, member removal, promotions, demotions, announcements, leadership transfer, and disbanding.

All privileged actions must be validated by the backend.

## Guild interface

Display:

- Guild information and emblem.
- Member roster.
- Character names, classes, levels, and online status.
- Guild chat.
- Pending invitations.
- Membership requests where supported.
- Guild announcements.
- Role-specific management controls.

Ensure guild membership and information are shared across accounts.

Prepare the architecture for future guild progression, missions, cooperative boss encounters, and guild achievements. Do not present unfinished functionality as working.

# STAGE 5H — PERSISTENT BOTTOM-LEFT CHAT

Create a persistent, compact chat interface in the **bottom-left corner** of the game.

It must remain accessible across supported game screens and must not overlap the existing bottom-right shortcut bar.

## Channels

**World Chat:** A shared channel for eligible players across the game.

**Guild Chat:** Accessible only to members of the same guild.

**Private Chat:** Direct messages between players, integrated with the existing friend system where possible.

## Required features

- Player names and timestamps.
- Message input and send button.
- Enter-to-send.
- Expand, collapse, and minimize controls.
- Unread message indicators.
- Recent message history.
- Channel switching.
- Player inspection when clicking a player name.
- Message length limits.
- Anti-spam rate limits.
- Reporting and moderation controls where supported.

## Real multiplayer requirements

Use shared backend persistence and realtime updates where supported.

Messages must be visible across separate accounts and browser sessions. Do not use fake online players, local-only arrays, or simulated chat.

Enforce:

- Authentication and authorization.
- Guild membership checks.
- Private-message access rules.
- Message validation.
- Rate limiting.
- Appropriate protections against spam and abuse.

# STAGE 5I — BALANCING, ECONOMY & RETENTION

Balance the expanded game around long-term progression.

- Keep Knight, Archer, and Mage viable.
- Prevent critical chance, penetration, defense, and other stats from scaling without reasonable limits.
- Make gems, Astrals, crafting, and equipment upgrades complementary.
- Keep high-tier materials rare but obtainable through repeatable gameplay.
- Give Boss Cores meaningful uses.
- Avoid excessive gold inflation.
- Balance scroll effects against boss difficulty and existing progression.
- Keep core progression achievable without real-money purchases.
- Reward regular play without punishing players who miss a day.
- Ensure the grind creates meaningful goals instead of unnecessary repetition.
- Keep cosmetics primarily cosmetic.

# STAGE 5J — BACKEND SECURITY, PERSISTENCE & TESTING

Use the existing account system and backend.

Persist:

- Inventory and materials.
- Equipment and sockets.
- Gems and Astrals.
- Crafting and upgrades.
- Cosmetics and equipped appearances.
- Mail and claim records.
- Daily and weekly activity progress.
- Guild membership and permissions.
- World, guild, and private messages.
- Scrolls and active buffs.
- All relevant character progression.

Validate valuable operations server-side. Prevent duplicated rewards, double-spending, unauthorized guild actions, unauthorized private messages, client-manipulated drop rates, and repeated Lucky Shot rewards.

## Required acceptance tests

1. Every collected physical object appears in the actual inventory.
2. Material quantities and icons display correctly.
3. Gems can be socketed, removed, upgraded, and applied to real stats.
4. Knight, Archer, and Mage have viable gem builds.
5. Each Lucky Shot consumes one shot and awards exactly one Astral.
6. Astral rarity, attributes, ownership, and equipment persist.
7. Astrals affect real character stats and combat.
8. Cosmetics persist and can be equipped and removed.
9. Mail attachments can only be claimed once.
10. Daily and weekly rewards cannot be duplicated or manipulated through the device clock.

## ASSET CREATION AND MISSING ASSETS — EMBER FALL

**You are authorized to create any missing game assets needed to complete Stage 5.** Do not stop implementation simply because an image, icon, texture, animation, visual effect, or other required asset does not already exist.

First, inspect the existing project assets and reuse suitable resources. If a required asset is missing, create a new one that matches EMBER FALL's existing visual style.

This includes, where needed:

- **Item artwork:** Ember Ore, Soul Essence, Starshards, Boss Cores, crafting materials, gems, Astrals, scrolls, recipes, fragments, and collectible items.
- **Equipment artwork:** Weapons, armor, equipment icons, inventory thumbnails, and crafting-result previews.
- **Astral artwork:** Distinct visuals for all six rarities: Grey, Green, Blue, Purple, Orange, and Gold.
- **Gem artwork:** Distinct icons for every gem type, including physical attack, magic attack, physical defense, magic defense, HP, critical chance, critical damage, accuracy, dodge, block, and penetration.
- **Cosmetics:** Character outfits, weapon skins, wings, mounts where supported, profile frames, and other collectible appearances.
- **UI assets:** Guild emblems, mailbox icons, Lucky Shot visuals, buttons, rarity borders, inventory icons, reward illustrations, and missing interface elements.
- **Visual effects:** Appropriate effects for gem socketing, crafting, Astral acquisition, rare drops, level progression, and reward collection.
- **Additional assets:** Any other missing visual or audio resources genuinely required by the requested features.

### Asset creation rules

1. Preserve existing artwork and assets that already work. Do not replace them unnecessarily.
2. Create original assets that fit the existing EMBER FALL art direction, color palette, fantasy MMORPG atmosphere, and interface style.
3. Use the project's existing asset formats, dimensions, naming conventions, and directory structure wherever possible.
4. Generate separate, reusable assets for individual items whenever practical, rather than using one generic image for every item.
5. Give items appropriate visual distinctions based on their type and rarity.
6. Optimize assets for browser performance and reasonable loading times.
7. Connect every new asset to the correct item, component, or screen in the actual game. Creating an image file alone does not complete the feature.
8. Verify asset paths, file names, imports, and rendering. Fix broken image references and missing textures.
9. If an asset-generation capability is unavailable, create the best suitable original alternative using the project's available development tools. Do not leave broken images or pretend a missing asset exists.
10. Do not copy proprietary artwork from another game. Create original assets inspired by the general fantasy MMORPG genre.

### Asset and functionality acceptance tests

- Every item in the inventory displays its correct icon.
- All new materials, gems, Astrals, and scrolls have matching artwork.
- Each Astral rarity is visually distinguishable.
- Cosmetics have appropriate previews and appearances wherever supported.
- Guilds, chat, mailbox, Lucky Shots, crafting, and rewards have the required UI assets.
- No missing-image placeholders, broken paths, or console errors remain in the implemented features.
- All newly created assets are actually integrated into EMBER FALL.

**Final requirement:** Continue the existing EMBER FALL project, preserve working assets, and create any missing assets needed to finish Stage 5. Do not treat missing artwork as a reason to leave a feature unfinished.

1. Rare armor cannot be obtained as a finished direct drop or alternative reward; crafting is its only acquisition method.
2. Scrolls can be purchased, stored, activated, and consumed correctly.
3. Guild creation, membership, permissions, and chat work across separate accounts.
4. World chat works across separate accounts and browser sessions.
5. Guild and private chat enforce access restrictions.
6. Inventory expansion and existing crafting still work.
7. Existing campaign, skill trees, achievements, boss challenges, and progression remain intact.
8. Existing music continues looping while enabled and stops immediately when disabled.

## IMPLEMENTATION ORDER

Complete these in order, testing each phase before proceeding:

**Priority 1:** Universal inventory integration, material artwork corrections, and socketable gems.

**Priority 2:** Seven Lucky Shots, Astral inventory integration, and real stat effects.

**Priority 3:** Craft-only Rare armor enforcement, loot-table auditing, material farming, and scrolls.

**Priority 4:** Cosmetics, mailbox, and secure daily/weekly activities.

**Priority 5:** Guild creation, membership, permissions, and shared guild chat.

**Priority 6:** Persistent world/private chat, economy balancing, security, and regression testing.

If the project already has any of these features, verify the implementation and fix missing functionality instead of duplicating it.

At the end, provide a concise report listing:

- Features completed.
- Features partially completed.
- Backend changes made.
- Tests actually performed.
- Known limitations or remaining work.

Do not claim success without evidence from actual implementation and testing.

The final result must remain the existing game: **EMBER FALL**.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3fbae49-885a-49ea-87ea-9bfa06dfe5cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

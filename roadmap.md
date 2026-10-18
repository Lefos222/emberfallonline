# Roadmap
- [x] Current continuation: +20% damage/defence/XP scrolls connected to existing server RPCs, saved quantities, battle snapshots and reward callbacks; six original gendered fighters, four base enemies, three scroll icons, animated impacts and stable battle framing.
- [x] Signed-in verification on the managed backend: hero loads, castle screens open, mailbox/lucky-shot/activity RPCs answer, scroll shop shows real gold and owned counts and disables unaffordable buys; Lucky Shot draw awarded and persisted to the collection. Still open: a funded purchase -> activate -> ten-battle consumption cycle (needs 1,500+ gold), and a full Google/Lovable provider round trip from the hosted preview address.
- [x] Core game imported into this project with Cloud saves, sign-in, artwork and music
- [x] Phase 1: Daily Rewards / Quest Board / Ancestral Sanctuary removed from castle; bottom-right 7-icon shortcut bar; Music Off pauses
- [x] Phase 1b: Throne Hall (skill tree + progression) and Armory (inventory) open different screens
- [x] Phase 2a: class skill trees (3 specs per class, passives, ability upgrades, new abilities, reset)
- [x] Phase 2b: achievements (tiers, one-time claims, titles), battle history + combat stats, gear set bonuses
- [x] Phase 3: materials from battles, gems (cut/socket/fuse), Astrals (summon/upgrade/3 slots/collection), Forge recipes
- [x] Phase 4: Dungeon Gate boss challenges (4 bosses × 10 difficulties), weekly modifier + objective, Elite Hunt (weekly claim is client-clock based until Phase 5 server checks)
- [x] Buy extra bag rows with gold; material + gem artwork
- [ ] Phase 5: cosmetics, mailbox, daily/weekly activities (server-validated claims)
- [ ] Phase 6: friends, inspection, guilds + guild chat
- [ ] Phase 7: economy/shop, premium-currency groundwork (real payments need a payment provider)
- [ ] Phase 8: immersion, combat log, quality-of-life
## Stage 5 (this project, fresh game server)
- [x] Game imported; sign-in (email, Google, Lovable), art and music re-uploaded
- [x] Server rules: mailbox claims, Lucky Shots, scrolls buy/activate/consume, daily/weekly activities + login streak, cosmetic unlocks, guilds + roles, world/guild/private chat with rate limits & reports
- [x] 13 gem types, 13 Astral species, 6 Astral rarities with published odds, new stats (magic atk/def, accuracy, block, magic pen, healing) in Battle Rating
- [x] Craft-only Rare+ armor: loot, bosses, quests and merchant never give finished Rare+ armor; armor recipes need Armor Fragments / Elite Sigils
- [ ] Screens for Mailbox, Lucky Shots, Activities, Wardrobe, Guild Hall, bottom-left chat, scroll shop, universal bag filters
- [ ] Block/healing applied inside battles; scroll buffs applied in battles; activity progress reporting from battles
- [ ] New item artwork (image credits exhausted — simple drawn icons used for new gems/materials meanwhile)
## Tactical Combat Overhaul
- [x] Tactical turn-based battle engine (turn order, multi-enemy formations, target selection, statuses, boss telegraphs, block/heal caps) + 4 arena backgrounds
- [x] Full bag never destroys loot (Overflow Chest in Armory); reward settle-once guard
- [ ] Painted artwork for 9 gems, fragments, sigils, Astrals, scrolls (Build credits exhausted; distinct drawn icons used meanwhile)
- [x] Original gendered fighter artwork animated for idle, attacks, casting, hits, blocks, death and victory; class skill impact effects
- [x] Server-validated battle rewards and idempotent battle consumption: campaign battles raise level/gold/rating in the stored save, scroll charges come from begin_battle, and buy/activate/begin rules reject invalid requests server-side
- [x] Bag filters, search and sorting
- [x] Mailbox, Lucky Shots, Activities and initial Guild Hall screens connected to existing typed RPCs; no invented rows or local rewards
- [x] Protect reward save ordering, retain Lucky Shot retry UUIDs, recover uncertain claims by rereading online saves, and retain overflow beyond 60 items
- [x] Online claims verified signed-in (mail read, Lucky Shot draw persisted, activity board reads real progress); signed-in guild creation/invite/chat flows still unverified
- [x] Scroll buffs in combat: user-confirmed +20% effects, server charge snapshots, duplicate-entry guard and interrupted-request acknowledgment; seven additional rule tests
- [ ] Finish guild management controls, Wardrobe, world/private chat, and trusted activity reporting
- [ ] Equipped-item/cosmetic-specific battle appearance beyond the new class/gender artwork
- [ ] Remaining all-stage feature work and full collectible artwork audit; not completed by this combat increment
## Requested next (this turn)
- [x] Two ring slots: rings wear in Ring 1 and Ring 2, third ring swaps the weaker, old saves keep their ring, full bag blocks unequip
- [ ] Skill tree screens with animation, and every skill the character performs plays a matching battle animation (sword swing, cast volley, etc.)
- [ ] World chat panel bottom-left: send and receive messages for everyone in the world
- [ ] World events plus a wider roster: 50 bosses and 50 enemies so encounters vary
- [ ] Add friends by name
- [ ] View and inspect another player (gear, stats, astrals)
- [ ] Battle fighter uses the same character model as character selection
- [ ] More original artwork wherever the game still reads flat, and general liveliness (ambient motion, feedback)
- [x] Google sign-in works on its own for new people on the public link (verified: reaches Google's own account page, no Lovable step); the editor preview URL stays Lovable-gated by design

## New requests (2026-10-18 11:36)
- [ ] Inspect uploaded emberfall-the-long-road-main-2.zip and fold in anything useful
- [ ] Skill trees + passives with original artwork stored in project assets
- [ ] Unending progression: enough content for 60+ hours (stages, bosses, enemies, activities)
- [ ] Four-hourly timed world events (world boss spawn, timed dungeon, treasure caravan) with real rewards
- [ ] More equipment families and more crafting materials (artwork + drop tables + forge recipes)
- [ ] Wartune-style event calendar / activity board refresh

## New requests (2026-10-18 11:42)
- In-game event calendar: live countdowns, time-zone-aware schedules, reminders for recurring world bosses and seasonal events. [in progress]
- Guilds: member roles, shared progression, guild quests, cooperative rewards (roles + invites + chat already exist; add progression/quests/co-op rewards). [open]
- Guild activity log: quest progress, donations, and each member's contributions to shared rewards. [open]
- Guild chat: announcement channel, message history, basic moderation controls. [open]
- Seasonal guild rankings from cooperative activity; exclusive cosmetics for top guilds. [open]
- Guild shop: spend earned contribution tokens on upgrade materials, equipment, cosmetics. [open]

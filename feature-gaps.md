# Expansion audit

## Existing foundations preserved
- Class talents/passives, equipment, gems, Astrals, crafting, campaign, conquest/Long Road, dungeon challenges, inventory overflow and bag expansion.
- Authentication, cloud characters, server-owned Lucky Shots/scrolls/cosmetic claims, mailbox and daily/weekly claims.
- Friends, profile inspection, world/guild chat, guild membership; asynchronous Arena and client combat engine.

## Added in this increment
- Two-hour boss rotation with authenticated time-gated entry, Rare+ weapon/jewelry loot via the existing drop path.
- Six material expeditions, four advanced Forge recipes, targeted gem cutting, duplicate Astral absorption, batch Barracks training.
- Boutique frame/title editing and existing online cosmetic collection checks; Sanctuary stages and craft-only heirloom unlock.
- Server-owned timed gathering foundation for six professions and five areas, including XP, tool milestones, rarity rolls, inventory counts and discovery history.

## Partial / security gaps
- Existing combat outcomes, most gold and crafting actions still originate in the browser. Event entry checks the server clock; combat rewards are **not** server-simulated or server-authorized. Arena RPC trusts submitted outcomes.
- Gathering ownership, timers and rewards are server-validated and stored under protected `srv`; resources are currently a persistent gathering collection, not yet ingredients in production crafting or trade.
- Profession quests, resource costs for advanced journeys, tool upgrades beyond automatic milestones and milestone rewards remain incomplete.
- Cosmetic collection unlocks persist but outfits/wings do not replace the painted base character.
- Existing achievements and bestiary are partial; no broad reputation or persistent narrative quest lifecycle.

## Missing follow-on systems
- Mounts/pets and bonding; estates/editor/furniture/visitors/guestbook.
- Atomic auctions/direct trade and economic monitoring. Authoritative currency/item ownership must precede these.
- Ranked seasons, defensive teams and trusted combat settlement.
- Seasonal mission/reward-track framework and catch-up/rested systems.
- Illustrated broad Codex, hidden exploration objects, factions and reputation.

## Art sequence
Preserve existing castle/arena/characters/rosters. Generate functional phase assets alongside implementation: gathering regions and discoveries now; mounts/estates/factions/economy/seasonal art when their usable systems are built. Never use copied game art.
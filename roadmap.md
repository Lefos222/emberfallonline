# Roadmap

## Current request
- Netlify work paused by request; leave existing hosting configuration untouched.
- [ ] Replace AI quests with five daily boss quests, server UTC resets and replay-safe rewards; connect the board to the game.
- [ ] Remove the Cosmetic Boutique entry and screen while preserving owned cosmetics.
- [ ] Surface all existing reward collections in Armory without duplicating saved items.
- [ ] Expand scalable guild supply situations and add paginated/filterable auction browsing plus protected proceeds claims.
- [ ] Run regression tests and verify daily quests, inventory, and auction screens; report hosting/security blockers honestly.
- [x] Correct inventory battle-size leakage and invalid guild-chat recipient UUID; 168 tests passed, build OK, signed-in Armory has no runtime errors.
- [x] Enlarge the inventory character between equipment slots without changing character selection; verified at 790px with a 320px model.
- [~] Add recurring guild cooperative supply situations with persistent contributions and validated scroll rewards: three daily missions, contribution ledger, owned-resource consumption, replay-safe claims. Full contribution/claim and guild-chat send verification blocked: no guilds exist in the current backend; no player funds or membership were changed to manufacture a test.
- [x] Reduce battle-only characters to 200px player / 150px enemies; signed-in campaign screenshot verified, selection/inventory unchanged.
- [x] Choose unlocked battle skills in Throne Hall while retaining existing level/talent unlocks and basic attack; saved choice verified after refresh, 157 tests pass.

## Verified foundations
- [x] Preserve existing accounts, saves, castle, combat, equipment, crafting, gems/Astrals and online reward services.
- [x] Endless encounter scaling, nine milestone abilities and animated previews; shared standalone character models and 60-case appearance checks.
- [x] Expand Forge recipes, targeted gem cutting, duplicate Astral absorption, batch Barracks training, Sanctuary and Boutique screens.
- [x] Six material expeditions and two-hour world boss rotation with authenticated time-gated entry; battle reward settlement remains legacy/client-side.
- [x] Expansion feature-gap audit, new-asset manifest and documented initial economy/progression values.
- [x] Six server-owned gathering professions, five level-gated areas, timed journeys, rarity discoveries, XP, tool milestones, collection and history.
- [x] Real gathering journey survived refresh; concurrent replay, ownership rejection and invalid request checks passed; 153 regression tests passed.

## Next phases — intentionally not implemented together
- [ ] Production crafting from gathered resources, profession quests/milestone claims and broad Codex/reputation. Depends on secure item-consumption design.
- [ ] Mounts/pets/bonding and estate editor/visitors. Depends on collectible ownership and placement implementation.
- [~] Atomic auction economy/trade. Verified end to end: list → buy → cancel, buyer debit, ore delivery, seller credit, self-buy blocked, sold listings can't be re-bought. Remaining: authoritative currency ownership so a seller's open preview can't overwrite credited gold with a stale client save (observed once in testing).
- [ ] Ranked seasons and reusable validated seasonal reward cycle/catch-up. Blocked on authoritative battle settlement; Arena currently trusts submitted outcomes.
- [ ] Outfit/weapon-specific layered artwork, original art for future phases and full legacy asset audit.
- [ ] Real high-level unlock/use verification and measured 60-hour balance; current test character lacks endgame milestones.
- [ ] Full hosted stranger Google/Lovable round trip and funded scroll ten-battle cycle remain unverified.
- Guild expansion remains deferred in favor of general endless progression.
- [ ] Add skill icons/pictures to the battle skill bar.
- [x] Show gathering resources (ores, crystals, herbs, etc.) in the inventory.
- [~] Premium monetization (foundations done: Diamonds backend, Diamond Shop, Gold packs, VIP 1-5 + daily claims; real-money checkout awaits provider enablement) (per uploaded spec): Diamonds currency (server-owned, tx history, idempotent), Diamond Shop (cosmetics/convenience/progression), Gold packs (Diamonds→Gold, atomic), VIP 1-5 (membership duration + daily rewards calendar), starter packs, battle-pass track structure, real-money store via provider (Stripe/Paddle) with server verification; keep purchases disabled until provider verified.
- [~] Auction house: server-authoritative listing/buying/cancelling of gathered supplies live (atomic gold+resource swap, idempotent). Equipment bidding not yet included.
- [ ] Profession quests for all six gathering professions; rewards unlock crafting recipes and faction access.
- [ ] Personal estate: build homes, decorate, display gathered items.
- [ ] Ranked arena: server-authoritative matchmaking, rating gains, divisions, division cosmetics.
- [ ] Collection Codex: illustrated entries for every gathered material, monster, discovered location.

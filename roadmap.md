# Roadmap

## Current request
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
- [ ] Atomic auction economy/trade. Blocked on authoritative currency/item ownership, since legacy client saves still control most gold.
- [ ] Ranked seasons and reusable validated seasonal reward cycle/catch-up. Blocked on authoritative battle settlement; Arena currently trusts submitted outcomes.
- [ ] Outfit/weapon-specific layered artwork, original art for future phases and full legacy asset audit.
- [ ] Real high-level unlock/use verification and measured 60-hour balance; current test character lacks endgame milestones.
- [ ] Full hosted stranger Google/Lovable round trip and funded scroll ten-battle cycle remain unverified.
- Guild expansion remains deferred in favor of general endless progression.
- [ ] Add skill icons/pictures to the battle skill bar.
- [x] Show gathering resources (ores, crystals, herbs, etc.) in the inventory.
- [ ] Premium monetization (per uploaded spec): Diamonds currency (server-owned, tx history, idempotent), Diamond Shop (cosmetics/convenience/progression), Gold packs (Diamonds→Gold, atomic), VIP 1-5 (membership duration + daily rewards calendar), starter packs, battle-pass track structure, real-money store via provider (Stripe/Paddle) with server verification; keep purchases disabled until provider verified.

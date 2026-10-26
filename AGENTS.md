<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Server-owned character data lives at `heroes.save->'srv'` (Lucky Shots, scrolls, buffs, cosmetics); a trigger blocks client edits and only SECURITY DEFINER RPCs write it via `_write_save`. Why: rewards must not be client-forgeable. Client must flush its save before an RPC and adopt the returned save.
- Lucky Shot odds live in both `ASTRAL_ODDS` (crafting.ts) and `lucky_shot()` SQL; keep them identical.
- Browser reward integration uses typed existing RPCs through `services.ts`, validates response envelopes through `services-contract.ts`, serializes cloud writes before mutation, and adopts returned saves without resaving; this prevents stale drafts from overwriting online rewards.
- Keep pending valuable request UUIDs scoped to character and operation until a validated response succeeds; this makes uncertain Lucky Shot retries safe across refreshes.
- Guild UI reads existing membership tables and invokes existing permission-checked RPCs; client role checks only control presentation and never authorize mutations.
- Guild supply events use a membership-checked contribution ledger and unique per-day claims; only owned protected gathering resources count, and rewards use existing scroll inventory to avoid trusting combat outcomes.
- Scroll effects use a validated `begin_battle` snapshot after serialized save sync; never retry charge consumption automatically, and retain an interruption marker until acknowledged because the existing RPC has no idempotency key.
- Battle reward callbacks accept the confirmed XP multiplier explicitly; non-battle rewards remain unaffected, avoiding global buff state leaking into unrelated rewards.
- Character creation, inventory, profiles and battles use CharacterModel with the shared standalone transparent class/gender assets, never selection-card crops; object-contain preserves proportions and battle effects remain presentation-only.
- Endless encounters derive their roster and circuit difficulty from saved road/wave cursors, not hero snapshots or random UI state; this preserves encounters across refreshes and avoids a fixed Spire difficulty plateau.
- Endless talent branches use the existing talent ranks, point budget and saved Road/Spire high-water marks; their abilities enter buildKit and the shared animation table, so no separate progression or damage engine is introduced.
- Appearance checks run through tests/visual/check_character_appearance.py using isolated in-memory equipment/progression and fixed-size screenshot frames; they never restore sessions or write player saves.
- Building expansions reuse existing material keys, craft/socket/Astral helpers and saved ancestral state; event entry validates the shared UTC opening in an authenticated server function, while encounter rewards retain the existing battle settlement path.
- Professions persist timers, XP, resource ownership and request history under protected save.srv.gathering through owner-checked SQL RPCs; browser services flush queued saves, validate replies and adopt without resaving to prevent forged discoveries or refresh duplication.
- Optional saved skill loadouts filter the existing unlocked combat kit at battle entry and always preserve its basic attack; absent loadouts retain legacy kits so progression and old saves remain compatible.
- Diamond prices, gold-pack rates and VIP costs live in both `src/game/economy.ts` and the `premium_diamonds_vip` SQL functions; keep them identical (same rule as Lucky Shot odds). The server is authoritative.

## Base44 dev environment

- Run with `docker compose -f docker-compose.base44.yml up -d`; the web service binds host port 3000. It is a Vite + TanStack Start SSR app using Bun (`bun.lock`, `bunfig.toml`). The compose service installs Bun inside `node:22-slim`, runs `bun install --frozen-lockfile`, then `bun run dev --host 0.0.0.0 --port 3000 --strictPort`. Source is bind-mounted, so edits hot-reload.
- Supabase publishable keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) already live in the committed `.env`; Vite loads them at dev time. They are publishable/anon keys, not user secrets — no secrets card is needed to boot.
- The whole game (castle, world map, battles) is gated behind Supabase auth + character selection (`src/game/Game.tsx`). An anonymous preview shows the sign-in page; to exercise the World Tree → World Map you must be signed in with a character.
- World Map (`src/game/worldmap.ts`, `src/game/WorldMap.tsx`, `src/game/WorldField.tsx`): castle positions are stored on the hero save (`hero.world`) and mirrored into the publicly-readable `heroes.stats` JSONB column as `wx`/`wy` by the save flow in `src/game/store.ts` (`performSave`), so every player sees every other castle's position with no schema migration. Relocation is capped at 3/day via `hero.worldMoves` (UTC date strings). The 2.5D field is a side-scroller driven by `requestAnimationFrame`; walking into a monster calls the existing `StartBattle` combat path.


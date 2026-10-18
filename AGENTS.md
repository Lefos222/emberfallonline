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

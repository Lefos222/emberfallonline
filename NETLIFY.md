# Hosting EMBER FALL on Netlify

The existing game and existing Lovable Cloud data remain connected. Do not create a replacement database or import player saves into another service.

## Deploy

1. Connect this project's Git repository in Netlify and use its `netlify.toml`.
2. Use Node 22 with Bun available. The build command is `bun run build`; Nitro's Netlify preset generates the server function and routing rules.
3. Copy the existing public connection settings into Netlify's build environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`. These are public app connection values, not privileged credentials. Use the same existing backend.
4. For authenticated server functions, also set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to that backend's public URL and publishable key. Never use a sandbox-local runtime URL on Netlify.
5. Add your actual `https://<your-site>.netlify.app/**` or custom-domain address in Lovable Cloud → Users → Auth settings → Advanced → Redirect URLs. Set the Site URL if email links should default to Netlify.

## Authentication limitations

Email/password login uses the existing backend and accounts. Password-reset and confirmation links require the Netlify return address in Redirect URLs.

Managed Google and Lovable sign-in rely on the hosting service's `/~oauth/initiate` broker. Netlify does not automatically supply this broker. A generic rewrite of `/~oauth/*` is not a documented integration and has deliberately NOT been added. Those buttons remain unchanged for Lovable hosting, but their Netlify operation is not verified. Do not announce Netlify social sign-in as working until an officially supported external-host broker setup is available and a real sign-in succeeds.

If identical managed social sign-in is essential today, the verified hosting architecture remains Lovable's published app (including a connected custom domain), not a standalone Netlify deployment.

## Before going live

Verify the Netlify build succeeds, direct visits to `/`, `/auth`, `/auth-callback`, and `/reset-password` render, email sign-in enters the game, existing characters load, and saved changes survive refresh. None of these external-deployment checks can run until a Netlify deployment URL exists.

Daily quests no longer call AI. The existing optional battle advisor is separate from quest rewards and still requires its own service configuration; it is not part of reward eligibility.
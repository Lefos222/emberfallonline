import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { matchingDiscordAuthor } from "./social-rewards";

const GUILD = "1561235983712788480";
const CHANNEL = "1561237031827415212";

async function discord(path: string) {
  const key = process.env['DISCORD_API_KEY'];
  const gateway = process.env['LOVABLE_API_KEY'];
  if (!key || !gateway) throw new Error("Discord verification is not configured.");
  const response = await fetch(`https://connector-gateway.lovable.dev/discord/${path}`, {
    headers: { Authorization: `Bearer ${gateway}`, "X-Connection-Api-Key": key },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("Discord verification", response.status, body);
    throw new Error(`Discord verification unavailable (${response.status}). The bot needs access to the welcome channel and message content.`);
  }
  return response.json();
}

export const verifyDiscordReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { heroId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.heroId)) throw new Error("Select a character first.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: hero, error } = await context.supabase.from("heroes").select("id").eq("id", data.heroId).eq("user_id", context.userId).maybeSingle();
    if (error || !hero) throw new Error("Character not found.");
    const { data: claimed } = await context.supabase.from("social_reward_claims").select("provider").eq("user_id", context.userId).eq("provider", "discord").maybeSingle();
    if (claimed) throw new Error("This account has already received its Discord reward.");
    const { data: code, error: codeError } = await context.supabase.rpc("social_reward_code", { _provider: "discord" });
    if (codeError || typeof code !== "string") throw new Error("Verification code unavailable.");
    const author = matchingDiscordAuthor(await discord(`channels/${CHANNEL}/messages?limit=100`), code);
    if (!author) throw new Error("Post your exact verification message in the Discord welcome channel, then try again.");
    const member = await discord(`guilds/${GUILD}/members/${author}`);
    if (member?.user?.id !== author) throw new Error("Discord membership could not be verified.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reward = await supabaseAdmin.rpc("award_verified_social", { _user: context.userId, _hero: data.heroId, _provider: "discord", _external: author });
    if (reward.error) throw new Error(reward.error.message);
    return reward.data;
  });
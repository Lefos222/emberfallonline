import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function adviseStrategyWithAI(input: { heroClass: string; level: number; hero: Record<string, number>; enemy: Record<string, number | string | boolean>; skills: string[] }) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    maxRetries: 0,
    system:
      "You are a battle tactician in a turn-based dark-fantasy RPG. Damage = atk*skill% reduced by def (100/(100+def*0.9)); crit doubles damage; dodge avoids hits. " +
      "The hero has 2 potions (heal 35% HP). Give a verdict (win likely / risky / avoid) and 3-4 short bullet steps naming the hero's exact skills in order. Under 90 words, no headings.",
    prompt: JSON.stringify(input),
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  return (await result.text).slice(0, 800);
}

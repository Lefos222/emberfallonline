import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const questSchema = z.object({
  quests: z.array(
    z.object({
      title: z.string(),
      story: z.string(),
      enemyName: z.string(),
      enemyType: z.enum(["goblin", "skeleton", "demon", "dragon"]),
      difficulty: z.number(),
      rewardRarity: z.number(),
    }),
  ),
});
export type GeneratedQuest = z.infer<typeof questSchema>["quests"][number];

export async function generateQuestsWithAI(input: { theme: string; heroClass: string; level: number; stage: number }) {
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
      "You are the Blood-Moon Oracle of a dark-fantasy browser RPG. Write exactly 3 quests. Each story is ONE punchy sentence (max 20 words). " +
      "enemyName is a short evocative monster name. difficulty is 1 (easy), 2 (hard) or 3 (deadly). rewardRarity is 1-4 and should rise with difficulty. " +
      "Pick enemyType that best matches the enemy: goblin (beasts, brutes, orcs), skeleton (undead, ghosts), demon (fiends, cultists, fire), dragon (wyrms, giant bosses — only for difficulty 3).",
    prompt: `Theme: ${input.theme.slice(0, 120)}. Hero class: ${input.heroClass}, level ${input.level}, campaign stage ${input.stage}.`,
    output: Output.object({ schema: questSchema }),
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  });
  let quests: GeneratedQuest[];
  try {
    quests = (await result.output).quests;
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) quests = questSchema.parse(JSON.parse(e.text)).quests;
    else throw e;
  }
  return quests.slice(0, 3).map((q) => ({
    ...q,
    title: q.title.slice(0, 60),
    story: q.story.slice(0, 160),
    enemyName: q.enemyName.slice(0, 40),
    difficulty: Math.min(3, Math.max(1, Math.round(q.difficulty))),
    rewardRarity: Math.min(4, Math.max(1, Math.round(q.rewardRarity))),
  }));
}

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

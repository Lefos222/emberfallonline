import { l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as createServerRpc } from "./createServerRpc-DSPYtqIT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CMevzYJH.mjs";
import { t as createOpenAI } from "../_libs/ai-sdk__openai+zod.mjs";
import { t as streamText } from "../_libs/ai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quests.functions-B95ZUd2p.js
async function adviseStrategyWithAI(input) {
	const apiKey = process.env["LOVABLE_API_KEY"];
	if (!apiKey) throw new Error("AI is not configured");
	const provider = createOpenAI({
		baseURL: "https://ai.gateway.lovable.dev/v1",
		apiKey,
		headers: {
			"Lovable-API-Key": apiKey,
			"X-Lovable-AIG-SDK": "vercel-ai-sdk"
		}
	});
	return (await streamText({
		model: provider.responses("openai/gpt-6-astra"),
		maxRetries: 0,
		system: "You are a battle tactician in a turn-based dark-fantasy RPG. Damage = atk*skill% reduced by def (100/(100+def*0.9)); crit doubles damage; dodge avoids hits. The hero has 2 potions (heal 35% HP). Give a verdict (win likely / risky / avoid) and 3-4 short bullet steps naming the hero's exact skills in order. Under 90 words, no headings.",
		prompt: JSON.stringify(input),
		providerOptions: { openai: {
			store: false,
			forceReasoning: true,
			reasoningEffort: "low",
			reasoningSummary: "auto",
			include: ["reasoning.encrypted_content"]
		} }
	}).text).slice(0, 800);
}
var adviseStrategy_createServerFn_handler = createServerRpc({
	id: "137c50ff3b98693823ea37ece243d7fd170720cf0ccaddea5f8c7dec3a1768da",
	name: "adviseStrategy",
	filename: "src/lib/quests.functions.ts"
}, (opts) => adviseStrategy.__executeServer(opts));
var adviseStrategy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((i) => ({
	heroClass: String(i.heroClass).slice(0, 20),
	level: Number(i.level) || 1,
	hero: Object.fromEntries(Object.entries(i.hero ?? {}).slice(0, 8).map(([k, v]) => [k.slice(0, 12), Number(v) || 0])),
	enemy: Object.fromEntries(Object.entries(i.enemy ?? {}).slice(0, 10).map(([k, v]) => [k.slice(0, 12), typeof v === "string" ? v.slice(0, 40) : v])),
	skills: (i.skills ?? []).slice(0, 5).map((s) => String(s).slice(0, 60))
})).handler(adviseStrategy_createServerFn_handler, async ({ data }) => {
	try {
		return {
			advice: await adviseStrategyWithAI(data),
			error: null
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : "";
		console.error("strategy failed", msg);
		return {
			advice: "",
			error: msg.includes("402") ? "Out of AI credits" : msg.includes("429") ? "Tactician busy, try again shortly" : "The tactician is silent, try again"
		};
	}
});
//#endregion
export { adviseStrategy_createServerFn_handler };

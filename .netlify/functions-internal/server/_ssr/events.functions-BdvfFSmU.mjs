import { l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as createServerRpc } from "./createServerRpc-DSPYtqIT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CMevzYJH.mjs";
import { p as WORLD_EVENTS, x as liveOccurrence, y as eventEncounter } from "./event-encounters-DqmSw5cH.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events.functions-BdvfFSmU.js
var confirmEventEntry_createServerFn_handler = createServerRpc({
	id: "f6d3626eac7961bb67133ad1a98c68433af0a4abbe0c2f114a4980c35d7f1b65",
	name: "confirmEventEntry",
	filename: "src/game/events.functions.ts"
}, (opts) => confirmEventEntry.__executeServer(opts));
var confirmEventEntry = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ eventId: stringType() }).parse(input)).handler(confirmEventEntry_createServerFn_handler, async ({ data }) => {
	const event = WORLD_EVENTS.find((e) => e.id === data.eventId);
	if (!event) throw new Error("Unknown event");
	const startedAt = liveOccurrence(event, Date.now());
	return {
		startedAt,
		foe: eventEncounter(event, startedAt)
	};
});
//#endregion
export { confirmEventEntry_createServerFn_handler };

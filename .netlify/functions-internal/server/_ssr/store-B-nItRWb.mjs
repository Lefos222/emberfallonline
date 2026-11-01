import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BP2Q-OrU.mjs";
import { Bt as normalizeHero, Tt as heroStats, zt as newHero } from "./data-B5DVZuux.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-B-nItRWb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var state = {
	hero: null,
	heroId: null,
	gender: "male",
	userId: null,
	email: null,
	authReady: false,
	chars: null,
	charsError: null,
	cloud: "off"
};
var listeners = /* @__PURE__ */ new Set();
var LAST = "ef-last-char";
var COLS = "id,name,hero_class,gender,level,power,arena_rating,last_played,bio,title,frame,is_public,stats";
function set(p) {
	state = {
		...state,
		...p
	};
	listeners.forEach((l) => l());
}
var saveTimer;
var saveInFlight = null;
var serverOperation = false;
var needsServerReload = false;
async function performSave() {
	if (needsServerReload) return false;
	const h = state.hero;
	const id = state.heroId;
	if (!state.userId || !h || !id) return false;
	set({ cloud: "saving" });
	const s = heroStats(h);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { error } = await supabase.from("heroes").update({
		level: h.level,
		power: s.power,
		stats: {
			...s,
			paragon: h.paragon
		},
		save: h,
		updated_at: now,
		last_played: now
	}).eq("id", id);
	if (state.heroId === id) set({ cloud: error ? "error" : "saved" });
	return !error;
}
async function pushCloud() {
	const previous = saveInFlight;
	const pending = (async () => {
		if (previous) await previous;
		return performSave();
	})();
	saveInFlight = pending;
	try {
		return await pending;
	} finally {
		if (saveInFlight === pending) saveInFlight = null;
	}
}
function flushSave() {
	clearTimeout(saveTimer);
	return pushCloud();
}
/** Serialize valuable RPCs with cloud writes; never overwrite their returned save with an old draft. */
async function withServerHero(action) {
	if (serverOperation) throw new Error("Another reward request is still pending.");
	const id = state.heroId;
	if (!id || !state.hero || !state.userId) throw new Error("Select a character first.");
	serverOperation = true;
	clearTimeout(saveTimer);
	let requested = false;
	try {
		if (needsServerReload) await reloadServerHero(id);
		if (!await flushSave()) throw new Error("Your save could not be synced. Please retry before claiming rewards.");
		requested = true;
		return await action(id);
	} catch (error) {
		if (requested) {
			needsServerReload = true;
			try {
				await reloadServerHero(id);
			} catch {
				set({ cloud: "error" });
			}
		}
		throw error;
	} finally {
		serverOperation = false;
	}
}
async function reloadServerHero(id) {
	const { data, error } = await supabase.from("heroes").select("save").eq("id", id).single();
	if (error || !data) throw new Error("Reconnect to the game server before continuing.");
	const hero = data.save;
	if (!hero?.name || !Array.isArray(hero.inventory)) throw new Error("Your save could not be read.");
	adoptServerSave(id, hero);
}
function adoptServerSave(id, hero) {
	if (state.heroId !== id) throw new Error("Your active character changed. Reopen the character to see the reward.");
	clearTimeout(saveTimer);
	needsServerReload = false;
	set({
		hero: normalizeHero(hero),
		cloud: "saved"
	});
}
async function loadCharacters() {
	if (!state.userId) return;
	set({
		chars: null,
		charsError: null
	});
	const { data, error } = await supabase.from("heroes").select(COLS).eq("user_id", state.userId).order("last_played", { ascending: false });
	if (error) {
		set({
			charsError: error.message,
			chars: []
		});
		return;
	}
	set({ chars: data ?? [] });
}
var authEventSeen = false;
/**
* Adopt the signed-in account. "event" results come from the auth stream and are authoritative;
* "lookup" results come from a one-off getUser() and must never drop a session the stream already
* delivered — that race is what bounced people back to the sign-in page after Google/Lovable.
*/
async function setUser(userId, email, source = "event") {
	if (source === "event") authEventSeen = true;
	else if (authEventSeen) return;
	if (source === "lookup" && !userId && state.userId) return;
	if (userId === state.userId && state.authReady) return;
	set({
		userId,
		email,
		authReady: true,
		hero: null,
		heroId: null,
		chars: null,
		cloud: userId ? "loading" : "off"
	});
	if (userId) await loadCharacters();
}
async function selectCharacter(id) {
	if (serverOperation) return "Wait for the current reward request to finish.";
	set({ cloud: "loading" });
	const { data, error } = await supabase.from("heroes").select("save,gender").eq("id", id).maybeSingle();
	if (error || !data) {
		set({ cloud: "error" });
		return error?.message ?? "Character not found";
	}
	const hero = data.save;
	if (hero?.name) normalizeHero(hero);
	if (!hero?.name) {
		set({ cloud: "error" });
		return "Save data is corrupted";
	}
	localStorage.setItem(LAST, id);
	needsServerReload = false;
	set({
		hero,
		heroId: id,
		gender: data.gender ?? "male",
		cloud: "saved"
	});
	supabase.from("heroes").update({ last_played: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
	return null;
}
async function createCharacter(name, cls, gender) {
	if (!state.userId) return "Not signed in";
	const hero = newHero(name, cls);
	const s = heroStats(hero);
	const { data, error } = await supabase.from("heroes").insert({
		user_id: state.userId,
		name,
		hero_class: cls,
		gender,
		level: 1,
		power: s.power,
		stats: {
			...s,
			paragon: 0
		},
		save: hero
	}).select("id").single();
	if (error) {
		if (error.code === "23505") return "That name is already taken";
		if (error.code === "42501") return "You can have at most 4 characters";
		if (error.code === "23514") return "Name must be 3–18 letters, numbers, spaces, - or _";
		return error.message;
	}
	await loadCharacters();
	return selectCharacter(data.id);
}
async function deleteCharacter(id) {
	const { error } = await supabase.from("heroes").delete().eq("id", id);
	if (error) return error.message;
	if (localStorage.getItem(LAST) === id) localStorage.removeItem(LAST);
	await loadCharacters();
	return null;
}
async function updateProfile(p) {
	if (!state.heroId) return "No character";
	const { error } = await supabase.from("heroes").update(p).eq("id", state.heroId);
	if (error) return error.message;
	await loadCharacters();
	return null;
}
async function leaveCharacter() {
	if (serverOperation) return false;
	if (needsServerReload && state.heroId) await reloadServerHero(state.heroId);
	await flushSave();
	set({
		hero: null,
		heroId: null
	});
	await loadCharacters();
	return true;
}
function lastCharacterId() {
	return typeof window === "undefined" ? null : localStorage.getItem(LAST);
}
/** True while an OAuth handoff is still landing (tokens in the URL that supabase-js hasn't adopted yet). */
function authHandoffPending() {
	if (typeof window === "undefined") return false;
	const hash = window.location.hash;
	if (/access_token|id_token|error_description|type=recovery/.test(hash)) return true;
	const q = new URLSearchParams(window.location.search);
	return q.has("code") || q.has("state") && q.has("session_id");
}
function setHero(h) {
	set({ hero: h });
	if (state.userId && h) {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(pushCloud, 1500);
	}
}
/** Mutate the hero with a draft function (works on a deep copy). */
function update(fn) {
	if (!state.hero || serverOperation || needsServerReload) return;
	const h = structuredClone(state.hero);
	fn(h);
	setHero(h);
}
function getState() {
	return state;
}
function useGame() {
	return (0, import_react.useSyncExternalStore)((l) => {
		listeners.add(l);
		return () => listeners.delete(l);
	}, () => state, () => state);
}
//#endregion
export { getState as a, loadCharacters as c, update as d, updateProfile as f, deleteCharacter as i, selectCharacter as l, withServerHero as m, authHandoffPending as n, lastCharacterId as o, useGame as p, createCharacter as r, leaveCharacter as s, adoptServerSave as t, setUser as u };

import { O as SKILLS, on as stageFoe } from "./data-B5DVZuux.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/event-encounters-DqmSw5cH.js
var H = 36e5;
var D = 24 * H;
/** Ember Fall runs on the Greek clock: every window opens on a Europe/Athens wall-clock hour. */
var GAME_TZ = "Europe/Athens";
/** Milliseconds Europe/Athens is ahead of UTC at an instant (summer time included). */
function greekOffsetMs(ts, tz = GAME_TZ) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: tz,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	}).formatToParts(new Date(ts));
	const at = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
	return Date.UTC(at("year"), at("month") - 1, at("day"), at("hour") % 24, at("minute"), at("second")) - Math.floor(ts / 1e3) * 1e3;
}
/** Epoch ms of the most recent Greek midnight at or before an instant. */
function greekDayStart(ts) {
	return ts - ((ts + greekOffsetMs(ts)) % D + D) % D;
}
var WORLD_EVENTS = [
	{
		id: "world-boss",
		name: "Emberfall World Boss",
		kind: "boss",
		everyMs: 2 * H,
		anchor: Date.UTC(2026, 0, 1, 0, 0, 0),
		greekHour: 0,
		durationMs: 27e5,
		blurb: "A different tyrant invades every two hours. Defeat it during the invasion window.",
		reward: "Rare+ weapons or jewelry, Boss Cores, crafting materials, gold and experience",
		stage: 40
	},
	{
		id: "timed-dungeon",
		name: "Timed Dungeon",
		kind: "dungeon",
		everyMs: 6 * H,
		anchor: Date.UTC(2026, 0, 1, 2, 0, 0),
		greekHour: 2,
		durationMs: 18e5,
		blurb: "A short, sharp dungeon run with upgraded drops while the gate holds.",
		reward: "Dungeon loot, gold and experience",
		stage: 28
	},
	{
		id: "caravan",
		name: "Treasure Caravan",
		kind: "caravan",
		everyMs: 2 * H,
		anchor: Date.UTC(2026, 0, 1, 1, 0, 0),
		greekHour: 1,
		durationMs: 9e5,
		blurb: "A guarded caravan crosses the road; escort it to claim the cargo.",
		reward: "Gold, crafting materials and a loot roll",
		stage: 14
	},
	{
		id: "harvest-season",
		name: "Harvest Season",
		kind: "season",
		everyMs: 7 * D,
		anchor: Date.UTC(2026, 0, 5, 0, 0, 0),
		durationMs: 2 * D,
		blurb: "A weekly two-day hunt for the season's champion.",
		reward: "Seasonal encounter loot, gold and experience",
		stage: 60
	}
];
/** Start of the occurrence that contains, or precedes, an instant. Events shorter than a day are
*  pinned to Greek midnight so they open on round Greek hours all year; longer ones keep a fixed grid. */
function occurrenceStart(ev, now) {
	if (ev.everyMs >= 864e5) {
		if (now < ev.anchor) return ev.anchor;
		return ev.anchor + Math.floor((now - ev.anchor) / ev.everyMs) * ev.everyMs;
	}
	const base = greekDayStart(now) + (ev.greekHour ?? 0) * H;
	return base + Math.floor((now - base) / ev.everyMs) * ev.everyMs;
}
/** Which occurrence is happening now, or when the next one opens. */
function statusOf(now, ev) {
	const startedAt = occurrenceStart(ev, now);
	const endsAt = startedAt + ev.durationMs;
	if (now >= startedAt && now < endsAt) return {
		state: "live",
		startedAt,
		endsAt,
		msLeft: endsAt - now
	};
	const startsAt = startedAt + ev.everyMs;
	return {
		state: "upcoming",
		startsAt,
		msLeft: startsAt - now
	};
}
/** "2h 04m 13s" / "3d 04h 05m" — never negative. */
function countdown(ms) {
	const t = Math.max(0, Math.floor(ms / 1e3));
	const d = Math.floor(t / 86400);
	const h = Math.floor(t % 86400 / 3600);
	const m = Math.floor(t % 3600 / 60);
	const s = t % 60;
	const p = (n) => String(n).padStart(2, "0");
	if (d > 0) return `${d}d ${p(h)}h ${p(m)}m`;
	if (h > 0) return `${h}h ${p(m)}m ${p(s)}s`;
	return `${m}m ${p(s)}s`;
}
/** The viewer's own zone, e.g. "Europe/Paris (UTC+02:00)". */
function zoneLabel(now = Date.now()) {
	let zone = "UTC";
	try {
		zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		zone = "UTC";
	}
	const off = -new Date(now).getTimezoneOffset();
	const sign = off < 0 ? "-" : "+";
	const a = Math.abs(off);
	return `${zone} (UTC${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")})`;
}
/** Format an instant for a named zone; pass undefined for the viewer's own zone. */
function timeIn(ts, tz) {
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
		...tz && tz !== "local" ? { timeZone: tz } : {}
	}).format(new Date(ts));
}
var TZ_CHOICES = [
	GAME_TZ,
	"local",
	"UTC",
	"Europe/London",
	"Europe/Paris",
	"America/New_York",
	"Asia/Tokyo",
	"Australia/Sydney"
];
/** How far ahead of an opening a reminder fires. */
var REMIND_LEAD_MS = 3e5;
/** True while the next opening is inside the lead window and the event is not already running. */
function reminderDue(now, ev, lead = REMIND_LEAD_MS) {
	const s = statusOf(now, ev);
	return s.state === "upcoming" && s.msLeft <= lead;
}
var enemies_jpg_asset_default = {
	version: 1,
	asset_id: "e28838ff-1960-4e46-a0cb-20d55669aef1",
	project_id: "0f299f2d-878f-49ca-a474-e222b4b4c5ed",
	url: "/__l5e/assets-v1/e28838ff-1960-4e46-a0cb-20d55669aef1/enemies.jpg",
	r2_key: "a/v1/0f299f2d-878f-49ca-a474-e222b4b4c5ed/e28838ff-1960-4e46-a0cb-20d55669aef1/enemies.jpg",
	original_filename: "enemies.jpg",
	size: 359688,
	content_type: "image/jpeg",
	created_at: "2026-10-18T08:06:18Z"
};
var bosses_jpg_asset_default = {
	version: 1,
	asset_id: "d20f6162-40d6-4815-bd5b-baa322ccdc7e",
	project_id: "0f299f2d-878f-49ca-a474-e222b4b4c5ed",
	url: "/__l5e/assets-v1/d20f6162-40d6-4815-bd5b-baa322ccdc7e/bosses.jpg",
	r2_key: "a/v1/0f299f2d-878f-49ca-a474-e222b4b4c5ed/d20f6162-40d6-4815-bd5b-baa322ccdc7e/bosses.jpg",
	original_filename: "bosses.jpg",
	size: 344969,
	content_type: "image/jpeg",
	created_at: "2026-10-18T08:06:15Z"
};
var SHEET_W = 1920;
var SHEET_H = 1072;
var B_X = (c) => 88 + c * 147.6;
var B_Y = [
	150,
	330,
	512,
	693,
	873
];
var BESTIARY = [
	[
		"Goblin Scout",
		"Goblin Raider",
		"Dire Wolf",
		"Venom Spider",
		"Bandit",
		"Shadow Imp",
		"Bandit Chief",
		"Giant Slime",
		"Slime Brood",
		"Corrupted Treant",
		"Elder Treant",
		"Ancient Treant"
	],
	[
		"Skeleton",
		"Ghoul",
		"Ghoul Pack",
		"Ghost",
		"Banshee",
		"Skeleton Warrior",
		"Wailing Banshee",
		"Zombie Warrior",
		"Zombie Horde",
		"Plague Zombies",
		"Rotting Zombies",
		"Zombie Champion"
	],
	[
		"Gargoyle",
		"Stone Golem",
		"Bronze Golem",
		"Harpy",
		"Centaur",
		"Centaur Warlord",
		"Lava Hound",
		"Frost-fire Hound",
		"Fire Hound",
		"Hellhound",
		"Ice Troll",
		"Frost Troll"
	],
	[
		"Succubus",
		"Shadow Assassin",
		"Void Lurker",
		"Horned Fiend",
		"Horned Brute",
		"Chaos Mage",
		"Chaos Sorcerer",
		"Demon Mage",
		"Demon Knight",
		"Demon Warlock",
		"Chaos Archon",
		"Chaos Hierarch"
	],
	[
		"Death Knight",
		"Chimera",
		"Behemoth",
		"Stone Behemoth",
		"Giant Dragon",
		"Frost Dragon",
		"Ember Dragon",
		"Demon Lord",
		"Demon Overlord",
		"Infernal Lord",
		"Demon Warlords",
		"Abyssal Dragon"
	]
];
var enemySprite = (row, col) => ({
	url: enemies_jpg_asset_default.url,
	x: B_X(col),
	y: B_Y[row],
	w: 120,
	h: 126
});
var bossSprite = (row, col) => ({
	url: bosses_jpg_asset_default.url,
	x: 65 + col * 122,
	y: 213 + row * 149,
	w: 100,
	h: 108
});
var TIER_BOSSES = {
	aegis: {
		name: "Aegis, the Iron Overlord",
		sprite: {
			url: bosses_jpg_asset_default.url,
			x: 1050,
			y: 190,
			w: 330,
			h: 330
		}
	},
	gorefiend: {
		name: "Gorefiend, the Blood Lord",
		sprite: {
			url: bosses_jpg_asset_default.url,
			x: 1420,
			y: 185,
			w: 440,
			h: 340
		}
	},
	tenebris: {
		name: "Tenebris, the Void Empress",
		sprite: {
			url: bosses_jpg_asset_default.url,
			x: 940,
			y: 625,
			w: 520,
			h: 300
		}
	},
	vulkan: {
		name: "Vulkan, the Ember Titan",
		sprite: {
			url: bosses_jpg_asset_default.url,
			x: 1450,
			y: 625,
			w: 420,
			h: 300
		}
	}
};
var REGIONS = [
	{
		id: "wilds",
		name: "Goblin Wilds",
		row: 0,
		level: 1,
		color: "var(--r1)",
		boss: {
			name: "Soul Harvester",
			sprite: bossSprite(0, 2),
			ability: "Drains life each hit"
		},
		path: [
			[6, 80],
			[14, 74],
			[22, 71],
			[30, 68],
			[37, 63]
		]
	},
	{
		id: "barrows",
		name: "Haunted Barrows",
		row: 1,
		level: 10,
		color: "var(--xp)",
		boss: {
			name: "Death Knight Malgor",
			sprite: bossSprite(0, 4),
			ability: "Heavy armor"
		},
		path: [
			[37, 60],
			[33, 50],
			[28, 43],
			[25, 34],
			[30, 27]
		]
	},
	{
		id: "peaks",
		name: "Molten Peaks",
		row: 2,
		level: 20,
		color: "var(--r4)",
		boss: {
			name: "Fire Titan",
			sprite: bossSprite(0, 3),
			ability: "Crushing blows"
		},
		path: [
			[40, 52],
			[47, 48],
			[53, 44],
			[58, 40],
			[62, 47]
		]
	},
	{
		id: "wastes",
		name: "Demon Wastes",
		row: 3,
		level: 30,
		color: "var(--r3)",
		boss: {
			name: "Abyssal Lord",
			sprite: bossSprite(0, 0),
			ability: "Chaotic critical strikes"
		},
		path: [
			[66, 54],
			[72, 60],
			[79, 52],
			[84, 44],
			[80, 36]
		]
	},
	{
		id: "throne",
		name: "Dragon Throne",
		row: 4,
		level: 40,
		color: "var(--r5)",
		boss: {
			name: "Void Dragon",
			sprite: bossSprite(0, 1),
			ability: "Breath of the void"
		},
		path: [
			[78, 30],
			[82, 26],
			[86, 22],
			[89, 18],
			[92, 14]
		]
	}
];
var CAMPAIGN_STAGES = REGIONS.length * 10;
REGIONS.flatMap((r, i) => {
	const first = i * 10 + 1;
	const g = Math.pow(1.09, first);
	return [{
		id: `${r.id}-elite`,
		region: r.id,
		name: `Elite of ${r.name}`,
		desc: `Defeat the elite at stage ${first + 4}.`,
		done: (h) => h.stage > first + 4,
		reward: {
			gold: Math.round(150 * g),
			xp: Math.round(120 * g)
		}
	}, {
		id: `${r.id}-boss`,
		region: r.id,
		name: `Slay ${r.boss.name}`,
		desc: `Defeat the boss of ${r.name} (stage ${first + 9}).`,
		done: (h) => h.stage > first + 9,
		reward: {
			gold: Math.round(400 * g),
			xp: Math.round(300 * g),
			item: 3
		}
	}];
});
var DUNGEONS = [
	{
		id: "aegis",
		level: 15,
		mult: 1.15,
		ability: "Iron Guard: very high defense",
		desc: "The Iron Overlord's fortress vault."
	},
	{
		id: "gorefiend",
		level: 30,
		mult: 1.3,
		ability: "Blood Rage: hits harder",
		desc: "A crimson pit beneath the Demon Wastes."
	},
	{
		id: "tenebris",
		level: 45,
		mult: 1.45,
		ability: "Void Veil: high evasion",
		desc: "The Void Empress's shattered sanctum."
	},
	{
		id: "vulkan",
		level: 60,
		mult: 1.6,
		ability: "Ember Core: massive health",
		desc: "The molten heart of the Ember Titan."
	}
];
function dungeonFoe(d, heroLevel, extra = 1) {
	const lvl = Math.max(d.level, heroLevel);
	const base = stageFoe(Math.round(lvl * .95), d.mult * extra);
	const b = TIER_BOSSES[d.id];
	const tweak = d.id === "aegis" ? { def: base.def * 1.8 } : d.id === "gorefiend" ? { atk: Math.round(base.atk * 1.25) } : d.id === "tenebris" ? { dodge: base.dodge + 12 } : { hp: Math.round(base.hp * 1.5) };
	return {
		...base,
		...tweak,
		name: b.name,
		level: lvl,
		boss: true,
		sprite: b.sprite
	};
}
var ANC_STEPS = [
	{
		title: "Whispers of the Ancestors",
		desc: `Reach level 80 and clear Molten Peaks (stage 30) to hear the Sanctuary's call.`,
		kind: "unlock"
	},
	{
		title: "Relics of the Ancients",
		desc: `Recover 5 Ancestral Relics. Campaign bosses and dungeon bosses have a chance to drop them.`,
		kind: "relics"
	},
	{
		title: "Trial of Iron",
		desc: "Defeat the Ancestral echo of Aegis, the Iron Overlord.",
		kind: "boss",
		boss: "aegis",
		mult: 1.5
	},
	{
		title: "Trial of the Void",
		desc: "Defeat the Ancestral echo of Tenebris, the Void Empress.",
		kind: "boss",
		boss: "tenebris",
		mult: 1.6
	},
	{
		title: "Judgment of Embers",
		desc: "Defeat the Ancestral echo of Vulkan, the Ember Titan, to claim your heritage.",
		kind: "boss",
		boss: "vulkan",
		mult: 1.75
	}
];
var ancState = (h) => h.anc ?? {
	step: 0,
	relics: 0,
	done: false
};
var canBeginAncestral = (h) => h.level + h.paragon >= 80 && h.stage > 30;
var abilities = [
	"cleave",
	"nova",
	"meteor",
	"bolt",
	"rage"
];
var ENEMY_ROSTER = BESTIARY.flatMap((row, r) => row.map((name, c) => ({
	id: `enemy-${r}-${c}`,
	name,
	kind: "enemy",
	tier: r + 1,
	levelBand: [r * 10 + 1, r * 10 + 10],
	cell: `enemies:${r}:${c}`,
	sprite: enemySprite(r, c),
	signatureAbilityId: abilities[r]
})));
/** Visual audit of the original 1920×1072 sheet, zero-based row/column.
* Six visible rows, not five; row 5 is clipped by the painted UI at y=1037.
* Repeated labels are NOT repeated designs. Only the following two portraits repeat.
* The seven clipped row-5 portraits are distinct, usable head portraits (not full bodies).
* No visible cells are empty. There are no additional hidden/scrollable image pixels.
*/
var BOSS_ART_AUDIT = {
	duplicates: [{
		cell: "bosses:4:5",
		sameAs: "bosses:1:5"
	}, {
		cell: "bosses:4:6",
		sameAs: "bosses:1:6"
	}],
	empty: [],
	clipped: Array.from({ length: 7 }, (_, c) => `bosses:5:${c}`),
	missingForFifty: 6
};
var BOSS_ROSTER = [
	[
		"Abyssal Lord",
		"Void Dragon",
		"Soul Harvester",
		"Fire Titan",
		"Death Knight Malgor",
		"Ashen Sentinel",
		"Tenebre"
	],
	[
		"Obsidian Wyrm",
		"Spectral King",
		"Dusk Wyrm",
		"Cinder Drake",
		"Ironcrest Dragon",
		"Frostguard",
		"Ice Behemoth"
	],
	[
		"Flame Sovereign",
		"Violet Regent",
		"Horned Matriarch",
		"Soul Dragon",
		"Pale Executioner",
		"Gilded Warden",
		"Azure Reaper"
	],
	[
		"Furnace Tyrant",
		"Drowned Revenant",
		"Void Titan",
		"Thorn Harvester",
		"Crimson Wyrm",
		"Sunless Knight",
		"Storm Dragon"
	],
	[
		"Alenhs",
		"Antlered Oracle",
		"Dregon",
		"Viwck Roua",
		"Ember Maw",
		"Frostguard",
		"Ice Behemoth"
	],
	[
		"Bone Sovereign",
		"Amethyst Terror",
		"Scarlet Devourer",
		"Glacial Oracle",
		"Grizzled Warlord",
		"Golden Infernal",
		"Redfang Fiend"
	]
].flatMap((row, r) => row.flatMap((name, c) => {
	const cell = `bosses:${r}:${c}`;
	if (BOSS_ART_AUDIT.duplicates.some((d) => d.cell === cell)) return [];
	return [{
		id: `boss-${r}-${c}`,
		name,
		kind: "boss",
		tier: Math.min(5, r + 1),
		levelBand: [r * 10 + 1, r * 10 + 10],
		cell,
		sprite: r === 5 ? {
			...bossSprite(r, c),
			h: 79
		} : bossSprite(r, c),
		signatureAbilityId: abilities[r % abilities.length]
	}];
})).concat(Object.entries(TIER_BOSSES).map(([id, boss], i) => ({
	id: `boss-${id}`,
	name: boss.name,
	kind: "boss",
	tier: i + 2,
	levelBand: [(i + 1) * 15, (i + 1) * 15 + 14],
	cell: `bosses:featured:${id}`,
	sprite: boss.sprite,
	signatureAbilityId: abilities[i]
})));
var ROSTER = [...ENEMY_ROSTER, ...BOSS_ROSTER];
function validateRoster(entries) {
	const ids = /* @__PURE__ */ new Set(), names = /* @__PURE__ */ new Set(), cells = /* @__PURE__ */ new Set(), rects = /* @__PURE__ */ new Set();
	for (const e of entries) {
		const s = e.sprite, rect = `${s.url}:${s.x}:${s.y}:${s.w}:${s.h}`;
		if (ids.has(e.id) || names.has(e.name) || cells.has(e.cell) || rects.has(rect)) throw new Error(`Duplicate roster identity: ${e.id}`);
		if (![
			s.x,
			s.y,
			s.w,
			s.h
		].every(Number.isFinite) || s.x < 0 || s.y < 0 || s.w <= 0 || s.h <= 0 || s.x + s.w > 1920 || s.y + s.h > 1072) throw new Error(`Invalid sprite: ${e.id}`);
		ids.add(e.id);
		names.add(e.name);
		cells.add(e.cell);
		rects.add(rect);
	}
}
validateRoster(ROSTER);
var ROSTER_BY_ID = Object.fromEntries(ROSTER.map((e) => [e.id, e]));
ENEMY_ROSTER.map((e) => e.id), ENEMY_ROSTER.map((e) => e.id), BOSS_ROSTER.map((e) => e.id), ROSTER.map((e) => e.id);
/** A stored zero is an explicit sighting; absent keys never imply a sighting or a defeat.
* Call only from the authoritative save transaction, once per resolved encounter.
*/
function recordRosterEncounter(h, id, defeated) {
	if (!ROSTER_BY_ID[id]) throw new Error(`Unknown roster ID: ${id}`);
	const previous = h.kills?.[id] ?? 0;
	h.kills = {
		...h.kills,
		[id]: previous + (defeated ? 1 : 0)
	};
}
function rosterProgress(h, id) {
	const count = h.kills?.[id];
	if (count === void 0 || !Number.isSafeInteger(count) || count < 0) return {
		state: "undiscovered",
		count: void 0
	};
	return {
		state: count > 0 ? "defeated" : "seen",
		count
	};
}
/** Rotation is tied to the shared occurrence, never the viewer's gear or a random render. */
function eventEncounter(ev, startedAt) {
	const cycle = Math.max(0, Math.floor((startedAt - ev.anchor) / ev.everyMs));
	const roster = ev.kind === "boss" || ev.kind === "season" ? BOSS_ROSTER : ENEMY_ROSTER;
	const entry = roster[cycle % roster.length];
	if (!entry) throw new Error("Encounter roster unavailable");
	return {
		...stageFoe(ev.stage, ev.kind === "boss" ? 1.25 : 1),
		name: entry.name,
		sprite: entry.sprite,
		boss: ev.kind === "boss" || ev.kind === "season",
		rosterId: entry.id,
		skills: Object.values(SKILLS).flat().filter((s) => s.id === entry.signatureAbilityId)
	};
}
function liveOccurrence(ev, now) {
	const status = statusOf(now, ev);
	if (status.state !== "live") throw new Error("This event is not open. Wait for its next opening.");
	return status.startedAt;
}
//#endregion
export { reminderDue as C, zoneLabel as D, timeIn as E, recordRosterEncounter as S, statusOf as T, dungeonFoe as _, DUNGEONS as a, greekDayStart as b, ROSTER as c, TIER_BOSSES as d, TZ_CHOICES as f, countdown as g, canBeginAncestral as h, CAMPAIGN_STAGES as i, SHEET_H as l, ancState as m, BESTIARY as n, ENEMY_ROSTER as o, WORLD_EVENTS as p, BOSS_ROSTER as r, GAME_TZ as s, ANC_STEPS as t, SHEET_W as u, enemySprite as v, rosterProgress as w, liveOccurrence as x, eventEncounter as y };

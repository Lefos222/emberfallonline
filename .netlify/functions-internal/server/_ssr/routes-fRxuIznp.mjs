import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BP2Q-OrU.mjs";
import { $ as craft, $t as scaledGold, A as STAT_LABEL, At as isClaimable, B as astralUpgradeCost, C as MATS, Ct as guildSkillRank, D as SET_BONUSES, Dt as insertGem, E as REFINE, Et as iconRect, F as achProgress, Ft as makeAncestral, G as barracksLevel, Gt as recipeGold, H as attrCost, Ht as posOf, I as activeSets, It as makeItem, J as buyGuildShopItem, Jt as recordEnhance, K as batchSizes, Kt as recipeMats, L as addMats, Lt as matCount, M as WEAR_LABEL, Mt as itemStats, N as WEAR_SLOTS, Nt as learnBlocker, O as SKILLS, Ot as invCap, P as absorbAstral, Pt as learnGuildSkill, Q as contributeGold, Qt as rollRarity, R as astralLabel, Rt as matsLine, S as GUILD_SKILLS, St as guildSkillCost, T as RECIPES, Tt as heroStats, U as bagRowCost, Ut as powerBreakdown, V as astralValue, Vt as parseGem, W as barracksCost, Wt as rankCost, X as calcDamage, Xt as removeGem, Y as buyPrice, Yt as refine, Z as canEnterConquest, Zt as resetCost, _ as GEMS, _n as xpToNext, _t as gemCutCost, a as ASTRAL_MILESTONES, an as spentIn, at as drillText, b as GUILD_CONTRIB_MIN, bt as gemValue, c as ASTRAL_SLOT_LEVELS, cn as summonAstral, ct as enchantStoneCost, d as BARRACKS_UNLOCKS, dn as trainingDiscount, dt as enhanceStoneChance, en as scrapItem, et as craftBlocker, f as BUILDINGS, fn as unequipItem, ft as equipAstral, g as ENEMIES, gn as wornCompare, gt as fuseGem, h as DRILLS, hn as wearOf, ht as fuseCost, i as ASTRAL_COLORS, in as sockets, it as drillRank, j as TREES, jt as itemScore, k as SLOTS, kt as isArmor, l as ATLAS_H, ln as totalPoints, lt as enhanceChance, m as CLASSES, mn as upgradeBarracks, mt as freePoints, n as ANCESTRAL_RECIPES, nn as sellValue, nt as drillBlocker, o as ASTRAL_ODDS, on as stageFoe, ot as earnedTitles, p as CASTLE_BUILDINGS, pn as upgradeAstral, pt as equipItem, q as battleMats, qt as recordBattle, r as ASTRAL_BASES, rn as socketCount, rt as drillCost, s as ASTRAL_RARITY, sn as stageRewards, st as emptyRecord, t as ACHIEVEMENTS, tn as scrapYield, tt as cutGem, u as ATLAS_W, un as trainDrill, ut as enhanceCost, v as GEM_TIER_NAMES, vn as zoneOf, vt as gemKey, w as RARITIES, wt as heroSkills, x as GUILD_SHOP, xt as guildSkillBlocker, y as GEM_TYPES, yt as gemName, z as astralStatText } from "./data-B5DVZuux.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as getState, c as loadCharacters, d as update, f as updateProfile, i as deleteCharacter, l as selectCharacter, m as withServerHero, n as authHandoffPending, o as lastCharacterId, p as useGame, r as createCharacter, s as leaveCharacter, t as adoptServerSave } from "./store-B-nItRWb.mjs";
import { W as isRedirect, b as useNavigate, x as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as castle_jpg_asset_default } from "./castle.jpg.asset-BJsU75Uc.mjs";
import { $ as ArrowUp, A as Heart, B as Crosshair, C as Play, D as Lock, E as LogOut, F as Gavel, G as CircleUser, H as Clover, I as FastForward, J as CalendarDays, K as Check, L as Eye, M as Hammer, N as Gift, O as LoaderCircle, P as Gem, Q as Backpack, S as Plus, T as Mail, U as Cloud, V as Coins, W as CloudOff, X as Bell, Y as BookOpen, Z as BellOff, _ as ShieldCheck, a as VolumeX, b as RotateCcw, c as UserPlus, d as Swords, et as ArrowLeft, f as Sword, g as Shield, h as Skull, i as WandSparkles, j as HeartPulse, k as IdCard, l as Trophy, m as Sparkles, n as X, o as Volume2, p as Star, q as Calendar, r as Wind, s as Users, t as Zap, tt as Anvil, u as Trash2, v as Send, w as Package, x as RefreshCw, y as ScrollText, z as Crown } from "../_libs/lucide-react.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CMevzYJH.mjs";
import { C as reminderDue, D as zoneLabel, E as timeIn, S as recordRosterEncounter, T as statusOf, _ as dungeonFoe, a as DUNGEONS, b as greekDayStart, c as ROSTER, d as TIER_BOSSES, f as TZ_CHOICES, g as countdown, h as canBeginAncestral, i as CAMPAIGN_STAGES, l as SHEET_H, m as ancState, n as BESTIARY, o as ENEMY_ROSTER, p as WORLD_EVENTS, r as BOSS_ROSTER, s as GAME_TZ, t as ANC_STEPS, u as SHEET_W, v as enemySprite, w as rosterProgress, y as eventEncounter } from "./event-encounters-DqmSw5cH.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-CLpI6Gb3.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-fRxuIznp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
/** Grant xp & gold; handles level ups up to 80 then endless Ascension (paragon) levels. */
function grant(h, xp, gold) {
	h.gold += gold;
	h.xp += xp;
	let levels = 0;
	while (h.xp >= xpToNext(h)) {
		h.xp -= xpToNext(h);
		if (h.level < 80) h.level++;
		else h.paragon++;
		levels++;
		h.insight = (h.insight ?? 0) + 1;
	}
	return { levels };
}
function addLoot(h, item) {
	if (h.inventory.length >= invCap(h)) {
		h.overflow = [item, ...h.overflow ?? []];
		return false;
	}
	h.inventory.unshift(item);
	return true;
}
/** Move overflow items into the bag while space remains. Returns how many moved. */
function claimOverflow(h) {
	let n = 0;
	while ((h.overflow?.length ?? 0) > 0 && h.inventory.length < invCap(h)) {
		const item = h.overflow?.shift();
		if (!item) break;
		h.inventory.unshift(item);
		n++;
	}
	return n;
}
function rollLoot(h, stage, chance, minRarity = 0) {
	if (Math.random() > chance) return null;
	const ilvl = Math.max(1, Math.round(stage * .9 + h.level * .3));
	return makeDrop(h.cls, ilvl, rollRarity(stage, h.attrs.agi, minRarity));
}
/** Loot-table item: finished Rare+ armor never drops — those rolls become a weapon, ring or amulet instead. */
function makeDrop(cls, ilvl, rarity, slot) {
	const it = makeItem(cls, ilvl, rarity, slot);
	if (rarity >= 2 && isArmor(it.slot)) return makeItem(cls, ilvl, rarity, [
		"weapon",
		"ring",
		"talisman"
	][Math.floor(Math.random() * 3)]);
	return it;
}
function refreshMerchant(h) {
	h.merchant = Array.from({ length: 6 }, () => makeDrop(h.cls, h.level + Math.floor(h.paragon / 2), rollRarity(h.level, h.attrs.agi)));
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var equipment_for_classes_jpg_asset_default = {
	version: 1,
	asset_id: "a81d4027-7f9e-4ebe-be43-e9f32053c492",
	project_id: "0f299f2d-878f-49ca-a474-e222b4b4c5ed",
	url: "/__l5e/assets-v1/a81d4027-7f9e-4ebe-be43-e9f32053c492/equipment_for_classes.jpg",
	r2_key: "a/v1/0f299f2d-878f-49ca-a474-e222b4b4c5ed/a81d4027-7f9e-4ebe-be43-e9f32053c492/equipment_for_classes.jpg",
	original_filename: "equipment_for_classes.jpg",
	size: 298611,
	content_type: "image/jpeg",
	created_at: "2026-10-18T08:06:19Z"
};
var astrals_jpg_asset_default = {
	version: 1,
	asset_id: "15f5422a-9429-41d4-bfa2-cb3d7eb04cda",
	project_id: "0f299f2d-878f-49ca-a474-e222b4b4c5ed",
	url: "/__l5e/assets-v1/15f5422a-9429-41d4-bfa2-cb3d7eb04cda/astrals.jpg",
	r2_key: "a/v1/0f299f2d-878f-49ca-a474-e222b4b4c5ed/15f5422a-9429-41d4-bfa2-cb3d7eb04cda/astrals.jpg",
	original_filename: "astrals.jpg",
	size: 387721,
	content_type: "image/jpeg",
	created_at: "2026-10-18T08:06:14Z"
};
function GearIcon({ item, size = 56 }) {
	const r = iconRect(item);
	const s = size / Math.max(r.w, r.h);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			width: size,
			height: size
		},
		className: "flex items-center justify-center overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
			width: r.w * s,
			height: r.h * s,
			backgroundImage: `url(${item.anc ? astrals_jpg_asset_default.url : equipment_for_classes_jpg_asset_default.url})`,
			backgroundSize: `${ATLAS_W * s}px ${ATLAS_H * s}px`,
			backgroundPosition: `-${r.x * s}px -${r.y * s}px`,
			borderRadius: 6
		} })
	});
}
function Panel({ title, onClose, children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-30 flex items-center justify-center bg-background/70 p-3 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `game-panel anim-pop relative flex max-h-[92vh] w-full flex-col ${wide ? "max-w-6xl" : "max-w-3xl"}`,
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b border-border px-4 py-3 md:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "panel-title min-w-0 truncate text-xl font-bold md:text-3xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "btn-blood flex h-9 w-9 items-center justify-center",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-y-auto p-4 md:p-6",
				children
			})]
		})
	});
}
function Gold({ n, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1 font-bold text-gold ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }), fmt(n)]
	});
}
function Diamonds({ n, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 font-bold text-r3 " + className,
		title: "Diamonds",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-4 w-4" }), fmt(n)]
	});
}
/** Compact tab row shared by the castle's buildings: small, tight and wrapping on narrow screens. */
function GameTabs({ label, tabs, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "tablist",
		"aria-label": label,
		className: "mb-3 flex flex-wrap gap-1",
		children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			role: "tab",
			"aria-selected": t.id === value,
			onClick: () => onChange(t.id),
			className: `${t.id === value ? "btn-gold" : "btn-ghost"} relative px-2.5 py-1 text-xs`,
			children: [t.name, !!t.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 rounded-full bg-blood px-1.5 text-[10px]",
				children: t.badge
			})]
		}, t.id))
	});
}
function fmt(n) {
	if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
	if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
	if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
	return Math.round(n).toLocaleString();
}
function ItemSlot({ item, size = 56, onClick, selected, empty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `slot relative flex shrink-0 items-center justify-center transition hover:scale-105 ${item ? `rarity-${item.rarity}` : ""} ${selected ? "ring-2 ring-gold" : ""}`,
		style: {
			width: size + 8,
			height: size + 8
		},
		children: [
			item ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GearIcon, {
				item,
				size
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground/50",
				children: empty
			}),
			item && item.enh > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute right-0.5 top-0 font-display text-xs font-black text-gold drop-shadow-[0_1px_1px_black]",
				children: ["+", item.enh]
			}),
			item && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-0 left-1 text-[10px] font-bold drop-shadow-[0_1px_1px_black]",
				children: item.ilvl
			})
		]
	});
}
function ItemCard({ item, compare, actions }) {
	const s = itemStats(item);
	const c = compare ? itemStats(compare) : null;
	const delta = compare ? Math.round(itemScore(item) - itemScore(compare)) : null;
	const row = (label, v, cv) => v || cv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [v.toLocaleString(), cv !== void 0 && v !== cv && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: v > cv ? "ml-2 text-r1" : "ml-2 text-hp",
			children: [v > cv ? "▲" : "▼", Math.abs(v - cv).toLocaleString()]
		})] })]
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot w-full p-3 anim-pop",
		style: { borderColor: `var(--r${item.rarity})` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
					item,
					size: 64
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-display font-bold leading-tight",
							style: { color: `var(--r${item.rarity})` },
							children: [
								item.name,
								" ",
								item.enh > 0 && `+${item.enh}`
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								RARITIES[item.rarity].name,
								" · ",
								item.slot,
								" · iLvl ",
								item.ilvl
							]
						}),
						delta !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `text-xs font-bold ${delta >= 0 ? "text-r1" : "text-hp"}`,
							children: [
								delta >= 0 ? "▲ Upgrade" : "▼ Weaker",
								" (",
								delta >= 0 ? "+" : "",
								delta,
								" power)"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-0.5",
				children: [
					row("Attack", s.atk, c?.atk),
					row("Defense", s.def, c?.def),
					row("Health", s.hp, c?.hp),
					row("Crit %", s.crit, c?.crit)
				]
			}),
			actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: actions
			})
		]
	});
}
function object(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
/** RPCs return either a save directly or an envelope containing save. Never fabricate missing state. */
function returnedSave(value) {
	const save = object(object(value)["save"] ?? value);
	if (typeof save["name"] !== "string" || ![
		"warrior",
		"mage",
		"archer"
	].includes(String(save["cls"])) || !Array.isArray(save["inventory"]) || !Array.isArray(save["merchant"]) || !Number.isFinite(save["level"]) || !Number.isFinite(save["gold"]) || !save["attrs"] || !save["equipment"]) throw new Error("The game server returned an incomplete save. Reopen your character before continuing.");
	return save;
}
function returnedAstral(value) {
	const a = object(object(value)["astral"]);
	if (typeof a["id"] !== "string" || typeof a["base"] !== "string" || !ASTRAL_BASES[a["base"]] || !Number.isInteger(a["rarity"]) || Number(a["rarity"]) < 0 || Number(a["rarity"]) > 5 || !Number.isInteger(a["lvl"])) throw new Error("The game server returned an unrecognized Astral. Reopen your character to check your collection.");
	return a;
}
function returnedActivities(value) {
	const a = object(value);
	const valid = (entry) => {
		const e = object(entry);
		return typeof e["id"] === "string" && typeof e["kind"] === "string" && Number(e["target"]) > 0 && Number.isFinite(e["progress"]) && typeof e["claimed"] === "boolean";
	};
	const login = object(a["login"]);
	if (!Array.isArray(a["daily"]) || !Array.isArray(a["weekly"]) || !a["daily"].every(valid) || !a["weekly"].every(valid) || typeof login["claimedToday"] !== "boolean" || !Number.isFinite(login["streak"]) || !Number.isFinite(login["total"]) || typeof a["dailyReset"] !== "string" || typeof a["weeklyReset"] !== "string") throw new Error("Activity data is unavailable. Please retry.");
	return a;
}
/** Retry the same valuable request after uncertainty, including after refresh. */
function requestKey(storage, heroId, kind, uuid) {
	const key = `ef-pending:${heroId}:${kind}`;
	const existing = storage.getItem(key);
	if (existing) return existing;
	const id = uuid();
	storage.setItem(key, id);
	return id;
}
var SCROLLS = {
	dmg: {
		name: "Damage Scroll",
		price: 2e3,
		bonus: 20
	},
	def: {
		name: "Defence Scroll",
		price: 2e3,
		bonus: 20
	},
	xp: {
		name: "Experience Scroll",
		price: 1500,
		bonus: 20
	}
};
var isScroll = (v) => typeof v === "string" && v in SCROLLS;
function scrollState(hero) {
	const srv = object(object(hero)["srv"]);
	const counts = (v) => {
		const data = object(v);
		const n = (k) => Number.isInteger(data[k]) && Number(data[k]) > 0 ? Number(data[k]) : 0;
		return {
			dmg: n("dmg"),
			def: n("def"),
			xp: n("xp")
		};
	};
	return {
		owned: counts(srv["scrolls"]),
		buffs: counts(srv["buffs"])
	};
}
function activeScrolls(value) {
	const active = object(value)["active"];
	if (!Array.isArray(active) || !active.every(isScroll) || new Set(active).size !== active.length) throw new Error("Scroll battle confirmation is incomplete. Your charges will not be retried automatically.");
	return active;
}
/** Apply only the server-confirmed battle snapshot, never the decremented remaining counts. */
function scrollFighter(f, active) {
	return {
		...f,
		atk: active.includes("dmg") ? Math.round(f.atk * 1.2) : f.atk,
		def: active.includes("def") ? Math.round(f.def * 1.2) : f.def,
		scrolls: [...active]
	};
}
var scrollXp = (xp, multiplier = 1) => Math.round(xp * multiplier);
async function reward(name, args) {
	return withServerHero(async (id) => {
		const { data, error } = await supabase.rpc(name, {
			...args,
			_hero: id
		});
		if (error) throw new Error(error.message);
		const save = returnedSave(data);
		if (name === "lucky_shot") returnedAstral(data);
		adoptServerSave(id, save);
		return data;
	});
}
async function takeLuckyShot() {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first.");
	const astral = returnedAstral(await reward("lucky_shot", { _req: requestKey(localStorage, id, "lucky", () => crypto.randomUUID()) }));
	localStorage.removeItem(`ef-pending:${id}:lucky`);
	return astral;
}
async function activities(id) {
	const { data, error } = await supabase.rpc("get_activities", { _hero: id });
	if (error) throw new Error(error.message);
	return returnedActivities(data);
}
function rewardLines(value) {
	const r = object(value);
	return Object.entries(object(r["reward"] ?? value)).flatMap(([key, v]) => {
		if (typeof v === "number") return v ? [`${key}: ${v.toLocaleString()}`] : [];
		if (typeof v === "string") return [`${key}: ${v.replaceAll("_", " ")}`];
		if (v && typeof v === "object") return rewardLines(v).map((line) => `${key} · ${line}`);
		return [];
	});
}
async function beginScrollBattle() {
	const state = getState();
	if (!state.heroId || !state.hero) throw new Error("Select a character first.");
	const key = `ef-scroll-battle:${state.heroId}`;
	if (localStorage.getItem(key)) throw new Error("A previous battle confirmation was interrupted. A scroll charge may already have been consumed. Acknowledge it before starting a new battle.");
	if (!Object.values(scrollState(state.hero).buffs).some((n) => n > 0)) return [];
	return withServerHero(async (id) => {
		localStorage.setItem(key, "pending");
		const { data, error } = await supabase.rpc("begin_battle", { _hero: id });
		if (error) throw new Error("Battle confirmation failed. A scroll charge may have been consumed; this request will not retry automatically.");
		const save = returnedSave(data);
		const active = activeScrolls(data);
		adoptServerSave(id, save);
		localStorage.removeItem(key);
		return active;
	});
}
async function buyScroll(kind) {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first.");
	const op = `scroll-buy:${kind}`;
	const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
	await withServerHero(async (heroId) => {
		const { data, error } = await supabase.rpc("buy_scroll", {
			_hero: heroId,
			_kind: kind,
			_req: req
		});
		if (error) throw new Error(error.message);
		adoptServerSave(heroId, returnedSave(data));
	});
	localStorage.removeItem(`ef-pending:${id}:${op}`);
}
async function activateScroll(kind) {
	return withServerHero(async (id) => {
		const hero = getState().hero;
		if (scrollState(hero).buffs[kind] > 0) throw new Error("This scroll is already active.");
		const { data, error } = await supabase.rpc("activate_scroll", {
			_hero: id,
			_kind: kind
		});
		if (error) throw new Error(error.message);
		adoptServerSave(id, returnedSave(data));
	});
}
function useRequest() {
	const locked = (0, import_react.useRef)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const run = async (fn) => {
		if (locked.current) return;
		locked.current = true;
		setBusy(true);
		setError(null);
		try {
			await fn();
		} catch (e) {
			setError(e instanceof Error ? e.message : "The game server could not be reached. Please retry.");
		} finally {
			locked.current = false;
			setBusy(false);
		}
	};
	return {
		busy,
		error,
		run
	};
}
function RequestStatus({ busy, error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "status",
		className: "flex items-center gap-2 py-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Syncing…"]
	}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "alert",
		className: "my-2 break-words text-sm text-hp",
		children: error
	})] });
}
function Mailbox({ onClose }) {
	const { heroId } = useGame();
	const request = useRequest();
	const [mail, setMail] = (0, import_react.useState)(null);
	const [states, setStates] = (0, import_react.useState)([]);
	const [selected, select] = (0, import_react.useState)(null);
	const [claimed, setClaimed] = (0, import_react.useState)([]);
	const load = async () => {
		if (!heroId) return;
		const [messages, status] = await Promise.all([supabase.from("mail").select("*").or(`hero_id.eq.${heroId},hero_id.is.null`).order("created_at", { ascending: false }), supabase.from("mail_state").select("*").eq("hero_id", heroId)]);
		if (messages.error || status.error) throw new Error(messages.error?.message ?? status.error?.message);
		setMail(messages.data ?? []);
		setStates(status.data ?? []);
	};
	(0, import_react.useEffect)(() => {
		request.run(load);
	}, [heroId]);
	const current = mail?.find((m) => m.id === selected);
	const state = states.find((s) => s.mail_id === selected);
	const expired = current?.expires_at ? Date.parse(current.expires_at) <= Date.now() : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Mailbox",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					"aria-label": "Refresh mailbox",
					disabled: request.busy,
					onClick: () => void request.run(load),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 md:grid-cols-[1fr_1.4fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [mail?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-muted-foreground",
						children: "Your mailbox is empty."
					}), mail?.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						disabled: request.busy,
						className: `h-auto w-full justify-start whitespace-normal py-3 text-left ${selected === m.id ? "bg-accent" : ""}`,
						onClick: () => void request.run(async () => {
							select(m.id);
							if (!heroId) return;
							const { error } = await supabase.rpc("read_mail", {
								_hero: heroId,
								_mail: m.id
							});
							if (error) throw new Error(error.message);
							await load();
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 break-words",
							children: [m.subject, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-xs text-muted-foreground",
								children: [
									m.sender,
									" · ",
									new Date(m.created_at).toLocaleDateString(),
									states.some((s) => s.mail_id === m.id && s.claimed_at) ? " · Claimed" : ""
								]
							})]
						})]
					}, m.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl text-gold",
						children: current.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 text-xs text-muted-foreground",
						children: ["From ", current.sender]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-wrap break-words text-sm",
						children: current.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-4 space-y-1 text-sm",
						children: rewardLines(current.attachments).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-gold" }), line]
						}, line))
					}),
					current.expires_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs text-muted-foreground",
						children: expired ? "Expired" : `Expires ${new Date(current.expires_at).toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: request.busy || !!state?.claimed_at || expired || Object.keys(object(current.attachments)).length === 0,
						onClick: () => void request.run(async () => {
							await reward("claim_mail", { _mail: current.id });
							setClaimed(rewardLines(current.attachments));
							await load();
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, {}), state?.claimed_at ? "Claimed" : "Claim attachments"]
					}),
					claimed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						className: "mt-3 text-sm text-r1",
						children: ["Added to your character: ", claimed.join(" · ")]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-muted-foreground",
					children: mail && mail.length > 0 ? "No message selected." : ""
				}) })]
			})
		]
	});
}
function LuckyShots({ onClose }) {
	const { hero } = useGame();
	const request = useRequest();
	const [last, setLast] = (0, import_react.useState)(null);
	const count = object(object(hero)["srv"])["luckyShots"];
	const shots = typeof count === "number" ? count : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Lucky Shots",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border pb-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mx-auto mb-3 h-12 w-12 text-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl",
						children: shots === null ? "Shots unavailable" : `${shots} shots remaining`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-5 grid grid-cols-7 gap-2",
						"aria-label": "Seven Lucky Shots",
						children: Array.from({ length: 7 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `slot flex aspect-square items-center justify-center ${shots !== null && i < shots ? "text-gold" : "text-muted-foreground/40"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: request.busy || shots === null || shots <= 0,
						onClick: () => void request.run(async () => {
							setLast(await takeLuckyShot());
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), "Take a shot"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: `rarity-${last.rarity} slot my-5 p-4 text-center`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-gold",
						children: astralLabel(last)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: astralStatText(last)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 flex items-center justify-center gap-1 text-xs text-r1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Saved to your Astral collection"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 mb-2 font-display text-lg",
				children: "Rarity odds"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: ASTRAL_ODDS.map((odds, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `slot rarity-${i} flex justify-between gap-2 p-2 text-sm`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ASTRAL_RARITY[i] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [odds, "%"] })]
				}, i))
			})
		]
	});
}
var KIND_LABEL = {
	kill: "Enemies defeated",
	dungeon: "Dungeons cleared",
	boss: "Bosses defeated",
	craft: "Items crafted",
	gem: "Gem actions",
	astral: "Astral actions",
	arena: "Arena battles"
};
function ActivityBoard({ onClose }) {
	const { heroId } = useGame();
	const request = useRequest();
	const [board, setBoard] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("daily");
	const [receipt, setReceipt] = (0, import_react.useState)([]);
	const load = async () => {
		if (heroId) setBoard(await activities(heroId));
	};
	(0, import_react.useEffect)(() => {
		request.run(load);
	}, [heroId]);
	const claim = async (id) => {
		const result = await reward("claim_activity", { _objective: id });
		setReceipt(rewardLines(result));
		await load();
	};
	const row = (o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-b border-border py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "font-display text-lg",
				children: [KIND_LABEL[o.kind] ?? o.kind, o.stage ? ` · Stage ${o.stage}` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					Math.min(o.progress, o.target),
					" / ",
					o.target
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
				className: "mt-1 h-2 w-44 accent-primary",
				max: o.target,
				value: Math.min(o.progress, o.target)
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: o.claimed ? "ghost" : "default",
			disabled: request.busy || o.claimed || o.progress < o.target,
			onClick: () => void request.run(() => claim(o.id)),
			children: [o.claimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, {}), o.claimed ? "Claimed" : "Claim"]
		})]
	}, o.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Daily & Weekly Activities",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					"aria-label": "Refresh activities",
					disabled: request.busy,
					onClick: () => void request.run(load),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			board && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b border-border py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl text-gold",
						children: "Login reward"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Streak: ",
							board.login.streak,
							" days · Total: ",
							board.login.total
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: request.busy || board.login.claimedToday,
						onClick: () => void request.run(async () => {
							const r = await reward("claim_login", {});
							setReceipt(rewardLines(r));
							await load();
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, {}), board.login.claimedToday ? "Claimed today" : "Claim login reward"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
					label: "Activity period",
					value: tab,
					onChange: setTab,
					tabs: [{
						id: "daily",
						name: "Daily"
					}, {
						id: "weekly",
						name: "Weekly"
					}]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["Resets ", new Date(tab === "daily" ? board.dailyReset : board.weeklyReset).toLocaleString()]
				}),
				board[tab].map(row),
				tab === "daily" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg",
						children: "Complete all daily objectives"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: request.busy || board.dailyBonusClaimed || !board.daily.length || !board.daily.every((o) => o.claimed),
						onClick: () => void request.run(() => claim("all")),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, {}), board.dailyBonusClaimed ? "Claimed" : "Claim bonus"]
					})]
				})
			] }),
			receipt.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-4 break-words text-sm text-r1",
				children: ["Received: ", receipt.join(" · ")]
			})
		]
	});
}
var PROFESSIONS = [
	{
		id: "mining",
		name: "Mining",
		tool: "Pickaxe",
		verb: "Mining"
	},
	{
		id: "herbalism",
		name: "Herbalism",
		tool: "Gathering sickle",
		verb: "Gathering herbs"
	},
	{
		id: "logging",
		name: "Logging",
		tool: "Woodcutter’s axe",
		verb: "Cutting timber"
	},
	{
		id: "fishing",
		name: "Fishing",
		tool: "Fishing rod",
		verb: "Fishing"
	},
	{
		id: "archaeology",
		name: "Archaeology",
		tool: "Excavation brush",
		verb: "Excavating"
	},
	{
		id: "treasure",
		name: "Treasure Hunting",
		tool: "Survey compass",
		verb: "Searching for treasure"
	}
];
var GATHERING_AREAS = [
	"Verdant Riverlands",
	"Ember Mines",
	"Sunken Kingdom",
	"Frostwater Reach",
	"Astral Wilds"
];
var DISCOVERY_RARITIES = [
	"Common",
	"Uncommon",
	"Rare",
	"Exceptional"
];
var DISCOVERY_NAMES = {
	mining: [
		"Copper Ore",
		"Silver Ore",
		"Azure Crystal",
		"Sunfire Geode"
	],
	herbalism: [
		"Wildleaf",
		"Moonmint",
		"Starblossom",
		"Phoenix Orchid"
	],
	logging: [
		"Oak Timber",
		"Ironwood",
		"Runewood",
		"Worldtree Heart"
	],
	fishing: [
		"River Perch",
		"Silverfin",
		"Frost Koi",
		"Celestial Ray"
	],
	archaeology: [
		"Pottery Shard",
		"Runic Tablet",
		"Royal Artifact",
		"Ancestor’s Seal"
	],
	treasure: [
		"Roadside Cache",
		"Merchant’s Cache",
		"Forgotten Vault",
		"Sovereign’s Hoard"
	]
};
var professionLevel = (xp) => 1 + Math.floor(xp / 100);
var areaRequirement = (area) => 1 + area * 5;
var gatheringSeconds = (area) => 30 + area * 15;
function gatheringState(hero) {
	const g = object(object(object(hero)["srv"])["gathering"]);
	return {
		professions: object(g["professions"]),
		resources: object(g["resources"]),
		history: Array.isArray(g["history"]) ? g["history"] : [],
		active: g["active"] ? g["active"] : null,
		...typeof g["nextAt"] === "string" ? { nextAt: g["nextAt"] } : {}
	};
}
function validateGatheringResponse(value) {
	const r = object(value);
	if (typeof r["now"] !== "string" || !Number.isFinite(Date.parse(r["now"]))) throw new Error("Gathering clock unavailable");
	const g = gatheringState(r["save"]);
	const active = g.active;
	if (active && (!PROFESSIONS.some((p) => p.id === active.profession) || !Number.isInteger(active.area) || active.area < 0 || active.area > 4 || typeof active.request !== "string" || !Number.isFinite(Date.parse(active.readyAt)))) throw new Error("Invalid gathering journey");
	return {
		state: g,
		now: Date.parse(r["now"])
	};
}
async function fetchListings() {
	const { data, error } = await supabase.from("auction_listings").select("id, seller_hero, seller_name, resource, quantity, price, status, created_at, kind, payload").eq("status", "open").order("created_at", { ascending: false }).limit(100);
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function auctionCall(op, rpc, args) {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first.");
	const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
	await withServerHero(async (heroId) => {
		const { data, error } = await supabase.rpc(rpc, {
			_hero: heroId,
			_req: req,
			...args
		});
		if (error) throw new Error(error.message);
		adoptServerSave(heroId, returnedSave(data));
	});
	localStorage.removeItem(`ef-pending:${id}:${op}`);
}
var listResource = (resource, qty, price) => auctionCall(`auction-list:${resource}`, "auction_list", {
	_resource: resource,
	_qty: qty,
	_price: price
});
/** List a bagged piece of equipment whole — it keeps its stats, enhancement and socketed gems. */
var listItem = (item, price) => auctionCall(`auction-list-item:${item.id}`, "auction_list_item", {
	_item: item,
	_price: price
});
/** List a stack of gems. */
var listGem = (gem, qty, price) => auctionCall(`auction-list-gem:${gem}`, "auction_list_gem", {
	_gem: gem,
	_qty: qty,
	_price: price
});
var buyListing = (listing) => auctionCall(`auction-buy:${listing}`, "auction_buy", { _listing: listing });
var cancelListing = (listing) => auctionCall(`auction-cancel:${listing}`, "auction_cancel", { _listing: listing });
function resourceLabel(key) {
	const parts = key.split(":");
	return parts.length === 3 ? parts[0] : key;
}
var guildEventSchema = objectType({
	id: enumType([
		"siege",
		"caravan",
		"ritual"
	]),
	name: stringType(),
	story: stringType(),
	professions: arrayType(stringType()),
	target: numberType().int().positive(),
	scroll: enumType([
		"def",
		"xp",
		"dmg"
	]),
	progress: numberType().nonnegative(),
	personal: numberType().nonnegative(),
	claimed: booleanType()
});
var guildStateSchema = objectType({
	now: stringType().datetime({ offset: true }),
	resetAt: stringType().datetime({ offset: true }),
	events: arrayType(guildEventSchema),
	contributions: arrayType(objectType({
		hero_name: stringType(),
		event: stringType(),
		quantity: numberType().int().positive()
	}))
});
function canClaimGuildEvent(event) {
	return !event.claimed && event.personal > 0 && event.progress >= event.target;
}
function eligibleGuildResource(event, resource) {
	const parts = resource.split(":");
	return parts.length === 3 && event.professions.includes(parts[0]) && /^[0-4]$/.test(parts[1]) && /^[0-3]$/.test(parts[2]);
}
async function loadGuildEvents(heroId) {
	const { data, error } = await supabase.rpc("guild_supply_state", { _hero: heroId });
	if (error) throw new Error(error.message);
	return guildStateSchema.parse(data);
}
async function contributeGuildSupply(event, resource, quantity) {
	return withServerHero(async (id) => {
		const operation = `guild-supply:${event}:${resource}:${quantity}`;
		const req = requestKey(localStorage, id, operation, () => crypto.randomUUID());
		const { data, error } = await supabase.rpc("guild_supply_contribute", {
			_hero: id,
			_event: event,
			_resource: resource,
			_quantity: quantity,
			_req: req
		});
		if (error) throw new Error(error.message);
		adoptServerSave(id, returnedSave(data));
		localStorage.removeItem(`ef-pending:${id}:${operation}`);
	});
}
async function claimGuildEvent(event) {
	return withServerHero(async (id) => {
		const { data, error } = await supabase.rpc("guild_supply_claim", {
			_hero: id,
			_event: event
		});
		if (error) throw new Error(error.message);
		adoptServerSave(id, returnedSave(data));
	});
}
var skill_icons_default = "/assets/skill-icons-D9E8nkIr.png";
/** Painted skill-icon atlas: 4x4 grid, one cell per ability theme. */
var CELLS = {
	sword: 0,
	axe: 1,
	flame: 2,
	sparkles: 3,
	snowflake: 4,
	target: 5,
	wind: 6,
	crosshair: 7,
	shield: 8,
	megaphone: 9,
	swords: 10,
	scan: 11,
	heart: 12,
	potion: 13,
	skull: 14,
	star: 15
};
function SkillIcon({ icon, className = "" }) {
	const cell = CELLS[icon] ?? 0;
	const col = cell % 4, row = Math.floor(cell / 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": "true",
		className: `overflow-hidden rounded ${className}`,
		style: { aspectRatio: "1 / 1" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full w-full",
			style: {
				backgroundImage: `url(${skill_icons_default})`,
				backgroundSize: "400% 400%",
				backgroundPosition: `${col / 3 * 100}% ${row / 3 * 100}%`
			}
		})
	});
}
function GuildEvents() {
	const { hero, heroId } = useGame();
	const request = useRequest();
	const [state, setState] = (0, import_react.useState)(null);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const [offset, setOffset] = (0, import_react.useState)(0);
	const load = async () => {
		if (!heroId) return;
		const result = await loadGuildEvents(heroId);
		setOffset(Date.parse(result.now) - Date.now());
		setState(result);
	};
	(0, import_react.useEffect)(() => {
		request.run(load);
	}, [heroId]);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1e3);
		const refresh = window.setInterval(() => {
			request.run(load);
		}, 3e4);
		return () => {
			clearInterval(timer);
			clearInterval(refresh);
		};
	}, [heroId]);
	const remaining = Math.max(0, Math.floor(((state ? Date.parse(state.resetAt) : now) - now - offset) / 1e3));
	const expired = remaining === 0;
	if (!hero) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 border-y border-border py-4",
		"aria-label": "Guild events",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-display text-xl text-gold",
					children: "Guild events"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [
							"New situations in ",
							Math.floor(remaining / 3600),
							"h ",
							Math.floor(remaining % 3600 / 60),
							"m"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Refresh guild events",
						disabled: request.busy,
						onClick: () => void request.run(load),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: state?.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplyEvent, {
					event,
					resources: gatheringState(hero).resources,
					busy: request.busy || expired,
					onDonate: (resource, quantity) => void request.run(async () => {
						await contributeGuildSupply(event.id, resource, quantity);
						await load();
					}),
					onClaim: () => void request.run(async () => {
						await claimGuildEvent(event.id);
						await load();
					})
				}, event.id))
			}),
			state && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
					className: "font-display text-sm",
					children: "Today's contributions"
				}), state.contributions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "No supplies delivered yet."
				}) : state.contributions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-between gap-2 border-b border-border/30 py-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						c.hero_name,
						" · ",
						state.events.find((e) => e.id === c.event)?.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-gold",
						children: [c.quantity, " supplies"]
					})]
				}, `${c.hero_name}:${c.event}`))]
			})
		]
	});
}
function SupplyEvent({ event, resources, busy, onDonate, onClaim }) {
	const [selected, setSelected] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const options = Object.entries(resources).filter(([key, count]) => count > 0 && eligibleGuildResource(event, key));
	const resource = options.some(([key]) => key === selected) ? selected : options[0]?.[0] ?? "";
	const limit = Math.min(resources[resource] ?? 0, Math.max(0, event.target - event.progress), 100);
	const amount = Math.min(quantity, limit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border border-border rounded-md p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillIcon, {
					icon: event.scroll === "def" ? "shield" : event.scroll === "dmg" ? "sword" : "star",
					className: "h-10 w-10 shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
					className: "font-display text-base text-gold",
					children: event.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 min-h-16 text-sm text-muted-foreground",
				children: event.story
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm",
				children: [
					event.progress,
					"/",
					event.target,
					" supplies · Yours: ",
					event.personal
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
				className: "mt-1 h-2 w-full accent-primary",
				value: event.progress,
				max: event.target,
				"aria-label": `${event.name} progress`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Contributor reward: 1 ",
					event.scroll === "def" ? "Defense" : event.scroll === "dmg" ? "Damage" : "XP",
					" Scroll"
				]
			}),
			event.progress < event.target && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 space-y-2",
				onSubmit: (e) => {
					e.preventDefault();
					if (amount > 0) onDonate(resource, amount);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "slot w-full min-w-0 px-2 py-1 text-sm",
					"aria-label": `${event.name} supply`,
					value: resource,
					onChange: (e) => setSelected(e.target.value),
					disabled: busy || !options.length,
					children: [!options.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "No matching gathered supplies"
					}), options.map(([key, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: key,
						children: [
							resourceLabel(key),
							" ×",
							count
						]
					}, key))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "slot w-16 px-2 text-sm",
						type: "number",
						"aria-label": `${event.name} quantity`,
						min: 1,
						max: Math.max(1, limit),
						value: amount || 1,
						onChange: (e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1))),
						disabled: busy || !limit
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "flex-1",
						disabled: busy || !limit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }), "Deliver"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "mt-3 w-full",
				disabled: busy || !canClaimGuildEvent(event),
				onClick: onClaim,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" }), event.claimed ? "Reward claimed" : "Claim scroll"]
			})
		]
	});
}
var mat_ore_default = "/assets/mat-ore-BopvzjkF.png";
var mat_essence_default = "/assets/mat-essence-DLKlVlZn.png";
var mat_starshard_default = "/assets/mat-starshard-CVNKmFV1.png";
var mat_bossCore_default = "/assets/mat-bossCore-BTqABszq.png";
var mat_fragment_default = "/assets/mat-fragment-BZixcKHw.png";
var mat_sigil_default = "/assets/mat-sigil-DxoGCjun.png";
var gem_ruby_default = "/assets/gem-ruby-AV5lnPaI.png";
var gem_sapphire_default = "/assets/gem-sapphire-KvE5fjDe.png";
var gem_emerald_default = "/assets/gem-emerald-DHsmfPao.png";
var gem_topaz_default = "/assets/gem-topaz-ChX2XOyG.png";
var gem_sprites_png_asset_default = {
	version: 1,
	url: "https://media.base44.com/images/public/6ade9712cf0c269a1e232537/2a88bf4f3_generated_image.png"
};
var astral_sprites_png_asset_default = {
	version: 1,
	url: "https://media.base44.com/images/public/6ade9712cf0c269a1e232537/15b0e665f_generated_image.png"
};
var MAT_IMG = {
	ore: mat_ore_default,
	essence: mat_essence_default,
	starshard: mat_starshard_default,
	bossCore: mat_bossCore_default,
	fragment: mat_fragment_default,
	sigil: mat_sigil_default
};
var GEM_IMG = {
	ruby: gem_ruby_default,
	sapphire: gem_sapphire_default,
	emerald: gem_emerald_default,
	topaz: gem_topaz_default
};
/** Drawn shapes for materials that have no painted sheet art. */
var MAT_SHAPE = {
	fragment: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M4 3h9l3 5-6 9-6-9z",
		fill: "#9aa3b5",
		stroke: "#222"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M4 3l6 5 3-5M10 8v9",
		stroke: "#e6ebf5",
		strokeWidth: "0.6",
		fill: "none"
	})] }),
	sigil: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: "10",
		cy: "10",
		r: "8",
		fill: "#5a1220",
		stroke: "#c9a227",
		strokeWidth: "1.5"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M10 4l1.8 4 4.2.4-3.2 2.8 1 4.2L10 13l-3.8 2.4 1-4.2L4 8.4 8.2 8z",
		fill: "#f2c94c"
	})] }),
	hide: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M3 5c3-3 11-3 14 0 1 3-1 6-2 7 1 2 0 5-2 6-4 1-9-1-11-4-1-2 0-4 2-5C3 8 2 6 3 5z",
		fill: "#8a5a32",
		stroke: "#2b1a0f",
		strokeWidth: "0.8"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M7 6c2 2 4 6 4 9",
		stroke: "#5d3a1e",
		strokeWidth: "0.8",
		fill: "none"
	})] }),
	bloom: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M10 11v7",
			stroke: "#3f7a3a",
			strokeWidth: "1.2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M10 3c2 0 3 2 3 3s-1 2-3 2-3-1-3-2 1-3 3-3z",
			fill: "#e2603a",
			stroke: "#7a2a12",
			strokeWidth: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M5 7c2 0 3 2 3 3s-1 2-3 2-2-1-2-3 0-2 2-2z",
			fill: "#c9452a",
			stroke: "#7a2a12",
			strokeWidth: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M15 7c-2 0-3 2-3 3s1 2 3 2 2-1 2-3 0-2-2-2z",
			fill: "#c9452a",
			stroke: "#7a2a12",
			strokeWidth: "0.6"
		})
	] }),
	crystal: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M10 1.5l6 5.5-3 11.5H7L4 7z",
		fill: "#7b5cd6",
		stroke: "#2a1b4d",
		strokeWidth: "0.9"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M10 1.5L8.5 18.5M4 7h12",
		stroke: "#c9b6ff",
		strokeWidth: "0.6",
		fill: "none"
	})] })
};
var MatIcon = ({ mat, size = 20 }) => MAT_IMG[mat] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
	src: MAT_IMG[mat],
	alt: "",
	width: size,
	height: size,
	loading: "lazy",
	className: "inline-block align-middle",
	style: {
		width: size,
		height: size
	}
}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	width: size,
	height: size,
	viewBox: "0 0 20 20",
	className: "inline-block align-middle",
	role: "img",
	"aria-label": MATS[mat].name,
	children: MAT_SHAPE[mat] ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M5 3h10l4 5-9 10L1 8z",
		fill: "#9aa3b5",
		stroke: "#222"
	})
});
/** Cut shapes so each gem type is recognisable even without a painted icon. */
var CUTS = {
	amethyst: "M10 1l6 5-2 12H6L4 6z",
	aquamarine: "M3 7l7-6 7 6-7 12z",
	garnet: "M10 2a8 8 0 1 1 0 16a8 8 0 1 1 0-16z",
	peridot: "M10 1l8 9-8 9-8-9z",
	opal: "M10 2c5 0 8 3.5 8 8s-3 8-8 8-8-3.5-8-8 3-8 8-8z",
	onyx: "M3 3h14v14H3z",
	obsidian: "M10 1l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z",
	moonstone: "M13 2a8 8 0 1 0 5 13A7 7 0 0 1 13 2z",
	pearl: "M10 3a7 7 0 1 1 0 14a7 7 0 1 1 0-14z"
};
var GEM_SHEET = [
	"amethyst",
	"aquamarine",
	"garnet",
	"peridot",
	"opal",
	"onyx",
	"obsidian",
	"moonstone",
	"pearl"
];
var GEM_SHEET_COLS = 3;
var GemIcon = ({ type, size = 18 }) => {
	const cell = GEM_SHEET.indexOf(type);
	if (GEM_IMG[type]) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: GEM_IMG[type],
		alt: GEMS[type].name,
		width: size,
		height: size,
		loading: "lazy",
		className: "mr-1 inline-block align-middle",
		style: {
			width: size,
			height: size
		}
	});
	if (cell >= 0) {
		const col = cell % GEM_SHEET_COLS;
		const row = Math.floor(cell / GEM_SHEET_COLS);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			role: "img",
			"aria-label": GEMS[type].name,
			title: GEMS[type].name,
			className: "mr-1 inline-block shrink-0 align-middle",
			style: {
				width: size,
				height: size,
				borderRadius: Math.max(2, size / 8),
				overflow: "hidden",
				backgroundImage: `url(${gem_sprites_png_asset_default.url})`,
				backgroundSize: `${size * GEM_SHEET_COLS}px ${size * GEM_SHEET_COLS}px`,
				backgroundPosition: `-${col * size}px -${row * size}px`
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 20 20",
		className: "mr-1 inline-block align-middle",
		"aria-label": GEMS[type].name,
		role: "img",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: `g-${type}`,
				cx: "35%",
				cy: "30%",
				r: "75%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#fff",
						stopOpacity: "0.95"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "35%",
						stopColor: GEMS[type].color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#000",
						stopOpacity: "0.85"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: CUTS[type] ?? "M5 3h10l4 5-9 10L1 8z",
				fill: `url(#g-${type})`,
				stroke: "#111",
				strokeWidth: "0.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: CUTS[type] ?? "M5 3h10l4 5-9 10L1 8z",
				fill: "none",
				stroke: "#fff8",
				strokeWidth: "0.4",
				transform: "translate(10 10) scale(0.55) translate(-10 -10)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "7",
				cy: "6",
				r: "1.2",
				fill: "#fff",
				opacity: "0.8"
			})
		]
	});
};
/** Painted portrait for every Astral species, sliced from one 4x4 sprite sheet. */
var ASTRAL_KEYS = Object.keys(ASTRAL_BASES);
var ASTRAL_SHEET_COLS = 4;
var AstralIcon = ({ base, rarity = 0, size = 48 }) => {
	const cell = Math.max(0, ASTRAL_KEYS.indexOf(base));
	const col = cell % ASTRAL_SHEET_COLS;
	const row = Math.floor(cell / ASTRAL_SHEET_COLS);
	const glow = ASTRAL_COLORS[rarity] ?? "#9a9a9a";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		role: "img",
		"aria-label": ASTRAL_BASES[base]?.name ?? "Astral",
		title: ASTRAL_BASES[base]?.name ?? "Astral",
		className: "inline-block shrink-0 rounded-lg",
		style: {
			width: size,
			height: size,
			overflow: "hidden",
			boxShadow: `0 0 0 2px ${glow}, 0 0 10px ${glow}66`,
			backgroundImage: `url(${astral_sprites_png_asset_default.url})`,
			backgroundSize: `${size * ASTRAL_SHEET_COLS}px ${size * ASTRAL_SHEET_COLS}px`,
			backgroundPosition: `-${col * size}px -${row * size}px`
		}
	});
};
function useToast$1() {
	const [msg, setMsg] = (0, import_react.useState)(null);
	return [msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`,
		children: msg.t
	}), (ok, t) => setMsg({
		ok,
		t
	})];
}
/** Gold → Guild Coins contribution panel. */
function GuildContribute() {
	const { hero } = useGame();
	const [amount, setAmount] = (0, import_react.useState)(GUILD_CONTRIB_MIN);
	const [toast, say] = useToast$1();
	if (!hero) return null;
	const coins = hero.guildCoins ?? 0;
	const doContribute = () => update((h) => {
		const err = contributeGold(h, amount);
		say(!err, err ?? `Contributed ${fmt(amount)} gold → +${fmt(amount)} guild coins!`);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot mb-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between gap-2 font-display text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }), "Guild Coins"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-lg",
					children: fmt(coins)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Contribute gold to earn guild coins (1 gold = 1 guild coin). Spend them in the guild shop and skill tower."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs",
					children: ["Gold to contribute", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: GUILD_CONTRIB_MIN,
						step: 1e3,
						value: amount,
						onChange: (e) => setAmount(Math.max(GUILD_CONTRIB_MIN, Number(e.target.value) || 1e3)),
						className: "mt-1 block w-32 rounded border border-border bg-background p-2"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: hero.gold < amount,
					onClick: doContribute,
					children: ["Contribute ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: amount })]
				})]
			}),
			toast
		]
	});
}
/** Guild Shop — buy materials and enchantment stones with guild coins. */
function GuildShopPanel() {
	const { hero } = useGame();
	const [toast, say] = useToast$1();
	if (!hero) return null;
	const coins = hero.guildCoins ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot mb-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between gap-2 font-display text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-4 w-4" }), "Guild Shop"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [fmt(coins), " coins"] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Buy materials and enchantment stones with your guild coins."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-1.5 sm:grid-cols-2",
				children: GUILD_SHOP.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "slot flex items-center justify-between gap-2 p-2 text-left text-xs",
					disabled: coins < item.cost,
					title: item.desc,
					onClick: () => update((h) => {
						const err = buyGuildShopItem(h, item.id);
						say(!err, err ?? `Bought ${item.name}!`);
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
							mat: item.mat,
							size: 18
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: item.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 font-bold text-gold",
						children: [fmt(item.cost), " c"]
					})]
				}, item.id))
			}),
			toast
		]
	});
}
/** Guild Skill Tower — permanent stat upgrades purchased with guild coins. */
function GuildSkillTower() {
	const { hero } = useGame();
	const [toast, say] = useToast$1();
	if (!hero) return null;
	const coins = hero.guildCoins ?? 0;
	const s = heroStats(hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot mb-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between gap-2 font-display text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" }), "Guild Skill Tower"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [fmt(coins), " coins"] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Permanent stat upgrades that raise your Battle Rating. Current BR: ",
					fmt(s.power),
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: GUILD_SKILLS.map((skill) => {
					const rank = guildSkillRank(hero, skill.id);
					const blocker = guildSkillBlocker(hero, skill);
					const cost = guildSkillCost(skill, rank);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "slot p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold",
									children: skill.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										rank,
										"/",
										skill.max
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: skill.desc
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs",
								children: [
									"Current: +",
									+(skill.per * rank).toFixed(1),
									STAT_LABEL[skill.stat]
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex gap-1",
								children: Array.from({ length: skill.max }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-full rounded ${i < rank ? "bg-gold" : "bg-muted"}` }, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-gold mt-2 w-full py-1.5 text-xs",
								disabled: !!blocker || coins < cost,
								onClick: () => update((h) => {
									const err = learnGuildSkill(h, skill.id);
									say(!err, err ?? `Learned ${skill.name} rank ${rank + 1}!`);
								}),
								children: blocker ?? `Upgrade · ${fmt(cost)} coins`
							})
						]
					}, skill.id);
				})
			}),
			toast
		]
	});
}
function GuildHall({ onClose }) {
	const { heroId, hero } = useGame();
	const request = useRequest();
	const [guild, setGuild] = (0, import_react.useState)(null);
	const [members, setMembers] = (0, import_react.useState)([]);
	const [names, setNames] = (0, import_react.useState)({});
	const [invites, setInvites] = (0, import_react.useState)([]);
	const [inviteNames, setInviteNames] = (0, import_react.useState)({});
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [target, setTarget] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [allGuilds, setAllGuilds] = (0, import_react.useState)([]);
	const [myApps, setMyApps] = (0, import_react.useState)([]);
	const [applications, setApplications] = (0, import_react.useState)([]);
	const [applyMsg, setApplyMsg] = (0, import_react.useState)({});
	const load = async () => {
		if (!heroId) return;
		const [membership, invitation] = await Promise.all([supabase.from("guild_members").select("*").eq("hero_id", heroId).maybeSingle(), supabase.from("guild_invites").select("*").eq("hero_id", heroId)]);
		if (membership.error || invitation.error) throw new Error(membership.error?.message ?? invitation.error?.message);
		setInvites(invitation.data ?? []);
		const ids = (invitation.data ?? []).map((i) => i.guild_id);
		if (ids.length) {
			const { data, error } = await supabase.from("guilds").select("id,name").in("id", ids);
			if (error) throw new Error(error.message);
			setInviteNames(Object.fromEntries((data ?? []).map((g) => [g.id, g.name])));
		}
		const { data: apps } = await supabase.from("guild_applications").select("*").eq("hero_id", heroId).eq("status", "pending");
		setMyApps(apps ?? []);
		if (!membership.data) {
			setGuild(null);
			setMembers([]);
			setMessages([]);
			setApplications([]);
			const { data: guilds } = await supabase.from("guilds").select("*").order("name");
			setAllGuilds(guilds ?? []);
			setLoaded(true);
			return;
		}
		const id = membership.data.guild_id;
		const [g, roster, chat] = await Promise.all([
			supabase.from("guilds").select("*").eq("id", id).single(),
			supabase.from("guild_members").select("*").eq("guild_id", id),
			supabase.from("chat_messages").select("*").eq("channel", "guild").eq("guild_id", id).order("created_at", { ascending: false }).limit(50)
		]);
		if (g.error || roster.error || chat.error) throw new Error(g.error?.message ?? roster.error?.message ?? chat.error?.message);
		const heroIds = (roster.data ?? []).map((m) => m.hero_id);
		if (heroIds.length) {
			const { data, error } = await supabase.from("heroes").select("id,name").in("id", heroIds);
			if (error) throw new Error(error.message);
			setNames(Object.fromEntries((data ?? []).map((h) => [h.id, h.name])));
		}
		setGuild(g.data);
		setMembers(roster.data ?? []);
		setMessages((chat.data ?? []).reverse());
		const myRole = (roster.data ?? []).find((m) => m.hero_id === heroId)?.role;
		if (myRole === "leader" || myRole === "officer") {
			const { data: pending } = await supabase.from("guild_applications").select("*").eq("guild_id", id).eq("status", "pending").order("created_at", { ascending: false });
			setApplications(pending ?? []);
		} else setApplications([]);
		setLoaded(true);
	};
	(0, import_react.useEffect)(() => {
		request.run(load);
	}, [heroId]);
	(0, import_react.useEffect)(() => {
		if (!guild) return;
		const channel = supabase.channel(`guild-hall:${guild.id}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "chat_messages",
			filter: `guild_id=eq.${guild.id}`
		}, () => {
			request.run(load);
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [guild?.id]);
	const mutate = async (fn) => withServerHero(async (id) => {
		const result = await fn(id);
		if (result.error) throw new Error(result.error.message);
		const { data, error } = await supabase.from("heroes").select("save").eq("id", id).single();
		if (error) throw new Error(error.message);
		adoptServerSave(id, returnedSave(data.save));
		await load();
	});
	const role = members.find((m) => m.hero_id === heroId)?.role;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Guild Hall",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					"aria-label": "Refresh guild",
					disabled: request.busy,
					onClick: () => void request.run(load),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			loaded && !guild && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-4 font-display text-2xl text-gold",
					children: "Guild invitations"
				}),
				invites.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-6 text-sm text-muted-foreground",
					children: "No pending invitations."
				}),
				invites.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2 border-b border-border py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inviteNames[i.guild_id] ?? "Guild invitation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex gap-2",
						children: [true, false].map((accept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							"aria-label": accept ? "Accept invitation" : "Decline invitation",
							disabled: request.busy,
							onClick: () => void request.run(() => mutate((id) => supabase.rpc("respond_invite", {
								_hero: id,
								_invite: i.id,
								_accept: accept
							}))),
							children: accept ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
						}, String(accept)))
					})]
				}, i.id)),
				myApps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "mb-2 font-display text-lg",
						children: "Your applications"
					}), myApps.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 border-b border-border py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							children: allGuilds.find((g) => g.id === a.guild_id)?.name ?? "Guild"
						}), a.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-muted-foreground",
							children: [
								"\"",
								a.message,
								"\""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							disabled: request.busy,
							onClick: () => void request.run(() => mutate((id) => supabase.rpc("withdraw_application", {
								_hero: id,
								_application: a.id
							}))),
							children: "Withdraw"
						})]
					}, a.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 border-t border-border pt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "mb-3 font-display text-2xl",
							children: "Available guilds"
						}),
						allGuilds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No guilds have been founded yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-72 space-y-3 overflow-y-auto pr-1",
							children: allGuilds.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "slot p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-lg text-gold",
										children: g.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 text-xs text-muted-foreground",
										children: ["Lv ", g.level]
									})] }), myApps.some((a) => a.guild_id === g.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Applied"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "slot w-40 px-2 py-1 text-sm",
											placeholder: "Message (optional)",
											maxLength: 200,
											value: applyMsg[g.id] ?? "",
											onChange: (e) => setApplyMsg((m) => ({
												...m,
												[g.id]: e.target.value
											}))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											disabled: request.busy,
											onClick: () => void request.run(() => mutate((id) => supabase.rpc("apply_guild", {
												_hero: id,
												_guild: g.id,
												_message: applyMsg[g.id] ?? ""
											}))),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), "Apply"]
										})]
									})]
								}), g.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: g.description
								})]
							}, g.id))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "max-w-md space-y-3 border-t border-border pt-5",
					onSubmit: (e) => {
						e.preventDefault();
						request.run(() => mutate((id) => supabase.rpc("create_guild", {
							_hero: id,
							_name: name.trim(),
							_description: description,
							_emblem: "shield"
						})));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl",
							children: "Found a guild"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Guild name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "slot mt-1 w-full px-3 py-2",
								required: true,
								minLength: 3,
								maxLength: 20,
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Description", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "slot mt-1 w-full px-3 py-2",
								maxLength: 200,
								value: description,
								onChange: (e) => setDescription(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: request.busy || !hero || hero.gold < 1e4,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {}), "Create guild · 10,000 gold"]
						})
					]
				})
			] }),
			guild && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-3xl text-gold",
					children: guild.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Level ",
						guild.level,
						" · ",
						members.length,
						" members · ",
						role
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 break-words text-sm",
					children: guild.description
				}),
				guild.announcement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "my-4 border-l-2 border-primary pl-3 text-sm",
					children: guild.announcement
				}),
				(role === "leader" || role === "officer") && applications.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 border-y border-border py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
						className: "mb-3 font-display text-xl text-gold",
						children: [
							"Applications (",
							applications.length,
							")"
						]
					}), applications.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 border-b border-border py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-base",
							children: a.hero_name
						}), a.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"\"",
								a.message,
								"\""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								"aria-label": "Accept application",
								disabled: request.busy,
								onClick: () => void request.run(() => mutate((id) => supabase.rpc("moderate_application", {
									_hero: id,
									_application: a.id,
									_accept: true
								}))),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								"aria-label": "Reject application",
								disabled: request.busy,
								onClick: () => void request.run(() => mutate((id) => supabase.rpc("moderate_application", {
									_hero: id,
									_application: a.id,
									_accept: false
								}))),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
							})]
						})]
					}, a.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildEvents, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildContribute, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildShopPanel, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildSkillTower, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-6 md:grid-cols-[1fr_1.4fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-display text-xl",
							children: "Members"
						}),
						members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-2 border-b border-border py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: names[m.hero_id] ?? "Member" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: m.role
							})]
						}, m.hero_id)),
						(role === "leader" || role === "officer") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								request.run(async () => {
									await mutate((id) => supabase.rpc("guild_invite", {
										_hero: id,
										_target_name: target.trim()
									}));
									setTarget("");
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Hero name to invite",
								className: "slot min-w-0 flex-1 px-2",
								required: true,
								value: target,
								onChange: (e) => setTarget(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								"aria-label": "Invite hero",
								disabled: request.busy,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "mt-4",
							disabled: request.busy,
							onClick: () => {
								if (window.confirm("Leave your guild?")) request.run(() => mutate((id) => supabase.rpc("leave_guild", { _hero: id })));
							},
							children: "Leave guild"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "mb-2 font-display text-xl",
							children: "Guild chat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-72 overflow-y-auto border-y border-border py-2",
							children: [messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No guild messages yet."
							}), messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 break-words text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										className: "text-gold",
										children: m.sender_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-xs text-muted-foreground",
										children: new Date(m.created_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block",
										children: m.body
									})
								]
							}, m.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								request.run(async () => {
									if (!heroId) return;
									const { error } = await supabase.rpc("send_chat", {
										_hero: heroId,
										_channel: "guild",
										_body: body,
										_to: "00000000-0000-0000-0000-000000000000"
									});
									if (error) throw new Error(error.message);
									setBody("");
									await load();
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "slot min-w-0 flex-1 px-3",
								"aria-label": "Guild message",
								maxLength: 200,
								required: true,
								value: body,
								onChange: (e) => setBody(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								"aria-label": "Send guild message",
								disabled: request.busy || !body.trim(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
							})]
						})
					] })]
				})
			] })
		]
	});
}
function WorldChat({ heroId }) {
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [body, setBody] = (0, import_react.useState)("");
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!heroId) return;
		let active = true;
		const load = async () => {
			const { data, error: loadError } = await supabase.from("chat_messages").select("*").eq("channel", "world").order("created_at", { ascending: false }).limit(50);
			if (!active) return;
			if (loadError) setError(loadError.message);
			else setMessages((data ?? []).reverse());
		};
		load();
		const channel = supabase.channel(`world-chat:${heroId}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "chat_messages",
			filter: "channel=eq.world"
		}, (payload) => {
			const row = payload.new;
			setMessages((current) => current.some((m) => m.id === row.id) ? current : [...current, row].slice(-50));
		}).subscribe();
		return () => {
			active = false;
			supabase.removeChannel(channel);
		};
	}, [heroId]);
	(0, import_react.useEffect)(() => {
		if (heroId && !collapsed) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [
		messages,
		collapsed,
		heroId
	]);
	const send = async () => {
		if (!heroId) return;
		const trimmed = body.trim();
		if (!trimmed || trimmed.length > 200 || sending) return;
		setSending(true);
		setError("");
		try {
			const { error: sendError } = await supabase.rpc("send_chat", {
				_hero: heroId,
				_channel: "world",
				_body: trimmed,
				_to: "00000000-0000-0000-0000-000000000000"
			});
			if (sendError) throw new Error(sendError.message);
			setBody("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not send message.");
		} finally {
			setSending(false);
		}
	};
	if (!heroId) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "game-panel world-chat pointer-events-auto absolute bottom-16 left-3 z-20 w-[min(22rem,calc(100vw-1.5rem))] p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between border-b border-border pb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "panel-title text-sm font-bold",
				children: "World"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "text-xs text-muted-foreground hover:text-gold",
				"aria-expanded": !collapsed,
				onClick: () => setCollapsed((v) => !v),
				children: collapsed ? "Expand" : "Collapse"
			})]
		}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: listRef,
				className: "mt-1 h-44 overflow-y-auto py-1",
				"aria-live": "polite",
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-2 text-sm text-muted-foreground",
					children: "No one has spoken yet."
				}) : messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `mb-1 break-words text-xs ${m.sender_id === heroId ? "text-gold" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "mr-1 text-[10px] text-muted-foreground",
							children: new Date(m.created_at).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.sender_name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1",
							children: m.body
						})
					]
				}, m.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-1 flex gap-1",
				onSubmit: (e) => {
					e.preventDefault();
					send();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "slot min-w-0 flex-1 px-2 py-1 text-sm",
					"aria-label": "World message",
					value: body,
					onChange: (e) => setBody(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							send();
						}
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold px-3 text-sm",
					disabled: sending || !body.trim() || body.trim().length > 200,
					children: "Send"
				})]
			}),
			body.trim().length > 200 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Messages must be 200 characters or fewer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[10px] text-muted-foreground",
				children: "1 message per second · max 5 per 15 seconds. Muted senders cannot chat."
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-1 break-words text-xs text-hp",
				children: error
			})
		] })]
	});
}
var client = supabase;
async function call(name, args) {
	const { data, error } = await client.rpc(name, args);
	if (error) throw new Error(error.message);
	return data;
}
async function addFriend(heroId, name) {
	return call("add_friend", {
		_hero: heroId,
		_name: name.trim()
	});
}
async function removeFriend(heroId, friendId) {
	await call("remove_friend", {
		_hero: heroId,
		_friend: friendId
	});
}
async function listFriends(heroId) {
	return await call("list_friends", { _hero: heroId }) ?? [];
}
async function inspectHero(heroId, targetId) {
	const rows = await call("inspect_hero", {
		_hero: heroId,
		_target: targetId
	});
	if (!rows?.[0]) throw new Error("That hero cannot be inspected");
	return rows[0];
}
function socialError(error) {
	return error instanceof Error ? error.message : "The game server could not be reached. Please retry.";
}
/**
* Shared material story, so a chestplate and its weapon read as one set:
* iron → ember → moon → ancestral.
*/
var METAL = {
	0: {
		base: "#8b98a8",
		dark: "#4d5763",
		light: "#c6d1de",
		trim: "#6e7a89",
		glow: "#a9c6f5",
		edge: "#eaf2fb"
	},
	1: {
		base: "#4b322c",
		dark: "#221211",
		light: "#7c4f40",
		trim: "#c56a2d",
		glow: "#ff8a3d",
		edge: "#ffd7a8"
	},
	2: {
		base: "#b9cde2",
		dark: "#6b839c",
		light: "#f4faff",
		trim: "#63c4e6",
		glow: "#8deaff",
		edge: "#ffffff"
	},
	3: {
		base: "#c9a445",
		dark: "#6f5119",
		light: "#f6e29c",
		trim: "#2f7a52",
		glow: "#86f0a8",
		edge: "#fff6cc"
	}
};
/** Class colour identity — the same accents the class headers use. */
var CLASS_ACCENT = {
	warrior: "#ff8c2b",
	mage: "#46bdf8",
	archer: "#7ada4c"
};
var INK = "#1a1119";
var SKIN = {
	base: "#f0bd90",
	light: "#ffd9b6",
	shade: "#d09166",
	deep: "#a96c47",
	line: "#8a5638",
	blush: "#e57d6c",
	lip: "#c4615a",
	lipDark: "#8f3f3c"
};
/** Class cloth per look tier: the cape, tabard and sleeves follow the worn chest piece. */
var CLOTH = {
	warrior: [
		{
			cloth: "#8f2f2a",
			dark: "#55180f",
			light: "#bd4a3d"
		},
		{
			cloth: "#4d2420",
			dark: "#28120f",
			light: "#81402f"
		},
		{
			cloth: "#2f3f66",
			dark: "#1a2540",
			light: "#48618d"
		},
		{
			cloth: "#2d6349",
			dark: "#173a29",
			light: "#4d9468"
		}
	],
	mage: [
		{
			cloth: "#4a3f78",
			dark: "#2a2450",
			light: "#6a5ca3"
		},
		{
			cloth: "#402230",
			dark: "#24101a",
			light: "#6c3a4d"
		},
		{
			cloth: "#33436f",
			dark: "#1c2647",
			light: "#53679b"
		},
		{
			cloth: "#2c5a52",
			dark: "#16332e",
			light: "#487f73"
		}
	],
	archer: [
		{
			cloth: "#3f6b45",
			dark: "#233c28",
			light: "#5d9364"
		},
		{
			cloth: "#5c3a26",
			dark: "#322014",
			light: "#855437"
		},
		{
			cloth: "#2b3f5c",
			dark: "#16233a",
			light: "#456082"
		},
		{
			cloth: "#37674c",
			dark: "#1c3a2b",
			light: "#57906a"
		}
	]
};
/**
* Hair and eyes are per class *and* gender, matching the character sheet:
* a blonde and a silver knight, a brown-haired and a blonde mage, two blondes for the archer.
*/
var HAIR = {
	warrior: {
		female: {
			hair: "#e2bb63",
			dark: "#a8843a",
			light: "#fbe6a8",
			eye: "#d98a2c"
		},
		male: {
			hair: "#cbd5df",
			dark: "#8b98a6",
			light: "#f5faff",
			eye: "#7fc4e8"
		}
	},
	mage: {
		female: {
			hair: "#6b4630",
			dark: "#3f2718",
			light: "#a1724f",
			eye: "#a37cf0"
		},
		male: {
			hair: "#d8bd7d",
			dark: "#9c8142",
			light: "#f6e7b8",
			eye: "#e0b34a"
		}
	},
	archer: {
		female: {
			hair: "#e8c778",
			dark: "#ad8b43",
			light: "#fcecb6",
			eye: "#5dbb6b"
		},
		male: {
			hair: "#d3ae66",
			dark: "#96743a",
			light: "#f1dba4",
			eye: "#4fa35c"
		}
	}
};
var tierOf = (n) => n <= 0 ? 0 : n >= 3 ? 3 : n;
var POSE = {
	warrior: {
		weaponAt: "translate(192 198) rotate(26)",
		weaponShoulder: {
			x: 186,
			y: 152
		},
		weaponElbow: {
			x: 208,
			y: 168
		},
		weaponHand: {
			x: 192,
			y: 198
		},
		freeShoulder: {
			x: 120,
			y: 150
		},
		freeElbow: {
			x: 104,
			y: 180
		},
		freeHand: {
			x: 120,
			y: 210
		},
		hipF: {
			x: 164,
			y: 220
		},
		kneeF: {
			x: 186,
			y: 284
		},
		ankleF: {
			x: 200,
			y: 348
		},
		hipB: {
			x: 138,
			y: 220
		},
		kneeB: {
			x: 114,
			y: 284
		},
		ankleB: {
			x: 106,
			y: 350
		},
		lean: -1.4,
		head: {
			x: 152,
			y: 84
		}
	},
	mage: {
		weaponAt: "translate(98 200) rotate(-5)",
		weaponShoulder: {
			x: 118,
			y: 150
		},
		weaponElbow: {
			x: 100,
			y: 174
		},
		weaponHand: {
			x: 98,
			y: 200
		},
		freeShoulder: {
			x: 186,
			y: 150
		},
		freeElbow: {
			x: 206,
			y: 166
		},
		freeHand: {
			x: 198,
			y: 136
		},
		hipF: {
			x: 162,
			y: 220
		},
		kneeF: {
			x: 178,
			y: 288
		},
		ankleF: {
			x: 184,
			y: 352
		},
		hipB: {
			x: 140,
			y: 220
		},
		kneeB: {
			x: 124,
			y: 288
		},
		ankleB: {
			x: 118,
			y: 352
		},
		lean: 1.2,
		head: {
			x: 152,
			y: 84
		}
	},
	archer: {
		weaponAt: "translate(86 182) rotate(-8)",
		weaponShoulder: {
			x: 120,
			y: 152
		},
		weaponElbow: {
			x: 100,
			y: 164
		},
		weaponHand: {
			x: 86,
			y: 182
		},
		freeShoulder: {
			x: 186,
			y: 152
		},
		freeElbow: {
			x: 204,
			y: 172
		},
		freeHand: {
			x: 168,
			y: 196
		},
		hipF: {
			x: 164,
			y: 218
		},
		kneeF: {
			x: 184,
			y: 282
		},
		ankleF: {
			x: 198,
			y: 348
		},
		hipB: {
			x: 138,
			y: 218
		},
		kneeB: {
			x: 122,
			y: 286
		},
		ankleB: {
			x: 112,
			y: 350
		},
		lean: -.8,
		head: {
			x: 152,
			y: 84
		}
	}
};
/** Points along a limb, bowed slightly so arms and legs never read as sticks. */
function bow(a, b, bend) {
	const mx = (a.x + b.x) / 2;
	const my = (a.y + b.y) / 2;
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = Math.hypot(dx, dy) || 1;
	return {
		x: mx - dy / len * bend,
		y: my + dx / len * bend
	};
}
var path = (a, c, b) => `M${a.x} ${a.y}Q${c.x} ${c.y} ${b.x} ${b.y}`;
/**
* The hero's body: cloak, legs, torso, arms and a face with real features.
* Everything is drawn in a 300×400 frame with the feet on y≈362, so every
* class/gender shares one silhouette language while their gear changes on top.
*/
var HEAD = {
	x: 152,
	y: 84
};
/** A tapered limb: ink outline, fill, then a highlight along the light side. */
function Limb({ a, b, w, bend = 0, fill, shade, light }) {
	const d = path(a, bow(a, b, bend), b);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			stroke: INK,
			strokeWidth: w + 3.4,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			stroke: fill,
			strokeWidth: w,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: path(a, bow(a, b, bend * 1.1), b),
			stroke: shade,
			strokeWidth: w * .42,
			fill: "none",
			strokeLinecap: "round",
			opacity: "0.55",
			transform: "translate(1.5 1.5)"
		}),
		light && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			stroke: light,
			strokeWidth: w * .16,
			fill: "none",
			strokeLinecap: "round",
			opacity: "0.7",
			transform: "translate(-2.4 0)"
		})
	] });
}
/** Flowing cloak behind the hero — the cloth colour follows the worn chest piece. */
function Cape({ cls, tier }) {
	const c = CLOTH[cls][tier];
	const m = METAL[tier];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 Q108 126 94 168 Q81 220 72 312 Q96 298 118 310 Q126 250 134 210 L172 210 Q181 250 192 302 Q212 290 232 308 Q219 214 208 170 Q196 128 152 124 Z",
			fill: c.dark,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 132 Q114 138 104 178 Q96 226 88 296 Q108 288 120 296 Q126 242 134 208 L152 208 Z",
			fill: c.cloth,
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 132 Q190 138 200 178 Q208 226 216 294 Q196 286 184 296 Q178 242 170 208 L152 208 Z",
			fill: c.light,
			opacity: "0.45"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M96 300 Q112 292 124 300 M180 296 Q196 288 210 296",
			stroke: m.trim,
			strokeWidth: "2.2",
			fill: "none",
			opacity: "0.85"
		}),
		tier >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M92 226 Q150 246 214 222",
			stroke: m.trim,
			strokeWidth: "1.8",
			fill: "none",
			opacity: "0.55"
		})
	] });
}
function Boot({ at, len, m, back }) {
	const { x, y } = at;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${x - 13} ${y - 8} L${x + 5} ${y - 10} Q${x + len} ${y - 6} ${x + len + 3} ${y + 7} Q${x + len - 2} ${y + 15} ${x - 13} ${y + 13} Z`,
			fill: back ? m.dark : m.base,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${x - 12} ${y + 5} Q${x + 4} ${y + 8} ${x + len + 1} ${y + 6}`,
			stroke: m.trim,
			strokeWidth: "2.2",
			fill: "none",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${x - 6} ${y - 5} L${x + 2} ${y + 8}`,
			stroke: m.dark,
			strokeWidth: "1.6",
			opacity: "0.7"
		})
	] });
}
/** Legs and boots, or a robe that hides them (mage). */
function LowerBody({ cls, gender, tier }) {
	const c = CLOTH[cls][tier];
	const m = METAL[tier];
	const p = POSE[cls];
	if (cls === "mage") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 200 Q186 204 196 220 Q212 286 214 340 Q186 358 150 358 Q114 358 86 340 Q88 286 104 220 Q114 204 150 200 Z",
			fill: c.cloth,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 206 Q124 214 118 250 L108 330 Q130 340 150 340 Z",
			fill: c.light,
			opacity: "0.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 206 Q176 214 182 250 L192 330 Q170 340 150 340 Z",
			fill: c.dark,
			opacity: "0.45"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 208 L150 350",
			stroke: c.dark,
			strokeWidth: "2.6",
			opacity: "0.75"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M128 214 Q116 282 112 336 M172 214 Q184 282 188 336",
			stroke: c.dark,
			strokeWidth: "2",
			opacity: "0.45",
			fill: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M88 330 Q150 350 212 328 L214 340 Q186 358 150 358 Q114 358 86 340 Z",
			fill: m.trim,
			opacity: tier >= 2 ? .9 : .5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M96 340 Q150 358 206 338",
			stroke: m.glow,
			strokeWidth: "1.6",
			fill: "none",
			opacity: tier >= 1 ? .7 : .3
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {
			at: p.ankleB,
			len: 18,
			m,
			back: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {
			at: p.ankleF,
			len: 20,
			m
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: p.hipB,
			b: p.kneeB,
			w: 26,
			bend: 4,
			fill: c.dark,
			shade: c.cloth
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: p.kneeB,
			b: p.ankleB,
			w: 21,
			bend: 3,
			fill: c.dark,
			shade: c.cloth
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: p.hipF,
			b: p.kneeF,
			w: 27,
			bend: -5,
			fill: c.cloth,
			shade: c.dark,
			light: c.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: p.kneeF,
			b: p.ankleF,
			w: 22,
			bend: -4,
			fill: c.cloth,
			shade: c.dark,
			light: c.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: p.kneeF.x,
			cy: p.kneeF.y,
			rx: "11",
			ry: "9",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2",
			transform: `rotate(-8 ${p.kneeF.x} ${p.kneeF.y})`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: p.kneeB.x,
			cy: p.kneeB.y,
			rx: "10",
			ry: "8",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2",
			transform: `rotate(6 ${p.kneeB.x} ${p.kneeB.y})`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {
			at: p.ankleB,
			len: 18,
			m,
			back: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {
			at: p.ankleF,
			len: 22,
			m
		}),
		gender === "female" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${p.hipF.x} ${p.hipF.y + 6} L${p.kneeF.x + 4} ${p.kneeF.y - 6}`,
			stroke: m.trim,
			strokeWidth: "1.6",
			opacity: "0.3"
		})
	] });
}
/** Bare torso the chest piece sits over: skin at the collar, cloth underneath. */
function Torso({ cls, tier }) {
	const c = CLOTH[cls][tier];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M138 104 L138 132 Q152 142 166 132 L166 104 Q152 112 138 104 Z",
			fill: SKIN.base
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M138 108 Q152 122 166 108",
			stroke: SKIN.shade,
			strokeWidth: "2.2",
			fill: "none",
			opacity: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 122 L188 148 Q198 180 190 214 L114 214 Q106 180 116 148 Z",
			fill: c.cloth,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 L152 212",
			stroke: c.dark,
			strokeWidth: "2",
			opacity: "0.5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 150 Q126 172 122 212",
			stroke: c.dark,
			strokeWidth: "2",
			opacity: "0.35",
			fill: "none"
		})
	] });
}
/** One arm, from shoulder to hand, ending in a fist or an open casting palm. */
function Arm({ cls, tier, which }) {
	const c = CLOTH[cls][tier];
	const m = METAL[tier];
	const p = POSE[cls];
	const shoulder = which === "weapon" ? p.weaponShoulder : p.freeShoulder;
	const elbow = which === "weapon" ? p.weaponElbow : p.freeElbow;
	const hand = which === "weapon" ? p.weaponHand : p.freeHand;
	const dir = Math.atan2(hand.y - elbow.y, hand.x - elbow.x) * (180 / Math.PI);
	const open = which === "free" && cls === "mage";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: shoulder,
			b: elbow,
			w: 19,
			bend: which === "weapon" ? -5 : 5,
			fill: c.cloth,
			shade: c.dark,
			light: c.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Limb, {
			a: elbow,
			b: hand,
			w: 15.5,
			bend: which === "weapon" ? 3 : -4,
			fill: m.base,
			shade: m.dark,
			light: m.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: elbow.x,
			cy: elbow.y,
			rx: "9",
			ry: "8",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.8",
			transform: `rotate(${dir} ${elbow.x} ${elbow.y})`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: `rotate(${dir} ${hand.x} ${hand.y})`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: hand.x,
					cy: hand.y,
					rx: open ? 7.4 : 7.8,
					ry: "8.4",
					fill: SKIN.base,
					stroke: INK,
					strokeWidth: "1.8"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M${hand.x - 4} ${hand.y - 1} Q${hand.x} ${hand.y + 2.5} ${hand.x + 4} ${hand.y - 1}`,
					stroke: SKIN.shade,
					strokeWidth: "1.4",
					fill: "none"
				}),
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M${hand.x - 2} ${hand.y - 7} L${hand.x - 3} ${hand.y - 12} M${hand.x + 1.5} ${hand.y - 7.5} L${hand.x + 2} ${hand.y - 13}`,
					stroke: SKIN.base,
					strokeWidth: "3.2",
					strokeLinecap: "round"
				})
			]
		})
	] });
}
/** Head: hair mass behind, face with eyes/brows/nose/mouth, then hair in front. */
function Head({ cls, gender }) {
	const h = HAIR[cls][gender];
	const female = gender === "female";
	const { x: cx, y: cy } = HEAD;
	const eyeL = cx - 13;
	const eyeR = cx + 14;
	const eyeY = cy + 3;
	const rx = female ? 10.2 : 9.4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HairBack, {
			cls,
			gender
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: cx - 36,
			cy: cy + 4,
			rx: "5.4",
			ry: "8.4",
			fill: SKIN.base,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: cx + 36,
			cy: cy + 4,
			rx: "5.4",
			ry: "8.4",
			fill: SKIN.base,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		female && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: cx + 36,
			cy: cy + 10,
			r: "2.1",
			fill: METAL[2].trim,
			stroke: "#1a1119",
			strokeWidth: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 46 C177 46 189 62 189 85 C189 102 183 114 169 122 C161 127 155 130 152 131 C149 130 143 127 135 122 C121 114 115 102 115 85 C115 62 127 46 152 46 Z",
			fill: SKIN.base,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 46 C177 46 189 62 189 85 C189 96 186 105 180 112 C180 88 172 66 152 60 Z",
			fill: SKIN.light,
			opacity: "0.55"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M117 96 Q126 118 152 129 Q178 118 187 96 Q181 116 152 125 Q123 116 117 96 Z",
			fill: SKIN.shade,
			opacity: "0.35"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M117 86 Q113 66 126 54 Q118 72 121 90 Z",
			fill: SKIN.shade,
			opacity: "0.3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: cx - 21,
			cy: eyeY + 16,
			rx: "8.5",
			ry: "4.4",
			fill: SKIN.blush,
			opacity: female ? .3 : .16
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
			cx: cx + 21,
			cy: eyeY + 16,
			rx: "8.5",
			ry: "4.4",
			fill: SKIN.blush,
			opacity: female ? .3 : .16
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeL - rx} ${eyeY + 1} Q${eyeL} ${eyeY - 10.5} ${eyeL + rx} ${eyeY} Q${eyeL} ${eyeY + 9} ${eyeL - rx} ${eyeY + 1} Z`,
			fill: "#fdfaf5",
			stroke: INK,
			strokeWidth: "1.3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeR - rx - 1} ${eyeY} Q${eyeR} ${eyeY - 10.5} ${eyeR + rx} ${eyeY + 1} Q${eyeR} ${eyeY + 9} ${eyeR - rx - 1} ${eyeY} Z`,
			fill: "#fdfaf5",
			stroke: INK,
			strokeWidth: "1.3"
		}),
		[eyeL, eyeR].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: x,
				cy: eyeY + .6,
				rx: "5.7",
				ry: "6.5",
				fill: h.eye
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: x,
				cy: eyeY - 1.4,
				rx: "5.7",
				ry: "4",
				fill: "#150d16",
				opacity: "0.45"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: x,
				cy: eyeY + 3,
				rx: "4.2",
				ry: "3.4",
				fill: "#ffffff",
				opacity: "0.25"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x,
				cy: eyeY + .6,
				r: "2.5",
				fill: "#170f14"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x - 1.8,
				cy: eyeY - 2.2,
				r: "1.9",
				fill: "#ffffff",
				opacity: "0.95"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x + 2,
				cy: eyeY + 3.2,
				r: "0.9",
				fill: "#ffffff",
				opacity: "0.7"
			})
		] }, x)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeL - rx} ${eyeY + 1} Q${eyeL} ${eyeY - 10.5} ${eyeL + rx} ${eyeY}`,
			stroke: INK,
			strokeWidth: female ? 2.8 : 2.4,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeR - rx - 1} ${eyeY} Q${eyeR} ${eyeY - 10.5} ${eyeR + rx} ${eyeY + 1}`,
			stroke: INK,
			strokeWidth: female ? 2.8 : 2.4,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeL - rx} ${eyeY + 1} L${eyeL - rx - 4} ${eyeY - 3} M${eyeR + rx} ${eyeY + 1} L${eyeR + rx + 4} ${eyeY - 3}`,
			stroke: INK,
			strokeWidth: female ? 2.2 : 1.8,
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeL - rx + 3} ${eyeY + 5} Q${eyeL} ${eyeY + 9.5} ${eyeL + rx - 3} ${eyeY + 4} M${eyeR - rx + 2} ${eyeY + 5} Q${eyeR} ${eyeY + 9.5} ${eyeR + rx - 3} ${eyeY + 4}`,
			stroke: SKIN.light,
			strokeWidth: "1.1",
			fill: "none",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeL - 11} ${eyeY - 12} Q${eyeL - 1} ${eyeY - 18} ${eyeL + 10} ${eyeY - 12.5}`,
			stroke: h.dark,
			strokeWidth: female ? 2.6 : 3.2,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${eyeR - 9} ${eyeY - 12.5} Q${eyeR + 2} ${eyeY - 18} ${eyeR + 12} ${eyeY - 11}`,
			stroke: h.dark,
			strokeWidth: female ? 2.6 : 3.2,
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx + 2} ${eyeY + 4} Q${cx - 1.5} ${eyeY + 12} ${cx + 4} ${eyeY + 14}`,
			stroke: SKIN.line,
			strokeWidth: "1.6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx + 3.6} ${eyeY + 14} q2.6 0.4 3 -1.4`,
			stroke: SKIN.deep,
			strokeWidth: "1.4",
			fill: "none",
			strokeLinecap: "round",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx + 1} ${eyeY + 7} q-1.6 4 0.4 6`,
			stroke: SKIN.light,
			strokeWidth: "1.2",
			fill: "none",
			opacity: "0.6"
		}),
		female ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M${cx - 9} ${eyeY + 22} Q${cx} ${eyeY + 18} ${cx + 9} ${eyeY + 22} Q${cx} ${eyeY + 25.5} ${cx - 9} ${eyeY + 22} Z`,
				fill: SKIN.lip
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M${cx - 8.5} ${eyeY + 22.5} Q${cx} ${eyeY + 30} ${cx + 8.5} ${eyeY + 22.5} Q${cx} ${eyeY + 25.5} ${cx - 8.5} ${eyeY + 22.5} Z`,
				fill: "#d9786c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M${cx - 4} ${eyeY + 26} Q${cx} ${eyeY + 27.6} ${cx + 4} ${eyeY + 26}`,
				stroke: "#f6c4b6",
				strokeWidth: "1.2",
				fill: "none",
				opacity: "0.9"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx - 8} ${eyeY + 22} Q${cx} ${eyeY + 19.5} ${cx + 8} ${eyeY + 22} Q${cx} ${eyeY + 25} ${cx - 8} ${eyeY + 22} Z`,
			fill: SKIN.lipDark,
			opacity: "0.85"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx - 7.5} ${eyeY + 22.5} Q${cx} ${eyeY + 27} ${cx + 7.5} ${eyeY + 22.5} Q${cx} ${eyeY + 25} ${cx - 7.5} ${eyeY + 22.5} Z`,
			fill: SKIN.lip
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HairFront, {
			cls,
			gender
		})
	] });
}
function HairBack({ cls, gender }) {
	const h = HAIR[cls][gender];
	const female = gender === "female";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [female && cls !== "archer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: cls === "mage" ? "M152 36 C107 36 97 70 103 106 C107 132 99 154 91 172 Q112 168 124 150 C116 124 114 100 120 82 C126 58 136 48 152 48 C168 48 178 58 184 82 C190 100 188 124 180 150 Q192 168 213 172 C205 154 197 132 201 106 C207 70 197 36 152 36 Z" : "M152 38 C112 38 101 70 105 104 C108 132 100 158 94 184 Q112 178 122 164 C116 132 112 104 118 84 C124 60 136 50 152 50 C168 50 180 60 186 84 C192 104 188 132 182 164 Q192 178 210 184 C204 158 196 132 199 104 C203 70 192 38 152 38 Z",
		fill: h.dark,
		stroke: INK,
		strokeWidth: "2.2",
		strokeLinejoin: "round"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: cls === "archer" && female ? "M152 40 C120 40 108 60 110 88 C111 100 114 108 118 114 C112 92 118 72 132 63 C140 58 146 56 152 56 C158 56 164 58 172 63 C186 72 192 92 186 114 C190 108 193 100 194 88 C196 60 184 40 152 40 Z" : cls === "mage" ? "M152 40 C122 40 110 58 111 86 C111 102 114 112 119 120 C114 96 120 76 132 66 C140 60 146 57 152 57 C158 57 164 60 172 66 C184 76 190 96 185 120 C190 112 193 102 193 86 C194 58 182 40 152 40 Z" : "M152 42 C124 42 112 58 112 82 C112 98 114 108 118 116 C114 92 120 74 132 64 C140 58 146 56 152 56 C158 56 164 58 172 64 C184 74 190 92 186 116 C190 108 192 98 192 82 C192 58 180 42 152 42 Z",
		fill: h.dark,
		stroke: INK,
		strokeWidth: "2.2",
		strokeLinejoin: "round"
	}), cls === "archer" && female && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M182 52 C208 56 219 82 214 112 C211 134 200 148 186 157 C197 133 199 106 191 88 C187 74 183 63 182 52 Z",
			fill: h.hair,
			stroke: "#1a1119",
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M190 74 C200 88 201 110 194 130",
			stroke: h.light,
			strokeWidth: "2",
			fill: "none",
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "184",
			cy: "52",
			r: "4",
			fill: METAL[0].trim,
			stroke: "#1a1119",
			strokeWidth: "1.4"
		})
	] })] });
}
function HairFront({ cls, gender }) {
	const h = HAIR[cls][gender];
	const female = gender === "female";
	const common = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M152 42 C126 42 112 58 112 88 C112 94 113 98 116 102 C118 78 128 62 140 56 C146 53 149 52 152 52 C155 52 158 53 164 56 C176 62 186 78 188 102 C191 98 192 94 192 88 C192 58 178 42 152 42 Z",
		fill: h.hair,
		stroke: INK,
		strokeWidth: "2",
		strokeLinejoin: "round"
	});
	if (female && (cls === "warrior" || cls === "mage")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		common,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 44 Q128 46 118 66 Q132 56 152 54 Q172 56 186 66 Q176 46 152 44 Z",
			fill: h.light,
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 54 Q140 62 134 80 M152 54 Q164 62 170 80",
			stroke: h.dark,
			strokeWidth: "1.6",
			fill: "none",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: cls === "mage" ? "M120 66 C108 88 110 112 118 132 C124 140 132 140 134 132 C126 112 124 88 130 70 Z" : "M120 66 C110 90 112 116 120 138 C126 146 134 144 136 136 C128 114 126 88 132 70 Z",
			fill: h.hair,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M184 66 C194 90 192 116 184 138 C178 146 170 144 168 136 C176 114 178 88 172 70 Z",
			fill: h.hair,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M124 76 C118 96 118 116 124 132 M180 76 C186 96 186 116 180 132",
			stroke: h.light,
			strokeWidth: "1.8",
			fill: "none",
			opacity: "0.55"
		}),
		cls === "mage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M122 62 Q152 50 182 62",
			stroke: METAL[3].trim,
			strokeWidth: "2.2",
			fill: "none",
			opacity: "0.75"
		}),
		cls === "mage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "57",
			r: "2.6",
			fill: METAL[2].glow,
			stroke: "#1a1119",
			strokeWidth: "0.9"
		})
	] });
	if (cls === "archer" && female) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 42 C126 42 114 58 114 84 C114 94 116 100 119 104 C122 80 132 64 146 58 C154 55 160 56 166 60 C176 66 183 78 185 96 C188 88 189 80 188 72 C184 52 172 42 152 42 Z",
			fill: h.hair,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 44 Q132 50 124 66 Q138 54 152 52 Q166 52 180 64 Q172 46 150 44 Z",
			fill: h.light,
			opacity: "0.65"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M120 68 C112 90 114 112 122 130 C128 138 135 136 136 128 C129 110 127 88 132 70 Z",
			fill: h.hair,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M150 52 Q162 58 168 72",
			stroke: h.dark,
			strokeWidth: "1.6",
			fill: "none",
			opacity: "0.6"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: cls === "mage" ? "M152 42 C126 42 112 58 112 88 C112 96 113 100 116 104 C118 80 128 64 142 58 C136 68 134 76 136 82 C142 64 148 58 152 58 C158 58 170 66 176 80 C181 90 180 98 178 104 C184 96 189 90 189 78 C188 55 178 42 152 42 Z" : "M152 42 C126 42 114 56 114 80 C114 92 117 100 121 106 C118 84 126 66 140 58 C132 68 130 78 132 84 C138 66 146 58 152 58 C160 58 172 66 177 80 C181 90 180 100 178 106 C185 98 190 88 189 78 C188 55 178 42 152 42 Z",
			fill: h.hair,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M124 66 Q138 52 154 50 Q142 60 136 72 Q130 80 124 66 Z",
			fill: h.light,
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M176 60 Q184 72 185 92 Q190 84 187 70 Z",
			fill: h.dark,
			opacity: "0.7"
		}),
		cls === "mage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 74 C112 92 114 112 120 124 C125 130 131 128 132 121 C126 106 124 88 128 76 Z",
			fill: h.hair,
			stroke: "#1a1119",
			strokeWidth: "2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M186 74 C192 92 190 112 184 124 C179 130 173 128 172 121 C178 106 180 88 176 76 Z",
			fill: h.hair,
			stroke: "#1a1119",
			strokeWidth: "2"
		})] }),
		cls === "archer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M116 72 Q152 60 188 72 L188 79 Q152 68 116 79 Z",
			fill: CLOTH.archer[0].dark,
			stroke: "#1a1119",
			strokeWidth: "1.6"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M180 74 L188 88 L180 92 Z",
			fill: CLOTH.archer[0].dark,
			stroke: "#1a1119",
			strokeWidth: "1.4"
		})] })
	] });
}
/**
* Armour, robes and jerkins — four clearly different materials per class, one per
* gear band. Every look is a texture, not a colour swap: riveted iron, cracked
* ember plate, moonsteel filigree and engraved ancestral gold.
*/
function Chest({ cls, tier }) {
	if (cls === "warrior") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarriorChest, { tier });
	if (cls === "mage") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MageChest, { tier });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcherChest, { tier });
}
var plate = "M152 122 L188 148 Q198 180 190 214 L114 214 Q106 180 116 148 Z";
/** Rows of overlapping scales, the ember and moon signature. */
function Scales({ y0, rows, w, h, fill, dark, light }) {
	const out = [];
	for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) {
		const cx = 122 + c * w + (r % 2 ? w / 2 : 0);
		const cy = y0 + r * h;
		out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: `M${cx - w / 2} ${cy} Q${cx} ${cy + h * 1.15} ${cx + w / 2} ${cy} Z`,
			fill: (r + c) % 2 ? fill : dark,
			stroke: INK,
			strokeWidth: "0.9",
			opacity: "0.95"
		}, `${r}-${c}`));
	}
	out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: `M120 ${y0 + 4} Q152 ${y0 + 12} 184 ${y0 + 4}`,
		stroke: light,
		strokeWidth: "1.6",
		fill: "none",
		opacity: "0.5"
	}, "lit"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: out });
}
function Rivets({ pts, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: pts.map(([x, y]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: x,
		cy: y,
		r: "2.6",
		fill: color,
		stroke: INK,
		strokeWidth: "0.9"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: x - .5,
		cy: y - .7,
		r: "0.9",
		fill: "#ffffff",
		opacity: "0.75"
	})] }, `${x}-${y}`)) });
}
function Pauldrons({ tier, style }) {
	const m = METAL[tier];
	const left = style === "spike" ? "M122 142 Q100 128 88 132 L80 124 L90 158 Q104 170 120 172 Z" : style === "ornate" ? "M124 140 Q100 126 86 140 Q84 154 94 168 Q110 174 124 172 Z" : "M122 140 Q100 132 90 152 Q96 172 116 172 Q120 158 124 146 Z";
	const right = style === "spike" ? "M180 140 Q202 126 214 130 L222 122 L212 156 Q198 168 182 170 Z" : style === "ornate" ? "M180 140 Q204 126 218 140 Q220 154 210 168 Q194 174 180 172 Z" : "M180 140 Q202 132 212 152 Q206 172 186 172 Q182 158 178 146 Z";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: left,
			fill: m.base,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: right,
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M92 152 Q104 140 118 148",
			stroke: m.light,
			strokeWidth: "2",
			fill: "none",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M210 152 Q198 140 184 148",
			stroke: m.trim,
			strokeWidth: "2",
			fill: "none",
			opacity: "0.85"
		}),
		style !== "round" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M100 160 Q110 168 120 164",
			stroke: m.glow,
			strokeWidth: "1.8",
			fill: "none",
			opacity: "0.8"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M204 160 Q194 168 184 164",
			stroke: m.glow,
			strokeWidth: "1.8",
			fill: "none",
			opacity: "0.8"
		})] })
	] });
}
function WarriorChest({ tier }) {
	const m = METAL[tier];
	CLOTH.warrior[tier];
	if (tier === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: plate,
			fill: m.base,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 L152 212 L114 212 Q106 180 116 148 Z",
			fill: m.light,
			opacity: "0.34"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 164 Q152 174 190 164 L190 178 Q152 188 114 178 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rivets, {
			pts: [
				[120, 170],
				[134, 173],
				[148, 175],
				[162, 173],
				[176, 170],
				[122, 190],
				[150, 195],
				[178, 190],
				[124, 144],
				[180, 144]
			],
			color: m.trim
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M124 132 Q152 122 180 132 L176 146 Q152 136 128 146 Z",
			fill: m.light,
			stroke: INK,
			strokeWidth: "1.8",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M120 146 L184 200",
			stroke: m.trim,
			strokeWidth: "7",
			opacity: "0.5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 202 H190 V214 H114 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 206 H190",
			stroke: m.trim,
			strokeWidth: "1.6",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pauldrons, {
			tier,
			style: "round"
		})
	] });
	if (tier === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: plate,
			fill: m.base,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scales, {
			y0: 150,
			rows: 4,
			w: 22,
			h: 16,
			fill: m.base,
			dark: m.dark,
			light: m.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M126 136 L140 168 L128 186 M176 138 L164 170 L178 194 M152 140 L152 206",
			stroke: m.glow,
			strokeWidth: "2.2",
			fill: "none",
			opacity: "0.95"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M126 136 L140 168 L128 186 M176 138 L164 170 L178 194",
			stroke: m.edge,
			strokeWidth: "0.8",
			fill: "none",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "140",
			r: "9",
			fill: m.glow,
			opacity: "0.28"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M148 132 L156 132 L158 148 L152 154 L146 148 Z",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "142",
			r: "3.2",
			fill: m.glow
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 198 H190 V214 H114 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 202 H186",
			stroke: m.trim,
			strokeWidth: "1.6",
			strokeDasharray: "5 4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pauldrons, {
			tier,
			style: "spike"
		})
	] });
	if (tier === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: plate,
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 L182 148 L178 200 L152 212 L126 200 L122 148 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 130 L152 206",
			stroke: m.light,
			strokeWidth: "3",
			opacity: "0.95"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M136 150 Q152 142 168 150 Q166 176 152 190 Q138 176 136 150 Z",
			fill: "none",
			stroke: m.trim,
			strokeWidth: "2.2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M130 156 Q124 176 132 192 M174 156 Q180 176 172 192",
			stroke: m.trim,
			strokeWidth: "1.8",
			fill: "none",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "166",
			r: "11",
			fill: "none",
			stroke: m.light,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 158 L156 166 L152 176 L148 166 Z",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "166",
			r: "20",
			fill: m.glow,
			opacity: "0.2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 198 H190 V214 H114 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 203 H186",
			stroke: m.light,
			strokeWidth: "1.6",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pauldrons, {
			tier,
			style: "spike"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: plate,
			fill: m.base,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 L152 212 L114 212 Q106 180 116 148 Z",
			fill: m.light,
			opacity: "0.3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 140 Q152 126 186 140 Q182 152 152 150 Q122 152 118 140 Z",
			fill: m.light,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M124 158 Q152 148 180 158 Q176 178 152 186 Q128 178 124 158 Z",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.8",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M136 164 Q152 158 168 164 Q164 176 152 180 Q140 176 136 164 Z",
			fill: "none",
			stroke: m.light,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 152 L152 186 M136 168 L168 174 M168 168 L136 174",
			stroke: m.light,
			strokeWidth: "1.2",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M142 190 L152 182 L162 190 L152 202 Z",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "152",
			cy: "192",
			r: "18",
			fill: m.glow,
			opacity: "0.22"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M114 200 H190 V212 H114 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rivets, {
			pts: [
				[120, 206],
				[152, 206],
				[184, 206],
				[122, 136],
				[182, 136]
			],
			color: m.trim
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pauldrons, {
			tier,
			style: "ornate"
		})
	] });
}
function MageChest({ tier }) {
	const m = METAL[tier];
	const c = CLOTH.mage[tier];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M116 140 Q152 126 188 140 Q196 178 190 214 L114 214 Q106 178 116 140 Z",
			fill: c.light,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 138 Q128 150 126 214 L178 214 Q176 150 152 138 Z",
			fill: c.cloth,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 142 L152 212",
			stroke: c.dark,
			strokeWidth: "2",
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M120 132 Q152 118 184 132 Q180 150 152 154 Q124 150 120 132 Z",
			fill: tier === 0 ? c.cloth : m.base,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 154 L128 130 L139 120 L152 138 L165 120 L176 130 Z",
			fill: tier >= 2 ? m.light : c.dark,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		tier === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M116 198 Q152 208 188 198",
				stroke: m.trim,
				strokeWidth: "5",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M116 198 Q152 208 188 198",
				stroke: m.dark,
				strokeWidth: "1.4",
				fill: "none",
				strokeDasharray: "4 5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M126 150 Q152 162 178 150",
				stroke: c.dark,
				strokeWidth: "1.4",
				fill: "none",
				strokeDasharray: "3 4",
				opacity: "0.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "204",
				r: "3.4",
				fill: m.trim,
				stroke: "#1a1119",
				strokeWidth: "1.2"
			})
		] }),
		tier === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M136 160 L136 200 M168 160 L168 200 M136 172 L168 188 M168 172 L136 188",
				stroke: m.glow,
				strokeWidth: "1.8",
				fill: "none",
				opacity: "0.9"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "158",
				r: "6",
				fill: m.glow,
				stroke: "#1a1119",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "158",
				r: "13",
				fill: m.glow,
				opacity: "0.25"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M126 204 Q152 212 178 204",
				stroke: m.trim,
				strokeWidth: "2.6",
				fill: "none",
				strokeDasharray: "6 4",
				opacity: "0.9"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M122 150 Q152 160 182 150",
				stroke: m.trim,
				strokeWidth: "2",
				fill: "none",
				opacity: "0.7"
			})
		] }),
		tier === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M124 138 Q152 128 180 138",
				stroke: m.trim,
				strokeWidth: "2.2",
				fill: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M134 162 Q152 154 170 162 Q166 190 152 202 Q138 190 134 162 Z",
				fill: "none",
				stroke: m.light,
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M152 166 a8 8 0 1 0 0.1 0 Z",
				fill: m.glow,
				opacity: "0.85"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "174",
				r: "14",
				fill: m.glow,
				opacity: "0.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M124 200 Q152 210 180 200",
				stroke: m.light,
				strokeWidth: "2.2",
				fill: "none",
				opacity: "0.85"
			})
		] }),
		tier === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M118 138 Q152 126 186 138",
				stroke: m.light,
				strokeWidth: "2.6",
				fill: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M152 158 L166 174 L152 192 L138 174 Z",
				fill: m.trim,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "174",
				r: "4.6",
				fill: m.glow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "174",
				r: "19",
				fill: m.glow,
				opacity: "0.24"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M126 164 Q152 156 178 164 M126 196 Q152 204 178 196",
				stroke: m.light,
				strokeWidth: "1.8",
				fill: "none",
				opacity: "0.85"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M120 132 Q108 120 111 104 Q124 114 133 128 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M184 132 Q196 120 193 104 Q180 114 171 128 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			})
		] })
	] });
}
function ArcherChest({ tier }) {
	const m = METAL[tier];
	const c = CLOTH.archer[tier];
	const hide = tier === 0 ? "#7a5334" : tier === 1 ? "#4b2b20" : tier === 2 ? "#37475f" : "#2f5c42";
	const hideDark = tier === 0 ? "#4e331f" : tier === 1 ? "#2c1811" : tier === 2 ? "#212c3d" : "#1a3a29";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 120 L188 140 Q198 176 188 214 L116 214 Q104 176 112 140 Z",
			fill: hide,
			stroke: INK,
			strokeWidth: "2.4",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 124 L152 210 L116 210 Q104 176 112 140 Z",
			fill: tier === 0 ? "#9c7048" : tier === 1 ? "#6d3f2c" : tier === 2 ? "#4e6079" : "#437a5a",
			opacity: "0.45"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 138 L186 204",
			stroke: hideDark,
			strokeWidth: "12",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M118 138 L186 204",
			stroke: m.trim,
			strokeWidth: "2",
			strokeDasharray: "5 6",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M124 132 Q152 118 180 132 L176 144 Q152 132 128 144 Z",
			fill: c.cloth,
			stroke: INK,
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 144 Q134 156 132 210 L170 210 Q168 156 152 144 Z",
			fill: c.dark,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M152 146 L152 208",
			stroke: c.cloth,
			strokeWidth: "2",
			opacity: "0.6"
		}),
		tier === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M120 152 L136 200 M184 152 L168 200",
				stroke: hideDark,
				strokeWidth: "2",
				fill: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M120 152 L136 200",
				stroke: m.trim,
				strokeWidth: "1.4",
				strokeDasharray: "3 4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M184 152 L168 200",
				stroke: m.trim,
				strokeWidth: "1.4",
				strokeDasharray: "3 4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rivets, {
				pts: [
					[122, 158],
					[180, 158],
					[124, 186],
					[178, 186]
				],
				color: m.light
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M132 170 Q150 178 168 170",
				stroke: m.trim,
				strokeWidth: "1.6",
				fill: "none",
				strokeDasharray: "3 4"
			})
		] }),
		tier === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M118 160 Q152 150 186 160 L184 176 Q152 166 120 176 Z",
				fill: hideDark,
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "138",
				y: "152",
				width: "26",
				height: "10",
				rx: "2",
				fill: m.trim,
				stroke: "#1a1119",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M142 157 H160",
				stroke: m.dark,
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "186",
				r: "6",
				fill: m.glow,
				stroke: "#1a1119",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "186",
				r: "13",
				fill: m.glow,
				opacity: "0.24"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M118 134 Q124 124 132 132 Q140 122 148 132 Q156 122 164 132 Q172 122 180 132 L180 140 L118 140 Z",
				fill: m.dark,
				stroke: "#1a1119",
				strokeWidth: "1.6"
			})
		] }),
		tier === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scales, {
				y0: 158,
				rows: 3,
				w: 24,
				h: 17,
				fill: m.base,
				dark: m.dark,
				light: m.light
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M152 148 L160 162 L152 176 L144 162 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "162",
				r: "14",
				fill: m.glow,
				opacity: "0.18"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M178 132 Q192 142 190 160 Q182 168 174 160 Q178 146 172 136 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			})
		] }),
		tier === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M120 136 Q152 124 184 136",
				stroke: m.light,
				strokeWidth: "2.4",
				fill: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M152 150 Q172 162 178 184 Q152 198 126 184 Q132 162 152 150 Z",
				fill: "none",
				stroke: m.trim,
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M152 156 Q160 168 152 182 Q144 168 152 156 Z",
				fill: m.glow,
				stroke: "#1a1119",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M136 162 Q140 176 134 186 M168 162 Q164 176 170 186",
				stroke: m.light,
				strokeWidth: "1.6",
				fill: "none",
				opacity: "0.9"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "152",
				cy: "168",
				r: "15",
				fill: m.glow,
				opacity: "0.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M120 140 Q110 126 112 112 Q124 124 130 136 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M184 140 Q194 126 192 112 Q180 124 174 136 Z",
				fill: m.base,
				stroke: "#1a1119",
				strokeWidth: "1.8"
			})
		] })
	] });
}
var GRIP = "#3a271c";
var WOOD = "#7a5334";
var WOOD_DARK = "#4a3120";
/** The weapon, drawn in local space with the grip at the origin and the head pointing up (-y). */
function Weapon({ cls, tier }) {
	if (cls === "warrior") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarriorWeapon, { tier });
	if (cls === "mage") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MageWeapon, { tier });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcherWeapon, { tier });
}
function WarriorWeapon({ tier }) {
	const m = METAL[tier];
	const grip = (len, w, color = GRIP) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: `M0 ${-len / 2} V${len / 2}`,
		stroke: color,
		strokeWidth: w,
		strokeLinecap: "round"
	});
	if (tier === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		grip(22, 7),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "11",
			r: "5",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-16 -16 H16",
			stroke: m.trim,
			strokeWidth: "5.5",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-5.5 -18 L-5 -112 L0 -132 L5 -112 L5.5 -18 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -122 V-26",
			stroke: m.light,
			strokeWidth: "2.2",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -112 V-28",
			stroke: m.dark,
			strokeWidth: "1.2",
			opacity: "0.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-16",
			r: "2",
			fill: m.edge
		})
	] });
	if (tier === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		grip(24, 7.5),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-20 -18 Q0 -28 20 -18",
			stroke: m.trim,
			strokeWidth: "6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-7 -20 C-11 -58 -9 -98 -3 -120 C0 -132 5 -128 6 -114 C8 -78 6 -44 7 -20 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-7 -22 C-11 -58 -9 -98 -3 -120",
			stroke: m.glow,
			strokeWidth: "2.6",
			fill: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -40 L-2 -70 L1 -90 L-1 -112",
			stroke: m.glow,
			strokeWidth: "1.2",
			fill: "none",
			opacity: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3 -34 L2 -60 M3 -74 L2 -102",
			stroke: m.dark,
			strokeWidth: "1.4",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "13",
			r: "5.4",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "13",
			r: "11",
			fill: m.glow,
			opacity: "0.28"
		})
	] });
	if (tier === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		grip(22, 6.5),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-18 -18 Q0 -11 18 -18 Q9 -23 0 -20 Q-9 -23 -18 -18 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "1.8",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-4.5 -22 L-3.5 -124 L0 -140 L3.5 -124 L4.5 -22 Z",
			fill: m.light,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -128 V-28",
			stroke: m.trim,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-2.4 -50 L-2.4 -100 M2.4 -50 L2.4 -100",
			stroke: m.glow,
			strokeWidth: "1.2",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "13",
			r: "4.8",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "13",
			r: "11",
			fill: m.glow,
			opacity: "0.3"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		grip(28, 8),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-27 -18 Q-13 -27 0 -21 Q13 -27 27 -18 Q18 -7 0 -12 Q-18 -7 -27 -18 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-27 -18 L-36 -31 M27 -18 L36 -31",
			stroke: m.light,
			strokeWidth: "3",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-8 -22 L-6 -124 L0 -142 L6 -124 L8 -22 Z",
			fill: m.light,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -128 V-26",
			stroke: m.trim,
			strokeWidth: "2.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-6 -62 H6 M-6 -94 H6",
			stroke: m.base,
			strokeWidth: "2.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-3 -70 Q0 -76 3 -70 M-3 -102 Q0 -108 3 -102",
			stroke: m.glow,
			strokeWidth: "1.6",
			fill: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -122 L0 -26",
			stroke: m.glow,
			strokeWidth: "1.2",
			opacity: "0.7"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "14",
			r: "6",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "14",
			r: "2.6",
			fill: m.glow
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-72",
			r: "26",
			fill: m.glow,
			opacity: "0.14"
		})
	] });
}
function MageWeapon({ tier }) {
	const m = METAL[tier];
	if (tier === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 12 C-2 -12 2 -34 0 -56",
			stroke: WOOD,
			strokeWidth: "6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-3 -20 Q2 -24 3 -18 M-2 -38 Q2 -42 3 -36",
			stroke: WOOD_DARK,
			strokeWidth: "1.8",
			fill: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-7 -54 Q0 -66 7 -54 Q0 -46 -7 -54 Z",
			fill: "#5f9a52",
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-64",
			r: "6.6",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-64",
			r: "13",
			fill: m.glow,
			opacity: "0.22"
		})
	] });
	if (tier === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 14 V-112",
			stroke: "#53392a",
			strokeWidth: "7",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-2 -20 L1 -48 L-1 -70 L1 -96",
			stroke: m.glow,
			strokeWidth: "1.6",
			fill: "none",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-3 -30 H3 M-3 -54 H3 M-3 -78 H3",
			stroke: "#2c1c14",
			strokeWidth: "3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-9 -104 Q0 -95 9 -104",
			stroke: m.trim,
			strokeWidth: "3.6",
			fill: "none"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-122",
			r: "11",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-122",
			r: "6.6",
			fill: m.glow
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-122",
			r: "21",
			fill: m.glow,
			opacity: "0.3"
		})
	] });
	if (tier === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 14 V-110",
			stroke: m.dark,
			strokeWidth: "5.6",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 14 V-110",
			stroke: m.light,
			strokeWidth: "2",
			opacity: "0.75"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-12 -118 Q-3 -134 4 -118",
			stroke: m.base,
			strokeWidth: "3.6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M12 -118 Q3 -134 -4 -118",
			stroke: m.base,
			strokeWidth: "3.6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-124",
			r: "8",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-124",
			r: "17",
			fill: m.glow,
			opacity: "0.26"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-6",
			r: "4",
			fill: m.trim,
			stroke: INK,
			strokeWidth: "1.2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-4 -40 L0 -46 L4 -40 L0 -34 Z",
			fill: m.light,
			stroke: INK,
			strokeWidth: "1",
			opacity: "0.9"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 16 V-104",
			stroke: m.base,
			strokeWidth: "6",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 16 V-104",
			stroke: m.light,
			strokeWidth: "2",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-7 -8 H7 M-7 -42 H7 M-7 -76 H7",
			stroke: m.trim,
			strokeWidth: "3.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-17 -108 Q-9 -136 0 -114 Q9 -136 17 -108 Q9 -94 0 -104 Q-9 -94 -17 -108 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "2",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-21 -120 Q-34 -134 -26 -146 Q-13 -139 -10 -124 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M21 -120 Q34 -134 26 -146 Q13 -139 10 -124 Z",
			fill: m.base,
			stroke: INK,
			strokeWidth: "1.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 -130 L7 -116 L0 -104 L-7 -116 Z",
			fill: m.glow,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "-116",
			r: "25",
			fill: m.glow,
			opacity: "0.2"
		})
	] });
}
function ArcherWeapon({ tier }) {
	const m = METAL[tier];
	if (tier === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-14 -22 -18 -50 10 -76",
			stroke: WOOD,
			strokeWidth: "5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-14 22 -18 50 10 76",
			stroke: WOOD,
			strokeWidth: "5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M10 -76 L10 76",
			stroke: "#e8e0cf",
			strokeWidth: "1.4",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-5 -9 Q0 -5 5 0 Q0 5 -5 9 Z",
			fill: WOOD_DARK,
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-8 -24 Q-4 -20 -2 -16 M-8 24 Q-4 20 -2 16",
			stroke: WOOD_DARK,
			strokeWidth: "2",
			fill: "none"
		})
	] });
	if (tier === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-16 -20 -22 -50 6 -78 Q-6 -66 -4 -56",
			stroke: WOOD,
			strokeWidth: "5.5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-16 20 -22 50 6 78 Q-6 66 -4 56",
			stroke: WOOD,
			strokeWidth: "5.5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-16 -20 -22 -50 6 -78",
			stroke: m.glow,
			strokeWidth: "1.6",
			fill: "none",
			opacity: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-16 20 -22 50 6 78",
			stroke: m.glow,
			strokeWidth: "1.6",
			fill: "none",
			opacity: "0.8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M6 -78 L6 78",
			stroke: "#f0e6d2",
			strokeWidth: "1.5",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M2 -74 Q10 -70 8 -62 M2 74 Q10 70 8 62",
			fill: "none",
			stroke: m.trim,
			strokeWidth: "3",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-6 -11 Q0 -6 6 0 Q0 6 -6 11 Z",
			fill: "#4a2b20",
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "0",
			r: "2.6",
			fill: m.glow
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "0",
			r: "9",
			fill: m.glow,
			opacity: "0.22"
		})
	] });
	if (tier === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-18 -22 -26 -52 4 -80 Q-8 -68 -6 -56",
			stroke: m.base,
			strokeWidth: "5.5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-18 22 -26 52 4 80 Q-8 68 -6 56",
			stroke: m.base,
			strokeWidth: "5.5",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-18 -22 -26 -52 4 -80",
			stroke: m.light,
			strokeWidth: "2",
			fill: "none",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M4 -80 L4 80",
			stroke: m.glow,
			strokeWidth: "1.8",
			opacity: "0.95"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-9 -13 Q0 -6 9 0 Q0 6 -9 13 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-2 -60 L2 -52 M-2 60 L2 52",
			stroke: m.trim,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "4",
			cy: "-80",
			r: "9",
			fill: m.glow,
			opacity: "0.22"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "4",
			cy: "80",
			r: "9",
			fill: m.glow,
			opacity: "0.22"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-20 -24 -30 -58 2 -92 Q-12 -78 -10 -62",
			stroke: m.base,
			strokeWidth: "6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-20 24 -30 58 2 92 Q-12 78 -10 62",
			stroke: m.base,
			strokeWidth: "6",
			fill: "none",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M0 0 C-20 -24 -30 -58 2 -92",
			stroke: m.light,
			strokeWidth: "2.4",
			fill: "none",
			opacity: "0.85"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M2 -92 L2 92",
			stroke: m.glow,
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-4 -66 Q4 -60 3 -50 M-4 66 Q4 60 3 50",
			fill: "none",
			stroke: m.trim,
			strokeWidth: "2.6",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-12 -15 Q0 -7 12 0 Q0 7 -12 15 Z",
			fill: m.dark,
			stroke: INK,
			strokeWidth: "1.6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M-6 -8 L-2 0 L-6 8 M2 -8 L6 0 L2 8",
			stroke: m.light,
			strokeWidth: "1.4",
			fill: "none",
			opacity: "0.9"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "0",
			r: "3.4",
			fill: m.glow
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "0",
			cy: "0",
			r: "22",
			fill: m.glow,
			opacity: "0.16"
		})
	] });
}
var CLASS_LABEL = {
	warrior: "Knight",
	mage: "Mage",
	archer: "Archer"
};
/**
* One hero, drawn as a battle-ready figure in a 300×400 frame. Layer order matters:
* cloak, legs, torso, chest piece, weapon, arms, then the head on top. The stance
* comes from the rig, so each class really stands differently.
*/
function HeroArt({ cls, gender, chest = 0, weapon = 0, className = "" }) {
	const chestTier = tierOf(chest);
	const weaponTier = tierOf(weapon);
	const pose = POSE[cls];
	const m = METAL[tierOf(Math.max(chestTier, weaponTier))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 300 400",
		preserveAspectRatio: "xMidYMax meet",
		className,
		role: "img",
		"aria-label": `${gender === "female" ? "Female" : "Male"} ${CLASS_LABEL[cls]}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "152",
				cy: "368",
				rx: "78",
				ry: "12",
				fill: "#000000",
				opacity: "0.38"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "152",
				cy: "368",
				rx: "52",
				ry: "7",
				fill: m.glow,
				opacity: "0.14"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `rotate(${pose.lean} 152 356)`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cape, {
						cls,
						tier: chestTier
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LowerBody, {
						cls,
						gender,
						tier: chestTier
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Torso, {
						cls,
						tier: chestTier
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chest, {
						cls,
						tier: chestTier
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
						transform: pose.weaponAt,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Weapon, {
							cls,
							tier: weaponTier
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arm, {
						cls,
						tier: chestTier,
						which: "weapon"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arm, {
						cls,
						tier: chestTier,
						which: "free"
					}),
					cls === "mage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: pose.freeHand.x,
							cy: pose.freeHand.y - 20,
							r: "7",
							fill: CLASS_ACCENT.mage,
							opacity: "0.35"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: pose.freeHand.x,
							cy: pose.freeHand.y - 20,
							r: "3.6",
							fill: "#dff7ff",
							opacity: "0.95"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: pose.freeHand.x,
							cy: pose.freeHand.y - 20,
							r: "13",
							fill: CLASS_ACCENT.mage,
							opacity: "0.16"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Head, {
						cls,
						gender
					})
				]
			})
		]
	});
}
/**
* Four looks per class and slot. A piece's look follows its power band, so the
* chestplate and the weapon a hero wears always describe the same material set:
* iron → ember → moon → ancestral.
*/
var GEAR_LOOKS = {
	warrior: {
		chest: [
			"Ironclad Plate",
			"Emberforged Plate",
			"Moonsteel Plate",
			"Ancestral Plate"
		],
		weapon: [
			"Iron Blade",
			"Ember Blade",
			"Moonsteel Blade",
			"Ancestral Greatblade"
		]
	},
	mage: {
		chest: [
			"Apprentice Robes",
			"Emberweave Robes",
			"Moonveil Robes",
			"Archon Robes"
		],
		weapon: [
			"Oak Wand",
			"Cinder Staff",
			"Moonstone Rod",
			"Archon Scepter"
		]
	},
	archer: {
		chest: [
			"Thornhide Jerkin",
			"Embersting Jerkin",
			"Moonstrider Jerkin",
			"Ancestral Jerkin"
		],
		weapon: [
			"Hunting Bow",
			"Ember Bow",
			"Moonbow",
			"Ancestral Longbow"
		]
	}
};
/** Which of the four looks a piece of gear shows. Unworn (or no gear) falls back to iron. */
function gearLook(it) {
	if (!it) return 0;
	if (it.anc || it.rarity >= 6) return 3;
	if (it.rarity >= 4) return 2;
	if (it.rarity >= 2) return 1;
	return 0;
}
var lookName = (cls, slot, look) => GEAR_LOOKS[cls][slot][tierOf(look)];
/** Looks a hero is currently wearing, for every place a character is drawn. */
function wornLooks(equipment) {
	return {
		chest: gearLook(equipment?.armour),
		weapon: gearLook(equipment?.weapon)
	};
}
/**
* The single source of hero art: creation, equipment, profiles and battles all
* render this so a hero looks identical everywhere.
*/
function CharacterModel({ cls, gender, className = "", chest, weapon, look }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `overflow-hidden ${className}`,
		"data-character-model": `${cls}-${gender}`,
		style: { aspectRatio: "1 / 1" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroArt, {
			cls,
			gender,
			chest: look?.chest ?? gearLook(chest),
			weapon: look?.weapon ?? gearLook(weapon),
			className: "h-full w-full"
		})
	});
}
function InspectPanel({ heroId, targetId, onClose }) {
	const [result, setResult] = (0, import_react.useState)(null);
	const key = JSON.stringify([heroId, targetId]);
	(0, import_react.useEffect)(() => {
		let active = true;
		setResult(null);
		if (heroId && targetId) inspectHero(heroId, targetId).then((profile) => {
			if (active) setResult({
				key,
				profile
			});
		}, (error) => {
			if (active) setResult({
				key,
				error: socialError(error)
			});
		});
		return () => {
			active = false;
		};
	}, [
		heroId,
		targetId,
		key
	]);
	const current = result?.key === key ? result : null;
	const profile = current?.profile;
	const error = !heroId ? "Select a character to inspect another hero." : !targetId ? "Select a hero to inspect." : current?.error;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Inspect hero",
		onClose,
		children: [
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "py-2 text-sm text-muted-foreground",
				children: error
			}),
			!error && !profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "py-2 text-sm text-muted-foreground",
				children: "Loading hero…"
			}),
			profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 anim-pop",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
						(profile.hero_class === "warrior" || profile.hero_class === "mage" || profile.hero_class === "archer") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
							cls: profile.hero_class,
							gender: profile.gender === "female" ? "female" : "male",
							className: "mb-3 h-48"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "break-words font-display text-3xl text-gold",
							children: profile.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "capitalize",
									children: profile.hero_class
								}),
								" · Level ",
								profile.level
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid grid-cols-2 gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "slot p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Battle Rating"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-gold",
									children: profile.power.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "slot p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Arena rating"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: profile.arena_rating.toLocaleString() })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "break-words",
									children: profile.title || "No title"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Bio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "whitespace-pre-wrap break-words",
									children: profile.bio || "No bio"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "panel-title mb-2",
						children: "Stats"
					}), profile.stats && typeof profile.stats === "object" && !Array.isArray(profile.stats) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "space-y-2",
						children: Object.entries(profile.stats).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No stats available."
						}) : Object.entries(profile.stats).map(([name, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "slot flex flex-wrap justify-between gap-2 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "break-words",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "whitespace-pre-wrap break-words",
								children: typeof value === "string" ? value : JSON.stringify(value)
							})]
						}, name))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "slot overflow-auto p-3 text-sm",
						children: JSON.stringify(profile.stats, null, 2)
					})] })
				]
			})
		]
	});
}
function FriendsPanel({ heroId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendsContent, { heroId }, heroId ?? "no-character");
}
function FriendsContent({ heroId }) {
	const [name, setName] = (0, import_react.useState)("");
	const [friends, setFriends] = (0, import_react.useState)([]);
	const [targetId, setTargetId] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const locked = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		let active = true;
		if (heroId) {
			locked.current = true;
			setBusy(true);
			listFriends(heroId).then((rows) => {
				if (active) {
					setFriends(rows);
					setLoaded(true);
				}
			}, (e) => {
				if (active) setError(socialError(e));
			}).finally(() => {
				if (active) {
					locked.current = false;
					setBusy(false);
				}
			});
		}
		return () => {
			active = false;
			mounted.current = false;
		};
	}, [heroId]);
	const mutate = async (action, clearName = false) => {
		if (!heroId || locked.current) return;
		locked.current = true;
		setBusy(true);
		setError(null);
		try {
			await action(heroId);
			if (!mounted.current) return;
			if (clearName) setName("");
			const rows = await listFriends(heroId);
			if (mounted.current) {
				setFriends(rows);
				setLoaded(true);
			}
		} catch (e) {
			if (mounted.current) setError(socialError(e));
		} finally {
			locked.current = false;
			if (mounted.current) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "game-panel anim-pop p-4",
		"aria-label": "Friends",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "panel-title mb-4",
				children: "Friends"
			}),
			!heroId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Select a character to manage friends."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex items-end gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						mutate((id) => addFriend(id, name), true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block min-w-0 flex-1 text-sm",
						children: ["Hero name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "slot mt-1 w-full px-3 py-2",
							placeholder: "Hero name",
							required: true,
							maxLength: 18,
							value: name,
							disabled: busy,
							onChange: (e) => setName(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "btn-gold",
						disabled: busy || !name.trim(),
						type: "submit",
						children: "Add"
					})]
				}),
				busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "py-2 text-sm text-muted-foreground",
					children: "Loading…"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "py-2 text-sm text-muted-foreground",
					children: error
				}),
				loaded && friends.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-sm text-muted-foreground",
					children: "No friends yet - add someone by name."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: friends.map((friend) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "slot flex items-center gap-2 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-w-0 flex-1 rounded p-2 text-left focus-visible:outline focus-visible:outline-ring",
							onClick: () => setTargetId(friend.id),
							"aria-label": `Inspect ${friend.name}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block break-words text-gold",
								children: friend.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-sm text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize",
										children: friend.hero_class
									}),
									" · Level ",
									friend.level,
									" · Battle Rating ",
									friend.power.toLocaleString()
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							disabled: busy,
							"aria-label": `Remove ${friend.name}`,
							onClick: () => void mutate((id) => removeFriend(id, friend.id)),
							children: "Remove"
						})]
					}, friend.id))
				})
			] }),
			heroId && targetId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectPanel, {
				heroId,
				targetId,
				onClose: () => setTargetId(null)
			})
		]
	});
}
var battle_scrolls_default = "/assets/battle-scrolls-Tcm-aEBa.png";
function ScrollShop({ onClose }) {
	const { hero } = useGame();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	if (!hero) return null;
	const { owned, buffs } = scrollState(hero);
	async function act(kind, buy) {
		if (busy) return;
		setBusy(true);
		setError("");
		try {
			if (buy) await buyScroll(kind);
			else await activateScroll(kind);
		} catch (e) {
			setError(e instanceof Error ? e.message : "The scroll request failed.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Battle Scrolls",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: hero.gold })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: Object.keys(SCROLLS).map((kind) => {
					const scroll = SCROLLS[kind];
					const col = kind === "dmg" ? 0 : kind === "def" ? 1 : 2;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 border-b border-border py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-14 w-14 shrink-0 overflow-hidden slot rarity-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: battle_scrolls_default,
									alt: scroll.name,
									loading: "lazy",
									width: 1536,
									height: 512,
									className: "absolute h-full max-w-none",
									style: {
										width: "300%",
										left: `${-col * 100}%`
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-36 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-gold",
										children: scroll.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: "+20% · 10 battles"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											"Owned ",
											owned[kind],
											buffs[kind] > 0 ? ` · Active: ${buffs[kind]} battles remaining` : ""
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: busy || owned[kind] < 1 || buffs[kind] > 0,
								onClick: () => void act(kind, false),
								children: buffs[kind] > 0 ? "Active" : "Activate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								disabled: busy || (getState().hero?.gold ?? 0) < scroll.price,
								onClick: () => void act(kind, true),
								children: [
									"Buy · ",
									scroll.price.toLocaleString(),
									" gold"
								]
							})
						]
					}, kind);
				})
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-destructive",
				children: error
			})
		]
	});
}
var tierColors = [
	"var(--r1)",
	"var(--xp)",
	"var(--r4)",
	"var(--r3)",
	"var(--r5)"
];
function Bestiary({ h, onClose }) {
	const [kind, setKind] = (0, import_react.useState)("all");
	const [state, setState] = (0, import_react.useState)("all");
	const entries = ROSTER.filter((e) => (kind === "all" || e.kind === kind) && (state === "all" || rosterProgress(h, e.id).state === state));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Bestiary & Boss Roster",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted-foreground",
				children: "60 enemy designs · 44 boss designs. Seven bosses use cropped head portraits. Unknown entries unlock only through recorded encounters; old saves are not given invented kills."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Roster ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "rounded border border-border bg-background p-2",
					value: kind,
					onChange: (e) => setKind(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All creatures"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "enemy",
							children: "Enemies"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "boss",
							children: "Bosses"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Discovery ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "rounded border border-border bg-background p-2",
					value: state,
					onChange: (e) => setState(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All states"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "seen",
							children: "Seen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "defeated",
							children: "Defeated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "undiscovered",
							children: "Undiscovered"
						})
					]
				})] })]
			}),
			entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: "No recorded creatures match these filters."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
				children: entries.map((e) => {
					const progress = rosterProgress(h, e.id), known = progress.state !== "undiscovered";
					const s = e.sprite, scale = Math.min(120 / s.w, 126 / s.h);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded border bg-background/60 p-3 text-center",
						style: { borderColor: known ? tierColors[e.tier - 1] : "var(--border)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-32 items-center justify-center",
								children: known ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "img",
									"aria-label": e.name,
									style: {
										width: s.w * scale,
										height: s.h * scale,
										backgroundImage: `url("${s.url}")`,
										backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
										backgroundPosition: `${-s.x * scale}px ${-s.y * scale}px`,
										backgroundRepeat: "no-repeat"
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "Undiscovered"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-bold",
								style: { color: known ? tierColors[e.tier - 1] : void 0 },
								children: known ? e.name : "Unknown creature"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: known ? `Tier ${e.tier} · Lv ${e.levelBand[0]}–${e.levelBand[1]}` : "Encounter to reveal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm",
								children: progress.state === "defeated" ? `Defeated · ${fmt(progress.count)} kills` : progress.state === "seen" ? "Seen · no recorded defeats" : "Defeat count unknown"
							})
						]
					}, e.id);
				})
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var confirmEventEntry = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ eventId: stringType() }).parse(input)).handler(createSsrRpc("f6d3626eac7961bb67133ad1a98c68433af0a4abbe0c2f114a4980c35d7f1b65"));
/** Renders one cell of an uploaded art sheet, scaled to the container width. */
function Sprite({ rect, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `overflow-hidden ${className}`,
		style: { aspectRatio: `${rect.w} / ${rect.h}` },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full w-full",
			style: {
				backgroundImage: `url(${rect.url})`,
				backgroundSize: `${SHEET_W / rect.w * 100}% ${SHEET_H / rect.h * 100}%`,
				backgroundPosition: `${rect.x / (SHEET_W - rect.w) * 100}% ${rect.y / (SHEET_H - rect.h) * 100}%`
			}
		})
	});
}
var STORE_KEY = "ef-event-reminders";
function EventCalendar({ h, onClose, start }) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [tz, setTz] = (0, import_react.useState)(GAME_TZ);
	const [remind, setRemind] = (0, import_react.useState)({});
	const [banner, setBanner] = (0, import_react.useState)(null);
	const fired = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const confirmEntry = useServerFn(confirmEventEntry);
	const entering = (0, import_react.useRef)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = window.localStorage.getItem(STORE_KEY);
			if (raw) setRemind(JSON.parse(raw));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			window.localStorage.setItem(STORE_KEY, JSON.stringify(remind));
		} catch {}
	}, [remind]);
	(0, import_react.useEffect)(() => {
		for (const ev of WORLD_EVENTS) {
			if (!remind[ev.id] || !reminderDue(now, ev)) continue;
			const s = statusOf(now, ev);
			if (s.state !== "upcoming") continue;
			const key = `${ev.id}:notify:${s.startsAt}`;
			if (fired.current.has(key)) continue;
			fired.current.add(key);
			setBanner(`${ev.name} opens in ${countdown(statusOf(now, ev).msLeft)}`);
			try {
				if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Ember Fall", { body: `${ev.name} opens in ${countdown(statusOf(now, ev).msLeft)}` });
			} catch {}
		}
	}, [now, remind]);
	const rows = (0, import_react.useMemo)(() => WORLD_EVENTS.map((ev) => ({
		ev,
		s: statusOf(now, ev)
	})), [now]);
	const toggle = (ev) => {
		const on = !remind[ev.id];
		setRemind((r) => ({
			...r,
			[ev.id]: on
		}));
		if (on) try {
			if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission();
		} catch {}
	};
	const join = async (ev) => {
		if (entering.current) return;
		entering.current = true;
		setBusy(true);
		setError("");
		try {
			const { foe } = await confirmEntry({ data: { eventId: ev.id } });
			const rw = stageRewards(ev.stage, ev.kind === "boss" ? 2 : ev.kind === "season" ? 1.5 : 1);
			start({
				title: `${ev.name} · Live Event`,
				right: foe,
				onResult: async (won, xpMultiplier = 1) => {
					const { grant, rollLoot, addLoot } = await import("./logic-WJE4Izgx.mjs");
					const lines = [];
					let loot = null;
					update((hh) => {
						if (!won) {
							lines.push("The event is still open — return before the countdown ends.");
							return;
						}
						const xp = scrollXp(rw.xp, xpMultiplier);
						const { levels } = grant(hh, xp, rw.gold);
						loot = rollLoot(hh, ev.stage, 1, ev.kind === "boss" ? 2 : 0);
						recordRosterEncounter(hh, foe.rosterId, true);
						if (loot) addLoot(hh, loot);
						lines.push(`+${fmt(rw.gold)} gold`, `+${fmt(xp)} XP`);
						if (loot) lines.push(`Loot: ${loot.name}`);
						if (levels > 0) lines.push(`Level up! Now level ${hh.level}`);
					});
					return {
						lines,
						loot
					};
				}
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not confirm event opening.");
		} finally {
			entering.current = false;
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "World Event Calendar",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Ember Fall runs on Greek time — every window opens on the same Greek hour for every player, no matter what your own device clock says. Times below are shown in",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: tz === "local" ? zoneLabel(now) : tz === "Europe/Athens" ? "Greek time" : tz
						}),
						"."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: ["Show times in", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "rounded border border-border bg-background p-2",
						value: tz,
						onChange: (e) => setTz(e.target.value),
						"aria-label": "Time zone",
						children: TZ_CHOICES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: z,
							children: z === "local" ? "My zone" : z === "Europe/Athens" ? "Greek time (server)" : z
						}, z))
					})]
				})]
			}),
			banner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "mb-4 flex items-center justify-between gap-3 rounded border border-[var(--xp)] bg-[var(--xp)]/10 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold",
					children: banner
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Dismiss reminder",
					onClick: () => setBanner(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mb-4 text-sm text-hp",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: rows.map(({ ev, s }) => {
					const at = s.state === "live" ? s.endsAt : s.startsAt;
					const encounter = eventEncounter(ev, s.state === "live" ? s.startedAt : s.startsAt);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded border bg-background/60 p-4",
						style: { borderColor: s.state === "live" ? "var(--xp)" : "var(--border)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
										rect: encounter.sprite,
										className: "h-20 w-20 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-gold",
										children: encounter.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											"Level ",
											encounter.level,
											" · ",
											fmt(encounter.hp),
											" HP"
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "font-display text-lg font-bold",
									children: [ev.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 rounded bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground",
										children: ev.kind
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: ev.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Reward: ", ev.reward]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl font-bold tabular-nums",
									style: { color: s.state === "live" ? "var(--xp)" : void 0 },
									"aria-label": `${ev.name} ${s.state === "live" ? "ends in" : "opens in"} ${countdown(s.msLeft)}`,
									children: countdown(s.msLeft)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										s.state === "live" ? "live now · ends" : "opens",
										" ",
										timeIn(at, tz)
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: s.state === "live" ? "default" : "outline",
									disabled: s.state !== "live" || busy,
									onClick: () => void join(ev),
									children: busy ? "Confirming…" : s.state === "live" ? "Join event" : "Opens later"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									"aria-pressed": !!remind[ev.id],
									onClick: () => toggle(ev),
									children: [remind[ev.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {}), remind[ev.id] ? "Reminder on" : "Remind me"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {}),
										" repeats every ",
										ev.everyMs >= 864e5 ? `${Math.round(ev.everyMs / 864e5)} days` : `${Math.round(ev.everyMs / 36e5)} hours`
									]
								})
							]
						})]
					}, ev.id);
				})
			})
		]
	});
}
function advanceAncestral(h) {
	const s = ancState(h);
	if (s.done) return false;
	if (s.step === 0 && canBeginAncestral(h)) {
		h.anc = {
			...s,
			step: 1
		};
		return true;
	}
	if (s.step === 1 && s.relics >= 5) {
		h.anc = {
			...s,
			step: 2
		};
		return true;
	}
	return false;
}
function completeAncestralTrial(h, expected, won) {
	const s = ancState(h);
	if (!won || s.done || s.step !== expected || expected < 2 || expected >= ANC_STEPS.length) return false;
	h.anc = {
		...s,
		step: s.step + 1,
		done: s.step + 1 >= ANC_STEPS.length
	};
	return true;
}
function awardAncestralRelic(h, boss, rand = Math.random) {
	const s = ancState(h);
	if (!boss || s.step !== 1 || s.relics >= 5 || rand() >= .4) return false;
	h.anc = {
		...s,
		relics: s.relics + 1
	};
	return true;
}
function trainingCost(h, attr, count) {
	if (![
		1,
		5,
		10,
		25,
		50
	].includes(count)) throw new Error("Invalid training batch");
	const raw = Array.from({ length: count }, (_, i) => attrCost(h.attrs[attr] + i)).reduce((a, b) => a + b, 0);
	return scaledGold(raw * (1 - trainingDiscount(h)), h.level);
}
function trainAttribute(h, attr, count) {
	const cost = trainingCost(h, attr, count);
	if (h.gold < cost) return "Not enough gold";
	h.gold -= cost;
	h.attrs[attr] += count;
	return null;
}
var EXPEDITIONS = [
	{
		id: "quarry",
		name: "Ember Quarry",
		level: 1,
		material: "ore",
		quantity: 6,
		desc: "Clear the quarry for gem-cutting ore."
	},
	{
		id: "crypt",
		name: "Soul Crypt",
		level: 10,
		material: "essence",
		quantity: 3,
		desc: "Hunt restless souls for forge and fusion essence."
	},
	{
		id: "observatory",
		name: "Fallen Observatory",
		level: 20,
		material: "starshard",
		quantity: 3,
		desc: "Recover shards for Astral summoning and upgrades."
	},
	{
		id: "bastion",
		name: "Shattered Bastion",
		level: 25,
		material: "fragment",
		quantity: 4,
		desc: "Salvage fragments for crafted armor."
	},
	{
		id: "citadel",
		name: "Elite Citadel",
		level: 35,
		material: "sigil",
		quantity: 2,
		desc: "Challenge a commander for elite crafting trophies."
	},
	{
		id: "heart",
		name: "Tyrant’s Heart",
		level: 50,
		material: "bossCore",
		quantity: 2,
		desc: "Slay a rotating tyrant for high-rarity forge cores."
	}
];
function expeditionFoe(h, index) {
	const expedition = EXPEDITIONS[index];
	if (!expedition) throw new Error("Unknown expedition");
	const cursor = h.wins ?? 0;
	const roster = index >= 4 ? BOSS_ROSTER : ENEMY_ROSTER;
	const entry = roster[(cursor + index * 7) % roster.length];
	if (!entry) throw new Error("Encounter unavailable");
	const level = Math.max(expedition.level, h.level + h.paragon);
	return {
		...stageFoe(level, index >= 4 ? 1.2 : 1),
		name: entry.name,
		sprite: entry.sprite,
		boss: index >= 4,
		rosterId: entry.id,
		skills: Object.values(SKILLS).flat().filter((s) => s.id === entry.signatureAbilityId)
	};
}
/** Minimum battle rating to enter the Ancestral Tower. */
var ANC_BR_MIN = 1e5;
/** Bosses rotate through the four tier bosses, scaling with each floor. */
var BOSS_ROTATION = [
	"aegis",
	"gorefiend",
	"tenebris",
	"vulkan"
];
/** Build a floor definition: bosses scale, BR requirement rises, drops get richer. */
function ancFloorDef(floor) {
	const boss = BOSS_ROTATION[(floor - 1) % BOSS_ROTATION.length];
	const mult = 2 + floor * .15;
	const minBR = ANC_BR_MIN + (floor - 1) * 25e3;
	const drops = { ancientBone: 2 + Math.floor(floor / 2) };
	if (floor >= 2) drops.voidShard = 1 + Math.floor((floor - 1) / 2);
	if (floor >= 3) drops.emberHeart = 1 + Math.floor((floor - 2) / 3);
	if (floor >= 4) drops.bossCore = Math.floor(floor / 2);
	if (floor >= 5) drops.starshard = Math.floor(floor / 3);
	return {
		floor,
		boss,
		mult,
		minBR,
		drops,
		gold: Math.round(5e4 * Math.pow(1.25, floor - 1)),
		xp: Math.round(4e4 * Math.pow(1.25, floor - 1))
	};
}
/** The next floor the hero may challenge. */
var ancTowerFloor = (h) => h.ancTower?.floor ?? 1;
/** Deepest floor cleared. */
var ancTowerBest = (h) => h.ancTower?.bestFloor ?? 0;
/** Can the hero fight this floor? Needs the questline done and 100k+ BR. */
function ancTowerBlocker(h, floor, br) {
	if (!h.anc?.done) return "Complete the Ancestral Sanctuary questline first";
	if (floor !== ancTowerFloor(h)) return floor < ancTowerFloor(h) ? "Already cleared" : `Clear floor ${floor - 1} first`;
	if (br < 1e5) return `Requires ${ANC_BR_MIN.toLocaleString()} Battle Rating (you have ${Math.round(br).toLocaleString()})`;
	return null;
}
/** The foe for an ancestral tower floor. */
function ancTowerFoe(floor, heroLevel) {
	const def = ancFloorDef(floor);
	const base = stageFoe(Math.max(80, heroLevel), def.mult);
	const boss = TIER_BOSSES[def.boss];
	return {
		...base,
		name: `${boss.name} · Floor ${floor}`,
		level: Math.max(80, heroLevel),
		boss: true,
		sprite: boss.sprite
	};
}
/** Advance the hero's tower progress, grant gold/XP and drop materials. Returns reward summary for display. */
function completeAncFloor(h, floor) {
	const def = ancFloorDef(floor);
	grant(h, def.xp, def.gold);
	addMats(h, def.drops);
	h.ancTower = {
		floor: floor + 1,
		bestFloor: Math.max(ancTowerBest(h), floor)
	};
	return def;
}
function Sanctuary({ onClose, start }) {
	const { hero } = useGame();
	if (!hero) return null;
	const state = ancState(hero);
	const step = ANC_STEPS[state.step];
	const advance = () => update((h) => {
		advanceAncestral(h);
	});
	const trial = () => {
		if (!step?.boss) return;
		const d = DUNGEONS.find((d) => d.id === step.boss);
		if (!d) return;
		const expected = state.step;
		start({
			title: `Ancestral Trial · ${step.title}`,
			right: dungeonFoe(d, hero.level + hero.paragon, step.mult),
			onResult: (won) => {
				if (!won) return { lines: ["The echo remains. Strengthen your equipment and return."] };
				let advanced = false;
				update((h) => {
					advanced = completeAncestralTrial(h, expected, won);
				});
				return { lines: advanced ? [expected + 1 >= ANC_STEPS.length ? "Heritage awakened — Ancestral Forge recipe unlocked." : "Trial complete — the next echo awaits."] : ["Trial already completed."] };
			}
		});
	};
	const br = heroStats(hero).power;
	const towerFloor = ancTowerFloor(hero);
	const towerBest = ancTowerBest(hero);
	const towerBlocked = ancTowerBlocker(hero, towerFloor, br);
	const floorDef = ancFloorDef(towerFloor);
	const towerFight = () => {
		if (towerBlocked) return;
		start({
			title: `Ancestral Tower · Floor ${towerFloor}`,
			right: ancTowerFoe(towerFloor, hero.level + hero.paragon),
			onResult: (won) => {
				if (!won) return { lines: ["The ancestral echo overwhelmed you. Raise your Battle Rating and try again."] };
				let result = null;
				update((h) => {
					result = completeAncFloor(h, towerFloor);
				});
				const drops = result ? Object.entries(result.drops).filter(([, v]) => v).map(([k, v]) => `+${v} ${k}`) : [];
				return { lines: [`Floor ${towerFloor} cleared! +${fmt(result?.gold ?? 0)} gold, +${fmt(result?.xp ?? 0)} XP`, ...drops] };
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Ancestral Sanctuary",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 font-display text-xl text-gold",
				children: state.done ? "Heritage awakened" : `Trial ${Math.min(state.step + 1, ANC_STEPS.length)} of ${ANC_STEPS.length}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: ANC_STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `slot flex items-center gap-3 p-4 ${i > state.step ? "opacity-50" : ""}`,
					children: [s.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
						rect: TIER_BOSSES[s.boss].sprite,
						className: "h-20 w-20 shrink-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display text-lg",
							children: [i < state.step ? "✓ " : "", s.title]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: s.desc
						}),
						s.kind === "relics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-gold",
							children: [
								"Relics ",
								state.relics,
								"/",
								5
							]
						})
					] })]
				}, s.title))
			}),
			!state.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: state.step < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: state.step === 0 ? !canBeginAncestral(hero) : state.relics < 5,
					onClick: advance,
					children: state.step === 0 ? "Answer the call" : "Present relics"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: trial,
					children: "Challenge ancestral echo"
				})
			}),
			state.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-r1",
				children: "Ancestral heirloom crafting is unlocked — the Ancestral tab is open in the Forge."
			}),
			state.done && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-1 font-display text-2xl text-gold",
						children: "Ancestral Tower"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: [
							"Climb endless floors of ancestral echoes. Each boss requires a minimum Battle Rating of ",
							fmt(1e5),
							". Every floor drops Ancestral crafting materials (Ancient Bones, Void Shards, Ember Hearts) plus gold and XP."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "slot mb-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-lg",
									children: ["Floor ", towerFloor]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-sm text-muted-foreground",
									children: ["Best: ", towerBest]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm",
									children: [
										"Your Battle Rating: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
											className: br >= 1e5 ? "text-r1" : "text-hp",
											children: fmt(br)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-2 text-muted-foreground",
											children: ["· Required: ", fmt(floorDef.minBR)]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Boss: "
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: TIER_BOSSES[floorDef.boss].name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-3 text-muted-foreground",
										children: "Rewards: "
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-gold",
										children: [
											"+",
											fmt(floorDef.gold),
											" gold"
										]
									}),
									", ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xp",
										children: [
											"+",
											fmt(floorDef.xp),
											" XP"
										]
									}),
									Object.entries(floorDef.drops).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
												mat: k,
												size: 14
											}),
											" +",
											v
										]
									}, k))
								]
							}),
							towerBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-hp",
								children: towerBlocked
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-3",
								onClick: towerFight,
								children: ["Challenge Floor ", towerFloor]
							})
						]
					})
				]
			})
		]
	});
}
function Expeditions({ onClose, start }) {
	const { hero } = useGame();
	if (!hero) return null;
	const fight = (index) => {
		const expedition = EXPEDITIONS[index];
		if (!expedition || hero.level + hero.paragon < expedition.level) return;
		const foe = expeditionFoe(hero, index);
		const rw = stageRewards(foe.level, foe.boss ? 1.5 : 1);
		start({
			title: `Dungeon Expedition · ${expedition.name}`,
			right: foe,
			onResult: async (won, xpMultiplier = 1) => {
				if (!won) return { lines: ["The expedition failed. No treasure recovered."] };
				const { grant, rollLoot, addLoot } = await import("./logic-WJE4Izgx.mjs");
				let loot = null;
				const lines = [];
				update((h) => {
					const xp = scrollXp(rw.xp, xpMultiplier);
					const { levels } = grant(h, xp, rw.gold);
					h.wins++;
					recordRosterEncounter(h, foe.rosterId, true);
					addMats(h, { [expedition.material]: expedition.quantity });
					loot = rollLoot(h, foe.level, .6, foe.boss ? 2 : 0);
					if (loot) addLoot(h, loot);
					lines.push(`+${fmt(xp)} XP`, `+${fmt(rw.gold)} gold`, `+${expedition.quantity} ${MATS[expedition.material].name}`);
					if (levels) lines.push(`Level up ×${levels}`);
				});
				return {
					lines,
					loot
				};
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Dungeon Gate · Expeditions",
		onClose,
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
			children: EXPEDITIONS.map((e, i) => {
				const foe = expeditionFoe(hero, i);
				const unlocked = hero.level + hero.paragon >= e.level;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "slot flex flex-col gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
							rect: foe.sprite,
							className: "mx-auto h-28 w-28"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl text-gold",
							children: e.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: e.desc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								foe.name,
								" · Lv ",
								foe.level
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"HP ",
								fmt(foe.hp),
								" · ATK ",
								fmt(foe.atk),
								" · DEF ",
								fmt(foe.def)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, { mat: e.material }),
								" +",
								e.quantity,
								" ",
								MATS[e.material].name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-auto",
							disabled: !unlocked,
							onClick: () => fight(i),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {}), unlocked ? "Enter expedition" : `Level ${e.level} required`]
						})
					]
				}, e.id);
			})
		})
	});
}
var gathering_verdant_default = "/assets/gathering-verdant-Bs621t4t.jpg";
var gathering_ember_default = "/assets/gathering-ember-Ipfpvpg-.jpg";
var gathering_sunken_default = "/assets/gathering-sunken-DJgQnk4l.jpg";
var gathering_frost_default = "/assets/gathering-frost-oLESlAir.jpg";
var gathering_astral_default = "/assets/gathering-astral-OiOtu0ke.jpg";
var profession_discoveries_default = "/assets/profession-discoveries-DhcvKmGT.png";
async function readGathering() {
	return withServerHero(async (id) => {
		const { data, error } = await supabase.rpc("profession_state", { _hero: id });
		if (error) throw new Error(error.message);
		const result = validateGatheringResponse(data);
		adoptServerSave(id, returnedSave(data));
		return result;
	});
}
async function beginGathering(profession, area) {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first");
	const req = requestKey(localStorage, id, "gathering", () => crypto.randomUUID());
	return withServerHero(async (heroId) => {
		const { data, error } = await supabase.rpc("begin_gathering", {
			_hero: heroId,
			_profession: profession,
			_area: area,
			_req: req
		});
		if (error) throw new Error(error.message);
		const result = validateGatheringResponse(data);
		adoptServerSave(heroId, returnedSave(data));
		return result;
	});
}
async function finishGathering(req) {
	return withServerHero(async (id) => {
		const { data, error } = await supabase.rpc("finish_gathering", {
			_hero: id,
			_req: req
		});
		if (error) throw new Error(error.message);
		const result = validateGatheringResponse(data);
		adoptServerSave(id, returnedSave(data));
		localStorage.removeItem(`ef-pending:${id}:gathering`);
		return result;
	});
}
var regions = [
	gathering_verdant_default,
	gathering_ember_default,
	gathering_sunken_default,
	gathering_frost_default,
	gathering_astral_default
];
function DiscoveryArt({ profession, rarity, className = "h-16 w-16" }) {
	const index = PROFESSIONS.findIndex((p) => p.id === profession);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "img",
		"aria-label": DISCOVERY_NAMES[profession][rarity],
		className: `${className} shrink-0 bg-no-repeat`,
		style: {
			backgroundImage: `url(${profession_discoveries_default})`,
			backgroundSize: "600% 400%",
			backgroundPosition: `${index * 20}% ${rarity * 100 / 3}%`
		}
	});
}
function Professions({ onClose }) {
	const { hero, heroId } = useGame();
	const [profession, setProfession] = (0, import_react.useState)("mining");
	const [area, setArea] = (0, import_react.useState)(0);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const [offset, setOffset] = (0, import_react.useState)(0);
	const request = useRequest();
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(Date.now()), 500);
		return () => clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		request.run(async () => {
			const r = await readGathering();
			setOffset(r.now - Date.now());
		});
	}, [heroId]);
	if (!hero) return null;
	const state = gatheringState(hero);
	const stats = state.professions[profession] ?? {
		xp: 0,
		tool: 1,
		journeys: 0
	};
	const level = professionLevel(stats.xp);
	const active = state.active;
	const clock = now + offset;
	const ready = active ? Date.parse(active.readyAt) <= clock : false;
	const resting = state.nextAt ? Date.parse(state.nextAt) > clock : false;
	const chosen = PROFESSIONS.find((p) => p.id === profession) ?? PROFESSIONS[0];
	const action = () => void request.run(async () => {
		const r = active ? await finishGathering(active.request) : await beginGathering(profession, area);
		setOffset(r.now - Date.now());
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Profession Lodge",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
				label: "Professions",
				value: profession,
				onChange: (id) => {
					setProfession(id);
					setArea(0);
				},
				tabs: PROFESSIONS.map((p) => ({
					id: p.id,
					name: p.name
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap justify-between gap-3 border-b border-border pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg",
						children: [
							chosen.name,
							" · Level ",
							level
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-gold",
						children: [
							chosen.tool,
							" · Tier ",
							stats.tool || 1,
							" · ",
							stats.journeys,
							" journeys"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
							"aria-label": "Profession experience",
							max: 100,
							value: stats.xp % 100,
							className: "h-2 w-full accent-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								stats.xp % 100,
								"/100 XP · next tool tier at ",
								Math.ceil((stats.xp + 1) / 1e3) * 1e3,
								" XP"
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: GATHERING_AREAS.map((name, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `overflow-hidden rounded border border-border ${area === i ? "ring-2 ring-gold" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-[2/3] overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: regions[i],
							alt: name,
							loading: "lazy",
							width: 384,
							height: 768,
							className: "h-full w-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "my-1 text-xs text-muted-foreground",
								children: [
									"Profession Lv ",
									areaRequirement(i),
									" · ",
									gatheringSeconds(i),
									" seconds"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: area === i ? "default" : "outline",
								disabled: level < areaRequirement(i) || !!active,
								onClick: () => setArea(i),
								children: level < areaRequirement(i) ? "Locked" : area === i ? "Selected" : "Explore"
							})
						]
					})]
				}, name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "my-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `font-display text-lg ${active && !ready ? "animate-pulse text-gold" : ""}`,
						children: active ? `${PROFESSIONS.find((p) => p.id === active.profession)?.verb} · ${GATHERING_AREAS[active.area]}` : resting ? "Resting after your journey" : `${chosen.name} · ${GATHERING_AREAS[area]}`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: active ? ready ? "Discovery ready to collect" : countdown(Date.parse(active.readyAt) - clock) : resting ? countdown(Date.parse(state.nextAt ?? "") - clock) : `${gatheringSeconds(area)} second journey`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: request.busy || (active ? !ready : resting || level < areaRequirement(area)),
					onClick: action,
					children: active ? "Collect discovery" : "Begin gathering"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "font-display text-lg",
				children: [
					"Discoveries · ",
					Object.values(state.resources).reduce((a, b) => a + b, 0),
					" resources"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: Object.entries(state.resources).filter(([, n]) => n > 0).map(([key, n]) => {
					const [p, a, r] = key.split(":");
					if (!PROFESSIONS.some((x) => x.id === p)) return null;
					const rarity = Number(r);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `slot rarity-${Math.min(rarity, 3)} flex items-center gap-3 p-3`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryArt, {
							profession: p,
							rarity
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display",
							children: [
								DISCOVERY_NAMES[p][rarity],
								" ×",
								n
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								DISCOVERY_RARITIES[rarity],
								" · ",
								GATHERING_AREAS[Number(a)]
							]
						})] })]
					}, key);
				})
			}),
			state.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-muted-foreground",
				children: "No discoveries yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 font-display text-lg",
				children: "Journey history"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 max-h-48 overflow-y-auto",
				children: state.history.slice(0, 30).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "border-b border-border py-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-gold",
							children: [
								DISCOVERY_NAMES[d.profession][d.rarity],
								" ×",
								d.quantity
							]
						}),
						" · +",
						d.xp,
						" XP · ",
						new Date(d.at).toLocaleString()
					]
				}, d.request))
			})
		]
	});
}
var DIAMOND_PACKS = [
	{
		id: "starter",
		name: "Starter Pack",
		eurCents: 199,
		diamonds: 200,
		bonus: 0
	},
	{
		id: "small",
		name: "Small Pack",
		eurCents: 499,
		diamonds: 550,
		bonus: 50
	},
	{
		id: "adventurer",
		name: "Adventurer Pack",
		eurCents: 999,
		diamonds: 1200,
		bonus: 200
	},
	{
		id: "hero",
		name: "Hero Pack",
		eurCents: 1999,
		diamonds: 2600,
		bonus: 600
	},
	{
		id: "champion",
		name: "Champion Pack",
		eurCents: 4999,
		diamonds: 7e3,
		bonus: 2e3
	},
	{
		id: "legendary",
		name: "Legendary Pack",
		eurCents: 9999,
		diamonds: 15e3,
		bonus: 5e3
	}
];
var GOLD_PACKS = [
	{
		id: "pouch",
		name: "Gold Pouch",
		diamonds: 100,
		gold: 1e4
	},
	{
		id: "chest",
		name: "Gold Chest",
		diamonds: 450,
		gold: 5e4
	},
	{
		id: "royal",
		name: "Royal Treasury",
		diamonds: 1500,
		gold: 2e5
	},
	{
		id: "imperial",
		name: "Imperial Treasury",
		diamonds: 4e3,
		gold: 6e5
	}
];
var VIP_LEVELS = [
	{
		level: 1,
		name: "Supporter",
		diamonds30: 300,
		dailyGold: 1e3,
		dailyResources: 1,
		perks: [
			"VIP badge",
			"Daily gold bonus",
			"VIP nameplate"
		]
	},
	{
		level: 2,
		name: "Adventurer",
		diamonds30: 800,
		dailyGold: 2500,
		dailyResources: 2,
		perks: [
			"Everything from Supporter",
			"Daily resource package",
			"Exclusive profile frame"
		]
	},
	{
		level: 3,
		name: "Champion",
		diamonds30: 2e3,
		dailyGold: 6e3,
		dailyResources: 3,
		perks: [
			"Everything from Adventurer",
			"Champion title",
			"Special cosmetic collection"
		]
	},
	{
		level: 4,
		name: "Royal",
		diamonds30: 4500,
		dailyGold: 12e3,
		dailyResources: 4,
		perks: [
			"Everything from Champion",
			"Royal outfit appearance",
			"VIP missions"
		]
	},
	{
		level: 5,
		name: "Imperial",
		diamonds30: 9e3,
		dailyGold: 25e3,
		dailyResources: 5,
		perks: [
			"Everything from Royal",
			"Imperial nameplate effects",
			"Premium cosmetic collection"
		]
	}
];
var DIAMOND_SHOP = [
	{
		id: "wings_celestial",
		name: "Celestial Wings",
		diamonds: 1200,
		kind: "cosmetic",
		description: "Exclusive radiant wing appearance"
	},
	{
		id: "outfit_royal",
		name: "Royal Outfit",
		diamonds: 900,
		kind: "cosmetic",
		description: "Exclusive regal character outfit"
	},
	{
		id: "aura_ember",
		name: "Ember Aura",
		diamonds: 600,
		kind: "cosmetic",
		description: "A smouldering aura surrounds your character"
	},
	{
		id: "frame_diamond",
		name: "Diamond Frame",
		diamonds: 800,
		kind: "cosmetic",
		description: "Prestigious portrait frame"
	},
	{
		id: "title_immortal",
		name: "Immortal Title",
		diamonds: 500,
		kind: "cosmetic",
		description: "The \"Immortal\" title"
	},
	{
		id: "scroll_bundle",
		name: "War Scroll Bundle",
		diamonds: 400,
		kind: "scrolls",
		description: "5 Damage, 5 Defence and 5 Experience Scrolls"
	},
	{
		id: "resource_bundle",
		name: "Gatherer’s Cache",
		diamonds: 300,
		kind: "resources",
		description: "5 of every common gathering resource"
	}
];
function premiumState(hero) {
	const p = object(object(object(hero)["srv"])["premium"]);
	const vip = object(p["vip"]);
	const until = typeof vip["until"] === "string" ? vip["until"] : null;
	const active = until !== null && Date.parse(until) > Date.now();
	const history = Array.isArray(p["history"]) ? p["history"] : [];
	return {
		balance: Number.isInteger(p["balance"]) && Number(p["balance"]) > 0 ? Number(p["balance"]) : 0,
		vip: {
			level: active && Number.isInteger(vip["level"]) ? Number(vip["level"]) : 0,
			until
		},
		claimedToday: typeof p["claimed"] === "string" && p["claimed"] === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		history
	};
}
async function premiumCall(op, rpc, args) {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first.");
	const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
	await withServerHero(async (heroId) => {
		const { data, error } = await supabase.rpc(rpc, {
			_hero: heroId,
			_req: req,
			...args
		});
		if (error) throw new Error(error.message);
		adoptServerSave(heroId, returnedSave(data));
	});
	localStorage.removeItem(`ef-pending:${id}:${op}`);
}
var buyGoldPack = (pack) => premiumCall(`goldpack:${pack}`, "buy_gold_pack", { _pack: pack });
var buyDiamondItem = (item) => premiumCall(`diamond:${item}`, "buy_diamond_item", { _item: item });
var activateVip = (level) => premiumCall(`vip:${level}`, "activate_vip", { _level: level });
var claimVipDaily = () => premiumCall("vip-daily", "claim_vip_daily", {});
var TABS = [
	{
		id: "diamonds",
		name: "Get Diamonds"
	},
	{
		id: "gold",
		name: "Gold Packs"
	},
	{
		id: "shop",
		name: "Diamond Shop"
	},
	{
		id: "vip",
		name: "VIP"
	},
	{
		id: "history",
		name: "History"
	}
];
function PremiumShop({ onClose }) {
	const { hero } = useGame();
	const [tab, setTab] = (0, import_react.useState)("diamonds");
	const [notice, setNotice] = (0, import_react.useState)("");
	const request = useRequest();
	if (!hero) return null;
	const p = premiumState(hero);
	const vip = VIP_LEVELS.find((v) => v.level === p.vip.level);
	const run = (label, fn) => void request.run(async () => {
		await fn();
		setNotice(label);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Premium Shop",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
					label: "Premium Shop",
					value: tab,
					onChange: (id) => {
						setTab(id);
						setNotice("");
					},
					tabs: TABS.map((t) => ({
						id: t.id,
						name: t.name
					}))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot flex items-center gap-1.5 px-3 py-1.5 font-display text-lg text-r4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-5 w-5" }),
						fmt(p.balance),
						" Diamonds"
					]
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mb-3 text-sm text-r1",
				children: notice
			}),
			tab === "diamonds" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: DIAMOND_PACKS.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "slot flex flex-col gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg",
							children: pack.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1 text-2xl font-bold text-r4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-5 w-5" }), fmt(pack.diamonds)]
						}),
						pack.bonus > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-r1",
							children: [
								"Includes ",
								fmt(pack.bonus),
								" bonus Diamonds"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: true,
							title: "Real-money purchases activate once the payment provider is connected",
							children: [
								"€",
								(pack.eurCents / 100).toFixed(2),
								" — coming soon"
							]
						})
					]
				}, pack.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Real-money checkout is being connected to a payment provider with server-side verification. Until it is verified live, purchases stay disabled — no Diamonds are ever granted without a confirmed payment."
			})] }),
			tab === "gold" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: GOLD_PACKS.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "slot flex items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg",
							children: pack.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-gold",
							children: [fmt(pack.gold), " Gold"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [fmt(pack.diamonds), " Diamonds"]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: request.busy || p.balance < pack.diamonds,
						onClick: () => run(`${pack.name}: ${fmt(pack.gold)} Gold added`, () => buyGoldPack(pack.id)),
						children: p.balance < pack.diamonds ? "Not enough Diamonds" : "Buy"
					})]
				}, pack.id))
			}),
			tab === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: DIAMOND_SHOP.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "slot flex flex-col gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "flex-1 text-xs text-muted-foreground",
							children: item.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-sm text-r4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-4 w-4" }), fmt(item.diamonds)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: request.busy || p.balance < item.diamonds,
								onClick: () => run(`${item.name} added to your collection`, () => buyDiamondItem(item.id)),
								children: p.balance < item.diamonds ? "Not enough" : "Buy"
							})]
						})
					]
				}, item.id))
			}),
			tab === "vip" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				vip && p.vip.until && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot mb-4 flex flex-wrap items-center justify-between gap-3 border-gold/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "mr-1 inline h-5 w-5" }),
							"VIP ",
							vip.level,
							" — ",
							vip.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Active until ", new Date(p.vip.until).toLocaleString()]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: request.busy || p.claimedToday,
						onClick: () => run("VIP daily reward claimed", () => claimVipDaily()),
						children: p.claimedToday ? "Claimed today" : `Claim daily: ${fmt(vip.dailyGold)} Gold + ${vip.dailyResources} resources`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: VIP_LEVELS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `slot flex flex-col gap-2 p-4 ${p.vip.level === v.level ? "ring-2 ring-gold" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display text-lg",
								children: [
									"VIP ",
									v.level,
									" — ",
									v.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "flex-1 list-inside list-disc text-xs text-muted-foreground",
								children: [v.perks.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: perk }, perk)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Daily: ",
									fmt(v.dailyGold),
									" Gold + ",
									v.dailyResources,
									" of each common resource"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: request.busy || p.balance < v.diamonds30,
								onClick: () => run(`VIP ${v.level} active for 30 days`, () => activateVip(v.level)),
								children: [fmt(v.diamonds30), " Diamonds / 30 days"]
							})
						]
					}, v.level))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Memberships never renew automatically. When a membership expires your items, cosmetics and progress stay — only the daily benefits pause."
				})
			] }),
			tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-96 overflow-y-auto",
				children: [p.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-muted-foreground",
					children: "No Diamond transactions yet."
				}), [...p.history].reverse().map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between border-b border-border py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: h.detail.replaceAll(":", " · ") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: h.kind === "spend" ? "text-blood" : "text-r1",
						children: [h.kind === "spend" ? "-" : "+", fmt(h.amount)]
					})]
				}, i))]
			})
		]
	});
}
function resourceName$1(key) {
	const [p, , r] = key.split(":");
	return DISCOVERY_NAMES[p]?.[Number(r)] ?? key;
}
function AuctionHouse({ onClose }) {
	const { hero, heroId } = useGame();
	const [listings, setListings] = (0, import_react.useState)([]);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)("supplies");
	const [sel, setSel] = (0, import_react.useState)("");
	const [itemId, setItemId] = (0, import_react.useState)("");
	const [gem, setGem] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)(1);
	const [price, setPrice] = (0, import_react.useState)(100);
	const request = useRequest();
	const refresh = (0, import_react.useCallback)(async () => {
		setListings(await fetchListings());
	}, []);
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setListings([]));
	}, [refresh]);
	if (!hero) return null;
	const resources = Object.entries(gatheringState(hero).resources).filter(([, n]) => n > 0);
	const chosen = resources.find(([k]) => k === sel);
	const bag = hero.inventory;
	const item = bag.find((i) => i.id === itemId);
	const gems = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
	const gemHeld = gems.find(([k]) => k === gem)?.[1] ?? 0;
	const run = (label, fn) => void request.run(async () => {
		await fn();
		await refresh();
		setNotice(label);
	});
	const pick = (c) => {
		setCat(c);
		setQty(1);
		setNotice("");
	};
	const canList = price >= 1 && (cat === "supplies" ? !!sel && qty >= 1 && qty <= (chosen?.[1] ?? 0) : cat === "equipment" ? !!item : !!gem && qty >= 1 && qty <= gemHeld);
	const list = () => {
		if (cat === "supplies" && sel) return run(`Listed ${qty} × ${resourceName$1(sel)} for ${fmt(price)} Gold`, () => listResource(sel, qty, price));
		if (cat === "equipment" && item) return run(`Listed ${item.name} for ${fmt(price)} Gold`, () => listItem(item, price));
		if (cat === "gems" && gem) return run(`Listed ${qty} × ${gemName(gem)} for ${fmt(price)} Gold`, () => listGem(gem, qty, price));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Auction House",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { ...request }),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mb-3 text-sm text-r1",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg",
				children: "Sell anything"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Gathered supplies, gems from your pouch, or a piece of equipment straight from your bag."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
					label: "What to sell",
					value: cat,
					onChange: pick,
					tabs: [
						{
							id: "supplies",
							name: "Supplies"
						},
						{
							id: "equipment",
							name: "Equipment"
						},
						{
							id: "gems",
							name: "Gems"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end gap-2",
				children: [
					cat === "supplies" && (resources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You have no gathered resources yet — visit the Profession Lodge first."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs",
						children: ["Resource", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Resource to sell",
							value: sel,
							onChange: (e) => setSel(e.target.value),
							className: "mt-1 block w-44 rounded border border-border bg-background p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose…"
							}), resources.map(([k, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: k,
								children: [
									resourceName$1(k),
									" (×",
									n,
									")"
								]
							}, k))]
						})]
					})),
					cat === "equipment" && (bag.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Your bag is empty. Worn gear stays equipped — move a piece to the bag to sell it."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs",
						children: ["Bag item", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Equipment to sell",
							value: itemId,
							onChange: (e) => setItemId(e.target.value),
							className: "mt-1 block w-64 rounded border border-border bg-background p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose…"
							}), bag.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: i.id,
								children: [
									i.name,
									i.enh > 0 ? ` +${i.enh}` : "",
									" · iLvl ",
									i.ilvl
								]
							}, i.id))]
						})]
					})),
					cat === "gems" && (gems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You own no gems yet — cut some at the Gem Workshop."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs",
						children: ["Gem", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Gem to sell",
							value: gem,
							onChange: (e) => setGem(e.target.value),
							className: "mt-1 block w-52 rounded border border-border bg-background p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose…"
							}), gems.map(([k, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: k,
								children: [
									gemName(k),
									" (×",
									n,
									")"
								]
							}, k))]
						})]
					})),
					cat !== "equipment" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs",
						children: ["Quantity", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Quantity",
							type: "number",
							min: 1,
							max: cat === "gems" ? gemHeld || 1 : chosen?.[1] ?? 1,
							value: qty,
							onChange: (e) => setQty(Math.max(1, Number(e.target.value) || 1)),
							className: "mt-1 block w-20 rounded border border-border bg-background p-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs",
						children: ["Total price (Gold)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Price",
							type: "number",
							min: 1,
							value: price,
							onChange: (e) => setPrice(Math.max(1, Number(e.target.value) || 1)),
							className: "mt-1 block w-28 rounded border border-border bg-background p-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: request.busy || !canList,
						onClick: list,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "mr-1 h-4 w-4" }), "List for sale"]
					}),
					cat === "equipment" && item && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GearIcon, {
								item,
								size: 36
							}),
							item.name,
							" · iLvl ",
							item.ilvl,
							" · sells whole, sockets included"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-lg",
					children: ["Open listings · ", listings.length]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => void refresh(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1 h-3 w-3" }), "Refresh"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: [listings.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-sm text-muted-foreground",
					children: "No listings yet. Be the first to sell something."
				}), listings.map((l) => {
					const [p, a, r] = l.resource.split(":");
					const gemInfo = l.kind === "gem" ? parseGem(l.resource) : null;
					const mine = l.seller_hero === heroId;
					const rc = l.kind === "item" ? l.payload?.rarity ?? 0 : l.kind === "gem" ? Math.min(gemInfo?.tier ?? 1, 5) : Math.min(Number(r) + 1, 5);
					const name = l.kind === "item" ? l.payload?.name ?? "Equipment" : l.kind === "gem" ? `${gemName(l.resource)} ×${l.quantity}` : `${resourceName$1(l.resource)} ×${l.quantity}`;
					const sub = l.kind === "item" ? `Equipment · iLvl ${l.payload?.ilvl ?? "—"} · by ${l.seller_name}` : l.kind === "gem" ? `Gem · by ${l.seller_name}` : `${DISCOVERY_RARITIES[Number(r)]} · ${GATHERING_AREAS[Number(a)]} · by ${l.seller_name}`;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `slot rarity-${rc} flex items-center gap-3 p-3`,
						children: [
							l.kind === "item" && l.payload ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GearIcon, {
								item: l.payload,
								size: 40
							}) : gemInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-10 w-10 shrink-0 items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, { type: gemInfo.type })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryArt, {
								profession: p,
								rarity: Number(r),
								className: "h-10 w-10 rounded"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-display",
									children: name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: sub
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: l.price })
								}), mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									disabled: request.busy,
									onClick: () => run("Listing cancelled — returned to you", () => cancelListing(l.id)),
									children: "Cancel"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									disabled: request.busy || hero.gold < l.price,
									onClick: () => run(`Bought ${name}`, () => buyListing(l.id)),
									children: "Buy"
								})]
							})
						]
					}, l.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Trades settle instantly and are recorded on the server — gold and goods move atomically, and a sold listing can never be sold twice. Cancelling returns the goods to your bag or pouch."
			})
		]
	});
}
var world_map_default = "/assets/world-map-DhVXNJBb.jpg";
/** World map raid kinds and their server-enforced daily allowances (UTC day). */
var RAID_LIMITS = {
	gold: 10,
	ore: 8,
	boss: 4
};
var MAP_NODES = [
	{
		id: "gold-1",
		kind: "gold",
		name: "Sunken Treasury",
		x: 18,
		y: 62,
		desc: "Flooded vaults glittering with coin."
	},
	{
		id: "gold-2",
		kind: "gold",
		name: "Gilded Hollow",
		x: 30,
		y: 38,
		desc: "A forest cave veined with gold."
	},
	{
		id: "gold-3",
		kind: "gold",
		name: "Merchant's Folly",
		x: 44,
		y: 70,
		desc: "A lost caravan's buried fortune."
	},
	{
		id: "gold-4",
		kind: "gold",
		name: "Azure Claim",
		x: 58,
		y: 30,
		desc: "Blue crystal marks the richest seam."
	},
	{
		id: "gold-5",
		kind: "gold",
		name: "King's Cache",
		x: 68,
		y: 56,
		desc: "A royal hoard, long forgotten."
	},
	{
		id: "gold-6",
		kind: "gold",
		name: "Rivergilt Mine",
		x: 80,
		y: 40,
		desc: "Panners still whisper of nuggets."
	},
	{
		id: "gold-7",
		kind: "gold",
		name: "Embergilt Depths",
		x: 88,
		y: 68,
		desc: "Molten gold pools in the deep rock."
	},
	{
		id: "ore-1",
		kind: "ore",
		name: "Verdant Warrens",
		x: 14,
		y: 30,
		desc: "Goblins hoard ore in the green deeps."
	},
	{
		id: "ore-2",
		kind: "ore",
		name: "Mossvein Cavern",
		x: 36,
		y: 55,
		desc: "Copper roots thread the stone."
	},
	{
		id: "ore-3",
		kind: "ore",
		name: "Thornpick Delve",
		x: 52,
		y: 48,
		desc: "Every thorn hides a vein."
	},
	{
		id: "ore-4",
		kind: "ore",
		name: "Greenfall Excavation",
		x: 63,
		y: 74,
		desc: "The quarry that never empties."
	},
	{
		id: "ore-5",
		kind: "ore",
		name: "Emerald Maw",
		x: 76,
		y: 22,
		desc: "A beast's jaw of jade and iron."
	},
	{
		id: "boss-1",
		kind: "boss",
		name: "Iron Overlord",
		x: 25,
		y: 80,
		desc: "The Aegis Vault's eternal warden."
	},
	{
		id: "boss-2",
		kind: "boss",
		name: "Gorefiend",
		x: 55,
		y: 14,
		desc: "It remembers every drop of blood."
	},
	{
		id: "boss-3",
		kind: "boss",
		name: "Ember Titan",
		x: 90,
		y: 50,
		desc: "The mountain that walks."
	}
];
/** Server response for today's raid usage. */
var worldMapStateSchema = objectType({
	now: stringType(),
	resetAt: stringType(),
	used: objectType({
		gold: numberType(),
		ore: numberType(),
		boss: numberType()
	}),
	nodes: arrayType(stringType())
});
var raidsLeft = (state, kind) => Math.max(0, RAID_LIMITS[kind] - state.used[kind]);
/** How often a node was raided today: a node can be raided again while its kind's daily allowance lasts. */
var nodeUses = (state, id) => state.nodes.filter((n) => n === id).length;
var canRaid = (state, node) => raidsLeft(state, node.kind) > 0;
/** Encounter for a map node, scaled to the hero. Bosses reuse the dungeon wardens. */
function mapFoe(node, heroLevel) {
	if (node.kind === "boss") {
		const d = DUNGEONS[node.id === "boss-1" ? 0 : node.id === "boss-2" ? 1 : 3];
		return dungeonFoe(d, heroLevel);
	}
	const mult = node.kind === "gold" ? .9 : 1;
	const foe = stageFoe(Math.max(2, heroLevel), mult);
	const idx = MAP_NODES.filter((n) => n.kind === node.kind).findIndex((n) => n.id === node.id);
	return {
		...foe,
		name: node.kind === "gold" ? "Mine Guardian" : "Ore Gnasher",
		sprite: enemySprite(node.kind === "gold" ? 1 : 0, idx % 4)
	};
}
async function loadWorldMap() {
	return withServerHero(async (id) => {
		const { data, error } = await supabase.rpc("world_map_state", { _hero: id });
		if (error) throw new Error(error.message);
		return worldMapStateSchema.parse(data);
	});
}
/** Called only after a won battle; the server enforces the daily limits and grants the reward. */
async function completeWorldRaid(node) {
	const id = getState().heroId;
	if (!id) throw new Error("Select a character first.");
	const op = `world-raid:${node}`;
	const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
	const result = await withServerHero(async (heroId) => {
		const { data, error } = await supabase.rpc("world_raid_complete", {
			_hero: heroId,
			_node: node,
			_req: req
		});
		if (error) throw new Error(error.message);
		adoptServerSave(heroId, returnedSave(data));
		return object(data);
	});
	localStorage.removeItem(`ef-pending:${id}:${op}`);
	return {
		reward: object(result["reward"]),
		repeat: result["repeat"] === true
	};
}
var KIND_STYLE = {
	gold: {
		ring: "ring-sky-400",
		dot: "bg-sky-400",
		label: "Gold mine",
		Icon: Gem
	},
	ore: {
		ring: "ring-emerald-400",
		dot: "bg-emerald-400",
		label: "Ore dungeon",
		Icon: Hammer
	},
	boss: {
		ring: "ring-blood",
		dot: "bg-blood",
		label: "World boss",
		Icon: Skull
	}
};
function WorldMap({ onClose, start }) {
	const { hero } = useGame();
	const [state, setState] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [hover, setHover] = (0, import_react.useState)(null);
	const refresh = () => {
		loadWorldMap().then(setState).catch((e) => setError(e instanceof Error ? e.message : "Failed to load the world map."));
	};
	(0, import_react.useEffect)(refresh, []);
	if (!hero) return null;
	const raid = (node) => {
		if (!state || !canRaid(state, node)) return;
		const foe = mapFoe(node, hero.level + hero.paragon);
		start({
			title: `World Map · ${node.name}`,
			right: foe,
			onResult: async (won) => {
				if (!won) return { lines: ["The defenders hold. Come back stronger."] };
				try {
					const r = await completeWorldRaid(node.id);
					const lines = Object.entries(r.reward).flatMap(([k, v]) => typeof v === "number" ? [`+${v.toLocaleString()} ${k}`] : v && typeof v === "object" ? Object.entries(v).map(([m, n]) => `+${n} ${m}`) : []);
					refresh();
					return { lines: lines.length ? lines : ["Raid complete."] };
				} catch (e) {
					return { lines: [e instanceof Error ? e.message : "Reward confirmation failed."] };
				}
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "World Map",
		onClose,
		wide: true,
		children: [error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mb-2 text-sm text-blood",
			children: error
		}), !state ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-center gap-2 py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }), "Charting the realm…"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap gap-3 text-xs",
				children: [Object.keys(RAID_LIMITS).map((k) => {
					const { label, dot } = KIND_STYLE[k];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "slot flex items-center gap-1.5 px-2 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2.5 w-2.5 rounded-full ${dot}` }),
							label,
							": ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
								raidsLeft(state, k),
								"/",
								RAID_LIMITS[k]
							] }),
							" left today"
						]
					}, k);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-auto text-muted-foreground",
					children: ["Resets ", new Date(state.resetAt).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-lg border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: world_map_default,
					alt: "World map",
					className: "h-auto w-full select-none",
					draggable: false,
					loading: "lazy",
					width: 1536,
					height: 1024
				}), MAP_NODES.map((n) => {
					const { ring, dot, Icon } = KIND_STYLE[n.kind];
					const uses = nodeUses(state, n.id);
					const locked = !canRaid(state, n);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"aria-label": `${n.name} (${KIND_STYLE[n.kind].label})`,
						disabled: locked,
						className: `absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-background/60 bg-background/70 ring-2 backdrop-blur-sm transition hover:scale-125 ${ring} ${locked ? "opacity-40" : ""}`,
						style: {
							left: `${n.x}%`,
							top: `${n.y}%`
						},
						onMouseEnter: () => setHover(n.id),
						onMouseLeave: () => setHover(null),
						onClick: () => raid(n),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${dot}` }),
							uses > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-background/85 px-1 text-[9px] font-bold leading-tight text-gold",
								children: ["×", uses]
							}),
							hover === n.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								role: "tooltip",
								className: "hotspot-label pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 whitespace-normal rounded px-2 py-1 text-left text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: n.name }),
									" · ",
									KIND_STYLE[n.kind].label,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] text-foreground/80",
										children: n.desc
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px]",
										children: locked ? "Daily allowance spent" : uses > 0 ? `Cleared ${uses}× today · tap to raid` : "Tap to raid"
									})
								]
							})
						]
					}, n.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Win the fight to claim the node. Gold mines pay ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: 500 }),
					"+ scaling with level, ore dungeons drop ore and Soul Essence, and world bosses drop Boss Cores and Starshards. Rewards are granted by the server on every win; each raid type has its own daily allowance and a node can be raided again while it lasts."
				]
			})
		] })]
	});
}
var theme_mp3_asset_default = {
	version: 1,
	asset_id: "2fa11e00-6196-49c9-98e7-c0689a26dad8",
	project_id: "0f299f2d-878f-49ca-a474-e222b4b4c5ed",
	url: "/__l5e/assets-v1/2fa11e00-6196-49c9-98e7-c0689a26dad8/theme.mp3",
	r2_key: "a/v1/0f299f2d-878f-49ca-a474-e222b4b4c5ed/2fa11e00-6196-49c9-98e7-c0689a26dad8/theme.mp3",
	original_filename: "theme.mp3",
	size: 614055,
	content_type: "audio/mpeg",
	created_at: "2026-10-18T08:06:21Z"
};
var battle_enemies_default = "/assets/battle-enemies-B_RP9lz1.png";
function BattleCharacter({ u }) {
	if (u.cls) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `battle-character flex h-full w-full items-end justify-center ${u.side === "foe" ? "battle-mirror" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
			cls: u.cls,
			gender: u.gender === "female" ? "female" : "male",
			look: u.look,
			className: "h-full w-full"
		})
	});
	const identity = `${u.name} ${u.img}`;
	const col = /dragon|wyrm/i.test(identity) ? 3 : /goblin|brute grunt/i.test(identity) ? 1 : /skeleton|bone/i.test(identity) ? 0 : 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `battle-character h-full w-full ${u.side === "foe" && u.cls ? "battle-mirror" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-full w-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: battle_enemies_default,
				alt: u.name,
				width: 1920,
				height: 1024,
				draggable: false,
				className: "absolute max-w-none",
				style: {
					width: "400%",
					height: "100%",
					left: `${-col * 100}%`,
					top: 0
				}
			})
		})
	});
}
/** Impact artwork drawn on the target when a blow lands. */
function CombatEffect({ kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: `combat-effect effect-${kind}`,
		viewBox: "0 0 200 240",
		"aria-hidden": "true",
		children: kind === "arrow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M15 190L175 50M142 50H175V83M20 170L38 188M30 160L48 178" }) : kind === "slash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M25 200Q60 90 180 30Q130 140 25 200Z" }) : kind === "ice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 30V210M25 70L175 170M25 170L175 70M80 50L100 70L120 50M80 190L100 170L120 190" }) : kind === "heal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 60V160M50 110H150M40 180L40 155M160 190V165M70 45V20" }) : kind === "shield" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 25L170 55V115Q165 170 100 210Q35 170 30 115V55Z" }) : kind === "fire" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 20Q135 80 118 110Q160 75 162 120Q190 190 100 220Q15 200 38 135Q55 105 58 75Q75 120 90 130Q72 70 100 20Z" }) : kind === "meteor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M150 15L110 95M175 40L135 120M125 8L95 60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "95",
				cy: "150",
				r: "34"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M95 116Q140 130 150 175Q110 205 60 185Q55 140 95 116Z" })
		] }) : kind === "tether" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 40Q100 120 180 200M40 200Q110 130 180 60M100 90V150M70 120H130" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "100",
			cy: "120",
			r: "26"
		})] }) : kind === "mark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "120",
				r: "60"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 40V70M100 170V200M20 120H50M150 120H180" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "120",
				r: "12"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M25 175L85 125L60 95L140 65L105 120L145 145L25 175Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "100",
			cy: "120",
			r: "75"
		})] })
	});
}
/**
* The weapon or energy trail drawn over the fighter while the move plays. Each move draws a
* different shape, so a sword swing reads differently from a bow draw or a frost nova.
*/
function WeaponArc({ move }) {
	const art = {
		swing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M30 180Q70 70 175 45Q120 105 60 195Z" }),
		overhead: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 15Q165 60 150 165Q105 95 95 25Z" }),
		spin: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M40 120Q100 30 160 120Q100 210 40 120Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 30Q190 120 100 210Q10 120 100 30Z" })] }),
		leap: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M150 20L70 150M175 55L105 170" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 150L110 175L80 200Z" })] }),
		slam: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 90L140 90L150 150Q100 190 50 150Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 30V70M40 60L60 85M160 60L140 85" })] }),
		rage: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 210Q45 150 75 110Q70 160 95 175Z" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M140 210Q155 145 120 105Q130 160 105 175Z" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 205Q80 140 100 70Q120 140 100 205Z" })
		] }),
		cast: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "120",
			cy: "90",
			r: "24"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M120 40V60M120 120V140M70 90H90M150 90H170M85 55L100 70M140 110L155 125" })] }),
		thrust: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M40 120H150M150 120L120 95M150 120L120 145" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 90L80 120L60 150" })] }),
		nova: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "130",
				r: "30"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "130",
				r: "60"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "130",
				r: "88"
			})
		] }),
		rise: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M100 210Q70 150 100 60Q130 150 100 210Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 190Q50 140 75 100M140 190Q150 140 125 100" })] }),
		channel: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M50 60Q100 100 150 60M50 110Q100 150 150 110M50 160Q100 200 150 160" }) }),
		siphon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 200Q100 150 180 60M35 160Q100 130 165 90M60 210Q110 180 150 140" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "100",
			cy: "140",
			r: "18"
		})] }),
		draw: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M30 60Q90 120 30 180M30 120H165M165 120L140 100M165 120L140 140" }) }),
		rapid: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M30 70H150M30 120H170M30 170H150" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M150 70L130 55M170 120L150 105M150 170L130 155" })] }),
		aim: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "140",
			cy: "110",
			r: "34"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M140 50V76M140 144V170M80 110H106M174 110H200M20 190L110 130" })] }),
		dash: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 90H110M30 130H140M20 170H110" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M150 60L185 120L150 180" })] }),
		drink: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "90",
				cy: "70",
				r: "10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "120",
				cy: "110",
				r: "14"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "85",
				cy: "150",
				r: "18"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M60 200H140" })
		] })
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: `battle-arc arc-${move}`,
		viewBox: "0 0 200 240",
		"aria-hidden": "true",
		children: art[move]
	});
}
var SKILL_MOVE = {
	strike: "swing",
	cleave: "overhead",
	rage: "rage",
	slam: "slam",
	whirl: "spin",
	execute: "leap",
	bolt: "cast",
	nova: "nova",
	meteor: "rise",
	inferno: "channel",
	spike: "thrust",
	drain: "siphon",
	shot: "draw",
	volley: "rapid",
	snipe: "aim",
	pierce: "draw",
	rain: "rapid",
	shadow: "dash",
	potion: "drink",
	guard: "slam",
	taunt: "thrust",
	counter: "overhead",
	mark: "aim",
	evade: "dash",
	firestorm: "channel",
	barrier: "nova",
	restore: "siphon",
	aegis: "slam",
	cyclone: "spin",
	sovereign: "leap",
	solar: "rise",
	winter: "nova",
	"astral-siphon": "siphon",
	horizon: "aim",
	tempest: "rapid",
	eclipse: "dash"
};
/** Impact art that lands on the target. Heal/block events keep their own kind; this covers strikes. */
var SKILL_EFFECT = {
	strike: "slash",
	cleave: "slash",
	rage: "fire",
	slam: "shield",
	whirl: "slash",
	execute: "slash",
	bolt: "arcane",
	nova: "ice",
	meteor: "meteor",
	inferno: "fire",
	spike: "ice",
	drain: "tether",
	shot: "arrow",
	volley: "arrow",
	snipe: "mark",
	pierce: "arrow",
	rain: "arrow",
	shadow: "slash",
	potion: "heal",
	guard: "shield",
	taunt: "slash",
	counter: "shield",
	mark: "mark",
	evade: "arcane",
	firestorm: "fire",
	barrier: "arcane",
	restore: "heal",
	aegis: "shield",
	cyclone: "slash",
	sovereign: "mark",
	solar: "meteor",
	winter: "ice",
	"astral-siphon": "tether",
	horizon: "mark",
	tempest: "arrow",
	eclipse: "tether"
};
/** The move an actor performs. Unknown skills fall back to that class's signature move. */
function moveFor(actor, skillId) {
	const known = skillId ? SKILL_MOVE[skillId] : void 0;
	if (known) return known;
	if (actor.cls === "mage") return "cast";
	if (actor.cls === "archer") return "draw";
	if (actor.cls === "warrior") return "swing";
	const n = (actor.name ?? "").toLowerCase();
	if (/dragon|wyrm|demon|fiend|brute|golem|titan/.test(n)) return "slam";
	if (/skeleton|bone|wraith|spirit|ghost|lich|undead/.test(n)) return "thrust";
	if (/goblin|imp|rat|hound|wolf|bat/.test(n)) return "dash";
	if (/shaman|witch|seer|priest|cultist|warlock/.test(n)) return "cast";
	if (/hunter|sniper|marksman|ranger/.test(n)) return "draw";
	if (/guard|captain|lord|king|queen|knight|champion|warden/.test(n)) return "overhead";
	return "swing";
}
/** Impact artwork for a strike. Returns null when the caller should use the event's own kind. */
function effectFor(skillId) {
	return skillId ? SKILL_EFFECT[skillId] ?? null : null;
}
function CharacterPose({ cls, gender, chest, weapon, className = "" }) {
	const [replay, setReplay] = (0, import_react.useState)(0);
	const move = moveFor({ cls });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pose-unit relative ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `relative h-full w-full ${replay ? `anim-${move}` : "anim-idle"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
				cls,
				gender,
				chest,
				weapon,
				className: "h-full w-full"
			}), replay > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeaponArc, { move })]
		}, replay), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "absolute bottom-1 right-1 bg-background/70",
			title: "Preview class action",
			"aria-label": "Preview class action",
			onClick: () => setReplay((n) => n + 1),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" })
		})]
	});
}
function Portrait({ cls, gender, className = "", chest, weapon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
		cls,
		gender,
		chest,
		weapon,
		className
	});
}
var DESC = {
	warrior: {
		style: "Melee · Tank",
		text: "Durable frontline fighter. Heavy physical blows, high armor and health."
	},
	mage: {
		style: "Ranged · Spells",
		text: "Elemental spellcaster. Devastating magic damage, fragile defenses."
	},
	archer: {
		style: "Ranged · Crits",
		text: "Agile marksman. High critical chance and dodge, precise arrows."
	}
};
var CLASS_ORDER = [
	"warrior",
	"mage",
	"archer"
];
var GENDERS = ["female", "male"];
var LOOK_NAMES = [
	"Iron",
	"Ember",
	"Moon",
	"Ancestral"
];
var CLASS_ICON = {
	warrior: Shield,
	mage: WandSparkles,
	archer: Crosshair
};
/** The blood moon every selection screen is built on. */
function BloodMoonBackdrop() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 overflow-hidden",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "blood-sky absolute inset-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "blood-moon-glow absolute left-1/2 top-[-10vh] h-[95vh] w-[95vh] -translate-x-1/2 rounded-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "blood-moon absolute left-1/2 top-[6vh] h-[52vh] w-[52vh] -translate-x-1/2 rounded-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "blood-fog absolute inset-x-0 bottom-0 h-[46vh]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette absolute inset-0" })
		]
	});
}
function ClassHeader({ cls }) {
	const Icon = CLASS_ICON[cls];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "h-5 w-5 shrink-0",
				style: {
					color: CLASS_ACCENT[cls],
					filter: `drop-shadow(0 0 6px ${CLASS_ACCENT[cls]})`
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-lg uppercase tracking-[0.18em] text-foreground/90",
				children: CLASSES[cls].name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] uppercase tracking-widest text-muted-foreground",
				children: DESC[cls].style
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-px flex-1",
				style: { background: `linear-gradient(90deg, ${CLASS_ACCENT[cls]}66, transparent)` }
			})
		]
	});
}
/** One ornate gothic portrait frame, with its glowing gems and an invisible hit area. */
function HeroFrame({ cls, gender, look, selected, onPick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `hero-frame ${selected ? "hero-frame-on" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-t" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hero-frame-art",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
					cls,
					gender,
					look: {
						chest: look,
						weapon: look
					},
					className: "h-full w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hero-frame-name",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-b" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "hero-frame-hit",
				"aria-label": `${label} ${CLASSES[cls].name}`,
				"aria-pressed": selected,
				onClick: onPick
			})
		]
	});
}
function CharacterSelect() {
	const { chars, charsError, email } = useGame();
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [confirmDel, setConfirmDel] = (0, import_react.useState)(null);
	const enter = async (id) => {
		setBusy(id);
		setErr(null);
		const e = await selectCharacter(id);
		if (e) setErr(e);
		setBusy(null);
	};
	const showCreate = creating || chars !== null && chars.length === 0 && !charsError;
	const last = chars?.find((c) => c.id === lastCharacterId()) ?? chars?.[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BloodMoonBackdrop, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-4 pb-10 pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex w-full items-center justify-between text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex items-center gap-1 hover:text-gold",
							onClick: () => supabase.auth.signOut(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Sign out"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "select-title mb-1 text-center text-4xl font-black md:text-6xl",
						children: "Select your hero"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-6 text-center font-display text-xs uppercase tracking-[0.4em] text-gold/70",
						children: "EmberFall Online"
					}),
					chars === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 py-20 font-display text-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }), "Loading your characters…"]
					}),
					charsError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "game-panel p-6 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-3 text-hp",
							children: ["Couldn't load characters: ", charsError]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-gold px-4 py-2",
							onClick: () => loadCharacters(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1 inline h-4 w-4" }), "Retry"]
						})]
					}),
					chars && !showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "btn-gold mb-6 flex items-center gap-2 px-8 py-3 text-xl",
						disabled: !!busy,
						onClick: () => enter(last.id),
						children: [
							busy === last.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5" }),
							"Continue as ",
							last.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid w-full grid-cols-2 gap-4 md:grid-cols-4",
						children: [chars.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hero-frame hero-frame-compact",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-t" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "hero-frame-art",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterPose, {
												cls: c.hero_class,
												gender: c.gender,
												className: "h-full w-full"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-b" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 truncate text-center font-display text-lg",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center text-xs text-muted-foreground",
									children: [
										CLASSES[c.hero_class].name,
										" · ",
										c.gender
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center text-xs",
									children: [
										"Lv ",
										c.level,
										c.stats?.paragon ? ` · Asc ${c.stats.paragon}` : "",
										" · BR ",
										fmt(c.power)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center text-[10px] text-muted-foreground",
									children: ["Last played ", new Date(c.last_played).toLocaleDateString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn-gold flex-1 py-1.5 text-sm",
										disabled: !!busy,
										onClick: () => enter(c.id),
										children: busy === c.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-4 w-4 animate-spin" }) : "Play"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "slot px-2",
										"aria-label": "Delete",
										onClick: () => setConfirmDel(c),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-hp" })
									})]
								})
							]
						}, c.id)), chars.length < 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "hero-frame hero-frame-compact hero-frame-empty flex-col items-center justify-center gap-2",
							onClick: () => setCreating(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-t" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-10 w-10 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display uppercase tracking-widest",
									children: "New hero"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-b" })
							]
						})]
					})] }),
					showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCharacter, {
						canCancel: (chars?.length ?? 0) > 0,
						onCancel: () => setCreating(false)
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-center text-hp",
						children: err
					})
				]
			}),
			confirmDel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "game-panel anim-pop w-full max-w-sm p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mb-2 font-display text-2xl",
							children: [
								"Delete ",
								confirmDel.name,
								"?"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted-foreground",
							children: "This permanently erases this character and all its progress."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "slot flex-1 py-2",
								onClick: () => setConfirmDel(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-blood flex-1 py-2",
								onClick: async () => {
									const e = await deleteCharacter(confirmDel.id);
									setConfirmDel(null);
									if (e) setErr(e);
								},
								children: "Delete forever"
							})]
						})
					]
				})
			})
		]
	});
}
function CreateCharacter({ canCancel, onCancel }) {
	const [cls, setCls] = (0, import_react.useState)("warrior");
	const [gender, setGender] = (0, import_react.useState)("male");
	const [look, setLook] = (0, import_react.useState)(0);
	const [name, setName] = (0, import_react.useState)("");
	const [step, setStep] = (0, import_react.useState)("pick");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const valid = /^[A-Za-z0-9 _-]{3,18}$/.test(name.trim());
	const accent = CLASS_ACCENT[cls];
	if (step === "confirm") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "anim-pop flex w-full max-w-md flex-col items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hero-frame w-[240px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-t" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hero-frame-art",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
							cls,
							gender,
							look: {
								chest: look,
								weapon: look
							},
							className: "h-full w-full"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hero-frame-gem hero-frame-gem-b" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 font-display text-3xl",
				children: name.trim()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-muted-foreground",
				children: [
					gender === "male" ? "Male" : "Female",
					" ",
					CLASSES[cls].name
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-center text-sm",
				children: DESC[cls].text
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-hp",
				children: err
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex w-full gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "slot flex-1 py-2",
					onClick: () => setStep("pick"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 inline h-4 w-4" }), "Back"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold flex-1 py-2",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						setErr(null);
						const e = await createCharacter(name.trim(), cls, gender);
						if (e) setErr(e);
						setBusy(false);
					},
					children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-5 w-5 animate-spin" }) : "Enter the castle"
				})]
			}),
			canCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mt-3 text-sm text-muted-foreground hover:text-gold",
				onClick: onCancel,
				children: "Back to my characters"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-full flex-col items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm uppercase tracking-[0.2em]",
					style: { color: accent },
					children: CLASSES[cls].name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: DESC[cls].text
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full max-w-3xl space-y-5",
				children: CLASS_ORDER.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": CLASSES[c].name,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassHeader, { cls: c }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:gap-5",
						children: GENDERS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroFrame, {
							cls: c,
							gender: g,
							look,
							label: g === "female" ? "Female" : "Male",
							selected: cls === c && gender === g,
							onPick: () => {
								setCls(c);
								setGender(g);
							}
						}, g))
					})]
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex w-full max-w-3xl flex-col items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "h-3 w-3",
							style: { color: accent }
						}),
						lookName(cls, "chest", look),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "opacity-40",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {
							className: "h-3 w-3",
							style: { color: accent }
						}),
						lookName(cls, "weapon", look)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: LOOK_NAMES.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLook(i),
						"aria-pressed": look === i,
						className: `px-3 py-1 text-[10px] uppercase tracking-widest ${look === i ? "btn-gold" : "slot"}`,
						title: lookName(cls, "chest", i),
						children: n
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex w-full max-w-md gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value.slice(0, 18)),
					placeholder: "Hero name (3–18)",
					className: "slot flex-1 px-4 py-3 font-display text-lg outline-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold px-6 text-lg uppercase tracking-wider",
					disabled: !valid,
					onClick: () => setStep("confirm"),
					children: "Next"
				})]
			}),
			name && !valid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-hp",
				children: "Use 3–18 letters, numbers, spaces, - or _"
			}),
			canCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mt-3 text-sm text-muted-foreground hover:text-gold",
				onClick: onCancel,
				children: "Back to my characters"
			})
		]
	});
}
var FRAMES = [
	{
		id: "iron",
		name: "Iron",
		minLevel: 1
	},
	{
		id: "bronze",
		name: "Bronze",
		minLevel: 10
	},
	{
		id: "silver",
		name: "Silver",
		minLevel: 25
	},
	{
		id: "gold",
		name: "Gold",
		minLevel: 50
	},
	{
		id: "ember",
		name: "Ember",
		minLevel: 80
	}
];
var TITLES = [
	{
		id: "",
		name: "None",
		minLevel: 1
	},
	{
		id: "Squire",
		name: "Squire",
		minLevel: 5
	},
	{
		id: "Vanguard",
		name: "Vanguard",
		minLevel: 20
	},
	{
		id: "Champion",
		name: "Champion",
		minLevel: 40
	},
	{
		id: "Ascendant",
		name: "Ascendant",
		minLevel: 80
	}
];
var frameClass = (f) => ({
	iron: "rarity-0",
	bronze: "rarity-1",
	silver: "rarity-2",
	gold: "rarity-4",
	ember: "rarity-5"
})[f] ?? "rarity-0";
function ProfilePanel({ onClose }) {
	const { hero, heroId, chars, gender } = useGame();
	const row = chars?.find((c) => c.id === heroId);
	const [bio, setBio] = (0, import_react.useState)(row?.bio ?? "");
	const [title, setTitle] = (0, import_react.useState)(row?.title ?? "");
	const [frame, setFrame] = (0, import_react.useState)(row?.frame ?? "iron");
	const [pub, setPub] = (0, import_react.useState)(row?.is_public ?? true);
	const [msg, setMsg] = (0, import_react.useState)(null);
	if (!hero) return null;
	const lvl = hero.level + hero.paragon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Profile",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 md:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `slot w-40 shrink-0 self-center p-1 ${frameClass(frame)}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
					cls: hero.cls,
					gender,
					chest: hero.equipment.armour,
					weapon: hero.equipment.weapon,
					className: "w-full"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-2xl",
						children: hero.name
					}), title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-gold",
						children: title
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Biography", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "slot mt-1 w-full p-2 outline-none",
							maxLength: 200,
							rows: 3,
							value: bio,
							onChange: (e) => setBio(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-1",
							children: [...TITLES, ...earnedTitles(hero).map((n) => ({
								id: n,
								name: n,
								minLevel: 1
							}))].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: lvl < t.minLevel,
								className: `px-2 py-1 text-xs ${title === t.id ? "btn-gold" : "slot"} disabled:opacity-40`,
								title: lvl < t.minLevel ? `Unlocks at level ${t.minLevel}` : "",
								onClick: () => setTitle(t.id),
								children: t.name
							}, t.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: ["Frame", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-1",
							children: FRAMES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: lvl < f.minLevel,
								className: `px-2 py-1 text-xs ${frame === f.id ? "btn-gold" : "slot"} disabled:opacity-40`,
								title: lvl < f.minLevel ? `Unlocks at level ${f.minLevel}` : "",
								onClick: () => setFrame(f.id),
								children: f.name
							}, f.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: pub,
							onChange: (e) => setPub(e.target.checked)
						}), "Public profile (visible in arena & rankings)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold px-6 py-2",
						onClick: async () => {
							const e = await updateProfile({
								bio: bio.trim(),
								title,
								frame,
								is_public: pub
							});
							setMsg(e ?? "Profile saved");
						},
						children: "Save profile"
					}),
					msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-3 text-sm text-gold",
						children: msg
					})
				]
			})]
		})
	});
}
var arena_field_default = "/assets/arena-field-DR9BfPgp.jpg";
var arena_crypt_default = "/assets/arena-crypt-CLioYULR.jpg";
var arena_lair_default = "/assets/arena-lair-DK3AnOJW.jpg";
var arena_rift_default = "/assets/arena-rift-DGZZSFCv.jpg";
var RESOURCE = {
	warrior: "Rage",
	mage: "Mana",
	archer: "Focus"
};
var resourceName = (c) => c ? RESOURCE[c] : "Energy";
var ADAPT = {
	strike: {
		name: "Heavy Strike",
		desc: "Strong single-target physical blow. Builds Rage.",
		cost: 0,
		gain: 20
	},
	cleave: {
		target: "all",
		mult: 1.15,
		cost: 25,
		desc: "Sweeps every enemy in front of you."
	},
	rage: {
		cost: 40,
		desc: "Massive blow that heals you."
	},
	slam: {
		cost: 30,
		desc: "Stuns the target for a turn."
	},
	whirl: {
		target: "all",
		cost: 35,
		desc: "Spinning strikes against all enemies."
	},
	execute: {
		cost: 50,
		desc: "Devastating blow that always crits."
	},
	bolt: {
		desc: "Magical single-target damage. Restores Mana.",
		cost: 0,
		gain: 20
	},
	nova: {
		name: "Frostbind",
		desc: "Freezes the target (skips its turn) and slows it.",
		cost: 30,
		applies: {
			kind: "slow",
			turns: 2,
			value: 30
		}
	},
	meteor: {
		cost: 50,
		desc: "Huge fire damage on one target, leaving it burning.",
		applies: {
			kind: "burn",
			turns: 3,
			value: .25
		}
	},
	inferno: {
		target: "all",
		cost: 45,
		desc: "Fire rains on every enemy."
	},
	spike: {
		cost: 40,
		desc: "Piercing ice that freezes the target."
	},
	drain: {
		cost: 35,
		desc: "Steals life from the target."
	},
	shot: {
		name: "Piercing Shot",
		desc: "Precise shot that ignores 20% armor. Builds Focus.",
		cost: 0,
		gain: 20,
		penBonus: 20
	},
	volley: {
		name: "Multishot",
		target: "multi",
		maxTargets: 3,
		hits: 1,
		mult: 1.05,
		cost: 25,
		desc: "Fires at up to 3 chosen enemies."
	},
	snipe: {
		name: "Deadly Aim",
		cost: 50,
		desc: "Lethal aimed shot that always crits."
	},
	pierce: {
		cost: 40,
		desc: "Armor-shredding arrow that always crits.",
		penBonus: 30
	},
	rain: {
		target: "all",
		cost: 40,
		desc: "Arrows fall on every enemy."
	},
	aegis: {
		cost: 40,
		desc: "A shield-driven impact stuns one foe."
	},
	cyclone: {
		target: "all",
		cost: 50,
		desc: "Four sweeping strikes against every foe."
	},
	sovereign: {
		cost: 60,
		desc: "A leaping execution; guaranteed critical damage."
	},
	solar: {
		target: "all",
		cost: 55,
		desc: "Four solar impacts burn every foe.",
		applies: {
			kind: "burn",
			turns: 2,
			value: .15
		}
	},
	winter: {
		target: "all",
		cost: 50,
		desc: "An expanding frost wave freezes every foe."
	},
	"astral-siphon": {
		cost: 45,
		desc: "A life-draining tether heals the caster."
	},
	horizon: {
		cost: 50,
		penBonus: 40,
		desc: "An aimed critical arrow ignores 40% armor."
	},
	tempest: {
		target: "all",
		cost: 50,
		desc: "Five arrow waves strike every foe."
	},
	eclipse: {
		cost: 40,
		desc: "A shadow dash heals you and grants evasion.",
		selfApplies: {
			kind: "evade",
			turns: 2,
			value: 30
		}
	}
};
var EXTRA = {
	warrior: [
		{
			id: "guard",
			name: "Shield Guard",
			desc: "Reduce incoming damage by 45% for 2 turns.",
			icon: "shield",
			mult: 0,
			cd: 4,
			cost: 20,
			target: "self",
			selfApplies: {
				kind: "guard",
				turns: 2,
				value: 45
			}
		},
		{
			id: "taunt",
			name: "Taunting Blow",
			desc: "0.9× hit that weakens the target's attack by 25% for 2 turns and draws its fury.",
			icon: "megaphone",
			mult: .9,
			cd: 3,
			cost: 15,
			target: "enemy",
			applies: {
				kind: "weaken",
				turns: 2,
				value: 25
			}
		},
		{
			id: "counter",
			name: "Counterattack",
			desc: "For 2 turns, strike back for 0.7× whenever you are hit.",
			icon: "swords",
			mult: 0,
			cd: 5,
			cost: 25,
			target: "self",
			selfApplies: {
				kind: "counter",
				turns: 2,
				value: .7
			}
		}
	],
	archer: [{
		id: "mark",
		name: "Mark Target",
		desc: "0.5× shot; the target takes 30% more damage for 3 turns.",
		icon: "scan",
		mult: .5,
		cd: 4,
		cost: 15,
		target: "enemy",
		applies: {
			kind: "mark",
			turns: 3,
			value: 30
		}
	}, {
		id: "evade",
		name: "Evasive Step",
		desc: "+30% dodge for 2 turns.",
		icon: "wind",
		mult: 0,
		cd: 4,
		cost: 20,
		target: "self",
		selfApplies: {
			kind: "evade",
			turns: 2,
			value: 30
		}
	}],
	mage: [
		{
			id: "firestorm",
			name: "Firestorm",
			desc: "0.95× fire damage to every enemy, burning them.",
			icon: "flame",
			mult: .95,
			cd: 3,
			cost: 35,
			target: "all",
			applies: {
				kind: "burn",
				turns: 2,
				value: .15
			}
		},
		{
			id: "barrier",
			name: "Arcane Barrier",
			desc: "Absorb damage equal to 25% of your max HP for 3 turns.",
			icon: "shield",
			mult: 0,
			cd: 5,
			cost: 30,
			target: "self",
			selfApplies: {
				kind: "barrier",
				turns: 3,
				value: .25
			}
		},
		{
			id: "restore",
			name: "Restoration",
			desc: "Heal 28% of max HP (scaled by Healing Power).",
			icon: "heart",
			mult: 0,
			cd: 4,
			cost: 30,
			target: "self",
			heal: .28
		}
	]
};
function buildKit(cls, skills, chosen) {
	const kit = (skills ?? (cls ? SKILLS[cls] : [{
		id: "hit",
		name: "Attack",
		mult: 1,
		cd: 0,
		icon: "sword"
	}])).map((s) => ({
		id: s.id,
		name: s.name,
		desc: `${Math.round(s.mult * (s.hits ?? 1) * 100)}% damage.`,
		icon: s.icon,
		mult: s.mult,
		hits: s.hits,
		cd: s.cd,
		cost: s.cd > 0 ? 25 : 0,
		target: "enemy",
		crit: s.crit,
		heal: s.heal,
		stun: s.stun,
		gain: s.cd === 0 ? 20 : 0,
		...ADAPT[s.id] ?? {}
	}));
	if (cls) {
		for (const e of EXTRA[cls]) if (!kit.some((k) => k.id === e.id)) kit.push(e);
	}
	return chosen ? kit.filter((s, i) => i === 0 || chosen.includes(s.id)) : kit;
}
function toUnit(f, side, id) {
	return {
		id,
		side,
		name: f.name,
		img: f.img,
		sprite: f.sprite,
		mirror: f.mirror,
		cls: f.cls,
		boss: f.boss,
		elite: f.elite,
		level: f.level,
		gender: f.gender,
		scrolls: f.scrolls,
		look: f.look,
		maxHp: Math.max(1, Math.round(f.hp)),
		hp: Math.max(1, Math.round(f.hp)),
		atk: f.atk,
		def: f.def,
		crit: f.crit,
		critDmg: f.critDmg ?? 200,
		dodge: f.dodge,
		pen: f.pen ?? 0,
		acc: f.acc ?? 0,
		block: Math.min(25, f.block ?? (f.boss ? 5 : 0)),
		heal: Math.min(50, f.heal ?? 0),
		speed: Math.round(100 + f.dodge * 2 + (f.acc ?? 0) + (f.cls === "archer" ? 15 : f.cls === "mage" ? 5 : 0) - (f.boss ? 10 : 0)),
		mana: side === "hero" ? 40 : 0,
		maxMana: 100,
		statuses: [],
		cds: {},
		kit: side === "hero" || f.cls ? buildKit(f.cls, f.skills, f.skillLoadout) : [],
		turnsTaken: 0
	};
}
/** Split a single encounter foe into a tactical formation of 1–3 enemies of equal total threat. */
function formation(foe) {
	if (foe.cls) return [foe];
	if (foe.boss) {
		const add = (n) => ({
			...foe,
			name: n,
			boss: false,
			elite: false,
			hp: foe.hp * .14,
			atk: foe.atk * .22,
			level: Math.max(1, foe.level - 2)
		});
		return [
			add("Ember Thrall"),
			{ ...foe },
			add("Cinder Acolyte")
		];
	}
	const lvl = foe.level;
	const n = lvl < 3 ? 1 : lvl % 3 === 0 ? 3 : 2;
	if (n === 1) return [foe];
	const share = n === 2 ? [.6, .5] : [
		.48,
		.38,
		.38
	];
	const atkShare = n === 2 ? [.62, .5] : [
		.5,
		.36,
		.36
	];
	return share.map((s, i) => ({
		...foe,
		name: i === 0 ? foe.name : `${foe.name.split(" ").slice(-1)[0]} Grunt`,
		elite: i === 0 && n === 3,
		hp: foe.hp * s,
		atk: foe.atk * atkShare[i]
	}));
}
function initBattle(hero, foes) {
	const s = {
		units: [toUnit(hero, "hero", "H"), ...foes.map((f, i) => toUnit({
			...f,
			mirror: f.mirror ?? false
		}, "foe", `F${i}`))],
		round: 0,
		queue: [],
		turn: 0,
		over: null,
		log: [],
		potions: 2
	};
	newRound(s);
	return s;
}
var alive = (u) => u.hp > 0;
var unit = (s, id) => {
	const u = s.units.find((x) => x.id === id);
	if (!u) throw new Error("Unknown combatant");
	return u;
};
var heroUnit = (s) => {
	const u = s.units.find((x) => x.side === "hero");
	if (!u) throw new Error("Missing hero");
	return u;
};
var livingFoes = (s) => s.units.filter((u) => u.side === "foe" && alive(u));
var status = (u, k) => u.statuses.find((x) => x.kind === k);
var effSpeed = (u) => Math.round(u.speed * (1 - (status(u, "slow")?.value ?? 0) / 100));
function newRound(s) {
	s.round++;
	s.queue = s.units.filter(alive).sort((a, b) => effSpeed(b) - effSpeed(a) || (a.side === "hero" ? -1 : 1)).map((u) => u.id);
	s.turn = 0;
}
/** The unit whose turn it is (skips dead units). */
function current(s) {
	if (s.over) return null;
	let guard = 0;
	while (guard++ < 50) {
		if (s.turn >= s.queue.length) newRound(s);
		const u = unit(s, s.queue[s.turn]);
		if (u && alive(u)) return u;
		s.turn++;
	}
	return null;
}
function upcoming(s, n = 6) {
	const out = [];
	for (let i = s.turn; i < s.queue.length && out.length < n; i++) {
		const u = unit(s, s.queue[i]);
		if (alive(u)) out.push(u);
	}
	return out;
}
function skillReady(u, sk) {
	if ((u.cds[sk.id] ?? 0) > 0) return `On cooldown (${u.cds[sk.id]})`;
	if (u.mana < sk.cost) return `Needs ${sk.cost} ${resourceName(u.cls)}`;
	return null;
}
function validTargets(s, actor, sk) {
	if (sk.target === "self") return [actor.id];
	return s.units.filter((u) => u.side !== actor.side && alive(u)).map((u) => u.id);
}
function rng() {
	return Math.random();
}
function dealHit(s, a, d, sk, ev, multScale = 1) {
	if (!alive(d)) return 0;
	const hits = sk.hits ?? 1;
	let total = 0;
	const dodge = d.dodge + (status(d, "evade")?.value ?? 0);
	const atk = a.atk * (1 - (status(a, "weaken")?.value ?? 0) / 100);
	for (let i = 0; i < hits && alive(d); i++) {
		const r = calcDamage(atk, d.def, sk.mult * multScale, a.crit, dodge, !!sk.crit, a.critDmg, a.pen + (sk.penBonus ?? 0), a.acc);
		if (r.miss) {
			ev.push({
				kind: "miss",
				src: a.id,
				tgt: d.id,
				text: "MISS",
				skill: sk.id
			});
			continue;
		}
		let dmg = r.dmg * (1 + (status(d, "mark")?.value ?? 0) / 100);
		const g = status(d, "guard");
		if (g) dmg *= 1 - g.value / 100;
		let blocked = false;
		if (d.block > 0 && rng() * 100 < d.block) {
			dmg *= .5;
			blocked = true;
		}
		dmg = Math.max(1, Math.round(dmg));
		const b = status(d, "barrier");
		if (b && b.value > 0) {
			const ab = Math.min(b.value, dmg);
			b.value -= ab;
			dmg -= ab;
			ev.push({
				kind: "absorb",
				tgt: d.id,
				value: ab,
				text: `ABSORB ${ab}`
			});
			if (b.value <= 0) d.statuses = d.statuses.filter((x) => x !== b);
		}
		d.hp = Math.max(0, d.hp - dmg);
		total += dmg;
		ev.push({
			kind: blocked ? "block" : r.crit ? "crit" : "dmg",
			src: a.id,
			tgt: d.id,
			value: dmg,
			text: `${blocked ? "BLOCK " : r.crit ? "✦" : ""}${dmg.toLocaleString()}`,
			skill: sk.id
		});
	}
	if (total > 0) {
		if (sk.stun) addStatus(d, {
			kind: "stun",
			turns: 1,
			value: 0
		}, ev);
		if (sk.applies) addStatus(d, {
			...sk.applies,
			value: sk.applies.kind === "burn" ? Math.round(a.atk * sk.applies.value) : sk.applies.value
		}, ev);
	} else if (sk.applies && sk.applies.kind !== "burn" && sk.mult === 0) addStatus(d, { ...sk.applies }, ev);
	if (!alive(d)) ev.push({
		kind: "death",
		tgt: d.id,
		text: `${d.name} falls!`
	});
	const c = status(d, "counter");
	if (c && alive(d) && alive(a) && total > 0) {
		const r = calcDamage(d.atk, a.def, c.value, d.crit, 0, false, d.critDmg, d.pen, 100);
		a.hp = Math.max(0, a.hp - r.dmg);
		ev.push({
			kind: r.crit ? "crit" : "dmg",
			src: d.id,
			tgt: a.id,
			value: r.dmg,
			text: `COUNTER ${r.dmg}`
		});
		if (!alive(a)) ev.push({
			kind: "death",
			tgt: a.id,
			text: `${a.name} falls!`
		});
	}
	return total;
}
function addStatus(u, st, ev) {
	if (!alive(u)) return;
	const v = st.kind === "barrier" && st.value < 1 ? Math.round(u.maxHp * st.value) : st.value;
	u.statuses = [...u.statuses.filter((x) => x.kind !== st.kind), {
		...st,
		value: v
	}];
	ev.push({
		kind: "status",
		tgt: u.id,
		text: STATUS_LABEL[st.kind]
	});
}
var STATUS_LABEL = {
	guard: "GUARD",
	barrier: "BARRIER",
	mark: "MARKED",
	evade: "EVASIVE",
	slow: "SLOWED",
	stun: "STUNNED",
	burn: "BURNING",
	weaken: "WEAKENED",
	counter: "COUNTER"
};
function healUnit(u, amount, ev) {
	const amt = Math.round(amount * (1 + u.heal / 100));
	const before = u.hp;
	u.hp = Math.min(u.maxHp, u.hp + amt);
	ev.push({
		kind: "heal",
		tgt: u.id,
		value: u.hp - before,
		text: `+${(u.hp - before).toLocaleString()}`
	});
}
function checkOver(s) {
	if (!alive(heroUnit(s))) s.over = "lost";
	else if (livingFoes(s).length === 0) s.over = "won";
}
/** Start-of-turn ticks: DoTs. Returns true if the actor is stunned and loses the turn. */
function startTurn(s, u, ev) {
	const burn = status(u, "burn");
	if (burn) {
		const d = Math.max(1, burn.value);
		u.hp = Math.max(0, u.hp - d);
		ev.push({
			kind: "dmg",
			tgt: u.id,
			value: d,
			text: `🔥${d}`
		});
		if (!alive(u)) ev.push({
			kind: "death",
			tgt: u.id,
			text: `${u.name} burns away!`
		});
	}
	if (!alive(u)) return true;
	if (status(u, "stun")) {
		ev.push({
			kind: "skip",
			tgt: u.id,
			text: "STUNNED"
		});
		return true;
	}
	return false;
}
/** End-of-turn: tick statuses & cooldowns for the actor, regen resource, advance. */
function endTurn(s, u) {
	u.statuses = u.statuses.map((x) => ({
		...x,
		turns: x.turns - 1
	})).filter((x) => x.turns > 0);
	for (const k of Object.keys(u.cds)) u.cds[k] = Math.max(0, u.cds[k] - 1);
	u.mana = Math.min(u.maxMana, u.mana + 10);
	u.turnsTaken++;
	s.turn++;
	checkOver(s);
}
function logEv(s, ev, head) {
	s.log = [head, ...s.log].slice(0, 40);
	for (const e of ev) if (e.kind === "death" || e.kind === "telegraph") s.log = [e.text, ...s.log].slice(0, 40);
}
/** Player uses a skill on chosen targets. Validates turn, cooldown, resource and targets. */
function playerAct(s, skillId, targets) {
	const u = current(s);
	if (!u || u.side !== "hero") return {
		ok: false,
		error: "Not your turn"
	};
	const sk = u.kit.find((k) => k.id === skillId);
	if (!sk) return {
		ok: false,
		error: "Unknown skill"
	};
	const nr = skillReady(u, sk);
	if (nr) return {
		ok: false,
		error: nr
	};
	const valid = validTargets(s, u, sk);
	let tg = sk.target === "all" ? valid : sk.target === "self" ? [u.id] : [...new Set(targets)].filter((t) => valid.includes(t));
	if (sk.target === "enemy") tg = tg.slice(0, 1);
	if (sk.target === "multi") tg = tg.slice(0, sk.maxTargets ?? 3);
	if (tg.length === 0) return {
		ok: false,
		error: "Invalid target"
	};
	const ev = [];
	if (startTurn(s, u, ev)) {
		endTurn(s, u);
		logEv(s, ev, `${u.name} is stunned.`);
		return {
			ok: true,
			events: ev
		};
	}
	u.mana = Math.min(u.maxMana, u.mana - sk.cost + (sk.gain ?? 0));
	if (sk.cd) u.cds[sk.id] = sk.cd + 1;
	let dealt = 0;
	if (sk.target !== "self" && sk.mult > 0) for (const t of tg) dealt += dealHit(s, u, unit(s, t), sk, ev);
	else if (sk.applies) for (const t of tg) addStatus(unit(s, t), sk.applies, ev);
	if (sk.selfApplies) addStatus(u, sk.selfApplies, ev);
	if (sk.heal) healUnit(u, sk.target === "self" ? u.maxHp * sk.heal : u.maxHp * sk.heal, ev);
	if (sk.id === "taunt") for (const t of tg) {
		const e = unit(s, t);
		if (e.telegraph) {
			e.telegraph.turns += 1;
			ev.push({
				kind: "info",
				tgt: e.id,
				text: "DELAYED"
			});
		}
	}
	endTurn(s, u);
	logEv(s, ev, `${u.name} uses ${sk.name}${dealt ? ` for ${dealt.toLocaleString()} damage` : ""}.`);
	return {
		ok: true,
		events: ev
	};
}
function drinkPotion(s) {
	const u = current(s);
	if (!u || u.side !== "hero") return {
		ok: false,
		error: "Not your turn"
	};
	if (s.potions <= 0) return {
		ok: false,
		error: "No potions left"
	};
	const ev = [];
	if (startTurn(s, u, ev)) {
		endTurn(s, u);
		return {
			ok: true,
			events: ev
		};
	}
	s.potions--;
	healUnit(u, u.maxHp * .35, ev);
	endTurn(s, u);
	logEv(s, ev, `${u.name} drinks a potion.`);
	return {
		ok: true,
		events: ev
	};
}
var BOSS_SKILL = {
	id: "cataclysm",
	name: "Cataclysm",
	desc: "",
	icon: "flame",
	mult: 2.4,
	cd: 0,
	cost: 0,
	target: "enemy"
};
var ELITE_SKILL = {
	id: "rend",
	name: "Savage Rend",
	desc: "",
	icon: "axe",
	mult: 1.6,
	cd: 0,
	cost: 0,
	target: "enemy",
	applies: {
		kind: "burn",
		turns: 2,
		value: .2
	}
};
var BASIC = {
	id: "hit",
	name: "Attack",
	desc: "",
	icon: "sword",
	mult: 1,
	cd: 0,
	cost: 0,
	target: "enemy"
};
/** Enemy AI: bosses telegraph a heavy blow a turn ahead; elites rend; class opponents use their kits. */
function enemyAct(s) {
	const u = current(s);
	if (!u || u.side !== "foe") return {
		ok: false,
		error: "Not an enemy turn"
	};
	const ev = [];
	if (startTurn(s, u, ev)) {
		endTurn(s, u);
		logEv(s, ev, `${u.name} cannot act.`);
		return {
			ok: true,
			events: ev
		};
	}
	const t = s.units.filter((x) => x.side !== u.side && alive(x))[0];
	let sk = BASIC;
	if (u.telegraph) {
		u.telegraph.turns--;
		if (u.telegraph.turns <= 0) {
			sk = u.telegraph.skill;
			u.telegraph = void 0;
		} else {
			ev.push({
				kind: "telegraph",
				src: u.id,
				text: `${u.name} keeps gathering power…`
			});
			endTurn(s, u);
			logEv(s, ev, `${u.name} channels.`);
			return {
				ok: true,
				events: ev
			};
		}
	} else if (u.boss && u.turnsTaken % 3 === 1) {
		u.telegraph = {
			skill: BOSS_SKILL,
			turns: 1
		};
		ev.push({
			kind: "telegraph",
			src: u.id,
			text: `⚠ ${u.name} prepares CATACLYSM! Guard or stun it!`
		});
		endTurn(s, u);
		logEv(s, ev, `${u.name} gathers power.`);
		return {
			ok: true,
			events: ev
		};
	} else if (u.elite && u.turnsTaken % 3 === 2) sk = ELITE_SKILL;
	else if (u.kit.length) {
		const ready = [...u.kit].reverse().find((k) => k.mult > 0 && !skillReady(u, k) && k.cost > 0);
		const def = [...u.kit].find((k) => k.target === "self" && !skillReady(u, k));
		if (def && u.hp < u.maxHp * .4 && Math.random() < .5) sk = def;
		else if (ready && Math.random() < .7) sk = ready;
		else sk = u.kit[0];
		u.mana = Math.min(u.maxMana, u.mana - sk.cost + (sk.gain ?? 0));
		if (sk.cd) u.cds[sk.id] = sk.cd + 1;
	}
	if (!t) {
		endTurn(s, u);
		return {
			ok: true,
			events: ev
		};
	}
	if (sk.target === "self") {
		if (sk.selfApplies) addStatus(u, sk.selfApplies, ev);
		if (sk.heal) healUnit(u, u.maxHp * sk.heal, ev);
	} else {
		dealHit(s, u, t, sk, ev);
		if (sk.heal) healUnit(u, u.maxHp * sk.heal, ev);
	}
	endTurn(s, u);
	logEv(s, ev, `${u.name} uses ${sk.name}.`);
	return {
		ok: true,
		events: ev
	};
}
function arenaFor(title, boss) {
	const t = (title ?? "").toLowerCase();
	if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return arena_lair_default;
	if (/bone|crypt|elite/.test(t)) return arena_crypt_default;
	if (/fiend|rift|conquest|arena/.test(t)) return arena_rift_default;
	return arena_field_default;
}
function Battle({ left, right, auto = false, onEnd, title }) {
	const state = (0, import_react.useRef)(initBattle(left, formation(right)));
	const [, force] = (0, import_react.useState)(0);
	const rerender = () => force((n) => n + 1);
	const [selSkill, setSelSkill] = (0, import_react.useState)(null);
	const [selTargets, setSelTargets] = (0, import_react.useState)([]);
	const [floats, setFloats] = (0, import_react.useState)([]);
	const [anim, setAnim] = (0, import_react.useState)({});
	const [effects, setEffects] = (0, import_react.useState)({});
	const [moves, setMoves] = (0, import_react.useState)({});
	const [fast, setFast] = (0, import_react.useState)(auto);
	const [autoOn, setAutoOn] = (0, import_react.useState)(auto);
	const [banner, setBanner] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const busy = (0, import_react.useRef)(false);
	const ended = (0, import_react.useRef)(false);
	const fid = (0, import_react.useRef)(0);
	const s = state.current;
	const hero = heroUnit(s);
	const actor = current(s);
	const myTurn = !!actor && actor.side === "hero" && !s.over;
	const bg = (0, import_react.useMemo)(() => arenaFor(title, right.boss), [title, right.boss]);
	const wait = (ms) => new Promise((r) => setTimeout(r, ms * (fast ? .5 : 1)));
	const skill = selSkill ? hero.kit.find((k) => k.id === selSkill) ?? null : null;
	const valid = skill ? validTargets(s, hero, skill) : [];
	async function play(events, actorId, sk) {
		const a = s.units.find((u) => u.id === actorId);
		const move = moveFor(a ?? {}, sk);
		setAnim({ [actorId]: "anim-" + move + "#" + ++fid.current });
		setMoves((m) => ({
			...m,
			[actorId]: move
		}));
		await wait(280);
		for (const e of events) {
			if (e.kind === "telegraph") setBanner(e.text);
			if (e.tgt && e.kind !== "telegraph") {
				const target = e.tgt;
				const id = ++fid.current;
				const named = e.skill ?? sk;
				const effect = e.kind === "heal" ? "heal" : e.kind === "block" || e.kind === "absorb" ? "shield" : effectFor(named) ?? (a?.cls === "archer" ? "arrow" : a?.cls === "mage" ? "arcane" : "slash");
				if ([
					"dmg",
					"crit",
					"heal",
					"block",
					"absorb",
					"status"
				].includes(e.kind)) setEffects((m) => ({
					...m,
					[target]: effect + "#" + id
				}));
				setFloats((f) => [...f, {
					id,
					tgt: target,
					text: e.text,
					kind: e.kind
				}]);
				setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1100);
				if ([
					"dmg",
					"crit",
					"block"
				].includes(e.kind)) setAnim((m) => ({
					...m,
					[target]: (e.kind === "block" ? "anim-block" : "anim-hit") + "#" + id
				}));
				await wait(e.kind === "status" ? 120 : 200);
			}
		}
		rerender();
		await wait(380);
		setAnim({});
		setEffects({});
		setMoves({});
	}
	function finish() {
		if (ended.current || !s.over) return;
		ended.current = true;
		rerender();
		setTimeout(() => onEnd(s.over === "won"), fast ? 600 : 1100);
	}
	/** Run enemy turns until it's the hero's turn again or the battle ends. Never gets stuck. */
	async function runEnemies() {
		let safety = 0;
		while (!s.over && safety++ < 30) {
			const u = current(s);
			if (!u) break;
			if (u.side === "hero") {
				if (u.statuses.some((x) => x.kind === "stun")) {
					const r = playerAct(s, u.kit[0].id, [s.units.find((x) => x.side === "foe" && x.hp > 0)?.id ?? ""]);
					if (r.ok) await play(r.events, u.id).catch(() => {});
					continue;
				}
				break;
			}
			await wait(220);
			const r = enemyAct(s);
			if (!r.ok) break;
			try {
				await play(r.events, u.id);
			} catch {}
		}
		rerender();
		if (s.over) finish();
	}
	async function execute(skId, targets) {
		if (busy.current || ended.current) return;
		busy.current = true;
		setErr(null);
		try {
			const r = playerAct(s, skId, targets);
			if (!r.ok) {
				setErr(r.error);
				return;
			}
			setSelSkill(null);
			setSelTargets([]);
			await play(r.events, hero.id, skId);
			if (s.over) return finish();
			await runEnemies();
		} finally {
			busy.current = false;
			rerender();
		}
	}
	async function potion() {
		if (busy.current || ended.current) return;
		busy.current = true;
		try {
			const r = drinkPotion(s);
			if (!r.ok) {
				setErr(r.error);
				return;
			}
			await play(r.events, hero.id);
			await runEnemies();
		} finally {
			busy.current = false;
			rerender();
		}
	}
	function pickSkill(sk) {
		if (!myTurn || busy.current) return;
		const nr = skillReady(hero, sk);
		if (nr) {
			setErr(nr);
			return;
		}
		setErr(null);
		if (sk.target === "self" || sk.target === "all") {
			execute(sk.id, []);
			return;
		}
		setSelSkill(sk.id);
		setSelTargets([]);
	}
	function pickTarget(u) {
		if (!skill || !myTurn) return;
		if (!valid.includes(u.id)) {
			setErr("Invalid target");
			return;
		}
		if (skill.target === "enemy") {
			execute(skill.id, [u.id]);
			return;
		}
		const max = skill.maxTargets ?? 3;
		setSelTargets((t) => t.includes(u.id) ? t.filter((x) => x !== u.id) : t.length < max ? [...t, u.id] : t);
	}
	(0, import_react.useEffect)(() => {
		(async () => {
			busy.current = true;
			await runEnemies();
			busy.current = false;
			rerender();
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!autoOn || !myTurn || busy.current || ended.current) return;
		const t = setTimeout(() => {
			const foes = s.units.filter((u) => u.side === "foe" && u.hp > 0).sort((a, b) => a.hp - b.hp);
			const ready = [...hero.kit].filter((k) => !skillReady(hero, k) && k.mult > 0).sort((a, b) => b.mult * (b.hits ?? 1) * (b.target === "all" ? foes.length : 1) - a.mult * (a.hits ?? 1) * (a.target === "all" ? foes.length : 1))[0] ?? hero.kit[0];
			execute(ready.id, foes.slice(0, ready.maxTargets ?? 1).map((f) => f.id));
		}, 300);
		return () => clearTimeout(t);
	});
	(0, import_react.useEffect)(() => {
		if (!banner) return;
		const t = setTimeout(() => setBanner(null), 2200);
		return () => clearTimeout(t);
	}, [banner]);
	const foes = s.units.filter((u) => u.side === "foe");
	const order = upcoming(s, 7);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "battle-screen fixed inset-0 z-40 flex flex-col overflow-hidden bg-background anim-pop",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: bg,
				alt: "",
				width: 1920,
				height: 1088,
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "safe-top relative z-10 flex flex-col items-center gap-2",
				children: [
					title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-xl panel-title md:text-2xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 backdrop-blur",
						"aria-label": "Turn order",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: ["Round ", s.round]
						}), order.map((u, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							title: u.name,
							className: `h-8 w-8 overflow-hidden rounded-full border-2 bg-card ${i === 0 ? "border-gold scale-110 shadow-[0_0_12px_var(--gold)]" : u.side === "hero" ? "border-r1" : "border-blood"}`,
							children: u.cls || !u.sprite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleCharacter, { u }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
								rect: u.sprite,
								className: "w-full"
							})
						}, u.id + i))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `font-display text-sm ${myTurn ? "text-gold" : "text-muted-foreground"}`,
						children: s.over ? "" : myTurn ? skill ? skill.target === "multi" ? `Choose up to ${skill.maxTargets} targets` : "Choose a target" : "Your turn — choose a skill" : `${actor?.name ?? ""}'s turn…`
					})
				]
			}),
			banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-20 mx-auto mt-2 rounded-md border border-blood bg-blood/80 px-4 py-2 font-display text-lg text-foreground anim-pop",
				children: banner
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-1 items-end justify-between gap-2 px-4 pb-4 md:px-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitView, {
					u: hero,
					anim: anim[hero.id],
					effect: effects[hero.id],
					move: moves[hero.id],
					victory: s.over === "won",
					floats,
					active: actor?.id === hero.id
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-0 flex-1 items-end justify-end gap-2 md:gap-6 battle-foes",
					children: foes.map((f) => {
						const isValid = !!skill && valid.includes(f.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitView, {
							u: f,
							anim: anim[f.id],
							effect: effects[f.id],
							move: moves[f.id],
							floats,
							active: actor?.id === f.id,
							targetable: isValid,
							selected: selTargets.includes(f.id),
							onClick: () => pickTarget(f),
							small: foes.length > 1 && !f.boss
						}, f.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "battle-actions relative z-10 grid gap-2 bg-gradient-to-t from-background via-background/90 to-transparent md:grid-cols-[260px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden h-28 overflow-y-auto rounded-md border border-border bg-background/70 p-2 text-xs md:block",
					"aria-label": "Combat log",
					children: s.log.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: i === 0 ? "text-foreground" : "text-muted-foreground",
						children: l
					}, i))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-2",
					children: [
						hero.scrolls && hero.scrolls.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap justify-center gap-2 text-xs text-gold",
							children: hero.scrolls.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								title: "Server-confirmed for this battle",
								children: [SCROLLS[k].name, " +20%"]
							}, k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-center gap-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-r3",
									children: [
										resourceName(hero.cls),
										" ",
										hero.mana,
										"/",
										hero.maxMana
									]
								}),
								err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-blood",
									children: err
								}),
								skill && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-gold",
									children: [
										skill.name,
										" · ",
										skill.target === "all" ? "All enemies" : skill.target === "self" ? "Self" : skill.target === "multi" ? `Up to ${skill.maxTargets} enemies` : "One enemy",
										" · ",
										skill.hits ?? 1,
										" hit",
										(skill.hits ?? 1) > 1 ? "s" : "",
										" · ",
										skill.cd,
										" turn cooldown"
									]
								}),
								skill?.target === "multi" && selTargets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "btn-gold px-3 py-1 text-xs",
									onClick: () => void execute(skill.id, selTargets),
									children: ["Fire at ", selTargets.length]
								}),
								skill && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									className: "text-muted-foreground underline",
									onClick: () => {
										setSelSkill(null);
										setSelTargets([]);
									},
									children: "Cancel"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-center gap-2",
							children: [
								hero.kit.map((sk) => {
									const cd = hero.cds[sk.id] ?? 0;
									const why = skillReady(hero, sk);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										onClick: () => pickSkill(sk),
										disabled: !myTurn || !!why || autoOn,
										title: `${sk.name} — ${sk.desc}${sk.cost ? ` Cost ${sk.cost} ${resourceName(hero.cls)}.` : ""}${sk.cd ? ` Cooldown ${sk.cd}.` : ""}${why ? ` (${why})` : ""}`,
										className: `slot relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 transition hover:scale-105 disabled:opacity-50 md:h-20 md:w-20 ${selSkill === sk.id ? "rarity-5 ring-2 ring-gold" : "rarity-4"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillIcon, {
												icon: sk.icon,
												className: "h-8 w-8 md:h-10 md:w-10"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "px-0.5 text-center text-[9px] font-bold uppercase leading-tight",
												children: sk.name
											}),
											sk.cost > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute right-0.5 top-0.5 rounded bg-background/80 px-1 text-[9px] text-r3",
												children: sk.cost
											}),
											cd > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "absolute inset-0 flex flex-col items-center justify-center rounded-md bg-background/75",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-display text-2xl",
													children: cd
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[9px]",
													children: ["turn", cd > 1 ? "s" : ""]
												})]
											})
										]
									}, sk.id);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: potion,
									disabled: !myTurn || s.potions <= 0 || autoOn,
									className: "slot relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 rarity-5 transition hover:scale-105 disabled:opacity-50 md:h-20 md:w-20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillIcon, {
										icon: "potion",
										className: "h-8 w-8 md:h-10 md:w-10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[9px] font-bold uppercase",
										children: ["Potion ×", s.potions]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: () => setAutoOn((a) => !a),
									className: `slot flex h-12 w-12 flex-col items-center justify-center text-[9px] font-bold ${autoOn ? "rarity-2" : ""}`,
									title: "Auto battle",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-4 w-4" }), "AUTO"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => setFast((f) => !f),
									className: `slot flex h-12 w-12 items-center justify-center ${fast ? "rarity-2" : ""}`,
									title: "Speed",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastForward, { className: "h-5 w-5" })
								})
							]
						})
					]
				})]
			}),
			s.over && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 flex items-center justify-center bg-background/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `font-display text-6xl font-black anim-pop ${s.over === "won" ? "panel-title" : "text-blood"}`,
					children: s.over === "won" ? "VICTORY" : "DEFEAT"
				})
			})
		]
	});
}
function UnitView({ u, anim, effect, move, victory, floats, active, targetable, selected, onClick, small }) {
	const dead = u.hp <= 0;
	const h = u.boss ? "battle-figure boss-figure" : small ? "battle-figure small-figure" : "battle-figure";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "ghost",
		type: "button",
		onClick,
		disabled: !onClick || dead,
		"aria-label": `${u.name}${targetable ? " (valid target)" : ""}`,
		className: `relative h-auto min-w-0 shrink-0 flex flex-col items-center p-0 hover:bg-transparent transition-all duration-500 battle-unit disabled:opacity-100 ${dead ? "pointer-events-none battle-death" : ""} ${targetable ? "cursor-crosshair" : "cursor-default"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `mb-1 w-full max-w-44 rounded-md bg-background/75 px-2 py-1 text-left backdrop-blur ${active ? "ring-2 ring-gold" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-1 truncate text-[11px] font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [
							u.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "mr-0.5 inline h-3 w-3 text-blood" }),
							u.elite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-r4",
								children: "★ "
							}),
							u.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: ["Lv ", u.level]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bar-track mt-0.5 h-2.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bar-hp h-full transition-all duration-300",
						style: { width: `${u.hp / u.maxHp * 100}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-[9px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						u.hp.toLocaleString(),
						"/",
						u.maxHp.toLocaleString()
					] }), u.side === "hero" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-r3",
						children: u.mana
					})]
				}),
				u.side === "hero" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bar-track mt-0.5 h-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-r3 transition-all",
						style: { width: `${u.mana / u.maxMana * 100}%` }
					})
				}),
				(u.statuses.length > 0 || u.telegraph) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-0.5 flex flex-wrap gap-0.5",
					children: [u.telegraph && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded bg-blood px-1 text-[8px] font-bold animate-pulse",
						children: "⚠ CHARGING"
					}), u.statuses.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded bg-secondary px-1 text-[8px] font-bold",
						children: [
							STATUS_LABEL[x.kind],
							" ",
							x.turns
						]
					}, x.kind))]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `relative ${h} w-full shrink-0 ${u.cls ? "aspect-square" : u.sprite ? "aspect-[3/4]" : "aspect-[480/1024]"}`,
			children: [
				targetable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-x-4 bottom-0 h-6 rounded-full blur-md ${selected ? "bg-gold" : "bg-r1/70 animate-pulse"}` }),
				active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-8 bottom-1 h-4 rounded-full bg-gold/50 blur-md" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `h-full w-full ${anim?.split("#")[0] ?? ""}`,
					children: [
						u.cls ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-full w-full ${victory ? "battle-victory" : "anim-idle"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleCharacter, { u })
						}) : u.sprite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-full w-full items-end anim-idle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
								rect: u.sprite,
								className: "battle-sprite w-full"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "battle-sprite h-full w-full anim-idle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleCharacter, { u })
						}),
						move && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeaponArc, { move }, "arc" + move),
						effect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombatEffect, { kind: effect.split("#")[0] }, effect)
					]
				}, anim ?? "idle"),
				floats.filter((f) => f.tgt === u.id).map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `pointer-events-none absolute left-1/2 anim-float whitespace-nowrap font-display font-black drop-shadow-[0_2px_2px_black] ${f.kind === "crit" ? "text-4xl text-gold" : f.kind === "heal" ? "text-2xl text-r1" : f.kind === "miss" || f.kind === "skip" ? "text-xl text-muted-foreground" : f.kind === "block" || f.kind === "absorb" ? "text-2xl text-r2" : f.kind === "status" || f.kind === "info" ? "text-sm text-r4" : "text-3xl text-foreground"}`,
					style: { top: `${15 + i % 3 * 10}%` },
					children: f.text
				}, f.id))
			]
		})]
	});
}
var adviseStrategy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((i) => ({
	heroClass: String(i.heroClass).slice(0, 20),
	level: Number(i.level) || 1,
	hero: Object.fromEntries(Object.entries(i.hero ?? {}).slice(0, 8).map(([k, v]) => [k.slice(0, 12), Number(v) || 0])),
	enemy: Object.fromEntries(Object.entries(i.enemy ?? {}).slice(0, 10).map(([k, v]) => [k.slice(0, 12), typeof v === "string" ? v.slice(0, 40) : v])),
	skills: (i.skills ?? []).slice(0, 5).map((s) => String(s).slice(0, 60))
})).handler(createSsrRpc("137c50ff3b98693823ea37ece243d7fd170720cf0ccaddea5f8c7dec3a1768da"));
/**
* Endless Conquest. Floors never stop scaling: each one is built from the shared
* stageFoe/stageRewards factories, so the gate keeps going past any fixed cap.
* `hero.spire` holds the frontier floor that is next fightable.
*/
/** Deepest floor the hero has already cleared. */
var floorsCleared = (h) => Math.max(0, h.spire - 1);
/** Conquest Tokens, earned on the floors and spent on the gate's material offers. */
var conquestTokens = (h) => h.conquest?.tokens ?? 0;
/** Tokens one floor pays. Deeper floors pay more, so the gate keeps rewarding the climb. */
var floorTokens = (floor) => 4 + Math.floor(floor / 5) + Math.floor(floor / 20);
function addConquestTokens(h, n) {
	h.conquest = {
		...h.conquest ?? {},
		tokens: Math.max(0, conquestTokens(h) + n)
	};
}
/** Greek day the blitz allowance is on, so the count resets at Greek midnight like the dailies. */
var blitzDay = (now = Date.now()) => new Date(greekDayStart(now)).toISOString().slice(0, 10);
/** Blitzes already spent today. */
function blitzesUsed(h, now = Date.now()) {
	const c = h.conquest;
	return c?.blitzDay === blitzDay(now) ? Math.max(0, Math.floor(c.blitzUsed ?? 0)) : 0;
}
/** Blitzes still available today. */
var blitzesLeft = (h, now = Date.now()) => Math.max(0, 3 - blitzesUsed(h, now));
/** Spend one of today's blitzes. */
function spendBlitz(h, now = Date.now()) {
	h.conquest = {
		...h.conquest ?? {},
		blitzDay: blitzDay(now),
		blitzUsed: blitzesUsed(h, now) + 1
	};
}
var TOKEN_OFFERS = [
	{
		id: "goldchest",
		mat: "ore",
		qty: 0,
		cost: 30,
		gold: 5e3,
		name: "Gold Chest"
	},
	{
		id: "ore",
		mat: "ore",
		qty: 10,
		cost: 20
	},
	{
		id: "hide",
		mat: "hide",
		qty: 10,
		cost: 20
	},
	{
		id: "bloom",
		mat: "bloom",
		qty: 5,
		cost: 25
	},
	{
		id: "essence",
		mat: "essence",
		qty: 2,
		cost: 40
	},
	{
		id: "fragment",
		mat: "fragment",
		qty: 2,
		cost: 50
	},
	{
		id: "crystal",
		mat: "crystal",
		qty: 1,
		cost: 60
	},
	{
		id: "enchantstone",
		mat: "enchantStone",
		qty: 2,
		cost: 80
	},
	{
		id: "sigil",
		mat: "sigil",
		qty: 1,
		cost: 120
	},
	{
		id: "starshard",
		mat: "starshard",
		qty: 1,
		cost: 150
	},
	{
		id: "bossCore",
		mat: "bossCore",
		qty: 1,
		cost: 300
	}
];
/** Buy one offer with tokens. Returns an error message, or null on success. */
function buyTokenOffer(h, id) {
	const o = TOKEN_OFFERS.find((x) => x.id === id);
	if (!o) return "Unknown offer";
	if (conquestTokens(h) < o.cost) return `Not enough Conquest Tokens — ${o.cost} needed`;
	addConquestTokens(h, -o.cost);
	if (o.gold) {
		h.gold += o.gold;
		return null;
	}
	addMats(h, { [o.mat]: o.qty });
	return null;
}
/** What a blitz to `target` pays in total: the same rewards those floors pay when fought. */
function blitzRewards(target) {
	let xp = 0, gold = 0, tokens = 0;
	for (let f = 1; f <= target; f++) {
		const r = stageRewards(f, 2);
		xp += r.xp;
		gold += r.gold;
		tokens += floorTokens(f);
	}
	return {
		floors: target,
		xp,
		gold,
		tokens
	};
}
/**
* A blitz may only reach a floor the hero has already beaten, and only while today's
* allowance lasts. Fighting the floors themselves is never limited.
*/
function blitzBlocker(h, target, now = Date.now()) {
	const cap = floorsCleared(h);
	if (cap < 1) return "Clear your first floor before blitzing — there is nothing to skip yet.";
	if (!Number.isFinite(target) || target < 1) return "Choose how many floors to blitz.";
	if (target > cap) return `You can blitz up to floor ${cap} — the deepest floor you have cleared.`;
	if (blitzesLeft(h, now) < 1) return `No blitzes left today — 3 per day, back at Greek midnight. Floors themselves are unlimited.`;
	return null;
}
/** Instantly auto-clear floors 1..target using one of today's blitzes. Returns an error message, or null on success. */
function blitz(h, target, now = Date.now()) {
	const blocked = blitzBlocker(h, target, now);
	if (blocked) return blocked;
	const rw = blitzRewards(target);
	spendBlitz(h, now);
	grant(h, rw.xp, rw.gold);
	addConquestTokens(h, rw.tokens);
	return null;
}
/**
* The Conquest Gate's token side: blitz the floors you have already beaten and spend
* Conquest Tokens on materials, gold chests and enchantment stones.
*/
function ConquestTokens({ hero }) {
	const cap = floorsCleared(hero);
	const [target, setTarget] = (0, import_react.useState)(() => Math.max(1, cap || 1));
	const [msg, setMsg] = (0, import_react.useState)(null);
	const tokens = conquestTokens(hero);
	const usable = Math.min(Math.max(1, target || 1), Math.max(1, cap));
	const left = blitzesLeft(hero);
	const blocked = blitzBlocker(hero, usable);
	const preview = blocked ? null : blitzRewards(usable);
	const jump = (n) => {
		setTarget(n);
		setMsg(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 grid gap-4 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "slot p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center justify-between gap-2 font-display text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-4 w-4" }), "Blitz"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-bold",
						children: [
							"Blitzes today ",
							Math.min(left, 3),
							"/",
							3
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Instantly clear floors 1 to a floor you have already beaten. Your record is floor ",
						cap,
						"; blitzing pays the same XP, gold and tokens as fighting those floors again. The blitz is the only limit — the floors themselves never stop, and the allowance returns at Greek midnight."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs",
							children: ["Blitz to floor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Blitz target floor",
								type: "number",
								min: 1,
								max: Math.max(1, cap),
								value: target,
								onChange: (e) => jump(Math.max(1, Number(e.target.value) || 1)),
								className: "mt-1 block w-24 rounded border border-border bg-background p-2"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !!blocked || left < 1,
							onClick: () => update((h) => {
								const err = blitz(h, usable);
								setMsg(err ? {
									ok: false,
									t: err
								} : {
									ok: true,
									t: `Blitzed ${usable} floor${usable === 1 ? "" : "s"} — +${fmt(preview?.xp ?? 0)} XP, +${fmt(preview?.gold ?? 0)} gold, +${fmt(preview?.tokens ?? 0)} tokens`
								});
							}),
							children: "Blitz"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-ghost px-3 py-1.5 text-xs",
							disabled: cap < 1,
							onClick: () => jump(Math.max(1, cap)),
							children: [
								"Deepest (",
								cap,
								")"
							]
						})
					]
				}),
				blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: blocked
				}) : preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs",
					children: [
						"Pays ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-xp",
							children: [
								"+",
								fmt(preview.xp),
								" XP"
							]
						}),
						", ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: preview.gold }),
						", ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-gold",
							children: [
								"+",
								fmt(preview.tokens),
								" tokens"
							]
						}),
						"."
					]
				}),
				msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: `anim-pop mt-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`,
					children: msg.t
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "slot p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center justify-between gap-2 font-display text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Conquest Tokens" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmt(tokens) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Every cleared floor pays tokens. Spend them on materials, gold chests and enchantment stones."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-1.5 sm:grid-cols-2",
					children: TOKEN_OFFERS.map((o) => {
						const isGold = !!o.gold;
						const label = isGold ? o.name ?? "Gold Chest" : `${MATS[o.mat].name} ×${o.qty}`;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "slot flex items-center justify-between gap-2 p-2 text-left text-xs",
							disabled: tokens < o.cost,
							title: isGold ? `Open for ${o.gold} gold` : `${MATS[o.mat].desc} (${MATS[o.mat].src})`,
							onClick: () => update((h) => {
								const err = buyTokenOffer(h, o.id);
								setMsg(err ? {
									ok: false,
									t: err
								} : {
									ok: true,
									t: isGold ? `Opened ${o.name} — +${fmt(o.gold)} gold!` : `Bought ${MATS[o.mat].name} ×${o.qty}`
								});
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-1.5",
								children: [isGold ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gold",
									children: "🪙"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
									mat: o.mat,
									size: 18
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: label
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-bold text-gold",
								children: [fmt(o.cost), " t"]
							})]
						}, o.id);
					})
				})
			]
		})]
	});
}
var gemTotal = (h) => Object.values(h.gems ?? {}).reduce((a, n) => a + n, 0);
var attrTotal = (h) => Object.values(h.attrs).reduce((a, n) => a + n, 0);
var DAILY_QUESTS = [
	{
		id: "level",
		name: "Rise Through the Ranks",
		desc: "Gain a character level",
		target: 1,
		mat: "essence",
		mats: 2,
		gold: 400,
		xp: 250,
		count: (h) => h.level + h.paragon * 10
	},
	{
		id: "astral",
		name: "Bind New Astrals",
		desc: "Summon or capture 2 Astrals",
		target: 2,
		mat: "starshard",
		mats: 2,
		gold: 500,
		xp: 400,
		count: (h) => (h.astrals ?? []).length
	},
	{
		id: "gems",
		name: "Cut Three Gems",
		desc: "Cut 3 gems from Ember Ore",
		target: 3,
		mat: "ore",
		mats: 3,
		gold: 350,
		xp: 300,
		count: gemTotal
	},
	{
		id: "train",
		name: "Drill the Troops",
		desc: "Train 5 attribute points",
		target: 5,
		mat: "essence",
		mats: 2,
		gold: 300,
		xp: 350,
		count: attrTotal
	},
	{
		id: "battle",
		name: "Win Five Battles",
		desc: "Win 5 fights anywhere",
		target: 5,
		mat: "fragment",
		mats: 1,
		gold: 450,
		xp: 500,
		count: (h) => h.record?.wins ?? 0
	},
	{
		id: "enhance",
		name: "Temper the Steel",
		desc: "Succeed at 3 enhancements",
		target: 3,
		mat: "essence",
		mats: 2,
		gold: 400,
		xp: 300,
		count: (h) => h.record?.enhances ?? 0
	}
];
/** Quests occasionally pay bonus progression: a skill-tree point or an Insight point. */
var QUEST_POINT_CHANCE = .25;
/** Deterministic given a roll source; each payout is an independent roll. */
function questPointBonus(rand = Math.random) {
	return {
		skill: rand() < QUEST_POINT_CHANCE,
		insight: rand() < QUEST_POINT_CHANCE
	};
}
/** Human label for a quest's bonus payout chance, shown on the board. */
var questPointHint = "25% chance of a bonus skill point and 25% of bonus Insight";
/** Snapshot of every counter at the start of the day. */
var snapshot = (h) => Object.fromEntries(DAILY_QUESTS.map((q) => [q.id, q.count(h)]));
/** Greek calendar day the board is on. */
var boardDay = (now = Date.now()) => new Date(greekDayStart(now)).toISOString().slice(0, 10);
/** When the board rolls over: the next Greek midnight. */
var boardResetAt = (now = Date.now()) => greekDayStart(now) + 864e5;
/** Brings the saved board up to date for today, snapshotting counters when the day has turned. */
function rollBoard(h, now = Date.now()) {
	const day = boardDay(now);
	const cur = h.daily;
	if (cur && cur.day === day) return cur;
	const fresh = {
		day,
		base: snapshot(h),
		claimed: []
	};
	h.daily = fresh;
	return fresh;
}
function boardRows(h, now = Date.now()) {
	const day = boardDay(now);
	const state = h.daily && h.daily.day === day ? h.daily : {
		day,
		base: snapshot(h),
		claimed: []
	};
	return DAILY_QUESTS.map((quest) => {
		const gained = quest.count(h) - (state.base[quest.id] ?? 0);
		const progress = Math.min(quest.target, Math.max(0, gained));
		return {
			quest,
			progress,
			claimed: state.claimed.includes(quest.id),
			done: progress >= quest.target
		};
	});
}
/** Six fixed commissions a day. No AI, nothing random: every quest tracks real progress on your save. */
function QuestBoard({ onClose }) {
	const { hero } = useGame();
	(0, import_react.useEffect)(() => {
		update((h) => {
			rollBoard(h);
		});
	}, [hero?.daily?.day]);
	if (!hero) return null;
	const now = Date.now();
	const rows = boardRows(hero, now);
	const claimed = rows.filter((r) => r.claimed).length;
	const [bonusNote, setBonusNote] = (0, import_react.useState)(null);
	const claim = (id) => {
		let note = "";
		update((h) => {
			const state = rollBoard(h);
			const row = boardRows(h).find((r) => r.quest.id === id);
			if (!row || row.claimed || !row.done) return;
			state.claimed.push(id);
			grant(h, row.quest.xp, row.quest.gold);
			h.mats = {
				...h.mats ?? {},
				[row.quest.mat]: matCount(h, row.quest.mat) + row.quest.mats
			};
			const bonus = questPointBonus();
			if (bonus.skill) {
				h.bonusPts = (h.bonusPts ?? 0) + 1;
				note = "+1 skill point! ";
			}
			if (bonus.insight) {
				h.insight = (h.insight ?? 0) + 1;
				note += "+1 Insight!";
			}
		});
		if (note) setBonusNote(note);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Quest Board",
		onClose,
		wide: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					DAILY_QUESTS.length,
					" commissions, ",
					claimed,
					" claimed · every one pays gold, XP and materials ·",
					questPointHint,
					" · resets in ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-gold",
						children: countdown(boardResetAt(now) - now)
					}),
					" (Greek midnight)"
				]
			}), bonusNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold text-gold",
				"aria-live": "polite",
				children: bonusNote
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
			children: rows.map(({ quest, progress, claimed: done, done: complete }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "slot flex flex-col gap-2 p-3 " + (done ? "opacity-60" : complete ? "rarity-3" : ""),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-gold",
						children: quest.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: quest.desc
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bar-track h-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bar-xp h-full",
							style: { width: Math.round(progress / quest.target * 100) + "%" }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							"Progress ",
							progress,
							"/",
							quest.target
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-1.5 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "slot px-2 py-0.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
									n: quest.gold,
									className: "text-xs"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "slot px-2 py-0.5 font-bold text-xp",
								children: [fmt(quest.xp), " XP"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "slot px-2 py-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
										mat: quest.mat,
										size: 14
									}),
									" ",
									MATS[quest.mat].name,
									" ×",
									quest.mats
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold mt-auto py-1.5",
						disabled: done || !complete,
						onClick: () => claim(quest.id),
						children: done ? "Claimed" : complete ? "Claim rewards" : "In progress"
					})
				]
			}, quest.id))
		})]
	});
}
/** Barracks upgrade card: level, cost and everything that unlocks on the way to level 30. */
function BarracksUpgrade({ hero }) {
	const level = barracksLevel(hero);
	const maxed = level >= 30;
	const cost = barracksCost(level, hero.level);
	const discount = Math.round(trainingDiscount(hero) * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot mb-5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-lg text-gold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mr-1 inline h-4 w-4" }),
						"Barracks level ",
						level,
						" / ",
						30
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						"Training costs ",
						discount,
						"% less gold. Bigger batches, instructor grades and the drill yard unlock as it levels up."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold px-4 py-2",
					disabled: maxed || hero.gold < cost,
					onClick: () => update((h) => {
						upgradeBarracks(h);
					}),
					children: maxed ? "Fully upgraded" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Upgrade level ",
						level + 1,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
							n: cost,
							className: "text-primary-foreground"
						})
					] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bar-track mt-3 h-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bar-xp h-full",
					style: { width: Math.round(level / 30 * 100) + "%" }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3",
				children: BARRACKS_UNLOCKS.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 " + (level >= u.level ? "" : "opacity-50"),
					children: [level >= u.level ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
						"Lv ",
						u.level,
						" · ",
						u.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-muted-foreground",
						children: u.desc
					})] })]
				}, u.level))
			})
		]
	});
}
var DRILL_ICONS = {
	vitality: HeartPulse,
	weapons: Swords,
	shields: Shield,
	endurance: Heart,
	recovery: Sparkles,
	focus: Crosshair,
	toughness: Heart,
	marksman: Eye,
	guardwork: ShieldCheck,
	footwork: Wind
};
/**
* The drill yard: permanent barracks tracks beside the four attributes. Each rank is paid for in
* gold (rising with the rank and the hero's level) and needs the barracks building leveled up.
*/
function DrillTracks({ hero }) {
	const level = barracksLevel(hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center gap-2 font-display text-sm text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "h-4 w-4" }), "Barracks drills"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "Permanent training beside the attributes: every rank is bought with gold, costs more than the last, and the deeper drills need the barracks itself upgraded."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: DRILLS.map((d) => {
					const Icon = DRILL_ICONS[d.id] ?? Swords;
					const rank = drillRank(hero, d.id);
					const cost = drillCost(d, rank, hero.level);
					const blocked = drillBlocker(hero, d.id);
					const locked = level < d.barracks;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "slot p-3 " + (locked ? "opacity-60" : ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 font-display",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-gold" }), d.name]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 text-xs text-muted-foreground",
									children: [
										"Rank ",
										rank,
										"/",
										d.max
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: d.desc
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs",
								children: [
									"Now ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: rank ? drillText(d, rank) : "—" }),
									" · next ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										className: "text-gold",
										children: drillText(d, 1)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-gold mt-2 w-full py-1.5 text-sm",
								disabled: !!blocked,
								title: blocked ?? "Train this rank",
								onClick: () => update((h) => {
									trainDrill(h, d.id);
								}),
								children: rank >= d.max ? "Fully drilled" : locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Barracks level ", d.barracks] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Train rank ",
									rank + 1,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
										n: cost,
										className: "text-primary-foreground"
									})
								] })
							})
						]
					}, d.id);
				})
			})
		]
	});
}
var heroFighter = (h, s) => ({
	name: h.name,
	img: CLASSES[h.cls].img,
	hp: s.hp,
	atk: s.atk,
	def: s.def,
	crit: s.crit,
	dodge: s.dodge,
	critDmg: s.critDmg,
	pen: s.pen,
	acc: s.acc,
	block: s.block,
	heal: s.heal,
	level: h.level + h.paragon,
	cls: h.cls,
	skills: heroSkills(h),
	skillLoadout: h.skillLoadout,
	look: wornLooks(h.equipment)
});
var SLOT_LABEL = {
	helmet: "Head",
	armour: "Chest",
	boots: "Feet",
	belt: "Waist",
	weapon: "Weapon",
	ring: "Ring",
	talisman: "Amulet"
};
var LEFT_DOLL = [
	"helmet",
	"armour",
	"belt",
	"boots"
];
var RIGHT_DOLL = [
	"weapon",
	"ring",
	"ring2",
	"talisman"
];
function HeroHall({ onClose, title = "Armory" }) {
	const { hero, gender } = useGame();
	const [sel, setSel] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("new");
	const [q, setQ] = (0, import_react.useState)("");
	if (!hero) return null;
	const s = heroStats(hero);
	const selItem = sel ? sel.equipped ? Object.values(hero.equipment).find((i) => i?.id === sel.id) : hero.inventory.find((i) => i.id === sel.id) : void 0;
	const equip = (it, at) => update((h) => {
		equipItem(h, it, at);
	});
	const unequip = (it) => update((h) => {
		unequipItem(h, it, invCap(h));
	});
	/** Click a worn piece to inspect it; click an empty position to wear the selected bag item there. */
	const wearClick = (sl) => {
		const worn = hero.equipment[sl];
		if (worn) {
			setSel({
				id: worn.id,
				equipped: true
			});
			return;
		}
		const it = sel && !sel.equipped ? hero.inventory.find((i) => i.id === sel.id) : void 0;
		if (it && wearOf(it.slot).includes(sl)) {
			equip(it, sl);
			setSel({
				id: it.id,
				equipped: true
			});
		}
	};
	const sell = (it) => update((h) => {
		h.inventory = h.inventory.filter((i) => i.id !== it.id);
		h.gold += sellValue(it);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title,
		onClose,
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[1fr_1.2fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-2",
							children: LEFT_DOLL.map((sl) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
								item: hero.equipment[sl],
								empty: WEAR_LABEL[sl],
								selected: sel?.id === hero.equipment[sl]?.id,
								onClick: () => wearClick(sl)
							}, sl))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mx-auto h-[320px] w-full max-w-[320px] self-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterPose, {
								cls: hero.cls,
								gender,
								chest: hero.equipment.armour,
								weapon: hero.equipment.weapon,
								className: "inventory-character h-full w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-2",
							children: RIGHT_DOLL.map((sl) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
								item: hero.equipment[sl],
								empty: WEAR_LABEL[sl],
								selected: sel?.id === hero.equipment[sl]?.id,
								onClick: () => wearClick(sl)
							}, sl))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-2xl",
						children: hero.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-foreground",
						children: [
							CLASSES[hero.cls].name,
							" · Level ",
							hero.level,
							hero.paragon > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-gold",
								children: [" · Ascension ", hero.paragon]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm",
					children: [
						["Health", fmt(s.hp)],
						["Battle Rating", fmt(s.power)],
						["Physical attack", fmt(s.patk)],
						["Magic attack", fmt(s.matk)],
						["Physical defense", fmt(s.pdef)],
						["Magic defense", fmt(s.mdef)],
						["Critical chance", `${s.crit}%`],
						["Critical damage", `${s.critDmg}%`],
						["Armor penetration", `${s.pen}%`],
						["Accuracy", `${s.acc}%`],
						["Evasion", `${s.dodge}%`],
						["XP", `${fmt(hero.xp)} / ${fmt(xpToNext(hero))}`]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-b border-border/30 py-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: v
						})]
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Str ",
						hero.attrs.str,
						" · Int ",
						hero.attrs.int,
						" · Agi ",
						hero.attrs.agi,
						" · Vit ",
						hero.attrs.vit
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot mt-2 p-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 font-display text-sm text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mr-1 inline h-3 w-3" }), "Battle Rating sources"]
						}),
						powerBreakdown(hero).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["+", fmt(p.power)] })]
						}, p.label)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-muted-foreground",
							children: hero.level < 10 ? `Conquest unlocks at level 10` : hero.level < 80 ? `Ascension begins at level 80` : `Ascending — each level grants +2% to all stats`
						})
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display",
							children: [
								"Bag ",
								hero.inventory.length,
								"/",
								invCap(hero)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-blood px-3 py-1 text-xs",
							onClick: () => update((h) => {
								const junk = h.inventory.filter((i) => i.rarity <= 1 && i.enh === 0);
								h.gold += junk.reduce((a, i) => a + sellValue(i), 0);
								h.inventory = h.inventory.filter((i) => !(i.rarity <= 1 && i.enh === 0));
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 inline h-3 w-3" }), "Sell common"]
						}),
						(hero.bagRows ?? 0) < 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-gold ml-2 px-3 py-1 text-xs",
							disabled: hero.gold < bagRowCost(hero),
							title: "Adds one more row of bag slots",
							onClick: () => update((h) => {
								const c = bagRowCost(h);
								if (h.gold < c || (h.bagRows ?? 0) >= 10) return;
								h.gold -= c;
								h.bagRows = (h.bagRows ?? 0) + 1;
							}),
							children: [
								"+ Row (",
								fmt(bagRowCost(hero)),
								" gold)"
							]
						})
					]
				}),
				(hero.overflow?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between rounded-md border border-gold/60 bg-gold/10 px-2 py-1.5 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Overflow Chest: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hero.overflow.length }),
						" item(s) waiting — free bag space to claim them."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold px-2 py-0.5 text-xs",
						disabled: hero.inventory.length >= invCap(hero),
						onClick: async () => {
							const { claimOverflow } = await import("./logic-WJE4Izgx.mjs");
							update((h) => {
								claimOverflow(h);
							});
						},
						children: "Claim"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex flex-wrap items-center gap-1 text-xs",
					children: [
						["all", ...SLOTS].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setFilter(f),
							className: `rounded px-2 py-0.5 ${filter === f ? "bg-gold text-background" : "bg-secondary"}`,
							children: f === "all" ? "All" : SLOT_LABEL[f]
						}, f)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search…",
							className: "ml-auto w-24 rounded bg-secondary px-2 py-0.5",
							"aria-label": "Search bag"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: sort,
							onChange: (e) => setSort(e.target.value),
							className: "rounded bg-secondary px-1 py-0.5",
							"aria-label": "Sort bag",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "new",
									children: "Newest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "rarity",
									children: "Rarity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "level",
									children: "Item level"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-6 gap-1.5 sm:grid-cols-8",
					children: (() => {
						const view = hero.inventory.filter((it) => (filter === "all" || it.slot === filter) && (!q || it.name.toLowerCase().includes(q.toLowerCase())));
						if (sort === "rarity") view.sort((a, b) => b.rarity - a.rarity || b.ilvl - a.ilvl);
						if (sort === "level") view.sort((a, b) => b.ilvl - a.ilvl);
						const filtered = filter !== "all" || !!q;
						return Array.from({ length: filtered ? Math.max(view.length, 8) : invCap(hero) }).map((_, i) => [view[i], i]);
					})().map(([it, i]) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
							item: it,
							size: 44,
							selected: !!it && sel?.id === it.id,
							onClick: () => it && setSel({
								id: it.id,
								equipped: false
							})
						}, it?.id ?? i);
					})
				}),
				(() => {
					const all = Object.keys(MATS);
					const owned = all.filter((m) => matCount(hero, m) > 0);
					const total = owned.reduce((a, m) => a + matCount(hero, m), 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 font-display text-sm text-gold",
							children: [
								"Forge materials · ",
								total,
								" in your bag · ",
								owned.length,
								"/",
								all.length,
								" types"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3",
							children: all.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "slot rarity-" + Math.min(MATS[m].rarity + 1, 5) + " flex items-center gap-2 p-1.5",
								title: MATS[m].desc + " Source: " + MATS[m].src,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
									mat: m,
									size: 34
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-[11px] font-bold",
										children: MATS[m].name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-muted-foreground",
										children: [
											"×",
											fmt(matCount(hero, m)),
											matCount(hero, m) ? " · Bag item" : " · Not found yet"
										]
									})]
								})]
							}, m))
						})]
					});
				})(),
				(() => {
					const supplies = Object.entries(gatheringState(hero).resources);
					if (!supplies.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5 font-display text-sm text-gold",
							children: "Gathering supplies"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Nothing gathered yet - supplies you collect stay listed here with their exact counts."
						})]
					});
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 font-display text-sm text-gold",
							children: [
								"Gathering supplies · ",
								supplies.reduce((a, [, n]) => a + n, 0),
								" held · ",
								supplies.length,
								" type",
								supplies.length === 1 ? "" : "s"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3",
							children: supplies.map(([key, n]) => {
								const [p, a, r] = key.split(":");
								const rarity = Number(r);
								if (!DISCOVERY_NAMES[p]) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `slot rarity-${Math.min(rarity + 1, 5)} flex items-center gap-2 p-1.5`,
									title: `${DISCOVERY_RARITIES[rarity]} · ${GATHERING_AREAS[Number(a)]}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryArt, {
										profession: p,
										rarity,
										className: "h-9 w-9 rounded"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-[11px] font-bold",
											children: DISCOVERY_NAMES[p][rarity]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] text-muted-foreground",
											children: [
												"×",
												n,
												" · ",
												DISCOVERY_RARITIES[rarity]
											]
										})]
									})]
								}, key);
							})
						})]
					});
				})(),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 min-h-40",
					children: selItem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
						item: selItem,
						compare: !sel?.equipped ? wornCompare(hero, selItem) : void 0,
						actions: sel?.equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-blood px-4 py-1.5 text-sm",
							onClick: () => {
								unequip(selItem);
								setSel(null);
							},
							children: "Unequip"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-gold px-4 py-1.5 text-sm",
							onClick: () => {
								equip(selItem);
								setSel({
									id: selItem.id,
									equipped: true
								});
							},
							children: "Equip"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-blood px-4 py-1.5 text-sm",
							onClick: () => {
								sell(selItem);
								setSel(null);
							},
							children: ["Sell ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: sellValue(selItem) })]
						})] })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-10 text-center text-muted-foreground",
						children: "Tap an item"
					})
				})
			] })]
		})
	});
}
function Campaign({ onClose, start, spire }) {
	const { hero } = useGame();
	const [stage, setStage] = (0, import_react.useState)(spire ? hero?.spire ?? 1 : hero?.stage ?? 1);
	const [auto, setAuto] = (0, import_react.useState)(false);
	if (!hero) return null;
	const max = spire ? hero.spire : hero.stage;
	const foe = stageFoe(stage, spire ? 1.35 : 1);
	const rw = stageRewards(stage, spire ? 2 : 1);
	const s = heroStats(hero);
	const foePower = Math.round(foe.atk * 2 + foe.def * 1.5 + foe.hp * .2);
	const ratio = s.power / foePower;
	const danger = ratio > 1.3 ? {
		t: "Easy",
		c: "text-r1"
	} : ratio > .95 ? {
		t: "Fair",
		c: "text-r4"
	} : ratio > .7 ? {
		t: "Hard",
		c: "text-hp"
	} : {
		t: "Deadly",
		c: "text-blood"
	};
	const zone = zoneOf(stage);
	const fight = () => start({
		title: spire ? `Endless Conquest · Floor ${stage}` : `${zone.name} · Stage ${stage}`,
		auto,
		right: {
			...foe,
			name: foe.boss ? `${foe.name}` : foe.name
		},
		onResult: async (won, xpMultiplier = 1) => {
			if (!won) return { lines: ["Defeated… grow stronger and return."] };
			const { grant, rollLoot, addLoot } = await import("./logic-WJE4Izgx.mjs");
			let lines = [];
			let loot = null;
			const tokens = spire ? floorTokens(stage) : 0;
			update((h) => {
				const { levels } = grant(h, scrollXp(rw.xp, xpMultiplier), rw.gold);
				loot = rollLoot(h, stage, foe.boss || spire ? 1 : .45, spire ? 2 : foe.boss ? 2 : 0);
				if (loot) addLoot(h, loot);
				if (tokens) addConquestTokens(h, tokens);
				if (spire && stage === h.spire) h.spire++;
				if (!spire && stage === h.stage) h.stage++;
				h.wins++;
				lines = [
					`+${fmt(scrollXp(rw.xp, xpMultiplier))} XP`,
					`+${fmt(rw.gold)} gold`,
					...tokens ? [`+${tokens} Conquest Tokens`] : [],
					...levels ? [`LEVEL UP ×${levels}!`] : []
				];
			});
			if (stage === max) setStage(stage + 1);
			return {
				lines,
				loot
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: spire ? "Endless Conquest" : "Campaign Gate",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-center gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-72 overflow-hidden rounded-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: world_map_default,
							alt: "",
							"aria-hidden": "true",
							className: "absolute inset-0 h-full w-full object-cover opacity-40"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 bg-background/55",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-10 bottom-2 h-8 rounded-full bg-blood/50 blur-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: foe.img,
							alt: foe.name,
							className: "relative h-full w-full object-contain anim-idle"
						}),
						foe.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute left-2 top-2 flex items-center gap-1 rounded bg-blood px-2 py-0.5 font-display text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "h-4 w-4" }), "BOSS"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm uppercase tracking-widest text-muted-foreground",
							children: spire ? `Floor` : `${zone.name}${zone.cycle > 1 ? ` · Cycle ${zone.cycle}` : ""}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn-blood h-9 w-9",
									onClick: () => setStage(Math.max(1, stage - 1)),
									children: "‹"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-5xl text-gold",
									children: stage
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn-blood h-9 w-9",
									disabled: stage >= max,
									onClick: () => setStage(Math.min(max, stage + 1)),
									children: "›"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-xl",
							children: foe.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-center gap-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "inline h-4 w-4 text-r4" }),
								" ",
								fmt(foePower)
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-bold ${danger.c}`,
								children: danger.t
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-xp",
									children: [
										"+",
										fmt(rw.xp),
										" XP"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: rw.gold }),
								(spire || foe.boss) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-r2",
									children: "Rare+ loot"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: auto,
								onChange: (e) => setAuto(e.target.checked),
								className: "accent-[var(--gold)]"
							}), " Auto-battle"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-gold w-full py-3 text-xl",
							onClick: fight,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "mr-2 inline" }), "FIGHT"]
						})
					]
				})]
			}),
			spire && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConquestTokens, { hero }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Advisor, {
				hero,
				stats: s,
				foe
			}, stage + (spire ? "s" : "c"))
		]
	});
}
function Forge({ onClose, onCraft }) {
	const { hero } = useGame();
	const [selId, setSelId] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [armed, setArmed] = (0, import_react.useState)(null);
	const [warn, setWarn] = (0, import_react.useState)(null);
	const [useStone, setUseStone] = (0, import_react.useState)(false);
	if (!hero) return null;
	const equipped = WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean);
	const bagged = hero.inventory;
	const sel = [...equipped.map((i) => ({
		...i,
		eq: true
	})), ...bagged].find((i) => i.id === selId);
	const equippedSel = !!sel && equipped.some((i) => i.id === sel.id);
	const salvage = () => {
		if (!sel) return;
		if (armed !== sel.id) {
			setArmed(sel.id);
			setMsg(null);
			return;
		}
		const gain = Object.entries(scrapYield(sel)).map(([m, n]) => "+" + n + " " + MATS[m].name).join(" - ");
		update((h) => {
			scrapItem(h, sel.id);
		});
		setArmed(null);
		setSelId(null);
		setMsg({
			ok: true,
			t: "Salvaged " + sel.name + ": " + gain
		});
	};
	const salvageEquipped = () => {
		const it = warn;
		if (!it) return;
		const gain = Object.entries(scrapYield(it)).map(([m, n]) => "+" + n + " " + MATS[m].name).join(" - ");
		update((h) => {
			unequipItem(h, it, invCap(h));
			scrapItem(h, it.id);
		});
		setWarn(null);
		setArmed(null);
		setSelId(null);
		setMsg({
			ok: true,
			t: "Unequipped and salvaged " + it.name + ": " + gain
		});
	};
	const enhance = () => {
		if (!sel) return;
		if (useStone) {
			const stoneCost = enchantStoneCost(sel);
			if (matCount(hero, "enchantStone") < stoneCost) return;
			const ok = Math.random() < enhanceStoneChance(sel);
			update((h) => {
				const m = { ...h.mats ?? {} };
				m.enchantStone = (m.enchantStone ?? 0) - stoneCost;
				h.mats = m;
				const pos = sel.eq ? posOf(h.equipment, sel.id) : void 0;
				const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
				if (target && ok) {
					target.enh++;
					recordEnhance(h, target.enh);
				}
			});
			setMsg(ok ? {
				ok,
				t: `Success! +${sel.enh + 1} (Stone)`
			} : {
				ok,
				t: "The stone cracked… failed"
			});
		} else {
			const cost = enhanceCost(sel, hero.level);
			if (hero.gold < cost) return;
			const ok = Math.random() < enhanceChance(sel);
			update((h) => {
				h.gold -= cost;
				const pos = sel.eq ? posOf(h.equipment, sel.id) : void 0;
				const target = pos ? h.equipment[pos] : h.inventory.find((i) => i.id === sel.id);
				if (target && ok) {
					target.enh++;
					recordEnhance(h, target.enh);
				}
			});
			setMsg(ok ? {
				ok,
				t: `Success! +${sel.enh + 1}`
			} : {
				ok,
				t: "The metal cracked… failed"
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Forge",
		onClose,
		children: [
			onCraft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "btn-gold mb-4 w-full py-2",
				onClick: onCraft,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "mr-2 inline h-4 w-4" }), "Open crafting recipes · Standard & Ancestral"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 md:grid-cols-[1fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1.5 flex items-center gap-2 font-display text-sm text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }),
							"Equipped on you ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									equipped.length,
									")"
								]
							})
						]
					}), equipped.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 content-start gap-1.5 md:grid-cols-6",
						children: equipped.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
								item: it,
								size: 40,
								selected: it.id === selId,
								onClick: () => {
									setSelId(it.id);
									setArmed(null);
									setMsg(null);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded bg-gold px-1 text-[9px] font-bold uppercase text-background",
								children: "Worn"
							})]
						}, it.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Nothing equipped yet."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1.5 flex items-center gap-2 font-display text-sm text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backpack, { className: "h-4 w-4" }),
							"In your bag ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									bagged.length,
									")"
								]
							})
						]
					}), bagged.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 content-start gap-1.5 md:grid-cols-6",
						children: bagged.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
							item: it,
							size: 40,
							selected: it.id === selId,
							onClick: () => {
								setSelId(it.id);
								setArmed(null);
								setMsg(null);
							}
						}, it.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Your bag is empty."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [sel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, { item: sel }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `flex-1 py-1.5 text-xs ${!useStone ? "btn-gold" : "btn-ghost"}`,
								onClick: () => setUseStone(false),
								children: "Gold"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `flex-1 py-1.5 text-xs ${useStone ? "btn-gold" : "btn-ghost"}`,
								onClick: () => setUseStone(true),
								children: "Enchantment Stone"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Chance ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
									className: "text-gold",
									children: [Math.round((useStone ? enhanceStoneChance(sel) : enhanceChance(sel)) * 100), "%"]
								}),
								useStone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-xs text-r1",
									children: "+15% stone bonus"
								})
							] }), useStone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
										mat: "enchantStone",
										size: 18
									}),
									" ",
									matCount(hero, "enchantStone"),
									"/",
									enchantStoneCost(sel)
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: enhanceCost(sel, hero.level) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-gold w-full py-3 text-lg",
							disabled: useStone ? matCount(hero, "enchantStone") < enchantStoneCost(sel) : hero.gold < enhanceCost(sel, hero.level),
							onClick: enhance,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "mr-2 inline" }),
								"Enhance +",
								sel.enh + 1
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "slot p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-2 font-display text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), "Salvage into materials"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex flex-wrap gap-2 text-xs",
									children: [Object.entries(scrapYield(sel)).map(([m, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "slot px-2 py-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
												mat: m,
												size: 14
											}),
											" ",
											MATS[m].name,
											" +",
											n
										]
									}, m)), sockets(sel).some(Boolean) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "slot px-2 py-0.5",
										children: "Socketed gems return to your pouch"
									})]
								}),
								equippedSel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs text-blood",
									children: "This piece is equipped right now."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn-blood w-full py-2",
									onClick: () => {
										setWarn(sel);
										setArmed(null);
									},
									children: "Salvage equipped gear..."
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "w-full py-2 " + (armed === sel.id ? "btn-blood" : "btn-ghost"),
									onClick: salvage,
									children: armed === sel.id ? "Confirm - destroy " + sel.name : "Salvage this piece"
								})
							]
						}),
						msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `anim-pop text-center font-display text-lg ${msg.ok ? "text-r1" : "text-hp"}`,
							children: msg.t
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-16 text-center text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "mx-auto mb-2 h-10 w-10" }), "Choose gear to empower"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "slot p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center gap-2 font-display text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), "Refine spare materials"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: REFINE.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "btn-ghost flex w-full items-center justify-between gap-2 px-2 py-1.5 text-xs",
									disabled: matCount(hero, r.from) < r.need,
									onClick: () => update((h) => {
										const err = refine(h, r.id);
										setMsg(err ? {
											ok: false,
											t: err
										} : {
											ok: true,
											t: "Refined: +" + r.gain + " " + MATS[r.to].name
										});
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
												mat: r.from,
												size: 16
											}),
											" ",
											MATS[r.from].name,
											" ×",
											r.need
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-gold",
										children: [
											"→ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
												mat: r.to,
												size: 16
											}),
											" ",
											MATS[r.to].name
										]
									})]
								}, r.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Spare materials from battles refine into the ones recipes need."
							})
						]
					})]
				})]
			}),
			warn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4",
				role: "alertdialog",
				"aria-modal": "true",
				"aria-label": "Confirm salvaging equipped gear",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "game-panel anim-pop w-full max-w-md p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2 font-display text-xl text-blood",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5" }), "This gear is equipped"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: warn.name }), " is worn right now. Salvaging it will unequip and permanently destroy it, returning its materials and socketed gems. This cannot be undone."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost flex-1 py-2",
								onClick: () => setWarn(null),
								children: "Keep it equipped"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-blood flex-1 py-2",
								onClick: salvageEquipped,
								children: "Unequip and destroy"
							})]
						})
					]
				})
			})
		]
	});
}
var ATTRS = [
	{
		k: "str",
		name: "Strength",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "h-8 w-8 text-gold" }),
		d: "+Phys attack, phys def, crit dmg, pen"
	},
	{
		k: "int",
		name: "Intelligence",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-8 w-8 text-r3" }),
		d: "+Magic attack, magic def, pen"
	},
	{
		k: "agi",
		name: "Agility",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clover, { className: "h-8 w-8 text-r1" }),
		d: "+Crit, dodge, accuracy, loot"
	},
	{
		k: "vit",
		name: "Vitality",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-8 w-8 text-hp" }),
		d: "+Most health, both defenses"
	}
];
function Temple({ onClose }) {
	const { hero } = useGame();
	const [count, setCount] = (0, import_react.useState)(1);
	if (!hero) return null;
	const s = heroStats(hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Barracks — Attribute Training",
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarracksUpgrade, { hero }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid grid-cols-3 gap-2 text-center",
				children: [
					[
						"Health",
						fmt(s.hp),
						"text-hp"
					],
					[
						"Attack",
						fmt(s.atk),
						"text-gold"
					],
					[
						"Defense",
						fmt(s.def),
						""
					]
				].map(([label, v, cls]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `font-display text-lg ${cls}`,
						children: v
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: label
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 font-display text-sm text-gold",
				children: "Attribute training"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "group",
				"aria-label": "Training batch",
				className: "mb-4 flex flex-wrap gap-2",
				children: batchSizes(hero).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: count === n ? "default" : "outline",
					"aria-pressed": count === n,
					onClick: () => setCount(n),
					children: [
						"+",
						n,
						" points"
					]
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-4 md:grid-cols-4",
				children: ATTRS.map((a) => {
					const cost = trainingCost(hero, a.k, count);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "slot flex flex-col items-center gap-2 p-4 text-center",
						children: [
							a.icon,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display",
								children: a.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-3xl text-gold",
								children: hero.attrs[a.k]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: a.d
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								disabled: hero.gold < cost,
								onClick: () => update((h) => {
									trainAttribute(h, a.k, count);
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
									n: cost,
									className: "text-primary-foreground"
								})
							})
						]
					}, a.k);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrillTracks, { hero })
		]
	});
}
function Market({ onClose }) {
	const { hero } = useGame();
	const [sel, setSel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (hero && hero.merchant.length === 0) update(refreshMerchant);
	}, [hero]);
	if (!hero) return null;
	const refreshCost = 20 + hero.level * 15;
	const item = hero.merchant.find((i) => i.id === sel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Night Market",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-3",
				children: hero.merchant.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSlot, {
						item: it,
						size: 64,
						selected: sel === it.id,
						onClick: () => setSel(it.id)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
						n: buyPrice(it, hero.level),
						className: "text-xs"
					})]
				}, it.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "btn-blood mt-4 w-full py-2",
				disabled: hero.gold < refreshCost,
				onClick: () => {
					update((h) => {
						h.gold -= refreshCost;
						refreshMerchant(h);
					});
					setSel(null);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 inline h-4 w-4" }),
					"New stock ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: refreshCost })
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: item ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
				item,
				compare: wornCompare(hero, item),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-gold px-4 py-1.5",
					disabled: hero.gold < buyPrice(item, hero.level) || hero.inventory.length >= invCap(hero),
					onClick: () => {
						update((h) => {
							h.gold -= buyPrice(item, h.level);
							h.merchant = h.merchant.filter((m) => m.id !== item.id);
							h.inventory.unshift(item);
						});
						setSel(null);
					},
					children: ["Buy ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, {
						n: buyPrice(item, hero.level),
						className: "text-primary-foreground"
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-16 text-center text-muted-foreground",
				children: "Pick a ware"
			}) })]
		})
	});
}
function Arena({ onClose, start }) {
	const { hero, userId, heroId } = useGame();
	const [opps, setOpps] = (0, import_react.useState)([]);
	const [top, setTop] = (0, import_react.useState)([]);
	const [me, setMe] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = async () => {
		if (!userId) return;
		setLoading(true);
		const cols = "id,user_id,name,hero_class,gender,level,power,arena_rating,stats";
		const [mine, tops, hist] = await Promise.all([
			supabase.from("heroes").select(cols).eq("id", heroId ?? "").maybeSingle(),
			supabase.from("heroes").select(cols).order("arena_rating", { ascending: false }).limit(10),
			supabase.from("arena_matches").select("*").order("created_at", { ascending: false }).limit(8)
		]);
		const m = mine.data;
		setMe(m);
		setTop(tops.data ?? []);
		setHistory(hist.data ?? []);
		const rating = m?.arena_rating ?? 1e3;
		const { data } = await supabase.from("heroes").select(cols).neq("user_id", userId).gte("arena_rating", rating - 300).lte("arena_rating", rating + 300).limit(30);
		let list = data ?? [];
		if (list.length < 3) list = (await supabase.from("heroes").select(cols).neq("user_id", userId).limit(30)).data ?? [];
		setOpps(list.sort(() => Math.random() - .5).slice(0, 4));
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [userId]);
	if (!hero) return null;
	if (!userId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Blood Arena",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "py-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto mb-3 h-12 w-12 text-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-muted-foreground",
					children: "Sign in to fight real players"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "btn-gold inline-block px-6 py-2",
					children: "Sign in"
				})
			]
		})
	});
	const fight = (o) => {
		const cls = [
			"warrior",
			"mage",
			"archer"
		].includes(o.hero_class) ? o.hero_class : "warrior";
		start({
			title: "Blood Arena",
			auto: true,
			right: {
				name: o.name,
				img: CLASSES[cls].img,
				gender: o.gender === "female" ? "female" : "male",
				hp: o.stats.hp,
				atk: o.stats.atk,
				def: o.stats.def,
				crit: o.stats.crit,
				dodge: o.stats.dodge ?? 5,
				critDmg: o.stats.critDmg ?? 200,
				pen: o.stats.pen ?? 0,
				acc: o.stats.acc ?? 0,
				level: o.level + (o.stats.paragon ?? 0),
				cls,
				mirror: true
			},
			onResult: async (won, xpMultiplier = 1) => {
				const { data, error } = await supabase.rpc("record_arena_result", {
					_attacker: heroId ?? "",
					_defender: o.id,
					_won: won
				});
				let lines = [won ? "Victory in the arena!" : "Defeated…"];
				if (!error && typeof data === "number") lines.push(`Rating ${data >= 0 ? "+" : ""}${data}`);
				if (won) {
					const gold = 40 + hero.level * 12;
					update((h) => {
						h.gold += gold;
					});
					lines.push(`+${fmt(gold)} gold`);
				}
				load();
				return { lines };
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Blood Arena",
		onClose,
		wide: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-center gap-3 font-display text-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-6 w-6 text-r4" }),
				" Rating ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-3xl text-gold",
					children: me?.arena_rating ?? 1e3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-blood ml-4 px-3 py-1 text-sm",
					onClick: load,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "inline h-4 w-4" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[2fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-full py-10 text-center text-muted-foreground",
						children: "Seeking challengers…"
					}),
					!loading && opps.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-full py-10 text-center text-muted-foreground",
						children: "No other heroes yet — invite friends!"
					}),
					opps.map((o) => {
						const cls = CLASSES[o.hero_class] ? o.hero_class : "warrior";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "slot flex flex-col items-center p-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
									cls,
									gender: o.gender === "female" ? "female" : "male",
									className: "h-32"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-display",
									children: o.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										"Lv ",
										o.level,
										" · ",
										CLASSES[cls].name
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "inline h-3 w-3 text-r4" }),
										" ",
										fmt(o.power),
										" · ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gold",
											children: o.arena_rating
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "btn-gold mt-2 w-full py-1",
									onClick: () => fight(o),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "mr-1 inline h-4 w-4" }), "Challenge"]
								})
							]
						}, o.id);
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 font-display text-gold",
					children: "Champions"
				}), top.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex justify-between border-b border-border/40 py-1 text-sm ${t.id === heroId ? "text-gold" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						i + 1,
						". ",
						t.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.arena_rating })]
				}, t.id))] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 font-display text-gold",
						children: "Recent fights"
					}),
					history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "None yet"
					}),
					history.map((m) => {
						const mine = m.attacker_id === heroId;
						const won = mine ? m.attacker_won : !m.attacker_won;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mine ? `vs ${m.defender_name}` : `${m.attacker_name} attacked` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: won ? "text-r1" : "text-hp",
								children: won ? "WIN" : "LOSS"
							})]
						}, m.id);
					})
				] })]
			})]
		})]
	});
}
/** The old AI oracle is gone: the board is six fixed daily commissions that reset at Greek midnight. */
function Oracle(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestBoard, { onClose: props.onClose });
}
function XpBar({ hero }) {
	const need = xpToNext(hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bar-track h-2.5 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bar-xp h-full",
			style: { width: `${Math.min(100, hero.xp / need * 100)}%` }
		})
	});
}
function Advisor({ hero, stats, foe }) {
	const { userId } = useGame();
	const ask = useServerFn(adviseStrategy);
	const [advice, setAdvice] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const run = async () => {
		setLoading(true);
		setErr(null);
		setAdvice(null);
		try {
			const r = await ask({ data: {
				heroClass: hero.cls,
				level: hero.level + hero.paragon,
				hero: {
					hp: stats.hp,
					atk: stats.atk,
					def: stats.def,
					crit: stats.crit,
					dodge: stats.dodge
				},
				enemy: {
					name: foe.name,
					level: foe.level,
					boss: !!foe.boss,
					hp: foe.hp,
					atk: foe.atk,
					def: foe.def,
					crit: foe.crit,
					dodge: foe.dodge
				},
				skills: heroSkills(hero).map((k) => `${k.name}: ${Math.round(k.mult * (k.hits ?? 1) * 100)}% dmg, cooldown ${k.cd}${k.heal ? ", heals 15%" : ""}${k.stun ? ", freezes enemy 1 turn" : ""}${k.crit ? ", always crits" : ""}`)
			} });
			if (r.error) setErr(r.error);
			else setAdvice(r.advice);
		} catch {
			setErr("The tactician is silent, try again");
		}
		setLoading(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot mt-5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 inline h-4 w-4" }), "War Tactician"]
				}), userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-blood px-4 py-1.5 text-sm",
					disabled: loading,
					onClick: run,
					children: loading ? "Thinking…" : "Get strategy"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "btn-gold px-4 py-1.5 text-sm",
					children: "Sign in"
				})]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-hp",
				children: err
			}),
			advice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "anim-pop mt-2 whitespace-pre-line text-sm",
				children: advice
			})
		]
	});
}
function SkillLoadout() {
	const { hero } = useGame();
	if (!hero) return null;
	const kit = buildKit(hero.cls, heroSkills(hero));
	const selected = buildKit(hero.cls, heroSkills(hero), hero.skillLoadout).map((s) => s.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 border-y border-border py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "font-display text-xl",
				children: [
					"Battle skills · ",
					selected.length,
					" selected"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				disabled: !hero.skillLoadout,
				onClick: () => update((h) => {
					h.skillLoadout = void 0;
				}),
				children: "Select all unlocked"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
			children: kit.map((sk, i) => {
				const on = selected.includes(sk.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: `slot flex cursor-pointer items-start gap-3 p-3 ${on ? "border-gold" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						"aria-label": `Battle skill: ${sk.name}`,
						checked: on,
						disabled: i === 0,
						className: "mt-1 accent-primary",
						onChange: () => update((h) => {
							const available = buildKit(h.cls, heroSkills(h));
							const current = buildKit(h.cls, heroSkills(h), h.skillLoadout).map((s) => s.id);
							h.skillLoadout = available.filter((s, index) => index === 0 || (s.id === sk.id ? !current.includes(s.id) : current.includes(s.id))).map((s) => s.id);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-gold",
								children: [on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 inline h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sword, { className: "mr-1 inline h-3 w-3" }), sk.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: sk.desc
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs",
								children: i === 0 ? "Basic attack" : `${sk.cost} ${resourceName(hero.cls)} · ${sk.cd} turn cooldown`
							})
						]
					})]
				}, sk.id);
			})
		})]
	});
}
/** A presentation-only preview: never starts a battle or awards progression. */
function SkillPreview({ talent, cls, gender, locked }) {
	const [replay, setReplay] = (0, import_react.useState)(0);
	if (!talent.ability) return null;
	const ability = talent.ability;
	const skill = buildKit(cls, [ability]).find((s) => s.id === ability.id);
	if (!skill) return null;
	const move = moveFor({ cls }, ability.id);
	const effect = effectFor(ability.id) ?? "arcane";
	const range = skill.target === "all" ? "All enemies" : skill.target === "self" ? "Self" : skill.target === "multi" ? `Up to ${skill.maxTargets} enemies` : "One enemy";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 border-t border-border pt-4",
		"aria-label": "Ability preview",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg text-gold",
				children: ability.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => setReplay((n) => n + 1),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), "Replay animation"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid items-center gap-4 sm:grid-cols-[240px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "battle-unit relative flex h-56 items-end justify-center overflow-hidden bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `relative h-48 w-32 anim-${move}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
						cls,
						gender,
						className: "h-full"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeaponArc, { move })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute right-0 top-0 h-full w-28",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombatEffect, { kind: effect })
				})]
			}, replay), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: skill.desc }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-gold",
						children: [
							range,
							" · ",
							skill.hits ?? 1,
							" hit",
							(skill.hits ?? 1) > 1 ? "s" : "",
							" · ",
							skill.cost,
							" resource · ",
							skill.cd,
							" turn cooldown"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						Math.round(skill.mult * 100),
						"% damage per hit",
						skill.stun ? " · Stun" : "",
						skill.heal ? ` · Heals ${Math.round(skill.heal * 100)}%` : ""
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: locked ? "text-muted-foreground" : "text-gold",
						children: locked ?? "Ready to learn"
					})
				]
			})]
		})]
	});
}
var fxLabels = {
	hpPct: "Max HP",
	atkPct: "Attack",
	defPct: "Defense",
	crit: "Crit Chance",
	dodge: "Dodge",
	critDmg: "Crit Damage",
	pen: "Penetration"
};
var fxText = (fx, rank) => Object.keys(fx).map((k) => `+${Number(((fx[k] ?? 0) * rank).toFixed(2))}% ${fxLabels[k]}`).join(" · ");
/** Human-readable per-rank effects of a talent (stats, ability boosts or a new ability). */
function talentEffects(t, rank) {
	if (t.fx && Object.keys(t.fx).length) return fxText(t.fx, rank);
	if (t.boost) {
		const name = t.boost.skill.charAt(0).toUpperCase() + t.boost.skill.slice(1);
		return `+${t.boost.multPct * rank}% damage to ${name}`;
	}
	if (t.ability) {
		const a = t.ability;
		const dmg = `${Math.round(a.mult * 100)}%${a.hits ? ` × ${a.hits} hits` : ""}`;
		const tags = [
			a.stun ? "stuns" : "",
			a.crit ? "always crits" : "",
			a.heal ? `heals ${Math.round(a.heal * 100)}%` : ""
		].filter(Boolean).join(", ");
		return `${dmg} damage${tags ? ` · ${tags}` : ""}${t.selfBoost && rank > 1 ? ` · +${t.selfBoost.multPct * (rank - 1)}% from upgrades` : ""}`;
	}
	return t.desc;
}
var NODE_R$1 = 28;
var TREE_W$1 = 780;
var TREE_H$1 = 460;
var COL_X = [
	140,
	390,
	640
];
var ROW_Y = [
	80,
	160,
	240,
	320,
	400
];
/** Rendered as the Skill Tree tab inside the Throne Hall, mirroring the Passive tree canvas. */
function SkillTreeContent() {
	const { hero, gender } = useGame();
	const [hovered, setHovered] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	const [previewId, setPreviewId] = (0, import_react.useState)(null);
	const scrollRef = (0, import_react.useRef)(null);
	if (!hero) return null;
	const trees = TREES[hero.cls];
	const posOf = (specIdx, tier) => ({
		x: COL_X[specIdx],
		y: ROW_Y[tier - 1]
	});
	const firstTalent = trees[0].talents[0];
	const detailId = hovered ?? selected ?? firstTalent.id;
	const detail = trees.flatMap((s) => s.talents).find((t) => t.id === detailId) ?? firstTalent;
	const detailSpec = trees.find((s) => s.talents.some((t) => t.id === detail.id));
	const rank = hero.talents?.[detail.id] ?? 0;
	const blocker = learnBlocker(hero, detail.id);
	const free = freePoints(hero);
	const learn = (id) => update((h) => {
		if (learnBlocker(h, id)) return;
		h.talents = {
			...h.talents ?? {},
			[id]: (h.talents?.[id] ?? 0) + 1
		};
	});
	const chooseSpec = (id) => update((h) => {
		if (h.level >= 10 && !h.spec) h.spec = id;
	});
	const reset = () => update((h) => {
		const cost = resetCost(h);
		if (h.gold < cost || spentIn(h) === 0 && !h.spec) return;
		h.gold -= cost;
		h.talents = {};
		h.spec = void 0;
	});
	const edges = (0, import_react.useMemo)(() => {
		const list = [];
		trees.forEach((spec, si) => {
			for (let i = 1; i < spec.talents.length; i++) {
				const from = posOf(si, spec.talents[i - 1].tier);
				const to = posOf(si, spec.talents[i].tier);
				const active = (hero.talents?.[spec.talents[i - 1].id] ?? 0) > 0;
				list.push({
					from,
					to,
					active
				});
			}
		});
		return list;
	}, [hero, trees]);
	const preview = trees.flatMap((s) => s.talents).find((t) => t.id === previewId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-display text-lg",
				children: [
					"Skill points: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gold",
						children: fmt(free)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-3 text-sm text-muted-foreground",
						children: [
							fmt(spentIn(hero)),
							" spent · ",
							fmt(totalPoints(hero)),
							" earned"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "Earn 1 point per level, plus a bonus every 5 levels — quests and achievements can add more."
				}), !confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm",
					disabled: spentIn(hero) === 0 && !hero.spec,
					onClick: () => setConfirmReset(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Reset tree"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 text-sm",
					children: [
						"Reset for ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: resetCost(hero) }),
						"?",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-gold px-3 py-1",
							disabled: hero.gold < resetCost(hero),
							onClick: () => {
								reset();
								setConfirmReset(false);
							},
							children: "Confirm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-ghost px-3 py-1",
							onClick: () => setConfirmReset(false),
							children: "Cancel"
						})
					]
				})]
			})]
		}),
		hero.level >= 10 && !hero.spec && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-gold",
			children: "Choose a specialization to unlock its tier 3+ abilities — you can change it later with a reset."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[1fr_280px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: scrollRef,
				className: "slot overflow-auto p-2",
				style: { maxHeight: "460px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto",
					style: {
						width: TREE_W$1,
						height: TREE_H$1
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							className: "absolute inset-0",
							width: TREE_W$1,
							height: TREE_H$1,
							style: { pointerEvents: "none" },
							children: [
								[265, 515].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: x,
									y1: 20,
									x2: x,
									y2: 440,
									stroke: "var(--border)",
									strokeWidth: 1,
									strokeDasharray: "4 6"
								}, x)),
								[
									120,
									200,
									280,
									360
								].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: 20,
									y1: y,
									x2: 760,
									y2: y,
									stroke: "var(--border)",
									strokeWidth: 1,
									strokeDasharray: "2 8",
									opacity: .4
								}, y)),
								edges.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: e.from.x,
									y1: e.from.y,
									x2: e.to.x,
									y2: e.to.y,
									stroke: e.active ? "var(--gold)" : "var(--muted-foreground)",
									strokeWidth: e.active ? 2.5 : 1.5,
									opacity: e.active ? .8 : .3,
									strokeDasharray: e.active ? "0" : "5 5"
								}, i))
							]
						}),
						trees.map((spec, si) => {
							const mine = hero.spec === spec.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute flex -translate-x-1/2 flex-col items-center",
								style: {
									left: COL_X[si],
									top: 0
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-sm text-gold/80",
									children: [spec.name, mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "ml-1 inline h-3 w-3 text-gold" })]
								}), !hero.spec && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn-ghost mt-0.5 px-2 py-0.5 text-[10px]",
									disabled: hero.level < 10,
									title: hero.level < 10 ? `Requires level 10` : `Specialize in ${spec.name}`,
									onClick: () => chooseSpec(spec.id),
									children: hero.level < 10 ? `Lv 10` : "Specialize"
								})]
							}, spec.id);
						}),
						[
							1,
							2,
							3,
							4,
							5
						].map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute left-2 text-[10px] text-muted-foreground",
							style: { top: ROW_Y[tier - 1] - 5 },
							children: ["T", tier]
						}, tier)),
						trees.map((spec, si) => spec.talents.map((t) => {
							const pos = posOf(si, t.tier);
							const r = hero.talents?.[t.id] ?? 0;
							const block = learnBlocker(hero, t.id);
							t.id;
							const isSel = selected === t.id;
							const maxed = r >= t.max;
							const locked = block && r === 0;
							const ready = !block && !maxed;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "absolute flex items-center justify-center rounded-full border-2 transition hover:scale-110 hover:z-10",
								style: {
									left: pos.x - NODE_R$1,
									top: pos.y - NODE_R$1,
									width: 56,
									height: 56,
									borderColor: maxed ? "var(--gold)" : ready ? "var(--r1)" : locked ? "var(--muted-foreground)" : "var(--r4)",
									background: r > 0 ? "color-mix(in srgb, var(--gold) 25%, var(--card))" : "var(--card)",
									boxShadow: ready ? "0 0 8px color-mix(in srgb, var(--gold) 40%, transparent)" : maxed ? "0 0 12px var(--gold)" : "none",
									opacity: locked ? .55 : 1,
									cursor: ready ? "pointer" : "default",
									outline: isSel ? "2px solid var(--gold)" : "none"
								},
								title: `${t.name}${r > 0 ? ` (${r}/${t.max})` : ""}`,
								onMouseEnter: () => setHovered(t.id),
								onMouseLeave: () => setHovered(null),
								onClick: () => setSelected(t.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5",
										children: Array.from({ length: t.max }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full",
											style: {
												width: 5,
												height: 5,
												background: i < r ? "var(--gold)" : "var(--muted-foreground)",
												opacity: i < r ? 1 : .3
											}
										}, i))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-sm font-bold",
										style: { color: maxed ? "var(--gold)" : r > 0 ? "var(--foreground)" : "var(--muted-foreground)" },
										children: t.tier
									}),
									t.ability && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute right-1 top-1 text-[10px] text-gold",
										children: "◆"
									}),
									ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-0 animate-ping rounded-full",
										style: {
											border: "1px solid var(--gold)",
											opacity: .3,
											animationDuration: "2s"
										}
									})
								]
							}, t.id);
						}))
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "slot flex flex-col p-4",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display text-lg text-gold",
						children: [detail.ability ? "◆ " : "", detail.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 text-sm text-muted-foreground",
						children: [
							detailSpec.name,
							" specialization · Tier ",
							detail.tier
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: detail.desc
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Per rank:"
								}),
								" ",
								talentEffects(detail, 1)
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										"Current (",
										rank,
										"):"
									]
								}),
								" ",
								rank > 0 ? talentEffects(detail, rank) : "—"
							] }),
							rank < detail.max && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										"Next (",
										rank + 1,
										"):"
									]
								}),
								" ",
								talentEffects(detail, rank + 1)
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-xs text-muted-foreground",
						children: [
							"Rank ",
							rank,
							"/",
							detail.max,
							" · ",
							rankCost(detail, rank),
							" pt/rank"
						]
					}),
					blocker && blocker !== "Maxed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 text-xs text-blood",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "inline h-3 w-3" }),
							" ",
							blocker
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-gold w-full px-4 py-2",
							disabled: !!blocker,
							title: blocker ?? `Spend ${rankCost(detail, rank)} skill point`,
							onClick: () => learn(detail.id),
							children: blocker ?? `Learn rank ${rank + 1} · ${rankCost(detail, rank)} pt`
						}), detail.ability && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-ghost w-full px-4 py-2 text-sm text-gold",
							onClick: () => setPreviewId((id) => id === detail.id ? null : detail.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }), previewId === detail.id ? "Hide preview" : `Preview ${detail.name}`]
						})]
					})
				]
			})]
		}),
		preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillPreview, {
			talent: preview,
			cls: hero.cls,
			gender,
			locked: learnBlocker(hero, preview.id)
		})
	] });
}
var node = (group, id, name, desc, tier, fx, prereq) => ({
	group,
	id,
	name,
	desc,
	tier,
	fx,
	max: 4,
	cost: tier,
	...prereq ? { prereq: {
		id: prereq,
		rank: 2
	} } : {}
});
var PASSIVES = [
	node("general", "field_medicine", "Field Medicine", "Improve every healing skill and combat potion.", 1, { heal: 2 }),
	node("general", "brace", "Impact Brace", "Turn incoming strikes into blocks.", 1, { block: 1 }),
	node("general", "trail_sense", "Trail Sense", "Read evasive opponents rather than gambling on criticals.", 1, { acc: 1 }),
	node("general", "provisions", "Deep Provisions", "Carry the endurance to survive long expeditions.", 1, {
		hpPct: 2,
		heal: 1
	}),
	node("general", "footwork", "Measured Footwork", "Balance a guarded stance with careful movement.", 2, {
		dodge: .5,
		block: .5
	}, "brace"),
	node("general", "anatomy", "Practical Anatomy", "Understand wounds both to mend and to exploit them.", 2, {
		heal: 1,
		pen: .5
	}, "field_medicine"),
	node("general", "watch", "Night Watch", "Stay alert and protected against unpredictable foes.", 2, {
		acc: 1,
		defPct: 1
	}, "trail_sense"),
	node("general", "reserve", "Living Reserve", "Build a larger reservoir for percentage-based healing.", 2, {
		hpPct: 3,
		heal: 1
	}, "provisions"),
	node("general", "triage", "Battlefield Triage", "Keep healing effective behind a steady guard.", 3, {
		heal: 3,
		block: 1
	}, "anatomy"),
	node("general", "veteran", "Veteran Instinct", "Combine precise reactions with defensive movement.", 3, {
		acc: 2,
		dodge: 1
	}, "watch"),
	node("warrior", "w_staunch", "Staunch Blood", "Strengthen Bloodrage recovery without changing its damage.", 1, { heal: 3 }),
	node("warrior", "w_angle", "Shield Angle", "Deflect blows while finding an opening.", 1, {
		block: 1,
		acc: .5
	}),
	node("warrior", "w_march", "Long March", "Preserve health under a defensive stance.", 2, {
		hpPct: 2,
		block: 1
	}, "w_angle"),
	node("warrior", "w_scar", "Scar Tissue", "Survive wounds and recover more efficiently.", 2, {
		defPct: 2,
		heal: 1
	}, "w_staunch"),
	node("warrior", "w_reprisal", "Reprisal Training", "Increase attack and penetration, including counterattack damage.", 3, {
		atkPct: 2,
		pen: 1
	}, "w_march"),
	node("warrior", "w_refuge", "Walking Refuge", "Guard your recovery rather than chasing critical strikes.", 3, {
		block: 2,
		heal: 2
	}, "w_scar"),
	node("mage", "m_restorative", "Restorative Study", "Improve Restoration and Mana Drain healing.", 1, { heal: 3 }),
	node("mage", "m_geometry", "Ward Geometry", "Give fragile robes a reliable defensive angle.", 1, {
		block: 1,
		defPct: 1
	}),
	node("mage", "m_vessel", "Barrier Vessel", "A larger health pool also strengthens Arcane Barrier.", 2, {
		hpPct: 3,
		heal: 1
	}, "m_restorative"),
	node("mage", "m_sight", "Unclouded Sight", "Keep spells accurate while sidestepping danger.", 2, {
		acc: 2,
		dodge: .5
	}, "m_geometry"),
	node("mage", "m_recuperate", "Recuperative Ward", "Combine healing efficiency with defensive resilience.", 3, {
		heal: 3,
		defPct: 2
	}, "m_vessel"),
	node("mage", "m_refraction", "Refraction", "Read defenses and place spells through their gaps.", 3, {
		acc: 2,
		pen: 1
	}, "m_sight"),
	node("archer", "a_herbal", "Herbal Lore", "Improve potions and Shadow Step recovery.", 1, { heal: 3 }),
	node("archer", "a_range", "Range Reading", "Track moving targets without relying on critical chance.", 1, { acc: 2 }),
	node("archer", "a_retreat", "Covered Retreat", "Mix evasion with a guarded fallback.", 2, {
		dodge: .5,
		block: 1
	}, "a_range"),
	node("archer", "a_camp", "Hidden Camp", "Build endurance and efficient recovery.", 2, {
		hpPct: 2,
		heal: 2
	}, "a_herbal"),
	node("archer", "a_gap", "Gap Reader", "Place arrows through armor even against evasive prey.", 3, {
		acc: 2,
		pen: 1
	}, "a_retreat"),
	node("archer", "a_return", "Safe Return", "Prioritize survival and healing on long hunts.", 3, {
		dodge: 1,
		heal: 3
	}, "a_camp")
];
var whole = (n) => Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
var available = (h, p) => p.group === "general" || p.group === h.cls;
function passiveRank(h, id) {
	const p = PASSIVES.find((p) => p.id === id);
	return p && available(h, p) ? Math.min(p.max, whole(h.passives?.[id])) : 0;
}
var insightBank = (h) => whole(h.insight);
var spentInsight = (h, group) => PASSIVES.reduce((n, p) => n + (!group || p.group === group ? passiveRank(h, p.id) * p.cost : 0), 0);
/** Lifetime accounted Insight = unspent bank + purchased ranks. */
var totalInsight = (h) => insightBank(h) + spentInsight(h);
function passiveBlocker(h, id) {
	const p = PASSIVES.find((p) => p.id === id);
	if (!p) return "Unknown passive";
	if (!available(h, p)) return `Requires ${p.group} class`;
	if (passiveRank(h, id) >= p.max) return "Maxed";
	if (insightBank(h) < p.cost) return `Needs ${p.cost} Insight`;
	return null;
}
function learnPassive(h, id) {
	const next = {
		...h,
		passives: { ...h.passives }
	};
	if (passiveBlocker(h, id)) return next;
	const p = PASSIVES.find((p) => p.id === id);
	next.insight = insightBank(h) - p.cost;
	next.passives[id] = passiveRank(h, id) + 1;
	return next;
}
var labels = {
	hpPct: "Max HP",
	atkPct: "Attack",
	defPct: "Defense",
	crit: "Crit Chance",
	dodge: "Dodge",
	critDmg: "Crit Damage",
	pen: "Penetration",
	heal: "Healing Power",
	block: "Block",
	acc: "Accuracy"
};
var effects = (fx, rank) => Object.keys(fx).map((k) => `+${Number(((fx[k] ?? 0) * rank).toFixed(2))}% ${labels[k]}`).join(" · ");
var NODE_R = 28;
var GENERAL_POS = {
	field_medicine: {
		x: 100,
		y: 80
	},
	brace: {
		x: 220,
		y: 80
	},
	trail_sense: {
		x: 340,
		y: 80
	},
	provisions: {
		x: 460,
		y: 80
	},
	anatomy: {
		x: 100,
		y: 220
	},
	footwork: {
		x: 220,
		y: 220
	},
	watch: {
		x: 340,
		y: 220
	},
	reserve: {
		x: 460,
		y: 220
	},
	triage: {
		x: 100,
		y: 360
	},
	veteran: {
		x: 340,
		y: 360
	}
};
var CLASS_POS = {
	w_staunch: {
		x: 580,
		y: 80
	},
	w_angle: {
		x: 700,
		y: 80
	},
	w_march: {
		x: 700,
		y: 220
	},
	w_scar: {
		x: 580,
		y: 220
	},
	w_reprisal: {
		x: 700,
		y: 360
	},
	w_refuge: {
		x: 580,
		y: 360
	},
	m_restorative: {
		x: 580,
		y: 80
	},
	m_geometry: {
		x: 700,
		y: 80
	},
	m_vessel: {
		x: 580,
		y: 220
	},
	m_sight: {
		x: 700,
		y: 220
	},
	m_recuperate: {
		x: 580,
		y: 360
	},
	m_refraction: {
		x: 700,
		y: 360
	},
	a_herbal: {
		x: 580,
		y: 80
	},
	a_range: {
		x: 700,
		y: 80
	},
	a_camp: {
		x: 580,
		y: 220
	},
	a_retreat: {
		x: 700,
		y: 220
	},
	a_return: {
		x: 580,
		y: 360
	},
	a_gap: {
		x: 700,
		y: 360
	}
};
var TREE_W = 780;
var TREE_H = 440;
/** Rendered as the Passives tab inside the Throne Hall's skill tree. */
function PassiveTreeContent() {
	const { hero } = useGame();
	const [hovered, setHovered] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const scrollRef = (0, import_react.useRef)(null);
	if (!hero) return null;
	const posOf = (id) => GENERAL_POS[id] ?? CLASS_POS[id] ?? {
		x: 0,
		y: 0
	};
	const detailId = hovered ?? selected ?? "field_medicine";
	const detail = PASSIVES.find((p) => p.id === detailId) ?? PASSIVES[0];
	const rank = passiveRank(hero, detail.id);
	const reason = passiveBlocker(hero, detail.id);
	const edges = (0, import_react.useMemo)(() => {
		const list = [];
		for (const p of PASSIVES) {
			if (!p.prereq) continue;
			const from = posOf(p.prereq.id);
			const to = posOf(p.id);
			const active = passiveRank(hero, p.prereq.id) >= (p.prereq.rank ?? 1);
			list.push({
				from,
				to,
				active
			});
		}
		return list;
	}, [hero]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex flex-wrap items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-display text-lg",
			children: [
				"Insight: ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-gold",
					children: fmt(insightBank(hero))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-3 text-sm text-muted-foreground",
					children: [
						fmt(spentInsight(hero)),
						" spent · ",
						fmt(totalInsight(hero)),
						" earned"
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: "Earn Insight from level-ups, victories, quests & achievements. Ranks are permanent."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_280px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			className: "slot overflow-auto p-2",
			style: { maxHeight: "460px" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto",
				style: {
					width: TREE_W,
					height: TREE_H
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "absolute inset-0",
						width: TREE_W,
						height: TREE_H,
						style: { pointerEvents: "none" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: 520,
								y1: 20,
								x2: 520,
								y2: 420,
								stroke: "var(--border)",
								strokeWidth: 1,
								strokeDasharray: "4 6"
							}),
							[150, 290].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: 20,
								y1: y,
								x2: 760,
								y2: y,
								stroke: "var(--border)",
								strokeWidth: 1,
								strokeDasharray: "2 8",
								opacity: .4
							}, y)),
							edges.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: e.from.x,
								y1: e.from.y,
								x2: e.to.x,
								y2: e.to.y,
								stroke: e.active ? "var(--gold)" : "var(--muted-foreground)",
								strokeWidth: e.active ? 2.5 : 1.5,
								opacity: e.active ? .8 : .3,
								strokeDasharray: e.active ? "0" : "5 5"
							}, i))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute left-2 top-0 font-display text-sm text-gold/80",
						children: "General"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-2 top-0 font-display text-sm text-gold/80",
						children: CLASSES[hero.cls].name
					}),
					[
						1,
						2,
						3
					].map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute left-2 text-[10px] text-muted-foreground",
						style: { top: tier === 1 ? 55 : tier === 2 ? 195 : 335 },
						children: ["T", tier]
					}, tier)),
					PASSIVES.filter((p) => p.group === "general" || p.group === hero.cls).map((p) => {
						const pos = posOf(p.id);
						const r = passiveRank(hero, p.id);
						const blocker = passiveBlocker(hero, p.id);
						p.id;
						p.id;
						const maxed = r >= p.max;
						const locked = blocker && r === 0;
						const ready = !blocker && !maxed;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "absolute flex items-center justify-center rounded-full border-2 transition hover:scale-110 hover:z-10",
							style: {
								left: pos.x - NODE_R,
								top: pos.y - NODE_R,
								width: 56,
								height: 56,
								borderColor: maxed ? "var(--gold)" : ready ? "var(--r1)" : locked ? "var(--muted-foreground)" : "var(--r4)",
								background: r > 0 ? "color-mix(in srgb, var(--gold) 25%, var(--card))" : "var(--card)",
								boxShadow: ready ? "0 0 8px color-mix(in srgb, var(--gold) 40%, transparent)" : maxed ? "0 0 12px var(--gold)" : "none",
								opacity: locked ? .55 : 1,
								cursor: ready ? "pointer" : "default"
							},
							title: `${p.name}${r > 0 ? ` (${r}/${p.max})` : ""}`,
							onMouseEnter: () => setHovered(p.id),
							onMouseLeave: () => setHovered(null),
							onClick: () => setSelected(p.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5",
									children: Array.from({ length: p.max }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full",
										style: {
											width: 5,
											height: 5,
											background: i < r ? "var(--gold)" : "var(--muted-foreground)",
											opacity: i < r ? 1 : .3
										}
									}, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm font-bold",
									style: { color: maxed ? "var(--gold)" : r > 0 ? "var(--foreground)" : "var(--muted-foreground)" },
									children: p.tier
								}),
								ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute inset-0 animate-ping rounded-full",
									style: {
										border: "1px solid var(--gold)",
										opacity: .3,
										animationDuration: "2s"
									}
								})
							]
						}, p.id);
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "slot flex flex-col p-4",
			"aria-live": "polite",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg text-gold",
					children: detail.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 text-sm text-muted-foreground",
					children: [
						detail.group === "general" ? "General" : CLASSES[detail.group]?.name ?? detail.group,
						" · Tier ",
						detail.tier
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: detail.desc
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Per rank:"
							}),
							" ",
							effects(detail.fx, 1)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"Current (",
									rank,
									"):"
								]
							}),
							" ",
							effects(detail.fx, rank)
						] }),
						rank < detail.max && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"Next (",
									rank + 1,
									"):"
								]
							}),
							" ",
							effects(detail.fx, rank + 1)
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Rank ",
						rank,
						"/",
						detail.max,
						" · ",
						detail.cost,
						" Insight/rank"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-gold w-full px-4 py-2",
						disabled: !!reason,
						title: reason ?? `Spend ${detail.cost} Insight`,
						onClick: () => {
							update((h) => {
								const next = learnPassive(h, detail.id);
								h.passives = next.passives;
								h.insight = next.insight;
							});
						},
						children: reason ?? `Learn rank ${rank + 1} · ${detail.cost} Insight`
					})
				})
			]
		})]
	})] });
}
function ThroneHall({ onClose }) {
	const { hero } = useGame();
	const [tab, setTab] = (0, import_react.useState)("skills");
	if (!hero) return null;
	const s = heroStats(hero);
	const trees = TREES[hero.cls];
	const claimable = ACHIEVEMENTS.filter((a) => isClaimable(hero, a)).length;
	const rec = {
		...emptyRecord(),
		...hero.record ?? {}
	};
	const claim = (id) => update((h) => {
		const a = ACHIEVEMENTS.find((x) => x.id === id);
		if (!a || !isClaimable(h, a)) return;
		h.achClaimed = [...h.achClaimed ?? [], a.id];
		h.gold += a.gold;
		if (Math.random() < .25) h.bonusPts = (h.bonusPts ?? 0) + 1;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Throne Hall",
		onClose,
		wide: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
			label: "Throne Hall",
			value: tab,
			onChange: setTab,
			tabs: [
				{
					id: "skills",
					name: "Skill Tree"
				},
				{
					id: "passives",
					name: "Passives"
				},
				{
					id: "overview",
					name: "Progression"
				},
				{
					id: "ach",
					name: "Achievements",
					badge: claimable
				},
				{
					id: "history",
					name: "Battle History"
				}
			]
		}), tab === "ach" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 md:grid-cols-2",
			children: ACHIEVEMENTS.map((a) => {
				const p = achProgress(hero, a);
				const done = (hero.achClaimed ?? []).includes(a.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `slot p-3 ${done ? "opacity-70" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold",
								children: [
									a.name,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: ["· ", a.cat]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									a.desc,
									": ",
									fmt(p),
									" / ",
									fmt(a.goal)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: a.gold }), a.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-gold",
									children: ["Title: ", a.title]
								})]
							})
						] }), done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "h-5 w-5 text-gold",
							"aria-label": "Claimed"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "btn-gold flex items-center gap-1 px-3 py-1 text-sm",
							disabled: !isClaimable(hero, a),
							onClick: () => claim(a.id),
							title: isClaimable(hero, a) ? "Claim reward" : "Not completed yet",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" }), "Claim"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-1.5 overflow-hidden rounded bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-gold",
							style: { width: `${p / a.goal * 100}%` }
						})
					})]
				}, a.id);
			})
		}) : tab === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 grid grid-cols-3 gap-2 text-center text-sm md:grid-cols-6",
				children: [
					["Battles", rec.battles],
					["Wins", rec.wins],
					["Losses", rec.losses],
					["Bosses", rec.bosses],
					["Arena wins", rec.arenaWins],
					["Win rate", rec.battles ? `${Math.round(rec.wins / rec.battles * 100)}%` : "—"]
				].map(([l, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg text-gold",
						children: v
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: l
					})]
				}, l))
			}),
			(hero.history ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-muted-foreground",
				children: "No battles yet — head to the Campaign Gate."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: (hero.history ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot flex items-center justify-between gap-2 px-3 py-1.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: e.won ? "font-bold text-gold" : "font-bold text-blood",
							children: e.won ? "Victory" : "Defeat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex-1 truncate",
							children: [e.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "mr-1 inline h-4 w-4" }), e.title]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden truncate text-xs text-muted-foreground md:block",
							children: e.rewards.join(" · ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: new Date(e.t).toLocaleString()
						})
					]
				}, e.t))
			})
		] }) : tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-2xl",
						children: hero.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-muted-foreground",
						children: [
							CLASSES[hero.cls].name,
							" · Level ",
							hero.level,
							hero.paragon > 0 && ` · Ascension ${hero.paragon}`
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: [
							"XP ",
							fmt(hero.xp),
							" / ",
							fmt(xpToNext(hero))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: [
							"Campaign stage ",
							hero.stage,
							" · Conquest ",
							hero.spire,
							" · Wins ",
							hero.wins
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: ["Specialization: ", trees.find((t) => t.id === hero.spec)?.name ?? "none"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 font-display text-gold",
						children: ["Battle Rating ", fmt(s.power)]
					}),
					powerBreakdown(hero).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmt(p.power) })]
					}, p.label))
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 font-display",
					children: "Gear set bonuses"
				}),
				activeSets(hero.equipment).filter((x) => x.count >= 2).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted-foreground",
					children: "Equip 2+ pieces from the same family (e.g. two \"Bloodforged\" items) to activate bonuses."
				}),
				activeSets(hero.equipment).filter((x) => x.count >= 2).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot mb-1 px-3 py-1.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x.name }),
						" (",
						x.count,
						"/6): ",
						SET_BONUSES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: x.count >= b.pieces ? "text-gold" : "text-muted-foreground",
							children: [
								" ",
								b.pieces,
								"pc ",
								b.label,
								";"
							]
						}, b.pieces))
					]
				}, x.name)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 mt-4 font-display",
					children: "Abilities"
				}),
				heroSkills(hero).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot mb-1 px-3 py-1.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: k.name }),
						" — ",
						Math.round(k.mult * (k.hits ?? 1) * 100),
						"% dmg",
						k.hits ? ` (${k.hits} hits)` : "",
						", cooldown ",
						k.cd,
						k.heal ? `, heals ${Math.round(k.heal * 100)}%` : "",
						k.stun ? ", stuns" : "",
						k.crit ? ", always crits" : ""
					]
				}, k.id))
			] })]
		}) : tab === "passives" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassiveTreeContent, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillLoadout, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillTreeContent, {})] })]
	});
}
var MODIFIERS = [
	{
		id: "frenzy",
		name: "Frenzy",
		desc: "Enemies hit 25% harder",
		hp: 1,
		atk: 1.25,
		def: 1,
		crit: 0,
		reward: 1.2
	},
	{
		id: "bulwark",
		name: "Bulwark",
		desc: "Enemies have +40% defense",
		hp: 1,
		atk: 1,
		def: 1.4,
		crit: 0,
		reward: 1.15
	},
	{
		id: "titan",
		name: "Titanic",
		desc: "Enemies have +50% health",
		hp: 1.5,
		atk: 1,
		def: 1,
		crit: 0,
		reward: 1.25
	},
	{
		id: "deadly",
		name: "Deadly Precision",
		desc: "Enemies gain +15% crit",
		hp: 1,
		atk: 1,
		def: 1,
		crit: 15,
		reward: 1.15
	}
];
/** ISO-like week index (UTC, weeks start Monday). */
function weekIndex(now = Date.now()) {
	return Math.floor((Math.floor(now / 864e5) + 3) / 7);
}
var weeklyModifier = (week) => MODIFIERS[(week % MODIFIERS.length + MODIFIERS.length) % MODIFIERS.length];
var BOSS_ORDER = [
	"aegis",
	"gorefiend",
	"tenebris",
	"vulkan"
];
/** Highest difficulty cleared for a boss (0 = none). Next difficulty unlocks after clearing the previous one. */
var cleared = (h, id) => h.challenges?.[id] ?? 0;
var bossUnlocked = (h, i) => i === 0 || cleared(h, BOSS_ORDER[i - 1]) >= 1;
function challengeFoe(id, difficulty, mod) {
	const stage = 20 + BOSS_ORDER.indexOf(id) * 6 + difficulty * 8;
	const f = stageFoe(stage % 10 === 0 ? stage + 1 : stage, 1 + difficulty * .12);
	return {
		...f,
		name: `${TIER_BOSSES[id].name} · D${difficulty}`,
		boss: true,
		sprite: TIER_BOSSES[id].sprite,
		hp: Math.round(f.hp * 3.2 * mod.hp),
		atk: Math.round(f.atk * 1.3 * mod.atk),
		def: Math.round(f.def * 1.2 * mod.def),
		crit: Math.min(60, f.crit + mod.crit)
	};
}
function challengeRewards(id, difficulty, mod) {
	const i = BOSS_ORDER.indexOf(id);
	const m = mod.reward * (1 + i * .25);
	return {
		gold: Math.round(1500 * difficulty * difficulty * m),
		xp: Math.round(800 * difficulty * difficulty * m),
		bossCore: difficulty >= 3 ? Math.ceil(difficulty / 3) : 0,
		/** Minimum gear rarity from this clear: Legendary from D5, Mythic from D8. */
		minRarity: difficulty >= 8 ? 5 : difficulty >= 5 ? 4 : 3
	};
}
/** Elite: a random bestiary monster with an elite prefix, at the hero's level. */
var ELITE_PREFIX = [
	"Elite",
	"Enraged",
	"Ancient",
	"Corrupted"
];
function eliteFoe(level, rand = Math.random) {
	const row = Math.floor(rand() * BESTIARY.length), col = Math.floor(rand() * 12);
	return {
		...stageFoe(Math.max(11, level + 4) % 10 === 0 ? level + 5 : Math.max(11, level + 4), 1.6),
		boss: false,
		name: `${ELITE_PREFIX[Math.floor(rand() * ELITE_PREFIX.length)]} ${BESTIARY[row][col]}`,
		sprite: enemySprite(row, col)
	};
}
var WEEKLY_REWARD = {
	gold: 15e3,
	starshard: 20,
	bossCore: 3
};
/** Normalizes the weekly tracker to the current week (resets progress on a new week). */
function currentWeekly(h, now = Date.now()) {
	const w = weekIndex(now);
	return h.weekly && h.weekly.week === w ? h.weekly : {
		week: w,
		kills: 0,
		claimed: false
	};
}
function addWeeklyKill(h, now = Date.now()) {
	const cur = currentWeekly(h, now);
	h.weekly = {
		...cur,
		kills: cur.kills + 1
	};
}
function canClaimWeekly(h, now = Date.now()) {
	const cur = currentWeekly(h, now);
	return cur.kills >= 5 && !cur.claimed;
}
function Challenges({ onClose, start, onExpeditions }) {
	const { hero } = useGame();
	const [diff, setDiff] = (0, import_react.useState)({});
	if (!hero) return null;
	const lvl = hero.level + hero.paragon;
	const mod = weeklyModifier(weekIndex());
	const weekly = currentWeekly(hero);
	const power = heroStats(hero).power;
	if (hero.level < 20) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Dungeon Gate",
		onClose,
		children: [onExpeditions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "w-full",
			onClick: onExpeditions,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {}), "Material expeditions · Level 1+"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "py-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto mb-2 h-10 w-10 text-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl text-gold",
					children: "Locked"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						"Boss challenges open at level ",
						20,
						". You are level ",
						hero.level,
						"."
					]
				})
			]
		})]
	});
	const fightBoss = (i) => {
		const id = BOSS_ORDER[i];
		const d = Math.min(diff[id] ?? cleared(hero, id) + 1, Math.min(10, cleared(hero, id) + 1));
		const foe = challengeFoe(id, d, mod);
		const rw = challengeRewards(id, d, mod);
		start({
			title: `Boss Challenge · ${TIER_BOSSES[id].name} · Difficulty ${d}`,
			right: foe,
			onResult: async (won, xpMultiplier = 1) => {
				if (!won) return { lines: ["The boss stands victorious. Grow stronger."] };
				const { grant, addLoot, makeDrop } = await import("./logic-WJE4Izgx.mjs");
				let lines = [];
				let loot = null;
				update((h) => {
					const { levels } = grant(h, scrollXp(rw.xp, xpMultiplier), rw.gold);
					h.challenges = {
						...h.challenges ?? {},
						[id]: Math.max(cleared(h, id), d)
					};
					if (rw.bossCore) addMats(h, { bossCore: rw.bossCore });
					addWeeklyKill(h);
					loot = makeDrop(h.cls, h.level + Math.floor(h.paragon / 2) + d * 2, rw.minRarity);
					loot.name = `${TIER_BOSSES[id].name.split(",")[0]}'s ${loot.name.split(" ").slice(1).join(" ")}`;
					const full = h.inventory.length >= invCap(h);
					addLoot(h, loot);
					if (full) lines.push("Bag full — gear placed in your Overflow Chest (Armory)");
					lines = [
						...lines,
						`+${fmt(scrollXp(rw.xp, xpMultiplier))} XP`,
						`+${fmt(rw.gold)} gold`,
						...rw.bossCore ? [`+${rw.bossCore} Boss Core`] : [],
						...levels ? [`LEVEL UP ×${levels}!`] : []
					];
				});
				return {
					lines,
					loot
				};
			}
		});
	};
	const fightElite = () => {
		const foe = eliteFoe(lvl);
		start({
			title: `Elite Hunt · ${foe.name}`,
			right: foe,
			onResult: async (won, xpMultiplier = 1) => {
				if (!won) return { lines: ["The elite escaped…"] };
				const { grant, rollLoot, addLoot } = await import("./logic-WJE4Izgx.mjs");
				let lines = [];
				let loot = null;
				update((h) => {
					const { levels } = grant(h, scrollXp(lvl * 60, xpMultiplier), lvl * 40);
					loot = rollLoot(h, lvl + 5, .8, 2);
					if (loot) addLoot(h, loot);
					addMats(h, { essence: 2 });
					lines = [
						`+${fmt(scrollXp(lvl * 60, xpMultiplier))} XP`,
						`+${fmt(lvl * 40)} gold`,
						"+2 Soul Essence",
						...levels ? [`LEVEL UP ×${levels}!`] : []
					];
				});
				return {
					lines,
					loot
				};
			}
		});
	};
	const claimWeekly = () => update((h) => {
		if (!canClaimWeekly(h)) return;
		h.weekly = {
			...currentWeekly(h),
			claimed: true
		};
		h.gold += WEEKLY_REWARD.gold;
		addMats(h, {
			starshard: WEEKLY_REWARD.starshard,
			bossCore: WEEKLY_REWARD.bossCore
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Dungeon Gate · Challenges",
		onClose,
		wide: true,
		children: [
			onExpeditions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mb-4 w-full",
				onClick: onExpeditions,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {}), "Material expeditions"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-2 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display text-gold",
						children: ["This week's modifier: ", mod.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-muted-foreground",
						children: [
							mod.desc,
							" · rewards ×",
							mod.reward
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot flex items-center justify-between gap-2 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-gold",
							children: "Weekly objective"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-muted-foreground",
							children: [
								"Defeat ",
								5,
								" challenge bosses: ",
								Math.min(weekly.kills, 5),
								"/",
								5
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: WEEKLY_REWARD.gold }),
								" + ",
								WEEKLY_REWARD.starshard,
								" Starshards + ",
								WEEKLY_REWARD.bossCore,
								" Boss Cores · resets Monday 00:00 UTC"
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold px-3 py-1.5",
						disabled: !canClaimWeekly(hero),
						onClick: claimWeekly,
						children: weekly.claimed ? "Claimed" : "Claim"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: BOSS_ORDER.map((id, i) => {
					const unlocked = bossUnlocked(hero, i);
					const c = cleared(hero, id);
					const max = Math.min(10, c + 1);
					const d = Math.min(diff[id] ?? max, max);
					const foe = challengeFoe(id, d, mod);
					const ratio = power / Math.max(1, foe.atk * 2 + foe.def * 1.5 + foe.hp * .2);
					const rw = challengeRewards(id, d, mod);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `slot p-3 ${unlocked ? "" : "opacity-60"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
								rect: TIER_BOSSES[id].sprite,
								className: "h-24 w-24 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-lg",
										children: TIER_BOSSES[id].name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											"Best clear: ",
											c ? `Difficulty ${c}` : "none",
											c >= 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "ml-1 inline h-3 w-3 text-gold" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 flex flex-wrap gap-1",
										children: Array.from({ length: max }, (_, k) => k + 1).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: `px-2 py-0.5 text-xs ${d === k ? "btn-gold" : "btn-ghost"}`,
											onClick: () => setDiff({
												...diff,
												[id]: k
											}),
											children: ["D", k]
										}, k))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 text-xs",
										children: [
											"HP ",
											fmt(foe.hp),
											" · ATK ",
											fmt(foe.atk),
											" · ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: ratio > 1.1 ? "text-r1" : ratio > .8 ? "text-r4" : "text-blood",
												children: ratio > 1.1 ? "Fair" : ratio > .8 ? "Hard" : "Deadly"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: rw.gold }),
											" · ",
											fmt(rw.xp),
											" XP",
											rw.bossCore ? ` · ${rw.bossCore} Boss Core` : "",
											" · ",
											[
												"",
												"",
												"",
												"Epic",
												"Legendary",
												"Mythic"
											][rw.minRarity],
											"+ gear"
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-blood mt-2 w-full py-1.5",
							disabled: !unlocked,
							title: unlocked ? "" : "Defeat the previous boss first",
							onClick: () => fightBoss(i),
							children: unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "mr-1 inline h-4 w-4" }),
								"Challenge D",
								d
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 inline h-4 w-4" }), "Defeat the previous boss"] })
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "slot mt-4 flex items-center justify-between gap-2 p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-gold",
					children: "Elite Hunt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted-foreground",
					children: "Tough elite monsters at your level. High loot chance and Soul Essence. Repeatable."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-gold px-4 py-1.5",
					onClick: fightElite,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "mr-1 inline h-4 w-4" }), "Hunt"]
				})]
			})
		]
	});
}
/** Ten stages per region; after these twelve, new circuits raise all level bands by 120. */
var ROAD_REGIONS = [
	{
		name: "Ashen March",
		row: 0,
		level: 91,
		color: "#d88950"
	},
	{
		name: "Widowroot Expanse",
		row: 0,
		level: 101,
		color: "#77ad68"
	},
	{
		name: "Gravesong Coast",
		row: 1,
		level: 111,
		color: "#9aa8ce"
	},
	{
		name: "Pale Sovereignty",
		row: 1,
		level: 121,
		color: "#b89cdd"
	},
	{
		name: "Obsidian Stair",
		row: 2,
		level: 131,
		color: "#d6a06c"
	},
	{
		name: "Rimefire Reach",
		row: 2,
		level: 141,
		color: "#80cddd"
	},
	{
		name: "Veil of Knives",
		row: 3,
		level: 151,
		color: "#cf85ac"
	},
	{
		name: "Chaos Meridian",
		row: 3,
		level: 161,
		color: "#a58ae0"
	},
	{
		name: "Titan Ossuary",
		row: 4,
		level: 171,
		color: "#c5b495"
	},
	{
		name: "Wyrmglass Sea",
		row: 4,
		level: 181,
		color: "#68bfc5"
	},
	{
		name: "Infernal Horizon",
		row: 3,
		level: 191,
		color: "#e38467"
	},
	{
		name: "Last Ember Beyond",
		row: 4,
		level: 201,
		color: "#e3bc59"
	}
];
var integer = (n, min) => {
	if (!Number.isSafeInteger(n) || n < min) throw new RangeError(`Expected integer >= ${min}`);
	return n;
};
function roadRegion(stage) {
	const offset = integer(stage, 91) - 91;
	const circuit = Math.floor(offset / 120);
	const region = ROAD_REGIONS[Math.floor(offset / 10) % 12] ?? ROAD_REGIONS[0];
	return {
		...region,
		circuit: circuit + 1,
		minLevel: region.level + circuit * 120,
		maxLevel: region.level + circuit * 120 + 9
	};
}
/** Polynomial scaling avoids the campaign's exponential wall; each circuit remains harder indefinitely. */
function roadFoe(stage) {
	const r = roadRegion(stage);
	const offset = stage - 91;
	const boss = stage % 10 === 0;
	const elite = stage % 10 === 5;
	const scale = (1 + offset / 40) ** 2 * (boss ? 2 : elite ? 1.3 : 1);
	const roster = boss ? BOSS_ROSTER : ENEMY_ROSTER;
	const entry = roster[(boss ? Math.floor((stage - 100) / 10) : offset) % roster.length];
	if (!entry) throw new Error("The encounter roster is empty");
	const ability = [
		"Cinder Strike",
		"Soul Siphon",
		"Shattering Blow",
		"Chaos Precision",
		"Wyrm Fury"
	][r.row] ?? "Cinder Strike";
	return {
		name: `${elite ? "Elite " : ""}${entry.name}`,
		img: ENEMIES.demon.img,
		rosterId: entry.id,
		level: stage,
		hp: Math.round(9e7 * scale),
		atk: Math.round(8e5 * scale),
		def: Math.round(3e5 * scale),
		crit: Math.min(40, 15 + offset / 20),
		dodge: Math.min(20, 5 + offset / 40),
		boss,
		elite,
		sprite: entry.sprite,
		ability,
		skills: [{
			id: "road-hit",
			name: "Attack",
			mult: 1,
			cd: 0,
			icon: "sword"
		}, {
			id: `road-${r.row}`,
			name: ability,
			mult: 1.5 + r.row * .1,
			cd: 3,
			icon: "flame",
			...r.row === 1 ? { heal: .1 } : {}
		}]
	};
}
function spireCircuit(wave) {
	integer(wave, 1);
	return {
		circuit: Math.floor((wave - 1) / 100) + 1,
		floor: (wave - 1) % 100 + 1
	};
}
/** Rotate encounters using the saved wave. Each circuit advances the base level band;
* the existing within-circuit multipliers remain bounded without a permanent plateau. */
function spireWave(foeLevel, wave) {
	const { circuit, floor } = spireCircuit(wave);
	const f = roadFoe(integer(foeLevel, 91) + (circuit - 1) * 120 + floor - 1);
	return {
		...f,
		name: `Spire ${wave} · ${f.name}`,
		hp: Math.round(f.hp * Math.min(8, 1 + (wave - 1) * .08)),
		atk: Math.round(f.atk * Math.min(4, 1 + (wave - 1) * .04)),
		def: Math.round(f.def * Math.min(3, 1 + (wave - 1) * .02))
	};
}
function roadRewards(stage, firstClear) {
	integer(stage, 91);
	const n = stage - 90;
	return {
		gold: firstClear ? 5e3 + n * 250 : 0,
		xp: firstClear ? 1e4 + n * 500 : 0,
		materials: firstClear ? {
			ore: 10 + n,
			fragment: stage % 10 === 0 ? 5 : 1,
			...stage % 10 === 0 ? { bossCore: 1 } : {}
		} : {},
		items: firstClear && stage % 10 === 0 ? 1 : 0,
		itemLevel: stage,
		rarity: 2,
		firstClear
	};
}
function spireRewards(wave, firstClear = true) {
	integer(wave, 1);
	return {
		gold: firstClear ? 2e3 + wave * 200 : 0,
		xp: firstClear ? 4e3 + wave * 400 : 0,
		materials: firstClear ? {
			essence: 1 + Math.floor(wave / 10),
			...wave % 10 === 0 ? { starshard: 3 } : {}
		} : {},
		items: 0,
		itemLevel: 90 + wave,
		rarity: 0,
		firstClear
	};
}
/** UTC midnight daily; Monday 00:00 UTC weekly. Accept timestamps/Date, or a week index. */
var mod = (n, length) => (n % length + length) % length;
var dayIndex = (date) => Math.floor(Number(date) / 864e5);
var roadWeekIndex = (date) => Math.floor((dayIndex(date) + 3) / 7);
var dailyRoad = (date) => ROAD_REGIONS[mod(dayIndex(date), ROAD_REGIONS.length)] ?? ROAD_REGIONS[0];
var weeklyRoad = (week) => ROAD_REGIONS[mod(integer(week, 0), ROAD_REGIONS.length)] ?? ROAD_REGIONS[0];
var roadState = (h) => h.road ?? {
	stage: 91,
	wave: 1,
	best: 0,
	cleared: 90
};
var canEnterRoad = (h) => h.stage > CAMPAIGN_STAGES;
var canEnterSpire = (h) => canEnterRoad(h) && roadState(h).cleared >= 91;
/** Atomic, immutable payout + high-water marks: out-of-order and replay callbacks pay nothing. */
function recordRoadClear(hero, clear) {
	const s = roadState(hero);
	const road = clear.mode === "road";
	if (!(road ? canEnterRoad(hero) : canEnterSpire(hero)) || clear.value !== (road ? s.stage : s.wave) || clear.value <= (road ? s.cleared : s.best)) return hero;
	const rw = road ? roadRewards(clear.value, true) : spireRewards(clear.value);
	const mats = { ...hero.mats };
	const overflow = [...hero.overflow ?? []];
	const h = {
		...hero,
		inventory: [...hero.inventory],
		overflow,
		mats,
		road: { ...s }
	};
	h.gold += rw.gold;
	h.xp += Math.round(rw.xp * (clear.xpMultiplier === 1.2 ? 1.2 : 1));
	while (h.xp >= xpToNext(h)) {
		h.xp -= xpToNext(h);
		if (h.level < 80) h.level++;
		else h.paragon++;
		h.insight = (h.insight ?? 0) + 1;
	}
	for (const [mat, count] of Object.entries(rw.materials)) mats[mat] = (mats[mat] ?? 0) + count;
	if (road) h.road = {
		...s,
		stage: clear.value + 1,
		cleared: clear.value
	};
	else h.road = {
		...s,
		wave: clear.value + 1,
		best: clear.value
	};
	if (rw.items) {
		const item = {
			id: `longroad-${clear.value}-${hero.cls}`,
			cls: hero.cls,
			slot: "weapon",
			name: `Roadwarden's Trophy ${clear.value}`,
			ilvl: rw.itemLevel,
			rarity: rw.rarity,
			icon: 0,
			enh: 0
		};
		if (h.inventory.length >= invCap(h)) overflow.unshift(item);
		else h.inventory.unshift(item);
	}
	return h;
}
function LongRoad({ onClose, start }) {
	const { hero } = useGame();
	if (!hero) return null;
	const state = roadState(hero);
	const region = roadRegion(state.stage);
	const now = Date.now();
	const fight = (mode) => {
		if (!(mode === "road" ? canEnterRoad(hero) : canEnterSpire(hero))) return;
		const value = mode === "road" ? state.stage : state.wave;
		const foe = mode === "road" ? roadFoe(value) : spireWave(Math.max(91, state.cleared), value);
		start({
			title: `${mode === "road" ? "Long Road" : "Infinite Spire"} · ${value}`,
			right: foe,
			onResult: (won, xpMultiplier = 1) => {
				if (!won) return { lines: ["The path remains. No progression lost."] };
				let lines = ["Already recorded — no duplicate rewards."];
				update((h) => {
					const next = recordRoadClear(h, {
						mode,
						value,
						xpMultiplier
					});
					if (next === h) return;
					const rw = mode === "road" ? roadRewards(value, true) : spireRewards(value);
					lines = [
						`+${fmt(rw.gold)} gold`,
						`+${fmt(Math.round(rw.xp * (xpMultiplier === 1.2 ? 1.2 : 1)))} XP`,
						...matsLine(rw.materials),
						...rw.items ? ["Roadwarden weapon delivered to bag or Overflow Chest."] : []
					];
					Object.assign(h, next);
				});
				return { lines };
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "The Long Road · Unending Endgame",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-sm text-muted-foreground",
				children: [
					"Daily destination: ",
					dailyRoad(now).name,
					" · Weekly destination: ",
					weeklyRoad(roadWeekIndex(now)).name,
					". UTC midnight / Monday rotations; destinations are guides, not bonus payouts."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-4 overflow-hidden border-y border-border px-4 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: world_map_default,
						alt: "The lands beyond the Ember Fall campaign",
						className: "absolute inset-0 h-full w-full object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background/80" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative font-display text-xl text-gold",
						children: [
							region.name,
							" · Circuit ",
							region.circuit
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "relative",
						children: [
							"Level band ",
							region.minLevel,
							"–",
							region.maxLevel,
							" · Road stage ",
							state.stage,
							" · Cleared through ",
							state.cleared
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "relative mt-2 text-sm text-muted-foreground",
						children: [
							"Spire circuit ",
							spireCircuit(state.wave).circuit,
							" · Floor ",
							spireCircuit(state.wave).floor,
							"/100"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: ["road", "spire"].map((mode) => {
					const value = mode === "road" ? state.stage : state.wave;
					const allowed = mode === "road" ? canEnterRoad(hero) : canEnterSpire(hero);
					const foe = mode === "road" ? roadFoe(value) : spireWave(Math.max(91, state.cleared), value);
					const rw = mode === "road" ? roadRewards(value, value > state.cleared) : spireRewards(value, value > state.best);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "slot p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg text-gold",
								children: mode === "road" ? "The Long Road" : "Infinite Spire"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: mode === "road" ? `Stage ${value}` : `Wave ${value} · Best ${state.best}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
								rect: foe.sprite,
								className: "mx-auto h-36 w-36"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								foe.name,
								" · Lv ",
								foe.level
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									"HP ",
									fmt(foe.hp),
									" · ATK ",
									fmt(foe.atk),
									" · DEF ",
									fmt(foe.def),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									foe.ability
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: rw.gold }),
									" · ",
									fmt(rw.xp),
									" XP",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									matsLine(rw.materials).join(" · "),
									rw.items > 0 && ` · ${rw.items} Rare weapon`
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "w-full whitespace-normal",
								disabled: !allowed,
								onClick: () => fight(mode),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {}), allowed ? `Fight ${mode === "road" ? "stage" : "wave"} ${value}` : mode === "road" ? "Clear the campaign to enter" : "Clear road stage 91 to enter"]
							})
						]
					}, mode);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 border-t border-border pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg text-gold",
					children: "Next road milestones"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-3",
					children: Array.from({ length: 3 }, (_, i) => Math.ceil(state.stage / 10) * 10 + i * 10).map((stage) => {
						const boss = roadFoe(stage);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprite, {
								rect: boss.sprite,
								className: "w-14 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-gold",
										children: ["Stage ", stage]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "break-words",
										children: boss.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted-foreground",
										children: "Rare weapon · Boss Core"
									})
								]
							})]
						}, stage);
					})
				})]
			})
		]
	});
}
var modal = "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4";
/** Effects a gem type has beyond its raw number: defensive and utility gems change how a fight plays out. */
var NOTABLE = {
	onyx: "Block: flat chance to shrug off a hit.",
	opal: "Dodge: chance to avoid a hit entirely.",
	pearl: "Healing power: strengthens heals and life-steal.",
	obsidian: "Armour pen: cuts through enemy defence.",
	moonstone: "Magic pen: cuts through enemy magic defence.",
	peridot: "Accuracy: helps land hits on high-dodge foes."
};
/** Pick one of the gems you own for one socket. */
function GemPicker({ hero, socket, onPick, onCut, onClose }) {
	const owned = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: modal,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Insert a gem",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-panel anim-pop max-h-[85vh] w-full max-w-lg overflow-y-auto p-4",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-lg text-gold",
					children: ["Insert a gem · socket ", socket + 1]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-ghost px-2 py-1",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), owned.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-muted-foreground",
					children: "You have no gems in your pouch yet. Cut one from Ember Ore first."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-gold px-4 py-2",
					onClick: onCut,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "mr-1 inline h-4 w-4" }), "Open gem cutting"]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [owned.map(([key, n]) => {
					const g = parseGem(key);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "slot flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
						onClick: () => onPick(key),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, { type: g.type }),
							" ",
							gemName(key),
							" ×",
							n,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-xs text-muted-foreground",
								children: [
									"+",
									gemValue(key),
									" ",
									STAT_LABEL[GEMS[g.type].stat],
									" · best on ",
									GEMS[g.type].classes,
									NOTABLE[g.type] ? " · " + NOTABLE[g.type] : ""
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "btn-ghost px-2 py-0.5 text-xs",
							children: "Insert"
						})]
					}, key);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-ghost mt-2 w-full py-1.5 text-xs",
					onClick: onCut,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "mr-1 inline h-3 w-3" }), "Cut another gem"]
				})]
			})]
		})
	});
}
/** Shows what a cut will produce — stats and side effects — before any ore or gold is spent. */
function GemCutWindow({ hero, onClose, onCut }) {
	const [choice, setChoice] = (0, import_react.useState)("random");
	const target = choice === "random" ? void 0 : choice;
	const cost = gemCutCost(hero.level, target);
	const afford = matCount(hero, "ore") >= cost.ore && hero.gold >= cost.gold && matCount(hero, "essence") >= cost.essence;
	const shown = target ? [target] : GEM_TYPES;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: modal,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Gem cutting",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-panel anim-pop max-h-[85vh] w-full max-w-2xl overflow-y-auto p-4",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg text-gold",
						children: "Cut a gem"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-ghost px-2 py-1",
						onClick: onClose,
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-sm text-muted-foreground",
					children: [
						"A cut always gives a ",
						GEM_TIER_NAMES[0],
						" tier-1 gem. Fuse ",
						3,
						" identical gems to reach the next tier; each tier multiplies the bonus, up to ",
						GEM_TIER_NAMES[4],
						" ×",
						5,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "px-3 py-1.5 text-sm " + (choice === "random" ? "btn-gold" : "btn-ghost"),
						onClick: () => setChoice("random"),
						children: "Random gem"
					}), GEM_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "px-3 py-1.5 text-sm " + (choice === t ? "btn-gold" : "btn-ghost"),
						onClick: () => setChoice(t),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, { type: t }),
							" ",
							GEMS[t].name
						]
					}, t))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "slot px-2 py-1",
							children: target ? "Chosen cut" : "Random cut"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "slot px-2 py-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
									mat: "ore",
									size: 16
								}),
								" ",
								cost.ore,
								" Ember Ore"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "slot px-2 py-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: cost.gold })
						}),
						cost.essence > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "slot px-2 py-1",
							children: [cost.essence, " Soul Essence"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: shown.map((t) => {
						const g = GEMS[t];
						const one = gemKey(t, 1);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "slot flex items-start gap-3 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, {
									type: t,
									size: 32
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-gold",
										children: gemName(one)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"+",
										gemValue(one),
										" ",
										STAT_LABEL[g.stat],
										" per socketed gem"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											"Best on ",
											g.classes,
											NOTABLE[t] ? " · " + NOTABLE[t] : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											"At tier ",
											5,
											": +",
											+(g.per * 5 * 5).toFixed(1),
											" ",
											STAT_LABEL[g.stat]
										]
									})
								]
							})]
						}, t);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "btn-gold flex-1 py-2",
						disabled: !afford,
						onClick: () => onCut(target),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "mr-1 inline h-4 w-4" }), target ? "Cut a " + GEM_TIER_NAMES[0] + " " + GEMS[target].name : "Cut a random gem"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-ghost px-4 py-2",
						onClick: onClose,
						children: "Cancel"
					})]
				}),
				!afford && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-xs text-hp",
					children: "Not enough Ember Ore, gold or essence for this cut."
				})
			]
		})
	});
}
function MatsBar() {
	const { hero } = useGame();
	if (!hero) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex flex-wrap gap-2 text-sm",
		children: [Object.keys(MATS).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "slot px-2 py-1",
			title: MATS[m].desc,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, { mat: m }),
				" ",
				MATS[m].name,
				": ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
					className: "text-gold",
					children: fmt(matCount(hero, m))
				})
			]
		}, m)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "slot px-2 py-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: hero.gold })
		})]
	});
}
function useToast() {
	const [msg, setMsg] = (0, import_react.useState)(null);
	return [msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`,
		children: msg.t
	}), (ok, t) => setMsg({
		ok,
		t
	})];
}
function GemWorkshop({ onClose }) {
	const { hero } = useGame();
	const [selId, setSelId] = (0, import_react.useState)(null);
	const [pick, setPick] = (0, import_react.useState)(null);
	const [cutOpen, setCutOpen] = (0, import_react.useState)(false);
	const [toast, say] = useToast();
	if (!hero) return null;
	const gear = [...WEAR_SLOTS.map((s) => hero.equipment[s]).filter(Boolean), ...hero.inventory].filter((i) => socketCount(i) > 0);
	const sel = gear.find((i) => i.id === selId);
	const owned = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort();
	const act = (fn) => update(fn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Gem Workshop",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatsBar, {}),
			toast,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 font-display",
							children: "Socketed gear"
						}),
						gear.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Uncommon or better gear has sockets (Epic: 2, Mythic: 3)."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-96 space-y-1 overflow-y-auto",
							children: gear.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSelId(it.id),
								className: `slot w-full px-2 py-1.5 text-left text-sm ${selId === it.id ? "ring-2 ring-gold" : ""}`,
								style: { borderColor: `var(--r${it.rarity})` },
								children: [
									it.name,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											sockets(it).filter(Boolean).length,
											"/",
											socketCount(it)
										]
									})
								]
							}, it.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: sel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, { item: sel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2",
						children: sockets(sel).map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "slot flex items-center justify-between gap-2 px-3 py-2 text-sm",
							children: [g ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, { type: parseGem(g).type }),
								gemName(g),
								" (+",
								gemValue(g),
								" ",
								STAT_LABEL[GEMS[parseGem(g).type].stat],
								")"
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["Empty socket ", i + 1]
							}), g ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "btn-ghost px-2 py-0.5 text-xs",
								onClick: () => act((h) => {
									const e = removeGem(h, sel.id, i);
									say(!e, e ?? "Gem removed");
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "inline h-3 w-3" }), " Remove"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "btn-ghost px-2 py-0.5 text-xs",
								onClick: () => setPick(i),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "inline h-3 w-3" }), " Insert gem"]
							})]
						}, i))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-16 text-center text-muted-foreground",
						children: "Pick a piece of gear to socket"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between font-display",
							children: ["Your gems", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => setCutOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "h-4 w-4" }), "Cut a gem"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs text-muted-foreground",
							children: "Cutting opens a window that shows exactly what the gem will do before you spend anything."
						}),
						owned.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No gems yet. Cut some from Ember Ore."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: owned.map(([k, n]) => {
								const g = parseGem(k);
								const free = sel ? sockets(sel).findIndex((x) => !x) : -1;
								const fc = fuseCost(g.tier, hero.level);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "slot flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemIcon, { type: g.type }),
										gemName(k),
										" ×",
										n,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs text-muted-foreground",
											children: [
												"+",
												gemValue(k),
												" ",
												STAT_LABEL[GEMS[g.type].stat]
											]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn-ghost px-2 py-0.5 text-xs",
											disabled: free < 0,
											title: !sel ? "Select gear first" : free < 0 ? "No empty socket" : "Insert",
											onClick: () => sel && act((h) => {
												const e = insertGem(h, sel.id, free, k);
												say(!e, e ?? "Gem socketed");
											}),
											children: "Insert"
										}), g.tier < 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: "btn-ghost px-2 py-0.5 text-xs",
											disabled: n < 3,
											title: `Fuse 3 → 1 higher tier · ${fmt(fc.gold)} gold + ${fc.essence} essence`,
											onClick: () => act((h) => {
												const e = fuseGem(h, k);
												say(!e, e ?? "Fusion complete!");
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "inline h-3 w-3" }), "Fuse"]
										})]
									})]
								}, k);
							})
						})
					] })
				]
			}),
			pick !== null && sel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemPicker, {
				hero,
				socket: pick,
				onClose: () => setPick(null),
				onCut: () => {
					setPick(null);
					setCutOpen(true);
				},
				onPick: (key) => act((h) => {
					const e = insertGem(h, sel.id, pick, key);
					say(!e, e ?? "Gem socketed");
					setPick(null);
				})
			}),
			cutOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemCutWindow, {
				hero,
				onClose: () => setCutOpen(false),
				onCut: (type) => act((h) => {
					const k = cutGem(h, Math.random, type);
					say(!!k && k.includes(":"), k && k.includes(":") ? `Cut a ${gemName(k)}!` : k ?? "");
					setCutOpen(false);
				})
			})
		]
	});
}
function MagicTower({ onClose }) {
	const { hero, gender } = useGame();
	const [toast, say] = useToast();
	const [picking, setPicking] = (0, import_react.useState)(null);
	if (!hero) return null;
	const list = hero.astrals ?? [];
	const slots = Array.from({ length: 8 }, (_, i) => hero.astralSlots?.[i] ?? null);
	const equipped = slots.filter(Boolean).length;
	const species = new Set(list.map((a) => a.base)).size;
	const seat = (id, slot) => update((h) => {
		const e = equipAstral(h, id, slot);
		say(!e, e ?? "Astral seated");
	});
	const label = (a) => `${ASTRAL_RARITY[a.rarity]} ${ASTRAL_BASES[a.base].name} Lv${a.lvl}`;
	const fx = (a) => `+${astralValue(a)} ${STAT_LABEL[ASTRAL_BASES[a.base].stat]}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Magic Tower",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatsBar, {}),
			toast,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display",
					children: [
						"Seated: ",
						equipped,
						"/",
						8
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted-foreground",
					children: [
						"Level ",
						hero.level,
						" · 3 slots open from the start, the rest wake every 10 levels"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto mb-1 h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterModel, {
						cls: hero.cls,
						gender,
						chest: hero.equipment.armour,
						weapon: hero.equipment.weapon,
						className: "h-full w-full"
					})
				}), ASTRAL_SLOT_LEVELS.map((lv, i) => {
					const ang = i / 8 * Math.PI * 2 - Math.PI / 2;
					const style = {
						left: `calc(50% + ${Math.round(Math.cos(ang) * 118)}px)`,
						top: `calc(50% + ${Math.round(Math.sin(ang) * 118)}px)`
					};
					const a = slots[i] ? list.find((x) => x.id === slots[i]) : void 0;
					if (hero.level < lv) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style,
						title: `Wakes at level ${lv}`,
						className: "absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-border/60 bg-background/70 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[9px] leading-tight text-muted-foreground",
							children: ["Lv ", lv]
						})]
					}, i);
					if (a) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						style,
						title: `${label(a)} · ${fx(a)} · click to unseat`,
						onClick: () => update((h) => {
							equipAstral(h, null, i);
						}),
						className: "absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-border bg-background/80 p-1 hover:scale-105",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AstralIcon, {
							base: a.base,
							rarity: a.rarity,
							size: 34
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-full truncate text-[8px] leading-none",
							children: ASTRAL_BASES[a.base].name
						})]
					}, i);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						style,
						title: `Astral slot ${i + 1}`,
						onClick: () => setPicking(i),
						className: "absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-border bg-background/40 text-muted-foreground hover:border-gold hover:text-gold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
					}, i);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-center text-xs text-muted-foreground",
				children: "Click an open slot to seat an Astral beside your hero. Click a seated Astral to send it back."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn-gold flex items-center gap-1 px-4 py-2",
					disabled: matCount(hero, "starshard") < 10,
					onClick: () => update((h) => {
						const r = summonAstral(h);
						say(typeof r !== "string", typeof r === "string" ? r : `Summoned ${label(r)}!`);
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }),
						"Summon (",
						10,
						" Starshards)"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted-foreground",
					children: [
						"Collection: ",
						species,
						"/",
						Object.keys(ASTRAL_BASES).length,
						" species",
						ASTRAL_MILESTONES.map((m) => {
							const key = `astral_${m.n}`;
							const got = (hero.achClaimed ?? []).includes(key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost ml-2 px-2 py-0.5 text-xs",
								disabled: got || species < m.n,
								onClick: () => update((h) => {
									if (new Set((h.astrals ?? []).map((a) => a.base)).size >= m.n && !(h.achClaimed ?? []).includes(key)) {
										h.achClaimed = [...h.achClaimed ?? [], key];
										h.gold += m.gold;
									}
								}),
								children: got ? `✓ ${m.n} species` : `${m.n} species: ${fmt(m.gold)} gold`
							}, key);
						})
					]
				})]
			}),
			list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-6 text-center text-muted-foreground",
				children: "No Astrals yet. Starshards drop from battles and bosses."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 md:grid-cols-2",
				children: list.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "slot flex items-center justify-between gap-2 p-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AstralIcon, {
							base: a.base,
							rarity: a.rarity,
							size: 36
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label(a) }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["· ", ASTRAL_BASES[a.base].kind]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs",
									children: fx(a)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted-foreground",
									children: ASTRAL_BASES[a.base].power
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex flex-wrap gap-1",
						children: [
							!slots.includes(a.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost px-2 py-0.5 text-xs",
								onClick: () => {
									const free = slots.findIndex((x, i) => !x && hero.level >= ASTRAL_SLOT_LEVELS[i]);
									if (free < 0) {
										say(false, "No open slot - level up to wake more");
										return;
									}
									seat(a.id, free);
								},
								children: "Seat"
							}),
							list.some((f) => f.id !== a.id && f.base === a.base) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: a.lvl >= 20 || !list.some((f) => f.id !== a.id && f.base === a.base && !slots.includes(f.id)),
								onClick: () => update((h) => {
									const food = h.astrals?.find((f) => f.id !== a.id && f.base === a.base && !(h.astralSlots ?? []).includes(f.id));
									if (!food) return;
									const err = absorbAstral(h, a.id, food.id);
									say(!err, err ?? "Duplicate absorbed");
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), "Absorb duplicate"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "btn-ghost px-2 py-0.5 text-xs",
								disabled: a.lvl >= 20 || matCount(hero, "starshard") < astralUpgradeCost(a),
								title: `Upgrade: ${astralUpgradeCost(a)} Starshards`,
								onClick: () => update((h) => {
									const e = upgradeAstral(h, a.id);
									say(!e, e ?? "Astral upgraded");
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "inline h-3 w-3" }), astralUpgradeCost(a)]
							})
						]
					})]
				}, a.id))
			}),
			picking !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4",
				onClick: () => setPicking(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "game-panel anim-pop max-h-[80vh] w-full max-w-md overflow-y-auto p-4",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-display text-lg text-gold",
							children: ["Seat an Astral · slot ", picking + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-ghost px-2 py-1",
							onClick: () => setPicking(null),
							"aria-label": "Close",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}), list.filter((x) => !slots.includes(x.id)).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: "Every Astral you own is already seated. Unseat one or summon more."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: list.filter((x) => !slots.includes(x.id)).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "slot flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
							onClick: () => {
								seat(x.id, picking);
								setPicking(null);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AstralIcon, {
								base: x.base,
								rarity: x.rarity,
								size: 36
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [label(x), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-xs text-muted-foreground",
									children: [
										fx(x),
										" · ",
										ASTRAL_BASES[x.base].power
									]
								})]
							})]
						}, x.id))
					})]
				})
			})
		]
	});
}
/** One recipe line: what it costs right now (materials held vs needed, plus the level-scaled gold) and its Craft button. */
function RecipeRow({ r, slot, hero, ilvl, busy, onCraft }) {
	const b = craftBlocker(hero, r, invCap(hero), slot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "slot flex flex-wrap items-center justify-between gap-2 p-3 text-sm",
		style: { borderColor: `var(--r${r.rarity})` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-bold",
				children: [
					r.name,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [
							"· item level ",
							ilvl,
							" · Lv ",
							r.minLevel,
							"+"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: r.desc
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs",
				children: [Object.entries(recipeMats(r, slot)).map(([m, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: matCount(hero, m) >= n ? "mr-2" : "mr-2 text-hp",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatIcon, {
							mat: m,
							size: 16
						}),
						" ",
						MATS[m].name,
						" ",
						matCount(hero, m),
						"/",
						n
					]
				}, m)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: recipeGold(r, hero.level) })]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			disabled: !!b || busy,
			title: b ?? "Craft",
			onClick: onCraft,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "h-4 w-4" }), "Craft"]
		})]
	});
}
/** The Forge's crafting window: standard recipes for any slot, and the Ancestral tab with one
*  heirloom per slot behind the Sanctuary trials. */
function Crafting({ onClose }) {
	const { hero } = useGame();
	const [tab, setTab] = (0, import_react.useState)("standard");
	const [slot, setSlot] = (0, import_react.useState)("weapon");
	const [last, setLast] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [toast, say] = useToast();
	if (!hero) return null;
	const ilvl = hero.level + Math.floor(hero.paragon / 2);
	const ancestralOpen = !!hero.anc?.done;
	const doCraft = (r, at) => {
		if (busy) return;
		setBusy(true);
		update((h) => {
			const recipe = (r.ancestral ? ANCESTRAL_RECIPES : RECIPES).find((x) => x.id === r.id);
			if (!recipe) return;
			const out = craft(h, recipe, invCap(h), () => recipe.ancestral ? makeAncestral(h.cls, ilvl, at) : makeItem(h.cls, ilvl, recipe.rarity, at), at);
			if (typeof out !== "string" && !recipe.ancestral && ![
				"rare",
				"epic",
				"legend",
				"mythic"
			].includes(recipe.id)) out.name = `${recipe.name} ${at}`;
			if (typeof out === "string") say(false, out);
			else {
				setLast(out);
				say(true, `Forged ${out.name}!`);
			}
		});
		setTimeout(() => setBusy(false), 400);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Forge · Crafting",
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatsBar, {}),
			toast,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTabs, {
				label: "Forge recipes",
				value: tab,
				onChange: setTab,
				tabs: [{
					id: "standard",
					name: "Standard recipes"
				}, {
					id: "ancestral",
					name: "Ancestral"
				}]
			}),
			tab === "ancestral" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "slot mb-3 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-gold",
						children: "Ancestral heirlooms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "The highest tier in Ember Fall: one piece per slot, each costing millions of gold and a vault of materials. Every price rises with your level, so the full set is the long climb after the Sanctuary."
					}),
					!ancestralOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-hp",
						children: "Locked — complete the Ancestral Sanctuary trials to forge these."
					})
				]
			}),
			tab === "standard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-1 text-sm",
				children: SLOTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: slot === s ? "default" : "ghost",
					onClick: () => setSlot(s),
					children: s
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-[1.4fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [tab === "standard" ? RECIPES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeRow, {
						r,
						slot,
						hero,
						ilvl,
						busy,
						onCraft: () => doCraft(r, slot)
					}, r.id)) : ANCESTRAL_RECIPES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeRow, {
						r,
						slot: r.slot,
						hero,
						ilvl,
						busy,
						onCraft: () => doCraft(r, r.slot)
					}, r.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Crafted items: ", hero.crafts ?? 0]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
					item: last,
					compare: wornCompare(hero, last)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-10 text-center text-muted-foreground",
					children: "Your newest creation appears here, compared with what you wear."
				}) })]
			})
		]
	});
}
var useGameOverflow = () => getState().hero?.overflow?.length ?? 0;
function Game() {
	const { hero, heroId, userId, cloud, authReady } = useGame();
	const nav = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(null);
	const [battle, setBattle] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [crafting, setCrafting] = (0, import_react.useState)(false);
	const [expeditions, setExpeditions] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(() => localStorage.getItem("bm-muted") === "1");
	const audio = (0, import_react.useRef)(null);
	const starting = (0, import_react.useRef)(false);
	const [entryError, setEntryError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!authReady || userId) return;
		const t = setTimeout(() => {
			if (getState().userId || authHandoffPending()) return;
			nav({ to: "/auth" });
		}, 1500);
		return () => clearTimeout(t);
	}, [
		authReady,
		userId,
		nav
	]);
	(0, import_react.useEffect)(() => {
		const a = audio.current;
		if (!a) return;
		a.volume = .35;
		localStorage.setItem("bm-muted", muted ? "1" : "0");
		if (muted) {
			a.pause();
			return;
		}
		const play = () => {
			if (!muted) a.play().catch(() => {});
		};
		play();
		window.addEventListener("pointerdown", play, { once: true });
		return () => window.removeEventListener("pointerdown", play);
	}, [muted]);
	const start = (o) => {
		if (!hero || starting.current || battle) return;
		starting.current = true;
		setEntryError("");
		(async () => {
			try {
				const active = await beginScrollBattle();
				const current = getState();
				if (!current.hero) return;
				setOpen(null);
				setBattle({
					...o,
					left: scrollFighter({
						...heroFighter(current.hero, heroStats(current.hero)),
						gender: current.gender
					}, active)
				});
			} catch (e) {
				setEntryError(e instanceof Error ? e.message : "Battle entry failed.");
			} finally {
				starting.current = false;
			}
		})();
	};
	const settled = (0, import_react.useRef)(null);
	const onEnd = async (won) => {
		if (!battle || settled.current === battle) return;
		settled.current = battle;
		const before = useGameOverflow();
		const r0 = await battle.onResult(won, battle.left.scrolls?.includes("xp") ? 1.2 : 1);
		const r = {
			...r0,
			lines: [...r0.lines]
		};
		if (useGameOverflow() > before && !r.lines.some((l) => /Overflow/.test(l))) r.lines.push("Bag full — loot placed in your Overflow Chest (Armory)");
		if (won) update((h) => {
			const m = battleMats(h.level + h.paragon, !!battle.right.boss);
			addMats(h, m);
			r.lines.push(...matsLine(m));
			if (awardAncestralRelic(h, !!battle.right.boss)) r.lines.push("+1 Ancestral Relic");
		});
		update((h) => recordBattle(h, {
			title: battle.title,
			won,
			boss: !!battle.right.boss,
			arena: /arena/i.test(battle.title),
			rewards: [...r.lines, ...r.loot ? [r.loot.name] : []]
		}));
		setResult({
			won,
			...r
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audio,
				src: theme_mp3_asset_default.url,
				loop: true,
				preload: "auto"
			}),
			!authReady || !userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full items-center justify-center gap-2 font-display text-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }), "Loading…"]
			}) : !hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterSelect, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CastleMap, { onOpen: setOpen }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutBar, {
					open,
					onOpen: setOpen
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Rewards",
					className: "game-panel bottom-nav rewards-nav absolute bottom-3 left-3 z-20 flex gap-1 p-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Mailbox",
							title: "Mailbox",
							onClick: () => setOpen("mailbox"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Lucky Shots",
							title: "Lucky Shots",
							onClick: () => setOpen("lucky"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Battle Scrolls",
							title: "Battle Scrolls",
							onClick: () => setOpen("scrolls"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Bestiary",
							title: "Bestiary",
							onClick: () => setOpen("bestiary"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Profession Lodge",
							title: "Profession Lodge",
							onClick: () => setOpen("professions"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anvil, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Premium Shop",
							title: "Premium Shop",
							onClick: () => setOpen("premium"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Auction House",
							title: "Auction House",
							onClick: () => setOpen("auction"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldChat, { heroId }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
					muted,
					setMuted,
					cloud,
					onProfile: () => setOpen("profile")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "castle-hint pointer-events-none absolute inset-x-0 top-32 z-20 text-center font-display text-xs text-gold drop-shadow-[0_1px_2px_black]",
					children: "Drag the castle to reach every building"
				}),
				open === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePanel, { onClose: () => setOpen(null) }),
				open === "mailbox" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mailbox, { onClose: () => setOpen(null) }),
				open === "lucky" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LuckyShots, { onClose: () => setOpen(null) }),
				open === "daily" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityBoard, { onClose: () => setOpen(null) }),
				open === "guild" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuildHall, { onClose: () => setOpen(null) }),
				open === "scrolls" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollShop, { onClose: () => setOpen(null) }),
				open === "hall" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThroneHall, { onClose: () => setOpen(null) }),
				open === "armory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroHall, { onClose: () => setOpen(null) }),
				open === "bestiary" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bestiary, {
					h: hero,
					onClose: () => setOpen(null)
				}),
				open === "road" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LongRoad, {
					onClose: () => setOpen(null),
					start
				}),
				open === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCalendar, {
					h: hero,
					onClose: () => setOpen(null),
					start
				}),
				open === "professions" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Professions, { onClose: () => setOpen(null) }),
				open === "premium" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremiumShop, { onClose: () => setOpen(null) }),
				open === "auction" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuctionHouse, { onClose: () => setOpen(null) }),
				open === "sanctuary" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sanctuary, {
					onClose: () => setOpen(null),
					start
				}),
				open === "anctree" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sanctuary, {
					onClose: () => setOpen(null),
					start
				}),
				open && BUILDINGS.find((b) => b.id === open)?.soon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComingSoon, {
					id: open,
					onClose: () => setOpen(null)
				}),
				open === "friends" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-background/70 p-4 pt-16",
					onClick: () => setOpen(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-md",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendsPanel, { heroId }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-ghost mt-2 w-full py-2",
							onClick: () => setOpen(null),
							children: "Close"
						})]
					})
				}),
				open === "portal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Campaign, {
					onClose: () => setOpen(null),
					start
				}),
				open === "spire" && (canEnterConquest(hero.level) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Campaign, {
					spire: true,
					onClose: () => setOpen(null),
					start
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComingSoon, {
					id: "spire",
					locked: true,
					onClose: () => setOpen(null)
				})),
				open === "forge" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forge, {
					onClose: () => setOpen(null),
					onCraft: () => setCrafting(true)
				}),
				crafting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crafting, { onClose: () => setCrafting(false) }),
				open === "dungeon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenges, {
					onClose: () => setOpen(null),
					start,
					onExpeditions: () => {
						setOpen(null);
						setExpeditions(true);
					}
				}),
				expeditions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expeditions, {
					onClose: () => setExpeditions(false),
					start: (o) => {
						setExpeditions(false);
						start(o);
					}
				}),
				open === "gems" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemWorkshop, { onClose: () => setOpen(null) }),
				open === "tower" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MagicTower, { onClose: () => setOpen(null) }),
				open === "temple" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Temple, { onClose: () => setOpen(null) }),
				open === "market" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Market, { onClose: () => setOpen(null) }),
				open === "arena" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arena, {
					onClose: () => setOpen(null),
					start
				}),
				open === "worldmap" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMap, {
					onClose: () => setOpen(null),
					start
				}),
				open === "oracle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Oracle, {
					onClose: () => setOpen(null),
					start
				})
			] }),
			battle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Battle, {
				left: battle.left,
				right: battle.right,
				auto: battle.auto,
				title: battle.title,
				onEnd
			}, battle.title + battle.right.name),
			entryError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "game-panel max-w-md p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						children: entryError
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: () => {
							const id = getState().heroId;
							if (id) localStorage.removeItem(`ef-scroll-battle:${id}`);
							setEntryError("");
						},
						children: "Acknowledge and close"
					})]
				})
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "game-panel anim-pop w-full max-w-sm p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: `font-display text-5xl font-black ${result.won ? "panel-title" : "text-blood"}`,
							children: result.won ? "VICTORY" : "DEFEAT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "my-4 space-y-1 font-display text-lg",
							children: result.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: l }, l))
						}),
						result.loot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, { item: result.loot }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-gold mt-5 w-full py-2.5 text-lg",
							onClick: () => {
								setResult(null);
								setBattle(null);
							},
							children: "Continue"
						})
					]
				})
			})
		]
	});
}
function Hud({ muted, setMuted, cloud, onProfile }) {
	const { hero, gender, chars, heroId } = useGame();
	const frame = chars?.find((c) => c.id === heroId)?.frame ?? "iron";
	if (!hero) return null;
	const s = heroStats(hero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hud-top pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-panel pointer-events-auto flex items-center gap-3 p-2 pr-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `slot h-11 w-11 shrink-0 overflow-hidden lg:h-14 lg:w-14 ${frameClass(frame)}`,
					onClick: onProfile,
					"aria-label": "Profile",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
						cls: hero.cls,
						gender,
						chest: hero.equipment.armour,
						weapon: hero.equipment.weapon,
						className: "w-full"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-24 lg:w-40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-display",
							children: hero.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								"Lv ",
								hero.level,
								hero.paragon ? ` · Asc ${hero.paragon}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XpBar, { hero })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col text-xs lg:text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gold, { n: hero.gold }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Diamonds, { n: premiumState(hero).balance }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mr-1 inline h-4 w-4 text-r4" }), fmt(s.power)]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-panel pointer-events-auto flex items-center gap-1 p-2 lg:gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10",
					onClick: () => setMuted(!muted),
					"aria-label": "Music",
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-5 w-5 text-gold" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10",
					title: `Cloud: ${cloud}`,
					children: cloud === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, { className: "h-5 w-5 text-hp" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: `h-5 w-5 ${cloud === "saved" ? "text-r1" : "text-muted-foreground"}` })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10",
					onClick: onProfile,
					"aria-label": "Profile",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10",
					onClick: () => void leaveCharacter(),
					"aria-label": "Switch character",
					title: "Switch character",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "slot flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10",
					onClick: async () => {
						if (await leaveCharacter()) await supabase.auth.signOut();
					},
					"aria-label": "Sign out",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
				})
			]
		})]
	});
}
/** Keep the castle centred: it may be dragged, never past its own edges. */
function castleClamp(el, x, y) {
	if (!el) return {
		x: 0,
		y: 0
	};
	const maxX = Math.max(0, (el.offsetWidth - window.innerWidth) / 2);
	const maxY = Math.max(0, (el.offsetHeight - window.innerHeight) / 2);
	return {
		x: Math.min(maxX, Math.max(-maxX, x)),
		y: Math.min(maxY, Math.max(-maxY, y))
	};
}
function CastleMap({ onOpen }) {
	const [hover, setHover] = (0, import_react.useState)(null);
	const map = (0, import_react.useRef)(null);
	const [offset, setOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const drag = (0, import_react.useRef)(null);
	const moved = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const onResize = () => setOffset((o) => castleClamp(map.current, o.x, o.y));
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "castle-view absolute inset-0 flex items-center justify-center overflow-hidden",
		onPointerDown: (e) => {
			if (e.pointerType === "mouse" && e.button !== 0) return;
			drag.current = {
				x: e.clientX,
				y: e.clientY,
				ox: offset.x,
				oy: offset.y,
				moved: false
			};
			moved.current = false;
		},
		onPointerMove: (e) => {
			const d = drag.current;
			if (!d) return;
			const dx = e.clientX - d.x;
			const dy = e.clientY - d.y;
			if (!d.moved && Math.abs(dx) + Math.abs(dy) < 10) return;
			d.moved = true;
			moved.current = true;
			setOffset(castleClamp(map.current, d.ox + dx, d.oy + dy));
		},
		onPointerUp: () => {
			drag.current = null;
		},
		onPointerCancel: () => {
			drag.current = null;
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: map,
			className: "castle-map relative",
			style: { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: castle_jpg_asset_default.url,
					alt: "Blood moon castle",
					className: "absolute inset-0 h-full w-full select-none",
					draggable: false
				}),
				Array.from({ length: 14 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "anim-ember pointer-events-none absolute bottom-0 h-1 w-1 rounded-full bg-gold",
					style: {
						left: `${i * 37 % 100}%`,
						animationDuration: `${6 + i % 5}s`,
						animationDelay: `${i * .7}s`
					}
				}, i)),
				CASTLE_BUILDINGS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "hotspot",
					"aria-label": b.name,
					style: {
						left: `${b.x}%`,
						top: `${b.y}%`,
						width: `${b.r * 2}%`,
						aspectRatio: "1"
					},
					onMouseEnter: () => setHover(b.id),
					onMouseLeave: () => setHover(null),
					onClick: (e) => {
						if (e.detail === 0 || !moved.current) onOpen(b.id);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `hotspot-label ${b.soon ? "opacity-60" : ""} absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-xs transition md:text-sm ${hover === b.id ? "scale-110" : "opacity-90"}`,
						children: [
							b.name,
							b.soon ? " · soon" : "",
							hover === b.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] text-foreground/80",
								children: b.desc
							})
						]
					})
				}, b.id))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette pointer-events-none absolute inset-0" })]
	});
}
var SOON_TEXT = {
	dungeon: "Replayable dungeons with boss encounters, entry requirements and reward tables.",
	tower: "Collect Astrals, equip them into slots and upgrade them for stat bonuses.",
	sanctuary: "A multi-stage Ancestral questline unlocking the Ancestral skill tree and equipment.",
	anctree: "Ancestral Tower — climb endless floors of 100k+ BR bosses for ancestral crafting materials.",
	gems: "Socket gems into gear, combine fragments and upgrade gems for real stat bonuses.",
	guild: "Create or join guilds, with roles, contribution, guild chat and co-op bosses.",
	friends: "Add friends, see who is online and send private messages.",
	daily: "A 7-day reward board that rotates to a new theme every week."
};
function ComingSoon({ id, locked, onClose }) {
	const b = BUILDINGS.find((x) => x.id === id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: b?.name ?? "Building",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-10 text-center",
			children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-display text-2xl text-gold",
				children: "Locked"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted-foreground",
				children: [
					"Endless Conquest opens at character level ",
					10,
					". Keep clearing the Campaign Gate to level up."
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 font-display text-2xl text-gold",
					children: "Under construction"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto max-w-md text-muted-foreground",
					children: SOON_TEXT[id]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "This building isn't playable yet — it's coming in a future update."
				})
			] })
		})
	});
}
var SHORTCUTS = [
	{
		id: "armory",
		label: "Inventory",
		tip: "Bag & equipment",
		Icon: Backpack
	},
	{
		id: "forge",
		label: "Forge",
		tip: "Enhance & salvage gear",
		Icon: Anvil
	},
	{
		id: "gems",
		label: "Gem Workshop",
		tip: "Cut, socket & fuse gems",
		Icon: Gem
	},
	{
		id: "daily",
		label: "Daily Rewards",
		tip: "7-day reward board",
		Icon: Gift
	},
	{
		id: "road",
		label: "Long Road",
		tip: "Endless regions past the campaign",
		Icon: Sparkles
	},
	{
		id: "calendar",
		label: "Events",
		tip: "World event calendar & reminders",
		Icon: CalendarDays
	},
	{
		id: "friends",
		label: "Friends",
		tip: "Friends & messages",
		Icon: Users
	},
	{
		id: "profile",
		label: "Profile",
		tip: "Your hero profile",
		Icon: CircleUser
	},
	{
		id: "oracle",
		label: "Quest Board",
		tip: "AI-generated quests",
		Icon: ScrollText
	},
	{
		id: "sanctuary",
		label: "Ancestral Sanctuary",
		tip: "Ancestral questline",
		Icon: Sparkles
	}
];
function ShortcutBar({ open, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Shortcuts",
		className: "game-panel bottom-nav shortcut-nav pointer-events-auto absolute bottom-3 right-3 z-20 flex gap-1.5 p-1.5",
		children: SHORTCUTS.map(({ id, label, tip, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onOpen(id),
			"aria-label": label,
			"aria-pressed": open === id,
			className: `slot group relative flex h-11 w-11 items-center justify-center transition hover:scale-110 ${open === id ? "ring-2 ring-gold" : ""}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-5 w-5 ${open === id ? "text-gold" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				role: "tooltip",
				className: "hotspot-label pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded px-2 py-1 text-left text-xs group-hover:block group-focus-visible:block",
				children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[10px] text-foreground/80",
					children: tip
				})]
			})]
		}, id))
	});
}
function Index() {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-background" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { refreshMerchant as a, Index as component, makeDrop as i, claimOverflow as n, rollLoot as o, grant as r, addLoot as t };

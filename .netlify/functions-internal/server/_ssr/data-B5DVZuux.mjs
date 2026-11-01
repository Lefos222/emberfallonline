//#region node_modules/.nitro/vite/services/ssr/assets/data-B5DVZuux.js
var hero_warrior_default = "/assets/hero-warrior-DUT5f6M6.png";
var hero_mage_default = "/assets/hero-mage-BHjbpOlr.png";
var hero_archer_default = "/assets/hero-archer-iFuaLx8F.png";
var enemy_skeleton_default = "/assets/enemy-skeleton-DKYsFQ81.png";
var enemy_goblin_default = "/assets/enemy-goblin-B8o3qKVb.png";
var enemy_demon_default = "/assets/enemy-demon-DMSHrm-Z.png";
var enemy_dragon_default = "/assets/enemy-dragon-HSac2tYz.png";
var t = (x) => x;
var TREES = {
	warrior: [
		{
			id: "w_guard",
			name: "Bulwark",
			blurb: "Unbreakable defender",
			talents: [
				t({
					id: "w_g1",
					name: "Iron Skin",
					desc: "+5% defense per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { defPct: 5 }
				}),
				t({
					id: "w_g2",
					name: "Heavy Cleave",
					desc: "Cleave deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "cleave",
						multPct: 12
					}
				}),
				t({
					id: "w_g3",
					name: "Shield Slam",
					desc: "New ability: 1.6× damage and stuns the foe for a turn · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "slam",
						name: "Shield Slam",
						mult: 1.6,
						cd: 4,
						stun: true,
						icon: "sword"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "w_g4",
					name: "Fortress",
					desc: "+5% health and +2.5% defense per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						hpPct: 5,
						defPct: 2.5
					}
				}),
				t({
					id: "w_g5",
					name: "Aegis Breaker",
					desc: "Ascended shield slam: 2× damage, stun. Clear Road stage 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 100 },
					ability: {
						id: "aegis",
						name: "Aegis Breaker",
						mult: 2,
						cd: 5,
						stun: true,
						icon: "shield"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "w_berserk",
			name: "Berserker",
			blurb: "Reckless damage",
			talents: [
				t({
					id: "w_b1",
					name: "Fury",
					desc: "+5% attack per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { atkPct: 5 }
				}),
				t({
					id: "w_b2",
					name: "Boiling Blood",
					desc: "Bloodrage deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "rage",
						multPct: 12
					}
				}),
				t({
					id: "w_b3",
					name: "Whirlwind",
					desc: "New ability: 3 hits of 0.9× damage · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "whirl",
						name: "Whirlwind",
						mult: .9,
						hits: 3,
						cd: 4,
						icon: "axe"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "w_b4",
					name: "Rampage",
					desc: "+4% attack and +10% crit damage per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						atkPct: 4,
						critDmg: 10
					}
				}),
				t({
					id: "w_b5",
					name: "Cyclone Reaver",
					desc: "Ascended whirlwind: 4 hits of 0.7× against all foes. Clear Spire wave 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { spire: 100 },
					ability: {
						id: "cyclone",
						name: "Cyclone Reaver",
						mult: .7,
						hits: 4,
						cd: 6,
						icon: "axe"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "w_warlord",
			name: "Warlord",
			blurb: "Precise battlefield control",
			talents: [
				t({
					id: "w_w1",
					name: "Battle Focus",
					desc: "+2% crit chance per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { crit: 2 }
				}),
				t({
					id: "w_w2",
					name: "Sunder",
					desc: "+2.5% armor penetration per rank",
					tier: 2,
					max: 4,
					cost: 1,
					fx: { pen: 2.5 }
				}),
				t({
					id: "w_w3",
					name: "Execute",
					desc: "New ability: 3.6× damage, always crits · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "execute",
						name: "Execute",
						mult: 3.6,
						cd: 6,
						crit: true,
						icon: "crosshair"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "w_w4",
					name: "Commander",
					desc: "+2% to attack, defense and health per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						atkPct: 2,
						defPct: 2,
						hpPct: 2
					}
				}),
				t({
					id: "w_w5",
					name: "Sovereign Execute",
					desc: "Ascended execution: 4× damage, guaranteed critical. Clear Road stage 120. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 120 },
					ability: {
						id: "sovereign",
						name: "Sovereign Execute",
						mult: 4,
						cd: 7,
						crit: true,
						icon: "crosshair"
					},
					selfBoost: { multPct: 10 }
				})
			]
		}
	],
	mage: [
		{
			id: "m_fire",
			name: "Pyromancer",
			blurb: "Burn everything",
			talents: [
				t({
					id: "m_f1",
					name: "Kindling",
					desc: "+5% attack per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { atkPct: 5 }
				}),
				t({
					id: "m_f2",
					name: "Cataclysm",
					desc: "Meteor deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "meteor",
						multPct: 12
					}
				}),
				t({
					id: "m_f3",
					name: "Inferno",
					desc: "New ability: 4 hits of 0.8× damage · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "inferno",
						name: "Inferno",
						mult: .8,
						hits: 4,
						cd: 5,
						icon: "flame"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "m_f4",
					name: "Living Flame",
					desc: "+5% attack and +8% crit damage per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						atkPct: 5,
						critDmg: 8
					}
				}),
				t({
					id: "m_f5",
					name: "Solar Cataclysm",
					desc: "Ascended inferno: 4 hits of 0.85× against all foes with burning. Clear Spire wave 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { spire: 100 },
					ability: {
						id: "solar",
						name: "Solar Cataclysm",
						mult: .85,
						hits: 4,
						cd: 6,
						icon: "flame"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "m_frost",
			name: "Cryomancer",
			blurb: "Freeze and endure",
			talents: [
				t({
					id: "m_c1",
					name: "Ice Barrier",
					desc: "+5% health per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { hpPct: 5 }
				}),
				t({
					id: "m_c2",
					name: "Deep Freeze",
					desc: "Frost Nova deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "nova",
						multPct: 12
					}
				}),
				t({
					id: "m_c3",
					name: "Glacial Spike",
					desc: "New ability: 2.4× damage and freezes the foe · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "spike",
						name: "Glacial Spike",
						mult: 2.4,
						cd: 5,
						stun: true,
						icon: "snowflake"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "m_c4",
					name: "Permafrost",
					desc: "+4% defense and +4% health per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						defPct: 4,
						hpPct: 4
					}
				}),
				t({
					id: "m_c5",
					name: "Winter Crown",
					desc: "Ascended frost nova: 1.4× damage and freezes all foes. Clear Road stage 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 100 },
					ability: {
						id: "winter",
						name: "Winter Crown",
						mult: 1.4,
						cd: 6,
						stun: true,
						icon: "snowflake"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "m_arcane",
			name: "Arcanist",
			blurb: "Pure magical precision",
			talents: [
				t({
					id: "m_a1",
					name: "Clarity",
					desc: "+2% crit chance per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { crit: 2 }
				}),
				t({
					id: "m_a2",
					name: "Arcane Edge",
					desc: "Arcane Bolt deals +15% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "bolt",
						multPct: 15
					}
				}),
				t({
					id: "m_a3",
					name: "Mana Drain",
					desc: "New ability: 2× damage and heals you 20% · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "drain",
						name: "Mana Drain",
						mult: 2,
						cd: 5,
						heal: .2,
						icon: "sparkles"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "m_a4",
					name: "Archmage",
					desc: "+1.5% armor penetration and +2.5% attack per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						pen: 1.5,
						atkPct: 2.5
					}
				}),
				t({
					id: "m_a5",
					name: "Astral Siphon",
					desc: "Ascended drain: 2.4× damage and heals 25%. Clear Road stage 120. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 120 },
					ability: {
						id: "astral-siphon",
						name: "Astral Siphon",
						mult: 2.4,
						cd: 6,
						heal: .25,
						icon: "sparkles"
					},
					selfBoost: { multPct: 10 }
				})
			]
		}
	],
	archer: [
		{
			id: "a_sniper",
			name: "Marksman",
			blurb: "One perfect shot",
			talents: [
				t({
					id: "a_s1",
					name: "Steady Aim",
					desc: "+2% crit chance per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { crit: 2 }
				}),
				t({
					id: "a_s2",
					name: "Headshot",
					desc: "Death Snipe deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "snipe",
						multPct: 12
					}
				}),
				t({
					id: "a_s3",
					name: "Piercing Arrow",
					desc: "New ability: 3× damage, always crits · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "pierce",
						name: "Piercing Arrow",
						mult: 3,
						cd: 5,
						crit: true,
						icon: "crosshair"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "a_s4",
					name: "Deadeye",
					desc: "+12% crit damage and +1.25% penetration per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						critDmg: 12,
						pen: 1.25
					}
				}),
				t({
					id: "a_s5",
					name: "Horizon Lance",
					desc: "Ascended piercing arrow: 3.5× critical damage, ignores 40% armor. Clear Road stage 120. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 120 },
					ability: {
						id: "horizon",
						name: "Horizon Lance",
						mult: 3.5,
						cd: 6,
						crit: true,
						icon: "crosshair"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "a_ranger",
			name: "Ranger",
			blurb: "A storm of arrows",
			talents: [
				t({
					id: "a_r1",
					name: "Quick Draw",
					desc: "+5% attack per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { atkPct: 5 }
				}),
				t({
					id: "a_r2",
					name: "Arrow Storm",
					desc: "Volley deals +12% damage per rank",
					tier: 2,
					max: 4,
					cost: 1,
					boost: {
						skill: "volley",
						multPct: 12
					}
				}),
				t({
					id: "a_r3",
					name: "Rain of Arrows",
					desc: "New ability: 5 hits of 0.6× damage · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "rain",
						name: "Rain of Arrows",
						mult: .6,
						hits: 5,
						cd: 5,
						icon: "wind"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "a_r4",
					name: "Wind Walker",
					desc: "+3% attack and +1.25% dodge per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						atkPct: 3,
						dodge: 1.25
					}
				}),
				t({
					id: "a_r5",
					name: "Tempest Barrage",
					desc: "Ascended arrow rain: 5 hits of 0.65× against all foes. Clear Spire wave 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { spire: 100 },
					ability: {
						id: "tempest",
						name: "Tempest Barrage",
						mult: .65,
						hits: 5,
						cd: 6,
						icon: "wind"
					},
					selfBoost: { multPct: 10 }
				})
			]
		},
		{
			id: "a_shadow",
			name: "Shadowstalker",
			blurb: "Evasive survivor",
			talents: [
				t({
					id: "a_h1",
					name: "Evasion",
					desc: "+1% dodge per rank",
					tier: 1,
					max: 4,
					cost: 1,
					fx: { dodge: 1 }
				}),
				t({
					id: "a_h2",
					name: "Thick Hide",
					desc: "+5% health per rank",
					tier: 2,
					max: 4,
					cost: 1,
					fx: { hpPct: 5 }
				}),
				t({
					id: "a_h3",
					name: "Shadow Step",
					desc: "New ability: 1.8× damage and heals you 15% · upgrades add +10% damage",
					tier: 3,
					max: 4,
					cost: 3,
					upgradeCost: 1,
					ability: {
						id: "shadow",
						name: "Shadow Step",
						mult: 1.8,
						cd: 4,
						heal: .15,
						icon: "target"
					},
					selfBoost: { multPct: 10 }
				}),
				t({
					id: "a_h4",
					name: "Phantom",
					desc: "+3% defense, +3% health and +0.75% dodge per rank",
					tier: 4,
					max: 4,
					cost: 1,
					fx: {
						defPct: 3,
						hpPct: 3,
						dodge: .75
					}
				}),
				t({
					id: "a_h5",
					name: "Eclipse Step",
					desc: "Ascended shadow strike: 2.2× damage, heals 20%, grants evasion. Clear Road stage 100. · upgrades add +10% damage",
					tier: 5,
					max: 4,
					cost: 5,
					upgradeCost: 1,
					milestone: { road: 100 },
					ability: {
						id: "eclipse",
						name: "Eclipse Step",
						mult: 2.2,
						cd: 5,
						heal: .2,
						icon: "target"
					},
					selfBoost: { multPct: 10 }
				})
			]
		}
	]
};
/** One skill point per level after 1, plus one per Ascension level. */
/** Skill points: 1 per level, +1 bonus every 5 levels, +1 per ascension, + quest bonuses. */
var totalPoints = (h) => Math.max(0, h.level - 1) + Math.floor(h.level / 5) + h.paragon + (h.bonusPts ?? 0);
/** Skill points for the next rank of a talent: the unlock cost, then the upgrade cost. */
var rankCost = (t, rank) => rank === 0 ? t.cost : t.upgradeCost ?? t.cost;
function findTalent(cls, id) {
	for (const spec of TREES[cls]) {
		const talent = spec.talents.find((x) => x.id === id);
		if (talent) return {
			spec,
			talent
		};
	}
	return null;
}
function spentIn(h, specId) {
	let n = 0;
	for (const [id, rank] of Object.entries(h.talents ?? {})) {
		const f = findTalent(h.cls, id);
		if (f && (!specId || f.spec.id === specId)) n += rank * f.talent.cost;
	}
	return n;
}
var freePoints = (h) => totalPoints(h) - spentIn(h);
/** Why a rank can't be learned, or null when allowed.
*  Every skill is upgradeable under any circumstance — the only requirements are
*  being under the rank cap and having enough skill points. Prerequisites, tier
*  spending thresholds, specialization, level and milestone gates are all removed. */
function learnBlocker(h, id) {
	const f = findTalent(h.cls, id);
	if (!f) return "Unknown skill";
	const { talent } = f;
	const rank = h.talents?.[id] ?? 0;
	if (rank >= talent.max) return "Maxed";
	const cost = rankCost(talent, rank);
	if (freePoints(h) < cost) return `Needs ${cost} skill point${cost > 1 ? "s" : ""}`;
	return null;
}
var resetCost = (h) => 100 * (h.level + h.paragon);
function talentFx(h) {
	const out = {
		hpPct: 0,
		atkPct: 0,
		defPct: 0,
		crit: 0,
		dodge: 0,
		critDmg: 0,
		pen: 0
	};
	for (const [id, rank] of Object.entries(h.talents ?? {})) {
		const fx = findTalent(h.cls, id)?.talent.fx;
		if (fx) for (const k of Object.keys(fx)) out[k] += (fx[k] ?? 0) * rank;
	}
	return out;
}
/** The hero's battle abilities after talent upgrades and unlocked abilities. */
function talentSkills(base, h) {
	const list = base.map((s) => ({ ...s }));
	for (const [id, rank] of Object.entries(h.talents ?? {})) {
		const t = findTalent(h.cls, id)?.talent;
		if (!t || rank <= 0) continue;
		if (t.boost) {
			const boost = t.boost;
			const s = list.find((x) => x.id === boost.skill);
			if (s) s.mult = +(s.mult * (1 + boost.multPct * rank / 100)).toFixed(2);
		}
		if (t.ability) {
			const ability = { ...t.ability };
			if (t.selfBoost && rank > 1) ability.mult = +(ability.mult * (1 + t.selfBoost.multPct * (rank - 1) / 100)).toFixed(2);
			list.push(ability);
		}
	}
	return list;
}
/** Gold prices in Ember Fall rise with the hero's level: every cost the player pays in gold is
*  multiplied by this factor, so the castle's shops, forge and barracks stay a real sink as levels
*  climb instead of getting cheaper in practice. Level 1 leaves every legacy price unchanged. */
var GOLD_PER_LEVEL = .02;
function goldScale(level = 1) {
	return 1 + Math.max(0, (Number.isFinite(level) ? level : 1) - 1) * GOLD_PER_LEVEL;
}
/** A gold price scaled for a hero's level. */
var scaledGold = (base, level = 1) => Math.round(base * goldScale(level));
var MATS = {
	ore: {
		name: "Ember Ore",
		desc: "Common ore used in crafting and gem cutting.",
		src: "Every won battle (more in higher regions)",
		rarity: 0
	},
	essence: {
		name: "Soul Essence",
		desc: "Distilled souls used in crafting and gem fusion.",
		src: "Tougher fights, elites, bosses",
		rarity: 2
	},
	starshard: {
		name: "Starshard",
		desc: "Summons and upgrades Astrals.",
		src: "Battles (15%), bosses, weekly activities",
		rarity: 3
	},
	bossCore: {
		name: "Boss Core",
		desc: "Heart of a fallen tyrant. Needed for Legendary and Mythic armor.",
		src: "Campaign bosses and Dungeon Gate challenges",
		rarity: 4
	},
	fragment: {
		name: "Armor Fragment",
		desc: "Shards of fine armor. Rare+ armor can only be forged from these.",
		src: "Monsters (12%), elites, bosses, weekly activities",
		rarity: 2
	},
	sigil: {
		name: "Elite Sigil",
		desc: "Trophy of an elite foe. Needed for Epic+ armor.",
		src: "Elite Hunt and Dungeon Gate bosses",
		rarity: 3
	},
	hide: {
		name: "Beast Hide",
		desc: "Hide stripped from slain monsters. Refines into Armor Fragments.",
		src: "Every won battle (more in higher regions)",
		rarity: 1
	},
	bloom: {
		name: "Emberbloom",
		desc: "Fire-touched herb. Refines into Soul Essence.",
		src: "Won battles, elites and gathering journeys",
		rarity: 1
	},
	crystal: {
		name: "Arcane Crystal",
		desc: "Crystallised mana. Refines into Starshards.",
		src: "Elites and Dungeon Gate bosses",
		rarity: 2
	},
	enchantStone: {
		name: "Enchantment Stone",
		desc: "A resonant stone used to enchant gear at the Forge instead of gold. Higher success rate.",
		src: "Conquest Gate shop and Guild shop",
		rarity: 3
	},
	ancientBone: {
		name: "Ancient Relic Bone",
		desc: "Bone of a long-dead ancestor. Used only in Ancestral equipment crafting.",
		src: "Ancestral Tower boss floors",
		rarity: 4
	},
	voidShard: {
		name: "Void Crystal Shard",
		desc: "A shard of crystallised void. Used only in Ancestral equipment crafting.",
		src: "Ancestral Tower boss floors 2+",
		rarity: 4
	},
	emberHeart: {
		name: "Ember Heart Core",
		desc: "The still-beating heart of an ancestral titan. Used only in Ancestral equipment crafting.",
		src: "Ancestral Tower boss floors 3+",
		rarity: 5
	}
};
var matCount = (h, m) => h.mats?.[m] ?? 0;
function addMats(h, add) {
	h.mats = { ...h.mats ?? {} };
	for (const [k, v] of Object.entries(add)) h.mats[k] = (h.mats[k] ?? 0) + v;
}
function hasMats(h, need) {
	return Object.entries(need).every(([k, v]) => matCount(h, k) >= v);
}
function spendMats(h, need) {
	for (const [k, v] of Object.entries(need)) h.mats[k] = matCount(h, k) - v;
}
/** Materials a piece of gear breaks down into at the Forge. Rarer and higher level gear yields more. */
function scrapYield(it) {
	const tier = 1 + Math.floor(it.ilvl / 20);
	const enh = Math.floor((it.enh ?? 0) / 2);
	const out = { ore: (1 + it.rarity) * tier + enh };
	if (it.rarity >= 2) out.fragment = tier + it.rarity - 1;
	if (it.rarity >= 3) out.essence = 1 + Math.floor(it.rarity / 2) + enh;
	if (it.rarity >= 4) out.sigil = 1 + Math.floor(it.rarity / 3);
	if (it.rarity >= 4) out.bossCore = it.rarity >= 5 ? 2 : 1;
	if (it.rarity >= 5) out.starshard = tier + 1;
	return out;
}
/** Salvage a bagged item into materials. Socketed gems return to the pouch; worn gear is never touched. */
function scrapItem(h, itemId) {
	const idx = h.inventory.findIndex((i) => i.id === itemId);
	if (idx < 0) return "Equipped gear can't be salvaged - move it to your bag first";
	const it = h.inventory[idx];
	const gems = (it.gems ?? []).filter((g) => !!g);
	if (gems.length) {
		const pouch = { ...h.gems ?? {} };
		for (const g of gems) pouch[g] = (pouch[g] ?? 0) + 1;
		h.gems = pouch;
	}
	addMats(h, scrapYield(it));
	h.inventory.splice(idx, 1);
	return null;
}
/** Materials earned from a won battle. Elites/bosses give better ingredients; higher levels give more. */
function battleMats(level, boss, rand = Math.random, elite = false) {
	const out = { ore: 1 + Math.floor(level / 10) + Math.floor(rand() * 3) };
	if (boss || elite || rand() < .35) out.essence = 1 + (boss ? 2 : elite ? 1 : 0);
	if (boss || rand() < .15) out.starshard = boss ? 3 : 1;
	if (boss || elite || rand() < .12) out.fragment = boss ? 3 : elite ? 2 : 1;
	if (elite) out.sigil = 1;
	if (boss) out.bossCore = 1;
	out.hide = 1 + Math.floor(level / 15) + (boss ? 3 : elite ? 2 : 0);
	if (rand() < .3) out.bloom = 1 + (elite ? 1 : 0);
	if (boss || elite) out.crystal = boss ? 2 : 1;
	return out;
}
var matsLine = (m) => Object.entries(m).filter(([, v]) => v > 0).map(([k, v]) => `+${v} ${MATS[k].name}`);
/** Spare materials refine into the forge materials that recipes need. */
var REFINE = [
	{
		id: "hide",
		from: "hide",
		need: 3,
		to: "fragment",
		gain: 1
	},
	{
		id: "bloom",
		from: "bloom",
		need: 3,
		to: "essence",
		gain: 1
	},
	{
		id: "crystal",
		from: "crystal",
		need: 3,
		to: "starshard",
		gain: 1
	}
];
function refine(h, id) {
	const r = REFINE.find((x) => x.id === id);
	if (!r) return "Unknown refinement";
	if (matCount(h, r.from) < r.need) return "Not enough " + MATS[r.from].name;
	spendMats(h, { [r.from]: r.need });
	addMats(h, { [r.to]: r.gain });
	return null;
}
var STAT_LABEL = {
	atkPct: "% Physical Attack",
	matkPct: "% Magic Attack",
	defPct: "% Physical Defense",
	mdefPct: "% Magic Defense",
	hpPct: "% Max HP",
	crit: "% Crit Chance",
	critDmg: "% Crit Damage",
	acc: "% Accuracy",
	dodge: "% Dodge",
	block: "% Block",
	pen: "% Armor Pen",
	mpen: "% Magic Pen",
	heal: "% Healing Power"
};
var zeroFx = () => ({
	atkPct: 0,
	matkPct: 0,
	defPct: 0,
	mdefPct: 0,
	hpPct: 0,
	crit: 0,
	critDmg: 0,
	acc: 0,
	dodge: 0,
	block: 0,
	pen: 0,
	mpen: 0,
	heal: 0
});
var GEMS = {
	ruby: {
		name: "Ruby",
		stat: "atkPct",
		per: 2,
		color: "#d4283c",
		classes: "Knight · Archer"
	},
	amethyst: {
		name: "Amethyst",
		stat: "matkPct",
		per: 2,
		color: "#9b4dd8",
		classes: "Mage"
	},
	sapphire: {
		name: "Sapphire",
		stat: "defPct",
		per: 2,
		color: "#2f6fe0",
		classes: "Knight"
	},
	aquamarine: {
		name: "Aquamarine",
		stat: "mdefPct",
		per: 2,
		color: "#3fc7d6",
		classes: "Mage"
	},
	emerald: {
		name: "Emerald",
		stat: "hpPct",
		per: 2.5,
		color: "#23a85a",
		classes: "Knight · Mage"
	},
	topaz: {
		name: "Topaz",
		stat: "crit",
		per: .6,
		color: "#f2b632",
		classes: "Archer"
	},
	garnet: {
		name: "Garnet",
		stat: "critDmg",
		per: 3,
		color: "#8e1838",
		classes: "Archer · Knight"
	},
	peridot: {
		name: "Peridot",
		stat: "acc",
		per: .5,
		color: "#a4d63a",
		classes: "Archer"
	},
	opal: {
		name: "Opal",
		stat: "dodge",
		per: .4,
		color: "#e8d9f2",
		classes: "Archer"
	},
	onyx: {
		name: "Onyx",
		stat: "block",
		per: .5,
		color: "#5a5a66",
		classes: "Knight"
	},
	obsidian: {
		name: "Obsidian",
		stat: "pen",
		per: .5,
		color: "#2b1d3a",
		classes: "Knight · Archer"
	},
	moonstone: {
		name: "Moonstone",
		stat: "mpen",
		per: .5,
		color: "#bcd3f5",
		classes: "Mage"
	},
	pearl: {
		name: "Pearl",
		stat: "heal",
		per: 2,
		color: "#f5efe0",
		classes: "Any"
	}
};
var GEM_TYPES = Object.keys(GEMS);
var GEM_TIER_NAMES = [
	"Chipped",
	"Flawed",
	"Clear",
	"Flawless",
	"Royal"
];
/** Gem keys look like "ruby:3". */
var gemKey = (t, tier) => `${t}:${tier}`;
function parseGem(k) {
	const [t, n] = k.split(":");
	const tier = Number(n);
	return t in GEMS && tier >= 1 && tier <= 5 ? {
		type: t,
		tier
	} : null;
}
var gemName = (k) => {
	const g = parseGem(k);
	return g ? `${GEM_TIER_NAMES[g.tier - 1]} ${GEMS[g.type].name}` : "?";
};
/** Bonus a gem gives: per × tier². */
var gemValue = (k) => {
	const g = parseGem(k);
	return g ? +(GEMS[g.type].per * g.tier * g.tier).toFixed(1) : 0;
};
var socketCount = (it) => it.rarity >= 5 ? 3 : it.rarity >= 3 ? 2 : it.rarity >= 1 ? 1 : 0;
var sockets = (it) => Array.from({ length: socketCount(it) }, (_, i) => it.gems?.[i] ?? null);
/** Fusing costs gold (scaled to the hero's level) and one Soul Essence per tier. */
var fuseCost = (tier, level = 1) => ({
	gold: scaledGold(200 * tier * tier, level),
	essence: tier
});
function findOwned(h, itemId) {
	return Object.values(h.equipment).find((i) => i?.id === itemId) ?? h.inventory.find((i) => i.id === itemId);
}
function insertGem(h, itemId, socket, key) {
	const it = findOwned(h, itemId);
	if (!it) return "Item not found";
	if (!parseGem(key)) return "Invalid gem";
	if (socket < 0 || socket >= socketCount(it)) return "No such socket";
	if ((h.gems?.[key] ?? 0) < 1) return "You don't own that gem";
	const cur = sockets(it);
	if (cur[socket]) return "Socket is occupied — remove the gem first";
	cur[socket] = key;
	it.gems = cur;
	h.gems = {
		...h.gems,
		[key]: h.gems[key] - 1
	};
	return null;
}
function removeGem(h, itemId, socket) {
	const it = findOwned(h, itemId);
	if (!it) return "Item not found";
	const cur = sockets(it);
	const key = cur[socket];
	if (!key) return "Socket is empty";
	cur[socket] = null;
	it.gems = cur;
	h.gems = {
		...h.gems ?? {},
		[key]: (h.gems?.[key] ?? 0) + 1
	};
	return null;
}
/** Fuse 3 gems of one type & tier into one of the next tier. */
function fuseGem(h, key) {
	const g = parseGem(key);
	if (!g) return "Invalid gem";
	if (g.tier >= 5) return "Already max tier";
	if ((h.gems?.[key] ?? 0) < 3) return `Needs 3 of this gem`;
	const c = fuseCost(g.tier, h.level);
	if (h.gold < c.gold) return "Not enough gold";
	if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
	h.gold -= c.gold;
	spendMats(h, { essence: c.essence });
	const next = gemKey(g.type, g.tier + 1);
	h.gems = {
		...h.gems,
		[key]: h.gems[key] - 3,
		[next]: (h.gems?.[next] ?? 0) + 1
	};
	return null;
}
var GEM_CUT_COST = {
	ore: 8,
	gold: 150
};
/** Targeted cut: choose the gem type for triple cost. */
var GEM_TARGET_COST = {
	ore: 24,
	gold: 450,
	essence: 1
};
/** What a cut costs right now: the gold part rises with the hero's level. */
var gemCutCost = (level = 1, type) => {
	const c = type ? GEM_TARGET_COST : {
		...GEM_CUT_COST,
		essence: 0
	};
	return {
		ore: c.ore,
		gold: scaledGold(c.gold, level),
		essence: c.essence
	};
};
/** Cut a tier-1 gem from ore: random type, or a chosen type at GEM_TARGET_COST. */
function cutGem(h, rand = Math.random, type) {
	const c = gemCutCost(h.level, type);
	if (matCount(h, "ore") < c.ore) return "Not enough Ember Ore";
	if (h.gold < c.gold) return "Not enough gold";
	if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
	h.gold -= c.gold;
	spendMats(h, {
		ore: c.ore,
		essence: c.essence
	});
	const k = gemKey(type ?? GEM_TYPES[Math.floor(rand() * GEM_TYPES.length)], 1);
	h.gems = {
		...h.gems ?? {},
		[k]: (h.gems?.[k] ?? 0) + 1
	};
	return k;
}
function gemFx(eq) {
	const out = zeroFx();
	for (const it of Object.values(eq)) {
		if (!it) continue;
		for (const k of sockets(it)) {
			const g = k && parseGem(k);
			if (g) out[GEMS[g.type].stat] += gemValue(k);
		}
	}
	return out;
}
/** Keep keys in sync with the bases array in the lucky_shot database function. */
var ASTRAL_BASES = {
	ember: {
		name: "Ember Wyrm",
		kind: "offense",
		stat: "atkPct",
		per: 1.5,
		power: "Firebrand: stokes your weapons with living flame"
	},
	arcana: {
		name: "Arcane Moth",
		kind: "offense",
		stat: "matkPct",
		per: 1.5,
		power: "Spellweave: threads raw arcana through your spells"
	},
	aegis: {
		name: "Aegis Turtle",
		kind: "defense",
		stat: "defPct",
		per: 1.5,
		power: "Bulwark: raises a shield of solid stone around you"
	},
	ward: {
		name: "Ward Serpent",
		kind: "defense",
		stat: "mdefPct",
		per: 1.5,
		power: "Warding Coil: coils mystic wards against hostile magic"
	},
	oak: {
		name: "Elder Oak",
		kind: "defense",
		stat: "hpPct",
		per: 2,
		power: "Deep Roots: roots you in life and thickens your hide"
	},
	owl: {
		name: "Star Owl",
		kind: "utility",
		stat: "crit",
		per: .5,
		power: "Keen Gaze: marks the weak points on every foe"
	},
	fang: {
		name: "Night Fang",
		kind: "offense",
		stat: "critDmg",
		per: 4,
		power: "Night Strike: makes every killing blow land deeper"
	},
	hawk: {
		name: "Sky Hawk",
		kind: "utility",
		stat: "acc",
		per: .4,
		power: "Hunter's Eye: guides your strikes true"
	},
	wisp: {
		name: "Wind Wisp",
		kind: "utility",
		stat: "dodge",
		per: .4,
		power: "Slipstream: wraps you in a gust that turns blows aside"
	},
	turtle: {
		name: "Stone Tortoise",
		kind: "defense",
		stat: "block",
		per: .4,
		power: "Shellguard: braces you to shrug off the heaviest hits"
	},
	spear: {
		name: "Spear Mantis",
		kind: "offense",
		stat: "pen",
		per: .4,
		power: "Piercing Strike: punches clean through enemy armour"
	},
	rune: {
		name: "Rune Fox",
		kind: "offense",
		stat: "mpen",
		per: .4,
		power: "Runebind: carves through magical defences"
	},
	lotus: {
		name: "Moon Lotus",
		kind: "utility",
		stat: "heal",
		per: 1.5,
		power: "Moonbloom: petals that mend wounds and deepen heals"
	}
};
/** Six rarities: Grey, Green, Blue, Purple, Orange, Gold. */
var ASTRAL_RARITY = [
	"Grey",
	"Green",
	"Blue",
	"Purple",
	"Orange",
	"Gold"
];
var ASTRAL_COLORS = [
	"#9a9a9a",
	"#3fbf5a",
	"#3b82f6",
	"#a855f7",
	"#f97316",
	"#facc15"
];
/** Lucky Shot / summon odds in % per rarity (index = rarity). Must match the lucky_shot database function. */
var ASTRAL_ODDS = [
	40,
	30,
	17,
	9,
	3.5,
	.5
];
/** Slots 1-3 are open from the start; every further slot wakes every 10 levels. */
var ASTRAL_SLOT_LEVELS = [
	1,
	1,
	1,
	10,
	20,
	30,
	40,
	50
];
var astralUpgradeCost = (a) => 2 + a.lvl * (a.rarity + 1);
var astralValue = (a) => +(ASTRAL_BASES[a.base].per * (1 + a.rarity) * (1 + a.lvl * .15)).toFixed(1);
var astralLabel = (a) => `${ASTRAL_RARITY[a.rarity]} ${ASTRAL_BASES[a.base]?.name ?? "Astral"} Lv${a.lvl}`;
var astralStatText = (a) => `+${astralValue(a)}${STAT_LABEL[ASTRAL_BASES[a.base].stat]}`;
function rollAstralRarity(r) {
	let acc = 0;
	for (let i = ASTRAL_ODDS.length - 1; i >= 0; i--) {
		acc += ASTRAL_ODDS[i];
		if (r < acc) return i;
	}
	return 0;
}
function summonAstral(h, rand = Math.random) {
	if (matCount(h, "starshard") < 10) return `Needs 10 Starshards`;
	spendMats(h, { starshard: 10 });
	const rarity = rollAstralRarity(rand() * 100);
	const bases = Object.keys(ASTRAL_BASES);
	const a = {
		id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
		base: bases[Math.floor(rand() * bases.length)],
		rarity,
		lvl: 0
	};
	h.astrals = [...h.astrals ?? [], a];
	return a;
}
function upgradeAstral(h, id) {
	const a = h.astrals?.find((x) => x.id === id);
	if (!a) return "Astral not found";
	if (a.lvl >= 20) return "Max level";
	const c = astralUpgradeCost(a);
	if (matCount(h, "starshard") < c) return `Needs ${c} Starshards`;
	spendMats(h, { starshard: c });
	a.lvl++;
	return null;
}
/** Feed a duplicate (same species, not equipped) into an Astral: +2 levels per duplicate, +1 more per duplicate rarity. */
function absorbAstral(h, targetId, foodId) {
	const t = h.astrals?.find((x) => x.id === targetId);
	const f = h.astrals?.find((x) => x.id === foodId);
	if (!t || !f || t.id === f.id) return "Astral not found";
	if (t.base !== f.base) return "Only duplicates of the same species can be absorbed";
	if ((h.astralSlots ?? []).includes(f.id)) return "Unequip the duplicate first";
	if (t.lvl >= 20) return "Max level";
	t.lvl = Math.min(20, t.lvl + 2 + f.rarity);
	h.astrals = h.astrals.filter((x) => x.id !== f.id);
	return null;
}
function equipAstral(h, id, slot) {
	if (slot < 0 || slot >= 8) return "No such slot";
	if (h.level < ASTRAL_SLOT_LEVELS[slot]) return `Slot ${slot + 1} wakes at level ${ASTRAL_SLOT_LEVELS[slot]}`;
	if (id && !h.astrals?.some((a) => a.id === id)) return "Astral not found";
	const s = Array.from({ length: 8 }, (_, i) => h.astralSlots?.[i] ?? null).map((x) => x === id ? null : x);
	s[slot] = id;
	h.astralSlots = s;
	return null;
}
function astralFx(h) {
	const out = zeroFx();
	for (const id of h.astralSlots ?? []) {
		const a = id ? h.astrals?.find((x) => x.id === id) : void 0;
		if (a && ASTRAL_BASES[a.base]) out[ASTRAL_BASES[a.base].stat] += astralValue(a);
	}
	return out;
}
/** Collection milestone: distinct astral species owned. */
var ASTRAL_MILESTONES = [
	{
		n: 3,
		gold: 1e3
	},
	{
		n: 6,
		gold: 5e3
	},
	{
		n: 13,
		gold: 25e3
	}
];
/** What a recipe's gold cost comes to for a hero of this level. */
var recipeGold = (r, level = 1) => scaledGold(r.gold, level);
var RECIPES = [
	{
		id: "rare",
		name: "Forged Rare piece",
		rarity: 2,
		mats: {
			ore: 20,
			essence: 2
		},
		gold: 500,
		minLevel: 1,
		desc: "A guaranteed Rare item for the chosen slot."
	},
	{
		id: "epic",
		name: "Forged Epic piece",
		rarity: 3,
		mats: {
			ore: 90,
			essence: 16
		},
		gold: 2500,
		minLevel: 15,
		desc: "A guaranteed Epic item with 2 sockets."
	},
	{
		id: "legend",
		name: "Boss-forged Legendary",
		rarity: 4,
		mats: {
			ore: 220,
			essence: 40,
			bossCore: 6
		},
		gold: 12e3,
		minLevel: 35,
		desc: "Legendary gear forged from boss cores."
	},
	{
		id: "mythic",
		name: "Mythic Masterwork",
		rarity: 5,
		mats: {
			ore: 520,
			essence: 110,
			bossCore: 20
		},
		gold: 6e4,
		minLevel: 60,
		desc: "Mythic gear with 3 sockets."
	},
	{
		id: "sentinel",
		name: "Iron Sentinel",
		rarity: 3,
		mats: {
			ore: 120,
			essence: 12,
			fragment: 18,
			sigil: 5
		},
		gold: 3200,
		minLevel: 20,
		desc: "An Epic sentinel piece forged from elite trophies. Two gem sockets."
	},
	{
		id: "starweave",
		name: "Starweave Relic",
		rarity: 4,
		mats: {
			ore: 190,
			essence: 50,
			starshard: 40,
			bossCore: 6
		},
		gold: 15e3,
		minLevel: 40,
		desc: "A Legendary Starweave piece for your chosen slot. Two gem sockets."
	},
	{
		id: "voidforged",
		name: "Voidforged Sovereign",
		rarity: 5,
		mats: {
			ore: 620,
			essence: 150,
			starshard: 80,
			bossCore: 24,
			sigil: 30
		},
		gold: 8e4,
		minLevel: 80,
		desc: "A Mythic sovereign piece for Ascension builds. Three gem sockets."
	}
];
/** The Ancestral tier: one heirloom per slot, forged only after the Sanctuary trials are complete.
*  Every piece costs millions of gold once the hero's level is taken into account, plus a vault of
*  materials — this is the long-term goal the whole forge feeds into. */
var ANCESTRAL_RECIPES = [
	{
		id: "ancestral_helmet",
		name: "Ancestral Helm",
		slot: "helmet",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 12e5,
		desc: "Ancestral headpiece. Three gem sockets and the highest bonus in the game.",
		mats: {
			ore: 800,
			essence: 200,
			bossCore: 40,
			fragment: 300,
			sigil: 80,
			crystal: 100,
			ancientBone: 20,
			voidShard: 10,
			emberHeart: 5
		}
	},
	{
		id: "ancestral_armour",
		name: "Ancestral Plate",
		slot: "armour",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 18e5,
		desc: "Ancestral chestpiece, the heart of the set.",
		mats: {
			ore: 1e3,
			essence: 250,
			bossCore: 60,
			fragment: 400,
			sigil: 100,
			crystal: 120,
			ancientBone: 30,
			voidShard: 15,
			emberHeart: 8
		}
	},
	{
		id: "ancestral_boots",
		name: "Ancestral Greaves",
		slot: "boots",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 11e5,
		desc: "Ancestral greaves, forged around a crystal core.",
		mats: {
			ore: 700,
			essence: 180,
			bossCore: 30,
			fragment: 250,
			sigil: 70,
			crystal: 90,
			ancientBone: 18,
			voidShard: 8,
			emberHeart: 4
		}
	},
	{
		id: "ancestral_belt",
		name: "Ancestral Girdle",
		slot: "belt",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 11e5,
		desc: "Ancestral warbelt, bound with elite sigils.",
		mats: {
			ore: 700,
			essence: 180,
			bossCore: 30,
			fragment: 250,
			sigil: 70,
			crystal: 90,
			ancientBone: 18,
			voidShard: 8,
			emberHeart: 4
		}
	},
	{
		id: "ancestral_weapon",
		name: "Ancestral Relic Weapon",
		slot: "weapon",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 16e5,
		desc: "Ancestral weapon, quenched in starshard light.",
		mats: {
			ore: 900,
			essence: 230,
			bossCore: 50,
			fragment: 350,
			sigil: 90,
			starshard: 80,
			ancientBone: 25,
			voidShard: 12,
			emberHeart: 6
		}
	},
	{
		id: "ancestral_ring",
		name: "Ancestral Signet",
		slot: "ring",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 1e6,
		desc: "Ancestral ring set with a star-cut stone.",
		mats: {
			ore: 600,
			essence: 220,
			bossCore: 25,
			fragment: 200,
			sigil: 60,
			starshard: 90,
			crystal: 120,
			ancientBone: 15,
			voidShard: 8,
			emberHeart: 4
		}
	},
	{
		id: "ancestral_talisman",
		name: "Ancestral Reliquary",
		slot: "talisman",
		rarity: 6,
		ancestral: true,
		minLevel: 80,
		gold: 105e4,
		desc: "Ancestral reliquary, holding the last of the old magic.",
		mats: {
			ore: 650,
			essence: 240,
			bossCore: 30,
			fragment: 220,
			sigil: 65,
			starshard: 100,
			crystal: 130,
			ancientBone: 16,
			voidShard: 10,
			emberHeart: 5
		}
	}
];
/** Armor slots: Rare and better armor exists only through crafting. */
var ARMOR_SLOTS = [
	"helmet",
	"armour",
	"boots",
	"belt"
];
var isArmor = (s) => ARMOR_SLOTS.includes(s);
/** Extra ingredients armor recipes need on top of the base recipe. */
var ARMOR_EXTRA = {
	rare: { fragment: 5 },
	epic: {
		fragment: 22,
		sigil: 4
	},
	legend: {
		fragment: 45,
		sigil: 10
	},
	mythic: {
		fragment: 110,
		sigil: 24
	},
	sentinel: {
		fragment: 22,
		sigil: 4
	},
	starweave: {
		fragment: 45,
		sigil: 10
	},
	voidforged: {
		fragment: 110,
		sigil: 24
	}
};
var recipeMats = (r, slot) => {
	if (!isArmor(slot)) return r.mats;
	const out = { ...r.mats };
	for (const [k, v] of Object.entries(ARMOR_EXTRA[r.id] ?? {})) out[k] = (out[k] ?? 0) + v;
	return out;
};
function craftBlocker(h, r, invCap, slot = "weapon") {
	if (r.ancestral && !h.anc?.done) return "Complete the Ancestral Sanctuary trials";
	if (h.level + h.paragon < r.minLevel) return `Requires level ${r.minLevel}`;
	if (h.gold < recipeGold(r, h.level)) return "Not enough gold";
	if (!hasMats(h, recipeMats(r, slot))) return "Missing materials";
	if (h.inventory.length >= invCap) return "Bag is full";
	return null;
}
/** Spends costs and returns the new item; caller provides item factory. */
function craft(h, r, invCap, make, slot = "weapon") {
	const b = craftBlocker(h, r, invCap, slot);
	if (b) return b;
	h.gold -= recipeGold(r, h.level);
	spendMats(h, recipeMats(r, slot));
	const it = {
		...make(),
		crafted: true
	};
	h.inventory.unshift(it);
	h.crafts = (h.crafts ?? 0) + 1;
	return it;
}
var emptyRecord = () => ({
	battles: 0,
	wins: 0,
	losses: 0,
	bosses: 0,
	arenaWins: 0,
	enhances: 0,
	bestEnh: 0
});
/** Append a finished battle to the hero's record and history (newest first). */
function recordBattle(h, e) {
	const r = {
		...emptyRecord(),
		...h.record ?? {}
	};
	r.battles++;
	if (e.won) {
		r.wins++;
		if (e.boss) r.bosses++;
		if (e.arena) r.arenaWins++;
	} else r.losses++;
	h.record = r;
	h.history = [{
		t: Date.now(),
		title: e.title,
		won: e.won,
		boss: e.boss,
		rewards: e.rewards.slice(0, 4)
	}, ...h.history ?? []].slice(0, 30);
}
function recordEnhance(h, newEnh) {
	const r = {
		...emptyRecord(),
		...h.record ?? {}
	};
	r.enhances++;
	r.bestEnh = Math.max(r.bestEnh, newEnh);
	h.record = r;
}
var rec = (h) => ({
	...emptyRecord(),
	...h.record ?? {}
});
var tiers = (base, id, names, goals, golds, titles) => goals.map((goal, i) => ({
	...base,
	id: `${id}_${i + 1}`,
	name: names[i],
	goal,
	gold: golds[i],
	title: titles[i]
}));
var ACHIEVEMENTS = [
	...tiers({
		cat: "Combat",
		desc: "Win battles",
		value: (h) => rec(h).wins
	}, "wins", [
		"Blooded",
		"Veteran",
		"Warmaster"
	], [
		10,
		100,
		1e3
	], [
		200,
		2e3,
		2e4
	], [
		void 0,
		"Veteran",
		"Warmaster"
	]),
	...tiers({
		cat: "Bosses",
		desc: "Defeat bosses",
		value: (h) => rec(h).bosses
	}, "boss", [
		"Giant Slayer",
		"Bane of Tyrants",
		"Godkiller"
	], [
		1,
		10,
		50
	], [
		500,
		5e3,
		3e4
	], [
		void 0,
		"Tyrantbane",
		"Godkiller"
	]),
	...tiers({
		cat: "Progression",
		desc: "Reach character level",
		value: (h) => h.level
	}, "lvl", [
		"Rising Hero",
		"Seasoned",
		"Legend"
	], [
		10,
		40,
		80
	], [
		300,
		3e3,
		15e3
	], [
		void 0,
		void 0,
		"Legend"
	]),
	...tiers({
		cat: "Progression",
		desc: "Clear campaign stages",
		value: (h) => h.stage - 1
	}, "stage", ["Wanderer", "Conqueror of Realms"], [10, 50], [400, 8e3], [void 0, "Realmbreaker"]),
	...tiers({
		cat: "Progression",
		desc: "Climb Endless Conquest floors",
		value: (h) => h.spire - 1
	}, "spire", ["Climber", "Spire Lord"], [10, 100], [1e3, 25e3], [void 0, "Spire Lord"]),
	...tiers({
		cat: "Progression",
		desc: "Gain Ascension levels",
		value: (h) => h.paragon
	}, "asc", ["Ascendant"], [10], [2e4], ["Ascended"]),
	...tiers({
		cat: "Crafting",
		desc: "Successfully enhance gear",
		value: (h) => rec(h).enhances
	}, "enh", ["Apprentice Smith", "Master Smith"], [10, 100], [300, 5e3], [void 0, "Master Smith"]),
	...tiers({
		cat: "Crafting",
		desc: "Enhance one item to +N",
		value: (h) => rec(h).bestEnh
	}, "enhmax", ["Tempered", "Flawless"], [5, 10], [1e3, 1e4], [void 0, "Flawless"]),
	...tiers({
		cat: "Arena",
		desc: "Win arena fights",
		value: (h) => rec(h).arenaWins
	}, "arena", ["Gladiator", "Arena Champion"], [5, 50], [800, 12e3], ["Gladiator", "Champion of Blood"]),
	...tiers({
		cat: "Collection",
		desc: "Wear a full 6-piece gear set",
		value: (h) => Math.max(0, ...activeSets(h.equipment).map((s) => s.count))
	}, "set", ["Matched", "Fully Armored"], [2, 6], [500, 8e3], [void 0, "Paragon of Steel"]),
	...tiers({
		cat: "Conquest",
		desc: "Climb Endless Conquest floors",
		value: (h) => h.spire - 1
	}, "spire2", [
		"Daring Climber",
		"Tower Climber",
		"Unstoppable"
	], [
		25,
		50,
		200
	], [
		3e3,
		15e3,
		5e4
	], [
		void 0,
		void 0,
		"Unstoppable"
	]),
	...tiers({
		cat: "Conquest",
		desc: "Collect Conquest Tokens total",
		value: (h) => h.conquest?.tokens ?? 0
	}, "ctokens", ["Token Hoarder", "Token Baron"], [200, 2e3], [1e3, 1e4], [void 0, "Token Baron"]),
	...tiers({
		cat: "Ancestral",
		desc: "Reach level 80 and unlock Ancestral",
		value: (h) => h.anc?.done ? 1 : 0
	}, "ancunlock", ["Heritage Awakened"], [1], [25e3], ["Heritage Bearer"]),
	...tiers({
		cat: "Ancestral",
		desc: "Clear Ancestral Tower floors",
		value: (h) => h.ancTower?.bestFloor ?? 0
	}, "ancfloor", [
		"Ancestral Initiate",
		"Ancestral Adept",
		"Ancestral Master"
	], [
		1,
		5,
		20
	], [
		2e3,
		1e4,
		5e4
	], [
		void 0,
		void 0,
		"Ancestral Master"
	]),
	...tiers({
		cat: "Enchanting",
		desc: "Enhance one item to +N",
		value: (h) => rec(h).bestEnh
	}, "enh2", [
		"Refined",
		"Exquisite",
		"Transcendent"
	], [
		8,
		12,
		15
	], [
		3e3,
		15e3,
		4e4
	], [
		void 0,
		void 0,
		"Transcendent"
	]),
	...tiers({
		cat: "Crafting",
		desc: "Craft items at the Forge",
		value: (h) => h.crafts ?? 0
	}, "crafts", [
		"Forgehand",
		"Master Forgehand",
		"Legendary Forgehand"
	], [
		5,
		25,
		100
	], [
		500,
		3e3,
		15e3
	], [
		void 0,
		void 0,
		"Legendary Forgehand"
	]),
	...tiers({
		cat: "Arena",
		desc: "Win arena fights",
		value: (h) => rec(h).arenaWins
	}, "arena2", [
		"Duelist",
		"Centurion",
		"Arena Legend"
	], [
		20,
		100,
		250
	], [
		2e3,
		1e4,
		3e4
	], [
		void 0,
		void 0,
		"Arena Legend"
	]),
	...tiers({
		cat: "Bosses",
		desc: "Defeat bosses",
		value: (h) => rec(h).bosses
	}, "boss2", [
		"Boss Hunter",
		"Scourge of Bosses",
		"World Ender"
	], [
		25,
		100,
		250
	], [
		2e3,
		1e4,
		5e4
	], [
		void 0,
		"Scourge",
		"World Ender"
	]),
	...tiers({
		cat: "Progression",
		desc: "Gain Ascension levels",
		value: (h) => h.paragon
	}, "asc2", ["Exalted", "Celestial"], [25, 50], [4e4, 1e5], ["Exalted", "Celestial"]),
	...tiers({
		cat: "Collection",
		desc: "Own distinct Astral species",
		value: (h) => new Set((h.astrals ?? []).map((a) => a.base)).size
	}, "astral2", ["Star Tamer", "Astral Lord"], [5, 10], [2e3, 1e4], [void 0, "Astral Lord"])
];
var achProgress = (h, a) => Math.min(a.goal, Math.max(0, a.value(h)));
var isClaimable = (h, a) => achProgress(h, a) >= a.goal && !(h.achClaimed ?? []).includes(a.id);
/** Titles unlocked by claimed achievements. */
var earnedTitles = (h) => ACHIEVEMENTS.filter((a) => a.title && (h.achClaimed ?? []).includes(a.id)).map((a) => a.title);
/** Gear sets are the item families named by their prefix (e.g. "Bloodforged"). */
var SET_NAMES = [
	"Worn",
	"Iron",
	"Bloodforged",
	"Moonlit",
	"Dread",
	"Abyssal",
	"Crimson",
	"Soulbound",
	"Eclipse",
	"Ancient",
	"Ancestral"
];
var SET_BONUSES = [
	{
		pieces: 2,
		fx: { atkPct: 4 },
		label: "+4% attack"
	},
	{
		pieces: 4,
		fx: {
			defPct: 6,
			hpPct: 6
		},
		label: "+6% defense & health"
	},
	{
		pieces: 6,
		fx: {
			atkPct: 8,
			crit: 3
		},
		label: "+8% attack & +3% crit"
	}
];
function setOf(item) {
	const first = item.name.split(" ")[0];
	return SET_NAMES.includes(first) ? first : null;
}
function activeSets(eq) {
	const counts = {};
	for (const it of Object.values(eq)) {
		if (!it) continue;
		const s = setOf(it);
		if (s) counts[s] = (counts[s] ?? 0) + 1;
	}
	return Object.entries(counts).map(([name, count]) => ({
		name,
		count
	})).sort((a, b) => b.count - a.count);
}
function setFx(eq) {
	const out = {
		atkPct: 0,
		defPct: 0,
		hpPct: 0,
		crit: 0
	};
	for (const s of activeSets(eq)) for (const b of SET_BONUSES) if (s.count >= b.pieces) for (const k of Object.keys(b.fx)) out[k] += b.fx[k] ?? 0;
	return out;
}
function barracksLevel(h) {
	const l = Math.floor(h.buildings?.["barracks"] ?? 1);
	return Math.max(1, Math.min(30, l));
}
/** Gold to go from `level` to `level + 1`, scaled by the hero's own level like every other gold price. */
var barracksCost = (level, heroLevel = 1) => scaledGold(600 * Math.pow(level, 1.55), heroLevel);
/** Every level drills the troops harder: 2% cheaper training per level, with extra instructor grades at 20, 25 and 30. */
function trainingDiscount(h) {
	const l = barracksLevel(h);
	const grades = (l >= 20 ? .05 : 0) + (l >= 25 ? .05 : 0) + (l >= 30 ? .05 : 0);
	return Math.min(.6, (l - 1) * .02 + grades);
}
/** Batch sizes the barracks has drilled up to. */
function batchSizes(h) {
	const l = barracksLevel(h);
	return BATCH_UNLOCKS.filter((b) => l >= b.level).map((b) => b.size);
}
var BATCH_UNLOCKS = [
	{
		level: 1,
		size: 1
	},
	{
		level: 3,
		size: 5
	},
	{
		level: 6,
		size: 10
	},
	{
		level: 10,
		size: 25
	},
	{
		level: 15,
		size: 50
	}
];
var BARRACKS_UNLOCKS = [
	{
		level: 3,
		name: "Squad drills",
		desc: "+5 points in one training batch"
	},
	{
		level: 6,
		name: "Company drills",
		desc: "+10 points in one training batch"
	},
	{
		level: 10,
		name: "Legion drills",
		desc: "+25 points in one training batch"
	},
	{
		level: 15,
		name: "Warband drills",
		desc: "+50 points in one training batch"
	},
	{
		level: 20,
		name: "Instructor corps",
		desc: "Training gold cost drops a further 5%"
	},
	{
		level: 25,
		name: "Elite instructors",
		desc: "Training gold cost drops a further 5%"
	},
	{
		level: 30,
		name: "Grandmasters at arms",
		desc: "Training gold cost drops a further 5%"
	}
];
/** Spend gold to raise the barracks one level. Returns an error string, or null on success. */
function upgradeBarracks(h) {
	const level = barracksLevel(h);
	if (level >= 30) return "The barracks is at its final level";
	const cost = barracksCost(level, h.level);
	if (h.gold < cost) return "Not enough gold";
	h.gold -= cost;
	h.buildings = {
		...h.buildings ?? {},
		barracks: level + 1
	};
	return null;
}
var DRILL_STAT_LABEL = {
	atkPct: "attack",
	defPct: "defense",
	hpPct: "health",
	crit: "crit chance",
	acc: "accuracy",
	dodge: "dodge",
	block: "block",
	heal: "healing power"
};
/** Health is the drill yard's first lesson and its deepest one, so every hero can always buy more life. */
var DRILLS = [
	{
		id: "vitality",
		name: "Vital Reserves",
		stat: "hpPct",
		per: 2,
		max: 10,
		base: 800,
		barracks: 1,
		desc: "Deep-breathing drills that widen your well of life."
	},
	{
		id: "weapons",
		name: "Weapon Drill",
		stat: "atkPct",
		per: 1,
		max: 10,
		base: 900,
		barracks: 1,
		desc: "Drill every swing until the arm never tires."
	},
	{
		id: "shields",
		name: "Shield Wall Drill",
		stat: "defPct",
		per: 1,
		max: 10,
		base: 900,
		barracks: 3,
		desc: "Locking shields, rank after rank."
	},
	{
		id: "endurance",
		name: "Endurance Runs",
		stat: "hpPct",
		per: 1.5,
		max: 10,
		base: 1100,
		barracks: 6,
		desc: "Long marches that harden the body."
	},
	{
		id: "recovery",
		name: "Battlefield Recovery",
		stat: "heal",
		per: 1,
		max: 10,
		base: 1400,
		barracks: 8,
		desc: "Field dressings that make every restoration count."
	},
	{
		id: "focus",
		name: "Focus Drills",
		stat: "crit",
		per: .5,
		max: 10,
		base: 1300,
		barracks: 10,
		desc: "Reading the opening in a guard."
	},
	{
		id: "toughness",
		name: "Body Tempering",
		stat: "hpPct",
		per: 3,
		max: 10,
		base: 4500,
		barracks: 12,
		desc: "Strike the body until it stops yielding."
	},
	{
		id: "marksman",
		name: "Marksman Drill",
		stat: "acc",
		per: .5,
		max: 8,
		base: 1e3,
		barracks: 14,
		desc: "Nothing but the mark and the breath."
	},
	{
		id: "guardwork",
		name: "Guard Drill",
		stat: "block",
		per: .5,
		max: 10,
		base: 1600,
		barracks: 16,
		desc: "Turn the blade aside instead of taking it."
	},
	{
		id: "footwork",
		name: "Footwork Drill",
		stat: "dodge",
		per: .5,
		max: 8,
		base: 1e3,
		barracks: 18,
		desc: "Steps that leave a blade cutting air."
	}
];
/** Ranks a hero has drilled in one track. */
var drillRank = (h, id) => Math.max(0, h.drills?.[id] ?? 0);
/** Gold for the next rank of a drill: each rank costs more, and the price scales with the hero's level. */
var drillCost = (d, rank, level = 1) => scaledGold(d.base * Math.pow(rank + 1, 1.7), level);
/** What one rank of a drill is worth as text (per rank, or banked so far). */
var drillText = (d, ranks = 1) => `+${+(d.per * ranks).toFixed(1)}% ${DRILL_STAT_LABEL[d.stat]}`;
/** Every bonus the hero's drilled ranks grant, in the shared bonus shape. */
function drillFx(h) {
	const out = {};
	for (const d of DRILLS) {
		const r = drillRank(h, d.id);
		if (r > 0) out[d.stat] = (out[d.stat] ?? 0) + d.per * r;
	}
	return out;
}
/** Why the next rank can't be trained, or null when it can. */
function drillBlocker(h, id) {
	const d = DRILLS.find((x) => x.id === id);
	if (!d) return "Unknown drill";
	const rank = drillRank(h, id);
	if (rank >= d.max) return "Fully drilled";
	if (barracksLevel(h) < d.barracks) return `Requires barracks level ${d.barracks}`;
	if (h.gold < drillCost(d, rank, h.level)) return "Not enough gold";
	return null;
}
/** Buy one rank of a drill with gold. Returns an error message, or null on success. */
function trainDrill(h, id) {
	const blocked = drillBlocker(h, id);
	if (blocked) return blocked;
	const d = DRILLS.find((x) => x.id === id);
	h.gold -= drillCost(d, drillRank(h, id), h.level);
	h.drills = {
		...h.drills ?? {},
		[id]: drillRank(h, id) + 1
	};
	return null;
}
var GUILD_CONTRIB_MIN = 1e3;
function contributeGold(h, gold) {
	if (gold < 1e3) return `Minimum ${GUILD_CONTRIB_MIN} gold`;
	if (h.gold < gold) return "Not enough gold";
	h.gold -= gold;
	h.guildCoins = (h.guildCoins ?? 0) + Math.floor(gold * 1);
	return null;
}
var GUILD_SKILLS = [
	{
		id: "g_atk",
		name: "Warlord's Might",
		desc: "+2% Physical & Magic Attack per rank",
		stat: "atkPct",
		per: 2,
		max: 15,
		baseCost: 1e3,
		costMult: 1.4
	},
	{
		id: "g_def",
		name: "Guardian's Aegis",
		desc: "+2% Physical & Magic Defense per rank",
		stat: "defPct",
		per: 2,
		max: 15,
		baseCost: 1e3,
		costMult: 1.4
	},
	{
		id: "g_hp",
		name: "Titan's Vigor",
		desc: "+3% Max HP per rank",
		stat: "hpPct",
		per: 3,
		max: 15,
		baseCost: 1e3,
		costMult: 1.4
	},
	{
		id: "g_crit",
		name: "Executioner's Eye",
		desc: "+0.5% Crit Chance per rank",
		stat: "crit",
		per: .5,
		max: 10,
		baseCost: 1500,
		costMult: 1.5
	},
	{
		id: "g_critDmg",
		name: "Devastation",
		desc: "+3% Crit Damage per rank",
		stat: "critDmg",
		per: 3,
		max: 10,
		baseCost: 1500,
		costMult: 1.5
	},
	{
		id: "g_pen",
		name: "Siegebreaker",
		desc: "+0.5% Armor Pen per rank",
		stat: "pen",
		per: .5,
		max: 10,
		baseCost: 2e3,
		costMult: 1.6
	},
	{
		id: "g_dodge",
		name: "Phantom Step",
		desc: "+0.3% Dodge per rank",
		stat: "dodge",
		per: .3,
		max: 8,
		baseCost: 2e3,
		costMult: 1.6
	},
	{
		id: "g_acc",
		name: "Trueshot",
		desc: "+0.5% Accuracy per rank",
		stat: "acc",
		per: .5,
		max: 8,
		baseCost: 1500,
		costMult: 1.5
	}
];
var guildSkillRank = (h, id) => h.guildSkills?.[id] ?? 0;
function guildSkillCost(skill, currentRank) {
	return Math.round(skill.baseCost * Math.pow(skill.costMult, currentRank));
}
function guildSkillBlocker(h, skill) {
	if (guildSkillRank(h, skill.id) >= skill.max) return "Max rank";
	return null;
}
function learnGuildSkill(h, id) {
	const skill = GUILD_SKILLS.find((s) => s.id === id);
	if (!skill) return "Unknown skill";
	const rank = guildSkillRank(h, skill.id);
	if (rank >= skill.max) return "Max rank";
	const cost = guildSkillCost(skill, rank);
	if ((h.guildCoins ?? 0) < cost) return `Need ${cost} guild coins`;
	h.guildCoins = (h.guildCoins ?? 0) - cost;
	h.guildSkills = {
		...h.guildSkills ?? {},
		[id]: rank + 1
	};
	return null;
}
/** Combat bonus from guild skill tower ranks — feeds into computeStats like drills/talents. */
function guildFx(h) {
	const out = zeroFx();
	if (!h.guildSkills) return out;
	for (const skill of GUILD_SKILLS) {
		const rank = h.guildSkills[skill.id] ?? 0;
		if (rank > 0) out[skill.stat] += skill.per * rank;
	}
	return out;
}
var GUILD_SHOP = [
	{
		id: "g_ore",
		name: "Ember Ore ×20",
		desc: "Common crafting material",
		cost: 500,
		mat: "ore",
		qty: 20
	},
	{
		id: "g_essence",
		name: "Soul Essence ×10",
		desc: "Used in crafting and fusion",
		cost: 1e3,
		mat: "essence",
		qty: 10
	},
	{
		id: "g_fragment",
		name: "Armor Fragment ×10",
		desc: "For Rare+ armor",
		cost: 1e3,
		mat: "fragment",
		qty: 10
	},
	{
		id: "g_hide",
		name: "Beast Hide ×20",
		desc: "Refines into Armor Fragments",
		cost: 400,
		mat: "hide",
		qty: 20
	},
	{
		id: "g_starshard",
		name: "Starshard ×5",
		desc: "For Astral summoning & upgrades",
		cost: 2e3,
		mat: "starshard",
		qty: 5
	},
	{
		id: "g_sigil",
		name: "Elite Sigil ×5",
		desc: "For Epic+ gear",
		cost: 2500,
		mat: "sigil",
		qty: 5
	},
	{
		id: "g_bossCore",
		name: "Boss Core ×3",
		desc: "For Legendary+ gear",
		cost: 3e3,
		mat: "bossCore",
		qty: 3
	},
	{
		id: "g_crystal",
		name: "Arcane Crystal ×5",
		desc: "Refines into Starshards",
		cost: 2e3,
		mat: "crystal",
		qty: 5
	},
	{
		id: "g_enchant3",
		name: "Enchantment Stone ×3",
		desc: "Enchant gear at the Forge (higher success)",
		cost: 1500,
		mat: "enchantStone",
		qty: 3
	},
	{
		id: "g_enchant10",
		name: "Enchantment Stone ×10",
		desc: "Bulk enchantment stones",
		cost: 4e3,
		mat: "enchantStone",
		qty: 10
	}
];
function buyGuildShopItem(h, id) {
	const item = GUILD_SHOP.find((i) => i.id === id);
	if (!item) return "Unknown item";
	if ((h.guildCoins ?? 0) < item.cost) return `Need ${item.cost} guild coins`;
	h.guildCoins = (h.guildCoins ?? 0) - item.cost;
	addMats(h, { [item.mat]: item.qty });
	return null;
}
var SLOTS = [
	"helmet",
	"armour",
	"boots",
	"belt",
	"weapon",
	"ring",
	"talisman"
];
var WEAR_SLOTS = [
	"helmet",
	"armour",
	"boots",
	"belt",
	"weapon",
	"ring",
	"ring2",
	"talisman"
];
var WEAR_LABEL = {
	helmet: "Head",
	armour: "Chest",
	boots: "Feet",
	belt: "Waist",
	weapon: "Weapon",
	ring: "Ring 1",
	ring2: "Ring 2",
	talisman: "Amulet"
};
/** The wear positions a piece of this item slot may occupy. */
var wearOf = (s) => s === "ring" ? ["ring", "ring2"] : [s];
var canEnterConquest = (level) => level >= 10;
/** Bag size for a hero including purchased rows. */
var invCap = (h) => 40 + 8 * (h.bagRows ?? 0);
/** Gold cost of the next bag row: 5,000 doubling each row, scaled by the hero's level. */
var bagRowCost = (h) => scaledGold(5e3 * 2 ** (h.bagRows ?? 0), h.level ?? 1);
var CLASSES = {
	warrior: {
		name: "Knight",
		img: hero_warrior_default,
		hp: 1.35,
		atk: 1,
		def: 1.35,
		crit: 0,
		dodge: 2,
		color: "var(--blood)",
		weaponName: "Blade"
	},
	mage: {
		name: "Mage",
		img: hero_mage_default,
		hp: .85,
		atk: 1.4,
		def: .85,
		crit: 5,
		dodge: 4,
		color: "var(--r3)",
		weaponName: "Wand"
	},
	archer: {
		name: "Archer",
		img: hero_archer_default,
		hp: 1,
		atk: 1.15,
		def: 1,
		crit: 12,
		dodge: 10,
		color: "var(--r1)",
		weaponName: "Bow"
	}
};
var RARITIES = [
	{
		name: "Common",
		mult: 1
	},
	{
		name: "Uncommon",
		mult: 1.25
	},
	{
		name: "Rare",
		mult: 1.6
	},
	{
		name: "Epic",
		mult: 2.1
	},
	{
		name: "Legendary",
		mult: 2.8
	},
	{
		name: "Mythic",
		mult: 3.8
	},
	{
		name: "Ancestral",
		mult: 5.2
	}
];
var C6 = {
	warrior: [
		62,
		156,
		250,
		343,
		437,
		530
	],
	mage: [
		692,
		785,
		878,
		971,
		1064,
		1157
	],
	archer: [
		1320,
		1413,
		1506,
		1599,
		1692,
		1785
	]
};
var C8 = {
	warrior: [
		66,
		134,
		202,
		270,
		338,
		406,
		474,
		542
	],
	mage: [
		697,
		765,
		833,
		901,
		969,
		1037,
		1105,
		1173
	],
	archer: [
		1327,
		1395,
		1463,
		1531,
		1599,
		1667,
		1735,
		1803
	]
};
var ROW6 = {
	helmet: [142, 80],
	armour: [266, 82],
	boots: [395, 80],
	belt: [517, 76],
	weapon: [633, 115]
};
var ATLAS_W = 1920;
var ATLAS_H = 1072;
function iconRect(item) {
	if (item.slot === "ring") {
		const i = item.icon % 16;
		return {
			x: C8[item.cls][i % 8],
			y: i >= 8 ? 856 : 792,
			w: 58,
			h: 56
		};
	}
	if (item.slot === "talisman") return {
		x: C8[item.cls][item.icon % 8],
		y: 958,
		w: 58,
		h: 58
	};
	const [y, h] = ROW6[item.slot];
	return {
		x: C6[item.cls][item.icon % 6],
		y,
		w: 84,
		h
	};
}
function iconCount(slot) {
	return slot === "ring" ? 16 : slot === "talisman" ? 8 : 6;
}
var PREFIX = [
	"Worn",
	"Iron",
	"Bloodforged",
	"Moonlit",
	"Dread",
	"Abyssal",
	"Crimson",
	"Soulbound",
	"Eclipse",
	"Ancient"
];
var SLOT_NAMES = {
	warrior: {
		helmet: "Helm",
		armour: "Plate",
		boots: "Greaves",
		belt: "Girdle",
		weapon: "Blade",
		ring: "Signet",
		talisman: "Sigil"
	},
	mage: {
		helmet: "Hood",
		armour: "Robe",
		boots: "Slippers",
		belt: "Sash",
		weapon: "Wand",
		ring: "Band",
		talisman: "Crystal"
	},
	archer: {
		helmet: "Cowl",
		armour: "Jerkin",
		boots: "Treads",
		belt: "Quiver Belt",
		weapon: "Bow",
		ring: "Loop",
		talisman: "Fang"
	}
};
var SUFFIX = [
	"",
	"",
	"of Ash",
	"of the Moon",
	"of Ruin",
	"of Kings",
	"of the Void",
	"of Eternity"
];
var rnd = (n) => Math.floor(Math.random() * n);
var uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
function rollRarity(stage, luck, minRarity = 0) {
	const r = Math.random() * 100 - Math.min(25, stage * .15 + luck * .05);
	return Math.max(r < 1 ? 5 : r < 4 ? 4 : r < 12 ? 3 : r < 30 ? 2 : r < 60 ? 1 : 0, minRarity);
}
function makeItem(cls, ilvl, rarity, slot) {
	const s = slot ?? SLOTS[rnd(SLOTS.length)];
	const count = iconCount(s);
	const tier = Math.min(count - 1, Math.floor(rarity / 5 * (count - 1)) + rnd(2));
	const prefix = PREFIX[Math.min(PREFIX.length - 1, rarity * 2 + rnd(2))];
	const suffix = rarity >= 2 ? SUFFIX[rnd(SUFFIX.length)] : "";
	return {
		id: uid(),
		slot: s,
		cls,
		rarity,
		ilvl: Math.max(1, Math.floor(ilvl)),
		icon: tier,
		enh: 0,
		name: `${prefix} ${SLOT_NAMES[cls][s]} ${suffix}`.trim()
	};
}
var ANC_NAMES = {
	warrior: "Vanguard",
	mage: "Arcanist",
	archer: "Hunt"
};
function makeAncestral(cls, ilvl, slot) {
	return {
		id: uid(),
		slot,
		cls,
		rarity: 6,
		ilvl: Math.max(1, Math.floor(ilvl)),
		icon: Math.floor(Math.random() * iconCount(slot)),
		enh: 0,
		anc: true,
		name: `Ancestral ${ANC_NAMES[cls]} ${SLOT_NAMES[cls][slot]}`
	};
}
function itemStats(it) {
	const base = (8 + it.ilvl * 4) * RARITIES[it.rarity].mult * (1 + it.enh * .12);
	const z = {
		atk: 0,
		def: 0,
		hp: 0,
		crit: 0
	};
	switch (it.slot) {
		case "weapon":
			z.atk = base * 1.6;
			break;
		case "armour":
			z.def = base * .9;
			z.hp = base * 3;
			break;
		case "helmet":
			z.def = base * .6;
			z.hp = base * 2;
			break;
		case "boots":
			z.def = base * .5;
			z.atk = base * .4;
			break;
		case "belt":
			z.hp = base * 3.5;
			break;
		case "ring":
			z.atk = base * .7;
			z.crit = 1 + it.rarity * 1.2;
			break;
		case "talisman":
			z.atk = base * .5;
			z.hp = base * 1.5;
			z.crit = it.rarity * .6;
	}
	return {
		atk: Math.round(z.atk),
		def: Math.round(z.def),
		hp: Math.round(z.hp),
		crit: +z.crit.toFixed(1)
	};
}
function itemScore(it) {
	const s = itemStats(it);
	return s.atk * 2 + s.def * 1.5 + s.hp * .2 + s.crit * 10;
}
function sellValue(it) {
	return Math.round(it.ilvl * 3 * RARITIES[it.rarity].mult * (1 + it.enh * .3));
}
/** What the Night Market charges for a piece, rising with the buyer's level. */
function buyPrice(it, level = 1) {
	return scaledGold(sellValue(it) * 4, level);
}
/** Enhancing at the Forge: the item's own level and the hero's level both raise the price. */
function enhanceCost(it, level = 1) {
	return scaledGold(it.ilvl * 10 * Math.pow(it.enh + 1, 1.5), level);
}
function enhanceChance(it) {
	return Math.max(.2, 1 - it.enh * .08);
}
/** Enchantment Stones needed to enhance: 1 per 3 enhancement levels. */
var enchantStoneCost = (it) => 1 + Math.floor(it.enh / 3);
/** Using enchantment stones boosts success chance by 15%. */
var enhanceStoneChance = (it) => Math.min(1, enhanceChance(it) + .15);
/** Which wear position a worn item occupies. */
function posOf(eq, id) {
	return WEAR_SLOTS.find((p) => eq[p]?.id === id);
}
/** The piece a new item would displace: nothing while a position is free, else the weakest worn one. */
function wornCompare(h, it) {
	const pos = wearOf(it.slot);
	if (pos.some((p) => !h.equipment[p])) return void 0;
	return h.equipment[weakestWorn(h.equipment, pos)];
}
/**
* Put a piece on: it fills the first free position for its slot, and when every position
* is taken it replaces the weakest one — a second ring never silently overwrites the first.
* Returns the position used, or null when the piece could not be worn.
*/
function equipItem(h, it, at) {
	const pos = wearOf(it.slot);
	const target = (at && pos.includes(at) ? at : void 0) ?? pos.find((p) => !h.equipment[p]) ?? weakestWorn(h.equipment, pos);
	if (!target) return null;
	h.inventory = h.inventory.filter((i) => i.id !== it.id);
	const old = h.equipment[target];
	if (old) h.inventory.unshift(old);
	h.equipment[target] = it;
	return target;
}
/** Take a worn piece off into the bag. False when the bag is full or the piece isn't worn. */
function unequipItem(h, it, cap) {
	const pos = posOf(h.equipment, it.id);
	if (!pos || h.inventory.length >= cap) return false;
	delete h.equipment[pos];
	h.inventory.unshift(it);
	return true;
}
function weakestWorn(eq, pos) {
	const filled = pos.filter((p) => eq[p]);
	return filled.length ? filled.reduce((a, b) => itemScore(eq[a]) <= itemScore(eq[b]) ? a : b) : void 0;
}
function newHero(name, cls) {
	return {
		name,
		cls,
		level: 1,
		xp: 0,
		paragon: 0,
		gold: 100,
		attrs: {
			str: 0,
			int: 0,
			agi: 0,
			vit: 0
		},
		equipment: {
			weapon: makeItem(cls, 1, 0, "weapon"),
			armour: makeItem(cls, 1, 0, "armour")
		},
		inventory: [],
		stage: 1,
		spire: 1,
		merchant: [],
		wins: 0
	};
}
function xpToNext(h) {
	if (h.level < 80) return Math.round(60 * Math.pow(h.level, 1.6) * lateLevelFactor(h.level));
	return Math.round(60 * Math.pow(80, 1.6) * lateLevelFactor(80) * Math.pow(1.05, h.paragon));
}
/** Extra XP multiplier per level: 1x up to Lv 40, then +7% compounding each level (~15x by Lv 80). */
function lateLevelFactor(level) {
	return Math.pow(1.07, Math.max(0, level - 40));
}
/** Upgrade old saves (Might/Vitality/Bulwark/Fortune) to Str/Int/Agi/Vit. */
function normalizeHero(h) {
	const a = h.attrs;
	if (a.int === void 0 || a.agi === void 0) h.attrs = {
		str: a.str ?? 0,
		int: 0,
		agi: a.luck ?? 0,
		vit: (a.vit ?? 0) + (a.armor ?? 0)
	};
	return h;
}
var MAGIC = {
	warrior: false,
	mage: true,
	archer: false
};
function computeStats(h, opts) {
	const tf = opts.talents ? talentFx(h) : {
		hpPct: 0,
		atkPct: 0,
		defPct: 0,
		crit: 0,
		dodge: 0,
		critDmg: 0,
		pen: 0
	};
	const xg = opts.gear ? gemFx(h.equipment) : null;
	const xa = opts.talents ? astralFx(h) : null;
	const dr = opts.talents ? drillFx(h) : null;
	const gf2 = opts.talents ? guildFx(h) : null;
	const ex = (k) => (xg?.[k] ?? 0) + (xa?.[k] ?? 0) + (dr?.[k] ?? 0) + (gf2?.[k] ?? 0);
	const sf0 = opts.gear ? setFx(h.equipment) : {
		atkPct: 0,
		defPct: 0,
		hpPct: 0,
		crit: 0
	};
	const gf = opts.gear ? gemFx(h.equipment) : null;
	const af = opts.talents ? astralFx(h) : null;
	const sf = {
		atkPct: sf0.atkPct + (gf?.atkPct ?? 0) + (af?.atkPct ?? 0) + (dr?.atkPct ?? 0) + (gf2?.atkPct ?? 0),
		defPct: sf0.defPct + (gf?.defPct ?? 0) + (af?.defPct ?? 0) + (dr?.defPct ?? 0) + (gf2?.defPct ?? 0),
		hpPct: sf0.hpPct + (gf?.hpPct ?? 0) + (af?.hpPct ?? 0) + (dr?.hpPct ?? 0) + (gf2?.hpPct ?? 0),
		crit: sf0.crit + (gf?.crit ?? 0) + (af?.crit ?? 0) + (dr?.crit ?? 0) + (gf2?.crit ?? 0)
	};
	tf.dodge += (gf?.dodge ?? 0) + (af?.dodge ?? 0) + (dr?.dodge ?? 0) + (gf2?.dodge ?? 0);
	tf.critDmg += (gf?.critDmg ?? 0) + (af?.critDmg ?? 0) + (gf2?.critDmg ?? 0);
	const pa = 1 + (tf.atkPct + sf.atkPct) / 100, ph = 1 + (tf.hpPct + sf.hpPct) / 100, pd = 1 + (tf.defPct + sf.defPct) / 100;
	const c = CLASSES[h.cls];
	const g = (opts.gear ? Object.values(h.equipment).filter(Boolean) : []).reduce((a, it) => {
		const s = itemStats(it);
		a.atk += s.atk;
		a.def += s.def;
		a.hp += s.hp;
		a.crit += s.crit;
		return a;
	}, {
		atk: 0,
		def: 0,
		hp: 0,
		crit: 0
	});
	const at = opts.attrs ? h.attrs : {
		str: 0,
		int: 0,
		agi: 0,
		vit: 0
	};
	const p = opts.asc ? 1 + h.paragon * .02 : 1;
	const L = h.level;
	const hp = Math.round(ph * ((100 + L * 40 + at.vit * 22 + at.str * 4) * c.hp + g.hp) * p);
	const patk = Math.round(pa * ((10 + L * 5 + at.str * 3 + at.agi * 1.5) * c.atk + (MAGIC[h.cls] ? g.atk * .3 : g.atk)) * p);
	const matk = Math.round((pa + ex("matkPct") / 100) * ((10 + L * 5 + at.int * 3.2) * c.atk + (MAGIC[h.cls] ? g.atk : g.atk * .3)) * p);
	const pdef = Math.round(pd * ((5 + L * 2.5 + at.vit * 1.5 + at.str * 1) * c.def + g.def) * p);
	const mdef = Math.round((pd + ex("mdefPct") / 100) * ((5 + L * 2.5 + at.vit * 1 + at.int * 1.5) * c.def + g.def * .8) * p);
	const crit = Math.min(60, +(5 + c.crit + at.agi * .2 + g.crit + tf.crit + sf.crit).toFixed(1));
	const critDmg = Math.min(300, Math.round(150 + at.agi * .3 + at.str * .15 + tf.critDmg));
	const pen = Math.min(40, +(at.str * .08 + at.int * .08 + h.paragon * .1 + tf.pen + (MAGIC[h.cls] ? ex("mpen") : (gf?.pen ?? 0) + (af?.pen ?? 0) + (gf2?.pen ?? 0))).toFixed(1));
	const acc = Math.min(30, +(at.agi * .08 + L * .05 + ex("acc")).toFixed(1));
	const block = Math.min(25, +ex("block").toFixed(1));
	const heal = Math.min(50, +ex("heal").toFixed(1));
	const dodge = Math.min(30, +(c.dodge + at.agi * .06 + tf.dodge).toFixed(1));
	const atk = MAGIC[h.cls] ? matk : patk;
	const def = Math.round((pdef + mdef) / 2);
	return {
		hp,
		atk,
		def,
		crit,
		dodge,
		power: Math.round(atk * 2 + def * 1.5 + hp * .2 + crit * 10 + (critDmg - 150) * 4 + pen * 25 + acc * 15 + dodge * 15 + block * 15 + heal * 5),
		patk,
		matk,
		pdef,
		mdef,
		critDmg,
		pen,
		acc,
		block,
		heal
	};
}
function heroStats(h) {
	return computeStats(h, {
		gear: true,
		attrs: true,
		asc: true,
		talents: true
	});
}
/** Battle Rating broken down by real sources (each = marginal gain when added). */
function powerBreakdown(h) {
	const base = computeStats(h, {
		gear: false,
		attrs: false,
		asc: false
	}).power;
	const withAttrs = computeStats(h, {
		gear: false,
		attrs: true,
		asc: false
	}).power;
	const withGear = computeStats(h, {
		gear: true,
		attrs: true,
		asc: false
	}).power;
	const withAsc = computeStats(h, {
		gear: true,
		attrs: true,
		asc: true
	}).power;
	const total = heroStats(h).power;
	return [
		{
			label: `Level ${h.level} & class`,
			power: base
		},
		{
			label: "Attributes",
			power: withAttrs - base
		},
		{
			label: "Equipment",
			power: withGear - withAttrs
		},
		{
			label: `Ascension ${h.paragon}`,
			power: withAsc - withGear
		},
		{
			label: "Skill tree, drills & Astrals",
			power: total - withAsc
		}
	];
}
function attrCost(points) {
	return Math.round(10 * Math.pow(1.09, points));
}
var ENEMIES = {
	goblin: {
		name: "Goblin Brute",
		img: enemy_goblin_default
	},
	skeleton: {
		name: "Bone Reaver",
		img: enemy_skeleton_default
	},
	demon: {
		name: "Crimson Fiend",
		img: enemy_demon_default
	},
	dragon: {
		name: "Blood-Moon Wyrm",
		img: enemy_dragon_default
	}
};
var ZONES = [
	"goblin",
	"skeleton",
	"demon"
];
var ZONE_NAMES = [
	"Goblin Warrens",
	"Bone Crypts",
	"Fiend Rift"
];
function zoneOf(stage) {
	const z = Math.floor((stage - 1) / 10) % 3;
	return {
		type: ZONES[z],
		name: ZONE_NAMES[z],
		cycle: Math.floor((stage - 1) / 30) + 1
	};
}
var riftFactor = (stage) => 1 + Math.max(0, stage - 50) * .02;
/**
* Enemy stats follow the hero's own growth instead of an exponential wall: health and damage
* climb with the stage at a steady pace, so a hero whose gear keeps up clears the campaign
* comfortably while bosses stay meaningfully harder.
*/
function stageFoe(stage, mult = 1, type, name) {
	const boss = stage % 10 === 0;
	const t = type ?? (boss ? "dragon" : zoneOf(stage).type);
	const rift = riftFactor(stage);
	const b = boss ? 1 : 0;
	const tough = boss ? 1 + (foeToughness(stage) - 1) * .4 : foeToughness(stage);
	return {
		name: name ?? (boss ? `${ENEMIES.dragon.name}` : ENEMIES[t].name),
		img: ENEMIES[t].img,
		level: stage,
		boss,
		hp: Math.round((150 + stage * 150) * (1 + b * .8) * mult * rift * tough),
		atk: Math.round((12 + stage * 8 + stage * stage * .2) * (1 + b * .25) * mult * rift * tough),
		def: Math.round((5 + stage * 1.4) * mult * Math.sqrt(rift)),
		crit: Math.min(40, 5 + stage * .15),
		dodge: Math.min(20, 2 + stage * .05)
	};
}
/** Monsters get tougher as you progress: +0.6% health/damage per stage after stage 5 (bosses get 40% of that, they already spike). */
function foeToughness(stage) {
	return 1 + Math.max(0, stage - 5) * .006;
}
/** Rewards rise on the same polynomial curve as the experience a level needs (see xpToNext). */
function stageRewards(stage, mult = 1) {
	return {
		xp: Math.round(40 * Math.pow(stage, 1.6) * mult),
		gold: Math.round((8 + 6 * Math.pow(stage, 1.75)) * mult)
	};
}
var SKILLS = {
	warrior: [
		{
			id: "strike",
			name: "Strike",
			mult: 1,
			cd: 0,
			icon: "sword"
		},
		{
			id: "cleave",
			name: "Cleave",
			mult: 1.9,
			cd: 3,
			icon: "axe"
		},
		{
			id: "rage",
			name: "Bloodrage",
			mult: 2.8,
			cd: 5,
			heal: .15,
			icon: "flame"
		}
	],
	mage: [
		{
			id: "bolt",
			name: "Arcane Bolt",
			mult: 1,
			cd: 0,
			icon: "sparkles"
		},
		{
			id: "nova",
			name: "Frost Nova",
			mult: 1.5,
			cd: 4,
			stun: true,
			icon: "snowflake"
		},
		{
			id: "meteor",
			name: "Meteor",
			mult: 3.3,
			cd: 5,
			icon: "flame"
		}
	],
	archer: [
		{
			id: "shot",
			name: "Shot",
			mult: 1,
			cd: 0,
			icon: "target"
		},
		{
			id: "volley",
			name: "Volley",
			mult: .75,
			hits: 3,
			cd: 3,
			icon: "wind"
		},
		{
			id: "snipe",
			name: "Death Snipe",
			mult: 2.6,
			cd: 5,
			crit: true,
			icon: "crosshair"
		}
	]
};
/** Battle abilities for a hero, including skill-tree upgrades. */
var heroSkills = (h) => talentSkills(SKILLS[h.cls], h);
/** Armor can never reduce a hit below this share of its raw damage, so stacked defense stays
*  useful without ever making a fight unloseable (or an enemy unkillable). */
var MITIGATION_FLOOR = .3;
function calcDamage(atk, def, mult, critChance, dodge, forceCrit = false, critDmg = 200, pen = 0, acc = 0) {
	if (!forceCrit && Math.random() * 100 < Math.max(0, dodge - acc)) return {
		dmg: 0,
		crit: false,
		miss: true
	};
	const crit = forceCrit || Math.random() * 100 < critChance;
	const raw = atk * mult * (.9 + Math.random() * .2) * (crit ? critDmg / 100 : 1);
	const effDef = def * (1 - Math.min(40, pen) / 100);
	return {
		dmg: Math.max(1, Math.round(raw * Math.max(MITIGATION_FLOOR, 100 / (100 + effDef * .9)))),
		crit,
		miss: false
	};
}
var BUILDINGS = [
	{
		id: "hall",
		name: "Throne Hall",
		x: 29,
		y: 24,
		r: 7,
		desc: "Skill tree, stats & progression",
		soon: false
	},
	{
		id: "armory",
		name: "Armory",
		x: 41,
		y: 22,
		r: 4.5,
		desc: "Inventory & equipment",
		soon: false
	},
	{
		id: "temple",
		name: "Barracks",
		x: 58,
		y: 57,
		r: 4.5,
		desc: "Attribute training",
		soon: false
	},
	{
		id: "forge",
		name: "Blacksmith",
		x: 63.5,
		y: 44,
		r: 4.5,
		desc: "Enhance & salvage gear",
		soon: false
	},
	{
		id: "oracle",
		name: "Quest Board",
		x: 42,
		y: 52,
		r: 3.5,
		desc: "AI-generated quests",
		soon: false,
		shortcut: true
	},
	{
		id: "portal",
		name: "Campaign Gate",
		x: 72,
		y: 54,
		r: 5.5,
		desc: "Campaign stages",
		soon: false
	},
	{
		id: "spire",
		name: "Conquest Gate",
		x: 17,
		y: 46,
		r: 5,
		desc: "Endless Conquest · Lv 10+",
		soon: false
	},
	{
		id: "arena",
		name: "Arena",
		x: 50,
		y: 31,
		r: 6.5,
		desc: "Fight real players",
		soon: false
	},
	{
		id: "market",
		name: "Royal Treasury",
		x: 44,
		y: 82,
		r: 5,
		desc: "Gold & merchant",
		soon: false
	},
	{
		id: "dungeon",
		name: "Dungeon Gate",
		x: 24,
		y: 80,
		r: 4,
		desc: "Boss challenges & elites · Lv 20+",
		soon: false
	},
	{
		id: "tower",
		name: "Magic Tower",
		x: 66,
		y: 74,
		r: 4,
		desc: "Summon & upgrade Astrals",
		soon: false
	},
	{
		id: "sanctuary",
		name: "Ancestral Sanctuary",
		x: 87,
		y: 42,
		r: 5,
		desc: "Ancestral trials & heirloom crafting",
		soon: false,
		shortcut: true
	},
	{
		id: "anctree",
		name: "Ancestral Tree",
		x: 80,
		y: 62,
		r: 5,
		desc: "Ancestral Tower · 100k BR · Lv 80+",
		soon: false
	},
	{
		id: "gems",
		name: "Gem Workshop",
		x: 54.5,
		y: 71,
		r: 4,
		desc: "Cut, socket & fuse gems",
		soon: false
	},
	{
		id: "guild",
		name: "Guild Hall",
		x: 35,
		y: 55,
		r: 4,
		desc: "Guilds & guild chat",
		soon: false
	},
	{
		id: "friends",
		name: "Friends",
		x: 0,
		y: 0,
		r: 0,
		desc: "Friends & messages",
		soon: false,
		shortcut: true
	},
	{
		id: "daily",
		name: "Daily Rewards",
		x: 46,
		y: 66,
		r: 3.5,
		desc: "Login rewards & activities",
		soon: false,
		shortcut: true
	},
	{
		id: "worldmap",
		name: "World Tree",
		x: 50,
		y: 49,
		r: 4.5,
		desc: "Explore the world map · raids & bosses",
		soon: false
	}
];
/** Buildings physically placed in the castle (shortcut-only screens excluded). */
var CASTLE_BUILDINGS = BUILDINGS.filter((b) => !("shortcut" in b && b.shortcut));
//#endregion
export { craft as $, scaledGold as $t, STAT_LABEL as A, isClaimable as At, astralUpgradeCost as B, normalizeHero as Bt, MATS as C, guildSkillRank as Ct, SET_BONUSES as D, insertGem as Dt, REFINE as E, iconRect as Et, achProgress as F, makeAncestral as Ft, barracksLevel as G, recipeGold as Gt, attrCost as H, posOf as Ht, activeSets as I, makeItem as It, buyGuildShopItem as J, recordEnhance as Jt, batchSizes as K, recipeMats as Kt, addMats as L, matCount as Lt, WEAR_LABEL as M, itemStats as Mt, WEAR_SLOTS as N, learnBlocker as Nt, SKILLS as O, invCap as Ot, absorbAstral as P, learnGuildSkill as Pt, contributeGold as Q, rollRarity as Qt, astralLabel as R, matsLine as Rt, GUILD_SKILLS as S, guildSkillCost as St, RECIPES as T, heroStats as Tt, bagRowCost as U, powerBreakdown as Ut, astralValue as V, parseGem as Vt, barracksCost as W, rankCost as Wt, calcDamage as X, removeGem as Xt, buyPrice as Y, refine as Yt, canEnterConquest as Z, resetCost as Zt, GEMS as _, xpToNext as _n, gemCutCost as _t, ASTRAL_MILESTONES as a, spentIn as an, drillText as at, GUILD_CONTRIB_MIN as b, gemValue as bt, ASTRAL_SLOT_LEVELS as c, summonAstral as cn, enchantStoneCost as ct, BARRACKS_UNLOCKS as d, trainingDiscount as dn, enhanceStoneChance as dt, scrapItem as en, craftBlocker as et, BUILDINGS as f, unequipItem as fn, equipAstral as ft, ENEMIES as g, wornCompare as gn, fuseGem as gt, DRILLS as h, wearOf as hn, fuseCost as ht, ASTRAL_COLORS as i, sockets as in, drillRank as it, TREES as j, itemScore as jt, SLOTS as k, isArmor as kt, ATLAS_H as l, totalPoints as ln, enhanceChance as lt, CLASSES as m, upgradeBarracks as mn, freePoints as mt, ANCESTRAL_RECIPES as n, sellValue as nn, drillBlocker as nt, ASTRAL_ODDS as o, stageFoe as on, earnedTitles as ot, CASTLE_BUILDINGS as p, upgradeAstral as pn, equipItem as pt, battleMats as q, recordBattle as qt, ASTRAL_BASES as r, socketCount as rn, drillCost as rt, ASTRAL_RARITY as s, stageRewards as sn, emptyRecord as st, ACHIEVEMENTS as t, scrapYield as tn, cutGem as tt, ATLAS_W as u, trainDrill as un, enhanceCost as ut, GEM_TIER_NAMES as v, zoneOf as vn, gemKey as vt, RARITIES as w, heroSkills as wt, GUILD_SHOP as x, guildSkillBlocker as xt, GEM_TYPES as y, gemName as yt, astralStatText as z, newHero as zt };

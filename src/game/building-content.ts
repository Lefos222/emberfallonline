import { attrCost, type Attr, type Hero } from './data';
import { BATTLE_BOSSES, ENEMY_ROSTER } from './bestiary';
import { SKILLS, stageFoe } from './data';
import { trainingDiscount } from './barracks';
import { scaledGold } from './gold';


export function trainingCost(h: Pick<Hero, 'attrs' | 'level'> & { buildings?: Record<string, number> }, attr: Attr, count: number) {
  if (![1, 5, 10, 25, 50].includes(count)) throw new Error('Invalid training batch');
  const raw = Array.from({ length: count }, (_, i) => attrCost(h.attrs[attr] + i)).reduce((a, b) => a + b, 0);
  return scaledGold(raw * (1 - trainingDiscount(h)), h.level);
}
export function trainAttribute(h: Hero, attr: Attr, count: number) {
  const cost = trainingCost(h, attr, count);
  if (h.gold < cost) return 'Not enough gold';
  h.gold -= cost;
  h.attrs[attr] += count;
  return null;
}

export const EXPEDITIONS = [
  { id: 'quarry', name: 'Ember Quarry', level: 1, material: 'ore' as const, quantity: 6, desc: 'Clear the quarry for gem-cutting ore.' },
  { id: 'crypt', name: 'Soul Crypt', level: 10, material: 'essence' as const, quantity: 3, desc: 'Hunt restless souls for forge and fusion essence.' },
  { id: 'observatory', name: 'Fallen Observatory', level: 20, material: 'starshard' as const, quantity: 3, desc: 'Recover shards for Astral summoning and upgrades.' },
  { id: 'bastion', name: 'Shattered Bastion', level: 25, material: 'fragment' as const, quantity: 4, desc: 'Salvage fragments for crafted armor.' },
  { id: 'citadel', name: 'Elite Citadel', level: 35, material: 'sigil' as const, quantity: 2, desc: 'Challenge a commander for elite crafting trophies.' },
  { id: 'heart', name: 'Tyrant’s Heart', level: 50, material: 'bossCore' as const, quantity: 2, desc: 'Slay a rotating tyrant for high-rarity forge cores.' },
];
export function expeditionFoe(h: Hero, index: number) {
  const expedition = EXPEDITIONS[index];
  if (!expedition) throw new Error('Unknown expedition');
  const cursor = h.wins ?? 0;
  const roster = index >= 4 ? BATTLE_BOSSES : ENEMY_ROSTER;
  const entry = roster[(cursor + index * 7) % roster.length];
  if (!entry) throw new Error('Encounter unavailable');
  const level = Math.max(expedition.level, h.level + h.paragon);
  return { ...stageFoe(level, index >= 4 ? 1.2 : 1), name: entry.name, sprite: entry.sprite,
    boss: index >= 4, rosterId: entry.id, skills: Object.values(SKILLS).flat().filter(s=>s.id===entry.signatureAbilityId) };
}
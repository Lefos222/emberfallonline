import { attrCost, type Attr, type Hero } from './data';
import { BOSS_ROSTER, ENEMY_ROSTER } from './bestiary';
import { SKILLS, stageFoe } from './data';
import { ancState, canBeginAncestral, RELICS_NEEDED, RELIC_DROP, ANC_STEPS } from './world';
import { trainingDiscount } from './barracks';

export function advanceAncestral(h: Hero) {
  const s=ancState(h); if(s.done)return false;
  if(s.step===0 && canBeginAncestral(h)){h.anc={...s,step:1};return true;}
  if(s.step===1 && s.relics>=RELICS_NEEDED){h.anc={...s,step:2};return true;}
  return false;
}
export function completeAncestralTrial(h:Hero,expected:number,won:boolean){
  const s=ancState(h);if(!won||s.done||s.step!==expected||expected<2||expected>=ANC_STEPS.length)return false;
  h.anc={...s,step:s.step+1,done:s.step+1>=ANC_STEPS.length};return true;
}
export function awardAncestralRelic(h:Hero,boss:boolean,rand=Math.random){
  const s=ancState(h);if(!boss||s.step!==1||s.relics>=RELICS_NEEDED||rand()>=RELIC_DROP)return false;
  h.anc={...s,relics:s.relics+1};return true;
}

export function trainingCost(h: Pick<Hero, 'attrs'> & { buildings?: Record<string, number> }, attr: Attr, count: number) {
  if (![1, 5, 10, 25, 50].includes(count)) throw new Error('Invalid training batch');
  const raw = Array.from({ length: count }, (_, i) => attrCost(h.attrs[attr] + i)).reduce((a, b) => a + b, 0);
  return Math.round(raw * (1 - trainingDiscount(h)));
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
  const roster = index >= 4 ? BOSS_ROSTER : ENEMY_ROSTER;
  const entry = roster[(cursor + index * 7) % roster.length];
  if (!entry) throw new Error('Encounter unavailable');
  const level = Math.max(expedition.level, h.level + h.paragon);
  return { ...stageFoe(level, index >= 4 ? 1.2 : 1), name: entry.name, sprite: entry.sprite,
    boss: index >= 4, rosterId: entry.id, skills: Object.values(SKILLS).flat().filter(s=>s.id===entry.signatureAbilityId) };
}
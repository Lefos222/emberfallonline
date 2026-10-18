import {describe,it,expect} from 'vitest';
import {buildKit,initBattle,heroUnit} from '@/game/combat';
import {SKILLS} from '@/game/data';
describe('chosen battle skills',()=>{
 it('preserves old saves with every existing unlocked ability',()=>{
  expect(buildKit('warrior',SKILLS.warrior).map(s=>s.id)).toEqual(['strike','cleave','rage','guard','taunt','counter']);
 });
 it('keeps the basic attack and rejects unavailable or other-class skills',()=>{
  expect(buildKit('warrior',SKILLS.warrior,['cleave','meteor','unearned']).map(s=>s.id)).toEqual(['strike','cleave']);
 });
 it('retains selected talent abilities and their real combat adaptation',()=>{
  const skills=[...SKILLS.mage,{id:'inferno',name:'Inferno',mult:2,cd:3,icon:'flame'}];
  const chosen=buildKit('mage',skills,['inferno']);
  expect(chosen.map(s=>s.id)).toEqual(['bolt','inferno']);expect(chosen[1]?.target).toBe('all');
 });
 it('chosen skills enter the actual battle state',()=>{
  const fighter={name:'Knight',img:'',hp:100,atk:10,def:5,crit:0,dodge:0,level:2,cls:'warrior' as const,skills:SKILLS.warrior,skillLoadout:['guard']};
  const state=initBattle(fighter,[{...fighter,name:'Enemy',cls:undefined,skillLoadout:undefined}]);
  expect(heroUnit(state).kit.map(s=>s.id)).toEqual(['strike','guard']);
 });
});
import { describe,expect,it } from 'vitest';
import { PROFESSIONS,GATHERING_AREAS,professionLevel,areaRequirement,gatheringSeconds,validateGatheringResponse,gatheringState } from '@/game/professions';
describe('profession foundation',()=>{
 it('offers six distinct requested professions and five areas',()=>{
  expect(PROFESSIONS.map(p=>p.id)).toEqual(['mining','herbalism','logging','fishing','archaeology','treasure']);expect(GATHERING_AREAS).toHaveLength(5);
 });
 it('profession levels and area gates follow the server progression',()=>{
  expect(professionLevel(0)).toBe(1);expect(professionLevel(99)).toBe(1);expect(professionLevel(100)).toBe(2);
  expect([0,1,2,3,4].map(areaRequirement)).toEqual([1,6,11,16,21]);
 });
 it('journeys have real nonzero timers at every area',()=>{
  expect([0,1,2,3,4].map(gatheringSeconds)).toEqual([30,45,60,75,90]);
 });
 it('response validation rejects invalid clocks and unknown pending journeys',()=>{
  expect(()=>validateGatheringResponse({now:'bad'})).toThrow();
  expect(()=>validateGatheringResponse({now:new Date().toISOString(),save:{srv:{gathering:{active:{profession:'fake',area:0,request:'abc',readyAt:new Date().toISOString()}}}}})).toThrow();
 });
 it('reads only the server-owned gathering collection',()=>{
  const save={gathering:{resources:{fake:99}},srv:{gathering:{resources:{'mining:0:0':2},professions:{mining:{xp:20,tool:1,journeys:1}},history:[],active:null}}};
  expect(gatheringState(save).resources).toEqual({'mining:0:0':2});expect(gatheringState(save).professions['mining']?.xp).toBe(20);
 });
});
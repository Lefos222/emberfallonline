import { describe,it,expect } from "vitest";
import { heroStats,newHero,heroSkills,matSlots } from "@/game/data";
import { TREES,talentSkills } from "@/game/talents";
import { warDropKind,WAR_MATERIAL_CHANCE } from "@/game/war-drops";
import { friendshipHealthPct } from "@/game/friendship";
import { memberOf,newBattle,tick } from "@/game/spire-party";
describe("November 11 requested rules",()=>{
 for(const cls of ["warrior","mage","archer"] as const){
  it(`${cls} gains exactly four active skills`,()=>expect(TREES[cls].flatMap(s=>s.talents).filter(t=>t.id.includes("new_active"))).toHaveLength(4));
  it(`${cls} gains exactly four passives`,()=>expect(TREES[cls].flatMap(s=>s.talents).filter(t=>t.id.includes("new_passive"))).toHaveLength(4));
 }
 it("splits item rolls into 70% materials and 30% gear",()=>{expect(WAR_MATERIAL_CHANCE).toBe(.7);expect(Array.from({length:100},(_,i)=>warDropKind(()=>i/100)).filter(k=>k==="materials")).toHaveLength(70);expect(warDropKind(()=>.7)).toBe("gear");});
 it("mage renewal scales from 8% to 32% max health",()=>{const h=newHero("Healer","mage");h.talents={mage_new_active_0:1};expect(heroSkills(h).find(s=>s.id==="renewal-wave")?.teamHeal).toBe(.08);h.talents['mage_new_active_0']=4;expect(talentSkills([],h).find(s=>s.id==="renewal-wave")?.teamHeal).toBe(.32);});
 it("renewal heals living party members and reports only actual healing",()=>{const h=newHero("Healer","mage");h.talents={mage_new_active_0:4};const a=memberOf(h,"female","a"),b=memberOf(newHero("Friend","warrior"),"male","b");const s=newBattle([a,b]);s.heroes.forEach(x=>{x.hp=x.max-10;x.swing=99999;});s.foes.forEach(x=>x.swing=99999);const r=tick(s,[a,b],[{hero:"a",skill:"renewal-wave"}],()=>.9);expect(r.battle.heroes.every(x=>x.hp===x.max)).toBe(true);expect(r.battle.fx.filter(x=>x.kind==="heal").map(x=>x.value)).toEqual([10,10]);});
 it("friendship keeps increasing stats and BR beyond high point totals",()=>{const h=newHero("Friend","warrior");h.srv={friendship:{points:100000}};const a=heroStats(h);h.srv.friendship={points:100100};expect(friendshipHealthPct(h)).toBeCloseTo(10010);expect(heroStats(h).hp).toBeGreaterThan(a.hp);expect(heroStats(h).power).toBeGreaterThan(a.power);});
 it("rose stacks occupy inventory slots",()=>{const h=newHero("Rose","mage");h.srv={friendship:{roses:10000}};expect(matSlots(h)).toBe(2);});
});
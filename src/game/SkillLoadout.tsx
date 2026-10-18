import { Check,Sword } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildKit,resourceName } from './combat';
import { heroSkills } from './data';
import { update,useGame } from './store';

export function SkillLoadout(){
 const {hero}=useGame();if(!hero)return null;
 const kit=buildKit(hero.cls,heroSkills(hero));
 const selected=buildKit(hero.cls,heroSkills(hero),hero.skillLoadout).map(s=>s.id);
 return <section className="mb-6 border-y border-border py-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-xl">Battle skills · {selected.length} selected</h3><Button variant="outline" size="sm" disabled={!hero.skillLoadout} onClick={()=>update(h=>{h.skillLoadout=undefined;})}>Select all unlocked</Button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{kit.map((sk,i)=>{
 const on=selected.includes(sk.id);
 return <label key={sk.id} className={`slot flex cursor-pointer items-start gap-3 p-3 ${on?'border-gold':''}`}><input type="checkbox" aria-label={`Battle skill: ${sk.name}`} checked={on} disabled={i===0} className="mt-1 accent-primary" onChange={()=>update(h=>{
 const available=buildKit(h.cls,heroSkills(h));const current=buildKit(h.cls,heroSkills(h),h.skillLoadout).map(s=>s.id);
 h.skillLoadout=available.filter((s,index)=>index===0||(s.id===sk.id?!current.includes(s.id):current.includes(s.id))).map(s=>s.id);
 })}/><div className="min-w-0"><p className="font-display text-gold">{on?<Check className="mr-1 inline h-3 w-3"/>:<Sword className="mr-1 inline h-3 w-3"/>}{sk.name}</p><p className="text-xs text-muted-foreground">{sk.desc}</p><p className="mt-1 text-xs">{i===0?'Basic attack':`${sk.cost} ${resourceName(hero.cls)} · ${sk.cd} turn cooldown`}</p></div></label>;
 })}</div></section>;
}
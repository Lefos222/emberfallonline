import { Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXPEDITIONS, expeditionFoe } from './building-content';
import { useGame, update } from './store';
import { Panel, fmt } from './ui';
import { Sprite } from './Sprite';
import { MatIcon } from './MatIcon';
import { MATS, addMats } from './crafting';
import { stageRewards, type Item } from './data';
import { recordRosterEncounter } from './bestiary';
import { scrollXp } from './scrolls';
import type { StartBattle } from './panels';

export function Expeditions({onClose,start}:{onClose:()=>void;start:StartBattle}) {
  const {hero}=useGame(); if(!hero) return null;
  const fight=(index:number)=>{
    const expedition=EXPEDITIONS[index]; if(!expedition || hero.level+hero.paragon<expedition.level)return;
    const foe=expeditionFoe(hero,index); const rw=stageRewards(foe.level,foe.boss?1.5:1);
    start({title:`Dungeon Expedition · ${expedition.name}`,right:foe,onResult:async(won,xpMultiplier=1)=>{
      if(!won)return {lines:['The expedition failed. No treasure recovered.']};
      const {grant,rollLoot,addLoot}=await import('./logic');
      let loot:Item|null=null; const lines:string[]=[];
      update(h=>{
        const xp=scrollXp(rw.xp,xpMultiplier);const {levels}=grant(h,xp,rw.gold);
        h.wins++; recordRosterEncounter(h,foe.rosterId,true);
        addMats(h,{[expedition.material]:expedition.quantity});
        loot=rollLoot(h,foe.level,0.6,foe.boss?2:0);if(loot)addLoot(h,loot);
        lines.push(`+${fmt(xp)} XP`,`+${fmt(rw.gold)} gold`,`+${expedition.quantity} ${MATS[expedition.material].name}`);
        if(levels)lines.push(`Level up ×${levels}`);
      });return {lines,loot};
    }});
  };
  return <Panel title="Dungeon Gate · Expeditions" onClose={onClose} wide><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{EXPEDITIONS.map((e,i)=>{
    const foe=expeditionFoe(hero,i);const unlocked=hero.level+hero.paragon>=e.level;
    return <article key={e.id} className="slot flex flex-col gap-2 p-4"><Sprite rect={foe.sprite} className="mx-auto h-28 w-28"/><h3 className="font-display text-xl text-gold">{e.name}</h3><p className="text-sm text-muted-foreground">{e.desc}</p><p className="text-sm">{foe.name} · Lv {foe.level}</p><p className="text-xs text-muted-foreground">HP {fmt(foe.hp)} · ATK {fmt(foe.atk)} · DEF {fmt(foe.def)}</p><p className="text-sm"><MatIcon mat={e.material}/> +{e.quantity} {MATS[e.material].name}</p><Button className="mt-auto" disabled={!unlocked} onClick={()=>fight(i)}><Swords/>{unlocked?'Enter expedition':`Level ${e.level} required`}</Button></article>;
  })}</div></Panel>;
}
import { Button } from '@/components/ui/button';
import { useGame, update } from './store';
import { Panel, fmt } from './ui';
import { ANC_STEPS, ancState, canBeginAncestral, RELICS_NEEDED, DUNGEONS, dungeonFoe, TIER_BOSSES } from './world';
import { Sprite } from './Sprite';
import type { StartBattle } from './panels';
import { advanceAncestral, completeAncestralTrial } from './building-content';
import { heroStats } from './data';
import { MatIcon } from './MatIcon';
import { ancTowerBlocker, ancTowerFoe, ancTowerFloor, ancTowerBest, ancFloorDef, completeAncFloor } from './ancestral-tower';
import type { Mat } from './crafting';

export function Sanctuary({onClose,start}:{onClose:()=>void;start:StartBattle}){
 const {hero}=useGame();if(!hero)return null;const state=ancState(hero);const step=ANC_STEPS[state.step];
 const advance=()=>update(h=>{advanceAncestral(h);});
 const trial=()=>{if(!step?.boss)return;const d=DUNGEONS.find(d=>d.id===step.boss);if(!d)return;const expected=state.step;start({title:`Ancestral Trial · ${step.title}`,right:dungeonFoe(d,hero.level+hero.paragon,step.mult),onResult:won=>{if(!won)return {lines:['The echo remains. Strengthen your equipment and return.']};let advanced=false;update(h=>{advanced=completeAncestralTrial(h,expected,won);});return {lines:advanced?[expected+1>=ANC_STEPS.length?'Heritage awakened — Ancestral Forge recipe unlocked.':'Trial complete — the next echo awaits.']:['Trial already completed.']};}});};

 // Ancestral Tower — opens after the questline is done
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
     onResult: won => {
       if (!won) return { lines: ['The ancestral echo overwhelmed you. Raise your Battle Rating and try again.'] };
       let result: ReturnType<typeof completeAncFloor> | null = null;
       update(h => { result = completeAncFloor(h, towerFloor); });
       const drops = result ? Object.entries(result.drops).filter(([,v]) => v).map(([k,v]) => `+${v} ${k}`) : [];
       return { lines: [`Floor ${towerFloor} cleared! +${fmt(result?.gold ?? 0)} gold, +${fmt(result?.xp ?? 0)} XP`, ...drops] };
     },
   });
 };

 return <Panel title="Ancestral Sanctuary" onClose={onClose} wide>
   <p className="mb-4 font-display text-xl text-gold">{state.done?'Heritage awakened':`Trial ${Math.min(state.step+1,ANC_STEPS.length)} of ${ANC_STEPS.length}`}</p>
   <div className="space-y-3">{ANC_STEPS.map((s,i)=><article key={s.title} className={`slot flex items-center gap-3 p-4 ${i>state.step?'opacity-50':''}`}>{s.boss&&<Sprite rect={TIER_BOSSES[s.boss].sprite} className="h-20 w-20 shrink-0"/>}<div><h3 className="font-display text-lg">{i<state.step?'✓ ':''}{s.title}</h3><p className="text-sm text-muted-foreground">{s.desc}</p>{s.kind==='relics'&&<p className="mt-1 text-gold">Relics {state.relics}/{RELICS_NEEDED}</p>}</div></article>)}</div>
   {!state.done&&<div className="mt-4">{state.step<2?<Button disabled={state.step===0?!canBeginAncestral(hero):state.relics<RELICS_NEEDED} onClick={advance}>{state.step===0?'Answer the call':'Present relics'}</Button>:<Button onClick={trial}>Challenge ancestral echo</Button>}</div>}
   {state.done&&<p className="mt-4 text-r1">Ancestral heirloom crafting is unlocked — the Ancestral tab is open in the Forge.</p>}

   {/* Ancestral Tower — floor-based boss system requiring 100k BR */}
   {state.done && (
     <div className="mt-6 border-t border-border pt-4">
       <h2 className="mb-1 font-display text-2xl text-gold">Ancestral Tower</h2>
       <p className="mb-3 text-sm text-muted-foreground">
         Climb endless floors of ancestral echoes. Each boss requires a minimum Battle Rating of {fmt(100_000)}.
         Every floor drops Ancestral crafting materials (Ancient Bones, Void Shards, Ember Hearts) plus gold and XP.
       </p>
       <div className="slot mb-3 p-4">
         <div className="flex flex-wrap items-center justify-between gap-2">
           <div>
             <span className="font-display text-lg">Floor {towerFloor}</span>
             <span className="ml-2 text-sm text-muted-foreground">Best: {towerBest}</span>
           </div>
           <div className="text-sm">
             Your Battle Rating: <b className={br >= 100_000 ? "text-r1" : "text-hp"}>{fmt(br)}</b>
             <span className="ml-2 text-muted-foreground">· Required: {fmt(floorDef.minBR)}</span>
           </div>
         </div>
         <div className="mt-2 text-xs">
           <span className="text-muted-foreground">Boss: </span><b>{TIER_BOSSES[floorDef.boss].name}</b>
           <span className="ml-3 text-muted-foreground">Rewards: </span>
           <span className="text-gold">+{fmt(floorDef.gold)} gold</span>, <span className="text-xp">+{fmt(floorDef.xp)} XP</span>
           {Object.entries(floorDef.drops).filter(([,v]) => v).map(([k,v]) => (
             <span key={k} className="ml-2"><MatIcon mat={k as Mat} size={14} /> +{v}</span>
           ))}
         </div>
         {towerBlocked ? (
           <p className="mt-2 text-sm text-hp">{towerBlocked}</p>
         ) : (
           <Button className="mt-3" onClick={towerFight}>Challenge Floor {towerFloor}</Button>
         )}
       </div>
     </div>
   )}
 </Panel>;
}

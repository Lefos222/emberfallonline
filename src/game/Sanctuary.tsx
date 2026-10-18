import { Button } from '@/components/ui/button';
import { useGame, update } from './store';
import { Panel } from './ui';
import { ANC_STEPS, ancState, canBeginAncestral, RELICS_NEEDED, DUNGEONS, dungeonFoe, TIER_BOSSES } from './world';
import { Sprite } from './Sprite';
import type { StartBattle } from './panels';
import { advanceAncestral, completeAncestralTrial } from './building-content';

export function Sanctuary({onClose,start}:{onClose:()=>void;start:StartBattle}){
 const {hero}=useGame();if(!hero)return null;const state=ancState(hero);const step=ANC_STEPS[state.step];
 const advance=()=>update(h=>{advanceAncestral(h);});
 const trial=()=>{if(!step?.boss)return;const d=DUNGEONS.find(d=>d.id===step.boss);if(!d)return;const expected=state.step;start({title:`Ancestral Trial · ${step.title}`,right:dungeonFoe(d,hero.level+hero.paragon,step.mult),onResult:won=>{if(!won)return {lines:['The echo remains. Strengthen your equipment and return.']};let advanced=false;update(h=>{advanced=completeAncestralTrial(h,expected,won);});return {lines:advanced?[expected+1>=ANC_STEPS.length?'Heritage awakened — Ancestral Forge recipe unlocked.':'Trial complete — the next echo awaits.']:['Trial already completed.']};}});};
 return <Panel title="Ancestral Sanctuary" onClose={onClose} wide><p className="mb-4 font-display text-xl text-gold">{state.done?'Heritage awakened':`Trial ${Math.min(state.step+1,ANC_STEPS.length)} of ${ANC_STEPS.length}`}</p><div className="space-y-3">{ANC_STEPS.map((s,i)=><article key={s.title} className={`slot flex items-center gap-3 p-4 ${i>state.step?'opacity-50':''}`}>{s.boss&&<Sprite rect={TIER_BOSSES[s.boss].sprite} className="h-20 w-20 shrink-0"/>}<div><h3 className="font-display text-lg">{i<state.step?'✓ ':''}{s.title}</h3><p className="text-sm text-muted-foreground">{s.desc}</p>{s.kind==='relics'&&<p className="mt-1 text-gold">Relics {state.relics}/{RELICS_NEEDED}</p>}</div></article>)}</div>{!state.done&&<div className="mt-4">{state.step<2?<Button disabled={state.step===0?!canBeginAncestral(hero):state.relics<RELICS_NEEDED} onClick={advance}>{state.step===0?'Answer the call':'Present relics'}</Button>:<Button onClick={trial}>Challenge ancestral echo</Button>}</div>}{state.done&&<p className="mt-4 text-r1">Your Ancestral Heirloom recipe is available in the Blacksmith.</p>}</Panel>;
}
import { useEffect,useState } from 'react';
import { Button } from '@/components/ui/button';
import { Hammer } from 'lucide-react';
import verdant from '@/assets/gathering-verdant.jpg';
import ember from '@/assets/gathering-ember.jpg';
import sunken from '@/assets/gathering-sunken.jpg';
import frost from '@/assets/gathering-frost.jpg';
import astral from '@/assets/gathering-astral.jpg';
const regions=[verdant,ember,sunken,frost,astral];
import discoveries from '@/assets/profession-discoveries.png';
import { GameTabs,Panel,fmt } from './ui';
import { update,useGame } from './store';
import { RequestStatus,useRequest } from './Rewards';
import { beginGathering,finishGathering,readGathering } from './profession-services';
import { PROFESSIONS,GATHERING_AREAS,DISCOVERY_NAMES,DISCOVERY_RARITIES,professionLevel,areaRequirement,gatheringSeconds,gatheringState,type ProfessionId } from './professions';
import { MATS,type Mat } from './crafting';
import { MatIcon } from './MatIcon';
import { ENH_STONE_KEYS, type EnhStoneTier } from './enhance-stones';
import type { Hero } from './data';
import { PROFESSION_MAT,REGION_MATS,discoveryYield,lodgeLedger,pendingSupplies,refinedCount,refineSupplies,type Stones } from './lodge';
import { countdown } from './events';

export function DiscoveryArt({profession,rarity,className='h-16 w-16'}:{profession:ProfessionId;rarity:number;className?:string}){
 const index=PROFESSIONS.findIndex(p=>p.id===profession);
 return <div role="img" aria-label={DISCOVERY_NAMES[profession][rarity]} className={`${className} shrink-0 bg-no-repeat`} style={{backgroundImage:`url(${discoveries})`,backgroundSize:'600% 400%',backgroundPosition:`${index*20}% ${rarity*100/3}%`}}/>;
}

const stoneLabel=(stones:Stones)=>Object.keys(stones).map(Number).sort((a,b)=>a-b).map(t=>MATS[ENH_STONE_KEYS[t as EnhStoneTier]].name).join(' + ');

/** What the Lodge pays for supplies: materials and the Enhancement Stones rare finds refine into. */
function LodgeRefinery({hero,profession,onRefine,status}:{hero:Hero;profession:ProfessionId;onRefine:()=>void;status:string|null}){
 const pending=pendingSupplies(hero);
 const ready=Object.entries(pending.mats).map(([m,n])=>`+${fmt(n)} ${MATS[m as Mat].name}`).concat(
  Object.entries(pending.stones).map(([t,n])=>`+${fmt(n)} ${MATS[ENH_STONE_KEYS[t as unknown as EnhStoneTier]].name}`));
 return <section className="slot mb-4 p-3">
  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 font-display text-gold">
   <span className="flex items-center gap-2"><Hammer className="h-4 w-4"/>Lodge Refinery</span>
   <span className="text-xs">{fmt(refinedCount(hero))} discoveries refined</span>
  </div>
  <p className="text-xs text-muted-foreground">Every discovery you bring home is worth items, not just a place in the vault. Refining pays Emberfall materials and Enhancement Stones for the Forge — deeper regions and rarer finds are worth far more, and nothing already refined is ever paid twice.</p>
  <div className="my-3 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
   <div className="min-w-0"><p className="font-display text-lg">{pending.count?`${fmt(pending.count)} suppl${pending.count===1?'y':'ies'} ready to refine`:'Nothing waiting in the vault'}</p>
    <p className="text-xs text-muted-foreground">{pending.count?ready.join(' · '):'Send a profession out on a journey — whatever it finds can be refined here.'}</p></div>
   <Button disabled={pending.count===0} onClick={onRefine}>Refine supplies</Button>
  </div>
  {status&&<p role="status" className="anim-pop mb-2 text-sm text-r1">{status}</p>}
  <p className="mb-2 text-xs"><b className="text-gold">{PROFESSIONS.find(p=>p.id===profession)?.name}</b> discoveries always add {MATS[PROFESSION_MAT[profession]].name} — each profession's own trade good.</p>
  <div className="grid gap-1.5 sm:grid-cols-2">
   {GATHERING_AREAS.map((name,i)=>{
    const region=REGION_MATS[i];
    const stones=stoneLabel(discoveryYield(profession,i,3).stones);
    return <div key={name} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5 text-xs">
     <span className="font-bold">{name}</span>
     <span className="text-muted-foreground">{MATS[region[0]].name} · {MATS[region[1]].name}{stones&&<> · <span className="text-gold">{stones}</span> on rare finds</>}</span>
    </div>;
   })}
  </div>
 </section>;
}

export function Professions({onClose}:{onClose:()=>void}){
 const {hero,heroId}=useGame();const [profession,setProfession]=useState<ProfessionId>('mining');const [area,setArea]=useState(0);const [now,setNow]=useState(Date.now());const [offset,setOffset]=useState(0);const [refined,setRefined]=useState<string|null>(null);const request=useRequest();
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(t);},[]);
 useEffect(()=>{void request.run(async()=>{const r=await readGathering();setOffset(r.now-Date.now());});},[heroId]);
 if(!hero)return null;
 const state=gatheringState(hero);const stats=state.professions[profession]??{xp:0,tool:1,journeys:0};const level=professionLevel(stats.xp);const active=state.active;const clock=now+offset;const ready=active?Date.parse(active.readyAt)<=clock:false;const resting=state.nextAt?Date.parse(state.nextAt)>clock:false;
 const chosen=PROFESSIONS.find(p=>p.id===profession)??PROFESSIONS[0];
 const claimed=hero.lodge?.claimed??{};
 const action=()=>void request.run(async()=>{const r=active?await finishGathering(active.request):await beginGathering(profession,area);setOffset(r.now-Date.now());});
 const refine=()=>{
  const out={lines:[] as string[]};
  update((h)=>{out.lines=refineSupplies(h);});
  setRefined(out.lines.length?`Refined into ${out.lines.join(' · ')}`:(state.active?'Collect your journey first — the discovery joins the vault when you do.':'The vault holds nothing new to refine.'));
 };
 const supplies=Object.entries(state.resources).filter(([key,n])=>n>0&&PROFESSIONS.some(p=>p.id===key.split(':')[0]));
 const total=supplies.reduce((a,[,n])=>a+n,0);
 return <Panel title="Profession Lodge" onClose={onClose} wide><RequestStatus {...request}/>
  <GameTabs label="Professions" value={profession} onChange={(id)=>{setProfession(id);setArea(0);setRefined(null);}} tabs={PROFESSIONS.map((p)=>({id:p.id,name:p.name}))}/>
  <div className="mb-4 flex flex-wrap justify-between gap-3 border-b border-border pb-3">
   <p className="font-display text-lg">{chosen.name} · Level {level}</p>
   <p className="text-sm text-gold">{chosen.tool} · Tier {stats.tool||1} · {stats.journeys} journeys</p>
   <div className="w-full"><progress aria-label="Profession experience" max={100} value={stats.xp%100} className="h-2 w-full accent-primary"/><p className="text-xs text-muted-foreground">{stats.xp%100}/100 XP · next tool tier at {Math.ceil((stats.xp+1)/1000)*1000} XP</p></div>
  </div>

  <LodgeRefinery hero={hero} profession={profession} onRefine={refine} status={refined}/>

  <h3 className="font-display text-lg">Journeys</h3>
  <p className="mb-2 text-xs text-muted-foreground">A journey takes its own time and pays profession XP plus one discovery from that region.</p>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{GATHERING_AREAS.map((name,i)=><article key={name} className={`overflow-hidden rounded border border-border ${area===i?'ring-2 ring-gold':''}`}><div className="aspect-[2/3] overflow-hidden"><img src={regions[i]} alt={name} loading="lazy" width={384} height={768} className="h-full w-full object-cover"/></div><div className="p-3"><h3 className="font-display">{name}</h3><p className="my-1 text-xs text-muted-foreground">Profession Lv {areaRequirement(i)} · {gatheringSeconds(i)} seconds</p><p className="mb-2 text-[11px] text-muted-foreground">{MATS[REGION_MATS[i][0]].name} · {MATS[REGION_MATS[i][1]].name}</p><Button size="sm" variant={area===i?'default':'outline'} disabled={level<areaRequirement(i)||!!active} onClick={()=>setArea(i)}>{level<areaRequirement(i)?'Locked':area===i?'Selected':'Explore'}</Button></div></article>)}</div>
  <div role="status" className="my-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4"><div className="min-w-0"><p className={`font-display text-lg ${active&&!ready?'animate-pulse text-gold':''}`}>{active?`${PROFESSIONS.find(p=>p.id===active.profession)?.verb} · ${GATHERING_AREAS[active.area]}`:resting?'Resting after your journey':`${chosen.name} · ${GATHERING_AREAS[area]}`}</p><p className="text-sm text-muted-foreground">{active?(ready?'Discovery ready to collect':countdown(Date.parse(active.readyAt)-clock)):resting?countdown(Date.parse(state.nextAt??'')-clock):`${gatheringSeconds(area)} second journey`}</p></div><Button disabled={request.busy||(active?!ready:resting||level<areaRequirement(area))} onClick={action}>{active?'Collect discovery':'Begin gathering'}</Button></div>

  <h3 className="font-display text-lg">Vault · {fmt(total)} supplies held · {supplies.length} type{supplies.length===1?'':'s'}</h3>
  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{supplies.map(([key,n])=>{const [p,a,r]=key.split(':');if(!PROFESSIONS.some(x=>x.id===p))return null;const rarity=Number(r);const fresh=Math.max(0,n-(claimed[key]??0));const worth=discoveryYield(p as ProfessionId,Number(a),rarity);return <article key={key} className={`slot rarity-${Math.min(rarity,3)} flex items-center gap-3 p-3`}><DiscoveryArt profession={p as ProfessionId} rarity={rarity}/><div className="min-w-0"><p className="font-display">{DISCOVERY_NAMES[p as ProfessionId][rarity]} ×{n}{fresh>0&&<span className="ml-2 rounded bg-gold px-1.5 text-[10px] font-bold uppercase text-background">{fresh} new</span>}</p><p className="text-xs text-muted-foreground">{DISCOVERY_RARITIES[rarity]} · {GATHERING_AREAS[Number(a)]}</p><p className="text-[11px] text-gold">{worth.lines.slice(0,3).join(' · ')}</p></div></article>;})}</div>{total===0&&<p className="py-4 text-muted-foreground">No discoveries yet.</p>}

  <h3 className="mt-5 font-display text-lg">Lodge ledger</h3>
  <div className="mt-2 max-h-32 overflow-y-auto">{lodgeLedger(hero).length===0?<p className="text-sm text-muted-foreground">Nothing refined yet.</p>:lodgeLedger(hero).map((e,i)=><p key={`${e.at}-${i}`} className="border-b border-border py-1.5 text-sm"><span className="text-gold">{e.lines.join(' · ')}</span> · {new Date(e.at).toLocaleString()}</p>)}</div>

  <h3 className="mt-5 font-display text-lg">Journey history</h3>
  <div className="mt-2 max-h-48 overflow-y-auto">{state.history.length===0?<p className="text-sm text-muted-foreground">No journeys yet.</p>:state.history.slice(0,30).map(d=><p key={d.request} className="border-b border-border py-2 text-sm"><span className="text-gold">{DISCOVERY_NAMES[d.profession][d.rarity]} ×{d.quantity}</span> · +{d.xp} XP · {new Date(d.at).toLocaleString()}</p>)}</div>
  <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">Refined goods land in your bag: <MatIcon mat="enhStone1" size={16}/> and every forge material are listed in the Armory.</p>
 </Panel>;
}

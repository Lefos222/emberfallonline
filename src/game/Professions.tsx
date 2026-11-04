import { useEffect,useState } from 'react';
import { Button } from '@/components/ui/button';
import verdant from '@/assets/gathering-verdant.jpg';
import ember from '@/assets/gathering-ember.jpg';
import sunken from '@/assets/gathering-sunken.jpg';
import frost from '@/assets/gathering-frost.jpg';
import astral from '@/assets/gathering-astral.jpg';
import discoveries from '@/assets/profession-discoveries.png';
import { Panel } from './ui';
import { useGame } from './store';
import { RequestStatus,useRequest } from './Rewards';
import { beginGathering,finishGathering,readGathering } from './profession-services';
import {
 LODGE_MATERIALS,LODGE_MATERIAL_ORDER,PROFESSIONS,GATHERING_AREAS,DISCOVERY_NAMES,DISCOVERY_RARITIES,
 areaRequirement,gatheringSeconds,gatheringState,haulMaterial,lodgeStores,professionLevel,
 type LodgeMaterial,type ProfessionId,
} from './professions';
import { countdown } from './events';

const regions=[verdant,ember,sunken,frost,astral];

export function DiscoveryArt({profession,rarity,className='h-16 w-16'}:{profession:ProfessionId;rarity:number;className?:string}){
 const index=PROFESSIONS.findIndex(p=>p.id===profession);
 return <div role="img" aria-label={DISCOVERY_NAMES[profession][rarity]} className={`${className} shrink-0 bg-no-repeat`} style={{backgroundImage:`url(${discoveries})`,backgroundSize:'600% 400%',backgroundPosition:`${index*20}% ${rarity*100/3}%`}}/>;
}

/** One icon per stored material: the stock the lodge keeps, not a single haul. */
export function MaterialGlyph({material,size=24}:{material:LodgeMaterial;size?:number}){
 const c=LODGE_MATERIALS[material].color;
 return <svg width={size} height={size} viewBox="0 0 20 20" role="img" aria-label={LODGE_MATERIALS[material].name} className="shrink-0">
  {material==='wood'&&(<><rect x="2" y="4.5" width="16" height="5" rx="2.5" fill={c} stroke="#2e1c0e" strokeWidth="0.8"/><rect x="4" y="10.5" width="14" height="5" rx="2.5" fill="#a9713f" stroke="#2e1c0e" strokeWidth="0.8"/><ellipse cx="16.6" cy="7" rx="1.6" ry="2.3" fill="#d9b487"/><ellipse cx="17.4" cy="13" rx="1.4" ry="2.1" fill="#d9b487"/></>)}
  {material==='grass'&&(<><path d="M10 18c0-6 1-9 3-12M10 18c0-5-2-8-4-10M10 18c1-4 3-6 5-7" stroke="#3f7a3a" strokeWidth="1.4" fill="none" strokeLinecap="round"/><path d="M13 6c2 0 3 1.6 3 2.6s-1.2 1.8-3 1.8-3-.8-3-1.8S11 6 13 6z" fill={c} stroke="#2c5a28" strokeWidth="0.7"/><path d="M6 8c1.6 0 2.6 1.4 2.6 2.2S7.6 12 6 12s-2.4-.6-2.4-1.8S4.4 8 6 8z" fill="#79bf55" stroke="#2c5a28" strokeWidth="0.6"/></>)}
  {material==='stone'&&(<><path d="M4 8l4-5 7 1 3 6-4 7-7-1z" fill={c} stroke="#3b4048" strokeWidth="0.9"/><path d="M8 3l2 8 8-1M10 11l4 6" stroke="#cfd6df" strokeWidth="0.7" fill="none"/><path d="M4 8l6 3" stroke="#6a717b" strokeWidth="0.6" fill="none"/></>)}
  {material==='iron'&&(<><path d="M3 13l3-6h8l3 6z" fill={c} stroke="#2b3540" strokeWidth="0.9"/><path d="M6 13l2-6h4l2 6" fill="none" stroke="#c3d0dc" strokeWidth="0.7"/><path d="M2 16h16" stroke="#2b3540" strokeWidth="1.2"/></>)}
  {material==='fish'&&(<><path d="M3 10c3-4 8-5 11-2l3-3v10l-3-3c-3 3-8 2-11-2z" fill={c} stroke="#1f4a58" strokeWidth="0.9"/><circle cx="6.4" cy="9" r="0.9" fill="#eaf6fa"/><path d="M10 8.5c1.5 1 1.5 3 0 4" stroke="#bfe6f2" strokeWidth="0.7" fill="none"/></>)}
  {material==='relic'&&(<><path d="M10 1.5l5 4-1.5 11H6.5L5 5.5z" fill={c} stroke="#5a4318" strokeWidth="0.9"/><path d="M8 7h4M9 10h3M10 7v6" stroke="#f4e3b6" strokeWidth="0.8" fill="none"/></>)}
 </svg>;
}

const xpInto = (xp:number)=>xp%100;

/**
 * The Gatherer's Lodge — rebuilt.
 *
 * The old three-tab discovery board is gone. Every profession now shares one
 * lodge: pick a trade, send a journey into one of the five regions, and the haul
 * is banked in the lodge stores as material (wood, grass, stone, iron, fish,
 * relics) instead of sitting in a separate discoveries list.
 */
export function Professions({onClose}:{onClose:()=>void}){
 const {hero,heroId}=useGame();
 const [profession,setProfession]=useState<ProfessionId>('mining');
 const [area,setArea]=useState(0);
 const [now,setNow]=useState(Date.now());
 const [offset,setOffset]=useState(0);
 const request=useRequest();

 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(t);},[]);
 useEffect(()=>{void request.run(async()=>{const r=await readGathering();setOffset(r.now-Date.now());});},[heroId]);

 if(!hero)return null;
 const state=gatheringState(hero);
 const stores=lodgeStores(state);
 const stats=state.professions[profession]??{xp:0,tool:1,journeys:0};
 const level=professionLevel(stats.xp);
 const active=state.active;
 const clock=now+offset;
 const ready=active?Date.parse(active.readyAt)<=clock:false;
 const resting=state.nextAt?Date.parse(state.nextAt)>clock:false;
 const chosen=PROFESSIONS.find(p=>p.id===profession)??PROFESSIONS[0];
 const secondsLeft=active?Math.max(0,Math.ceil((Date.parse(active.readyAt)-clock)/1000)):0;
 const journey=(p:(typeof PROFESSIONS)[number])=>state.professions[p.id]??{xp:0,tool:1,journeys:0};
 const action=()=>void request.run(async()=>{const r=active?await finishGathering(active.request):await beginGathering(profession,area);setOffset(r.now-Date.now());});
 const lastHaul=state.history[0];

 return <Panel title="Gatherer's Lodge" onClose={onClose} wide>
  <RequestStatus {...request}/>

  <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
   <div className="min-w-0">
    <h3 className="font-display text-xl text-gold">Everything you gather is banked as material</h3>
    <p className="text-xs text-muted-foreground">Wood, grass, stone, iron, fish and relics — the lodge keeps the stock and shows it below.</p>
   </div>
   <div className="text-right">
    <p className="font-display text-lg">{chosen.name} · Level {level}</p>
    <p className="text-xs text-muted-foreground">{chosen.tool} · Tier {stats.tool||1} · {stats.journeys} journeys</p>
   </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
   <aside aria-label="Professions" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
    {PROFESSIONS.map(p=>{
     const s=journey(p);const lv=professionLevel(s.xp);const on=p.id===profession;
     return <button key={p.id} onClick={()=>{setProfession(p.id);setArea(0);}} aria-pressed={on}
      className={`slot flex items-center justify-between gap-2 p-2 text-left ${on?'ring-2 ring-gold':''}`}>
      <span className="min-w-0">
       <span className="block truncate font-display text-sm">{p.name}</span>
       <span className="block text-[11px] text-muted-foreground">Lv {lv} · {s.journeys} journeys</span>
      </span>
      <span className="w-12 shrink-0">
       <progress aria-label={`${p.name} experience`} max={100} value={xpInto(s.xp)} className="h-1.5 w-full accent-primary"/>
      </span>
     </button>;
    })}
   </aside>

   <section className="min-w-0">
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
     {GATHERING_AREAS.map((name,i)=>{
      const locked=level<areaRequirement(i);
      return <article key={name} className={`overflow-hidden rounded border border-border ${area===i?'ring-2 ring-gold':''}`}>
       <div className="relative aspect-[4/3] overflow-hidden">
        <img src={regions[i]} alt={name} loading="lazy" width={384} height={288} className="h-full w-full object-cover"/>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1 pt-4">
         <span className="block truncate font-display text-xs text-white">{name}</span>
        </span>
       </div>
       <div className="p-2">
        <p className="text-[11px] text-muted-foreground">Lv {areaRequirement(i)} · {gatheringSeconds(i)}s</p>
        <Button size="sm" variant={area===i?'default':'outline'} className="mt-1 w-full" disabled={locked||!!active} onClick={()=>setArea(i)}>
         {locked?'Locked':area===i?'Selected':'Explore'}
        </Button>
       </div>
      </article>;
     })}
    </div>

    <div role="status" className="my-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
     <div className="min-w-0">
      <p className={`font-display text-lg ${active&&!ready?'animate-pulse text-gold':''}`}>
       {active?`${PROFESSIONS.find(p=>p.id===active.profession)?.verb} · ${GATHERING_AREAS[active.area]}`:resting?'The lodge rests after your last journey':`${chosen.name} · ${GATHERING_AREAS[area]}`}
      </p>
      <p className="text-sm text-muted-foreground">
       {active?(ready?'Haul ready to collect':`${secondsLeft}s remaining`):resting?`Ready again in ${countdown(Date.parse(state.nextAt??'')-clock)}`:`${gatheringSeconds(area)} second journey · banks ${LODGE_MATERIALS[profession==='logging'?'wood':profession==='herbalism'?'grass':profession==='fishing'?'fish':profession==='mining'?'stone':'relic'].name}`}
      </p>
     </div>
     <Button disabled={request.busy||(active?!ready:resting||level<areaRequirement(area))} onClick={action}>
      {active?'Collect the haul':'Send the gatherers'}
     </Button>
    </div>

    <div className="mb-2 flex items-end justify-between gap-2">
     <h3 className="font-display text-lg">Lodge stores · {stores.total.toLocaleString()} materials</h3>
     {lastHaul&&<p className="truncate text-[11px] text-muted-foreground">Last haul: {LODGE_MATERIALS[haulMaterial(lastHaul)].name} ×{lastHaul.quantity}</p>}
    </div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
     {LODGE_MATERIAL_ORDER.map(m=>{
      const count=stores.stock[m];const tiers=stores.rarities[m];
      return <article key={m} className={`slot flex items-center gap-3 p-2.5 ${count>0?'':'opacity-60'}`} title={LODGE_MATERIALS[m].desc}>
       <MaterialGlyph material={m} size={28}/>
       <div className="min-w-0">
        <p className="font-display text-sm">{LODGE_MATERIALS[m].name} <b className="text-gold">×{count.toLocaleString()}</b></p>
        <p className="truncate text-[11px] text-muted-foreground">
         {count>0
          ? DISCOVERY_RARITIES.map((label,i)=>tiers[i]?`${label} ${tiers[i]}`:null).filter(Boolean).join(' · ')
          : 'Nothing banked yet'}
        </p>
       </div>
      </article>;
     })}
    </div>

    <h3 className="mt-5 font-display text-lg">Recent hauls</h3>
    <div className="mt-2 max-h-40 overflow-y-auto">
     {state.history.length===0&&<p className="py-3 text-sm text-muted-foreground">No journeys yet — send the gatherers out.</p>}
     {state.history.slice(0,20).map(d=>{
      const material=haulMaterial(d);
      return <p key={d.request} className="flex items-center gap-2 border-b border-border py-1.5 text-sm">
       <MaterialGlyph material={material} size={16}/>
       <span className="min-w-0 flex-1 truncate">
        <span className="text-gold">{LODGE_MATERIALS[material].name} ×{d.quantity}</span>
        <span className="text-muted-foreground"> · {DISCOVERY_NAMES[d.profession][d.rarity]} · {GATHERING_AREAS[d.area]}</span>
       </span>
       <span className="shrink-0 text-xs text-muted-foreground">+{d.xp} XP · {new Date(d.at).toLocaleDateString()}</span>
      </p>;
     })}
    </div>
   </section>
  </div>
 </Panel>;
}

import { object } from './services-contract';
export const PROFESSIONS = [
  { id:'mining',name:'Mining',tool:'Pickaxe',verb:'Mining' },
  { id:'herbalism',name:'Herbalism',tool:'Gathering sickle',verb:'Gathering herbs' },
  { id:'logging',name:'Logging',tool:'Woodcutter’s axe',verb:'Cutting timber' },
  { id:'fishing',name:'Fishing',tool:'Fishing rod',verb:'Fishing' },
  { id:'archaeology',name:'Archaeology',tool:'Excavation brush',verb:'Excavating' },
  { id:'treasure',name:'Treasure Hunting',tool:'Survey compass',verb:'Searching for treasure' },
] as const;
export type ProfessionId = typeof PROFESSIONS[number]['id'];
export const GATHERING_AREAS = ['Verdant Riverlands','Ember Mines','Sunken Kingdom','Frostwater Reach','Astral Wilds'];
export const DISCOVERY_RARITIES=['Common','Uncommon','Rare','Exceptional'];
export const DISCOVERY_NAMES:Record<ProfessionId,string[]>={
  mining:['Copper Ore','Silver Ore','Azure Crystal','Sunfire Geode'],herbalism:['Wildleaf','Moonmint','Starblossom','Phoenix Orchid'],
  logging:['Oak Timber','Ironwood','Runewood','Worldtree Heart'],fishing:['River Perch','Silverfin','Frost Koi','Celestial Ray'],
  archaeology:['Pottery Shard','Runic Tablet','Royal Artifact','Ancient Seal'],treasure:['Roadside Cache','Merchant’s Cache','Forgotten Vault','Sovereign’s Hoard'],
};
export interface Discovery {request:string;profession:ProfessionId;area:number;rarity:number;quantity:number;resource:string;xp:number;at:string}
export interface GatheringState {professions:Record<string,{xp:number;tool:number;journeys:number}>;resources:Record<string,number>;history:Discovery[];active:{request:string;profession:ProfessionId;area:number;startedAt:string;readyAt:string}|null;nextAt?:string}
export const professionLevel=(xp:number)=>1+Math.floor(xp/100);
export const areaRequirement=(area:number)=>1+area*5;
export const gatheringSeconds=(area:number)=>30+area*15;

/* ------------------------------------------------------------------------- *
 * The lodge's stores
 *
 * Everything a journey brings back is banked as material — wood, grass, stone,
 * iron and the rest of the lodge's stock — not as a one-off "discovery". The
 * server owns the haul (`srv.gathering.resources`, keyed profession:area:rarity);
 * these helpers turn that ledger into the materials the lodge stores.
 * ------------------------------------------------------------------------- */

export type LodgeMaterial = 'wood'|'grass'|'stone'|'iron'|'fish'|'relic';

export const LODGE_MATERIALS:Record<LodgeMaterial,{name:string;desc:string;color:string}> = {
  wood: {name:'Wood',desc:'Timber felled in the lodge forests. Every building wants it.',color:'#8a5a32'},
  grass: {name:'Grass',desc:'Wild grass, herbs and blooms bundled at the lodge.',color:'#5f9e3f'},
  stone: {name:'Stone',desc:'Cut blocks and quarried rock from the deep seams.',color:'#8d949f'},
  iron: {name:'Iron',desc:'Iron ore and salvaged ingots, smelted from the richest veins.',color:'#6d7c8c'},
  fish: {name:'Fish',desc:'Catch from the rivers and the deep sea shelves.',color:'#3f8fa8'},
  relic: {name:'Relic',desc:'Unearthed fragments: pottery, runes and old seals.',color:'#b08a3e'},
};

export const LODGE_MATERIAL_ORDER:LodgeMaterial[] = ['wood','grass','stone','iron','fish','relic'];

/** Which material a haul is banked as: the deep seams and old vaults also pay iron. */
export function discoveryMaterial(profession:ProfessionId,rarity:number):LodgeMaterial{
  switch(profession){
    case 'mining': return rarity>=2?'iron':'stone';
    case 'logging': return 'wood';
    case 'herbalism': return 'grass';
    case 'fishing': return 'fish';
    default: return 'relic';
  }
}

export interface LodgeStores {stock:Record<LodgeMaterial,number>;rarities:Record<LodgeMaterial,Record<number,number>>;total:number}

/** The lodge stores, read from the server's resource ledger. */
export function lodgeStores(state:GatheringState):LodgeStores{
  const stock:Record<LodgeMaterial,number> = {wood:0,grass:0,stone:0,iron:0,fish:0,relic:0};
  const rarities:Record<LodgeMaterial,Record<number,number>> = {wood:{},grass:{},stone:{},iron:{},fish:{},relic:{}};
  let total = 0;
  for(const [key,n] of Object.entries(state.resources)){
    const [profession,,rarity] = key.split(':');
    if(!PROFESSIONS.some(p=>p.id===profession)||!Number.isFinite(Number(n))||Number(n)<=0) continue;
    const material = discoveryMaterial(profession as ProfessionId,Number(rarity)||0);
    stock[material] += Number(n);
    rarities[material][Number(rarity)||0] = (rarities[material][Number(rarity)||0] ?? 0) + Number(n);
    total += Number(n);
  }
  return {stock,rarities,total};
}

/** The material a finished journey deposited, for the haul line the lodge shows. */
export function haulMaterial(discovery:Discovery):LodgeMaterial{
  return discoveryMaterial(discovery.profession,discovery.rarity);
}

export function gatheringState(hero:unknown):GatheringState{
 const g=object(object(object(hero)['srv'])['gathering']);
 return {professions:object(g['professions']) as GatheringState['professions'],resources:object(g['resources']) as GatheringState['resources'],history:Array.isArray(g['history'])?g['history'] as Discovery[]:[],active:g['active']?g['active'] as GatheringState['active']:null,...(typeof g['nextAt']==='string'?{nextAt:g['nextAt']}:{})};
}
export function validateGatheringResponse(value:unknown){
 const r=object(value);if(typeof r['now']!=='string'||!Number.isFinite(Date.parse(r['now'])))throw new Error('Gathering clock unavailable');
 const g=gatheringState(r['save']);const active=g.active;
 if(active&&(!PROFESSIONS.some(p=>p.id===active.profession)||!Number.isInteger(active.area)||active.area<0||active.area>4||typeof active.request!=='string'||!Number.isFinite(Date.parse(active.readyAt))))throw new Error('Invalid gathering journey');
 return {state:g,now:Date.parse(r['now'])};
}
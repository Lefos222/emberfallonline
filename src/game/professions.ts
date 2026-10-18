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
  archaeology:['Pottery Shard','Runic Tablet','Royal Artifact','Ancestor’s Seal'],treasure:['Roadside Cache','Merchant’s Cache','Forgotten Vault','Sovereign’s Hoard'],
};
export interface Discovery {request:string;profession:ProfessionId;area:number;rarity:number;quantity:number;resource:string;xp:number;at:string}
export interface GatheringState {professions:Record<string,{xp:number;tool:number;journeys:number}>;resources:Record<string,number>;history:Discovery[];active:{request:string;profession:ProfessionId;area:number;startedAt:string;readyAt:string}|null;nextAt?:string}
export const professionLevel=(xp:number)=>1+Math.floor(xp/100);
export const areaRequirement=(area:number)=>1+area*5;
export const gatheringSeconds=(area:number)=>30+area*15;
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
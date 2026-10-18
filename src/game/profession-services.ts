import { supabase } from '@/integrations/supabase/client';
import { withServerHero,adoptServerSave,getState } from './store';
import { requestKey,returnedSave } from './services-contract';
import { validateGatheringResponse,type ProfessionId } from './professions';

export async function readGathering(){return withServerHero(async id=>{const {data,error}=await supabase.rpc('profession_state',{_hero:id});if(error)throw new Error(error.message);const result=validateGatheringResponse(data);adoptServerSave(id,returnedSave(data));return result;});}
export async function beginGathering(profession:ProfessionId,area:number){
 const id=getState().heroId;if(!id)throw new Error('Select a character first');
 const req=requestKey(localStorage,id,'gathering',()=>crypto.randomUUID());
 return withServerHero(async heroId=>{const {data,error}=await supabase.rpc('begin_gathering',{_hero:heroId,_profession:profession,_area:area,_req:req});if(error)throw new Error(error.message);const result=validateGatheringResponse(data);adoptServerSave(heroId,returnedSave(data));return result;});
}
export async function finishGathering(req:string){
 return withServerHero(async id=>{const {data,error}=await supabase.rpc('finish_gathering',{_hero:id,_req:req});if(error)throw new Error(error.message);const result=validateGatheringResponse(data);adoptServerSave(id,returnedSave(data));localStorage.removeItem(`ef-pending:${id}:gathering`);return result;});
}
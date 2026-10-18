import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Panel } from './ui';
import { CharacterPose } from './CharacterPose';
import { useGame, updateProfile } from './store';
import { frameClass } from './CharacterSelect';
import { earnedTitles } from './progress';
import { object, returnedSave } from './services-contract';
import { adoptServerSave, withServerHero } from './store';
import { supabase } from '@/integrations/supabase/client';
import { RequestStatus, useRequest } from './Rewards';

const frames=[{id:'iron',name:'Iron',level:1},{id:'bronze',name:'Bronze',level:10},{id:'silver',name:'Silver',level:25},{id:'gold',name:'Gold',level:50},{id:'ember',name:'Ember',level:80}];
const collection=[
  {id:'wings_seraph',name:'Seraph Wings',requirement:'Reach level 50'},
  {id:'wings_void',name:'Void Wings',requirement:'Clear a challenge at difficulty 5'},
  {id:'outfit_shadow',name:'Shadow Outfit',requirement:'Win a Dungeon Gate challenge'},
  {id:'skin_inferno',name:'Inferno Skin',requirement:'Craft 10 items'},
  {id:'skin_frost',name:'Frost Skin',requirement:'Win 10 Arena battles'},
  {id:'frame_astral',name:'Astral Frame',requirement:'Own six Astral species'},
  {id:'outfit_frost',name:'Frost Outfit',requirement:'Own an Orange or Gold Astral'},
  {id:'title_luckystar',name:'Lucky Star',requirement:'Own a Gold Astral'},
];
export function Boutique({onClose}:{onClose:()=>void}){
  const {hero,heroId,chars,gender}=useGame();const row=chars?.find(c=>c.id===heroId);
  const [frame,setFrame]=useState(row?.frame??'iron');const [title,setTitle]=useState(row?.title??'');const [notice,setNotice]=useState('');const request=useRequest();
  if(!hero)return null;
  const raw=object(object(hero)['srv'])['cosmetics'];const owned=Array.isArray(raw)?raw:[];
  return <Panel title="Cosmetic Boutique" onClose={onClose} wide><RequestStatus {...request}/><div className="grid gap-6 md:grid-cols-[240px_1fr]"><div><div className={`slot aspect-square p-2 ${frameClass(frame)}`}><CharacterPose cls={hero.cls} gender={gender} className="aspect-square w-full"/></div><p className="mt-2 text-center font-display text-xl">{hero.name}</p><p className="text-center text-gold">{title}</p></div><div><h3 className="font-display text-lg">Portrait frames</h3><div className="my-3 flex flex-wrap gap-2">{frames.map(f=><Button key={f.id} variant={frame===f.id?'default':'outline'} disabled={hero.level+hero.paragon<f.level} title={`Level ${f.level}`} onClick={()=>setFrame(f.id)}>{f.name} · Lv {f.level}</Button>)}</div><label className="block text-sm">Title<select aria-label="Boutique title" value={title} onChange={e=>setTitle(e.target.value)} className="my-2 w-full rounded border border-border bg-background p-2">{[...new Set(['',...(row?.title?[row.title]:[]),...earnedTitles(hero)])].map(t=><option key={t} value={t}>{t||'None'}</option>)}</select></label><Button disabled={request.busy} onClick={()=>void request.run(async()=>{const error=await updateProfile({frame,title});if(error)throw new Error(error);setNotice('Appearance saved');})}>Save appearance</Button>{notice&&<p role="status" className="mt-2 text-r1">{notice}</p>}</div></div><h3 className="mt-6 font-display text-xl">Earned cosmetic collection</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{collection.map(c=><article key={c.id} className="slot flex flex-wrap items-center justify-between gap-2 p-3"><div><h4 className="font-display">{c.name}</h4><p className="text-xs text-muted-foreground">{c.requirement}</p></div><Button size="sm" variant="outline" disabled={request.busy||owned.includes(c.id)} onClick={()=>void request.run(async()=>{await withServerHero(async id=>{const {data,error}=await supabase.rpc('unlock_cosmetic',{_hero:id,_id:c.id});if(error)throw new Error(error.message);adoptServerSave(id,returnedSave(data));});setNotice(`${c.name} saved to your collection`);})}>{owned.includes(c.id)?'Owned':'Check unlock'}</Button></article>)}</div><p className="mt-3 text-xs text-muted-foreground">Collection unlocks are saved; outfit and wing rendering is not available yet.</p></Panel>;
}
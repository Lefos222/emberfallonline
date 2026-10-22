import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import scrollArt from '@/assets/battle-scrolls.png';
import { MATS, gemName, gemStatText, parseGem, astralLabel, astralStatText, type Mat } from './crafting';
import { MatIcon, GemIcon } from './MatIcon';
import { SCROLLS, scrollState, type ScrollKind } from './scrolls';
import { object } from './services-contract';
import { activateScroll } from './services';
import { RequestStatus, useRequest } from './Rewards';
import type { Hero } from './data';

export function InventoryCollections({ hero }: { hero: Hero }) {
  const request = useRequest();
  const [notice, setNotice] = useState('');
  const { owned, buffs } = scrollState(hero);
  const cosmetics = object(object(hero)['srv'])['cosmetics'];
  const titles = Array.isArray(cosmetics) ? cosmetics.filter((x): x is string => typeof x === 'string') : [];
  return <div className="mt-4 space-y-4" aria-label="Inventory collections">
    <section><h3 className="mb-2 font-display text-gold">Crafting materials</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(Object.keys(MATS) as Mat[]).filter(k => (hero.mats?.[k] ?? 0) > 0).map(k => <div key={k} className={`slot rarity-${MATS[k].rarity} flex items-center gap-2 p-2`} title={MATS[k].desc}><MatIcon mat={k} size={32}/><div className="min-w-0 text-xs"><span className="block break-words">{MATS[k].name}</span><b>×{hero.mats?.[k]}</b></div></div>)}</div>
    </section>
    <section><h3 className="mb-2 font-display text-gold">Gems</h3><div className="grid grid-cols-2 gap-2">{Object.entries(hero.gems ?? {}).filter(([,n])=>n>0).map(([key,n])=>{const g=parseGem(key);if(!g)return null;return <div key={key} className={`slot rarity-${g.tier} flex items-center gap-2 p-2`}><GemIcon type={g.type} size={32}/><div className="min-w-0 text-xs"><span className="block break-words">{gemName(key)} ×{n}</span><span className="text-muted-foreground">{gemStatText(key)}</span></div></div>;})}</div></section>
    <section><h3 className="mb-2 font-display text-gold">Battle scrolls</h3><RequestStatus {...request}/>
      <div className="space-y-2">{(Object.keys(SCROLLS) as ScrollKind[]).filter(k=>owned[k]>0||buffs[k]>0).map((kind)=>{const col=kind==='dmg'?0:kind==='def'?1:2;return <div key={kind} className="flex flex-wrap items-center gap-2 border-b border-border py-2"><div className="slot rarity-2 relative h-12 w-12 shrink-0 overflow-hidden"><img src={scrollArt} alt={SCROLLS[kind].name} className="absolute h-full max-w-none" style={{width:'300%',left:`${-col*100}%`}}/></div><div className="min-w-0 flex-1 text-xs"><span className="block">{SCROLLS[kind].name} ×{owned[kind]}</span><span className="text-muted-foreground">+20% · {buffs[kind]>0?`${buffs[kind]} battles remaining`:'10 battles'}</span></div><Button size="sm" variant="outline" disabled={request.busy||owned[kind]<1||buffs[kind]>0} onClick={()=>void request.run(async()=>{await activateScroll(kind);setNotice(`${SCROLLS[kind].name} activated`);})}>{buffs[kind]>0?'Active':'Activate'}</Button></div>;})}</div>
      {notice&&<p role="status" className="mt-2 text-xs text-r1">{notice}</p>}
    </section>
    <section><h3 className="mb-2 font-display text-gold">Astral collection</h3><div className="grid grid-cols-2 gap-2">{(hero.astrals??[]).map(a=><div key={a.id} className={`slot rarity-${a.rarity} p-2 text-xs`}><Sparkles className="mb-1 h-5 w-5 text-gold"/><span className="block break-words">{astralLabel(a)}</span><span className="text-muted-foreground">{astralStatText(a)}{hero.astralSlots?.includes(a.id)?' · Equipped':''}</span></div>)}</div></section>
    {(hero.anc?.relics??0)>0&&<section><h3 className="font-display text-gold">Ancestral relics · ×{hero.anc?.relics}</h3></section>}
    {titles.length>0&&<section><h3 className="mb-2 font-display text-gold">Owned cosmetics</h3><ul className="space-y-1 text-xs">{titles.map(t=><li key={t} className="capitalize">{t.replaceAll('_',' ')}</li>)}</ul></section>}
  </div>;
}
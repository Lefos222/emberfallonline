import { useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave,withServerHero } from "./store";
import { object,returnedSave } from "./services-contract";
import { t } from "./i18n";
import { ArtIcon } from "./ArtIcon";
export function RealmPursuits({ scope }: { scope:"world"|"guild" }) {
 const [state,setState]=useState<{count:number;claimed:number[]}|null>(null);const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
 const run=async(milestone=0)=>{setBusy(true);setErr("");try {await withServerHero(async id=>{const {data,error}=await supabase.rpc("realm_pursuits",{_hero:id,_scope:scope,_milestone:milestone});if(error)throw new Error(error.message);const o=object(data);adoptServerSave(id,returnedSave(data));setState({count:Number(o["count"]),claimed:Array.isArray(o["claimed"])?o["claimed"].map(Number):[]});});}catch(e){setErr(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
 useEffect(()=>{void run();},[scope]);
 const next=state?Math.min(...Array.from({length:state.claimed.length+1},(_,i)=>i+1).filter(i=>!state.claimed.includes(i))):1;const target=next*(scope==="world"?10:5);
 return <section className="flex flex-wrap items-center gap-3 border-y border-border p-3"><ArtIcon name={scope==="world"?"quest":"gift"} size={36}/><div className="min-w-0 flex-1"><h3 className="font-display text-gold">{t(scope==="world"?"Realm Explorer":"Guild Rally")}</h3><p className="text-xs text-muted-foreground">{t(scope==="world"?"Complete World Tree raids for repeatable exploration milestones.":"Roll guild dice together for weekly shared milestones.")}</p><p className="text-xs">{state?`${state.count}/${target}`:t("Loading…")} · {t("Gold and ordinary crafting materials")}</p></div><Button size="sm" disabled={busy||!state||state.count<target} onClick={()=>void run(next)}>{t("Claim")}</Button><Button variant="outline" size="sm" disabled={busy} onClick={()=>void run()}>{t("Refresh")}</Button>{err&&<p role="status" className="w-full text-xs text-hp">{err}</p>}</section>;
}
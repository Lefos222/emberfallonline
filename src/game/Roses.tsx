import roseArt from "@/assets/friendship-rose.png";
import { Button } from "@/components/ui/button";
import { roseCount, friendshipPoints, rosePrice } from "./friendship";
import { useGame } from "./store";
import { useFriendshipRose } from "./services";
import { useState } from "react";
import { t } from "./i18n";
import { InfoTip } from "./ui";
export function RoseItem({ compact = false, friend }: { compact?: boolean; friend?: string }) {
  const { hero } = useGame(); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
  if(!hero) return null;
  const act=async()=>{setBusy(true);setMsg("");try {await useFriendshipRose(friend);setMsg(t(friend ? "Rose sent" : "Rose purchased"));} catch(e){setMsg(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
  if(compact) return <InfoTip title={t("Rose")} lines={[t("Send a rose to a friend. Both heroes earn one friendship point, adding permanent health and BR without a cap."),t("20% chance from claimed login, activities, World Tree raids and guild dice.")]}><Button variant="outline" className="slot bag-mat relative h-11 w-11 p-1" aria-label={t("Rose")}><img src={roseArt} width={1024} height={1024} loading="lazy" alt="" className="h-8 w-8 object-contain"/><span className="bag-mat-count">{roseCount(hero)}</span></Button></InfoTip>;
  return <div className="flex flex-wrap items-center gap-3 border-y border-border py-3"><img src={roseArt} width={1024} height={1024} loading="lazy" alt="" className="h-12 w-12 object-contain"/><div className="min-w-0 flex-1"><b className="text-gold">{t("Roses")}: {roseCount(hero)}</b>{!friend&&<p className="text-xs">{t("Friendship points")}: {friendshipPoints(hero)} · +{(friendshipPoints(hero)*0.1).toFixed(1)}% {t("Health")}</p>}</div><Button size="sm" disabled={busy || (friend ? roseCount(hero)<1 : hero.gold<rosePrice(hero.level))} onClick={()=>void act()}>{friend?t("Send rose"):`${t("Buy rose")} · ${rosePrice(hero.level)} ${t("gold")}`}</Button>{msg&&<p role="status" className="w-full text-xs">{msg}</p>}</div>;
}
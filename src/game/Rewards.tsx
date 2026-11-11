import activityArt from "@/assets/activity-command-desk.jpg";
import { ArtIcon } from "./ArtIcon";
import { t } from "./i18n";
import { useEffect, useRef, useState } from "react";
import { Check, Gift, Loader2, Mail, Sparkles } from "lucide-react";
import { RefreshCw } from "./PaintedIcons";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useGame } from "./store";
import { GameTabs, Panel } from "./ui";
import { activities, reward, rewardLines, takeLuckyShot } from "./services";
import { object, type Activities, type Objective } from "./services-contract";
import { ASTRAL_ODDS, ASTRAL_RARITY, astralLabel, astralStatText, type Astral } from "./crafting";
import { DailyRewardsBoard } from "./DailyRewardsBoard";

export function useRequest() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<void>) => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(null);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "The game server could not be reached. Please retry."); }
    finally { locked.current = false; setBusy(false); }
  };
  return { busy, error, run };
}

export function RequestStatus({ busy, error }: { busy: boolean; error: string | null }) {
  return <>{busy && <p role="status" className="flex items-center gap-2 py-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t("Syncing…")}</p>}
    {error && <p role="alert" className="my-2 break-words text-sm text-hp">{error}</p>}</>;
}

export function Mailbox({ onClose }: { onClose: () => void }) {
  const { heroId } = useGame();
  const request = useRequest();
  const [mail, setMail] = useState<Tables<"mail">[] | null>(null);
  const [states, setStates] = useState<Tables<"mail_state">[]>([]);
  const [selected, select] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);
  const load = async () => {
    if (!heroId) return;
    const [messages, status] = await Promise.all([
      supabase.from("mail").select("*").or(`hero_id.eq.${heroId},hero_id.is.null`).order("created_at", { ascending: false }),
      supabase.from("mail_state").select("*").eq("hero_id", heroId),
    ]);
    if (messages.error || status.error) throw new Error(messages.error?.message ?? status.error?.message);
    setMail(messages.data ?? []); setStates(status.data ?? []);
  };
  useEffect(() => { void request.run(load); }, [heroId]);
  const current = mail?.find((m) => m.id === selected);
  const state = states.find((s) => s.mail_id === selected);
  const expired = current?.expires_at ? Date.parse(current.expires_at) <= Date.now() : false;
  return <Panel title={t("Mailbox")} subtitle={t("Rewards and letters from the realm")} art="mail" onClose={onClose} wide>
    <div className="mb-3 flex justify-end"><Button variant="outline" size="icon" aria-label={t("Refresh mailbox")} disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    <RequestStatus {...request} />
    <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
      <div className="space-y-1">{mail?.length === 0 && <p className="py-6 text-muted-foreground">{t("Your mailbox is empty.")}</p>}
        {mail?.map((m) => <Button key={m.id} variant="ghost" disabled={request.busy} className={`h-auto w-full justify-start whitespace-normal py-3 text-left ${selected === m.id ? "bg-accent" : ""}`} onClick={() => void request.run(async () => {
          select(m.id);
          if (!heroId) return;
          const { error } = await supabase.rpc("read_mail", { _hero: heroId, _mail: m.id });
          if (error) throw new Error(error.message);
          await load();
        })}><Mail className="shrink-0 text-gold" /><span className="min-w-0 break-words">{m.subject}<span className="block text-xs text-muted-foreground">{m.sender} · {new Date(m.created_at).toLocaleDateString()}{states.some((s) => s.mail_id === m.id && s.claimed_at) ? t("· Claimed") : ""}</span></span></Button>)}
      </div>
      <div>{current ? <>
        <h3 className="font-display text-2xl text-gold">{current.subject}</h3><p className="mb-4 text-xs text-muted-foreground">{t("From")} {current.sender}</p>
        <p className="whitespace-pre-wrap break-words text-sm">{current.body}</p>
        <div className="my-4 space-y-1 text-sm">{rewardLines(current.attachments).map((line) => <div key={line} className="flex items-center gap-2"><Gift className="h-4 w-4 text-gold" />{line}</div>)}</div>
        {current.expires_at && <p className="mb-3 text-xs text-muted-foreground">{expired ? t("Expired") : `Expires ${new Date(current.expires_at).toLocaleString()}`}</p>}
        <Button disabled={request.busy || !!state?.claimed_at || expired || Object.keys(object(current.attachments)).length === 0} onClick={() => void request.run(async () => {
          await reward("claim_mail", { _mail: current.id }); setClaimed(rewardLines(current.attachments)); await load();
        })}><Gift />{state?.claimed_at ? t("Claimed") : t("Claim attachments")}</Button>
        {claimed.length > 0 && <p role="status" className="mt-3 text-sm text-r1">{t("Added to your character:")} {claimed.join(" · ")}</p>}
      </> : <p className="py-6 text-muted-foreground">{mail && mail.length > 0 ? t("No message selected.") : ""}</p>}</div>
    </div>
  </Panel>;
}

export function LuckyShots({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const request = useRequest();
  const [last, setLast] = useState<Astral | null>(null);
  const count = object(object(hero)['srv'])['luckyShots'];
  const shots = typeof count === "number" ? count : null;
  return <Panel title={t("Lucky Shots")} subtitle={t("Spin for astrals and gems")} art="lucky" onClose={onClose}>
    <div className="border-b border-border pb-5 text-center">
      <Sparkles className="mx-auto mb-3 h-12 w-12 text-gold" />
      <p className="font-display text-3xl">{shots === null ? t("Shots unavailable") : `${shots} shots remaining`}</p>
      <div className="my-5 grid grid-cols-7 gap-2" aria-label={t("Seven Lucky Shots")}>{Array.from({ length: 7 }, (_, i) => <div key={i} className={`slot flex aspect-square items-center justify-center ${shots !== null && i < shots ? "text-gold" : "text-muted-foreground/40"}`}><Sparkles className="h-5 w-5" /></div>)}</div>
      <Button disabled={request.busy || shots === null || shots <= 0} onClick={() => void request.run(async () => { setLast(await takeLuckyShot()); })}><Sparkles />{t("Take a shot")}</Button>
    </div>
    <RequestStatus {...request} />
    {last && <div role="status" className={`rarity-${last.rarity} slot my-5 p-4 text-center`}><p className="font-display text-2xl text-gold">{astralLabel(last)}</p><p className="mt-1 text-sm">{astralStatText(last)}</p><p className="mt-2 flex items-center justify-center gap-1 text-xs text-r1"><Check className="h-4 w-4" />{t("Saved to your Astral collection")}</p></div>}
    <h3 className="mt-4 mb-2 font-display text-lg">{t("Rarity odds")}</h3>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ASTRAL_ODDS.map((odds, i) => <div key={i} className={`slot rarity-${i} flex justify-between gap-2 p-2 text-sm`}><span>{ASTRAL_RARITY[i]}</span><b>{odds}%</b></div>)}</div>
  </Panel>;
}

const KIND_LABEL: Record<string, string> = { kill: "Enemies defeated", dungeon: "Dungeons cleared", boss: "Bosses defeated", craft: "Items crafted", gem: "Gem actions", astral: "Astral actions", arena: "Arena battles" };
export function ActivityBoard({ onClose }: { onClose: () => void }) {
  const { heroId } = useGame();
  const request = useRequest();
  const [board, setBoard] = useState<Activities | null>(null);
  const [tab, setTab] = useState<"daily" | "weekly" | "login">("daily");
  const [receipt, setReceipt] = useState<string[]>([]);
  const [onlyReady, setOnlyReady] = useState(false);
  const load = async () => { if (heroId) setBoard(await activities(heroId)); };
  useEffect(() => { void request.run(load); }, [heroId]);
  const claim = async (id: string) => { const result = await reward("claim_activity", { _objective: id }); setReceipt(rewardLines(result)); await load(); };
  const list = board && tab !== "login" ? board[tab] : [];
  const ready = (o: Objective) => !o.claimed && o.progress >= o.target && (!o.stage || o.stage === 1 || !!board?.weekly.find(p => p.kind === o.kind && p.stage === (o.stage ?? 1) - 1)?.claimed);
  const shown = list.filter(o => !onlyReady || ready(o)).slice().sort((a,b) => Number(a.claimed)-Number(b.claimed) || Number(ready(b))-Number(ready(a)));
  return <Panel title={t("Daily & Weekly Activities")} subtitle={t("Fresh tasks every reset")} art="gift" onClose={onClose} wide>
    <img src={activityArt} alt="" width={1536} height={1024} loading="lazy" className="mb-4 h-36 w-full rounded-md object-cover" />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <GameTabs label={t("Activity period")} value={tab} onChange={setTab} tabs={[{ id: "daily", name: "Daily" }, { id: "weekly", name: "Weekly" }, { id: "login", name: t("Login reward") }]} />
      <Button variant="outline" size="icon" aria-label={t("Refresh activities")} title={t("Refresh activities")} disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button>
    </div>
    <RequestStatus {...request} />
    {board && tab !== "login" && <>
      <div className="my-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <div><b className="font-display text-lg text-gold">{list.filter(o => o.claimed).length}/{list.length} {t("Claimed")}</b><p className="text-xs text-muted-foreground">{t("Resets")} {new Date(tab === "daily" ? board.dailyReset : board.weeklyReset).toLocaleString()}</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyReady} onChange={e => setOnlyReady(e.target.checked)} />{t("Ready to claim")}</label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{shown.map(o => <article key={o.id} className="flex gap-3 rounded-md border border-border bg-card p-4">
        <ArtIcon name={o.kind === "craft" ? "hammer" : o.kind === "gem" ? "gem" : o.kind === "astral" ? "astral" : "swords"} size={40} />
        <div className="min-w-0 flex-1"><h3 className="font-display text-base">{t(KIND_LABEL[o.kind] ?? o.kind)}{o.stage ? ` · ${t("Stage")} ${o.stage}` : ""}</h3>
        <div className="my-2 flex justify-between text-xs text-muted-foreground"><span>{t("Progress")}</span><span>{Math.min(o.progress,o.target)}/{o.target}</span></div>
        <progress className="mb-3 h-2 w-full accent-primary" max={o.target} value={Math.min(o.progress,o.target)} />
        {o.stage && o.stage > 1 && !ready(o) && !o.claimed && <p className="mb-2 text-xs text-muted-foreground">{t("Claim the previous stage first.")}</p>}
        <Button className="w-full" variant={o.claimed ? "outline" : "default"} disabled={request.busy || !ready(o)} onClick={() => void request.run(() => claim(o.id))}>{o.claimed ? <Check /> : <Gift />}{o.claimed ? t("Claimed") : t("Claim")}</Button></div>
      </article>)}</div>
      {shown.length === 0 && <p className="py-8 text-center text-muted-foreground">{t("No activities ready to claim.")}</p>}
      {tab === "daily" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border py-4"><span className="font-display text-lg text-gold">{t("Complete all daily objectives")}</span><Button disabled={request.busy || board.dailyBonusClaimed || !board.daily.length || !board.daily.every(o => o.claimed)} onClick={() => void request.run(() => claim("all"))}><Gift />{board.dailyBonusClaimed ? t("Claimed") : t("Claim bonus")}</Button></div>}
    </>}
    {board && tab === "login" && <>
      <div className="my-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4"><div><h3 className="font-display text-xl text-gold">{t("Login reward")}</h3><p className="text-sm text-muted-foreground">{t("Streak:")} {board.login.streak} {t("days · Total:")} {board.login.total}</p></div><Button disabled={request.busy || board.login.claimedToday} onClick={() => void request.run(async () => { const r = await reward("claim_login", {}); setReceipt(rewardLines(r)); await load(); })}><Gift />{board.login.claimedToday ? t("Claimed today") : t("Claim login reward")}</Button></div>
      <DailyRewardsBoard />
    </>}
    {receipt.length > 0 && <p role="status" className="mt-4 break-words text-sm text-r1">{t("Received:")} {receipt.join(" · ")}</p>}
  </Panel>;
}

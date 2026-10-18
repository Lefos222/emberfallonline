import { useEffect, useRef, useState } from "react";
import { Check, Gift, Loader2, Mail, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useGame } from "./store";
import { Panel } from "./ui";
import { activities, reward, rewardLines, takeLuckyShot } from "./services";
import { object, type Activities, type Objective } from "./services-contract";
import { ASTRAL_ODDS, ASTRAL_RARITY, astralLabel, astralStatText, type Astral } from "./crafting";

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
  return <>{busy && <p role="status" className="flex items-center gap-2 py-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Syncing…</p>}
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
  return <Panel title="Mailbox" onClose={onClose} wide>
    <div className="mb-3 flex justify-end"><Button variant="outline" size="icon" aria-label="Refresh mailbox" disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    <RequestStatus {...request} />
    <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
      <div className="space-y-1">{mail?.length === 0 && <p className="py-6 text-muted-foreground">Your mailbox is empty.</p>}
        {mail?.map((m) => <Button key={m.id} variant="ghost" disabled={request.busy} className={`h-auto w-full justify-start whitespace-normal py-3 text-left ${selected === m.id ? "bg-accent" : ""}`} onClick={() => void request.run(async () => {
          select(m.id);
          if (!heroId) return;
          const { error } = await supabase.rpc("read_mail", { _hero: heroId, _mail: m.id });
          if (error) throw new Error(error.message);
          await load();
        })}><Mail className="shrink-0 text-gold" /><span className="min-w-0 break-words">{m.subject}<span className="block text-xs text-muted-foreground">{m.sender} · {new Date(m.created_at).toLocaleDateString()}{states.some((s) => s.mail_id === m.id && s.claimed_at) ? " · Claimed" : ""}</span></span></Button>)}
      </div>
      <div>{current ? <>
        <h3 className="font-display text-2xl text-gold">{current.subject}</h3><p className="mb-4 text-xs text-muted-foreground">From {current.sender}</p>
        <p className="whitespace-pre-wrap break-words text-sm">{current.body}</p>
        <div className="my-4 space-y-1 text-sm">{rewardLines(current.attachments).map((line) => <div key={line} className="flex items-center gap-2"><Gift className="h-4 w-4 text-gold" />{line}</div>)}</div>
        {current.expires_at && <p className="mb-3 text-xs text-muted-foreground">{expired ? "Expired" : `Expires ${new Date(current.expires_at).toLocaleString()}`}</p>}
        <Button disabled={request.busy || !!state?.claimed_at || expired || Object.keys(object(current.attachments)).length === 0} onClick={() => void request.run(async () => {
          await reward("claim_mail", { _mail: current.id }); setClaimed(rewardLines(current.attachments)); await load();
        })}><Gift />{state?.claimed_at ? "Claimed" : "Claim attachments"}</Button>
        {claimed.length > 0 && <p role="status" className="mt-3 text-sm text-r1">Added to your character: {claimed.join(" · ")}</p>}
      </> : <p className="py-6 text-muted-foreground">{mail && mail.length > 0 ? "No message selected." : ""}</p>}</div>
    </div>
  </Panel>;
}

export function LuckyShots({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const request = useRequest();
  const [last, setLast] = useState<Astral | null>(null);
  const count = object(object(hero)['srv'])['luckyShots'];
  const shots = typeof count === "number" ? count : null;
  return <Panel title="Lucky Shots" onClose={onClose}>
    <div className="border-b border-border pb-5 text-center">
      <Sparkles className="mx-auto mb-3 h-12 w-12 text-gold" />
      <p className="font-display text-3xl">{shots === null ? "Shots unavailable" : `${shots} shots remaining`}</p>
      <div className="my-5 grid grid-cols-7 gap-2" aria-label="Seven Lucky Shots">{Array.from({ length: 7 }, (_, i) => <div key={i} className={`slot flex aspect-square items-center justify-center ${shots !== null && i < shots ? "text-gold" : "text-muted-foreground/40"}`}><Sparkles className="h-5 w-5" /></div>)}</div>
      <Button disabled={request.busy || shots === null || shots <= 0} onClick={() => void request.run(async () => { setLast(await takeLuckyShot()); })}><Sparkles />Take a shot</Button>
    </div>
    <RequestStatus {...request} />
    {last && <div role="status" className={`rarity-${last.rarity} slot my-5 p-4 text-center`}><p className="font-display text-2xl text-gold">{astralLabel(last)}</p><p className="mt-1 text-sm">{astralStatText(last)}</p><p className="mt-2 flex items-center justify-center gap-1 text-xs text-r1"><Check className="h-4 w-4" />Saved to your Astral collection</p></div>}
    <h3 className="mt-4 mb-2 font-display text-lg">Rarity odds</h3>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ASTRAL_ODDS.map((odds, i) => <div key={i} className={`slot rarity-${i} flex justify-between gap-2 p-2 text-sm`}><span>{ASTRAL_RARITY[i]}</span><b>{odds}%</b></div>)}</div>
  </Panel>;
}

const KIND_LABEL: Record<string, string> = { kill: "Enemies defeated", dungeon: "Dungeons cleared", boss: "Bosses defeated", craft: "Items crafted", gem: "Gem actions", astral: "Astral actions", arena: "Arena battles" };
export function ActivityBoard({ onClose }: { onClose: () => void }) {
  const { heroId } = useGame();
  const request = useRequest();
  const [board, setBoard] = useState<Activities | null>(null);
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [receipt, setReceipt] = useState<string[]>([]);
  const load = async () => { if (heroId) setBoard(await activities(heroId)); };
  useEffect(() => { void request.run(load); }, [heroId]);
  const claim = async (id: string) => { const result = await reward("claim_activity", { _objective: id }); setReceipt(rewardLines(result)); await load(); };
  const row = (o: Objective) => <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4">
    <div><h3 className="font-display text-lg">{KIND_LABEL[o.kind] ?? o.kind}{o.stage ? ` · Stage ${o.stage}` : ""}</h3><p className="text-sm text-muted-foreground">{Math.min(o.progress, o.target)} / {o.target}</p><progress className="mt-1 h-2 w-44 accent-primary" max={o.target} value={Math.min(o.progress, o.target)} /></div>
    <Button variant={o.claimed ? "ghost" : "default"} disabled={request.busy || o.claimed || o.progress < o.target} onClick={() => void request.run(() => claim(o.id))}>{o.claimed ? <Check /> : <Gift />}{o.claimed ? "Claimed" : "Claim"}</Button>
  </div>;
  return <Panel title="Daily & Weekly Activities" onClose={onClose}>
    <div className="flex justify-end"><Button variant="outline" size="icon" aria-label="Refresh activities" disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    <RequestStatus {...request} />
    {board && <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"><div><h3 className="font-display text-xl text-gold">Login reward</h3><p className="text-sm text-muted-foreground">Streak: {board.login.streak} days · Total: {board.login.total}</p></div><Button disabled={request.busy || board.login.claimedToday} onClick={() => void request.run(async () => { const r = await reward("claim_login", {}); setReceipt(rewardLines(r)); await load(); })}><Gift />{board.login.claimedToday ? "Claimed today" : "Claim login reward"}</Button></div>
      <div role="tablist" aria-label="Activity period" className="my-4 flex gap-2">{(["daily", "weekly"] as const).map((t) => <Button key={t} role="tab" aria-selected={t === tab} variant={t === tab ? "default" : "ghost"} onClick={() => setTab(t)}>{t === "daily" ? "Daily" : "Weekly"}</Button>)}</div>
      <p className="text-xs text-muted-foreground">Resets {new Date(tab === "daily" ? board.dailyReset : board.weeklyReset).toLocaleString()}</p>
      {board[tab].map(row)}
      {tab === "daily" && <div className="flex flex-wrap items-center justify-between gap-3 py-4"><span className="font-display text-lg">Complete all daily objectives</span><Button disabled={request.busy || board.dailyBonusClaimed || !board.daily.length || !board.daily.every((o) => o.claimed)} onClick={() => void request.run(() => claim("all"))}><Gift />{board.dailyBonusClaimed ? "Claimed" : "Claim bonus"}</Button></div>}
    </>}
    {receipt.length > 0 && <p role="status" className="mt-4 break-words text-sm text-r1">Received: {receipt.join(" · ")}</p>}
  </Panel>;
}
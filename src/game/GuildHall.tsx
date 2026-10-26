import { useEffect, useState } from "react";
import { Check, RefreshCw, Send, Shield, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { adoptServerSave, useGame, withServerHero } from "./store";
import { returnedSave } from "./services-contract";
import { Panel } from "./ui";
import { RequestStatus, useRequest } from "./Rewards";
import { GuildEvents } from './GuildEvents';

export function GuildHall({ onClose }: { onClose: () => void }) {
  const { heroId, hero } = useGame();
  const request = useRequest();
  const [guild, setGuild] = useState<Tables<"guilds"> | null>(null);
  const [members, setMembers] = useState<Tables<"guild_members">[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [invites, setInvites] = useState<Tables<"guild_invites">[]>([]);
  const [inviteNames, setInviteNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Tables<"chat_messages">[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [body, setBody] = useState("");
  const [allGuilds, setAllGuilds] = useState<Tables<"guilds">[]>([]);
  const [myApps, setMyApps] = useState<Tables<"guild_applications">[]>([]);
  const [applications, setApplications] = useState<Tables<"guild_applications">[]>([]);
  const [applyMsg, setApplyMsg] = useState<Record<string, string>>({});
  const load = async () => {
    if (!heroId) return;
    const [membership, invitation] = await Promise.all([
      supabase.from("guild_members").select("*").eq("hero_id", heroId).maybeSingle(),
      supabase.from("guild_invites").select("*").eq("hero_id", heroId),
    ]);
    if (membership.error || invitation.error) throw new Error(membership.error?.message ?? invitation.error?.message);
    setInvites(invitation.data ?? []);
    const ids = (invitation.data ?? []).map((i) => i.guild_id);
    if (ids.length) {
      const { data, error } = await supabase.from("guilds").select("id,name").in("id", ids);
      if (error) throw new Error(error.message);
      setInviteNames(Object.fromEntries((data ?? []).map((g) => [g.id, g.name])));
    }
    // Own pending applications (for withdrawing)
    const { data: apps } = await supabase.from("guild_applications").select("*").eq("hero_id", heroId).eq("status", "pending");
    setMyApps(apps ?? []);
    if (!membership.data) {
      setGuild(null); setMembers([]); setMessages([]); setApplications([]);
      // Browse available guilds
      const { data: guilds } = await supabase.from("guilds").select("*").order("name");
      setAllGuilds(guilds ?? []);
      setLoaded(true); return;
    }
    const id = membership.data.guild_id;
    const [g, roster, chat] = await Promise.all([
      supabase.from("guilds").select("*").eq("id", id).single(),
      supabase.from("guild_members").select("*").eq("guild_id", id),
      supabase.from("chat_messages").select("*").eq("channel", "guild").eq("guild_id", id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (g.error || roster.error || chat.error) throw new Error(g.error?.message ?? roster.error?.message ?? chat.error?.message);
    const heroIds = (roster.data ?? []).map((m) => m.hero_id);
    if (heroIds.length) {
      const { data, error } = await supabase.from("heroes").select("id,name").in("id", heroIds);
      if (error) throw new Error(error.message);
      setNames(Object.fromEntries((data ?? []).map((h) => [h.id, h.name])));
    }
    setGuild(g.data); setMembers(roster.data ?? []); setMessages((chat.data ?? []).reverse());
    // Load pending applications if leader/officer
    const myRole = (roster.data ?? []).find((m) => m.hero_id === heroId)?.role;
    if (myRole === "leader" || myRole === "officer") {
      const { data: pending } = await supabase.from("guild_applications").select("*").eq("guild_id", id).eq("status", "pending").order("created_at", { ascending: false });
      setApplications(pending ?? []);
    } else {
      setApplications([]);
    }
    setLoaded(true);
  };
  useEffect(() => { void request.run(load); }, [heroId]);
  useEffect(() => {
    if (!guild) return;
    const channel = supabase.channel(`guild-hall:${guild.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `guild_id=eq.${guild.id}` }, () => { void request.run(load); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [guild?.id]);
  const mutate = async (fn: (id: string) => PromiseLike<{ error: { message: string } | null }>) => withServerHero(async (id) => {
    const result = await fn(id);
    if (result.error) throw new Error(result.error.message);
    const { data, error } = await supabase.from("heroes").select("save").eq("id", id).single();
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data.save));
    await load();
  });
  const role = members.find((m) => m.hero_id === heroId)?.role;
  return <Panel title="Guild Hall" onClose={onClose} wide>
    <div className="flex justify-end"><Button variant="outline" size="icon" aria-label="Refresh guild" disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    <RequestStatus {...request} />
    {loaded && !guild && <>
      <h3 className="mb-4 font-display text-2xl text-gold">Guild invitations</h3>
      {invites.length === 0 && <p className="mb-6 text-sm text-muted-foreground">No pending invitations.</p>}
      {invites.map((i) => <div key={i.id} className="mb-3 flex items-center justify-between gap-2 border-b border-border py-3"><span>{inviteNames[i.guild_id] ?? "Guild invitation"}</span><span className="flex gap-2">{[true, false].map((accept) => <Button key={String(accept)} variant="outline" size="icon" aria-label={accept ? "Accept invitation" : "Decline invitation"} disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("respond_invite", { _hero: id, _invite: i.id, _accept: accept })))}>{accept ? <Check /> : <X />}</Button>)}</span></div>)}
      {/* My pending applications */}
      {myApps.length > 0 && <div className="mb-6">
        <h4 className="mb-2 font-display text-lg">Your applications</h4>
        {myApps.map((a) => <div key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm"><div><span className="text-gold">{allGuilds.find((g) => g.id === a.guild_id)?.name ?? "Guild"}</span>{a.message && <span className="ml-2 text-muted-foreground">"{a.message}"</span>}</div><Button variant="ghost" size="sm" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("withdraw_application", { _hero: id, _application: a.id })))}>Withdraw</Button></div>)}
      </div>}
      {/* Browse and apply to guilds */}
      <div className="mb-6 border-t border-border pt-5">
        <h4 className="mb-3 font-display text-2xl">Available guilds</h4>
        {allGuilds.length === 0 && <p className="text-sm text-muted-foreground">No guilds have been founded yet.</p>}
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {allGuilds.map((g) => <div key={g.id} className="slot p-3">
            <div className="flex items-center justify-between gap-2">
              <div><span className="font-display text-lg text-gold">{g.name}</span><span className="ml-2 text-xs text-muted-foreground">Lv {g.level}</span></div>
              {myApps.some((a) => a.guild_id === g.id)
                ? <span className="text-xs text-muted-foreground">Applied</span>
                : <div className="flex items-center gap-1">
                    <input className="slot w-40 px-2 py-1 text-sm" placeholder="Message (optional)" maxLength={200} value={applyMsg[g.id] ?? ""} onChange={(e) => setApplyMsg((m) => ({ ...m, [g.id]: e.target.value }))} />
                    <Button variant="outline" size="sm" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("apply_guild", { _hero: id, _guild: g.id, _message: applyMsg[g.id] ?? "" })))}><UserPlus className="h-4 w-4" />Apply</Button>
                  </div>}
            </div>
            {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
          </div>)}
        </div>
      </div>
      <form className="max-w-md space-y-3 border-t border-border pt-5" onSubmit={(e) => { e.preventDefault(); void request.run(() => mutate((id) => supabase.rpc("create_guild", { _hero: id, _name: name.trim(), _description: description, _emblem: "shield" }))); }}>
        <h3 className="font-display text-2xl">Found a guild</h3>
        <label className="block text-sm">Guild name<input className="slot mt-1 w-full px-3 py-2" required minLength={3} maxLength={20} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="block text-sm">Description<textarea className="slot mt-1 w-full px-3 py-2" maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <Button disabled={request.busy || !hero || hero.gold < 10000}><Shield />Create guild · 10,000 gold</Button>
      </form>
    </>}
    {guild && <>
      <h3 className="font-display text-3xl text-gold">{guild.name}</h3><p className="text-xs text-muted-foreground">Level {guild.level} · {members.length} members · {role}</p><p className="mt-3 break-words text-sm">{guild.description}</p>
      {guild.announcement && <p className="my-4 border-l-2 border-primary pl-3 text-sm">{guild.announcement}</p>}
      {/* Applications moderation for leaders/officers */}
      {(role === "leader" || role === "officer") && applications.length > 0 && <div className="mb-4 border-y border-border py-4">
        <h4 className="mb-3 font-display text-xl text-gold">Applications ({applications.length})</h4>
        {applications.map((a) => <div key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-3">
          <div><span className="font-display text-base">{a.hero_name}</span>{a.message && <p className="text-sm text-muted-foreground">"{a.message}"</p>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Accept application" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("moderate_application", { _hero: id, _application: a.id, _accept: true })))}><Check /></Button>
            <Button variant="outline" size="icon" aria-label="Reject application" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("moderate_application", { _hero: id, _application: a.id, _accept: false })))}><X /></Button>
          </div>
        </div>)}
      </div>}
      <GuildEvents />
      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div><h4 className="font-display text-xl">Members</h4>{members.map((m) => <div key={m.hero_id} className="flex justify-between gap-2 border-b border-border py-3 text-sm"><span>{names[m.hero_id] ?? "Member"}</span><span className="text-muted-foreground">{m.role}</span></div>)}
          {(role === "leader" || role === "officer") && <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void request.run(async () => { await mutate((id) => supabase.rpc("guild_invite", { _hero: id, _target_name: target.trim() })); setTarget(""); }); }}><input aria-label="Hero name to invite" className="slot min-w-0 flex-1 px-2" required value={target} onChange={(e) => setTarget(e.target.value)} /><Button size="icon" aria-label="Invite hero" disabled={request.busy}><UserPlus /></Button></form>}
          <Button variant="outline" className="mt-4" disabled={request.busy} onClick={() => { if (window.confirm("Leave your guild?")) void request.run(() => mutate((id) => supabase.rpc("leave_guild", { _hero: id }))); }}>Leave guild</Button>
        </div>
        <div><h4 className="mb-2 font-display text-xl">Guild chat</h4><div className="h-72 overflow-y-auto border-y border-border py-2">{messages.length === 0 && <p className="text-sm text-muted-foreground">No guild messages yet.</p>}{messages.map((m) => <p key={m.id} className="mb-2 break-words text-sm"><b className="text-gold">{m.sender_name}</b><span className="ml-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span className="block">{m.body}</span></p>)}</div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void request.run(async () => { if (!heroId) return; const { error } = await supabase.rpc("send_chat", { _hero: heroId, _channel: "guild", _body: body, _to: "00000000-0000-0000-0000-000000000000" }); if (error) throw new Error(error.message); setBody(""); await load(); }); }}><input className="slot min-w-0 flex-1 px-3" aria-label="Guild message" maxLength={200} required value={body} onChange={(e) => setBody(e.target.value)} /><Button size="icon" aria-label="Send guild message" disabled={request.busy || !body.trim()}><Send /></Button></form>
        </div>
      </div>
    </>}
  </Panel>;
}

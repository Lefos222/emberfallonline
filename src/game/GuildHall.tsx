import { useEffect, useState } from "react";
import { Check, Crown, RefreshCw, Send, Shield, ShieldOff, UserPlus, UserMinus, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { adoptServerSave, useGame, withServerHero } from "./store";
import { returnedSave } from "./services-contract";
import { Panel } from "./ui";
import { RequestStatus, useRequest } from "./Rewards";
import { GuildContribute, GuildShopPanel, GuildVaultPanel } from './GuildShop';
import { GuildSkillTower, GuildReliquary } from './GuildTower';
import { GuildRecords, type MemberHero } from './GuildRecords';
import { GuildHallScene, type GuildLocation } from './GuildHallScene';
import { GUILD_RELICS, guildTotalRanks, relicUnlocked } from './guild-tower';

export function GuildHall({ onClose }: { onClose: () => void }) {
  const { heroId, hero } = useGame();
  const request = useRequest();
  const [guild, setGuild] = useState<Tables<"guilds"> | null>(null);
  const [members, setMembers] = useState<Tables<"guild_members">[]>([]);
  const [memberHeroes, setMemberHeroes] = useState<Record<string, MemberHero>>({});
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
  // The charter: leaders and officers can rewrite the guild's description and announcement.
  const [charter, setCharter] = useState({ description: "", announcement: "" });
  const [editingCharter, setEditingCharter] = useState(false);
  // The courtyard is the way in: members land on their guild's banner and walk to a room.
  const [location, setLocation] = useState<GuildLocation>("headquarters");
  const load = async () => {
    if (!heroId) { setLoaded(true); return; }
    // If the Supabase guild tables are unreachable, still show the panel with a "no guild" view
    // so the hall is never a blank screen — the user can still try to create or browse guilds.
    const fail = (e: unknown) => {
      setGuild(null); setMembers([]); setMessages([]); setApplications([]); setMemberHeroes({});
      setAllGuilds([]); setInvites([]); setMyApps([]);
      setLoaded(true);
      throw e;
    };
    let membership, invitation;
    try {
      [membership, invitation] = await Promise.all([
        supabase.from("guild_members").select("*").eq("hero_id", heroId).maybeSingle(),
        supabase.from("guild_invites").select("*").eq("hero_id", heroId),
      ]);
      if (membership.error || invitation.error) throw new Error(membership.error?.message ?? invitation.error?.message);
    } catch (e) { return fail(e); }
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
      setGuild(null); setMembers([]); setMessages([]); setApplications([]); setMemberHeroes({});
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
      const { data, error } = await supabase.from("heroes").select("id,name,level,power").in("id", heroIds);
      if (error) throw new Error(error.message);
      setMemberHeroes(Object.fromEntries((data ?? []).map((h) => [h.id, { name: h.name, level: h.level, power: h.power }])));
    } else {
      setMemberHeroes({});
    }
    setGuild(g.data); setMembers(roster.data ?? []); setMessages((chat.data ?? []).reverse());
    setCharter({ description: g.data.description ?? "", announcement: g.data.announcement ?? "" });
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
  const canManage = role === "leader" || role === "officer";
  const isLeader = role === "leader";
  const memberPower = Object.values(memberHeroes).reduce((sum, h) => sum + (h.power ?? 0), 0);
  const wokenRelics = hero ? GUILD_RELICS.filter((r) => relicUnlocked(hero, r)).length : 0;
  const saveCharter = () => { void request.run(async () => {
    await mutate((id) => supabase.rpc("guild_update", {
      _hero: id, _description: charter.description, _emblem: guild?.emblem ?? "shield", _announcement: charter.announcement,
    }));
    setEditingCharter(false);
  }); };
  const memberRow = (m: Tables<"guild_members">) => {
    const info = memberHeroes[m.hero_id];
    const self = m.hero_id === heroId;
    return <div key={m.hero_id} className="flex items-center justify-between gap-2 border-b border-border py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate"><span className="font-display">{info?.name ?? "Member"}</span>{self && <span className="ml-1 text-[10px] uppercase text-muted-foreground">you</span>}</p>
        <p className="text-xs text-muted-foreground">Lv {info?.level ?? "—"} · {info ? info.power.toLocaleString() : "—"} power · joined {new Date(m.joined_at).toLocaleDateString()}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">{m.role}</span>
        {isLeader && !self && <>
          <Button variant="outline" size="icon" aria-label={`${m.role === "officer" ? "Demote" : "Promote"} ${info?.name ?? "member"}`} disabled={request.busy}
            onClick={() => void request.run(() => mutate((id) => supabase.rpc("guild_set_role", { _hero: id, _target: m.hero_id, _role: m.role === "officer" ? "member" : "officer" })))}>
            {m.role === "officer" ? <ShieldOff /> : <Shield />}
          </Button>
          <Button variant="outline" size="icon" aria-label={`Make ${info?.name ?? "member"} leader`} disabled={request.busy}
            onClick={() => { if (window.confirm("Hand the guild to this member?")) void request.run(() => mutate((id) => supabase.rpc("guild_transfer", { _hero: id, _target: m.hero_id }))); }}>
            <Crown />
          </Button>
        </>}
        {canManage && !self && (isLeader || m.role === "member") &&
          <Button variant="outline" size="icon" aria-label={`Remove ${info?.name ?? "member"}`} disabled={request.busy}
            onClick={() => { if (window.confirm("Remove this member from the guild?")) void request.run(() => mutate((id) => supabase.rpc("guild_kick", { _hero: id, _target: m.hero_id }))); }}>
            <UserMinus />
          </Button>}
      </div>
    </div>;
  };
  return <Panel title="Guild Hall" subtitle="Your guild, tower and treasury" art="guild" onClose={onClose} wide>
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
      <GuildHallScene name={guild.name} level={guild.level} members={members.length} power={memberPower}
        relics={{ woken: wokenRelics, total: GUILD_RELICS.length }}
        role={role} location={location} onSelect={setLocation} />

      {location === "merchant" && <div className="mt-5">
        <GuildContribute />
        <GuildShopPanel />
        <GuildVaultPanel />
      </div>}

      {location === "tower" && <div className="mt-5">
        <GuildSkillTower />
      </div>}

      {location === "reliquary" && <div className="mt-5">
        <GuildReliquary />
      </div>}

      {location === "headquarters" && <>
        {/* The guild charter: the words every member reads on the way in. */}
        <div className="mt-4 slot p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-display text-xl text-gold">Guild charter</h4>
            {canManage && !editingCharter && <Button variant="outline" size="sm" onClick={() => setEditingCharter(true)}><PenLine className="h-4 w-4" />Edit</Button>}
          </div>
          {editingCharter ? <div className="mt-2 space-y-2">
            <label className="block text-sm">Description<textarea className="slot mt-1 w-full px-3 py-2" maxLength={200} value={charter.description} onChange={(e) => setCharter((c) => ({ ...c, description: e.target.value }))} /></label>
            <label className="block text-sm">Announcement<textarea className="slot mt-1 w-full px-3 py-2" maxLength={300} value={charter.announcement} onChange={(e) => setCharter((c) => ({ ...c, announcement: e.target.value }))} /></label>
            <div className="flex gap-2">
              <Button size="sm" disabled={request.busy} onClick={saveCharter}>Save charter</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingCharter(false); setCharter({ description: guild.description ?? "", announcement: guild.announcement ?? "" }); }}>Cancel</Button>
            </div>
          </div> : <>
            <p className="mt-1 break-words text-sm">{guild.description || "No description yet."}</p>
            {guild.announcement && <p className="mt-2 border-l-2 border-primary pl-3 text-sm">{guild.announcement}</p>}
          </>}
          <p className="mt-2 text-xs text-muted-foreground">Guild level {guild.level} · {guildTotalRanks(hero ?? {})} tower ranks among your own deeds · founded {new Date(guild.created_at).toLocaleDateString()}</p>
        </div>

        {/* Applications moderation for leaders/officers */}
        {canManage && applications.length > 0 && <div className="mt-5 border-y border-border py-4">
          <h4 className="mb-3 font-display text-xl text-gold">Applications ({applications.length})</h4>
          {applications.map((a) => <div key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-3">
            <div><span className="font-display text-base">{a.hero_name}</span>{a.message && <p className="text-sm text-muted-foreground">"{a.message}"</p>}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Accept application" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("moderate_application", { _hero: id, _application: a.id, _accept: true })))}><Check /></Button>
              <Button variant="outline" size="icon" aria-label="Reject application" disabled={request.busy} onClick={() => void request.run(() => mutate((id) => supabase.rpc("moderate_application", { _hero: id, _application: a.id, _accept: false })))}><X /></Button>
            </div>
          </div>)}
        </div>}
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h4 className="font-display text-xl">Members <span className="text-sm text-muted-foreground">{members.length}/30</span></h4>
            {members.map(memberRow)}
            {canManage && <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void request.run(async () => { await mutate((id) => supabase.rpc("guild_invite", { _hero: id, _target_name: target.trim() })); setTarget(""); }); }}><input aria-label="Hero name to invite" className="slot min-w-0 flex-1 px-2" required value={target} onChange={(e) => setTarget(e.target.value)} /><Button size="icon" aria-label="Invite hero" disabled={request.busy}><UserPlus /></Button></form>}
            <Button variant="outline" className="mt-4" disabled={request.busy} onClick={() => { if (window.confirm("Leave your guild?")) void request.run(() => mutate((id) => supabase.rpc("leave_guild", { _hero: id }))); }}>Leave guild</Button>
          </div>
          <div><h4 className="mb-2 font-display text-xl">Guild chat</h4><div className="h-72 overflow-y-auto border-y border-border py-2">{messages.length === 0 && <p className="text-sm text-muted-foreground">No guild messages yet.</p>}{messages.map((m) => <p key={m.id} className="mb-2 break-words text-sm"><b className="text-gold">{m.sender_name}</b><span className="ml-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span className="block">{m.body}</span></p>)}</div>
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void request.run(async () => { if (!heroId) return; const { error } = await supabase.rpc("send_chat", { _hero: heroId, _channel: "guild", _body: body, _to: "00000000-0000-0000-0000-000000000000" }); if (error) throw new Error(error.message); setBody(""); await load(); }); }}><input className="slot min-w-0 flex-1 px-3" aria-label="Guild message" maxLength={200} required value={body} onChange={(e) => setBody(e.target.value)} /><Button size="icon" aria-label="Send guild message" disabled={request.busy || !body.trim()}><Send /></Button></form>
          </div>
        </div>

        {/* The keep also keeps the hall's ledger and deeds. */}
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="mb-2 font-display text-xl text-gold">Hall of Records</h4>
          <GuildRecords guild={guild} members={members} memberHeroes={memberHeroes} heroId={heroId} />
        </div>
      </>}
    </>}
  </Panel>;
}

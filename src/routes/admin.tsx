import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Moderation — EmberFall Online" },
      { name: "description", content: "Private moderation overview for EmberFall Online." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Moderation — EmberFall Online" },
      { property: "og:description", content: "Private moderation overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Ban = { id: string; hero: string; reason: string; source: string; at: string; restored: string | null; email: string | null };
type Mute = { hero: string; reports: number; last: string; until: string };
type Report = { hero: string; body: string; reason: string; at: string };
type Data = { bans: Ban[]; mutes: Mute[]; reports: Report[] };
type Character = {
  id: string; name: string; cls: string; gender: string; level: number; created: string; last_played: string;
  user_id: string; email: string | null; ip: string | null; last_ip: string | null;
  banned: boolean; ban_reason: string | null; is_admin: boolean;
};
type AccountBan = { id: string; user_id: string; email: string | null; reason: string; at: string; lifted: string | null; heroes: string };
type Account = { user_id: string; email: string | null; created: string; last_sign_in: string | null; signup_ip: string | null; last_ip: string | null; heroes: string; banned: boolean; ban_reason: string | null; is_admin: boolean };
type Players = { characters: Character[]; bans: AccountBan[] };

// The admin RPCs from 0050_admin_player_bans.sql are not in the generated types until they regenerate.
const rpc = supabase.rpc.bind(supabase) as unknown as (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;

const when = (s: string) => new Date(s).toLocaleString();

/** Admin-only: every RPC refuses anyone without the admin role, so this page shows nothing to others. */
function AdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [players, setPlayers] = useState<Players | null>(null);
  const [err, setErr] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [banning, setBanning] = useState<{ user_id: string; name: string; email: string | null } | null>(null);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const [mod, pl, ac] = await Promise.all([supabase.rpc("admin_moderation"), rpc("admin_players", { _limit: 300 }), rpc("admin_accounts", { _limit: 1000 })]);
    if (mod.error) {
      setErr(mod.error.message === "Forbidden" ? "This page is only for the game admin." : "Sign in with the admin account to view this page.");
      return;
    }
    setData(mod.data as unknown as Data);
    if (pl.error) setActionErr(`Could not load characters: ${pl.error.message}`);
    else setPlayers(pl.data as Players);
    if (ac.error) setActionErr(`Could not load accounts: ${ac.error.message}`);
    else setAccounts(ac.data as Account[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const act = async (key: string, fn: string, args: Record<string, unknown>) => {
    setBusy(key); setActionErr("");
    const { error } = await rpc(fn, args);
    setBusy(null);
    if (error) { setActionErr(error.message); return false; }
    await load();
    return true;
  };

  const q = filter.trim().toLowerCase();
  const chars = (players?.characters ?? []).filter((c) =>
    !q || [c.name, c.email, c.ip, c.last_ip].some((v) => v?.toLowerCase().includes(q)));

  const accs = (accounts ?? []).filter((a) =>
    !q || [a.email, a.heroes, a.signup_ip, a.last_ip].some((v) => v?.toLowerCase().includes(q)));

  return (
    <div className="h-dvh overflow-y-auto bg-background">
    <main className="mx-auto min-h-screen max-w-6xl bg-background p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-gold">Moderation</h1>
        <Link to="/" className="btn-ghost px-3 py-1 text-sm">Back to the game</Link>
      </div>
      {err && <p role="alert" className="game-panel rounded p-4">{err}</p>}
      {actionErr && <p role="alert" className="game-panel mb-4 rounded p-3 text-sm text-blood">{actionErr}</p>}
      {!data && !err && <p>Loading…</p>}
      {data && (
        <div className="space-y-8">
          <section className="game-panel rounded p-4">
            <h2 className="mb-3 font-display text-xl text-gold">All accounts ({accounts?.length ?? 0})</h2>
            {!accounts ? <p className="text-sm text-muted-foreground">Loading…</p> : accs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts found.</p>
            ) : (
              <div className="max-h-[32rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr className="border-b border-border/60">
                      <th className="py-1">Email</th><th>Signed up</th><th>Last sign-in</th><th>IP</th><th>Characters</th><th>Status</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {accs.map((a) => (
                      <tr key={a.user_id} className="border-b border-border/40 align-top">
                        <td className="break-all py-1">{a.email ?? "—"}</td>
                        <td>{when(a.created)}</td>
                        <td>{a.last_sign_in ? when(a.last_sign_in) : "—"}</td>
                        <td className="font-mono text-xs">
                          {a.signup_ip ?? "—"}
                          {a.last_ip && a.last_ip !== a.signup_ip && <span className="block text-muted-foreground">last: {a.last_ip}</span>}
                        </td>
                        <td>{a.heroes || "—"}</td>
                        <td>{a.banned ? <span className="text-blood" title={a.ban_reason ?? ""}>Banned</span> : a.is_admin ? "Admin" : "Active"}</td>
                        <td className="text-right">
                          {a.is_admin ? null : a.banned ? (
                            <button className="btn-ghost px-2 py-0.5 text-xs" disabled={busy !== null}
                              onClick={() => void act(a.user_id, "admin_unban_user", { _user_id: a.user_id })}>
                              {busy === a.user_id ? "…" : "Unban"}
                            </button>
                          ) : (
                            <button className="btn-blood px-2 py-0.5 text-xs" disabled={busy !== null}
                              onClick={() => { setBanning({ user_id: a.user_id, name: a.heroes || a.email || "account", email: a.email }); setReason(""); }}>
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="game-panel rounded p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl text-gold">New characters ({players?.characters.length ?? 0})</h2>
              <input
                className="slot w-64 px-2 py-1 text-sm"
                placeholder="Search name, email or IP"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {!players ? <p className="text-sm text-muted-foreground">Loading…</p> : chars.length === 0 ? (
              <p className="text-sm text-muted-foreground">No characters found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr className="border-b border-border/60">
                      <th className="py-1">Character</th><th>Created</th><th>Email</th><th>IP</th><th>Status</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {chars.map((c) => (
                      <tr key={c.id} className="border-b border-border/40 align-top">
                        <td className="py-1">
                          <span className="font-bold">{c.name}</span>
                          <span className="block text-xs capitalize text-muted-foreground">Lv {c.level} {c.gender} {c.cls}</span>
                        </td>
                        <td>{when(c.created)}</td>
                        <td className="break-all">{c.email ?? "—"}</td>
                        <td className="font-mono text-xs">
                          {c.ip ?? (c.last_ip ? <span title="Not recorded at creation; last sign-in IP">{c.last_ip} <span className="text-muted-foreground">(last login)</span></span> : "—")}
                        </td>
                        <td>{c.banned ? <span className="text-blood" title={c.ban_reason ?? ""}>Banned</span> : c.is_admin ? "Admin" : "Active"}</td>
                        <td className="text-right">
                          {c.is_admin ? null : c.banned ? (
                            <button className="btn-ghost px-2 py-0.5 text-xs" disabled={busy !== null}
                              onClick={() => void act(c.user_id, "admin_unban_user", { _user_id: c.user_id })}>
                              {busy === c.user_id ? "…" : "Unban"}
                            </button>
                          ) : (
                            <button className="btn-blood px-2 py-0.5 text-xs" disabled={busy !== null}
                              onClick={() => { setBanning(c); setReason(""); }}>
                              Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <Section title={`Banned accounts (${players?.bans.filter((b) => !b.lifted).length ?? 0} active)`} empty="No account has been banned by hand.">
            {(players?.bans ?? []).map((b) => (
              <tr key={b.id} className="border-b border-border/40">
                <td className="py-1 font-bold">{b.heroes || "—"}</td><td className="break-all">{b.email ?? "—"}</td><td>{b.reason || "—"}</td>
                <td>{when(b.at)}</td>
                <td>{b.lifted ? `Unbanned ${when(b.lifted)}` : <span className="text-blood">Banned</span>}</td>
                <td className="text-right">
                  {!b.lifted && (
                    <button className="btn-ghost px-2 py-0.5 text-xs" disabled={busy !== null}
                      onClick={() => void act(b.user_id, "admin_unban_user", { _user_id: b.user_id })}>
                      {busy === b.user_id ? "…" : "Unban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Section>

          <Section title={`Removed by anticheat (${data.bans.length})`} empty="No one has been removed by the anticheat.">
            {data.bans.map((b) => (
              <tr key={b.id} className="border-b border-border/40">
                <td className="py-1 font-bold">{b.hero}</td><td>{b.email ?? "—"}</td><td>{b.reason}</td>
                <td>{when(b.at)}</td><td>{b.restored ? `Restored ${when(b.restored)}` : <span className="text-blood">Banned</span>}</td>
                <td className="text-right">
                  {!b.restored && (
                    <button className="btn-ghost px-2 py-0.5 text-xs" disabled={busy !== null}
                      onClick={() => void act(b.id, "admin_restore_quarantine", { _id: b.id })}>
                      {busy === b.id ? "…" : "Unban & restore"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Section>
          <Section title={`Chat muted right now (${data.mutes.length})`} empty="No one is muted.">
            {data.mutes.map((m) => (
              <tr key={m.hero + m.last} className="border-b border-border/40">
                <td className="py-1 font-bold">{m.hero}</td><td>{m.reports} reports</td><td>Last {when(m.last)}</td><td>Until {when(m.until)}</td>
              </tr>
            ))}
          </Section>
          <Section title="Latest chat reports" empty="No reports.">
            {data.reports.map((r, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="py-1 font-bold">{r.hero}</td><td className="max-w-xs truncate">{r.body}</td><td>{r.reason}</td><td>{when(r.at)}</td>
              </tr>
            ))}
          </Section>
        </div>
      )}

      {banning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" role="dialog" aria-labelledby="ban-title">
          <form
            className="game-panel anim-pop w-full max-w-sm p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act(banning.user_id, "admin_ban_user", { _user_id: banning.user_id, _reason: reason })) setBanning(null);
            }}
          >
            <h2 id="ban-title" className="mb-1 font-display text-2xl">Ban {banning.name}?</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Bans the whole account ({banning.email ?? "no email"}), including all its characters. You can unban later.
            </p>
            <input className="slot mb-4 w-full px-2 py-1 text-sm" placeholder="Reason (shown to the player)" maxLength={300}
              value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <button type="button" className="slot flex-1 py-2" onClick={() => setBanning(null)}>Cancel</button>
              <button type="submit" className="btn-blood flex-1 py-2" disabled={busy !== null}>{busy ? "…" : "Ban account"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="game-panel rounded p-4">
      <h2 className="mb-2 font-display text-xl text-gold">{title}</h2>
      {children.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{children}</tbody></table></div> : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

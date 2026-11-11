import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
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

const when = (s: string) => new Date(s).toLocaleString();

/** Admin-only: the server function refuses anyone without the admin role, so this page shows nothing to others. */
function AdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    void supabase.rpc("admin_moderation").then(({ data, error }) => {
      if (error) setErr(error.message === "Forbidden" ? "This page is only for the game admin." : "Sign in with the admin account to view this page.");
      else setData(data as unknown as Data);
    });
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-background p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-gold">Moderation</h1>
        <Link to="/" className="btn-ghost px-3 py-1 text-sm">Back to the game</Link>
      </div>
      {err && <p role="alert" className="game-panel rounded p-4">{err}</p>}
      {!data && !err && <p>Loading…</p>}
      {data && (
        <div className="space-y-8">
          <Section title={`Banned characters (${data.bans.length})`} empty="No one has been banned.">
            {data.bans.map((b) => (
              <tr key={b.id} className="border-b border-border/40">
                <td className="py-1 font-bold">{b.hero}</td><td>{b.email ?? "—"}</td><td>{b.reason}</td>
                <td>{when(b.at)}</td><td>{b.restored ? `Restored ${when(b.restored)}` : <span className="text-blood">Banned</span>}</td>
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
    </main>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="game-panel rounded p-4">
      <h2 className="mb-2 font-display text-xl text-gold">{title}</h2>
      {children.length ? <table className="w-full text-left text-sm"><tbody>{children}</tbody></table> : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

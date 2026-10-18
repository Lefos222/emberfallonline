import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import castle from "@/assets/castle.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — EmberFall Online" },
      { name: "description", content: "Choose a new password for your EmberFall Online account." },
      { property: "og:title", content: "Reset password — EmberFall Online" },
      { property: "og:description", content: "Choose a new password for your EmberFall Online account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${castle.url})` }} />
      <div className="absolute inset-0 bg-background/60 vignette" />
      <form className="game-panel anim-pop relative w-full max-w-sm space-y-3 p-6" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        const { error } = await supabase.auth.updateUser({ password: pw });
        setBusy(false);
        if (error) setMsg(error.message); else void nav({ to: "/" });
      }}>
        <h1 className="panel-title text-center text-2xl font-bold">New password</h1>
        <input className="slot w-full px-3 py-2 outline-none" type="password" minLength={6} required placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className="btn-gold w-full py-2.5" disabled={busy}>Save password</button>
        {msg && <p className="text-center text-sm text-hp">{msg}</p>}
      </form>
    </div>
  );
}

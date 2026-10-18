import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import castle from "@/assets/castle.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { setUser } from "@/game/store";

export const Route = createFileRoute("/auth-callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — EmberFall Online" },
      { name: "description", content: "Finishing your sign-in so you can return to the castle." },
      { property: "og:title", content: "Signing you in — EmberFall Online" },
      { property: "og:description", content: "Finishing your sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallbackPage,
});

/** Landing page for social sign-in. It waits for the session instead of bouncing to /auth. */
function AuthCallbackPage() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    let done = false;
    const enter = async (user: { id: string; email?: string | null } | null | undefined) => {
      if (done || !user) return;
      done = true;
      await setUser(user.id, user.email ?? null, "event");
      void nav({ to: "/" });
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => { void enter(session?.user); });

    let tries = 0;
    const poll = setInterval(() => {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) void enter(data.session.user);
        else if (++tries >= 32) {
          clearInterval(poll);
          setMsg("Sign-in didn't finish. Please try again.");
        }
      });
    }, 250);

    return () => { data.subscription.unsubscribe(); clearInterval(poll); };
  }, [nav]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${castle.url})` }} />
      <div className="absolute inset-0 bg-background/60 vignette" />
      <div className="game-panel anim-pop relative w-full max-w-sm p-6 text-center">
        <h1 className="panel-title mb-3 text-2xl font-bold">EmberFall Online</h1>
        {msg === "Signing you in…" ? (
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-gold" />
        ) : (
          <button className="btn-gold w-full py-2.5" onClick={() => void nav({ to: "/auth" })}>Back to sign in</button>
        )}
        <p className="text-sm text-muted-foreground">{msg}</p>
      </div>
    </div>
  );
}

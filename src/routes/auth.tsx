import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";
import castle from "@/assets/castle.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { setUser } from "@/game/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — EmberFall Online" },
      { name: "description", content: "Sign in to save your hero to the cloud and fight real players in the Blood Arena." },
      { property: "og:title", content: "Sign in — EmberFall Online" },
      { property: "og:description", content: "Save your hero to the cloud and enter the arena." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const [socialBusy, setSocialBusy] = useState<null | "google" | "lovable">(null);

  const enterGame = async (user: { id: string; email?: string | null } | null | undefined) => {
    if (!user) return;
    await setUser(user.id, user.email ?? null);
    nav({ to: "/" });
  };

  const friendly = (m: string) => {
    if (/unauthori[sz]ed|not enabled|provider/i.test(m)) return "This sign-in option isn't switched on for the game yet. Please use email and password for now.";
    if (/popup/i.test(m)) return "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.";
    if (/email not confirmed/i.test(m)) return "Please confirm your email first — check your inbox.";
    if (/invalid login/i.test(m)) return "Wrong email or password.";
    return m;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMsg(error ? error.message : "If that email has an account, a reset link is on its way.");
    } else if (mode === "in") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(friendly(error.message)); else await enterGame(data.user);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setMsg(friendly(error.message));
      else if (data.session) await enterGame(data.user);
      else setMsg("Check your email to confirm your account.");
    }
    setBusy(false);
  };

  const social = async (p: "google" | "lovable") => {
    if (socialBusy) return;
    setSocialBusy(p); setMsg(null);
    try {
      const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
      if (r.error) { setMsg(friendly(String((r.error as Error).message ?? r.error))); return; }
      if (r.redirected) return;
      const { data } = await supabase.auth.getUser();
      if (data.user) await enterGame(data.user);
      else setMsg("Sign-in didn't finish. Please try again.");
    } catch (e) {
      setMsg(friendly(e instanceof Error ? e.message : String(e)));
    } finally { setSocialBusy(null); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${castle.url})` }} />
      <div className="absolute inset-0 bg-background/60 vignette" />
      <div className="game-panel anim-pop relative w-full max-w-sm p-6">
        <h1 className="panel-title mb-1 text-center text-3xl font-bold">EmberFall Online</h1>
        <p className="mb-5 text-center text-sm text-muted-foreground">{mode === "in" ? "Return to your castle" : mode === "up" ? "Forge a new legend" : "Reset your password"}</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="slot w-full px-3 py-2 outline-none" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode !== "forgot" && (
            <div className="relative">
              <input className="slot w-full px-3 py-2 pr-10 outline-none" type={show ? "text" : "password"} required minLength={6} placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
          <button className="btn-gold w-full py-2.5" disabled={busy}>{busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}</button>
        </form>
        <div className="my-4 text-center text-xs text-muted-foreground">or</div>
        <div className="space-y-2">
          <button type="button" className="btn-blood w-full py-2.5" disabled={!!socialBusy} onClick={() => social("google")}>{socialBusy === "google" ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Continue with Google"}</button>
          <button type="button" className="lovable-auth-button w-full" disabled={!!socialBusy} onClick={() => social("lovable")}>{socialBusy === "lovable" ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Continue with Lovable"}</button>
        </div>
        {msg && <p className="mt-3 text-center text-sm text-gold">{msg}</p>}
        <div className="mt-4 flex justify-between text-sm">
          <button className="text-muted-foreground hover:text-gold" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "Have an account? Sign in" : "New here? Sign up"}
          </button>
          {mode === "in" ? <button className="text-muted-foreground hover:text-gold" onClick={() => setMode("forgot")}>Forgot password?</button>
            : mode === "forgot" ? <button className="text-muted-foreground hover:text-gold" onClick={() => setMode("in")}>Back to sign in</button> : null}
        </div>
      </div>
    </div>
  );
}

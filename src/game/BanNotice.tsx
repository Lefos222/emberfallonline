import { useEffect, useState } from "react";
import { Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "./i18n";

type MyBan = { reason: string; at: string } | null;
// my_ban comes from 0050_admin_player_bans.sql and is not in the generated types until they regenerate.
const rpc = supabase.rpc.bind(supabase) as unknown as (fn: string) => Promise<{ data: unknown; error: unknown }>;

/** Shown on the character screen when the admin banned this account (characters are hidden server-side). */
export function BanNotice() {
  const t = useT();
  const [ban, setBan] = useState<MyBan>(null);
  useEffect(() => {
    void rpc("my_ban").then(({ data, error }) => { if (!error && data) setBan(data as MyBan); });
  }, []);
  if (!ban) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/90 p-4" role="alertdialog" aria-labelledby="ban-title">
      <div className="game-panel anim-pop w-full max-w-md p-6 text-center">
        <Ban className="mx-auto mb-2 h-10 w-10 text-hp" />
        <h2 id="ban-title" className="mb-2 font-display text-2xl text-hp">{t("Account banned")}</h2>
        <p className="mb-3 text-sm">{t("This account has been banned from EmberFall Online.")}</p>
        {ban.reason && <p className="slot mb-3 px-3 py-2 text-xs text-muted-foreground">{ban.reason}</p>}
        <p className="mb-4 text-xs text-muted-foreground">{t("If you believe this was a mistake, contact the game team.")}</p>
        <button className="btn-ghost w-full py-2" onClick={() => void supabase.auth.signOut()}>{t("Sign out")}</button>
      </div>
    </div>
  );
}

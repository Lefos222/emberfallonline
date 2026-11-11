import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArtIcon } from "./ArtIcon";
import { tr } from "./i18n";
import { adoptServerSave, withServerHero } from "./store";
import { returnedSave } from "./services-contract";
import { SOCIAL_REWARDS } from "./social-rewards";
import { verifyDiscordReward } from "./social-rewards.functions";

export function SocialRewards() {
  const [code, setCode] = useState("");
  const [claimed, setClaimed] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const verify = useServerFn(verifyDiscordReward);
  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase.rpc("social_reward_code", { _provider: "discord" }),
      supabase.from("social_reward_claims").select("provider"),
    ]).then(([c, claims]) => {
      if (!active) return;
      if (typeof c.data === "string") setCode(c.data);
      setClaimed((claims.data ?? []).map((v) => v.provider));
      if (c.error || claims.error) setNotice(tr("Social rewards could not be loaded."));
    });
    return () => { active = false; };
  }, []);
  const claim = async () => {
    setBusy(true); setNotice("");
    try {
      await withServerHero(async (heroId) => adoptServerSave(heroId, returnedSave(await verify({ data: { heroId } }))));
      setClaimed((v) => [...v, "discord"]);
      setNotice(tr("50 Diamonds awarded."));
    } catch (error) { setNotice(error instanceof Error ? error.message : tr("Verification unavailable.")); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4">
    <p className="text-sm text-muted-foreground">{tr("Each social reward can be claimed once per account, across all characters.")}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 font-display text-lg text-gold"><ArtIcon name="diamond" size={28} />Discord · 50◆</h3>
        <Button asChild variant="outline" className="my-3"><a href={SOCIAL_REWARDS.discord.url} target="_blank" rel="noopener noreferrer">{tr("Join Discord")}</a></Button>
        {!claimed.includes("discord") && <>
          <p className="mb-2 text-sm">{tr("Post this message in the welcome channel to verify your membership.")}</p>
          <code className="block break-all rounded border border-border bg-background p-3 text-xs">emberfall {code || "…"}</code>
          <Button variant="outline" className="my-2" disabled={!code} onClick={() => void navigator.clipboard.writeText(`emberfall ${code}`).then(() => setNotice(tr("Copied"))).catch(() => setNotice(tr("Copy the message above.")))}>{tr("Copy")}</Button>
        </>}
        <Button className="w-full" disabled={busy || !code || claimed.includes("discord")} onClick={() => void claim()}>{claimed.includes("discord") ? tr("Claimed") : busy ? tr("Verifying…") : tr("Verify and claim")}</Button>
      </div>
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 font-display text-lg text-gold"><ArtIcon name="diamond" size={28} />Instagram · 50◆</h3>
        <Button asChild variant="outline" className="my-3"><a href={SOCIAL_REWARDS.instagram.url} target="_blank" rel="noopener noreferrer">{tr("Follow Instagram")}</a></Button>
        <p className="mb-3 text-sm text-muted-foreground">{tr("Instagram reward verification is awaiting the official account messaging connection. Following alone cannot yet be checked.")}</p>
        <Button disabled className="w-full">{tr("Verification unavailable.")}</Button>
      </div>
    </div>
    {notice && <p role="status" className="rounded-md border border-border bg-background p-3 text-sm">{notice}</p>}
  </section>;
}
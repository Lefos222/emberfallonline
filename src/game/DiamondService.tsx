import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buyService, SERVICE_PRICES, type ServiceKind } from "./economy-services";
import { tr } from "./i18n";
import { ArtIcon } from "./ArtIcon";

/** A button that pays a Diamond service through the server, then runs the local follow-up. */
export function DiamondService({ kind, label, value, disabled, onDone }: {
  kind: ServiceKind; label: string; value?: string; disabled?: boolean; onDone?: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const go = async () => {
    setBusy(true); setMsg(null);
    try { await buyService(kind, value); await onDone?.(); setMsg({ ok: true, t: tr("Done") }); }
    catch (e) { setMsg({ ok: false, t: e instanceof Error ? e.message : String(e) }); }
    setBusy(false);
  };
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button size="sm" disabled={busy || disabled} onClick={() => void go()}>
        <ArtIcon name="diamond" size={16} />{tr(label)} · {SERVICE_PRICES[kind]}
      </Button>
      {msg && <span role="status" className={`text-xs ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</span>}
    </span>
  );
}

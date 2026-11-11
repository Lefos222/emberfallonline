import { useState } from "react";
import history from "./update-history.json";
import { RELEASE_NOTES } from "./version";
import { Panel, GameTabs } from "./ui";
import { tr } from "./i18n";
import { ArtIcon } from "./ArtIcon";

export function Announcements({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const rows = history.filter(r => (filter === "all" || r.kind === filter) && r.title.toLowerCase().includes(query.toLowerCase()));
  return <Panel title={tr("Announcements")} subtitle={tr("Updates, hotfixes and merges")} art="notes" wide onClose={onClose}>
    <GameTabs label={tr("Announcements")} value={filter} onChange={setFilter} tabs={[
      { id: "all", name: tr("All") }, { id: "update", name: tr("Updates") }, { id: "hotfix", name: tr("Hotfixes") },
    ]} />
    <input value={query} onChange={e => setQuery(e.target.value)} aria-label={tr("Search announcements")} placeholder={tr("Search announcements")} className="my-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
    <div className="space-y-0">{rows.map(r => <article key={r.id} className="flex gap-3 border-b border-border py-4">
      <ArtIcon name={r.kind === "hotfix" ? "hammer" : "notes"} size={32} />
      <div className="min-w-0"><p className="text-[10px] uppercase text-muted-foreground">{new Date(r.date).toLocaleDateString()} · {r.kind}</p><h3 className="break-words text-sm font-bold">{r.title}</h3>{"details" in r && typeof r.details === "string" && r.details && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{r.details}</p>}</div>
    </article>)}</div>
    <details className="mt-6 border-t border-border pt-4"><summary className="cursor-pointer font-display text-gold">{tr("Original release notes")}</summary>
      {RELEASE_NOTES.map(sec => <section key={sec.title} className="my-4"><h3 className="font-bold">{sec.title}</h3><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{sec.lines.map(line => <li key={line}>{line}</li>)}</ul></section>)}
    </details>
  </Panel>;
}
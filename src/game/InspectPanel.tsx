import { useEffect, useState } from "react";
import { Panel } from "./ui";
import { inspectHero, socialError, type InspectedProfile } from "./social";

export interface InspectPanelProps {
  heroId: string | null;
  targetId: string | null;
  onClose: () => void;
}

export function InspectPanel({ heroId, targetId, onClose }: InspectPanelProps) {
  const [result, setResult] = useState<{
    key: string; profile?: InspectedProfile; error?: string;
  } | null>(null);
  const key = JSON.stringify([heroId, targetId]);
  useEffect(() => {
    let active = true;
    setResult(null);
    if (heroId && targetId) {
      void inspectHero(heroId, targetId).then(
        (profile) => { if (active) setResult({ key, profile }); },
        (error: unknown) => { if (active) setResult({ key, error: socialError(error) }); },
      );
    }
    return () => { active = false; };
  }, [heroId, targetId, key]);
  const current = result?.key === key ? result : null;
  const profile = current?.profile;
  const error = !heroId ? "Select a character to inspect another hero." : !targetId ? "Select a hero to inspect." : current?.error;
  return <Panel title="Inspect hero" onClose={onClose}>
    {error && <p role="alert" className="py-2 text-sm text-muted-foreground">{error}</p>}
    {!error && !profile && <p role="status" className="py-2 text-sm text-muted-foreground">Loading hero…</p>}
    {profile && <div className="space-y-4 anim-pop">
      <header><h3 className="break-words font-display text-3xl text-gold">{profile.name}</h3>
        <p className="text-sm text-muted-foreground"><span className="capitalize">{profile.hero_class}</span> · Level {profile.level}</p></header>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="slot p-3"><dt className="text-muted-foreground">Battle Rating</dt><dd className="text-gold">{profile.power.toLocaleString()}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Arena rating</dt><dd>{profile.arena_rating.toLocaleString()}</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Title</dt><dd className="break-words">{profile.title || "No title"}</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Bio</dt><dd className="whitespace-pre-wrap break-words">{profile.bio || "No bio"}</dd></div>
      </dl>
      <section><h4 className="panel-title mb-2">Stats</h4>
        {profile.stats && typeof profile.stats === "object" && !Array.isArray(profile.stats)
          ? <dl className="space-y-2">{Object.entries(profile.stats).length === 0
            ? <p className="text-sm text-muted-foreground">No stats available.</p>
            : Object.entries(profile.stats).map(([name, value]) => <div key={name} className="slot flex flex-wrap justify-between gap-2 p-3 text-sm"><dt className="break-words">{name}</dt><dd className="whitespace-pre-wrap break-words">{typeof value === "string" ? value : JSON.stringify(value)}</dd></div>)}</dl>
          : <pre className="slot overflow-auto p-3 text-sm">{JSON.stringify(profile.stats, null, 2)}</pre>}
      </section>
    </div>}
  </Panel>;
}

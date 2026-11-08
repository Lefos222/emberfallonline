import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "./ui";
import { inspectHero, socialError, type InspectedProfile } from "./social";
import { CharacterModel } from "./CharacterModel";
import { TITLES, TITLE_TIERS, TITLE_COLORS, activeTitle } from "./titles";
import type { Hero } from "./data";

export interface InspectPanelProps {
  heroId: string | null;
  targetId: string | null;
  onClose: () => void;
}

export function InspectPanel({ heroId, targetId, onClose }: InspectPanelProps) {
  const [result, setResult] = useState<{
    key: string; profile?: InspectedProfile; error?: string;
  } | null>(null);
  const [guildName, setGuildName] = useState<string | null>(null);
  const [save, setSave] = useState<Hero | null>(null);
  const key = JSON.stringify([heroId, targetId]);

  useEffect(() => {
    let active = true;
    setResult(null);
    setGuildName(null);
    setSave(null);
    if (heroId && targetId) {
      void inspectHero(heroId, targetId).then(
        (profile) => {
          if (!active) return;
          setResult({ key, profile });
          // Fetch the hero's guild membership
          void supabase
            .from("guild_members")
            .select("guild_id, guilds(name)")
            .eq("hero_id", targetId)
            .maybeSingle()
            .then(({ data }) => {
              if (!active) return;
              const g = data as { guild_id?: string; guilds?: { name?: string } | null } | null;
              setGuildName(g?.guilds?.name ?? null);
            });
          // Fetch the hero's save to compute gear score and equipped title
          void supabase
            .from("heroes")
            .select("save")
            .eq("id", targetId)
            .maybeSingle()
            .then(({ data: saveData }) => {
              if (!active) return;
              const h = saveData?.save as unknown as Hero | null;
              if (h?.name) setSave(h);
            });
        },
        (error: unknown) => { if (active) setResult({ key, error: socialError(error) }); },
      );
    }
    return () => { active = false; };
  }, [heroId, targetId, key]);

  const current = result?.key === key ? result : null;
  const profile = current?.profile;
  const error = !heroId ? "Select a character to inspect another hero." : !targetId ? "Select a hero to inspect." : current?.error;
  const equippedTitle = save ? activeTitle(save) : null;

  return <Panel title="Inspect hero" subtitle="Gear, stats, guild and titles" art="profile" onClose={onClose}>
    {error && <p role="alert" className="py-2 text-sm text-muted-foreground">{error}</p>}
    {!error && !profile && <p role="status" className="py-2 text-sm text-muted-foreground">Loading hero…</p>}
    {profile && <div className="space-y-4 anim-pop">
      <header>{(profile.hero_class === 'warrior' || profile.hero_class === 'mage' || profile.hero_class === 'archer') && <CharacterModel cls={profile.hero_class} gender={profile.gender === 'female' ? 'female' : 'male'} className="mb-3 h-48" />}<h3 className="break-words font-display text-3xl text-gold">{profile.name}</h3>
        <p className="text-sm text-muted-foreground"><span className="capitalize">{profile.hero_class}</span> · Level {profile.level}</p>
        {equippedTitle && (
          <span className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold"
            style={{ backgroundColor: TITLE_COLORS[equippedTitle.tier] + "22", color: TITLE_COLORS[equippedTitle.tier] }}>
            {equippedTitle.name} · {TITLE_TIERS[equippedTitle.tier]} tier
          </span>
        )}
      </header>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="slot p-3"><dt className="text-muted-foreground">Battle Rating</dt><dd className="text-gold">{profile.power.toLocaleString()}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Arena rating</dt><dd>{profile.arena_rating.toLocaleString()}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Guild</dt><dd className="text-gold">{guildName ?? "No guild"}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Title</dt><dd className="break-words">{profile.title || equippedTitle?.name || "No title"}</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Bio</dt><dd className="whitespace-pre-wrap break-words">{profile.bio || "No bio"}</dd></div>
      </dl>
      {save && equippedTitle && (
        <section>
          <h4 className="panel-title mb-2">Title buffs</h4>
          <dl className="space-y-2">
            {Object.entries(equippedTitle.buff).map(([stat, value]) => (
              <div key={stat} className="slot flex justify-between p-2 text-sm">
                <dt className="capitalize">{stat.replace(/Pct$/, '%').replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd className="text-gold">+{value}{stat.endsWith('Pct') ? '%' : ''}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
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

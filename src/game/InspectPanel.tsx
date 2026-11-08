import { useEffect, useState } from "react";
import { Panel } from "./ui";
import { inspectHero, socialError, type InspectedProfile } from "./social";
import { CharacterModel } from "./CharacterModel";
import { TITLE_TIER_COLOR, TITLE_TIER_LABEL, titleBuffText, titleById, titleByName } from "./titles";

export interface InspectPanelProps {
  heroId: string | null;
  targetId: string | null;
  onClose: () => void;
}

/** Friendly names for the public stat bag, so inspection reads like a character sheet. */
const STAT_LABEL: Record<string, string> = {
  hp: "Health",
  atk: "Attack",
  def: "Defense",
  crit: "Crit Chance",
  dodge: "Dodge",
  patk: "Physical Attack",
  matk: "Magic Attack",
  pdef: "Physical Defense",
  mdef: "Magic Defense",
  critDmg: "Crit Damage",
  pen: "Penetration",
  acc: "Accuracy",
  block: "Block",
  heal: "Healing",
};

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
  const title = titleByName(profile?.title);
  const stats = (() => {
    const raw = profile?.stats;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    return Object.entries(raw as Record<string, unknown>).filter(([name]) => STAT_LABEL[name]);
  })();
  // The public stats row mirrors the earned title ids, so inspection can list the whole cabinet.
  const publicTitles = (() => {
    const raw = profile?.stats;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const list = (raw as Record<string, unknown>)["titles"];
    return Array.isArray(list) ? list.filter((id): id is string => typeof id === "string") : [];
  })();

  return <Panel title="Hero profile" subtitle="Gear score, battle rating, guild and titles" art="profile" onClose={onClose}>
    {error && <p role="alert" className="py-2 text-sm text-muted-foreground">{error}</p>}
    {!error && !profile && <p role="status" className="py-2 text-sm text-muted-foreground">Loading hero…</p>}
    {profile && <div className="space-y-4 anim-pop">
      <header className="flex flex-wrap items-start gap-4">
        {(profile.hero_class === "warrior" || profile.hero_class === "mage" || profile.hero_class === "archer") &&
          <CharacterModel cls={profile.hero_class} gender={profile.gender === "female" ? "female" : "male"} className="h-40 w-32 shrink-0" />}
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-3xl text-gold">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="capitalize">{profile.hero_class}</span> · Level {profile.level}
          </p>
          {profile.title && (
            <p className="mt-1 text-sm" style={title ? { color: TITLE_TIER_COLOR[title.tier] } : undefined}>
              {profile.title}
              {title && (
                <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: TITLE_TIER_COLOR[title.tier], border: `1px solid ${TITLE_TIER_COLOR[title.tier]}` }}>
                  {TITLE_TIER_LABEL[title.tier]}
                </span>
              )}
              {title && <span className="ml-2 text-xs text-muted-foreground">{titleBuffText(title)}</span>}
            </p>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div className="slot p-3"><dt className="text-muted-foreground">Battle Rating</dt><dd className="font-display text-lg text-gold">{profile.power.toLocaleString()}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Gear Score</dt><dd className="font-display text-lg text-gold">{profile.gear_score ? profile.gear_score.toLocaleString() : "—"}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Arena Rating</dt><dd className="font-display text-lg">{profile.arena_rating.toLocaleString()}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Guild</dt><dd className="font-display text-lg">{profile.guild || "No guild"}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Class</dt><dd className="font-display text-lg capitalize">{profile.hero_class}</dd></div>
        <div className="slot p-3"><dt className="text-muted-foreground">Level</dt><dd className="font-display text-lg">{profile.level}</dd></div>
      </dl>

      {publicTitles.length > 0 && (
        <section>
          <h4 className="panel-title mb-2">Titles</h4>
          <div className="flex flex-wrap gap-1.5">
            {publicTitles.map((id) => {
              const def = titleById(id);
              return def ? (
                <span key={id} className="rounded border px-2 py-0.5 text-xs"
                  style={{ color: TITLE_TIER_COLOR[def.tier], borderColor: `${TITLE_TIER_COLOR[def.tier]}88` }}
                  title={`${TITLE_TIER_LABEL[def.tier]} title · ${titleBuffText(def)}`}>
                  {def.name}
                </span>
              ) : null;
            })}
          </div>
        </section>
      )}

      <section>
        <h4 className="panel-title mb-2">Battle stats</h4>
        {stats.length === 0
          ? <p className="text-sm text-muted-foreground">No stats available.</p>
          : <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {stats.map(([name, value]) => (
              <div key={name} className="slot flex items-center justify-between gap-2 p-2.5">
                <dt className="text-muted-foreground">{STAT_LABEL[name]}</dt>
                <dd className="font-bold">{typeof value === "number" ? value.toLocaleString() : String(value)}</dd>
              </div>
            ))}
          </dl>}
      </section>

      <section>
        <h4 className="panel-title mb-1">Bio</h4>
        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{profile.bio || "No bio"}</p>
      </section>
    </div>}
  </Panel>;
}

import { useState } from "react";
import { Check, Gift, Sparkles, Trophy } from "lucide-react";
import { AVATAR_COUNT, AvatarIcon } from "./AvatarIcon";
import { Portrait } from "./CharacterSelect";
import { CLASSES, heroStats, powerBreakdown, xpToNext } from "./data";
import { update, updateProfile, useGame } from "./store";
import { GameTabs, Panel, fmt } from "./ui";
import { LevelProgress } from "./LevelCurve";
import {
  ACHIEVEMENTS,
  ACH_CATEGORIES,
  achGold,
  achProgress,
  emptyRecord,
  isClaimable,
  type AchCategory,
} from "./progress";
import { FRAMES, frameClass } from "./profile-frames";
import { TITLES, TITLE_COLORS, TITLE_TIERS, activeTitle, claimTitle, equipTitle } from "./titles";

type ProfileTab = "summary" | "titles" | "achievements" | "appearance";
type TitleFilter = "all" | "earned" | "locked";

/**
 * The hero's own page: one clean place for the Battle Rating breakdown, the title ladder and the
 * achievement purse, with cosmetics moved to their own tab instead of being mixed into the sheet.
 */
export function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { hero, heroId, chars, gender } = useGame();
  const [tab, setTab] = useState<ProfileTab>("summary");
  const [titleFilter, setTitleFilter] = useState<TitleFilter>("all");
  const [achCat, setAchCat] = useState<AchCategory | "All">("All");
  const [msg, setMsg] = useState<string | null>(null);
  const row = chars?.find((c) => c.id === heroId);
  const [bio, setBio] = useState(row?.bio ?? "");
  const [frame, setFrame] = useState(row?.frame ?? "iron");
  const [pub, setPub] = useState(row?.is_public ?? true);
  if (!hero) return null;
  const stats = heroStats(hero);
  const rec = { ...emptyRecord(), ...(hero.record ?? {}) };
  const equipped = activeTitle(hero);
  const claimed = new Set(hero.titleClaimed ?? []);
  const claimableTitles = TITLES.filter((t) => t.earned(hero) && !claimed.has(t.id)).length;
  const claimableAch = ACHIEVEMENTS.filter((a) => isClaimable(hero, a)).length;
  const earnedCount = TITLES.filter((t) => claimed.has(t.id) || t.earned(hero)).length;
  const titles = TITLES.filter((t) =>
    titleFilter === "earned" ? t.earned(hero) || claimed.has(t.id) : titleFilter === "locked" ? !t.earned(hero) && !claimed.has(t.id) : true,
  );

  const equip = (id: string | null) => {
    update((h) => { equipTitle(h, id); });
    const name = id ? TITLES.find((t) => t.id === id)?.name ?? "" : "";
    void updateProfile({ title: name });
  };

  return (
    <Panel title="Hero Profile" subtitle="Your hero, titles, achievements and look" art="profile" onClose={onClose} wide>
      <GameTabs
        label="Profile"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "summary", name: "Summary" },
          { id: "titles", name: "Titles", badge: claimableTitles },
          { id: "achievements", name: "Achievements", badge: claimableAch },
          { id: "appearance", name: "Appearance" },
        ]}
      />

      {tab === "summary" && (
        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className={`slot w-full overflow-hidden p-0 ${frameClass(frame)}`}>
              {hero.avatar !== undefined
                ? <AvatarIcon index={hero.avatar} fill className="block aspect-square w-full" />
                : <Portrait cls={hero.cls} gender={gender} className="w-full" />}
            </div>
            <div className="text-center">
              <div className="font-display text-2xl leading-tight">{hero.name}</div>
              <div className="text-xs text-muted-foreground">
                {CLASSES[hero.cls].name} · Level {hero.level}
                {hero.paragon > 0 && ` · Ascension ${hero.paragon}`}
              </div>
              {equipped && (
                <div className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: TITLE_COLORS[equipped.tier] + "22", color: TITLE_COLORS[equipped.tier] }}>
                  {equipped.name}
                </div>
              )}
            </div>
            <div className="slot w-full p-2 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Battle Rating</div>
              <div className="font-display text-3xl text-gold">{fmt(stats.power)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
              {[["Wins", rec.wins], ["Bosses", rec.bosses], ["Arena", rec.arenaWins], ["Stage", hero.stage]].map(([label, value]) => (
                <div key={label} className="slot p-2">
                  <div className="font-display text-lg text-gold">{fmt(Number(value))}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-gold">Next level</span>
                <span className="text-xs text-muted-foreground">{fmt(hero.xp)} / {fmt(xpToNext(hero))} XP</span>
              </div>
              <LevelProgress hero={hero} rows={1} />
            </div>
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-gold">Where the rating comes from</span>
                <span className="text-xs text-muted-foreground">Every upgrade raises it</span>
              </div>
              <div className="space-y-1">
                {powerBreakdown(hero).map((p) => (
                  <div key={p.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{p.label}</span>
                    <span className={p.power < 0 ? "text-hp" : "text-gold"}>{p.power >= 0 ? "+" : ""}{fmt(p.power)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="slot p-2">
                <div className="flex items-center gap-1 font-display text-gold"><Trophy className="h-3.5 w-3.5" />Titles</div>
                <div>{earnedCount} / {TITLES.length} earned</div>
                {claimableTitles > 0 && <div className="text-xs text-xp">{claimableTitles} ready to claim</div>}
              </div>
              <div className="slot p-2">
                <div className="flex items-center gap-1 font-display text-gold"><Sparkles className="h-3.5 w-3.5" />Achievements</div>
                <div>{(hero.achClaimed ?? []).length} / {ACHIEVEMENTS.length} claimed</div>
                {claimableAch > 0 && <div className="text-xs text-xp">{claimableAch} ready to claim</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "titles" && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Every title grants permanent buffs while equipped. {earnedCount} of {TITLES.length} earned.
            </p>
            <div className="flex gap-1" role="group" aria-label="Title filter">
              {(["all", "earned", "locked"] as const).map((f) => (
                <button key={f} onClick={() => setTitleFilter(f)} aria-pressed={titleFilter === f}
                  className={`px-2 py-0.5 text-xs ${titleFilter === f ? "btn-gold" : "btn-ghost"}`}>
                  {f === "all" ? "All" : f === "earned" ? "Earned" : "Locked"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {titles.map((t) => {
              const owned = claimed.has(t.id);
              const canClaim = !owned && t.earned(hero);
              const isEquipped = hero.equippedTitle === t.id;
              const buffs = Object.entries(t.buff).map(([k, v]) => `+${v}${k.endsWith("Pct") ? "%" : ""} ${k.replace(/Pct$/, "").replace(/([A-Z])/g, " $1").trim()}`).join(" · ");
              return (
                <article key={t.id} className="slot flex items-start gap-2 p-2"
                  style={{ borderColor: owned ? TITLE_COLORS[t.tier] + "66" : undefined }}>
                  <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: TITLE_COLORS[t.tier] + "22", color: TITLE_COLORS[t.tier] }}>
                    {TITLE_TIERS[t.tier]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm font-bold ${isEquipped ? "text-gold" : ""}`}>{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                    <div className="text-[11px] text-muted-foreground">{t.howToEarn}</div>
                    <div className="text-[11px]">{buffs}</div>
                  </div>
                  {canClaim && <button className="btn-gold shrink-0 px-2 py-0.5 text-[10px]" onClick={() => update((h) => { claimTitle(h, t.id); })}>Claim</button>}
                  {owned && !isEquipped && <button className="btn-ghost shrink-0 px-2 py-0.5 text-[10px]" onClick={() => equip(t.id)}>Equip</button>}
                  {isEquipped && <span className="shrink-0 rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">Equipped</span>}
                  {!owned && !canClaim && <span className="shrink-0 text-[10px] text-muted-foreground">Locked</span>}
                </article>
              );
            })}
          </div>
          {hero.equippedTitle && (
            <button className="btn-ghost mt-2 px-2 py-0.5 text-[10px]" onClick={() => equip(null)}>Unequip title</button>
          )}
        </div>
      )}

      {tab === "achievements" && (
        <div>
          <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label="Achievement categories">
            {(["All", ...ACH_CATEGORIES] as const).map((c) => {
              const n = c === "All" ? ACHIEVEMENTS.length : ACHIEVEMENTS.filter((a) => a.cat === c).length;
              return (
                <button key={c} onClick={() => setAchCat(c)} aria-pressed={achCat === c}
                  className={`btn-ghost px-2 py-0.5 text-xs ${achCat === c ? "ring-1 ring-gold text-gold" : "text-muted-foreground"}`}>
                  {c} <span className="text-[10px]">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {ACHIEVEMENTS.filter((a) => achCat === "All" || a.cat === achCat).map((a) => {
              const p = achProgress(hero, a);
              const done = (hero.achClaimed ?? []).includes(a.id);
              const canClaim = isClaimable(hero, a);
              return (
                <div key={a.id} className={`slot p-3 ${done ? "opacity-70" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{a.name} <span className="text-[10px] text-muted-foreground">· {a.cat}</span></div>
                      <div className="text-[11px] text-muted-foreground">{a.desc}: {fmt(p)} / {fmt(a.goal)}</div>
                      <div className="text-[11px]"><span className="text-gold">{fmt(achGold(a))} gold</span>{a.title && <span className="ml-2 text-gold">Title: {a.title}</span>}</div>
                    </div>
                    {done ? <Check className="h-5 w-5 shrink-0 text-gold" aria-label="Claimed" /> : (
                      <button className="btn-gold flex shrink-0 items-center gap-1 px-2 py-1 text-xs" disabled={!canClaim}
                        title={canClaim ? "Claim reward" : "Not completed yet"}
                        onClick={() => update((h) => {
                          if (!isClaimable(h, a)) return;
                          h.achClaimed = [...(h.achClaimed ?? []), a.id];
                          h.gold += achGold(a);
                        })}><Gift className="h-3.5 w-3.5" />Claim</button>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded bg-muted">
                    <div className="h-full bg-gold" style={{ width: `${Math.min(100, (p / a.goal) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "appearance" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`slot w-28 overflow-hidden p-0 ${frameClass(frame)}`}>
              {hero.avatar !== undefined
                ? <AvatarIcon index={hero.avatar} fill className="block aspect-square w-full" />
                : <Portrait cls={hero.cls} gender={gender} className="w-full" />}
            </div>
            <div className="text-sm text-muted-foreground">
              Portrait, frame and biography appear on your public profile, in the arena and on the rankings.
            </div>
          </div>
          <div className="text-sm">
            <div className="font-display text-gold">Portrait</div>
            <div className="mt-1 grid grid-cols-5 gap-1 sm:grid-cols-10">
              {Array.from({ length: AVATAR_COUNT }, (_, i) => (
                <button key={i} type="button" aria-label={`Portrait ${i + 1}`} aria-pressed={hero.avatar === i}
                  className={`rounded ${hero.avatar === i ? "ring-2 ring-gold" : "opacity-75 hover:opacity-100"}`}
                  onClick={() => update((h) => { h.avatar = i; })}>
                  <AvatarIcon index={i} size={34} />
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-display text-gold">Frame</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {FRAMES.map((f) => (
                <button key={f.id} disabled={hero.level + hero.paragon < f.minLevel}
                  className={`px-2 py-1 text-xs ${frame === f.id ? "btn-gold" : "slot"} disabled:opacity-40`}
                  title={hero.level + hero.paragon < f.minLevel ? `Unlocks at level ${f.minLevel}` : ""}
                  onClick={() => setFrame(f.id)}>{f.name}</button>
              ))}
            </div>
          </div>
          <label className="block text-sm">Biography
            <textarea className="slot mt-1 w-full p-2 outline-none" maxLength={200} rows={3} value={bio}
              onChange={(e) => setBio(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
            Public profile (visible in arena &amp; rankings)
          </label>
          <button className="btn-gold px-6 py-2" onClick={async () => {
            const e = await updateProfile({ bio: bio.trim(), title: activeTitle(hero)?.name ?? "", frame, is_public: pub });
            setMsg(e ?? "Profile saved");
          }}>Save profile</button>
          {msg && <span className="ml-3 text-sm text-gold">{msg}</span>}
        </div>
      )}
    </Panel>
  );
}

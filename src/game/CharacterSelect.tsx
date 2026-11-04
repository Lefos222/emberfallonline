import { useState } from "react";
import { Loader2, Plus, Trash2, Play, ArrowLeft, LogOut, RefreshCw, X } from "lucide-react";
import { CharacterModel } from './CharacterModel';
import { AVATAR_COUNT, AvatarIcon } from './AvatarIcon';
import { CharacterPose } from './CharacterPose';
import selectionBackground from "@/assets/heroes/selection-bloodmoon.jpg";
import { Button } from "@/components/ui/button";
import { RefreshCw as PoseIcon, Sword, Sparkles, Crosshair } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass } from "./data";
import {
  createCharacter, deleteCharacter, lastCharacterId, loadCharacters, selectCharacter, update, updateProfile, useGame, type CharacterRow, type Gender,
} from "./store";
import { Panel, fmt } from "./ui";
import { earnedTitles } from "./progress";

export function Portrait({ cls, gender, className = "", synth, look }: { cls: HeroClass; gender: Gender; className?: string; synth?: number | null; look?: number | null }) {
  return <CharacterModel cls={cls} gender={gender} className={className} synth={synth} look={look} />;
}

const DESC: Record<HeroClass, { style: string; text: string }> = {
  warrior: { style: "Melee · Tank", text: "Durable frontline fighter. Heavy physical blows, high armor and health." },
  mage: { style: "Ranged · Spells", text: "Elemental spellcaster. Devastating magic damage, fragile defenses." },
  archer: { style: "Ranged · Crits", text: "Agile marksman. High critical chance and dodge, precise arrows." },
};

export function CharacterSelect() {
  const { chars, charsError, email } = useGame();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<CharacterRow | null>(null);

  const enter = async (id: string) => {
    setBusy(id); setErr(null);
    const e = await selectCharacter(id);
    if (e) setErr(e);
    setBusy(null);
  };

  const showCreate = creating || (chars !== null && chars.length === 0 && !charsError);
  const last = chars?.find((c) => c.id === lastCharacterId()) ?? chars?.[0];

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <img src={selectionBackground} alt="" aria-hidden="true" className="hero-selection-backdrop" />
      <div className="vignette fixed inset-0" />
      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col items-center p-4 pt-8">
        <div className="mb-2 flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>{email}</span>
          <button className="flex items-center gap-1 hover:text-gold" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" />Sign out</button>
        </div>
        <div className="mb-6 text-center"><p className="mb-2 font-display text-sm text-gold">EMBER FALL</p><h1 className="hero-selection-title font-display text-3xl font-black text-foreground md:text-5xl">Select Your Hero</h1></div>

        {chars === null && <div className="flex items-center gap-2 py-20 font-display text-lg"><Loader2 className="h-5 w-5 animate-spin" />Loading your characters…</div>}
        {charsError && (
          <div className="game-panel p-6 text-center">
            <p className="mb-3 text-hp">Couldn't load characters: {charsError}</p>
            <button className="btn-gold px-4 py-2" onClick={() => loadCharacters()}><RefreshCw className="mr-1 inline h-4 w-4" />Retry</button>
          </div>
        )}

        {chars && !showCreate && (
          <>
            {last && (
              <button className="btn-gold mb-6 flex items-center gap-2 px-8 py-3 text-xl" disabled={!!busy} onClick={() => enter(last.id)}>
                {busy === last.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}Continue as {last.name}
              </button>
            )}
            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
              {chars.map((c) => (
                <div key={c.id} className="game-panel flex flex-col p-2">
                  <CharacterPose cls={c.hero_class} gender={c.gender} className="aspect-square w-full" />
                  <div className="mt-2 truncate text-center font-display text-lg">{c.name}</div>
                  <div className="text-center text-xs text-muted-foreground">{CLASSES[c.hero_class].name} · {c.gender}</div>
                  <div className="text-center text-xs">Lv {c.level}{c.stats?.paragon ? ` · Asc ${c.stats.paragon}` : ""} · BR {fmt(c.power)}</div>
                  <div className="text-center text-[10px] text-muted-foreground">Last played {new Date(c.last_played).toLocaleDateString()}</div>
                  <div className="mt-2 flex gap-1">
                    <button className="btn-gold flex-1 py-1.5 text-sm" disabled={!!busy} onClick={() => enter(c.id)}>
                      {busy === c.id ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Play"}
                    </button>
                    <button className="slot px-2" aria-label="Delete" onClick={() => setConfirmDel(c)}><Trash2 className="h-4 w-4 text-hp" /></button>
                  </div>
                </div>
              ))}
              {chars.length < 4 && (
                <button className="game-panel flex min-h-60 flex-col items-center justify-center gap-2 opacity-70 hover:opacity-100" onClick={() => setCreating(true)}>
                  <Plus className="h-10 w-10 text-gold" /><span className="font-display">New character</span>
                </button>
              )}
            </div>
          </>
        )}

        {showCreate && <CreateCharacter canCancel={(chars?.length ?? 0) > 0} onCancel={() => setCreating(false)} />}
        {err && <p className="mt-4 text-center text-hp">{err}</p>}
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="game-panel anim-pop w-full max-w-sm p-6 text-center">
            <h2 className="mb-2 font-display text-2xl">Delete {confirmDel.name}?</h2>
            <p className="mb-4 text-sm text-muted-foreground">This permanently erases this character and all its progress.</p>
            <div className="flex gap-2">
              <button className="slot flex-1 py-2" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn-blood flex-1 py-2" onClick={async () => {
                const e = await deleteCharacter(confirmDel.id); setConfirmDel(null); if (e) setErr(e);
              }}>Delete forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateCharacter({ canCancel, onCancel }: { canCancel: boolean; onCancel: () => void }) {
  const [cls, setCls] = useState<HeroClass>("warrior");
  const [gender, setGender] = useState<Gender>("male");
  const [pose, setPose] = useState<"idle" | "action">("idle");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = /^[A-Za-z0-9 _-]{3,18}$/.test(name.trim());

  if (step === "confirm") {
    return (
      <div className="game-panel anim-pop flex w-full max-w-md flex-col items-center p-6">
        <CharacterPose cls={cls} gender={gender} className="h-80 w-64" />
        <div className="mt-3 font-display text-3xl">{name.trim()}</div>
        <div className="text-muted-foreground">{gender === "male" ? "Male" : "Female"} {CLASSES[cls].name}</div>
        <p className="mt-2 text-center text-sm">{DESC[cls].text}</p>
        {err && <p className="mt-3 text-hp">{err}</p>}
        <div className="mt-5 flex w-full gap-2">
          <button className="slot flex-1 py-2" onClick={() => setStep("pick")}><ArrowLeft className="mr-1 inline h-4 w-4" />Back</button>
          <button className="btn-gold flex-1 py-2" disabled={busy} onClick={async () => {
            setBusy(true); setErr(null);
            const e = await createCharacter(name.trim(), cls, gender);
            if (e) setErr(e);
            setBusy(false);
          }}>{busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Enter the castle"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {(["warrior", "mage", "archer"] as HeroClass[]).map((c) => {
          const Icon = c === "warrior" ? Sword : c === "mage" ? Sparkles : Crosshair;
          return <section key={c} className={`hero-class-group hero-class-${c}`} aria-label={CLASSES[c].name}>
            <h2 className="hero-class-heading flex items-center justify-center gap-2 py-3 font-display text-2xl"><Icon className="h-6 w-6" />{CLASSES[c].name}</h2>
            <div className="grid grid-cols-2">
              {(["female", "male"] as Gender[]).map(g => <Button key={g} variant="ghost" className="hero-choice" aria-label={`Select ${g} ${CLASSES[c].name}`} aria-pressed={cls === c && gender === g} onClick={() => { setCls(c); setGender(g); }}>
                <CharacterModel cls={c} gender={g} pose={pose} />
                <span className="hero-choice-label font-display text-xs text-foreground">{g === "male" ? "Male" : "Female"}</span>
              </Button>)}
            </div>
            <p className="hero-class-heading pb-3 text-center text-xs">{DESC[c].style}</p>
          </section>;
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <span className="font-display text-gold">{gender === "female" ? "Female" : "Male"} {CLASSES[cls].name}</span>
        <Button variant="outline" size="icon" title="Change hero poses" aria-label="Change hero poses" aria-pressed={pose === "action"} onClick={() => setPose(p => p === "idle" ? "action" : "idle")}><PoseIcon className="h-4 w-4" /></Button>
      </div>
      <p className="mt-2 text-center text-sm text-foreground">{DESC[cls].text}</p>
      <div className="mt-4 flex w-full max-w-md gap-2">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 18))} placeholder="Character name (3–18)"
          aria-label="Character name" className="hero-selection-input slot flex-1 px-4 py-3 font-display text-lg outline-none" />
        <Button className="btn-gold h-auto px-6 text-lg" disabled={!valid} onClick={() => setStep("confirm")}>Next</Button>
      </div>
      {name && !valid && <p className="mt-2 text-xs text-hp">Use 3–18 letters, numbers, spaces, - or _</p>}
      {canCancel && <button className="mt-3 text-sm text-muted-foreground hover:text-gold" onClick={onCancel}>Back to my characters</button>}
    </div>
  );
}

const FRAMES = [
  { id: "iron", name: "Iron", minLevel: 1 },
  { id: "bronze", name: "Bronze", minLevel: 10 },
  { id: "silver", name: "Silver", minLevel: 25 },
  { id: "gold", name: "Gold", minLevel: 50 },
  { id: "ember", name: "Ember", minLevel: 80 },
];
const TITLES = [
  { id: "", name: "None", minLevel: 1 },
  { id: "Squire", name: "Squire", minLevel: 5 },
  { id: "Vanguard", name: "Vanguard", minLevel: 20 },
  { id: "Champion", name: "Champion", minLevel: 40 },
  { id: "Ascendant", name: "Ascendant", minLevel: 80 },
];
export const frameClass = (f: string) => ({ iron: "rarity-0", bronze: "rarity-1", silver: "rarity-2", gold: "rarity-4", ember: "rarity-5" }[f] ?? "rarity-0");

export function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { hero, heroId, chars, gender } = useGame();
  const row = chars?.find((c) => c.id === heroId);
  const [bio, setBio] = useState(row?.bio ?? "");
  const [title, setTitle] = useState(row?.title ?? "");
  const [frame, setFrame] = useState(row?.frame ?? "iron");
  const [pub, setPub] = useState(row?.is_public ?? true);
  const [msg, setMsg] = useState<string | null>(null);
  const [gallery, setGallery] = useState(false);
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  return (
    <Panel title="Profile" onClose={onClose}>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-40 shrink-0 flex-col items-center gap-1 self-center">
          <button className={`slot w-40 p-1 ${frameClass(frame)}`} onClick={() => setGallery(true)} aria-label="Open full-screen portraits" title="Open full-screen portraits">
            {hero.avatar !== undefined
              ? <AvatarIcon index={hero.avatar} fill className="block aspect-square w-full" />
              : <Portrait cls={hero.cls} gender={gender} className="w-full" />}
          </button>
          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setGallery(true)}>Full screen</button>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            {hero.avatar !== undefined && <AvatarIcon index={hero.avatar} size={44} />}
            <div><div className="font-display text-2xl">{hero.name}</div>{title && <div className="text-gold">{title}</div>}</div>
          </div>
          <div className="text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>Profile portrait</span>
              <button className="btn-ghost px-2 py-0.5 text-xs" onClick={() => setGallery(true)}>Full screen</button>
            </div>
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
          <label className="block text-sm">Biography
            <textarea className="slot mt-1 w-full p-2 outline-none" maxLength={200} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <div className="text-sm">Title
            <div className="mt-1 flex flex-wrap gap-1">
              {[...TITLES, ...earnedTitles(hero).map((n) => ({ id: n, name: n, minLevel: 1 }))].map((t) => (
                <button key={t.id} disabled={lvl < t.minLevel} className={`px-2 py-1 text-xs ${title === t.id ? "btn-gold" : "slot"} disabled:opacity-40`}
                  title={lvl < t.minLevel ? `Unlocks at level ${t.minLevel}` : ""} onClick={() => setTitle(t.id)}>{t.name}</button>
              ))}
            </div>
          </div>
          <div className="text-sm">Frame
            <div className="mt-1 flex flex-wrap gap-1">
              {FRAMES.map((f) => (
                <button key={f.id} disabled={lvl < f.minLevel} className={`px-2 py-1 text-xs ${frame === f.id ? "btn-gold" : "slot"} disabled:opacity-40`}
                  title={lvl < f.minLevel ? `Unlocks at level ${f.minLevel}` : ""} onClick={() => setFrame(f.id)}>{f.name}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />Public profile (visible in arena & rankings)</label>
          <button className="btn-gold px-6 py-2" onClick={async () => {
            const e = await updateProfile({ bio: bio.trim(), title, frame, is_public: pub });
            setMsg(e ?? "Profile saved");
          }}>Save profile</button>
          {msg && <span className="ml-3 text-sm text-gold">{msg}</span>}
        </div>
      </div>
      {gallery && <PortraitGallery current={hero.avatar} onPick={(i) => update((h) => { h.avatar = i; })} onClose={() => setGallery(false)} />}
    </Panel>
  );
}

/** Every painted portrait at gallery size, covering the screen so the art is actually readable. */
function PortraitGallery({ current, onPick, onClose }: { current?: number; onPick: (i: number) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Profile portraits">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-xl text-gold">Choose your portrait</div>
          <p className="text-xs text-muted-foreground">{AVATAR_COUNT} portraits — pick one to wear on your profile and HUD.</p>
        </div>
        <button className="btn-blood flex h-9 w-9 items-center justify-center" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: AVATAR_COUNT }, (_, i) => (
          <button key={i} onClick={() => { onPick(i); onClose(); }} aria-label={`Portrait ${i + 1}`} aria-pressed={current === i}
            className={`slot aspect-square w-full overflow-hidden p-1 ${current === i ? "ring-2 ring-gold" : "hover:ring-1 hover:ring-gold"}`}>
            <AvatarIcon index={i} fill className="block h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

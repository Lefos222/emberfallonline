import { useState } from "react";
import { Loader2, Plus, Trash2, Play, ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import { CharacterModel } from './CharacterModel';
import castle from "@/assets/castle.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass } from "./data";
import {
  createCharacter, deleteCharacter, lastCharacterId, loadCharacters, selectCharacter, updateProfile, useGame, type CharacterRow, type Gender,
} from "./store";
import { Panel, fmt } from "./ui";
import { earnedTitles } from "./progress";

export function Portrait({ cls, gender, className = "" }: { cls: HeroClass; gender: Gender; className?: string }) {
  return <CharacterModel cls={cls} gender={gender} className={className} />;
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
      <div className="fixed inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${castle.url})` }} />
      <div className="vignette fixed inset-0" />
      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center p-4 pt-8">
        <div className="mb-2 flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>{email}</span>
          <button className="flex items-center gap-1 hover:text-gold" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" />Sign out</button>
        </div>
        <h1 className="panel-title mb-6 text-center text-4xl font-black md:text-6xl">EMBER FALL</h1>

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
                  <Portrait cls={c.hero_class} gender={c.gender} className="w-full rounded" />
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
  const [name, setName] = useState("");
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = /^[A-Za-z0-9 _-]{3,18}$/.test(name.trim());

  if (step === "confirm") {
    return (
      <div className="game-panel anim-pop flex w-full max-w-md flex-col items-center p-6">
        <Portrait cls={cls} gender={gender} className="w-48 rounded" />
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
      <div className="grid w-full max-w-4xl grid-cols-3 gap-3 md:gap-6">
        {(Object.keys(CLASSES) as HeroClass[]).map((c) => (
          <button key={c} onClick={() => setCls(c)}
            className={`game-panel flex flex-col items-center p-2 transition md:p-4 ${cls === c ? "scale-105 shadow-[var(--shadow-glow)]" : "opacity-60 hover:opacity-90"}`}>
            <Portrait cls={c} gender={gender} className={`w-full rounded ${cls === c ? "anim-idle" : ""}`} />
            <span className="mt-1 font-display text-lg md:text-2xl">{CLASSES[c].name}</span>
            <span className="text-xs text-gold">{DESC[c].style}</span>
            <span className="hidden text-xs text-muted-foreground md:block">{DESC[c].text}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {(["male", "female"] as Gender[]).map((g) => (
          <button key={g} className={`px-5 py-2 ${gender === g ? "btn-gold" : "slot"}`} onClick={() => setGender(g)}>{g === "male" ? "Male" : "Female"}</button>
        ))}
      </div>
      <div className="mt-4 flex w-full max-w-md gap-2">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 18))} placeholder="Character name (3–18)"
          className="slot flex-1 px-4 py-3 font-display text-lg outline-none" />
        <button className="btn-gold px-6 text-lg" disabled={!valid} onClick={() => setStep("confirm")}>Next</button>
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
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  return (
    <Panel title="Profile" onClose={onClose}>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className={`slot w-40 shrink-0 self-center p-1 ${frameClass(frame)}`}><Portrait cls={hero.cls} gender={gender} className="w-full" /></div>
        <div className="flex-1 space-y-3">
          <div><div className="font-display text-2xl">{hero.name}</div>{title && <div className="text-gold">{title}</div>}</div>
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
    </Panel>
  );
}

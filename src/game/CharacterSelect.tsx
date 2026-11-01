import { useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Play,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Shield,
  Wand2,
  Crosshair,
} from "lucide-react";
import { CharacterModel } from "./CharacterModel";
import { CharacterPose } from "./CharacterPose";
import { lookName } from "./hero/looks";
import { CLASS_ACCENT } from "./hero/palette";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass, type Item } from "./data";
import {
  createCharacter,
  deleteCharacter,
  lastCharacterId,
  loadCharacters,
  selectCharacter,
  updateProfile,
  useGame,
  type CharacterRow,
  type Gender,
} from "./store";
import { Panel, fmt } from "./ui";
import { earnedTitles } from "./progress";

export function Portrait({
  cls,
  gender,
  className = "",
  chest,
  weapon,
}: {
  cls: HeroClass;
  gender: Gender;
  className?: string;
  chest?: Item | null;
  weapon?: Item | null;
}) {
  return (
    <CharacterModel cls={cls} gender={gender} chest={chest} weapon={weapon} className={className} />
  );
}

const DESC: Record<HeroClass, { style: string; text: string }> = {
  warrior: {
    style: "Melee · Tank",
    text: "Durable frontline fighter. Heavy physical blows, high armor and health.",
  },
  mage: {
    style: "Ranged · Spells",
    text: "Elemental spellcaster. Devastating magic damage, fragile defenses.",
  },
  archer: {
    style: "Ranged · Crits",
    text: "Agile marksman. High critical chance and dodge, precise arrows.",
  },
};

const CLASS_ORDER: HeroClass[] = ["warrior", "mage", "archer"];
const GENDERS: Gender[] = ["female", "male"];
const LOOK_NAMES = ["Iron", "Ember", "Moon", "Ancestral"];

const CLASS_ICON: Record<HeroClass, typeof Shield> = {
  warrior: Shield,
  mage: Wand2,
  archer: Crosshair,
};

/** The blood moon every selection screen is built on. */
function BloodMoonBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="blood-sky absolute inset-0" />
      <div className="blood-moon-glow absolute left-1/2 top-[-10vh] h-[95vh] w-[95vh] -translate-x-1/2 rounded-full" />
      <div className="blood-moon absolute left-1/2 top-[6vh] h-[52vh] w-[52vh] -translate-x-1/2 rounded-full" />
      <div className="blood-fog absolute inset-x-0 bottom-0 h-[46vh]" />
      <div className="vignette absolute inset-0" />
    </div>
  );
}

function ClassHeader({ cls }: { cls: HeroClass }) {
  const Icon = CLASS_ICON[cls];
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon
        className="h-5 w-5 shrink-0"
        style={{ color: CLASS_ACCENT[cls], filter: `drop-shadow(0 0 6px ${CLASS_ACCENT[cls]})` }}
      />
      <span className="font-display text-lg uppercase tracking-[0.18em] text-foreground/90">
        {CLASSES[cls].name}
      </span>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {DESC[cls].style}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(90deg, ${CLASS_ACCENT[cls]}66, transparent)` }}
      />
    </div>
  );
}

/** One ornate gothic portrait frame, with its glowing gems and an invisible hit area. */
function HeroFrame({
  cls,
  gender,
  look,
  selected,
  onPick,
  label,
}: {
  cls: HeroClass;
  gender: Gender;
  look: number;
  selected: boolean;
  onPick: () => void;
  label: string;
}) {
  return (
    <div className={`hero-frame ${selected ? "hero-frame-on" : ""}`}>
      <span className="hero-frame-gem hero-frame-gem-t" />
      <div className="hero-frame-art">
        <CharacterModel
          cls={cls}
          gender={gender}
          look={{ chest: look, weapon: look }}
          className="h-full w-full"
        />
      </div>
      <span className="hero-frame-name">{label}</span>
      <span className="hero-frame-gem hero-frame-gem-b" />
      <button
        type="button"
        className="hero-frame-hit"
        aria-label={`${label} ${CLASSES[cls].name}`}
        aria-pressed={selected}
        onClick={onPick}
      />
    </div>
  );
}

export function CharacterSelect() {
  const { chars, charsError, email } = useGame();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<CharacterRow | null>(null);

  const enter = async (id: string) => {
    setBusy(id);
    setErr(null);
    const e = await selectCharacter(id);
    if (e) setErr(e);
    setBusy(null);
  };

  const showCreate = creating || (chars !== null && chars.length === 0 && !charsError);
  const last = chars?.find((c) => c.id === lastCharacterId()) ?? chars?.[0];

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <BloodMoonBackdrop />
      <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-4 pb-10 pt-6">
        <div className="mb-2 flex w-full items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{email}</span>
          <button
            className="flex items-center gap-1 hover:text-gold"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <h1 className="select-title mb-1 text-center text-4xl font-black md:text-6xl">
          Select your hero
        </h1>
        <p className="mb-6 text-center font-display text-xs uppercase tracking-[0.4em] text-gold/70">
          EmberFall Online
        </p>

        {chars === null && (
          <div className="flex items-center gap-2 py-20 font-display text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your characters…
          </div>
        )}
        {charsError && (
          <div className="game-panel p-6 text-center">
            <p className="mb-3 text-hp">Couldn't load characters: {charsError}</p>
            <button className="btn-gold px-4 py-2" onClick={() => loadCharacters()}>
              <RefreshCw className="mr-1 inline h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {chars && !showCreate && (
          <>
            {last && (
              <button
                className="btn-gold mb-6 flex items-center gap-2 px-8 py-3 text-xl"
                disabled={!!busy}
                onClick={() => enter(last.id)}
              >
                {busy === last.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Continue as {last.name}
              </button>
            )}
            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
              {chars.map((c) => (
                <div key={c.id} className="flex flex-col">
                  <div className="hero-frame hero-frame-compact">
                    <span className="hero-frame-gem hero-frame-gem-t" />
                    <div className="hero-frame-art">
                      <CharacterPose
                        cls={c.hero_class}
                        gender={c.gender}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="hero-frame-gem hero-frame-gem-b" />
                  </div>
                  <div className="mt-2 truncate text-center font-display text-lg">{c.name}</div>
                  <div className="text-center text-xs text-muted-foreground">
                    {CLASSES[c.hero_class].name} · {c.gender}
                  </div>
                  <div className="text-center text-xs">
                    Lv {c.level}
                    {c.stats?.paragon ? ` · Asc ${c.stats.paragon}` : ""} · BR {fmt(c.power)}
                  </div>
                  <div className="text-center text-[10px] text-muted-foreground">
                    Last played {new Date(c.last_played).toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button
                      className="btn-gold flex-1 py-1.5 text-sm"
                      disabled={!!busy}
                      onClick={() => enter(c.id)}
                    >
                      {busy === c.id ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Play"
                      )}
                    </button>
                    <button
                      className="slot px-2"
                      aria-label="Delete"
                      onClick={() => setConfirmDel(c)}
                    >
                      <Trash2 className="h-4 w-4 text-hp" />
                    </button>
                  </div>
                </div>
              ))}
              {chars.length < 4 && (
                <button
                  className="hero-frame hero-frame-compact hero-frame-empty flex-col items-center justify-center gap-2"
                  onClick={() => setCreating(true)}
                >
                  <span className="hero-frame-gem hero-frame-gem-t" />
                  <Plus className="h-10 w-10 text-gold" />
                  <span className="font-display uppercase tracking-widest">New hero</span>
                  <span className="hero-frame-gem hero-frame-gem-b" />
                </button>
              )}
            </div>
          </>
        )}

        {showCreate && (
          <CreateCharacter
            canCancel={(chars?.length ?? 0) > 0}
            onCancel={() => setCreating(false)}
          />
        )}
        {err && <p className="mt-4 text-center text-hp">{err}</p>}
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="game-panel anim-pop w-full max-w-sm p-6 text-center">
            <h2 className="mb-2 font-display text-2xl">Delete {confirmDel.name}?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This permanently erases this character and all its progress.
            </p>
            <div className="flex gap-2">
              <button className="slot flex-1 py-2" onClick={() => setConfirmDel(null)}>
                Cancel
              </button>
              <button
                className="btn-blood flex-1 py-2"
                onClick={async () => {
                  const e = await deleteCharacter(confirmDel.id);
                  setConfirmDel(null);
                  if (e) setErr(e);
                }}
              >
                Delete forever
              </button>
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
  const [look, setLook] = useState(0);
  const [name, setName] = useState("");
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = /^[A-Za-z0-9 _-]{3,18}$/.test(name.trim());
  const accent = CLASS_ACCENT[cls];

  if (step === "confirm") {
    return (
      <div className="anim-pop flex w-full max-w-md flex-col items-center">
        <div className="hero-frame w-[240px]">
          <span className="hero-frame-gem hero-frame-gem-t" />
          <div className="hero-frame-art">
            <CharacterModel
              cls={cls}
              gender={gender}
              look={{ chest: look, weapon: look }}
              className="h-full w-full"
            />
          </div>
          <span className="hero-frame-gem hero-frame-gem-b" />
        </div>
        <div className="mt-4 font-display text-3xl">{name.trim()}</div>
        <div className="text-muted-foreground">
          {gender === "male" ? "Male" : "Female"} {CLASSES[cls].name}
        </div>
        <p className="mt-2 text-center text-sm">{DESC[cls].text}</p>
        {err && <p className="mt-3 text-hp">{err}</p>}
        <div className="mt-5 flex w-full gap-2">
          <button className="slot flex-1 py-2" onClick={() => setStep("pick")}>
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Back
          </button>
          <button
            className="btn-gold flex-1 py-2"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              const e = await createCharacter(name.trim(), cls, gender);
              if (e) setErr(e);
              setBusy(false);
            }}
          >
            {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Enter the castle"}
          </button>
        </div>
        {canCancel && (
          <button className="mt-3 text-sm text-muted-foreground hover:text-gold" onClick={onCancel}>
            Back to my characters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-4 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <span className="font-display text-sm uppercase tracking-[0.2em]" style={{ color: accent }}>
          {CLASSES[cls].name}
        </span>
        <span className="text-xs text-muted-foreground">{DESC[cls].text}</span>
      </div>

      <div className="w-full max-w-3xl space-y-5">
        {CLASS_ORDER.map((c) => (
          <section key={c} aria-label={CLASSES[c].name}>
            <ClassHeader cls={c} />
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {GENDERS.map((g) => (
                <HeroFrame
                  key={g}
                  cls={c}
                  gender={g}
                  look={look}
                  label={g === "female" ? "Female" : "Male"}
                  selected={cls === c && gender === g}
                  onPick={() => {
                    setCls(c);
                    setGender(g);
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex w-full max-w-3xl flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Shield className="h-3 w-3" style={{ color: accent }} />
          {lookName(cls, "chest", look)}
          <span className="opacity-40">·</span>
          <Crosshair className="h-3 w-3" style={{ color: accent }} />
          {lookName(cls, "weapon", look)}
        </div>
        <div className="flex gap-1">
          {LOOK_NAMES.map((n, i) => (
            <button
              key={n}
              onClick={() => setLook(i)}
              aria-pressed={look === i}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest ${look === i ? "btn-gold" : "slot"}`}
              title={lookName(cls, "chest", i)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 18))}
          placeholder="Hero name (3–18)"
          className="slot flex-1 px-4 py-3 font-display text-lg outline-none"
        />
        <button
          className="btn-gold px-6 text-lg uppercase tracking-wider"
          disabled={!valid}
          onClick={() => setStep("confirm")}
        >
          Next
        </button>
      </div>
      {name && !valid && (
        <p className="mt-2 text-xs text-hp">Use 3–18 letters, numbers, spaces, - or _</p>
      )}
      {canCancel && (
        <button className="mt-3 text-sm text-muted-foreground hover:text-gold" onClick={onCancel}>
          Back to my characters
        </button>
      )}
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
export const frameClass = (f: string) =>
  ({
    iron: "rarity-0",
    bronze: "rarity-1",
    silver: "rarity-2",
    gold: "rarity-4",
    ember: "rarity-5",
  })[f] ?? "rarity-0";

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
        <div className={`slot w-40 shrink-0 self-center p-1 ${frameClass(frame)}`}>
          <Portrait
            cls={hero.cls}
            gender={gender}
            chest={hero.equipment.armour}
            weapon={hero.equipment.weapon}
            className="w-full"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="font-display text-2xl">{hero.name}</div>
            {title && <div className="text-gold">{title}</div>}
          </div>
          <label className="block text-sm">
            Biography
            <textarea
              className="slot mt-1 w-full p-2 outline-none"
              maxLength={200}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <div className="text-sm">
            Title
            <div className="mt-1 flex flex-wrap gap-1">
              {[...TITLES, ...earnedTitles(hero).map((n) => ({ id: n, name: n, minLevel: 1 }))].map(
                (t) => (
                  <button
                    key={t.id}
                    disabled={lvl < t.minLevel}
                    className={`px-2 py-1 text-xs ${title === t.id ? "btn-gold" : "slot"} disabled:opacity-40`}
                    title={lvl < t.minLevel ? `Unlocks at level ${t.minLevel}` : ""}
                    onClick={() => setTitle(t.id)}
                  >
                    {t.name}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="text-sm">
            Frame
            <div className="mt-1 flex flex-wrap gap-1">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  disabled={lvl < f.minLevel}
                  className={`px-2 py-1 text-xs ${frame === f.id ? "btn-gold" : "slot"} disabled:opacity-40`}
                  title={lvl < f.minLevel ? `Unlocks at level ${f.minLevel}` : ""}
                  onClick={() => setFrame(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
            Public profile (visible in arena & rankings)
          </label>
          <button
            className="btn-gold px-6 py-2"
            onClick={async () => {
              const e = await updateProfile({ bio: bio.trim(), title, frame, is_public: pub });
              setMsg(e ?? "Profile saved");
            }}
          >
            Save profile
          </button>
          {msg && <span className="ml-3 text-sm text-gold">{msg}</span>}
        </div>
      </div>
    </Panel>
  );
}

import { useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { tr } from "./i18n";
import { HeroPortrait } from "./HeroPortrait";
import { heroAppearance } from "./appearance";
import { update, useGame } from "./store";
import {
  BEARD_STYLES,
  BROW_SHAPES,
  DEFAULT_FACE,
  EYE_COLORS,
  EYE_SHAPES,
  FACE_MARKS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  faceSummary,
  normalizeFace,
  type HeroFace,
} from "./customization";

/**
 * The face workshop on the profile's Appearance tab.
 *
 * Every option here is cosmetic: the chosen face is drawn over the hero's card and portrait and
 * is never read by the stat pipeline. Leaving it untouched keeps the original painted model.
 */
export function FaceCustomizer() {
  const { hero, gender } = useGame();
  const [draft, setDraft] = useState<HeroFace | null>(() => (hero?.face ? normalizeFace(hero.face) : null));
  const [saved, setSaved] = useState(false);
  if (!hero) return null;
  const look = heroAppearance(hero, gender);
  const set = <K extends keyof HeroFace>(key: K, value: HeroFace[K]) =>
    setDraft((d) => ({ ...(d ?? DEFAULT_FACE), [key]: value }));

  const save = () => {
    update((h) => { h.face = draft ?? undefined; });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const reset = () => {
    setDraft(null);
    update((h) => { delete h.face; });
  };

  return (
    <div className="slot p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-display text-gold"><Sparkles className="h-3.5 w-3.5" />{tr("Face")}</span>
        <span className="text-[11px] text-muted-foreground">{faceSummary(draft)}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {tr("Choose the hero's face — skin, hair, eyes, brows and marks. It is cosmetic only: your class model, gear and stats stay exactly as they are.")}
      </p>

      <div className="mt-2 flex flex-wrap items-start gap-3">
        <div className="w-28 shrink-0 overflow-hidden rounded border border-border/70 bg-background/60">
          <HeroPortrait cls={hero.cls} gender={gender} face={draft} synth={look.synth} look={look.look} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {draft === null ? (
              <button className="btn-gold px-3 py-1.5 text-sm" onClick={() => setDraft({ ...DEFAULT_FACE })}>{tr("Customize face")}</button>
            ) : (
              <>
                <button className="btn-gold flex items-center gap-1 px-3 py-1.5 text-sm" onClick={save}>
                  <Check className="h-4 w-4" />{saved ? tr("Saved") : tr("Save face")}
                </button>
                <button className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />{tr("Use original portrait")}
                </button>
              </>
            )}
          </div>
          {draft === null && (
            <p className="text-[11px] text-muted-foreground">
              {tr("You are wearing the original portrait. Customize it whenever you like — nothing about your character changes but the look.")}
            </p>
          )}
        </div>
      </div>

      {draft && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Row label={tr("Skin")}>
            {SKIN_TONES.map((s, i) => (
              <Swatch key={s.id} active={draft.skin === i} color={s.color} label={s.name} onClick={() => set("skin", i)} />
            ))}
          </Row>
          <Row label={tr("Hair style")}>
            {HAIR_STYLES.map((h, i) => (
              <Choice key={h.id} active={draft.hair === i} label={h.name} onClick={() => set("hair", i)} />
            ))}
          </Row>
          <Row label={tr("Hair colour")}>
            {HAIR_COLORS.map((c, i) => (
              <Swatch key={c.id} active={draft.hairColor === i} color={c.color} label={c.name} onClick={() => set("hairColor", i)} />
            ))}
          </Row>
          <Row label={tr("Eyes")}>
            {EYE_SHAPES.map((e, i) => (
              <Choice key={e.id} active={draft.eyeShape === i} label={e.name} onClick={() => set("eyeShape", i)} />
            ))}
          </Row>
          <Row label={tr("Eye colour")}>
            {EYE_COLORS.map((c, i) => (
              <Swatch key={c.id} active={draft.eyes === i} color={c.color} label={c.name} onClick={() => set("eyes", i)} />
            ))}
          </Row>
          <Row label={tr("Brows")}>
            {BROW_SHAPES.map((b, i) => (
              <Choice key={b.id} active={draft.brows === i} label={b.name} onClick={() => set("brows", i)} />
            ))}
          </Row>
          <Row label={tr("Facial hair")}>
            {BEARD_STYLES.map((b, i) => (
              <Choice key={b.id} active={draft.beard === i} label={b.name} onClick={() => set("beard", i)} />
            ))}
          </Row>
          <Row label={tr("Mark")}>
            {FACE_MARKS.map((m, i) => (
              <Choice key={m.id} active={draft.mark === i} label={m.name} onClick={() => set("mark", i)} />
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`rounded px-2 py-0.5 text-[11px] ${active ? "btn-gold" : "slot text-muted-foreground hover:text-foreground"}`}>
      {label}
    </button>
  );
}

function Swatch({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} aria-label={label} title={label} onClick={onClick}
      className={`h-6 w-6 rounded-full border-2 ${active ? "border-gold" : "border-border/70"}`}
      style={{ backgroundColor: color }} />
  );
}

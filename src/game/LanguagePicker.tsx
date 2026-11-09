import { LANGUAGES, setLang, useLang, useT } from "./i18n";

/**
 * The manual language switch: English, Ελληνικά or Polski.
 *
 * It sits on the sign-in gate, the hero picker and the settings panel, so a player can
 * change language before entering the castle or at any time. The choice is remembered
 * on this device (see i18n.ts).
 */
export function LanguagePicker({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("Choose your language")}
      className={`flex items-center gap-1 ${className}`}
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className={`slot px-2 py-1 text-[11px] font-bold transition ${
            lang === l.id ? "ring-2 ring-gold text-gold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

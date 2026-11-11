import { ShieldAlert } from "lucide-react";
import { acknowledgeCheatWarning, useCheatWarnings } from "./anticheat";
import { useT } from "./i18n";

/** Shown after the server removed a character for an impossible save (see 0043_anticheat.sql). */
export function AnticheatNotice() {
  const t = useT();
  const warnings = useCheatWarnings();
  const w = warnings[0];
  if (!w) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-4"
      role="alertdialog"
      aria-labelledby="ac-title"
    >
      <div className="game-panel anim-pop w-full max-w-md p-6 text-center">
        <ShieldAlert className="mx-auto mb-2 h-10 w-10 text-hp" />
        <h2 id="ac-title" className="mb-2 font-display text-2xl text-hp">
          {t("Cheating detected")}
        </h2>
        <p className="mb-3 text-sm">
          {t(
            "{name} was removed because the game received a save that is not possible in normal play.",
            { name: w.hero_name },
          )}
        </p>
        <p className="slot mb-3 px-3 py-2 text-xs text-muted-foreground">{w.reason}</p>
        <p className="mb-4 text-xs text-muted-foreground">
          {t(
            "The last clean save of this character was kept. If you believe this was a mistake, contact the game team and it can be restored.",
          )}
        </p>
        <button className="btn-gold w-full py-2" onClick={() => void acknowledgeCheatWarning(w.id)}>
          {t("I understand")}
        </button>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Panel } from "./ui";
import { useT } from "./i18n";
import {
  acknowledgeCheatNotices,
  blockedKinds,
  refreshAntiCheatNotices,
  useCheatNotices,
} from "./anticheat";

/** English source phrases (and their Greek/Polish rows in i18n.ts) for each blocked value. */
const BLOCKED_LABEL: Record<string, string> = {
  battle_rating: "battle rating",
  power: "battle rating",
  gold: "gold",
  level: "level",
  arena_rating: "arena rating",
  server_owned: "server-owned rewards",
};

/**
 * The anti-cheat's only screen: the warning a blocked save earns, and the notice that a character
 * was removed. The server decides both (see drizzle/migrations/0043_anti_cheat.sql); this panel
 * just says what happened and marks the notice as read.
 */
export function SecurityNotice() {
  const t = useT();
  const notices = useCheatNotices();

  // Notices are per account, so they are read once here rather than on every save.
  useEffect(() => {
    void refreshAntiCheatNotices();
  }, []);

  if (!notices.length) return null;
  const removal = notices.find((n) => n.kind === "removed");
  const kinds = [...new Set(notices.flatMap((n) => blockedKinds(n.detail)))]
    .map((k) => BLOCKED_LABEL[k] ?? k)
    .filter((label, i, all) => all.indexOf(label) === i);

  const close = () => void acknowledgeCheatNotices(notices.map((n) => n.id));

  return (
    <Panel
      title={removal ? t("Character deleted") : t("Anti-cheat warning")}
      subtitle={removal ? t("A backup of the character is kept") : t("Your save was blocked")}
      art="shield"
      onClose={close}
    >
      {removal ? (
        <div className="space-y-3 text-sm">
          <p className="text-gold">
            {t("Your character {name} was deleted after repeated blocked saves.", {
              name: removal.hero,
            })}
          </p>
          <p className="text-muted-foreground">
            {t(
              "A full copy is kept on the server, so support can restore the character if this was a mistake. Contact them with your account email.",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-gold">
            {t(
              "A save from this account carried a value the game cannot produce. It was rolled back, so nothing was gained.",
            )}
          </p>
          {kinds.length > 0 && (
            <p className="text-muted-foreground">
              {t("Blocked: {list}", { list: kinds.map((k) => t(k)).join(", ") })}
            </p>
          )}
          <p className="text-muted-foreground">
            {t("If it happens again the character is deleted.")}
          </p>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button className="btn-blood px-4 py-2" onClick={close}>
          {t("I understand")}
        </button>
      </div>
    </Panel>
  );
}

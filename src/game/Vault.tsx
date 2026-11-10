import { t } from "./i18n";
import { useState } from "react";
import { GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { CHESTS, chestCount, openChest, ownedChests, type ChestKind } from "./chests";
import { GEMS, GEM_STAT_LABEL, GEM_TIER_NAMES, gemName, gemValue, parseGem } from "./crafting";
import { GemIcon } from "./MatIcon";
import { update, useGame } from "./store";

export type VaultPick = { type: "chest"; kind: ChestKind } | { type: "gem"; key: string };

/**
 * The Armory vault: chests and gems are items in their own slots. A chest is
 * redeemed here (opening it pays its gold, materials or gems); gem stacks stay
 * here until they are socketed, fused or sold at the Gem Workshop.
 */
/** Chest and gem stacks as square bag tiles, so they sit in the bag grid beside gear and materials. */
export function vaultTiles(hero: { gems?: Record<string, number>; chests?: Partial<Record<ChestKind, number>> }, pick: VaultPick | null, onPick: (p: VaultPick) => void) {
  const chests = ownedChests(hero).filter((c) => c.count > 0).map((c) => (
    <button key={"chest-" + c.id} className={`slot bag-mat ${pick?.type === "chest" && pick.kind === c.id ? "ring-2 ring-gold" : ""}`} style={{ width: 44, height: 44 }}
      onClick={() => onPick({ type: "chest", kind: c.id })} aria-label={`${c.name}, ${c.count}`} title={c.name}>
      {c.id === "gold" ? <GoldChestIcon size={34} /> : <GemChestIcon size={34} />}<span className="bag-mat-count">{c.count}</span>
    </button>
  ));
  const gems = Object.entries(hero.gems ?? {}).filter(([, n]) => n > 0).sort(([a], [b]) => a.localeCompare(b)).map(([key, n]) => {
    const g = parseGem(key);
    return (
      <button key={"gem-" + key} className={`slot bag-mat ${pick?.type === "gem" && pick.key === key ? "ring-2 ring-gold" : ""}`} style={{ width: 44, height: 44 }}
        onClick={() => onPick({ type: "gem", key })} aria-label={`${gemName(key)}, ${n}`} title={gemName(key)}>
        {g && <GemIcon type={g.type} size={30} />}<span className="bag-mat-count">{n}</span>
      </button>
    );
  });
  return [...chests, ...gems];
}

/** Details for the chest or gem picked in the bag grid: chests open here, gems go to the Gem Workshop. */
export function Vault({ pick, setPick }: { pick: VaultPick | null; setPick: (p: VaultPick | null) => void }) {
  const { hero } = useGame();
  const [msg, setMsg] = useState("");
  if (!hero) return null;

  const gemPick = pick?.type === "gem" ? parseGem(pick.key) : null;
  const chestPick = pick?.type === "chest" ? CHESTS[pick.kind] : null;

  const open = (kind: ChestKind) => {
    if (chestCount(hero, kind) < 1) return;
    let lines: string[] = [];
    update((h) => {
      lines = openChest(h, kind);
    });
    setMsg(`Opened ${CHESTS[kind].name}: ${lines.join(" · ")}`);
  };

  return (
    <section className="mt-2" aria-label={t("Vault")}>
      {chestPick && (
        <div className="slot mt-2 flex flex-wrap items-center gap-3 p-2.5" role="status">
          {chestPick.id === "gold" ? <GoldChestIcon size={40} /> : <GemChestIcon size={40} />}
          <div className="min-w-0 flex-1">
            <div className="font-display text-gold">{chestPick.name}</div>
            <p className="text-xs text-muted-foreground">{chestPick.desc}</p>
          </div>
          <button
            className="btn-gold px-4 py-1.5 text-sm"
            disabled={chestCount(hero, chestPick.id) < 1}
            onClick={() => open(chestPick.id)}
          >
             {t("Open (")}{chestCount(hero, chestPick.id)})
          </button>
        </div>
      )}

      {gemPick && pick?.type === "gem" && (
        <div className="slot mt-2 flex flex-wrap items-center gap-3 p-2.5" role="status">
          <GemIcon type={gemPick.type} size={36} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-gold">
              {gemName(pick.key)} ×{hero.gems?.[pick.key] ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{gemValue(pick.key)} {GEM_STAT_LABEL[GEMS[gemPick.type].stat]} ·{" "}
              {GEM_TIER_NAMES[gemPick.tier - 1]}  {t("tier · best on")} {GEMS[gemPick.type].classes}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
             {t("Socket or fuse it at the Gem Workshop")} </span>
        </div>
      )}

      {msg && (
        <p role="status" className="anim-pop mt-2 break-words text-sm text-r1">
          {msg}
        </p>
      )}
    </section>
  );
}

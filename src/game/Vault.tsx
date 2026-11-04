import { useState } from "react";
import { GemChestIcon, GoldChestIcon } from "./CoinIcon";
import { CHESTS, chestCount, openChest, ownedChests, type ChestKind } from "./chests";
import { GEMS, GEM_STAT_LABEL, GEM_TIER_NAMES, gemName, gemValue, parseGem } from "./crafting";
import { GemIcon } from "./MatIcon";
import { update, useGame } from "./store";

type VaultPick = { type: "chest"; kind: ChestKind } | { type: "gem"; key: string };

/**
 * The Armory vault: chests and gems are items in their own slots. A chest is
 * redeemed here (opening it pays its gold, materials or gems); gem stacks stay
 * here until they are socketed, fused or sold at the Gem Workshop.
 */
export function Vault() {
  const { hero } = useGame();
  const [pick, setPick] = useState<VaultPick | null>(null);
  const [msg, setMsg] = useState("");
  if (!hero) return null;

  const chests = ownedChests(hero);
  const gems = Object.entries(hero.gems ?? {})
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => a.localeCompare(b));
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
    <section className="mt-4" aria-label="Vault">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1">
        <span className="font-display text-sm text-gold">Vault · items</span>
        <span className="text-[10px] text-muted-foreground">
          Chests open here · gems are socketed at the Gem Workshop
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {chests.map((c) => (
          <button
            key={c.id}
            className={`slot flex items-center gap-2 p-1.5 text-left ${c.count ? "" : "opacity-50"} ${pick?.type === "chest" && pick.kind === c.id ? "ring-2 ring-gold" : ""}`}
            onClick={() => {
              setPick({ type: "chest", kind: c.id });
              setMsg("");
            }}
            aria-label={`${c.name}, ${c.count} in vault`}
          >
            {c.id === "gold" ? <GoldChestIcon size={34} /> : <GemChestIcon size={34} />}
            <div className="min-w-0">
              <div className="truncate text-[11px] font-bold">{c.name}</div>
              <div className="text-[10px] text-muted-foreground">×{c.count} in vault</div>
            </div>
          </button>
        ))}
        {gems.map(([key, n]) => {
          const g = parseGem(key);
          return (
            <button
              key={key}
              className={`slot flex items-center gap-2 p-1.5 text-left ${pick?.type === "gem" && pick.key === key ? "ring-2 ring-gold" : ""}`}
              onClick={() => {
                setPick({ type: "gem", key });
                setMsg("");
              }}
              aria-label={`${gemName(key)}, ${n} in vault`}
            >
              {g && <GemIcon type={g.type} size={30} />}
              <div className="min-w-0">
                <div className="truncate text-[11px] font-bold">{gemName(key)}</div>
                <div className="text-[10px] text-muted-foreground">×{n} in vault</div>
              </div>
            </button>
          );
        })}
      </div>

      {chests.every((c) => c.count === 0) && gems.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          No items yet. The reward board, the Conquest Gate and the four-hourly reward chest fill
          this vault.
        </p>
      )}

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
            Open ({chestCount(hero, chestPick.id)})
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
              {GEM_TIER_NAMES[gemPick.tier - 1]} tier · best on {GEMS[gemPick.type].classes}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Socket or fuse it at the Gem Workshop
          </span>
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

// ============= Cloud City screens =============
// The three buildings that do something (the Ascension Nexus, the Mission Board and the
// Sky Vault) and the citizen dialogue. Everything is paid for in Aether Shards, the
// currency only Cloud City hands out, so the region has its own economy.

import { useState, type ReactNode } from "react";
import { X, Sparkles, ScrollText, Check, Coins, Flame, ArrowRight } from "lucide-react";
import { Gold, fmt } from "./ui";
import { update, useGame } from "./store";
import {
  ASCENSIONS,
  ASC_STAT_LABEL,
  ascBlocker,
  ascCost,
  ascRank,
  ascText,
  buyAscension,
  ascTotal,
  CLOUD_MISSIONS,
  missionRows,
  missionsOf,
  claimMission,
  shards,
  blessingGold,
  blessingShards,
  claimBlessing,
  buyShards,
  shardPrice,
  npcById,
  type CityNpc,
} from "./cloudcity";

/** The shard mark used everywhere the sky currency is shown. */
export function Shard({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`cc-shard ${className}`} title="Aether Shards">
      <span aria-hidden="true">◆</span> {fmt(n)}
    </span>
  );
}

export function CloudCard({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="cc-overlay" onClick={onClose}>
      <div
        className={`cc-card anim-pop ${wide ? "cc-card-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <header className="cc-card-head">
          <div className="min-w-0">
            <h2 className="cc-title truncate">{title}</h2>
            {subtitle && <p className="cc-sub">{subtitle}</p>}
          </div>
          <button className="cc-close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="cc-card-body">{children}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Ascension Nexus
export function NexusPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [note, setNote] = useState<string | null>(null);
  if (!hero) return null;
  const balance = shards(hero);
  const ranks = ascTotal(hero.cloud);

  const buy = (id: string) => {
    update((h) => {
      const before = shards(h);
      const err = buyAscension(h, id);
      setNote(err ?? `Aether rank bound — ${before - shards(h)} shards spent.`);
    });
  };

  return (
    <CloudCard
      title="Ascension Nexus"
      subtitle={
        <>
          Aether Shards <Shard n={balance} /> · {ranks} ranks bound · ranks are permanent and feed
          every battle
        </>
      }
      onClose={onClose}
      wide
    >
      {note && (
        <p className="cc-note" aria-live="polite">
          {note}
        </p>
      )}
      <div className="cc-grid">
        {ASCENSIONS.map((a) => {
          const rank = ascRank(hero, a.id);
          const cost = ascCost(a, rank);
          const blocked = ascBlocker(hero, a.id);
          const maxed = rank >= a.max;
          return (
            <div key={a.id} className={"cc-tile " + (maxed ? "cc-tile-done" : "")}>
              <div className="cc-tile-head">
                <span className="cc-tile-name">
                  <Flame className="h-4 w-4" />
                  {a.name}
                </span>
                <span className="cc-tile-rank">
                  {rank}/{a.max}
                </span>
              </div>
              <p className="cc-tile-desc">{a.desc}</p>
              <div className="cc-pips">
                {Array.from({ length: Math.min(a.max, 10) }).map((_, i) => (
                  <i key={i} className={i < Math.ceil((rank / a.max) * 10) ? "on" : ""} />
                ))}
              </div>
              <div className="cc-tile-foot">
                <span>
                  Now <b>{rank ? ascText(a, rank) : "—"}</b>
                </span>
                <span className="cc-next">
                  +{a.per}% {ASC_STAT_LABEL[a.stat]}
                </span>
              </div>
              <button
                className="cc-btn w-full"
                disabled={!!blocked}
                title={blocked ?? "Bind a rank"}
                onClick={() => buy(a.id)}
              >
                {maxed ? (
                  <>
                    <Check className="h-4 w-4" /> Fully ascended
                  </>
                ) : (
                  <>
                    Bind rank · <Shard n={cost} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <p className="cc-hint">
        Shards come from the daily commissions, the Sky Vault blessing and the citizens you greet.
      </p>
    </CloudCard>
  );
}

// ------------------------------------------------------------ Mission board
export function MissionsPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [note, setNote] = useState<string | null>(null);
  if (!hero) return null;
  const rows = missionRows(hero);
  const done = rows.filter((r) => r.claimed).length;

  const claim = (id: string) => {
    update((h) => {
      const got = claimMission(h, id);
      setNote(
        got
          ? `Claimed: ${got.shards} Aether Shards, ${fmt(got.gold)} gold, ${fmt(got.xp)} XP.`
          : null,
      );
    });
  };

  return (
    <CloudCard
      title="Mission Board"
      subtitle={
        <>
          {done}/{rows.length} commissions claimed today · the board is rewritten at Greek midnight
        </>
      }
      onClose={onClose}
      wide
    >
      {note && (
        <p className="cc-note" aria-live="polite">
          {note}
        </p>
      )}
      <div className="cc-grid">
        {rows.map(({ mission, progress, claimed, done: complete }) => (
          <div
            key={mission.id}
            className={"cc-tile " + (claimed ? "cc-tile-done" : complete ? "cc-tile-ready" : "")}
          >
            <div className="cc-tile-head">
              <span className="cc-tile-name">
                <ScrollText className="h-4 w-4" />
                {mission.name}
              </span>
              <span className="cc-tile-rank">
                {progress}/{mission.target}
              </span>
            </div>
            <p className="cc-tile-desc">{mission.desc}</p>
            <p className="cc-giver">Given by {npcById(mission.giver)?.name ?? "the city"}</p>
            <div className="cc-bar">
              <i style={{ width: `${Math.round((progress / mission.target) * 100)}%` }} />
            </div>
            <div className="cc-tile-foot">
              <Shard n={mission.shards} />
              <span className="cc-next">
                <Gold n={mission.gold} className="text-xs" /> · {fmt(mission.xp)} XP
              </span>
            </div>
            <button
              className="cc-btn w-full"
              disabled={claimed || !complete}
              onClick={() => claim(mission.id)}
            >
              {claimed ? (
                <>
                  <Check className="h-4 w-4" /> Claimed
                </>
              ) : complete ? (
                "Claim reward"
              ) : (
                "In progress"
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="cc-hint">
        Speak to the citizen named on a commission and they will stamp it for you.
      </p>
    </CloudCard>
  );
}

// ------------------------------------------------------------ Sky Vault
export function VaultPanel({ onClose }: { onClose: () => void }) {
  const { hero } = useGame();
  const [note, setNote] = useState<string | null>(null);
  if (!hero) return null;
  const blessed = !!hero.cloud?.blessed;
  const price = shardPrice(hero);

  const bless = () => {
    update((h) => {
      const got = claimBlessing(h);
      setNote(
        got
          ? `The Vault's blessing: ${fmt(got.gold)} gold and ${got.shards} shards.`
          : "The blessing has already been given today.",
      );
    });
  };
  const exchange = (count: number) => {
    update((h) => {
      const err = buyShards(h, count);
      setNote(
        err ??
          `Bought ${count} Aether Shard${count > 1 ? "s" : ""} for ${fmt(price * count)} gold.`,
      );
    });
  };

  return (
    <CloudCard
      title="Sky Vault"
      subtitle={
        <>
          Balance <Shard n={shards(hero)} />
        </>
      }
      onClose={onClose}
    >
      <div className="cc-vault">
        <div className="cc-tile">
          <div className="cc-tile-head">
            <span className="cc-tile-name">
              <Sparkles className="h-4 w-4" />
              Daily blessing
            </span>
          </div>
          <p className="cc-tile-desc">
            The Vault gives freely once a day: {fmt(blessingGold(hero))} gold and{" "}
            {blessingShards(hero)} Aether Shards, weighed against your level.
          </p>
          <button className="cc-btn w-full" disabled={blessed} onClick={bless}>
            {blessed ? (
              <>
                <Check className="h-4 w-4" /> Taken today
              </>
            ) : (
              "Take the blessing"
            )}
          </button>
        </div>
        <div className="cc-tile">
          <div className="cc-tile-head">
            <span className="cc-tile-name">
              <Coins className="h-4 w-4" />
              Gold for shards
            </span>
          </div>
          <p className="cc-tile-desc">
            One shard costs {fmt(price)} gold. The Vault does not haggle, and it does not run dry.
          </p>
          <div className="cc-row">
            {[1, 5, 15].map((n) => (
              <button
                key={n}
                className="cc-btn cc-btn-quiet"
                disabled={hero.gold < price * n}
                onClick={() => exchange(n)}
              >
                {n} · {fmt(price * n)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {note && (
        <p className="cc-note" aria-live="polite">
          {note}
        </p>
      )}
      <p className="cc-hint">
        Shards buy Ascension ranks in the Nexus, and nothing else in Ember Fall can buy them.
      </p>
    </CloudCard>
  );
}

// ------------------------------------------------------------ citizen dialogue
export function CitizenDialog({ npc, onClose }: { npc: CityNpc; onClose: () => void }) {
  const { hero } = useGame();
  const [page, setPage] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  if (!hero) return null;
  const lines = npc.lines;
  const last = page >= lines.length - 1;
  const missions = missionsOf(npc.id)
    .map((m) => missionRows(hero).find((r) => r.mission.id === m.id))
    .filter((r): r is NonNullable<typeof r> => !!r);

  const claim = (id: string) => {
    update((h) => {
      const got = claimMission(h, id);
      setNote(got ? `Commission stamped: +${got.shards} Aether Shards.` : null);
    });
  };

  return (
    <div className="cc-dialog-wrap" onClick={onClose}>
      <div
        className="cc-dialog anim-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${npc.name}, ${npc.role}`}
      >
        <div className="cc-dialog-face">
          <div
            className="cc-dialog-portrait"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${npc.color}55, #ffffff 72%)`,
            }}
          >
            <span className="cc-dialog-glyph" style={{ color: npc.color }}>
              {npc.name.slice(0, 1)}
            </span>
          </div>
          <div>
            <div className="cc-dialog-name">{npc.name}</div>
            <div className="cc-dialog-role">{npc.role}</div>
          </div>
        </div>
        <p className="cc-dialog-line">{lines[Math.min(page, lines.length - 1)]}</p>
        {note && (
          <p className="cc-note" aria-live="polite">
            {note}
          </p>
        )}
        {last && missions.length > 0 && (
          <div className="cc-dialog-mission">
            {missions.map(({ mission, progress, claimed, done }) => (
              <div key={mission.id} className="cc-mission-row">
                <div className="min-w-0">
                  <div className="cc-mission-name">{mission.name}</div>
                  <div className="cc-mission-desc">
                    {mission.desc} · {progress}/{mission.target}
                  </div>
                </div>
                <button
                  className="cc-btn cc-btn-sm"
                  disabled={claimed || !done}
                  onClick={() => claim(mission.id)}
                >
                  {claimed ? (
                    "Claimed"
                  ) : done ? (
                    <>
                      Claim <Shard n={mission.shards} />
                    </>
                  ) : (
                    "In progress"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="cc-dialog-actions">
          <button className="cc-btn cc-btn-quiet" onClick={onClose}>
            Leave
          </button>
          {last ? (
            <button className="cc-btn" onClick={onClose}>
              Done
            </button>
          ) : (
            <button className="cc-btn" onClick={() => setPage((p) => p + 1)}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small summary strip the region shows under its title. */
export function CityProgress() {
  const { hero } = useGame();
  if (!hero) return null;
  const rows = missionRows(hero);
  const ready = rows.filter((r) => r.done && !r.claimed).length;
  return (
    <span className="cc-progress">
      <Shard n={shards(hero)} />
      <span className="cc-progress-sep">·</span>
      <span>
        {rows.filter((r) => r.claimed).length}/{CLOUD_MISSIONS.length} commissions
      </span>
      {ready > 0 && <span className="cc-ready">{ready} ready</span>}
    </span>
  );
}

/** Scenery buildings: a small card describing the place. */
export function PlaceCard({
  name,
  desc,
  onClose,
}: {
  name: string;
  desc: string;
  onClose: () => void;
}) {
  return (
    <CloudCard title={name} onClose={onClose}>
      <p className="cc-place">{desc}</p>
    </CloudCard>
  );
}

import { t, tName } from "./i18n";
import { useState } from "react";
import { Crown, Gem, Sparkles } from "lucide-react";
import { Swords } from "./PaintedIcons";
import { Panel, fmt, GameTabs } from "./ui";
import { Sprite } from "./Sprite";
import { scrollXp } from "./scrolls";
import { addMats, MATS, type Mat } from "./crafting";
import { update, useGame } from "./store";
import type { StartBattle } from "./panels";
import type { ReactNode } from "react";
import { SpireGate as SpireGateLazy } from "./SpireGate";
import {
  RIFT_ROOMS, riftFoe, riftGold, riftKeeperMats, riftRooms, riftTreasure, todaysWardens, ventureOf,
  wardenFoe, wardenGold, wardenXp, type RoomKind,
} from "./spire-ventures";

const matLines = (m: Partial<Record<Mat, number>>) => Object.entries(m).map(([k, n]) => `+${n} ${MATS[k as Mat].name}`);
const ROOM_LABEL: Record<RoomKind, string> = { ambush: "Ambush", treasure: "Treasure vault", shrine: "Shrine", keeper: "Rift Keeper" };

/** The Spire's solo ventures: daily Warden Hunts and a five-room Rift Path. */
export function SpireVentures({ onClose, start, header }: { onClose: () => void; start: StartBattle; header: ReactNode }) {
  const { hero } = useGame();
  const [tab, setTab] = useState<"wardens" | "rift">("wardens");
  if (!hero) return null;
  const lvl = hero.level + hero.paragon;
  const v = ventureOf(hero.spireVentures);
  const wardens = todaysWardens();
  const rooms = riftRooms();
  const might = v.shrine === "might";
  const fortune = v.shrine === "fortune";

  const save = (fn: (s: typeof v) => void) => update((h) => { const s = ventureOf(h.spireVentures); fn(s); h.spireVentures = { ...s }; });

  const huntWarden = (i: number) => {
    const w = wardens[i];
    const foe = wardenFoe(w, lvl);
    start({
      title: `Warden Hunt · ${w.name}`,
      right: foe,
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) return { lines: ["The warden holds the stair. Try again."] };
        const { grant } = await import("./logic");
        let lines: string[] = [];
        update((h) => {
          const s = ventureOf(h.spireVentures);
          if (s.wardens.includes(w.id)) return;
          const xp = scrollXp(wardenXp(lvl), xpMultiplier);
          const { levels } = grant(h, xp, wardenGold(lvl));
          addMats(h, w.mats);
          h.spireVentures = { ...s, wardens: [...s.wardens, w.id] };
          lines = [`+${fmt(xp)} XP`, `+${fmt(wardenGold(lvl))} gold`, ...matLines(w.mats), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        return { lines };
      },
    });
  };

  const enterRoom = () => {
    const room = v.room;
    const kind = rooms[room];
    if (!kind || v.failed) return;
    if (kind === "treasure") {
      update((h) => {
        const s = ventureOf(h.spireVentures);
        if (s.room !== room) return;
        h.gold += riftGold(lvl, room, kind, s.shrine === "fortune");
        addMats(h, riftTreasure);
        h.spireVentures = { ...s, room: room + 1 };
      });
      return;
    }
    if (kind === "shrine") return;
    const base = riftFoe(kind, room, lvl);
    const foe = might ? { ...base, hp: Math.round(base.hp * 0.85), atk: Math.round(base.atk * 0.85) } : base;
    start({
      title: `Rift Path · ${ROOM_LABEL[kind]} · ${room + 1}/${RIFT_ROOMS}`,
      right: foe,
      dungeon: true,
      onResult: async (won, xpMultiplier = 1) => {
        if (!won) {
          save((s) => { if (s.room === room) s.failed = true; });
          return { lines: ["The rift closes behind you. A new path opens tomorrow."] };
        }
        const { grant } = await import("./logic");
        let lines: string[] = [];
        update((h) => {
          const s = ventureOf(h.spireVentures);
          if (s.room !== room) return;
          const gold = riftGold(lvl, room, kind, s.shrine === "fortune");
          const xp = scrollXp(lvl * (kind === "keeper" ? 80 : 40), xpMultiplier);
          const { levels } = grant(h, xp, gold);
          if (kind === "keeper") addMats(h, riftKeeperMats);
          h.spireVentures = { ...s, room: room + 1 };
          lines = [`+${fmt(xp)} XP`, `+${fmt(gold)} gold`, ...(kind === "keeper" ? matLines(riftKeeperMats) : []), ...(levels ? [`LEVEL UP ×${levels}!`] : [])];
        });
        return { lines };
      },
    });
  };

  const pickShrine = (s: "might" | "fortune") => save((x) => { if (rooms[x.room] === "shrine") { x.shrine = s; x.room += 1; } });

  const current = rooms[v.room];
  const done = v.room >= RIFT_ROOMS;

  return (
    <Panel title={t("Spire Gate")} subtitle={t("Party dungeons, warden hunts and rift paths")} art="swords" onClose={onClose} wide>
      {header}
      <GameTabs label={t("Spire ventures")} value={tab} onChange={setTab} tabs={[
        { id: "wardens", name: t("Warden Hunts") },
        { id: "rift", name: t("Rift Path") },
      ]} />
      {tab === "wardens" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">{t("Three wardens guard the Spire today, each with its own fighting style. Defeat each once a day for gold, XP and its own materials.")}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {wardens.map((w, i) => {
              const beaten = v.wardens.includes(w.id);
              const foe = wardenFoe(w, lvl);
              return (
                <div key={w.id} className="slot flex flex-col items-center p-3 text-center">
                  <Sprite rect={foe.sprite} className="h-20 w-20" />
                  <div className="mt-1 font-display text-gold">{tName(w.name)}</div>
                  <div className="text-xs text-muted-foreground">{t(w.twist)}</div>
                  <div className="mt-2 text-xs">{fmt(wardenGold(lvl))} {t("gold")} · {matLines(w.mats).join(", ")}</div>
                  <button className="btn-gold mt-3 w-full py-1.5" disabled={beaten} onClick={() => huntWarden(i)}>
                    {beaten ? t("Defeated today") : <><Swords className="mr-1 inline h-4 w-4" />{t("Hunt")}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === "rift" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">{t("A new five-room path every day: ambushes, a treasure vault, a shrine blessing and a keeper at the end. Lose a fight and the rift closes until tomorrow.")}</p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {rooms.map((k, i) => (
              <div key={i} className={`slot px-3 py-2 text-xs ${i === v.room && !v.failed ? "border-gold text-gold" : i < v.room ? "opacity-60" : ""}`}>
                {k === "keeper" ? <Crown className="mr-1 inline h-3 w-3" /> : k === "treasure" ? <Gem className="mr-1 inline h-3 w-3" /> : k === "shrine" ? <Sparkles className="mr-1 inline h-3 w-3" /> : <Swords className="mr-1 inline h-3 w-3" />}
                {i + 1}. {t(ROOM_LABEL[k])}{i < v.room ? " ✓" : ""}
              </div>
            ))}
          </div>
          {v.shrine && <p className="mb-2 text-xs text-gold">{might ? t("Shrine of Might: rift foes are 15% weaker.") : t("Shrine of Fortune: rift gold +25%.")}</p>}
          {v.failed ? (
            <p className="py-6 text-center text-hp">{t("The rift closed. A new path opens tomorrow.")}</p>
          ) : done ? (
            <p className="py-6 text-center text-gold">{t("Today's rift is cleared. A new path opens tomorrow.")}</p>
          ) : current === "shrine" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="slot p-4 text-left" onClick={() => pickShrine("might")}><b className="font-display text-gold">{t("Shrine of Might")}</b><div className="text-xs text-muted-foreground">{t("Rift foes are 15% weaker.")}</div></button>
              <button className="slot p-4 text-left" onClick={() => pickShrine("fortune")}><b className="font-display text-gold">{t("Shrine of Fortune")}</b><div className="text-xs text-muted-foreground">{t("Rift gold +25%.")}</div></button>
            </div>
          ) : (
            <div className="slot flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-display text-gold">{t(ROOM_LABEL[current])}</div>
                <div className="text-xs text-muted-foreground">
                  {current === "treasure" ? `${fmt(riftGold(lvl, v.room, current, fortune))} ${t("gold")} · ${matLines(riftTreasure).join(", ")}` : `${fmt(riftGold(lvl, v.room, current, fortune))} ${t("gold")}`}
                </div>
              </div>
              <button className="btn-gold px-6 py-2" onClick={enterRoom}>{current === "treasure" ? t("Open the vault") : t("Fight")}</button>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/** The Spire's three ways to play: party dungeons with floors, warden hunts and the rift path. */
export function SpireHub({ onClose, start, onBattleVisible }: { onClose: () => void; start: StartBattle; onBattleVisible: (v: boolean) => void }) {
  const [mode, setMode] = useState<"party" | "ventures">("party");
  const header = (
    <div className="mb-3 grid gap-2 sm:grid-cols-2">
      {([
        ["party", "Party Dungeons", "Climb floors together with up to three friends"],
        ["ventures", "Solo Ventures", "Warden hunts and a daily rift path"],
      ] as const).map(([id, name, note]) => (
        <button key={id} onClick={() => setMode(id)} className={`slot p-3 text-left ${mode === id ? "border-gold ring-1 ring-gold" : "opacity-80 hover:opacity-100"}`}>
          <b className="font-display text-gold">{t(name)}</b>
          <div className="text-xs text-muted-foreground">{t(note)}</div>
        </button>
      ))}
    </div>
  );
  return mode === "party"
    ? <SpireGateLazy onClose={onClose} onBattleVisible={onBattleVisible} header={header} />
    : <SpireVentures onClose={onClose} start={start} header={header} />;
}

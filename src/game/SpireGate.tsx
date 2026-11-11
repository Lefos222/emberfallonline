import artCatacomb from "@/assets/spire-catacomb.jpg";
import artObservatory from "@/assets/spire-observatory.jpg";
import { listFriends, sendDirectMessage, type FriendProfile } from "./social";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { tr } from "./i18n";
import { fmt, Panel } from "./ui";
import { Meter } from "./GateUI";
import { Button } from "@/components/ui/button";
import { CharacterModel } from "./CharacterModel";
import { SkillIcon } from "./SkillIcon";
import { arenaFor } from "./Battle";
import { MATS, type Mat } from "./crafting";
import { update, useGame } from "./store";
import { openParty, type PartyLink, type PartyMsg } from "./spire-sync";
import {
  SPIRE_DUNGEONS,
  SPIRE_PARTY_MAX,
  SPIRE_RUNS_PER_DAY,
  TICK_MS,
  beginSpire,
  cleanPartyCode,
  dungeonOf,
  dungeonUnlocked,
  endSpire,
  kitOf,
  loadSpire,
  memberOf,
  newBattle,
  openSpireChest,
  partyCode,
  reportClear,
  skillReady,
  tick,
  type SpireBattle,
  type SpireMember,
  type SpireReward,
  type SpireState,
} from "./spire-party";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaLair from "@/assets/arena-lair.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import arenaField from "@/assets/arena-field.jpg";
import spireChest from "@/assets/spire-chest.webp";
import gateDungeon from "@/assets/gate-dungeon.webp";

/** The painted doorway of each dungeon of the gate. */
const DUNGEON_ART: Record<string, string> = {
  cinder: arenaCrypt,
  ember: arenaLair,
  frost: arenaField,
  obsidian: arenaRift,
  catacomb: artCatacomb,
  observatory: artObservatory,
  spire: spireChest,
};

/** The dungeon the player picked last time; a fresh player starts at the shallowest one. */
const PICK_KEY = "emberfall.spire.dungeon";
const readPick = (): string => {
  if (typeof localStorage === "undefined") return SPIRE_DUNGEONS[0].id;
  try {
    return dungeonOf(localStorage.getItem(PICK_KEY)).id;
  } catch {
    return SPIRE_DUNGEONS[0].id;
  }
};
const savePick = (id: string) => {
  try {
    localStorage.setItem(PICK_KEY, id);
  } catch {
    /* Private mode: the pick simply lasts for this visit. */
  }
};

const message = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/**
 * The Party Spire: three server-run climbs a day, 1-4 heroes in one continuous fight, a Spire
 * Chest for every floor the party clears. The leader's client runs the fight and broadcasts every
 * tick; the others only send their casts back. Runs, floors, chests and their rewards are minted
 * by the `spire_*` RPCs, so nothing here can be forged from the browser.
 */
export function SpireGate({ onClose, onBattleVisible }: { onClose: () => void; onBattleVisible?: (visible: boolean) => void }) {
  const { hero, heroId, gender } = useGame();
  const [st, setSt] = useState<SpireState | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(() => partyCode());
  const [joinCode, setJoinCode] = useState("");
  const [leader, setLeader] = useState(true);
  const [dungeon, setDungeon] = useState<string>(readPick);
  const [copied, setCopied] = useState(false);
  const [mates, setMates] = useState<SpireMember[]>([]);
  const [members, setMembers] = useState<SpireMember[]>([]);
  const [battle, setBattle] = useState<SpireBattle | null>(null);
  useEffect(() => {
    onBattleVisible?.(battle !== null);
    return () => onBattleVisible?.(false);
  }, [battle !== null, onBattleVisible]);
  const [earned, setEarned] = useState(0);
  const [live, setLive] = useState(false);

  const self = useMemo(() => (hero && heroId ? memberOf(hero, gender, heroId) : null), [hero, heroId, gender]);
  const selfRef = useRef<SpireMember | null>(null);
  selfRef.current = self;
  const link = useRef<PartyLink>({ live: false, send: () => {}, close: () => {} });
  const leaderRef = useRef(true);
  const matesRef = useRef<SpireMember[]>([]);
  const membersRef = useRef<SpireMember[]>([]);
  const battleRef = useRef<SpireBattle | null>(null);
  const casts = useRef<{ hero: string; skill: string }[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const starting = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setSt(await loadSpire());
      setError("");
    } catch (e) {
      setError(message(e, tr("The Spire could not be reached.")));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stopFight = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    battleRef.current = null;
    casts.current = [];
    setBattle(null);
  }, []);

  /** The run is over for this hero: the server closes it and the ledger is read back. */
  const finishRun = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    // The fight is over for this hero: the next join must be free to start a fresh climb.
    battleRef.current = null;
    casts.current = [];
    void endSpire()
      .catch(() => {})
      .then(() => refresh());
  }, [refresh]);

  /** Every cleared floor is one Spire Chest: the server mints it, the panel counts it at once. */
  const creditChest = useCallback((floor: number, which: string) => {
    setEarned((n) => n + 1);
    setNote(tr("Spire Chest won — floor {floor}.", { floor }));
    // The dungeon's own best floor is the hero's record, so a party sees who has climbed how far.
    update((h) => {
      const best = h.spireFloors ?? {};
      h.spireFloors = { ...best, [which]: Math.max(best[which] ?? 0, floor) };
    });
    void reportClear(floor, which, (mats) => {
      const text = Object.entries(mats).map(([k, n]) => `+${n} ${MATS[k as Mat]?.name ?? k}`).join(", ");
      setNote(tr("Dungeon drop — floor {floor}: {text}", { floor, text }));
    }).then((paid) => {
      if (!paid) return;
      setSt((s) => (s ? { ...s, chests: s.chests + 1, best: Math.max(s.best, floor) } : s));
    });
  }, []);

  const onMessage = useCallback(
    (m: PartyMsg) => {
      switch (m.kind) {
        case "hello": {
          // Only the leader keeps the roster, and it never grows past four heroes.
          if (!leaderRef.current) return;
          const partyNow = () =>
            (selfRef.current ? [selfRef.current, ...matesRef.current] : matesRef.current).slice(0, SPIRE_PARTY_MAX);
          // A hero who already joined may have lost the start or a tick: hand them the live fight
          // again (or the roster while it waits), so a dropped broadcast heals by itself.
          if (matesRef.current.some((x) => x.id === m.member.id)) {
            const live = battleRef.current;
            if (live) link.current.send({ kind: "tick", battle: live, cleared: null });
            else link.current.send({ kind: "roster", members: partyNow() });
            return;
          }
          // A fight cannot take a new hero halfway through: their own run would be out of order.
          if (battleRef.current) {
            link.current.send({ kind: "busy", hero: m.member.id });
            return;
          }
          if (matesRef.current.length >= SPIRE_PARTY_MAX - 1) return;
          const next = [...matesRef.current, m.member];
          matesRef.current = next;
          setMates(next);
          const roster = partyNow();
          membersRef.current = roster;
          setMembers(roster);
          link.current.send({ kind: "roster", members: roster });
          break;
        }
        case "roster": {
          const others = m.members.filter((x) => x.id !== selfRef.current?.id);
          matesRef.current = others;
          setMates(others);
          membersRef.current = m.members;
          setMembers(m.members);
          break;
        }
        case "begin": {
          membersRef.current = m.members;
          setMembers(m.members);
          setEarned(0);
          // The whole party climbs the dungeon the leader picked.
          setDungeon(dungeonOf(m.dungeon).id);
          if (leaderRef.current) return;
          // Every hero spends their own run, so every hero opens one on the server.
          battleRef.current = null;
          setBattle(null);
          void beginSpire().catch((e) => setError(message(e, tr("The climb could not start."))));
          break;
        }
        case "tick": {
          battleRef.current = m.battle;
          setBattle(m.battle);
          // Each hero is paid their own chest by their own server run.
          if (m.cleared) creditChest(m.cleared, dungeonOf(m.battle.dungeon).id);
          if (m.battle.over) finishRun();
          break;
        }
        case "busy": {
          if (leaderRef.current) return;
          setNote(tr("The party's climb is already underway — wait for the next one."));
          break;
        }
        case "cast": {
          if (leaderRef.current) casts.current.push({ hero: m.hero, skill: m.skill });
          break;
        }
        case "bye": {
          // Only the leader's departure disbands the party: another hero leaving must never
          // tear down everyone else's fight.
          if (m.leader) {
            stopFight();
            setNote(tr("The party disbanded."));
            finishRun();
            return;
          }
          const next = matesRef.current.filter((x) => x.id !== m.hero);
          matesRef.current = next;
          setMates(next);
          const rest = membersRef.current.filter((x) => x.id !== m.hero);
          membersRef.current = leaderRef.current ? (selfRef.current ? [selfRef.current, ...next] : next) : rest;
          setMembers(membersRef.current);
          if (leaderRef.current) link.current.send({ kind: "roster", members: membersRef.current });
          break;
        }
      }
    },
    [creditChest, finishRun, stopFight],
  );

  // One broadcast channel per party code. Without Realtime the climb still runs, as a party of one.
  useEffect(() => {
    const opened = openParty(code, onMessage, () => {
      // The greeting is only sent once the socket is subscribed; earlier messages are dropped.
      if (!leaderRef.current && selfRef.current) link.current.send({ kind: "hello", member: selfRef.current });
    });
    link.current = opened;
    setLive(opened.live);
    return () => opened.close();
  }, [code, onMessage]);

  // A joiner greets again until the shared fight arrives, so a lost greeting — or a lost start —
  // cannot leave their screen behind the rest of the party.
  useEffect(() => {
    if (leader) return;
    const id = setInterval(() => {
      const member = selfRef.current;
      if (!member || battleRef.current) return;
      link.current.send({ kind: "hello", member });
    }, 3000);
    return () => clearInterval(id);
  }, [leader]);

  // The leader repeats the roster while nobody is fighting, the same self-healing way.
  useEffect(() => {
    if (!leader) return;
    const id = setInterval(() => {
      const member = selfRef.current;
      if (!member || battleRef.current) return;
      link.current.send({ kind: "roster", members: [member, ...matesRef.current].slice(0, SPIRE_PARTY_MAX) });
    }, 5000);
    return () => clearInterval(id);
  }, [leader]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const roster = self ? [self, ...mates.filter((m) => m.id !== self.id)].slice(0, SPIRE_PARTY_MAX) : mates;

  const startRun = async () => {
    // A double tap must never open two runs (or two fight loops).
    if (!self || starting.current) return;
    const picked = dungeonOf(dungeon);
    starting.current = true;
    setBusy(true);
    setError("");
    try {
      const began = await beginSpire();
      // An abandoned run is resumed rather than recharged: the climb picks up on the next floor.
      const from = began.resumed ? began.floor + 1 : 1;
      if (from > picked.floors) {
        setError(tr("The Spire is already conquered."));
        return;
      }
      const party = [self, ...matesRef.current.filter((m) => m.id !== self.id)].slice(0, SPIRE_PARTY_MAX);
      membersRef.current = party;
      setMembers(party);
      setEarned(0);
      const first = newBattle(party, from, picked.id);
      battleRef.current = first;
      setBattle(first);
      link.current.send({ kind: "begin", members: party, floor: from, dungeon: picked.id });
      setSt((s) => (s ? { ...s, active: true, runs_left: began.resumed ? s.runs_left : Math.max(0, s.runs_left - 1) } : s));
      timer.current = setInterval(() => {
        const prev = battleRef.current;
        if (!prev || prev.over) return;
        const pending = casts.current;
        casts.current = [];
        const result = tick(prev, membersRef.current, pending);
        battleRef.current = result.battle;
        setBattle(result.battle);
        link.current.send({ kind: "tick", battle: result.battle, cleared: result.cleared });
        if (result.cleared) creditChest(result.cleared, picked.id);
        if (result.battle.over) finishRun();
      }, TICK_MS);
    } catch (e) {
      setError(message(e, tr("The climb could not start.")));
    } finally {
      starting.current = false;
      setBusy(false);
    }
  };

  const cast = (skill: string) => {
    const me = battle?.heroes.find((h) => h.id === heroId);
    if (!me || !skillReady(me, skill)) return;
    if (leaderRef.current) casts.current.push({ hero: me.id, skill });
    else link.current.send({ kind: "cast", hero: me.id, skill });
  };

  const leaveFight = () => {
    const wasFighting = !!battleRef.current;
    stopFight();
    link.current.send({ kind: "bye", hero: heroId ?? "", leader: leaderRef.current });
    if (wasFighting) finishRun();
    else void refresh();
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    const next = cleanPartyCode(joinCode);
    if (next.length !== 5) {
      setError(tr("A party code is five letters."));
      return;
    }
    setError("");
    matesRef.current = [];
    setMates([]);
    setMembers([]);
    setJoinCode("");
    leaderRef.current = false;
    setLeader(false);
    setCode(next);
    setNote(tr("Joining party {code}…", { code: next }));
  };

  const openChest = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const reward = await openSpireChest();
      setNote(`${tr("The chest held")}: ${rewardLine(reward)}`);
      setSt((s) => (s ? { ...s, chests: Math.max(0, s.chests - 1) } : s));
    } catch (e) {
      setError(message(e, tr("The chest would not open.")));
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  const close = () => {
    const wasFighting = !!battleRef.current;
    stopFight();
    if (wasFighting) {
      link.current.send({ kind: "bye", hero: heroId ?? "", leader: leaderRef.current });
      finishRun();
    }
    onClose();
  };

  // Only a real run starts a climb: an abandoned run cannot be resumed by the server, so a stale
  // `active` flag must never arm a button that the server would refuse.
  const picked = dungeonOf(dungeon);
  const heroLevel = (hero?.level ?? 1) + (hero?.paragon ?? 0);
  const gateOpen = dungeonUnlocked(picked, heroLevel);
  const ready = !!st && st.runs_left > 0 && gateOpen;
  const bests = hero?.spireFloors ?? {};
  const me = battle?.heroes.find((h) => h.id === heroId);
  /** The hero's own abilities — the same kit the rest of the game fights with. */
  const myKit = self ? kitOf(self) : [];

  return (
    <>
      <Panel title="Spire Gate" subtitle="Five dungeons — party climbs, three runs a day" art="swords" onClose={close} wide>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="slot p-3">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{tr("Runs left today")}</span>
            <b className="font-display text-xl">{st ? st.runs_left : "…"}</b>
            <span className="text-muted-foreground"> / {SPIRE_RUNS_PER_DAY}</span>
          </div>
          <div className="slot p-3">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{tr("Best floor")}</span>
            <b className="font-display text-xl">{bests[picked.id] ?? 0}</b>
            <span className="text-muted-foreground"> / {picked.floors}</span>
            <span className="mt-1 block truncate text-[11px] text-muted-foreground">{tr(picked.name)}</span>
          </div>
          <div className="slot flex flex-col gap-1.5 p-3">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{tr("Spire Chests")}</span>
            <b className="font-display text-xl text-gold">{st ? st.chests : "…"}</b>
            <Button
              variant="ghost"
              className="btn-ghost px-2 py-1 text-xs"
              onClick={() => void openChest()}
              disabled={busy || !st || st.chests < 1}
            >
              {tr("Open a chest")}
            </Button>
          </div>
        </div>

        {note && (
          <p role="status" className="slot mt-2 p-2 text-xs text-gold">
            {note}
          </p>
        )}
        {error && (
          <p role="alert" className="slot mt-2 border-blood p-2 text-xs text-blood">
            {error}
          </p>
        )}

        {/* The gate's dungeons: pick the climb, see how far the hero has been. */}
        <div role="radiogroup" aria-label={tr("Dungeons of the Spire Gate")} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SPIRE_DUNGEONS.map((d) => {
            const open = dungeonUnlocked(d, heroLevel);
            const best = bests[d.id] ?? 0;
            const on = d.id === picked.id;
            return (
              <button
                key={d.id}
                role="radio"
                aria-checked={on}
                disabled={!open || !!battle}
                onClick={() => {
                  setDungeon(d.id);
                  savePick(d.id);
                  setNote("");
                }}
                className={`slot overflow-hidden p-0 text-left disabled:opacity-60 ${on ? "ring-2 ring-gold" : ""}`}
              >
                <span className="relative block h-16">
                  <img src={DUNGEON_ART[d.id] ?? gateDungeon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                  <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <span className="absolute left-2 top-1.5 font-display text-sm text-gold">{tr(d.name)}</span>
                  <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                    {d.floors} {tr("floors")}
                  </span>
                </span>
                <span className="block px-2 py-1.5">
                  <span className="block text-[11px] text-muted-foreground">
                    {open ? tr(d.blurb) : tr("Unlocks at level {n}", { n: d.level })}
                  </span>
                  <span className="mt-1 block h-1.5 w-full overflow-hidden rounded bg-background/70">
                    <span className="block h-full bg-gold" style={{ width: `${Math.min(100, Math.round((best / d.floors) * 100))}%` }} />
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {tr("Drops")}: <b className="text-gold">{MATS[d.mat].name}</b> ·{" "}
                    {tr("Best")} {best}/{d.floors}
                    {best >= d.floors ? ` · ${tr("Conquered")}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="slot mt-3 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-gold">{tr("Party code")}</span>
            <b className="font-display text-2xl tracking-[0.3em]">{code}</b>
            <Button variant="ghost" className="btn-ghost px-2 py-1 text-xs" onClick={copyCode}>
              {copied ? tr("Copied") : tr("Copy code")}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {leader
              ? tr("Friends join with this code. One fight is shared by up to four heroes.")
              : tr("You joined this party. The party's leader starts the climb.")}
            {live ? "" : ` · ${tr("Playing alone — the party channel is closed.")}`}
          </p>

          <ul aria-label={tr("Party")} className="mt-2 grid gap-1 sm:grid-cols-2">
            {roster.map((m) => (
              <li key={m.id} className="slot flex items-center gap-2 p-2 text-xs">
                <CharacterModel cls={m.cls} gender={m.gender} synth={m.synth} look={m.look} className="h-10 w-10" />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
                <span className="text-muted-foreground">
                  {tr("Lv")} {m.level}
                </span>
                {m.id === self?.id && <span className="text-gold">{tr("You")}</span>}
              </li>
            ))}
            {Array.from({ length: Math.max(0, SPIRE_PARTY_MAX - roster.length) }, (_, i) => (
              <li key={`seat-${i}`} className="slot flex items-center justify-center p-2 text-xs text-muted-foreground">
                {tr("Empty seat")}
              </li>
            ))}
          </ul>

          {leader && heroId && <InviteFriends heroId={heroId} code={code} />}

          {leader && (
            <form className="mt-2 flex flex-wrap items-center gap-2" onSubmit={join}>
              <input
                aria-label={tr("Party code to join")}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
                placeholder={tr("Party code")}
                className="w-28 rounded border border-border bg-background p-2 text-sm tracking-[0.2em]"
              />
              <Button type="submit" variant="ghost" className="btn-ghost px-2 py-1 text-xs">
                {tr("Join party")}
              </Button>
            </form>
          )}
        </div>

        {leader ? (
          <Button
            className="btn-gold mt-3 w-full py-2.5 text-lg"
            onClick={() => void startRun()}
            disabled={busy || !ready}
          >
            {!gateOpen
              ? tr("Unlocks at level {n}", { n: picked.level })
              : ready
                ? tr("Start the climb")
                : tr("No runs left today")}
          </Button>
        ) : (
          <p className="mt-3 text-center text-xs text-muted-foreground">{tr("Waiting for the party leader…")}</p>
        )}
      </Panel>

      {battle && (
        <div className="battle-screen fixed inset-0 z-40 flex flex-col overflow-hidden bg-background anim-pop">
          <img
            src={arenaFor("spire", battle.floor % 10 === 0)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 vignette" />

          <div className="safe-top relative z-10 flex items-center justify-between gap-2 p-3">
            <div className="font-display panel-title text-lg md:text-2xl">
              <span className="block text-xs font-normal uppercase tracking-wide text-muted-foreground">
                {tr(dungeonOf(battle.dungeon).name)}
              </span>
              {tr("Floor")} {battle.floor}{" "}
              <span className="text-sm text-muted-foreground">/ {battle.floors ?? dungeonOf(battle.dungeon).floors}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="slot px-2 py-1">
                {tr("Chests won")} <b className="text-gold">{earned}</b>
              </span>
              <Button variant="ghost" className="btn-ghost px-2 py-1 text-xs" onClick={leaveFight}>
                {tr("Leave")}
              </Button>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-end justify-between gap-2 px-3 pb-3 md:px-10">
            <div className="flex items-end justify-start gap-1 md:gap-3">
              {battle.heroes.map((h) => {
                const m = members.find((x) => x.id === h.id) ?? (h.id === self?.id ? self : undefined);
                const down = h.hp <= 0;
                const struck = battle.fx.some((f) => f.tgt === h.id || f.src === h.id);
                return (
                  <div
                    key={h.id}
                    className={`relative flex w-20 flex-col items-center md:w-28 ${down ? "opacity-40" : ""}`}
                  >
                    {/* The model needs its own box: `.hero-model` is absolutely laid out inside it. */}
                    <div className={`h-24 w-20 shrink-0 md:h-36 md:w-28 ${struck ? "anim-lunge-r" : ""}`}>
                      <CharacterModel
                        cls={m?.cls ?? "warrior"}
                        gender={m?.gender ?? "male"}
                        synth={m?.synth}
                        look={m?.look ?? null}
                        pose={struck ? "action" : "auto"}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="w-full truncate text-center text-[10px] font-bold">{m?.name ?? ""}</span>
                    <Meter value={h.hp} max={h.max} fill="bar-hp" label={`${m?.name ?? ""} ${tr("Health")}`} />
                    {h.guard ? <span className="text-[9px] font-bold text-r2">◈ {tr("Guard")}</span> : null}
                    {battle.fx
                      .filter((f) => f.tgt === h.id)
                      .map((f, i) => (
                        <span
                          key={`${battle.t}-${i}`}
                          className={`pointer-events-none absolute left-1/2 top-2 anim-float font-display font-black drop-shadow-[0_2px_2px_black] ${
                            f.kind === "heal" ? "text-r1" : f.kind === "miss" ? "text-muted-foreground" : "text-blood"
                          }`}
                        >
                          {f.kind === "heal" ? `+${f.value}` : f.kind === "miss" ? tr("Miss") : `-${f.value}`}
                        </span>
                      ))}
                  </div>
                );
              })}
            </div>

            <div className="battle-foes flex flex-1 items-end justify-end gap-1 md:gap-4">
              {battle.foes.map((f) => (
                <div
                  key={f.uid}
                  className={`relative flex flex-col items-center ${f.hp <= 0 ? "opacity-30" : ""}`}
                  style={{ width: f.boss ? 150 : 96, maxWidth: "32%" }}
                >
                  <img
                    src={f.img}
                    alt={f.name}
                    className={`max-h-24 object-contain md:max-h-36 ${f.boss ? "scale-110" : ""} ${
                      battle.fx.some((x) => x.tgt === f.uid) ? "anim-hit" : ""
                    }`}
                  />
                  <span className="w-full truncate text-center text-[10px] font-bold">{f.name}</span>
                  <Meter value={f.hp} max={f.max} fill="bar-hp" label={`${f.name} ${tr("Health")}`} />
                  {battle.fx
                    .filter((x) => x.tgt === f.uid)
                    .map((x, i) => (
                      <span
                        key={`${battle.t}-${i}`}
                        className={`pointer-events-none absolute left-1/2 top-1 anim-float font-display font-black drop-shadow-[0_2px_2px_black] ${
                          x.kind === "crit" ? "text-gold" : x.kind === "miss" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {x.kind === "miss" ? tr("Miss") : `-${x.value}`}
                      </span>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 bg-gradient-to-t from-background via-background/90 to-transparent pb-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {myKit.map((sk) => {
                const cd = me?.cd[sk.id] ?? 0;
                const readyNow = skillReady(me, sk.id);
                return (
                  <Button
                    key={sk.id}
                    variant="ghost"
                    onClick={() => cast(sk.id)}
                    disabled={!readyNow || battle.over}
                    className={`slot relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 rarity-4 transition hover:scale-105 disabled:opacity-50 md:h-20 md:w-20 ${
                      readyNow ? "ring-1 ring-gold/60" : ""
                    }`}
                    title={sk.name}
                  >
                    <SkillIcon icon={sk.icon} className="h-8 w-8 md:h-10 md:w-10" />
                    <span className="px-0.5 text-center text-[9px] font-bold uppercase leading-tight">{sk.name}</span>
                    {cd > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-md bg-background/75 font-display text-xl">
                        {Math.ceil(cd / 1000)}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
            <div className="max-h-20 w-full max-w-2xl overflow-y-auto px-3 text-center text-[11px] text-muted-foreground">
              {battle.log.map((line, i) => (
                <div key={`${i}-${line}`} className={i === battle.log.length - 1 ? "text-foreground" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {battle.over && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 p-4">
              <div className="game-panel anim-pop w-full max-w-sm p-6 text-center">
                <h2 className={`font-display text-3xl font-black ${battle.outcome === "summit" ? "panel-title" : "text-blood"}`}>
                  {battle.outcome === "summit" ? tr("Summit conquered") : tr("The party fell")}
                </h2>
                <p className="mt-2 text-sm">
                  {tr("Chests won this run")}: <b className="text-gold">{earned}</b>
                </p>
                <Button
                  className="btn-gold mt-4 w-full py-2"
                  onClick={() => {
                    stopFight();
                    void refresh();
                  }}
                >
                  {tr("Continue")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** A chest's payout in the player's language: gold, then each material by its painted name. */
function rewardLine(reward: SpireReward): string {
  const parts: string[] = [];
  if (reward.gold > 0) parts.push(`${fmt(reward.gold)} ${tr("Gold")}`);
  for (const [k, v] of Object.entries(reward.mats)) {
    const name = MATS[k as Mat]?.name ?? k;
    parts.push(`${v} × ${name}`);
  }
  return parts.length ? parts.join(" · ") : tr("nothing at all");
}


/** Invite a friend: sends them a direct message carrying the party code. */
function InviteFriends({ heroId, code }: { heroId: string; code: string }) {
  const [friends, setFriends] = useState<FriendProfile[] | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");
  useEffect(() => {
    let on = true;
    listFriends(heroId).then((f) => on && setFriends(f)).catch(() => on && setFriends([]));
    return () => { on = false; };
  }, [heroId]);
  if (!friends) return null;
  if (!friends.length) return <p className="mt-2 text-xs text-muted-foreground">{tr("Add friends to invite them to your party.")}</p>;
  return (
    <div className="mt-2">
      <p className="mb-1 text-xs font-bold text-gold">{tr("Invite friends")}</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {friends.map((f) => (
          <li key={f.id} className="slot flex items-center justify-between gap-2 p-1.5 text-xs">
            <span className="truncate">{f.name}</span>
            <Button size="sm" variant="ghost" className="btn-gold h-7 px-2 text-xs" disabled={sent[f.id]}
              onClick={() => {
                setErr("");
                sendDirectMessage(heroId, f.id, tr("Join my Spire party! Code: {code}", { code }))
                  .then(() => setSent((s) => ({ ...s, [f.id]: true })))
                  .catch((e) => setErr(e instanceof Error ? e.message : tr("Invite failed")));
              }}>
              {sent[f.id] ? tr("Invited") : tr("Invite")}
            </Button>
          </li>
        ))}
      </ul>
      {err && <p role="alert" className="mt-1 text-xs text-blood">{err}</p>}
    </div>
  );
}

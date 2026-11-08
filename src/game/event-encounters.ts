import { BATTLE_BOSSES, ENEMY_ROSTER } from './bestiary';
import { MAX_LEVEL, SKILLS, WORLD_DRIFT, stageFoe, type Foe } from './data';
import { statusOf, type WorldEvent } from './events';

/** Which roster an event draws its champion from. */
const rosterFor = (ev: WorldEvent) =>
  ev.kind === 'hunt' || ev.kind === 'rift' ? ENEMY_ROSTER : BATTLE_BOSSES;

/**
 * Rotation is tied to the shared occurrence, never the viewer's gear or a random render.
 * The encounter's level also follows the hero (up to WORLD_DRIFT levels), so an event stays a
 * real fight at every level instead of becoming a fixed-stage tutorial.
 */
export function eventEncounter(ev: WorldEvent, startedAt: number, heroLevel = ev.stage) {
  const cycle = Math.max(0, Math.floor((startedAt - ev.anchor) / ev.everyMs));
  const roster = rosterFor(ev);
  const entry = roster[cycle % roster.length];
  if (!entry) throw new Error('Encounter roster unavailable');
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.round(heroLevel)));
  const stage = Math.max(ev.stage, Math.min(lv, ev.stage + WORLD_DRIFT));
  const base = stageFoe(stage, ev.bonus.mult);
  // Each event kind fights differently: sieges are walls, hunts hit hard, duels are slippery and
  // rifts trade bulk for speed.
  const tweak: Partial<Foe> =
    ev.kind === 'siege' ? { hp: Math.round(base.hp * 1.35), atk: Math.round(base.atk * 1.05) }
      : ev.kind === 'hunt' ? { atk: Math.round(base.atk * 1.25), hp: Math.round(base.hp * 1.1) }
        : ev.kind === 'duel' ? { atk: Math.round(base.atk * 1.3), dodge: base.dodge + 8 }
          : ev.kind === 'rift' ? { hp: Math.round(base.hp * 0.85), atk: Math.round(base.atk * 0.9) }
            : { hp: Math.round(base.hp * 1.5), atk: Math.round(base.atk * 1.2) };
  return {
    ...base,
    ...tweak,
    name: entry.name,
    sprite: entry.sprite,
    level: stage,
    boss: ev.kind === 'siege' || ev.kind === 'bloodmoon',
    rosterId: entry.id,
    skills: Object.values(SKILLS).flat().filter(s => s.id === entry.signatureAbilityId),
  };
}

export function liveOccurrence(ev: WorldEvent, now: number) {
  const status = statusOf(now, ev);
  if (status.state !== 'live') throw new Error('This event is not open. Wait for its next opening.');
  return status.startedAt;
}

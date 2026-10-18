import { BOSS_ROSTER, ENEMY_ROSTER } from './bestiary';
import { SKILLS, stageFoe } from './data';
import { statusOf, type WorldEvent } from './events';

/** Rotation is tied to the shared occurrence, never the viewer's gear or a random render. */
export function eventEncounter(ev: WorldEvent, startedAt: number) {
  const cycle = Math.max(0, Math.floor((startedAt - ev.anchor) / ev.everyMs));
  const roster = ev.kind === 'boss' || ev.kind === 'season' ? BOSS_ROSTER : ENEMY_ROSTER;
  const entry = roster[cycle % roster.length];
  if (!entry) throw new Error('Encounter roster unavailable');
  return { ...stageFoe(ev.stage, ev.kind === 'boss' ? 1.25 : 1), name: entry.name, sprite: entry.sprite,
    boss: ev.kind === 'boss' || ev.kind === 'season', rosterId: entry.id, skills: Object.values(SKILLS).flat().filter(s=>s.id===entry.signatureAbilityId) };
}

export function liveOccurrence(ev: WorldEvent, now: number) {
  const status = statusOf(now, ev);
  if (status.state !== 'live') throw new Error('This event is not open. Wait for its next opening.');
  return status.startedAt;
}
import { useState } from 'react';
import type { Hero } from './data';
import { Panel, fmt } from './ui';
import { ROSTER, rosterProgress } from './bestiary';
import { SHEET_W, SHEET_H } from './world';

const tierColors = ['var(--r1)', 'var(--xp)', 'var(--r4)', 'var(--r3)', 'var(--r5)'];
export function Bestiary({ h, onClose }: { h: Hero; onClose: () => void }) {
  const [kind, setKind] = useState('all');
  const [state, setState] = useState('all');
  const entries = ROSTER.filter(e => (kind === 'all' || e.kind === kind) && (state === 'all' || rosterProgress(h, e.id).state === state));
  return <Panel title="Bestiary & Boss Roster" onClose={onClose} wide>
    <p className="mb-4 text-sm text-muted-foreground">60 enemy designs · 44 boss designs. Seven bosses use cropped head portraits. Unknown entries unlock only through recorded encounters; old saves are not given invented kills.</p>
    <div className="mb-5 flex flex-wrap gap-4">
      <label>Roster <select className="rounded border border-border bg-background p-2" value={kind} onChange={e => setKind(e.target.value)}>
        <option value="all">All creatures</option><option value="enemy">Enemies</option><option value="boss">Bosses</option>
      </select></label>
      <label>Discovery <select className="rounded border border-border bg-background p-2" value={state} onChange={e => setState(e.target.value)}>
        <option value="all">All states</option><option value="seen">Seen</option><option value="defeated">Defeated</option><option value="undiscovered">Undiscovered</option>
      </select></label>
    </div>
    {entries.length === 0 && <p role="status">No recorded creatures match these filters.</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{entries.map(e => {
      const progress = rosterProgress(h, e.id), known = progress.state !== 'undiscovered';
      const s = e.sprite, scale = Math.min(120 / s.w, 126 / s.h);
      return <article key={e.id} className="rounded border bg-background/60 p-3 text-center" style={{ borderColor: known ? tierColors[e.tier - 1] : 'var(--border)' }}>
        <div className="flex h-32 items-center justify-center">
          {known ? <div role="img" aria-label={e.name} style={{ width: s.w * scale, height: s.h * scale, backgroundImage: `url("${s.url}")`, backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`, backgroundPosition: `${-s.x * scale}px ${-s.y * scale}px`, backgroundRepeat: 'no-repeat' }} /> : <span className="text-sm text-muted-foreground">Undiscovered</span>}
        </div>
        <h3 className="font-display font-bold" style={{ color: known ? tierColors[e.tier - 1] : undefined }}>{known ? e.name : 'Unknown creature'}</h3>
        <p className="text-xs text-muted-foreground">{known ? `Tier ${e.tier} · Lv ${e.levelBand[0]}–${e.levelBand[1]}` : 'Encounter to reveal'}</p>
        <p className="mt-2 text-sm">{progress.state === 'defeated' ? `Defeated · ${fmt(progress.count!)} kills` : progress.state === 'seen' ? 'Seen · no recorded defeats' : 'Defeat count unknown'}</p>
      </article>;
    })}</div>
  </Panel>;
}

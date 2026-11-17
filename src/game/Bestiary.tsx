import { tName , t} from "./i18n";
import { useState } from 'react';
import type { Hero } from './data';
import { Panel, fmt } from './ui';
import { rosterProgress } from './bestiary';
import { collectedRoster } from './encounter-collection';
import { SHEET_W, SHEET_H } from './world';

const tierColors = ['var(--r1)', 'var(--xp)', 'var(--r4)', 'var(--r3)', 'var(--r5)'];
export function Bestiary({ h, onClose }: { h: Hero; onClose: () => void }) {
  const [kind, setKind] = useState('all');
  const [state, setState] = useState('all');
  const entries = collectedRoster(h).filter(e => (kind === 'all' || e.kind === kind) && (state === 'all' || rosterProgress(h, e.id).state === state));
  return <Panel title={t("Bestiary & Boss Roster")} subtitle={t("Roster")} art="spellbook" onClose={onClose} wide>
    <div className="mb-5 flex flex-wrap gap-4">
      <label>{t("Roster")} <select className="rounded border border-border bg-background p-2" value={kind} onChange={e => setKind(e.target.value)}>
        <option value="all">{t("All creatures")}</option><option value="enemy">{t("Enemies")}</option><option value="boss">{t("Bosses")}</option>
      </select></label>
      <label>{t("Discovery")} <select className="rounded border border-border bg-background p-2" value={state} onChange={e => setState(e.target.value)}>
        <option value="all">{t("All states")}</option><option value="seen">{t("Seen")}</option><option value="defeated">{t("Defeated")}</option><option value="undiscovered">{t("Undiscovered")}</option>
      </select></label>
    </div>
    {entries.length === 0 && <p role="status">{t("No recorded creatures match these filters.")}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{entries.map(e => {
      const progress = rosterProgress(h, e.id), known = progress.state !== 'undiscovered';
      const s = e.sprite, scale = s ? Math.min(120 / s.w, 126 / s.h) : 1;
      return <article key={e.id} className="rounded border bg-background/60 p-3 text-center" style={{ borderColor: known ? tierColors[e.tier - 1] : 'var(--border)' }}>
        <div className="flex h-32 items-center justify-center">
          {known ? s ? <div role="img" aria-label={tName(e.name)} style={{ width: s.w * scale, height: s.h * scale, backgroundImage: `url("${s.url}")`, backgroundSize: `${(s.sheetW ?? SHEET_W) * scale}px ${(s.sheetH ?? SHEET_H) * scale}px`, backgroundPosition: `${-s.x * scale}px ${-s.y * scale}px`, backgroundRepeat: 'no-repeat' }} /> : <img src={e.img} alt={tName(e.name)} className="h-full w-full object-contain" /> : <span className="text-sm text-muted-foreground">{t("Undiscovered")}</span>}
        </div>
        <h3 className="font-display font-bold" style={{ color: known ? tierColors[e.tier - 1] : undefined }}>{known ? tName(e.name) : t("Unknown creature")}</h3>
        <p className="text-xs text-muted-foreground">{known ? `Tier ${e.tier} · Lv ${e.levelBand[0]}–${e.levelBand[1]}` : t("Encounter to reveal")}</p>
        <p className="mt-2 text-sm">{progress.state === 'defeated' ? `Defeated · ${fmt(progress.count ?? 0)} kills` : progress.state === 'seen' ? t("Seen · no recorded defeats") : t("Defeat count unknown")}</p>
      </article>;
    })}</div>
  </Panel>;
}

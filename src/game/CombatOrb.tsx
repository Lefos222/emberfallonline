import frame from "@/assets/combat-orb-frame.png";

export function CombatOrb({ value, max, label, kind }: { value: number; max: number; label: string; kind: "hp" | "rage" }) {
  const percent = Math.min(100, Math.max(0, max > 0 ? value / max * 100 : 0));
  return <div className={`combat-orb-shell combat-orb-${kind}`} role="meter" aria-label={label} aria-valuenow={Math.max(0, value)} aria-valuemin={0} aria-valuemax={max}>
    <div className={`orb orb-${kind}`}>
      <div className="orb-fill" style={{ height: `${percent}%` }} />
      <div className="orb-gloss" />
      <div className="orb-label"><span>{Math.max(0, value).toLocaleString()}</span><small>/ {max.toLocaleString()}</small></div>
    </div>
    <img src={frame} width={1024} height={1024} alt="" className="combat-orb-frame" />
    <b className="combat-orb-caption">{label}</b>
  </div>;
}
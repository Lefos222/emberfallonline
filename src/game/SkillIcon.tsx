import atlas from '@/assets/skill-icons.png';

/** Painted skill-icon atlas: 4x4 grid, one cell per ability theme. */
const CELLS: Record<string, number> = {
  sword: 0, axe: 1, flame: 2, sparkles: 3,
  snowflake: 4, target: 5, wind: 6, crosshair: 7,
  shield: 8, megaphone: 9, swords: 10, scan: 11,
  heart: 12, potion: 13, skull: 14, star: 15,
};

export function SkillIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const cell = CELLS[icon] ?? 0;
  const col = cell % 4, row = Math.floor(cell / 4);
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded ${className}`} style={{ aspectRatio: '1 / 1' }}>
      <div className="h-full w-full" style={{
        backgroundImage: `url(${atlas})`,
        backgroundSize: '400% 400%',
        backgroundPosition: `${(col / 3) * 100}% ${(row / 3) * 100}%`,
      }} />
    </div>
  );
}

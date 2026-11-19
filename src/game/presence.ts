/** "Online now" for a hero the server saw playing in the last few minutes. */
export function presence(lastPlayed: string): { online: boolean; label: string } {
  const at = new Date(lastPlayed).getTime();
  if (!Number.isFinite(at)) return { online: false, label: "Unknown" };
  const mins = (Date.now() - at) / 60000;
  if (mins < 5) return { online: true, label: "Online now" };
  if (mins < 60) return { online: false, label: `Seen ${Math.floor(mins)}m ago` };
  if (mins < 60 * 24) return { online: false, label: `Seen ${Math.floor(mins / 60)}h ago` };
  return { online: false, label: `Seen ${Math.floor(mins / 1440)}d ago` };
}

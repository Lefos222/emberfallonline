export const SOCIAL_REWARDS = {
  discord: { diamonds: 50, url: "https://discord.gg/euDVMducP" },
  instagram: { diamonds: 50, url: "https://www.instagram.com/emberfallonlineofficial/" },
} as const;
export type SocialProvider = keyof typeof SOCIAL_REWARDS;

/** A code binds the message author to this account, never to a submitted social username. */
export function matchingDiscordAuthor(messages: unknown, code: string): string | null {
  if (!Array.isArray(messages)) return null;
  const expected = `emberfall ${code}`;
  for (const entry of messages) {
    if (entry && typeof entry.content === "string" && entry.content.trim().toLowerCase() === expected &&
        entry.author && !entry.author.bot && typeof entry.author.id === "string" && /^\d+$/.test(entry.author.id)) {
      return entry.author.id;
    }
  }
  return null;
}
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { SOCIAL_REWARDS, matchingDiscordAuthor } from "@/game/social-rewards";
const sql = fs.readFileSync("drizzle/migrations/0037_verified_social_rewards.sql", "utf8");
describe("verified social rewards", () => {
  it("awards 50 Diamonds for Discord", () => { expect(SOCIAL_REWARDS.discord.diamonds).toBe(50); expect(sql).toContain("'amount',50"); });
  it("awards 50 Diamonds for Instagram", () => { expect(SOCIAL_REWARDS.instagram.diamonds).toBe(50); expect(sql).toContain("CHECK(diamonds=50)"); });
  it("allows each reward only once per account, not per hero", () => { expect(sql).toContain("PRIMARY KEY(user_id,provider)"); expect(sql).toContain("UNIQUE(provider,external_id)"); });
  it("does not let players call the privileged reward writer", () => { expect(sql).toContain("FROM PUBLIC,anon,authenticated"); expect(sql).toContain("TO service_role"); });
  it("requires an exact account-bound message from a real Discord author", () => {
    expect(matchingDiscordAuthor([{ content: "emberfall abc", author: { id: "123" } }], "abc")).toBe("123");
    expect(matchingDiscordAuthor([{ content: "emberfall abc extra", author: { id: "123" } }], "abc")).toBeNull();
    expect(matchingDiscordAuthor([{ content: "emberfall abc", author: { id: "123", bot: true } }], "abc")).toBeNull();
  });
});
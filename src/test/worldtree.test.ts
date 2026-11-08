import { describe, expect, it } from "vitest";
import type { Hero } from "@/game/data";
import {
  BOUNTY_KINDS,
  bountyBoard,
  bountyLedger,
  bountyProgress,
  bountyReady,
  bountiesReady,
  claimBounty,
  claimVault,
  openVault,
  recordBounty,
  vaultClaimed,
  worldTreeDay,
} from "@/game/worldtree";

const hero = (over: Partial<Hero> = {}) =>
  ({ name: "Tester", level: 10, gold: 0, ...over }) as Hero;

const day = worldTreeDay();

describe("the world tree bounty board", () => {
  it("posts three bounties a day from the four raid kinds", () => {
    const board = bountyBoard(10);
    expect(board).toHaveLength(3);
    expect(new Set(board.map((b) => b.kind)).size).toBe(3);
    for (const bounty of board) {
      expect(BOUNTY_KINDS).toContain(bounty.kind);
      expect(bounty.need).toBeGreaterThan(0);
      expect(bounty.gold).toBeGreaterThan(0);
    }
  });

  it("keeps the same board all day and rotates it the next day", () => {
    expect(bountyBoard(10, "2026-11-08")).toEqual(bountyBoard(10, "2026-11-08"));
    expect(bountyBoard(10, "2026-11-08").map((b) => b.kind)).not.toEqual(
      bountyBoard(10, "2026-11-09").map((b) => b.kind),
    );
  });

  it("pays more as the hero levels", () => {
    const low = bountyBoard(5).reduce((sum, b) => sum + b.gold, 0);
    const high = bountyBoard(60).reduce((sum, b) => sum + b.gold, 0);
    expect(high).toBeGreaterThan(low * 2);
  });

  it("counts cleared raids and only pays a finished bounty once", () => {
    const h = hero();
    const bounty = bountyBoard(h.level)[0]!;
    for (let i = 0; i < bounty.need; i += 1) recordBounty(h, bounty.kind);

    expect(bountyProgress(h, bounty.kind)).toBe(bounty.need);
    expect(bountyReady(h, bounty)).toBe(true);
    expect(bountiesReady(h, h.level)).toBe(1);

    expect(claimBounty(h, bounty)).toBe(bounty.gold);
    expect(h.gold).toBe(bounty.gold);
    expect(claimBounty(h, bounty)).toBe(0);
    expect(h.gold).toBe(bounty.gold);
  });

  it("refuses to pay a bounty that is still short", () => {
    const h = hero();
    const bounty = bountyBoard(h.level)[0]!;
    recordBounty(h, bounty.kind);
    expect(claimBounty(h, bounty)).toBe(0);
    expect(h.gold).toBe(0);
  });

  it("starts a fresh ledger when the UTC day rolls over", () => {
    const h = hero({
      worldTree: {
        bounties: { day: "2026-11-07", gold: 9, ore: 3, boss: 1, castle: 0, claimed: [] },
      },
    });
    const ledger = bountyLedger(h);
    expect(ledger.day).toBe(day);
    expect(ledger.gold).toBe(0);
    recordBounty(h, "ore");
    expect(bountyProgress(h, "ore")).toBe(1);
  });
});

describe("sealed vaults", () => {
  it("opens once per hero and pays gold and forge stock", () => {
    const h = hero({ gold: 50 });
    expect(vaultClaimed(h, "heartlands:cache:0")).toBe(false);
    const reward = { gold: 400, mats: { ore: 6, essence: 1 } };

    expect(openVault(h, "heartlands:cache:0", reward)).toBe(true);
    expect(h.gold).toBe(450);
    expect(h.mats).toEqual({ ore: 6, essence: 1 });
    expect(vaultClaimed(h, "heartlands:cache:0")).toBe(true);

    expect(openVault(h, "heartlands:cache:0", reward)).toBe(false);
    expect(h.gold).toBe(450);
    expect(claimVault(h, "heartlands:cache:0")).toBe(false);
  });
});

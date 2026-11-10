import { describe, expect, it } from "vitest";
import { autoPick } from "@/game/Battle";
import type { TSkill, Unit } from "@/game/combat";

/**
 * AUTO has to take the hero's turn every time, or the fight sits open on a skill that cannot be
 * cast. These are the picks the battle screen makes, in the order it makes them.
 */

const skill = (id: string, over: Partial<TSkill> = {}): TSkill => ({
  id, name: id, desc: "", icon: "sword", mult: 1, cd: 0, cost: 0, target: "enemy", ...over,
});

const foes = [{ id: "F0" }, { id: "F1" }, { id: "F2" }] as Unit[];

describe("the auto-battle picker", () => {
  it("prefers the hardest ready attack and hits every foe with an area skill", () => {
    // 2.4 on one foe beats 0.5 on each of three; 0.9 on each of three beats it again.
    const kit = [skill("hit"), skill("heavy", { mult: 2.4 }), skill("storm", { mult: 0.5, target: "all" })];
    expect(autoPick(kit, () => false, foes)?.id).toBe("heavy");
    expect(autoPick([...kit, skill("quake", { mult: 0.9, target: "all" })], () => false, foes)?.id).toBe("quake");
    expect(autoPick(kit, (k) => k.id === "heavy", foes)?.id).toBe("storm");
  });

  it("casts a heal or a guard when every attack is on cooldown", () => {
    const kit = [skill("hit"), skill("mend", { mult: 0, target: "self", heal: 0.3 })];
    expect(autoPick(kit, (k) => k.id !== "mend", foes)?.id).toBe("mend");
  });

  it("answers nothing when nothing can be cast, which switches AUTO off instead of looping", () => {
    const kit = [skill("hit"), skill("heavy", { mult: 2.4 })];
    expect(autoPick(kit, () => true, foes)).toBeNull();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";
import { GuildHallScene } from "@/game/GuildHallScene";
import { GuildReliquary, GuildSkillTower } from "@/game/GuildTower";
import { GUILD_SKILLS, guildSkillPrice, learnGuildSkill } from "@/game/guild-tower";

describe("the guild courtyard", () => {
  it("offers every room of the hall as a lane", () => {
    const onSelect = vi.fn();
    render(<GuildHallScene name="Ember Wardens" level={3} members={12} power={48210} role="leader"
      relics={{ woken: 2, total: 7 }} location="headquarters" onSelect={onSelect} />);
    for (const lane of ["Guild Headquarters", "Guild Merchant", "Master Skill Tower", "Reliquary", "Hall of Records"]) {
      expect(screen.getByRole("tab", { name: lane })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("tab", { name: "Hall of Records" }));
    expect(onSelect).toHaveBeenCalledWith("records");
  });
});

describe("the guild skill tower", () => {
  afterEach(() => setHero(null));

  it("sells endless ranks with a gold price beside the coins", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e9;
    hero.guildCoins = 1e9;
    for (let i = 0; i < 18; i++) learnGuildSkill(hero, GUILD_SKILLS[0].id);
    setHero(hero);
    render(<GuildSkillTower />);

    expect(screen.getByText("Rank 18")).toBeInTheDocument();
    const upgrade = screen.getAllByRole("button", { name: /Upgrade ×1/ });
    expect(upgrade.length).toBe(GUILD_SKILLS.length);
    expect(upgrade[0].textContent).toContain("c +");
    expect(guildSkillPrice(GUILD_SKILLS[0], 18).gold).toBeGreaterThan(0);
    expect(screen.queryByText(/Max rank/i)).not.toBeInTheDocument();
  });

  it("shows the reliquary's next heirloom and its progress", () => {
    const hero = newHero("Tester", "warrior");
    hero.gold = 1e9;
    hero.guildCoins = 1e9;
    learnGuildSkill(hero, GUILD_SKILLS[0].id, 3);
    setHero(hero);
    render(<GuildReliquary />);
    expect(screen.getByText(/0\/7 relics woken/)).toBeInTheDocument();
    expect(screen.getByText("Ember Banner")).toBeInTheDocument();
  });
});

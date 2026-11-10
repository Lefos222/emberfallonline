import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { newHero } from "@/game/data";
import { setHero } from "@/game/store";
import { GuildHallScene } from "@/game/GuildHallScene";
import { GuildReliquary, GuildSkillTower } from "@/game/GuildTower";
import { GUILD_SKILLS, guildSkillPrice, learnGuildSkill } from "@/game/guild-tower";

describe("the guild courtyard", () => {
  it("folds the painted courtyard away until the map is asked for", () => {
    render(<GuildHallScene name="Ember Wardens" level={3} members={12} power={48210} role="leader"
      relics={{ woken: 2, total: 7 }} location="headquarters" onSelect={vi.fn()} />);
    expect(screen.queryByRole("tab", { name: "Guild Merchant" })).toBeNull();
    expect(screen.getByRole("button", { name: "Map" })).toBeInTheDocument();
  });

  it("offers every painted building of the hall", () => {
    const onSelect = vi.fn();
    render(<GuildHallScene name="Ember Wardens" level={3} members={12} power={48210} role="leader"
      relics={{ woken: 2, total: 7 }} location="headquarters" onSelect={onSelect} court />);
    for (const building of ["Guild Headquarters", "Guild Merchant", "Master Skill Tower", "Guild Wars"]) {
      expect(screen.getAllByRole("tab", { name: building }).length).toBeGreaterThan(0);
    }
    fireEvent.click(screen.getAllByRole("tab", { name: "Guild Wars" })[0]);
    expect(onSelect).toHaveBeenCalledWith("wars");
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

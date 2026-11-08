import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { SOUNDTRACKS, readAudioSettings, saveAudioSettings, soundtrackUrl, type AudioSettings } from "@/game/audio";
import { CATALOGUE_DISCOUNT, cataloguePrice } from "@/game/catalogue";
import { makeItem, newHero, stageRewards } from "@/game/data";
import { GOLD_GAIN_BONUS, goldGain, scaledGold } from "@/game/gold";
import { SettingsPanel } from "@/game/Settings";

function Harness() {
  const [settings, setSettings] = useState<AudioSettings>(() => readAudioSettings());
  return <SettingsPanel settings={settings} onChange={(p) => setSettings(saveAudioSettings({ ...settings, ...p }))} onClose={() => {}} />;
}

afterEach(() => localStorage.clear());

describe("music settings", () => {
  it("opens on the original soundtrack at the default volume", () => {
    const s = readAudioSettings();
    expect(s).toEqual({ muted: false, volume: 0.35, track: "original" });
    expect(soundtrackUrl("original")).toBe(SOUNDTRACKS[0].url);
  });

  it("remembers volume, mute and the chosen soundtrack", () => {
    saveAudioSettings({ muted: true, volume: 0.8, track: "sibling-showdown" });
    expect(readAudioSettings()).toEqual({ muted: true, volume: 0.8, track: "sibling-showdown" });
    expect(soundtrackUrl("sibling-showdown")).toBe("/audio/sibling-showdown.mp3");
  });

  it("switches soundtrack and volume from the settings panel", () => {
    render(<Harness />);

    expect(screen.getByText("Original theme")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sibling Showdown/ }));
    expect(readAudioSettings().track).toBe("sibling-showdown");
    expect(screen.getByRole("button", { name: /Sibling Showdown/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("Now playing")).toHaveLength(1);

    fireEvent.change(screen.getByLabelText("Music volume"), { target: { value: "80" } });
    expect(readAudioSettings().volume).toBeCloseTo(0.8);
    expect(screen.getByText("80%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /On/ }));
    expect(readAudioSettings().muted).toBe(true);
  });
});

describe("economy tuning", () => {
  it("cuts 70% off catalogue gear", () => {
    const piece = makeItem("warrior", 10, 0, "weapon");
    const full = scaledGold(Math.round((12000 + piece.ilvl * 1400) * (1 + piece.rarity * 0.9)), 1);
    expect(CATALOGUE_DISCOUNT).toBe(0.7);
    expect(cataloguePrice(piece, 1)).toBe(Math.round(full * 0.3));
  });

  it("pays 29% more gold for battles, scaling with level", () => {
    expect(GOLD_GAIN_BONUS).toBe(0.29);
    expect(goldGain(1000)).toBe(1290);
    expect(stageRewards(1).gold).toBe(goldGain(Math.round(6 + 1.5)));
    expect(newHero("Tuner", "mage").gold).toBe(100);
  });
});

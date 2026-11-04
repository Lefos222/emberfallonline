import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel } from "@/game/ui";
import { SynthesisPanel } from "@/game/Synthesis";
import { newHero, type Hero } from "@/game/data";
import { SYNTH_SLOTS, craftSynth, synthCost, wearSynth } from "@/game/synthesis";

// TEMPORARY sandbox-only route for eyeballing the Synthesis tab. Never committed.
export const Route = createFileRoute("/__synth-preview")({
  component: Preview,
});

function demoHero(): Hero {
  const h = newHero("Ashbringer", "warrior");
  h.level = 42;
  h.mats = { ore: 520, hide: 310, bloom: 90, essence: 160, fragment: 70, crystal: 30, sigil: 44, bossCore: 28, starshard: 30 };
  for (const slot of SYNTH_SLOTS) {
    if (slot === "helmet" || slot === "chest" || slot === "weapon" || slot === "ring1") {
      h.mats = { ...(h.mats ?? {}) };
      for (const [m, n] of Object.entries(synthCost(1, slot))) h.mats[m as keyof typeof h.mats] = ((h.mats[m as keyof typeof h.mats] ?? 0) as number) + (n as number);
      craftSynth(h, 1, slot);
    }
  }
  wearSynth(h, 1, "helmet");
  wearSynth(h, 1, "chest");
  wearSynth(h, 1, "weapon");
  return h;
}

function Preview() {
  const [hero, setHero] = useState(demoHero);
  return <Panel title="Forge · Crafting" onClose={() => {}} wide>
    <div role="tablist" className="mb-3 flex flex-wrap gap-1">
      <button className="btn-ghost px-2.5 py-1 text-xs">Standard recipes</button>
      <button className="btn-ghost px-2.5 py-1 text-xs">Ancestral</button>
      <button className="btn-gold px-2.5 py-1 text-xs">Synthesis</button>
    </div>
    <SynthesisPanel hero={hero} gender="female" act={(fn) => {
      const copy = structuredClone(hero);
      const err = fn(copy);
      setHero(copy);
      return err;
    }} />
  </Panel>;
}

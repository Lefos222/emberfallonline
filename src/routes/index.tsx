import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EmberFall Online — Fantasy Browser MMORPG" },
      { name: "description", content: "Create a Knight, Mage or Archer, rule your castle, loot endless gear and battle real players in EmberFall Online." },
      { property: "og:title", content: "EmberFall Online — Fantasy Browser MMORPG" },
      { property: "og:description", content: "A persistent dark-fantasy browser MMORPG with gear, daily bosses, guild activities and player trading." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-background" />;
  return <Game />;
}

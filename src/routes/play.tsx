import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play EmberFall Online — Enter Your Castle" },
      { name: "description", content: "Sign in, pick your hero and enter your castle in EmberFall Online." },
      { property: "og:title", content: "Play EmberFall Online" },
      { property: "og:description", content: "Pick your hero and enter your castle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Play,
});

function Play() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-background" />;
  return <Game />;
}

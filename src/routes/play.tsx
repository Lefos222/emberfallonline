import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Game } from "@/game/Game";
import { AstrionIntro } from "@/astrion/Intro";

export const Route = createFileRoute("/play")({
  staticData: { sitemap: true },
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
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    setMounted(true);
  }, []);
  const done = useCallback(() => setIntro(false), []);
  if (!mounted) return <div className="min-h-screen bg-background" />;
  return intro ? <AstrionIntro onDone={done} /> : <Game />;
}

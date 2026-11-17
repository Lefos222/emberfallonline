import emberfallCover from "@/assets/arena-colosseum.jpg";

/** Astrion Entertainment catalogue. Add a new entry here to list a new game. */
export type AstrionGame = {
  id: string;
  title: string;
  genre: string;
  tagline: string;
  cover: string;
  status: "live" | "soon";
  href?: string;
};

export const GAMES: AstrionGame[] = [
  {
    id: "emberfall",
    title: "EmberFall Online",
    genre: "Fantasy MMORPG",
    tagline: "Raise a hero, build a castle and fight with your guild.",
    cover: emberfallCover,
    status: "live",
    href: "/",
  },
  { id: "next-1", title: "Untitled Project", genre: "In development", tagline: "Our next browser world is being built.", cover: "", status: "soon" },
  { id: "next-2", title: "Untitled Project", genre: "In development", tagline: "More to come from the team.", cover: "", status: "soon" },
];

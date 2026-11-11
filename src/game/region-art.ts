import frozenCrown from "@/assets/regions/frozen-crown.jpg";
import obsidianWastes from "@/assets/regions/obsidian-wastes.jpg";
import autumnwood from "@/assets/regions/autumnwood.jpg";
import ashenWaste from "@/assets/regions/ashen-waste.jpg";
import heartlands from "@/assets/regions/heartlands.jpg";
import highreach from "@/assets/regions/highreach.jpg";
import starfall from "@/assets/regions/starfall.jpg";
import sunkenIsles from "@/assets/regions/sunken-isles.jpg";
import mireFen from "@/assets/regions/mire-fen.jpg";
import shatteredCoast from "@/assets/regions/shattered-coast.jpg";

/** Each World Tree region's own painted vista, keyed by its region id. */
export const REGION_ART: Record<string, string> = {
  "frozen-crown": frozenCrown,
  "obsidian-wastes": obsidianWastes,
  autumnwood,
  "ashen-waste": ashenWaste,
  heartlands,
  highreach,
  starfall,
  "sunken-isles": sunkenIsles,
  "mire-fen": mireFen,
  "shattered-coast": shatteredCoast,
};

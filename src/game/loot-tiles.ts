import { MATS, type Mat } from "./crafting";

/** One picture tile in the after-fight loot window. */
export type LootTile =
  | { kind: "gold" | "xp" | "renown" | "diamond" | "shards" | "scroll" | "potion" | "goldChest" | "gemChest" | "other"; amount: string; label: string }
  | { kind: "mat"; mat: Mat; amount: string; label: string }
  | { kind: "stone"; level: number; amount: string; label: string };

/** Turns the reward text lines into picture tiles; lines that are not rewards stay as short notes. */
export function lootTiles(lines: string[]): { tiles: LootTile[]; notes: string[] } {
  const tiles: LootTile[] = [];
  const notes: string[] = [];
  const matByName = (Object.keys(MATS) as Mat[]).map((m) => [m, MATS[m].name.toLowerCase()] as const)
    .sort((a, b) => b[1].length - a[1].length);
  for (const raw of lines) {
    const line = raw.trim();
    const lower = line.toLowerCase();
    if (/chest/.test(lower) && /found|vault/.test(lower)) {
      tiles.push({ kind: /gem/.test(lower) ? "gemChest" : "goldChest", amount: "1", label: line.split(/ found| \(/)[0] });
      continue;
    }
    const m = line.match(/^\+\s*([\d.,]+[kKmM]?)\s+(.*)$/);
    if (!m) { notes.push(line); continue; }
    const amount = m[1];
    const rest = m[2].replace(/\s*[—-].*$/, "").replace(/[✦]/g, "").trim();
    const r = rest.toLowerCase();
    const stone = r.match(/lv\s*(\d+)\s+enchantment stone/);
    if (stone) { tiles.push({ kind: "stone", level: Number(stone[1]), amount, label: rest }); continue; }
    if (/^gold\b/.test(r)) { tiles.push({ kind: "gold", amount, label: "Gold" }); continue; }
    if (/^(xp|exp|experience)\b/.test(r)) { tiles.push({ kind: "xp", amount, label: "XP" }); continue; }
    if (/renown/.test(r)) { tiles.push({ kind: "renown", amount, label: "Renown" }); continue; }
    if (/diamond/.test(r)) { tiles.push({ kind: "diamond", amount, label: rest }); continue; }
    if (/soul shard/.test(r)) { tiles.push({ kind: "shards", amount, label: "Soul Shards" }); continue; }
    if (/scroll/.test(r)) { tiles.push({ kind: "scroll", amount, label: rest }); continue; }
    if (/potion/.test(r)) { tiles.push({ kind: "potion", amount, label: rest }); continue; }
    if (/battle essence/.test(r)) { tiles.push({ kind: "mat", mat: "essence", amount, label: rest }); continue; }
    const singular = r.replace(/s$/, "");
    const hit = matByName.find(([, n]) => r.startsWith(n) || singular.startsWith(n));
    if (hit) { tiles.push({ kind: "mat", mat: hit[0], amount, label: MATS[hit[0]].name }); continue; }
    tiles.push({ kind: "other", amount, label: rest });
  }
  return { tiles, notes };
}

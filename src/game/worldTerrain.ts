import { TERRAIN, WORLD_TILE, terrainAt } from "./worldmap";

/**
 * The painted ground of the endless map.
 *
 * The texture is a seamless 4096-unit tile: the terrain function wraps every eight
 * noise cells, so tiles meet without a seam and the map can repeat forever.
 */
const TILE_PX = 512;

export function buildTerrainTile(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_PX;
  canvas.height = TILE_PX;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(TILE_PX, TILE_PX);
  const data = image.data;

  for (let py = 0; py < TILE_PX; py += 1) {
    for (let px = 0; px < TILE_PX; px += 1) {
      const [r, g, b] =
        TERRAIN[terrainAt((px / TILE_PX) * WORLD_TILE, (py / TILE_PX) * WORLD_TILE)].tint;
      // A little deterministic grain keeps the ground from reading as flat colour.
      const grain = (((px * 374761393 + py * 668265263) >>> 0) % 15) - 7;
      const i = (py * TILE_PX + px) * 4;
      data[i] = r + grain;
      data[i + 1] = g + grain;
      data[i + 2] = b + grain;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

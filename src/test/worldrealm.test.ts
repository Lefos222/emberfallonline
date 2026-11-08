import { describe, expect, it } from "vitest";
import {
  CASTLE_CAPACITY,
  MAX_ZOOM,
  WORLD_H,
  WORLD_REGIONS,
  WORLD_SITES,
  WORLD_W,
  clampCamera,
  clusterMarkers,
  fitZoom,
  levelAt,
  nearestRuin,
  regionAt,
  sitesInView,
  zoomCamera,
  type SiteKind,
} from "@/game/worldmap";

const size = { w: 1200, h: 800 };
const toScreen = (x: number, y: number) => ({ left: x / 10, top: y / 10 });

describe("the bounded realm", () => {
  it("is one painted map with an edge", () => {
    expect(WORLD_W).toBeGreaterThan(0);
    expect(WORLD_H).toBeGreaterThan(0);
    expect(WORLD_W / WORLD_H).toBeCloseTo(1376 / 768, 2);
  });

  it("keeps every place of interest inside the frame", () => {
    for (const site of WORLD_SITES) {
      expect(site.x).toBeGreaterThanOrEqual(0);
      expect(site.x).toBeLessThanOrEqual(WORLD_W);
      expect(site.y).toBeGreaterThanOrEqual(0);
      expect(site.y).toBeLessThanOrEqual(WORLD_H);
    }
  });

  it("fills the map with far more than a handful of places", () => {
    const kinds = new Set(WORLD_SITES.map((s) => s.kind));
    expect(WORLD_SITES.length).toBeGreaterThan(300);
    const expected: SiteKind[] = ["gold", "ore", "boss", "keep", "ruin", "landmark", "cache"];
    for (const kind of expected) expect(kinds.has(kind)).toBe(true);
    expect(WORLD_SITES.filter((s) => s.id.startsWith("landmark:"))).toHaveLength(22);
  });

  it("scatters one-time sealed vaults across the realm", () => {
    const vaults = WORLD_SITES.filter((s) => s.kind === "cache");
    expect(vaults.length).toBeGreaterThanOrEqual(20);
    // A vault pays a hoard, not a raid allowance, so it carries no raid node.
    for (const vault of vaults) expect(vault.node).toBeUndefined();
  });

  it("gives each site a unique id and a raid node where one pays out", () => {
    expect(new Set(WORLD_SITES.map((s) => s.id)).size).toBe(WORLD_SITES.length);
    for (const site of WORLD_SITES) {
      if (site.kind === "gold" || site.kind === "ore" || site.kind === "boss") {
        expect(site.node).toBeTruthy();
      }
    }
  });

  it("holds thousands of player castles", () => {
    expect(CASTLE_CAPACITY).toBeGreaterThanOrEqual(2000);
  });

  it("makes the centre of the realm safe and its edges deadly", () => {
    expect(levelAt(WORLD_W / 2, WORLD_H / 2)).toBe(1);
    expect(levelAt(0, 0)).toBeGreaterThan(levelAt(WORLD_W / 2, WORLD_H / 2));
    expect(levelAt(WORLD_W, WORLD_H)).toBeGreaterThan(30);
  });

  it("names the biome under a point", () => {
    expect(regionAt(WORLD_W / 2, WORLD_H / 2).id).toBe("heartlands");
    expect(WORLD_REGIONS.map((r) => r.id)).toContain(regionAt(10, 10).id);
  });

  it("only returns the sites inside the view", () => {
    const inView = sitesInView(WORLD_W / 2 - 200, WORLD_H / 2 - 200, WORLD_W / 2 + 200, WORLD_H / 2 + 200);
    expect(inView.length).toBeGreaterThan(0);
    for (const site of inView) {
      expect(Math.abs(site.x - WORLD_W / 2)).toBeLessThanOrEqual(200);
    }
    expect(nearestRuin(WORLD_W / 2, WORLD_H / 2)?.kind).toBe("ruin");
  });
});

describe("the camera", () => {
  it("frames the whole realm at the fit zoom", () => {
    const z = fitZoom(size);
    const cam = clampCamera({ x: WORLD_W / 2, y: WORLD_H / 2, z }, size);
    expect(cam.z).toBeCloseTo(z);
    expect(cam.x).toBeCloseTo(WORLD_W / 2);
  });

  it("never shows ground past the edge", () => {
    const cam = clampCamera({ x: -5000, y: 99999, z: 1 }, size);
    expect(cam.x).toBeGreaterThanOrEqual(size.w / 2 / cam.z);
    expect(cam.y).toBeLessThanOrEqual(WORLD_H - size.h / 2 / cam.z);
    expect(clampCamera({ x: 0, y: 0, z: 99 }, size).z).toBe(MAX_ZOOM);
  });

  it("keeps the zoomed point under the cursor", () => {
    const cam = zoomCamera({ x: WORLD_W / 2, y: WORLD_H / 2, z: 0.4 }, size, 2, 900, 200);
    const before = { x: WORLD_W / 2 + (900 - size.w / 2) / 0.4, y: WORLD_H / 2 + (200 - size.h / 2) / 0.4 };
    expect((before.x - cam.x) * cam.z + size.w / 2).toBeCloseTo(900, 6);
    expect((before.y - cam.y) * cam.z + size.h / 2).toBeCloseTo(200, 6);
  });
});

describe("marker clustering", () => {
  const items = [
    { id: "a", x: 100, y: 100 },
    { id: "b", x: 105, y: 102 },
    { id: "c", x: 2000, y: 1500 },
  ];

  it("keeps every marker apart when zoomed in", () => {
    expect(clusterMarkers(items, toScreen, 0)).toHaveLength(3);
  });

  it("groups markers that would share a few pixels", () => {
    const clusters = clusterMarkers(items, toScreen, 40);
    expect(clusters).toHaveLength(2);
    const packed = clusters.find((c) => c.items.length === 2)!;
    expect(packed.x).toBeCloseTo(102.5);
    expect(packed.y).toBeCloseTo(101);
  });
});


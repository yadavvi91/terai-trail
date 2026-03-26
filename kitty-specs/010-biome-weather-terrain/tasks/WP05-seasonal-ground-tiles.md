---
work_package_id: WP05
title: Seasonal Ground Tile Colors
lane: "doing"
dependencies: [WP01, WP02]
base_branch: 010-biome-weather-terrain-WP05-merge-base
base_commit: a541079ab3db5197f5833422ecfd7ea1b5a5d6e7
created_at: '2026-03-26T20:47:18.490817+00:00'
subtasks:
- T021
- T022
- T023
phase: Phase 3 - Polish
assignee: ''
agent: ''
shell_pid: "29676"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-26T19:48:26Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-06
- FR-07
---

# Work Package Prompt: WP05 – Seasonal Ground Tile Colors

## ⚠️ IMPORTANT: Review Feedback Status

Check `review_status` in frontmatter. If `has_feedback`, address Review Feedback section first.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

### Requirement Refs
- FR-06, FR-07

## Objectives & Success Criteria

Isometric ground tiles change color to reflect the in-game season. Spring grasses are fresh
green, summer grasses turn golden, late summer is dry gold, and fall is brown-red. The
scroll/wrap system is completely unchanged.

- Ground tile grass colors match `BIOME_COLORS.SEASON_GRASS` for the current season
- Trail center and trail-edge colors do NOT change (they are dirt, not grass)
- Color change triggers at the next daily tick after month boundary
- Parallax scroll and wrap behavior unchanged

## Context & Constraints

**Implement with**: `spec-kitty implement WP05 --base WP02`

**Depends on**:
- WP01: `Season` enum, `BIOME_COLORS.SEASON_GRASS`, `BIOME_COLORS.SEASON_GRASS_ALT`
- WP02: `this.currentSeason` property on TravelScene (WP02 writes it; WP05 reads it)

**Ground tile architecture** (study `buildGroundAndTrail()` first):
- Two Graphics passes (`pass = 0` and `pass = 1`) create two copies of the ground tile grid
- Stored in `groundLayers[]` as `ScrollLayer` objects with `baseX`, `baseY`, `width`, `speed`
- Tiles are drawn in local coordinates; `g.setPosition(baseX, baseY)` applies the scroll transform
- CRITICAL: `clear()` + redraw at local coords is scroll-safe because `setPosition` is the transform

**Tile drawing loop** (current hardcoded colors to replace):
```typescript
const grassColors = [0x3a7d30, 0x2d6a28, 0x347530, 0x3a8028];  // REPLACE with season colors
```

**Colors that must NOT change seasonally**:
- Trail tile: `0x9e7b3a` (dirt brown)
- Wheel ruts: `0x6a4e20`
- Trail edge: `0x4a8030` + `0x7a6830`

---

## Subtasks & Detailed Guidance

### Subtask T021 – Extract `drawGroundTiles(g, season)` from `buildGroundAndTrail()`

**Purpose**: Move the tile drawing loop into a standalone method so it can be called both
at startup and during `refreshGroundLayers()`.

**Steps**:
1. Identify the tile drawing loop inside `buildGroundAndTrail()` — the nested `for row/col` loop
   that calls `drawIsoTile()` and `drawIsoTree()`.

2. Extract it into a new private method:
```typescript
private drawGroundTiles(g: Phaser.GameObjects.Graphics, season: Season): void {
    const cols = 28;
    const rows = 10;
    const tileW = TILE_WIDTH;
    const tileH = TILE_HEIGHT;
    const middleRow = Math.floor(rows / 2);

    // Seasonal grass colors (replace hardcoded array)
    const grassColors = BIOME_COLORS.SEASON_GRASS_ALT[season];
    const flowerColors = [0xffdd44, 0xff8844, 0xff6644];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const sx = (row - col) * (tileW / 2);
            const sy = (col + row) * (tileH / 2);

            const isTrail = Math.abs(row - middleRow) <= 1;
            const isTrailEdge = Math.abs(row - middleRow) === 2;

            if (isTrail) {
                drawIsoTile(g, sx, sy, 0x9e7b3a);  // UNCHANGED — dirt
                if (row === middleRow) {
                    drawIsoTile(g, sx, sy, 0x6a4e20, 0.4, tileW * 0.5, tileH * 0.5);
                }
            } else if (isTrailEdge) {
                drawIsoTile(g, sx, sy, 0x4a8030);   // UNCHANGED — trail edge
                drawIsoTile(g, sx, sy, 0x7a6830, 0.3, tileW * 0.7, tileH * 0.7);
            } else {
                const ci = (col * 7 + row * 13) % grassColors.length;
                drawIsoTile(g, sx, sy, grassColors[ci]);
                if ((col * 3 + row * 7) % 11 === 0) {
                    g.fillStyle(flowerColors[(col + row) % 3], 0.8);
                    g.fillCircle(sx, sy - 2, 2.5);
                }
            }
        }
    }

    // Trees alongside the trail (keep existing positions and logic unchanged)
    const treeOffsets = [
        [3, 0], [7, 0], [12, 0], [18, 0], [24, 0],
        [3, rows - 1], [8, rows - 1], [14, rows - 1], [20, rows - 1], [25, rows - 1],
        [5, 1], [10, 1], [16, 1], [22, 1],
        [6, rows - 2], [11, rows - 2], [17, rows - 2], [23, rows - 2],
    ];
    treeOffsets.forEach(([col, row]) => {
        const tsx = (row - col) * (tileW / 2);
        const tsy = (col + row) * (tileH / 2);
        const isPine = ((col + row) % 3 === 0);
        drawIsoTree(g, tsx, tsy - 4, 45 + (col * 7) % 30, 0x234d1a, isPine);
    });
}
```

3. Update `buildGroundAndTrail()` to call `this.drawGroundTiles(g, this.currentSeason)` instead of inlining the loop.

4. Keep the grid origin computation and `g.setPosition(bx, by)` in `buildGroundAndTrail()` — UNCHANGED.

**Files**: `src/scenes/TravelScene.ts`
**Imports needed**: `Season` from `'../utils/types'`, `BIOME_COLORS` from `'../utils/constants'`.

---

### Subtask T022 – Add `refreshGroundLayers()`

**Purpose**: Clear and redraw all ground Graphics objects with the current season's grass colors.

**Steps**:
1. Add private method:
```typescript
private refreshGroundLayers(): void {
    this.groundLayers.forEach(layer => {
        layer.g.clear();
        this.drawGroundTiles(layer.g, this.currentSeason);
        // Position is preserved: setPosition() in update() will reapply baseX/baseY
        // No need to reset baseX/baseY — they track the current scroll position
        layer.g.setPosition(layer.baseX, layer.baseY);
    });
}
```

**CRITICAL**: Unlike `refreshParallaxLayers()` in WP02, ground layers do NOT need to reset
`baseX`/`baseY`. The tile drawing uses local coordinates derived from `(row-col)` and
`(col+row)` math — always relative to the Graphics object's local origin (0,0). The Graphics
object's world position is `baseX`/`baseY` (set by `setPosition`). So after `clear()` + redraw,
calling `layer.g.setPosition(layer.baseX, layer.baseY)` correctly repositions it at the
current scroll position.

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T023 – Hook season change into `dailyTick()` to trigger `refreshGroundLayers()`

**Purpose**: Ground tiles update when the season changes (month boundary crossed).

**Steps**:
1. In `dailyTick()`, in the biome/season change detection block (added by WP02), extend it:
```typescript
const newBiome = getBiome(gs.milesTraveled);
const newSeason = getSeason(gs.currentDate.getMonth());
if (newBiome !== this.currentBiome || newSeason !== this.currentSeason) {
    this.currentBiome = newBiome;
    this.currentSeason = newSeason;
    this.refreshParallaxLayers();  // from WP02
    this.refreshGroundLayers();    // from WP05 (add this line)
}
```

If WP02 is not yet merged, add the full detection block:
```typescript
const newSeason = getSeason(gs.currentDate.getMonth());
if (newSeason !== this.currentSeason) {
    this.currentSeason = newSeason;
    this.refreshGroundLayers();
}
```

**Files**: `src/scenes/TravelScene.ts`

---

## Risks & Mitigations

- **Ground tile wrap broken after redraw**: Ground tiles are drawn in local space (local coords
  relative to Graphics object). `baseX`/`baseY` are preserved as the scroll transform.
  After `clear()` + redraw + `setPosition(baseX, baseY)`, the `update()` loop continues
  scrolling from the current position. Test by triggering a season change mid-scroll.
- **Flower colors accidentally change**: Flower rendering doesn't use `grassColors` — it uses
  a fixed `flowerColors` array. Flowers stay the same color regardless of season (acceptable).
- **Tree colors**: Tree colors are hardcoded in `drawGroundTiles()` (`0x234d1a`, `0x234d1a`).
  These don't change seasonally — only the grass does. This is intentional scope limitation.
- **Month boundary edge case**: `getSeason(month)` for month 3 (April) returns SPRING.
  Game starts April 1 → `currentSeason = SPRING` at startup. No boundary surprise at start.

## Review Guidance

1. `npx tsc --noEmit` — zero errors.
2. Browser: `GameState.getInstance().currentDate = new Date(1848, 7, 1)` (August) → wait for
   next daily tick → ground tiles shift from green toward dry gold.
3. Set to `new Date(1848, 8, 1)` (September) → brown-red ground.
4. Verify trail center (dirt) and trail edges are unchanged (not affected by season).
5. Verify scroll/wrap continues correctly after season change by watching for 10+ seconds.

## Activity Log

- 2026-03-26T19:48:26Z – system – lane=planned – Prompt created.

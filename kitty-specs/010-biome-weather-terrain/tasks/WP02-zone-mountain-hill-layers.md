---
work_package_id: WP02
title: Zone-Reactive Mountain & Hill Parallax Layers
lane: "doing"
dependencies: [WP01]
base_branch: 010-biome-weather-terrain-WP01
base_commit: 590e56f99d77c0cc6ef92e72ca9cdff7f8d281b4
created_at: '2026-03-26T20:25:58.285029+00:00'
subtasks:
- T004
- T005
- T006
- T007
- T008
- T009
- T010
phase: Phase 2 - Core Rendering
assignee: ''
agent: ''
shell_pid: "94790"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-26T19:48:26Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-01
- FR-02
- FR-03
- FR-07
---

# Work Package Prompt: WP02 – Zone-Reactive Mountain & Hill Parallax Layers

## ⚠️ IMPORTANT: Review Feedback Status

Check `review_status` in frontmatter. If `has_feedback`, address the Review Feedback section below first.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

### Requirement Refs
- FR-01, FR-02, FR-03, FR-07

## Objectives & Success Criteria

Modify `TravelScene.ts` so that:
- Mountains are invisible at mile 0, fade in from mile 300–640, show grey-blue snowy peaks from mile 640–1400, then show dark green ridges (no snow) in the Oregon zone.
- Hills change color palette by biome zone and season.
- Parallax scroll speeds, wrap logic, and baseX/baseY math are completely unchanged.

## Context & Constraints

**Implement with**: `spec-kitty implement WP02 --base WP01`

**Primary file**: `src/scenes/TravelScene.ts` (~450 lines currently)

**Imports needed** (add to top of TravelScene.ts):
```typescript
import { Biome, Season } from '../utils/types';
import { getBiome, getSeason, getMountainAlpha } from '../utils/biome';
import { BIOME_COLORS } from '../utils/constants';
```

**Critical constraint — do NOT change**:
- `mtnLayers` speed: `0.18`, Y-ratio: `0.06`
- `hillLayers` speed: `0.55`, Y-ratio: `0.15`
- `groundLayers` speed: `1.0`
- Wrapping logic (the `if (layer.baseX < -(layer.width))` blocks)
- `baseX` / `baseY` tracking variables

**How Phaser Graphics positioning works** (CRITICAL):
`layer.g.setPosition(baseX, baseY)` applies a *transform* to the Graphics object.
All draw calls (`fillRect`, `beginPath`, etc.) operate in *local space* (relative to the Graphics object's origin).
Therefore: calling `g.clear()` + redrawing at the same local coordinates is safe — the scroll
position stored in `baseX`/`baseY` is preserved by the subsequent `setPosition` call in `update()`.
**Do NOT reset `baseX` or `baseY` when redrawing.**

---

## Subtasks & Detailed Guidance

### Subtask T004 – Add `currentBiome` and `currentSeason` properties to TravelScene

**Purpose**: Track the last-known biome/season so `dailyTick()` can detect changes and
trigger a redraw only when necessary.

**Steps**:
1. Add two private properties to the TravelScene class (near the other private declarations):
```typescript
private currentBiome: Biome = Biome.PRAIRIE;
private currentSeason: Season = Season.SPRING;
```
2. Initialise them in `create()` before `buildParallax()`:
```typescript
const gs = GameState.getInstance();
this.currentBiome = getBiome(gs.milesTraveled);
this.currentSeason = getSeason(gs.currentDate.getMonth());
```

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T005 – Add `drawMountainLayerForBiome()` replacing `drawMountainLayer()`

**Purpose**: Draw mountain layer graphics using colors from `BIOME_COLORS.MOUNTAIN_BACK`
and `BIOME_COLORS.MOUNTAIN_FRONT` for the current biome.

**Steps**:
1. Add new private method `drawMountainLayerForBiome`:
```typescript
private drawMountainLayerForBiome(g: Phaser.GameObjects.Graphics, offsetX: number, biome: Biome): void {
    const back = BIOME_COLORS.MOUNTAIN_BACK[biome];
    const front = BIOME_COLORS.MOUNTAIN_FRONT[biome];
    const snowCap = biome !== Biome.OREGON;

    // Back layer (farthest, tallest)
    this.drawSoftMountain(g, offsetX + 200, GROUND_Y - 10, 320, 160, back[0], snowCap);
    this.drawSoftMountain(g, offsetX + 500, GROUND_Y - 10, 360, 180, back[1], snowCap);
    this.drawSoftMountain(g, offsetX + 850, GROUND_Y - 10, 300, 150, back[2], snowCap);
    // Front layer (closer, shorter, overlapping)
    this.drawSoftMountain(g, offsetX + 100, GROUND_Y - 5, 260, 110, front[0], snowCap);
    this.drawSoftMountain(g, offsetX + 380, GROUND_Y - 5, 280, 120, front[1], snowCap);
    this.drawSoftMountain(g, offsetX + 650, GROUND_Y - 5, 240, 100, front[2], snowCap);
    this.drawSoftMountain(g, offsetX + 950, GROUND_Y - 5, 270, 115, front[3], snowCap);
}
```
2. Update `buildParallax()` to call `drawMountainLayerForBiome` instead of `drawMountainLayer`:
```typescript
this.drawMountainLayerForBiome(g, baseX, this.currentBiome);
```
3. Keep the old `drawMountainLayer()` method but mark it `// DEPRECATED — use drawMountainLayerForBiome` or delete it.

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T006 – Add optional `snowCap` param to `drawSoftMountain()`

**Purpose**: Allow Oregon mountains to skip snow cap rendering.

**Steps**:
1. Change the `drawSoftMountain` signature from:
```typescript
private drawSoftMountain(g, cx, baseY, width, height, color): void
```
to:
```typescript
private drawSoftMountain(g: Phaser.GameObjects.Graphics, cx: number, baseY: number, width: number, height: number, color: number, snowCap = true): void
```
2. Find the snow cap drawing block (currently `if (height > 100) { ... }`).
   Change to: `if (height > 100 && snowCap) { ... }`.

**Files**: `src/scenes/TravelScene.ts`
**Note**: Default `snowCap = true` means all existing call sites without the param continue to work.

---

### Subtask T007 – Add `drawHillLayerForBiome()` replacing `drawHillLayer()`

**Purpose**: Draw hill graphics using the biome's hill color palette, with the second color
reflecting the current season.

**Steps**:
1. Add new private method `drawHillLayerForBiome`:
```typescript
private drawHillLayerForBiome(g: Phaser.GameObjects.Graphics, offsetX: number, biome: Biome, season: Season): void {
    const [c1, c2] = BIOME_COLORS.HILL_COLORS[biome];

    drawHill(g, offsetX + 100,  GROUND_Y + 8, 240, c1);
    drawHill(g, offsetX + 330,  GROUND_Y + 8, 200, c2);
    drawHill(g, offsetX + 520,  GROUND_Y + 8, 260, c1);
    drawHill(g, offsetX + 740,  GROUND_Y + 8, 220, c2);
    drawHill(g, offsetX + 940,  GROUND_Y + 8, 180, c1);
    drawHill(g, offsetX + 1080, GROUND_Y + 8, 200, c2);

    // Trees alongside trail — use biome-appropriate colors
    const treeC1 = biome === Biome.OREGON ? 0x1a3a18 : 0x234d1a;
    const treeC2 = biome === Biome.OREGON ? 0x223a20 : 0x2a5820;
    drawTree(g, offsetX + 60,  GROUND_Y + 4,  62, treeC1, false);
    drawTree(g, offsetX + 90,  GROUND_Y - 4,  74, treeC2, false);
    drawTree(g, offsetX + 280, GROUND_Y + 2,  55, treeC1, false);
    drawTree(g, offsetX + 480, GROUND_Y - 2,  68, treeC2, false);
    drawTree(g, offsetX + 510, GROUND_Y + 4,  58, treeC1, true);
    drawTree(g, offsetX + 720, GROUND_Y - 4,  72, treeC2, false);
    drawTree(g, offsetX + 900, GROUND_Y + 2,  60, treeC1, true);
    drawTree(g, offsetX + 930, GROUND_Y - 6,  80, treeC2, false);
}
```
2. Update `buildParallax()` hill section to call `drawHillLayerForBiome` instead of `drawHillLayer`:
```typescript
this.drawHillLayerForBiome(g, baseX, this.currentBiome, this.currentSeason);
```

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T008 – Add `refreshParallaxLayers()` method

**Purpose**: Clear and redraw all mountain and hill Graphics objects when biome or season
changes. Called from `dailyTick()`.

**Steps**:
1. Add private method:
```typescript
private refreshParallaxLayers(): void {
    // Redraw mountain layers — keep baseX/baseY as-is (scroll position preserved by setPosition)
    const mtnW = GAME_WIDTH + 100;
    this.mtnLayers.forEach((layer, pass) => {
        layer.g.clear();
        const offsetX = pass * mtnW - layer.baseX;
        // Draw relative to the Graphics object's local origin (offsetX adjusted for position)
        this.drawMountainLayerForBiome(layer.g, 0, this.currentBiome);
    });

    // Redraw hill layers
    const hillW = GAME_WIDTH + 60;
    this.hillLayers.forEach((layer, _pass) => {
        layer.g.clear();
        this.drawHillLayerForBiome(layer.g, 0, this.currentBiome, this.currentSeason);
    });
}
```

**IMPORTANT**: The mountain/hill graphics are drawn in LOCAL space (always starting from offsetX=0
relative to the Graphics object). The `setPosition(baseX, baseY)` in `update()` positions
them on screen. So when redrawing, always draw at local x=0 (same as `buildParallax()` initial draws).

Actually — re-check how `buildParallax()` draws. It calls `drawMountainLayerForBiome(g, baseX, biome)`
where `baseX = pass * mtnW`. That means it draws at screen-absolute x coordinates
(not local coordinates). The Graphics object's position is set to (0,0) initially.

So the correct redraw is to call `drawMountainLayerForBiome(layer.g, layer.baseX, this.currentBiome)`.
Wait — but `layer.baseX` is the current scroll position (it changes every frame).

Let me clarify: In `buildParallax()`, the Graphics objects are positioned at (0,0) and drawn
with `offsetX = pass * mtnW` (absolute coords). As scrolling happens, `layer.g.setPosition(layer.baseX, layer.baseY)`
moves the entire Graphics object.

So to refresh: reset position to (0,0), redraw at original `pass * mtnW` offset, then let `update()` reapply the position.

**Revised approach**:
```typescript
private refreshParallaxLayers(): void {
    const mtnW = GAME_WIDTH + 100;
    this.mtnLayers.forEach((layer, pass) => {
        layer.g.clear();
        layer.g.setPosition(0, 0);         // reset to origin
        this.drawMountainLayerForBiome(layer.g, pass * mtnW, this.currentBiome);
        layer.baseX = pass * mtnW;          // reset scroll to start
        layer.baseY = -pass * mtnW * TravelScene.MTN_Y_RATIO;
        layer.g.setPosition(layer.baseX, layer.baseY);
    });

    const hillW = GAME_WIDTH + 60;
    this.hillLayers.forEach((layer, pass) => {
        layer.g.clear();
        layer.g.setPosition(0, 0);
        this.drawHillLayerForBiome(layer.g, pass * hillW, this.currentBiome, this.currentSeason);
        layer.baseX = pass * hillW;
        layer.baseY = -pass * hillW * TravelScene.HILL_Y_RATIO;
        layer.g.setPosition(layer.baseX, layer.baseY);
    });
}
```

Note: Resetting baseX/baseY to their initial values on zone change causes a subtle visual
"jump" (layers teleport back to start position). This is acceptable — zone changes happen
infrequently (every few minutes of gameplay) and the transition is at a landmark boundary.

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T009 – Hook biome/season change detection into `dailyTick()`

**Purpose**: Detect when the player crosses a biome or season boundary and trigger a visual refresh.

**Steps**:
1. In `dailyTick()`, after miles are updated (and before landmark/event checks), add:
```typescript
const newBiome = getBiome(gs.milesTraveled);
const newSeason = getSeason(gs.currentDate.getMonth());
if (newBiome !== this.currentBiome || newSeason !== this.currentSeason) {
    this.currentBiome = newBiome;
    this.currentSeason = newSeason;
    this.refreshParallaxLayers();
}
```
2. Ensure `getBiome`, `getSeason` are imported from `../utils/biome`.

**Files**: `src/scenes/TravelScene.ts`

---

### Subtask T010 – Add mountain alpha fade-in in `update()`

**Purpose**: Mountains fade from invisible to fully visible as player travels through miles 300–640
in the prairie zone. This runs every frame (lightweight setAlpha calls).

**Steps**:
1. In `update(time, delta)`, inside the `if (moving)` block, after the mountain scroll loop:
```typescript
// Mountain alpha fade-in (prairie zone: 0–300 invisible, 300–640 fade in)
const mountainAlpha = getMountainAlpha(gs.milesTraveled);
this.mtnLayers.forEach(layer => layer.g.setAlpha(mountainAlpha));
```
2. Ensure `getMountainAlpha` is imported from `../utils/biome`.

**Files**: `src/scenes/TravelScene.ts`
**Performance note**: `setAlpha()` on a Graphics object is a single property write. Two calls
per frame (one per mtnLayer) costs negligible CPU.

---

## Risks & Mitigations

- **Visual pop on zone change**: `refreshParallaxLayers()` resets scroll position. Acceptable
  since zone transitions are rare. Test by setting `milesTraveled` to 639→640 in browser console.
- **Mountain/hill mismatch after scroll**: Always re-set baseX/baseY after clear+redraw.
  The `update()` loop will continue scrolling from the new position correctly.
- **Oregon mountains not losing snow**: Confirmed via `snowCap = biome !== Biome.OREGON` in
  `drawMountainLayerForBiome`. TypeScript ensures exhaustive enum handling.
- **Import errors**: `getBiome`, `getSeason`, `getMountainAlpha` must be imported at top of TravelScene.ts.

## Review Guidance

1. `npx tsc --noEmit` — zero errors.
2. Browser: start game at mile 0 → no mountains visible. Use console to set `GameState.getInstance().milesTraveled = 400` and wait one tick → faint silhouettes.
3. Set miles to 700 → full grey-blue peaks.
4. Set miles to 1600 → green ridges, no snow caps.
5. Check parallax still scrolls correctly after zone change (no frozen layers).

## Activity Log

- 2026-03-26T19:48:26Z – system – lane=planned – Prompt created.
